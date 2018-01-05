/*
	"blackboard"?
		Arbitrary writing
		Or actually no. If you want a blackboard it may be a sign you need to make more things to work with. Like lines.
		Maybe add lines?

	Probably the camera "sits on your lap", it is not your face. Yeah, show frustum
	Make it so events can propagate back in time?
		For example, a goose is to pick up an object, but it turns its head to it first
	At some point may want to do black hole effects, eg something that will want to render for a long time, so timestep should be slowable
	Put links to your work at the end. It's just confusing to have a scrollbar
	avoid things being affected by camera movement, because that will be smoothed out
	As soon as there's a hololens like thing with hand controllers, be the first to do a good hand enabled VR lecture!
	If you're not running from a server (i.e. you're not intending to save things i.e. you're being run by a user), have some stuff come up in the console for the benefit of people who'd like to play around with it
	Theoretically possible: Video is always at an angle such that camera is looking at the same place that you in webcam video appear to be looking?

	Must follow simple principle: if I can do or change a thing, so can you.
		Probably impossible! You do want lots of points in 3d space
		Can we determine anything from this?
		Eg: proximity to the camera should never be an input to a function.
		Can make it so they can rotate stuff
		How about hands move in x and y only, and don't rotate at all, unless you hold in the analogue stick?
			That's an alternative way of doing this hand-binding thing
			If you do this, probably the camera thing will need to move back and forth as hand moves in z

	One proposal is to not actually have the camera move for the client, things just move relative to it
		Possibly bad because everything would be moving the whole time
		Could be great because with a blank background it would look like 3b1b et al
		Possibly better than alternative because people are just not used to seeing shit from a person's point of view
		Could average the position of your hands and have everything onscreen, and the camera, float around them
		Wallace and gromit inspired

	Press a button to make it auto transcribe what you're saying? Then touch the words to make them bold?

	Try to make it so that the objects could work together. Build up a library that allows you to string things together.

	Puzzles go at the end

	What about music?

	Sort out audio buffering, timeline fills up

	Send to haxiomic, get "make it nicer looking for free by doing this:"

	TODO for slack demo:
		-59 icos object
			-A puzzle
		-Make geese?
		-Arbitrary "writing"?
		-Working on phones and tablets, working well! No need to hide address bar at least, leave that to them
		-Slider
		-editing suite?

	TODO for factorial tree
		-zoomable tree
		-"interleaving"
*/

(function init()
{
	var platform = getPlatform()
	if(platform === "phone")
	{
		var iframe = document.createElement("iframe");
	    iframe.setAttribute("src","https://www.youtube.com/embed/agOdP2Bmieg"); 
	    iframe.style.width  = window.innerWidth;
	    iframe.style.height = window.innerHeight;

	    document.body.appendChild(iframe);
	    return;
	}

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
		    renderer.setSize( window.innerWidth, window.innerHeight );
		    camera.aspect = window.innerWidth / window.innerHeight;
		    camera.updateProjectionMatrix();

		    monitorer.setUiSize();
		}, false );
		
		makeScene(true);

		var thingsToBeUpdated = {};
		var holdables = {};
	}

	// monitorer.monitorPositionAndQuaternion(controllers[0]);
	// monitorer.monitorPositionAndQuaternion(controllers[1]);

	// var goose = new Goose();
	// goose.position.z = -0.1
	// scene.add(goose);
	// thingsToBeUpdated.goose = goose;

	var clickables = [];
	var grabbables = [];

	var monitorer = initMonitorer(clickables,grabbables);

	var testObject = new THREE.Mesh( new THREE.SphereGeometry(0.01), new THREE.MeshLambertMaterial( {} ) );
	scene.add(testObject);
	testObject.position.z = -0.1;
	testObject.update = function()
	{
		// this.position.y = 0.01*Math.sin(frameTime*4);
		// this.rotation.z = Math.sin(frameTime*4.1);
	}
	thingsToBeUpdated.testObject = testObject;
	monitorer.monitorPositionAndQuaternion(testObject);
	grabbables.push(testObject);

	// initPictures(thingsToBeUpdated,grabbables);

	var mouse = initMouse(renderer, clickables,grabbables, monitorer);

	launcher.initCompleted = true;
	launcher.attemptLaunch();
})();