# Security policy

This repo documents fleet **roles and mechanisms only** — machine names, credentials, cloud identifiers, and private repository names are never allowed here.

The public CI scan is a **floor, not a ceiling**: it knows the private vocabulary only as one-way hashes, so it is deliberately blind to terms the hash tokenizer can't reach (very short codes, multi-word phrases). The full net runs locally: `node scripts/redaction-scan.js . --denylist <private-denylist>` — required before every push. Install it as a hook once (`cp scripts/pre-push .git/hooks/pre-push && chmod +x .git/hooks/pre-push`) so it always fires; the denylist file lives outside the repo and is never committed.

A green check is not sufficient for merge: a human must read the scanner report (SOFT warnings included) before merging.
