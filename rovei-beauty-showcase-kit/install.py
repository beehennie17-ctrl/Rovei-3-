#!/usr/bin/env python3
"""Install an isolated Rovei Beauty Packs landing-page preview.

Reads (but never alters) the approved marketing HTML embedded in:
  reference/Rovei_APPROVED_FINAL_FRONTEND.html

Writes only these new paths:
  public/rovei-landing.html
  public/rovei-showcase/*.jpg
  app/landing/page.tsx
"""
from __future__ import annotations

import json
import re
import shutil
from pathlib import Path

ROOT = Path.cwd()
SOURCE = ROOT / "reference" / "Rovei_APPROVED_FINAL_FRONTEND.html"
KIT = Path(__file__).resolve().parent

SHOWCASE_HTML = r'''
<section class="rovei-pack-showcase" id="beauty-showcase" aria-labelledby="rovei-pack-title">
  <div class="rovei-pack-wrap">
    <div class="rovei-pack-intro">
      <div>
        <p class="rovei-pack-eyebrow">BUILT FOR YOUR SERVICES</p>
        <h2 id="rovei-pack-title">Start with what<br><em>you already offer.</em></h2>
        <p class="rovei-pack-copy">Choose a Beauty Pack and Rovei gives you a polished starting point for consultation questions, prep, photos and client details — then make it yours.</p>
      </div>
      <p class="rovei-pack-note">Pick a pack. Make it yours.</p>
    </div>
    <div class="rovei-pack-gallery" aria-label="Explore Beauty Packs">
      <button class="rovei-pack-tile" type="button" data-rovei-pack="lashes" aria-pressed="false">
        <img src="/rovei-showcase/lashes.jpg" alt="Lash extension application" loading="lazy" decoding="async">
        <span class="rovei-pack-tile-shade"></span><span class="rovei-pack-tile-text"><small>BEAUTY PACK 01</small><strong>Lashes</strong><span>Explore this pack ↗</span></span>
      </button>
      <button class="rovei-pack-tile" type="button" data-rovei-pack="facials" aria-pressed="false">
        <img src="/rovei-showcase/facials.jpg" alt="Client receiving a facial treatment" loading="lazy" decoding="async">
        <span class="rovei-pack-tile-shade"></span><span class="rovei-pack-tile-text"><small>BEAUTY PACK 02</small><strong>Brows &amp; Skin</strong><span>Explore this pack ↗</span></span>
      </button>
      <button class="rovei-pack-tile" type="button" data-rovei-pack="nails" aria-pressed="false">
        <img src="/rovei-showcase/nails.jpg" alt="Elegant pale-pink manicure" loading="lazy" decoding="async">
        <span class="rovei-pack-tile-shade"></span><span class="rovei-pack-tile-text"><small>BEAUTY PACK 03</small><strong>Nails</strong><span>Explore this pack ↗</span></span>
      </button>
      <button class="rovei-pack-tile" type="button" data-rovei-pack="makeup" aria-pressed="false">
        <img src="/rovei-showcase/makeup.jpg" alt="Professional makeup application" loading="lazy" decoding="async">
        <span class="rovei-pack-tile-shade"></span><span class="rovei-pack-tile-text"><small>BEAUTY PACK 04</small><strong>Makeup</strong><span>Explore this pack ↗</span></span>
      </button>
      <button class="rovei-pack-tile" type="button" data-rovei-pack="waxing" aria-pressed="false">
        <img src="/rovei-showcase/waxing.jpg" alt="Waxing treatment preparation" loading="lazy" decoding="async">
        <span class="rovei-pack-tile-shade"></span><span class="rovei-pack-tile-text"><small>BEAUTY PACK 05</small><strong>Waxing</strong><span>Explore this pack ↗</span></span>
      </button>
    </div>
    <div class="rovei-pack-reveal" id="rovei-pack-reveal" hidden aria-live="polite">
      <div>
        <small id="rovei-pack-reveal-kicker">SELECTED BEAUTY PACK</small>
        <h3 id="rovei-pack-reveal-title"></h3>
        <p id="rovei-pack-reveal-body"></p>
      </div>
      <div class="rovei-pack-reveal-side">
        <div id="rovei-pack-reveal-tags" class="rovei-pack-tags"></div>
        <a href="/signup" class="rovei-pack-reveal-link">Make it yours ↗</a>
      </div>
    </div>
    <div class="rovei-pack-action"><a class="rovei-pack-cta" href="/signup">Explore Beauty Packs →</a></div>
  </div>
</section>'''.strip()

