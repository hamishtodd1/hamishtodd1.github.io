function initLights()
{
	var ambientLight = new THREE.AmbientLight( 0xffffff, 1.0 ); //previously 0.7
	// ambientLight.color.setHSL( 0.6, 1, 0.6 );
	scene.add( ambientLight );

	var ourLight = new THREE.PointLight(0xFFFFFF,1.,99,4);
	ourLight.position.set( 1,1.6+1,1 );
	scene.add( ourLight );
	
	let helperSphereRadius = 0.04
	var helperSphere = new THREE.Mesh(new THREE.SphereGeometry(helperSphereRadius), new THREE.MeshPhongMaterial({color:0xFF0000}));
	helperSphere.geometry.computeBoundingSphere();
	ourLight.boundingSphere = helperSphere.geometry.boundingSphere;
	ourLight.ordinaryParent = scene;
	ourLight.add(helperSphere);
	var label = makeTextSign( "Light" );
	label.position.z = helperSphereRadius;
	label.scale.setScalar(helperSphereRadius/2)
	helperSphere.add(label);
	holdables.push(ourLight)

	var shadowsPresent = false;
	if(shadowsPresent)
	{
		// var shadowSurface = new THREE.Mesh(new THREE.SphereBufferGeometry( 1 ).applyMatrix(new THREE.Matrix4().makeScale(panelDimensions.x,panelDimensions.y,panelDimensions.z)), new THREE.MeshBasicMaterial({side:THREE.DoubleSide}) )
		// scene.add(shadowSurface) // want to use it for intersection and for shadow. Necessary to be in scene for former?
		//there's an argument for having the shadow of the panel on the floor

		renderer.shadowMap.enabled = true;
		renderer.shadowMap.type = THREE.BasicShadowMap;

		hands[0].controllerModel.castShadow = true;
		hands[1].controllerModel.castShadow = true;
		//the controller lasers too?
		backPanel.receiveShadow = true;
		floorTile.receiveShadow = true;

		if(ourLight.isDirectionalLight)
		{
			var dimension = 0.06;
			ourLight.shadow.camera.left = -dimension;
			ourLight.shadow.camera.right = dimension;
			ourLight.shadow.camera.top = dimension;
			ourLight.shadow.camera.bottom = -dimension;
		}

		ourLight.shadow.camera.far = 10;
		ourLight.shadow.camera.near = ourLight.boundingSphere.radius / 2;
		ourLight.shadow.mapSize.width = 512;
		ourLight.shadow.mapSize.height = 512;
		ourLight.castShadow = true;
	}
}