/*
 * Adjus the parabola angry-birds style, and have the cone be in the right place
 * Then it zooms out and hey you're actually on a planet
 * Then you get something that fires really fast to make hyperbola
 * 
 * Cool thing about the 4D thing is that if you turn it in xz it's the same, and in xw, er... and in zw... only in xy, zy, wy will you get weirdness, so that's three angles to rotate it in?
 * Same with x*x+z*z-w*w-y*y?
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
	
	{
		var coneHeight = 0.1;
		var ourConeGeometry = new THREE.ConeGeometry(coneHeight,coneHeight,63,1,true)
		var conic = new THREE.Object3D();
		var cone1 = new THREE.Mesh(ourConeGeometry,new THREE.MeshPhongMaterial({color:0xFF00F0, side:THREE.DoubleSide}));
		var cone2 = new THREE.Mesh(ourConeGeometry,new THREE.MeshPhongMaterial({color:0x0F80F0, side:THREE.DoubleSide}));
		var eps = 0.00001;
		cone1.position.y =-coneHeight / 2 - eps;
		cone2.position.y = coneHeight / 2 + eps;
		cone2.rotation.x = TAU / 2;
		conic.add(cone1);
		conic.add(cone2);
		scene.add(conic);
		
		/* So the cone has the equation x^2 + z^2 - y^2 = 0
		 * The equation of a plane is ax+by+cz+d = 0
		 * 	the set of points st z = 0? that would be y = 
		 * we figure out the intersection in cone space, i.e. the above holds, and we have the curve object in the cone's space too
		 * The curve could be anywhere in the plane, so parameterize by t
		 * say that you knew x and y (but what if it was the xy plane? whatever)
		 * 		z = sqrt(y^2-x^2) (uh, could be imaginary)
		 * if you knew x
		 * 		x^2+z^2 = (ax+cz+d)^2/b^2
		 * 		(x/b)^2+(z/b)^2 = ax+cz+d
		 * 		z = 
		 * 
		 * The plane should have some snapping for parabola, circle and perfect hyperbola
		 * 
		 * How much can you say geometrically? Eg: 
		 * 		on the parabola (it's y=x^2 but don't say that), if you look at lines separating it from the x axis, if you double the distance from the apex you quadruple the height
		 * 			you want to show that pictorally!
		 * 		The hyperbola gets closer and closer to the asymptotes because the circle is getting infinitely big
		 * 
		 * Start the video by taking them out
		 */
		
		
		conic.update = function()
		{
			conic.rotation.x += TAU * frameDelta / 5;
//			conic.position.z = Math.sin(timeSinceStart*TAU)*12;
		}
	}
	
	//The hyperbola is so weird for coming back. One thing you can say is that the ellipse and maybe the parabola have an excuse for not doing so
	{
		var projectile = new THREE.Mesh(new THREE.EfficientSphereGeometry(0.01), new THREE.MeshPhongMaterial({color:0x5F08FF}))
		projectile.velocity = new THREE.Vector3();
			
		scene.add(projectile);
		
		/*
		 * It does need to follow the function, otherwise you're doing forward euler. But it should also be able to interpret velocity
		 */
		projectile.update = function()
		{
			this.velocity.y -= 0.001;
			this.position.add(this.velocity); 
		}
		
		var arrow = new THREE.Mesh(new THREE.ArrowGeometry(0.1), new THREE.MeshPhongMaterial({color:0x5F0800}) );
		scene.add(arrow)
	}
	
	function coreLoop() {
		frameDelta = ourclock.getDelta();
		timeSinceStart += frameDelta;
		
		asynchronousInput.read();
		
		projectile.update();
		conic.update();
		
		requestAnimationFrame( coreLoop );
		renderer.render( scene, camera );
	}
	coreLoop();
}