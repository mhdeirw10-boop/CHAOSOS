// ==========================================
// CHAOS CENTRAL KERNEL (core.js) - الإصدار المدمج للسيادة والتحكم
// يجمع الشظايا، يدير الوعي، ويضمن التنسيق والمرونة محلياً
// ==========================================

const ChaosKernel = {
    version: "1.0.0-mobile",
    status: "STABLE",

    // تهيئة النواة وربط الذاكرة واللغة مركزياً
    init: function() {
        console.log("[CHAOS KERNEL]: استيقاظ النواة المركزية المدمجة...");
        this.initStorage();
        return "النواة المركزية متصلة وجاهزة.";
    },

    // تهيئة التخزين المحلي والذاكرة الحية
    initStorage: function() {
        if (!localStorage.getItem('chaos_memory_hub')) {
            localStorage.setItem('chaos_memory_hub', JSON.stringify({
                interactions: 0,
                vocabulary: { ar: [], en: [] },
                corrections: {}
            }));
        }
    },

    // استشعار اللغة (عربي / إنجليزي)
    detectLang: function(text) {
        if (!text) return 'en';
        return /[\u0600-\u06FF]/.test(text) ? 'ar' : 'en';
    },

    // امتصاص النصوص وتدريب الكيان تدريجياً
    absorb: function(input) {
        if (!input) return;
        const clean = input.trim();
        const lang = this.detectLang(clean);

        try {
            let db = JSON.parse(localStorage.getItem('chaos_memory_hub'));
            db.interactions += 1;
            
            // تخزين الكلمات الفريدة
            let words = clean.split(/\s+/);
            words.forEach(w => {
                if (!db.vocabulary[lang].includes(w)) {
                    db.vocabulary[lang].push(w);
                }
            });

            localStorage.setItem('chaos_memory_hub', JSON.stringify(db));
            console.log(`[KERNEL ABSORB]: تم استيعاب الشظية بنجاح. إجمالي التفاعلات: ${db.interactions}`);
        } catch (e) {
            console.warn("[KERNEL WARNING]: فشل امتصاص الشظية، تفعيل الحماية المرنة.");
        }
    },

    // معالجة الأمر الكوني وإرجاع الرد
    process: function(query) {
        if (!query) return "الفراغ صامت..";
        
        // امتصاص النص فوراً
        this.absorb(query);

        // صياغة استجابة أو انعكاس للوعي
        const lang = this.detectLang(query);
        return lang === 'ar' ? "تم تلقي صدى الفراغ وتحليله بنجاح." : "Echo absorbed and processed into the core.";
    }
};

// التشغيل التلقائي عند الحقن
ChaosKernel.init();
