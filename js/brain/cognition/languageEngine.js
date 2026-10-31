/* CHAOSAI Language Cognition v1.0 — contextual, retrieval-first local orchestration.
 * This is not a neural language model. It coordinates local rules, specialist knowledge,
 * conversation context, declared tools, and an explicitly approved remote model path.
 */
(function (g) {
  'use strict';
  const MAX_INPUT = 12000, MAX_HISTORY = 10, MAX_TURN_LOG = 40;
  const followUps = /^(?:اشرحها?|اشرح اكثر|وضحها?|وضح اكثر|ليش\??|لماذا\??|كيف\??|كمل|اكمل|تابع|استمر|اعطني مثال(?:ا)?|مثال اخر|شنو تقصد|ماذا تقصد|ما هذا|ما معنى ذلك|تفصيل اكثر|زيدني|وبعدين|وماذا بعد|why\??|explain more|continue|give an example)$/iu;
  let sequence = 0;
  const turns = [];
  let lastTurn = null;
  const clean = (v, max = 500) => String(v ?? '').replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F-\u009F\u202A-\u202E\u2066-\u2069]/g, ' ').replace(/\s+/g, ' ').trim().slice(0, max);
  function normalize(value) {
    return clean(value, MAX_INPUT).normalize('NFKC').toLocaleLowerCase('ar')
      .replace(/[\u064B-\u065F\u0670\u0640]/g, '').replace(/[أإآٱ]/g, 'ا').replace(/ى/g, 'ي').replace(/ة/g, 'ه')
      .replace(/[٠-٩]/g, c => String('٠١٢٣٤٥٦٧٨٩'.indexOf(c))).replace(/[؟?!،,؛;:.()[\]{}"'`]/g, ' ').replace(/\s+/g, ' ').trim();
  }
  function historyRows(history) {
    return (Array.isArray(history) ? history : []).slice(-MAX_HISTORY).map(m => ({
      role: m?.role === 'assistant' ? 'assistant' : 'user',
      content: clean(m?.content, 800), timestamp: Number(m?.timestamp) || 0
    })).filter(m => m.content);
  }
  function contextSnapshot(history, sessionId, query) {
    const messages = historyRows(history);
    let indexed = null;
    try { indexed = g.CHAOSConversationMemory?.buildContext?.(sessionId || 'default', history || [], query) || null; } catch (_) {}
    const recentUser = [...messages].reverse().find(m => m.role === 'user' && !followUps.test(normalize(m.content)));
    const recentAssistant = [...messages].reverse().find(m => m.role === 'assistant');
    const topic = clean(indexed?.topic?.entity || indexed?.topic?.text || recentUser?.content || '', 220);
    const isFollowUp = followUps.test(normalize(query));
    return {
      available: messages.length > 0,
      recentTurns: messages.length,
      isFollowUp,
      topic: topic || null,
      recentAssistantAvailable: !!recentAssistant,
      keywords: Array.isArray(indexed?.keywords) ? indexed.keywords.slice(0, 8).map(x => clean(x?.word || x, 48)).filter(Boolean) : [],
      contextSource: indexed ? 'local-conversation-index' : messages.length ? 'active-session-window' : 'none',
      transcriptStoredByPlanner: false
    };
  }
  function toolChoices(intent, knowledgeRoute) {
    const type = intent?.type || 'conversation';
    const map = {
      calculator: ['math.safe-evaluate'], store: ['apps.catalog.search'], websearch: ['web.explicit-search'],
      open: ['apps.launch.explicit'], note: ['notes.local.create'], task: ['planner.local.create'], event: ['calendar.local.create'],
      diagnostics: ['system.diagnostics.read'], help: ['system.help.read'], time: ['device.clock.read'],
      conversation: knowledgeRoute?.handled ? ['knowledge.local.retrieve', 'conversation.context.read'] : ['conversation.context.read', 'language.local.respond'],
      unknown: ['knowledge.local.retrieve', 'conversation.context.read', 'language.local.respond']
    };
    const rows = (map[type] || ['knowledge.local.retrieve', 'conversation.context.read']).slice();
    if (knowledgeRoute?.handled && !rows.includes('knowledge.local.retrieve')) rows.unshift('knowledge.local.retrieve');
    return rows;
  }
  function plan(input, options = {}) {
    const text = clean(input, MAX_INPUT);
    if (!text) return { ok: false, code: 'EMPTY_INPUT', message: 'لا يوجد نص لتحليله.' };
    const context = contextSnapshot(options.history, options.sessionId, text);
    const intent = g.VoidIntentEngine?.classify?.(text) || { type: 'unknown', confidence: 0, original: text };
    let cognitive = null;
    try { cognitive = g.CHAOSAI?.analyze?.(text) || g.CHAOSAIDecisionEngine?.plan?.(text) || null; } catch (_) {}
    // Avoid running a specialist twice: CHAOSAI.analyze already performs its own
    // knowledge-route selection and records an aggregate outcome. Read the chosen
    // module metadata without invoking the answer handler a second time.
    let knowledgeRoute = null;
    const routePrefix = 'knowledge.local.';
    if (typeof cognitive?.route === 'string' && cognitive.route.startsWith(routePrefix)) {
      const moduleId = cognitive.route.slice(routePrefix.length).split(/[/?#]/)[0];
      const meta = g.CHAOSKnowledgeRouter?.byId?.(moduleId);
      if (meta) knowledgeRoute = { handled: true, module: meta.id, category: meta.category, confidence: Number(cognitive.adjustedConfidence) || 0.75 };
    } else if (!cognitive && ['conversation', 'unknown'].includes(intent.type)) {
      try { const routed = g.CHAOSKnowledgeRouter?.route?.(text); if (routed?.handled) knowledgeRoute = { handled: true, module: routed.module, category: routed.category, confidence: routed.confidence }; } catch (_) {}
    }
    const steps = [
      { id: 'preflight', label: 'تنظيف الإدخال وفحص حدوده', status: 'planned', data: 'length + validation فقط' },
      { id: 'intent', label: 'تصنيف النية واللغة', status: 'planned', data: intent.type || 'unknown' },
      { id: 'context', label: 'استرجاع سياق محلي محدود عند الحاجة', status: context.available ? 'available' : 'skipped', data: context.isFollowUp && context.topic ? 'follow-up-context-candidate' : context.contextSource },
      { id: 'retrieve', label: 'اختيار أداة أو وحدة معرفة متخصصة', status: knowledgeRoute?.handled ? 'selected' : 'planned', data: knowledgeRoute?.module || cognitive?.route || intent.type || 'conversation' },
      { id: 'execute', label: 'تنفيذ محلي عبر المسار المصرّح فقط', status: 'pending', data: 'لا shell ولا تنفيذ كود مولّد' },
      { id: 'evaluate', label: 'تقييم النتيجة وتسجيل إحصاء مجمّع', status: 'pending', data: 'بلا حفظ للنص الخام في سجل التعلّم' }
    ];
    const turn = {
      ok: true, schema: 'chaosai.language-plan.v1', id: `turn_${Date.now().toString(36)}_${(++sequence).toString(36)}`,
      createdAt: new Date().toISOString(), inputLength: text.length, normalizedLength: normalize(text).length,
      intent: { type: intent.type || 'unknown', confidence: Number(intent.confidence) || 0, needsClarification: !!intent.needsClarification },
      route: cognitive?.route || (knowledgeRoute?.handled ? `knowledge.local.${knowledgeRoute.module}` : 'conversation.local'),
      action: cognitive?.action || 'respond-locally',
      algorithm: cognitive?.executionPlan?.algorithm || (knowledgeRoute?.handled ? `local.knowledge.${knowledgeRoute.module}.retrieve` : 'local.contextual-orchestration'),
      toolChoices: toolChoices(intent, knowledgeRoute), context, steps,
      confidence: Number(cognitive?.adjustedConfidence ?? intent.confidence) || 0,
      adjustedConfidence: Number(cognitive?.adjustedConfidence ?? intent.confidence) || 0,
      requiresExplicitAction: !!cognitive?.requiresExplicitAction,
      executionPlan: cognitive?.executionPlan || { algorithm: 'local.contextual-orchestration', inputs: {}, requiredFields: [], missingFields: [], steps: steps.map(x => x.label), ready: true, rawPromptPersisted: false },
      warnings: Array.isArray(cognitive?.warnings) ? cognitive.warnings.slice() : [],
      learningState: cognitive?.learningState || {},
      preferenceHints: cognitive?.preferenceHints || {},
      executionPolicy: { localFirst: true, implicitCloud: false, requiresApprovalForCloud: true, requiresDeclaredCapabilityForAppData: true, executesGeneratedCode: false },
      modelProfile: { family: 'hybrid-symbolic-retrieval', neuralModelLoaded: false, localNgramAvailable: !!g.CHAOSLocalTextModel, specialistModules: g.CHAOSKnowledgeRouter?.list?.().length || 0 },
      explanation: `صنّف النظام الإدخال ضمن «${intent.type || 'unknown'}»، ويستخدم ${context.available ? 'سياق الجلسة المحلية المحدود' : 'الطلب الحالي فقط'} قبل اختيار أداة مسموح بها. لم يُرسل نص إلى الشبكة ولم يُحفظ النص الخام في سجل التعلّم.`,
      rawInputStored: false, knowledge: knowledgeRoute?.handled ? { module: knowledgeRoute.module, category: knowledgeRoute.category, confidence: knowledgeRoute.confidence } : null
    };
    lastTurn = turn;
    return JSON.parse(JSON.stringify(turn));
  }
  function begin(input, options = {}) {
    const p = plan(input, options);
    if (!p.ok) return p;
    const record = { id: p.id, startedAt: Date.now(), inputLength: p.inputLength, intent: p.intent.type, route: p.route, algorithm: p.algorithm, status: 'running', stages: p.steps.map(x => x.id), responseLength: 0, elapsedMs: 0, errorCode: '' };
    turns.push(record); while (turns.length > MAX_TURN_LOG) turns.shift();
    return { plan: p, record };
  }
  function complete(id, response, error) {
    const row = turns.find(x => x.id === id);
    if (!row) return { ok: false, code: 'TURN_NOT_FOUND' };
    row.elapsedMs = Math.max(0, Date.now() - row.startedAt);
    row.responseLength = clean(response, 32000).length;
    row.status = error ? 'failed' : 'completed';
    row.errorCode = error ? clean(error.code || error.name || 'EXECUTION_FAILED', 80) : '';
    row.completedAt = new Date().toISOString();
    if (lastTurn?.id === id) lastTurn.steps = lastTurn.steps.map(s => ({ ...s, status: s.id === 'execute' ? (error ? 'failed' : 'completed') : s.id === 'evaluate' ? 'completed' : s.status }));
    try { g.CHAOSAI?.observe?.({ handled: true, ok: !error }); } catch (_) {}
    try { g.VoidEventBus?.emit?.('chaosai:turn-completed', { id, status: row.status, intent: row.intent, elapsedMs: row.elapsedMs }); } catch (_) {}
    return { ok: !error, trace: publicTrace(row) };
  }
  function publicTrace(row) {
    if (!row) return null;
    const { id, startedAt, inputLength, intent, route, algorithm, status, stages, responseLength, elapsedMs, errorCode, completedAt } = row;
    return { id, startedAt, inputLength, intent, route, algorithm, status, stages: stages.slice(), responseLength, elapsedMs, errorCode, completedAt: completedAt || null, rawInputStored: false, rawOutputStored: false };
  }
  function trace() { return turns.slice().reverse().map(publicTrace); }
  function explain() { return lastTurn ? JSON.parse(JSON.stringify(lastTurn)) : null; }
  function clearTrace() { turns.length = 0; lastTurn = null; return { ok: true, cleared: true, contentStored: false }; }
  function resolveFollowUp(input, history, sessionId) {
    const text = clean(input, MAX_INPUT), context = contextSnapshot(history, sessionId, text);
    if (!context.isFollowUp || !context.topic) return { resolved: false, input: text, context };
    return { resolved: true, input: text, topic: context.topic, suggestedQuery: `السياق السابق هو «${context.topic}». طلب المستخدم الحالي: ${text}`, context, requiresModelReasoning: true };
  }
  function status() {
    return {
      version: '1.0.0', engine: 'contextual-language-orchestrator', mode: 'local-first', neuralModelLoaded: false,
      components: {
        intentClassifier: !!g.VoidIntentEngine, decisionPlanner: !!g.CHAOSAIDecisionEngine, cognitiveMetrics: !!g.CHAOSAI,
        knowledgeRouter: !!g.CHAOSKnowledgeRouter, conversationMemory: !!g.CHAOSConversationMemory,
        localTextModel: !!g.CHAOSLocalTextModel, remoteGateway: !!g.CHAOSAIGateway,
        taskManager: !!g.VoidTaskManager, unifiedCore: !!g.CHAOSOSCore
      },
      recentTraceCount: turns.length, rawConversationLogging: false,
      note: 'هذا محرك تنسيق واسترجاع محلي، وليس نموذجًا لغويًا عصبيًا مدرّبًا.'
    };
  }
  g.CHAOSAILanguageEngine = { version: '1.0.0', normalize, plan, begin, complete, trace, explain, clearTrace, resolveFollowUp, contextSnapshot, status };
})(window);
