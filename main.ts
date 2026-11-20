// Leonida 55 v2 — the program that hands the guide in (Node 22, standard library only).
//
// The guide itself is this directory's app/ folder: plain static files a browser opens
// at app/index.html (ES modules, one stylesheet, no build step), fully offline — it loads
// nothing over the network, and its trophy list, guides, numbered steps and roadmap live
// in app/data/*.json. This program copies app/ and screenshots/ from beside this file
// into the output directory and writes /output/dossier.json there with the vendored
// make.fun library, which is the summary the judge reads (the screenshots, the first
// load's files and bytes, and the source). Do not edit vendor/makefun-frontend.ts: the
// scorer rebuilds the dossier with its own identical copy and requires the two to match
// byte for byte.
//
// What the guide holds in v2: a tracker over all 55 GTA 6 trophies with saved progress,
// export and import, kind filters and a spoiler setting, a five-stage roadmap to the
// platinum with per-stage progress, the one confirmed missable flagged with its own
// note, and a guide to each trophy in our own words — as numbered cited steps — that
// names its sources beside it, with the date each source was checked.
//
// Run it locally with `node serve.ts` (http://localhost:8080). Outside the grader's
// container, MAKEFUN_OUTPUT_DIR stands in for /output:
//   mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts

import { cpSync, existsSync, mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildDossier } from './vendor/makefun-frontend.ts';

const repoRoot = fileURLToPath(new URL('.', import.meta.url));
const outputDir = process.env.MAKEFUN_OUTPUT_DIR ?? '/output';

mkdirSync(outputDir, { recursive: true });
cpSync(join(repoRoot, 'app'), join(outputDir, 'app'), { recursive: true });
mkdirSync(join(outputDir, 'screenshots'), { recursive: true });
if (existsSync(join(repoRoot, 'screenshots'))) {
  cpSync(join(repoRoot, 'screenshots'), join(outputDir, 'screenshots'), { recursive: true });
}

// The scorer's own caps: only text_max_bytes shapes the dossier's bytes; the rest refuse
// an entry the scorer would refuse (more than 4 screenshots, one over 256 KiB, app/ past
// 993 files and directories or 48 MiB — app/ shares /output's own 1,000-entry cap with
// screenshots/ and dossier.json, so keep the whole hand-in inside it).
writeFileSync(
  join(outputDir, 'dossier.json'),
  buildDossier(outputDir, {
    text_max_bytes: 163840,
    screenshots: { max: 4, max_bytes: 262144 },
    app_max_files: 993,
    app_max_bytes: 50331648,
  }),
);
