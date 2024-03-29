function initButtons()
{
	var buttons = {};

	bindButton = function( buttonName, onDown, buttonDescription,whileDown )
	{
		if(buttons[buttonName] !== undefined)
		{
			console.error("attempted to bind a button that already has a binding: ", buttonName)
		}

		// console.warn("\n",buttonName + ": " + buttonDescription)
		buttons[buttonName] = {
			down: false,
			onDown: onDown
		}
		if(whileDown)
		{
			buttons[buttonName].whileDown = whileDown
		}
	}

	bindToggle = function(buttonName,variableToToggle, propertyName, description,value1,value2)
	{
		if(value1 === undefined)
		{
			value1 = true;
			value2 = false;
		}

		if(propertyName === undefined) {
			propertyName = "value"
		}

		bindButton(buttonName,function()
		{
			log("yeah this doesn't work with just a normal variable, you need a pointer")
			if(variableToToggle[propertyName] === value1)
			{
				variableToToggle[propertyName] = value2;
			}
			else
			{
				variableToToggle[propertyName] = value1;
			}
		},"toggle " + description)
	}

	var buttonIndexGivenName = {
		"enter":13,
		"alt":18,
		"shift":16,

		"left":37,
		"up":38,
		"right":39,
		"down":12,
		"space":32,

		"[":219,
		"]":221
	}
	var keycodeArray = "0123456789abcdefghijklmnopqrstuvwxyz";
	function getButton(keyCode)
	{
		for( var buttonName in buttons )
		{
			if( keyCode === buttonIndexGivenName[buttonName] )
			{
				return buttons[buttonName]
			}
		}
		if( 48 <= keyCode && keyCode <= 57 )
		{
			let buttonName = keycodeArray[keyCode - 48]
			if( buttons[buttonName] )
			{
				return buttons[buttonName]
			}
		}
		if( 65 <= keyCode && keyCode <= 90 )
		{
			let buttonName = keycodeArray[keyCode - 55]
			if( buttons[buttonName] )
			{
				return buttons[buttonName]
			}
		}
		return null
	}

	//don't use ctrl or other things that conflict
	document.addEventListener( 'keydown', function(event)
	{
		let button = getButton(event.keyCode)

		if(button === null)
		{
			return
		}

		if(!button.down)
		{
			button.onDown()
			button.down = true
		}
	}, false );
	document.addEventListener( 'keyup', function(event)
	{
		let button = getButton(event.keyCode)

		if(button === null)
		{
			return
		}

		if( button.down )
		{
			// button.onUp()
			button.down = false
		}
	}, false );

	updateFunctions.push( function()
	{
		for(var buttonName in buttons )
		{
			if( buttons[buttonName].down && buttons[buttonName].whileDown )
			{
				buttons[buttonName].whileDown()
			}
		}
	} )
}