function init()
{
	renderer = new THREE.WebGLRenderer({antialias: true});
	renderer.setPixelRatio( window.devicePixelRatio );
	renderer.setClearColor( 0xFFFFFF );	
	document.getElementById("canvas").appendChild( renderer.domElement );
	
	scene = new THREE.Scene();
	camera = new THREE.PerspectiveCamera( 70,
		renderer.domElement.width / renderer.domElement.height,
		0.001, 700);
	camera.position.z = 16;
	scene.add(camera);
	
	scene.add(new THREE.Mesh(new THREE.CubeGeometry(1), new THREE.MeshBasicMaterial({})))
	
	var respondToResize = function() 
	{
		renderer.setSize( document.body.clientWidth, document.body.clientHeight );
		camera.aspect = renderer.domElement.width / renderer.domElement.height;
		camera.updateProjectionMatrix();
		
		var sideToCenter = renderer.domElement.width / 2;
		var topToCenter = renderer.domElement.height / 2;
		renderer.domElement.style.margin = "-" + topToCenter.toString() + "px 0 0 -" + sideToCenter.toString() + "px";
		
		{
			var extras = document.getElementById("extras");
			var halfExtrasWidth = extras.offsetWidth / 2;
			extras.style.margin = "0 0 0 -" + halfExtrasWidth.toString() + "px";
		}
	}
	
	respondToResize();
	window.addEventListener( 'resize', respondToResize, false );
	
	function coreLoop() {
		frameDelta = ourclock.getDelta();
		
		asynchronousInput.read();
		requestAnimationFrame( coreLoop );
		renderer.render( scene, camera );
	}
	
	coreLoop();
}