/*
	Your hands are a pair of swan heads? "Science with Swans" as a name?

	You need a "blackboard". Ideally it should rotate to face you.

	You probably want boards to rotate to face you and stay upright. You position tho

	Theoretically possible: Video is always at an angle such that camera is looking at the same place that you in webcam video appear to be looking?

	At some point may want to do black hole effects, eg something that will want to render for a long time, so timestep should be slowable

	Olga
	Ines
*/

(function init()
{
	var launcher = {
		initCompleted:false,
		dataLoaded:{
			font: false,
			controllerModel0: false,
			controllerModel1: false
		},
		attemptLaunch: function()
		{
			for(var data in this.dataLoaded)
			{
				if( !this.dataLoaded[data] )
				{
					return;
				}
			}

			render();
		}
	}

	var thingsToBeUpdated = {};
	var holdables = {};

	var monitorer = initMonitorer();

	var testObject = new THREE.Mesh( new THREE.SphereGeometry(0.01), new THREE.MeshLambertMaterial( {} ) );
	scene.add(testObject);
	testObject.position.z = -0.1
	testObject.update = function()
	{
		this.position.y = 0.01*Math.sin(frameTime*4);
		this.rotation.z = Math.sin(frameTime*4.1);
	}
	thingsToBeUpdated.testObject = testObject;
	monitorer.monitorPositionAndQuaternion(testObject);

	var renderer = new THREE.WebGLRenderer({ antialias: true });
	renderer.setPixelRatio( window.devicePixelRatio );
	renderer.setSize( window.innerWidth, window.innerHeight );
	document.body.appendChild( renderer.domElement );
	var ourVrEffect = new THREE.VREffect( renderer );
	var loopCallString = getStandardFunctionCallString(loop);
	function render()
	{
		eval(loopCallString);
		ourVrEffect.requestAnimationFrame( function()
		{
			ourVrEffect.render( scene, camera );
			render();
		} );
	}
	
	var controllers = Array(2);
	var vrInputSystem = initvrInputSystem(controllers, launcher, ourVrEffect, renderer);
	
	new THREE.FontLoader().load( "data/gentilis.js", 
		function ( gentilis ) {
			THREE.defaultFont = gentilis;
			
			launcher.dataLoaded.font = true;
			launcher.attemptLaunch();
		},
		function ( xhr ) {},
		function ( xhr ) { console.error( "couldn't load font" ); }
	);
	
	window.addEventListener( 'resize', function()
	{
		//720p?
	    renderer.setSize( window.innerWidth, window.innerHeight );
	    camera.aspect = window.innerWidth / window.innerHeight;
	    camera.updateProjectionMatrix();
	}, false );
	
	makeScene(true);

	for(var thingKey in thingsToBeUpdated)
	{
		var thing = thingsToBeUpdated[thingKey];
		console.log(thing)
		var somePartOfThingIsBeingMonitored = false;

		for(var objectAndProperty in monitorer.objectsAndPropertiesToBeMonitored)
		{
			var objectBeingMonitored = monitorer.objectsAndPropertiesToBeMonitored[objectAndProperty].object;
			if( objectBeingMonitored === thing)
			{
				somePartOfThingIsBeingMonitored = true;
				break;
			}
			for(var thingPropertyKey in thing)
			{
				if(objectBeingMonitored === thing[thingPropertyKey])
				{
					somePartOfThingIsBeingMonitored = true;
					break;
				}
			}
		}
		if( !somePartOfThingIsBeingMonitored )
		{
			console.error("You are updating, but not monitoring,", thing)
		}
	}

	launcher.initCompleted = true;
	launcher.attemptLaunch();
})();