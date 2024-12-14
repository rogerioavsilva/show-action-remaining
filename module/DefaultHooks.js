function InitHooks(){

Hooks.on("dnd5e.rollAttack", async (item, roll, options) => {
    console.log("SAR - Hooks.on('dnd5e.rollAttack')");
    const currentActor = roll.data;
    const actorActions =
        currentActor.flags["show-action-remaining"].dnD5eActions ||
        new DnDActionsModel();

    if (hasAttackAction(currentActor.actorId)) {
        actorActions.doneDefaultActions.attacks++;
        currentActor.flags["show-action-remaining"].dnD5eActions = actorActions;
        return true;
    }  

    return false;
});

Hooks.on("combatTurnChange", (combat, prior, current) => {
    const currentActor = combat.combatants.get(current.combatantId);
    console.log(`SAR - combat Turn Change ${currentActor.name}`);
    setDndDefaultActions(currentActor.actorId);
});

}

export { InitHooks };