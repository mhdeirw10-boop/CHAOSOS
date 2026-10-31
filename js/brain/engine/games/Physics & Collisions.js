// CHAOS SYSTEM — real lightweight AABB collision helpers (pixel/world units supplied by caller).
const PhysicsAndCollisionsEngine = {
  module: 'Physics & Collisions', status: 'ACTIVE',
  physicsRules: { gravity:'تسارع رأسي موجب حسب نظام الإحداثيات الذي يحدده المستدعي.', velocityDamping:'تخفيض السرعة بنسبة محددة مع الزمن.', collisionDetection:'اختبار تداخل مستطيلين محورِيَّيْن.' },
  isValidBody(body) { return !!body && ['x','y','width','height'].every(k => Number.isFinite(Number(body[k]))) && Number(body.width) >= 0 && Number(body.height) >= 0; },
  analyzeCollision(bodyA, bodyB) {
    if (!this.isValidBody(bodyA) || !this.isValidBody(bodyB)) return { ok:false, collision:false, error:'يلزم جسمان بإحداثيات x/y وعرض وارتفاع رقميين غير سالبين.' };
    const a={x:+bodyA.x,y:+bodyA.y,width:+bodyA.width,height:+bodyA.height};
    const b={x:+bodyB.x,y:+bodyB.y,width:+bodyB.width,height:+bodyB.height};
    const overlapX=Math.min(a.x+a.width,b.x+b.width)-Math.max(a.x,b.x);
    const overlapY=Math.min(a.y+a.height,b.y+b.height)-Math.max(a.y,b.y);
    const collision=overlapX > 0 && overlapY > 0;
    return { ok:true, collision, overlap:{x:Math.max(0,overlapX),y:Math.max(0,overlapY)}, normal:collision?(overlapX < overlapY ? {x:a.x < b.x ? -1:1,y:0}:{x:0,y:a.y < b.y ? -1:1}):null, response:collision?'تداخل AABB مؤكد؛ على اللعبة تحديد الاستجابة الفيزيائية المناسبة.':'لا يوجد تداخل مستطيل بين الجسمين.' };
  },
  applyGravity(body, gravity=980, delta=1/60) { if (!body || !Number.isFinite(body.vy) || !Number.isFinite(gravity) || !Number.isFinite(delta) || delta<0) return {ok:false,error:'الجسم أو قيم الجاذبية والزمن غير صالحة.'}; const dt=Math.min(delta,0.1); body.vy += gravity*dt; body.y=(Number(body.y)||0)+body.vy*dt; return {ok:true,y:body.y,vy:body.vy}; },
  dampVelocity(velocity, damping=8, delta=1/60) { if (!velocity || !Number.isFinite(velocity.x) || !Number.isFinite(velocity.y) || !Number.isFinite(damping) || damping<0 || !Number.isFinite(delta) || delta<0) return {ok:false,error:'قيم السرعة أو التباطؤ غير صالحة.'}; const factor=Math.exp(-damping*Math.min(delta,0.1)); return {ok:true,x:velocity.x*factor,y:velocity.y*factor}; }
};
if (typeof module !== 'undefined') module.exports = PhysicsAndCollisionsEngine;

if (typeof window !== 'undefined') window.PhysicsAndCollisionsEngine = PhysicsAndCollisionsEngine;
