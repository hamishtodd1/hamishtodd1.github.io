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

	launcher.initCompleted = true;
	launcher.attemptLaunch();
})();