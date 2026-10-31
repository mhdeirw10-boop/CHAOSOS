// CHAOS Security Input — text normalization, bounded parsing and URL validation.
(function(g){'use strict';
 const max=12000;
 g.ChaosSecurityInput={version:'1.7.0',normalize(value){return String(value??'').normalize('NFC').replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F\u202A-\u202E\u2066-\u2069]/g,'').slice(0,max)},isSafeExternalURL(value){try{const u=new URL(String(value));return u.protocol==='https:'||u.protocol==='http:'}catch{return false}},escapeHTML(value){return String(value??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]))}};
})(window);
