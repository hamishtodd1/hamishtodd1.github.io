function init()
{
	renderer = new THREE.WebGLRenderer({antialias: true});
	renderer.setPixelRatio( window.devicePixelRatio );
	renderer.setClearColor( 0xFFFFFF );	
	document.getElementById("canvas").appendChild( renderer.domElement );
	
	scene = new THREE.Scene();
	camera = new THREE.OrthographicCamera( -0.5,0.5,0.5,-0.5, 1,20); //both first arguments are irrelevant
	camera.aspect = 1;
	camera.position.z = 16;
	
	var respondToResize = function() 
	{
		renderer.setSize( document.documentElement.clientWidth,window.innerHeight ); //different because we do expect a scrollbar. Bullshit that you can't use both in the same way but whatever
		camera.aspect = renderer.domElement.width / renderer.domElement.height;
		
		//eg playing field is 1x1 square
		var minimumCenterToFrameVertical = 0.5;
		var minimumCenterToFrameHorizontal = 0.5;
		
		if( camera.aspect >= 1 )
		{
			camera.top = 0.5;
			camera.bottom = -0.5;
			camera.right = camera.top * camera.aspect;
			camera.left = camera.bottom * camera.aspect;
		}
		else
		{
			camera.right = 0.5;
			camera.left = -0.5;
			camera.top = camera.right * camera.aspect;
			camera.bottom = camera.left * camera.aspect;
		}
		
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
	
	var lights = Array(2);
	lights[0] = new THREE.AmbientLight( 0xffffff, 0.82 );
	lights[1] = new THREE.PointLight( 0xffffff, 0.5 );
	lights[1].position.set(1,0.5,1);
	lights[1].position.setLength( 100 );
	scene.add(lights[0]);
	scene.add(lights[1]);
	
	//---------SOUND
	Sounds = {};
	var soundInfoArray = [
		"change0",
		"change1",
		"grab",
		"release",
		"pop1",
		"pop2",
		"pop3"
	];
	for(var i = 0; i < soundInfoArray.length; i++)
		Sounds[soundInfoArray[i]] = new Audio( "data/" + soundInfoArray[i] + ".mp3" );
	
	var asynchronousInput = initInputSystem();
	
	var indicator = new THREE.Mesh(new THREE.EfficientSphereGeometry(0.01), new THREE.MeshBasicMaterial({color:0xFF0000}));
	var initialPosition = new THREE.Vector3(0.2,0.1,0)
	scene.add(indicator)
	
	/*
	 * Two hypotheses, given priors initialPosition.x,initialPosition.y and then shown evidence to which they apporition relative likelihoods clientPosition.x, clientPosition.y, will be taken to that new place
	 */
	
	function coreLoop() {
		frameDelta = ourclock.getDelta();
		timeSinceStart += frameDelta;
		
		asynchronousInput.read();
		
		indicator.position.copy(initialPosition);
		console.log(clientPosition.x * 3,clientPosition.y * 3)
		indicator.position.x *= clientPosition.x * 3;
		indicator.position.y *= clientPosition.y * 3;
		
		requestAnimationFrame( coreLoop );
		renderer.render( scene, camera );
	}
	
	coreLoop();
}