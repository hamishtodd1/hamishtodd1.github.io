/*
	intersectObjects may need to be recursive.
		But then you need to make it so the object grabbed is the parent

	simulation would be nice
*/

THREE.Raycaster.prototype.updateFromClientCoordinates = function (clientX, clientY)
{
	v1.z = 0.
	v1.x = (clientX / window.innerWidth) * 2 - 1;
	v1.y = -(clientY / window.innerHeight) * 2 + 1;

	this.setFromCamera(v1, camera)
}

function initMouse() 
{
	let asynchronous = {
		clicking: false,
		rightClicking:false,

		raycaster: new THREE.Raycaster(), //top right is 1,1, bottom left is -1,-1
	};
	asynchronous.raycaster.setFromCamera(new THREE.Vector2(), camera)

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

	mouse.getZZeroPosition = (target) => {
		if(target === undefined)
			console.error("target needed")
		return mouse.raycaster.intersectZPlane(0., target)
	}

	mouse.justMoved = () => !mouse.raycaster.ray.equals(mouse.oldRaycaster.ray)

	let currentClick = null

	mouse.updateFromAsyncAndCheckClicks = function()
	{
		this.oldClicking = this.clicking;
		this.clicking = asynchronous.clicking
		this.oldRightClicking = this.rightClicking
		this.rightClicking = asynchronous.rightClicking

		mouse.oldRaycaster.ray.copy(mouse.raycaster.ray);
		mouse.raycaster.ray.copy( asynchronous.raycaster.ray );

		if(this.clicking && !this.oldClicking ) {
			let topZ = -Infinity
			for(let i = 0; i < onClicks.length; ++i) {
				let z = onClicks[i].z()
				if(z > topZ) {
					topZ = z
					currentClick = onClicks[i]
				}
			}
		}
		
		if(this.clicking && !this.oldClicking && currentClick !== null)
			currentClick.start()
		if(this.clicking && currentClick !== null && currentClick.during !== undefined)
			currentClick.during()
		if (!this.clicking && this.oldClicking && currentClick !== null && currentClick.end !== undefined) {
			currentClick.end()
			currentClick = null	
		}
	}

	mouse.areaIn = function()
	{
		let mouseX = mouse.getZZeroPosition(v1).x
		if (outputColumn.right() < mouseX)
			return "pad"
		else if (outputColumn.left() < mouseX && mouseX < outputColumn.right())
			return "column"
		else
			return "left"
	}

	mouse.isOnDisplayWindow = () => {
		let onDw = false
        displayWindows.forEach((dw) => { if (mouse.checkIfOnScaledUnitSquare(dw)) onDw = true })
        return onDw
    }

	mouse.checkIfOnScaledUnitSquare = function (scaledSquare) {
		mouse.getZZeroPosition(v1)
		scaledSquare.worldToLocal(v1)
		return  -.5 < v1.x && v1.x < .5 &&
				-.5 < v1.y && v1.y < .5
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

		document.addEventListener('mousedown', function (event) 
		{
			if (event.which === 1) asynchronous.clicking = true;
			if (event.which === 3) asynchronous.rightClicking = true;
			asynchronous.raycaster.updateFromClientCoordinates(event.clientX, event.clientY)
		}, false);
		document.addEventListener('mouseup', function (event) 
		{
			if (event.which === 1) asynchronous.clicking = false;
			if (event.which === 3) asynchronous.rightClicking = false;
		}, false);

		document.addEventListener('contextmenu', (event) => event.preventDefault(), false);
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