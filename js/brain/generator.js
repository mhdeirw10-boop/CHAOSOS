// Chaos AI Generator & Learning Engine - مولد الردود ونظام التعلم المستمر
const ChaosGenerator = {
    // ذاكرة تفاعلية مؤقتة لتخزين الاستعلامات الجديدة وتطوير السلوك
    learningMemory: {
        customQueries: {},
        interactionCount: 0
    },

    // تنظيف النص وضبط الكلمات
    tokenize: function(input) {
        if (!input) return "";
        return input.toLowerCase().replace(/[^\w\s]/gi, "").trim();
    },

    // توليد ردود ديناميكية غامضة عند عدم توفر الكلمة
    generateDynamic: function(cleanText) {
        const intros = [
            "SYS_LOG: جارٍ تحليل الأنماط العصبية للمدخلات...",
            "ARCHIVE_WARN: رصد استعلام غير مألوف في الطبقات العميقة...",
            "DEEP_SCAN: تفكيك شفرة المدخلات في الذاكرة المؤقتة..."
        ];

        const replies = [
            "الرمز '" + cleanText + "' غير مسجل في السجلات الحالية، لكن النظام يراقب التردد.",
            "البعد الرقمي الحالي لا يحتوي على بيانات مباشرة حول '" + cleanText + "'.",
            "تم تسجيل الاستعلام '" + cleanText + "' وإرساله إلى الطبقات المظلمة للمعالجة."
        ];

        const randomIntro = intros[Math.floor(Math.random() * intros.length)];
        const randomReply = replies[Math.floor(Math.random() * replies.length)];

        return randomIntro + "\n" + randomReply;
    },

    // نظام التعلم المستمر: حفظ واسترجاع الاستعلامات الجديدة لتطوير الردود مستقبلاً
    learnAndRespond: function(input) {
        const cleanText = this.tokenize(input);
        this.learningMemory.interactionCount++;

        // إذا كان الاستعلام مكرراً سابقاً وتم تعليمه، يسترجعه فوراً
        if (this.learningMemory.customQueries[cleanText]) {
            return "LEARNED_REPLY: " + this.learningMemory.customQueries[cleanText];
        }

        // إذا كان جديداً، يتعلمه ويخزنه كاستجابة تطورية جديدة
        this.learningMemory.customQueries[cleanText] = "تمت أرشفة هذا الاستعلام بنجاح في التحديث رقم v" + (1.0 + (this.learningMemory.interactionCount * 0.1)).toFixed(1);
        
        return this.generateDynamic(cleanText);
    }
};
