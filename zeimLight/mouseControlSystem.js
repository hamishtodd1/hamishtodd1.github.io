function initMouse()
{
	{
		var coneHeight = 0.13;
		var coneRadius = coneHeight * 0.4;
		var cursorGeometry = new THREE.ConeGeometry(coneRadius, coneHeight,31);
		cursorGeometry.computeFaceNormals();
		cursorGeometry.computeVertexNormals();
		cursorGeometry.merge( new THREE.CylinderGeometry(coneRadius / 4, coneRadius / 4, coneHeight / 2, 31 ), (new THREE.Matrix4()).makeTranslation(0, -coneHeight/2, 0) );
		cursorGeometry.applyMatrix( (new THREE.Matrix4()).makeTranslation(0, -coneHeight / 2, 0) );
		cursorGeometry.applyMatrix( (new THREE.Matrix4()).makeRotationZ(TAU/16) );
		var cursor = new THREE.Mesh(
				cursorGeometry, 
				new THREE.MeshPhongMaterial({color:0xCCCCCC })
		)
		cursor.castShadow = true;
		scene.add(cursor)

		objectsToBeUpdated.push(cursor)
		cursor.update = function()
		{
			this.position.copy(mouse.rayIntersectionWithZPlane(0))
		}
		// window.addEventListener( 'resize', function(){console.log(cursor.position)}, false );
	}

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
	mouse.previousRay = mouse.rayCaster.ray.clone()

	mouse.rayIntersectionWithZPlane = function(z)
	{
		var zPlane = new THREE.Plane(zUnit,-z)
		return mouse.rayCaster.ray.intersectPlane(zPlane)
	}

	mouse.updateFromAsyncAndCheckClicks = function()
	{
		this.oldClicking = this.clicking;
		this.clicking = asynchronous.clicking;
		this.justMoved = asynchronous.justMoved;
		asynchronous.justMoved = false;

		mouse.previousRay.copy(mouse.rayCaster.ray);
		mouse.rayCaster.setFromCamera( asynchronous.normalizedDevicePosition, camera );

		if(this.clicking )
		{
			if( !this.oldClicking )
			{
				//not working for a mesh? Check for infinities
				var clickableIntersections = mouse.rayCaster.intersectObjects( clickables );
				if( clickableIntersections.length !== 0 )
				{
					var cameraSpaceClickedPoint = clickableIntersections[0].point.clone();
					cameraSpaceClickedPoint.worldToLocal(camera);
					if( clickableIntersections[0].object.onClick )
					{
						clickableIntersections[0].object.onClick(cameraSpaceClickedPoint,clickableIntersections[0].point);
					}

					this.lastClickedObject = clickableIntersections[0].object;
				}
				else
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
		//for some bizarre reason this can be called more than once with the same values
		if(event.clientX !== currentRawX || event.clientY !== currentRawY)
		{
			asynchronous.justMoved = true;

			asynchronous.normalizedDevicePosition.x = ( event.clientX / window.innerWidth  ) * 2 - 1;
			asynchronous.normalizedDevicePosition.y =-( event.clientY / window.innerHeight ) * 2 + 1;

			currentRawX = event.clientX;
			currentRawY = event.clientY;
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
}

/*
	Array of pictures and videos of her that you can click on and they appear and with pictures automatically zoom
	zooming in and out
*/