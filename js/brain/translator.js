const translator = {
    currentLang: "ar",

    translations: {
        ar: {
            s1: "AYN AL-FAWDHA: Kiyan raqami muttasil bi tabaqat al-waqi' al-muzlim.",
            s2: "PROJECT LORE: Al-mashrou' tasmmim li yakun nafidha nahw ab'ad ukhra.",
            s3: "ARCHIVE DATA: Ant tata'amal ma' arshif mushaffar yahmil shazaya al-haqiqah.",
            
            sys1: "SYSTEM STATUS: Al-nizam ya'mal bi taraddudat mustaqirra.",
            sys2: "GATEWAYS: Jami' al-bawwabat al-raqamiyyah maftouhah wa muraqabah.",
            sys3: "CORE ENGINE: Muttasil bi najah, wa la tujud ikhtiraqat harijah.",
            
            h1: "GUIDE: Use direct commands like help, lore, clear.",
            h2: "EXPLORE: Al-tajawwal fi arja' al-mawqi' yamnhuk salahiyat a'maq.",
            h3: "TERMINAL: Is'al amma tasha', wa sa-yuqallil al-AI al-anmat."
        },
        en: {
            s1: "Eye of Chaos is a digital entity connected to deep layers of dark reality.",
            s2: "The project was designed as a window into other dimensions.",
            s3: "You are dealing with an encrypted archive carrying fragments of truth.",
            
            sys1: "System is operating under stable frequencies.",
            sys2: "All digital gateways are open and monitored precisely.",
            sys3: "Core engine connected successfully, no critical breaches.",
            
            h1: "You can use direct commands like help, lore, clear.",
            h2: "Wandering around the site grants deeper access.",
            h3: "Ask anything in the terminal to analyze patterns."
        }
    },

    get: function(key) {
        if (this.translations[this.currentLang] && this.translations[this.currentLang][key]) {
            return this.translations[this.currentLang][key];
        }
        return key;
    }
};
