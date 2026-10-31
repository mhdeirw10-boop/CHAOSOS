// CHAOSOS Security Storage — safe JSON storage helpers and bounded audit log.
(function(g){'use strict';const PREFIX='chaos_security_audit_v2';
 function read(key,fallback){try{const raw=localStorage.getItem(key);if(raw===null||raw.length>200000)return fallback;return JSON.parse(raw)}catch{return fallback}}
 function write(key,value){try{const raw=JSON.stringify(value);if(raw.length>200000)return false;localStorage.setItem(key,raw);return true}catch{return false}}
 function audit(kind,detail){const rows=read(PREFIX,[]);const safeDetail=String(detail??'').replace(/(?:password|pin|token|secret)\s*[:=]\s*[^\s,;]+/ig,'[redacted-secret]').slice(0,160);rows.unshift({time:new Date().toISOString(),kind:String(kind).slice(0,80),detail:safeDetail});write(PREFIX,rows.slice(0,100))}
 g.ChaosSecurityStorage={version:'2.4.1',read,write,audit,auditLog(){const rows=read(PREFIX,[]);return Array.isArray(rows)?rows.slice(0,100):[]}};
})(window);
