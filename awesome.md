# Awesome OpenAB [![Awesome](https://awesome.re/badge.svg)](https://awesome.re)

> A curated list of resources for [OpenAB](https://github.com/openabdev/openab) — a
> lightweight, secure, cloud-native Agent Client Protocol (ACP) harness that
> bridges chat platforms and any ACP-compatible coding CLI.

**Which OpenAB?** This list is about **`openabdev/openab`** (the Rust ACP harness).
Not to be confused with `xx025/openab` ("Open Agent Bridge"), an unrelated project
that shares the name.

## Contents

- [Official](#official)
- [Understanding OpenAB](#understanding-openab)
- [Deployment](#deployment)
- [Works with](#works-with)
- [Built with OpenAB](#built-with-openab)
- [Contributing](#contributing)

## Official

- [openabdev/openab](https://github.com/openabdev/openab) — the project itself. Rust, MIT-licensed.
- [Documentation & Helm chart](https://openabdev.github.io/openab/) — official docs and the Kubernetes Helm chart.
- [Community Discord](https://openab.dev/discord) — the project's chat.

## Understanding OpenAB

- [openab-map](https://github.com/shaun-agent/openab-map) — a living, agent-maintained "mental map" of OpenAB in five layers (concepts → architecture → how-to → decision trees → recent changes). It's kept in sync by a Claude agent that diffs OpenAB and opens PRs, reviewed by other agents running on OpenAB itself — a doc system that demonstrates the platform it describes. The friendliest way in if you'd rather not read Rust first.

## Deployment

- [Helm chart](https://openabdev.github.io/openab/) — deploy to Kubernetes.
- **AWS ECS** via the `oabctl` CLI, and **Amazon Bedrock AgentCore** runtime — covered in the [docs](https://openabdev.github.io/openab/).

## Works with

OpenAB is a pluggable ACP harness — swap the coding agent and the chat platform by configuration.

- **Agent backends** — Kiro CLI (default), Claude Code, Codex, Gemini, OpenCode, MiMo-Code, Kimi Code, Copilot CLI, Cursor, Hermes, Grok, Devin, Antigravity, Pi, and the native OpenAB Agent. See the [README](https://github.com/openabdev/openab) for the current matrix.
- **Chat platforms** — Discord and Slack directly; Telegram, LINE, Feishu/Lark, Google Chat, WeCom, and Microsoft Teams via gateway adapters.

## Built with OpenAB

- [flightdeck](https://github.com/jonatw/flightdeck) — field notes on running a fleet of AI coding agents on OpenAB (and the home of this list).
- *Building something on OpenAB? Open a PR and add it here.*

## Contributing

Add a resource with a pull request — one line: what it is, and why it's worth someone's time. Missing yours? That's a PR, not an argument.

Format follows the [awesome](https://awesome.re) conventions, with a nod to [awesome-opencode](https://github.com/awesome-opencode/awesome-opencode) for the shape.
