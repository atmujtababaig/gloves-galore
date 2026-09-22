/* ============================================================
   FORMS → your Gmail (Google Apps Script, free)
   ------------------------------------------------------------
   Every form on the site (home contact, newsletter, connect page)
   is posted to a small script in your own Google account
   (see google-apps-script/Code.gs). It emails you the message,
   with the client's file attached, and logs it in a Google Sheet.
   The URL below can only send mail TO you, so it is safe in the page.
   ============================================================ */
(function () {
    const FORMS_ENDPOINT = "https://script.google.com/macros/s/AKfycbyH0uNgeLJsYe7qZw4k25kkQ1w51F7cBxQP7Re8_tlAK-44Plr89c8yvY1BTySo7dTe/exec";
    const MAX_FILE_MB = 20;
    const pageOpenedAt = Date.now();

    const configured = () => FORMS_ENDPOINT && FORMS_ENDPOINT.startsWith("https://script.google.com/");
    const siteEmail = () => document.querySelector('a[href^="mailto:"]')?.getAttribute("href").slice(7) || "";
    const siteWhatsApp = () => document.querySelector('a[href*="wa.me/"]')?.getAttribute("href").split("wa.me/")[1] || "";

    // Hidden checkbox that people never tick but spam bots do
    function addHoneypot(form) {
        if (form.querySelector('[name="botcheck"]')) return;
        const trap = document.createElement("input");
        trap.type = "checkbox";
        trap.name = "botcheck";
        trap.tabIndex = -1;
        trap.autocomplete = "off";
        trap.setAttribute("aria-hidden", "true");
        trap.className = "form-honeypot";
        form.appendChild(trap);
    }

    function statusEl(form) {
        let el = form.querySelector(".form-status");
        if (!el) {
            el = document.createElement("p");
            el.className = "form-status";
            el.setAttribute("role", "status");
            el.setAttribute("aria-live", "polite");
            form.appendChild(el);
        }
        return el;
    }

    function showStatus(form, message, kind) {
        const el = statusEl(form);
        el.textContent = message;
        el.dataset.kind = kind; // "error" | "ok" | "busy"
    }

    // File → { name, type, data(base64) } so it can travel inside the JSON body
    function readFile(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => resolve({ name: file.name, type: file.type, data: String(reader.result).split(",")[1] });
            reader.onerror = () => reject(new Error("file-read"));
            reader.readAsDataURL(file);
        });
    }

    async function send(form, subject) {
        if (!configured()) throw new Error("not-configured");
        const data = Object.fromEntries(new FormData(form).entries());
        if (data.botcheck) throw new Error("bot");
        delete data.botcheck;

        // the connect form has its own "subject" field; keep it apart from the email subject
        if ("subject" in data) { data.topic = data.subject; delete data.subject; }

        const file = form.elements.attachment?.files?.[0];
        delete data.attachment;
        if (file) {
            if (file.size > MAX_FILE_MB * 1024 * 1024) throw new Error("file-too-large");
            data.file = await readFile(file);
        }

        // text/plain body = "simple" request, which Google Apps Script accepts from any site
        const res = await fetch(FORMS_ENDPOINT, {
            method: "POST",
            body: JSON.stringify({ ...data, subject, _elapsed: Date.now() - pageOpenedAt }),
        });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);

        // Apps Script answers a POST with a chain of redirects, and fetch follows the
        // last hop as a GET. When that happens Google hands back doGet()'s payload
        // ({ok:true}) instead of doPost()'s ({success:true}), even though the message
        // was delivered. Treating that as a failure told people their message had not
        // gone through while it sat in the inbox. So: a 2xx means the script ran, and
        // only an explicit success:false is an error.
        const json = await res.json().catch(() => null);
        if (json && json.success === false) throw new Error(json.message || "send-failed");
    }

    function errorText(err) {
        const email = siteEmail();
        const wa = siteWhatsApp();
        const ways = [wa && `WhatsApp +${wa}`, email && `email ${email}`].filter(Boolean).join(" or ");
        const fallback = ways ? ` Please reach us on ${ways}.` : "";
        if (err.message === "not-configured") return "This form isn't connected yet." + fallback;
        if (err.message === "file-too-large") return `That file is over ${MAX_FILE_MB} MB. Please attach a smaller file, or send it to us after submitting.`;
        return "Sorry, your message couldn't be sent right now." + fallback;
    }

    // Wires a form: validation, busy state, send, then onSuccess
    function wire(form, { subject, button, busyLabel = "Sending…", onSuccess }) {
        if (!form) return;
        addHoneypot(form);
        form.addEventListener("submit", async (e) => {
            e.preventDefault();
            if (!form.reportValidity()) return;

            const btn = button || form.querySelector('[type="submit"]');
            const original = btn ? btn.innerHTML : "";
            if (btn) { btn.disabled = true; btn.textContent = busyLabel; }
            showStatus(form, "", "busy");

            try {
                await send(form, typeof subject === "function" ? subject(form) : subject);
                onSuccess(form);
            } catch (err) {
                if (err.message === "bot") { onSuccess(form); return; } // pretend success to bots
                console.warn("Form send failed:", err);
                showStatus(form, errorText(err), "error");
            } finally {
                if (btn) { btn.disabled = false; btn.innerHTML = original; }
            }
        });
    }

    // Home page: short contact card
    wire(document.querySelector("form.contact-card"), {
        subject: (f) => `New message from ${f.elements.name.value} (website)`,
        onSuccess: (f) => {
            f.reset();
            showStatus(f, "Thanks! Your message is on its way. We'll get back to you soon.", "ok");
        },
    });

    // Newsletter strip
    wire(document.querySelector("form.newsletter-form"), {
        subject: "New newsletter signup (website)",
        busyLabel: "…",
        onSuccess: (f) => {
            f.reset();
            showStatus(f, "You're in. We'll let you know about new drops.", "ok");
        },
    });

    // Connect page: full inquiry form, then the existing success panel
    wire(document.getElementById("connectForm"), {
        subject: (f) => {
            const type = f.querySelector('[name="inquiry_type"]:checked')?.value.replace(/_/g, " ") || "inquiry";
            return `New ${type} from ${f.elements.name.value} (website)`;
        },
        onSuccess: (f) => {
            const success = document.getElementById("successMsg");
            f.style.display = "none";
            statusEl(f).textContent = "";
            if (success) {
                success.style.display = "flex";
                success.scrollIntoView({ behavior: "smooth", block: "center" });
            }
        },
    });
})();
