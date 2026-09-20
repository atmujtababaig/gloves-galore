#!/usr/bin/env python
"""Menu overlay changes applied to every page that carries the nav.

  1. "Get In Touch" removed from the header
  2. WhatsApp / Instagram become icons (same SVGs the footer already uses)
  3. "Samples free - you pay the courier." dropped from the menu note
  4. a neon "Get In Touch" CTA added inside the menu

Run from the site root:  python tools/patch-menu.py
"""
import glob, re, sys

WA_PATH = ("M20.5 3.5A11.8 11.8 0 0 0 12.1 0C5.6 0 .3 5.3.3 11.9c0 2.1.5 4.2 1.6 6L.2 24l6.3-1.7a11.8 "
           "11.8 0 0 0 5.6 1.4h.1c6.5 0 11.8-5.3 11.8-11.9 0-3.1-1.2-6.1-3.5-8.3Zm-8.3 18.2h-.1c-1.8 "
           "0-3.6-.5-5.1-1.4l-.4-.2-3.7 1 1-3.6-.2-.4a9.8 9.8 0 1 1 8.5 4.6Zm5.4-7.3c-.3-.2-1.8-.9-2.1-1-.3-.1-.5-.2-.7.2-.2.3-.8 "
           "1-.9 1.2-.2.2-.3.2-.6.1-1.7-.8-2.8-1.5-3.9-3.4-.3-.5.3-.5.8-1.5.1-.2 0-.4 0-.6l-1-2.4c-.3-.6-.5-.5-.7-.5h-.6c-.2 "
           "0-.6.1-.9.4-.3.4-1.2 1.2-1.2 2.9s1.2 3.3 1.4 3.6c.2.2 2.4 3.7 5.9 5.2 2.2.9 3.1 1 4.2.8.7-.1 "
           "1.8-.7 2-1.4.3-.7.3-1.3.2-1.4-.1-.2-.3-.3-.6-.4Z")

IG_PATH = ("M12 2.2c3.2 0 3.6 0 4.8.1 1.2.1 1.8.2 2.2.4.6.2 1 .5 1.4.9.4.4.7.8.9 1.4.2.4.4 1 .4 2.2.1 "
           "1.3.1 1.6.1 4.8s0 3.6-.1 4.8c-.1 1.2-.2 1.8-.4 2.2-.2.6-.5 1-.9 1.4-.4.4-.8.7-1.4.9-.4.2-1 "
           ".4-2.2.4-1.3.1-1.6.1-4.8.1s-3.6 0-4.8-.1c-1.2-.1-1.8-.2-2.2-.4a3.7 3.7 0 0 1-1.4-.9 3.7 3.7 "
           "0 0 1-.9-1.4c-.2-.4-.4-1-.4-2.2-.1-1.3-.1-1.6-.1-4.8s0-3.6.1-4.8c.1-1.2.2-1.8.4-2.2.2-.6.5-1 "
           ".9-1.4.4-.4.8-.7 1.4-.9.4-.2 1-.4 2.2-.4C8.4 2.2 8.8 2.2 12 2.2ZM12 0C8.7 0 8.3 0 7 .1 5.7.2 "
           "4.8.4 4 .7a6 6 0 0 0-2.1 1.4A6 6 0 0 0 .5 4.2C.2 5 0 5.9 0 7.2-.1 8.5-.1 8.9-.1 12.1s0 3.7.1 "
           "5c.1 1.3.3 2.2.6 3a6 6 0 0 0 1.4 2.1 6 6 0 0 0 2.1 1.4c.8.3 1.7.5 3 .6 1.3.1 1.7.1 5 .1s3.7 0 "
           "5-.1c1.3-.1 2.2-.3 3-.6a6 6 0 0 0 2.1-1.4 6 6 0 0 0 1.4-2.1c.3-.8.5-1.7.6-3 .1-1.3.1-1.7.1-5s0-3.7-.1-5c-.1-1.3-.3-2.2-.6-3A6 "
           "6 0 0 0 22 2a6 6 0 0 0-2.1-1.4C19.1.3 18.2.1 16.9 0 15.7 0 15.3 0 12 0Zm0 5.8A6.2 6.2 0 1 0 12 "
           "18.2 6.2 6.2 0 0 0 12 5.8ZM12 16a4 4 0 1 1 0-8 4 4 0 0 1 0 8Zm7.9-10.5a1.4 1.4 0 1 1-2.9 0 1.4 "
           "1.4 0 0 1 2.9 0Z")

SIDE = f'''<div class="site-menu-side">
                <p class="site-menu-side-title">Talk to us</p>
                <a class="site-menu-mail" href="mailto:mujtababaig598@gmail.com">mujtababaig598@gmail.com</a>
                <div class="site-menu-socials">
                    <a class="site-menu-social" href="https://wa.me/923141632509" target="_blank" rel="noopener noreferrer" aria-label="Chat with Gloves Galore on WhatsApp">
                        <svg viewBox="0 0 24 24" aria-hidden="true"><path d="{WA_PATH}"/></svg>
                    </a>
                    <a class="site-menu-social" href="https://www.instagram.com/glovesgalore_/" target="_blank" rel="noopener noreferrer" aria-label="Gloves Galore on Instagram">
                        <svg viewBox="0 0 24 24" aria-hidden="true"><path d="{IG_PATH}"/></svg>
                    </a>
                </div>
                <a class="site-menu-cta" href="connect.html">Get In Touch</a>
                <p class="site-menu-side-note">Sialkot, Pakistan</p>
            </div>'''


def main():
    files = sorted(glob.glob("*.html"))
    changed = 0
    for f in files:
        src = open(f, encoding="utf-8").read()
        out = src

        # 1. header CTA out
        out = re.sub(r'\n\s*<a href="connect\.html" class="btn-primary">Get In Touch</a>', "", out)

        # 2-4. whole side panel replaced
        out = re.sub(r'<div class="site-menu-side">.*?</div>\s*(?=</div>)', SIDE + "\n        ",
                     out, flags=re.S)

        if out != src:
            open(f, "w", encoding="utf-8").write(out)
            changed += 1
            hdr = "hdr" if 'class="btn-primary">Get In Touch' not in out else "HDR-MISS"
            side = "side" if "site-menu-socials" in out else "SIDE-MISS"
            note = "note" if "Samples free" not in out else "NOTE-MISS"
            print(f"  {f:22s} {hdr:9s} {side:10s} {note}")
        else:
            print(f"  {f:22s} (no nav, skipped)")
    print(f"\n{changed}/{len(files)} files changed")
    return 0


if __name__ == "__main__":
    sys.exit(main())
