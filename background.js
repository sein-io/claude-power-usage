chrome.sidePanel.setPanelBehavior({ openPanelOnActionClick: true });
var spOpen = false, lastU = { s: 0, w: 0 };
const STORAGE_KEY_PREFIX = 'chat_history:';
const QUOTA_THRESHOLD = 0.85;

chrome.runtime.onInstalled.addListener(function() {
    chrome.storage.local.set({
        themeMode: 'system', hudCollapsed: false, hudMode: 'analog',
        miniGaugeMode: 'dual', hudPosition: null, adaptiveRefresh: true,
        notifyOnLimit: true, notifyOnReset: true, notifyThreshold: 80,
        usageHistory: [], rateLimitLog: [], promptHistory: [], assets: [],
        language: 'en', firstSnapshot: false, localHistoryEnabled: false
    });
    chrome.alarms.create('usage-refresh', { periodInMinutes: 2 });
    chrome.alarms.create('countdown-tick', { periodInMinutes: 1 });
});

chrome.runtime.onConnect.addListener(function(port) {
    if (port.name === 'cpu-sidepanel') {
        spOpen = true;
        broadcastPanelState(true);
        port.onDisconnect.addListener(function() {
            spOpen = false;
            broadcastPanelState(false);
        });
    }
});

function adaptIv(st) {
    if (!st) return 2;
    var mx = Math.max((st.session && st.session.percent) || 0, (st.weekly && st.weekly.percent) || 0);
    return mx >= 90 ? 0.5 : mx >= 80 ? 1 : mx >= 50 ? 2 : 5;
}

chrome.alarms.onAlarm.addListener(function(a) {
    if (a.name === 'usage-refresh') {
        chrome.tabs.query({ url: 'https://claude.ai/*', active: true, currentWindow: true }, function(t) {
            if (t[0] && t[0].id) chrome.tabs.sendMessage(t[0].id, { type: 'SCRAPE_USAGE' }).catch(function() {});
        });
    }
    if (a.name === 'countdown-tick') {
        chrome.runtime.sendMessage({ type: 'COUNTDOWN_TICK', target: 'sidepanel' }).catch(function() {});
    }
});

async function checkQuotaAndEvict() {
    return new Promise(resolve => {
        var attempts = 0;
        function loop() {
            attempts++;
            if (attempts > 10) { resolve(); return; }
            chrome.storage.local.getBytesInUse(null, function(bytes) {
                var limit = chrome.storage.local.QUOTA_BYTES || 10485760;
                if (bytes / limit <= QUOTA_THRESHOLD) { resolve(); return; }
                chrome.storage.local.get(null, function(items) {
                    var chats = [];
                    for (var key in items) {
                        if (key.indexOf(STORAGE_KEY_PREFIX) === 0 && items[key] && items[key].v === 1) {
                            chats.push({ key: key, updated: items[key].updated });
                        }
                    }
                    if (chats.length === 0) { resolve(); return; }
                    chats.sort(function(a, b) { return a.updated - b.updated; });
                    chrome.storage.local.remove(chats[0].key, function() {
                        loop();
                    });
                });
            });
        }
        loop();
    });
}

var persistQueue = Promise.resolve();

function persistChatTurn(data) {
    if (!data.conversationId) return;
    persistQueue = persistQueue.then(function() {
        return new Promise(function(resolve) {
            chrome.storage.local.get('localHistoryEnabled', function(r) {
                if (!r.localHistoryEnabled) { resolve(); return; }
                var key = STORAGE_KEY_PREFIX + data.conversationId;
                checkQuotaAndEvict().then(() => {
                    chrome.storage.local.get(key, function(res) {
                        var now = Date.now();
                        var chat = res[key];
                        if (!chat || chat.v !== 1) {
                            chat = {
                                v: 1,
                                id: data.conversationId,
                                name: data.name || 'Untitled Conversation',
                                projId: data.projectId || null,
                                model: data.model,
                                created: now,
                                updated: now,
                                msgs: [],
                                meta: { inputTokens: 0, outputTokens: 0, costUsd: 0 }
                            };
                        } else if (data.name && chat.name !== data.name) {
                            chat.name = data.name;
                        }
                        chat.updated = now;
                        chat.model = data.model;
                        if (data.userText) {
                            chat.msgs.push({ r: 'u', t: data.userText, ts: now });
                        }
                        if (data.assistantText) {
                            chat.msgs.push({ 
                                r: 'a', 
                                t: data.assistantText, 
                                ts: now,
                                truncated: data.truncated ? true : undefined
                            });
                        }
                        chat.meta.inputTokens += (data.inputTokens || 0);
                        chat.meta.outputTokens += (data.outputTokens || 0);
                        chat.meta.costUsd += (data.costUsd || 0);
                        var saveObj = {};
                        saveObj[key] = chat;
                        chrome.storage.local.set(saveObj, function() {
                            chrome.runtime.sendMessage({ type: 'STORAGE_UPDATED' }).catch(function(){});
                            resolve();
                        });
                    });
                });
            });
        });
    });
}

