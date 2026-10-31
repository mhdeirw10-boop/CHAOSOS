// CHAOSOS Kernel v3.1.6 — explainable cognition, managed tasks, services, and optional cloud boundary.
(function(g){'use strict';
 const defs=[
  ['calculator','Void Calculator','apps/void-calculator/index.html',['math.evaluate','math.history']],
  ['store','Void Store','apps/void-store/index.html',['apps.search','apps.launch']],
  ['notes','Void Notes','apps/void-notes/index.html',['notes.create','notes.search','notes.export']],
  ['planner','Void Planner','apps/void-planner/index.html',['tasks.create','tasks.update']],
  ['calendar','Void Calendar','apps/void-calendar/index.html',['events.create','events.list']],
  ['files','Void Files','apps/void-files/index.html',['files.preview','backup.export']],
  ['tube','VoidTube','apps/voidtube/index.html',['media.local-playback']],
  ['terminal','CHAOS SYSTEM / Local Language','terminal/index.html',['chaos.chat','chaos.commands','language.local']],
  ['settings','CHAOSOS Settings','settings.html',['system.settings']],
  ['characters','Character Archive','characters.html',['archive.characters']],
  ['chapters','Chapter Archive','chapters.html',['archive.chapters']],
  ['browser','VoidBrowserX','apps/void-browserx/index.html',['network.search','network.browse','history.local','bookmarks.local','tabs.manage']],
  ['game-manager','Void Game Manager','apps/void-game-manager/index.html',['games.list','games.import.html','games.stats']],
  ['manager','CHAOSOS App Manager','apps/void-manager/index.html',['apps.manage','permissions.manage','system.diagnostics']],
  ['chaosai-center','CHAOSAI Cognitive Center','apps/chaosai-center/index.html',['cognition.inspect','learning.preferences','tasks.manage','services.inspect','cloud.ai.explicit']]
 ];
 function init(){
  const paths=new Set();
  defs.forEach(([name,title,path,capabilities])=>{g.VoidServiceRegistry?.register(name,{title,path,capabilities,available:true});paths.add(path)});
  const catalog=g.VoidAppCatalog;
  if(catalog&&Array.isArray(catalog.apps))for(const app of catalog.apps){
   if(!app||!app.id||!app.path||paths.has(app.path))continue;
   const capabilities=['app.open',...(app.permissions||[]).map(p=>'permission.'+String(p))];
   g.VoidServiceRegistry?.register(app.id,{title:app.title,path:app.path,capabilities,available:true});paths.add(app.path);
  }
  const info={version:'3.1.6',state:'ONLINE',architecture:'unified-kernel+local-runtime-orchestration+hybrid-local-language+managed-tasks+supervised-services+optional-cloud',modules:{eventBus:!!g.VoidEventBus,resultBus:!!g.VoidResultBus,services:!!g.VoidServiceRegistry,permissions:!!g.VoidPermissionManager,appManager:!!g.VoidAppManager,browserPolicy:!!g.VoidBrowserPolicy,intents:!!g.VoidIntentEngine,router:!!g.VoidTaskRouter,diagnostics:!!g.VoidKernelDiagnostics,security:!!g.ChaosSecurity,localLanguage:!!g.CHAOSLocalLanguage,cognitive:!!g.CHAOSAI,tasks:!!g.VoidTaskManager,supervisor:!!g.VoidServiceSupervisor,presenceDirector:!!g.VoidPresenceDirector,healthManager:!!g.VoidKernelHealthManager,adaptiveTaskPlanner:!!g.VoidAdaptiveTaskPlanner,appLifecycle:!!g.VoidAppLifecycleManager,osRuntime:!!g.VoidOSRuntime,contextEngine:!!g.CHAOSContextEngine,intentRouter:!!g.CHAOSIntentRouter,personaEngine:!!g.CHAOSPersonaEngine,words:!!g.CHAOSWords,cloudAI:!!g.CHAOSAIGateway,androidBridge:!!g.VoidAndroidBridge}};
  g.VoidEventBus?.emit('kernel:ready',info);return info;
 }
 function routeIntent(raw){const cognitivePlan=g.CHAOSAI?.analyze?.(raw)||null;const r=g.VoidTaskRouter?g.VoidTaskRouter.route(raw):{handled:false,intent:null};if(!r?.handled&&g.CHAOSIntentRouter)r.intent=g.CHAOSIntentRouter.classify(raw);else if(!r?.intent)r.intent=g.VoidIntentEngine?.classify(raw);if(cognitivePlan)g.CHAOSAI?.observe?.(r);if(r?.handled){g.VoidEventBus?.emit('intent:classified',r.intent||{});if(r.ok)g.VoidResultBus?.success(r.intent?.type||'kernel',r.message,{intent:r.intent});else g.VoidResultBus?.failure(r.intent?.type||'kernel',r.message,{intent:r.intent});}return cognitivePlan?{...r,cognitivePlan}:r}
 g.VoidKernel={version:'3.1.6',init,routeIntent,classify:raw=>g.CHAOSIntentRouter?.classify(raw)||g.VoidIntentEngine?.classify(raw),services:()=>g.VoidServiceRegistry?.list()||[],diagnostics:()=>g.VoidKernelDiagnostics?.snapshot()||null,emit:(n,d)=>g.VoidEventBus?.emit(n,d),result:(ok,s,m,d)=>ok?g.VoidResultBus?.success(s,m,d):g.VoidResultBus?.failure(s,m,d)};
 if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});else init();
})(window);
