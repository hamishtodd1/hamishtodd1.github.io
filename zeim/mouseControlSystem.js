//control disappears when you start recording, probably due to keyboard crap. Irrelevant

function initMouse(renderer, clickables,grabbables, monitorer)
{
	var asynchronous = {
		normalizedDevicePosition: new THREE.Vector2(),
		clicking: false,
		updateNormalizedDevicePosition: function(rawX,rawY)
		{
			this.normalizedDevicePosition.x = ( rawX / window.innerWidth  ) * 2 - 1;
			this.normalizedDevicePosition.y =-( rawY / window.innerHeight ) * 2 + 1;
		}
	};

	var mouse = {
		clicking:false
	};
	var raycaster = new THREE.Raycaster();

	var grabbedObject = null; 
	var grabbedPoint = null;
	var grabPlaneDistance = -1;

	mouse.updateFromAsyncAndMoveGrabbedObjects = function()
	{
		this.oldClicking = this.clicking;
		this.clicking = asynchronous.clicking;

		// if(this.clicking)
		// 	camera.rotation.y += TAU/100
		// camera.updateMatrix();
		
		raycaster.setFromCamera( asynchronous.normalizedDevicePosition, camera );

		if(grabbedObject)
		{
			//may want to do various things eg keep a thing on the surface of a sphere
			var newRayPlaneDistanceFromCamera = raycaster.ray.direction.clone().projectOnVector( getCameraLoookingDirection() ).length();
			var newGrabbedPoint = raycaster.ray.direction.clone().setLength(grabPlaneDistance/newRayPlaneDistanceFromCamera).add(camera.position);

			grabbedObject.position.sub(grabbedPoint).add(newGrabbedPoint);
			if(grabbedObject.postDragFunction)
			{
				grabbedObject.postDragFunction(grabbedPoint);
			}

			grabbedPoint.copy(newGrabbedPoint);
		}

		if( this.clicking && !this.oldClicking )
		{
			var clickableIntersections = raycaster.intersectObjects( clickables );
			var grabbableIntersections = raycaster.intersectObjects( grabbables );
			var clickableCloser = -1;
			if( clickableIntersections[0] && grabbableIntersections[0] )
			{
				if( clickableIntersections[0].point.distanceTo(camera.position) <
					grabbableIntersections[0].point.distanceTo(camera.position) )
				{
					clickableCloser = 1;
				}
				else
				{
					clickableCloser = 0;
				}
			}

			if( (clickableIntersections[0] && !grabbableIntersections[0]) || clickableCloser === 1 )
			{
				clickableIntersections[0].object.onClick(clickableIntersections[0].point);
			}
			if( (grabbableIntersections[0] && !clickableIntersections[0]) || clickableCloser === 0 )
			{
				grabbedObject = grabbableIntersections[0].object;
				grabbedPoint = grabbableIntersections[0].point;

				var cameraToGrabbedPointPlane = raycaster.ray.direction.clone().setLength( grabbableIntersections[0].distance )
				cameraToGrabbedPointPlane.projectOnVector( getCameraLoookingDirection() ); //possibly no negate
				grabPlaneDistance = cameraToGrabbedPointPlane.length();

				if(monitorer.playing)
				{
					monitorer.togglePlaying();
				}
			}
		}

		if(!this.clicking )
		{
			grabbedObject = null;
			grabbedPoint = null;
			grabPlaneDistance = -1;
		}
	}

	document.addEventListener( 'mousemove', function(event)
	{
		event.preventDefault();
		asynchronous.updateNormalizedDevicePosition(event.clientX,event.clientY);
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