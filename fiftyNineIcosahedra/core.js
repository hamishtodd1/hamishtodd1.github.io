/*
 */

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
		
		//eg playing field is 1x1 square
		var minimumCenterToFrameVertical = 0.5;
		var minimumCenterToFrameHorizontal = 0.5;
		
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
	
	var asynchronousInput = initInputSystem();
	
	var ico = new THREE.Mesh(new THREE.Geometry(), new THREE.MeshBasicMaterial({color:0xFF0000, side:THREE.DoubleSide}));
	ico.scale.setScalar(0.1)
	scene.add( ico );
	
	ico.geometry.vertices.push(
		new THREE.Vector3(0,0,0),
		new THREE.Vector3(HS3,-0.5,0),
		
		new THREE.Vector3(HS3, 0.5, 0),
		new THREE.Vector3(2*HS3, 0,0),
		new THREE.Vector3(2*HS3,1,0),
		new THREE.Vector3(3*HS3,0.5,0),
		
		new THREE.Vector3(0,1,0),
		new THREE.Vector3(HS3,1.5,0),
		new THREE.Vector3(0,2,0),
		new THREE.Vector3(HS3,2.5,0),
		
		new THREE.Vector3(-HS3,0.5,0),
		new THREE.Vector3(-HS3,1.5,0),
		new THREE.Vector3(-2*HS3,1,0),
		new THREE.Vector3(-2*HS3,2,0),
		
		new THREE.Vector3(-HS3,-0.5,0),
		new THREE.Vector3(-2*HS3,0,0),
		new THREE.Vector3(-2*HS3,-1,0),
		new THREE.Vector3(-3*HS3,-0.5,0),
		
		new THREE.Vector3(0,-1,0),
		new THREE.Vector3(-HS3,-1.5,0),
		new THREE.Vector3(0,-2,0),
		new THREE.Vector3(-HS3,-2.5,0) );
	
	ico.geometry.faces.push(
		new THREE.Face3(2,1,0),
		new THREE.Face3(1,2,3),
		new THREE.Face3(4,3,2),
		new THREE.Face3(3,4,5),
		
		new THREE.Face3(6,2,0),
		new THREE.Face3(2,6,7),
		new THREE.Face3(8,7,6),
		new THREE.Face3(7,8,9),
		
		new THREE.Face3(10, 6, 0),
		new THREE.Face3(6, 10,11),
		new THREE.Face3(12,11,10),
		new THREE.Face3(11,12,13),
		
		new THREE.Face3(14,10, 0),
		new THREE.Face3(10,14,15),
		new THREE.Face3(16,15,14),
		new THREE.Face3(15,16,17),
		
		new THREE.Face3(18,14, 0),
		new THREE.Face3(14,18,19),
		new THREE.Face3(20,19,18),
		new THREE.Face3(19,20,21) );
	
	function coreLoop() {
		frameDelta = ourclock.getDelta();
		timeSinceStart += frameDelta;
		
		asynchronousInput.read();
		
		requestAnimationFrame( coreLoop );
		renderer.render( scene, camera );
	}
	coreLoop();
}