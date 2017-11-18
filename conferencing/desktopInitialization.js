function desktopInitialize()
{
	var launcher = {
		socketOpened: false,
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
					return;
			}
			if(!this.socketOpened )
				return;
			else
			{
//				initMutator(tools);
//				initAtomDeleter(tools);
				
				/*
				 * tutModelWithLigand
				 * ribosome.txt
				 * oneAtomOneBond.txt
				 * 3C0.lst
				 */
				loadModel("data/tutModelWithLigand.txt", thingsToBeUpdated, visiBox.planes);
				initMap("data/try-2-map-fragment.tab.txt", visiBox.planes);
				
				desktopLoop(ourVREffect, socket, controllers, VRInputSystem, visiBox, thingsToBeUpdated, holdables );
			}
		}
	}

	var thingsToBeUpdated = {};
	thingsToBeUpdated.labels = [];
	var holdables = {};
	
	var visiBox = initVisiBox(thingsToBeUpdated,holdables);
	
	var ourVREffect = new THREE.VREffect( renderer );
	
	controllers = Array(2);
	var VRInputSystem = initVRInputSystem(controllers, launcher);
	
	//rename when it's more than model and map. "the workspace" or something
	modelAndMap = new THREE.Object3D();
	modelAndMap.scale.setScalar( 0.028 );
	getAngstrom = function()
	{
		return modelAndMap.scale.x;
	}
	modelAndMap.position.z = -FOCALPOINT_DISTANCE;
	scene.add(modelAndMap);
	
	new THREE.FontLoader().load( "data/gentilis.js", 
		function ( gentilis ) {
			THREE.defaultFont = gentilis;
			
			launcher.dataLoaded.font = true;
			launcher.attemptLaunch();
		},
		function ( xhr ) {}, //progression function
		function ( xhr ) { console.error( "couldn't load font" ); }
	);
	
	scene.add( new THREE.PointLight( 0xFFFFFF, 1, FOCALPOINT_DISTANCE ) );
	
	window.addEventListener( 'resize', function(){
		console.log("resizing")
	    renderer.setSize( window.innerWidth, window.innerHeight ); //nothing about vr effect?
	    camera.aspect = window.innerWidth / window.innerHeight;
	    camera.updateProjectionMatrix();
	}, false );
	
	document.addEventListener( 'keydown', function(event)
	{
		if(event.keyCode === 190 && ( navigator.getVRDisplays !== undefined || navigator.getVRDevices !== undefined ) )
		{
			event.preventDefault();
			VRInputSystem.startGettingInput();
			ourVREffect.setFullScreen( true );
		}
	}, false );
	
	makeScene(true);
	
//	initSphereSelector(cursor);
	
	{
		var blinker = new THREE.Mesh(new THREE.PlaneBufferGeometry(10,10),new THREE.MeshBasicMaterial({color:0x000000, transparent:true, opacity:0}))
		blinker.blinkProgress = 1;
		camera.add(blinker);
		
		document.addEventListener( 'keydown', function(event)
		{
			if(event.keyCode === 13 )
			{
				blinker.blinkProgress = -1;
			}
		}, false );
		
		blinker.update = function()
		{
			var oldBlinkProgress = blinker.blinkProgress;
			
			blinker.blinkProgress += frameDelta * 7;
			blinker.material.opacity = 1-Math.abs(this.blinkProgress);
			blinker.position.z = -camera.near - 0.00001;
			
			if( oldBlinkProgress < 0 && this.blinkProgress > 0)
			{
				ourVREffect.toggleEyeSeparation();
				if( visiBox.position.distanceTo(camera.position) < camera.near )
				{
					visiBox.position.setLength(camera.near * 1.1);
				}
			}
		}
		
		thingsToBeUpdated.blinker = blinker;
	}

	//socket crap
	{
		socket = initSocket();
		
		socket.onopen = function( )
		{
			launcher.socketOpened = true;
			launcher.attemptLaunch();
		}
		
		socket.messageResponses["This is the server"] = function(messageContents)
		{}
		
		socket.messageResponses["mousePosition"] = function(messageContents)
		{}
		
		socket.messageResponses["lmb"] = function(messageContents)
		{}
		
		
		
		//A solution to narrow screens. Works fine but we can't record it!
		//siiiiigh, it would introduce complexity for the user anyway
//		else if( messageContents[0] === "o" && parseInt( messageContents[1] ) )
//		{
//			ourStereoEffect.stereoCamera.cameraL.projectionMatrix.elements[8] -= 0.01;
//			ourStereoEffect.stereoCamera.cameraR.projectionMatrix.elements[8] += 0.01;
//			console.log(ourStereoEffect.stereoCamera.cameraL.projectionMatrix.elements[8])
//			console.log(ourStereoEffect.stereoCamera.cameraR.projectionMatrix.elements[8])
//		}
//		else if( messageContents[0] === "l" && parseInt( messageContents[1] ) )
//		{
//			ourStereoEffect.stereoCamera.cameraL.projectionMatrix.elements[8] += 0.01;
//			ourStereoEffect.stereoCamera.cameraR.projectionMatrix.elements[8] -= 0.01;
//			console.log(ourStereoEffect.stereoCamera.cameraL.projectionMatrix.elements[8])
//			console.log(ourStereoEffect.stereoCamera.cameraR.projectionMatrix.elements[8])
//		}
	}
}