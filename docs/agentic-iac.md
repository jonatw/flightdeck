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
the agent gets to *ask*, never to *act* directly on the cloud.

## The roles the agent writes (least privilege)

- Every executor's task role is scoped to the bone — the phrase that recurs in
  the code is *minimal task role, no PAT*. A lane gets exactly what it needs and
  nothing else; no broad GitHub token rides along.
- The scoping goes finer than per-service. One control role can write to a
  specific storage prefix but is *deliberately denied* a sibling prefix reserved
  for a human-only setting. Least privilege drawn per-path, not just per-resource.
- Producers authenticate with **GitHub OIDC roles**, not static access keys;
  real secrets live in **SSM Parameter Store** as SecureString and never appear
  in a public repo's CI. Static long-lived keys are the exception, not the norm,
  and when one exists it's scoped so narrowly that a leak can only do one trivial
  thing.

## The scars — what bites when an agent drives CDK

**Adopt, don't recreate.** Most of this started as hand-built resources. You
don't tear them out; you use `cdk import` so CDK adopts the *existing* physical
resource — same ARN, same endpoint, zero
downtime. Greenfield would mean an outage and a new ARN; adoption means the code
catches up to reality quietly.

**An imported role is read-only, and adding a policy to it silently does nothing.**
Import a role as immutable and CDK won't generate a policy resource for it — the
"add this permission" calls become *a permission inventory, not a deployment*
(the code says exactly that). So a green merge does **not** mean the IAM change
took effect; the actual grant has to be made by hand. This is the kind of thing
that costs an afternoon the first time, because everything *looks* deployed.

**Renaming a scheduled rule is a replacement, not an update.** Change an
EventBridge rule's name and CloudFormation deletes the old one and creates a new
one — a few seconds with no rule at all. Harmless for a once-a-minute reconcile;
worth knowing before you rename something that can't blink.

**An agent can't cleanly manage its own home.** The infra agent's *own* service
was itself brought under CDK as a zero-diff import — an agent editing the stack
that runs the agent is a reflexive edge you tread around deliberately, not a
thing you let it do casually.

## Why let an agent near IaC at all

Because the discipline that makes it safe is discipline you want regardless:
propose-by-PR, reviewed, human-merges-to-deploy, least-privilege roles, secrets
in a parameter store. The agent gets no fast lane — it goes through the same gate
a human PR does, and the gate is where the safety is. What you gain is infra
drafted at machine speed and shipped at human judgement.

---

*Part of [flightdeck](../README.md). Corrections welcome.*
