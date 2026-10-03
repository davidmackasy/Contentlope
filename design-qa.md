# Slideshow design QA — 2026-10-03

Status: passed for the slideshow changes in this release.

Reference: supplied images 3, 4 and 6, emphasizing full-frame photos, bold sans-serif text, rounded white labels, editable typography, and clearly separated controls. Riffi's existing purple branding and navigation are intentionally retained.

Visual comparison: `.sites-runtime/slideshow-design-comparison.png` places the reference, live editor and actual downloaded JPEG together. Checked font weight, wrapping, label padding, image crop, contrast, safe margins, control separation and portrait aspect ratio. Export dimensions verified as 1080 × 1920. Layout tests also cover 1080 × 1350. Position controls remain deliberately independent for headline and supporting text.

Live checks:
- Suggested ideas can be dismissed or selected. At 1280 × 720, the Generate footer remains within the viewport: y=619, height=77; configuration scrolls inside its panel.
- Template previews use portrait frames and three-slide compositions instead of stretched narrow strips.
- Device picker opens directly from Swap Image; uploaded library photograph is applied and a success message appears.
- Library swap, font selection, weight selection, keyboard text positioning, photo zoom, added text and slide insertion/removal exercised in a duplicated review draft.
- Saved typography and image changes reopen in the editor. The original draft was not modified.
- ZIP download produces individually rendered JPEG slides with white labels and editable text changes reflected in the output. Browser download-event monitoring timed out, but actual downloaded ZIP files were inspected locally.
- Editor checked at 1280 × 720 and 1022 × 1024; main canvas, slide rail, action toolbar and properties are separated. Longer settings scroll within their own panel. Story checks can collapse to preserve canvas space.

Automated validation: TypeScript passes; 35 tests pass, including shared text-layout bounds and persisted customization fields. No P0/P1/P2 issue identified in the checked release scope. No live social post was published. AI image generation and a new paid video render were not exercised by this slideshow QA.

Production deployment: Cloudflare version 239fe617-1a52-406c-ad7a-d87ffbc00d55.
