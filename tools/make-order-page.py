# Regenerate: python3 tools/make-order-page.py
# Builds order.html, the team order page (glovesgalore.net/order/?team=<key>).
# Navbar + footer + head assets are copied from connect.html so the page always matches the site.
# Team data (logo, design images, sizes, prices) lives in orders.js; the order is sent through forms.js.
import re
from pathlib import Path

SITE = Path(__file__).resolve().parent.parent

connect = (SITE / "connect.html").read_text(encoding="utf-8")
nav = re.search(r"    <!-- Navbar -->.*?    <!-- /Navbar -->\n", connect, re.S).group(0)
footer = re.search(r"    <!-- Contact Footer -->.*?</footer>\n", connect, re.S).group(0)
head_assets = re.search(r"    <!-- Fonts -->.*?<link rel=\"stylesheet\" href=\"styles.css\">\n", connect, re.S).group(0)

PAGE = f"""<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Team Order | Gloves Galore</title>
    <meta name="description" content="Pick your team's glove sizes and confirm your order with Gloves Galore.">
    <meta name="robots" content="noindex, nofollow">
    <meta name="theme-color" content="#0D0D0D">
    <link rel="icon" type="image/png" href="/favicon-96x96.png" sizes="96x96" />
    <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
    <link rel="shortcut icon" href="/favicon.ico" />
    <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
    <link rel="manifest" href="/site.webmanifest" />
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
{head_assets}</head>

<body class="order-page">
{nav}
    <header class="order-hero">
        <div class="order-lockup">
            <img src="assets/logo.png" alt="Gloves Galore" class="order-lockup-gg" width="881" height="268">
            <span class="order-lockup-line" aria-hidden="true"></span>
            <img id="orderTeamLogo" alt="" class="order-lockup-team" hidden>
        </div>
        <h1 class="order-hero-label">Team glove order</h1>
    </header>

    <main class="order">
        <!-- shown when the link has no valid ?team= -->
        <section class="order-missing" id="orderMissing" hidden>
            <h2>This order link isn't active</h2>
            <p>Please use the link we sent you, or reach us on <a href="https://wa.me/923141632509" target="_blank" rel="noopener noreferrer">WhatsApp</a> or <a href="mailto:connect@glovesgalore.net">connect@glovesgalore.net</a>.</p>
        </section>

        <div class="order-flow" id="orderFlow" hidden>
            <section class="order-product">
                <div class="order-media">
                    <div class="order-main-shot"><img id="orderMainImg" alt=""></div>
                    <div class="order-thumbs" id="orderThumbs"></div>
                </div>

                <div class="order-details">
                    <h2 class="order-name" id="orderTeam"></h2>

                    <div class="order-sizes-head">
                        <span>Quantity per size</span>
                        <div class="order-toggles">
                            <button type="button" class="order-toggle" aria-expanded="false" aria-controls="orderPricing">Pricing</button>
                            <button type="button" class="order-toggle" aria-expanded="false" aria-controls="orderGuide">Size guide</button>
                        </div>
                    </div>
                    <dl class="order-panel order-pricing" id="orderPricing" hidden></dl>
                    <div class="order-panel" id="orderGuide" hidden>
                        <img src="assets/orders/size-guide.png" alt="Glove size guide: hand width and length for youth and adult sizes" width="1200" height="930" loading="lazy">
                    </div>
                    <div class="order-designs" id="orderDesigns" role="group" aria-label="Design" hidden></div>
                    <div id="orderSizes"></div>

                    <dl class="order-summary">
                        <div><dt>Total pairs</dt><dd id="sumPairs">0</dd></div>
                        <div><dt>Price per pair</dt><dd id="sumPrice">-</dd></div>
                        <div id="sumExtrasRow" hidden><dt id="sumExtrasLabel"></dt><dd id="sumExtras"></dd></div>
                        <div class="order-summary-total"><dt>Order total</dt><dd id="sumTotal">-</dd></div>
                        <div>
                            <dt>Advance payment
                                <span class="order-tip">
                                    <button type="button" class="order-tip-btn" aria-describedby="orderTipText" aria-label="How the advance payment works">?</button>
                                    <span class="order-tip-text" id="orderTipText" role="tooltip"></span>
                                </span>
                            </dt>
                            <dd id="sumDeposit">-</dd>
                        </div>
                    </dl>
                </div>
            </section>

            <section class="order-checkout" id="orderCheckout">
                <h2 class="order-checkout-title">Your details</h2>
                <form id="orderForm" class="order-form" novalidate>
                    <input type="hidden" name="company">
                    <input type="hidden" name="order_key">
                    <input type="hidden" name="order_no">
                    <input type="hidden" name="sizes">
                    <input type="hidden" name="quantity">
                    <input type="hidden" name="price_per_pair">
                    <input type="hidden" name="order_total">
                    <input type="hidden" name="pay_now">
                    <input type="hidden" name="pay_before_shipping">

                    <div class="order-fields">
                        <label>Your name
                            <input type="text" name="name" autocomplete="name" required>
                        </label>
                        <label>Email
                            <input type="email" name="email" autocomplete="email" required>
                        </label>
                        <label>Phone
                            <input type="tel" name="phone" autocomplete="tel">
                        </label>
                        <label>Notes <span class="order-optional">(optional)</span>
                            <input type="text" name="notes">
                        </label>
                        <label class="order-field-wide">Shipping address
                            <textarea name="ship_to" rows="2" autocomplete="street-address" required></textarea>
                        </label>
                    </div>

                    <fieldset class="order-pay">
                        <legend>How would you like to pay?</legend>
                        <div class="order-pay-option">
                            <label><input type="radio" name="payment_method" value="Bank transfer" required> <span>Bank transfer</span></label>
                            <p class="order-pay-note" hidden>We email you our bank details with the invoice. Use your order number as the payment reference. Production starts once the payment shows in our account.</p>
                        </div>
                        <div class="order-pay-option">
                            <label><input type="radio" name="payment_method" value="Wise"> <span>Wise</span></label>
                            <p class="order-pay-note" hidden>We email you a Wise payment link with the invoice, so you can pay from your bank account. Production starts once the payment arrives.</p>
                        </div>
                        <div class="order-pay-option">
                            <label><input type="radio" name="payment_method" value="PayPal"> <span>PayPal</span></label>
                            <p class="order-pay-note" hidden>We email you a PayPal invoice link. Production starts once the payment arrives.</p>
                        </div>
                    </fieldset>

                    <label class="order-agree">
                        <input type="checkbox" name="agreed" value="yes" required>
                        <span>I checked the design and the sizes, and I agree to the <a href="terms.html#team-orders" target="_blank">Terms &amp; Conditions</a>.</span>
                    </label>

                    <button type="submit" class="btn-primary order-submit">Confirm order</button>
                </form>

                <div class="order-done" id="orderDone" hidden>
                    <h3>Order received</h3>
                    <dl class="order-summary">
                        <div><dt>Order number</dt><dd id="doneNo"></dd></div>
                        <div><dt>Status</dt><dd>Waiting for payment</dd></div>
                        <div><dt>Due now</dt><dd id="doneDue"></dd></div>
                        <div><dt>Payment method</dt><dd id="doneMethod"></dd></div>
                    </dl>
                    <p id="doneNext"></p>
                    <p>Questions? Reply to our email or message us on <a href="https://wa.me/923141632509" target="_blank" rel="noopener noreferrer">WhatsApp</a>.</p>
                </div>
            </section>
        </div>
    </main>

{footer}
    <!-- GSAP Core & ScrollTrigger -->
    <script src="https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.5/gsap.min.js"></script>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.5/ScrollTrigger.min.js"></script>
    <!-- Lenis Smooth Scroll -->
    <script src="https://unpkg.com/lenis@1.1.18/dist/lenis.min.js"></script>
    <!-- Custom Scripts -->
    <script src="app.js"></script>
    <script src="orders.js"></script>
    <script src="forms.js"></script>
    <script>
    (function () {{
        const key = new URLSearchParams(location.search).get("team") || "";
        const order = (window.GG_ORDERS || {{}})[key];
        if (!order) {{ document.getElementById("orderMissing").hidden = false; return; }}
        const terms = window.GG_ORDER_TERMS;
        const $ = (id) => document.getElementById(id);
        const money = (n) => "$" + n.toLocaleString("en-US", {{ minimumFractionDigits: n % 1 ? 2 : 0, maximumFractionDigits: 2 }});

        $("orderFlow").hidden = false;
        document.title = order.team + " Team Order | Gloves Galore";
        if (order.logo) {{
            const logo = $("orderTeamLogo");
            logo.src = "/" + order.logo;
            logo.alt = order.team;
            logo.hidden = false;
        }}
        $("orderTeam").textContent = order.team;

        // Pricing / Size guide: buttons that open a panel under them, one at a time
        const toggles = [...document.querySelectorAll(".order-toggle")];
        toggles.forEach((btn) => btn.addEventListener("click", () => {{
            const open = btn.getAttribute("aria-expanded") !== "true";
            toggles.forEach((b) => {{
                b.setAttribute("aria-expanded", "false");
                $(b.getAttribute("aria-controls")).hidden = true;
            }});
            btn.setAttribute("aria-expanded", String(open));
            $(btn.getAttribute("aria-controls")).hidden = !open;
        }}));

        // one design, or several designs each with its own sizes (orders.js "designs")
        const designs = order.designs || [{{ name: "", images: order.images }}];
        let active = 0;

        // gallery: big image + thumbnails of the active design
        const main = $("orderMainImg");
        const show = (i) => {{
            const img = designs[active].images[i];
            main.src = "/" + img.src;
            main.alt = order.team + " glove, " + img.label;
            [...$("orderThumbs").children].forEach((b, j) => b.setAttribute("aria-current", i === j ? "true" : "false"));
        }};
        const gallery = () => {{
            const imgs = designs[active].images;
            $("orderThumbs").innerHTML = imgs.length < 2 ? "" : imgs.map((img, i) =>
                `<button type="button" data-i="${{i}}" aria-label="Show ${{img.label}}"><img src=${{JSON.stringify("/" + img.src)}} alt="" loading="lazy"></button>`
            ).join("");
            show(0);
        }};
        $("orderThumbs").addEventListener("click", (e) => {{
            const b = e.target.closest("button[data-i]");
            if (b) show(Number(b.dataset.i));
        }});
        gallery();

        const tiers = [...order.tiers].sort((a, b) => a.min - b.min);
        $("orderPricing").innerHTML = tiers.map((t, i) => {{
            const next = tiers[i + 1];
            const range = next ? `${{t.min}}-${{next.min - 1}} pairs` : `${{t.min}}+ pairs`;
            return `<div><dt>${{range}}</dt><dd>${{money(t.price)}} a pair</dd></div>`;
        }}).join("") + (order.includes ? `<p>${{order.includes}}</p>` : "");

        // size steppers: one group per design, only the active design's group shows
        $("orderSizes").innerHTML = designs.map((dz, d) => `
            <div class="order-sizes" data-design="${{d}}"${{d ? " hidden" : ""}}>` + order.sizes.map((s, i) => {{
                const id = `size${{d}}_${{i}}`;
                const what = dz.name ? `${{dz.name}}, ${{s}}` : s;
                return `
                <div class="order-size-row">
                    <label for="${{id}}">${{s}}</label>
                    <div class="order-stepper">
                        <button type="button" data-step="-1" data-for="${{id}}" aria-label="One pair less of ${{what}}">&minus;</button>
                        <input type="number" id="${{id}}" data-design="${{d}}" data-size="${{s}}" min="0" max="999" step="1" value="0" inputmode="numeric">
                        <button type="button" data-step="1" data-for="${{id}}" aria-label="One pair more of ${{what}}">+</button>
                    </div>
                </div>`;
            }}).join("") + `
            </div>`).join("");

        // design tabs (only when there is more than one design), each with its pair count
        if (designs.length > 1) {{
            $("orderDesigns").hidden = false;
            $("orderDesigns").innerHTML = designs.map((dz, d) =>
                `<button type="button" class="order-design" data-d="${{d}}" aria-pressed="${{d === 0}}">${{dz.name}} <span class="order-design-count" data-count="${{d}}">0</span></button>`
            ).join("");
            $("orderDesigns").addEventListener("click", (e) => {{
                const b = e.target.closest("button[data-d]");
                if (!b) return;
                active = Number(b.dataset.d);
                $("orderDesigns").querySelectorAll("button").forEach((x) => x.setAttribute("aria-pressed", String(x === b)));
                document.querySelectorAll("#orderSizes .order-sizes").forEach((g) => {{ g.hidden = Number(g.dataset.design) !== active; }});
                gallery();
            }});
        }}

        // fixed charges added to the order, e.g. sample shipping already owed
        const extras = order.extras || [];
        const extrasTotal = extras.reduce((a, x) => a + x.price, 0);
        if (extras.length) {{
            $("sumExtrasRow").hidden = false;
            $("sumExtrasLabel").textContent = extras.map((x) => x.label).join(" + ");
            $("sumExtras").textContent = money(extrasTotal);
        }}

        const form = $("orderForm");
        const inputs = [...document.querySelectorAll("#orderSizes input")];
        const set = (name, v) => {{ form.elements[name].value = v; }};
        set("company", order.team);
        set("order_key", key);
        // order number like BMC-1105-482: team initials, month+day, three random digits
        const initials = order.team.split(/\\s+/).map((w) => w[0]).join("").toUpperCase().slice(0, 4);
        const d = new Date();
        const orderNo = `${{initials}}-${{String(d.getMonth() + 1).padStart(2, "0")}}${{String(d.getDate()).padStart(2, "0")}}-${{Math.floor(100 + Math.random() * 900)}}`;
        set("order_no", orderNo);

        // payment method: show what happens next under the chosen one
        const NEXT = {{
            "Bank transfer": "our bank details",
            "Wise": "a Wise payment link",
            "PayPal": "a PayPal invoice link",
        }};
        const showPayNote = () => document.querySelectorAll(".order-pay-option").forEach((opt) => {{
            opt.querySelector(".order-pay-note").hidden = !opt.querySelector("input").checked;
        }});
        form.addEventListener("change", (e) => {{
            if (e.target.name === "payment_method") showPayNote();
        }});

        // payment methods this team can use (orders.js "payMethods"); one left = picked for them
        if (order.payMethods) {{
            document.querySelectorAll(".order-pay-option").forEach((opt) => {{
                if (!order.payMethods.includes(opt.querySelector("input").value)) opt.remove();
            }});
            const left = document.querySelectorAll(".order-pay-option input");
            if (left.length === 1) {{
                left[0].checked = true;
                document.querySelector(".order-pay legend").textContent = "Payment";
                showPayNote();
            }}
        }}

        // details we already have (orders.js "customer"), still editable
        Object.entries(order.customer || {{}}).forEach(([name, v]) => {{
            if (form.elements[name]) form.elements[name].value = v;
        }});
        form.addEventListener("submit", () => {{
            const method = form.elements.payment_method.value;
            $("doneNo").textContent = orderNo;
            $("doneDue").textContent = form.elements.pay_now.value;
            $("doneMethod").textContent = method;
            $("doneNext").textContent = `We'll email ${{NEXT[method] || "the invoice"}} with the invoice within one working day. Please use order number ${{orderNo}} as the payment reference. Production starts as soon as we've confirmed your payment.`;
        }});

        function update() {{
            const counts = inputs.map((el) => {{
                const n = Math.max(0, Math.min(999, Math.floor(Number(el.value) || 0)));
                return [Number(el.dataset.design), el.dataset.size, n];
            }});
            const pairs = counts.reduce((a, [, , n]) => a + n, 0);
            const tier = [...tiers].reverse().find((t) => pairs >= t.min) || tiers[0];
            const total = pairs ? pairs * tier.price + extrasTotal : 0;
            const full = order.payInFull || total < terms.payInFullBelow;
            const now = full ? total : Math.round(total * terms.depositShare * 100) / 100;
            const later = Math.round((total - now) * 100) / 100;

            $("sumPairs").textContent = pairs;
            $("sumPrice").textContent = pairs ? money(tier.price) : "-";
            $("sumTotal").textContent = pairs ? money(total) : "-";
            $("sumDeposit").textContent = pairs ? money(now) : "-";

            // "Volt 1: Adult S 3, Adult M 2; Venom 2: ..." (just "Adult S: 3, ..." for a single design)
            set("sizes", designs.map((dz, d) => {{
                const got = counts.filter(([cd, , n]) => cd === d && n);
                if (!got.length) return "";
                return dz.name ? `${{dz.name}}: ` + got.map(([, s, n]) => `${{s}} ${{n}}`).join(", ") : got.map(([, s, n]) => `${{s}}: ${{n}}`).join(", ");
            }}).filter(Boolean).join("; "));
            document.querySelectorAll("[data-count]").forEach((el) => {{
                el.textContent = counts.filter(([cd]) => cd === Number(el.dataset.count)).reduce((a, [, , n]) => a + n, 0);
            }});
            set("quantity", pairs);
            set("price_per_pair", pairs ? money(tier.price) : "");
            set("order_total", pairs ? money(total) : "");
            set("pay_now", pairs ? money(now) : "");
            set("pay_before_shipping", pairs ? money(later) : "");
            inputs.forEach((el) => el.setCustomValidity(""));
            const first = inputs.find((el) => Number(el.dataset.design) === active);
            first.setCustomValidity(pairs ? "" : "Please enter at least one pair.");
        }}

        $("orderSizes").addEventListener("input", update);
        $("orderSizes").addEventListener("click", (e) => {{
            const btn = e.target.closest("button[data-step]");
            if (!btn) return;
            const el = $(btn.dataset.for);
            el.value = Math.max(0, (Number(el.value) || 0) + Number(btn.dataset.step));
            update();
        }});

        const pct = Math.round(terms.depositShare * 100);
        $("orderTipText").textContent = order.payInFull
            ? "This order is paid in full up front. We send you photos and a video of your finished gloves before we ship. We email you the invoice for the payment method you choose."
            : `Orders of ${{money(terms.payInFullBelow)}} or more: ${{pct}}% now to start production, the rest after we send you photos and a video of your finished gloves. Orders under ${{money(terms.payInFullBelow)}} are paid in full. We email you the invoice for the payment method you choose.`;

        update();
    }})();
    </script>
</body>

</html>
"""

(SITE / "order.html").write_text(PAGE, encoding="utf-8")
print("wrote order.html")
