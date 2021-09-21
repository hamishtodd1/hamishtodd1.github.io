let handControllerKeys = {
	thumbstickButton: 0,
	grippingTop: 1,
	grippingSide: 2,
	button1: 3,
	button2: 4
}

function initVrOrMockVrInput()
{
	if(MODE === NONVR_TESTING_MODE)
	{
		//could make some vr presence detectors
		//and even refresh the page with the mode changed

		var mockVrInput = initMockVrInput();
	}
	else
	{
		renderer.vr.enabled = true;

		let vrButton = WEBVR.createButton( renderer )
		document.body.appendChild( vrButton );

		// vrButton.onclick()
	}

	let getVrOrMockVrInput = function()
	{
		for(let i = 0; i < 2; i++ )
		{
			let hand = hands[i]

			hand.thumbstickRightOld = hand.thumbstickRight
			hand.thumbstickLeftOld = hand.thumbstickLeft
			hand.thumbstickUpOld = hand.thumbstickUp
			hand.thumbstickDownOld = hand.thumbstickDown

			hand.positionOld.copy(hand.position);
			hand.quaternionOld.copy(hand.quaternion);

			hand.laser.visible = false;

			for( var propt in handControllerKeys )
			{
				hand[propt+"Old"] = hand[propt];
			}
		}

		if( MODE === NONVR_TESTING_MODE )
			mockVrInput()
		else
			actualVrInput()

		for(let i = 0; i < 2; i++ )
		{
			let hand = hands[i]
			hand.deltaPosition.copy(hand.position).sub(hand.positionOld);
			hand.deltaQuaternion.copy(hand.quaternionOld).invert().multiply(hand.quaternion);
		}
	}

	return getVrOrMockVrInput;
}

function actualVrInput()
{
	let gamepads = navigator.getGamepads();
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

		let hand = hands[affectedControllerIndex]
		
		hand.thumbstickAxes[0] = gamepads[k].axes[0];
		hand.thumbstickAxes[1] = gamepads[k].axes[1];

		hand.thumbstickRight = hand.thumbstickAxes[0] > 0.5
		hand.thumbstickLeft = hand.thumbstickAxes[0] < -0.5
		hand.thumbstickUp = hand.thumbstickAxes[1] < -0.5
		hand.thumbstickDown = hand.thumbstickAxes[1] > 0.5
		
		hand.position.fromArray( gamepads[k].pose.position );
		hand.position.applyMatrix4( standingMatrix );
		hand.quaternion.fromArray( gamepads[k].pose.orientation );
		hand.updateMatrixWorld();

		for( var propt in handControllerKeys )
		{
			hand[propt] = gamepads[k].buttons[handControllerKeys[propt]].pressed;
		}
		hand["grippingSide"] = gamepads[k].buttons[handControllerKeys["grippingSide"]].value > 0.7;
	}
}

