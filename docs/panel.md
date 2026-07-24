# The panel

The review panel is a small set of advisors — each backed by a **different**
model — that the Lead pulls in for a second opinion on anything that matters: a
design call, a code review, "is this bug/finding actually real?" This is how it
runs, and the crew metaphor that fits it.

## Why a panel at all

A single model can be **confidently, fluently wrong** — and the more fluent the
wrong answer, the more it gets waved through. One model reviewing one model's
work is a single point of failure. A panel of *different* models covers each
other's blind spots: where one is sure and wrong, another is often plainly right.
The disagreement is the product.

## The crew

If you fly it, the panel is a **flight crew**, and the discipline is **Crew
Resource Management (CRM)** — using every crewmember's eyes so that no one
person's error, *including the
captain's*, goes unchallenged. Accident history is full of a first officer who
saw the problem and didn't feel able to say it. A multi-model panel is CRM with
models: each advisor is a crewmember, the Lead is captain, and the whole point is
that someone can — and should — say *"check my read on this."* Disagreement isn't
friction; it's the crew doing its job.

Flavor, not the mechanism — but it's how the discipline is meant to feel.

## How it runs

- **Pulled in on demand.** Architecture, risk, "is this real?" — not every trivial
  thing. Low-stakes calls go solo.
- **Ask once, converge.** Put the question fully, take one round, synthesize.
  Chasing the same advisor in circles burns time and rarely adds signal.
- **Adversarial verify.** For a finding that matters, ask the crew to *refute*
  it. A claim that survives skeptics is worth more than one that was only ever
  agreed with.
- **The Lead is captain.** Breaks ties, decides, owns the call. A split vote is a
  signal to look harder, not a deadlock — silence and disagreement don't get to
  stall the aircraft.

## Deciding: FOR-DEC

Decisions run on [**FOR-DEC**](https://skybrary.aero/articles/dec), the aviation
decision model — **F**acts, **O**ptions, **R**isks & benefits — *(the hyphen is a
deliberate pause: did I miss anything?)* — **D**ecision, **E**xecution,
**C**heck:

- **Facts** — grounded in the real code and history, not from memory.
- **Options / Risks** — laid out with the crew, each with its trade-offs.
- **— the pause —** stop on the hyphen and *cross-check the crew before you
  commit.* This is where the panel earns its keep.
- **Decision / Execution** — the Lead decides and dispatches it.
- **Check** — and then you verify: **VVM** — *Verbalize, Verify, Monitor* — which
  in practice is the scanner, the CI, and the second eye.

When the Lead hands a change back to an executor or up to the human, it's briefed
like a [**NITS**](https://skybrary.aero/articles/nits-briefing) call — **N**ature,
**I**ntentions, **T**ime, **S**pecial instructions — so the receiver has what
they need in one pass.

## The honest part

The panel is not a vote and not consensus. It exists so that the *human* — or the
Lead standing in for one — decides with more of the failure modes surfaced.
Multi-model is blind-spot coverage, not democracy: three models agreeing on a
wrong answer is still a wrong answer, which is why the human stays pilot-in-command.

---

*Part of [flightdeck](../README.md). Corrections welcome.*
