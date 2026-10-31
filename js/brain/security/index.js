// CHAOSOS Security Facade v2.4.1 — defense-in-depth for a client-side application.
(function(g){'use strict';
 const policy=g.ChaosSecurityPolicy,input=g.ChaosSecurityInput,store=g.ChaosSecurityStorage,limits=g.ChaosSecurityStorageLimits,rate=g.ChaosSecurityRateLimit,nav=g.ChaosSecurityNavigation,training=g.CHAOSTrainingDataBoundary;
 g.ChaosSecurity={version:'2.4.1',
  inspectQuery(q){const raw=String(q??'');if(/[\u202A-\u202E\u2066-\u2069]/.test(raw)){const result={safe:false,code:'HIDDEN_DIRECTION_CONTROL',reason:'النص يحتوي على محارف اتجاه خفية غير مسموحة.'};store?.audit('blocked-input',result.code);return result}if(raw.length>12000){const result={safe:false,code:'INPUT_TOO_LONG',reason:'النص أطول من الحد المسموح.'};store?.audit('blocked-input',result.code);return result}const clean=input?input.normalize(raw):raw;const result=policy?policy.inspect(clean):{safe:true,reason:null};if(!result.safe)store?.audit('blocked-input',result.code+': '+result.reason);return result},
  normalizeInput(q){return input?input.normalize(q):String(q??'').slice(0,12000)},
  safeURL(url){return !!(nav?.validateURL?nav.validateURL(url):input?.isSafeExternalURL(url))},
  isAllowedRoute(path){return !!nav?.isAllowedLocalPath(path)},
  allowRequest(scope='default',limit=18,windowMs=10000){return rate?rate.allow(scope,limit,windowMs):true},
  safeRead(key,fallback=null){return limits?limits.safeRead(key,fallback):null},
  safeWrite(key,value){return limits?limits.safeWrite(key,value):false},
  removeSafe(key){return limits?limits.remove(key):false},
  canAccessArchive(name,level){return policy?policy.canAccessArchive(name,level):false},
  audit(event,detail=''){const safeDetail=String(detail??'').slice(0,160);store?.audit(String(event).slice(0,80),safeDetail);if(g.ChaosConfig?.debugMode)console.warn('[CHAOSOS SECURITY]',event,safeDetail)},
  getAuditLog(){return store?.auditLog()||[]},
  layers(){return {inputNormalization:!!input,policyRules:!!policy,requestRateLimit:!!rate,externalURLValidation:!!(nav||input),localRouteAllowlist:!!nav,boundedStorage:!!limits,boundedAuditLog:!!store,appPermissions:!!g.VoidPermissionManager,textOnlyTerminalOutput:true,trainingDataBounds:!!training}}
 };
})(window);
