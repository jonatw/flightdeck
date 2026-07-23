#!/usr/bin/env node
/*
 * flightdeck — redaction scanner (public, CI + local).
 *
 * ONE script, two contexts:
 *   CI (public):   node redaction-scan.js .          -> generic regex + entropy +
 *                  binary guard + zero-knowledge hash-scan. Leaks nothing.
 *   Local (net):   node redaction-scan.js . --denylist <private-file>  -> all of
 *                  the above PLUS a plaintext substring net for terms the hash
 *                  scan is blind to (short codes, CJK codenames, multi-word).
 *
 * Only SHA-256[:16] hashes of hash-scan-friendly terms are baked in below —
 * one-way, so CI and local share one rule set with zero plaintext leak. Hits
 * print a hash prefix / rule id only, never the matched value.
 *
 * Regex-blind by design (human/panel gate + process, NOT here): semantic leaks,
 * screenshots/images, git HISTORY, PR titles/bodies, issue comments. CI also
 * scans git diff + commit messages; the human gate must READ this report.
 *
 * Exit: 0 clean, 1 HARD (must fix), 2 SOFT only (human look).
 */
const fs = require("fs");
const path = require("path");
const crypto = require("crypto");

const ALLOW = /redaction-scan:\s*allow/i;

// SHA-256[:16] of lowercased hash-scan-friendly denylist terms. Public-safe.
const HASH_DENY = new Set([
  "56fd91119f07e5b1","9052432cf323c46e","c30abde10ed55ece","0c07ccb88c1df08c",
  "f6723d38e5a2730c","621f9a09b78fb2ea","2e38783aca4db11b","54bbfdd55db8ce3d",
  "16d17aceaaf90b53","10accb5180fb9150","68d23a75a2bcacaa","f57c38d821360987",
  "fa4f1b2d35594b04","4e5c0efbba9074ce","e1f7c2a508289633","a1d58275d03b37f2",
  "5b342b4db3d71a90","b5c96b47fa309bb7","24f93dc159383ed5","2a3588e0c20e3126",
  "e650c0422c2e4f32","de232c11f1b3fd3d",
]);
const sha16 = s => crypto.createHash("sha256").update(s.toLowerCase()).digest("hex").slice(0, 16);

const HARD = {
  "AWS access key id":       /\bAKIA[0-9A-Z]{16}\b/,
  "AWS ARN":                 /\barn:aws[a-z-]*:[a-z0-9-]*:[a-z0-9-]*:\d{0,12}:/,
  "GitHub PAT (classic)":    /\bghp_[A-Za-z0-9]{36}\b/,
  "GitHub PAT (fine)":       /\bgithub_pat_[A-Za-z0-9_]{22,}\b/,
  "GitHub OAuth/app token":  /\bgh[ousr]_[A-Za-z0-9]{36}\b/,
  "Slack token":             /\bxox[baprs]-[A-Za-z0-9-]{10,}\b/,
  "Discord webhook":         /https:\/\/discord(?:app)?\.com\/api\/webhooks\/\d+\/[\w-]+/,
  "Private key block":       /-----BEGIN (?:RSA |EC |OPENSSH |PGP |DSA )?PRIVATE KEY-----/,
  "Google API key":          /\bAIza[0-9A-Za-z\-_]{35}\b/,
  "Generic bearer/secret =": /\b(?:api[_-]?key|secret|password|passwd|token|bearer)\b\s*[:=]\s*['"]?[A-Za-z0-9\-_.\/+]{12,}/i,
};
const SOFT = {
  "12-digit (poss. AWS acct id)":   /\b\d{12}\b/,
  "17-19 digit (poss. Discord id)": /\b\d{17,19}\b/,
  "Tailscale CGNAT 100.64/10":      /\b100\.(?:6[4-9]|[7-9]\d|1[01]\d|12[0-7])\.\d{1,3}\.\d{1,3}\b/,
  "Private-range IP":               /\b(?:10\.\d{1,3}|192\.168|172\.(?:1[6-9]|2\d|3[01]))\.\d{1,3}\.\d{1,3}\b/,
  "S3 URI":                         /\bs3:\/\/[a-z0-9.-]+/,
};

function shannon(s) {
  const f = {}; for (const c of s) f[c] = (f[c] || 0) + 1;
  let h = 0; for (const c in f) { const p = f[c] / s.length; h -= p * Math.log2(p); } return h;
}
function entropyHits(line) {
  const out = [];
  for (const m of line.matchAll(/[A-Za-z0-9+/=_-]{24,}/g))
    if (shannon(m[0]) >= 4.2) out.push("high-entropy token (" + m[0].length + " chars)");
  return out;
}
function hashHits(line) {
  const out = [];
  for (const m of line.matchAll(/[A-Za-z0-9._-]{4,64}/g)) {
    const hp = sha16(m[0]);
    if (HASH_DENY.has(hp)) out.push("denylist hash-match " + hp);
  }
  return out;
}

function* files(root) {
  const st = fs.statSync(root);
  if (st.isFile()) { yield root; return; }
  for (const e of fs.readdirSync(root, { withFileTypes: true })) {
    if (e.name === ".git" || e.name === "node_modules") continue;  // paths only — never suppresses content
    const p = path.join(root, e.name);
    if (e.isDirectory()) yield* files(p); else yield p;
  }
}

const args = process.argv.slice(2);
const root = args.find(a => !a.startsWith("--")) || ".";
const dIdx = args.indexOf("--denylist");
const denyFile = dIdx >= 0 ? args[dIdx + 1] : null;

let specific = [];
if (denyFile) specific = fs.readFileSync(denyFile, "utf8").split("\n")
  .map(s => s.trim()).filter(s => s && !s.startsWith("#"));

const hard = [], soft = [];
for (const f of files(root)) {
  let buf; try { buf = fs.readFileSync(f); } catch { continue; }
  if (buf.subarray(0, 8192).includes(0)) {
    hard.push([f, 0, "binary file — scanner blind, manual review required", "(not text)"]);
    continue;
  }
  buf.toString("utf8").split("\n").forEach((line, i) => {
    const n = i + 1, ctx = line.trim().slice(0, 80), allowed = ALLOW.test(line);
    for (const h of hashHits(line)) hard.push([f, n, h, "(value redacted)"]);
    specific.forEach((t, idx) => { if (line.toLowerCase().includes(t.toLowerCase()))
      hard.push([f, n, `denylist rule #${idx + 1}`, "(value redacted)"]); });
    if (allowed) return;
    for (const [name, re] of Object.entries(HARD)) if (re.test(line)) hard.push([f, n, name, ctx]);
    for (const e of entropyHits(line)) soft.push([f, n, e, ctx]);
    for (const [name, re] of Object.entries(SOFT)) if (re.test(line)) soft.push([f, n, name, ctx]);
  });
}

for (const [f, n, name, ctx] of hard) console.log("HARD  " + f + ":" + n + "  [" + name + "]  " + ctx);
for (const [f, n, name, ctx] of soft) console.log("SOFT  " + f + ":" + n + "  [" + name + "]  " + ctx);
if (hard.length) { console.log("\n" + hard.length + " HARD hit(s) — must fix before push."); process.exit(1); }
if (soft.length) { console.log("\n" + soft.length + " SOFT warning(s) — human look before push."); process.exit(2); }
console.log("clean — no credential formats, high-entropy blobs, or denylist matches.");
process.exit(0);
