function addExtraForVR( loadFloor )
{
	scene.fog = new THREE.Fog( 0xffffff, 1, 600 );
	scene.fog.color.setHSL( 0.6, 0, 1 );

	var OurTextureLoader = new THREE.TextureLoader();
	OurTextureLoader.crossOrigin = true;
	if(loadFloor)
	{
		OurTextureLoader.load(
				"data/textures/Floor.png",
				function(texture) {
					texture.magFilter = THREE.NearestFilter;
//					texture.minFilter = THREE.LinearMipMapLinearFilter;
					
					var floorwidth = 8;
					
//					var floorMat = new THREE.MeshPhongMaterial( { color: 0xffffff, specular: 0x050505 } ); floorMat.color.setHSL( 0.095, 1, 0.75 );
					var floorMat = new THREE.MeshPhongMaterial({ map: texture }); 
					
					var FloorTile = new THREE.Mesh( new THREE.PlaneBufferGeometry( floorwidth, floorwidth ), floorMat);
//					FloorTile.receiveShadow = true;
					
					FloorTile.position.y = -1;
					
					FloorTile.rotation.x = -TAU / 4;

					scene.add(FloorTile);
				},
				function ( xhr ) {}, function ( xhr ) {console.log( 'texture loading error' );}
			);
		
		var walls = Array(4);
		for(var i = 0; i < walls.length; i++)
		{
			walls[i] = new THREE.Mesh(new THREE.PlaneGeometry(4,2), new THREE.MeshStandardMaterial({color:0x4444FF, side:THREE.DoubleSide}));
			walls[i].rotation.y = i * TAU/4;
			walls[i].position.z = -2;
			walls[i].position.applyAxisAngle(yUnit,i*TAU/4);
			scene.add(walls[i])
		}
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
}