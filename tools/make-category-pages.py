# Regenerate: python tools/make-category-pages.py   (edit the text below, then run it)
# Generates one page per glove category + about.html for the Gloves Galore site.
# Navbar, head assets and footer are copied from connect.html so the pages always match the site.
# The product grid on each page is filled in by build.mjs from Sanity (data-products / data-offset).
import html as _html
import re
from pathlib import Path

SITE = Path(__file__).resolve().parent.parent
EMAIL = "mujtababaig598@gmail.com"
WA_LINK = "https://wa.me/923141632509"

connect = (SITE / "connect.html").read_text(encoding="utf-8")
nav = re.search(r"    <!-- Navbar -->.*?</nav>\n", connect, re.S).group(0)
footer = re.search(r"    <!-- Contact Footer -->.*?</footer>\n", connect, re.S).group(0)
head_assets = re.search(r"    <!-- Fonts -->.*?<link rel=\"stylesheet\" href=\"styles.css\">\n", connect, re.S).group(0)
preloader = re.search(r"    <!-- Page Preloader -->.*?\n    </div>\n", connect, re.S).group(0)
preloader_script = "    <script>document.documentElement.classList.add('preloader-active');</script>\n"

# ── content ───────────────────────────────────────────────────────────────────
# Every category page: hero, lead, build list, product grid, process, small-orders, FAQ, links.
CATS = [
    dict(
        file="mtb-gloves.html",
        process=[
            ("Send the idea", "A tech pack, a sketch, or photos of the glove your riders are already wearing out. Tell us the trail, we work back from there."),
            ("We sample it", "One pair, built the way you described. Samples are free — you only pay the courier."),
            ("Ride it, then tell us", "Palm too thick on the bar, cuff catching the sleeve, grip print in the wrong place? We change it and re-sample."),
            ("Production and packaging", "The approved pair becomes the standard. Every glove is checked against it, then packed in your branded packaging."),
        ],
        small_order_h2="TWENTY PAIRS OR TWO THOUSAND, <span class=\"outline-text\">SAME ANSWER</span>",
        small_order="A trail crew that wants matching gloves, a bike shop testing its first own-brand run, a brand ordering for a season — we quote all three. There is no minimum we hold you to, because the shop that orders fifty pairs this year is the one ordering five hundred the next.",
        nav="MTB",
        name="MTB gloves",
        title_html="MTB<br><span class=\"outline-text\">GLOVES</span>",
        hero_img="assets/mtb.jpg",
        hero_alt="Mountain biker wearing custom Gloves Galore MTB gloves",
        seo_title="Custom MTB Gloves Manufacturer | Gloves Galore, Sialkot",
        description="Private-label MTB and cycling gloves made in Sialkot, Pakistan. Your colours, your logo, single-layer palms, silicone grip and touchscreen fingers. Free samples, small orders welcome.",
        subtitle="Mountain bike and cycling gloves built to your design, in your colours, with your brand on them.",
        lead_h2="MOUNTAIN BIKE GLOVES, MADE TO <span class=\"outline-text\">YOUR SPEC</span>",
        lead=[
            "MTB gloves are what we make most. Trail, enduro, downhill, cross-country: the riding style changes what goes into the glove, so we start from how your riders actually use it instead of from a fixed catalogue.",
            "Send us a tech pack, a rough sketch, or even a glove you already like. We turn it into a sample, you wear it and tell us what to change, and only when you are happy do we move to production. Everything ships out of Sialkot with your brand on it, never ours.",
        ],
        specs_h2="WHAT WE CAN BUILD INTO YOUR <span class=\"outline-text\">MTB GLOVE</span>",
        specs=[
            ("Single-layer palm", "Thin synthetic leather or microfibre palm so the rider feels the bar. We can add extra layers or padding on the heel of the hand if your riders ask for it."),
            ("Silicone grip print", "Grip printed on the fingertips or across the palm for brake-lever control in the wet. Pattern and coverage are yours to choose."),
            ("Touchscreen fingers", "Conductive thread or panels on the index finger and thumb so phones and GPS units work without pulling the glove off."),
            ("Breathable back", "Stretch mesh or four-way stretch fabric on the top of the hand, with perforation where hands run hot."),
            ("Slip-on or closure cuff", "Most MTB gloves go slip-on with a pull tab. We can also build a light hook-and-loop cuff if you want adjustment."),
            ("Full or half finger", "The same design can be produced as a full-finger and a half-finger version so your line looks like one family."),
        ],
        process_h2="FROM IDEA TO <span class=\"outline-text\">BOXED STOCK</span>",
        faq=[
            ("Can you copy a glove we already sell?", "Yes. Send us a pair and we will take it apart, match the pattern and materials, and show you a sample before anything else happens. We can also fix whatever you did not like about it."),
            ("Do you print our logo and make the packaging?", "Yes. Logos go on with sublimation, screen print, silicone or embroidery, and we can supply hang tags, polybags and boxes with your branding."),
            ("What about fabric we cannot find?", "We already work with the usual palm, mesh and stretch materials. If your design needs something we do not keep, we source it for you before sampling."),
        ],
    ),
    dict(
        file="bmx-gloves.html",
        process=[
            ("Send the idea", "Your artwork, a sketch, or a glove you already ride. Team kit colours are enough to start."),
            ("We sample it", "We build one pair to your spec, free. The courier is the only thing you pay for."),
            ("Session it, then tell us", "Ride the sample properly before you approve it. Whatever rips, rubs or slips, we fix on the next one."),
            ("Production and packaging", "Approved sample becomes the benchmark, every pair is checked against it, then packed with your branding."),
        ],
        small_order_h2="TEAM RUNS ARE <span class=\"outline-text\">WELCOME</span>",
        small_order="Most suppliers will not answer an email about twenty pairs. We will. Riders, crews and shops get the same sampling, the same checks and the same packaging as a brand ordering for a whole season — the only difference is the number on the invoice.",
        nav="BMX",
        name="BMX gloves",
        title_html="BMX<br><span class=\"outline-text\">GLOVES</span>",
        hero_img="assets/bmx.jpg",
        hero_alt="BMX rider in a skatepark bowl wearing custom Gloves Galore BMX gloves",
        seo_title="Custom BMX Gloves Manufacturer | Gloves Galore, Sialkot",
        description="Private-label BMX gloves made in Sialkot, Pakistan. Park, street and race gloves in your colours with your logo. Free samples, small team orders welcome.",
        subtitle="Park, street and race gloves for brands, shops and teams — built in your colours.",
        lead_h2="BMX GLOVES THAT SURVIVE <span class=\"outline-text\">THE SESSION</span>",
        lead=[
            "BMX is hard on gloves. Bars, pegs, concrete and the odd crash all land on the same two square inches of palm, so we build BMX gloves with the seams and the palm layout that take that abuse, not the ones that look best on a spec sheet.",
            "We make these for brands, for shops putting out their own line, and for teams who just want twenty pairs in their kit colours. The process is the same either way, and it all runs out of Sialkot: sample first, changes, then production.",
        ],
        specs_h2="WHAT WE CAN BUILD INTO YOUR <span class=\"outline-text\">BMX GLOVE</span>",
        specs=[
            ("Reinforced palm", "A second layer or a wear patch where the bar sits, so the palm does not open up after a few weeks of riding."),
            ("Crash-ready seams", "Flatlock or double-stitched seams at the stress points, kept off the inside of the hand so nothing rubs."),
            ("Printed knuckles", "Sublimated graphics, screen print or a raised silicone print across the back of the hand — good for team colours and sponsor logos."),
            ("Team colourways", "One design, several colourways, no extra tooling. Useful when every rider on the team wants their own look."),
            ("Neoprene cuff", "Low-profile slip-on cuff with a pull tab that stays out of the way of a watch or a wrist brace."),
            ("Half-finger option", "The same pattern cut short for street and park riders who want their fingertips free."),
        ],
        process_h2="FROM IDEA TO <span class=\"outline-text\">BOXED STOCK</span>",
        faq=[
            ("We are a team, not a brand. Is that fine?", "Completely. Small runs are welcome — even a single team's worth of gloves. You get the same sampling and the same production line as a brand order."),
            ("Can we put sponsor logos on them?", "Yes, as many as the design can carry. Sublimation prints full-colour logos with no extra cost per colour."),
            ("How do we send our artwork?", "PDF, AI, PSD or PNG, whatever you have. Upload it on the contact page or send it on WhatsApp and we will tell you if anything needs fixing before printing."),
        ],
    ),
    dict(
        file="mx-gloves.html",
        process=[
            ("Send the idea", "Kit artwork, a tech pack, or the glove your team rode last season and wants improved."),
            ("We sample it", "A free sample with your graphics printed on it, so you see the colours on fabric and not on a screen."),
            ("Ride a moto, then tell us", "Knuckle too stiff, cuff fighting the brace, print cracking? Tell us and we rebuild it."),
            ("Production and packaging", "Every pair matched to the approved sample, checked, then packed in your boxes or polybags."),
        ],
        small_order_h2="ONE TEAM IS A <span class=\"outline-text\">REAL ORDER</span>",
        small_order="Race teams, clubs and privateer riders order small and order often. We take those runs seriously, because the glove your riders wear at a national is the best advertising your brand will ever get. Tell us the number you actually need and we quote that number.",
        nav="MX",
        name="MX gloves",
        title_html="MOTOCROSS<br><span class=\"outline-text\">GLOVES</span>",
        hero_img="assets/mx.jpg",
        hero_alt="Motocross rider on a dirt bike wearing custom Gloves Galore MX gloves",
        seo_title="Custom Motocross (MX) Gloves Manufacturer | Gloves Galore, Sialkot",
        description="Private-label motocross gloves made in Sialkot, Pakistan: knuckle protection, reinforced palms, your graphics and your logo. Free samples, small orders welcome.",
        subtitle="Dirt, dust and full throttle — motocross gloves built around your graphics.",
        lead_h2="MOTOCROSS GLOVES FOR <span class=\"outline-text\">YOUR BRAND</span>",
        lead=[
            "MX gloves have to do two jobs at once: keep the rider's grip on a bike that fights back, and take a hit from roost, a branch or the ground. We build the protection into the pattern rather than gluing it on at the end, so the glove still closes around the grip.",
            "Graphics matter as much as construction in motocross. Sublimation lets us print your full kit design across the back of the hand, so gloves, jersey and pants finally match — printed and stitched here in Sialkot.",
        ],
        specs_h2="WHAT WE CAN BUILD INTO YOUR <span class=\"outline-text\">MX GLOVE</span>",
        specs=[
            ("Knuckle protection", "TPR or moulded knuckle guards, or a lighter padded knuckle if your riders prefer feel over armour."),
            ("Reinforced palm", "Synthetic leather palm with extra layers at the thumb crotch and heel — the two places MX gloves fail first."),
            ("Full-kit graphics", "Sublimated prints that match your jersey and pants, edge to edge, in any number of colours."),
            ("Adjustable cuff", "Hook-and-loop closure or a slip-on cuff, sized to sit under or over a boot-style wrist brace."),
            ("Vented top", "Perforated panels and mesh gussets between the fingers to move heat out on long motos."),
            ("Pre-curved fingers", "Panels cut on a curve so the hand sits closed on the grip instead of fighting the glove."),
        ],
        process_h2="FROM IDEA TO <span class=\"outline-text\">BOXED STOCK</span>",
        faq=[
            ("Can you match our jersey artwork?", "Yes. Send the artwork files you use for the kit and we will lay them onto the glove pattern, then show you a print proof and a sample."),
            ("Do you do youth sizes?", "Yes. Sizes from youth up to XXL, and we can grade a pattern to whatever size chart you already use."),
            ("How long does a sample take?", "Usually a few days once the design is locked, plus courier time. Samples are free, you only pay the shipping."),
        ],
    ),
    dict(
        file="gym-gloves.html",
        process=[
            ("Send the idea", "Your logo and the kind of lifting your members do. That is enough for a first sample."),
            ("We sample it", "A free pair in the padding and the size you asked for, so you can put it on a bar before deciding."),
            ("Lift in it, then tell us", "Padding too soft, wrap too tight, glove hard to pull off between sets? We adjust and re-sample."),
            ("Production and packaging", "Production matched to the approved sample, checked pair by pair, then packed retail-ready with your branding."),
        ],
        small_order_h2="ONE GYM IS <span class=\"outline-text\">ENOUGH</span>",
        small_order="You do not need a warehouse to start selling your own gloves. A single gym's stock, a coach's first branded run, a supplement brand testing merch — all of it is a real order here. Start small, see how they sell, then come back for more.",
        nav="Gym",
        name="gym gloves",
        title_html="GYM &amp; LIFTING<br><span class=\"outline-text\">GLOVES</span>",
        hero_img="assets/gym-gloves.png",
        hero_alt="Athlete in a gym wearing custom Gloves Galore weightlifting gloves",
        seo_title="Custom Gym &amp; Weightlifting Gloves Manufacturer | Gloves Galore, Sialkot",
        description="Private-label gym and weightlifting gloves made in Sialkot, Pakistan: padded palms, wrist wraps, your logo and packaging. Free samples, small orders welcome.",
        subtitle="Lifting gloves for gyms, coaches and fitness brands — your logo, your packaging.",
        lead_h2="LIFTING GLOVES FOR GYMS AND <span class=\"outline-text\">FITNESS BRANDS</span>",
        lead=[
            "Gym gloves live or die on the palm. Too thick and the bar feels far away, too thin and the calluses come back. We build the padding around what your members actually lift, and we can make the same design in a padded and an unpadded version.",
            "This is the category where branding pays off fastest: gyms, coaches and supplement brands put their logo on a glove their members wear three times a week. We handle the glove, the print and the packaging, and ship it from Sialkot.",
        ],
        specs_h2="WHAT WE CAN BUILD INTO YOUR <span class=\"outline-text\">GYM GLOVE</span>",
        specs=[
            ("Padded or flat palm", "Foam or gel padding where the bar sits, or a single-layer palm for lifters who want to feel the knurling."),
            ("Wrist wrap", "An integrated wrap that pulls tight over the wrist for pressing, or a plain short cuff if you want a simpler glove."),
            ("Anti-slip palm", "Silicone print or textured synthetic leather so the bar does not roll in a sweaty hand."),
            ("Pull-off tabs", "Finger loops or tabs so the glove comes off between sets without a fight."),
            ("Breathable back", "Mesh top panels and open knuckles to keep hands cool through a session."),
            ("Your branding", "Logo on the cuff, the palm or the wrist wrap, plus branded polybags or boxes for retail shelves."),
        ],
        process_h2="FROM IDEA TO <span class=\"outline-text\">BOXED STOCK</span>",
        faq=[
            ("We are one gym, we do not need thousands of pairs.", "That is fine. We take small orders, including a single gym's stock. There is no minimum we hold you to."),
            ("Can you make them for women's sizes too?", "Yes. We grade patterns from XS upward rather than shrinking a men's glove, which is what usually makes small sizes fit badly."),
            ("Do you supply retail packaging?", "Yes — hang tags, polybags, boxes and barcode labels with your artwork, ready for a shelf."),
        ],
    ),
    dict(
        file="ski-gloves.html",
        process=[
            ("Send the idea", "The warmth level, the price you need to hit, and any glove you want it to feel like."),
            ("We sample it", "A free sample built with the insulation and shell you chose, so you can judge the warmth for yourself."),
            ("Wear it out, then tell us", "Cuff too short over the jacket, liner pulling out with your hand, palm too stiff in the cold? We fix it."),
            ("Production and packaging", "Approved sample sets the standard, every pair checked, then packed in your branded packaging."),
        ],
        small_order_h2="SMALL SEASON RUNS, <span class=\"outline-text\">NO PROBLEM</span>",
        small_order="Snow brands order once a year and cannot afford to be stuck with dead stock. We will run a small first season with you and scale it when the sell-through tells you to, instead of forcing a thousand pairs into your storeroom up front.",
        nav="Ski",
        name="ski gloves",
        title_html="SKI &amp; SNOW<br><span class=\"outline-text\">GLOVES</span>",
        hero_img="assets/skiing-gloves.png",
        hero_alt="Skier on a snowy slope wearing custom Gloves Galore ski gloves",
        seo_title="Custom Ski &amp; Snowboard Gloves Manufacturer | Gloves Galore, Sialkot",
        description="Private-label ski and snowboard gloves made in Sialkot, Pakistan: insulation, waterproof membranes, gauntlet cuffs, your branding. Free samples, small orders welcome.",
        subtitle="Insulated ski and snowboard gloves, built warm and built to your design.",
        lead_h2="SKI AND SNOWBOARD GLOVES, <span class=\"outline-text\">YOUR WAY</span>",
        lead=[
            "A snow glove is really three gloves in one: the shell, the insulation and the lining. Change any of them and the glove becomes warmer, thinner or cheaper, so we start by asking what your customers ski in and where you want to sit on price.",
            "We build both gloves and mitts, short-cuff and gauntlet, in the same design language so a line looks consistent on a shop wall. All of it is made to order in Sialkot, Pakistan.",
        ],
        specs_h2="WHAT WE CAN BUILD INTO YOUR <span class=\"outline-text\">SNOW GLOVE</span>",
        specs=[
            ("Insulation to your warmth level", "Different weights of synthetic insulation, so you can offer a spring glove and a deep-winter glove from one pattern."),
            ("Waterproof and breathable", "A waterproof insert or coated shell fabric, with taped or sealed seams where the design needs it."),
            ("Gauntlet or short cuff", "A long cuff with a drawcord that goes over the jacket, or a short cuff that tucks under it."),
            ("Leather or synthetic palm", "Goat leather or a synthetic palm with reinforcement where poles, edges and lift bars wear it down."),
            ("Wrist leash and nose wipe", "The small details people judge a snow glove by: leashes, clips to pair the gloves, and a soft wipe panel on the thumb."),
            ("Mitt version", "The same shell and graphics built as a mitt, which is usually the warmest thing on your range."),
        ],
        process_h2="FROM IDEA TO <span class=\"outline-text\">BOXED STOCK</span>",
        faq=[
            ("Can you hit a target price?", "Usually, yes. Tell us the price you need to land on and we will show you which materials and construction get you there, and what you give up."),
            ("Do you make mitts and kids' sizes?", "Yes, both, from the same design so your line stays consistent."),
            ("Can we test a sample before ordering?", "That is exactly how we work. Samples are free, you only pay the courier, and nothing goes into production until you approve one."),
        ],
    ),
]