SHOWCASE_CSS = r'''
/* === Isolated Rovei Beauty Packs showcase: no global selectors === */
.rovei-pack-showcase{position:relative;background:linear-gradient(125deg,#f3cfd5 0%,#eab0be 100%);border-top:1px solid #ead2d8;border-bottom:1px solid #dab4bf;padding:82px 0 42px;color:#830b2b;overflow:hidden}
.rovei-pack-showcase .rovei-pack-wrap{width:min(1450px,calc(100% - 112px));margin:0 auto}
.rovei-pack-showcase .rovei-pack-intro{display:grid;grid-template-columns:minmax(0,1fr) auto;align-items:start;gap:35px;margin-bottom:32px}
.rovei-pack-showcase .rovei-pack-eyebrow{font-size:11px;font-weight:800;letter-spacing:.27em;margin:0 0 18px;color:#7d1d31}
.rovei-pack-showcase h2{font-family:Arial,Helvetica,sans-serif;font-size:clamp(43px,5.8vw,86px);line-height:.96;letter-spacing:-.065em;font-weight:800;margin:0 0 22px;color:#890927}
.rovei-pack-showcase h2 em{display:inline-block;font:italic 500 1.02em/.93 Georgia,'Times New Roman',serif;letter-spacing:-.065em}
.rovei-pack-showcase .rovei-pack-copy{font-size:clamp(16px,1.4vw,20px);line-height:1.56;color:#61404b;max-width:680px;margin:0}
.rovei-pack-showcase .rovei-pack-note{font:italic 500 clamp(17px,2vw,25px)/1.3 Georgia,'Times New Roman',serif;margin:0;padding-top:7px;white-space:nowrap;color:#84263e}
.rovei-pack-showcase .rovei-pack-gallery{display:grid;grid-template-columns:repeat(5,minmax(0,1fr));gap:18px}
.rovei-pack-showcase .rovei-pack-tile{position:relative;appearance:none;text-align:left;border:0;display:block;padding:0;background:#dfcbd0;border-radius:22px;overflow:hidden;aspect-ratio:.615;min-height:310px;color:#fff;isolation:isolate;box-shadow:0 10px 32px rgba(109,22,48,.09);cursor:pointer;transition:transform .22s ease,box-shadow .22s ease,outline-color .22s ease}
.rovei-pack-showcase .rovei-pack-tile img{position:absolute;inset:0;width:100%;height:100%;object-fit:cover;object-position:center;transition:transform .35s ease}
.rovei-pack-showcase .rovei-pack-tile-shade{position:absolute;inset:0;background:linear-gradient(180deg,transparent 42%,rgba(42,13,23,.78) 100%)}
.rovei-pack-showcase .rovei-pack-tile-text{position:absolute;bottom:0;left:0;right:0;padding:32px 20px 22px;display:flex;flex-direction:column;gap:5px}
.rovei-pack-showcase .rovei-pack-tile-text small{font-size:10px;font-weight:800;letter-spacing:.16em;color:#ffe0e8}
.rovei-pack-showcase .rovei-pack-tile-text strong{font-size:clamp(19px,2.2vw,30px);letter-spacing:-.035em;line-height:1.1}
.rovei-pack-showcase .rovei-pack-tile-text>span{font-size:12px;font-weight:700;opacity:.88;margin-top:4px}
.rovei-pack-showcase .rovei-pack-tile:hover,.rovei-pack-showcase .rovei-pack-tile[aria-pressed="true"]{transform:translateY(-5px);box-shadow:0 20px 40px rgba(109,22,48,.18)}
.rovei-pack-showcase .rovei-pack-tile:hover img{transform:scale(1.04)}
.rovei-pack-showcase .rovei-pack-tile[aria-pressed="true"]{outline:3px solid #870a2b;outline-offset:3px}
.rovei-pack-showcase .rovei-pack-reveal[hidden]{display:none}
.rovei-pack-showcase .rovei-pack-reveal{margin-top:25px;background:rgba(255,255,255,.78);border:1px solid rgba(123,31,53,.18);border-radius:22px;padding:23px 28px;display:grid;grid-template-columns:1.1fr 1fr;gap:26px;color:#3f2530;box-shadow:0 12px 34px rgba(109,22,48,.08)}
.rovei-pack-showcase .rovei-pack-reveal small{color:#8a2140;font-size:10px;letter-spacing:.19em;font-weight:800}
.rovei-pack-showcase .rovei-pack-reveal h3{font:italic 500 31px/1.1 Georgia,'Times New Roman',serif;margin:8px 0}
.rovei-pack-showcase .rovei-pack-reveal p{font-size:14px;line-height:1.55;margin:0;color:#61404b}
.rovei-pack-showcase .rovei-pack-reveal-side{display:flex;align-items:flex-end;justify-content:space-between;flex-wrap:wrap;gap:16px}
.rovei-pack-showcase .rovei-pack-tags{display:flex;gap:7px;flex-wrap:wrap}
.rovei-pack-showcase .rovei-pack-tags span{font-size:11px;font-weight:700;background:#f7e5e8;border:1px solid #e5c5ce;color:#76273d;padding:7px 10px;border-radius:999px}
.rovei-pack-showcase .rovei-pack-reveal-link{font-size:13px;font-weight:800;color:#830b2b;text-decoration:underline;text-underline-offset:4px;white-space:nowrap}
.rovei-pack-showcase .rovei-pack-action{text-align:center;padding-top:28px}
.rovei-pack-showcase .rovei-pack-cta{display:inline-flex;align-items:center;justify-content:center;min-height:53px;border-radius:999px;background:#8b082a;color:white;font-size:13px;font-weight:800;padding:0 28px;box-shadow:0 7px 22px rgba(125,17,43,.18);transition:background .2s ease,transform .2s ease}
.rovei-pack-showcase .rovei-pack-cta:hover{background:#630620;transform:translateY(-2px)}
.rovei-pack-showcase a:focus-visible,.rovei-pack-showcase button:focus-visible{outline:3px solid #6a0b28;outline-offset:5px}
@media(max-width:1100px){.rovei-pack-showcase .rovei-pack-wrap{width:min(100% - 56px,1450px)}.rovei-pack-showcase .rovei-pack-gallery{gap:12px}.rovei-pack-showcase .rovei-pack-tile{min-height:260px}.rovei-pack-showcase .rovei-pack-tile-text{padding:25px 12px 16px}}
@media(max-width:750px){.rovei-pack-showcase{padding:63px 0 36px}.rovei-pack-showcase .rovei-pack-wrap{width:calc(100% - 36px)}.rovei-pack-showcase .rovei-pack-intro{grid-template-columns:1fr;gap:12px}.rovei-pack-showcase .rovei-pack-note{white-space:normal}.rovei-pack-showcase .rovei-pack-gallery{display:flex;overflow-x:auto;scroll-snap-type:x mandatory;gap:13px;padding:8px 3px 18px;scrollbar-width:thin}.rovei-pack-showcase .rovei-pack-tile{flex:0 0 min(64vw,265px);min-height:345px;scroll-snap-align:center}.rovei-pack-showcase .rovei-pack-reveal{grid-template-columns:1fr;padding:19px;gap:18px}}
@media(max-width:400px){.rovei-pack-showcase .rovei-pack-tile{flex-basis:72vw}.rovei-pack-showcase h2{font-size:43px}.rovei-pack-showcase .rovei-pack-copy{font-size:15px}}
@media(prefers-reduced-motion:reduce){.rovei-pack-showcase .rovei-pack-tile,.rovei-pack-showcase .rovei-pack-tile img,.rovei-pack-showcase .rovei-pack-cta{transition:none}.rovei-pack-showcase .rovei-pack-tile:hover,.rovei-pack-showcase .rovei-pack-cta:hover{transform:none}}
'''.strip()

