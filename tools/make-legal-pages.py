# Regenerate: python tools/make-legal-pages.py   (edit the text below, then run it)
# Generates privacy.html, terms.html and shipping.html for the Gloves Galore site.
# Navbar + footer are copied from connect.html so the pages always match the site.
import re
import html as _html
from pathlib import Path

SITE = Path(__file__).resolve().parent.parent  # the site folder
UPDATED = "19 September 2026"
EMAIL = "mujtababaig598@gmail.com"
WA_DISPLAY = "+92 314 1632509"
WA_LINK = "https://wa.me/923141632509"

connect = (SITE / "connect.html").read_text(encoding="utf-8")
nav = re.search(r"    <!-- Navbar -->.*?    <!-- /Navbar -->\n", connect, re.S).group(0)
footer = re.search(r"    <!-- Contact Footer -->.*?</footer>\n", connect, re.S).group(0)
head_assets = re.search(r"    <!-- Fonts -->.*?<link rel=\"stylesheet\" href=\"styles.css\">\n", connect, re.S).group(0)

POLICIES = [("privacy.html", "Privacy Policy"), ("terms.html", "Terms &amp; Conditions"), ("shipping.html", "Shipping &amp; Samples")]


def section(num, sid, title, body):
    return f"""
                <section class="legal-section" id="{sid}">
                    <h2><span class="legal-num" aria-hidden="true">{num:02d}</span> {title}</h2>
{body}
                </section>"""


def page(file, title_html, seo_title, description, eyebrow, subtitle, summary_title, summary_items, sections, extra_top=""):
    toc = "\n".join(f'                        <li><a href="#{sid}">{t}</a></li>' for (_, sid, t, _) in sections)
    others = "\n".join(f'                        <a href="{f}">{n}</a>' for f, n in POLICIES if f != file)
    body = "".join(section(i + 1, sid, t, b) for i, (_, sid, t, b) in enumerate(sections))
    summary = "\n".join(f"                        <li>{x}</li>" for x in summary_items)
    foot = footer.replace(f'<a href="{file}">', f'<a href="{file}" aria-current="page">')
    return f"""<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>{_html.escape(seo_title)}</title>
    <meta name="description" content="{_html.escape(description)}">
    <meta name="theme-color" content="#0D0D0D">
    <link rel="canonical" href="{{{{SITE_URL}}}}/{file}">
    <meta property="og:type" content="website">
    <meta property="og:site_name" content="Gloves Galore">
    <meta property="og:title" content="{_html.escape(seo_title)}">
    <meta property="og:description" content="{_html.escape(description)}">
    <meta property="og:url" content="{{{{SITE_URL}}}}/{file}">
    <meta property="og:image" content="{{{{SITE_URL}}}}/assets/og-image.jpg">
    <meta property="og:image:width" content="1200">
    <meta property="og:image:height" content="630">
    <meta name="twitter:card" content="summary_large_image">
    <!-- favicon package from RealFaviconGenerator (files live in favicon/, build copies them to the site root) -->
    <link rel="icon" type="image/png" href="/favicon-96x96.png" sizes="96x96" />
    <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
    <link rel="shortcut icon" href="/favicon.ico" />
    <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
    <link rel="manifest" href="/site.webmanifest" />
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
{head_assets}</head>

<body class="legal-page">
{nav}
    <!-- Page header -->
    <header class="connect-hero legal-hero">
        <div class="connect-hero-bg">
            <div class="hero-overlay"></div>
            <div class="connect-bg-glow"></div>
        </div>
        <div class="connect-hero-content">
            <span class="connect-eyebrow">{eyebrow}</span>
            <h1 class="connect-title">{title_html}</h1>
            <p class="connect-subtitle">{subtitle}</p>
            <p class="legal-updated">Last updated: {UPDATED}</p>
        </div>
    </header>

    <main class="legal">
        <div class="legal-layout">
            <aside class="legal-toc" aria-label="On this page">
                <p class="legal-toc-title">On this page</p>
                <ol>
{toc}
                </ol>
                <div class="legal-toc-other">
{others}
                </div>
            </aside>

            <article class="legal-body">{extra_top}
                <div class="legal-summary">
                    <h2>{summary_title}</h2>
                    <ul>
{summary}
                    </ul>
                </div>
{body}

                <div class="legal-contact">
                    <div>
                        <h2>Questions?</h2>
                        <p>Ask us anything about this page. A real person from our Sialkot team will reply.</p>
                    </div>
                    <div class="legal-contact-actions">
                        <a class="btn-explore" href="{WA_LINK}" target="_blank" rel="noopener noreferrer">WhatsApp us <span class="material-symbols-outlined" aria-hidden="true">arrow_forward</span></a>
                        <a class="btn-primary" href="mailto:{EMAIL}">Email us</a>
                    </div>
                </div>
            </article>
        </div>
    </main>

{foot}
    <!-- GSAP Core & ScrollTrigger -->
    <script src="https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.5/gsap.min.js"></script>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.5/ScrollTrigger.min.js"></script>
    <!-- Lenis Smooth Scroll -->
    <script src="https://unpkg.com/lenis@1.1.18/dist/lenis.min.js"></script>
    <!-- Custom Scripts -->
    <script src="app.js"></script>
</body>

</html>
"""


