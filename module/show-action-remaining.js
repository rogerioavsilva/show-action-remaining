import { DnDActions } from "./DnDActions.js";
import { DnD5eCombatActions } from "./DnD5eCombatActions.js";
console.log("Show Action remaining module !!!!");

// class DnDActions {
//   doneDefaultActions = {
//     attacks: 0,
//     useItem: 0,
//     disengage: 0,
//     ready: 0,
//   };

//   doneBonusAction = 0;
//   doneReaction = 0;

//   reset() {
//     this.doneDefaultActions = {
//       attacks: 0,
//       useItem: 0,
//       disengage: 0,
//       ready: 0,
//     };
//     this.doneBonusAction = 0;
//     this.doneReaction = 0;
//   }
// }

function renderAttackOptions(){
  // Render a Handlebars template
  renderTemplate("modules/show-action-remaining/templates/attackOptions.hbs", itemList)
  .then((html) => {
    ui.notifications.info("Rendered template!");
    document.body.append(html); // Replace or append this where you need.
  });
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
  const additionalAttack = currentActor.items.filter(item => { return item.type === 'feat' }).filter(item => { return item.name.includes("Extra Attack") }).length;
    //Number(
    //  currentActor.getFlag("show-action-remaining", "additional_attack")
   // ) || 0;
  const numberOfAttacks = additionalAttack + 1;
  const attacksDone = Number(actorActions.doneDefaultActions.attacks);
  console.log(`${currentActor.name} | Attacks [${currentActor.flags["show-action-remaining"].dnD5eActions.doneDefaultActions.attacks}/numberOfAttacks]`);
  if (attacksDone < numberOfAttacks) {
    return true;
  }

  return false;
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

Handlebars.registerHelper("times", function (n, block) {
  let accum = "";
  for (let i = 0; i < n; ++i) {
    accum += block.fn(i);
  }
  return accum;
});


Hooks.on("dnd5e.rollAttack", async (item, roll, options) => {
  console.log("SAR - Hooks.on('dnd5e.rollAttack')");
  const currentActor = game.actors.get(item.parent._id);
  const actorActions =
    currentActor.flags["show-action-remaining"].dnD5eActions ||
    new DnDActions();

  if (hasAttackAction(currentActor.id)) {
    actorActions.doneDefaultActions.attacks++;
    currentActor.flags["show-action-remaining"].dnD5eActions = actorActions;
    
    return true;
  }  
  
  createChatMessageAttackInfo(currentActor);
  return false;
});

Hooks.on("combatTurnChange", (combat, prior, current) => {
  const currentActor = combat.combatants.get(current.combatantId);
  console.log(`SAR - combat Turn Change ${currentActor.name}`);

  const actor = game.actors.get(currentActor.actorId);

  var itemList = [];
  actor.sourcedItems.forEach( i => { if(i.name.includes("Extra Attack")){ itemList.push(i) }});;
  console.log(itemList);

  renderAttackOptions();

  setDndDefaultActions(currentActor.actorId);
});

Hooks.on("controlToken", (token, controlled) => {

  console.log(token);
  console.log(controlled);
// if(controlled){
//                 // Cria um painel básico com o nome e tipo do ator
//             const template = `
//             <div class="my-custom-panel">
//                 <h2>${token.document.name}</h2>
//                 <p>ID: ${token.document.actorId}</p>
//             </div>
//         `;

//         // Posiciona o painel próximo ao token
//         const position = token.center;
//         ui.notifications.notify(template, {
//             permanent: true,
//             anchor: { x: position.x, y: position.y }
//         });
// }

});

/*
captura o chat pre renderizacao 
seta o tipo de uso
*/


Hooks.on("preCreateChatMessage", (message, options, userId) => {
  console.log(message);
  console.log(options);
  console.log(userId);

  const currentActor = game.actors.get(message.speaker.actor);
  
  if (!currentActor) {
    console.log(`no Actor found!`);
    return;
  }

  const currentItemId = message.flags.dnd5e?.use?.itemId;
  const item = currentActor.items.get(currentItemId);

  if (!item) {
    console.log(`no item found!`);
    return;
  }
  
  const actorActions = currentActor.getFlag("show-action-remaining","dnd5ecombatactions") ||
    new DnD5eCombatActions();

// if(!actorActions){
//   actorActions = 
//   // currentActor.setFlag(
//   //   "show-action-remaining",
//   //   "dnD5eCombatActions",
//   //   new DnD5eCombatActions()
//   // );

// }

    if(message.flags.dnd5e?.use?.type === 'weapon'){

      if(actorActions.combatActions.canAdd){
        actorActions.combatActions.usedAs.push(item);  
      }
      //actorActions.AddCombatAction(item);
    }

  //item.system.actionType 
  //item.system.activation.type


    currentActor.setFlag(
      "show-action-remaining",
      "dnd5ecombatactions",
      actorActions
    );

 
});