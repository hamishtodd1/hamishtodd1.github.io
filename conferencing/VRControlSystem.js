function initVRInputSystem(controllers, launcher)
{
	var VRInputSystem = {};
	
	var cameraRepositioner = new THREE.VRControls( camera );
	
	//wouldn't it make sense if moving whole was better without clipping planes?
	
	VRInputSystem.startGettingInput = function()
	{
		if(cameraRepositioner.vrInputs.length < 1)
			console.error("no vr input? Check steamVR or Oculus to make sure it's working correctly")
			
		cameraRepositioner.vrInputs[0].requestPresent([{ source: renderer.domElement }])
		
		scene.add( controllers[ 0 ] );
		scene.add( controllers[ 1 ] );
	}
	
	var riftControllerKeys = {
			thumbstickButton:0,
			grippingTop: 1,
			grippingSide:2,
			button1: 3,
			button2: 4
	}
	
	function overlappingHoldable(holdable)
	{
		var ourPosition = this.controllerModel.geometry.boundingSphere.center.clone();
		this.localToWorld( ourPosition );
		
		var holdablePosition = holdable.boundingSphere.center.clone();
		holdable.localToWorld( holdablePosition );
		
		var ourScale = this.matrixWorld.getMaxScaleOnAxis();
		var holdableScale = holdable.matrixWorld.getMaxScaleOnAxis();
		
		if( ourPosition.distanceTo(holdablePosition) < holdable.boundingSphere.radius * holdableScale + this.controllerModel.geometry.boundingSphere.radius * ourScale )
			return true;
		else
			return false;
	}
		
	function loadControllerModel(i)
	{
		new THREE.OBJLoader().load( "data/external_controller01_" + (i===LEFT_CONTROLLER_INDEX?"left":"right") + ".obj",
			function ( object ) 
			{
				controllers[  i ].controllerModel.geometry = object.children[0].geometry;
			
				controllers[  i ].controllerModel.geometry.applyMatrix( new THREE.Matrix4().makeRotationAxis(xAxis,0.5) );
				controllers[  i ].controllerModel.geometry.applyMatrix( new THREE.Matrix4().makeTranslation((i==LEFT_CONTROLLER_INDEX?1:-1)*0.002,0.036,-0.039) );
				controllers[  i ].controllerModel.geometry.computeBoundingSphere();
				
				launcher.dataLoaded["controllerModel"+i.toString()] = true;
				launcher.attemptLaunch();
			},
			function ( xhr ) {}, function ( xhr ) { console.error( "couldn't load OBJ" ); } );
	}
	
	var controllerMaterial = new THREE.MeshLambertMaterial({color:0x444444});
	for(var i = 0; i < 2; i++)
	{
		controllers[ i ] = new THREE.Object3D();
		for( var propt in riftControllerKeys )
		{
			controllers[ i ][propt] = false;
		}
		controllers[ i ].thumbStickAxes = [0,0];
		controllers[ i ].controllerModel = new THREE.Mesh( new THREE.Geometry(), controllerMaterial.clone() );
		controllers[ i ].add( controllers[ i ].controllerModel );
		controllers[ i ].oldPosition = controllers[ i ].position.clone();
		controllers[ i ].oldQuaternion = controllers[ i ].quaternion.clone();
		
		controllers[ i ].overlappingHoldable = overlappingHoldable;
		
		loadControllerModel(i);
	}
	
	VRInputSystem.update = function(socket)
	{
		cameraRepositioner.update(); //positions the head

		var gamepads = navigator.getGamepads();
		for(var k = 0; k < 2 && k < gamepads.length; ++k)
		{
			var affectedControllerIndex = 666;
			if (gamepads[k] && gamepads[k].id === "Oculus Touch (Right)")
				affectedControllerIndex = RIGHT_CONTROLLER_INDEX;
			if (gamepads[k] && gamepads[k].id === "Oculus Touch (Left)")
				affectedControllerIndex = LEFT_CONTROLLER_INDEX;
			if( affectedControllerIndex === 666 )
				continue;
			
			controllers[affectedControllerIndex].thumbStickAxes[0] = gamepads[k].axes[0];
			controllers[affectedControllerIndex].thumbStickAxes[1] = gamepads[k].axes[1];
			
			controllers[affectedControllerIndex].oldPosition.copy(controllers[ affectedControllerIndex ].position);
			controllers[affectedControllerIndex].oldQuaternion.copy(controllers[ affectedControllerIndex ].quaternion);
			
			controllers[affectedControllerIndex].position.fromArray( gamepads[k].pose.position );
			controllers[affectedControllerIndex].quaternion.fromArray( gamepads[k].pose.orientation );
			controllers[affectedControllerIndex].updateMatrixWorld();
			
			controllers[affectedControllerIndex].grippingSide = gamepads[k].buttons[riftControllerKeys.grippingSide].pressed;
			controllers[affectedControllerIndex].grippingTop = gamepads[k].buttons[riftControllerKeys.grippingTop].pressed;
			
			controllers[affectedControllerIndex].button1 = gamepads[k].buttons[riftControllerKeys.button1].pressed;
			
//			if( affectedControllerIndex === RIGHT_CONTROLLER_INDEX )
//			{
//				eyeSeparation = gamepads[k].buttons[riftControllerKeys.grippingTop].value;
//			}
		}
	}
	
	return VRInputSystem;
}