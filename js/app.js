// CHAOS SYSTEM — Local-first conversation manager (v1.3)
// Chat history is deliberately separate from all memory stores.
document.addEventListener('DOMContentLoaded', () => {
  'use strict';
  const $ = id => document.getElementById(id);
  const input = $('cmd'), output = $('out'), sendButton = $('sendBtn');
  const historySidebar = $('historySidebar'), historyList = $('historyList');
  const menuButton = $('menu'), openHistoryButton = $('openHistorySidebar');
  const closeHistoryButton = $('closeHistorySidebar'), newChatButton = $('newChatBtn');
  const searchInput = $('historySearch');
  const CHAT_KEY = 'chaos_chat_history', CURRENT_KEY = 'chaos_current_session';
  let sessions = loadSessions(), currentSession = getCurrentSession(), requestInProgress = false, shellParentReady = false;
  window.addEventListener('message', event => { if (event.source === window.parent && event.data?.type === 'VOIDOS_SHELL_READY') shellParentReady = true; });
  if (window.ChaosHauntingPersona) window.ChaosHauntingPersona.onVisit();

  function loadSessions() {
    try {
      const parsed = JSON.parse(localStorage.getItem(CHAT_KEY) || '[]');
      if (!Array.isArray(parsed)) return [];
      return parsed.filter(s => s && typeof s.id === 'string').map(s => ({
        id: s.id, title: typeof s.title === 'string' && s.title.trim() ? s.title : 'محادثة جديدة',
        createdAt: Number(s.createdAt) || Date.now(), updatedAt: Number(s.updatedAt) || Number(s.createdAt) || Date.now(),
        messages: Array.isArray(s.messages) ? s.messages.filter(m => m && (m.role === 'user' || m.role === 'assistant')).map(m => ({
          role: m.role, content: String(m.content ?? ''), timestamp: Number(m.timestamp) || Date.now()
        })) : []
      }));
    } catch (e) { console.error('[CHAOS] chat history read failed', e); return []; }
  }
  function saveSessions() {
    try { localStorage.setItem(CHAT_KEY, JSON.stringify(sessions)); return true; }
    catch (e) { console.error('[CHAOS] chat history save failed', e); announce('تعذر الحفظ؛ قد تكون مساحة التخزين ممتلئة. صدّر نسخة احتياطية أو احذف بيانات غير لازمة.'); return false; }
  }
  function announce(message) { const status = $('terminalStatus'); if (status) status.textContent = message; }
  function createSession() {
    const now = Date.now();
    const session = { id: 'session_' + now.toString(36) + '_' + Math.random().toString(36).slice(2, 8), title: 'محادثة جديدة', createdAt: now, updatedAt: now, messages: [] };
    sessions.unshift(session); saveSessions(); setCurrent(session.id); return session;
  }
  function setCurrent(id) { try { localStorage.setItem(CURRENT_KEY, id); } catch (_) {} }
  function getCurrentSession() {
    let id = null; try { id = localStorage.getItem(CURRENT_KEY); } catch (_) {}
    const found = id ? sessions.find(s => s.id === id) : null;
    return found || sessions[0] || createSession();
  }
  function languageIsEnglish() { return !!(window.ChaosTerminalLanguage && window.ChaosTerminalLanguage.getLanguage() === 'en'); }
  function renderCurrentSession() {
    if (!output) return;
    if (!currentSession || !currentSession.messages.length) {
      output.textContent = languageIsEnglish()
        ? '> CHAOS SYSTEM ONLINE\n> Local-first mode. Type help for capabilities.\n> Memory: save: fact | recall: keyword | memories\n> Web: search: topic (internet required)'
        : '> CHAOS SYSTEM متصل\n> الوضع المحلي أولًا. اكتب help لعرض الإمكانات.\n> الذاكرة: احفظ: معلومة | تذكر: كلمة | ذكرياتي\n> الويب: بحث: موضوع (يتطلب اتصالًا بالإنترنت)';
      output.scrollTop = 0; return;
    }
    const lines = [];
    currentSession.messages.forEach(m => { lines.push(m.role === 'user' ? (languageIsEnglish() ? '[YOU]' : '[أنت]') : '[CHAOS SYSTEM]'); lines.push(m.content); lines.push(''); });
    output.textContent = lines.join('\n').trimEnd(); output.scrollTop = output.scrollHeight;
  }
  function renderHistory() {
    if (!historyList) return;
    historyList.replaceChildren();
    const term = (searchInput?.value || '').trim().toLocaleLowerCase();
    const filtered = sessions.filter(s => !term || s.title.toLocaleLowerCase().includes(term) || s.messages.some(m => m.content.toLocaleLowerCase().includes(term)));
    if (!filtered.length) {
      const empty = document.createElement('li'); empty.className = 'history-empty';
      empty.textContent = term ? 'لا توجد نتائج مطابقة.' : 'لا توجد محادثات محفوظة.'; historyList.appendChild(empty); return;
    }
    filtered.forEach(s => {
      const item = document.createElement('li'); item.className = 'history-item' + (currentSession?.id === s.id ? ' active' : '');
      const select = document.createElement('button'); select.type = 'button'; select.className = 'history-select'; select.dataset.sessionId = s.id;
      select.textContent = `${s.title} · ${s.messages.length} رسالة`; select.title = s.title;
      const actions = document.createElement('div'); actions.className = 'history-actions';
      const rename = document.createElement('button'); rename.type = 'button'; rename.className = 'history-action'; rename.textContent = 'إعادة تسمية'; rename.setAttribute('aria-label', 'إعادة تسمية ' + s.title);
      rename.addEventListener('click', () => { const next = prompt('اكتب اسم المحادثة الجديد:', s.title); if (next === null) return; const value = next.trim(); if (!value) { announce('اسم المحادثة لا يمكن أن يكون فارغًا.'); return; } s.title = value.slice(0, 80); s.updatedAt = Date.now(); saveSessions(); renderHistory(); });
      const remove = document.createElement('button'); remove.type = 'button'; remove.className = 'history-action danger'; remove.textContent = 'حذف'; remove.setAttribute('aria-label', 'حذف ' + s.title);
      remove.addEventListener('click', () => { if (!confirm(`حذف المحادثة «${s.title}» نهائيًا؟ لا يؤثر هذا على الذكريات المحفوظة.`)) return; sessions = sessions.filter(x => x.id !== s.id); if (currentSession?.id === s.id) currentSession = sessions[0] || createSession(); setCurrent(currentSession.id); saveSessions(); renderCurrentSession(); renderHistory(); announce('تم حذف المحادثة المحددة.'); });
      actions.append(rename, remove); item.append(select, actions); historyList.appendChild(item);
    });
  }
  function setHistoryOpen(open) { if (!historySidebar) return; historySidebar.classList.toggle('active', open); if (menuButton) menuButton.setAttribute('aria-expanded', String(!!systemMenuLayer?.classList.contains('active'))); if (openHistoryButton) openHistoryButton.setAttribute('aria-expanded', String(open)); if (open) searchInput?.focus(); }
  const toggleHistory = () => setHistoryOpen(!historySidebar?.classList.contains('active'));
  const systemMenuLayer = $('systemMenuLayer');
  function setSystemMenuOpen(open) {
    systemMenuLayer?.classList.toggle('active', !!open);
    systemMenuLayer?.setAttribute('aria-hidden', String(!open));
    if (menuButton) menuButton.setAttribute('aria-expanded', String(!!open));
    if (open) $('closeSystemMenu')?.focus(); else menuButton?.focus();
  }
  function sendShellAction(action) {
    if (shellParentReady) {
      window.parent.postMessage({ type:'VOIDOS_SYSTEM_ACTION', action }, '*');
      announce('تم إرسال الطلب إلى قشرة VoidOS.');
      return true;
    }
    const fallback = {home:'../index.html',settings:'../settings.html',manager:'../apps/void-manager/index.html',commands:'../chaos-commands.html',discover:'../apps/void-discovery/index.html',controls:'../index.html?voidosAction=control',recent:'../index.html?voidosAction=recent','lock-settings':'../index.html?voidosAction=lock-settings',lock:'../index.html?voidosAction=lock'};
    if (fallback[action]) { window.location.href = fallback[action]; return true; }
    return false;
  }
  menuButton?.addEventListener('click', e => { e.preventDefault(); e.stopPropagation(); setSystemMenuOpen(!systemMenuLayer?.classList.contains('active')); });
  $('closeSystemMenu')?.addEventListener('click', () => setSystemMenuOpen(false));
  $('systemMenuBackdrop')?.addEventListener('click', () => setSystemMenuOpen(false));
  systemMenuLayer?.addEventListener('click', e => {
    const button = e.target.closest('[data-system-menu-action]'); if (!button) return;
    const action = button.dataset.systemMenuAction; setSystemMenuOpen(false);
    if (action === 'history') { setHistoryOpen(true); return; }
    sendShellAction(action);
  });
  openHistoryButton?.addEventListener('click', e => { e.preventDefault(); e.stopPropagation(); toggleHistory(); });
  closeHistoryButton?.addEventListener('click', () => setHistoryOpen(false));
  newChatButton?.addEventListener('click', () => { currentSession = createSession(); renderCurrentSession(); renderHistory(); setHistoryOpen(false); input?.focus(); });
  searchInput?.addEventListener('input', renderHistory);
  historyList?.addEventListener('click', e => { const btn = e.target.closest('[data-session-id]'); if (!btn) return; const selected = sessions.find(s => s.id === btn.dataset.sessionId); if (!selected) return; currentSession = selected; setCurrent(selected.id); renderCurrentSession(); renderHistory(); setHistoryOpen(false); });
  document.addEventListener('click', e => { if (!historySidebar?.classList.contains('active')) return; if (historySidebar.contains(e.target) || menuButton?.contains(e.target) || openHistoryButton?.contains(e.target)) return; setHistoryOpen(false); });
  document.addEventListener('keydown', e => { if (e.key === 'Escape') { if (historySidebar?.classList.contains('active')) setHistoryOpen(false); if (systemMenuLayer?.classList.contains('active')) setSystemMenuOpen(false); } if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') { e.preventDefault(); setHistoryOpen(true); } });

  async function getResponse(query) {
    const q = query.trim();
    if (window.ChaosSecurity?.inspectQuery) { const security = window.ChaosSecurity.inspectQuery(q); if (!security.safe) { window.ChaosSecurity.audit?.('terminal-input-blocked', security.code || security.reason); return 'رفضت طبقة الأمان الطلب: ' + security.reason; } }
    const convo = window.CHAOSConversationMemory;
    const context = convo?.buildContext?.(currentSession?.id || 'default', currentSession?.messages || [], q) || null;
    if (/^(?:سياق المحادثة|ملخص المحادثة|لخص المحادثة|افحص المحادثة|الكلمات المفتاحية)$/iu.test(q)) {
      const r = convo?.report?.(currentSession?.id || 'default');
      if (!r) return 'محرك فهرسة سياق المحادثة غير محمّل.';
      const terms = (context?.keywords || []).slice(0,16).map(x=>x.word).join('، ') || 'لا توجد كلمات كافية بعد';
      const topic = context?.topic?.entity || context?.topic?.text || 'لم يتحدد موضوع رئيسي بعد';
      return `تقرير سياق CHAOSOS\nالرسائل في السجل: ${r.totalMessages}\nالرسائل المفهرسة: ${r.indexedMessages}\nرسائل المستخدم: ${r.indexedUserMessages}\nالكلمات المفتاحية المحتفظ بها: ${r.uniqueKeywords}\nالمقتطفات السياقية: ${r.storedTopicExcerpts}\nالموضوع الحالي: ${topic}\nالكلمات البارزة: ${terms}\nالعينات القديمة غير المفهرسة تفصيليًا: ${r.skippedOlderMessages || 0}\nمعالجة السياق: ${r.indexLimitReached ? 'عينات للقسم القديم + فهرسة تفصيلية لآخر 20,000 رسالة' : 'فهرسة تفصيلية للسجل المتاح'}\n\n${r.note}`;
    }
    const localContextAnswer = convo?.contextualReply?.(q, currentSession?.id || 'default', currentSession?.messages || []);
    if (localContextAnswer) return localContextAnswer;
    if (/^(help|مساعدة|الأوامر|اوامر)$/i.test(q)) return [
      'الأوامر المتاحة:',
      '• احفظ: معلومة — حفظ ذكرى يدوية', '• تذكر: كلمة — البحث في الذكريات اليدوية', '• ذكرياتي — عرض الذكريات', '• حدّث ذكرى: النص القديم => النص الجديد — تحديث بعد التأكيد', '• احذف من الذاكرة: النص — حذف نص مطابق بعد التأكيد',
      '• بحث: موضوع — بحث صريح عبر ويكيبيديا عند توفر الإنترنت', '• تعلّم نمط: نص — حفظ إحصاءات حروف محليًا بعد طلبك فقط', '• حالة الكيان — عرض مرحلة السرد المحلية', '• status — حالة الوحدات والتخزين', '• diagnostics — تقرير تشخيصي',
      '• clear — مسح عرض المحادثة الحالية ورسائلها (مع تأكيد)',
      'تنبيه: هذه نسخة محلية قائمة على قواعد وأوامر؛ ليست نموذجًا لغويًا عامًا، ولا تنفذ أوامر نظام التشغيل.'
    ].join('\n');
    if (/^(status|diagnostics|تشخيص|حالة النظام)$/i.test(q)) {
      if (window.ChaosDiagnostics) return window.ChaosDiagnostics.report();
      return 'وحدة التشخيص غير متصلة. تحقق من تحميل js/brain/diagnostics.js.';
    }
    const searchRequest = convo?.parseSearchRequest?.(q, currentSession?.id || 'default', currentSession?.messages || [])
      || (() => { const m=q.match(/^(?:بحث|ابحث في الويب|search|search web)\s*[:：]\s*(.+)$/i); return m ? {requested:true,topic:m[1].trim(),source:'explicit'} : null; })();
    if (searchRequest?.requested) {
      const topic = String(searchRequest.topic || '').trim();
      if (!topic) return 'أفهم أنك تريد البحث، لكن لا يوجد موضوع واضح في السياق الحالي. اكتب الموضوع، أو افتح موضوعًا في المحادثة ثم قل «أبحث»، وسأحاول ربطه بالسياق.';
      if (!navigator.onLine) return `فهمت طلب البحث عن «${topic}»، لكن لا يوجد اتصال بالشبكة حاليًا. لم يُنفّذ البحث ولم أختلق نتائج. يمكنك إعادة المحاولة عند الاتصال.`;
      if (typeof ChaosWebSearch === 'undefined') return 'وحدة البحث غير متصلة. لم يُنفّذ البحث.';
      try {
        const result = await ChaosWebSearch.searchDetailed(topic, {limit:6});
        return ChaosWebSearch.formatSearchResponse(result, topic);
      } catch (error) {
        return `تعذر إكمال البحث عن «${topic}»: ${String(error?.message || 'خطأ اتصال')}. لم تُنشأ نتائج بديلة غير متحققة.`;
      }
    }
    // Read-only search across the bundled project manifest; no broad device filesystem access.
    const fileQuestion = q.match(/^(?:ابحث في ملفات المشروع|افحص ملفات المشروع|ابحث داخل الكود|ابحث في الكود|ابحث عن ملف|وين ملف|أين ملف|اقرأ ملف المشروع)\s*[:：]?\s*(.*)$/iu);
    if (fileQuestion) {
      const term = String(fileQuestion[1] || '').trim();
      if (!window.ChaosProjectFiles) return 'خدمة ملفات المشروع غير محمّلة؛ لم أفتح ملفات خارج النطاق.';
      if (!term) { try { const rows = await ChaosProjectFiles.manifest(); return `فهرس ملفات المشروع المسموح بها: ${rows.length} ملفًا نصيًا. اكتب اسم الملف أو الموضوع بعد «ابحث في ملفات المشروع».`; } catch (e) { return String(e.message || e); } }
      const found = await ChaosProjectFiles.search(term, 5);
      if (!found.ok) return found.message;
      return found.results.length ? 'نتائج قراءة فقط من ملفات المشروع:\n\n' + found.results.map((r,i)=>`${i+1}. ${r.path}\n${r.excerpt}`).join('\n\n') + '\n\n' + found.note : 'لم أجد تطابقًا في الملفات النصية المسموح بها. لم يتم تعديل أي ملف.';
    }
        // Search intent is resolved inside the conversational answer path, never by launching VoidBrowserX.
    const directIntent = window.VoidIntentEngine?.classify?.(q);
    if (directIntent?.type === 'websearch') {
      const topic = String(directIntent.query || '').trim();
      if (!topic) return 'اكتب موضوع البحث بعد «ابحث عن».';
      if (!navigator.onLine) return `فهمت طلب البحث عن «${topic}»، لكن لا يوجد اتصال بالشبكة. لم أختلق نتائج.`;
      if (!window.ChaosWebSearch) return 'محرك البحث غير محمّل؛ لم أفتح المتصفح ولم أختلق نتائج.';
      try { const result = await ChaosWebSearch.searchDetailed(topic, {limit:6}); return ChaosWebSearch.formatSearchResponse(result, topic); }
      catch (error) { return `تعذّر البحث عن «${topic}»: ${String(error?.message || 'خطأ اتصال')}. لم تُختلق نتائج.`; }
    }
    // In-process services return their answer to the active CHAOS SYSTEM conversation.
    if (window.CHAOS?.routeIntent) { const routed = window.CHAOS.routeIntent(q); if (routed?.handled) return routed.message; }
    // CHAOSAI modular knowledge layer runs after system intents and before generic conversation fallback.
    if (window.CHAOSProjectKnowledge?.wantsProjectRead?.(q)) { const fileAnswer = await window.CHAOSProjectKnowledge.searchQuery(q); if (fileAnswer) return fileAnswer; }
    if (window.CHAOSAppCapabilities?.handleCommand) { const appDataAnswer = await window.CHAOSAppCapabilities.handleCommand(q); if (appDataAnswer?.handled) return appDataAnswer.message; }
    // Pattern-driven word handlers (not the static dictionary) must run before broad local-language fallback.
    const wordIntent = window.CHAOSWords?.resolveHandlers?.(q); if (wordIntent?.handled) return wordIntent.answer || wordIntent.message || '';
    const wordMatch = window.CHAOSWords?.match?.(q); if (wordMatch?.answer) return wordMatch.answer;
    if (window.CHAOSKnowledgeRouter) { const knowledge = window.CHAOSKnowledgeRouter.route(q); if (knowledge?.handled) return knowledge.answer; }
    const learnMatch = q.match(/^(?:تعلّم نمط|تعلم نمط|learn pattern)\s*[:：]\s*(.+)$/is);
    if (learnMatch) {
      if (!window.ChaosTextEngine) return 'محرك الأنماط غير متصل.';
      return window.ChaosTextEngine.trainOnText(learnMatch[1]);
    }
    if (/^(?:حالة الكيان|persona status|haunting status)$/i.test(q)) {
      if (!window.ChaosHauntingPersona) return 'وحدة الشخصية غير متصلة.';
      const st = window.ChaosHauntingPersona.status();
      return `مرحلة السرد: ${st.name} (${st.stage})\nالزيارات المحلية: ${st.visits}\nالتفاعلات: ${st.interactions}\nمفعّلة: ${st.enabled ? 'نعم' : 'لا'}\n${st.description}`;
    }
    if (/^(clear|مسح المحادثة)$/i.test(q)) {
      if (!confirm('مسح رسائل المحادثة الحالية؟ لن تُحذف المحادثات الأخرى أو الذكريات.')) return 'تم إلغاء المسح.';
      currentSession.messages = []; currentSession.updatedAt = Date.now(); convo?.clear?.(currentSession.id); saveSessions(); renderCurrentSession(); renderHistory(); return '__CHAT_CLEARED__';
    }
    if (window.ChaosSavedMemory?.handleQuery) { const memoryResponse = window.ChaosSavedMemory.handleQuery(q); if (memoryResponse !== null) return memoryResponse; }
    // Keep ordinary conversation separate from executable commands. Explicit commands are recognized by inputClassifier.js; everyday text is handled as conversation rather than sent to the command executor.
    const inputClass = window.CHAOSInputClassifier?.classify(q);
    if (inputClass && inputClass.type === 'daily') {
      const cognitiveContext = window.CHAOSOSActiveTurn?.context || null;
      const localReply = window.CHAOSLocalLanguage?.respond?.(q, { history: currentSession?.messages || [], context, cognitive: cognitiveContext, languagePlan: window.CHAOSOSActiveTurn?.plan || null });
      if (typeof localReply === 'string' && localReply.trim()) return localReply;
      const everydayReply = 'صُنّف النص على أنه محادثة محلية، لكن لم تنتج قاعدة اللغة ردًا. أعد صياغة السؤال أو استخدم أمرًا واضحًا.';
      if (window.ChaosHauntingPersona?.respond) return window.ChaosHauntingPersona.respond(q, everydayReply);
      return everydayReply;
    }
    if (typeof window.ChaosCommands?.execute === 'function') {
      const response = await window.ChaosCommands.execute(q);
      if (typeof response === 'string' && /Bleeding Sanity: تعذر على النواة تحليل|لا يوجد رد من الأوامر/.test(response)) {
        const memories = window.ChaosSavedMemory?.search(q.split(/\s+/).filter(w => w.length > 2).slice(0, 4).join(' ')) || [];
        if (memories.length) {
          const memoryFallback = 'لم أجد إجابة في قاعدة الأوامر. توجد آثار محفوظة قد تكون ذات صلة، لكنها ليست تحققًا مستقلًا من صحة المعلومات.';
          return window.ChaosHauntingPersona ? window.ChaosHauntingPersona.respond(q, memoryFallback) : memoryFallback + '\n' + memories.slice(0, 5).map((m, i) => `${i + 1}. ${m.text}`).join('\n');
        }
        return window.ChaosHauntingPersona ? window.ChaosHauntingPersona.respond(q, response) : response;
      }
      return response;
    }
    return 'وحدة الأوامر غير متصلة. تحقق من تحميل js/brain/words/commands.js.';
  }
  // v2.9.0 orchestration wrapper: every turn receives a plan and a metadata-only execution trace.
  // The legacy responder remains the executor so existing project commands and memory rules stay compatible.
  const legacyGetResponse = getResponse;
  getResponse = async function (query) {
    const q = String(query ?? '').trim();
    if (/^(?:اشرح الخطة الأخيرة|اشرح اخر خطة|فسر الخطة|كيف قررت|ليش اخترت هذا المسار|explain last plan)$/iu.test(q)) {
      return window.CHAOSOSCore?.explainLast?.() || 'لا توجد خطة محفوظة بعد. أرسل طلبًا أولًا ثم اطلب شرح الخطة.';
    }
    if (/^(?:حالة التكامل|فحص تكامل النظام|integration status|system integration)$/iu.test(q)) {
      return JSON.stringify(window.CHAOSOSCore?.diagnostics?.() || { ok:false, message:'النواة الموحدة غير متاحة في هذه الصفحة.' }, null, 2);
    }
    if (window.CHAOSOSCore?.runConversation) {
      return window.CHAOSOSCore.runConversation(q, {
        history: currentSession?.messages || [],
        sessionId: currentSession?.id || 'default',
        executor: async (safeQuery) => {
          const wordIntent = window.CHAOSWords?.resolveHandlers?.(safeQuery); if (wordIntent?.handled) return wordIntent.answer || wordIntent.message || '';
          const wordMatch = window.CHAOSWords?.match?.(safeQuery); if (wordMatch?.answer) return wordMatch.answer;
          const localRuntime = window.CHAOSLocalLanguageRuntime;
          if (localRuntime?.respond) {
            const local = localRuntime.respond(safeQuery);
            if (local?.handled && local?.grounded && local?.answer) return local.answer;
          }
          return legacyGetResponse(safeQuery);
        }
      });
    }
    return legacyGetResponse(q);
  };

  async function submitQuery() {
    if (!input || requestInProgress) return;
    const query = input.value.trim(); if (!query) return;
    if (window.ChaosSecurity?.inspectQuery) {
      const inspection = window.ChaosSecurity.inspectQuery(query);
      if (!inspection.safe) { window.ChaosSecurity.audit?.('terminal-input-blocked', inspection.code || 'blocked'); announce('رفضت طبقة الأمان هذا الإدخال: ' + (inspection.reason || 'النص غير مسموح.')); return; }
    }
    if (window.ChaosSecurity?.allowRequest && !window.ChaosSecurity.allowRequest('terminal', 18, 10000)) {
      announce('مهلًا؛ تجاوزت سرعة الرسائل المسموحة مؤقتًا. انتظر قليلًا ثم أعد المحاولة.'); return;
    }
    input.value = '';
    if (window.ChaosHauntingPersona) window.ChaosHauntingPersona.observe();
    const session = currentSession || createSession(); currentSession = session;
    session.messages.push({ role: 'user', content: query, timestamp: Date.now() }); session.updatedAt = Date.now();
    if (session.messages.filter(m => m.role === 'user').length === 1 && session.title === 'محادثة جديدة') session.title = query.length > 42 ? query.slice(0, 42) + '…' : query;
    saveSessions(); renderCurrentSession(); renderHistory(); requestInProgress = true; if (sendButton) sendButton.disabled = true; if (input) input.disabled = true;
    try {
      const response = await getResponse(query);
      if (response !== '__CHAT_CLEARED__') { const replyText = String(response ?? ''); session.messages.push({ role: 'assistant', content: replyText, timestamp: Date.now() }); const voicePrefs = window.VoidOS?.prefs?.() || {}; if (voicePrefs.autoReadReplies === true && window.VoidOS?.speak) { const cleanReply = replyText.slice(0, 1800); setTimeout(() => window.VoidOS.speak(cleanReply), 120); } }
    } catch (error) { console.error('[CHAOS] request failed', error); session.messages.push({ role: 'assistant', content: 'تعذر إكمال الطلب. افحص الاتصال أو افتح الإعدادات وشغّل التشخيص. لم يتم تجاهل الخطأ بصمت.', timestamp: Date.now() }); }
    finally { session.updatedAt = Date.now(); window.CHAOSConversationMemory?.index?.(session.id, session.messages); saveSessions(); requestInProgress = false; if (sendButton) sendButton.disabled = false; if (input) { input.disabled = false; input.focus(); } renderCurrentSession(); renderHistory(); }
  }
  input?.addEventListener('keydown', e => { if (e.key === 'Enter') { e.preventDefault(); submitQuery(); } });
  sendButton?.addEventListener('click', submitQuery);
  renderCurrentSession(); renderHistory(); window.CHAOSConversationMemory?.index?.(currentSession?.id || 'default', currentSession?.messages || []);
  // The separate command center queues one explicit command here; consume it once, with an age limit.
  try { const pending = JSON.parse(localStorage.getItem('chaos_pending_command_v1') || 'null'); if (pending && typeof pending.command === 'string' && Date.now() - Number(pending.at || 0) < 120000) { localStorage.removeItem('chaos_pending_command_v1'); setTimeout(() => { if (input && sendButton) { input.value = pending.command.slice(0, 300); submitQuery(); } }, 180); } else if (pending) localStorage.removeItem('chaos_pending_command_v1'); } catch (error) { console.warn('[CHAOS] queued command was not consumed:', error); }
  console.info('[CHAOS] local-first conversation manager ready.');
});
