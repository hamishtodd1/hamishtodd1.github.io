function init()
{
	renderer = new THREE.WebGLRenderer({antialias: true});
	renderer.setPixelRatio( window.devicePixelRatio );
	renderer.setClearColor( 0x808080 );	
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
			camera.top = camera.right / camera.aspect;
			camera.bottom = camera.left / camera.aspect;
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
	
	var balls = Array(50); //multiples of 2 and 5
	var ballGeometry = new THREE.EfficientSphereGeometry(0.009)
	var resetBall = function()
	{
		this.position.set(Math.random()-0.5,0.5,0)
		this.velocity.set(0,0,0);
		this.material.color.setRGB(0,0,0)
	}
	var bouncing = true;
	var updateBall = function()
	{
		var acceleration = new THREE.Vector3(0,-0.0012,0);
		this.velocity.add(acceleration)
		var terminalVelocity = 0.03;
		if(Math.abs(this.velocity.y) > terminalVelocity )
			this.velocity.y = this.velocity.y < 0? -terminalVelocity:terminalVelocity;
		
		for(var i = 0, il = shelves.length; i<il;i++)
		{
			shelves[i].ballInteraction(this)
		}
		
		this.position.add(this.velocity);
		
		if( this.position.y < -0.5)
			this.reset();
	}
	for(var i = 0, il = balls.length; i < il; i++)
	{
		balls[i] = new THREE.Mesh( ballGeometry, new THREE.MeshBasicMaterial());
		scene.add(balls[i]);
		balls[i].velocity = new THREE.Vector3();
		balls[i].reset = resetBall;
		balls[i].reset();
		balls[i].update = updateBall;
		balls[i].position.y = 0.5 + Math.random() 
	}
	
	var shelfHeight = 0.02;
	var shelfGetSideX = function(side)
	{
		var centerToSide = this.scale.x;
		if( side !== SHELF_RIGHT )
			centerToSide *= -1;
		return centerToSide + this.position.x;
	}
	var shelfSetSideX = function(side,newX)
	{
		var otherSideX = this.getSideX(1-side)
		this.position.x = ( newX + otherSideX ) / 2;
		this.scale.x = Math.abs( newX - otherSideX ) / 2;
	}
	var shelfBallInteraction = function(ball)
	{
		if( ball.position.y + ball.velocity.y < this.position.y 
			&& ball.position.y > this.position.y
			&& this.getSideX(SHELF_LEFT) < ball.position.x && ball.position.x < this.getSideX(SHELF_RIGHT) )
		{
			if( ball.material.color.getComponent(this.importantColorComponent) !== this.material.color.getComponent(this.importantColorComponent) )
			{
				if(bouncing)
				{
					//bad integration but who cares
					ball.position.y = this.position.y;
					ball.velocity.y *= -0.5;
				}
				
				ball.material.color.setComponent( this.importantColorComponent, this.material.color.getComponent(this.importantColorComponent) );
			}
		}
	}
	var SHELF_LEFT = 1;
	var SHELF_RIGHT = 0;
	var shelfUpdate = function()
	{
		if(!clientClicking)
		{
			this.grabbed = false;
			this.leftSideGrabbed = false;
			this.rightSideGrabbed = false;
			somethingGrabbed = false;
		}
		else if( !somethingGrabbed )
		{
			if( clientPosition.y < this.position.y && clientPosition.y > this.position.y - shelfHeight )
			{
				if( Math.abs( -this.scale.x - (clientPosition.x - this.position.x) ) < 0.01 )
				{
					this.leftSideGrabbed = true;
					somethingGrabbed = true;
				}
				else if( Math.abs( this.scale.x - (clientPosition.x - this.position.x) ) < 0.01 )
				{
					this.rightSideGrabbed = true;
					somethingGrabbed = true;
				}
				else if( -this.scale.x < clientPosition.x - this.position.x && clientPosition.x - this.position.x < this.scale.x )
				{
					this.grabbed = true;
					somethingGrabbed = true;
				}
			}
		}
		
		if( this.leftSideGrabbed )
		{
			this.setSideX( SHELF_LEFT, this.getSideX(SHELF_LEFT) + clientDelta.x);
		}
		if( this.rightSideGrabbed )
		{
			this.setSideX( SHELF_RIGHT, this.getSideX(SHELF_RIGHT) + clientDelta.x);
		}
		if( this.grabbed )
		{
			this.position.x += clientDelta.x;
//			this.position.y += clientDelta.y; //irrelevant, distracting. Creates unwanted phenomenon regarding the color that balls can be as determined by order
			
			if( this.getSideX(SHELF_LEFT) < -0.5)
			{
				this.position.x -= this.getSideX(SHELF_LEFT) - -0.5;
			}
			if( this.getSideX(SHELF_RIGHT) > 0.5)
			{
				this.position.x -= this.getSideX(SHELF_RIGHT) - 0.5;
			}
		}
	}
	function makeShelf(index)
	{
		var shelf = new THREE.Mesh(new THREE.PlaneGeometry(2,shelfHeight), new THREE.MeshBasicMaterial({color:0xFF0000}));
		shelf.importantColorComponent = index;
		shelf.position.x = 0.3*(Math.random() - 0.5);
		shelf.position.y = -shelfHeight * index; //narrow so people don't think about what color things can be in between 
		var newRGB = [0,0,0];
		if(newRGB.length <= shelf.importantColorComponent) console.error("Nope")
		newRGB[shelf.importantColorComponent] = 1;
		shelf.material.color.fromArray(newRGB);
		for(var i = 0; i < shelf.geometry.vertices.length; i++)
			shelf.geometry.vertices[i].y -= shelfHeight / 2;
		shelf.scale.x = 0.1
		
		shelf.grabbed = false;
		shelf.leftSideGrabbed = false;
		shelf.rightSideGrabbed = false;
		
		shelf.getSideX = shelfGetSideX;
		shelf.setSideX = shelfSetSideX;
		shelf.update = shelfUpdate;
		shelf.ballInteraction = shelfBallInteraction;
		
		scene.add(shelf);
		return shelf;
	}
	var shelves = Array(3);
	for(var i = 0; i < shelves.length; i++)
		shelves[i] = makeShelf(i);
	
	var singleHolderGeometry = new THREE.Geometry()
	var gapWidth = 0.8;
	var gapHeight = 0.8;
	singleHolderGeometry.vertices.push(
			new THREE.Vector3(0,1,0),
			new THREE.Vector3((1-gapWidth)/2,1,0),
			new THREE.Vector3(1-(1-gapWidth)/2,1,0),
			new THREE.Vector3(1,1,0),
			new THREE.Vector3((1-gapWidth)/2,1-gapHeight,0),
			new THREE.Vector3(1-(1-gapWidth)/2,1-gapHeight,0),
			new THREE.Vector3(0,0,0),
			new THREE.Vector3(1,0,0),
	);
	singleHolderGeometry.faces.push(
			new THREE.Face3(0,1,6),
			new THREE.Face3(4,1,6),
			new THREE.Face3(4,5,6),
			new THREE.Face3(7,5,6),
			new THREE.Face3(7,5,2),
			new THREE.Face3(7,3,2),
	);
	var singleHolderMaterial = new THREE.MeshBasicMaterial({color:0x000000, side:THREE.DoubleSide});

	var arrayHolder = new THREE.Object3D();
	for(var i = 0; i < balls.length; i++)
	{
		var newHolder = new THREE.Mesh(singleHolderGeometry,singleHolderMaterial);
		newHolder.position.x = i - balls.length/2;
		arrayHolder.add(newHolder);
	}
	arrayHolder.scale.setScalar(0.4/balls.length)
	scene.add(arrayHolder)
	
	
	/*
	 * No slopes, instead we have a pair of fans blowing them together
	 * 
	 * Rather interesting: with these things, the slider is the realization of the value controlled by the slider
	 * 
	 * "A and B are proportional" = a rectangle with sidelengths A and B always looks the same
	 * 
	 * Eventually show the visual interface for working out the numbers and let people tweak it into the numbers they see to get the answer? Or calculator onscreen? No, that's why you have the multiples of 2
	 * 
	 * You have planes that come over and hide the different bits of the machine.
	 * 	The separator is the funny part, might be nice to have an emergent way to have them appear on either side, but even from seeing
	 * 
	 * Start with just the rectangle on its own. Hole that it must fit into. Starts out and it is the same size
	 * 
	 * Numbers displayed. They are numbers that are really easy to multiply and divide, multiples of 2 and 5
	 * 
	 * When you resize the thing, sound effect and glow. And that also happens when you push it against the side
	 */
	
	var somethingGrabbed = false;
	
	function coreLoop() {
		frameDelta = ourclock.getDelta();
		timeSinceStart += frameDelta;
		
		asynchronousInput.read();
		
		for(var i = 0, il = shelves.length; i < il; i++)
		{
			shelves[i].update();
		}
			
		for(var i = 0, il = balls.length; i < il; i++)
		{
			balls[i].update();
		}
		
		requestAnimationFrame( coreLoop );
		renderer.render( scene, camera );
	}
	
	coreLoop();
}