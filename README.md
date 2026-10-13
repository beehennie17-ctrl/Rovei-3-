# Rovei Beauty Packs showcase — safe Codespaces preview

This kit is tailored to the approved landing reference in the `Rovei-3-` repository.
It *replaces* the earlier sage-coloured Beauty Packs section in a **new standalone public landing preview**, exactly between the client-experience and client-memory sections. Nothing is appended to the bottom.

## Install

1. Create a feature branch in your Codespace, preserving your current work.
2. Upload `rovei-beauty-showcase-kit.zip` to the repository root via the Codespaces file explorer (drag it in).
3. Run:

```bash
cd /workspaces/Rovei-3-
mkdir -p /tmp/rovei-showcase-kit
unzip -oq rovei-beauty-showcase-kit.zip -d /tmp/rovei-showcase-kit
python3 /tmp/rovei-showcase-kit/install.py
npm run typecheck && npm run lint && npm run build
npm run dev
```

4. Open `/landing` in the Codespaces forwarded preview URL. Cards toggle their detail panel, and CTA navigates to the existing `/signup` route.

## New files ONLY

- `public/rovei-landing.html`: standalone preview of existing approved landing HTML with gallery replacing the old small Beauty Packs section.
- `public/rovei-showcase/{lashes,facials,nails,makeup,waxing}.jpg`: images cropped from the screenshot you supplied.
- `app/landing/page.tsx`: simple route redirect to the preview.

The baseline `reference/Rovei_APPROVED_FINAL_FRONTEND.html`, `app/page.tsx` and `/app` are NOT modified. No backend changes.

## Note on graphics

The five photos were cropped from your reference screenshot. Before publishing publicly, confirm you hold the appropriate license or replace with cleared originals.

## Production step (separate, after your approval)

Currently `/` still redirects to `/app`. If you approve the preview, switch `app/page.tsx` to redirect to `/landing` after checking your auth flow; this is intentionally not performed by the installer.
