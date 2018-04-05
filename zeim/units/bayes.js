/*
The initial idea seems to have been to have some kind of machine that is initially obscured by curtains.
Yes, the purpose was to obscure the middle of the waterfall, and you have to work out proportion of what will come out the other side
You had ideas about the balls being shunted into a row, being sorted into either end somehow

 * No slopes, instead we have a pair of fans blowing them together
 * 
 * Rather interesting: with these things, the slider is the realization of the value controlled by the slider
 * 
 * "A and B are proportional" = a rectangle with sidelengths A and B always looks the same
 * 
 * Eventually show the visual interface for working out the numbers
 		and let people tweak it into the numbers they see to get the answer?
 		Or calculator onscreen? No, that's why you have the multiples of 2
 * 
 * You have planes that come over and hide the different bits of the machine.
 * 	The separator is the funny part, might be nice to have an emergent way to have them appear on either side, but even from seeing
 * 
 * Start with just the rectangle on its own. Hole that it must fit into. Starts out and it is the same size
 * 
 * Numbers displayed. They are numbers that are really easy to multiply and divide, multiples of 2 and 5
 * 
 * When you resize the thing, sound effect and glow. And that also happens when you push it against the side




--------Redesign
Pair of circles. Can think of them as being like darts boards
They are color A. A pie-chart-like segment of them is color B.
	Screw anti-pi chart people. You're not estimating area, it is length.

Maybe one of the platforms makes the balls small. Then you see the result from above
You are controlling P(ball spotty | ball red) by moving the ends of the segment
If you're going to control this table you will see that there is only one angle such that the probabilities are independent
biases people towards believing that all probabilities are dependent?

 Need to be fair to people about the medical test thing
 	When you say "you get a test" people think "well I probably am already a bit worried then".

 The only situation where you're allowed to say p = 1 is where a is in S by definition.

Put your conclusion at the top? Is it a tree? does conclusion go at middle?
	We want to see what is "supporting" it lol
	Eventually you terminate with nodes you're certain of?

"Bayes net" might not be what you want. But if it is:
	Nodes are conditions, i.e. "slice filters that the points pass through"

What're the balls, to a historian? They're not predicting the future
	I guess it's a universe or a "timeline for the history of humanity"
	Input: set of facts
	This could allow for better division of labor among historians: "you work on THIS node"
	Allow them to standardize how much they trust source X.
	Allow them to standardize how much they trust source X when it is talking about Y
	Allow them to standardize levels of rigor; it's bad for historian X to be the most rigorous
				  standardize inference: it's bad if the most interesting issues get the only smart historians
	Graph gets nontrivial when you make multiple arguments for one thing
		So you have B and C. But then C has an impact on B (eg source B just repeated source C),
		Historians no longer have to choose a linear order, which is this subjective choice you make
	You no longer have to follow potentially very dull prose.
	The "talent" of argument in history may be abut parsing many
	  history papers into a set of inferences plus claims about reliability.
	Intuitive to all: if you have 10 sources of reliability 0.9, probably 1 is not going to tell the truth.
	Make decisions about which sources need more scrutiny. Some might be heavily scrutinized but unused
	Then you have a database somewhere
	You might be compelled to say "source A says it is based on source B, so might as well disregard A".
		But what is the probability that A knew something you didn't? That it was wrong to say it was based entirely on source A?
	Some sources are very unreliable, but if you have a bunch then you can make a case
	Hmm, there are lots of things that a source might have said that are lost to history
		So there are lots of things we'd like to update on, eg we know P(A|B)
		  but we're not certain of P(B). Hopefully that is built into Bayes


Unconnected nodes: P(A|B)=P(A)
If this were the case for some conclusion A and fact B, you wouldn't bring up B.

A convergence = an inference = an update = an application of Bayes theorem:
	A belief about the value of P(B) (possibly 1) 
	A belief about the value of P(A|(B||!B) - the "prior". Hard/impossible to be rigorous about but necessary
	A belief about the value of P(B|A) - the level of bias towards saying A that B has
	from which we infer P(B) is so-and-so
	
It's really about sources
	P(Cicero would say Tully wants to be emperor)
	Cicero said Tully wants to be emperor.
	Cicero and Tully are random people from the population
	P(Tully wants to be emperor | Cicero says he did)
	 = P(Cicero says he did|Tully wants to be emperor) * P(Cicero says he did) / P(Tully wants to be emperor)
	P(Cicero says he did|Tully wants to be emperor) is precisely cicero's reliability

A node that only flows into others has P = 1.
It might be something like "the GDP of England in 800AD was £1000". Rather weird to say but yes, that's where you start


TODO
	Nodes
	Arrows that flow into them
	Click on an arrow convergence(divergence?), this pair of slice-shaped filters. "Zoom in on"
	A thing that asks you for inputs in plain language? Console.logs.
		For a historian with sources (this is an interface thing, a general pattern, not the way it shall always be, in some sense it shall always be simpler):
			"What or who is the thing you are concerned with?" s
			"What kind of thing is e?" S
			"What property are you attributing to them?" A
			"You are claiming that s, which is an S, has the property A."

			"Please give me a source that agrees that s has the property A?" X
			"Assume your claim is true. What is the probability that you would be able to find that X agreed that s had property A?
			  Please take account of the chance that they didn't know that s has the property A and made the claim anyway" p
			"What is the probability of a random S having the property A? This might be a hard one, but you do need it."
			"Ok, your posterior probability is: "

			"Probably s is not just any old random S. They might well have some other properties"

			"There are two things we can do now. Click your claim to add another source, or click s to clarify what kind of an S he/she/it is"
			Second one lets you add more properties.

			Hitler
			Non-jewish German politician in 1930
			Hated christians
			Goebbels
			0.4
			



			You do the same thing creating an S2. Then, "What is the probability S2 is influenced by S1?" somehow
	Allow them to be charitable and uncharitable to sources
		Like they give every source a min and max reliability
	Sit down with Rory and make one based on an argument he has seen in some paper.
		In the course of doing it you might come upon something where he says
			"Ok so this inference needs you to know X. But everyone knows that"
			- but that is exactly the point, we have identified a hidden assumption

Script
	Imagine you're playing a werewolflike 
	you know everyone's probability of being a werewolf
	and you are the judge of person X.
	and everyone except you knows who the werewolves are
		Rather trivial given that you know P(A accuse X| A Werewolf, X !Werewolf) = 1
		You know everyone's probability of double-bluffing?


*/


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
			new THREE.Vector3(1,0,0)
	);
	singleHolderGeometry.faces.push(
			new THREE.Face3(0,1,6),
			new THREE.Face3(4,1,6),
			new THREE.Face3(4,5,6),
			new THREE.Face3(7,5,6),
			new THREE.Face3(7,5,2),
			new THREE.Face3(7,3,2)
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

/*

Probably this visualization doesn't go up to more than two variables.
Attempt a dimension up; maybe to be discussed with Ivans:
	concentric spheres with probably-circular regions of them.
	Huh this is venn diagrams
	And yyyyeah you would probably be able to move it around such that it'd have any set of overlaps you like
You can grab and move the regions both on plane and sphere
Stereographically project down onto plane
Surely this doesn't work, if you know the overlap of three spheres then their three-way overlap is determined.
Well, maybe that's the way the probability necessarily works out?
	If you know P(A|B),P(B|C),P(C|A),P(A),P(B),P(C), then you know P(A,B|C)?
	If that is not the case, it might be that circles are not the right way to do this.
	Yeah probably doesn't work. First three low, second three high. Zero three-way overlap
	Sooo the question is can you make a venn diagram with any set of joint probabilities?
Hmm, venn diagrams are cool but there's something to be careful about with them:
	A randomly laid down set of ellipses or whatever will have some amount of overlap. That's intuitive
	But a specific set of joint probabilities implies a certain shape for things
	Perhaps the way to make them is to think about manipulating length over the full circuit of the flower


 */