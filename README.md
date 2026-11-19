[![make.fun · gta6-cover-art-01](https://make.fun/badge/gta6-cover-art-01.svg)](https://make.fun/bounty/gta6-cover-art-01?utm_source=github&utm_medium=readme&utm_campaign=gta6-cover-art-01)
[![rank](https://make.fun/badge/gta6-cover-art-01/bangfadli121-arch/gta6-cover-art-01-entry/rank.svg)](https://make.fun/bounty/gta6-cover-art-01/leaderboard?utm_source=github&utm_medium=readme&utm_campaign=gta6-cover-art-01)
[![reward](https://make.fun/badge/gta6-cover-art-01/bangfadli121-arch/gta6-cover-art-01-entry/reward.svg)](https://make.fun/bounty/gta6-cover-art-01?utm_source=github&utm_medium=readme&utm_campaign=gta6-cover-art-01)

# VICE SUNSET — GTA 6-style cover art maker

Entry for the make.fun competition **gta6-cover-art-01**:
"Make a striking GTA-style cover from your photos."

**VICE SUNSET** turns photos into a Vice City sunset cover: a 6-panel
comic-book collage with a giant gradient title, halftone + duotone magenta
grade, thin black gutters, and a NEW SUMMER 2026 starburst — then exports
print-ready PNGs at 1080x1080, 1080x1350, and 1920x1080.

Live demo: https://bangfadli121-arch.github.io/gta6-cover-art-01-entry/app/

## What it does

- 6-panel collage: hero photo, fisherman, flamingos at sunset, sportscar,
  neon street, skyline — each photo used once, faces kept whole
- One strong grade across photos and art: halftone, duotone magenta-pink,
  sunset wash
- Giant title "VICE SUNSET" (yellow-to-pink gradient, thick black outline)
  fused with the grid, subtitle "VICE CITY · SUMMER 2026", script tagline
  "chasing the last light"
- Upload up to 3 of your own photos, or use the built-in samples
- Export PNG at 1080x1080, 1080x1350, 1920x1080

## Run it

Open `app/index.html` in a browser, or serve the `app/` folder:

```sh
cd app && python3 -m http.server
```

No build step, no network needed — all fonts are vendored OFL files under
`app/`, all art is procedural or sample photos shipped in the repo.
