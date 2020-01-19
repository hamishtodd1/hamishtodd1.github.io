/*
	intersectObjects may need to be recursive.
		But then you need to make it so the object grabbed is the parent

	simulation would be nice
*/

function initMouse() 
{
	{
		var coneHeight = 0.05;
		var coneRadius = coneHeight * 0.4;
		var cursorGeometry = new THREE.ConeGeometry(coneRadius, coneHeight,31);
		cursorGeometry.computeFaceNormals();
		cursorGeometry.computeVertexNormals();
		cursorGeometry.merge( new THREE.CylinderGeometry(coneRadius / 4, coneRadius / 4, coneHeight / 2, 31 ), (new THREE.Matrix4()).makeTranslation(0, -coneHeight/2, 0) );
		cursorGeometry.applyMatrix( (new THREE.Matrix4()).makeTranslation(0, -coneHeight / 2, 0) );
		cursorGeometry.applyMatrix( (new THREE.Matrix4()).makeRotationZ(TAU/16) );
		var cursor = new THREE.Mesh( cursorGeometry, new THREE.MeshPhongMaterial(
		{
			color:0xFFFFFF,
			// transparent:true,
			// opacity:0.001
		}))
		cursor.scale.z *= 0.01
		cursor.castShadow = true;
		// scene.add(cursor)

		updateFunctions.push( function()
		{
			cursor.position.copy(mouse.rayIntersectionWithZPlane(0))
		})
		// window.addEventListener( 'resize', function(){console.log(cursor.position)}, false );
	}

	let asynchronous = {
		clicking: false,
		justMoved: false,

		normalizedDevicePosition: new THREE.Vector2(), //top right is 1,1, bottom left is -1,-1
	};

	mouse = {
		clicking: false,
		oldClicking: false,
		oldRightClicking: false,
		justMoved: false,

		lastClickedObject: null,
		lastRightClickedObject:null,

		//don't use too much if clicking is not true - touchscreens. There are other ways to do things, and many people will be on phone
		rayCaster: new THREE.Raycaster(),

		zZeroPosition: new THREE.Vector3(),
		oldZZeroPosition: new THREE.Vector3()
	};
	mouse.rayCaster.setFromCamera(asynchronous.normalizedDevicePosition, camera)
	mouse.previousRay = mouse.rayCaster.ray.clone()

	mouse.rayIntersectionWithZPlane = function(z)
	{
		var zPlane = new THREE.Plane(zUnit,-z)
		let ret = mouse.rayCaster.ray.intersectPlane(zPlane,new THREE.Vector3())
		return ret
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

	// mouse.simulate = function(positionToClickAt)
	// {
	// 	mouse.
	// }

	var clickedPoint = new THREE.Vector3();
	mouse.updateFromAsyncAndCheckClicks = function()
	{
		this.oldClicking = this.clicking;
		this.clicking = asynchronous.clicking

		this.justMoved = asynchronous.justMoved;
		asynchronous.justMoved = false;

		mouse.previousRay.copy(mouse.rayCaster.ray);
		mouse.rayCaster.setFromCamera( asynchronous.normalizedDevicePosition, camera );

		mouse.oldZZeroPosition.copy( mouse.zZeroPosition )
		mouse.zZeroPosition.copy(this.rayIntersectionWithZPlane(0))

		//"whileClicking"? Naaaaah, "update" keeps things in once place
		//deffo need onHover
		
		if( this.clicking && !this.oldClicking )
		{
			var intersections = mouse.rayCaster.intersectObjects( clickables );

			if( intersections.length !== 0 )
			{
				this.lastClickedObject = intersections[0].object;
				if( intersections[0].object.onClick )
				{
					intersections[0].object.onClick(intersections[0]);
				}
			}
			else
			{
				this.lastClickedObject = null;
			}
		}
	}

	function updateNdc(clientX,clientY)
	{
		asynchronous.normalizedDevicePosition.x = ( clientX / window.innerWidth  ) * 2 - 1;
		asynchronous.normalizedDevicePosition.y =-( clientY / window.innerHeight ) * 2 + 1;
	}

	var currentRawX = 0;
	var currentRawY = 0;

	{
		document.addEventListener( 'mousemove', function(event)
		{
			event.preventDefault();
			//for some bizarre reason this can be called more than once with the same values
			if(event.clientX !== currentRawX || event.clientY !== currentRawY)
			{
				asynchronous.justMoved = true;

				updateNdc(event.clientX,event.clientY)

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
			updateNdc(event.clientX,event.clientY)
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

			updateNdc(event.changedTouches[0].clientX,event.changedTouches[0].clientY)
		}, { passive: false } );
		document.addEventListener( 'touchmove', function( event )
		{
			event.preventDefault();

			//apparently this can come even if touch has ended
			updateNdc(event.changedTouches[0].clientX,event.changedTouches[0].clientY)
		}, { passive: false } );
		document.addEventListener( 'touchend', function(event)
		{
			event.preventDefault();

			asynchronous.clicking = false;
		}, false );
	}
}