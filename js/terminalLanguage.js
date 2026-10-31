// Small UI-language switch for the CHAOS SYSTEM terminal. Commands remain language-aware only where their modules support it.
(function () {
  'use strict';
  const KEY = 'chaos_terminal_language';
  const dictionaries = {
    ar: { historyBtn:'📜 السجل', backBtn:'← العودة للموقع الرئيسي', langBtn:'🌐 English', inputPlaceholder:'اكتب أمرك هنا...', sidebarTitle:'سجل المحادثات', newChatBtn:'+ محادثة جديدة' },
    en: { historyBtn:'📜 History', backBtn:'← Back to home', langBtn:'🌐 العربية', inputPlaceholder:'Type a command or message...', sidebarTitle:'Chat history', newChatBtn:'+ New chat' }
  };
  function getLanguage() { return localStorage.getItem(KEY) === 'en' ? 'en' : 'ar'; }
  function apply() {
    const lang = getLanguage(), dict = dictionaries[lang];
    document.documentElement.lang = lang;
    document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
    document.querySelectorAll('[data-i18n]').forEach(el => { const key = el.getAttribute('data-i18n'); if (dict[key]) el.textContent = dict[key]; });
    document.querySelectorAll('[data-i18n-ph]').forEach(el => { const key = el.getAttribute('data-i18n-ph'); if (dict[key]) el.placeholder = dict[key]; });
    const input = document.getElementById('cmd');
    if (input) input.setAttribute('aria-label', lang === 'ar' ? 'أدخل رسالتك' : 'Enter your message');
    const menu = document.getElementById('menu');
    if (menu) menu.setAttribute('aria-label', lang === 'ar' ? 'فتح سجل المحادثات' : 'Open chat history');
    const close = document.getElementById('closeHistorySidebar');
    if (close) close.setAttribute('aria-label', lang === 'ar' ? 'إغلاق سجل المحادثات' : 'Close chat history');
    document.dispatchEvent(new CustomEvent('chaos-language-change', { detail: { language: lang } }));
  }
  window.ChaosTerminalLanguage = { getLanguage, toggle() { localStorage.setItem(KEY, getLanguage() === 'ar' ? 'en' : 'ar'); apply(); }, apply };
  document.addEventListener('DOMContentLoaded', () => {
    const button = document.getElementById('langToggle');
    if (button) button.addEventListener('click', () => window.ChaosTerminalLanguage.toggle());
    apply();
  });
})();
