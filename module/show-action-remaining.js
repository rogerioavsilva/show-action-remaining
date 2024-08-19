console.log("Show Action remaining module !!!!");

function createExtraAttackInfo(app, html, data)  {


  // Create the textbox and set its initial value from the flag
  const initialValue = data.document.getFlag("show-action-remaining", "additional_attack") || "";

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
    await data.document.setFlag("show-action-remaining", "additional_attack", newValue);
    console.log("Updated customData flag to:", newValue);
  });


  } else {
    console.log("Details tab not found.");
  }
}

Hooks.on('dnd5e.rollAttack', (item, roll) => {
    console.log(item.system.activation);
    console.log(item);
    console.log(roll);

  });


  Hooks.on("combatTurnChange", (combat, prior, current) => {
    console.log(combat);
    console.log(prior);
    console.log(current);

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



//   /* -------------------------------------------------- */

// /**
//  * Embed a created babonus onto the target object.
//  * @param {Document} object         The actor, item, effect, or region that should have the babonus.
//  * @param {Babonus} bonus           The created babonus.
//  * @param {object} [options]        Creation and return options.
//  * @returns {Promise<Document>}     The actor, item, effect, or region that has received the babonus.
//  */
// async function embedBabonus(object, bonus, options = {}) {
//   const validDocumentType = ["Actor", "Item", "ActiveEffect", "Region"].includes(object.documentName);
//   if (!validDocumentType) throw new Error("The document provided is not a valid document type for Build-a-Bonus!");
//   if (!Object.values(models).some(t => bonus instanceof t)) return null;
//   const id = await _embedBabonus(object, bonus);
//   return options.bonusId ? id : object;
// }

// /**
//  * Embed a created babonus onto the target object.
//  * @param {Document} object       The actor, item, effect, or region that should have the babonus.
//  * @param {Babonus} bonus         The created babonus.
//  * @returns {Promise<string>}     The id of the bonus created.
//  */
// async function _embedBabonus(object, bonus) {
//   const data = bonus.toObject();
//   for (const id of Object.keys(data.filters)) {
//     if (!babonus.abstract.DataFields.filters[id].storage(bonus)) delete data.filters[id];
//   }
//   data.id = foundry.utils.randomID();
//   let collection = babonus.getCollection(object);
//   if (collection.has(data.id)) collection.delete(data.id);
//   collection = collection.map(k => k.toObject());
//   collection.push(data);

//   await object.setFlag("babonus", "bonuses", collection);
//   return data.id;
// }