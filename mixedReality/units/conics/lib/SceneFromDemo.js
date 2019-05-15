function makeStandardScene( loadFloor ){
	scene.fog = new THREE.Fog( 0xffffff, 1, 600 );
	scene.fog.color.setHSL( 0.6, 0, 1 );
	
	// LIGHTS

	hemiLight = new THREE.HemisphereLight( 0xffffff, 0xffffff, 0.6 );
	hemiLight.color.setHSL( 0.6, 1, 0.6 );
	hemiLight.groundColor.setHSL( 0.095, 1, 0.75 );
	hemiLight.position.set( 0, 500, 0 );
	scene.add( hemiLight );

	dirLight = new THREE.DirectionalLight( 0xffffff, 1 );
	dirLight.color.setHSL( 0.1, 1, 0.95 );
	dirLight.position.set( -1, 1.75, 1 );
	dirLight.position.multiplyScalar( 50 );
	scene.add( dirLight );

	dirLight.castShadow = true;

	dirLight.shadow.mapSize.width = 2048;
	dirLight.shadow.mapSize.height = 2048;

	var d = 50;

	dirLight.shadow.camera.left = -d;
	dirLight.shadow.camera.right = d;
	dirLight.shadow.camera.top = d;
	dirLight.shadow.camera.bottom = -d;

	dirLight.shadow.camera.far = 3500;
	dirLight.shadow.bias = -0.0001;
	
	var OurTextureLoader = new THREE.TextureLoader();
	OurTextureLoader.crossOrigin = true;
	if(loadFloor)
	{
		OurTextureLoader.load(
				"data/Floor.png",
				function(texture) {
					texture.magFilter = THREE.NearestFilter;
					texture.minFilter = THREE.LinearMipMapLinearFilter;
					
					var floorwidth = 256;
					var FloorTile = new THREE.Mesh(
							new THREE.CubeGeometry(floorwidth, floorwidth, 0),
							new THREE.MeshBasicMaterial({}) );
					
					FloorTile.material.map = texture;
					
					FloorTile.position.y = -1;
					
					FloorTile.lookAt(new THREE.Vector3())

					scene.add(FloorTile);
				},
				function ( xhr ) {}, function ( xhr ) {console.log( 'texture loading error' );}
			);
	}

	// GROUND

//	var groundGeo = new THREE.PlaneBufferGeometry( 1000, 1000 );
//	var groundMat = new THREE.MeshPhongMaterial( { color: 0xffffff, specular: 0x050505 } );
//	groundMat.color.setHSL( 0.095, 1, 0.75 );
//
//	var ground = new THREE.Mesh( groundGeo, groundMat );
//	ground.rotation.x = -Math.PI/2;
//	ground.position.y = -33;
//	scene.add( ground );
//
//	ground.receiveShadow = true;

	// SKYDOME

	var vertexShader = document.getElementById( 'vertexShader' ).textContent;
	var fragmentShader = document.getElementById( 'fragmentShader' ).textContent;
	var uniforms = {
		topColor: 	 { type: "c", value: new THREE.Color( 0x0077ff ) },
		bottomColor: { type: "c", value: new THREE.Color( 0xffffff ) },
		offset:		 { type: "f", value: 33 },
		exponent:	 { type: "f", value: 0.6 }
	};
	uniforms.topColor.value.copy( hemiLight.color );

	scene.fog.color.copy( uniforms.bottomColor.value );

	var skyGeo = new THREE.SphereGeometry( 600, 32, 15 );
	var skyMat = new THREE.ShaderMaterial( { 
		vertexShader: vertexShader, 
		fragmentShader: fragmentShader, 
		uniforms: uniforms, 
		side: THREE.BackSide } );

	var sky = new THREE.Mesh( skyGeo, skyMat );
	scene.add( sky );
}