def P(*paras):
    return "\n".join(f"                    <p>{p}</p>" for p in paras)


def UL(*items):
    lis = "\n".join(f"                        <li>{i}</li>" for i in items)
    return f"                    <ul>\n{lis}\n                    </ul>"


CONTACT_LINE = f'email <a href="mailto:{EMAIL}">{EMAIL}</a> or WhatsApp <a href="{WA_LINK}" target="_blank" rel="noopener noreferrer">{WA_DISPLAY}</a>'

# ---------------------------------------------------------------- PRIVACY
privacy_sections = [
    (1, "who-we-are", "Who we are", P(
        "Gloves Galore is a custom glove manufacturer based in Sialkot, Punjab, Pakistan. We design, sample and produce private-label gloves for MTB, BMX, motocross, fitness and winter-sports brands, teams and riders.",
        f"When this policy says “we” or “us”, it means Gloves Galore. You can reach us any time: {CONTACT_LINE}.")),
    (2, "what-we-collect", "What we collect", P("We only collect what you choose to send us:") + "\n" + UL(
        "<strong>Inquiry forms on this website:</strong> your name and email, and on the Let’s Connect form also your phone number, brand or team name, type of inquiry, estimated quantity, subject, message and any file you attach (tech pack, artwork or logo).",
        "<strong>Newsletter:</strong> only your email address.",
        "<strong>Email, WhatsApp and Instagram:</strong> whatever you decide to share with us in the conversation.",
        "<strong>When you order:</strong> the delivery name, address and phone number, and the billing details we need for invoices, payments and customs papers.") + "\n" + P(
        "We never ask for sensitive personal information and we don’t need it. Please don’t send card numbers or passwords through our forms.")),
    (3, "how-we-use-it", "How we use it", UL(
        "To reply to your message and understand what you need.",
        "To prepare quotes, make samples and produce your order.",
        "To ship samples and orders and prepare the customs paperwork.",
        "To send our newsletter, only if you signed up for it. Reply “unsubscribe” to any newsletter email and we’ll remove you.",
        "To keep the business records that the law requires, like invoices.",
        "To keep spam out of our inbox. Our forms have a hidden spam check that doesn’t collect anything about you.") + "\n" + P(
        "We don’t use your information for anything else, and we don’t build advertising profiles.")),
    (4, "your-designs", "Your designs stay private", P(
        "Tech packs, sketches, artwork and logos you send us are confidential. We use them only to quote, sample and make <strong>your</strong> products. We don’t show them to other clients, reuse them or sell them.",
        "We only feature your finished gloves in our portfolio or on social media if you give us permission. If you need a signed non-disclosure agreement (NDA) before sharing a design, just ask.")),
    (5, "sharing", "Who else sees your information", P("We never sell or rent your information. We share only what is needed with:") + "\n" + UL(
        "<strong>Google</strong>, because our website forms deliver messages to our Gmail inbox and record them in a Google Sheet in our Google account.",
        "<strong>Courier and shipping companies</strong>, which need the delivery name, address and phone number to deliver samples and orders.",
        "<strong>Banks and payment providers</strong>, to receive your payments.",
        "<strong>Authorities</strong>, only when the law requires it.")),
    (6, "website-cookies", "This website and cookies", P(
        "This website does <strong>not</strong> use analytics, advertising or tracking cookies, and we don’t follow you around the internet.",
        "Like every website, it is delivered by a few service providers who receive your IP address and basic browser information so they can send you the files and keep their systems secure: the site is hosted on <strong>GitHub Pages</strong>, product photos come from <strong>Sanity</strong>’s image service, and some scripts load from <strong>cdnjs (Cloudflare)</strong> and <strong>unpkg</strong>.",
        "The map on our Let’s Connect page is embedded from <strong>Google Maps</strong>, and Google may set its own cookies when the map loads. Links to WhatsApp and Instagram take you to those apps, where their own privacy policies apply.")),
    (7, "how-long", "How long we keep it", UL(
        "<strong>Inquiries:</strong> as long as we need to answer you and follow up on a quote or sample. Ask us and we’ll delete them sooner.",
        "<strong>Orders:</strong> as long as we need them for accounting, tax and warranty purposes.",
        "<strong>Newsletter:</strong> until you unsubscribe.")),
    (8, "security", "Keeping it safe", P(
        "Your messages and files are stored in our Google account, which only the Gloves Galore team can open. We take reasonable care to protect it, but no online system is perfectly secure, so please don’t send passwords or card details through our forms.")),
    (9, "your-rights", "Your rights", P(f"At any time you can ask us to:") + "\n" + UL(
        "tell you what information we have about you,",
        "correct anything that is wrong,",
        "delete your information (unless we must keep an invoice by law), or",
        "stop sending you the newsletter.") + "\n" + P(
        f"Just {CONTACT_LINE}. We’ll reply within 30 days, usually much sooner. If you are in the EU or UK, you can also complain to your local data protection authority.")),
    (10, "where", "Where your data is stored", P(
        "We work from Pakistan. Google stores our email and spreadsheets on its servers, which can be in other countries. By contacting us, you understand that your information may be handled outside your own country.")),
    (11, "children", "Children", P(
        "Our services are for businesses, teams and adults. This website is not meant for children, and we don’t knowingly collect information from anyone under 16.")),
    (12, "changes", "Changes to this policy", P(
        f"If we change how we handle information, we’ll update this page and the “last updated” date at the top. This version was last updated on {UPDATED}.")),
]
privacy = page(
    "privacy.html",
    'Privacy<br><span class="outline-text">Policy</span>',
    "Privacy Policy | Gloves Galore",
    "How Gloves Galore, a custom glove manufacturer in Sialkot, handles the information and designs you send us. No tracking cookies, no selling of data.",
    "Legal",
    "What we collect when you contact Gloves Galore, why we keep it, and how to have it deleted. Plain words, no small print.",
    "In short",
    [
        "We only collect what you send us through our forms, email or WhatsApp.",
        "We use it to reply, quote, make samples and deliver your order. Nothing else.",
        "We never sell your information, and we never share your designs.",
        "This website has no advertising or tracking cookies.",
        "Email or WhatsApp us any time to see or delete your information.",
    ],
    privacy_sections,
)

