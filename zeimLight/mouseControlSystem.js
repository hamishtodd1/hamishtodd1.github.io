/*
	intersectObjects may need to be recursive.
		But then you need to make it so the object grabbed is the parent
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

	var asynchronous = {
		clicking: false,
		rightClicking:false,
		justMoved: false,

		normalizedDevicePosition: new THREE.Vector2(), //top right is 1,1, bottom left is -1,-1
	};

	mouse = {
		clicking: false,
		rightClicking: false,
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
		return mouse.rayCaster.ray.intersectPlane(zPlane,new THREE.Vector3())
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

	var clickedPoint = new THREE.Vector3();
	var toyBeingArranged = null;
	mouse.updateFromAsyncAndCheckClicks = function()
	{
		this.oldClicking = this.clicking;
		this.clicking = asynchronous.clicking
		this.oldRightClicking = this.rightClicking;
		this.rightClicking = asynchronous.rightClicking;

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

		if( this.rightClicking )
		{
			if( !this.oldRightClicking )
			{
				var intersections = mouse.rayCaster.intersectObjects( toysToBeArranged );

				if( intersections.length !== 0 )
				{
					toyBeingArranged = intersections[0].object;
					clickedPoint.copy( intersections[0].point )
				}
			}
			else
			{
				if(toyBeingArranged !== null)
				{
					var newClickedPoint = this.rayIntersectionWithZPlane(clickedPoint.z)
					toyBeingArranged.position.sub(clickedPoint).add(newClickedPoint)
					clickedPoint.copy(newClickedPoint)
				}
			}
		}
		else
		{
			toyBeingArranged = null;
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
		if(event.which === 1)
		{
			asynchronous.clicking = true;
		}
		if(event.which === 3)
		{
			asynchronous.rightClicking = true;
		}
	}, false );
	document.addEventListener( 'mouseup', function(event) 
	{
		if(event.which === 1)
		{
			asynchronous.clicking = false;
		}
		if(event.which === 3)
		{
			asynchronous.rightClicking = false;
		}
	}, false );

	document.addEventListener('contextmenu', function(event)
	{
	    event.preventDefault()
	}, false);
}

/*
	Array of pictures and videos of her that you can click on and they appear and with pictures automatically zoom
	zooming in and out
*/