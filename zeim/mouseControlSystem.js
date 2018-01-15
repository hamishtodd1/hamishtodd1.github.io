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
		if( mouse.lastClickedObject === this && mouse.clicking )
		{
			mouse.applyDrag(this);
		}
		else
		{
			this.clickedPoint = null;
		}
	}
}

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

		if(this.clicking)
		{
			camera.rotation.y += 0.01
		}
		camera.updateMatrixWorld();

		if(this.clicking)
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
function SliderSystem(changeValue, initialValue, clickables, onTrackerGrab, threeDimensional)
{
	if(!onTrackerGrab)
	{
		onTrackerGrab = function(){};
	}

	var sliderSystem = new THREE.Mesh(new THREE.PlaneBufferGeometry(1,1), new THREE.MeshBasicMaterial({color:0xDADADA}));
	sliderSystem.geometry.applyMatrix(new THREE.Matrix4().makeTranslation(0.5,0,0))
	sliderSystem.onClick = function(cameraSpaceClickedPoint)
	{
		var localGrabbedPoint = cameraSpaceClickedPoint.clone();
		camera.localToWorld(localGrabbedPoint);
		sliderSystem.worldToLocal(localGrabbedPoint);

		tracker.position.x = localGrabbedPoint.x;
		changeValue( tracker.position.x );

		tracker.clickedPoint = cameraSpaceClickedPoint;
	}
	clickables.push(sliderSystem);

	var tracker = new THREE.Mesh(
		new THREE.CylinderBufferGeometry(1,1,1,32), 
		new THREE.MeshBasicMaterial({color:0x298AF1, /*transparent:true, opacity:1*/}));
	tracker.geometry.applyMatrix(new THREE.Matrix4().makeRotationX(TAU/4))
	tracker.position.x = initialValue;
	changeValue(tracker.position.x);
	tracker.clickedPoint = null;
	tracker.onClick = function(cameraSpaceClickedPoint)
	{
		this.clickedPoint = cameraSpaceClickedPoint;
		onTrackerGrab();
	}
	clickables.push(tracker)
	sliderSystem.add(tracker);

	sliderSystem.update = function()
	{
		if( ( mouse.lastClickedObject === tracker || mouse.lastClickedObject === sliderSystem ) && mouse.clicking )
		{
			mouse.applyDrag(tracker);
			tracker.position.set(clamp(tracker.position.x,0,1), 0,0);
			changeValue(tracker.position.x);
		}
		else
		{
			tracker.clickedPoint = null;
		}
	}

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

	return sliderSystem;
}