SHOWCASE_JS = r'''
<script>
/* Beauty Packs gallery: scoped, accessible interaction, no backend privileges. */
(() => {
  const root = document.querySelector('.rovei-pack-showcase');
  if (!root) return;
  const packs = {
    lashes: { name: 'Lashes', description: 'A thoughtful starting point for lash consultations, allergies, desired styles, aftercare and reference photos.', tags: ['Consultation', 'Lash style', 'Prep', 'Photos'] },
    facials: { name: 'Brows & Skin', description: 'Gather goals, sensitivities and treatment preferences before your brows or skin appointment.', tags: ['Skin history', 'Preferences', 'Prep', 'Consent'] },
    nails: { name: 'Nails', description: 'Capture shape, length, colour, nail health and inspiration so every appointment begins with clarity.', tags: ['Nail preferences', 'Inspiration', 'Photos', 'Aftercare'] },
    makeup: { name: 'Makeup', description: 'Prepare for each look with event details, skin preferences, reference images and timing.', tags: ['Occasion', 'Skin details', 'Inspiration', 'Prep'] },
    waxing: { name: 'Waxing', description: 'Make service preparation feel effortless with sensitivities, clear prep guidance and aftercare.', tags: ['Sensitivities', 'Prep', 'Consent', 'Aftercare'] }
  };
  const panel = root.querySelector('#rovei-pack-reveal');
  const title = root.querySelector('#rovei-pack-reveal-title');
  const body = root.querySelector('#rovei-pack-reveal-body');
  const tags = root.querySelector('#rovei-pack-reveal-tags');
  root.querySelectorAll('[data-rovei-pack]').forEach(tile => {
    tile.addEventListener('click', () => {
      const key = tile.getAttribute('data-rovei-pack');
      const pack = packs[key];
      if (!pack) return;
      const wasActive = tile.getAttribute('aria-pressed') === 'true';
      root.querySelectorAll('[data-rovei-pack]').forEach(x => x.setAttribute('aria-pressed', 'false'));
      if (wasActive) { panel.hidden = true; return; }
      tile.setAttribute('aria-pressed', 'true');
      title.textContent = pack.name;
      body.textContent = pack.description;
      tags.replaceChildren(...pack.tags.map(label => { const s = document.createElement('span'); s.textContent = label; return s; }));
      panel.hidden = false;
    });
  });
})();
</script>'''.strip()

