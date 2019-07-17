/* 
	Assume 16:9 because that's youtube. All resolutions should get the controls but people viewing in portrait
*/

function initControllers()
{
	var handControllers = Array(2);

	function loadControllerModel(i)
	{
		new THREE.OBJLoader().load( "data/meshes/external_controller01_" + (i===LEFT_CONTROLLER_INDEX?"left":"right") + ".obj",
			function ( object ) 
			{
				handControllers[  i ].controllerModel.geometry = object.children[0].geometry;
			
				handControllers[  i ].controllerModel.geometry.applyMatrix( new THREE.Matrix4().makeRotationAxis(xUnit,0.5) );
				handControllers[  i ].controllerModel.geometry.applyMatrix( new THREE.Matrix4().makeTranslation((i==LEFT_CONTROLLER_INDEX?1:-1)*0.002,0.036,-0.039) );
				handControllers[  i ].controllerModel.geometry.computeBoundingSphere();
			},
			function ( xhr ) {}, function ( xhr ) { console.error( "couldn't load OBJ" ); } );
	}
	
	var controllerMaterial = new THREE.MeshLambertMaterial({color:0x444444});
	for(var i = 0; i < 2; i++)
	{
		handControllers[ i ] = new THREE.Object3D();
		scene.add( handControllers[ i ] );
		
		handControllers[ i ].controllerModel = new THREE.Mesh( new THREE.Geometry(), controllerMaterial.clone() );
		handControllers[ i ].add( handControllers[ i ].controllerModel );

		handControllers[ i ].position.y = -0.1;

		// markPositionAndQuaternion(handControllers[i]);
		
		loadControllerModel(i);
	}

	return handControllers;
}

function initVrInputSystem(handControllers, ourVrEffect, renderer)
{	
	var cameraRepositioner = new THREE.VRControls( camera );

	document.addEventListener( 'keydown', function( event )
	{
		if(event.keyCode === 69 && ( navigator.getVRDisplays !== undefined || navigator.getVRDevices !== undefined ) )
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
		handControllers[ i ].thumbStickAxes = [0,0];
		handControllers[ i ].overlappingHoldable = overlappingHoldable;
		handControllers[ i ].oldPosition = handControllers[ i ].position.clone();
		handControllers[ i ].oldQuaternion = handControllers[ i ].quaternion.clone();

		for( var propt in riftControllerKeys )
		{
			handControllers[ i ][propt] = false;
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
			
			handControllers[affectedControllerIndex].thumbStickAxes[0] = gamepads[k].axes[0];
			handControllers[affectedControllerIndex].thumbStickAxes[1] = gamepads[k].axes[1];
			
			handControllers[affectedControllerIndex].oldPosition.copy(handControllers[ affectedControllerIndex ].position);
			handControllers[affectedControllerIndex].oldQuaternion.copy(handControllers[ affectedControllerIndex ].quaternion);
			
			handControllers[affectedControllerIndex].position.fromArray( gamepads[k].pose.position );
			handControllers[affectedControllerIndex].quaternion.fromArray( gamepads[k].pose.orientation );
			handControllers[affectedControllerIndex].updateMatrixWorld();
			
			handControllers[affectedControllerIndex].grippingSide = gamepads[k].buttons[riftControllerKeys.grippingSide].pressed;
			handControllers[affectedControllerIndex].grippingTop = gamepads[k].buttons[riftControllerKeys.grippingTop].pressed;
			
			handControllers[affectedControllerIndex].button1 = gamepads[k].buttons[riftControllerKeys.button1].pressed;
		}
	}
}