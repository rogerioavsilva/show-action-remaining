export class DnD5eCombatActions {
    constructor(){

        this.combatActions = {
            usedAs : [],
            limit : 1,
            canAdd : usedAs?.length < limit
        };
        
        this.bonusAction = {
            usedAs : [],
            limit : 1,
            canAdd : usedAs?.length < limit
        };
        
        this.reaction = {
            usedAs : [],
            limit : 1,
            canAdd : usedAs?.length < limit
        };
    }
        
    AddCombatAction(use){
        if(this.combatActions?.usedAs?.length < this.limit){
            // throw new Error("no combat action");
            console.log("no combat action");
            return;
        }
        this.combatActions?.usedAs?.push(use);
    }
}


