/*
	intersectObjects may need to be recursive.
		But then you need to make it so the object grabbed is the parent

	simulation would be nice
*/

function initMouse() 
{
	let asynchronous = {
		clicking: false,
		justMoved: false,

		raycaster: new THREE.Raycaster(), //top right is 1,1, bottom left is -1,-1
	};
	asynchronous.raycaster.setFromCamera(new THREE.Vector2(), camera)

	let lastClickedObject = null

	mouse = {
		clicking: false,
		oldClicking: false,
		oldRightClicking: false,
		justMoved: false,

		//don't use too much if clicking is not true - touchscreens. There are other ways to do things, and many people will be on phone
		raycaster: new THREE.Raycaster(),
		oldRay:new THREE.Ray(),

		zZeroPosition: new THREE.Vector3(),
		oldZZeroPosition: new THREE.Vector3()
	};
	mouse.raycaster.ray.copy(asynchronous.raycaster.ray)
	mouse.oldRay.copy( mouse.raycaster.ray)

	mouse.rotateObjectByGesture = function(object)
	{
		var rotationAmount = mouse.raycaster.ray.direction.angleTo(mouse.oldRay.direction) * 2
		// console.log(mouse.raycaster.ray.direction,mouse.oldRay.direction)
		if(rotationAmount === 0)
		{
			return
		}
		var rotationAxis = mouse.raycaster.ray.direction.clone().cross(mouse.oldRay.direction);
		rotationAxis.applyQuaternion(object.quaternion.clone().inverse()).normalize();
		object.quaternion.multiply(new THREE.Quaternion().setFromAxisAngle(rotationAxis, rotationAmount))
	}

	mouse.getZZeroPosition = function(target)
	{
		return mouse.raycaster.intersectZPlane(0.,target)
	}

	mouse.updateFromAsyncAndCheckClicks = function()
	{
		this.oldClicking = this.clicking;
		this.clicking = asynchronous.clicking

		if(this.oldClicking && !this.clicking && lastClickedObject !== null && lastClickedObject.onNotClicking !== undefined )
			lastClickedObject.onNotClicking()

		this.justMoved = asynchronous.justMoved;
		asynchronous.justMoved = false;

		mouse.oldRay.copy(mouse.raycaster.ray);
		mouse.raycaster.ray.copy( asynchronous.raycaster.ray );

		mouse.oldZZeroPosition.copy(mouse.zZeroPosition)
		mouse.getZZeroPosition(mouse.zZeroPosition)
		
		if( this.clicking && !this.oldClicking )
		{
			var intersections = mouse.raycaster.intersectObjects( clickables );

			if( intersections.length !== 0 )
			{
				if(!checkIfObjectIsInScene(intersections[0].object))
					console.error("yeah, this is possible")
				intersections[0].object.onClick(intersections[0]);
				lastClickedObject = intersections[0].object
			}
			else
				lastClickedObject = null
		}
	}

	{
		var currentRawX = 0;
		var currentRawY = 0;

		document.addEventListener( 'mousemove', function(event)
		{
			event.preventDefault();
			//for some bizarre reason this can be called more than once with the same values
			if(event.clientX !== currentRawX || event.clientY !== currentRawY)
			{
				asynchronous.justMoved = true;

				asynchronous.raycaster.updateFromClientCoordinates(event.clientX,event.clientY)

				currentRawX = event.clientX;
				currentRawY = event.clientY;
			}
		}, false );

		document.addEventListener('contextmenu', function(event)
		{
			event.preventDefault()
		}, false);

		document.addEventListener( 'mousedown', function(event) 
		{
			asynchronous.clicking = true;
			asynchronous.raycaster.updateFromClientCoordinates(event.clientX,event.clientY)
		}, false );
		document.addEventListener( 'mouseup', function(event) 
		{
			asynchronous.clicking = false;
		}, false );
	}

	//todo buggy with multiple touches
	{
		document.addEventListener( 'touchstart', function(event)
		{
			event.preventDefault();

			asynchronous.clicking = true;

			asynchronous.raycaster.updateFromClientCoordinates(event.changedTouches[0].clientX,event.changedTouches[0].clientY)
		}, { passive: false } );
		document.addEventListener( 'touchmove', function( event )
		{
			event.preventDefault();

			//apparently this can come even if touch has ended
			asynchronous.raycaster.updateFromClientCoordinates(event.changedTouches[0].clientX,event.changedTouches[0].clientY)
		}, { passive: false } );
		document.addEventListener( 'touchend', function(event)
		{
			event.preventDefault();

			asynchronous.clicking = false;
		}, false );
	}
}