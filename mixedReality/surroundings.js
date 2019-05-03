async function initFloorAndSky()
{
	//floor
	let floorDimension = 16;
	let floorTile = new THREE.Mesh( new THREE.PlaneBufferGeometry( floorDimension, floorDimension ), new THREE.MeshLambertMaterial());
	floorTile.position.y = 0;
	floorTile.rotation.x = -TAU / 4;
	scene.add(floorTile);
	new THREE.TextureLoader().setCrossOrigin(true).load(
		"data/floor.png",
		function(texture)
		{
			texture.magFilter = THREE.NearestFilter;
			floorTile.material.map = texture;
		},
		function ( xhr ) {}, function ( xhr ) {console.log( 'texture loading error' );}
	);
	

	//------------Sky
	let uniforms = {
		topColor: 	 { type: "c", value: new THREE.Color( 0x0077ff ) },
		bottomColor: { type: "c", value: new THREE.Color( 0xffffff ) },
		offset:		 { type: "f", value: 0 },
		exponent:	 { type: "f", value: 0.6 }
	};
	let skyMaterial = new THREE.ShaderMaterial({
		uniforms,
		side:THREE.BackSide
	});
	await assignShader("skyVertex", skyMaterial, "vertex")
	await assignShader("skyFragment", skyMaterial, "fragment")

	scene.add( new THREE.Mesh( 
		new THREE.SphereGeometry( camera.far*0.5, 32, 15 ),
		skyMaterial
	) );
}