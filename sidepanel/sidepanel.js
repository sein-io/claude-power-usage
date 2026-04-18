var I18N = {
    en: {
        session_5h: '5h Session', weekly_all: 'Weekly All', weekly_opus: 'Weekly Opus', ctx_window: 'Context Window',
        session_cost: 'Session Cost', conversation: 'Conversation', messages: 'Messages', last_msg: 'Last Msg $',
        peak_active: 'Peak Hours \u2014 limits burn faster', rate_limit: 'Rate Limit Hit',
        assets_title: 'Code Blocks & Artifacts', assets_desc: 'Automatically captured from Claude responses.',
        no_assets: 'No assets captured yet. Start a conversation and code blocks will appear here.',
        usage_trend: 'Usage Trend (7d)', rl_hits: 'Rate Limits', avg_cooldown: 'Avg Cooldown',
        total_tokens: 'Total Tokens', total_cost: 'Total Cost', history: 'History',
        prompt_history: 'Prompt History', no_data: 'No data yet. Snapshots are recorded every 5 minutes.',
        no_prompts: 'No prompts recorded yet.', show_hud: 'Floating HUD', gauge_mode: 'Style', mini_mode: 'Mini HUD',
        reset_pos: 'Reset HUD', appearance: 'Appearance', theme: 'Theme', language: 'Language',
        refresh_title: 'Refresh', adaptive: 'Adaptive refresh', base_interval: 'Base interval',
        notifications: 'Notifications', notify_limit: 'Notify on approaching limit', notify_reset: 'Notify on reset',
        threshold: 'Threshold', clear: 'Clear', copy: 'Copy', delete_asset: 'Delete',
        ctx_warn_label: '180k+ Forgetting Risk', ctx_warn_title: '>180k Risk', waiting_prompt: 'Waiting for prompt...'
    },
    de: {
        session_5h: '5h Session', weekly_all: 'Weekly All', weekly_opus: 'Weekly Opus', ctx_window: 'Context Window',
        session_cost: 'Session Cost', conversation: 'Conversation', messages: 'Messages', last_msg: 'Last Msg $',
        peak_active: 'Peak Hours \u2014 Limits schneller verbraucht', rate_limit: 'Rate Limit erreicht',
        assets_title: 'Code Blocks & Artifacts', assets_desc: 'Automatisch aus Claude-Antworten erfasst.',
        no_assets: 'Noch keine Assets erfasst. Starte eine Unterhaltung und Code-Bl\u00f6cke erscheinen hier.',
        usage_trend: 'Nutzungsverlauf (7T)', rl_hits: 'Rate Limits', avg_cooldown: '\u00d8 Abk\u00fchlung',
        total_tokens: 'Gesamt Tokens', total_cost: 'Gesamtkosten', history: 'Verlauf',
        prompt_history: 'Prompt-Verlauf', no_data: 'Noch keine Daten. Snapshots werden alle 5 Minuten aufgezeichnet.',
        no_prompts: 'Noch keine Prompts aufgezeichnet.', show_hud: 'Schwebendes HUD', gauge_mode: 'Stil', mini_mode: 'Mini-HUD',
        reset_pos: 'HUD zur\u00fccksetzen', appearance: 'Darstellung', theme: 'Erscheinungsbild', language: 'Sprache',
        refresh_title: 'Aktualisierung', adaptive: 'Adaptive Aktualisierung', base_interval: 'Basis-Intervall',
        notifications: 'Benachrichtigungen', notify_limit: 'Bei Limit-Ann\u00e4herung benachrichtigen', notify_reset: 'Bei Reset benachrichtigen',
        threshold: 'Schwellenwert', clear: 'L\u00f6schen', copy: 'Kopieren', delete_asset: 'L\u00f6schen',
        ctx_warn_label: '180k+ Vergessensrisiko', ctx_warn_title: '>180k Risiko', waiting_prompt: 'Warte auf Prompt...'
    },
    tr: {
        session_5h: '5s Session', weekly_all: 'Weekly All', weekly_opus: 'Weekly Opus', ctx_window: 'Context Window',
        session_cost: 'Session Cost', conversation: 'Conversation', messages: 'Messages', last_msg: 'Last Msg $',
        peak_active: 'Peak Hours \u2014 limitler daha h\u0131zl\u0131 t\u00fckenir', rate_limit: 'Rate Limit a\u015f\u0131ld\u0131',
        assets_title: 'Code Blocks & Artifacts', assets_desc: 'Claude yan\u0131tlar\u0131ndan otomatik olarak yakaland\u0131.',
        no_assets: 'Hen\u00fcz asset yakalanmad\u0131. Bir sohbet ba\u015flat\u0131n ve kod bloklar\u0131 burada g\u00f6r\u00fcnecek.',
        usage_trend: 'Kullan\u0131m Trendi (7g)', rl_hits: 'Rate Limits', avg_cooldown: 'Ort. Bekleme',
        total_tokens: 'Toplam Token', total_cost: 'Toplam Maliyet', history: 'Ge\u00e7mi\u015f',
        prompt_history: 'Prompt Ge\u00e7mi\u015fi', no_data: 'Hen\u00fcz veri yok. Anl\u0131k g\u00f6r\u00fcnt\u00fcler her 5 dakikada kaydedilir.',
        no_prompts: 'Hen\u00fcz prompt kaydedilmedi.', show_hud: 'Y\u00fczen HUD', gauge_mode: 'Stil', mini_mode: 'Mini HUD',
        reset_pos: 'HUD s\u0131f\u0131rla', appearance: 'G\u00f6r\u00fcn\u00fcm', theme: 'Tema', language: 'Dil',
        refresh_title: 'Yenileme', adaptive: 'Adaptif yenileme', base_interval: 'Temel aral\u0131k',
        notifications: 'Bildirimler', notify_limit: 'Limite yakla\u015f\u0131rken bildir', notify_reset: 'S\u0131f\u0131rlamada bildir',
        threshold: 'E\u015fik', clear: 'Temizle', copy: 'Kopyala', delete_asset: 'Sil',
        ctx_warn_label: '180k+ Unutma Riski', ctx_warn_title: '>180k Risk', waiting_prompt: '\u0130stem bekleniyor...'
    }
};
var lang = 'en';
var st = { theme: 'dark', themeMode: 'system', session: { percent: 0, resetsAt: null }, weekly: { percent: 0, resetsAt: null }, opus: { percent: 0, resetsAt: null }, model: { id: null, label: '-' }, conv: { id: null, name: '', projId: null, msgCount: 0 }, tokens: { i: 0, o: 0, total: 0, ctx: 0 }, cost: { session: 0, last: 0 }, rl: false, msgs: 0 };

