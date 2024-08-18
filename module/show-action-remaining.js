console.log("Show Action remaining module !!!!");

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
    // Your custom code goes here
    console.log("Item sheet is being rendered!");


    switch (app.object.type) {
			case "weapon":
			case "spell":
			case "power":
			case "feat":
				console.log("The item is a feat");
				break;
			case "consumable":
			case "tool":
			default:
        console.log("No item found");	
		}
  
    // Example: Add a custom button to the item sheet
    const buttonHtml = `
      <div class="form-group">
        <label>My Custom Button</label>
        <button type="button" class="custom-button">Click Me!</button>
      </div>
    `;
  
    // Insert the button into the form (you can choose where it goes)
    html.find(".sheet-body").append(buttonHtml);
  
    // Handle the button click event
    html.find(".custom-button").click(() => {
      ui.notifications.info("Custom button was clicked!");
    });
  });
