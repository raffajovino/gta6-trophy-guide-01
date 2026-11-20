// A tiny static server for app/ (Node 22, standard library only), so the guide
// can be run locally with no build step: `node serve.ts` serves app/ on
// http://localhost:8080 (`--port <n>` for another port). It sends the MIME types
// a browser needs, refuses any path outside app/, and otherwise does nothing
// clever — a development convenience, not a web server for the internet.
import { createReadStream, statSync } from "node:fs";
import { createServer } from "node:http";
import { extname, join, normalize, resolve, sep } from "node:path";
import { fileURLToPath } from "node:url";

const appRoot = resolve(fileURLToPath(new URL("./app", import.meta.url)));
const args = process.argv.slice(2);
const portFlag = args.indexOf("--port");
const wanted = portFlag === -1 ? 8080 : Number(args[portFlag + 1]);
const port = Number.isInteger(wanted) && wanted > 0 && wanted < 65536 ? wanted : 8080;

const TYPES = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".mjs": "text/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".webp": "image/webp",
  ".ico": "image/x-icon",
  ".woff2": "font/woff2",
  ".webmanifest": "application/manifest+json",
};

function sendFile(response, file) {
  const type = TYPES[extname(file).toLowerCase()] ?? "application/octet-stream";
  response.writeHead(200, {
    "content-type": type,
    "content-length": statSync(file).size,
    "cache-control": "no-store",
  });
  createReadStream(file).pipe(response);
}

createServer((request, response) => {
  const url = new URL(request.url ?? "/", "http://localhost");
  let path = url.pathname;
  try {
    path = decodeURIComponent(path);
  } catch {
    response.writeHead(400).end("bad request");
    return;
  }
  if (path.endsWith("/")) path += "index.html";
  const file = resolve(join(appRoot, normalize(path)));
  if (file !== appRoot && !file.startsWith(appRoot + sep)) {
    response.writeHead(403).end("forbidden");
    return;
  }
  try {
    if (!statSync(file).isFile()) throw new Error("not a file");
  } catch {
    response.writeHead(404).end("not found");
    return;
  }
  sendFile(response, file);
}).listen(port, "127.0.0.1", () => {
  console.log(`app/ is on http://localhost:${port}`);
});
