// Leonida 55 — the hand-in program for gta6-trophy-guide-01 (Node 22, stdlib only).
// The guide itself is plain static files under app/ (index.html, its modules, its
// styles, its data), with 3 or 4 screenshots under screenshots/. This program
// copies both folders into the output directory and writes dossier.json there
// with the vendored make.fun library — the summary the judge reads (the
// screenshots, the first load's files and bytes, and the source). It writes the
// same bytes on every run: nothing here depends on the time, the machine, or
// the order files are read.
//
// Outside the grader's container, MAKEFUN_OUTPUT_DIR stands in for /output:
//   mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts
// Serve the guide locally with `node serve.ts`, then open http://localhost:8080.

import { cpSync, existsSync, mkdirSync, writeFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { buildDossier } from "./vendor/makefun-frontend.ts";

const repoRoot = dirname(fileURLToPath(import.meta.url));
const outDir = resolve(process.env.MAKEFUN_OUTPUT_DIR ?? "/output");
const appDir = join(repoRoot, "app");
const shotsDir = join(repoRoot, "screenshots");

function handIn() {
  mkdirSync(outDir, { recursive: true });
  cpSync(appDir, join(outDir, "app"), { recursive: true });
  mkdirSync(join(outDir, "screenshots"), { recursive: true });
  if (existsSync(shotsDir)) {
    cpSync(shotsDir, join(outDir, "screenshots"), { recursive: true });
  }
  // The scorer's own caps (reference/gate.json): only text_max_bytes shapes the
  // bytes; the others refuse an entry the scorer would refuse — more than 4
  // screenshots or one over 256 KiB, more than 993 files and directories in
  // app/ or 48 MiB of app files (app/ counts beside /output's own 1000-entry
  // cap, its screenshots/ and dossier.json).
  const dossierOptions = {
    text_max_bytes: 163840,
    screenshots: { max: 4, max_bytes: 262144 },
    app_max_files: 993,
    app_max_bytes: 50331648,
  };
  const dossier = buildDossier(outDir, dossierOptions);
  writeFileSync(join(outDir, "dossier.json"), dossier);
}

handIn();
