/**
 * CHAOS SYSTEM - AI Persona
 * aiPersona.js
 *
 * مسؤول عن أسلوب وشخصية الرد فقط.
 * لا يحتوي على الذاكرة أو الـCanon أو المعرفة السرية.
 */

const AIPersona = {

    style: {
        tone: "هادئ، غامض، دقيق",
        useARGStyle: true
    },

    intros: [
        "[نبضة النظام]: ",
        "[تحليل الأرشيف]: ",
        "[استرجاع البيانات]: ",
        "[معالجة الاستعلام]: "
    ],

    atmosphereLines: [
        "// الفراغ صامت.",
        "[تزامن الذاكرة...]",
        "[استقرار الإشارة: مستقر]",
        "[استرجاع البيانات من الطبقة الحالية...]"
    ],

    getRandom: function(list) {
        return list[Math.floor(Math.random() * list.length)];
    },

    getWelcomeMessage: function() {
        return (
            "[SYSTEM INITIALIZED]\n" +
            "تم الاتصال بـ CHAOS SYSTEM.\n" +
            "الأرشيف متاح ضمن حدود الصلاحيات الحالية.\n" +
            "أدخل استعلامك للبدء."
        );
    },

    getUnknownResponse: function() {
        return "لا توجد بيانات كافية في السجلات المتاحة حاليًا.";
    },

    getRestrictedResponse: function() {
        return "هذه البيانات غير متاحة ضمن مستوى الصلاحية الحالي.";
    },

    formulateResponse: function(rawResponse, options = {}) {

        if (!rawResponse) return "";

        let response = rawResponse;

        if (options.addIntro !== false) {
            response = this.getRandom(this.intros) + response;
        }

        if (
            this.style.useARGStyle &&
            options.addAtmosphere !== false &&
            Math.random() < 0.20
        ) {
            response += "\n" + this.getRandom(this.atmosphereLines);
        }

        return response;
    },

    setARGStyle: function(enabled) {
        this.style.useARGStyle = Boolean(enabled);
    }
};