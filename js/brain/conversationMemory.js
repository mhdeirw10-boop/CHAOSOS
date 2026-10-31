/* CHAOSOS Conversation Memory v2.4.2
 * Bounded, offline index over the complete saved transcript. It stores a compact
 * keyword/topic index plus selected excerpts; it does not send chat text online.
 */
(function (root) {
  'use strict';
  const STORE_KEY = 'chaosos_conversation_index_v1';
  const VERSION = 1;
  const MAX_SESSIONS = 30;
  const MAX_KEYWORDS = 850;
  const MAX_PHRASES = 360;
  const MAX_TOPICS = 180;
  const MAX_EXCERPTS = 180;
  const MAX_INDEXED_MESSAGES = 20000; // detailed backfill window, not a lifetime conversation limit
  const MAX_OLDER_SAMPLES = 1800;
  const MAX_MESSAGE_CHARS = 6000;
  const MAX_CONTEXT_CHARS = 10500;
  const AR = { '٠':'0','١':'1','٢':'2','٣':'3','٤':'4','٥':'5','٦':'6','٧':'7','٨':'8','٩':'9' };
  const STOP = new Set(('في من على الى إلى عن أن إن انه انها هو هي هم هن هذا هذه ذلك تلك هناك هنا ما ماذا هل كيف لي لك له لها به بها مع او أو ثم قد لا لم لن ماكو شنو وين ليش بس كل بعض بين بعد قبل عند جدا جدًا اكثر أكثر اقل أقل اذا إذا لان لأن وكان كانت يكون تكون ايضا أيضا فقط كما مثل حيث الذي التي الذين اللاتي حتى اما أما اي أي يا نحن انت أنت انتي انتو انا أنا اكو اكوو هذاك هاي هذي هذني ذاك ذيج بيها بيه منه منها الي إلي مال مالتي مالك مالكم اللي اليه اليها هوه هسه الان الآن اليوم امس أمس باجر غدا بكرة شلون شنو يعني رجاء من فضلك ممكن اريد أريد ابي ابغي اكتب احكي اكول اقول اسال أسأل ابحث أبحث بحث دورلي دور لي كمل اكمل أكمل تابع متابعة نعم اي إي اوكي أوك تمام زين جيد طيب شكرا شكرًا').split(/\s+/));
  const FOLLOWUP_ONLY = new Set(['ابحث','بحث','دور','دورلي','دور لي','ابحثلي','ابحث عن ذلك','ابحث عنها','ابحث عنه','ابحث عن هذا','كمل','اكمل','تابع','استمر','وضح','وضح اكثر','معلومات اكثر','شنو بعد','وبعدين','ثم ماذا','نعم','اي','اي نعم','تمام','زين','اوكي']);
  const SEARCH_HEAD = /^(?:بحث|ابحث|ابحث في الويب|دور|دورلي|دور لي|ابحثلي|search|search web)(?:\s*[:：]\s*|\s+)(.+)$/iu;
  const ENTITY_ALIASES = [
    { canonical: 'العراق', aliases: ['العراق','جمهورية العراق','iraq','iraqi'] },
    { canonical: 'بغداد', aliases: ['بغداد','baghdad'] },
    { canonical: 'دجلة والفرات', aliases: ['دجلة','الفرات','دجلة والفرات','tigris euphrates'] },
    { canonical: 'CHAOSOS', aliases: ['chaosos','chaos os','نظام الفوضى'] },
    { canonical: 'VoidOS', aliases: ['voidos','void os'] },
    { canonical: 'VoidTube', aliases: ['voidtube','void tube'] }
  ];

  function normalize(value) {
    return String(value ?? '').normalize('NFKC')
      .replace(/[٠-٩]/g, c => AR[c])
      .replace(/[\u064B-\u065F\u0670\u0640]/g, '')
      .replace(/[أإآٱ]/g, 'ا').replace(/ى/g, 'ي').replace(/ؤ/g, 'و').replace(/ئ/g, 'ي')
      .replace(/ة/g, 'ه').toLocaleLowerCase('ar')
      .replace(/[“”"'`´.,،؛:!?؟()[\]{}<>|\\/]+/g, ' ')
      .replace(/[\u0000-\u001F\u007F-\u009F\u202A-\u202E\u2066-\u2069]/g, ' ')
      .replace(/\s+/g, ' ').trim();
  }
  function tokens(value) {
    return (normalize(value).match(/[\p{L}\p{N}]{2,}/gu) || [])
      .filter(t => !STOP.has(t) && t.length <= 32).slice(0, 320);
  }
  function uniqueTokens(value) { return [...new Set(tokens(value))]; }
  function safeRead() {
    try {
      const value = JSON.parse(localStorage.getItem(STORE_KEY) || '{}');
      return value && value.version === VERSION && value.sessions && typeof value.sessions === 'object'
        ? value : { version: VERSION, sessions: {} };
    } catch (_) { return { version: VERSION, sessions: {} }; }
  }
  function safeWrite(data) {
    try { localStorage.setItem(STORE_KEY, JSON.stringify(data)); return true; }
    catch (error) { return false; }
  }
  function blankState(id) {
    return { id: String(id), processedCount: 0, indexedMessageCount: 0, indexedUserMessages: 0, skippedOlderMessages: 0, keywordWeights: {}, phraseWeights: {}, topics: [], excerpts: [], currentTopic: null, summary: '', lastMessageSignature: '', lastIndexedAt: 0 };
  }
  function isContextualFollowup(content) {
    const n = normalize(content);
    if (FOLLOWUP_ONLY.has(n)) return true;
    if (/^(?:اقتصادها|تاريخها|عاصمتها|سكانها|مساحتها|موقعها|لغتها|حدودها|رئيسها|اخبارها|مواردها|سياستها|مناخها|ديانتها|عملتها|جيشها|صناعتها|ثقافتها|عاصمته|اقتصاده|تاريخه|سكانه|مساحته|موقعه|حدوده|موارده|مناخه)$/u.test(n)) return true;
    if (/^(?:شنو|ما|ماذا|كم|وين|اين|كيف|ليش|لماذا|هل)\s+(?:اقتصادها|تاريخها|عاصمتها|سكانها|مساحتها|موقعها|لغتها|حدودها|رئيسها|اخبارها|مواردها|سياستها|مناخها|عملتها|اقتصاده|تاريخه|عاصمته|سكانه|مساحته|موقعه|حدوده|موارده)$/u.test(n)) return true;
    return false;
  }
  function isCommandOrFollowup(content) {
    const n = normalize(content);
    if (FOLLOWUP_ONLY.has(n) || isContextualFollowup(n)) return true;
    return /^(?:بحث|ابحث|ابحث في الويب|دورلي|دور لي|افتح|شغل|شغّل|احسب|احفظ|تذكر|مسح المحادثة|clear|status|diagnostics)(?:\s|:|$)/iu.test(n);
  }
  function canonicalEntity(terms, text) {
    const n = normalize(text);
    for (const entity of ENTITY_ALIASES) {
      if (entity.aliases.some(alias => normalize(alias) === n)) return entity.canonical;
      if (entity.canonical === 'العراق' && terms.includes('العراق')) return 'العراق';
    }
    // Common descriptive paraphrases still refer to Iraq even when the user omits its name.
    if ((n.includes('دجله') && n.includes('الفرات')) || (n.includes('غرب اسيا') && (n.includes('دجله') || n.includes('الفرات')))) return 'العراق';
    return '';
  }
  function messageSignature(message) {
    return String(message?.role || 'user') + '|' + normalize(String(message?.content || '').slice(0, 240)) + '|' + String(Number(message?.timestamp) || 0);
  }
  function addWeight(target, key, weight) {
    if (!key || key.length < 2 || key.length > 48) return;
    target[key] = Math.min(5000, (Number(target[key]) || 0) + weight);
  }
  function trimWeights(target, cap) {
    const entries = Object.entries(target).sort((a,b) => b[1]-a[1]).slice(0, cap);
    for (const key of Object.keys(target)) delete target[key];
    for (const [key, value] of entries) target[key] = value;
  }
  function addMessageToState(state, message, index) {
    const role = message && message.role === 'assistant' ? 'assistant' : 'user';
    const content = String(message?.content ?? '').slice(0, MAX_MESSAGE_CHARS);
    const ts = Number(message?.timestamp) || Date.now();
    const n = normalize(content);
    const words = uniqueTokens(content);
    state.processedCount = Math.max(Number(state.processedCount) || 0, index + 1);
    state.indexedMessageCount = (Number(state.indexedMessageCount) || 0) + 1;
    if (!content) return;
    const weight = role === 'user' ? 2.4 : 0.28;
    for (const word of words) addWeight(state.keywordWeights, word, weight * Math.min(1.5, 1 + Math.max(0, word.length - 5) * 0.06));
    if (role === 'user' && words.length > 1) {
      for (let i = 0; i < words.length - 1; i++) {
        const phrase = words[i] + ' ' + words[i+1];
        if (phrase.length <= 54) addWeight(state.phraseWeights, phrase, 1.1);
      }
    }
    if (role === 'user') {
      state.indexedUserMessages++;
      const entity = canonicalEntity(words, content);
      const anchoredFollowup = !!state.currentTopic && isContextualFollowup(content);
      const substantive = !isCommandOrFollowup(content) && !anchoredFollowup && (words.length >= 2 || !!entity || content.length >= 5);
      if (anchoredFollowup && content.length > 2) {
        state.lastFollowup = { text: content.slice(0, 220), normalized: n.slice(0, 220), at: ts, index, topic: state.currentTopic.entity || state.currentTopic.text };
      }
      if (substantive) {
        const topic = { text: content.slice(0, 260), normalized: n.slice(0, 260), tokens: words.slice(0, 24), entity, at: ts, index };
        const previous = state.topics[state.topics.length - 1];
        if (!previous || previous.normalized !== topic.normalized) state.topics.push(topic);
        else state.topics[state.topics.length - 1] = topic;
        state.currentTopic = topic;
        const importance = Math.min(20, 2 + words.length * 0.65 + (entity ? 4 : 0) + (content.includes('?') || content.includes('؟') ? 1 : 0));
        state.excerpts.push({ text: content.slice(0, 360), normalized: n.slice(0, 360), tokens: words.slice(0, 28), weight: importance, at: ts, index });
      }
    }
    state.lastMessageSignature = messageSignature(message);
  }
  function compactState(state) {
    trimWeights(state.keywordWeights, MAX_KEYWORDS);
    trimWeights(state.phraseWeights, MAX_PHRASES);
    if (state.topics.length > MAX_TOPICS) state.topics = state.topics.slice(-MAX_TOPICS);
    if (state.excerpts.length > MAX_EXCERPTS) {
      const recent = state.excerpts.slice(-80);
      const old = state.excerpts.slice(0, -80).sort((a,b) => b.weight-a.weight).slice(0, MAX_EXCERPTS-80);
      state.excerpts = [...old, ...recent].sort((a,b) => a.index-b.index);
    }
    const terms = Object.entries(state.keywordWeights).sort((a,b) => b[1]-a[1]).slice(0, 18).map(([k]) => k);
    const topics = state.topics.slice(-8).map(t => t.entity || t.text.slice(0, 80));
    state.summary = ('كلمات متكررة عبر المحادثة المفهرسة: ' + terms.join('، ') + '. موضوعات حديثة: ' + [...new Set(topics)].join(' | ')).slice(0, 2200);
    state.lastIndexedAt = Date.now();
    return state;
  }
  function index(sessionId, messages) {
    const id = String(sessionId || 'default').slice(0, 120);
    const rows = Array.isArray(messages) ? messages : [];
    const store = safeRead();
    let state = store.sessions[id];
    const lastSig = rows.length ? messageSignature(rows[rows.length - 1]) : '';
    const invalid = !state || !Number.isInteger(state.processedCount) || state.processedCount > rows.length || !state.keywordWeights || !state.excerpts;
    const staleTail = !invalid && rows.length === (Number(state.totalTranscriptMessages) || 0) && rows.length > 0 && state.lastMessageSignature && state.lastMessageSignature !== lastSig;
    const impossibleBacklog = !invalid && rows.length - state.processedCount > MAX_INDEXED_MESSAGES;
    if (invalid || staleTail || impossibleBacklog) state = blankState(id);

    // For a very large imported transcript, sample the old tail at a bounded rate,
    // then index the latest 20,000 messages fully. New messages after that continue
    // to be indexed incrementally; the number 20,000 is not a lifetime cap.
    if (state.processedCount === 0 && rows.length > MAX_INDEXED_MESSAGES) {
      const recentStart = rows.length - MAX_INDEXED_MESSAGES;
      const oldCount = recentStart;
      const stride = Math.max(1, Math.ceil(oldCount / MAX_OLDER_SAMPLES));
      let oldSamples = 0;
      for (let i = 0; i < recentStart; i += stride) {
        addMessageToState(state, rows[i], i);
        oldSamples++;
      }
      state.skippedOlderMessages = Math.max(0, oldCount - oldSamples);
      // Ensure cursor moves to the detailed recent window even if sampling left gaps.
      state.processedCount = recentStart;
      for (let i = recentStart; i < rows.length; i++) addMessageToState(state, rows[i], i);
    } else {
      for (let i = state.processedCount; i < rows.length; i++) addMessageToState(state, rows[i], i);
    }
    state.indexLimitReached = (Number(state.skippedOlderMessages) || 0) > 0;
    state.totalTranscriptMessages = rows.length;
    state.lastMessageSignature = lastSig;
    compactState(state);
    store.sessions[id] = state;
    const keys = Object.keys(store.sessions).sort((a,b) => Number(store.sessions[b]?.lastIndexedAt||0)-Number(store.sessions[a]?.lastIndexedAt||0));
    for (const old of keys.slice(MAX_SESSIONS)) delete store.sessions[old];
    safeWrite(store);
    return state;
  }
  function getState(sessionId) {
    const id = String(sessionId || 'default').slice(0, 120);
    return safeRead().sessions[id] || blankState(id);
  }
  function scoreExcerpt(queryTokens, excerpt) {
    if (!queryTokens.length || !excerpt.tokens?.length) return 0;
    const set = new Set(excerpt.tokens); let overlap = 0;
    for (const t of queryTokens) if (set.has(t)) overlap += t.length > 4 ? 1.25 : 1;
    return overlap / Math.sqrt(queryTokens.length * Math.max(1, set.size));
  }
  function buildContext(sessionId, messages, currentQuery) {
    const state = index(sessionId, messages);
    const qTokens = uniqueTokens(currentQuery || '');
    const relevant = state.excerpts.map(e => ({ ...e, score: scoreExcerpt(qTokens, e) }))
      .filter(e => e.score >= 0.22 && normalize(e.text) !== normalize(currentQuery || ''))
      .sort((a,b) => b.score-a.score || b.index-a.index).slice(0, 6)
      .map(e => ({ role:'user', content:e.text, relevance:Number(e.score.toFixed(3)), index:e.index }));
    const recent = (Array.isArray(messages) ? messages.slice(-14) : []).map(m => ({
      role: m?.role === 'assistant' ? 'assistant' : 'user', content: String(m?.content ?? '').slice(0, 650), timestamp: Number(m?.timestamp)||0
    }));
    const topKeywords = Object.entries(state.keywordWeights).sort((a,b) => b[1]-a[1]).slice(0, 28).map(([word, weight]) => ({ word, weight: Number(weight.toFixed(2)) }));
    const topic = state.currentTopic ? { text:state.currentTopic.text, normalized:state.currentTopic.normalized, entity:state.currentTopic.entity||'', tokens:state.currentTopic.tokens||[] } : null;
    const data = { sessionId:String(sessionId||'default'), totalMessages:state.totalTranscriptMessages || state.processedCount,
      indexedMessages:Number(state.indexedMessageCount)||0, indexedUserMessages:state.indexedUserMessages, skippedOlderMessages:Number(state.skippedOlderMessages)||0, indexLimitReached:!!state.indexLimitReached,
      topic, summary:state.summary, keywords:topKeywords, recentMessages:recent, relevantMessages:relevant,
      topicCount:state.topics.length, excerptCount:state.excerpts.length };
    let chars = data.summary.length + recent.reduce((n,x)=>n+x.content.length,0) + relevant.reduce((n,x)=>n+x.content.length,0);
    while (chars > MAX_CONTEXT_CHARS && data.relevantMessages.length) { chars -= data.relevantMessages.pop().content.length; }
    while (chars > MAX_CONTEXT_CHARS && data.recentMessages.length > 6) { chars -= data.recentMessages.shift().content.length; }
    return data;
  }
  function isSearchOnly(query) { return ['ابحث','بحث','دور','دورلي','دور لي','ابحثلي','search','search web'].includes(normalize(query)); }
  function isReferenceToCurrentTopic(query) { return /^(?:ابحث عن ذلك|ابحث عنها|ابحث عنه|ابحث عن هذا|ابحث عن الموضوع|عن الموضوع|هذا الموضوع|الموضوع نفسه|دور على هذا|دورلي عليه)$/u.test(normalize(query)); }
  function currentTopic(sessionId, messages) {
    const state = index(sessionId, messages);
    return state.currentTopic ? { ...state.currentTopic } : null;
  }
  function parseSearchRequest(query, sessionId, messages) {
    const raw = String(query ?? '').trim();
    const norm = normalize(raw);
    let topic = '';
    let asked = false;
    const colon = raw.match(/^(?:بحث|ابحث(?:\s+في\s+الويب)?|أبحث|دورلي|دور\s+لي|search(?:\s+web)?)\s*[:：]\s*(.+)$/iu);
    const explicit = raw.match(/^(?:ابحث|أبحث|ابحث\s+في\s+الويب|دورلي|دور\s+لي|دور|search(?:\s+web)?)\s+(?:عن|في|حول|على)?\s*(.+)$/iu);
    if (colon && colon[1]) { asked = true; topic = colon[1].trim(); }
    else if (explicit && explicit[1]) {
      const rawTopic = explicit[1].trim();
      const topicNorm = normalize(rawTopic);
      if (isReferenceToCurrentTopic(raw) || ['ذلك','عن ذلك','عنها','عنه','هذا','هذا الموضوع','الموضوع'].includes(topicNorm)) asked = true;
      else { asked = true; topic = rawTopic; }
    } else if (isSearchOnly(raw) || isReferenceToCurrentTopic(raw)) asked = true;
    if (!asked) return null;
    if (!topic) {
      const target = currentTopic(sessionId, messages);
      if (target) topic = target.entity || target.text;
    }
    return { requested:true, topic:String(topic||'').trim().slice(0,300), source: topic ? 'explicit-or-conversation-context' : 'missing-context' };
  }
  function contextualReply(query, sessionId, messages) {
    const n = normalize(query);
    const state = index(sessionId, messages);
    const topic = state.currentTopic;
    if (!topic) return null;
    const isIraq = topic.entity === 'العراق' || /(?:^|\s)العراق(?:$|\s)/u.test(topic.normalized);
    if (isIraq && /^(?:شنو عاصمته|ما عاصمته|ما هي عاصمته|شنو عاصمتها|ما عاصمتها|ما هي عاصمتها|العاصمه|شنو العاصمه|ما العاصمه|عاصمته|عاصمتها)$/u.test(n)) return 'عاصمة العراق هي بغداد. هذه معلومة جغرافية عامة؛ أما بيانات السكان أو السياسة أو الأخبار الحالية فتحتاج مصدرًا حديثًا.';
    if (isIraq && /^(?:وين يقع|اين يقع|وين مكانه|اين مكانه|موقعه|موقع العراق|جغرافيته|وين العراق)$/u.test(n)) return 'العراق دولة في غرب آسيا، وتُعد بغداد عاصمتها. يمر نهرا دجلة والفرات في البلاد؛ إذا أردت تفاصيل أكثر أستطيع البحث عن موضوع محدد.';
    if (isIraq && /^(?:شنو|ما|ماذا|كم|وين|اين|كيف|ليش|لماذا|هل)?\s*(?:اقتصادها|تاريخها|سكانها|مساحتها|موقعها|لغتها|حدودها|مواردها|سياستها|مناخها|عملتها|اخبارها|اقتصاده|تاريخه|سكانه|مساحته|موقعه|حدوده|موارده)$/u.test(n)) {
      const asked = /(?:اخبار|سكان|اقتصاد|رئيس|سياست|عمله|سعر)/u.test(n)
        ? 'هذا الجانب قد يحتاج بيانات حديثة ومصدرًا موثوقًا. اكتب «أبحث» وسأربط البحث بالعراق من سياق هذه المحادثة.'
        : 'تقصد ' + n + ' عن العراق. أستطيع شرح الجانب العام محليًا، أو اكتب «أبحث» لجلب مصادر خارجية حوله.';
      return asked;
    }
    if (/^(?:كمل|اكمل|تابع|استمر|معلومات اكثر|وضح اكثر|وبعدين|ثم ماذا)$/u.test(n)) {
      const relevant = state.topics.slice(-3).map(t => t.entity || t.text.slice(0,100)).filter(Boolean);
      if (relevant.length) return 'أتابع من سياق المحادثة، لا من الرسالة الأخيرة وحدها. الموضوعات التي ألتقطها: ' + [...new Set(relevant)].join('؛ ') + '. حدّد النقطة التي تريد توسيعها أو اكتب «ابحث» لجلب مصادر خارجية.';
    }
    return null;
  }
  function report(sessionId) {
    const state = getState(sessionId || 'default');
    return { version:'2.4.2', mode:'bounded-full-recent-plus-sampled-archive', sessionId:state.id,
      totalMessages:state.totalTranscriptMessages||state.processedCount, indexedMessages:Number(state.indexedMessageCount)||0,
      indexedUserMessages:state.indexedUserMessages, skippedOlderMessages:Number(state.skippedOlderMessages)||0, uniqueKeywords:Object.keys(state.keywordWeights||{}).length,
      storedTopicExcerpts:(state.excerpts||[]).length, currentTopic:state.currentTopic?.entity||state.currentTopic?.text||null,
      indexLimitReached:!!state.indexLimitReached, onlineRequired:false,
      note:'يفهرس المحادثات الصغيرة بالكامل، ويأخذ عينات محدودة من الجزء القديم جدًا عند استيراد سجل ضخم مع فهرسة آخر 20,000 رسالة تفصيليًا. الرسائل الجديدة تستمر في الفهرسة دون حدّ عمري ثابت. لا تُرسل النصوص إلى الشبكة ولا ينتج ذلك فهمًا عصبيًا.' };
  }
  root.CHAOSConversationMemory = { version:'2.4.2', normalize, tokens, index, buildContext, currentTopic, parseSearchRequest, contextualReply, report, clear(id) {
    const data = safeRead(); delete data.sessions[String(id||'default')]; safeWrite(data);
  }, clearAll() { safeWrite({version:VERSION,sessions:{}}); } };
})(typeof window !== 'undefined' ? window : globalThis);
