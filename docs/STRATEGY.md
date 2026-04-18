# STRATEGY — Claude Power Usage (CPU)

## 1. THE VISION & NAMING
**"Claude Power Usage" (CPU)** — Perfektes Akronym. CPU ist universell als "Central Processing Unit" bekannt. Die Assoziation mit Computer-Hardware verstärkt den technischen, präzisen Charakter der Extension. Das Branding funktioniert auf allen Ebenen:
- **Chrome Web Store**: Klar, professionell, sofort verständlich
- **SEO**: "Claude Power Usage" ist ein starker Long-Tail-Suchbegriff
- **Code-Prefix**: `cpu-` ist kurz, eindeutig, kollidiert mit nichts

CPU entwickelt sich von einem passiven Beobachter (Tracker) zu einem aktiven Workflow-Begleiter (Productivity Suite), während es strikt die Nutzungsbedingungen und die Privatsphäre respektiert.

---

## 2. GITHUB: PUBLIC & OPEN SOURCE
Chrome Extensions sind Klartext. Der Source Code ist über `chrome-extension://ID/` ohnehin einsehbar. Private schützt nichts, verhindert aber Community-Building, SEO und Social Proof.
Die Konkurrenz ist Open Source (GPL-3.0). Ein geschlossenes Repo wäre ein Wettbewerbsnachteil.

---

## 3. WETTBEWERBSANALYSE & DIFFERENZIERUNG

| Extension | Nutzer | Stärken | Schwächen |
|-----------|--------|---------|-----------|
| lugia19 (Claude Usage Tracker) | 9,000 | Token-Tracking, API, Firefox | Firebase (Privacy-Risk), kein Dashboard |
| Jeddd (Track & Export) | 389 | Sidebar, Export | Wenig Features, kein Token-Tracking |
| Nyan Cat (Paul Kuo) | ~200 | Dual Pipeline, i18n | Nur Popup, kein Side Panel |

**Unsere Differenzierung (Der CPU-Vorteil):**
1. **Tachometer-Gauge UI** — visuell sofort verständlich (Tacho + Drehzahlmesser).
2. **Side Panel Dashboard** — Bento Grid + Liquid Glass Design.
3. **Zero Dependencies & Zero Servers** — kein Firebase, kein React, absolute Privatsphäre.
4. **Context Window Gauge** — warnt bei 180k vor Vergessensrisiko.
5. **Local Chat History** — Echter Markdown-Export aus lokalem In-Memory Cache, ohne API-Risiko.

---

## 4. RELEASE-ARCHITEKTUR & EPOCHS

### Epoch 1: The Tracker (v1.0 – v1.9) — [COMPLETED]
Goal: Provide real-time visibility into hidden quotas.
- Official API polling for 5h/Weekly limits.
- Real-time interception for Token/Cost estimation.
- 200k Context Window visualization.
- Dynamic Peak Hour detection.

### Epoch 2: The Vault (v1.10) — [COMPLETED]
Goal: Retention and Data Ownership. Breaking the vendor lock-in.
- Opt-in Local Chat History via `chrome.storage.local`.
- High-fidelity Markdown Export (preserving code blocks and artifacts).
- Resilient Schema (`v: 1`) with LRU Quota Watchdog (max 10MB/50 chats).

### Epoch 3: The Automator (v2.0) — [PLANNING / ToS CLEARANCE]
Goal: Workflow automation for heavy users.
*Status: Deferred pending thorough legal review of Anthropic's "automated interactions" policy.*
- Prompt Scheduler & Queue (add to queue when rate limited).
- Auto-Submit upon limit reset.
- *Risk Mitigation:* If fully automated submission violates ToS, v2.0 will pivot to a manual "1-Click Send" notification system.

---

## 5. USERSCRIPT-ANALYSE: WAS ÜBERNEHMEN WIR?

**Hohe Priorität (Eingebaut in v1.10):**
- **Chat Exporter** — Der Interceptor fängt `content_block_delta` ab. Speicherung in `chrome.storage.local`, Export als MD.
- **Conversation Navigator (TOC)** — Scannt Nachrichten und baut Überschriften-Links (Notion-Style).

**Mittlere Priorität (Für v1.10.x / QoL-Sprints):**
- **Wider Chat** — Simple CSS-Injection (`max-width: 90%`) via Toggle.
- **No Auto-Scroll** — Blockiert `scrollIntoView` während der Generierung.
- **Enter = Newline** — Tauscht Shift+Enter / Enter Logik.

**Niedrige Priorität / Out of Scope:**
- Session Key Manager (Sicherheitsrisiko)
- Multi-Model Sync (Anderes Produkt)
- Fork Conversation (Zu komplex lokal abbildbar)

---

## 6. MONETARISIERUNG

CPU ist aufgeteilt in ein Free- und ein künftiges Premium-Tier.

### Direkte Wege
| Modell | Machbarkeit |
|--------|-------------|
| CWS Bezahl-Extension | x Google hat Payments eingestellt |
| Freemium via License Key | o Möglich, aufwändig |
| Ko-fi / GitHub Sponsors | + Einfach, ~$20-50/Monat |
| Scheduler als Paid Upgrade | ++ Beste Option (v2.0+) |

### Indirekte Wege
| Strategie | Potenzial |
|-----------|-----------|
| Portfolio-Stück | +++ 10K+ Nutzer auf CV |
| Consulting | ++ "Ich habe die meistgenutzte Claude Extension gebaut" |
| Blog/Content Authority | + Dev.to, Medium → Traffic |

### Scheduler als Premium (v2.0 Konzept)