function fakeCootConnectedInit()
{
	loadMap("tutorial.map")

	new THREE.FileLoader().load( "modelsAndMaps/tutorialGetBondsRepresentation.txt",
		function( modelDataString )
		{
			makeModelFromCootString( modelDataString);
		}
	);
}

function loadMap(filename, isolevel)
{
	//not just fileloader?
	let req = new XMLHttpRequest();
	req.open('GET', 'modelsAndMaps/' + filename, true);
	req.responseType = 'arraybuffer';
	req.onreadystatechange = function()
	{
		if (req.readyState === 4)
		{
			Map( req.response, isolevel );
		}
	};
	req.send(null);
}

function nonCootConnectedInit()
{
	// new THREE.FileLoader().load( "modelsAndMaps/" + "drugIsInteresting.pdb", putPdbStringIntoAssemblage );
	// loadMap("drugIsInteresting.map")

	// loadMap("jp.map",3.4) //305 amino acids
	// assemblage.position.set(-0.3464074122328188,-1.2680682103941625,-0.7149192415916965)
	// assemblage.scale.setScalar(0.016752)
	// assemblage.quaternion.set(0.33926194849303043,0.8012749318678626,0.45980803457578096,-0.17730308816308787).normalize()
	
	// loadMap("challenge.map",2.54)
	// assemblage.position.set(-1.3725472867588921,2.6490929117577258,-0.7722187164790757)
	// assemblage.scale.setScalar(0.019793812249278)
	// assemblage.quaternion.set(0.9572866925850292,-0.1467676951291833,0.005776707312762315,0.2490543346057367).normalize()
}