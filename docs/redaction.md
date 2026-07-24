# Redaction

This repo is public, and agents write to it — including drafts pulled from
door-number-dense sources like real infrastructure code. So there's a gate that
runs before anything lands, built on one assumption: **the writer will
eventually slip.** Design for that and the slip is a non-event. Here's the gate.

## The manifest

If the docs are the passengers, redaction is the airport. Flavor, not the
mechanism:

Everything that boards — every line headed for a public repo — clears **security
screening** first. The scanner is the checkpoint, and contraband (a credential, a
key, a secret rendered into an image) doesn't get on the aircraft.

But screening isn't the whole job — the passengers also fly **anonymous.** The
manifest carries them without exposing who they really are: the roles fly, while
the real names, tail numbers, and hangar addresses stay on the ground. A reader
sees *a lead directs an executor*, never the machine, the account, or the private
repo behind it. Screened at the gate, and travelling under a role, not a name.

## Why *before* the push, not after

A public repo means one slip is a public leak — and deleting it doesn't undo it.
The value stays in the branch, the pull request, and the git history long after
you "removed" it. So the real gate has to fire on the author's machine, *before*
the push. Anything that only runs in CI is a backstop, not the gate: by the time
CI sees a secret, it's already on GitHub.

The framing the whole design rests on: **your local pre-flight is the net; CI and
branch protection are the pin.** Day one you can ship with just the net plus a
human reading the diff; the automated layers harden it, but never let a green CI
check *feel* like the guarantee — a human still reads the report.

## Defense in depth

- **Local pre-flight scan** — runs against the working tree before every push.
  This is the net that actually catches the slip in time.
- **Platform secret scanning + push protection** — blocks known credential
  formats at push time, and scans history.
- **Redaction check in CI** — a required status check on every pull request,
  also scanning commit messages and PR metadata (not just files).
- **Branch protection** — no direct pushes; the checks above become
  unbypassable, because you physically can't merge around them.
- **The human gate** — a person reads the scanner's report, SOFT warnings
  included, before merging. Green is not consent.

## The scanner, in two tiers

The scanner has to catch two very different things.

**Generic — safe to be public.** Credential *formats*: access-key shapes, ARNs,
token prefixes, private-key headers, webhook URLs — plus a Shannon-**entropy**
sweep for high-randomness blobs that match no known format, and a check that
flags **binary files** (an image with an embedded token would otherwise sail
through as "not text"). These are patterns, not our values, so they live in the
repo in plain sight.

**Specific — our own door-numbers, which can't be published.** Here's the knot:
the *list of things to hide* is itself the sensitive part — publish the denylist
and you've published exactly what you were hiding. So it splits:

- A **zero-knowledge hash scan.** Each private term is hashed (one-way) and only
  the *hashes* are baked into the public scanner. The scanner hashes each token
  it reads and matches against them. The hashes reveal nothing; the same scanner
  runs in public CI and on your machine, with no plaintext and no secret passed
  through CI configuration.
- A **local plaintext net.** Hashing exact tokens has blind spots — very short
  codes, multi-word names, and languages with no word boundaries (a codename sits
  mid-sentence in CJK text with nothing to tokenize on). Those stay in a
  controlled private list that only the local pre-flight sees, where it can do a
  full substring match. So the two tiers are complementary: the public hash scan
  gives CI real coverage with zero leak; the local net is the thorough one.

Three details that matter more than they look:

- **The scanner never prints the value it matched.** A denylist hit reports a
  rule id and a location, never the secret — because the scanner's own output
  goes into public CI logs. A tool that catches a leak by *printing* it hasn't
  helped.
- **An allowlist annotation** lets a line opt out (for a deliberate example),
  and it can suppress the generic patterns but never the denylist.
- **A drift guard.** The local list is compared against a source-of-truth hash;
  if it's gone stale, the scan fails. A denylist that quietly falls behind the
  real door-numbers is the whole pin's weakest link.

## What regex will never catch

The honest limit. Machines catch *shapes*; they don't catch *meaning*.

- **Paraphrase.** "The box in the Tokyo datacentre" leaks the same fact as a
  hostname, and no pattern matches it.
- **Screenshots.** A terminal grab with a token in it is an image; the scanner
  sees pixels.
- **History and metadata.** Commit messages, PR titles, branch names — publishing
  surfaces the file scan doesn't cover unless you point it there.

All of that is the human gate's job. The automation narrows what a person has to
read; it doesn't replace the reading.

## Scars from building it

- **The pin caught a pattern in its own pull request.** A PR that *documented* a
  new credential-shaped rule included an example of that shape in its description
  — and the metadata scan flagged it. Working exactly as intended, and a standing
  lesson: any doc *about* secret patterns will contain secret-shaped text (this
  very file was written around that trap).
- **Detail is not correctness.** During review, a confident "correction" pointed
  at a value that was actually right, and a plausible-looking reference link
  pointed at the wrong page. Both were caught only by going back to the source.
  The more fluent a wrong answer, the more it gets waved through — verify against
  the source of truth, not the summary.
- **The list going stale is the failure mode.** Every new machine, repo, or
  codename has to be added to the denylist *before* it can appear in a draft.
  That maintenance *is* the security; skip it and the net has a hole exactly
  where the newest secret is.

## Why bother hashing the list

Because it's what lets the *same* gate run in the open. You don't want two
scanners drifting apart, and you can't hand CI your list of secrets. Hash the
list, and the public half knows *what to look for* without knowing *what it is* —
which is the whole trick to letting an untrusted, public pipeline guard private
information.

---

*Part of [flightdeck](../README.md). The scanner it describes lives in
[`scripts/redaction-scan.js`](../scripts/redaction-scan.js). Corrections
welcome.*
