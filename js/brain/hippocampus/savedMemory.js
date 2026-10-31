// CHAOS SYSTEM — User-managed persistent memories, separate from chat history.
(function () {
  'use strict';
  const KEY = 'chaos_saved_memories_v1';
  const ENABLED_KEY = 'chaosMemoryEnabled';
  function read() {
    try { const v = JSON.parse(localStorage.getItem(KEY) || '[]'); return Array.isArray(v) ? v.filter(x => x && typeof x.id === 'string' && typeof x.text === 'string') : []; }
    catch (e) { console.error('[CHAOS MEMORY] Read failed', e); return []; }
  }
  function write(items) { try { localStorage.setItem(KEY, JSON.stringify(items)); return true; } catch (e) { console.error('[CHAOS MEMORY] Save failed', e); return false; } }
  const api = {
    storageKey: KEY,
    list() { return read().sort((a,b) => b.createdAt - a.createdAt); },
    add(text) {
      text = String(text || '').trim();
      if (!text) return {ok:false,message:'اكتب المعلومة أولًا.'};
      if (localStorage.getItem(ENABLED_KEY) === 'false') return {ok:false,message:'الذاكرة متوقفة من الإعدادات. فعّل الذاكرة الحية أولًا.'};
      if (text.length > 2000) return {ok:false,message:'الحد الأقصى للذكرى الواحدة 2000 حرف.'};
      const items = read();
      if (items.some(x => x.text.toLocaleLowerCase() === text.toLocaleLowerCase())) return {ok:true,message:'هذه المعلومة محفوظة مسبقًا.'};
      items.unshift({id:'mem_' + Date.now().toString(36) + '_' + Math.random().toString(36).slice(2,7),text,source:'user',createdAt:Date.now(),updatedAt:Date.now()});
      if (items.length > 100) items.length = 100;
      return write(items) ? {ok:true,message:'تم حفظ المعلومة في ذاكرة CHAOS SYSTEM الدائمة على هذا المتصفح.'} : {ok:false,message:'تعذر الحفظ؛ قد تكون مساحة التخزين ممتلئة.'};
    },
    search(query) {
      const terms = String(query || '').trim().toLocaleLowerCase().split(/\s+/).filter(Boolean);
      if (!terms.length) return api.list();
      const normalize = value => String(value || '').toLocaleLowerCase().replace(/[أإآ]/g,'ا').replace(/ة/g,'ه').replace(/ى/g,'ي');
      return api.list().map(item => { const hay = normalize(item.text); const hits = terms.filter(term => hay.includes(normalize(term))).length; return { item, hits }; }).filter(row => row.hits > 0).sort((a,b) => b.hits-a.hits || (b.item.updatedAt||b.item.createdAt)-(a.item.updatedAt||a.item.createdAt)).map(row => row.item);
    },
    removeByText(text) { const needle = String(text || '').trim().toLocaleLowerCase(); if (!needle) return false; const items = read(); const next = items.filter(x => x.text.toLocaleLowerCase() !== needle); return next.length !== items.length && write(next); },
    replaceExact(oldText, newText) {
      const oldNeedle = String(oldText || '').trim().toLocaleLowerCase();
      const replacement = String(newText || '').trim();
      if (!oldNeedle || !replacement || replacement.length > 2000) return {ok:false,message:'تحقق من النص القديم والجديد؛ الحد الأقصى 2000 حرف.'};
      if (localStorage.getItem(ENABLED_KEY) === 'false') return {ok:false,message:'الذاكرة متوقفة من الإعدادات.'};
      const items = read(); const target = items.find(x => x.text.toLocaleLowerCase() === oldNeedle);
      if (!target) return {ok:false,message:'لم أعثر على ذكرى تطابق النص القديم حرفيًا.'};
      if (!confirm('ستُستبدل الذكرى القديمة بالجديدة. راجع النصين قبل التأكيد. هل تريد المتابعة؟')) return {ok:false,message:'تم إلغاء تحديث الذكرى.'};
      if (items.some(x => x.id !== target.id && x.text.toLocaleLowerCase() === replacement.toLocaleLowerCase())) return {ok:false,message:'النص الجديد محفوظ مسبقًا كذكرى أخرى.'};
      target.text = replacement; target.updatedAt = Date.now(); target.source = 'user-updated';
      return write(items) ? {ok:true,message:'تم تحديث الذكرى القديمة بعد تأكيدك.'} : {ok:false,message:'تعذر حفظ التحديث.'};
    },
    remove(id) { const items = read(), next = items.filter(x => x.id !== id); return next.length !== items.length && write(next); },
    clear() { return write([]); },
    handleQuery(query) {
      const raw = String(query || '').trim();
      let m = raw.match(/^(?:احفظ|احفظ في الذاكرة|خزّن|خزن|save|remember|store)\s*[:：]\s*(.+)$/is);
      if (m) return api.add(m[1]).message;
      if (/^(?:ذكرياتي|اعرض ذكرياتي|اعرض الذاكرة المحفوظة|memories|show memories)$/i.test(raw)) {
        const items = api.list();
        return items.length ? 'الذكريات المحفوظة (' + items.length + '):\n' + items.slice(0,20).map((x,i)=>(i+1)+'. '+x.text).join('\n') : 'لا توجد ذكريات يدوية محفوظة. استخدم: احفظ: المعلومة / save: fact';
      }
      m = raw.match(/^(?:تذكر|ابحث في الذاكرة|استرجع الذاكرة|recall|search memory)\s*[:：]\s*(.+)$/is);
      if (m) { const found = api.search(m[1]); return found.length ? 'وجدت هذه الذكريات (مرتبة حسب صلة الكلمات):\n' + found.slice(0,10).map((x,i)=>(i+1)+'. '+x.text).join('\n') : 'لم أعثر على ذكرى محفوظة تطابق هذا البحث.'; }
      m = raw.match(/^(?:حدّث ذكرى|حدث ذكرى|استبدل ذكرى|update memory|replace memory)\s*[:：]\s*([\s\S]+?)\s*(?:=>|->|←)\s*([\s\S]+)$/i);
      if (m) return api.replaceExact(m[1], m[2]).message;
      m = raw.match(/^(?:احذف من الذاكرة|انسَ ذكرى|forget memory|delete memory)\s*[:：]\s*(.+)$/is);
      if (m) { const needle = m[1].trim(); if (!confirm('حذف الذكرى المطابقة حرفيًا؟ هذا الإجراء لا يمكن التراجع عنه إلا من نسخة احتياطية.')) return 'تم إلغاء حذف الذكرى.'; return api.removeByText(needle) ? 'تم حذف الذكرى المطابقة.' : 'لم أجد ذكرى مطابقة تمامًا. استخدم تذكر: كلمة للعثور عليها ثم احذفها من الإعدادات.'; }
      return null;
    }
  };
  window.ChaosSavedMemory = api;
})();