# Default wording; each category overrides it below so no two pages read the same.
PROCESS = [
    ("Tell us the idea", "A tech pack, a sketch on paper, photos, or a glove you already own. Whatever you have is enough to start."),
    ("We sample it", "We build one pair the way you described it. Samples are free — you only pay the courier."),
    ("You change what you want", "Palm too thick, cuff too short, colour off? We adjust and re-sample until the glove is right."),
    ("Production and packaging", "Approved sample goes into production, every pair is checked, then packed in your branded packaging and shipped."),
]

SMALL_ORDER = (
    "NO MINIMUM ORDER, <span class=\"outline-text\">REALLY</span>",
    "Most suppliers will not talk to you under a thousand pairs. We will. A single team, a gym, a shop testing its first own-brand glove — we take the small order and we take it seriously, because small orders turn into repeat orders. Tell us how many you actually need and we will quote that number.",
)


def esc(s):
    return _html.escape(str(s), quote=False)


def process_for(cat):
    return cat.get("process", PROCESS)


def hero(cat):
    return f"""    <section class="cat-hero">
        <img class="cat-hero-img" src="{cat['hero_img']}" alt="{esc(cat['hero_alt'])}" fetchpriority="high" decoding="async">
        <div class="cat-hero-shade" aria-hidden="true"></div>
        <div class="cat-hero-content">
            <span class="connect-eyebrow">Custom manufacturing</span>
            <h1 class="connect-title">{cat['title_html']}</h1>
            <p class="connect-subtitle">{esc(cat['subtitle'])}</p>
            <div class="cat-hero-actions">
                <a class="btn-explore" href="connect.html">Get a free sample <span class="material-symbols-outlined" aria-hidden="true">arrow_forward</span></a>
                <a class="btn-primary" href="{WA_LINK}" target="_blank" rel="noopener noreferrer">WhatsApp us</a>
            </div>
        </div>
    </section>
"""


