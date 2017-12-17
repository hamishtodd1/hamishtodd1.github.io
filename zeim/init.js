/*
	Your hands are a pair of swan heads? "Science with Swans" as a name?

	You need a "blackboard". Ideally it should rotate to face you.

	You probably want boards to rotate to face you and stay upright. You position tho

	Theoretically possible: Video is always at an angle such that camera is looking at the same place that you in webcam video appear to be looking?

	At some point may want to do black hole effects, eg something that will want to render for a long time, so timestep should be slowable

	As soon as there's a hololens like thing with hand controllers, be the first to do a good hand enabled VR lecture!

	If you're not running from a server (i.e. you're not intending to save things i.e. you're being run by a user), have some stuff come up in the console for the benefit of people who'd like to play around with it

	Must follow simple principle: if I can do or change a thing, so can you. Can we determine anything from this? Therefore: proximity to the camera should never be a function.

	Put links to your work at the end. It's just confusing to have a scrollbar
*/

(function init()
{
	//boilerplate
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
		var vrInputSystem = initVrInputSystem(controllers, launcher, ourVrEffect, renderer);
		
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

		    monitorer.setUiSize();
		}, false );
		
		makeScene(true);

		var thingsToBeUpdated = {};
		var holdables = {};
	}

	var clickables = [];
	var grabbables = [];

	var monitorer = initMonitorer(clickables);

	var testObject = new THREE.Mesh( new THREE.SphereGeometry(0.01), new THREE.MeshLambertMaterial( {} ) );
	scene.add(testObject);
	testObject.position.z = -0.1;
	// testObject.update = function()
	// {
	// 	this.position.y = 0.01*Math.sin(frameTime*4);
	// 	this.rotation.z = Math.sin(frameTime*4.1);
	// }
	// thingsToBeUpdated.testObject = testObject;
	monitorer.monitorPositionAndQuaternion(testObject);
	grabbables.push(testObject);

	var mouse = initMouse(renderer, clickables,grabbables, monitorer);

	//avoid things being affected by camera movement, because that will be smoothed out

	var carbonCopyOfThing = {};
	for(var propt in thing)
	{
		carbonCopyOfThing[propt] = thing[propt];
	}
	thingsToBeUpdated.testObject.update();
	for(var propt in thing) //also recursively
	{
		if( carbonCopyOfThing[propt] !== thing[propt])
		{
			var itIsBeingMonitored = false;
			for(var objectAndPropertyKey in monitorer.objectsAndPropertiesToBeMonitored)
			{
				if( monitorer.objectsAndPropertiesToBeMonitored[objectAndPropertyKey].object === thing &&
					monitorer.objectsAndPropertiesToBeMonitored[objectAndPropertyKey].property === propt )
				{
					itIsBeingMonitored = true;
				}
			}
			if(!itIsBeingMonitored)
			{
				console.log("changed thing is not being monitored: ", thing, propt)
			}
		}
	}

	var archetypes = {};
	for(var thingKey in thingsToBeUpdated)
	{
		var thing = thingsToBeUpdated[thingKey];
		if( thing.type ) //it is a threejs object
		{
			monitorer.monitorPositionAndQuaternion(thing);
			/*
				Other threejs properties of potential interest: color, scale
			*/
			if(!archetypes[thing.type])
			{
				archetypes[thing.type] = new THREE[thing.type]();
			}
			for(var propt in thing)
			{
				if(archetypes[thing.type][propt] === undefined)
				{

				}
			}
		}
		
		for(var propt in a)
		{
			if( archetypes[a.type] === undefined)
		    {
		    	//a has a property that we added to it
		    }
		}
	}

	/*
		you have thingsToBeUpdated.
		You want it to be the case that for all its (important) properties, it, along with that property, is in the monitoring array
		Its properties may themselves be objects
			And so on

		So you get an object and property pair and you put that in the monitorer
		Ok, never manually put things in there, only manually omit them. Walls, floor, sky etc not monitored
	*/

	// function recursivelyCheckForObjectKeyPair(thingThatIsUpdated,propertyOfThingThatIsUpdated,object)
	// {
	// 	if(toCheck === object )
	// 	for(var propt in)
	// }

	// for(var thingKey in thingsToBeUpdated)
	// {
	// 	var thing = thingsToBeUpdated[thingKey];
	// 	/*
	// 		Being more rigorous about this?
	// 		Go through update function, and everything it calls
	// 		You could try to enforce that only update can modify a thing's internal state

	// 		Won't everything be a threejs object?
	// 			So find all the properties that it doesn't have in common with an archetypal threejs object
	// 			If they're not monitored something is wrong
	// 			Also position and orientation
	// 	*/
	// 	for(var propertyOfThingThatRequiresMonitoring in thing)
	// 	{

	// 	}

	// 	var somePartOfThingIsBeingMonitored = false;

	// 	for(var objectAndProperty in monitorer.objectsAndPropertiesToBeMonitored)
	// 	{
	// 		var objectBeingMonitored = monitorer.objectsAndPropertiesToBeMonitored[objectAndProperty].object;
	// 		if( objectBeingMonitored === thing)
	// 		{
	// 			somePartOfThingIsBeingMonitored = true;
	// 			break;
	// 		}
	// 		//this goes a "layer deeper", but what if it's even deeper than that?
	// 		//heh and what if it's cyclic? eg atomA.residue = residueA, residueA.atoms[0] = atomA
	// 		for(var thingPropertyKey in thing)
	// 		{
	// 			if(objectBeingMonitored === thing[thingPropertyKey])
	// 			{
	// 				somePartOfThingIsBeingMonitored = true;
	// 				break;
	// 			}
	// 		}
	// 	}
	// 	if( !somePartOfThingIsBeingMonitored )
	// 	{
	// 		console.error("You are updating, but not monitoring,", thing)
	// 	}
	// }

	launcher.initCompleted = true;
	launcher.attemptLaunch();
})();