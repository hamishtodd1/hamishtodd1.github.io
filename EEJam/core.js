/*
 * mobius transformations
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
	
	{
		var avatar = new THREE.Mesh(new THREE.EfficientSphereGeometry(1), new THREE.MeshBasicMaterial({color:0x0000FF, side: THREE.DoubleSide}));
		scene.add(avatar);
		avatar.scale.setScalar(0.05);
	}
	
	var objects = [];
	
	var badObjects = Array(2);
	var badMat = new THREE.MeshBasicMaterial({color:0xFF0000, side: THREE.DoubleSide});
	for( var i = 0; i < badObjects.length; i++)
	{
		badObjects[i] = new THREE.Mesh(avatar.geometry, badMat);
		badObjects[i].position.set(Math.random() - 0.5,Math.random() - 0.5,0);
		badObjects[i].scale.setScalar(0.03)
		
		scene.add(badObjects[i]);
		objects.push(badObjects[i])
	}
	
	var goodObjects = Array(1);
	var goodMat = new THREE.MeshBasicMaterial({color:0x00FF00, side: THREE.DoubleSide});
	for( var i = 0; i < goodObjects.length; i++)
	{
		goodObjects[i] = new THREE.Mesh(avatar.geometry, goodMat);
		goodObjects[i].position.set(Math.random() - 0.5,Math.random() - 0.5,0);
		goodObjects[i].scale.setScalar(0.01)
		
		scene.add(goodObjects[i]);
		objects.push(goodObjects[i])
	}
	
	var neutralObjects = Array(3);
	var neutralMat = new THREE.MeshBasicMaterial({color:0x000000, side: THREE.DoubleSide});
	for( var i = 0; i < neutralObjects.length; i++)
	{
		neutralObjects[i] = new THREE.Mesh(avatar.geometry, neutralMat);
		neutralObjects[i].position.set(Math.random() - 0.5,Math.random() - 0.5,0);
		neutralObjects[i].scale.setScalar(0.1)
		
		scene.add(neutralObjects[i]);
		objects.push(neutralObjects[i])
	}
	
	function coreLoop() {
		frameDelta = ourclock.getDelta();
		timeSinceStart += frameDelta;
		
		asynchronousInput.read();
		
		avatar.position.copy(clientPosition);
		
		for(var i = 0; i < neutralObjects.length; i++)
		{
			if(neutralObjects[i].parent !== scene)
				continue;
			if(avatar.position.distanceTo(neutralObjects[i].position) < avatar.scale.x + neutralObjects[i].scale.x)
			{
				var newDisplacement = avatar.position.clone();
				newDisplacement.sub(neutralObjects[i].position);
				newDisplacement.setLength(avatar.scale.x + neutralObjects[i].scale.x);
				
				avatar.position.addVectors(neutralObjects[i].position, newDisplacement)
			}
		}
		
		for(var i = 0; i < goodObjects.length; i++)
		{
			if(goodObjects[i].parent !== scene)
				continue;
			if( avatar.position.distanceTo(goodObjects[i].position) < avatar.scale.x + goodObjects[i].scale.x)
			{
				scene.remove(goodObjects[i]);
				Sounds.pop1.play();
			}
		}
		
		for(var i = 0; i < badObjects.length; i++)
		{
			if(badObjects[i].parent !== scene)
				continue;
			if( avatar.position.distanceTo( badObjects[i].position ) < avatar.scale.x + badObjects[i].scale.x )
			{
				Sounds.change1.play();
			}
		}
		
		requestAnimationFrame( coreLoop );
		renderer.render( scene, camera );
	}
	coreLoop();
}