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

function setDndDefaultActions(actorId){

  const currentActor = game.actors.get(actorId);

  if(!currentActor){
    console.log(`no action found!`);
    return;
  }

  console.log(`SAR - set DnD Default Actions to ${currentActor.name}`);
  console.log(`${currentActor.name} - made ${currentActor.flags["show-action-remaining"].dnD5eActions.doneDefaultActions.attacks} attacks`);	
  
  currentActor.setFlag("show-action-remaining", "dnD5eActions", new DnDActions());  

  console.log(currentActor);
  console.log(`${currentActor.name} - made ${currentActor.flags["show-action-remaining"].dnD5eActions.doneDefaultActions.attacks} attacks`);	
  	
}

function hasAttackAction(actorId){

  const currentActor = game.actors.get(actorId);
  const actorActions = currentActor.getFlag("show-action-remaining", "dnD5eActions") || new DnDActions();
  const additionalAttack = Number(currentActor.getFlag("show-action-remaining", "additional_attack")) || 0;
  const numberOfAttacks =  additionalAttack + 1;
  const attacksDone = Number(actorActions.doneDefaultActions.attacks);

  if(attacksDone < numberOfAttacks ){
  	return true;
  }
  
  console.log("sem ataques suficientes");
  
  return false;
}


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



Hooks.on("renderActorSheet", (app, html, data) => {
  const actor = app.object;
  
  // Perform actions when the sheet is opened
  console.log(`SAR - render Actor Sheet ${actor.name}`);
  setDndDefaultActions(actor.actorId);
  // const dnD5eActions = actor.getFlag("show-action-remaining", "dnD5eActions");

  // if(!dnD5eActions){
  //   actor.setFlag("show-action-remaining", "dnD5eActions", new DnDActions());
  // }
  
});

Hooks.on('dnd5e.rollAttack', async (item, roll, options) => {

	console.log("SAR - Hooks.on('dnd5e.rollAttack')")
	const currentActor = roll.data;
	const actorActions = currentActor.flags["show-action-remaining"].dnD5eActions || new DnDActions();

	// Create the textbox and set its initial value from the flag
  const additionalAttacks = Number(currentActor.flags["show-action-remaining"].additional_attack) || 0;

	const numberOfAttacks =  additionalAttacks + 1;
  
//    console.log(item.system.activation);
//    console.log(item);
//    console.log(roll);
//    console.log(item.ownership);

	if(hasAttackAction(currentActor.actorId)){
		actorActions.doneDefaultActions.attacks++;
	}else{
		console.log("'dnd5e.rollAttack' - Sem ataques suficientes")
		return false;
	}

	console.log(`Atualizando ataques realizado: ${actorActions.doneDefaultActions.attacks}/${numberOfAttacks}`);

	actorActions.flags["show-action-remaining"].dnD5eActions = actorActions;

	console.log(currentActor.flags["show-action-remaining"].dnD5eActions);
	return true;

});

  Hooks.on("combatTurnChange", (combat, prior, current) => {
    const currentActor = combat.combatants.get(current.combatantId);
    console.log(`SAR - combat Turn Change ${currentActor.name}`);
    setDndDefaultActions(currentActor.actorId);
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
   const actor = game.actors.get(message.speaker.actor);
	  if (message.rolls && message.flags.dnd5e?.roll?.type === "attack") {
      

  		console.log(actor)
      // Example rule: check if the actor has a specific condition or flag
      //const hasBrokenRule = actor.getFlag("myModule", "isDisarmed"); // Custom rule example
  
	    if (hasAttackAction(actor.actorId)) {
	      // Cancel the roll if the actor has 0 or fewer hit points
	      return true; // Prevent the message (and roll) from being created
	    }
      ui.notifications.error(`${actor.name} cannot attack because they have no attack action remaining!`);
      return false;
    }
  
    // Allow the action to proceed if no rules are broken
	      
	  return true;
  });