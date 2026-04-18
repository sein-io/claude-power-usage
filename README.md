# Claude Power Usage

**Real-time usage tracking, context window visualization, and rate limit intelligence for Claude.ai**

A Chrome Extension that gives Claude users complete visibility into their usage — session limits, weekly caps, context window consumption, model info, token costs, and peak hour awareness — all in a beautiful, non-intrusive interface.

---

## Why This Exists

Anthropic doesn't publish fixed usage quotas. Users are left guessing when they'll hit limits, how much context window remains, or what a conversation actually costs in tokens. Existing trackers are either too basic (just scraping the settings page) or too invasive (injecting heavy UI into claude.ai).

Claude Power Usage runs **two data pipelines simultaneously**:
1. **Official** — Polls Claude's internal usage API for authoritative session/weekly percentages
2. **Real-time** — Intercepts API traffic to estimate tokens, detect models, and track context window fill

The result: a tachometer-style gauge that shows your usage at a glance, with a full Side Panel dashboard for deep analytics.

---

## Features

### Core Tracking
- **5-Hour Session Gauge** — Live utilization percentage with countdown to reset
- **Weekly All-Models Gauge** — 7-day rolling cap with reset timestamp
- **Weekly Opus Gauge** — Separate Opus-specific weekly limit
- **Context Window Meter** — How much of the 200K token window this conversation uses
- **Peak Hour Indicator** — Warns when weekday peak hours (12:00–18:00 UTC / approx. 5am–11am PT) are active

### Privacy & Export (v1.10+)
- **Local Chat History** — Opt-in local storage of your conversations
- **Markdown Export** — Download chats as clean `.md` files with code blocks preserved
- **Zero Data Collection** — All data remains exclusively on your device

---

## Installation

1. Download the latest release `.zip`
2. Extract the folder
3. Open Chrome and navigate to `chrome://extensions/`
4. Enable **Developer mode** (top right)
5. Click **Load unpacked** and select the extracted folder
6. Navigate to `claude.ai` — the extension icon appears in the toolbar
7. Click the icon to open the Side Panel dashboard

---

## Privacy

- **Zero external servers** — No Firebase, no analytics, no telemetry
- **No data collection** — All usage data stays in `chrome.storage.local`
- **No API keys required** — Uses claude.ai's existing session cookies
- **Open source** — Full code review available
- **Minimal permissions** — Only what's strictly necessary

See [PRIVACY.md](./PRIVACY.md) for the full privacy policy.

---

## Roadmap

| Version | Milestone |
|---------|-----------|
| **0.7** | Core gauges, HUD, Side Panel, peak hours, context window safety |
| **0.9** | Local Chat History, Markdown Export, Privacy Opt-In |
| **1.0** | Fixing minor bugs, implementing SVG as standard for all symbols  |
| **2.0** | (Deferred pending ToS review) Claude Scheduler (queue + auto-submit) |

---

## Tech Stack

- Chrome MV3 (Manifest V3)
- Side Panel API
- Content Scripts (MAIN + ISOLATED world pattern)
- CSS Custom Properties (Dark/Light)
- Bento Grid 2.0 + Liquid Glass design system
- Zero external dependencies (no React, no build step)

---

## Contributing

1. Fork the repo
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## License

MIT License — see [LICENSE](./LICENSE) for details.