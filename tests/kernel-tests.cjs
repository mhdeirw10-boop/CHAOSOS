'use strict';
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const base = path.join(__dirname, '..');
const memory = new Map();
const localStorage = { getItem:k=>memory.has(k)?memory.get(k):null, setItem:(k,v)=>memory.set(k,String(v)), removeItem:k=>memory.delete(k) };
const opened = [];
const window = { dispatchEvent(){}, addEventListener(){} };
window.CHAOS = {
  open(app) { opened.push(app); return { ok:true, message:'opened '+app }; },
  evaluateMath(expression) { if (!/^[\d\s()+\-*/%.]+$/.test(expression)) throw Error('invalid'); return expression; },
  execute(command) { return { ok:true, message:'saved '+command }; }
};
const document = { readyState:'complete', querySelector(){return null;}, addEventListener(){} };
const context = vm.createContext({ window, localStorage, document, URL, console, Date, CustomEvent:function CustomEvent(name,opts){this.type=name;this.detail=opts?.detail;} });
vm.runInContext(fs.readFileSync(path.join(base,'js/appCatalog.js'),'utf8'), context, {filename:'appCatalog.js'});
for (const file of ['eventBus.js','resultBus.js','serviceRegistry.js','intentEngine.js','taskRouter.js','diagnostics.js','kernel.js']) {
  vm.runInContext(fs.readFileSync(path.join(base,'js/kernel',file),'utf8'), context, { filename:file });
}
const classify = window.VoidIntentEngine.classify;
const cases = [
  ['أحسب 1+1', 'calculator', '1+1'],
  ['أريد من الطرفية أن تحسب 1+1', 'calculator', '1+1'],
  ['احسب ١+١', 'calculator', '1+1'],
  ['ما هو ناتج 25*8؟', 'calculator', '25*8'],
  ['احسب (12+3)*4', 'calculator', '(12+3)*4'],
  ['واحد زائد واحد', 'calculator', '1 + 1'],
  ['نزّل برنامج Void Notes', 'store', undefined],
  ['ابحث عن VoidOS', 'websearch', undefined],
  ['افتح التقويم', 'open', undefined],
  ['افتح المتصفح', 'open', undefined],
  ['افتح مدير التطبيقات', 'open', undefined],
  ['أنشئ ملاحظة فكرة جديدة', 'note', undefined],
  ['أضف مهمة تطوير النواة', 'task', undefined],
  ['status', 'diagnostics', undefined]
];
for (const [input, expectedType, expectedExpression] of cases) {
  const result = classify(input);
  assert.equal(result.type, expectedType, `${input} -> ${result.type}`);
  if (expectedExpression !== undefined) assert.equal(result.expression, expectedExpression, `${input} expression`);
}
assert.equal(classify('أحسب').needsClarification, true);
assert.equal(classify('مرحبا، كيف حالك؟').type, 'conversation');
assert.equal(classify('افتح الكاميرا').app, 'camera');
assert.equal(classify('افتح الرسائل').app, 'messages');
assert.equal(classify('افتح معرض الصور').app, 'gallery');
assert.equal(classify('افتح التنزيلات').app, 'downloads');
let routed = window.VoidKernel.routeIntent('أحسب 1+1');
assert.equal(routed.handled, true); assert.equal(routed.ok, true); assert.match(routed.message, /لم أفتح تطبيق الحاسبة/);
assert.equal(opened.length, 0, 'calculation must return in the conversation instead of opening the calculator');
assert.equal(memory.has('voidos_pending_calculation_v1'), false, 'in-chat calculation must not leave a pending app request');
routed = window.VoidKernel.routeIntent('نزّل برنامج Void Notes');
assert.equal(routed.handled, true); assert.equal(routed.ok, true); assert.match(routed.message, /لم أفتح المتجر|دون فتح المتجر/);
assert.equal(opened.length, 0, 'local store lookup must answer in chat');
assert.equal(memory.has('voidos_store_pending_search_v1'), false, 'local store lookup must not leave a pending app request');
routed = window.VoidKernel.routeIntent('ابحث عن VoidOS');
assert.equal(routed.handled, true); assert.equal(routed.ok, false); assert.match(routed.message, /بحث/);
assert.equal(opened.length, 0, 'web search router must not automatically open the browser');
assert.equal(memory.has('voidbrowserx_pending_search_v1'), false, 'web search router should not create a browser side effect');
routed = window.VoidKernel.routeIntent('افتح التقويم');
assert.equal(routed.handled, true); assert.equal(opened.at(-1), 'calendar');
assert.ok(window.VoidKernel.services().length >= 24, 'kernel registry includes the complete local app catalog');
routed = window.VoidKernel.routeIntent('افتح المتصفح');
assert.equal(routed.handled, true); assert.equal(opened.at(-1), 'browser');
routed = window.VoidKernel.routeIntent('افتح مدير التطبيقات');
assert.equal(routed.handled, true); assert.equal(opened.at(-1), 'manager');
assert.equal(window.VoidResultBus.latest().length >= 3, true);
console.log('PASS: Arabic intent and kernel dispatch regression checks (browser + app manager included)');
