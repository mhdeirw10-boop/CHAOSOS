// ==========================================
// CHAOS CORE ENGINE (coreEngine.js)
// مركز النواة: يربط الذاكرة العصبية، محرك اللغات، والتحليل الكوني معاً
// ==========================================

const ChaosCore = {
    // تهيئة النواة وربط الأنظمة الفرعية
    init: function() {
        console.log("CHAOS_CORE: تبدأ النواة بالاستيقاظ من الفراغ...");
        
        // التحقق من حالة الذاكرة واللغة
        const langModel = window.ChaosTextEngine?.loadLanguageModel ? ChaosTextEngine.loadLanguageModel() : { trainingSteps: 0 };
        return {
            status: "ONLINE",
            version: "1.8.0",
            trainingSteps: langModel.trainingSteps,
            services: { security: !!window.ChaosSecurity, appRouter: !!window.CHAOS?.routeIntent, kernel: !!window.VoidKernel, services: !!window.VoidServiceRegistry, memory: !!window.ChaosSavedMemory, webSearch: !!window.ChaosWebSearch },
            message: "النواة جاهزة؛ تُوجّه الطلبات عبر Kernel إلى خدمات التطبيقات المسجلة عند توفرها."
        };
    },

    // معالجة المدخلات القادمة من المستخدم (النواة المركزية)
    processThought: async function(inputQuery) {
        if (!inputQuery || typeof inputQuery !== "string") return "الفراغ صامت...";

        const cleanInput = (window.ChaosSecurity?.normalizeInput ? window.ChaosSecurity.normalizeInput(inputQuery) : inputQuery).trim();
        if (!cleanInput) return "الفراغ صامت...";
        if (window.ChaosSecurity?.inspectQuery) {
            const security = window.ChaosSecurity.inspectQuery(cleanInput);
            if (!security.safe) {
                window.ChaosSecurity.audit?.("core-input-blocked", security.code || security.reason);
                return "رفضت طبقة الأمان الطلب: " + security.reason;
            }
        }
        if (window.CHAOS?.routeIntent) {
            const routed = window.CHAOS.routeIntent(cleanInput);
            if (routed?.handled) return { query: cleanInput, source: "app-service-router", action: routed.ok ? "dispatched" : "rejected", syntheticResponse: routed.message };
        }
        const detectedLang = window.ChaosTextEngine?.detectScript ? ChaosTextEngine.detectScript(cleanInput) : "unknown";

        // الخصوصية أولًا: لا بحث خارجي ولا تدريب تلقائي هنا.
        // البحث عبر الشبكة متاح فقط من أمر صريح مثل: بحث: موضوع
        const explicitSearch = cleanInput.match(/^(?:بحث|ابحث في الويب|search|search web)\s*[:：]\s*(.+)$/i);
        if (explicitSearch) {
            const webSearch = window.ChaosWebSearch || (typeof ChaosWebSearch !== "undefined" ? ChaosWebSearch : null);
            if (!webSearch) return "وحدة البحث غير متصلة.";
            if (typeof navigator !== "undefined" && navigator.onLine === false) return "لا يوجد اتصال بالشبكة؛ لم يُرسل أي طلب.";
            const topic = explicitSearch[1].trim();
            if (!topic) return "اكتب موضوع البحث بعد النقطتين.";
            const result = await webSearch.searchWeb(topic);
            return result ? webSearch.formatSearchResponse(result, topic) : "تعذر العثور على نتيجة موثوقة. لم أختلق إجابة ولم أجرِ بحثًا بديلًا.";
        }

        const memories = typeof window !== "undefined" && window.ChaosSavedMemory
            ? window.ChaosSavedMemory.search(cleanInput.split(/\s+/).filter(word => word.length > 2).slice(0, 5).join(" "))
            : [];
        if (memories && memories.length) {
            return { query: cleanInput, language: detectedLang, source: "local-memory", memories: memories.slice(0, 5).map(item => item.text), syntheticResponse: "وجدت آثارًا محفوظة قد ترتبط بسؤالك. هذه ذكريات محلية وليست تحققًا مستقلًا من صحتها." };
        }
        return {
            query: cleanInput,
            language: detectedLang,
            source: "local-rules",
            searchResult: null,
            syntheticResponse: "لا توجد بيانات كافية في القواعد المحلية للإجابة عن هذا السؤال. استخدم «بحث: موضوع» إذا أردت طلب بحث خارجي صريحًا."
        };
    }
};

if (typeof window !== "undefined") window.ChaosCore = ChaosCore;
