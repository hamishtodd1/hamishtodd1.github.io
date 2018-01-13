function initMouse(renderer, clickables,monitorer)
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

	var raycaster = new THREE.Raycaster();
	var mouse = {
		lastClickedObject: null,
		clicking: false,
		oldClicking: false
	};

	//grabbedPoint is world space!
	mouse.applyDrag = function( object )
	{
		console.assert(this.clicking)

		var dragPlaneDistanceFromCamera = cameraZPlaneDistance(object.grabbedPoint)
		var distanceFromCameraOfPlaneContainingCurrentUnitRayEnd = cameraZPlaneDistance(raycaster.ray.at(1))
		var lengthRatio = dragPlaneDistanceFromCamera / distanceFromCameraOfPlaneContainingCurrentUnitRayEnd;
		console.log(lengthRatio)
		var newPositionOfGrabbedPoint = raycaster.ray.at(lengthRatio);
		
		var displacement = newPositionOfGrabbedPoint.clone().sub(object.grabbedPoint);
		displacement.add(object.parent.getWorldPosition())
		object.parent.updateMatrixWorld();
		object.parent.worldToLocal(displacement);
		object.position.add(displacement);

		object.grabbedPoint.copy(newPositionOfGrabbedPoint);
		//note this can mean the point is not on the object. Can be good
	}

	mouse.updateFromAsyncAndCheckClicks = function()
	{
		this.oldClicking = this.clicking;
		this.clicking = asynchronous.clicking;

		if(this.clicking)
		{
			if(this.clicking)
			{
				camera.rotation.y += 0.01
			}
			camera.updateMatrix();
			
			raycaster.setFromCamera( asynchronous.normalizedDevicePosition, camera );

			if( !this.oldClicking )
			{
				var clickableIntersections = raycaster.intersectObjects( clickables );
				if( clickableIntersections[0] )
				{
					clickableIntersections[0].object.onClick(clickableIntersections[0].point);
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

//vibration if you drag it off the side would be good
function SliderSystem(onValueChange, initialValue, clickables, onTrackerGrab, threeDimensional)
{
	if(!onTrackerGrab)
	{
		onTrackerGrab = function(){};
	}

	var sliderSystem = new THREE.Mesh(new THREE.PlaneBufferGeometry(1,1), new THREE.MeshBasicMaterial({color:0xDADADA}));
	sliderSystem.geometry.applyMatrix(new THREE.Matrix4().makeTranslation(0.5,0,0))
	sliderSystem.onClick = function(grabbedPoint)
	{
		var localGrabbedPoint = grabbedPoint.clone();
		sliderSystem.worldToLocal(localGrabbedPoint);

		tracker.position.x = localGrabbedPoint.x;
		onValueChange( tracker.position.x );

		tracker.grabbedPoint = grabbedPoint;
	}
	clickables.push(sliderSystem);

	var tracker = new THREE.Mesh(new THREE.CylinderBufferGeometry(1,1,1,32), new THREE.MeshBasicMaterial({color:0x298AF1}));
	tracker.geometry.applyMatrix(new THREE.Matrix4().makeRotationX(TAU/4))
	tracker.position.x = initialValue;
	onValueChange(tracker.position.x);
	tracker.grabbedPoint = null;
	tracker.onClick = function(grabbedPoint)
	{
		tracker.grabbedPoint = grabbedPoint;
		onTrackerGrab();
	}
	clickables.push(tracker)
	sliderSystem.add(tracker);

	sliderSystem.setDimensions = function(length, height)
	{
		sliderSystem.scale.set(length,height,1);
		var trackerRadius = height * 0.8;
		tracker.scale.set( trackerRadius / length, trackerRadius / height,trackerRadius / height * 0.00001);
	}

	sliderSystem.setValue = function(trackerPositionX)
	{
		tracker.position.x = trackerPositionX;
	}

	var zanyLimits = false; //could also have it vibrate

	sliderSystem.update = function()
	{
		if( ( mouse.lastClickedObject === tracker || mouse.lastClickedObject === sliderSystem ) && mouse.clicking )
		{
			mouse.applyDrag(tracker);

			if(!zanyLimits)
			{
				tracker.position.set(clamp(tracker.position.x,0,1), 0,0);
			}
			else
			{
				tracker.position.y = 0;
				tracker.position.z = 0;
				if(tracker.position.x < 0 || tracker.position.x > 1 )
				{
					var parentSpaceTrackerPosition = tracker.getWorldPosition();
					this.parent.worldToLocal(parentSpaceTrackerPosition);
					this.position.copy(parentSpaceTrackerPosition)
					if(tracker.position.x > 1 )
					{
						this.position.x -= this.scale.x;
					}
					tracker.position.x = clamp(tracker.position.x,0,1);
				}
			}

			onValueChange(tracker.position.x);
		}
		else
		{
			tracker.grabbedPoint = null;
		}
	}

	return sliderSystem;
}