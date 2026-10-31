/* CHAOSOS internal app capability bridge v1.0.
   Only explicitly registered actions are reachable. Each app data scope is consent-gated. */
(function (g) {
  'use strict';
  const connectors = new Map();
  const MAX_OUTPUT = 24000;
  const safeText = (v, n = 300) => String(v ?? '').slice(0, n);
  const json = (key, fallback = []) => {
    try { const raw = g.localStorage?.getItem(key); if (raw == null) return fallback; const value = JSON.parse(raw); return value ?? fallback; }
    catch { return fallback; }
  };
  function register(connector) {
    if (!connector || typeof connector.id !== 'string' || !connector.id || typeof connector.appId !== 'string' || !connector.actions || typeof connector.actions !== 'object') return false;
    if (connectors.has(connector.id)) return false;
    for (const [action, spec] of Object.entries(connector.actions)) if (!action || !spec || typeof spec.handler !== 'function' || !['read', 'write'].includes(spec.permission || 'read')) return false;
    connectors.set(connector.id, Object.freeze({ ...connector, title: safeText(connector.title || connector.id, 120), actions: Object.freeze({ ...connector.actions }) }));
    return true;
  }
  function list() {
    return [...connectors.values()].map(c => ({ id: c.id, appId: c.appId, title: c.title, description: c.description || '', actions: Object.entries(c.actions).map(([id, a]) => ({ id, title: a.title || id, permission: a.permission || 'read', description: a.description || '' })) }));
  }
  function hasApp(id) {
    const catalog = g.VoidAppCatalog?.apps || g.VoidAppManager?.list?.() || [];
    return catalog.length === 0 || catalog.some(a => String(a.id || '').toLowerCase() === String(id).toLowerCase());
  }
  function ensurePermission(appId, scope, actionTitle) {
    const pm = g.VoidPermissionManager;
    if (!pm || typeof pm.isGranted !== 'function' || typeof pm.request !== 'function') return { ok: false, message: 'مدير الصلاحيات غير محمّل؛ لم تُقرأ بيانات أي تطبيق.' };
    if (pm.canLaunch?.(appId) === false) return { ok: false, message: `التطبيق ${appId} معطّل في مدير التطبيقات.` };
    const permission = `app.${scope}:${appId}`;
    if (pm.isGranted('chaosai', permission)) return { ok: true };
    const ok = pm.request('chaosai', permission, `السماح لـ CHAOSAI بتنفيذ «${actionTitle}» على بيانات التطبيق «${appId}». نطاق الصلاحية: ${scope === 'read' ? 'قراءة محلية فقط' : 'تعديل بيانات محلية'}.`);
    return ok ? { ok: true } : { ok: false, code: 'PERMISSION_DENIED', message: 'لم تُمنح الصلاحية؛ لم تُقرأ البيانات ولم تُعدّل.' };
  }
  function serializable(value) {
    let text;
    try { text = JSON.stringify(value); } catch { throw new Error('نتيجة موصل التطبيق لا يمكن تحويلها إلى بيانات آمنة.'); }
    if (typeof text !== 'string' || text.length > MAX_OUTPUT) throw new Error('نتيجة التطبيق أكبر من حد الإرجاع؛ قلّص نطاق الطلب.');
    return JSON.parse(text);
  }
  async function invoke(connectorId, actionId, payload = {}, options = {}) {
    const c = connectors.get(String(connectorId));
    if (!c) return { ok: false, code: 'CONNECTOR_NOT_FOUND', message: 'لا يوجد موصل مسجل بهذا المعرّف.' };
    if (!hasApp(c.appId)) return { ok: false, code: 'APP_NOT_REGISTERED', message: 'التطبيق غير موجود في سجل CHAOSOS.' };
    const appRecord = g.VoidAppManager?.get?.(c.appId);
    if (appRecord?.state?.enabled === false || appRecord?.enabled === false) return { ok: false, code: 'APP_DISABLED', message: 'التطبيق معطّل حاليًا؛ لم يتم الوصول إلى بياناته.' };
    const action = c.actions[String(actionId)];
    if (!action) return { ok: false, code: 'ACTION_NOT_REGISTERED', message: 'الإجراء غير معلن في موصل التطبيق.' };
    const scope = action.permission || 'read';
    const perm = ensurePermission(c.appId, scope, action.title || actionId);
    if (!perm.ok) return perm;
    if (scope === 'write') {
      const confirmFn = typeof g.confirm === 'function' ? g.confirm : null;
      if (!confirmFn) return { ok: false, code: 'CONFIRM_UNAVAILABLE', message: 'لا تتوفر نافذة تأكيد؛ لم يتم تعديل البيانات.' };
      const allowed = confirmFn(`تأكيد تعديل بيانات ${c.title}\nالإجراء: ${action.title || actionId}\nالتطبيق: ${c.appId}\n\nلا يمكن التراجع تلقائيًا عن هذا الإجراء. هل تريد المتابعة؟`);
      if (!allowed) return { ok: false, code: 'USER_CANCELLED', message: 'أُلغي الإجراء؛ لم تُعدّل البيانات.' };
    }
    try {
      const value = await action.handler(payload || {}, { appId: c.appId, connectorId: c.id, localStorage: g.localStorage, json, safeText });
      return { ok: true, connector: c.id, appId: c.appId, action: actionId, permission: scope, data: serializable(value), localOnly: true };
    } catch (error) {
      return { ok: false, code: 'CONNECTOR_ACTION_FAILED', message: safeText(error?.message || error, 500) };
    }
  }
  function parseQuery(q) {
    const s = safeText(q, 2000).trim();
    let m;
    if ((m = s.match(/^(?:اعرض|اقرأ|افتح بيانات|استعرض)\s+(?:كل\s+)?(?:ملاحظاتي|الملاحظات|ملاحظات(?:ي)?)$/iu))) return { connector: 'notes', action: 'list', payload: {} };
    if ((m = s.match(/^(?:ابحث|فتش)\s+(?:في\s+)?(?:ملاحظاتي|الملاحظات|ملاحظات(?:ي)?)\s+(?:عن|حول)\s+(.{2,180})$/iu))) return { connector: 'notes', action: 'search', payload: { query: m[1] } };
    if (/^(?:اعرض|اقرأ|استعرض)\s+(?:كل\s+)?(?:مهامي|المهام|مهام(?:ي)?)$/iu.test(s)) return { connector: 'planner', action: 'list', payload: {} };
    if ((m = s.match(/^(?:ابحث|فتش)\s+(?:في\s+)?(?:مهامي|المهام)\s+(?:عن|حول)\s+(.{2,180})$/iu))) return { connector: 'planner', action: 'search', payload: { query: m[1] } };
    if (/^(?:اعرض|اقرأ|استعرض)\s+(?:المواعيد|تقويمي|أحداث التقويم|احداث التقويم)$/iu.test(s)) return { connector: 'calendar', action: 'list', payload: {} };
    if ((m = s.match(/^(?:ابحث|فتش)\s+(?:في\s+)?(?:المواعيد|تقويمي|التقويم)\s+(?:عن|حول)\s+(.{2,180})$/iu))) return { connector: 'calendar', action: 'search', payload: { query: m[1] } };
    if (/^(?:اعرض|اقرأ|استعرض)\s+(?:مفضلات المتجر|المفضلات في المتجر)$/iu.test(s)) return { connector: 'store', action: 'favorites', payload: {} };
    if (/^(?:اعرض|اقرأ|استعرض)\s+(?:مكتبة المتجر|مكتبتي في المتجر)$/iu.test(s)) return { connector: 'store', action: 'library', payload: {} };
    if (/^(?:اعرض|اقرأ|استعرض)\s+(?:اشتراكات|قنوات)\s+(?:VoidTube|فويد تيوب|الفيديو)$/iu.test(s)) return { connector: 'voidtube', action: 'subscriptions', payload: {} };
    if (/^(?:اعرض|اقرأ|استعرض)\s+(?:سجل المشاهدة|تاريخ المشاهدة)$/iu.test(s)) return { connector: 'voidtube', action: 'history', payload: {} };
    if (/^(?:اعرض|اقرأ|استعرض)\s+(?:الفيديوهات المحفوظة|المقاطع المحفوظة)$/iu.test(s)) return { connector: 'voidtube', action: 'saved', payload: {} };
    if (/^(?:اعرض|اقرأ|استعرض)\s+(?:سجل المتصفح|المواقع التي زرتها)$/iu.test(s)) return { connector: 'browser', action: 'history', payload: {} };
    if (/^(?:اعرض|اقرأ|استعرض)\s+(?:المواقع المحفوظة|العلامات المحفوظة)$/iu.test(s)) return { connector: 'browser', action: 'bookmarks', payload: {} };
    if (/^(?:اعرض|اقرأ|استعرض)\s+(?:قائمة التطبيقات|سجل التطبيقات|التطبيقات الداخلية)$/iu.test(s)) return { connector: 'system', action: 'apps', payload: {} };
    if (/^(?:اعرض|اقرأ|استعرض)\s+(?:حالة خدمات النظام|الخدمات المسجلة)$/iu.test(s)) return { connector: 'system', action: 'services', payload: {} };
    if (/^(?:اعرض|اقرأ|استعرض)\s+(?:فهرس ملفات المشروع|قائمة ملفات المشروع)$/iu.test(s)) return { connector: 'project-files', action: 'manifest', payload: {} };
    if ((m = s.match(/^(?:ابحث|فتش)\s+(?:في\s+)?(?:ملفات المشروع|ملفات النظام)\s+(?:عن|حول)\s+(.{2,180})$/iu))) return { connector: 'project-files', action: 'search', payload: { query: m[1] } };
    if (/^(?:اعرض|اقرأ|استعرض)\s+(?:سجل العمليات الحسابية|عمليات الآلة الحاسبة)$/iu.test(s)) return { connector: 'calculator-history', action: 'history', payload: {} };
    if (/^(?:اعرض|اقرأ|استعرض)\s+(?:آخر بحث في المستكشف|آخر بحث خارجي)$/iu.test(s)) return { connector: 'discovery', action: 'lastSearch', payload: {} };
    if (/^(?:اعرض|اقرأ|استعرض)\s+(?:أفضل نتيجة الأركيد|أفضل نتيجة اللعبة)$/iu.test(s)) return { connector: 'arcade', action: 'bestScore', payload: {} };
    if (/^(?:اعرض|اقرأ|استعرض)\s+(?:بيانات الصور المختارة|الصور التي اخترتها في المعرض)$/iu.test(s)) return { connector: 'gallery-local', action: 'selections', payload: {} };
    if (/^(?:اعرض|اقرأ|استعرض)\s+(?:سجل الكاميرا|بيانات الالتقاطات المحلية)$/iu.test(s)) return { connector: 'camera-local', action: 'captures', payload: {} };
    if (/^(?:اعرض|اقرأ|استعرض)\s+(?:مسودات البريد|مسودات Void Mail)$/iu.test(s)) return { connector: 'mail-local', action: 'drafts', payload: {} };
    if ((m = s.match(/^(?:ابحث|فتش)\s+(?:في\s+)?(?:مسودات البريد|مسودات البريد المحلية)\s+(?:عن|حول)\s+(.{2,180})$/iu))) return { connector: 'mail-local', action: 'search', payload: { query: m[1] } };
    if ((m = s.match(/^(?:افحص|اعرض واجهات|ما واجهات|ما الذي يستطيع CHAOSAI فعله داخل)\s+(?:التطبيق\s+)?([a-z0-9-]{2,80})$/iu))) return { connector: 'system', action: 'inspect', payload: { appId: m[1] } };
    if (/^(?:اعرض|اقرأ|استعرض)\s+(?:سجل المحادثات|محفوظات الطرفية|ملخص محادثاتي)$/iu.test(s)) return { connector: 'terminal-data', action: 'history', payload: {} };
    if ((m = s.match(/^(?:ابحث|فتش)\s+(?:في\s+)?(?:المحادثات|سجل المحادثات)\s+(?:عن|حول)\s+(.{2,180})$/iu))) return { connector: 'terminal-data', action: 'search', payload: { query: m[1] } };
    if (/^(?:اعرض|اقرأ|استعرض)\s+(?:ذكريات CHAOS|الذكريات المشتركة)$/iu.test(s)) return { connector: 'terminal-data', action: 'memories', payload: {} };
    if (/^(?:اعرض|اقرأ|استعرض)\s+(?:جهات الاتصال المحلية|جهات اتصالي المحلية)$/iu.test(s)) return { connector: 'phone-local', action: 'contacts', payload: {} };
    if (/^(?:اعرض|اقرأ|استعرض)\s+(?:مسودات الرسائل|المسودات المحلية)$/iu.test(s)) return { connector: 'messages-local', action: 'drafts', payload: {} };
    if (/^(?:اعرض|اقرأ|استعرض)\s+(?:إعدادات النظام|اعدادات النظام|ملخص الإعدادات)$/iu.test(s)) return { connector: 'settings-local', action: 'summary', payload: {} };
    if (/^(?:اعرض|اقرأ|استعرض)\s+(?:وحدات العلوم|التخصصات العلمية|مكتبة العلوم)$/iu.test(s)) return { connector: 'chaosai', action: 'knowledge', payload: {} };
    if (/^(?:اعرض|اقرأ|استعرض)\s+(?:حالة CHAOSAI|حالة الذكاء المحلي)$/iu.test(s)) return { connector: 'chaosai', action: 'cognition', payload: {} };
    if ((m = s.match(/^(?:اسأل|اسئل|وجّه إلى|وجه الى)\s+(?:CHAOSAI|الوحدة المحلية)\s+(?:عن|حول)\s+(.{2,500})$/iu))) return { connector: 'chaosai', action: 'ask', payload: { query: m[1] } };
    if (/^(?:ما الذي تستطيع قراءته داخل التطبيقات|ما صلاحيات الوصول الداخلية|قائمة موصلات التطبيقات|ما بيانات التطبيقات المتاحة)$/iu.test(s)) return { meta: 'capabilities' };
    if ((m = s.match(/^(?:ابحث في المشروع|ابحث في ملفات المشروع)\s*(?:عن\s*)?(.+)$/iu))) return { connector: 'project-files', action: 'search', payload: { query: m[1] } };
    return null;
  }
  async function handleCommand(q) {
    const parsed = parseQuery(q);
    if (!parsed) return null;
    if (parsed.meta === 'capabilities') {
      const rows = list();
      return { handled: true, ok: true, message: 'موصلات CHAOSAI الداخلية المسجلة:\n' + rows.map(c => `• ${c.title} (${c.appId}) — ${c.description}\n  ${c.actions.map(a => `${a.id}: ${a.title} [${a.permission === 'read' ? 'قراءة بموافقة' : 'تعديل بتأكيد'}]`).join('، ')}`).join('\n') + '\n\nالموصلات تعمل على بيانات التطبيق المعلنة فقط. لم تُرسل أي بيانات إلى السحابة.' };
    }
    const result = await invoke(parsed.connector, parsed.action, parsed.payload);
    if (!result.ok) return { handled: true, ok: false, message: result.message || result.code };
    return { handled: true, ok: true, message: formatResult(result) };
  }
  function formatResult(result) {
    const data = result.data;
    if (Array.isArray(data)) {
      if (!data.length) return `لا توجد عناصر لعرضها في ${result.appId} ضمن البيانات المحلية المتاحة.`;
      return `قراءة محلية عبر موصل ${result.connector} — ${data.length} عنصرًا (تُطبق حدود عرض مختصرة):\n` + data.slice(0, 20).map((x, i) => `${i + 1}. ${safeText(x.title || x.name || x.subject || x.expression || x.filename || x.query || x.to || x.text || x.id || x.path || x.url || JSON.stringify(x), 260)}`).join('\n') + '\n\nهذه بيانات محلية فقط؛ لم تُرسل إلى السحابة.';
    }
    return `نتيجة محلية عبر موصل ${result.connector}:\n${safeText(JSON.stringify(data, null, 2), 5000)}\n\nلم تُرسل البيانات إلى السحابة.`;
  }
  g.CHAOSAppCapabilities = { version: '1.0.0', register, list, invoke, handleCommand, parseQuery, status: () => ({ version: '1.0.0', connectorCount: connectors.size, connectors: list(), consentRequired: true, cloudTransfer: false }) };
})(window);
