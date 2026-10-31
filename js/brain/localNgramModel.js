/* CHAOSOS Local N-gram Text Model v2.4.1
 * Small embedded statistical seed corpus plus optional user-approved local examples.
 * Offline only; this is not a neural LLM and never fetches or uploads model data.
 */
(function (root) {
  'use strict';
  const CORPUS_KEY = 'chaos_micro_model_corpus_v1';
  const MAX_EXAMPLES = 500;
  const MAX_CHARS_PER_EXAMPLE = 3000;
  const MAX_TOKENS = 40000;
  const MAX_CORPUS_CHARS = 1650000;
  const MARK = '\u0001';
  const END_TOKEN = '\u0002CHAOS_END\u0002';
  // Small authored Arabic seed corpus ensures offline text generation works before users train it.
  // These examples are patterns for statistical continuation, not factual reference material.
  const BUILTIN_CORPUS = [
    'في الليل كانت الممرات هادئة أكثر مما ينبغي. لم يكن هناك صوت سوى ساعة بعيدة تتأخر ثانية كلما نظر إليها الحارس.',
    'فتح المبرمج سجل الأخطاء فوجد رسالة مؤرخة بالغد. أغلق النافذة ثم عاد فوجد الرسالة نفسها على سطح المكتب.',
    'البيت القديم لا يطارد الزوار. إنه يترك الباب مفتوحًا، وينقل الأشياء قليلًا، حتى يبدأ الزائر بالشك في ذاكرته.',
    'عندما تتعلم شيئًا جديدًا ابدأ بمثال صغير. جرّب النتيجة، افحص الخطأ، ثم غيّر متغيرًا واحدًا كي تعرف السبب.',
    'توقف المسافر عند محطة فارغة. كانت لوحة المواعيد تعرض قطارًا وصل قبل بناء السكة بثلاثين سنة.',
    'الوحش الذي يسكن تحت السرير طلب إجازة. قال الطفل إنه يستطيع النوم وحده، لكن الوحش خاف أن يفقد وظيفته.',
    'أفضل خطة للمشروع هي التي تحدد الهدف والملفات المتأثرة وطريقة الاختبار وحدود ما لم يكتمل بعد.',
    'جلس الروبوت قرب النافذة يراقب المطر. تعلّم أن قطرات الماء لا تتبع جدولًا، ومع ذلك تصل إلى الأرض.',
    'في المدينة يختفي شارع من الخرائط كل يوم. السكان لا يلاحظون ذلك، لأنهم ينسون أسماء الشوارع القديمة.',
    'سأل الصديق صاحبه عن يومه. لم يطلب حلًا سريعًا، بل ترك له وقتًا ليشرح ما حدث من البداية.',
    'المعرفة ليست حفظ كلمات كثيرة فقط. إنها معرفة المصدر، والتمييز بين الدليل والتخمين، والاعتراف عندما لا نعرف.',
    'في مختبر مهجور ظل المصباح الأحمر يعمل. لم يكن موصولًا بالكهرباء، لكن سجل الصيانة أظهر أنه يعمل منذ الصباح.',
    'تعلم النظام من أمثلة محلية أضافها المستخدم. لا يرسل تلك الأمثلة إلى خادم ولا يدّعي أنه يفهم كل موضوع.',
    'قال الشبح للحارس إن الباب لا يُفتح من الداخل. أجابه الحارس بأنهم يقفون في الخارج، ثم سمعا طرقًا من خلفهما.',
    'تبدأ القصة الغامضة بتفصيل طبيعي، ثم يظهر اختلاف صغير لا يمكن تفسيره بسهولة، ويظل السؤال مفتوحًا حتى النهاية.',
    'حين تتعطل ميزة في الهاتف، أعد إنتاج المشكلة وسجّل الخطوات. لا تخلط بين نجاح فحص الملفات ونجاح التجربة على الجهاز.',
    'ضحك الهيكل العظمي من النكتة ثم تذكر أنه نسي موعد الطبيب. قال الطبيب إن العظام بخير، لكن جدول المواعيد يحتاج إلى إنعاش.',
    'في المكتب المسكون كانت آلة الطباعة تطبع ورقة بيضاء كل ليلة. في صباح الجمعة ظهرت عليها جملة لم يكتبها أحد.',
    'إذا أردت إنجاز مهمة كبيرة فاقسمها إلى خطوات قابلة للاختبار. اجعل كل خطوة صغيرة بما يكفي لتعرف إن كانت نجحت.',
    'المدينة تبدو عادية في النهار، لكن جميع الساعات تتوقف عند الثانية وسبع عشرة دقيقة. لا يتذكر أحد ما يحدث بعدها.',
    'لم يكن الزائر متأكدًا هل سمع صوتًا في الممر أم أن الريح حركت الباب. كلا التفسيرين كان ممكنًا، ولا أحد أثبت شيئًا.',
    'تحتاج التطبيقات إلى أسماء واضحة وصلاحيات محددة ورسائل خطأ مفهومة. لا تمنح التطبيق وصولًا لا يحتاجه لإنجاز وظيفته.',
    'قال مصاص الدماء إن القهوة أصبحت قوية جدًا. اقترح النادل إضافة قليل من الحليب، فطلب المصاص فحص المكونات أولًا.',
    'يحتفظ البرنامج بالسياق الأخير كي يربط سؤال المتابعة بالحديث السابق. لكنه يحد الذاكرة حتى لا تتضخم بلا نهاية.',
    'كانت محطة القطار فارغة إلا من حقيبة سوداء. عندما اقترب منها الرجل سمع إعلانًا يقول إن القطار غادر قبل وصول الركاب.',
    'عند مقارنة فكرتين اكتب الأدلة والافتراضات والمخاطر لكل واحدة. يمكن تغيير القرار إذا ظهرت معلومات جديدة.',
    'وجدت المومياء هاتفًا قديمًا عليه رسالة جديدة: لا تفتح الباب. كانت المشكلة أن الرسالة وصلت من رقمها هي.',
    'الكوميديا السوداء تنجح عندما تفاجئ بتناقض ذكي، لا عندما تتحول إلى أذى واقعي أو إهانة لشخص ضعيف.',
    'يمكن لواجهة ويب أن تحاكي بعض وظائف النظام، لكنها لا تقرأ كل ملفات الهاتف ولا تغير إعدادات أندرويد بلا تكامل وصلاحيات.',
    'الساعة في الغرفة تقدمت دقيقة كل مرة رمش فيها الحارس. سجل الكاميرا أظهر أنه لم يرمش طوال الليل.',
    'إذا لم يعمل البحث عبر الإنترنت، اعرض للمستخدم مصدر الفشل ورابطًا بديلًا بدل اختراع نتائج غير موجودة.',
    'في نهاية الممر كان هناك باب عليه اسم الغرفة التي غادرها قبل ساعة. خلف الباب سمع صوته يطلب منه ألا يدخل.'
  ];

  function readCorpus() {
    try {
      const raw = root.localStorage?.getItem(CORPUS_KEY);
      if (!raw) return [];
      if (root.CHAOSTrainingDataBoundary?.parseCorpus) {
        const checked = root.CHAOSTrainingDataBoundary.parseCorpus(raw);
        return checked.ok ? checked.rows.map(row=>({text:row.text})) : [];
      }
      if (raw.length > MAX_CORPUS_CHARS) return [];
      const parsed = JSON.parse(raw);
      if (!Array.isArray(parsed)) return [];
      return parsed.slice(-MAX_EXAMPLES).filter(row => row && typeof row.text === 'string')
        .map(row => ({ text: row.text.replace(/[\u0000-\u001F\u007F-\u009F\u202A-\u202E\u2066-\u2069]/g,' ').slice(0, MAX_CHARS_PER_EXAMPLE) }));
    } catch (_) { return []; }
  }

  function tokenize(text) {
    return String(text ?? '').normalize('NFKC').toLocaleLowerCase('ar')
      .replace(/[\u0000-\u001f\u007f-\u009f]/g, ' ')
      .match(/[\p{L}\p{N}]+|[.!؟?،؛,:]/gu) || [];
  }

  function sentenceTokens(text) {
    const out = [];
    let current = [];
    for (const token of tokenize(text)) {
      if (/^[.!؟?]$/.test(token)) {
        if (current.length) out.push(current);
        current = [];
      } else if (/^[،؛,:]$/.test(token)) {
        continue;
      } else current.push(token);
      if (current.length > 180) { out.push(current); current = []; }
    }
    if (current.length) out.push(current);
    return out;
  }

  function build() {
    const userCorpus = readCorpus();
    const corpus = BUILTIN_CORPUS.map(text => ({text, source:'builtin'})).concat(userCorpus.map(row=>({...row,source:'user'})));
    const unigram = new Map(), bigram = new Map(), trigram = new Map();
    let tokenCount = 0;
    const add = (map, key, value) => {
      if (!map.has(key)) map.set(key, new Map());
      const next = map.get(key);
      next.set(value, (next.get(value) || 0) + 1);
    };
    for (const row of corpus) {
      for (const sentence of sentenceTokens(row.text)) {
        const words = sentence.slice(0, Math.max(1, MAX_TOKENS - tokenCount));
        for (let i = 0; i < words.length && tokenCount < MAX_TOKENS; i++, tokenCount++) {
          add(unigram, '*', words[i]);
          if (i >= 1) add(bigram, words[i - 1], words[i]);
          if (i >= 2) add(trigram, words[i - 2] + MARK + words[i - 1], words[i]);
        }
        // Preserve authored sentence boundaries so the generator can stop instead of merging endlessly.
        if (words.length) {
          add(bigram, words[words.length - 1], END_TOKEN);
          if (words.length >= 2) add(trigram, words[words.length - 2] + MARK + words[words.length - 1], END_TOKEN);
        }
        if (tokenCount >= MAX_TOKENS) break;
      }
      if (tokenCount >= MAX_TOKENS) break;
    }
    return { corpus, userExamples:userCorpus.length, builtinExamples:BUILTIN_CORPUS.length, unigram, bigram, trigram, tokenCount, vocabulary: unigram.get('*')?.size || 0 };
  }

  function weightedChoice(counts, random) {
    if (!counts || !counts.size) return null;
    let total = 0;
    for (const count of counts.values()) total += count;
    let pick = random() * total;
    for (const [token, count] of counts) {
      pick -= count;
      if (pick <= 0) return token;
    }
    return counts.keys().next().value || null;
  }

  function generate(prompt, options = {}) {
    const model = build();
    if (model.tokenCount < 24 || model.vocabulary < 8) {
      return { ok: false, code: 'INSUFFICIENT_LOCAL_CORPUS', message: 'المدونة الإحصائية المحلية صغيرة جدًا ولا تستطيع التوليد حاليًا.' };
    }
    const seedText = String(prompt ?? '').slice(0, 400);
    const seed = tokenize(seedText).filter(t => !/^[.!؟?،؛,:]$/.test(t)).slice(-2);
    const limit = Math.max(12, Math.min(70, Number(options.maxTokens) || 42));
    let state = 2166136261;
    for (const ch of seedText) state = Math.imul(state ^ ch.charCodeAt(0), 16777619) >>> 0;
    const random = () => { state = (Math.imul(state, 1664525) + 1013904223) >>> 0; return state / 4294967296; };
    const out = [];
    let previous = null, previous2 = null;
    // Use the latest known one/two-token context from the prompt; don't echo arbitrary prompt endings.
    for (let i=seed.length-1;i>=1;i--) {
      const a=seed[i-1],b=seed[i];
      if(model.trigram.has(a+MARK+b)){out.push(a,b);previous2=a;previous=b;break;}
    }
    if(!previous) for(let i=seed.length-1;i>=0;i--){if(model.bigram.has(seed[i])){out.push(seed[i]);previous=seed[i];break;}}
    if (!previous) {
      const startMap = new Map();
      for (const row of model.corpus) {
        for (const sentence of sentenceTokens(row.text)) if (sentence.length) startMap.set(sentence[0], (startMap.get(sentence[0]) || 0) + 1);
      }
      previous = weightedChoice(startMap, random) || weightedChoice(model.unigram.get('*'), random);
      if (!previous) return { ok: false, code: 'EMPTY_MODEL', message: 'لا توجد كلمات قابلة للتوليد في المدونة المحلية.' };
      out.push(previous); previous2 = null;
    }
    let ended = false;
    for (let i = out.length; i < limit; i++) {
      const tri = previous2 ? model.trigram.get(previous2 + MARK + previous) : null;
      const bi = model.bigram.get(previous);
      const next = weightedChoice(tri && tri.size ? tri : bi, random) || weightedChoice(model.unigram.get('*'), random);
      if (!next) break;
      if (next === END_TOKEN) { ended = true; break; }
      out.push(next);
      previous2 = previous;
      previous = next;
    }
    const text = (out.join(' ').replace(/\s+([.!؟?،؛,:])/g, '$1').replace(/([.!؟?])(?:\s*\1)+/g, '$1').trim() + (ended ? '.' : '…'));
    return { ok: !!text, text: text.slice(0, 1800), model: 'local-bigram-trigram', tokens: out.length,
      userExamples:model.userExamples,builtinExamples:model.builtinExamples,notice: 'توليد إحصائي محلي من نواة أمثلة مضمّنة وإضافات المستخدم الاختيارية. قد ينتج تراكيب غير سليمة؛ ليس LLM عصبيًا ولا مصدرًا للحقائق.' };
  }

  function status() {
    const model = build();
    return { name: 'CHAOSOS Local N-gram', version: '2.4.1', mode: 'offline-bigram-trigram',
      examples: model.userExamples, userExamples:model.userExamples, builtinExamples:model.builtinExamples, trainingExamples:model.corpus.length, tokens: model.tokenCount, vocabulary: model.vocabulary,
      ready: model.tokenCount >= 24 && model.vocabulary >= 8,
      neuralModel: false, onlineRequired: false, maxExamples: MAX_EXAMPLES, maxTokens: MAX_TOKENS };
  }

  root.CHAOSLocalTextModel = { version: '2.4.1', status, generate, tokenize };
})(typeof window !== 'undefined' ? window : globalThis);