ROUTE = '''import { redirect } from "next/navigation";

// Isolated preview of the approved marketing design + Beauty Packs showcase.
// The existing / and /app routes are deliberately unchanged.
export default function LandingPage() {
  redirect("/rovei-landing.html");
}
'''


def add_new(path: Path, content: bytes):
    """Never overwrite an existing, differing project file."""
    if path.exists():
        if path.read_bytes() == content:
            print(f"Unchanged (already installed): {path.relative_to(ROOT)}")
            return
        raise SystemExit(f"STOP: file already exists with different content: {path}. No files will be overwritten.")
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_bytes(content)
    print(f"Created: {path.relative_to(ROOT)}")


def main():
    if not (ROOT / "package.json").exists() or not SOURCE.exists():
        raise SystemExit("STOP: run this installer from the Rovei-3- repository root with its approved reference file.")
    original = SOURCE.read_text(encoding="utf-8")
    pattern = re.compile(r"\bconst\s+LANDING_HTML\s*=\s*")
    match = pattern.search(original)
    if not match:
        raise SystemExit("STOP: could not locate the embedded approved landing page. No files changed.")
    try:
        landing, consumed = json.JSONDecoder().raw_decode(original[match.end():])
    except ValueError as e:
        raise SystemExit(f"STOP: landing page format changed: {e}. No files changed.")
    start_marker = '<section class="section sage">'
    if landing.count(start_marker) != 1:
        raise SystemExit("STOP: Beauty Packs section anchor is missing or duplicated; no files changed.")
    start = landing.index(start_marker)
    end = landing.find('</section>', start)
    if end < 0:
        raise SystemExit("STOP: Beauty Packs section closing tag not found; no files changed.")
    end += len('</section>')
    old_section = landing[start:end]
    if 'BEAUTY PACKS' not in old_section or 'Build it once.' not in old_section:
        raise SystemExit("STOP: unexpected Beauty Packs section; no files changed.")
    landing = landing[:start] + SHOWCASE_HTML + landing[end:]
    if landing.count('</style>') != 1:
        raise SystemExit("STOP: unexpected landing stylesheet structure; no files changed.")
    landing = landing.replace('</style>', SHOWCASE_CSS + '\n</style>', 1)
    if landing.count('</body>') != 1:
        raise SystemExit("STOP: unexpected landing body structure; no files changed.")
    landing = landing.replace('</body>', SHOWCASE_JS + '\n</body>', 1)

    # This standalone preview cannot use prototype iframe parent navigation;
    # route its old CTA to the real (existing) Next.js routes instead.
    landing = landing.replace("parent.postMessage({type:'rovei:navigate',target:'welcome'},'*')", "window.location.href='/signup'")
    landing = landing.replace("parent.postMessage({type:'rovei:navigate',target:'login'},'*')", "window.location.href='/login'")

    if 'id="beauty-showcase"' not in landing or 'id="memory"' not in landing or landing.index('id="beauty-showcase"') > landing.index('id="memory"'):
        raise SystemExit("STOP: showcase placement validation failed; no files changed.")

    created_paths = [(ROOT / "public" / "rovei-landing.html", landing.encode("utf-8")), (ROOT / "app" / "landing" / "page.tsx", ROUTE.encode("utf-8"))]
    for name in ('lashes', 'facials', 'nails', 'makeup', 'waxing'):
        data = (KIT / 'images' / (name + '.jpg')).read_bytes()
        created_paths.append((ROOT / 'public' / 'rovei-showcase' / (name + '.jpg'), data))
    conflicts = [str(p) for p, b in created_paths if p.exists() and p.read_bytes() != b]
    if conflicts:
        raise SystemExit('STOP: existing files would be overwritten:\n' + '\n'.join(conflicts) + '\nNo files changed.')
    for path, data in created_paths:
        add_new(path, data)
    print('\nSUCCESS: preview created at /landing (redirects to /rovei-landing.html)')
    print('DESIGN FLOW: How Rovei works -> Client experience -> NEW Beauty Packs -> Client memory -> Pricing')
    print('UNCHANGED: app/page.tsx, /app, reference/, Supabase, authentication, migrations.')
    print('NEXT: npm run typecheck && npm run lint && npm run build')

if __name__ == '__main__':
    main()
