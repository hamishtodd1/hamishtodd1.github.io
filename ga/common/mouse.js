/*
	intersectObjects may need to be recursive.
		But then you need to make it so the object grabbed is the parent

	simulation would be nice
*/

THREE.Raycaster.prototype.updateFromClientCoordinates = function (clientX, clientY)
{
	let ndc = new THREE.Vector2()
	ndc.x = (clientX / window.innerWidth) * 2 - 1;
	ndc.y = -(clientY / window.innerHeight) * 2 + 1;

	this.setFromCamera(ndc, camera)

	delete ndc
}

function initMouse() 
{
	let asynchronous = {
		clicking: false,

		raycaster: new THREE.Raycaster(), //top right is 1,1, bottom left is -1,-1
	};
	asynchronous.raycaster.setFromCamera(new THREE.Vector2(), camera)

	let lastClickedObject = null

	mouse = {
		clicking: false,
		oldClicking: false,
		oldRightClicking: false,

		//don't use too much if clicking is not true - touchscreens. There are other ways to do things, and many people will be on phone
		raycaster: new THREE.Raycaster(),
		oldRaycaster: new THREE.Raycaster(),
	};
	mouse.raycaster.ray.copy(asynchronous.raycaster.ray)
	mouse.oldRaycaster.ray.copy( mouse.raycaster.ray)

	mouse.rotateObjectByGesture = function(object)
	{
		let rotationAmount = mouse.raycaster.ray.direction.angleTo(mouse.oldRaycaster.ray.direction) * 35.
		// console.log(mouse.raycaster.ray.direction,mouse.oldRaycaster.ray.direction)
		if(rotationAmount === 0.)
			return
			
		let rotationAxis = mouse.raycaster.ray.direction.clone().cross(mouse.oldRaycaster.ray.direction);
		rotationAxis.applyQuaternion(object.quaternion.clone().inverse()).normalize();
		object.quaternion.multiply(new THREE.Quaternion().setFromAxisAngle(rotationAxis, rotationAmount))
	}

	mouse.getZZeroPosition = (target) => mouse.raycaster.intersectZPlane(0., target)

	mouse.justMoved = () => !mouse.raycaster.ray.equals(mouse.oldRaycaster.ray)

	mouse.updateFromAsyncAndCheckClicks = function()
	{
		this.oldClicking = this.clicking;
		this.clicking = asynchronous.clicking

		if(this.oldClicking && !this.clicking && lastClickedObject !== null && lastClickedObject.onNotClicking !== undefined )
			lastClickedObject.onNotClicking()

		mouse.oldRaycaster.ray.copy(mouse.raycaster.ray);
		mouse.raycaster.ray.copy( asynchronous.raycaster.ray );
		
		if( this.clicking && !this.oldClicking )
		{
			let intersections = mouse.raycaster.intersectObjects( clickables );

			if( intersections.length !== 0 )
			{
				console.assert(checkIfObjectIsInScene(intersections[0].object))
				intersections[0].object.onClick(intersections[0]);
				lastClickedObject = intersections[0].object
			}
			else
				lastClickedObject = null
		}
	}

	{
		let currentRawX = 0;
		let currentRawY = 0;

		document.addEventListener( 'mousemove', function(event)
		{
			event.preventDefault();
			//for some bizarre reason this can be called more than once with the same values
			if(event.clientX !== currentRawX || event.clientY !== currentRawY)
			{
				asynchronous.raycaster.updateFromClientCoordinates(event.clientX,event.clientY)

				currentRawX = event.clientX;
				currentRawY = event.clientY;
			}
		}, false );

		document.addEventListener('contextmenu', function(event) { event.preventDefault() }, false);

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