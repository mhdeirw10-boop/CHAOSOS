// ==========================================
// CHAOS SYSTEM: Behavior Director
// موجه سلوك الشخصيات غير القابلة للعب
// ==========================================

const BehaviorDirector = {
    module: "NPC Behavior Manager",

    decideAction: function(npcId, aiPrediction) {
        let reaction = "PATROL";

        if (aiPrediction === "DEFENSIVE_AMUSH") {
            reaction = "PREPARE_TRAP";
        } else if (aiPrediction === "HUNTING_MODE") {
            reaction = "ACTIVE_TRACKING";
        }

        return {
            entity: npcId,
            assignedBehavior: reaction,
            log: `تم توجيه الشخصية (${npcId}) لتنفيذ السلوك التكيفي بنجاح.`
        };
    }
};

if (typeof module !== 'undefined') {
    module.exports = BehaviorDirector;
}
