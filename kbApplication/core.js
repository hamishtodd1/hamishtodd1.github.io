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
	
//	var paragliderPic = new THREE.Mesh( new THREE.PlaneGeometry(0.5,0.5), new THREE.MeshBasicMaterial({transparent:true, map:paragliderTexture}) );
//	paragliderPic.position.z = camera.position.z / 2;
//	scene.add(paragliderPic);
	
	kbSystem = initKBSystem()
	scene.add(kbSystem);
	
	gliderSystem = initGliderSystem();
	scene.add(gliderSystem);
	
	kbSystem.update(kbSystem.diamond.direction,kbSystem.diamond.orientation)
	gliderSystem.update(kbSystem.diamond.direction,kbSystem.diamond.orientation)
	
	var bgHider = new THREE.Mesh(new THREE.PlaneGeometry(1,1), new THREE.MeshPhongMaterial( {color:0xFFFFFF} ) );
	scene.add(bgHider);
	
	var respondToResize = function() 
	{
		var verticalFov = -1;
		if( document.body.clientWidth >= document.body.clientHeight )
		{
			//landscape
			renderer.setSize( document.body.clientWidth, document.body.clientWidth / 2 );
			
			camera.fov = 2 * Math.atan( 0.5 / camera.position.z ) * 360 / TAU;
			kbSystem.position.set(-0.25,0,camera.position.z / 2 );
			gliderSystem.position.set(0.5,0,0);
		}
		else
		{
			//portrait
			renderer.setSize( document.body.clientHeight / 2, document.body.clientHeight );
			
			camera.fov = 2 * Math.atan( 1 / camera.position.z ) * 360 / TAU;
			kbSystem.position.set(0,0.25,camera.position.z / 2 );
			gliderSystem.position.set(0,-0.5,0);
		}
		
		bgHider.position.copy(gliderSystem.position)
		bgHider.position.negate();
		bgHider.position.z = 0.01;
		
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
	
	var lights = Array(2);
	lights[0] = new THREE.AmbientLight( 0xffffff, 0.82 );
	lights[1] = new THREE.PointLight( 0xffffff, 0.5 );
	lights[1].position.set(1,0.5,1);
	lights[1].position.setLength( 100 );
	scene.add(lights[0]);
	scene.add(lights[1]);
	
	function coreLoop() {
		frameDelta = ourclock.getDelta();
		
		asynchronousInput.read();
		
		if( clientClicking && !gliderGrabbed && !bgGrabbed && !kbPointGrabbed)
		{
			if( ( renderer.domElement.width > renderer.domElement.height && clientPosition.x <= 0) || 
				( renderer.domElement.height > renderer.domElement.width && clientPosition.y >= 0) )
			{
				kbPointGrabbed = true;
			}
			else if( gliderSystem.glider.material.emissive.b !== 0 )
			{
				gliderGrabbed = true;
			}
			else
			{
				bgGrabbed = true;
			}
		}
		if(!clientClicking)
		{
			gliderGrabbed = false;
			bgGrabbed = false;
			kbPointGrabbed = false;
		}
		
//		paragliderPic.material.opacity -= frameDelta / 3;
		kbSystem.update();
		gliderSystem.update();
		
		requestAnimationFrame( coreLoop );
		renderer.render( scene, camera );
	}
	
	coreLoop();
}