function init()
{
	renderer = new THREE.WebGLRenderer({antialias: true});
	renderer.setPixelRatio( window.devicePixelRatio );
	renderer.setClearColor( 0xFFFFFF );	
	document.getElementById("canvas").appendChild( renderer.domElement );
	
	scene = new THREE.Scene();
	camera = new THREE.PerspectiveCamera( 1,1,0.001, 700); //both first arguments are irrelevant
	camera.position.z = 16;
	
	var respondToResize = function() 
	{
		renderer.setSize( document.documentElement.clientWidth,window.innerHeight ); //different because we do expect a scrollbar. Bullshit that you can't use both in the same way but whatever
		camera.aspect = renderer.domElement.width / renderer.domElement.height;
		
		var minimumCenterToFrameVertical = 1;
		var minimumCenterToFrameHorizontal = 1;
		
		if( camera.aspect >= 1 )
		{
			camera.fov = 2 * Math.atan( minimumCenterToFrameVertical / camera.position.z ) * 360 / TAU;
		}
		else
		{
			var horizontalFov = 2 * Math.atan( minimumCenterToFrameHorizontal / camera.position.z ) * 360 / TAU;
			camera.fov = horizontalFov / camera.aspect;
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
	
	Sounds.grab.volume = 1;
	
	var asynchronousInput = initInputSystem();
	
	var ourBlob = blobWithEyeballs();
	scene.add(ourBlob)
	
	var ourSquare = new THREE.Mesh(new THREE.PlaneGeometry(1,1), new THREE.MeshBasicMaterial({color:0xFF0000}));
	scene.add(ourSquare)
	
	function coreLoop() {
		frameDelta = ourclock.getDelta();
		timeSinceStart += frameDelta;
		
		asynchronousInput.read();
		
		ourBlob.position.copy(clientPosition);
		
		requestAnimationFrame( coreLoop );
		renderer.render( scene, camera );
	}
	
	coreLoop();
}

function blobWithEyeballs(ourColor)
{
	if( !ourColor )
		ourColor = new THREE.Color(Math.random(),Math.random(),Math.random() );
	
	var blob = new THREE.Mesh(new THREE.SphereGeometry(0.5),new THREE.MeshPhongMaterial());
	blob.material.color = ourColor;
	
	return blob;
	
	/*
	 * Should be possible for them to be sleepy, interested in something, excited, quizzical (eyebrows)
	 */
}