/* chaos-lab application entry point — isolated app lifecycle metadata. */
(function(g){'use strict';const info=Object.freeze({id:'chaos-lab',version:'3.1.6',scope:'isolated-app-module'});g.dispatchEvent?.(new CustomEvent('chaosos:app-module-ready',{detail:info}));g.CHAOSAppModules=g.CHAOSAppModules||{};g.CHAOSAppModules[info.id]=info;})(window);
