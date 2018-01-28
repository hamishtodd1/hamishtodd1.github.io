//"inheritance"
function bestowDefaultMouseDragProperties(object)
{
	object.clickedPoint = null;
	object.onControllerGrab = function()
	{
		//stuff about whether it was grabbed with side button
		//either way it stays in camera space, hurgh
	}
	object.onClick = function(cameraSpaceClickedPoint)
	{
		this.clickedPoint = cameraSpaceClickedPoint;
	}
	object.update = function()
	{
		if( mouse.clicking && mouse.lastClickedObject === this )
		{
			mouse.applyDrag(this);
		}
		else
		{
			this.clickedPoint = null;
		}
	}
}

function initMouse(renderer)
{
	var asynchronous = {
		normalizedDevicePosition: new THREE.Vector2(),
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

	var raycaster = new THREE.Raycaster();
	var mouse = {
		lastClickedObject: null,
		clicking: false,
		oldClicking: false,
		justMoved: false
	};

	mouse.applyDrag = function( object )
	{
		var unitRayEndZ = cameraZPlaneDistance(raycaster.ray.at(1))
		var rayLengthToGetZEquallingClickedPointZ = -object.clickedPoint.z / unitRayEndZ;
		var newPositionOfGrabbedPoint = raycaster.ray.at(rayLengthToGetZEquallingClickedPointZ);
		newPositionOfGrabbedPoint.worldToLocal(camera);

		var displacement = newPositionOfGrabbedPoint.clone().sub(object.clickedPoint);
		camera.localToWorld(displacement);
		displacement.add(object.parent.getWorldPosition())
		object.parent.updateMatrixWorld();
		object.parent.worldToLocal(displacement);
		object.position.add(displacement);

		object.clickedPoint.copy(newPositionOfGrabbedPoint);
	}

	mouse.updateFromAsyncAndCheckClicks = function()
	{
		this.oldClicking = this.clicking;
		this.clicking = asynchronous.clicking;
		this.justMoved = asynchronous.justMoved;
		asynchronous.justMoved = false;

		if(this.clicking )
		{
			raycaster.setFromCamera( asynchronous.normalizedDevicePosition, camera );

			if( !this.oldClicking )
			{
				var clickableIntersections = raycaster.intersectObjects( clickables );
				if( clickableIntersections[0] )
				{
					var cameraSpaceClickedPoint = clickableIntersections[0].point.clone();
					cameraSpaceClickedPoint.worldToLocal(camera);
					clickableIntersections[0].object.onClick(cameraSpaceClickedPoint);

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