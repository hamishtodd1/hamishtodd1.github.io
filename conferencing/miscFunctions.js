//to be called every frame from the start
function checkForNewGlobals()
{
	if( typeof numGlobalVariables === 'undefined')
	{
		numGlobalVariables = Object.keys(window).length + 1;
	}
	else if( numGlobalVariables > Object.keys(window).length)
	{
		console.log("new global variable(s): ")
		for(var i = numGlobalVariables; i < Object.keys(window).length; i++ )
		{
			if( Object.keys(window)[i] !== location && //these ones are ok
				Object.keys(window)[i] !== name &&
				Object.keys(window)[i] !== window &&
				Object.keys(window)[i] !== self &&
				Object.keys(window)[i] !== document )
				console.log( Object.keys(window)[i] );
		}
		numGlobalVariables = Object.keys(window).length + 1;
	}	
}