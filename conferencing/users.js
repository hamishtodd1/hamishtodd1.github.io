//They probably need a little reticule on their screen
//they also don't have a floor, allowing them to "zoom out" eg move far away from it
//in principle can be defined simply by rotation x and y.
//forget about tablet for a bit, that'll be pinch to zoom
//probably laser is invisible when mouse is down

function initUserManager(controllers)
{
	var userManager = {};

	var headWidth = 0.3;
	var headHeight = 0.2;
	var headDepth = 0.03;

	var baseHead = new THREE.Mesh(new THREE.BoxBufferGeometry(headWidth,headHeight,headDepth), new THREE.MeshBasicMaterial() );

	var eye = new THREE.Mesh(new THREE.CircleBufferGeometry(0.05,32), new THREE.MeshBasicMaterial({color:0xFFFFFF}));
	eye.add( new THREE.Mesh(new THREE.CircleBufferGeometry(0.02,32), new THREE.MeshBasicMaterial({color:0x000000})) );
	eye.children[0].position.z = 0.001;
	var rightEye = eye.clone();
	var leftEye = eye.clone();
	leftEye.position.set( -headWidth / 4, 0, headDepth * 0.51);
	rightEye.position.set( headWidth / 4, 0, headDepth * 0.51);
	baseHead.add(leftEye,rightEye);

	var pointer = new THREE.Mesh( new THREE.CylinderBufferGeometryUncentered(0.015,0.08), new THREE.MeshStandardMaterial({color:0x000000}) );
	// pointer.add( new THREE.Mesh( new THREE.CylinderBufferGeometryUncentered(0.005, 3), new THREE.MeshBasicMaterial({transparent:true,opacity:0.2}) ) );

	var copyEverything = function(copyTo,copyFrom)
	{
		copyTo.head.position.copy(copyFrom.head.position);
		copyTo.head.rotation.copy(copyFrom.head.rotation);

		if( copyFrom.platform === "desktopVR")
		{
			for(var i = 0; i < 2; i++)
			{
				copyTo.controllers[i].position.copy(copyFrom.controllers[i].position);
				copyTo.controllers[i].rotation.copy(copyFrom.controllers[i].rotation);
			}
		}
		else
		{
			copyTo.pointer.rotation.copy( copyFrom.pointer.rotation );
		}
	}

	userManager.updateSomeUser = function(updatePackage)
	{
		copyEverything(users[updatePackage.id],updatePackage)
	}
	socket.on('userUpdate', userManager.updateSomeUser);

	var ourUpdatePackage = {
		head:{
			position: camera.position,
			rotation: camera.rotation,
		},
		platform: platform
	};
	if( platform === "desktopVR")
	{
		ourUpdatePackage.controllers = controllers;
	}
	else
	{
		ourUpdatePackage.pointer = {rotation: {x:0,y:0, z:0}};
	}

	userManager.sendOurData = function()
	{
		var ourUpdatePackage = {
			head:{
				position: camera.position,
				rotation: camera.rotation,
			},
			platform: platform
		};
		if( platform === "desktopVR")
		{
			ourUpdatePackage.controllers = [{},{}];
		}
		else
		{
			ourUpdatePackage.pointer = {rotation: {x:0,y:0, z:0}};
		}

		socket.emit('userUpdate', updatePackage)
	}

	/*
		only the molecule moving from a given person's point of view?
		But then they sort of lose the ability to say "up" and stuff like that?
	*/
	socket.on('newUser', function(msg)
	{
		users[msg] = new THREE.Object3D();
		users[msg].head = new THREE.Mesh(headGeometry.clone())
	})

	userManager.User = function(platform, id)
	{
		var user = new THREE.Object3D();
		user.id = id;
		user.platform = platform;
		scene.add(user);

		var userMaterial = new THREE.MeshStandardMaterial();
		userMaterial.color.setRGB( Math.random(),Math.random(),Math.random() );

		user.head = baseHead.clone();
		user.head.material = userMaterial;
		user.add(user.head);

		if( user.platform === "desktopVR")
		{
			user.controllers = Array(2);
			user.controllers[ LEFT_CONTROLLER_INDEX ] = new THREE.Mesh(controllers[ LEFT_CONTROLLER_INDEX ].controllerModel.geometry,userMaterial);
			user.controllers[1-LEFT_CONTROLLER_INDEX] = new THREE.Mesh(controllers[1-LEFT_CONTROLLER_INDEX].controllerModel.geometry,userMaterial);
			user.add( user.controllers[0] );
			user.add( user.controllers[1] );
		}
		else
		{
			user.pointer = pointer.clone();
			user.pointer.material.color.setRGB( (userMaterial.color.r+1)/2, (userMaterial.color.g+1)/2, (userMaterial.color.b+1)/2 );
			user.pointer.position.z = headDepth/2; //make heads big enough that this sits in the right place
			user.add(user.pointer);

			if(user.platform === "daydream")
			{
				user.pointer.position.y = -headHeight/2; //make heads big enough that this sits in the right place
			}
		}

		return user;
	}

	return userManager;
}