def specs_html(items):
    return "\n".join(
        f"""                <li class="cat-spec">
                    <h3>{esc(t)}</h3>
                    <p>{esc(d)}</p>
                </li>"""
        for t, d in items
    )


def process_html(steps=None):
    steps = steps or PROCESS
    return "\n".join(
        f"""                <li class="cat-step">
                    <span class="cat-step-num" aria-hidden="true">{i + 1:02d}</span>
                    <h3>{esc(t)}</h3>
                    <p>{esc(d)}</p>
                </li>"""
        for i, (t, d) in enumerate(steps)
    )


def faq_html(items):
    return "\n".join(
        f"""                <div class="cat-faq-item">
                    <h3>{esc(q)}</h3>
                    <p>{esc(a)}</p>
                </div>"""
        for q, a in items
    )


def links_html(current):
    others = [c for c in CATS if c["file"] != current] if current else CATS
    links = "\n".join(
        f'                <a class="cat-link" href="{c["file"]}">{esc(c["nav"])} gloves</a>' for c in others
    )
    return links


def json_ld(cat):
    """Service + breadcrumb, so Google can tell these pages apart from the home page."""
    name = esc(cat["name"])
    return (
        '<script type="application/ld+json">'
        '{"@context":"https://schema.org","@type":"Service",'
        f'"serviceType":"Custom {name} manufacturing",'
        f'"name":"Custom {name} manufacturing",'
        f'"description":"{esc(cat["description"])}",'
        '"provider":{"@type":"Organization","name":"Gloves Galore","url":"{{SITE_URL}}/",'
        '"address":{"@type":"PostalAddress","addressLocality":"Sialkot","addressRegion":"Punjab","addressCountry":"PK"}},'
        '"areaServed":"Worldwide",'
        f'"url":"{{{{SITE_URL}}}}/{cat["file"]}"'
        "}</script>\n    "
        '<script type="application/ld+json">'
        '{"@context":"https://schema.org","@type":"BreadcrumbList","itemListElement":['
        '{"@type":"ListItem","position":1,"name":"Home","item":"{{SITE_URL}}/"},'
        f'{{"@type":"ListItem","position":2,"name":"{esc(cat["nav"])} gloves","item":"{{{{SITE_URL}}}}/{cat["file"]}"}}'
        "]}</script>"
    )