chrome.runtime.onMessage.addListener(function(m, sender, sr) {
    if (m.type === 'TOGGLE_SIDEPANEL') {
        chrome.tabs.query({ active: true, currentWindow: true }, function(t) {
            if (!t[0]) return;
            if (spOpen) {
                chrome.runtime.sendMessage({ type: 'CLOSE_PANEL', target: 'sidepanel' }).catch(function() {});
                chrome.sidePanel.setOptions({ tabId: t[0].id, enabled: false }, function() {
                    setTimeout(function() {
                        chrome.sidePanel.setOptions({ tabId: t[0].id, enabled: true });
                    }, 100);
                });
                spOpen = false;
                broadcastPanelState(false);
            } else {
                chrome.sidePanel.open({ windowId: t[0].windowId }).catch(function() {
                    chrome.sidePanel.open({ tabId: t[0].id }).catch(function(){});
                });
                spOpen = true;
                broadcastPanelState(true);
            }
        });
        return;
    }
    if (m.type === 'PERSIST_TURN') {
        persistChatTurn(m.data);
        return;
    }
    if (m.target === 'sidepanel') { chrome.runtime.sendMessage(m).catch(function() {}); return; }
    if (m.target === 'content') {
        chrome.tabs.query({ url: 'https://claude.ai/*', active: true, currentWindow: true }, function(t) {
            if (t[0] && t[0].id) chrome.tabs.sendMessage(t[0].id, m).catch(function() {});
        });
        return;
    }
    if (m.type === 'GET_TAB_INFO') {
        chrome.tabs.query({ active: true, currentWindow: true }, function(t) {
            if (t[0]) sr({ url: t[0].url, title: t[0].title, id: t[0].id });
        });
        return true;
    }
    if (m.type === 'THEME_CHANGED') {
        chrome.storage.local.set({ themeMode: m.themeMode || 'system' });
        chrome.tabs.query({ url: 'https://claude.ai/*' }, function(t) {
            t.forEach(function(tab) { chrome.tabs.sendMessage(tab.id, m).catch(function() {}); });
        });
        chrome.runtime.sendMessage(Object.assign({}, m, { target: 'sidepanel' })).catch(function() {});
        return;
    }
    if (m.type === 'STATE_UPDATE') {
        if (m.state) {
            checkNotify(m.state);
            logSnap(m.state);
            logPrompt(m.state);
            if (m.state.conv && m.state.conv.id) {
                chrome.storage.local.get('assets', function(r) {
                    var a = r.assets || [];
                    var changed = false;
                    a.forEach(function(ast) {
                        if (!ast.chatId || ast.chatId === '') { ast.chatId = m.state.conv.id; changed = true; }
                        if (!ast.chatName || ast.chatName === '' || ast.chatName === 'Claude') { 
                            if (m.state.conv.name && m.state.conv.name !== '') {
                                ast.chatName = m.state.conv.name; 
                                changed = true; 
                            }
                        }
                    });
                    if (changed) {
                        chrome.storage.local.set({ assets: a });
                        chrome.runtime.sendMessage({ type: 'ASSETS_UPDATED', target: 'sidepanel' }).catch(function(){});
                    }
                });
            }
            chrome.storage.local.get('adaptiveRefresh', function(r) {
                if (r.adaptiveRefresh) {
                    var iv = adaptIv(m.state);
                    chrome.alarms.get('usage-refresh', function(ex) {
                        if (ex && ex.periodInMinutes !== iv) {
                            chrome.alarms.clear('usage-refresh', function() {
                                chrome.alarms.create('usage-refresh', { periodInMinutes: Math.max(0.5, iv) });
                            });
                        }
                    });
                }
            });
        }
        chrome.runtime.sendMessage(m).catch(function() {});
        return;
    }
    if (m.type === 'USAGE_SCRAPED') {
        if (m.state) { checkNotify(m.state); logSnap(m.state); }
        chrome.runtime.sendMessage(Object.assign({}, m, { target: 'sidepanel' })).catch(function() {});
        return;
    }
    if (m.type === 'RATE_LIMIT_HIT') {
        chrome.storage.local.get('rateLimitLog', function(r) {
            var l = r.rateLimitLog || [];
            l.push({ timestamp: m.timestamp, type: 'hit' });
            if (l.length > 200) l.splice(0, l.length - 200);
            chrome.storage.local.set({ rateLimitLog: l });
        });
        chrome.notifications.create('rl-' + Date.now(), {
            type: 'basic', iconUrl: 'icons/icon128.png',
            title: 'Claude Power Usage',
            message: 'Rate limit detected. Your session will reset soon.',
            priority: 2
        });
        return;
    }
    if (m.type === 'RATE_LIMIT_CLEARED') {
        chrome.storage.local.get('rateLimitLog', function(r) {
            var l = r.rateLimitLog || [];
            l.push({ timestamp: m.timestamp, type: 'cleared' });
            chrome.storage.local.set({ rateLimitLog: l });
        });
        chrome.notifications.create('rlc-' + Date.now(), {
            type: 'basic', iconUrl: 'icons/icon128.png',
            title: 'Claude Power Usage',
            message: 'Rate limit cleared. Full capacity available.',
            priority: 1
        });
        return;
    }
    if (m.type === 'ASSET_CAPTURED') {
        chrome.storage.local.get('assets', function(r) {
            var a = r.assets || [];
            var isDup = a.some(function(x) { return x.chatId === m.chatId && x.content === m.content; });
            if (isDup) return;
            a.push({ timestamp: Date.now(), type: m.assetType || 'code', language: m.language || '', content: m.content || '', label: m.label || '', chatId: m.chatId || '', chatName: m.chatName || '' });
            if (a.length > 200) a.splice(0, a.length - 200);
            chrome.storage.local.set({ assets: a });
            chrome.runtime.sendMessage({ type: 'ASSETS_UPDATED', target: 'sidepanel' }).catch(function() {});
        });
        return;
    }
    if (m.type === 'GET_USAGE_HISTORY') { chrome.storage.local.get('usageHistory', function(r) { sr(r.usageHistory || []); }); return true; }
    if (m.type === 'GET_RATE_LIMIT_LOG') { chrome.storage.local.get('rateLimitLog', function(r) { sr(r.rateLimitLog || []); }); return true; }
    if (m.type === 'GET_PROMPT_HISTORY') { chrome.storage.local.get('promptHistory', function(r) { sr(r.promptHistory || []); }); return true; }
    if (m.type === 'GET_ASSETS') { chrome.storage.local.get('assets', function(r) { sr(r.assets || []); }); return true; }
    if (m.type === 'DELETE_ASSET') {
        chrome.storage.local.get('assets', function(r) {
            var a = (r.assets || []).filter(function(x) { return x.timestamp !== m.timestamp; });
            chrome.storage.local.set({ assets: a });
            sr({ ok: true });
        });
        return true;
    }
    if (m.type === 'CLEAR_HISTORY') {
        chrome.storage.local.set({ usageHistory: [], rateLimitLog: [], promptHistory: [] });
        sr({ ok: true });
        return true;
    }
    if (m.type === 'CLEAR_ASSETS') {
        chrome.storage.local.set({ assets: [] });
        sr({ ok: true });
        return true;
    }
    if (m.type === 'UPDATE_SETTINGS') { chrome.storage.local.set(m.settings); return; }
    if (m.type === 'FORCE_REFRESH') {
        chrome.tabs.query({ url: 'https://claude.ai/*', active: true, currentWindow: true }, function(t) {
            if (t[0] && t[0].id) chrome.tabs.sendMessage(t[0].id, { type: 'SCRAPE_USAGE' }).catch(function() {});
        });
        return;
    }
    if (m.type === 'GET_CONTENT_STATE') {
        chrome.tabs.query({ url: 'https://claude.ai/*', active: true, currentWindow: true }, function(t) {
            if (t[0] && t[0].id) {
                chrome.tabs.sendMessage(t[0].id, { type: 'GET_STATE' }, function(s) { sr(s || null); });
            } else { sr(null); }
        });
        return true;
    }
});

