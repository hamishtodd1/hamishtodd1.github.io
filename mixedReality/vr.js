function initControllerObjects()
{
	function overlappingHoldable(holdable)
	{
		var ourPosition = this.controllerModel.geometry.boundingSphere.center.clone();
		this.localToWorld( ourPosition );
		
		var holdablePosition = holdable.boundingSphere.center.clone();
		holdable.localToWorld( holdablePosition );
		
		var ourScale = this.matrixWorld.getMaxScaleOnAxis();
		var holdableScale = holdable.matrixWorld.getMaxScaleOnAxis();
	
		let overlapping = ourPosition.distanceTo(holdablePosition) < holdable.boundingSphere.radius * holdableScale + this.controllerModel.geometry.boundingSphere.radius * ourScale		
		return overlapping
	}

	var controllerMaterial = new THREE.MeshLambertMaterial({color:0x444444});
	var controllerKeys = {
		thumbstickButton:0,
		grippingTop: 1,
		grippingSide:2,
		button1: 3,
		button2: 4
	}
	for(var i = 0; i < 2; i++)
	{
		for( var propt in controllerKeys )
		{
			handControllers[ i ][propt] = false;
			handControllers[ i ][propt+"Old"] = false;
		}
		handControllers[ i ].thumbstickAxes = [0,0];
		handControllers[ i ].thumbstickUp = false
		handControllers[ i ].thumbstickDown = false
		handControllers[ i ].thumbstickLeft = false
		handControllers[ i ].thumbstickRight = false
		handControllers[ i ].thumbstickUpOld = false
		handControllers[ i ].thumbstickDownOld = false
		handControllers[ i ].thumbstickLeftOld = false
		handControllers[ i ].thumbstickRightOld = false

		handControllers[ i ].controllerModel = new THREE.Mesh( new THREE.BoxGeometry(0.1,0.1,0.17), controllerMaterial.clone() );
		handControllers[ i ].add( handControllers[ i ].controllerModel );

		handControllers[ i ].oldPosition = handControllers[ i ].position.clone();
		handControllers[ i ].oldQuaternion = handControllers[ i ].quaternion.clone();
		handControllers[ i ].deltaQuaternion = handControllers[ i ].quaternion.clone();
		handControllers[ i ].deltaPosition = handControllers[ i ].position.clone();
		
		handControllers[ i ].overlappingHoldable = overlappingHoldable;

		scene.add( handControllers[ i ] );
		handControllers[ i ].position.y = -0.5 //out of way until getting input

		handControllers[i].getDeltaQuaternion = function()
		{
			return new THREE.Quaternion().copy(this.oldQuaternion).inverse().multiply(this.quaternion)
		}
	}

	function loadControllerModel(i)
	{
		new THREE.OBJLoader().load( "data/external_controller01_" + (i===LEFT_CONTROLLER_INDEX?"left":"right") + ".obj",
			function ( object ) 
			{
				handControllers[ i ].controllerModel.geometry = object.children[0].geometry;
				// handControllers[ i ].controllerModel.geometry.applyMatrix( new THREE.Matrix4().makeRotationAxis(xUnit,0.7) );
				// handControllers[ i ].controllerModel.geometry.applyMatrix( new THREE.Matrix4().makeTranslation(
				// 	0.008 * ( i == LEFT_CONTROLLER_INDEX?-1:1),
				// 	0.041,
				// 	-0.03) );
				// handControllers[ i ].controllerModel.geometry.computeBoundingSphere()

				let m = new THREE.Matrix4()
				let q = new THREE.Quaternion( -0.3375292117664683,-0.044097048926644455,0.0016882363725985309,-0.9402800813258839 )

				if(i === LEFT_CONTROLLER_INDEX)
				{
					m.makeRotationFromQuaternion(q)
					m.setPosition(new THREE.Vector3(-0.012547648553172985,0.03709224605844833,-0.038470991285082676))
					handControllers[ i ].controllerModel.geometry.applyMatrix( m )
				}
				else
				{
					let qAxis = new THREE.Vector3(
						q.x / Math.sqrt(1-q.w*q.w),
						q.y / Math.sqrt(1-q.w*q.w),
						q.z / Math.sqrt(1-q.w*q.w))
					qAxis.x *= -1
					let otherQ = new THREE.Quaternion().setFromAxisAngle(qAxis,-2 * Math.acos(q.w))
					
					m.makeRotationFromQuaternion(otherQ)
					m.setPosition(new THREE.Vector3(0.012547648553172985,0.03709224605844833,-0.038470991285082676))
					handControllers[i].controllerModel.geometry.applyMatrix( m )
				}
			},
			function ( xhr ) {}, function ( xhr ) { console.error( "couldn't load OBJ" ); } );
	}

	loadControllerModel(RIGHT_CONTROLLER_INDEX)
	loadControllerModel( LEFT_CONTROLLER_INDEX)

	// {
	// 	let cone = new THREE.Mesh(new THREE.ConeBufferGeometry(0.1,0.4,4))
	// 	cone.geometry.applyMatrix(new THREE.Matrix4().makeRotationY(TAU/8))
	// 	bindButton("i",function()
	// 	{
	// 		cone.rotation.x += 0.1
	// 	},"cone rotation")
	// 	bindButton("k",function()
	// 	{
	// 		cone.rotation.x -= 0.1
	// 	},"cone rotation")
	// 	bindButton("j",function()
	// 	{
	// 		cone.rotation.z += 0.1
	// 	},"cone rotation")
	// 	bindButton("l",function()
	// 	{
	// 		cone.rotation.z -= 0.1
	// 	},"cone rotation")
	// 	handControllers[1-RIGHT_CONTROLLER_INDEX].add(cone)
	// }
}