def shell(file, seo_title, description, jsonld, body):
    return f"""<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>{seo_title}</title>
    <meta name="description" content="{_html.escape(description, quote=True)}">
    <meta name="theme-color" content="#0D0D0D">
    <link rel="canonical" href="{{{{SITE_URL}}}}/{file}">
    <meta property="og:type" content="website">
    <meta property="og:site_name" content="Gloves Galore">
    <meta property="og:title" content="{seo_title}">
    <meta property="og:description" content="{_html.escape(description, quote=True)}">
    <meta property="og:url" content="{{{{SITE_URL}}}}/{file}">
    <meta property="og:image" content="{{{{SITE_URL}}}}/assets/og-image.jpg">
    <meta property="og:image:width" content="1200">
    <meta property="og:image:height" content="630">
    <meta name="twitter:card" content="summary_large_image">
    {jsonld}
    <!-- favicon package from RealFaviconGenerator (files live in favicon/, build copies them to the site root) -->
    <link rel="icon" type="image/png" href="/favicon-96x96.png" sizes="96x96" />
    <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
    <link rel="shortcut icon" href="/favicon.ico" />
    <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
    <link rel="manifest" href="/site.webmanifest" />
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
{head_assets}{preloader_script}</head>

<body>
{preloader}
{nav}
    <main class="cat-page">
{body}
    </main>

{footer}
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


def category_page(cat, offset):
    lead = "\n".join(f"                <p>{esc(p)}</p>" for p in cat["lead"])
    body = f"""{hero(cat)}
    <section class="cat-section">
        <div class="cat-shell cat-shell--narrow">
            <h2 class="cat-h2">{cat['lead_h2']}</h2>
            <div class="cat-lead">
{lead}
            </div>
        </div>
    </section>

    <section class="cat-section cat-section--alt">
        <div class="cat-shell">
            <h2 class="cat-h2">{cat['specs_h2']}</h2>
            <ul class="cat-specs">
{specs_html(cat['specs'])}
            </ul>
        </div>
    </section>

    <section class="cat-section">
        <div class="cat-shell">
            <h2 class="cat-h2">FROM OUR OWN <span class="outline-text">RANGE</span></h2>
            <p class="cat-note">These are gloves we have already built. Any one of them can be rebuilt in your colours, your materials and your branding — or we can start from a blank sheet.</p>
            <div class="helmet-grid" data-products="4" data-offset="{offset}"></div>
            <a class="cat-more" href="index.html#work">See the full range <span class="material-symbols-outlined" aria-hidden="true">arrow_forward</span></a>
        </div>
    </section>

    <section class="cat-section cat-section--alt">
        <div class="cat-shell">
            <h2 class="cat-h2">{cat['process_h2']}</h2>
            <ol class="cat-steps">
{process_html(process_for(cat))}
            </ol>
        </div>
    </section>

    <section class="cat-section">
        <div class="cat-shell cat-shell--narrow">
            <h2 class="cat-h2">{cat.get("small_order_h2", SMALL_ORDER[0])}</h2>
            <div class="cat-lead">
                <p>{esc(cat.get("small_order", SMALL_ORDER[1]))}</p>
            </div>
        </div>
    </section>

    <section class="cat-section cat-section--alt">
        <div class="cat-shell cat-shell--narrow">
            <h2 class="cat-h2">QUESTIONS WE GET <span class="outline-text">A LOT</span></h2>
            <div class="cat-faq">
{faq_html(cat['faq'])}
            </div>
        </div>
    </section>

    <section class="cat-section">
        <div class="cat-shell">
            <h2 class="cat-h2">WE ALSO BUILD</h2>
            <div class="cat-links">
{links_html(cat['file'])}
                <a class="cat-link" href="about.html">About us</a>
            </div>
            <div class="cat-cta">
                <div>
                    <h3>Ready to see a sample?</h3>
                    <p>Tell us what you ride, what you sell and how many you need. A real person replies, not a form robot.</p>
                </div>
                <div class="cat-cta-actions">
                    <a class="btn-explore" href="connect.html">Start your order <span class="material-symbols-outlined" aria-hidden="true">arrow_forward</span></a>
                    <a class="btn-primary" href="mailto:{EMAIL}">Email us</a>
                </div>
            </div>
        </div>
    </section>