function broadcastPanelState(open) {
    chrome.tabs.query({ url: 'https://claude.ai/*' }, function(tabs) {
        tabs.forEach(function(tab) { chrome.tabs.sendMessage(tab.id, { type: 'PANEL_STATE', open: open }).catch(function() {}); });
    });
}

function checkNotify(st) {
    chrome.storage.local.get(['notifyOnLimit', 'notifyOnReset', 'notifyThreshold', 'lastNotified', 'lastResetNotified'], function(r) {
        var thr = r.notifyThreshold || 80, ln = r.lastNotified || 0, now = Date.now();
        var sp = (st.session && st.session.percent) || 0;
        var wp = (st.weekly && st.weekly.percent) || 0;
        if (r.notifyOnLimit && sp >= thr && sp < 100 && (now - ln > 300000)) {
            chrome.notifications.create('sw-' + now, { type: 'basic', iconUrl: 'icons/icon128.png', title: 'Claude Power Usage', message: 'Session at ' + Math.round(sp) + '%. Plan your remaining prompts carefully.', priority: 1 });
            chrome.storage.local.set({ lastNotified: now });
        }
        if (r.notifyOnLimit && sp >= 100 && (now - ln > 600000)) {
            var ri = st.session && st.session.resetsAt ? ' Resets at ' + new Date(st.session.resetsAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) + '.' : '';
            chrome.notifications.create('sl-' + now, { type: 'basic', iconUrl: 'icons/icon128.png', title: 'Claude Power Usage', message: 'Session limit reached.' + ri + ' Wait for reset or enable extra usage.', priority: 2 });
            chrome.storage.local.set({ lastNotified: now });
        }
        if (r.notifyOnLimit && wp >= 95 && (now - ln > 600000)) {
            chrome.notifications.create('ww-' + now, { type: 'basic', iconUrl: 'icons/icon128.png', title: 'Claude Power Usage', message: 'Weekly usage at ' + Math.round(wp) + '%. Consider enabling extra usage.', priority: 2 });
            chrome.storage.local.set({ lastNotified: now });
        }
        if (r.notifyOnReset) {
            var lr = r.lastResetNotified || 0;
            if (lastU.s > 50 && sp < 10 && (now - lr > 300000)) {
                chrome.notifications.create('sr-' + now, { type: 'basic', iconUrl: 'icons/icon128.png', title: 'Claude Power Usage', message: 'Session limit reset. Full capacity available.', priority: 1 });
                chrome.storage.local.set({ lastResetNotified: now });
            }
            if (lastU.w > 50 && wp < 10 && (now - lr > 300000)) {
                chrome.notifications.create('wr-' + now, { type: 'basic', iconUrl: 'icons/icon128.png', title: 'Claude Power Usage', message: 'Weekly limit reset. Full capacity available.', priority: 1 });
                chrome.storage.local.set({ lastResetNotified: now });
            }
        }
        lastU = { s: sp, w: wp };
    });
}

