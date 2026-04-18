(function() {
'use strict';
if (window !== window.top) return;

var S = {
    session: { percent: 0, resetsAt: null },
    weekly: { percent: 0, resetsAt: null },
    opus: { percent: 0, resetsAt: null },
    model: { id: null, label: '-' },
    conv: { id: null, name: '', projId: null, msgCount: 0 },
    tokens: { i: 0, o: 0, total: 0, ctx: 0 },
    cost: { session: 0, last: 0 },
    rl: false, peak: false, visible: true, mode: 'analog', mini: 'dual',
    pos: null, theme: 'dark', themeMode: 'system', msgs: 0, tps: 0,
    promptPreview: '', lastUpdated: 0, panelOpen: false
};
var hud = null, tpsBuf = [];
var CTX_WARN_TOKENS = 180000;

function isPeak() { var n = new Date(), u = n.getUTCHours(), d = n.getUTCDay(); return d > 0 && d < 6 && u >= 12 && u < 18; }

function fmtReset(ra) {
    if (!ra) return '-';
    var rem = new Date(ra).getTime() - Date.now();
    if (rem <= 0) return '0:00';
    var h = Math.floor(rem / 3600000), m = Math.floor((rem % 3600000) / 60000);
    return h + ':' + (m < 10 ? '0' + m : m);
}
function fmtResetLong(ra) {
    if (!ra) return '-';
    var rem = new Date(ra).getTime() - Date.now();
    if (rem <= 0) return '0:00:00';
    var h = Math.floor(rem / 3600000), m = Math.floor((rem % 3600000) / 60000), s = Math.floor((rem % 60000) / 1000);
    return h + ':' + (m < 10 ? '0' + m : m) + ':' + (s < 10 ? '0' + s : s);
}

function gc(p) { return p >= 80 ? { f: 'cpu-fd', h: '#ef4444' } : p >= 50 ? { f: 'cpu-fw', h: '#f59e0b' } : { f: 'cpu-fo', h: '#22c55e' }; }

function resolveTheme() {
    if (S.themeMode === 'light') return 'light';
    if (S.themeMode === 'dark') return 'dark';
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

function injectStyles() {
    if (document.getElementById('cpu-styles')) return;
    var s = document.createElement('style'); s.id = 'cpu-styles';
    s.textContent = '#cpu-hud{position:fixed;z-index:2147483646;width:194px;border-radius:16px;font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",system-ui,sans-serif;cursor:default;user-select:none;overflow:visible;transition:opacity .2s,box-shadow .2s}#cpu-hud[data-theme=dark]{background:rgba(15,17,23,.92);border:1px solid rgba(99,102,241,.2);color:#e8eaed;box-shadow:0 8px 32px rgba(0,0,0,.4),inset 0 1px 0 rgba(255,255,255,.05);backdrop-filter:blur(20px) saturate(1.4);-webkit-backdrop-filter:blur(20px) saturate(1.4)}#cpu-hud[data-theme=light]{background:rgba(255,255,255,.88);border:1px solid rgba(99,102,241,.18);color:#1d1d1f;box-shadow:0 8px 32px rgba(0,0,0,.12),inset 0 1px 0 rgba(255,255,255,.5);backdrop-filter:blur(20px) saturate(1.2);-webkit-backdrop-filter:blur(20px) saturate(1.2)}#cpu-hud.cpu-col{width:56px;height:56px;border-radius:50%;overflow:hidden;cursor:pointer}#cpu-hud.cpu-col #cpu-body{display:none}#cpu-hud.cpu-col #cpu-mini{display:flex}#cpu-hud.cpu-drag{opacity:.8;cursor:grabbing!important;transition:none}#cpu-mini{display:none;width:100%;height:100%;align-items:center;justify-content:center;flex-direction:column;gap:1px}#cpu-mini canvas{display:block}#cpu-mini .cpu-mp{font-size:11px;font-weight:700;font-variant-numeric:tabular-nums;line-height:1}.cpu-ms{font-size:7px;opacity:.5;font-weight:600;line-height:1}#cpu-hdr{display:flex;align-items:center;justify-content:space-between;padding:7px 10px 5px;cursor:grab}[data-theme=dark] #cpu-hdr{border-bottom:1px solid rgba(255,255,255,.06)}[data-theme=light] #cpu-hdr{border-bottom:1px solid rgba(0,0,0,.06)}#cpu-ht{font-size:9px;font-weight:700;text-transform:uppercase;letter-spacing:.08em;color:rgba(99,102,241,.9)}#cpu-hv{font-size:8px;opacity:.35;font-weight:600}#cpu-acts{display:flex;gap:1px}#cpu-acts button{background:none;border:none;cursor:pointer;border-radius:4px;opacity:.45;transition:all .15s;display:flex;align-items:center;justify-content:center}[data-theme=dark] #cpu-acts button{color:#e8eaed}[data-theme=light] #cpu-acts button{color:#1d1d1f}#cpu-acts button:hover{opacity:1;background:rgba(99,102,241,.12);color:#818cf8}.cpu-hud-btn{font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",system-ui,sans-serif;font-size:13px;font-weight:500;line-height:1;width:22px;height:22px;padding:0}.cpu-dragging{cursor:grabbing!important;opacity:.8}#cpu-menu{padding:4px 6px 2px;display:flex;flex-direction:column;gap:2px}[data-theme=dark] #cpu-menu{border-top:1px solid rgba(255,255,255,.04)}[data-theme=light] #cpu-menu{border-top:1px solid rgba(0,0,0,.04)}.cpu-mrow{display:flex;align-items:center;gap:8px;padding:6px 8px;border-radius:6px;font-size:10px;font-weight:500;cursor:pointer;transition:background .15s;opacity:.8}.cpu-mrow:hover{background:rgba(99,102,241,.15);opacity:1}.cpu-mrow-2,.cpu-mrow-3{padding:2px;gap:2px}.cpu-mrow-2>div,.cpu-mrow-3>div{flex:1;display:flex;align-items:center;justify-content:center;gap:4px;padding:5px 4px;border-radius:5px;opacity:.6;transition:all .15s}.cpu-mrow-2>div:hover,.cpu-mrow-3>div:hover{background:rgba(99,102,241,.15);opacity:1}.cpu-mrow.cpu-active,.cpu-mrow>div.cpu-active{background:rgba(99,102,241,.2);opacity:1;color:#818cf8}.cpu-bars{padding:2px 10px 4px}.cpu-gr{display:flex;align-items:center;gap:6px;padding:3px 0}.cpu-gl{font-size:8px;font-weight:600;min-width:32px;text-transform:uppercase;letter-spacing:.03em;opacity:.5}.cpu-gt{flex:1;height:5px;border-radius:3px;overflow:hidden}[data-theme=dark] .cpu-gt{background:rgba(255,255,255,.06)}[data-theme=light] .cpu-gt{background:rgba(0,0,0,.06)}.cpu-gf{height:100%;border-radius:3px;transition:width .8s cubic-bezier(.25,.46,.45,.94)}.cpu-fo{background:linear-gradient(90deg,#22c55e,#4ade80)}.cpu-fw{background:linear-gradient(90deg,#f59e0b,#facc15)}.cpu-fd{background:linear-gradient(90deg,#ef4444,#f87171);animation:cpu-p 2s infinite}@keyframes cpu-p{0%,100%{opacity:1}50%{opacity:.7}}.cpu-gv{font-size:9px;font-weight:700;min-width:26px;text-align:right;font-variant-numeric:tabular-nums}.cpu-nfo{padding:2px 10px 4px}.cpu-nr{display:flex;justify-content:space-between;align-items:center;padding:2px 0;font-size:9px}.cpu-nl{opacity:.4;display:flex;align-items:center;gap:4px}.cpu-nv{font-variant-numeric:tabular-nums;font-weight:500}.cpu-nv.ac{color:#6366f1}.cpu-nv.pk{color:#f59e0b}.cpu-nv.rl{color:#ef4444;font-weight:700}#cpu-ft{padding:5px 10px 6px;font-size:9px;display:flex;justify-content:space-between;opacity:.5;font-variant-numeric:tabular-nums;letter-spacing:-.01em}#cpu-ft>span{display:flex;align-items:center;gap:4px}[data-theme=dark] #cpu-ft{border-top:1px solid rgba(255,255,255,.04)}[data-theme=light] #cpu-ft{border-top:1px solid rgba(0,0,0,.04)}@media(prefers-reduced-transparency:reduce){#cpu-hud{backdrop-filter:none!important;-webkit-backdrop-filter:none!important}}@media(prefers-reduced-motion:reduce){*{transition-duration:.01ms!important;animation-duration:.01ms!important}}';
    document.documentElement.appendChild(s);
}

function drawDualGauge(cv, sp, wp, big) {
    var ctx = cv.getContext('2d'), w = cv.width, h = cv.height, cx = w / 2, cy = big ? h - 6 : h - 2;
    var li = S.theme === 'light', sa = Math.PI;
    var rO = big ? w / 2 - 16 : w / 2 - 3, rI = rO - (big ? 10 : 7);
    ctx.clearRect(0, 0, w, h);
    ctx.beginPath(); ctx.arc(cx, cy, rO, sa, 2 * Math.PI); ctx.strokeStyle = li ? 'rgba(0,0,0,.05)' : 'rgba(255,255,255,.05)'; ctx.lineWidth = big ? 8 : 4; ctx.lineCap = 'round'; ctx.stroke();
    ctx.beginPath(); ctx.arc(cx, cy, rI, sa, 2 * Math.PI); ctx.strokeStyle = li ? 'rgba(0,0,0,.03)' : 'rgba(255,255,255,.03)'; ctx.lineWidth = big ? 6 : 3; ctx.lineCap = 'round'; ctx.stroke();
    if (big) { for (var i = 0; i <= 10; i++) { var a = sa + Math.PI * i / 10; ctx.beginPath(); ctx.moveTo(cx + (rO - 5) * Math.cos(a), cy + (rO - 5) * Math.sin(a)); ctx.lineTo(cx + (rO + 5) * Math.cos(a), cy + (rO + 5) * Math.sin(a)); ctx.strokeStyle = li ? 'rgba(0,0,0,.08)' : 'rgba(255,255,255,.06)'; ctx.lineWidth = i % 5 === 0 ? 1.5 : .5; ctx.stroke(); } }
    var g1 = ctx.createLinearGradient(0, cy, w, cy); g1.addColorStop(0, '#22c55e'); g1.addColorStop(.5, '#f59e0b'); g1.addColorStop(1, '#ef4444');
    ctx.beginPath(); ctx.arc(cx, cy, rO, sa, sa + Math.PI * Math.min(sp, 100) / 100); ctx.strokeStyle = g1; ctx.lineWidth = big ? 8 : 4; ctx.lineCap = 'round'; ctx.stroke();
    ctx.beginPath(); ctx.arc(cx, cy, rI, sa, sa + Math.PI * Math.min(wp, 100) / 100); ctx.strokeStyle = gc(wp).h; ctx.lineWidth = big ? 6 : 3; ctx.lineCap = 'round'; ctx.stroke();
    if (big) {
        ctx.font = '700 16px -apple-system,system-ui,sans-serif'; ctx.fillStyle = gc(sp).h; ctx.textAlign = 'center'; ctx.fillText(Math.round(sp) + '%', cx, cy - 22);
        ctx.font = '600 9px -apple-system,system-ui,sans-serif'; ctx.fillStyle = gc(wp).h; ctx.fillText(Math.round(wp) + '%', cx, cy - 10);
    }
    if (big) {
        var needlePct = Math.max(sp, wp);
        var na = sa + Math.PI * Math.min(needlePct, 100) / 100, nl = rO - 8;
        ctx.beginPath(); ctx.moveTo(cx, cy); ctx.lineTo(cx + nl * Math.cos(na), cy + nl * Math.sin(na));
        ctx.strokeStyle = li ? '#1d1d1f' : '#e8eaed'; ctx.lineWidth = 2; ctx.lineCap = 'round'; ctx.stroke();
    }
    ctx.beginPath(); ctx.arc(cx, cy, big ? 3 : 1.5, 0, 2 * Math.PI); ctx.fillStyle = '#6366f1'; ctx.fill();
}

function drawMiniDigital(cv, sp, wp) {
    var ctx = cv.getContext('2d'), w = cv.width, h = cv.height;
    var li = S.theme === 'light';
    ctx.clearRect(0, 0, w, h);
    var bg = li ? 'rgba(0,0,0,.1)' : 'rgba(255,255,255,.1)';
    ctx.fillStyle = bg; ctx.fillRect(2, 3, 4, 18);
    ctx.fillStyle = gc(sp).h; var sh = Math.min(sp, 100) / 100 * 18; ctx.fillRect(2, 21 - sh, 4, sh);
    ctx.fillStyle = bg; ctx.fillRect(8, 3, 4, 18);
    ctx.fillStyle = gc(wp).h; var wh = Math.min(wp, 100) / 100 * 18; ctx.fillRect(8, 21 - wh, 4, wh);
    ctx.font = '600 9px -apple-system,system-ui,sans-serif';
    ctx.textAlign = 'left'; ctx.textBaseline = 'middle';
    ctx.fillStyle = gc(sp).h; ctx.fillText(Math.round(sp), 16, 8);
    ctx.fillStyle = gc(wp).h; ctx.fillText(Math.round(wp), 16, 17);
}

function clp(x, y, w, h) { return { x: Math.max(4, Math.min(window.innerWidth - w - 4, x)), y: Math.max(4, Math.min(window.innerHeight - h - 4, y)) }; }

function applyPos() {
    if (!hud) return;
    if (S.pos && S.pos.x != null) {
        var col = hud.classList.contains('cpu-col'), w = col ? 56 : 194, h2 = col ? 56 : (hud.offsetHeight || 280);
        var c = clp(S.pos.x, S.pos.y, w, h2);
        hud.style.left = c.x + 'px'; hud.style.top = c.y + 'px'; hud.style.right = 'auto'; hud.style.bottom = 'auto';
    } else {
        hud.style.right = '16px'; hud.style.bottom = '16px'; hud.style.left = 'auto'; hud.style.top = 'auto';
    }
}

function getIconSVG(name) {
    switch (name) {
        case 'refresh': return '<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 2v6h-6"/><path d="M21 13a9 9 0 1 1-3-7.7L21 8"/></svg>';
        case 'analog': return '<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>';
        case 'digital': return '<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="4" y="4" width="16" height="16" rx="2" ry="2"/><line x1="8" y1="12" x2="16" y2="12"/><line x1="8" y1="8" x2="16" y2="8"/><line x1="8" y1="16" x2="16" y2="16"/></svg>';
        case 'light': return '<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg>';
        case 'dark': return '<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>';
        case 'system': return '<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 2a10 10 0 0 0 0 20z" fill="currentColor"/></svg>';
        case 'panel': return '<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><line x1="15" y1="3" x2="15" y2="21"/></svg>';
        case 'minimize': return '<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="5" y1="12" x2="19" y2="12"/></svg>';
        default: return '';
    }
}

function createHUD() {
    if (hud) return;
    injectStyles();
    hud = document.createElement('div'); hud.id = 'cpu-hud';
    S.theme = resolveTheme(); hud.setAttribute('data-theme', S.theme);
    
    var themeIcon = getIconSVG(S.themeMode);
    var themeTitle = S.themeMode === 'light' ? 'Light Mode' : (S.themeMode === 'dark' ? 'Dark Mode' : 'System Mode');
    var styleIcon = getIconSVG(S.mode);
    var styleTitle = S.mode === 'analog' ? 'Analog Style' : 'Digital Style';

    hud.innerHTML = '<div id="cpu-mini"><canvas id="cpu-mc" width="44" height="24"></canvas><span class="cpu-mp" id="cpu-mpv"></span><span class="cpu-ms" id="cpu-mps"></span></div><div id="cpu-body"><div id="cpu-hdr"><span id="cpu-ht">CPU</span><div id="cpu-acts"><button id="cpu-ar" class="cpu-hud-btn" title="Refresh">' + getIconSVG('refresh') + '</button><button id="cpu-am" class="cpu-hud-btn" title="' + styleTitle + '">' + styleIcon + '</button><button id="cpu-at" class="cpu-hud-btn" title="' + themeTitle + '">' + themeIcon + '</button><button id="cpu-ap" class="cpu-hud-btn" title="Toggle Side Panel">' + getIconSVG('panel') + '</button><button id="cpu-ac" class="cpu-hud-btn" title="Minimize">' + getIconSVG('minimize') + '</button></div></div><div id="cpu-ga" style="padding:6px 0 2px"><canvas id="cpu-cv" width="170" height="88"></canvas></div><div id="cpu-gd" style="display:none"><div class="cpu-bars"><div class="cpu-gr"><span class="cpu-gl">5h</span><div class="cpu-gt"><div class="cpu-gf cpu-fo" id="cpu-dsf"></div></div><span class="cpu-gv" id="cpu-dsv">0%</span></div><div class="cpu-gr"><span class="cpu-gl">Week</span><div class="cpu-gt"><div class="cpu-gf cpu-fo" id="cpu-dwf"></div></div><span class="cpu-gv" id="cpu-dwv">0%</span></div><div class="cpu-gr"><span class="cpu-gl">CTX</span><div class="cpu-gt"><div class="cpu-gf cpu-fo" id="cpu-dcf"></div></div><span class="cpu-gv" id="cpu-dcv">0%</span></div></div></div><div class="cpu-nfo"><div class="cpu-nr"><span class="cpu-nl">Model</span><span class="cpu-nv ac" id="cpu-mod">-</span></div><div class="cpu-nr"><span class="cpu-nl">Cost</span><span class="cpu-nv" id="cpu-cst">$0.00</span></div><div class="cpu-nr"><span class="cpu-nl">Chat</span><span class="cpu-nv" id="cpu-cht" style="max-width:100px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">-</span></div><div class="cpu-nr" id="cpu-pkr" style="display:none"><span class="cpu-nl"><svg viewBox="0 0 16 16" width="12" height="12" fill="none" stroke="#f59e0b" stroke-width="1.5"><path d="M8 2L1 14h14L8 2z"/><path d="M8 6v4M8 12h.01"/></svg></span><span class="cpu-nv pk">Peak Hours</span></div><div class="cpu-nr" id="cpu-rlr" style="display:none"><span class="cpu-nl"><svg viewBox="0 0 16 16" width="12" height="12" fill="none" stroke="#ef4444" stroke-width="1.5"><circle cx="8" cy="8" r="6"/><path d="M5 5l6 6M11 5l-6 6"/></svg></span><span class="cpu-nv rl">Rate Limit</span></div></div><div id="cpu-ft"><span id="cpu-r5"><svg viewBox="0 0 16 16" width="10" height="10" fill="none" stroke="currentColor" stroke-width="2"><circle cx="8" cy="8" r="6"/><path d="M8 4v4l3 2"/></svg> <span>-</span></span><span id="cpu-r7"><svg viewBox="0 0 16 16" width="10" height="10" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="3" width="12" height="11" rx="1"/><path d="M2 6h12M6 1v3M10 1v3"/><text x="8" y="12" font-size="6" font-family="sans-serif" font-weight="700" text-anchor="middle" fill="currentColor" stroke="none">7</text></svg> <span>-</span></span></div></div>';
    
    document.documentElement.appendChild(hud);
    chrome.storage.local.get(['hudCollapsed', 'hudMode', 'miniGaugeMode', 'hudPosition', 'themeMode'], function(r) {
        if (r.hudCollapsed) { hud.classList.add('cpu-col'); S.visible = false; }
        if (r.hudMode) S.mode = r.hudMode;
        if (r.miniGaugeMode) S.mini = r.miniGaugeMode;
        if (r.themeMode) S.themeMode = r.themeMode;
        S.theme = resolveTheme(); hud.setAttribute('data-theme', S.theme);
        if (r.hudPosition && r.hudPosition.x != null) S.pos = r.hudPosition;
        applyMode(); applyPos(); update();
    });
    
    setupDrag(hud);
    
    document.getElementById('cpu-ar').addEventListener('click', function(e) { e.stopPropagation(); scrape(); var b = e.currentTarget; b.style.opacity = '1'; setTimeout(function() { b.style.opacity = ''; }, 1200); });
    document.getElementById('cpu-am').addEventListener('click', function(e) { e.stopPropagation(); S.mode = S.mode === 'analog' ? 'digital' : 'analog'; chrome.storage.local.set({ hudMode: S.mode }); applyMode(); update(); });
    document.getElementById('cpu-at').addEventListener('click', function(e) { e.stopPropagation(); var m = ['system','dark','light'], i = m.indexOf(S.themeMode); setTheme(m[(i+1)%3]); });
    document.getElementById('cpu-ap').addEventListener('click', function(e) { e.stopPropagation(); chrome.runtime.sendMessage({ type: 'TOGGLE_SIDEPANEL' }); });
    document.getElementById('cpu-ac').addEventListener('click', function(e) { e.stopPropagation(); toggleHud(); });
    
    window.addEventListener('resize', function() { if (S.pos) applyPos(); });
    if (S.themeMode === 'system') {
        window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', function() {
            S.theme = resolveTheme(); hud.setAttribute('data-theme', S.theme); update();
            chrome.runtime.sendMessage({ type: 'THEME_CHANGED', theme: S.theme, themeMode: S.themeMode });
        });
    }
}

function setTheme(mode) {
    S.themeMode = mode; S.theme = resolveTheme();
    chrome.storage.local.set({ themeMode: mode });
    hud.setAttribute('data-theme', S.theme);
    var tb = document.getElementById('cpu-at');
    if (tb) {
        tb.innerHTML = getIconSVG(mode);
        tb.title = mode === 'light' ? 'Light Mode' : (mode === 'dark' ? 'Dark Mode' : 'System Mode');
    }
    chrome.runtime.sendMessage({ type: 'THEME_CHANGED', theme: S.theme, themeMode: mode });
    update();
}

function toggleHud() {
    if (!hud.classList.contains('cpu-col') && !S.pos) { var r = hud.getBoundingClientRect(); S.pos = { x: r.left, y: r.top }; chrome.storage.local.set({ hudPosition: S.pos }); }
    hud.classList.toggle('cpu-col'); S.visible = !hud.classList.contains('cpu-col');
    chrome.storage.local.set({ hudCollapsed: !S.visible }); applyPos(); update();
}

function applyMode() {
    var a = document.getElementById('cpu-ga'), d = document.getElementById('cpu-gd');
    if (a) a.style.display = S.mode === 'analog' ? '' : 'none';
    if (d) d.style.display = S.mode === 'digital' ? '' : 'none';
    var ab = document.getElementById('cpu-am');
    if (ab) {
        ab.innerHTML = getIconSVG(S.mode);
        ab.title = S.mode === 'analog' ? 'Analog Style' : 'Digital Style';
    }
}

function setupDrag(el) {
    var dragging = false, ox = 0, oy = 0, moved = false, pressTimer = null, isCol = false;
    el.addEventListener('mousedown', function(e) {
        var col = el.classList.contains('cpu-col'), isH = !col && e.target.closest('#cpu-hdr');
        if (!isH && !col) return; if (e.target.closest('button')) return;
        isCol = col; moved = false; var r = el.getBoundingClientRect(); ox = e.clientX - r.left; oy = e.clientY - r.top;
        e.preventDefault();
        if (col) {
            pressTimer = setTimeout(function() { 
                dragging = true; 
                el.classList.add('cpu-drag', 'cpu-dragging'); 
            }, 400);
        } else {
            dragging = true; el.classList.add('cpu-drag');
        }
    });
    document.addEventListener('mousemove', function(e) {
        if (!dragging) return; moved = true;
        var c = clp(e.clientX - ox, e.clientY - oy, el.offsetWidth, el.offsetHeight);
        el.style.left = c.x + 'px'; el.style.top = c.y + 'px'; el.style.right = 'auto'; el.style.bottom = 'auto';
    });
    document.addEventListener('mouseup', function(e) {
        clearTimeout(pressTimer);
        if (dragging) {
            dragging = false; el.classList.remove('cpu-drag', 'cpu-dragging');
            if (moved) { var r = el.getBoundingClientRect(); S.pos = { x: r.left, y: r.top }; chrome.storage.local.set({ hudPosition: S.pos }); }
        } else if (isCol && e.target.closest('#cpu-mini') && !moved) {
            toggleHud();
        }
    });
}

function update() {
    if (!hud) return;
    var sp = Number(S.session.percent) || 0;
    var wp = Number(S.weekly.percent) || 0;
    var ctxTokens = Number(S.tokens.ctx) || 0;
    var ctxP = Math.round(ctxTokens / 200000 * 100);
    if (S.mode === 'analog') { 
        var cv = document.getElementById('cpu-cv'); 
        if (cv) { 
            drawDualGauge(cv, sp, wp, true); 
            cv.title = 'Session Usage: ' + Math.round(sp) + '%\nWeekly Usage: ' + Math.round(wp) + '%';
        }
    } else {
        [['cpu-ds', sp], ['cpu-dw', wp], ['cpu-dc', ctxP]].forEach(function(p) {
            var f = document.getElementById(p[0] + 'f'), v = document.getElementById(p[0] + 'v');
            if (f) { f.style.width = Math.min(p[1], 100) + '%'; f.className = 'cpu-gf ' + gc(p[1]).f; }
            if (v) { 
                var warn = (p[0] === 'cpu-dc' && ctxTokens >= CTX_WARN_TOKENS) ? ' <span title=">180k Risk" style="color:#f59e0b">\u26A0</span>' : '';
                v.innerHTML = Math.round(p[1]) + '%' + warn; 
                v.style.color = gc(p[1]).h; 
            }
        });
    }
    var mc = document.getElementById('cpu-mc'), mpv = document.getElementById('cpu-mpv'), mps = document.getElementById('cpu-mps');
    if (mc && mpv) {
        if (S.mini === 'dual') {
            mc.width = 40; mc.style.display = ''; drawDualGauge(mc, sp, wp, false);
            mpv.textContent = Math.round(sp); mpv.style.color = gc(sp).h; mpv.style.fontSize = '11px'; mpv.style.display = '';
            if (mps) { mps.textContent = Math.round(wp) + '%'; mps.style.color = gc(wp).h; mps.style.display = ''; }
        } else if (S.mini === 'digital') {
            mc.width = 44; mc.style.display = ''; drawMiniDigital(mc, sp, wp);
            mpv.style.display = 'none'; 
            if (mps) mps.style.display = 'none';
        } else {
            mc.style.display = 'none'; if (mps) mps.style.display = 'none';
            var pv = S.mini === 'weekly' ? wp : sp;
            mpv.textContent = Math.round(pv) + '%'; mpv.style.color = gc(pv).h; mpv.style.fontSize = '13px'; mpv.style.display = '';
        }
    }
    var hasData = (Number(S.tokens.i) > 0) || (Number(S.msgs) > 0);
    var nil = '-';
    var me = document.getElementById('cpu-mod'); if (me) me.textContent = hasData ? (S.model.label || nil) : nil;
    var ce = document.getElementById('cpu-cst'); if (ce) ce.textContent = hasData ? '$' + (Number(S.cost.session) || 0).toFixed(4) : nil;
    var ch = document.getElementById('cpu-cht'); if (ch) ch.textContent = hasData ? (S.conv.name || nil) : 'Waiting...';
    var idr = document.getElementById('cpu-idr'), idv = document.getElementById('cpu-idv');
    if (S.conv.id && hasData) { if (idr) idr.style.display = ''; if (idv) idv.textContent = S.conv.id; } else { if (idr) idr.style.display = 'none'; }
    var tpr = document.getElementById('cpu-tpr'), tpv = document.getElementById('cpu-tpv');
    if (S.tps > 0 && hasData) { if (tpr) tpr.style.display = ''; if (tpv) tpv.textContent = S.tps.toFixed(1) + ' tok/s'; } else { if (tpr) tpr.style.display = 'none'; }
    S.peak = isPeak();
    var pkr = document.getElementById('cpu-pkr'); if (pkr) pkr.style.display = S.peak ? '' : 'none';
    var rlr = document.getElementById('cpu-rlr'); if (rlr) rlr.style.display = S.rl ? '' : 'none';
    var r5 = document.getElementById('cpu-r5'), r7 = document.getElementById('cpu-r7');
    if (r5) { var r5s = r5.querySelector('span'); if (r5s) r5s.textContent = fmtReset(S.session.resetsAt); r5.title = 'Session Reset in ' + fmtResetLong(S.session.resetsAt); }
    if (r7) { var r7s = r7.querySelector('span'); if (r7s) r7s.textContent = fmtReset(S.weekly.resetsAt); r7.title = 'Weekly Reset in ' + fmtResetLong(S.weekly.resetsAt); }
}

function detectRL() {
    var els = document.querySelectorAll('[role=alert],[role=status],[class*=toast],[class*=banner],[class*=rate-limit],[class*=usage-limit]');
    var pats = [/rate limit/i, /usage limit/i, /too many/i, /limit reached/i, /exceeded.*limit/i, /nutzungslimit/i];
    for (var i = 0; i < els.length; i++) { var t = els[i].textContent || ''; for (var j = 0; j < pats.length; j++) { if (pats[j].test(t)) { if (!S.rl) { S.rl = true; chrome.runtime.sendMessage({ type: 'RATE_LIMIT_HIT', timestamp: Date.now() }); update(); } return; } } }
    if (S.rl) { S.rl = false; chrome.runtime.sendMessage({ type: 'RATE_LIMIT_CLEARED', timestamp: Date.now() }); update(); }
}

window.addEventListener('CPU_DATA', function(e) {
    var d = e.detail; if (!d || !d.type) return;
    switch (d.type) {
        case 'CHAT_TURN_PERSIST':
            d.name = S.conv && S.conv.name ? S.conv.name : null;
            chrome.runtime.sendMessage({ type: 'PERSIST_TURN', data: d }).catch(function(){});
            break;
        case 'REQUEST':
            if (d.model) { S.model.id = d.model; S.model.label = d.modelLabel || d.model; }
            if (d.inputTokens) { S.tokens.i += d.inputTokens; S.tokens.total += d.inputTokens; S.tokens.ctx = d.inputTokens; }
            if (d.conversationId) S.conv.id = d.conversationId;
            if (d.projectId) S.conv.projId = d.projectId;
            if (d.sessionMessages) S.msgs = d.sessionMessages;
            if (d.promptPreview) S.promptPreview = d.promptPreview;
            tpsBuf = []; break;
        case 'RESPONSE':
            if (d.outputTokens) { S.tokens.o += d.outputTokens; S.tokens.total += d.outputTokens; }
            if (d.inputTokens) S.tokens.ctx = d.inputTokens;
            if (d.estimatedCost) { S.cost.last = d.estimatedCost; S.cost.session += d.estimatedCost; }
            break;
        case 'MODEL_DETECTED': S.model.id = d.model; S.model.label = d.modelLabel || d.model; break;
        case 'CONVERSATION_META': S.conv.name = d.name || ''; S.conv.id = d.conversationId; S.conv.projId = d.projectId; S.conv.msgCount = d.messageCount || 0; break;
        case 'OFFICIAL_USAGE':
            if (d.five_hour) { S.session.percent = d.five_hour.utilization || 0; S.session.resetsAt = d.five_hour.resets_at; }
            if (d.seven_day) { S.weekly.percent = d.seven_day.utilization || 0; S.weekly.resetsAt = d.seven_day.resets_at; }
            if (d.seven_day_opus) { S.opus.percent = d.seven_day_opus.utilization || 0; S.opus.resetsAt = d.seven_day_opus.resets_at; }
            break;
        case 'USAGE_UPDATE':
            if (d.inputTokens) S.tokens.ctx = d.inputTokens;
            if (d.outputTokens) {
                tpsBuf.push({ t: d.outputTokens, ts: Date.now() });
                if (tpsBuf.length >= 2) { var f = tpsBuf[0], l = tpsBuf[tpsBuf.length - 1], tt = tpsBuf.reduce(function(s, b) { return s + b.t; }, 0), el = (l.ts - f.ts) / 1000; if (el > 0) S.tps = tt / el; }
                if (tpsBuf.length > 50) tpsBuf = tpsBuf.slice(-25);
            }
            break;
        case 'CODE_BLOCK':
            chrome.runtime.sendMessage({ type: 'ASSET_CAPTURED', assetType: 'code', language: d.language || '', content: d.content || '', label: d.label || '', chatId: S.conv.id || '', chatName: S.conv.name || '' });
            break;
        case 'ARTIFACT':
            chrome.runtime.sendMessage({ type: 'ASSET_CAPTURED', assetType: 'artifact', language: d.language || '', content: d.content || '', label: d.label || '', chatId: S.conv.id || '', chatName: S.conv.name || '' });
            break;
    }
    chrome.runtime.sendMessage({ type: 'STATE_UPDATE', target: 'sidepanel', state: JSON.parse(JSON.stringify(S)) }).catch(function() {});
    update();
});

chrome.runtime.onMessage.addListener(function(m, s, sr) {
    if (m.type === 'GET_STATE') { sr(JSON.parse(JSON.stringify(S))); return true; }
    if (m.type === 'SCRAPE_USAGE') { scrape(); return; }
    if (m.type === 'THEME_CHANGED' && hud) {
        if (m.themeMode) S.themeMode = m.themeMode;
        S.theme = m.theme || resolveTheme();
        hud.setAttribute('data-theme', S.theme);
        update(); return;
    }
    if (m.type === 'UPDATE_HUD_PREF') {
        if (m.hudVisible !== undefined) { S.visible = m.hudVisible; if (hud) hud.classList.toggle('cpu-col', !S.visible); applyPos(); }
        if (m.hudMode) { S.mode = m.hudMode; applyMode(); }
        if (m.miniGaugeMode) { S.mini = m.miniGaugeMode; chrome.storage.local.set({ miniGaugeMode: m.miniGaugeMode }); }
        if (m.resetPosition) { S.pos = null; chrome.storage.local.set({ hudPosition: null }); applyPos(); }
        update(); return;
    }
});

function getChatMeta() {
    var id = S.conv.id;
    var m = window.location.pathname.match(/\/chat\/([a-f0-9-]+)/);
    if (!id && m) id = m[1];
    var name = S.conv.name;
    if (!name) {
        var title = document.title;
        if (title && title.includes('Claude')) { name = title.replace('Claude - ', '').trim(); }
    }
    return { id: id || '', name: name || '' };
}

function scrape() {
    var ifr = document.createElement('iframe');
    ifr.style.cssText = 'position:fixed;top:-9999px;left:-9999px;width:800px;height:600px;opacity:0;pointer-events:none';
    ifr.src = 'https://claude.ai/settings/usage';
    var done = false, to = setTimeout(function() { if (!done) { done = true; ifr.remove(); } }, 15000), att = 0;
    var tp = function() {
        if (done) return; att++;
        try {
            var doc = ifr.contentDocument || (ifr.contentWindow && ifr.contentWindow.document); if (!doc) { if (att < 20) setTimeout(tp, 750); return; }
            var ex = doc.querySelector('[data-testid="extra-usage-section"]'), rows = doc.querySelectorAll('.flex.flex-row.gap-x-8'), found = false;
            for (var i = 0; i < rows.length; i++) {
                var row = rows[i]; if (ex && ex.contains(row)) continue;
                var txt = row.textContent || '', bar = row.querySelector('[style*="width:"]'), bp = null;
                if (bar) { var wm = bar.getAttribute('style').match(/width:\s*(\d+(?:\.\d+)?)%/); if (wm) bp = Math.round(parseFloat(wm[1])); }
                var pm = txt.match(/(\d+)\s*%\s*(verwendet|used|verbraucht)/i), pct = pm ? parseInt(pm[1]) : bp;
                var rm = txt.match(/(?:Zur\u00fccksetzung|Reset)\s+in\s+(\d+)\s*(?:Std|hr|hour|Stunde)\.?\s*(\d+)\s*(?:Min|min|Minute)/i);
                if (txt.match(/Sitzung|Session|Current\s+session/i) && pct !== null) { S.session.percent = pct; if (rm) S.session.resetsAt = new Date(Date.now() + parseInt(rm[1]) * 3600000 + parseInt(rm[2]) * 60000).toISOString(); found = true; }
                if (txt.match(/Alle\s+Modelle|All\s+models|W\u00f6chentlich|Weekly/i) && pct !== null) { S.weekly.percent = pct; if (rm) S.weekly.resetsAt = new Date(Date.now() + parseInt(rm[1]) * 3600000 + parseInt(rm[2]) * 60000).toISOString(); found = true; }
                if (txt.match(/Opus/i) && pct !== null) { S.opus.percent = pct; found = true; }
            }
            if (found || att >= 20) { done = true; clearTimeout(to); ifr.remove(); S.lastUpdated = Date.now(); chrome.runtime.sendMessage({ type: 'USAGE_SCRAPED', state: JSON.parse(JSON.stringify(S)) }).catch(function() {}); update(); }
            else setTimeout(tp, 750);
        } catch (e) { if (att >= 20) { done = true; clearTimeout(to); ifr.remove(); } else setTimeout(tp, 750); }
    };
    ifr.addEventListener('load', function() { setTimeout(tp, 2000); });
    ifr.addEventListener('error', function() { done = true; clearTimeout(to); ifr.remove(); });
    document.body.appendChild(ifr);
}

var rlObs = new MutationObserver(function() { detectRL(); });
var capturedPres = new WeakSet();
function scanForCodeBlocks() {
    var pres = document.querySelectorAll('pre');
    pres.forEach(function(pre) {
        if (capturedPres.has(pre)) return;
        var code = pre.querySelector('code');
        if (!code) return;
        var txt = code.textContent || '';
        if (txt.length < 20) return;
        capturedPres.add(pre);
        var cls = code.className || '';
        var langMatch = cls.match(/language-(\w+)/);
        var lang = langMatch ? langMatch[1] : 'text';
        var firstLine = txt.split('\n')[0].trim();
        var meta = getChatMeta();
        chrome.runtime.sendMessage({
            type: 'ASSET_CAPTURED',
            assetType: 'code',
            language: lang,
            content: txt.substring(0, 2000),
            label: firstLine.substring(0, 60) || lang + ' block',
            chatId: meta.id,
            chatName: meta.name
        }).catch(function() {});
    });
}
var codeObs = new MutationObserver(function() { scanForCodeBlocks(); });

function init() {
    createHUD(); update();
    rlObs.observe(document.body, { childList: true, subtree: true });
    codeObs.observe(document.body, { childList: true, subtree: true });
    scanForCodeBlocks();
    scrape(); setInterval(update, 60000);
    setInterval(function() {
        if (!hud || hud.classList.contains('cpu-col')) return;
        var r5 = document.getElementById('cpu-r5'), r7 = document.getElementById('cpu-r7');
        if (r5) r5.title = 'Session Reset in ' + fmtResetLong(S.session.resetsAt);
        if (r7) r7.title = 'Weekly Reset in ' + fmtResetLong(S.weekly.resetsAt);
    }, 1000);
    var lu = location.href;
    new MutationObserver(function() { if (location.href !== lu) { lu = location.href; S.tokens.ctx = 0; S.cost.last = 0; S.conv.id = null; S.conv.name = ''; S.tps = 0; tpsBuf = []; update(); } }).observe(document.body, { childList: true, subtree: true });
}

if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else init();
})();