"""
    return shell(cat["file"], cat["seo_title"], cat["description"], json_ld(cat), body)


ABOUT_LEAD = [
    "Gloves Galore makes custom gloves for other people's brands, teams and shops. We do not sell a range under our own name — your logo is the only one on the finished pair.",
    "We are based in Sialkot, Pakistan, where sports gear has been made for over a century. We do the whole glove ourselves — design, patterns, cutting, stitching, printing, checking and packing — so when you ask for a change, it is us making it, not a middleman passing the message on. One thing we do differently from the big names here: we take the small orders too.",
]

ABOUT_BLOCKS = [
    ("What we make", "Gloves for mountain biking, BMX, motocross, the gym and the snow, in full-finger and half-finger versions, for men, women and kids. If a glove can be cut and stitched, we can quote it."),
    ("Who we work with", "Brands putting out a line, bike and gym shops starting their own label, race teams who need twenty matching pairs, and people who have an idea and no way to make it. All of them get the same process."),
    ("How we price", "Materials plus work, with no minimum we hold you to. Tell us the quantity you actually need and the price you want to land on, and we will tell you honestly what is possible at that number."),
    ("Materials", "The usual palm, mesh and stretch materials we already work with. If your design needs a fabric, insulation or hardware we do not keep, we source it for you before sampling instead of pushing you toward what is easy for us."),
    ("Samples", "Samples are free. You pay the courier, we pay for the glove. Nothing goes into production until you have held the sample and said yes."),
    ("Quality control", "Every pair is checked before it is packed — stitching, print, sizing and the small things that make a customer send a glove back."),
]


def about_page():
    lead = "\n".join(f"                <p>{esc(p)}</p>" for p in ABOUT_LEAD)
    blocks = "\n".join(
        f"""                <li class="cat-spec">
                    <h3>{esc(t)}</h3>
                    <p>{esc(d)}</p>
                </li>"""
        for t, d in ABOUT_BLOCKS
    )
    jsonld = (
        '<script type="application/ld+json">'
        '{"@context":"https://schema.org","@type":"AboutPage","name":"About Gloves Galore",'
        '"url":"{{SITE_URL}}/about.html",'
        '"mainEntity":{"@type":"Organization","name":"Gloves Galore","url":"{{SITE_URL}}/",'
        '"logo":"{{SITE_URL}}/assets/logo.png",'
        '"description":"Private-label glove manufacturer in Sialkot, Pakistan for MTB, BMX, motocross, gym and ski brands.",'
        '"address":{"@type":"PostalAddress","addressLocality":"Sialkot","addressRegion":"Punjab","addressCountry":"PK"},'
        '"telephone":"+92 314 1632509"}}</script>'
    )
    body = f"""    <section class="cat-hero cat-hero--plain">
        <div class="cat-hero-content">
            <span class="connect-eyebrow">About us</span>
            <h1 class="connect-title">WE MAKE GLOVES<br><span class="outline-text">FOR YOUR BRAND</span></h1>
            <p class="connect-subtitle">Custom gloves out of Sialkot, Pakistan — built to your design and sold under your name, not ours.</p>
        </div>
    </section>

    <section class="cat-section">
        <div class="cat-shell cat-shell--narrow">
            <div class="cat-lead">
{lead}
            </div>
        </div>
    </section>

    <section class="cat-section cat-section--alt">
        <div class="cat-shell">
            <h2 class="cat-h2">HOW WE <span class="outline-text">WORK</span></h2>
            <ul class="cat-specs">
{blocks}
            </ul>
        </div>
    </section>

    <section class="cat-section">
        <div class="cat-shell">
            <h2 class="cat-h2">FROM IDEA TO <span class="outline-text">BOXED STOCK</span></h2>
            <ol class="cat-steps">
{process_html()}
            </ol>
        </div>
    </section>

    <section class="cat-section cat-section--alt">
        <div class="cat-shell">
            <h2 class="cat-h2">WHAT WE BUILD</h2>
            <div class="cat-links">
{links_html(None)}
            </div>
            <div class="cat-cta">
                <div>
                    <h3>Talk to us</h3>
                    <p>WhatsApp, email or the contact form — whichever is easiest.</p>
                </div>
                <div class="cat-cta-actions">
                    <a class="btn-explore" href="connect.html">Start your order <span class="material-symbols-outlined" aria-hidden="true">arrow_forward</span></a>
                    <a class="btn-primary" href="{WA_LINK}" target="_blank" rel="noopener noreferrer">WhatsApp us</a>
                </div>
            </div>
        </div>
    </section>
"""
    return shell(
        "about.html",
        "About Gloves Galore | Custom Glove Manufacturer in Sialkot",
        "Gloves Galore is a private-label glove manufacturer in Sialkot, Pakistan. We build MTB, BMX, motocross, gym and ski gloves for other brands, teams and shops — free samples, no minimum order.",
        jsonld,
        body,
    )


written = []
for i, cat in enumerate(CATS):
    (SITE / cat["file"]).write_text(category_page(cat, (i * 2) % 10), encoding="utf-8")
    written.append(cat["file"])
(SITE / "about.html").write_text(about_page(), encoding="utf-8")
written.append("about.html")
print("wrote " + ", ".join(written))
