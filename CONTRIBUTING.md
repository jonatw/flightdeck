# Contributing

flightdeck documents fleet **roles and mechanisms**, never the instance behind
them. If you're adding or editing a doc, the rules below are what keep this repo
safe to be public.

## The one rule

Describe **how it works**, never **where it runs or who holds the keys**. Name
the building blocks freely — the stack isn't the secret. Never write:

- machine names, IPs, network topology
- credentials, tokens, secret locations, cloud account identifiers
- private repository names (refer to them by their nature instead)

If a sentence stops being true when you swap a machine or rotate a key, it's
instance-level — cut it or lift it to the role level.

## The writing pipeline

1. **Trigger** — a question ("how do you do X?"), a lesson, a milestone. A real
   question is the best trigger: it tells you exactly what to write.
2. **Gather** — pull the real mechanism and the real history. Ground it in what
   actually happened, don't invent.
3. **Draft** — role/mechanism level, plain voice, big-picture first then the
   parts.
4. **Redaction scan** — run the pin locally *with the private denylist* before
   you push:
   ```
   node scripts/redaction-scan.js . --denylist <your-private-denylist>
   ```
   HARD hit blocks; SOFT warns. The public CI runs the same scanner without the
   denylist (it only knows hashes) — treat CI as a floor, your local run as the
   real net.
5. **PR** — open one; CI runs the redaction check on the diff, commit messages,
   and PR metadata.
6. **Human gate** — a human reads the scanner report (SOFT warnings included),
   not just the green check, then merges.

## Two kinds of docs, one pipeline

- `docs/` — reference: the architecture broken down part by part. Stable.
- `articles/` — narrative: "how I did X", usually written to answer a question.
  Same pipeline, more voice.

Missing a credit? Open a PR — that's a fix, not an argument.
