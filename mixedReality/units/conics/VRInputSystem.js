function VRInputSystem(controllers)
{
	var VRInputSystem = {};
	
	var cameraRepositioner = new THREE.VRControls( camera );
	
	VRInputSystem.startGettingInput = function()
	{
		cameraRepositioner.vrInputs[0].requestPresent([{ source: renderer.domElement }])
	}
	
	var riftInputlerKeys = {
		thumbstickButton:0,
		trigger: 1,
		grip:2,
		button1: 3,
		button2: 4
	}
	
	var controllerMaterial = new THREE.MeshPhongMaterial({color:0x000000});
	for(var i = 0; i < 2; i++)
	{
		controllers[ i ] = new THREE.Object3D();
		controllers[ i ].gripping = 0;
		controllers[ i ].add(new THREE.Mesh( new THREE.Geometry(), controllerMaterial.clone() ))
		scene.add( controllers[ i ] );
	}
	new THREE.OBJLoader().load( "data/external_controller01_left.obj",
		function ( object ) 
		{	
			var controllerModelGeometry = object.children[0].geometry;
		
			controllerModelGeometry.applyMatrix( new THREE.Matrix4().makeRotationAxis(xAxis,0.5) );
			controllerModelGeometry.applyMatrix( new THREE.Matrix4().makeTranslation(0.002,0.036,-0.039) );
//			controllerModelGeometry.applyMatrix( new THREE.Matrix4().makeScale(0.76,0.76,0.76) );
			
			controllers[  LEFT_CONTROLLER_INDEX ].children[0].geometry = controllerModelGeometry;
			
			controllers[1-LEFT_CONTROLLER_INDEX ].children[0].geometry = controllerModelGeometry.clone();
			controllers[1-LEFT_CONTROLLER_INDEX ].children[0].geometry.applyMatrix( new THREE.Matrix4().makeScale(-1,1,1) );
		},
		function ( xhr ) {}, function ( xhr ) { console.error( "couldn't load OBJ" ); } );
	
	VRInputSystem.update = function(socket)
	{
		cameraRepositioner.update(); //positions the head		
//		camera.position.z -= FOCALPOINT_DISTANCE;

		var gamepads = navigator.getGamepads();
		for(var k = 0; k < 2 && k < gamepads.length; ++k)
		{
			var affectedInputlerIndex = 666;
			if (gamepads[k] && gamepads[k].id === "Oculus Touch (Right)")
				affectedInputlerIndex = RIGHT_CONTROLLER_INDEX;
			if (gamepads[k] && gamepads[k].id === "Oculus Touch (Left)")
				affectedInputlerIndex = LEFT_CONTROLLER_INDEX;
			if( affectedInputlerIndex === 666 )
				continue;
			
			controllers[affectedInputlerIndex].position.fromArray( gamepads[k].pose.position );
			controllers[affectedInputlerIndex].position.z -= FOCALPOINT_DISTANCE;
			controllers[affectedInputlerIndex].quaternion.fromArray( gamepads[k].pose.orientation );
			controllers[affectedInputlerIndex].updateMatrixWorld();
			
			if( gamepads[k].buttons[riftInputlerKeys.grip].pressed || gamepads[k].buttons[riftInputlerKeys.trigger].pressed )
				controllers[affectedInputlerIndex].gripping = 1;
			else
				controllers[affectedInputlerIndex].gripping = 0;
			
			if( affectedInputlerIndex === RIGHT_CONTROLLER_INDEX )
			{
//				ourVREffect.eyeSeparationMultiplier = gamepads[k].buttons[riftTriggerButton].value;
				
				if( gamepads[k].buttons[riftInputlerKeys.grip].pressed )
					socket.send("increase radius");
			}
			
			controllers[affectedInputlerIndex].children[0].material.emissive.r = controllers[affectedInputlerIndex].gripping;
		}
	}
	
	return VRInputSystem;
}