const CPUExporter = {
    generateMarkdown: function(chat) {
        if (!chat || chat.v !== 1) {
            throw new Error('CPUExporter: Unsupported schema version or invalid chat object. Expected v: 1');
        }
        let md = [];
        md.push('# ' + (chat.name || 'Untitled Conversation') + '\n');
        md.push('**Model:** ' + (chat.model || 'Unknown'));
        md.push('**Created:** ' + new Date(chat.created).toISOString());
        md.push('**Messages:** ' + (chat.msgs ? chat.msgs.length : 0));
        let inTok = chat.meta && chat.meta.inputTokens ? chat.meta.inputTokens.toLocaleString('en-US') : '0';
        let outTok = chat.meta && chat.meta.outputTokens ? chat.meta.outputTokens.toLocaleString('en-US') : '0';
        md.push('**Tokens:** ' + inTok + ' in / ' + outTok + ' out');
        let cost = chat.meta && chat.meta.costUsd ? chat.meta.costUsd.toFixed(4) : '0.0000';
        md.push('**Cost:** $' + cost);
        md.push('**Project:** ' + (chat.projId || '\u2014') + '\n');
        md.push('---\n');
        if (!chat.msgs || !Array.isArray(chat.msgs)) return md.join('\n');
        const ticks3 = '\u0060\u0060\u0060';
        const ticks4 = '\u0060\u0060\u0060\u0060';
        chat.msgs.forEach(function(m) {
            if (!m.t || m.t.trim() === '') return;
            let content = m.t;
            const thinkRegex = new RegExp("<" + "thinking>[\\s\\S]*?<\\/" + "thinking>", "gi");
            content = content.replace(thinkRegex, '').trim();
            if (!content) return;
            const imgRegex = new RegExp("<" + "image>[\\s\\S]*?<\\/" + "image>", "gi");
            content = content.replace(imgRegex, '[Attachment: Image]');
            const attRegex = new RegExp("<" + "attachment\\s+name=\"([^\"]+)\"[\\s\\S]*?<\\/" + "attachment>", "gi");
            content = content.replace(attRegex, '[Attachment: $1]');
            const artifactRegex = new RegExp("<" + "antArtifact([^>]*)>([\\s\\S]*?)<\\/" + "antArtifact>", "gi");
            content = content.replace(artifactRegex, function(match, attrs, code) {
                let titleMatch = attrs.match(/title="([^"]*)"/i);
                let langMatch = attrs.match(/language="([^"]*)"/i);
                let title = titleMatch ? titleMatch[1] : 'Artifact';
                let langTag = langMatch ? langMatch[1] : 'text';
                let backticks = code.includes(ticks3) ? ticks4 : ticks3;
                return '\n\n' + backticks + langTag + '\n' + code.trim() + '\n' + backticks + '\n';
            });
            if (m.r === 'u') {
                md.push('## User\n\n' + content + '\n');
            } else if (m.r === 'a') {
                md.push('## Claude\n\n' + content + '\n');
            }
            if (m.truncated) {
                md.push('\n*[\u26A0 Stream interrupted]*\n');
            }
        });
        md.push('---');
        return md.join('\n');
    },
    getSlugifiedFilename: function(chatName, timestamp) {
        if (!chatName) return 'claude-chat-' + timestamp + '.md';
        let slug = chatName.toLowerCase().replace(/[^a-z0-9-]/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '').substring(0, 50);
        let dateObj = new Date(timestamp);
        let ymd = dateObj.getFullYear().toString() + (dateObj.getMonth() + 1).toString().padStart(2, '0') + dateObj.getDate().toString().padStart(2, '0');
        return slug ? 'claude-' + slug + '-' + ymd + '.md' : 'claude-chat-' + ymd + '.md';
    },
    exportAsBlob: function(chat) {
        let mdText = this.generateMarkdown(chat);
        const BOM = '\uFEFF'; 
        return new Blob([BOM + mdText], { type: 'text/markdown;charset=utf-8' });
    }
};

function $(s) { return document.querySelector(s); }
function $$(s) { return document.querySelectorAll(s); }
function t(k) { return (I18N[lang] || I18N.en)[k] || (I18N.en[k] || k); }
function applyI18n() { $$('[data-t]').forEach(function(el) { var k = el.getAttribute('data-t'); var v = t(k); if (v && v !== k) el.textContent = v; }); }

