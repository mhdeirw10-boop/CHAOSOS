'use strict';
const assert = require('node:assert/strict');
const path = require('node:path');
const vm = require('node:vm');
const fs = require('node:fs');
const base = path.join(__dirname, '..', 'js', 'brain', 'engine', 'games');
const Physics = require(path.join(base, 'Physics & Collisions.js'));
const GDScript = require(path.join(base, 'GDScript Analyzer.js'));
const Loop = require(path.join(base, 'Game Loop & States.js'));
const Movement = require(path.join(base, 'Nodes & Movement.js'));

const hit = Physics.analyzeCollision({x:0,y:0,width:10,height:10},{x:8,y:4,width:10,height:10});
assert.equal(hit.ok, true); assert.equal(hit.collision, true); assert.equal(hit.overlap.x, 2); assert.equal(hit.overlap.y, 6);
assert.equal(Physics.analyzeCollision({x:0,y:0,width:2,height:2},{x:5,y:5,width:2,height:2}).collision, false);
assert.equal(Physics.analyzeCollision(null, {}).ok, false);
const gd = GDScript.analyzeScript('extends Node\nvar score: int = 0\nfunc _ready():\n    pass');
assert.equal(gd.ok, true); assert.equal(gd.componentsDetected.hasExtends, true); assert.equal(gd.componentsDetected.functions, 1); assert.equal(gd.componentsDetected.variables, 1);
const emotionCtx={window:{}}; vm.createContext(emotionCtx); vm.runInContext(fs.readFileSync(path.join(__dirname,'..','js','brain','emotions.js'),'utf8'),emotionCtx);
assert.equal(emotionCtx.window.EmotionEngine.detectEmotion('أنا خائف من الظلام').emotion,'fear');
assert.equal(Loop.transition('PLAYING').ok, true); assert.equal(Loop.tick(1/60).ok, true); assert.equal(Loop.transition('PAUSED').ok, true); assert.equal(Loop.tick(1/60).updated, false);
const moved = Movement.move({x:0,y:0},{x:100,y:0},1,10); assert.equal(moved.ok, true); assert.equal(moved.velocity.x, 10); assert.equal(moved.position.x, 1);

// Run the browser text engine against a bounded in-memory localStorage shim.
const store = new Map();
const ctx = { localStorage:{getItem:k=>store.has(k)?store.get(k):null,setItem:(k,v)=>store.set(k,String(v)),removeItem:k=>store.delete(k)}, window:{} };
vm.createContext(ctx); vm.runInContext(fs.readFileSync(path.join(__dirname,'..','js','brain','keyboard','textEngine.js'),'utf8'),ctx);
assert.equal(vm.runInContext("ChaosTextEngine.detectScript('مرحبا')",ctx),'ar');
const trained=vm.runInContext("ChaosTextEngine.trainOnText('مرحبا بهذا الاختبار')",ctx); assert.match(trained,/تم حفظ/);
assert.ok(store.get('chaos_lang_model').length < 256*1024);
store.set('chaosMemoryEnabled','false'); assert.match(vm.runInContext("ChaosTextEngine.trainOnText('اختبار آخر')",ctx),/متوقف/);

// The core must not search or train for ordinary input; only explicit search may call web.
const coreCtx={console, navigator:{onLine:true}, window:{}, ChaosTextEngine:{detectScript:()=> 'ar',loadLanguageModel:()=>({trainingSteps:0}),trainOnText:()=>{throw Error('automatic training called');}}, ChaosSavedMemory:{search:()=>[]}, ChaosWebSearch:{searchWeb:async q=>({title:q,content:'ok'}),formatSearchResponse:()=> 'searched'}};
vm.createContext(coreCtx); vm.runInContext(fs.readFileSync(path.join(__dirname,'..','js','brain','coreEngine.js'),'utf8'),coreCtx);
(async()=>{
 const normal=await vm.runInContext("ChaosCore.processThought('سؤال عادي أطول من خمسة عشر حرفًا')",coreCtx);
 assert.equal(normal.source,'local-rules');
 const searched=await vm.runInContext("ChaosCore.processThought('بحث: اختبار')",coreCtx);
 assert.equal(searched,'searched');
 console.log('PASS: collision, GDScript heuristics, game states, movement, bounded learning, privacy-by-default');
})().catch(err=>{console.error(err);process.exitCode=1;});
