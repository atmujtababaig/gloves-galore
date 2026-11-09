/* ============================================================
   TEAM ORDER LINKS
   ------------------------------------------------------------
   One entry per team that has approved its design. The team gets
   the link  glovesgalore.net/order/?team=<key>  (key = the name
   on the left, e.g. black-mountain).

   tiers: price per pair by total pairs in the order. The highest
          "min" the order reaches wins.
   designs (optional): several designs in one order, each with its own
          images; the team picks sizes per design. Without it, "images"
          is the one design.
   extras (optional): fixed charges added to the total, e.g. sample
          shipping still owed.
   payInFull (optional): the whole total is due up front instead of
          the 50% advance.
   payMethods (optional): which of "Bank transfer", "Wise", "PayPal"
          to offer; with one, it is already picked.
   customer (optional): details we already know, filled into the form
          and still editable: name, email, phone, ship_to.
   Image paths start with assets/ (no leading slash) so the build
   picks them up and compresses them.
   ============================================================ */
window.GG_ORDERS = {
    "black-mountain": {
        team: "Black Mountain Composite",
        logo: "assets/orders/black-mountain/logo.png",
        images: [
            { src: "assets/orders/black-mountain/back.jpg", label: "Back of hand" },
            { src: "assets/orders/black-mountain/palm.jpg", label: "Palm" },
            { src: "assets/orders/black-mountain/strap.jpg", label: "Cuff strap, left and right", wide: true },
        ],
        sizes: ["Youth S", "Youth M", "Youth L", "Adult S", "Adult M", "Adult L", "Adult XL"],
        // his rate 2026-11-05: $18 / $16 / $14, shipping separate by weight
        tiers: [
            { min: 1, price: 18 },
            { min: 21, price: 16 },
            { min: 31, price: 14 },
        ],
    },
    "green-dragons": {
        team: "Green Dragons",
        designs: [
            // Venom option 1 was dropped by the team
            { name: "Volt Lime", images: [{ src: "assets/orders/green-dragons/volt-1.jpg", label: "Volt Lime, back of hand" }] },
            { name: "Volt Flame", images: [{ src: "assets/orders/green-dragons/volt-2.jpg", label: "Volt Flame, back of hand" }] },
            { name: "Venom", images: [{ src: "assets/orders/green-dragons/venom-2.jpg", label: "Venom, back of hand" }] },
        ],
        sizes: ["Youth S", "Youth M", "Youth L", "Adult S", "Adult M", "Adult L", "Adult XL"],
        // agreed 2026-10-14: $12 a pair for the 40-pair order
        tiers: [{ min: 1, price: 12 }],
        // sample shipping $60 paid by PayPal 2026-11-09 (to Israr Iqbal), so no extras
        // he asked to pay for all of it at once (WhatsApp 2026-11-09)
        payInFull: true,
        payMethods: ["PayPal"],
        // filled in on the page, he can still change them
        customer: {
            name: "Richard Lamb",
            email: "rdlamb2@comcast.net",
            ship_to: "15 Cornerbrook Place, The Woodlands, TX 77381",
        },
    },
};

// Payment terms shared by every order link
window.GG_ORDER_TERMS = {
    depositShare: 0.5,       // part paid before production starts
    payInFullBelow: 300,     // orders under this (USD) are paid in full upfront
};