function fmtReset(ra) {
    if (!ra) return '-';
    var d = new Date(ra), rem = d.getTime() - Date.now();
    if (rem <= 0) return 'now';
    var h = Math.floor(rem / 3600000), m = Math.floor((rem % 3600000) / 60000);
    var time = d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    if (h >= 24) { var dd = Math.floor(h / 24); return time + ' (' + dd + 'd ' + (h % 24) + 'h ' + m + 'm)'; }
    return time + ' (' + (h > 0 ? h + 'h ' : '') + m + 'm)';
}

function fmtTok(n) { n = Number(n) || 0; return n >= 1e6 ? (n / 1e6).toFixed(1) + 'M' : n >= 1e3 ? (n / 1e3).toFixed(1) + 'K' : String(n); }
function gcl(p) { return p >= 80 ? 'danger' : p >= 50 ? 'warn' : ''; }
function gco(p) { return p >= 80 ? '#ef4444' : p >= 50 ? '#f59e0b' : '#22c55e'; }
function esc(s) { var d = document.createElement('div'); d.textContent = s; return d.innerHTML; }

function resolveTheme() { if (st.themeMode === 'light') return 'light'; if (st.themeMode === 'dark') return 'dark'; return window.matchMedia('(prefers-color-scheme:dark)').matches ? 'dark' : 'light'; }

function updateThemeIcon() {
    var tb = $('#btn-theme');
    if (tb) {
        tb.textContent = st.themeMode === 'light' ? '\u2600' : (st.themeMode === 'dark' ? '\u263E' : '\u25D0');
        tb.title = st.themeMode === 'light' ? 'Light Mode' : (st.themeMode === 'dark' ? 'Dark Mode' : 'System Mode');
    }
}

function initTabs() {
    $$('.tab').forEach(function(tb) { 
        tb.addEventListener('click', function() {
            $$('.tab').forEach(function(x) { x.classList.remove('active'); }); 
            $$('.tp').forEach(function(x) { x.classList.remove('active'); });
            tb.classList.add('active'); 
            $('#tab-' + tb.dataset.tab).classList.add('active');
            if (tb.dataset.tab === 'analytics') { loadAnalytics(); renderHistoryTab(); }
            if (tb.dataset.tab === 'assets') { loadAssets(); }
        }); 
    });
}

function initTheme() {
    chrome.storage.local.get(['themeMode', 'language'], function(r) {
        st.themeMode = r.themeMode || 'system'; st.theme = resolveTheme();
        document.body.setAttribute('data-theme', st.theme);
        var sel = $('#s-theme'); if (sel) sel.value = st.themeMode;
        if (r.language) { lang = r.language; var ls = $('#s-lang'); if (ls) ls.value = lang; }
        applyI18n();
        updateThemeIcon();
    });
    $('#btn-theme').addEventListener('click', function() {
        var modes = ['light', 'dark', 'system'], i = modes.indexOf(st.themeMode);
        st.themeMode = modes[(i + 1) % 3]; st.theme = resolveTheme();
        document.body.setAttribute('data-theme', st.theme);
        chrome.storage.local.set({ themeMode: st.themeMode });
        chrome.runtime.sendMessage({ type: 'THEME_CHANGED', theme: st.theme, themeMode: st.themeMode });
        var sel = $('#s-theme'); if (sel) sel.value = st.themeMode;
        updateThemeIcon();
    });
    window.matchMedia('(prefers-color-scheme:dark)').addEventListener('change', function() { if (st.themeMode === 'system') { st.theme = resolveTheme(); document.body.setAttribute('data-theme', st.theme); updateThemeIcon(); } });
}

function updateFooter() {
    var te = $('#ft-time'); if (te) te.textContent = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    chrome.runtime.sendMessage({ type: 'GET_TAB_INFO' }, function(i) { if (i && i.url) { try { $('#ft-url').textContent = new URL(i.url).hostname; } catch (e) {} } });
}

function setGauge(fi, pi, ri, pct, ra) {
    pct = Number(pct) || 0;
    var f = $(fi), p = $(pi), r = ri ? $(ri) : null;
    if (f) { f.style.width = Math.min(pct, 100) + '%'; f.className = 'gf' + (gcl(pct) ? ' ' + gcl(pct) : ''); if (fi.includes('cf')) f.classList.add('gf-ctx'); }
    if (p) { p.textContent = Math.round(pct) + '%'; p.style.color = gco(pct); }
    if (r) r.textContent = fmtReset(ra);
}

