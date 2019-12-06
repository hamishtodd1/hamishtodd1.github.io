function initButtons()
{
	var buttonBindings = {};
	bindButton = function( buttonName, ourFunction, functionDescription )
	{
		if(buttonBindings[buttonName] !== undefined)
		{
			console.error("attempted to bind a button that already has a binding")
		}

		// console.log("\n",buttonName + ": " + functionDescription)
		buttonBindings[buttonName] = ourFunction;
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
	//don't use ctrl or other things that conflict
	document.addEventListener( 'keydown', function(event)
	{
		for( var buttonName in buttonBindings )
		{
			if( event.keyCode === buttonIndexGivenName[buttonName] )
			{
				buttonBindings[buttonName]();
			}
		}

		var arrayposition;
		if( 48 <= event.keyCode && event.keyCode <= 57 )
		{
			arrayposition = event.keyCode - 48;
		}
		if( 65 <= event.keyCode && event.keyCode <= 90 )
		{
			arrayposition = event.keyCode - 55;
		}
		if( buttonBindings[ keycodeArray[arrayposition] ] !== undefined )
		{
			buttonBindings[ keycodeArray[arrayposition] ]();
		}
	}, false );
}