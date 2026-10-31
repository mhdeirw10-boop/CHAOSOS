// CHAOS SYSTEM — bounded local pattern store. This is not a language model.
const ChaosTextEngine = (() => {
  'use strict';
  const KEY = 'chaos_lang_model';
  const MAX_BYTES = 256 * 1024;
  const MAX_WORDS = 600;
  const MAX_PATTERNS = 1800;
  const MAX_CORRECTIONS = 80;
  const emptyModel = () => ({ vocabulary:{ar:[],en:[],zh:[]}, patterns:{ar:{},en:{},zh:{}}, corrections:{}, trainingSteps:0, schemaVersion:2 });
  function safeLoad() {
    try {
      const parsed = JSON.parse(localStorage.getItem(KEY) || 'null');
      if (!parsed || typeof parsed !== 'object') return emptyModel();
      const model = emptyModel();
      for (const lang of ['ar','en','zh']) {
        model.vocabulary[lang] = Array.isArray(parsed.vocabulary?.[lang]) ? parsed.vocabulary[lang].filter(x => typeof x === 'string').slice(-MAX_WORDS) : [];
        const pairs = parsed.patterns?.[lang] && typeof parsed.patterns[lang] === 'object' ? Object.entries(parsed.patterns[lang]).filter(([k,v]) => typeof k === 'string' && Number.isFinite(v) && v > 0).slice(-MAX_PATTERNS) : [];
        model.patterns[lang] = Object.fromEntries(pairs);
      }
      model.corrections = parsed.corrections && typeof parsed.corrections === 'object' ? Object.fromEntries(Object.entries(parsed.corrections).slice(-MAX_CORRECTIONS)) : {};
      model.trainingSteps = Math.max(0, Number(parsed.trainingSteps) || 0);
      model.schemaVersion = 2;
      return model;
    } catch (_) { return emptyModel(); }
  }
  function save(model) {
    try {
      let raw = JSON.stringify(model);
      // Prune old corrections and least-recently-seen entries until safely under quota.
      while (raw.length > MAX_BYTES && Object.keys(model.corrections).length) {
        delete model.corrections[Object.keys(model.corrections)[0]]; raw = JSON.stringify(model);
      }
      for (const lang of ['ar','en','zh']) {
        while (raw.length > MAX_BYTES && model.vocabulary[lang].length) { model.vocabulary[lang].shift(); raw = JSON.stringify(model); }
        while (raw.length > MAX_BYTES && Object.keys(model.patterns[lang]).length) { delete model.patterns[lang][Object.keys(model.patterns[lang])[0]]; raw = JSON.stringify(model); }
      }
      if (raw.length > MAX_BYTES) return false;
      localStorage.setItem(KEY, raw); return true;
    } catch (_) { return false; }
  }
  function detectScript(text) {
    if (!text) return 'unknown';
    if (/[\u0600-\u06FF]/.test(text)) return 'ar';
    if (/[\u4e00-\u9fff]/.test(text)) return 'zh';
    if (/^[A-Za-z\s]+$/.test(text)) return 'en';
    return 'unknown';
  }
  function trainOnText(text) {
    if (!text || typeof text !== 'string' || text.length > 5000) return 'رفض التدريب: النص فارغ أو أطول من 5000 حرف.';
    try { if (typeof localStorage !== 'undefined' && (localStorage.getItem('chaosLearningEnabled') === 'false' || localStorage.getItem('chaosMemoryEnabled') === 'false')) return 'التعلم المحلي متوقف من الإعدادات.'; } catch (_) { return 'التخزين المحلي غير متاح؛ لم تُحفظ بيانات.'; }
    const lang = detectScript(text); if (lang === 'unknown') return 'لم أحدد لغة مدعومة؛ لم تُحفظ بيانات.';
    const model = safeLoad();
    const words = text.split(/\s+/).map(w => w.replace(/[^\w\u0600-\u06FF\u4e00-\u9fff]/g,'')).filter(Boolean).slice(0,250);
    for (const word of words) {
      const vocab = model.vocabulary[lang];
      const oldIndex = vocab.indexOf(word); if (oldIndex >= 0) vocab.splice(oldIndex,1);
      vocab.push(word); if (vocab.length > MAX_WORDS) vocab.splice(0, vocab.length - MAX_WORDS);
      for (let i=0; i<word.length-1; i++) {
        const pair = word.slice(i,i+2); model.patterns[lang][pair] = (model.patterns[lang][pair] || 0) + 1;
      }
    }
    const patternEntries = Object.entries(model.patterns[lang]);
    if (patternEntries.length > MAX_PATTERNS) model.patterns[lang] = Object.fromEntries(patternEntries.slice(-MAX_PATTERNS));
    model.trainingSteps += 1;
    return save(model) ? `تم حفظ أنماط محدودة للغة ${lang.toUpperCase()} محليًا. هذه إحصاءات حروف وليست تدريب نموذج لغوي.` : 'تعذر حفظ الأنماط؛ لم تُفقد بقية بيانات النظام.';
  }
  function registerCorrection(faultyOutput, userCorrection, lang) {
    if (!faultyOutput || !userCorrection || String(userCorrection).length > 2000) return 'بيانات التصحيح غير صالحة.';
    const model = safeLoad(); const key = String(faultyOutput).trim().toLowerCase();
    model.corrections[key] = { correctedText:String(userCorrection).trim(), language:lang || detectScript(userCorrection), timestamp:Date.now() };
    const entries = Object.entries(model.corrections); if (entries.length > MAX_CORRECTIONS) model.corrections = Object.fromEntries(entries.slice(-MAX_CORRECTIONS));
    return save(model) ? 'تم حفظ التصحيح محليًا.' : 'تعذر حفظ التصحيح بسبب حد التخزين.';
  }
  function getCorrection(output) { const value = safeLoad().corrections[String(output || '').trim().toLowerCase()]; return value ? value.correctedText : null; }
  function generateSynthesizedWord(lang) { const words = safeLoad().vocabulary[lang]; return words && words.length ? words[words.length-1] : ({ar:'فراغ',en:'void',zh:'虚空'}[lang] || 'void'); }
  function synthesizeSentence(lang) { const word = generateSynthesizedWord(lang); return lang === 'ar' ? `${word}...` : `${word}.`; }
  return { storageKey:KEY, maxBytes:MAX_BYTES, loadLanguageModel:safeLoad, detectScript, trainOnText, registerCorrection, getCorrection, generateSynthesizedWord, synthesizeSentence };
})();

if (typeof window !== 'undefined') window.ChaosTextEngine = ChaosTextEngine;
