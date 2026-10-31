// Add-on settings panel. The original settings inline code is intentionally unchanged.
document.addEventListener('DOMContentLoaded', () => {
  const main = document.querySelector('.settings-container');
  if (!main) return;
  const CHAT_KEY = 'chaos_chat_history';
  const CURRENT_KEY = 'chaos_current_session';
  let shellParentReady = false;
  window.addEventListener('message', event => { if (event.source === window.parent && event.data?.type === 'VOIDOS_SHELL_READY') shellParentReady = true; });
  const MEMORY_KEY = 'chaos_saved_memories_v1';
  const extension = document.createElement('section');
  extension.className = 'settings-extension';
  extension.innerHTML = `
    <div class="setting-card system-preferences-card" id="shellPreferencesCard" data-settings-searchable="true">
      <h3>إعدادات واجهة CHAOSOS المشتركة</h3>
      <p>تُطبّق هذه الخيارات على قشرة CHAOSOS عند فتح صفحة الإعدادات من داخل النظام. السطوع والاتصال والصوت هنا حالات محاكاة للواجهة، وليست تحكمًا بأجهزة الهاتف الفعلية.</p>
      <label class="extension-field">المظهر <select id="shellTheme"><option value="dark">داكن — Eye of Chaos</option><option value="light">فاتح</option></select></label>
      <label class="extension-field">سطوع الواجهة <input id="shellBrightness" type="range" min="35" max="100" step="5"></label>
      <label class="extension-toggle"><input type="checkbox" id="shellWifi"> حالة Wi-Fi المحاكية: متصل</label>
      <label class="extension-toggle"><input type="checkbox" id="shellBluetooth"> حالة Bluetooth المحاكية: تعمل</label>
      <label class="extension-toggle"><input type="checkbox" id="shellSound"> صوت الواجهة المحاكى</label>
      <label class="extension-toggle"><input type="checkbox" id="shellParticles"> مؤثرات الجزيئات</label>
      <label class="extension-toggle"><input type="checkbox" id="shellContrast"> تباين مرتفع</label>
      <label class="extension-field">حجم النص <input id="shellFontScale" type="range" min="0.85" max="1.3" step="0.05"></label>
      <label class="extension-field">اتجاه الشاشة <select id="shellOrientation"><option value="auto">تلقائي — حسب تدوير الجهاز</option><option value="portrait">عمودي</option><option value="landscape">عرضي</option></select><small class="extension-muted">في APK يدعم Screen Orientation يمكن طلب تغيير الاتجاه؛ المعاينة داخل المتصفح قد لا تسمح بقفله برمجيًا.</small></label>
      <div class="extension-actions"><button type="button" class="extension-btn" id="saveShellPreferences">حفظ إعدادات CHAOSOS</button><button type="button" class="extension-btn" id="openControlCenterFromSettings">مركز التحكم</button><button type="button" class="extension-btn" id="openLockSettingsFromSettings">إعدادات شاشة القفل</button><button type="button" class="extension-btn danger" id="lockVoidOSFromSettings">قفل CHAOSOS الآن</button><button type="button" class="extension-btn" id="openManagerFromSettings">مدير التطبيقات</button></div>
      <div class="extension-status" id="shellPreferencesStatus" role="status" aria-live="polite"></div>
    </div>
    <div class="setting-card" id="settingsNavigationCard" data-settings-searchable="true">
      <h3>التنقل السريع داخل النظام</h3><p>استخدم قائمة الهمبركر للتنقل، أو اختصارات هذه الصفحة لفتح أدوات النظام الأساسية.</p>
      <input id="settingsSearch" type="search" class="extension-search" placeholder="ابحث عن إعداد: المظهر، الذاكرة، PIN، التخزين…" autocomplete="off" aria-label="البحث في الإعدادات">
      <p id="settingsSearchStatus" class="extension-muted" role="status" aria-live="polite">تظهر جميع الإعدادات.</p>
      <div class="extension-actions"><button type="button" class="extension-btn" data-settings-jump="voidosGlobalSettings">الإعدادات العامة</button><button type="button" class="extension-btn" data-settings-jump="advancedVoidTools">التخزين والنسخ الاحتياطي</button><button type="button" class="extension-btn" data-settings-jump="chaosMemorySettings">ذاكرة CHAOS</button><button type="button" class="extension-btn" data-settings-jump="chaosDiagnosticsSettings">التشخيص</button></div>
    </div>
    <div class="setting-card" id="chaosMemorySettings" data-settings-searchable="true" data-settings-key="memory">
      <h3>الذكريات المحفوظة يدويًا — CHAOS SYSTEM</h3>
      <p>احفظ معلومات تختارها بنفسك ليستطيع النظام استرجاعها بأوامر الذاكرة. هذا السجل مستقل عن سجل المحادثات وعن سجل التفاعلات التلقائي.</p>
      <textarea id="savedMemoryInput" maxlength="2000" placeholder="اكتب معلومة تريد من CHAOS SYSTEM تذكّرها..."></textarea>
      <input id="savedMemorySearch" type="search" class="extension-search" placeholder="ابحث داخل الذكريات المحفوظة…" autocomplete="off">
      <div class="extension-actions"><button type="button" class="extension-btn" id="saveManualMemory">حفظ الذكرى</button></div>
      <p class="extension-muted" id="savedMemoryCount"></p>
      <ul class="saved-memory-list" id="savedMemoryList"></ul>
      <div class="extension-status" id="savedMemoryStatus" role="status" aria-live="polite"></div>
    </div>
    <div class="setting-card" id="chaosHistorySettings" data-settings-searchable="true" data-settings-key="history backup export import">
      <h3>إدارة سجل المحادثات والبيانات</h3>
      <p>سجل المحادثات منفصل عن ذاكرة CHAOS SYSTEM. التصدير ينشئ نسخة JSON محلية؛ ومسح المحادثات لا يمس الذكريات أو ذاكرة النظام.</p>
      <p class="extension-muted" id="chatHistoryCount"></p>
      <div class="extension-actions">
        <button type="button" class="extension-btn" id="exportChaosData">تصدير المحادثات والذكريات JSON</button>
        <button type="button" class="extension-btn" id="chooseChaosBackup">استيراد نسخة احتياطية JSON</button>
        <button type="button" class="extension-btn danger" id="clearChatHistory">مسح سجل المحادثات فقط</button>
        <input id="chaosBackupFile" type="file" accept="application/json,.json" hidden>
      </div>
      <div class="extension-status" id="chatDataStatus" role="status" aria-live="polite"></div>
    </div>
    <div class="setting-card" id="chaosLearningSettings" data-settings-searchable="true" data-settings-key="التعلم المحلي learning pattern">
      <h3>التعلم المحلي الاختياري</h3>
      <p>عند التفعيل، يمكن لأمر «تعلّم نمط: نص» حفظ إحصاءات حروف محدودة محليًا. لا يجري التدريب تلقائيًا عند إرسال الرسائل، ولا ينشئ ذلك نموذجًا لغويًا.</p>
      <label class="extension-toggle"><input type="checkbox" id="localLearningToggle" checked> السماح بالتعلم اليدوي</label>
      <p class="extension-muted" id="localLearningStatus" role="status"></p>
    </div>
    <div class="setting-card" id="chaosPersonaSettings" data-settings-searchable="true" data-settings-key="الشخصية السردية horror">
      <h3>شخصية CHAOS SYSTEM السردية</h3>
      <p>تغيّر تدريجي خيالي في نبرة الردود اعتمادًا على عدد الزيارات والتفاعلات المحلية فقط. لا تستخدم الموقع أو الحساسات ولا تدّعي وعيًا حقيقيًا.</p>
      <label class="extension-toggle"><input type="checkbox" id="hauntingPersonaToggle" checked> تفعيل التصاعد السردي</label>
      <p class="extension-muted" id="hauntingPersonaStatus" role="status"></p>
      <div class="extension-actions"><button type="button" class="extension-btn" id="resetHauntingPersona">إعادة ضبط مرحلة الشخصية</button></div>
    </div>
    <div class="setting-card" id="chaosDiagnosticsSettings" data-settings-searchable="true" data-settings-key="التشخيص status security tests">
      <h3>تشخيص CHAOS SYSTEM</h3>
      <p>يفحص توفر التخزين والوحدات الأساسية والاتصال المعلن من المتصفح. لا يرفع التقرير إلى أي جهة.</p>
      <div class="extension-actions"><button type="button" class="extension-btn" id="runChaosDiagnostics">تشغيل التشخيص</button></div>
      <pre id="chaosDiagnosticsOutput" class="diagnostics-output" aria-live="polite">لم يُشغّل التشخيص بعد.</pre>
    </div>`;
  const statusLog = document.getElementById('statusLog');
  main.appendChild(extension);

  const $ = id => document.getElementById(id);
  // Give pre-existing settings cards searchable metadata without rebuilding their original controls.
  main.querySelectorAll('.setting-card').forEach((card, index) => {
    card.dataset.settingsSearchable = 'true';
    if (!card.dataset.settingsKey) card.dataset.settingsKey = (card.textContent || '').slice(0, 500);
  });
  const shellKey = 'voidos_shell_settings_v1';
  const shellDefaults = { theme:'dark', wifi:true, bluetooth:false, sound:true, brightness:100, particles:false, contrast:false, fontScale:1, orientation:'auto' };
  function readShellPrefs() { try { const value = JSON.parse(localStorage.getItem(shellKey) || '{}'); return { ...shellDefaults, ...(value && typeof value === 'object' && !Array.isArray(value) ? value : {}) }; } catch (_) { return { ...shellDefaults }; } }
  function validShellPrefs(p) { return { theme:p.theme === 'light' ? 'light' : 'dark', wifi:!!p.wifi, bluetooth:!!p.bluetooth, sound:!!p.sound, particles:!!p.particles, contrast:!!p.contrast, brightness:Math.max(35,Math.min(100,Number(p.brightness)||100)), fontScale:Math.max(.85,Math.min(1.3,Number(p.fontScale)||1)), orientation:['auto','portrait','landscape'].includes(p.orientation)?p.orientation:'auto' }; }
  function setShellPrefs(p, statusMessage) { const clean = validShellPrefs(p); try { localStorage.setItem(shellKey, JSON.stringify(clean)); } catch (_) { $('shellPreferencesStatus').textContent='تعذر حفظ الإعدادات في التخزين المحلي.'; return; } if (shellParentReady) window.parent.postMessage({type:'VOIDOS_APPLY_SHELL_SETTINGS',settings:clean}, '*'); $('shellPreferencesStatus').textContent=statusMessage || 'تم حفظ إعدادات الواجهة محليًا. قد يتطلب التطبيق المعروض دعمًا خاصًا لبعض الخيارات.'; return clean; }
  function paintShellPrefs() { const p = readShellPrefs(); $('shellTheme').value=p.theme; $('shellBrightness').value=p.brightness; $('shellWifi').checked=!!p.wifi; $('shellBluetooth').checked=!!p.bluetooth; $('shellSound').checked=!!p.sound; $('shellParticles').checked=!!p.particles; $('shellContrast').checked=!!p.contrast; $('shellFontScale').value=p.fontScale; $('shellOrientation').value=p.orientation||'auto'; }
  function collectShellPrefs() { const p=readShellPrefs(); p.theme=$('shellTheme').value; p.brightness=Number($('shellBrightness').value); p.wifi=$('shellWifi').checked; p.bluetooth=$('shellBluetooth').checked; p.sound=$('shellSound').checked; p.particles=$('shellParticles').checked; p.contrast=$('shellContrast').checked; p.fontScale=Number($('shellFontScale').value); p.orientation=$('shellOrientation').value; return p; }
  function requestShellAction(action) { if (shellParentReady) { window.parent.postMessage({type:'VOIDOS_SYSTEM_ACTION',action}, '*'); $('shellPreferencesStatus').textContent='أُرسل الطلب إلى واجهة CHAOSOS.'; return; } const map={home:'index.html',settings:'settings.html',manager:'apps/void-manager/index.html',commands:'chaos-commands.html',controls:'index.html?voidosAction=control',recent:'index.html?voidosAction=recent','lock-settings':'index.html?voidosAction=lock-settings',lock:'index.html?voidosAction=lock'}; if (map[action]) location.href=map[action]; }
  $('saveShellPreferences').addEventListener('click', () => setShellPrefs(collectShellPrefs()));
  ['shellTheme','shellBrightness','shellWifi','shellBluetooth','shellSound','shellParticles','shellContrast','shellFontScale'].forEach(id => $(id).addEventListener('change', () => setShellPrefs(collectShellPrefs(), 'تم تطبيق التعديل وحفظه محليًا.')));
  $('openControlCenterFromSettings').addEventListener('click', () => requestShellAction('controls'));
  $('openLockSettingsFromSettings').addEventListener('click', () => requestShellAction('lock-settings'));
  $('lockVoidOSFromSettings').addEventListener('click', () => requestShellAction('lock'));
  $('openManagerFromSettings').addEventListener('click', () => requestShellAction('manager'));
  $('globalSaveSettings')?.addEventListener('click', () => {
    const p = readShellPrefs();
    const theme = $('globalTheme')?.value;
    if (theme === 'light' || theme === 'dark') p.theme = theme;
    if ($('globalParticles')) p.particles = $('globalParticles').checked;
    if ($('globalContrast')) p.contrast = $('globalContrast').checked;
    if ($('globalFontScale')) p.fontScale = Number($('globalFontScale').value) || 1;
    setShellPrefs(p, 'حُفظت الإعدادات العامة والمشتركة.');
  });
  paintShellPrefs();
  // Search hides only matching settings cards; it never deletes or changes stored data.
  $('settingsSearch').addEventListener('input', () => {
    const term=$('settingsSearch').value.trim().toLocaleLowerCase(); let shown=0;
    main.querySelectorAll('.setting-card').forEach(card => { const hay=((card.textContent||'')+' '+(card.dataset.settingsKey||'')).toLocaleLowerCase(); const hit=!term||hay.includes(term); card.hidden=!hit; if(hit)shown++; });
    $('settingsSearchStatus').textContent=term?`الإعدادات المطابقة: ${shown}`:'تظهر جميع الإعدادات.';
  });
  main.addEventListener('click', e => { const b=e.target.closest('[data-settings-jump]'); if(!b)return; const target=$(b.dataset.settingsJump); if(target){target.hidden=false;target.scrollIntoView({behavior:'smooth',block:'start'});} });
  // Sidebar links navigate the outer VoidOS shell when this page is running inside its app frame.
  const sidebar=$('sidebar');
  $('openSidebar')?.addEventListener('click',()=>{sidebar?.classList.add('active');$('openSidebar').setAttribute('aria-expanded','true');});
  $('closeSidebar')?.addEventListener('click',()=>{sidebar?.classList.remove('active');$('openSidebar')?.setAttribute('aria-expanded','false');});
  sidebar?.addEventListener('click',e=>{const a=e.target.closest('a[data-shell-action]');if(!a)return;if(shellParentReady){e.preventDefault();const action=a.dataset.shellAction;window.parent.postMessage({type:'VOIDOS_SYSTEM_ACTION',action},'*');sidebar.classList.remove('active');$('openSidebar')?.setAttribute('aria-expanded','false');}});
  $('sidebar')?.addEventListener('click',e=>{if(e.target===$('sidebar'))$('sidebar').classList.remove('active');});
  document.addEventListener('keydown',e=>{if(e.key==='Escape'){$('sidebar')?.classList.remove('active');$('openSidebar')?.setAttribute('aria-expanded','false');}});

  function readJSON(key, fallback) {
    try { const value = JSON.parse(localStorage.getItem(key) || 'null'); return value == null ? fallback : value; }
    catch (_) { return fallback; }
  }
  function downloadJSON(filename, data) {
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a'); link.href = url; link.download = filename;
    document.body.appendChild(link); link.click(); link.remove(); setTimeout(() => URL.revokeObjectURL(url), 1000);
  }
  function renderMemories() {
    const allMemories = window.ChaosSavedMemory ? window.ChaosSavedMemory.list() : readJSON(MEMORY_KEY, []);
    const search = ($('savedMemorySearch')?.value || '').trim().toLocaleLowerCase();
    const memories = allMemories.filter(memory => !search || String(memory.text || '').toLocaleLowerCase().includes(search));
    $('savedMemoryCount').textContent = `عدد الذكريات اليدوية: ${memories.length} / 100`;
    const list = $('savedMemoryList'); list.textContent = '';
    if (!memories.length) { const li = document.createElement('li'); li.className = 'extension-muted'; li.textContent = 'لا توجد ذكريات محفوظة بعد.'; list.appendChild(li); return; }
    memories.forEach(memory => {
      const li = document.createElement('li'); li.className = 'saved-memory-item';
      const content = document.createElement('div'); content.className = 'saved-memory-text';
      content.appendChild(document.createTextNode(memory.text));
      const date = document.createElement('small'); date.className = 'saved-memory-date';
      date.textContent = memory.createdAt ? new Date(memory.createdAt).toLocaleString() : '';
      content.appendChild(date);
      const remove = document.createElement('button'); remove.type = 'button'; remove.className = 'extension-btn danger'; remove.textContent = 'حذف';
      remove.addEventListener('click', () => {
        if (!confirm('هل تريد حذف هذه الذكرى المحفوظة نهائيًا؟')) return;
        const ok = window.ChaosSavedMemory ? window.ChaosSavedMemory.remove(memory.id) : false;
        $('savedMemoryStatus').textContent = ok ? 'تم حذف الذكرى.' : 'تعذر حذف الذكرى.';
        renderMemories();
      });
      li.append(content, remove); list.appendChild(li);
    });
  }
  function renderChatCount() {
    const chats = readJSON(CHAT_KEY, []);
    const count = Array.isArray(chats) ? chats.length : 0;
    const messages = Array.isArray(chats) ? chats.reduce((sum, chat) => sum + (Array.isArray(chat.messages) ? chat.messages.length : 0), 0) : 0;
    $('chatHistoryCount').textContent = `المحادثات المحفوظة: ${count} — الرسائل: ${messages}`;
  }
  $('savedMemorySearch').addEventListener('input', renderMemories);
  $('saveManualMemory').addEventListener('click', () => {
    const result = window.ChaosSavedMemory ? window.ChaosSavedMemory.add($('savedMemoryInput').value) : { ok:false, message:'وحدة الذاكرة غير متصلة.' };
    $('savedMemoryStatus').textContent = result.message;
    if (result.ok) $('savedMemoryInput').value = '';
    renderMemories();
  });
  $('exportChaosData').addEventListener('click', () => {
    const data = {
      format: 'eye-of-chaos-backup',
      schemaVersion: 2,
      exportedAt: new Date().toISOString(),
      chatHistory: readJSON(CHAT_KEY, []),
      currentSessionId: localStorage.getItem(CURRENT_KEY),
      savedMemories: readJSON(MEMORY_KEY, []),
      automaticLongTermMemory: readJSON('chaos_persistent_long_term', null),
      webMemory: readJSON('chaos_web_memory', null),
      shortTermBuffer: readJSON('chaos_short_term_buffer', null),
      legacyLongTermMemory: readJSON('chaos_long_term_memory', null),
      memoryEnabled: localStorage.getItem('chaosMemoryEnabled'),
      theme: localStorage.getItem('chaosTheme'),
      hauntingEnabled: localStorage.getItem('chaosHauntingEnabled'),
      learningEnabled: localStorage.getItem('chaosLearningEnabled')
    };
    downloadJSON('eye-of-chaos-data-backup.json', data);
    $('chatDataStatus').textContent = 'تم تجهيز نسخة JSON للتنزيل. احتفظ بها في مكان آمن.';
  });
  $('clearChatHistory').addEventListener('click', () => {
    if (!confirm('سيتم حذف سجل محادثات CHAOS SYSTEM المحلي فقط. لن تُحذف الذكريات. هل تريد المتابعة؟')) return;
    localStorage.removeItem(CHAT_KEY); localStorage.removeItem(CURRENT_KEY);
    $('chatDataStatus').textContent = 'تم مسح سجل المحادثات فقط. افتح CHAOS SYSTEM لإنشاء جلسة جديدة.';
    renderChatCount();
  });
  $('chooseChaosBackup').addEventListener('click', () => $('chaosBackupFile').click());
  $('chaosBackupFile').addEventListener('change', async event => {
    const file = event.target.files && event.target.files[0];
    if (!file) return;
    try {
      if (file.size > 10 * 1024 * 1024) throw new Error('حجم النسخة أكبر من 10 ميغابايت.');
      const backup = JSON.parse(await file.text());
      if (!backup || typeof backup !== 'object' || Array.isArray(backup)) throw new Error('بنية ملف النسخة غير صحيحة.');
      if (!Array.isArray(backup.chatHistory) || !Array.isArray(backup.savedMemories)) throw new Error('الملف لا يحتوي على سجل المحادثات والذكريات بالصيغة المتوقعة.');
      if (!confirm(`سيتم استبدال سجل المحادثات والذكريات اليدوية الحالية بالبيانات الموجودة في الملف «${file.name}». قد لا يمكن التراجع دون نسخة أخرى. هل تريد المتابعة؟`)) return;
      const validChats = backup.chatHistory.filter(c => c && typeof c.id === 'string' && Array.isArray(c.messages)).map(c => ({
        id: c.id, title: typeof c.title === 'string' ? c.title.slice(0, 80) : 'محادثة مستوردة',
        createdAt: Number(c.createdAt) || Date.now(), updatedAt: Number(c.updatedAt) || Number(c.createdAt) || Date.now(),
        messages: c.messages.filter(m => m && (m.role === 'user' || m.role === 'assistant')).map(m => ({ role:m.role, content:String(m.content ?? '').slice(0,50000), timestamp:Number(m.timestamp)||Date.now() })).slice(0,5000)
      }));
      const validMemories = backup.savedMemories.filter(m => m && typeof m.text === 'string').slice(0,100).map(m => ({
        id: typeof m.id === 'string' ? m.id : 'import_' + Math.random().toString(36).slice(2),
        text: m.text.slice(0,2000), source: typeof m.source === 'string' ? m.source : 'import',
        createdAt: Number(m.createdAt) || Date.now(), updatedAt: Number(m.updatedAt) || Number(m.createdAt) || Date.now()
      }));
      localStorage.setItem(CHAT_KEY, JSON.stringify(validChats));
      localStorage.setItem(MEMORY_KEY, JSON.stringify(validMemories));
      if (backup.currentSessionId && validChats.some(c => c.id === backup.currentSessionId)) localStorage.setItem(CURRENT_KEY, backup.currentSessionId);
      else localStorage.removeItem(CURRENT_KEY);
      const mapping = { automaticLongTermMemory:'chaos_persistent_long_term', webMemory:'chaos_web_memory', shortTermBuffer:'chaos_short_term_buffer', legacyLongTermMemory:'chaos_long_term_memory' };
      Object.entries(mapping).forEach(([field,key]) => { if (Object.prototype.hasOwnProperty.call(backup,field)) { if (backup[field] === null) localStorage.removeItem(key); else localStorage.setItem(key, JSON.stringify(backup[field])); } });
      if (typeof backup.memoryEnabled === 'string') localStorage.setItem('chaosMemoryEnabled', backup.memoryEnabled === 'false' ? 'false' : 'true');
      if (typeof backup.theme === 'string') localStorage.setItem('chaosTheme', backup.theme);
      if (typeof backup.hauntingEnabled === 'string') localStorage.setItem('chaosHauntingEnabled', backup.hauntingEnabled === 'false' ? 'false' : 'true');
      if (typeof backup.learningEnabled === 'string') localStorage.setItem('chaosLearningEnabled', backup.learningEnabled === 'false' ? 'false' : 'true');
      $('chatDataStatus').textContent = `تم استيراد ${validChats.length} محادثة و${validMemories.length} ذكرى. أعد تحميل الصفحات المفتوحة لتظهر البيانات.`;
      renderMemories(); renderChatCount();
    } catch (error) { $('chatDataStatus').textContent = 'فشل الاستيراد: ' + (error.message || 'ملف غير صالح.'); }
    finally { event.target.value = ''; }
  });
  const learningToggle = $('localLearningToggle');
  if (learningToggle) {
    learningToggle.checked = localStorage.getItem('chaosLearningEnabled') !== 'false';
    learningToggle.addEventListener('change', () => {
      localStorage.setItem('chaosLearningEnabled', learningToggle.checked ? 'true' : 'false');
      $('localLearningStatus').textContent = learningToggle.checked ? 'التعلم اليدوي مسموح، لكنه لا يعمل إلا عند استخدام الأمر الصريح.' : 'تم إيقاف حفظ أنماط لغوية جديدة.';
    });
    $('localLearningStatus').textContent = learningToggle.checked ? 'التعلم اليدوي مسموح عند الطلب فقط.' : 'التعلم المحلي متوقف.';
  }

  const hauntingToggle = $('hauntingPersonaToggle');
  const hauntingStatus = $('hauntingPersonaStatus');
  if (hauntingToggle) {
    hauntingToggle.checked = localStorage.getItem('chaosHauntingEnabled') !== 'false';
    const renderHauntingStatus = () => {
      const state = window.ChaosHauntingPersona ? window.ChaosHauntingPersona.status() : null;
      hauntingStatus.textContent = state ? `المرحلة الحالية: ${state.name} — الزيارات: ${state.visits} — التفاعلات: ${state.interactions}` : 'ستُقرأ حالة الشخصية عند فتح الطرفية.';
    };
    hauntingToggle.addEventListener('change', () => {
      localStorage.setItem('chaosHauntingEnabled', hauntingToggle.checked ? 'true' : 'false');
      hauntingStatus.textContent = hauntingToggle.checked ? 'تم تفعيل التصاعد السردي المحلي.' : 'تم إيقاف التصاعد السردي؛ تبقى بقية وظائف النظام مستقلة.';
    });
    $('resetHauntingPersona')?.addEventListener('click', () => {
      if (!confirm('إعادة عداد الزيارات والتفاعلات إلى الصفر؟ لن تُحذف المحادثات أو الذكريات.')) return;
      if (window.ChaosHauntingPersona) window.ChaosHauntingPersona.reset();
      else { try { localStorage.removeItem('chaos_haunting_state_v1'); } catch (_) {} }
      hauntingStatus.textContent = 'أُعيد ضبط عدادات الشخصية. ستبدأ المرحلة من جديد عند فتح الطرفية.';
    });
    renderHauntingStatus();
  }

  $('runChaosDiagnostics').addEventListener('click', () => {
    const output = $('chaosDiagnosticsOutput');
    output.textContent = window.ChaosDiagnostics ? window.ChaosDiagnostics.report() : 'وحدة التشخيص غير متاحة في هذه الصفحة.';
  });

  // Confirm the existing purge button without rewriting its original implementation.
  const purge = $('clearMemoryBtn');
  if (purge) purge.addEventListener('click', event => {
    if (!confirm('سيتم مسح ذاكرة التفاعلات طويلة المدى وذاكرة الويب والذكريات اليدوية المحفوظة. لن يُمس سجل المحادثات أو إعداد تفعيل الذاكرة. هل تريد المتابعة؟')) {
      event.preventDefault(); event.stopImmediatePropagation();
      if (statusLog) statusLog.textContent = 'تم إلغاء عملية مسح الذاكرة.';
      return;
    }
    if (window.ChaosSavedMemory) window.ChaosSavedMemory.clear();
    else localStorage.removeItem(MEMORY_KEY);
    ['chaos_web_memory', 'chaos_short_term_buffer', 'chaos_long_term_memory'].forEach(key => localStorage.removeItem(key));
    setTimeout(renderMemories, 0);
  }, true);
  renderMemories(); renderChatCount();
});
