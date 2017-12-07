//They probably need a little reticule on their screen
//they also don't have a floor, allowing them to "zoom out" eg move far away from it
//in principle can be defined simply by rotation x and y.
//forget about tablet for a bit, that'll be pinch to zoom
//probably laser is invisible when mouse is down

function initUserManager(controllerGeometries, socket)
{
	var userManager = {};

	var users = {};

	//models
	{
		var headWidth = 0.06;
		var headHeight = 0.04;
		var headDepth = 0.006;

		var baseHead = new THREE.Mesh(new THREE.BoxBufferGeometry(headWidth,headHeight,headDepth), new THREE.MeshBasicMaterial() );

		var eye = new THREE.Mesh(new THREE.CircleBufferGeometry(headWidth/6,32), new THREE.MeshBasicMaterial({color:0xFFFFFF, side: THREE.DoubleSide}));
		eye.add( new THREE.Mesh(new THREE.CircleBufferGeometry(headWidth/18,32), new THREE.MeshBasicMaterial({color:0x000000, side: THREE.DoubleSide})) );
		eye.children[0].position.z = -0.0001;
		var rightEye = eye.clone();
		var leftEye = eye.clone();
		leftEye.position.set( -headWidth / 4, 0, -headDepth * 0.51);
		rightEye.position.set( headWidth / 4, 0, -headDepth * 0.51);
		baseHead.add(leftEye,rightEye);

		// var pointer = new THREE.Mesh( new THREE.CylinderBufferGeometryUncentered(0.015,0.08), new THREE.MeshStandardMaterial({color:0x000000}) );
		// pointer.add( new THREE.Mesh( new THREE.CylinderBufferGeometryUncentered(0.005, 3), new THREE.MeshBasicMaterial({transparent:true,opacity:0.2}) ) );
	}

	socket.on('userUpdate', function(updatePackage)
	{
		if(!users[updatePackage.id])
		{
			users[updatePackage.id] = User(updatePackage.platform);
		}
		var targetUser = users[updatePackage.id];

		targetUser.head.position.copy(updatePackage.head.position);
		targetUser.head.rotation.copy(updatePackage.head.rotation);

		if( updatePackage.platform === "desktopVR")
		{
			for(var i = 0; i < 2; i++)
			{
				targetUser.controllers[i].position.copy(updatePackage.controllers[i].position);
				targetUser.controllers[i].rotation.copy(updatePackage.controllers[i].rotation);
			}
		}
		else
		{
			// targetUser.pointer.rotation.copy( updatePackage.pointer.rotation );
			targetUser.poiSphere.position.copy(targetUser.poiSphere.getPoi(targetUser));
		}

		targetUser.timeSinceUpdate = 0;
	} );

	userManager.checkForDormancy = function()
	{
		for( var userID in users)
		{
			users[userID].timeSinceUpdate += frameDelta;
			if( users[userID].timeSinceUpdate > 5 )
			{
				console.log("removing user")
				{
					scene.remove(user[userID]);
					delete users[userID];
				}
			}
		}
	}

	var ourPlatform = getPlatform();
	var ourUpdatePackage = {
		head:{
			position: camera.position,
			rotation: camera.rotation
		},
		platform: ourPlatform
	};
	if( ourPlatform === "desktopVR")
	{
		ourUpdatePackage.controllers = Array(2);
		// ourUpdatePackage.controllers[0] = {position:controllers[0].position,rotation:controllers[0].rotation};
		// ourUpdatePackage.controllers[1] = {position:controllers[1].position,rotation:controllers[1].rotation};
	}
	else
	{
		// ourUpdatePackage.pointer = {position:pointer.position,rotation:pointer.rotation};
	}

	userManager.sendOurUpdate = function()
	{
		socket.emit('userUpdate', ourUpdatePackage);
	}

	/*
		only the molecule moving from a given person's point of view?
		But then they sort of lose the ability to say "up" and stuff like that?

		So probably that's a bad idea
		If someone repositions the molecule, the molecule gets put in the same place for everyone
	*/

	function User(platform)
	{
		var user = new THREE.Object3D();
		user.platform = platform;
		scene.add(user);
		
		user.timeSinceUpdate = 0;

		var userMaterial = new THREE.MeshStandardMaterial();
		userMaterial.color.setRGB( Math.random(),Math.random(),Math.random() );

		user.head = baseHead.clone();
		console.log(baseHead,user.head)
		user.head.material = userMaterial;
		user.add(user.head);

		user.poiSphere = makePoiSphere();
		scene.add(user.poiSphere);

		if( user.platform === "desktopVR")
		{
			user.controllers = Array(2);
			user.controllers[ LEFT_CONTROLLER_INDEX ] = new THREE.Mesh(controllerGeometries[ LEFT_CONTROLLER_INDEX ],userMaterial);
			user.controllers[1-LEFT_CONTROLLER_INDEX] = new THREE.Mesh(controllerGeometries[1-LEFT_CONTROLLER_INDEX],userMaterial);
			scene.add( user.controllers[0] );
			scene.add( user.controllers[1] );
		}
		else
		{
			// user.pointer = pointer.clone();
			// user.pointer.material.color.setRGB( (userMaterial.color.r+1)/2, (userMaterial.color.g+1)/2, (userMaterial.color.b+1)/2 );
			// user.pointer.position.z = headDepth/2; //make heads big enough that this sits in the right place
			// user.add(user.pointer);

			// if(user.platform === "daydream")
			// {
			// 	user.pointer.position.y = -headHeight/2; //make heads big enough that this sits in the right place
			// }
		}

		//pointer could appear and have some fake perspective?

		return user;
	}

	return userManager;
}