function drawMainGauge(cv, sp, wp) {
    var ctx = cv.getContext('2d'), w = cv.width, h = cv.height, cx = w / 2, cy = h - 12;
    var r = Math.min(w / 2, h) - 26, rI = r - 12, sa = Math.PI, li = st.theme === 'light';
    ctx.clearRect(0, 0, w, h);
    ctx.beginPath(); ctx.arc(cx, cy, r, sa, 2 * Math.PI); ctx.strokeStyle = li ? 'rgba(0,0,0,.04)' : 'rgba(255,255,255,.04)'; ctx.lineWidth = 14; ctx.lineCap = 'round'; ctx.stroke();
    ctx.beginPath(); ctx.arc(cx, cy, rI, sa, 2 * Math.PI); ctx.strokeStyle = li ? 'rgba(0,0,0,.03)' : 'rgba(255,255,255,.03)'; ctx.lineWidth = 8; ctx.lineCap = 'round'; ctx.stroke();
    for (var i = 0; i <= 10; i++) { 
        var a = sa + Math.PI * i / 10; 
        ctx.beginPath(); ctx.moveTo(cx + (r - 12) * Math.cos(a), cy + (r - 12) * Math.sin(a)); 
        ctx.lineTo(cx + (r + 12) * Math.cos(a), cy + (r + 12) * Math.sin(a)); 
        ctx.strokeStyle = li ? 'rgba(0,0,0,.06)' : 'rgba(255,255,255,.06)'; 
        ctx.lineWidth = i % 5 === 0 ? 2 : 1; ctx.stroke(); 
        if (i % 5 === 0) { 
            ctx.font = '500 10px -apple-system,system-ui,sans-serif'; 
            ctx.fillStyle = li ? 'rgba(0,0,0,.2)' : 'rgba(255,255,255,.2)'; 
            ctx.textAlign = 'center'; 
            var lr = r + 18; 
            ctx.fillText(i * 10, cx + lr * Math.cos(a), cy + lr * Math.sin(a) + 3); 
        } 
    }
    var g = ctx.createConicGradient(Math.PI, cx, cy); g.addColorStop(0, '#22c55e'); g.addColorStop(.4, '#f59e0b'); g.addColorStop(.7, '#ef4444'); g.addColorStop(1, '#dc2626');
    ctx.beginPath(); ctx.arc(cx, cy, r, sa, sa + Math.PI * Math.min(sp, 100) / 100); ctx.strokeStyle = g; ctx.lineWidth = 14; ctx.lineCap = 'round'; ctx.stroke();
    ctx.beginPath(); ctx.arc(cx, cy, rI, sa, sa + Math.PI * Math.min(wp, 100) / 100); ctx.strokeStyle = gco(wp); ctx.lineWidth = 8; ctx.lineCap = 'round'; ctx.stroke();
    ctx.font = '700 28px -apple-system,system-ui,sans-serif'; ctx.fillStyle = gco(sp); ctx.textAlign = 'center'; ctx.fillText(Math.round(sp) + '%', cx, cy - 30);
    ctx.font = '600 11px -apple-system,system-ui,sans-serif'; ctx.fillStyle = gco(wp); ctx.fillText(Math.round(wp) + '%', cx, cy - 16);
    ctx.font = '500 8px -apple-system,system-ui,sans-serif'; ctx.fillStyle = li ? 'rgba(0,0,0,.25)' : 'rgba(255,255,255,.25)'; ctx.fillText('SESSION \u00b7 WEEKLY', cx, cy - 4);
    var needlePct = Math.max(sp, wp);
    var na = sa + Math.PI * Math.min(needlePct, 100) / 100, nl = r - 8;
    ctx.beginPath(); ctx.moveTo(cx, cy); ctx.lineTo(cx + nl * Math.cos(na), cy + nl * Math.sin(na)); ctx.strokeStyle = li ? '#1d1d1f' : '#e8eaed'; ctx.lineWidth = 2.5; ctx.lineCap = 'round'; ctx.stroke();
    ctx.beginPath(); ctx.arc(cx, cy, 5, 0, 2 * Math.PI); ctx.fillStyle = '#6366f1'; ctx.fill();
    ctx.beginPath(); ctx.arc(cx, cy, 3, 0, 2 * Math.PI); ctx.fillStyle = '#818cf8'; ctx.fill();
}

function updateDash() {
    var sp = Number(st.session.percent) || 0;
    var wp = Number(st.weekly.percent) || 0;
    var op = Number(st.opus.percent) || 0;
    var mc = $('#main-cv'); 
    if (mc) { 
        drawMainGauge(mc, sp, wp); 
        mc.title = t('session_5h') + ': ' + Math.round(sp) + '%\n' + t('weekly_all') + ': ' + Math.round(wp) + '%';
    }
    setGauge('#sp-sf', '#sp-sp', '#sp-sr', sp, st.session.resetsAt);
    setGauge('#sp-wf', '#sp-wp', '#sp-wr', wp, st.weekly.resetsAt);
    setGauge('#sp-of', '#sp-op', '#sp-or', op, st.opus.resetsAt);
    var CTX_WARN_TOKENS = 180000;
    var hasData = (Number(st.tokens.i) > 0) || (Number(st.msgs) > 0);
    var nil = '<span class="ghost">-</span>';
    var wait = '<span class="ghost-wait">' + t('waiting_prompt') + '</span>';
    var ctxTokens = Number(st.tokens.ctx) || 0;
    var cP = Math.round(ctxTokens / 200000 * 100); 
    setGauge('#sp-cf', '#sp-cp', null, cP, null);
    var ct = $('#sp-ct'); if (ct) ct.innerHTML = hasData ? fmtTok(ctxTokens) + ' / 200K' : nil;
    var cw = $('#ctx-warn'); if (cw) cw.style.display = (ctxTokens >= CTX_WARN_TOKENS) ? 'flex' : 'none';
    var m = $('#sp-mod'); if (m) m.innerHTML = hasData ? esc(st.model.label || '-') : nil;
    var c = $('#sp-cst'); if (c) c.innerHTML = hasData ? '$' + (Number(st.cost.session) || 0).toFixed(4) : nil;
    var lc = $('#sp-lc'); if (lc) lc.innerHTML = hasData ? '$' + (Number(st.cost.last) || 0).toFixed(4) : nil;
    var cn = $('#sp-chn'); if (cn) cn.innerHTML = hasData ? esc(st.conv.name || '') : wait;
    var ci = $('#sp-cid'); if (ci) ci.innerHTML = hasData ? esc(st.conv.id || '') : '';
    var cmInfo = $('#sp-chm'); 
    if (cmInfo) { 
        var p = []; 
        if (st.conv.projId) p.push('Project'); 
        if (st.conv.msgCount) p.push(st.conv.msgCount + ' msgs'); 
        cmInfo.textContent = hasData ? p.join(' \u00b7 ') : ''; 
    }
    var ti = $('#sp-ti'); if (ti) ti.innerHTML = hasData ? fmtTok(Number(st.tokens.i) || 0) : nil;
    var to = $('#sp-to'); if (to) to.innerHTML = hasData ? fmtTok(Number(st.tokens.o) || 0) : nil;
    var mc2 = $('#sp-mc'); if (mc2) mc2.innerHTML = hasData ? String(Number(st.msgs) || 0) : nil;
    var n = new Date(), uH = n.getUTCHours(), dy = n.getUTCDay(), pk = dy > 0 && dy < 6 && uH >= 12 && uH < 18;
    var pe = $('#c-peak'); if (pe) pe.style.display = pk ? '' : 'none';
    var rl = $('#c-rl'); if (rl) rl.style.display = st.rl ? '' : 'none';
}

