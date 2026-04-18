(function() {
'use strict';

var MODELS = {
    'claude-opus-4-6': { label: 'Opus 4.6', ic: 5, oc: 25 },
    'claude-sonnet-4-6': { label: 'Sonnet 4.6', ic: 3, oc: 15 },
    'claude-haiku-4-5': { label: 'Haiku 4.5', ic: 0.8, oc: 4 },
    'claude-opus-4-5-20250918': { label: 'Opus 4.5', ic: 15, oc: 75 },
    'claude-sonnet-4-5-20241022': { label: 'Sonnet 4.5', ic: 3, oc: 15 }
};

var sessionMsgCount = 0;
var parseErrors = 0;

function estTokens(t) { return t && typeof t === 'string' ? Math.ceil(t.length / 3.5) : 0; }

function getModel(b) {
    if (!b) return null;
    if (typeof b === 'string') { try { b = JSON.parse(b); } catch(e) { return null; } }
    return b.model || null;
}

function convId() { var m = window.location.pathname.match(/\/chat\/([a-f0-9-]+)/); return m ? m[1] : null; }
function projId() { var m = window.location.pathname.match(/\/project\/([a-f0-9-]+)/); return m ? m[1] : null; }

function emit(type, detail) {
    window.dispatchEvent(new CustomEvent('CPU_DATA', { detail: Object.assign({ type: type, timestamp: Date.now() }, detail) }));
}

function extractUserText(reqBody) {
    if (typeof reqBody.prompt === 'string') return reqBody.prompt;
    if (!reqBody.messages || !Array.isArray(reqBody.messages)) return '';
    
    for (var i = reqBody.messages.length - 1; i >= 0; i--) {
        var msg = reqBody.messages[i];
        if (msg.role !== 'user') continue;
        
        if (typeof msg.content === 'string') return msg.content;
        if (Array.isArray(msg.content)) {
            var parts = [];
            for (var j = 0; j < msg.content.length; j++) {
                var c = msg.content[j];
                if (c.type === 'text' && c.text) parts.push(c.text);
                else if (c.type === 'image') parts.push('[Attachment: Image]');
                else if (c.type === 'document' && c.source) parts.push('[Attachment: Document]');
            }
            return parts.join('\n');
        }
    }
    return '';
}

var origFetch = window.fetch;

window.fetch = function() {
    var args = arguments;
    var resource = args[0];
    var options = args[1] || {};
    var url = typeof resource === 'string' ? resource : (resource && resource.url ? resource.url : '');

    if (!url.includes('claude.ai') && !url.startsWith('/')) return origFetch.apply(this, args);

    var method = (options.method || 'GET').toUpperCase();
    var reqBody = null;
    if (options.body) { try { reqBody = typeof options.body === 'string' ? JSON.parse(options.body) : options.body; } catch(e) { reqBody = null; } }

    if ((url.includes('/completion') || (url.includes('/chat_conversations') && method === 'POST')) && reqBody) {
        var model = getModel(reqBody);
        if (reqBody.prompt || reqBody.messages) {
            sessionMsgCount++;
            var inTok = estTokens(JSON.stringify(reqBody.prompt || reqBody.messages || ''));
            var mi = model ? (MODELS[model] || { label: model, ic: 3, oc: 15 }) : { label: null, ic: 3, oc: 15 };
            var promptPreview = extractUserText(reqBody).substring(0, 200);
            
            emit('REQUEST', { model: model, modelLabel: mi.label, inputTokens: inTok, inputCostPer1M: mi.ic, outputCostPer1M: mi.oc, conversationId: convId(), projectId: projId(), sessionMessages: sessionMsgCount, promptPreview: promptPreview, hasAttachments: !!(reqBody.attachments && reqBody.attachments.length || reqBody.files && reqBody.files.length), thinkingEnabled: !!(reqBody.thinking || (reqBody.metadata && reqBody.metadata.thinking)) });
        }
    }

    return origFetch.apply(this, args).then(function(response) {
        if (url.includes('/completion') && response.ok) {
            var cl = response.clone();
            (function() {
                var ct = cl.headers.get('content-type') || '';
                if (ct.includes('text/event-stream')) {
                    var reader = cl.body && cl.body.getReader ? cl.body.getReader() : null;
                    if (!reader) return;
                    
                    var decoder = new TextDecoder(); 
                    var outText = ''; 
                    var usage = null; 
                    var det = null;
                    var streamNormalClose = false;

                    function pump() {
                        return reader.read().then(function(result) {
                            if (result.done) {
                                var outTok = (usage && usage.output_tokens) || estTokens(outText);
                                var inTok2 = (usage && usage.input_tokens) || 0;
                                var m2 = det || getModel(reqBody);
                                var mi2 = m2 ? (MODELS[m2] || { ic: 3, oc: 15 }) : { ic: 3, oc: 15 };
                                var estCost = ((inTok2 * mi2.ic) + (outTok * mi2.oc)) / 1000000;
                                
                                emit('RESPONSE', { outputTokens: outTok, inputTokens: inTok2, estimatedCost: estCost, conversationId: convId(), cacheCreation: (usage && usage.cache_creation_input_tokens) || 0, cacheRead: (usage && usage.cache_read_input_tokens) || 0 });
                                
                                emit('CHAT_TURN_PERSIST', {
                                    conversationId: convId(),
                                    projectId: projId(),
                                    model: m2,
                                    userText: extractUserText(reqBody),
                                    assistantText: outText,
                                    truncated: !streamNormalClose,
                                    inputTokens: inTok2,
                                    outputTokens: outTok,
                                    costUsd: estCost
                                });

                                var codeRx = /```(\w*)\n([\s\S]*?)```/g, cm;
                                while ((cm = codeRx.exec(outText)) !== null) {
                                    if (cm[2].length > 20) {
                                        var lang = cm[1] || 'text';
                                        var firstLine = cm[2].split('\n')[0].trim();
                                        emit('CODE_BLOCK', { language: lang, content: cm[2].substring(0, 2000), label: firstLine.substring(0, 60) || lang + ' block' });
                                    }
                                }
                                parseErrors = 0;
                                return;
                            }
                            
                            var chunk = decoder.decode(result.value, { stream: true }); 
                            var lines = chunk.split('\n');
                            
                            for (var i = 0; i < lines.length; i++) {
                                if (!lines[i].startsWith('data: ')) continue;
                                var js = lines[i].slice(6).trim(); 
                                if (js === '[DONE]') {
                                    streamNormalClose = true;
                                    continue;
                                }
                                try {
                                    var ev = JSON.parse(js);
                                    if (ev.type === 'content_block_delta' && ev.delta && ev.delta.text) outText += ev.delta.text;
                                    if (typeof ev.completion === 'string') outText += ev.completion;
                                    if (ev.delta && typeof ev.delta.completion === 'string') outText += ev.delta.completion;
                                    if (ev.type === 'message_delta' && ev.usage) usage = ev.usage;
                                    if (ev.model) det = ev.model;
                                    if (ev.usage) emit('USAGE_UPDATE', { inputTokens: ev.usage.input_tokens, outputTokens: ev.usage.output_tokens });
                                    if (ev.type === 'content_block_start' && ev.content_block && ev.content_block.type === 'tool_use') {
                                        emit('ARTIFACT', { label: (ev.content_block.input && ev.content_block.input.path) || ev.content_block.name || 'artifact', language: '', content: '' });
                                    }
                                } catch(e) {
                                    parseErrors++;
                                    if (parseErrors > 10) emit('PARSE_ERROR', { count: parseErrors });
                                }
                            }
                            return pump();
                        });
                    }
                    pump().catch(function(){});
                } else {
                    cl.text().then(function(t) { try { var j = JSON.parse(t); if (j.usage) emit('RESPONSE', { outputTokens: j.usage.output_tokens || estTokens(t), inputTokens: j.usage.input_tokens || 0, estimatedCost: 0, conversationId: convId() }); } catch(e){} }).catch(function(){});
                }
            })();
        }

        if (url.includes('/chat_conversations') && method === 'GET' && response.ok) {
            response.clone().json().then(function(d) { if (d && typeof d === 'object') emit('CONVERSATION_META', { name: d.name || d.title || '', conversationId: d.uuid || d.id || convId(), model: d.model || null, projectId: d.project_uuid || projId(), createdAt: d.created_at, messageCount: (d.chat_messages && d.chat_messages.length) || 0 }); }).catch(function(){});
        }

        if (url.includes('/settings') && url.includes('/usage') && response.ok) {
            response.clone().json().then(function(d) { emit('OFFICIAL_USAGE', d); }).catch(function(){});
        }

        return response;
    });
};

emit('INTERCEPTOR_READY', { version: '1.0.0' });

})();