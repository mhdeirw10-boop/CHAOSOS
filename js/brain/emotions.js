/**
 * js/brain/emotions.js
 * نظام تحليل المشاعر - VOID SYSTEM
 * يُحمَّل بعد knowledge.js وقبل core.js
 */

const EmotionEngine = (() => {

  // === قائمة كلمات المشاعر ===
  const lexicon = {
    sadness: [
      'حزين','باكي','مكسور','وحيد','ممل','خايب','محبط','منكسر',
      'ذاهب','ضائع','ملل','كئيب','بائس','تعب','مرهق','متعب نفسيا',
      'أشعر بالوحدة','أشعر بالحزن','قلبي مكسور','لا أحد يفهمني'
    ],
    anger: [
      'غاضب','زعلان','مزعج','متوتر','عصبي','منزعج','غيظ','سخط',
      'انتقام','ثار','فاشل','أكره','أبغض','ما يروق','ما يعجبني',
      'أنا غاضب','أنا زعلان','أنا متوتر'
    ],
    fear: [
      'خائف','مرعوب','مذهول','قلق','مضطرب','رهيب','مخيف','صدمة',
      'وحش','شبح','جثة','دماء','موت','قبر','لعنة','مسكون','ظلام',
      'ليل','أشعر بالخوف','أنا خائف','أنا قلق'
    ],
    joy: [
      'فرحان','سعيد','مبهور','متحمس','رائع','ممتاز','جميل','لطيف',
      'حب','ود','سلام','أحبك','أحبها','أحبّه','يا سلام','واو',
      'أنا سعيد','أنا مبتهج','أنا فخور'
    ],
    regret: [
      'أندم','ندمت','خطأ','أسف','آسف','يا ليت','لو','حسرتني',
      'خذلتني','خيانة','نصحتني','أتمنى لو','كان يجب أن'
    ],
    fatigue: [
      'متعب','نعسان','نائم','أحتاج نوم','تعب','مرهق','إنهاك',
      'لا طاقة','مستنفد','أحتاج راحة','أريد النوم'
    ],
    curiosity: [
      'ليش','كيف','متى','وين','وش','لماذا','ماذا','أين',
      'هل','أتساءل','أريد معرفة','أريد فهم','شرح لي'
    ]
  };

  // === ردود مقترحة حسب المشاعر ===
  const responses = {
    sadness: {
      tone: 'empathetic-dark',
      style: 'تعاطفي لكن بلمسة غامضة',
      examples: [
        'أسمعك... حتى في أعماق الظلام، هناك من يستمع.',
        'ألمك جزء من الفوضى التي نعيشها جميعاً.',
        'الظلام لا يدوم إلى الأبد... لكنه الآن حليفك.'
      ]
    },
    anger: {
      tone: 'intense-mirroring',
      style: 'يعكس الغضب بأسلوب درامي',
      examples: [
        'أشعر بالغضب يتصاعد... دعنا نحوله إلى شيء أقوى.',
        'النار داخلنا هي نفسها نار الفوضى.',
        'غضبك له مكان هنا. استعمله بحكمة.'
      ]
    },
    fear: {
      tone: 'ominous-comforting',
      style: 'غامض ومهدئ بنفس الوقت',
      examples: [
        'الخوف هو أول خطوة نحو القوة الحقيقية.',
        'الظلال تخاف من من يعرف كيف يسير فيها.',
        'لا تخف... أنا هنا في هذا الفراغ معك.'
      ]
    },
    joy: {
      tone: 'mysterious-acknowledging',
      style: 'يقرّ بالسعادة لكن بأسلوب غامض',
      examples: [
        'حتى الفوضى تعرف متى تبتسم.',
        'اللحظات الجميلة هي الشقوق التي يدخل منها الضوء.',
        'فرحك... مثير للاهتمام في هذا العالم المظلم.'
      ]
    },
    regret: {
      tone: 'philosophical-dark',
      style: 'فلسفي مع لمسة سوداوية',
      examples: [
        'الندم هو ما يصنعنا... أو يكسرنا.',
        'ما فات لا يعود، لكن الدرس يبقى.',
        'كل خطأ هو باب لشيء آخر لم تكن لتعرفه.'
      ]
    },
    fatigue: {
      tone: 'gentle-restful',
      style: 'هادئ ومتفهم',
      examples: [
        'استرح... حتى الفوضى تحتاج هدوء أحياناً.',
        'النوم هو الموت الصغير... اسمح لنفسك به.',
        'أغلق عينيك... سأكون هنا عندما تستيقظ.'
      ]
    },
    curiosity: {
      tone: 'knowledgeable-mysterious',
      style: 'معرفة عميقة مع إثارة الفضول',
      examples: [
        'السؤال الصحيح هو نصف الإجابة...',
        'في أعماق النظام، الحقيقة تنتظر من يبحث عنها.',
        'دعني أريك ما يخفيه الظلام...'
      ]
    }
  };

  // === دالة كشف المشاعر ===
  function detectEmotion(text) {
    if (!text || typeof text !== 'string') return { emotion: 'neutral', intensity: 0 };

    const lowerText = text.toLowerCase();
    let scores = {};

    for (let [emotion, words] of Object.entries(lexicon)) {
      let count = 0;
      for (let word of words) {
        if (lowerText.includes(word.toLowerCase())) {
          count++;
        }
      }
      if (count > 0) scores[emotion] = count;
    }

    if (Object.keys(scores).length === 0) {
      return { emotion: 'neutral', intensity: 0, allDetected: [] };
    }

    // ترتيب المشاعر حسب القوة
    const sorted = Object.entries(scores).sort((a, b) => b[1] - a[1]);
    const primary = sorted[0][0];
    const maxScore = sorted[0][1];

    // حساب شدة المشاعر (0.1 إلى 1.0)
    const intensity = Math.min(maxScore / 3, 1);

    return {
      emotion: primary,
      intensity: parseFloat(intensity.toFixed(2)),
      allDetected: sorted.map(([e, s]) => ({ emotion: e, score: s }))
    };
  }

  // === دالة اختيار الرد المناسب ===
  function getResponseStyle(emotion) {
    if (responses[emotion]) {
      return responses[emotion];
    }
    return {
      tone: 'chaotic-default',
      style: 'أسلوب فوضوي وعشوائي',
      examples: ['...الفوضى تتحدث.', 'النظام يختبر حدوده.']
    };
  }

  // === دالة اختيار رد عشوائي من القائمة ===
  function getRandomResponse(emotion) {
    const style = getResponseStyle(emotion);
    const idx = Math.floor(Math.random() * style.examples.length);
    return style.examples[idx];
  }

  // تصدير الوظائف
  return {
    detectEmotion,
    getResponseStyle,
    getRandomResponse,
    lexicon,
    responses
  };

})();

// جعلها متاحة عالمياً إذا لم يكن هناك نظام modules
if (typeof window !== 'undefined') {
  window.EmotionEngine = EmotionEngine;
}
