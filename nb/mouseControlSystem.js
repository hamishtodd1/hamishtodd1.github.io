//touch as well! 

function initMouse() 
{
	var asynchronous = {
		normalizedDevicePosition: new THREE.Vector2(), //top right is 1,1, bottom left is -1,-1
		clicking: false,
		justMoved: false,
	};

	mouse = {
		lastClickedObject: null,
		clicking: false,
		oldClicking: false,
		justMoved: false,

		rayCaster: new THREE.Raycaster(), //don't use too much if clicking is not true - touchscreens. There are other ways to do things, and many people will be on phone
	};
	mouse.rayCaster.setFromCamera(asynchronous.normalizedDevicePosition, camera)
	mouse.previousRay = mouse.rayCaster.ray.clone()

	mouse.rayIntersectionWithZPlane = function(z)
	{
		var zPlane = new THREE.Plane(zUnit,-z)
		return mouse.rayCaster.ray.intersectPlane(zPlane)
	}

	mouse.rotateObjectByGesture = function(object)
	{
		var rotationAmount = mouse.rayCaster.ray.direction.angleTo(mouse.previousRay.direction) * 2
		// console.log(mouse.rayCaster.ray.direction,mouse.previousRay.direction)
		if(rotationAmount === 0)
		{
			return
		}
		var rotationAxis = mouse.rayCaster.ray.direction.clone().cross(mouse.previousRay.direction);
		rotationAxis.applyQuaternion(object.quaternion.clone().inverse()).normalize();
		object.quaternion.multiply(new THREE.Quaternion().setFromAxisAngle(rotationAxis, rotationAmount))
	}

	mouse.updateFromAsyncAndCheckClicks = function()
	{
		this.oldClicking = this.clicking;
		this.clicking = asynchronous.clicking;
		this.justMoved = asynchronous.justMoved;
		asynchronous.justMoved = false;

		mouse.previousRay.copy(mouse.rayCaster.ray);
		mouse.rayCaster.setFromCamera( asynchronous.normalizedDevicePosition, camera );

		var intersections = mouse.rayCaster.intersectObjects( clickables ); //we're changing the name of that...
		if( intersections.length !== 0 )
		{
			if(this.clicking )
			{
				if( !this.oldClicking )
				{
					this.lastClickedObject = intersections[0].object;
					if( intersections[0].object.onClick )
					{
						intersections[0].object.onClick(intersections[0]);
					}
				}
			}
		}
		else
		{
			if(this.clicking )
			{
				if( !this.oldClicking )
				{
					this.lastClickedObject = null;
				}
			}
		}
	}

	var currentRawX = 0;
	var currentRawY = 0;
	document.addEventListener( 'mousemove', function(event)
	{
		event.preventDefault();
		updateNormalizedDevicePosition(event.clientX,event.clientY)
	}, false );

	function updateNormalizedDevicePosition(clientX,clientY)
	{
		//for some bizarre reason this can be called more than once with the same values
		if(clientX !== currentRawX || clientY !== currentRawY)
		{
			asynchronous.justMoved = true;

			asynchronous.normalizedDevicePosition.x = ( clientX / window.innerWidth  ) * 2 - 1;
			asynchronous.normalizedDevicePosition.y =-( clientY / window.innerHeight ) * 2 + 1;

			currentRawX = clientX;
			currentRawY = clientY;
		}
	}

	/*
		Array of pictures and videos of her that you can click on and they appear and with pictures automatically zoom
		zooming in and out
	*/

	document.addEventListener( 'mousedown', function(event) 
	{
		asynchronous.clicking = true;
	}, false );
	document.addEventListener( 'mouseup', function(event) 
	{
		asynchronous.clicking = false;
	}, false );

	document.addEventListener( 'touchmove', function( event )
	{
		updateNormalizedDevicePosition(event.changedTouches[0].clientX,event.changedTouches[0].clientY)
	}, false);
	document.addEventListener( 'touchstart', function(event)
	{
		asynchronous.clicking = true;
		updateNormalizedDevicePosition(event.changedTouches[0].clientX,event.changedTouches[0].clientY)
	}, false );
	document.addEventListener( 'touchend', function(event)
	{
		asynchronous.clicking = false;
	}, false );
}