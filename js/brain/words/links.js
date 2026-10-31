/* Local curated link intent. The knowledge modules remain primary for specialist answers. */
(function(g){'use strict';const W=g.CHAOSWords;if(!W)return;const catalog=[
 {keys:['فيزياء','فيزياء تعليمية','physics'],title:'PhET Interactive Simulations',url:'https://phet.colorado.edu/',why:'محاكاة تعليمية تفاعلية للعلوم والرياضيات.'},
 {keys:['برمجة','علوم الحاسوب','حاسوب','javascript','برمجي'],title:'MDN Web Docs',url:'https://developer.mozilla.org/',why:'توثيق تقني لتقنيات الويب ومعاييرها.'},
 {keys:['فضاء','فلك','كواكب','ناسا','astronomy'],title:'NASA',url:'https://www.nasa.gov/',why:'معلومات ومواد تعليمية عن الفضاء.'},
 {keys:['رياضيات','جبر','math'],title:'Khan Academy',url:'https://www.khanacademy.org/',why:'دروس وتدريبات في الرياضيات والعلوم.'},
 {keys:['أحياء','احياء','dna','بيولوجيا','biology'],title:'NCBI Bookshelf',url:'https://www.ncbi.nlm.nih.gov/books/',why:'كتب ومراجع في العلوم الحيوية والطب.'},
 {keys:['كيمياء','chemistry'],title:'Chemistry LibreTexts',url:'https://chem.libretexts.org/',why:'مواد تعليمية مفتوحة في الكيمياء.'}
];
 W.register({id:'links',title:'الروابط والمصادر',priority:40,handle:(raw,q)=>{
  if(!/(?:رابط|روابط|مصادر|مراجع|موقع|وين اتعلم|منين اتعلم|link|website)/i.test(q))return null;
  let route=null;try{route=g.CHAOSKnowledgeRouter?.route?.(raw)}catch{};if(route?.handled&&route.module==='links')return{answer:route.answer,source:'knowledge-router'};
  const found=catalog.filter(x=>x.keys.some(k=>q.includes(W.normalize(k))));
  if(!found.length)return{answer:'أقدر أقترح روابط تعليمية محفوظة محليًا، لكن ما عندي رابط محدد لهذا الموضوع. اذكر المجال مثل الفيزياء أو البرمجة أو الرياضيات؛ وما راح أختلق رابطًا.',source:'local-curated-index'};
  return{answer:'روابط من الفهرس المحلي:\n\n'+found.slice(0,4).map(x=>`• ${x.title}\n${x.url}\n${x.why}`).join('\n\n')+'\n\nهذه قائمة محلية؛ لم أتحقق من توفر الصفحات لحظيًا.',source:'local-curated-index'};
 }});
})(window);
