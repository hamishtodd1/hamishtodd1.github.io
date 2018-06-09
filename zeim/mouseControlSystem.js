//"inheritance"
function bestowDefaultMouseDragProperties(object)
{
	object.cameraSpaceClickedPoint = null;
	object.onControllerGrab = function()
	{
		//stuff about whether it was grabbed with side button
		//either way it stays in camera space, hurgh
	}
	object.onClick = function(cameraSpaceClickedPoint)
	{
		this.cameraSpaceClickedPoint = cameraSpaceClickedPoint;
	}
	object.update = function()
	{
		if( mouse.clicking && mouse.lastClickedObject === this )
		{
			mouse.applyDrag(this);
		}
		else
		{
			this.cameraSpaceClickedPoint = null;
		}
	}
	if(markedThingsToBeUpdated.indexOf(object) === -1)
	{
		markedThingsToBeUpdated.push(object)
	}
	if(clickables.indexOf(object) === -1)
	{
		clickables.push(object)
	}
}

function initMouse(renderer)
{
	{
		var coneHeight = 0.002;
		var coneRadius = coneHeight * 0.4;
		var cursorGeometry = new THREE.ConeGeometry(coneRadius, coneHeight,31);
		cursorGeometry.computeFaceNormals();
		cursorGeometry.computeVertexNormals();
		cursorGeometry.merge( new THREE.CylinderGeometry(coneRadius / 4, coneRadius / 4, coneHeight / 2, 31 ), (new THREE.Matrix4()).makeTranslation(0, -coneHeight/2, 0) );
		cursorGeometry.applyMatrix( (new THREE.Matrix4()).makeTranslation(0, -coneHeight / 2, 0) );
		cursorGeometry.applyMatrix( (new THREE.Matrix4()).makeRotationZ(TAU/8) );
		var cursor = new THREE.Mesh(
				cursorGeometry, 
				new THREE.MeshPhongMaterial({color:0xFFFFFF, side: THREE.DoubleSide })
		);

		cursor.position.z = -0.3
		camera.add(cursor)

		markedThingsToBeUpdated.push(cursor)
		cursor.update = function()
		{
			this.position.copy(mouse.rayIntersectionWithZPlaneInCameraSpace(this.position.z))
		}
		markPosition(cursor);
	}

	var asynchronous = {
		normalizedDevicePosition: new THREE.Vector2(), //top right is 1,1, bottom left is -1,-1
		clicking: false,
		justMoved: false,
		currentRawX: 0,
		currentRawY: 0,
		updateNormalizedDevicePosition: function(rawX,rawY)
		{
			this.normalizedDevicePosition.x = ( rawX / window.innerWidth  ) * 2 - 1;
			this.normalizedDevicePosition.y =-( rawY / window.innerHeight ) * 2 + 1;
		}
	};

	var rayCaster = new THREE.Raycaster();
	rayCaster.setFromCamera( asynchronous.normalizedDevicePosition, camera );
	var ray = rayCaster.ray;
	var previousRay = new THREE.Ray();

	var mouse = {
		lastClickedObject: null,
		clicking: false,
		oldClicking: false,
		justMoved: false,

		//no, you shouldn't need to know its position at all times! there are other ways to alert people to interactivity!
		ray: ray,
		previousRay: previousRay,
		rayCaster: rayCaster
	};

	//hack. remove it.
	// getClientPosition = function()
	// {
	// 	return mouse.rayIntersectionWithZPlaneInCameraSpace(-1);
	// }
	// getClientRay = function()
	// {
	// 	var clientPosition = getClientPosition();

	// 	return new THREE.Line3( 
	// 		camera.position.clone(), 
	// 		clientPosition.clone().sub(camera.position).multiplyScalar(2).add(camera.position) );
	// }

	mouse.rayIntersectionWithZPlaneInCameraSpace = function(z)
	{
		var displacementFromCamera = ray.at(1).sub(camera.position);
		var unitRayEndZ = -displacementFromCamera.projectOnVector( camera.getWorldDirection() ).length();
		var rayLengthToGetZEquallingClickedPointZ = z / unitRayEndZ;
		var intersectionWithZPlane = ray.at(rayLengthToGetZEquallingClickedPointZ);
		intersectionWithZPlane.worldToLocal(camera);
		return intersectionWithZPlane;
	}

	mouse.applyDrag = function( object )
	{
		var newPositionOfGrabbedPoint = this.rayIntersectionWithZPlaneInCameraSpace(object.cameraSpaceClickedPoint.z);

		var displacement = newPositionOfGrabbedPoint.clone().sub(object.cameraSpaceClickedPoint);
		camera.localToWorld(displacement);
		displacement.add(object.parent.getWorldPosition())
		object.parent.updateMatrixWorld();
		object.parent.worldToLocal(displacement);
		object.position.add(displacement);

		object.cameraSpaceClickedPoint.copy(newPositionOfGrabbedPoint);
	}

	mouse.updateFromAsyncAndCheckClicks = function()
	{
		this.oldClicking = this.clicking;
		this.clicking = asynchronous.clicking;
		this.justMoved = asynchronous.justMoved;
		asynchronous.justMoved = false;

		previousRay.copy(ray);
		rayCaster.setFromCamera( asynchronous.normalizedDevicePosition, camera );

		if(this.clicking )
		{
			if( !this.oldClicking )
			{
				//not working for a mesh? Check for infinities
				var clickableIntersections = rayCaster.intersectObjects( clickables );
				if( clickableIntersections[0] )
				{
					var cameraSpaceClickedPoint = clickableIntersections[0].point.clone();
					cameraSpaceClickedPoint.worldToLocal(camera);
					if(clickableIntersections[0].object.onClick)
					{
						clickableIntersections[0].object.onClick(cameraSpaceClickedPoint,clickableIntersections[0].point);
					}

					this.lastClickedObject = clickableIntersections[0].object;
				}
				else
				{
					this.lastClickedObject = null;
				}
			}
		}
	}

	document.addEventListener( 'mousemove', function(event)
	{
		event.preventDefault();
		//for some bizarre reason this can be called more than once with the same values
		if(event.clientX !== asynchronous.currentRawX || event.clientY !== asynchronous.currentRawY)
		{
			asynchronous.updateNormalizedDevicePosition(event.clientX,event.clientY);
			asynchronous.justMoved = true;

			asynchronous.currentRawX = event.clientX;
			asynchronous.currentRawY = event.clientY;
		}
	}, false );

	document.addEventListener( 'mousedown', function(event) 
	{
		asynchronous.clicking = true;
	}, false );
	document.addEventListener( 'mouseup', function(event) 
	{
		asynchronous.clicking = false;
	}, false );

	return mouse;
}