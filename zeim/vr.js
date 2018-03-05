/*
	Assume 16:9 because that's youtube. All resolutions should get the controls but people viewing in portrait
*/

function initControllers()
{
	var controllers = Array(2);

	function loadControllerModel(i)
	{
		new THREE.OBJLoader().load( "data/meshes/external_controller01_" + (i===LEFT_CONTROLLER_INDEX?"left":"right") + ".obj",
			function ( object ) 
			{
				controllers[  i ].controllerModel.geometry = object.children[0].geometry;
			
				controllers[  i ].controllerModel.geometry.applyMatrix( new THREE.Matrix4().makeRotationAxis(xUnit,0.5) );
				controllers[  i ].controllerModel.geometry.applyMatrix( new THREE.Matrix4().makeTranslation((i==LEFT_CONTROLLER_INDEX?1:-1)*0.002,0.036,-0.039) );
				controllers[  i ].controllerModel.geometry.computeBoundingSphere();
			},
			function ( xhr ) {}, function ( xhr ) { console.error( "couldn't load OBJ" ); } );
	}
	
	var controllerMaterial = new THREE.MeshLambertMaterial({color:0x444444});
	for(var i = 0; i < 2; i++)
	{
		controllers[ i ] = new THREE.Object3D();
		scene.add( controllers[ i ] );
		
		controllers[ i ].controllerModel = new THREE.Mesh( new THREE.Geometry(), controllerMaterial.clone() );
		controllers[ i ].add( controllers[ i ].controllerModel );

		controllers[ i ].position.y = -0.1;

		// markPositionAndQuaternion(controllers[i]);
		
		loadControllerModel(i);
	}

	return controllers;
}

function initVrInputSystem(controllers, ourVrEffect, renderer)
{	
	var cameraRepositioner = new THREE.VRControls( camera );

	document.addEventListener( 'keydown', function( event )
	{
		if(event.keyCode === 190 && ( navigator.getVRDisplays !== undefined || navigator.getVRDevices !== undefined ) )
		{
			event.preventDefault();
			if(cameraRepositioner.vrInputs.length < 1)
			{
				console.error("no vr input? Check steamVR or Oculus to make sure it's working correctly")
			}
				
			cameraRepositioner.vrInputs[0].requestPresent([{ source: renderer.domElement }])
			
			ourVrEffect.setFullScreen( true );
		}
	}, false ); 
	
	var vrInputSystem = {};

	var riftControllerKeys = {
		thumbstickButton:0,
		grippingTop: 1,
		grippingSide:2,
		button1: 3,
		button2: 4
	}
	for(var i = 0; i < 2; i++)
	{
		controllers[ i ].thumbStickAxes = [0,0];
		controllers[ i ].overlappingHoldable = overlappingHoldable;
		controllers[ i ].oldPosition = controllers[ i ].position.clone();
		controllers[ i ].oldQuaternion = controllers[ i ].quaternion.clone();

		for( var propt in riftControllerKeys )
		{
			controllers[ i ][propt] = false;
		}
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
	
	updateVrInputSystem = function()
	{
		if(cameraRepositioner)
		{
			cameraRepositioner.update();
		}

		var gamepads = navigator.getGamepads();
		for(var k = 0; k < 2 && k < gamepads.length; ++k)
		{
			var affectedControllerIndex = 666;
			if (gamepads[k] && gamepads[k].id === "Oculus Touch (Right)")
			{
				affectedControllerIndex = RIGHT_CONTROLLER_INDEX;
			}
			if (gamepads[k] && gamepads[k].id === "Oculus Touch (Left)")
			{
				affectedControllerIndex = LEFT_CONTROLLER_INDEX;
			}
			if( affectedControllerIndex === 666 )
			{
				continue;
			}
			
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
		}
	}
}