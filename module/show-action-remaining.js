console.log("Show Action remaining module !!!!");

class DnDActions {
  doneDefaultActions = {
    attacks: 0,
    useItem: 0,
    disengage: 0,
    ready: 0
  };

  doneBonusAction = 0;
  doneReaction = 0;

  reset(){
	  this.doneDefaultActions = 
      { 
        attacks: 0, 
        useItem: 0, 
        disengage: 0, 
        ready: 0
      };
	  this.doneBonusAction = 0;
	  this.doneReaction = 0;
  };
}

const currentActions = new DnDActions();

function createExtraAttackInfo(app, html, data)  {
  const currentActor = app.object.actor;

  // Create the textbox and set its initial value from the flag
  const initialValue = currentActor.getFlag("show-action-remaining", "additional_attack") || "";
  //const initialValue = data.document.getFlag("show-action-remaining", "additional_attack") || "";

  // Find the tab with data-tab="details"
  const detailsTab = html.find('.tab[data-tab="details"]');
    
  // Check if the tab was found
  if (detailsTab.length > 0) {
    console.log("Details tab found!");

    // Example: Add a custom note or content to the details tab
    const customHtml = `<div class="form-group">
                          <label>${game.i18n.localize("SAR.add.atk.label")}</label>
                          <input type="number" name="sar.additional.attacks" value="${initialValue}" step="1">
                          <p class="hint">${game.i18n.localize("SAR.add.atk.hint")}</p>
                        </div>`;
    detailsTab.append(customHtml);

  // Handle the change event to update the flag when the user modifies the input
  html.find('input[name="sar.additional.attacks"]').change(async (event) => {
    const newValue = event.target.value;
    await currentActor.setFlag("show-action-remaining", "additional_attack", newValue);
    console.log("Updated customData flag to:", newValue);
  });


  } else {
    console.log("Details tab not found.");
  }
}

function hasAttackAction(actor){

	const actorActions = actor.flags["show-action-remaining"].dnD5eActions || new DnDActions();

	const numberOfAttacks = Number(actor.flags["show-action-remaining"].additional_attack) + 1;

	console.log(`Checando ataques realizado: ${actorActions.doneDefaultActions.attacks}/${numberOfAttacks}`);

	if(currentActions.doneDefaultActions.attacks < numberOfAttacks ){
		return true;
	}
	console.log("Sem ataques suficientes");
	return false;
}


Hooks.on("renderActorSheet", (app, html, data) => {
  const actor = app.object;
  
  // Perform actions when the sheet is opened
  console.log(`Actor sheet opened for ${actor.name}`);

  const dnD5eActions = actor.getFlag("show-action-remaining", "dnD5eActions");

  if(!dnD5eActions){
    actor.setFlag("show-action-remaining", "dnD5eActions", new DnDActions());
  }
  
});

Hooks.on('dnd5e.rollAttack', async (item, roll, options) => {

	const currentActor = roll.data;
	const actorActions = currentActor.flags["show-action-remaining"].dnD5eActions || new DnDActions();

	// Create the textbox and set its initial value from the flag
	const numberOfAttacks = Number(currentActor.flags["show-action-remaining"].additional_attack) + 1;
	const attacksDone = actorActions.doneDefaultActions.attacks;
  
//    console.log(item.system.activation);
//    console.log(item);
//    console.log(roll);
//    console.log(item.ownership);

    console.log(`Checando ataques realizado: ${attacksDone}/${numberOfAttacks}`);

	if(hasAttackAction(currentActor)){
		actorActions.doneDefaultActions.attacks++;
	}else{
		console.log("Sem ataques suficientes")
		 ui.notifications.error(`${actorActions.name} todos ataques utilizados! ${attacksDone}/${numberOfAttacks}`);
  
		return false;
	}

	console.log(`Atualizando ataques realizado: ${attacksDone}/${numberOfAttacks}`);

	currentActor.flags["show-action-remaining"].dnD5eActions = actorActions;

	return true;

});


  Hooks.on("combatTurnChange", (combat, prior, current) => {
    console.log(combat);
    console.log(prior);
    console.log(current);
	  console.log("Antes reset");	
	  console.log(currentActions);
	  currentActions.reset(); //TODO: set zero if is init of current turn
	  console.log("apos reset");
	  console.log(currentActions);

  });

  Hooks.on("renderItemSheet", (app, html, data) => {
    //data.document.setFlag("show-action-remaining", "additional_attack", "1")
    // Your custom code goes here
    console.log("Item sheet is being rendered!");

    switch (app.object.type) {
			case "weapon":
			case "spell":
			case "power":
			case "feat":
				console.log("The item is a feat");
        createExtraAttackInfo(app, html, data) 
				break;
			case "consumable":
			case "tool":
			default:
        console.log("No item found");	
		}
  });


  Hooks.on("preCreateChatMessage", (message, options, userId) => {
    // Check if the message is an attack roll (or another type of roll if needed)
    if (message.roll && message.flags.dnd5e?.roll?.type === "attack") {
      const actor = game.actors.get(message.speaker.actor);

		console.log(actor)
      // Example rule: check if the actor has a specific condition or flag
      //const hasBrokenRule = actor.getFlag("myModule", "isDisarmed"); // Custom rule example
  
	    if (hasAttackAction(actor)) {
	      // Cancel the roll if the actor has 0 or fewer hit points
	      ui.notifications.error(`${actor.name} cannot attack because they have 0 hit points!`);
	      return false; // Prevent the message (and roll) from being created
	    }
    }
  
    // Allow the action to proceed if no rules are broken
    return true;
  });