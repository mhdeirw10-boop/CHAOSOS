const assert=require('node:assert/strict');const fs=require('node:fs');const vm=require('node:vm');const path=require('node:path');
const window={};vm.runInNewContext(fs.readFileSync(path.join(__dirname,'../apps/voidtube/js/recommendationEngine.js'),'utf8'),{window,globalThis:window,Set,Math,String,Number});
const e=window.VoidTubeRecommendationEngine;assert.ok(e&&e.version);
const videos=[
{id:'a',title:'Space engineering',description:'rockets and science',category:'science',channelId:'x',channel:'X',views:200,likes:90,dislikes:1,age:'اليوم'},
{id:'b',title:'Cooking pasta',description:'simple food',category:'food',channelId:'y',channel:'Y',views:1000,likes:20,dislikes:3},
{id:'c',title:'Space astronomy',description:'stars and astronomy',category:'science',channelId:'x',channel:'X',views:20,likes:5,dislikes:0},
{id:'d',title:'Football night',description:'football highlights',category:'sports',channelId:'z',channel:'Z',views:800,likes:80,dislikes:2},
{id:'e',title:'Space travel',description:'science and rockets',category:'science',channelId:'w',channel:'W',views:50,likes:7,dislikes:1}
];
assert.equal(e.rank(videos).length,videos.length,'all videos remain in result');
const chosen=e.rank(videos,{liked:['a']},{query:'space',diversify:false});assert.ok(['a','c','e'].includes(chosen[0].id),'query/feedback should rank relevant science content');
const diversified=e.rank([...videos.slice(0,3),{...videos[1],id:'f',title:'More cooking',channelId:'y'},{...videos[1],id:'g',title:'Extra cooking',channelId:'y'}],{},{});const prefix=diversified.slice(0,4);assert.ok(prefix.filter(v=>v.channelId==='y').length<=2,'channel diversity should cap early repetition');
const scores=videos.map(v=>e.score(v,{profile:e.profile(videos,{})}));assert.ok(scores.every(Number.isFinite),'scores are finite');
console.log('PASS 4 recommendation scenarios');
