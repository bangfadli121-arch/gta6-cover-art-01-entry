// Vice Cover Studio — a GTA-poster-style cover art maker (Node 22, stdlib only).
// The app is plain static files under app/ (index.html + ES modules + OFL
// fonts + sample photos), served offline by any static server. This program
// hands the entry in: it copies app/ and screenshots/ from beside this file
// into /output (or $MAKEFUN_OUTPUT_DIR) and writes /output/dossier.json with
// the vendored make.fun library, so the judge can read the app's source and
// screenshots. Run locally with:
//   mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts

import { cpSync, existsSync, mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildDossier } from './vendor/makefun-app.ts';

const here = fileURLToPath(new URL('.', import.meta.url));
const outDir = process.env.MAKEFUN_OUTPUT_DIR ?? '/output';

mkdirSync(outDir, { recursive: true });
cpSync(join(here, 'app'), join(outDir, 'app'), { recursive: true });
mkdirSync(join(outDir, 'screenshots'), { recursive: true });
if (existsSync(join(here, 'screenshots'))) {
  cpSync(join(here, 'screenshots'), join(outDir, 'screenshots'), { recursive: true });
}

// Gate caps from the kit's reference: at most 4 screenshots of 256 KiB each,
// app/ at most 993 entries / 48 MiB, paths at most 1000 bytes, dossier text
// capped at 160 KiB — the same limits the sealed scorer enforces.
writeFileSync(
  join(outDir, 'dossier.json'),
  buildDossier(outDir, {
    text_max_bytes: 163840,
    screenshots: { max: 4, max_bytes: 262144 },
    app_max_files: 993,
    app_max_bytes: 50331648,
    app_path_max_bytes: 1000,
  }),
);
console.log(`wrote ${outDir}/dossier.json`);
