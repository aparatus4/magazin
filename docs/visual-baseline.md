# Visual baseline

The Vite concept storefront in `legacy/` is the design reference for the
Medusa + Next.js rebuild. It is preserved in Git at tag
`baseline-static-site` (commit `6fb1cf4`) and remains runnable from `legacy/`.

Do not redesign the storefront while porting it. Keep the warm ivory, sage,
and sand palette, the serif-italic accents, the generous whitespace, and the
premium editorial feel unless a redesign is explicitly approved in `PLAN.md`.

## What to compare

| Viewport | Size | Notes |
| --- | --- | --- |
| Desktop | 1440 × 1000 | Primary design reference |
| Mobile | 390 × 844 | Mobile-first layout and menu |

Capture these home sections on both viewports:

1. Hero (portrait slide)
2. Trust strip
3. Portrait Studio
4. Category grid
5. Collection
6. Custom bureau
7. Materials
8. Projects
9. Reviews
10. Newsletter
11. Footer

During parity work, also compare the interactive overlays manually: mega menu,
search, quick view, cart drawer, project brief modal, and the mobile menu.

## Capturing screenshots

Start the legacy dev server, then run the capture script:

```powershell
pnpm dev:legacy
node scripts/capture-baseline.mjs
```

Screenshots are written to `shots/baseline/` and are intentionally ignored by
Git. The script uses Chrome or Edge through `scripts/browser-path.mjs`; set
`CHROME_PATH` if the browser is installed elsewhere.

## Caveats

- The 3D hero is WebGL. It renders in headless Chrome with SwiftShader, but
  element screenshots of the canvas can be blank. Use viewport screenshots.
- Full-page screenshots of the long home page duplicate sticky headers and
  overlays. Use section/viewport screenshots instead.
- Wait for fonts and the 3D scene before comparing; the capture script waits
  for network idle plus two seconds.
- The current copy still contains demo claims (`86+`, `2,480 reviews`,
  `$189`). Those are not design requirements and must not be ported as facts.
- CGI renders are launch placeholders. Real studio, people, and product
  photography is required before public launch.