# ---------------------------------------------------------------- TERMS
terms_sections = [
    (1, "about", "About these terms", P(
        "These terms apply to every quote, sample and order from Gloves Galore, a custom glove manufacturer in Sialkot, Punjab, Pakistan. By asking for a quote or sample, or by placing an order, you agree to them.",
        "Every order is also confirmed in writing, with a quote, proforma invoice or order confirmation. <strong>If that document says something different from these terms, the document wins for that order.</strong>")),
    (2, "quotes", "Quotes", P(
        "Quotes are free. We price them from the details you give us: glove type, materials, sizes, quantity, branding and packaging. A quote is valid for the period written on it.",
        "If the design, materials or quantity change, the price and timeline can change too. We will always send you an updated quote before we go ahead.")),
    (3, "samples", "Samples", P(
        "<strong>The first sample of each design is free.</strong> You only pay the cost of shipping it to you. Shipping costs and options are explained in our <a href=\"shipping.html\">Shipping &amp; Samples</a> policy.",
        "If you ask for changes, we make a revised sample. If extra rounds of samples ever have a cost, we will tell you before we make them, so there are no surprises.")),
    (4, "approval", "Approval and our promise", P(
        "When you approve a sample in writing (email or WhatsApp is fine), that sample becomes the reference for your bulk order.",
        "<strong>What you approve is what you get.</strong> Bulk production uses the same materials, construction and finish as your approved sample. We never swap materials or cut corners without asking. If a material becomes unavailable, we contact you first and only continue once you agree to the alternative.",
        "Small differences that are normal in manufacturing, such as a slight shade difference between fabric batches, are not treated as defects.")),
    (5, "orders-payment", "Orders and payment", P(
        "An order is confirmed when you accept our quote or proforma invoice in writing and make any advance payment it asks for. Production starts after that.",
        "Prices, currency, advance payment, balance payment and accepted payment methods are written on your proforma invoice. Unless it says otherwise, the full balance is paid before your goods are shipped.")),
    (6, "timelines", "Production and delivery times", P(
        "Production times in our quotes are estimates that start once your sample is approved and your order is confirmed. We keep you updated during production and can send photos or videos on request.",
        "If something outside our control slows things down, such as material supply, public holidays, customs or courier delays, we tell you straight away with a new estimate. How we ship is explained in our <a href=\"shipping.html\">Shipping &amp; Samples</a> policy.")),
    (7, "quality", "Quality checks", P(
        "Every pair is checked before it is packed. Quality control photos or videos of your order are available on request before it ships.")),
    (8, "claims", "Problems, defects and claims", P(
        "Please check your goods when they arrive. If anything is defective or doesn’t match your approved sample, <strong>tell us within 14 days of delivery</strong>, with your order number and photos or videos of the problem.",
        "If the problem is ours, we will repair, remake or refund the affected pairs. We agree the best fix with you.",
        "Because every order is custom-made for your brand, we can’t accept returns for a change of mind. Claims also don’t cover normal wear and tear, misuse, damage after delivery, or details that match what you supplied and approved.")),
    (9, "designs", "Your designs and brand", UL(
        "You keep all rights to your designs, artwork, logos and brand names.",
        "You confirm that you have the right to use everything you send us, and you are responsible if it infringes someone else’s rights.",
        "We use your designs only to make your products. We never sell them or make them for anyone else.",
        "We only show your finished gloves in our portfolio or on social media with your permission.",
        "Our own patterns, templates and manufacturing methods remain ours.")),
    (10, "confidentiality", "Confidentiality", P(
        "We keep your designs, specifications, quantities and prices confidential, and we ask you to keep our pricing confidential too. We’re happy to sign a non-disclosure agreement (NDA) if you need one.")),
    (11, "cancellations", "Changes and cancellations", P(
        "You can change or cancel an order before production starts. If we have already bought materials or packaging made specially for your order (for example custom-coloured fabric or printed boxes), we charge only for what we have spent.",
        "Once production has started, the materials used and the work already done are charged.")),
    (12, "liability", "Limit of liability", P(
        "Our total responsibility for any order is limited to the amount you paid for that order. We are not responsible for indirect losses such as lost profits or missed sales. Nothing in these terms limits responsibility that cannot be limited by law.")),
    (13, "outside-control", "Events outside our control", P(
        "We are not responsible for delays caused by events we can’t control, such as floods, strikes, power cuts, port or border closures, pandemics or government actions. If this happens, we tell you and agree new dates with you.")),
    (14, "website", "Using this website", P(
        "The text, photos, logo and design of this website belong to Gloves Galore or are used with permission. Please don’t copy them for commercial use without asking us.",
        "Product photos show examples of our work. Colours can look slightly different on different screens. We may update the website at any time.")),
    (15, "law", "Governing law", P(
        "These terms are governed by the laws of Pakistan. If we ever disagree, we will first try to solve it by talking to each other. If that doesn’t work, the courts of Sialkot, Punjab will decide.")),
    (16, "changes", "Changes to these terms", P(
        f"We may update these terms from time to time. The version on this page when you confirmed your order is the one that applies to it. Last updated on {UPDATED}.")),
]
terms = page(
    "terms.html",
    'Terms &amp;<br><span class="outline-text">Conditions</span>',
    "Terms & Conditions | Gloves Galore",
    "How Gloves Galore works with brands: free samples, written quotes, sample approval, production, claims and design ownership. Custom glove manufacturer in Sialkot, Pakistan.",
    "Legal",
    "How we work with brands, from the first sample to the final delivery. Your written quote or order confirmation always comes first.",
    "In short",
    [
        "Samples are free. You only pay shipping.",
        "Every order starts with a written quote, and we both follow it.",
        "Bulk production matches the sample you approved: same materials, construction and finish.",
        "Your designs and logos always stay yours.",
        "Tell us about any problem within 14 days of delivery and we’ll make it right.",
    ],
    terms_sections,
)

