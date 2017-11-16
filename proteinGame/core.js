/*
 * You make proteins, they do random walks.
 * An interactive version of those blobby diagrams that biologists like to make
 * 
 * This is about protein function emerging from protein geometry. That is interesting.
 * 		Tremendous variety of forms, leading to all diversity from facial features to multicellularity. But their form only matters insofaras it changes the protein's interaction with other things
 * 		All this shit about folding and genetics is just to make a shape (often rigid) with hydrogen bonds in the right places (on the surface)
 * 		A shape whose precise geometry then affects its behaviour, often over the long term. Hydrogen bonds in *exactly* the right place vs slightly off = different behaviour
 * 		attractors (hydrogen bonds, attract each other) and repulsors (which stand in for the rest of it, they repel each other)?
			Simple UI that keeps to the core of it
			No worrying about whole shape at once (which is hard to think about), just placement of points
		But how does it affect their movement? Slightly biases the random walk?
 * 
 * 
 * So this allows for things like: 
 * 		one end binds to one protein, one to another, allowing them to do something together
 * 		binds to a particular place on one protein more effectively than some other protein that is binding to it, stopping that binding
 * 		lots of these simultaneously
 * 
 * Your goal
 * 		Stop the red things from being produced. The thing that could be doing that could change from level to level?
 * 
 * You should be able to control the concentration of your protein
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
	
	var molA = new THREE.Object3D();
	molA.position.x = 0.2;
	var attractor = new THREE.Mesh(new THREE.CircleGeometry(0.05), new THREE.MeshBasicMaterial({color:0xFF0000}));
	molA.add(attractor);
	scene.add(molA);
	
	function coreLoop() {
		frameDelta = ourclock.getDelta();
		timeSinceStart += frameDelta;
		
		asynchronousInput.read();
		
		requestAnimationFrame( coreLoop );
		renderer.render( scene, camera );
	}
	coreLoop();
}