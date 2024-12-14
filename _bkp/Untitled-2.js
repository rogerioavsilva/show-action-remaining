console.log("Show Action remaining module !!!!");

class DnDActions {
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

function setDndDefaultActions(actorId) {
  const currentActor = game.actors.get(actorId);

  if (!currentActor) {
    console.log(`no action found!`);
    return;
  }
  currentActor.setFlag(
    "show-action-remaining",
    "dnD5eActions",
    new DnDActions()
  );
}

function hasAttackAction(actorId) {
  const currentActor = game.actors.get(actorId);
  const actorActions =
    currentActor.getFlag("show-action-remaining", "dnD5eActions") ||
    new DnDActions();
  const additionalAttack =
    Number(
      currentActor.getFlag("show-action-remaining", "additional_attack")
    ) || 0;
  const numberOfAttacks = additionalAttack + 1;
  const attacksDone = Number(actorActions.doneDefaultActions.attacks);

  if (attacksDone < numberOfAttacks) {
    return true;
  }

  return false;
}

function createExtraAttackInfo(app, html, data) {
  const currentActor = app.object.actor;

  const initialValue =
    currentActor.getFlag("show-action-remaining", "additional_attack") || "";

  const detailsTab = html.find('.tab[data-tab="details"]');

  if (detailsTab.length > 0) {
    console.log("Details tab found!");

    const customHtml = `<div class="form-group">
                          <label>${game.i18n.localize(
                            "SAR.add.atk.label"
                          )}</label>
                          <input type="number" name="sar.additional.attacks" value="${initialValue}" step="1">
                          <p class="hint">${game.i18n.localize(
                            "SAR.add.atk.hint"
                          )}</p>
                        </div>`;
    detailsTab.append(customHtml);

    // Handle the change event to update the flag when the user modifies the input
    html.find('input[name="sar.additional.attacks"]').change(async (event) => {
      const newValue = event.target.value;
      await currentActor.setFlag(
        "show-action-remaining",
        "additional_attack",
        newValue
      );
      console.log("Updated customData flag to:", newValue);
    });
  } else {
    console.log("Details tab not found.");
  }
}

function createChatMessageAttackInfo(actor){
  // const additionalAttacks =
  // Number(actor.flags["show-action-remaining"].additional_attack) || 0;

  // const numberOfAttacks = additionalAttacks + 1;

  // const message =  `${actorActions.doneDefaultActions.attacks}/${numberOfAttacks}`

  // ChatMessage.create({
  //   content: `${actor.name} says: "Hello, world!"`,
  //   speaker: ChatMessage.getSpeaker({ actor: actor }),
  // });
}

Hooks.on("dnd5e.rollAttack", async (item, roll, options) => {
  console.log("SAR - Hooks.on('dnd5e.rollAttack')");
  const currentActor = roll.data;
  const actorActions =
    currentActor.flags["show-action-remaining"].dnD5eActions ||
    new DnDActions();

  if (hasAttackAction(currentActor.actorId)) {
    actorActions.doneDefaultActions.attacks++;
    currentActor.flags["show-action-remaining"].dnD5eActions = actorActions;
    return true;
  }  
  
  createChatMessageAttackInfo(currentActor)
  return false;
});

Hooks.on("combatTurnChange", (combat, prior, current) => {
  const currentActor = combat.combatants.get(current.combatantId);
  console.log(`SAR - combat Turn Change ${currentActor.name}`);
  setDndDefaultActions(currentActor.actorId);
});

Hooks.on("preCreateChatMessage", (message, options, userId) => {
  const actor = game.actors.get(message.speaker.actor);
  
  if (message.rolls && 
      message.flags.dnd5e?.roll?.type === "attack" && 
      hasAttackAction(actor.id)) {
    return true;
  }

  return false;
});

Hooks.on("renderActorSheet", (app, html, data) => {
  const actor = app.object;

  // Perform actions when the sheet is opened
  console.log(`SAR - render Actor Sheet ${actor.name}`);
  setDndDefaultActions(actor.actorId);
});

Hooks.on("renderItemSheet", (app, html, data) => {
  // Your custom code goes here
  console.log("Item sheet is being rendered!");

  switch (app.object.type) {
    case "weapon":
    case "spell":
    case "power":
    case "feat":
      console.log("The item is a feat");
      createExtraAttackInfo(app, html, data);
      break;
    case "consumable":
    case "tool":
    default:
      console.log("No item found");
  }
});


Hooks.on("preCreateChatMessage", (message, options, userId) => {
  const actor = game.actors.get(message.speaker.actor);
  console.log(message);
  console.log(options);
  console.log(userId);
 
});