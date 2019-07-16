/*
	Cornices, skirting board, those things that run along the wall, color below, color above, carpet, maybe things in the corners so you know which corner is which.
*/

'use strict';

function initSurroundings()
{
	//floor
	var ourTextureLoader = new THREE.TextureLoader();
	ourTextureLoader.crossOrigin = true;
	var floorDimension = 2;				
	var floorTile = new THREE.Mesh( new THREE.PlaneBufferGeometry( floorDimension, floorDimension ), new THREE.MeshLambertMaterial());
	floorTile.position.y = -1.2;
	floorTile.rotation.x = -TAU / 4;
	scene.add(floorTile);
	ourTextureLoader.load(
		"data/floor.png",
		function(texture)
		{
			texture.magFilter = THREE.NearestFilter;
			floorTile.material.map = texture;
		},
		function ( xhr ) {}, function ( xhr ) {console.log( 'texture loading error' );}
	);

	//------------Sky

	var vertexShader = document.getElementById( 'vertexShader' ).textContent;
	var fragmentShader = document.getElementById( 'fragmentShader' ).textContent;
	var uniforms = {
		topColor: 	 { type: "c", value: new THREE.Color( 0x0077ff ) },
		bottomColor: { type: "c", value: new THREE.Color( 0xffffff ) },
		offset:		 { type: "f", value: 33 },
		exponent:	 { type: "f", value: 0.6 }
	};
	uniforms.topColor.value.copy( new THREE.Color().setHSL( 0.6, 1, 0.6 ) );

	var skyDome = new THREE.Mesh( 
		new THREE.SphereGeometry( camera.far*0.99, 32, 15 ),
		new THREE.ShaderMaterial( { 
			vertexShader: vertexShader, 
			fragmentShader: fragmentShader, 
			uniforms: uniforms, 
			side: THREE.BackSide
		})
	);
	scene.add( skyDome );

	//-----------------lights
	/*
		Could attach one to people's heads? Hands?
	*/

	var ambientLight = new THREE.AmbientLight( 0xffffff, 0.7 );
	// ambientLight.color.setHSL( 0.6, 1, 0.6 );
	scene.add( ambientLight );

	var ourLight = new THREE.PointLight(0xFFFFFF,1,99,0.36,0,1);
	// ourLight.color.setHSL( 0.1, 1, 0.95 );
	// ourLight.position.set( -1, 1.75, 1 );
	// ourLight.target = handControllers[0]
	ourLight.position.set( 0,0.1,0.1 );
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

		handControllers[0].controllerModel.castShadow = true;
		handControllers[1].controllerModel.castShadow = true;
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