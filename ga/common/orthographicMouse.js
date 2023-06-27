function initMouse() 
{
	let asynchronous = {
		clicking: false,
		rightClicking:false,

        coords:new THREE.Vector2(),
	}
    function updateFromClientCoords(clientX,clientY) {
        asynchronous.coords.x = (clientX / window.innerWidth) * 2. - 1.
        asynchronous.coords.y = -(clientY / window.innerHeight) * 2. + 1.
    }

	onClicks = []
	mouse = {
		clicking: false,
		oldClicking: false,
		oldRightClicking: false,

        coords: new THREE.Vector2(),
        oldCoords: new THREE.Vector2(),
        delta: new THREE.Vector2()
	}

    mouse.getZZeroPosition = (target) => {
        target.z = 0.
        target.x = asynchronous.coords.x * camera.right
        target.y = asynchronous.coords.y * camera.top

        return target
    }

	mouse.justMoved = () => !mouse.raycaster.ray.equals(mouse.oldRaycaster.ray)

	let currentClick = null

	mouse.updateFromAsyncAndCheckClicks = function()
	{
		this.oldClicking = this.clicking;
		this.clicking = asynchronous.clicking
		this.oldRightClicking = this.rightClicking
		this.rightClicking = asynchronous.rightClicking

        mouse.oldCoords.copy(mouse.coords)
        mouse.coords.copy(asynchronous.coords)
        mouse.delta.copy(mouse.coords).sub(mouse.oldCoords)

		// if(this.clicking && !this.oldClicking ) {
		// 	let topZ = -Infinity
		// 	currentClick = null
		// 	onClicks.forEach((onClick)=> {
		// 		let z = onClick.z()
		// 		if(z > topZ) {
		// 			topZ = z
		// 			currentClick = onClick
		// 		}
		// 	})

		// 	if (currentClick !== null && currentClick.start !== undefined) {
		// 		currentClick.start()
		// 		if (currentClick.during === undefined && currentClick.end === undefined)
		// 			currentClick = null
		// 	}
		// }
		
		// if(this.clicking && currentClick !== null && currentClick.during !== undefined)
		// 	currentClick.during()
		// if (!this.clicking ) {
		// 	if (currentClick !== null && currentClick.end !== undefined)
		// 		currentClick.end()
		// 	currentClick = null
		// }
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

		document.addEventListener( 'mousemove', function(event) {
			event.preventDefault();
			//for some bizarre reason this can be called more than once with the same values
			if(event.clientX !== currentRawX || event.clientY !== currentRawY) {
				updateFromClientCoords(event.clientX,event.clientY)

				currentRawX = event.clientX;
				currentRawY = event.clientY;
			}
		}, false );

		document.addEventListener('mousedown', function (event)  {
			asynchronous.clicking = true
			updateFromClientCoords(event.clientX, event.clientY)
		}, false);
		document.addEventListener('mouseup', function (event)  {
			asynchronous.clicking = false
		}, false);

		document.addEventListener('contextmenu', (event) => event.preventDefault(), false);
	}

	//todo buggy with multiple touches
	{
		document.addEventListener( 'touchstart', function(event) {
			event.preventDefault();

			asynchronous.clicking = true;

			updateFromClientCoords(event.changedTouches[0].clientX,event.changedTouches[0].clientY)
		}, { passive: false } );
		document.addEventListener( 'touchmove', function( event ) {
			event.preventDefault();

			//apparently this can come even if touch has ended
			updateFromClientCoords(event.changedTouches[0].clientX,event.changedTouches[0].clientY)
		}, { passive: false } );
		document.addEventListener( 'touchend', function(event) {
			event.preventDefault();

			asynchronous.clicking = false;
		}, false );
	}
}