function loadAssets() {
    chrome.runtime.sendMessage({ type: 'GET_ASSETS' }, function(assets) {
        var el = $('#c-assets'); if (!el) return;
        if (!assets || assets.length === 0) { el.innerHTML = '<div class="cs wrap">' + t('no_assets') + '</div>'; return; }
        el.innerHTML = '<div class="asset-list">' + assets.slice().reverse().map(function(a) {
            var time = new Date(a.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
            var date = new Date(a.timestamp).toLocaleDateString([], { day: '2-digit', month: '2-digit' });
            return '<div class="asset-item"><div class="asset-hdr"><span class="asset-label">' + esc(a.label || a.type) + '</span><span class="asset-lang">' + esc(a.language || a.type) + '</span></div><div class="asset-preview">' + esc((a.content || '').substring(0, 200)) + '</div><div class="asset-meta"><span>' + date + ' ' + time + '</span>' + (a.chatName ? '<span>' + esc(a.chatName.substring(0, 30)) + '</span>' : '') + '</div><div class="asset-acts"><button class="btn bs" onclick="cpuCopyAsset(' + a.timestamp + ')">' + t('copy') + '</button><button class="btn bg2" onclick="cpuDeleteAsset(' + a.timestamp + ')">' + t('delete_asset') + '</button></div></div>';
        }).join('') + '</div>';
    });
}

window.cpuCopyAsset = function(ts) {
    chrome.runtime.sendMessage({ type: 'GET_ASSETS' }, function(assets) {
        var a = (assets || []).find(function(x) { return x.timestamp === ts; });
        if (a && a.content) { navigator.clipboard.writeText(a.content).then(function() {}); }
    });
};

window.cpuDeleteAsset = function(ts) {
    chrome.runtime.sendMessage({ type: 'DELETE_ASSET', timestamp: ts }, function() { loadAssets(); });
};

function loadAnalytics() {
    chrome.runtime.sendMessage({ type: 'GET_USAGE_HISTORY' }, function(h) {
        h = h || [];
        var tt = $('#sp-ttk'), tc = $('#sp-tcs'), hi = $('#sp-hi');
        if (tt) tt.textContent = fmtTok((Number(st.tokens.i) || 0) + (Number(st.tokens.o) || 0));
        if (tc) tc.textContent = '$' + (Number(st.cost.session) || 0).toFixed(4);
        if (hi) hi.textContent = h.length > 0 ? h.length + ' data points \u00b7 ' + new Date(h[0].timestamp).toLocaleDateString() + ' \u2014 ' + new Date(h[h.length - 1].timestamp).toLocaleDateString() : t('no_data');
        drawTrend(h);
    });
    chrome.runtime.sendMessage({ type: 'GET_RATE_LIMIT_LOG' }, function(l) {
        l = l || []; var hits = l.filter(function(x) { return x.type === 'hit'; }), clears = l.filter(function(x) { return x.type === 'cleared'; });
        var rc = $('#sp-rlc'); if (rc) rc.textContent = String(hits.length);
        var durs = []; hits.forEach(function(h2) { var nc = clears.find(function(c) { return c.timestamp > h2.timestamp; }); if (nc) durs.push(nc.timestamp - h2.timestamp); });
        var ra = $('#sp-rla'); if (ra) ra.textContent = durs.length > 0 ? Math.round(durs.reduce(function(a, b) { return a + b; }, 0) / durs.length / 60000) + 'm' : '-';
    });
}

function drawTrend(h) {
    var cv = $('#trend-cv'); if (!cv) return;
    var ctx = cv.getContext('2d'), w = cv.width, hh = cv.height, li = st.theme === 'light';
    var pad = { t: 8, r: 8, b: 26, l: 30 }; 
    ctx.clearRect(0, 0, w, hh);
    var emptyEl = document.getElementById('trend-empty');
    var now = Date.now(), wk = now - 7 * 864e5;
    var rec = (h && h.length >= 1) ? h.filter(function(p) { return p.timestamp > wk; }) : [];
    if (!h || rec.length < 1) {
        cv.style.display = 'none';
        if (!emptyEl) { emptyEl = document.createElement('div'); emptyEl.id = 'trend-empty'; emptyEl.className = 'cs wrap'; emptyEl.style.padding = '20px 0'; emptyEl.style.textAlign = 'center'; cv.parentNode.appendChild(emptyEl); }
        emptyEl.textContent = t('no_data'); emptyEl.style.display = '';
        return;
    }
    cv.style.display = ''; if (emptyEl) emptyEl.style.display = 'none';
    var cW = w - pad.l - pad.r, cH = hh - pad.t - pad.b;
    ctx.strokeStyle = li ? 'rgba(0,0,0,.04)' : 'rgba(255,255,255,.04)'; ctx.lineWidth = 1;
    for (var i = 0; i <= 4; i++) { var y = pad.t + cH * i / 4; ctx.beginPath(); ctx.moveTo(pad.l, y); ctx.lineTo(w - pad.r, y); ctx.stroke(); ctx.font = '9px -apple-system,system-ui,sans-serif'; ctx.fillStyle = li ? 'rgba(0,0,0,.25)' : '#5c6370'; ctx.textAlign = 'right'; ctx.fillText(100 - i * 25, pad.l - 4, y + 3); }
    function dl(data, key, color) { ctx.beginPath(); ctx.strokeStyle = color; ctx.fillStyle = color; ctx.lineWidth = 2; ctx.lineJoin = 'round'; data.forEach(function(p, j) { var val = Number(p[key]) || 0; var x = pad.l + ((p.timestamp - wk) / (7 * 864e5)) * cW, y2 = pad.t + cH - val / 100 * cH; if (j === 0) ctx.moveTo(x, y2); else ctx.lineTo(x, y2); }); ctx.stroke(); if (data.length === 1) { var p0 = data[0], val0 = Number(p0[key]) || 0, x0 = pad.l + ((p0.timestamp - wk) / (7 * 864e5)) * cW, y0 = pad.t + cH - val0 / 100 * cH; ctx.beginPath(); ctx.arc(x0, y0, 3, 0, 2 * Math.PI); ctx.fill(); } }
    dl(rec, 'session', '#6366f1'); dl(rec, 'weekly', '#22c55e');
    for (var j = 0; j < 7; j++) { var x2 = pad.l + (j / 7) * cW; ctx.font = '9px -apple-system,system-ui,sans-serif'; ctx.fillStyle = li ? 'rgba(0,0,0,.25)' : '#5c6370'; ctx.textAlign = 'center'; ctx.fillText(new Date(wk + j * 864e5).toLocaleDateString('en', { weekday: 'short' }), x2, hh - 14); }
    ctx.font = '9px -apple-system,system-ui,sans-serif'; ctx.fillStyle = '#6366f1'; ctx.textAlign = 'left'; ctx.fillText('\u25CF Session', pad.l, hh - 2); ctx.fillStyle = '#22c55e'; ctx.fillText('\u25CF Weekly', pad.l + 65, hh - 2);
}

function updateStorageMeter() {
    var meter = $('#s-storage');
    if (!meter) return;
    chrome.storage.local.getBytesInUse(null, function(bytes) {
        chrome.storage.local.get(null, function(items) {
            var count = 0;
            for (var key in items) {
                if (key.startsWith('chat_history:') && items[key] && items[key].v === 1) {
                    count++;
                }
            }
            var mb = (bytes / (1024 * 1024)).toFixed(2);
            meter.textContent = mb + ' MB / 10 MB (' + count + ' chats)';
        });
    });
}

function purgeHistory(callback) {
    chrome.storage.local.get(null, function(items) {
        var keysToRemove = [];
        for (var key in items) {
            if (key.startsWith('chat_history:')) {
                keysToRemove.push(key);
            }
        }
        if (keysToRemove.length > 0) {
            chrome.storage.local.remove(keysToRemove, function() {
                if (callback) callback();
            });
        } else {
            if (callback) callback();
        }
    });
}

function renderHistoryTab() {
    chrome.storage.local.get(null, function(items) {
        var activeView = $('#hist-active');
        var optinView = $('#hist-optin');
        var listContainer = $('#sp-chat-list');
        if (!items.localHistoryEnabled) {
            if (activeView) activeView.style.display = 'none';
            if (optinView) optinView.style.display = 'block';
            return;
        }
        if (optinView) optinView.style.display = 'none';
        if (activeView) activeView.style.display = 'block';
        var chats = [];
        for (var key in items) {
            if (key.startsWith('chat_history:') && items[key] && items[key].v === 1) {
                chats.push(items[key]);
            }
        }
        chats.sort(function(a, b) { return b.updated - a.updated; });
        if (chats.length === 0) {
            if (listContainer) listContainer.innerHTML = '<div class="cs wrap">No chats stored yet. Start a conversation in Claude.</div>';
            return;
        }
        var html = '';
        chats.forEach(function(chat) {
            var date = new Date(chat.updated).toLocaleString([], { day: '2-digit', month: '2-digit', hour: '2-digit', minute:'2-digit' });
            var msgCount = chat.msgs ? chat.msgs.length : 0;
            html += '<div class="ph-item">' +
                '<div class="ph-preview" style="font-weight:600; margin-bottom:4px;">' + esc(chat.name || 'Untitled') + '</div>' +
                '<div class="ph-meta">' +
                    '<span class="ph-tag mod">' + esc(chat.model || '-') + '</span>' +
                    '<span>' + msgCount + ' msgs</span>' +
                    '<span>' + date + '</span>' +
                '</div>' +
                '<div style="margin-top:8px;">' +
                    '<button class="btn bs btn-export-chat" data-id="' + esc(chat.id) + '">Export MD</button>' +
                '</div>' +
            '</div>';
        });
        if (listContainer) {
            listContainer.innerHTML = html;
            listContainer.querySelectorAll('.btn-export-chat').forEach(function(btn) {
                btn.addEventListener('click', function() {
                    var chatId = btn.getAttribute('data-id');
                    chrome.storage.local.get('chat_history:' + chatId, function(res) {
                        var chatData = res['chat_history:' + chatId];
                        if (chatData) triggerMarkdownExport(chatData);
                    });
                });
            });
        }
    });
}

function triggerMarkdownExport(chat) {
    try {
        var blob = CPUExporter.exportAsBlob(chat);
        var url = URL.createObjectURL(blob);
        var a = document.createElement('a');
        a.style.display = 'none';
        a.href = url;
        a.download = CPUExporter.getSlugifiedFilename(chat.name, chat.created);
        document.body.appendChild(a);
        a.click();
        setTimeout(function() {
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
        }, 100);
    } catch (e) {}
}

function initSettings() {
    chrome.storage.local.get([
        'hudCollapsed', 'hudMode', 'miniGaugeMode', 'adaptiveRefresh', 
        'notifyOnLimit', 'notifyOnReset', 'notifyThreshold', 'themeMode', 
        'language', 'localHistoryEnabled'
    ], function(r) {
        var map = { 
            's-hud': { t: 'c', v: !r.hudCollapsed }, 
            's-mode': { t: 's', v: r.hudMode || 'analog' }, 
            's-mini': { t: 's', v: r.miniGaugeMode || 'dual' }, 
            's-adapt': { t: 'c', v: r.adaptiveRefresh !== false }, 
            's-nlim': { t: 'c', v: r.notifyOnLimit !== false }, 
            's-nrst': { t: 'c', v: r.notifyOnReset !== false }, 
            's-thr': { t: 's', v: String(r.notifyThreshold || 80) }, 
            's-theme': { t: 's', v: r.themeMode || 'system' }, 
            's-lang': { t: 's', v: r.language || 'en' },
            's-hist': { t: 'c', v: !!r.localHistoryEnabled }
        };
        Object.keys(map).forEach(function(id) { 
            var el = $('#' + id); 
            if (!el) return; 
            if (map[id].t === 'c') el.checked = map[id].v; 
            else el.value = map[id].v; 
        });
        updateStorageMeter();
    });
    function bind(id, fn) { var e = $('#' + id); if (e) e.addEventListener('change', fn); }
    bind('s-hud', function(e) { chrome.storage.local.set({ hudCollapsed: !e.target.checked }); chrome.runtime.sendMessage({ type: 'UPDATE_HUD_PREF', target: 'content', hudVisible: e.target.checked }); });
    bind('s-mode', function(e) { chrome.storage.local.set({ hudMode: e.target.value }); chrome.runtime.sendMessage({ type: 'UPDATE_HUD_PREF', target: 'content', hudMode: e.target.value }); });
    bind('s-mini', function(e) { chrome.storage.local.set({ miniGaugeMode: e.target.value }); chrome.runtime.sendMessage({ type: 'UPDATE_HUD_PREF', target: 'content', miniGaugeMode: e.target.value }); });
    bind('s-adapt', function(e) { chrome.runtime.sendMessage({ type: 'UPDATE_SETTINGS', settings: { adaptiveRefresh: e.target.checked } }); });
    bind('s-nlim', function(e) { chrome.storage.local.set({ notifyOnLimit: e.target.checked }); });
    bind('s-nrst', function(e) { chrome.storage.local.set({ notifyOnReset: e.target.checked }); });
    bind('s-thr', function(e) { chrome.storage.local.set({ notifyThreshold: parseInt(e.target.value) }); });
    bind('s-theme', function(e) { st.themeMode = e.target.value; st.theme = resolveTheme(); document.body.setAttribute('data-theme', st.theme); chrome.storage.local.set({ themeMode: st.themeMode }); chrome.runtime.sendMessage({ type: 'THEME_CHANGED', theme: st.theme, themeMode: st.themeMode }); updateThemeIcon(); });
    bind('s-lang', function(e) { lang = e.target.value; chrome.storage.local.set({ language: lang }); applyI18n(); });
    
    var DISABLE_CONFIRM = 'Disable chat history?\n\nThis will also delete all currently stored conversations. To keep your chats but stop saving new ones, there is no alternative \u2014 disabling always purges.\n\nContinue?';
    var PURGE_CONFIRM = 'Delete all locally stored chats?\n\nThis permanently removes all conversation history from your device. It cannot be undone.';

    bind('s-hist', function(e) { 
        var enabled = e.target.checked;
        var toggle = e.target;
        if (!enabled) {
            if (confirm(DISABLE_CONFIRM)) {
                chrome.storage.local.set({ localHistoryEnabled: false }, function() {
                    purgeHistory(function() {
                        updateStorageMeter();
                        document.dispatchEvent(new CustomEvent('CPU_HISTORY_PURGED'));
                    });
                });
            } else {
                toggle.checked = true;
                chrome.storage.local.get('localHistoryEnabled', function(r) {
                    toggle.checked = !!r.localHistoryEnabled;
                });
            }
        } else {
            chrome.storage.local.set({ localHistoryEnabled: true }, function() {
                document.dispatchEvent(new CustomEvent('CPU_HISTORY_ENABLED'));
            });
        }
    });

    var rp = $('#btn-rpos'); if (rp) rp.addEventListener('click', function() { chrome.storage.local.set({ hudPosition: null }); chrome.runtime.sendMessage({ type: 'UPDATE_HUD_PREF', target: 'content', resetPosition: true }); });
    
    var purgeBtn = $('#btn-purge-hist'); 
    if (purgeBtn) {
        purgeBtn.addEventListener('click', function() {
            if (confirm(PURGE_CONFIRM)) {
                purgeHistory(function() {
                    updateStorageMeter();
                    document.dispatchEvent(new CustomEvent('CPU_HISTORY_PURGED'));
                });
            }
        });
    }

    var btnEnableHist = $('#btn-enable-hist');
    if (btnEnableHist) {
        btnEnableHist.addEventListener('click', function() {
            chrome.storage.local.set({ localHistoryEnabled: true }, function() {
                var toggle = $('#s-hist');
                if (toggle) toggle.checked = true;
                document.dispatchEvent(new CustomEvent('CPU_HISTORY_ENABLED'));
            });
        });
    }

    var lnkSettings = $('#lnk-hist-settings');
    if (lnkSettings) {
        lnkSettings.addEventListener('click', function(e) {
            e.preventDefault();
            $$('.tab').forEach(function(x) { x.classList.remove('active'); });
            $$('.tp').forEach(function(x) { x.classList.remove('active'); });
            var tbSettings = document.querySelector('[data-tab="settings"]');
            if (tbSettings) tbSettings.classList.add('active');
            var panelSettings = $('#tab-settings');
            if (panelSettings) panelSettings.classList.add('active');
        });
    }
}

function initActions() {
    var rf = $('#btn-refresh'); if (rf) rf.addEventListener('click', function() { chrome.runtime.sendMessage({ type: 'FORCE_REFRESH' }); rf.style.opacity = '.5'; setTimeout(function() { rf.style.opacity = '1'; }, 2000); });
    var ex = $('#btn-export'); if (ex) ex.addEventListener('click', function() {
        chrome.runtime.sendMessage({ type: 'GET_USAGE_HISTORY' }, function(h) { chrome.runtime.sendMessage({ type: 'GET_RATE_LIMIT_LOG' }, function(l) { chrome.runtime.sendMessage({ type: 'GET_PROMPT_HISTORY' }, function(ph) { chrome.runtime.sendMessage({ type: 'GET_ASSETS' }, function(a) {
            var d = JSON.stringify({ usageHistory: h || [], rateLimitLog: l || [], promptHistory: ph || [], assets: (a || []).map(function(x) { return { timestamp: x.timestamp, type: x.type, language: x.language, label: x.label, chatName: x.chatName }; }), state: st, exported: new Date().toISOString() }, null, 2);
            var b = new Blob([d], { type: 'application/json' }); var u = URL.createObjectURL(b); var a2 = document.createElement('a'); a2.href = u; a2.download = 'cpu-export-' + Date.now() + '.json'; a2.click(); URL.revokeObjectURL(u);
        }); }); }); });
    });
    var ea = $('#btn-export-assets'); if (ea) ea.addEventListener('click', function() {
        chrome.runtime.sendMessage({ type: 'GET_ASSETS' }, function(assets) {
            if (!assets || assets.length === 0) return;
            var d = JSON.stringify(assets, null, 2);
            var b = new Blob([d], { type: 'application/json' }); var u = URL.createObjectURL(b); var a2 = document.createElement('a'); a2.href = u; a2.download = 'cpu-assets-' + Date.now() + '.json'; a2.click(); URL.revokeObjectURL(u);
        });
    });
    var cl = $('#btn-clear'); if (cl) cl.addEventListener('click', function() { if (confirm('Clear all history?')) chrome.runtime.sendMessage({ type: 'CLEAR_HISTORY' }, function() { loadAnalytics(); }); });
    var ca = $('#btn-clear-assets'); if (ca) ca.addEventListener('click', function() { if (confirm('Clear all assets?')) chrome.runtime.sendMessage({ type: 'CLEAR_ASSETS' }, function() { loadAssets(); }); });
}

function fetchState() { chrome.runtime.sendMessage({ type: 'GET_CONTENT_STATE' }, function(s) { if (s) { Object.assign(st, s); updateDash(); } }); }

chrome.runtime.onMessage.addListener(function(m) {
    if (m.type === 'CLOSE_PANEL') { window.close(); return; }
    if (m.type === 'STORAGE_UPDATED') { updateStorageMeter(); renderHistoryTab(); return; }
    if ((m.type === 'STATE_UPDATE' || m.type === 'USAGE_SCRAPED') && m.state) { Object.assign(st, m.state); updateDash(); }
    if (m.type === 'TAB_CHANGED' || m.type === 'PAGE_LOADED') { updateFooter(); fetchState(); }
    if (m.type === 'COUNTDOWN_TICK') { updateDash(); updateFooter(); }
    if (m.type === 'THEME_CHANGED') { 
        if (m.themeMode) st.themeMode = m.themeMode; 
        st.theme = m.theme || resolveTheme(); 
        document.body.setAttribute('data-theme', st.theme); 
        updateDash(); 
        updateThemeIcon(); 
    }
    if (m.type === 'ASSETS_UPDATED') { var activeTab = document.querySelector('.tab.active'); if (activeTab && activeTab.dataset.tab === 'assets') loadAssets(); }
});

document.addEventListener('DOMContentLoaded', function() {
    chrome.runtime.connect({ name: 'cpu-sidepanel' }); 
    initTabs(); initTheme(); initSettings(); initActions(); updateFooter(); fetchState();
    renderHistoryTab();
    setTimeout(function() { chrome.runtime.sendMessage({ type: 'FORCE_REFRESH' }); }, 1000);
});

document.addEventListener('CPU_HISTORY_ENABLED', renderHistoryTab);
document.addEventListener('CPU_HISTORY_PURGED', renderHistoryTab);