# ---------------------------------------------------------------- SHIPPING
shipping_sections = [
    (1, "free-samples", "Free samples", P(
        "<strong>We make the first sample of every design free of charge.</strong> You only pay the cost of shipping it to you.",
        "Before we send your sample, we tell you the shipping cost and the courier. Once it is paid, the sample ships and we send you the tracking number.",
        "If you need more changes, we make a revised sample. If extra rounds of samples ever have a cost, we tell you first.")),
    (2, "where", "Where we ship", P(
        "We ship worldwide from our workshop in Sialkot, Punjab, Pakistan.")),
    (3, "how", "How we ship", UL(
        "<strong>Samples and small orders</strong> go by international express courier, with door-to-door tracking.",
        "<strong>Bulk orders</strong> go by express courier, air freight or sea freight. We choose the best option with you based on the size of the order, your deadline and your budget.")),
    (4, "costs", "Shipping costs for orders", P(
        "Shipping for bulk orders is either included in your quote or quoted separately, and the shipping terms are written on your quote or proforma invoice. We always tell you the cost before we ship.")),
    (5, "times", "Delivery times", P(
        "Delivery time is your production time plus transit time. As soon as your order ships, we send you the courier name and tracking number.",
        "Transit estimates come from the courier or freight company. They are not guaranteed, because weather, customs checks and courier delays are outside our control.")),
    (6, "customs", "Customs, duties and taxes", P(
        "Import duties, taxes and customs clearance charges in your country are paid by you, unless your quote clearly says they are included.",
        "We prepare accurate commercial invoices and shipping documents for every shipment. For legal reasons we cannot mark goods as gifts or declare a lower value than you paid.")),
    (7, "packaging", "Packaging", P(
        "Every shipment is packed to arrive in good condition. For bulk orders we can add your own branded packaging, such as polybags, hang tags, labels or boxes, as agreed in your quote.")),
    (8, "address", "Your delivery address", P(
        "Please make sure your delivery address and phone number are correct, because couriers often call before they deliver. If a parcel comes back because the address was wrong or the delivery was refused, the cost of sending it again is paid by you.")),
    (9, "damage", "Lost or damaged parcels", P(
        "If a parcel arrives damaged, please take photos of the box and the goods and keep the packaging. <strong>Tell us within 14 days of delivery.</strong> We will file the claim with the courier and replace or refund the damaged items as explained in our <a href=\"terms.html\">Terms &amp; Conditions</a>.",
        "If your tracking hasn’t updated for a long time, tell us and we will chase the courier for you.")),
]
shipping = page(
    "shipping.html",
    'Shipping &amp;<br><span class="outline-text">Samples</span>',
    "Shipping & Samples | Gloves Galore",
    "Gloves Galore ships custom gloves worldwide from Sialkot, Pakistan. Samples are free of charge, you only pay shipping. Delivery, customs and packaging explained.",
    "Shipping",
    "Samples are on us. Here is how sample and bulk shipments work, who pays for what, and what happens if something goes wrong on the way.",
    "In short",
    [
        "Your first sample of every design is free. You only pay shipping.",
        "We ship worldwide from Sialkot, Pakistan, with tracking on every parcel.",
        "Import duties and taxes in your country are paid by you, unless your quote includes them.",
        "Report any damage within 14 days of delivery and we’ll sort it out with the courier.",
    ],
    shipping_sections,
)

for name, html in [("privacy.html", privacy), ("terms.html", terms), ("shipping.html", shipping)]:
    (SITE / name).write_text(html, encoding="utf-8", newline="\n")
    print("wrote", name, len(html), "chars")
