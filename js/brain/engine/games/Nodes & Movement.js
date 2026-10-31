// CHAOS SYSTEM — vector-based movement utilities; coordinates are supplied by caller.
const NodesAndMovementEngine = {
 module:'Nodes & Movement',status:'ACTIVE',
 nodeTypes:{Node2D:'عقدة مكانية ثنائية الأبعاد.',CharacterBody2D:'جسم حركة تتحكم به اللعبة.',Area2D:'منطقة كشف التداخل.',Sprite2D:'عنصر رسومي.',CollisionShape2D:'شكل كشف اصطدام.'},
 analyzeMovement(actionData={}){const d=actionData||{},p=d.position||{x:0,y:0},v=d.velocity||{x:0,y:0};if(![p.x,p.y,v.x,v.y].every(Number.isFinite))return {ok:false,error:'الموضع والسرعة يجب أن تكون أرقامًا.'};return {ok:true,targetNode:d.node||'CharacterBody2D',position:{x:p.x,y:p.y},velocity:{x:v.x,y:v.y},speed:Math.hypot(v.x,v.y),direction:Math.hypot(v.x,v.y)?{x:v.x/Math.hypot(v.x,v.y),y:v.y/Math.hypot(v.x,v.y)}:{x:0,y:0}};},
 move(position,velocity,delta,maxSpeed=Infinity){if(!position||!velocity||![position.x,position.y,velocity.x,velocity.y,delta].every(Number.isFinite)||delta<0||!(maxSpeed===Infinity||(Number.isFinite(maxSpeed)&&maxSpeed>=0)))return {ok:false,error:'مدخلات الحركة غير صالحة.'};let vx=velocity.x,vy=velocity.y;const speed=Math.hypot(vx,vy);if(speed>maxSpeed){vx=vx/speed*maxSpeed;vy=vy/speed*maxSpeed;}const dt=Math.min(delta,0.1);return {ok:true,position:{x:position.x+vx*dt,y:position.y+vy*dt},velocity:{x:vx,y:vy},deltaUsed:dt};},
 clampToBounds(position,bounds){if(!position||!bounds||![position.x,position.y,bounds.left,bounds.top,bounds.right,bounds.bottom].every(Number.isFinite)||bounds.right<bounds.left||bounds.bottom<bounds.top)return {ok:false,error:'الحدود غير صالحة.'};return {ok:true,position:{x:Math.min(bounds.right,Math.max(bounds.left,position.x)),y:Math.min(bounds.bottom,Math.max(bounds.top,position.y))}};}
};
if (typeof module !== 'undefined') module.exports = NodesAndMovementEngine;

if (typeof window !== 'undefined') window.NodesAndMovementEngine = NodesAndMovementEngine;
