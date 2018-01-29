/*
	Extreme democratization: I am programming the game as you play it, but you can reprogram it, maybe even me

	TODO for slack demo:
		-VR interaction / funkiness in which you move your head and hand around and camera is in right place
		-Finish geese? Eyes
		-Working on tablets. Phones get embed and maybe message, no need to worry about address bar

		-Make that 3D pong thing and a rotation thing.
			Maybe: there's a transparent sphere with a series of balls on it. the balls are dropping off one by one. 
			You must keep them above a hold that is in front of you

	Once presentation is done
		-Would be nice if people could spectate live
		-send to haxiomic, get "make it nicer looking for free by doing this:"
		-fix lighting
		-editing suite?

	First things to put in/actually do
		-my favourite 3d patterns/neoshapes
		-59 icos object
			-A puzzle
		Klein bottle?
		-Lynne thing
		-conic section?

*/

(function init()
{
	var platform = getPlatform()
	if(platform === "phone" )
	{
		var iframe = document.createElement("iframe");
	    iframe.setAttribute("src","https://www.youtube.com/embed/agOdP2Bmieg"); 
	    iframe.style.width  = window.innerWidth;
	    iframe.style.height = window.innerHeight;

	    document.body.appendChild(iframe);
	    return;
	}

	var launcher = {
		initCompleted:false,
		dataLoaded:{
			controllerModel0: false,
			controllerModel1: false,
			recordedFrames:false,
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

			if(!this.initCompleted)
			{
				return;
			}

			if( !FULL_SETUP )
			{
				console
				togglePlaying();
			}

			render();
		}
	}

	var renderer = new THREE.WebGLRenderer({ antialias: true });
	renderer.setPixelRatio( window.devicePixelRatio );
	document.body.appendChild( renderer.domElement );

	initCameraAndRendererResizeSystemAndCameraRepresentation(renderer);

	var ourVrEffect = new THREE.VREffect( renderer );

	function render()
	{
		loop( controllers )
		ourVrEffect.requestAnimationFrame( function()
		{
			//a reasonable indicator is ourVREffect.isPresenting
			ourVrEffect.render( scene, camera );
			render();
		} );
	}
	
	// var goose = new Goose();
	// goose.position.z = -0.1
	// scene.add(goose);
	// thingsToBeUpdated.goose = goose;

	initPlaybackSystemAndMaybeRecorder( launcher );

	var controllers = initControllers(launcher);
	if( FULL_SETUP )
	{
		initVrInputSystem(controllers, ourVrEffect, renderer);
	}
	
	makeScene(true);

	mouse = initMouse(renderer);

	{
		var testObject = new THREE.Mesh( new THREE.SphereGeometry(0.01), new THREE.MeshLambertMaterial( {} ) );
		camera.add(testObject);
		testObject.position.z = -0.1;
		// testObject.update = function()
		// {
		// 	this.position.y = 0.01*Math.sin(frameTime*4);
		// 	this.rotation.z = Math.sin(frameTime*4.1);
		// }
		bestowDefaultMouseDragProperties(testObject);
		
		markedThingsToBeUpdated.push(testObject);
		clickables.push(testObject);

		markObjectProperty(testObject.scale,"y")
		markPositionAndQuaternion(testObject);

		function testChangeValue(valueBetweenZeroAndOne)
		{
			testObject.scale.y = 1 + 0.7 * (valueBetweenZeroAndOne-0.5);
		}
		var testSlider = SliderSystem(testChangeValue, 0, true );
		testObject.scale.y = 1;
		testSlider.setValue(0.5)
		testSlider.setDimensions(0.1)
		testSlider.position.set(0,0.08,-0.4)
		scene.add(testSlider)
		
		markedThingsToBeUpdated.push(testSlider);

		initImages();
	}

	launcher.initCompleted = true;
	launcher.attemptLaunch();
})();