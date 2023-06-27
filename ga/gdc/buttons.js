/*
	Send to haxiomic/mrdoob/wannerstedt, get "make it nicer looking for free by doing this:"
	
	Make something with bloody puzzles
	The youtube thing is a colossal perverse incentive
		Subtleties in interactive learning is your raison d'etre, but here we are, making something non-interactive
*/

function initButtons()
{
	let buttons = {}

	let modifiedButtons = {}
	bindButton = function (buttonName, onDown, whileDown, onUp, ctrlKey ) {
		let collectionToAddTo = ctrlKey ? modifiedButtons : buttons

		if(collectionToAddTo[buttonName] !== undefined)
			console.error("attempted to bind a button that already has a binding: ", buttonName)

		collectionToAddTo[buttonName] = {
			down: false,
			onDown: onDown
		}
		if(whileDown)
			collectionToAddTo[buttonName].whileDown = whileDown
		if(onUp)
			collectionToAddTo[buttonName].onUp = onUp
	}

	bindToggle = function(buttonName, objectContainingValue) {
		bindButton(buttonName, () => {
			objectContainingValue.value = !objectContainingValue.value
		}, "", () => {}, false, () => {
			objectContainingValue.value = !objectContainingValue.value
		})
		return objectContainingValue
	}

	//don't use ctrl or other things that conflict
	document.addEventListener( 'keydown', function(event) {

		let button = event.ctrlKey ? modifiedButtons[event.key] : buttons[event.key]

		// event.preventDefault()

		if(button !== undefined && !button.down) {
			button.onDown(event.ctrlKey, event.shiftKey)
			button.down = true

			// if(event.key !== "v") //paste
			// 	event.preventDefault()
		}
		// log(event.key)
	}, false );
	function buttonUpper(event,set) {
		for(buttonKey in set) {
			let button = set[buttonKey]
			if (buttonKey === event.key && button.down === true) {
				button.down = false
				if (button.onUp)
					button.onUp()
			}
		}
	}
	document.addEventListener( 'keyup', function(event) {
		buttonUpper(event, modifiedButtons)
		buttonUpper(event, buttons)
	}, false );

	function updateButtons() {
		for(var buttonName in buttons ) {
			if( buttons[buttonName].down && buttons[buttonName].whileDown )
				buttons[buttonName].whileDown()
		}
	}

	return updateButtons
}