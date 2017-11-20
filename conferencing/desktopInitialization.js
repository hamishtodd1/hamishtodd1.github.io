/*
 * Webpage with simple box. Enter pdb ID or weblink to page or serial number
 * Enter something other than a serial number and it creates a "lobby" with a unique serial number that will be on the wall
 */

function desktopInitialize(pdbWebAddress)
{
	var launcher = {
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

			loadModel(pdbWebAddress, thingsToBeUpdated );
			render();
		}
	}

	var renderer = new THREE.WebGLRenderer({ antialias: true });
	renderer.localClippingEnabled = true; //necessary if it's done in a shader you write?
	renderer.setPixelRatio( window.devicePixelRatio );
	renderer.setSize( window.innerWidth, window.innerHeight );
	document.body.appendChild( renderer.domElement );

	var thingsToBeUpdated = {};
	thingsToBeUpdated.labels = [];
	var holdables = {};
	
	var visiBox = initVisiBox(thingsToBeUpdated,holdables);
	
	var ourVREffect = new THREE.VREffect( renderer );
	render = function()
	{
		ourVREffect.requestAnimationFrame( function(){
			ourVREffect.render( scene, camera );
			desktopLoop(ourVREffect, socket, controllers, VRInputSystem, visiBox, thingsToBeUpdated, holdables );
		} );
	}
	
	controllers = Array(2);
	var VRInputSystem = initVRInputSystem(controllers, launcher);
	
	model = new THREE.Object3D();
	model.scale.setScalar( 0.01 ); //0.028 is nice
	getAngstrom = function()
	{
		return model.scale.x;
	}
	model.position.z = -FOCALPOINT_DISTANCE;
	scene.add(model);
	
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
}