function logSnap(st) {
    chrome.storage.local.get(['usageHistory', 'firstSnapshot'], function(r) {
        var h = r.usageHistory || [], now = Date.now(), last = h[h.length - 1];
        var minInterval = r.firstSnapshot ? 300000 : 0;
        if (last && (now - last.timestamp) < minInterval) return;
        h.push({
            timestamp: now,
            session: (st.session && st.session.percent) || 0,
            weekly: (st.weekly && st.weekly.percent) || 0,
            opus: (st.opus && st.opus.percent) || 0,
            tokens: (st.tokens && st.tokens.total) || 0,
            cost: (st.cost && st.cost.session) || 0,
            model: (st.model && st.model.label) || '-',
            messages: st.msgs || st.sessionMessages || 0
        });
        if (h.length > 2016) h.splice(0, h.length - 2016);
        chrome.storage.local.set({ usageHistory: h, firstSnapshot: true });
    });
}

function logPrompt(st) {
    if (!st.promptPreview || st.promptPreview.length < 3) return;
    chrome.storage.local.get('promptHistory', function(r) {
        var h = r.promptHistory || [], last = h[h.length - 1];
        if (last && last.preview === st.promptPreview) return;
        h.push({
            timestamp: Date.now(),
            preview: st.promptPreview,
            model: (st.model && st.model.label) || '-',
            chatName: (st.conv && st.conv.name) || '',
            chatId: (st.conv && st.conv.id) || '',
            sessionPct: (st.session && st.session.percent) || 0,
            weeklyPct: (st.weekly && st.weekly.percent) || 0,
            inputTokens: (st.tokens && st.tokens.ctx) || 0,
            cost: (st.cost && st.cost.last) || 0
        });
        if (h.length > 100) h.splice(0, h.length - 100);
        chrome.storage.local.set({ promptHistory: h });
    });
}

chrome.tabs.onActivated.addListener(function(i) {
    chrome.runtime.sendMessage({ target: 'sidepanel', type: 'TAB_CHANGED', tabId: i.tabId }).catch(function() {});
});
chrome.tabs.onUpdated.addListener(function(id, c) {
    if (c.status === 'complete') chrome.runtime.sendMessage({ target: 'sidepanel', type: 'PAGE_LOADED', tabId: id }).catch(function() {});
});