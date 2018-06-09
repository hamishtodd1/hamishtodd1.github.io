/*
	Hmm, if it all takes place on a board, and you're moving around on it, well, that's the timeline
	Could be used for navigation / scrollability

	The youtube thing is a colossal perverse incentive
		Subtleties in interactive learning is your raison d'etre, but here we are, making something non-interactive

	Eventually
		-mp3; diffed record.
		-Working on tablets. Phones get embed and maybe message. No need to worry about address bar
		-VR interaction / funkiness in which you move your head and hand around and camera is in right place
		-Would be nice if people could spectate live
		-send to haxiomic/mrdoob/wannerstedt, get "make it nicer looking for free by doing this:"
		-fix lighting
		-editing suite?

	To make
		-Maryam Mirzakhani, 14th of July
		-my favourite 3d patterns/neoshapes
		-Something with bloody puzzles
		-pwg

	You can bring interface bits on and off, less need to think about some great big "game state" thing
*/

// function importScript(scriptName)
// {
// 	var extraScript = document.createElement('script');
// 	extraScript.setAttribute('src',scriptName + '.js');
// 	document.body.appendChild(extraScript);
// 	extraScript.onload = init;
// }
// importScript('variables')

(function init()
{
	var vrAndRecording = WEBVR && WEBVR.isAvailable() && window.location.href === "http://localhost:9090/";
	if(vrAndRecording)
	{
		console.log("Full setup")
	}
	else
	{
		console.log("Playback setup")
	}
	var platform = getPlatform()
	if(platform === "phone" )
	{
		//and a message telling you it's better on desktop
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

			render();
		}
	}

	var renderer = new THREE.WebGLRenderer({ antialias: true });
	renderer.setPixelRatio( window.devicePixelRatio );
	renderer.setClearColor(0xFFFFFF)
	document.body.appendChild( renderer.domElement );

	var ourVrEffect = new THREE.VREffect( renderer );
	function render()
	{
		loop( controllers, vrAndRecording )
		ourVrEffect.requestAnimationFrame( function()
		{
			//a reasonable indicator is ourVREffect.isPresenting
			ourVrEffect.render( scene, camera );
			render();
		} );
	}

	initCameraAndRendererResizeSystemAndCameraRepresentation(renderer);
	
	initPlaybackSystemAndMaybeRecordingSystem( launcher, vrAndRecording );

	setUpSpectatorScene()

	var controllers = initControllers();
	if( vrAndRecording )
	{
		initVrInputSystem(controllers, ourVrEffect, renderer);
		addExtraForVR()
	}

	// var goose = new Goose();
	// goose.position.z = -0.1
	// scene.add(goose);

	mouse = initMouse(renderer);

	// initPwg();
	
	// initStereographicThreeSphere();
	// initStereographicTwoSphere();
	// initShapeMaker();
	// initIrreg();
	// initVectorFields();

	// initDogGame();
	
	initMirzakhani();
	
	// var allPolyhedra = [];
	// initSnapShapes( allPolyhedra );
	// initSnapShapesPresentation( allPolyhedra );

	{
		// var testObject = new THREE.Mesh( new THREE.SphereGeometry(0.01), new THREE.MeshLambertMaterial( {} ) );
		// camera.add(testObject);
		// testObject.position.z = -0.1;
		// // testObject.update = function()
		// // {
		// // 	this.position.y = 0.01*Math.sin(ourClock.getElapsedTime()*4);
		// // 	this.rotation.z = Math.sin(ourClock.getElapsedTime()*4.1);
		// // }
		// bestowDefaultMouseDragProperties(testObject);
		// markedThingsToBeUpdated.push(testObject);
		// clickables.push(testObject);
		// markObjectProperty(testObject.scale,"y")
		// markPositionAndQuaternion(testObject);

		// function testChangeValue(valueBetweenZeroAndOne)
		// {
		// 	testObject.scale.y = 1 + 0.7 * (valueBetweenZeroAndOne-0.5);
		// }
		// var testSlider = SliderSystem(testChangeValue, 0, true );
		// testObject.scale.y = 1;
		// testSlider.setValue(0.5)
		// testSlider.setDimensions(0.1)
		// testSlider.position.set(0,0.08,-0.4)
		// scene.add(testSlider)
		// markedThingsToBeUpdated.push(testSlider);

		// initImages();
	}

	launcher.initCompleted = true;
	launcher.attemptLaunch();
})();