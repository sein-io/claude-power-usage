# Privacy Policy for Claude Power Usage

Claude Power Usage was built from the ground up with strict privacy and security in mind. As a tool that interacts with your AI conversations, we believe you have the right to know exactly how your data is handled.

## Core Privacy Principles

1. **Zero external servers:** We do not operate any backend servers, databases, or analytics endpoints.
2. **No telemetry:** We do not track how you use the extension, which buttons you click, or how often you use Claude.
3. **No API keys:** The extension uses your active, authenticated session with claude.ai. We never ask for, require, or store Anthropic API keys.

## Zero data collection

The extension operates entirely locally within your browser. All data processing happens on your device. We do not collect, transmit, or sell your personal information, your conversation history, or your usage metrics to anyone.

## Local Chat History (v1.10+, Optional Feature)

Starting with v1.10, Claude Power Usage offers an **optional** feature to locally store your Claude conversations for export purposes. This feature is **disabled by default** and must be explicitly enabled by the user.

### What is stored
When enabled, the extension saves the following data in your browser's local storage (`chrome.storage.local`):
- Conversation title, ID, and model used
- User messages and Claude's responses (text only)
- Timestamps, token counts, and estimated costs
- Project association (if applicable)

### What is NOT stored
- Images, PDF content, or other binary attachments (only placeholders like `[Attachment: Image]` are retained)
- System prompts or internal metadata
- Any authentication tokens or session cookies
- Claude's internal reasoning ("thinking") blocks, if present

### Storage limits & rotation
- A maximum of the 50 most recent conversations are retained
- When approaching the browser's 10 MB storage quota, the least recently updated conversation is automatically removed (LRU eviction)
- All data remains **exclusively on your device** and is never transmitted to any external server

### Your control
- **Opt-in required**: Disabled by default. Enable via Settings → "Local Chat History"
- **Purge anytime**: Settings → "Purge All" removes all stored chats immediately
- **Automatic purge on disable**: Turning the feature off immediately deletes all previously stored conversations
- **Uninstalling the extension** removes all stored data along with it

### Export formats
Stored conversations can be exported as:
- **Markdown** (`.md`) — Human-readable, formatted with code blocks preserved
- **JSON** — Structured format using our schema version 1 (`v: 1`)

Exports are generated locally in your browser. No data leaves your device during the export process.

## Permissions Explained

To function, Claude Power Usage requires specific permissions in the `manifest.json`. Here is exactly why each is needed:

- `"activeTab"` and `"https://claude.ai/*"`: Required to intercept network requests locally in your browser to calculate token usage and capture code blocks. The extension only runs on claude.ai.
- `"sidePanel"`: Required to display the main dashboard interface.
- `"storage"`: Required to save your settings (like dark/light mode preference) and local analytics history on your device.
- `"unlimitedStorage"`: Used exclusively for the optional, user-enabled local chat history feature to prevent quota crashes. All data remains strictly on-device.
- `"alarms"`: Required for the background service worker to periodically fetch the official usage data from Claude's internal API without keeping the extension awake constantly.
- `"notifications"`: Used solely to alert you locally when you hit a rate limit or when your limits reset.
- `"contextMenus"`: Required to provide the right-click quick actions.

## Third-Party Services

This extension does not integrate any third-party SDKs, analytics scripts (like Google Analytics), or tracking pixels.

## Contact

If you have any questions or concerns regarding this privacy policy, please open an issue in the official GitHub repository.

---

**Change log:**
- 2026-04-11: Added "Local Chat History" section for v1.10 opt-in feature
- 2025-11-14: Initial privacy policy drafted