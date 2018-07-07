function initMouse()
{
	{
		var coneHeight = 0.06;
		var coneRadius = coneHeight * 0.4;
		var cursorGeometry = new THREE.ConeGeometry(coneRadius, coneHeight,31);
		cursorGeometry.computeFaceNormals();
		cursorGeometry.computeVertexNormals();
		cursorGeometry.merge( new THREE.CylinderGeometry(coneRadius / 4, coneRadius / 4, coneHeight / 2, 31 ), (new THREE.Matrix4()).makeTranslation(0, -coneHeight/2, 0) );
		cursorGeometry.applyMatrix( (new THREE.Matrix4()).makeTranslation(0, -coneHeight / 2, 0) );
		cursorGeometry.applyMatrix( (new THREE.Matrix4()).makeRotationZ(TAU/16) );
		var cursor = new THREE.Mesh( cursorGeometry, new THREE.MeshPhongMaterial(
		{
			color:0xCCCCCC,
			transparent:true,
			opacity:0.001
		}))
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

		var intersections = mouse.rayCaster.intersectObjects( mouseables ); //we're changing the name of that...
		if( intersections.length !== 0 )
		{
			if(this.clicking )
			{
				if( !this.oldClicking )
				{
					this.lastClickedObject = intersections[0].object;
					if( intersections[0].object.onClick )
					{
						intersections[0].object.onClick(intersections[0].point);
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