function loadpic(url, materialToMapTo) {
	var texture_loader = new THREE.TextureLoader();
	texture_loader.crossOrigin = true;
	texture_loader.load(
			url,
		function(texture) {			
			materialToMapTo.map = texture;
			materialToMapTo.needsUpdate = true;
		},
		function ( xhr ) {}, function ( xhr ) {
			console.log( 'texture loading error' );
		}
	);
}