function initVrInput()
{
	renderer.vr.enabled = true;
	
	let vrButton = WEBVR.createButton( renderer )
	document.body.appendChild( vrButton );
	document.addEventListener( 'keydown', function( event )
	{
		if(event.keyCode === 69 )
		{
			vrButton.onclick()
			// window.removeEventListener('resize', windowResize)
		}
	}, false );

	var controllerKeys = { //TODO Duplicated!
		thumbstickButton:0,
		grippingTop: 1,
		grippingSide:2,
		button1: 3,
		button2: 4
	}

	readHandInput = function()
	{
		var gamepads = navigator.getGamepads();

		let standingMatrix = renderer.vr.getStandingMatrix()
		
		for(var k = 0; k < gamepads.length; ++k)
		{
			if(!gamepads[k] || gamepads[k].pose === null || gamepads[k].pose === undefined || gamepads[k].pose.position === null)
			{
				continue;
			}

			var affectedControllerIndex = -1;
			if (gamepads[k].id === "OpenVR Gamepad" )
			{
				if(gamepads[k].index )
				{
					affectedControllerIndex = RIGHT_CONTROLLER_INDEX;
				}
				else
				{
					affectedControllerIndex = LEFT_CONTROLLER_INDEX;
				}
			}
			else if (gamepads[k].id === "Oculus Touch (Right)")
			{
				affectedControllerIndex = RIGHT_CONTROLLER_INDEX;
			}
			else if (gamepads[k].id === "Oculus Touch (Left)")
			{
				affectedControllerIndex = LEFT_CONTROLLER_INDEX;
			}
			else if (gamepads[k].id === "Spatial Controller (Spatial Interaction Source)")
			{
				if( gamepads[k].hand === "right" )
				{
					affectedControllerIndex = RIGHT_CONTROLLER_INDEX;
				}
				else
				{
					affectedControllerIndex = LEFT_CONTROLLER_INDEX;
				}
			}
			else
			{
				continue;
			}

			var controller = handControllers[affectedControllerIndex]
			
			{
				controller.thumbstickAxes[0] = gamepads[k].axes[0];
				controller.thumbstickAxes[1] = gamepads[k].axes[1];

				controller.thumbstickRightOld = controller.thumbstickRight
				controller.thumbstickLeftOld = controller.thumbstickLeft
				controller.thumbstickUpOld = controller.thumbstickUp
				controller.thumbstickDownOld = controller.thumbstickDown

				controller.thumbstickRight = controller.thumbstickAxes[0] > 0.5
				controller.thumbstickLeft = controller.thumbstickAxes[0] < -0.5
				controller.thumbstickUp = controller.thumbstickAxes[1] < -0.5
				controller.thumbstickDown = controller.thumbstickAxes[1] > 0.5
			}
			
			{
				controller.oldPosition.copy(controller.position);
				controller.oldQuaternion.copy(controller.quaternion);
				
				controller.position.fromArray( gamepads[k].pose.position );
				controller.position.applyMatrix4( standingMatrix );
				controller.quaternion.fromArray( gamepads[k].pose.orientation );
				controller.updateMatrixWorld();

				controller.deltaPosition.copy(controller.position).sub(controller.oldPosition);
				controller.deltaQuaternion.copy(controller.oldQuaternion).inverse().multiply(controller.quaternion);
			}

			for( var propt in controllerKeys )
			{
				controller[propt+"Old"] = controller[propt];
				controller[propt] = gamepads[k].buttons[controllerKeys[propt]].pressed;
			}
			controller["grippingSide"] = gamepads[k].buttons[controllerKeys["grippingSide"]].value > 0.7;
		}
	}
}