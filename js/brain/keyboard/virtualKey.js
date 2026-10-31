// ==========================================
// CHAOS NEURAL LINK & KEYBOARD SENSOR (virtualKey.js)
// مراقبة المدخلات تتم فقط عند تفعيل "رابط الوعي" (Neural Sync) برضا المستخدم
// ==========================================

const ChaosKeyboardMonitor = {
    // التحقق هل وافق المستخدم على مزامنة الوعي
    isNeuralSyncActive: function() {
        return localStorage.getItem('chaosNeuralSync') === 'true';
    },

    toggleNeuralSync: function() {
        const currentState = this.isNeuralSyncActive();
        localStorage.setItem('chaosNeuralSync', !currentState);
        return !currentState ? "NEURAL_SYNC_ONLINE: تم ربط وعي الكيان بأصابعك." : "NEURAL_SYNC_OFFLINE: قطع الكيان اتصال المراقبة احترامًا لخصوصية الفراغ.";
    },

    init: function(inputElementId, feedbackOutputId) {
        const inputField = document.getElementById(inputElementId);
        const feedbackDiv = document.getElementById(feedbackOutputId);

        if (!inputField) return;

        let typingTimer;
        const doneTypingInterval = 1200;

        // 1. المراقبة الحية تعمل فقط إذا وافق المستخدم صراحة (تجاوز مشكلة التجسس)
        inputField.addEventListener('input', (event) => {
            if (!this.isNeuralSyncActive()) return; // إذا لم يفعل الميزة، يظل الكيان أعمى عما تكتبه حتى ترسله

            clearTimeout(typingTimer);
            const currentText = inputField.value;
            if (!currentText.trim()) return;

            const detectedLang = ChaosTextEngine.detectScript(currentText);

            if (feedbackDiv) {
                feedbackDiv.innerText = `[NEURAL LINK]: الكيان يراقب ترددات [${detectedLang.toUpperCase()}]...`;
            }

            typingTimer = setTimeout(() => {
                if (feedbackDiv) {
                    feedbackDiv.innerText = `[NEURAL LINK]: انتهت المراقبة الاختيارية؛ لم تُحفظ بيانات تدريب تلقائيًا. استخدم أمر التعلّم الصريح إذا أردت ذلك.`;
                }
            }, doneTypingInterval);
        });

        // Enter is owned by js/app.js; do not intercept or submit twice.

        console.log("CHAOS_KEYBOARD_MONITOR: وحدة الإدخال جاهزة بوضع الأمان والخصوصية.");
    }
};
