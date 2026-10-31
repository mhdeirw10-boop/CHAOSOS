/* CHAOSOS Unified System Core v1.0 — safe integration facade across kernel, cognition, tasks, Android and cloud. */
(function (g) {
  'use strict';
  const toolRegistry = new Map();
  let active = null, lastTrace = null;
  const bounded = (value, max = 400) => String(value ?? '').replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F-\u009F\u202A-\u202E\u2066-\u2069]/g, ' ').trim().slice(0, max);
  const clone = value => { try { return JSON.parse(JSON.stringify(value)); } catch (_) { return null; } };
  function emit(name, detail) { try { g.VoidEventBus?.emit?.(`core:${name}`, detail); } catch (_) {} try { g.dispatchEvent?.(new CustomEvent(`chaosos:core-${name}`, { detail })); } catch (_) {} }
  function registerTool(id, metadata, handler) {
    const key = bounded(id, 80);
    if (!/^[a-z0-9_.-]{2,80}$/.test(key) || !metadata || typeof handler !== 'function' || toolRegistry.has(key)) return false;
    toolRegistry.set(key, { id: key, title: bounded(metadata.title || key, 100), description: bounded(metadata.description, 260), capability: bounded(metadata.capability || 'read-only', 80), handler });
    return true;
  }
  async function invokeTool(id, args = {}, options = {}) {
    const item = toolRegistry.get(bounded(id, 80));
    if (!item) return { ok: false, code: 'TOOL_NOT_FOUND', message: 'الأداة غير مسجّلة في النواة.' };
    if (item.capability !== 'read-only' && options.confirmed !== true) return { ok: false, code: 'CONFIRMATION_REQUIRED', message: 'الأداة تتطلب تأكيدًا صريحًا قبل التنفيذ.' };
    try {
      const result = await item.handler(args, options);
      return { ok: true, tool: item.id, capability: item.capability, result: clone(result) };
    } catch (error) {
      return { ok: false, code: bounded(error?.code || error?.name || 'TOOL_FAILED', 80), message: 'فشل تنفيذ الأداة المسجّلة.' };
    }
  }
  function setupTools() {
    if (!toolRegistry.has('system.diagnostics')) registerTool('system.diagnostics', { title: 'تشخيص النواة', description: 'قراءة حالة المكونات المسجلة', capability: 'read-only' }, () => g.VoidKernelDiagnostics?.snapshot?.() || g.VoidKernel?.diagnostics?.() || { available: false });
    if (!toolRegistry.has('knowledge.search')) registerTool('knowledge.search', { title: 'استرجاع المعرفة المحلية', description: 'بحث في وحدات المعرفة المقيدة', capability: 'read-only' }, ({ query } = {}) => {
      const result = g.CHAOSKnowledgeRouter?.route?.(bounded(query, 12000));
      return result?.handled ? { module: result.module, category: result.category, confidence: result.confidence, answer: result.answer } : { handled: false, message: 'لا توجد مطابقة محلية.' };
    });
    if (!toolRegistry.has('apps.inventory')) registerTool('apps.inventory', { title: 'فهرس التطبيقات', description: 'قراءة بيانات وصفية للتطبيقات المسجلة فقط', capability: 'read-only' }, () => { const catalog = Array.isArray(g.VoidAppCatalog?.apps) ? g.VoidAppCatalog.apps : []; const services = g.VoidServiceRegistry?.list?.() || []; const source = catalog.length ? catalog : services; return source.map(x => ({ id: x.id, title: x.title, path: x.path, state: x.state || 'registered', capabilities: x.capabilities || x.permissions || [] })); });
    if (!toolRegistry.has('tasks.status')) registerTool('tasks.status', { title: 'حالة المهام', description: 'ملخص طابور المهام المحلي', capability: 'read-only' }, () => g.VoidTaskManager?.status?.() || { available: false });
    if (!toolRegistry.has('services.status')) registerTool('services.status', { title: 'حالة الخدمات', description: 'حالة الخدمات المسجلة محليًا', capability: 'read-only' }, () => g.VoidServiceSupervisor?.status?.() || g.VoidServiceRegistry?.list?.() || []);
    if (!toolRegistry.has('cloud.status')) registerTool('cloud.status', { title: 'حالة السحابة', description: 'قراءة إعدادات الاتصال دون إرسال بيانات', capability: 'read-only' }, () => ({ cloud: g.CHAOSCloud?.status?.() || { enabled: false }, ai: g.CHAOSAIGateway?.status?.() || { enabled: false }, sync: g.CHAOSSync?.status?.() || { enabled: false }}));
    if (!toolRegistry.has('android.capabilities')) registerTool('android.capabilities', { title: 'قدرات Android', description: 'قراءة القدرات المتاحة وعدم تجاوز أذونات النظام', capability: 'read-only' }, () => g.VoidAndroidBridge?.list?.() || { available: false, realAndroidOSControl: false });
  }
  function integrationCheck() {
    setupTools();
    const checks = {
      kernel: !!g.VoidKernel,
      intentClassifier: !!g.VoidIntentEngine,
      taskRouter: !!g.VoidTaskRouter,
      knowledgeRouter: !!g.CHAOSKnowledgeRouter,
      cognitivePlanner: !!g.CHAOSAI,
      languageEngine: !!g.CHAOSAILanguageEngine,
      taskManager: !!g.VoidTaskManager,
      serviceSupervisor: !!g.VoidServiceSupervisor,
      appCapabilityBridge: !!g.CHAOSAppCapabilities,
      cloudBoundary: !!g.CHAOSCloud,
      cloudAI: !!g.CHAOSAIGateway,
      cloudSync: !!g.CHAOSSync,
      androidBridge: !!g.VoidAndroidBridge,
      eventBus: !!g.VoidEventBus
    };
    const missing = Object.keys(checks).filter(key => !checks[key]);
    return {
      version: '3.0.0', ok: missing.length === 0, status: missing.length ? 'partial' : 'integrated', checks, missing,
      registeredTools: [...toolRegistry.values()].map(({ id, title, description, capability }) => ({ id, title, description, capability })),
      policies: { localFirst: true, cloudPublished: false, cloudDefaultEnabled: false, rawChatPersistedByTrace: false, generatedCodeExecuted: false, androidSystemControl: false },
      note: missing.length ? 'بعض الوحدات غير محمّلة في هذه الصفحة أو السياق.' : 'تم العثور على جميع واجهات التكامل الاختيارية والأساسية؛ هذا فحص واجهات وليس اختبارًا مرئيًا لكل تطبيق.'
    };
  }
  function plan(query, options = {}) {
    const security = g.ChaosSecurity?.inspectQuery?.(String(query ?? ''));
    if (security && !security.safe) return { ok: false, code: 'SECURITY_REJECTED', message: 'رفضت طبقة الأمان الطلب قبل التخطيط.', security: { code: security.code || 'BLOCKED' } };
    setupTools();
    return g.CHAOSAILanguageEngine?.plan?.(query, options) || g.CHAOSAI?.analyze?.(query) || { ok: false, code: 'COGNITION_UNAVAILABLE' };
  }
  async function runConversation(query, options = {}) {
    const input = String(query ?? '').trim();
    if (!input) return '';
    const security = g.ChaosSecurity?.inspectQuery?.(input);
    if (security && !security.safe) {
      lastTrace = { id: `blocked_${Date.now().toString(36)}`, status: 'blocked', inputLength: input.length, reason: bounded(security.code || 'SECURITY_REJECTED'), rawInputStored: false };
      emit('turn-blocked', { id: lastTrace.id, reason: lastTrace.reason });
      return 'رفضت طبقة الأمان الطلب قبل تنفيذ أي أداة: ' + bounded(security.reason || 'نمط غير مسموح.');
    }
    setupTools();
    const history = Array.isArray(options.history) ? options.history : [];
    const started = Date.now();
    const startedTurn = g.CHAOSAILanguageEngine?.begin?.(input, { history, sessionId: options.sessionId }) || null;
    const turnPlan = startedTurn?.plan || plan(input, { history, sessionId: options.sessionId });
    const turnId = startedTurn?.record?.id || turnPlan?.id || `turn_${Date.now().toString(36)}`;
    active = { id: turnId, plan: clone(turnPlan), startedAt: started, sessionId: bounded(options.sessionId || 'default', 100) };
    g.CHAOSOSActiveTurn = { id: turnId, context: clone(turnPlan?.context || null), plan: clone(turnPlan) };
    emit('turn-started', { id: turnId, intent: turnPlan?.intent?.type || 'unknown', route: turnPlan?.route || 'unknown' });
    let result, error = null;
    try {
      const execute = typeof options.executor === 'function' ? options.executor : null;
      if (!execute) result = 'لا توجد دالة تنفيذ موصولة بالنواة في هذه الواجهة.';
      else result = await execute(input, { plan: clone(turnPlan), turnId });
      return result;
    } catch (e) {
      error = e;
      emit('turn-error', { id: turnId, code: bounded(e?.code || e?.name || 'EXECUTION_FAILED', 80) });
      return 'تعذّر إكمال الطلب داخل النواة الموحدة. لم يتم تجاهل الخطأ بصمت.';
    } finally {
      const completed = g.CHAOSAILanguageEngine?.complete?.(turnId, typeof result === 'string' ? result : JSON.stringify(result ?? ''), error);
      lastTrace = {
        id: turnId, status: error ? 'failed' : 'completed', inputLength: input.length,
        intent: turnPlan?.intent?.type || 'unknown', route: turnPlan?.route || 'unknown', algorithm: turnPlan?.algorithm || turnPlan?.executionPlan?.algorithm || 'local.orchestrator',
        elapsedMs: Date.now() - started, plan: clone(turnPlan), execution: clone(completed?.trace || null), rawInputStored: false, rawOutputStored: false
      };
      g.CHAOSOSActiveTurn = null;
      active = null;
      emit('turn-finished', { id: turnId, status: lastTrace.status, elapsedMs: lastTrace.elapsedMs, intent: lastTrace.intent, route: lastTrace.route });
    }
  }
  function explainLast() {
    const t = lastTrace;
    if (!t) return 'لا توجد خطة سابقة حتى الآن. أرسل طلبًا أولًا ثم اطلب «اشرح الخطة الأخيرة».';
    const p = t.plan || {};
    return [
      'تفسير داخلي لآخر طلب', `الحالة: ${t.status}`, `معرّف الدور: ${t.id}`, `طول الإدخال: ${t.inputLength} حرفًا (النص نفسه غير محفوظ في سجل التفسير)`,
      `النية: ${t.intent || 'غير معروفة'}`, `المسار: ${t.route || 'غير معروف'}`, `الخوارزمية: ${t.algorithm || 'غير محددة'}`,
      `درجة الثقة: ${Number(p.confidence ?? p.adjustedConfidence ?? 0).toFixed(2)}`,
      `السياق: ${p.context?.isFollowUp ? `متابعة لموضوع «${bounded(p.context.topic || 'غير معروف', 160)}»` : p.context?.available ? 'سياق محلي محدود متاح' : 'لا يوجد سياق سابق مستخدم'}`,
      'الخطوات:', ...(p.steps || p.executionPlan?.steps || []).map((s, i) => `${i + 1}. ${typeof s === 'string' ? s : `${s.label} [${s.status}]`}`),
      `الأدوات المرشحة: ${(p.toolChoices || []).join('، ') || 'مسار محلي افتراضي'}`,
      'السياسات: لا تنفيذ لكود مولّد، ولا اتصال سحابي تلقائي، ولا حفظ للنص الخام في سجل التفسير.'
    ].join('\n');
  }
  function diagnostics() {
    const integration = integrationCheck();
    const lang = g.CHAOSAILanguageEngine?.status?.() || { available: false };
    return { ...integration, language: lang, activeTurn: active ? { id: active.id, startedAt: active.startedAt } : null, lastTrace: lastTrace ? { id: lastTrace.id, status: lastTrace.status, inputLength: lastTrace.inputLength, intent: lastTrace.intent, route: lastTrace.route, elapsedMs: lastTrace.elapsedMs, rawInputStored: false } : null };
  }
  function traces() { return g.CHAOSAILanguageEngine?.trace?.() || []; }
  function clearTrace() { lastTrace = null; active = null; g.CHAOSAILanguageEngine?.clearTrace?.(); return { ok: true, rawContentStored: false }; }
  g.CHAOSOSCore = { version: '3.0.0', setupTools, registerTool, invokeTool, toolList: () => [...toolRegistry.values()].map(({ id, title, description, capability }) => ({ id, title, description, capability })), integrationCheck, diagnostics, plan, runConversation, explainLast, traces, clearTrace, last: () => clone(lastTrace) };
  setupTools();
})(window);
