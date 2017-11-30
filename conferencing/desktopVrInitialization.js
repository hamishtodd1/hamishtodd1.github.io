initializers.desktopVr = function(socket, pdbWebAddress, roomKey, launcher, visiBox, thingsToBeUpdated, renderer, userManager,
	controllerGeometries )
{
	var holdables = {};
	for(var i = 0; i < visiBox.corners.length; i++)
	{
		holdables[ "visiBoxCorner" + i.toString() ] = visiBox.corners[i];
	}
	
	var controllers = Array(2);
	var vrInputSystem = initVrInputSystem(renderer,controllers,controllerGeometries);
	
	document.addEventListener( 'keydown', function(event)
	{
		if(event.keyCode === 190 && ( navigator.getVRDisplays !== undefined || navigator.getVRDevices !== undefined ) )
		{
			event.preventDefault();
			vrInputSystem.startGettingInput();
			ourVrEffect.setFullScreen( true );
		}
	} );

	function associateKeyHoldToMessages(keyCode, buttonKey)
	{
		document.addEventListener( 'keydown', function(event)
		{
			if(event.keyCode === keyCode )
			{
				socket.emit(buttonKey,true);
			}
		});
		document.addEventListener( 'keyup', function(event)
		{
			if(event.keyCode === keyCode )
			{
				socket.emit(buttonKey,false);
			}
		});
	}
	associateKeyHoldToMessages(87, "forward");
	associateKeyHoldToMessages(83, "backward");
	associateKeyHoldToMessages(65, "left");
	associateKeyHoldToMessages(68, "right");
	
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
		} );
		
		blinker.update = function()
		{
			var oldBlinkProgress = blinker.blinkProgress;
			
			blinker.blinkProgress += frameDelta * 7;
			blinker.material.opacity = 1-Math.abs(this.blinkProgress);
			blinker.position.z = -camera.near - 0.00001;
			
			if( oldBlinkProgress < 0 && this.blinkProgress > 0)
			{
				ourVrEffect.toggleEyeSeparation();
				if( visiBox.position.distanceTo(camera.position) < camera.near )
				{
					visiBox.position.setLength(camera.near * 1.1);
				}
			}
		}
		
		thingsToBeUpdated.blinker = blinker;
	}

	window.addEventListener( 'resize', function()
	{
	    renderer.setSize( window.innerWidth, window.innerHeight ); //nothing about vr effect?
	    camera.aspect = window.innerWidth / window.innerHeight;
	    camera.updateProjectionMatrix();
	}, false );

	var ourVrEffect = new THREE.VREffect( renderer );
	function render()
	{
		coreLoops.desktopVr( socket, visiBox, thingsToBeUpdated, userManager, vrInputSystem, controllers, holdables )
		ourVrEffect.requestAnimationFrame( function()
		{
			ourVrEffect.render( scene, camera );
			render();
		} );
	}
	launcher.render = render;
}