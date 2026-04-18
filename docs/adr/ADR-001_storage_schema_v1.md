# ADR-001: Chat History Storage Schema v:1

**Status:** Accepted  
**Date:** 2026-04-18
**Author:** sein
**Supersedes:** none  
**Related:** v1.0.0 Chat Exporter, v2.0 Scheduler Queue (planned)

---

## Context

CPU v1.0.0 introduces local persistence of Claude conversations for export
(Markdown / JSON). The same storage layer will be consumed by the v2.0
Scheduler, which needs persistent conversation context for its prompt queue.

A shared, versioned schema is required to prevent silent data corruption
during future migrations and to decouple feature development from storage
internals.

## Decision

Chat history is stored in `chrome.storage.local` under keys following the
pattern `chat_history:{conversation_id}`. Each record conforms to schema `v: 1`.

### Top-level record

| Field     | Type             | Description                                                       |
|-----------|------------------|-------------------------------------------------------------------|
| `v`       | number           | Schema version (currently `1`) — migration anchor                 |
| `id`      | string           | Conversation UUID from claude.ai                                  |
| `name`    | string           | Conversation title (mutable, updated on rename)                   |
| `projId`  | string \| null   | Project UUID if conversation belongs to a project                 |
| `model`   | string           | Model identifier of the most recent turn                          |
| `created` | number           | Unix timestamp (ms) of first message                              |
| `updated` | number           | Unix timestamp (ms) of last write — used for LRU                  |
| `msgs`    | Array            | Message array (see below)                                         |
| `meta`    | Object           | Aggregated stats: `inputTokens`, `outputTokens`, `costUsd`        |

### Message sub-schema
```json
{
    "r": "u" | "a",           // role: user or assistant
    "t": "string",            // text content
    "ts": 1744372800000,      // unix ms
    "m": "string",            // model (assistant only, if mid-chat switch)
    "truncated": true         // present only if stream was interrupted
}