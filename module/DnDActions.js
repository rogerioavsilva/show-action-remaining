
export class DnDActions {
    
    doneDefaultActions = {
        attacks: 0,
        useItem: 0,
        disengage: 0,
        ready: 0,
    };

    doneBonusAction = 0;
    doneReaction = 0;

    reset() {
        this.doneDefaultActions = {
        attacks: 0,
        useItem: 0,
        disengage: 0,
        ready: 0,
        };
        this.doneBonusAction = 0;
        this.doneReaction = 0;
    }
}