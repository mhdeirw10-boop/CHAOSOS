// ==========================================
// CHAOS SYSTEM - Tri-Language Syntax & Grammar Engine (languageRules.js)
// دور الملف: إدارة قواعد اللغات الثلاث (العربية، الإنجليزية، الصينية) وفهم بنية الجمل وترتيب الأفعال.
// ==========================================

const ChaosLanguageRules = {
    version: "1.0.0",

    // قواعد وتوجيهات هيكلة الجمل لكل لغة
    rules: {
        ar: {
            name: "Arabic",
            structure: "VSO/SVO (Verb-Subject-Object or Subject-Verb-Object)",
            description: "اللغة العربية تتميز بالمرونة وغالباً تبدأ بالفعل أو الاسم، مع نظام تصريف دقيق للجذور والضمائر.",
            markers: ["ال", "في", "من", "على", "إلى", "أن", "ما"]
        },
        en: {
            name: "English",
            structure: "SVO (Subject-Verb-Object)",
            description: "اللغة الإنجليزية تتبع بنية صارمة (فاعل + فعل + مفعول به) مع استخدام أدوات التعريف والتنكير بوضوح.",
            markers: ["the", "is", "are", "and", "to", "in", "of"]
        },
        zh: {
            name: "Chinese",
            structure: "SVO (Subject-Verb-Object with Topic-Comment flow)",
            description: "اللغة الصينية تعتمد على السياق وبنية (فاعل + فعل + مفعول به) بدون تصريفات معقدة للأفعال، لكنها تعتمد على النغمات والرموز.",
            markers: ["的", "是", "在", "不", "有", "人", "我"]
        }
    },

    // دالة تحليل وتحديد بنية الجملة بناءً على الكلمات المفتاحية والأدوات
    analyzeSyntax: function(text, langCode) {
        if (!text || !this.rules[langCode]) {
            return { valid: false, message: "تعذر تحليل البنية لعدم توفر اللغة أو النص." };
        }

        const langData = this.rules[langCode];
        const cleanText = text.trim();
        let detectedMarkers = [];

        // التحقق من وجود العلامات أو الأدوات الخاصة باللغة
        langData.markers.forEach(marker => {
            if (cleanText.includes(marker)) {
                detectedMarkers.push(marker);
            }
        });

        return {
            language: langData.name,
            expectedStructure: langData.structure,
            foundMarkers: detectedMarkers,
            syntaxIntegrity: detectedMarkers.length > 0 ? "STABLE_STRUCTURE" : "RAW_FRAGMENT"
        };
    },

    // فحص ذكي للغة النص المدخل وتوجيهه لقواعده الصحيحة
    detectAndValidate: function(text) {
        if (!text) return 'en';
        
        // فحص الأحرف الصينية
        if (/[\u4e00-\u9fa5]/.test(text)) {
            return { code: 'zh', analysis: this.analyzeSyntax(text, 'zh') };
        }
        // فحص الأحرف العربية
        else if (/[\u0600-\u06FF]/.test(text)) {
            return { code: 'ar', analysis: this.analyzeSyntax(text, 'ar') };
        }
        // الافتراضي الإنجليزية أو اللغات اللاتينية
        else {
            return { code: 'en', analysis: this.analyzeSyntax(text, 'en') };
        }
    }
};
