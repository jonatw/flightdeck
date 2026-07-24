# Agentic IaC

An agent writes the cloud infrastructure; a human ships it. The AWS setup this
fleet runs on is, itself, largely managed by one of the agents — it writes
[CDK](https://docs.aws.amazon.com/cdk/v2/guide/home.html), opens pull requests,
and after review a human merges. Merge is deploy. Here's how that works without
handing a model the keys to the account.

## The shape

A CDK app (Python): **one stack per agent lane** — plus shared stacks for the
control plane, events, security, and data. It wasn't built greenfield. The entry
point says it plainly: *new resources land here first; existing hand-built
resources get adopted over time.* This is infrastructure that grew into code, not
code that started clean.

## Who writes it, who ships it

- **The agent proposes.** A coding agent scoped to the infra lane authors real
  CDK pull requests — new stacks, IAM tweaks, Lambda fixes. Not toy changes; the
  merged history is full of them.
- **A human disposes.** Because merge *is* deploy, merging is a person's job:
  anything that changes AWS is treated as irreversible-until-proven and gated on
  a human review. The agent never runs `cdk deploy`; it only opens a PR.
- **Branch protection makes "propose" and "deploy" physically separate.** The
  agent can push a branch and open a PR; it cannot merge to the branch that
  deploys. The gap between the two is the whole safety model.

It's the same principle as [the control bridge](control-bridge.md), one level up:
the agent gets to *ask*, never to *act* directly on the cloud. Be honest about
what that means: **the human merge is the only hard gate.** An agent that writes
CDK and IAM is not holding a small privilege — the moment a reviewer waves a PR
through, that PR's intent becomes real infrastructure. The safety lives in branch
protection, review, and the deploy role's own policy, not in the agent being
well-behaved.

## The roles the agent writes (least privilege)

- Every executor's task role is scoped to the bone — the phrase that recurs in
  the code is *minimal task role, no PAT*. A lane gets exactly what it needs and
  nothing else; no broad GitHub token rides along.
- The scoping goes finer than per-service. One control role can write to a
  specific storage prefix but is *deliberately denied* a sibling prefix reserved
  for a human-only setting. Least privilege drawn per-path, not just per-resource.
- Producers authenticate with **GitHub OIDC roles**, not static access keys —
  each pinned by its trust policy to one repo and branch (the `sub` claim; a
  wildcard there would let *any* workflow assume the role). Real secrets live in
  **SSM Parameter Store** as SecureString and never appear in a public repo's CI. Static long-lived keys are the exception, not the norm,
  and when one exists it's scoped narrowly enough that a leak's blast radius is
  small — small, not zero, and only as small as the policy behind it is correct.

## The scars — what bites when an agent drives CDK

**Adopt, don't recreate.** Most of this started as hand-built resources. You
don't tear them out; you use `cdk import` so CDK adopts the *existing* physical
resource — same ARN, same endpoint, zero
downtime. Greenfield would mean an outage and a new ARN; adoption means the code
catches up to reality quietly.

**An imported role is read-only, and adding a policy to it silently does nothing.**
Import a role as immutable and CDK won't generate a policy resource for it — the
"add this permission" calls become *a permission inventory, not a deployment*
(the code says exactly that). No error is raised — CDK just quietly drops them —
so a green merge does **not** mean the IAM change took effect; the actual grant
has to be made by hand. This is the kind of thing
that costs an afternoon the first time, because everything *looks* deployed. (If
you genuinely need to grant an imported role, the move that actually works is to
push the permission onto the *resource's* own policy — a bucket policy, say —
rather than the role's.)

**Renaming a scheduled rule is a replacement, not an update.** Change an
EventBridge rule's name and CloudFormation deletes the old one and creates a new
one — a few seconds with no rule at all. Harmless for a once-a-minute reconcile;
worth knowing before you rename something that can't blink.

**An agent proposing changes to its own home is the sharpest edge.** Nothing
stops the infra agent from opening a PR against the very stack that runs it — its
own service was itself brought under CDK as a zero-diff import. It can *propose*
that change; what it can't do is *merge* it. This is exactly where a rubber-stamp
review is most dangerous, and exactly why the human authorization gate is the
whole game.

## Why let an agent near IaC at all

Because the discipline that makes it safe is discipline you want regardless:
propose-by-PR, reviewed, human-merges-to-deploy, least-privilege roles, secrets
in a parameter store. Under the current repo, CI, and deploy path there's no
known fast lane — the agent goes through the same gate a human PR does, and the
gate is where the safety is. What you gain is infra drafted at machine speed and
shipped at human judgement.

**An agent can author infrastructure; a human authorizes it. If that
authorization ever becomes a rubber stamp, the safety model collapses.**

---

*Part of [flightdeck](../README.md). Corrections welcome.*