function initControllerObjects()
{
	// function overlappingHoldable(holdable)
	// {
	// 	var ourPosition = this.controllerModel.geometry.boundingSphere.center.clone();
	// 	this.localToWorld( ourPosition );
		
	// 	var holdablePosition = holdable.boundingSphere.center.clone();
	// 	holdable.localToWorld( holdablePosition );
		
	// 	var ourScale = this.matrixWorld.getMaxScaleOnAxis();
	// 	var holdableScale = holdable.matrixWorld.getMaxScaleOnAxis();
	
	// 	let overlapping = ourPosition.distanceTo(holdablePosition) < holdable.boundingSphere.radius * holdableScale + this.controllerModel.geometry.boundingSphere.radius * ourScale		
	// 	return overlapping
	// }

	var controllerMaterial = new THREE.MeshStandardMaterial({color:0x444444});
	for(var i = 0; i < 2; i++)
	{
		let hand = hands[i]

		for( var propt in handControllerKeys )
		{
			hand[propt] = false;
			hand[propt+"Old"] = false;
		}
		hand.thumbstickAxes = [0,0];

		hand.thumbstickUp = false
		hand.thumbstickDown = false
		hand.thumbstickLeft = false
		hand.thumbstickRight = false

		hand.thumbstickUpOld = false
		hand.thumbstickDownOld = false
		hand.thumbstickLeftOld = false
		hand.thumbstickRightOld = false

		hand.controllerModel = new THREE.Mesh( new THREE.BoxGeometry(0.1,0.1,0.17), controllerMaterial.clone() );
		hand.add( hand.controllerModel );

		//could totes use this to make a whiteboard
		//it could be a transparent thing that you use to make shapes
		{
			hand.laser = new THREE.Mesh(
				new THREE.CylinderBufferGeometryUncentered( 0.001, 1), 
				new THREE.MeshBasicMaterial({color:0xFF0000, transparent:true,opacity:0.14}) 
			);
			hand.laser.rotation.x = -TAU/4
			hand.add(hand.laser);

			let raycaster = new THREE.Raycaster();
			hand.intersectLaserWithObject = function(object3D)
			{
				hand.laser.updateMatrixWorld();

				raycaster.ray.origin.set(0,0,0);
				hand.laser.localToWorld(raycaster.ray.origin)
				raycaster.ray.direction.set(0,1,0);
				hand.laser.localToWorld(raycaster.ray.direction)
				raycaster.ray.direction.sub(raycaster.ray.origin).normalize();

				return raycaster.intersectObject(object3D);
			}
			hand.setlaserLengthFromEnd = function(end)
			{
				hand.laser.scale.y = end.distanceTo(hand);
			}
		}

		hand.positionOld = hand.position.clone();
		hand.quaternionOld = hand.quaternion.clone();
		hand.deltaQuaternion = hand.quaternion.clone();
		hand.deltaPosition = hand.position.clone();
		
		// hand.overlappingHoldable = overlappingHoldable;

		scene.add( hand )

		hand.getDeltaQuaternion = function()
		{
			return new THREE.Quaternion().copy(this.quaternionOld).invert().multiply(this.quaternion)
		}
	}

	function loadControllerModel(i)
	{
		new THREE.OBJLoader().load( "data/external_controller01_" + (i===LEFT_CONTROLLER_INDEX?"left":"right") + ".obj", function ( object )
		{
			hands[i].controllerModel.geometry = object.children[0].geometry;

			let m = new THREE.Matrix4()
			let q = new THREE.Quaternion( -0.3375292117664683,-0.044097048926644455,0.0016882363725985309,-0.9402800813258839 )

			if(i === LEFT_CONTROLLER_INDEX)
			{
				m.makeRotationFromQuaternion(q)
				m.setPosition(new THREE.Vector3(-0.012547648553172985,0.03709224605844833,-0.038470991285082676))
				hands[ i ].controllerModel.geometry.applyMatrix4( m )
			}
			else
			{
				let qAxis = new THREE.Vector3(
					q.x / Math.sqrt(1-q.w*q.w),
					q.y / Math.sqrt(1-q.w*q.w),
					q.z / Math.sqrt(1-q.w*q.w))
				qAxis.x *= -1.
				let otherQ = new THREE.Quaternion().setFromAxisAngle(qAxis,-2 * Math.acos(q.w))
				
				m.makeRotationFromQuaternion(otherQ)
				m.setPosition(new THREE.Vector3(0.012547648553172985,0.03709224605844833,-0.038470991285082676))
				hands[i].controllerModel.geometry.applyMatrix4( m )
			}

			hands[ i ].controllerModel.geometry.computeBoundingSphere()
		},
		function ( xhr ) {}, function ( xhr ) { console.error( "couldn't load OBJ" ); } );
	}

	loadControllerModel( RIGHT_CONTROLLER_INDEX )

	if( MODE === VR_TESTING_MODE )
	{
		loadControllerModel( LEFT_CONTROLLER_INDEX )
	}

	markPositionAndQuaternion( rightHand )
}