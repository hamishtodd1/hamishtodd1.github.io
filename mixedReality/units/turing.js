/*
	This is worth doing, this is fundamental.
		It shouldn't just be a bunch of pretty pictures
		Agent based/mean field distinction
		Make people understand the real maths
		Things colliding, just like in a video game! Urgh

	Dumb idea you thought up yourself
		texture. 1 channel.
		Each pixel has
			"whether or not there is a blob of a given color in it"
			"the direction of travel of that blob
		Each frame you look at the pixels around you, take them in, do the "reaction" potentially
		Randomize their direction? How
		want to get all points within a certain radius
		then check their element


	But what exactly is a reaction diffusion system? Well, I have a simple simulation of one here
		it's quite interesting and dynamic
		You can make lots of pretty stuff with some fairly clear resemblence to different animals
		Especially if I change the colors
	But how the reason that we can make all of these patterns using a computer is because Alan Turing allowed us to understand them so well
		So what is our understanding? Well, we're going to zoom in and slow down
	Full of particles, just moving around randomly, which is what what molecules do all the time
	Now "diffusion" is something that you can already see going on here, and I'm going to make it a bit easier to see. Let's pause
	Suppose that for some reason you have a situation where, temporarily, we have a high concentration of one kind of molecule in one place like this
	If we let time run forward, it all spreads out slowly, and eventually it's all completely equal
		This situation is exactly what you have when somebody farts, as captured by this thermal camera
	Aaaaand this is what diffusion is, the spreading out of chemicals until everything is mixed
		and this can be nice on its own, and let you model other things like heat

	The reaction part you can probably guess. Let's zoom in again and pretend there are very few molecules around.
	The chemicals that we can see now can transform into one another
		If a 0 		collides with a 0 			it turns into a red.
		If a red 	collides with two greens 	it turns into a green.
		If a green 	collides with a 1			it turns into a 1.
	Now all of these colored balls are standing in for real molecules, and the transformations happen for example because one molecule is losing an oxygen atom
		(pics) that you can buy for yourself and put in real test tubes, actually there are quite a few different chemicals that have basically this relationship to one another
		But Alan Turing, when he was talking about these, he said he really didn't care very much what the chemicals were at all
		That's a interesting thing to say and I'll come back to that.
		But the point is that these simple collisions and transformations are just something you have to accept can happen under certain circumstances,
		(video) possibly because an organism has evolved to have molecules in it that work this way
	And this is the cool part, that all you need is a few areas where this is going on and it causes some funny color changes.
	Now there are really only two of them that are changing right now, so let's focus on those
	And now if we zoom out we see that our simple chemical reactions, together with diffusion, are giving us some very interesting things.


	Features needed:
		Painting
		Zoom in/out (and make atoms appear, elegantly)
		Thick borders between cells?
		Slow down
		Show those that don't react
		Show only those that react into one another
		Reduce such that there are only enough to see a single reaction
		Switch to diffusion-only
		Change colors.
		Confine to a single square
		"paint"
		randomize

	this is the part that allows for the diversity of reaction diffusion systems (show all the videos), because there are many chemicals that react in lots of different ways
	
	have the background of the box reflect the chemicals in there

	https://www.youtube.com/watch?v=Av6EUqf10vM
*/

//would be nice if it is when you zoom out that they blur together
function initGrayScottParticles(displayMesh, state)
{
	const MAX_FOR_CORRECT_COLLISIONS = 3000; //sooooo in order to make use of this you... have to do a gray scott anyway
	let numPoints = 20000;

	let particlesGeometry = new THREE.Geometry();
	particlesGeometry.vertices = Array(numPoints)
	particlesGeometry.colors = Array(numPoints)
	let particles = Array(numPoints);
	let limits = {
		// left:	-0.,
		// right:	1.,
		// top:	0.,
		// bottom:	-1.
		left:	0./64,
		right:	1./64,
		top:	0./64,
		bottom:	1./64
	}

	for(let i = 0; i < numPoints; i++)
	{
		particles[i] = {
			position: new THREE.Vector3(
				(limits.right-limits.left) * Math.random() + limits.left,
				(limits.top-limits.bottom) * Math.random() + limits.bottom,
				0),
			element: Math.floor(Math.random() * 3)
		}

		particlesGeometry.vertices[i] = particles[i].position;
		particlesGeometry.colors[i] = new THREE.Color()
	}

	let particlesMesh = new THREE.Points(particlesGeometry, new THREE.PointsMaterial(
	{
		vertexColors: THREE.VertexColors
	}))
	displayMesh.add(particlesMesh)

	let scaleSuchThatParticlesDifferentiate = 2.;
	function setScale(newScale)
	{
		displayMesh.scale.setScalar( newScale )
		log(newScale)
		displayMesh.material.uniforms.blackOverride.value = newScale > scaleSuchThatParticlesDifferentiate;
		particlesMesh.material.size = 0.0001 * newScale
		log(state.toString())
	}
	setScale(displayMesh.scale.x)
	bindButton("up",function(){},"zoom in",function()
	{
		setScale(clamp(displayMesh.scale.x * 1.05,0.27,15))
	})
	bindButton("down",function(){},"zoom out",function()
	{
		setScale(clamp(displayMesh.scale.x * .9,0.27,15))
	})

	{
		var effectPoints = Array(100)
		for(let i = 0; i < effectPoints.length; i++)
		{
			let effectPoint = new THREE.Points( new THREE.Geometry(), new THREE.PointsMaterial({size: 0., color:discreteViridis[2].color}) )
			effectPoints[i] = effectPoint
			effectPoint.geometry.vertices.push( new THREE.Vector3() )
			particlesMesh.add(effectPoint)
			effectPoint.positionToCopy = particles[0].position;
		}
	}

	// let pl = new THREE.Mesh(new THREE.PlaneBufferGeometry(limits.top-limits.bottom,limits.right-limits.left), new THREE.MeshBasicMaterial({color:0x000000}))
	// scene.add(pl)
	// pl.position.copy(particlesMesh.position)
	// pl.position.z -= 0.001

	let paused = {value:false}
	bindToggle("p",paused)

	updateFunctions.push(function()
	{
		if(paused.value)
		{
			return
		}

		let reactionProbability = 0.001;

		//nah, not "reaction probability"
		//in theory all you have to do is figure out how many you'd like to transform then transform that number

		let theta = 0.;
		let speed = 0.;
		let numNearby = 0;
		for(let i = 0; i < numPoints; i++)
		{
			let p = particles[i];

			// theta = Math.random() * TAU;
			// speed = Math.random() * 0.003;
			// p.position.x += speed * Math.cos(theta);
			// p.position.y += speed * Math.sin(theta);

			// if(p.position.x > limits.right)
			// {
			// 	p.position.x = limits.right - (p.position.x - limits.right)
			// }
			// if(p.position.x < limits.left)
			// {
			// 	p.position.x = limits.left + (-p.position.x + limits.left)
			// }
			// if(p.position.y > limits.top)
			// {
			// 	p.position.y = limits.top - (p.position.y - limits.top)
			// }
			// if(p.position.y < limits.bottom)
			// {
			// 	p.position.y = limits.bottom + (-p.position.y + limits.bottom)
			// }

			// if(p.element === 0 && Math.random() < 0.01)
			// {
			// 	p.element = 1 //1 gets fed by 0
			// }
			// if(p.element === 2 && Math.random() < 0.01)
			// {
			// 	p.element = 0 //2 gets killed to 0
			// }

			// hmm. Look so by definition if there are enough of them that this is slow,
			// this gets slow around the 6000 mark, which is enough that you aren't seeing the things
			// if( p.element === 1 )
			// {
			// 	if(numPoints > MAX_FOR_CORRECT_COLLISIONS)
			// 	{
			// 		if( Math.random() < reactionProbability )
			// 		{
			// 			p.element = 2;
			// 		}
			// 	}
			// 	else
			// 	{
			// 		numNearby = 0;
			// 		for(let j = 0; j < numPoints; j++)
			// 		{
			// 			if( particles[j].element === 2 &&
			// 				particles[j].position.distanceToSquared( p.position ) < 0.001 )
			// 			{
			// 				numNearby++;
			// 			}
			// 		}

			// 		if( numNearby >= 2 )
			// 		{
			// 			p.element = 2;

			// 			let ourEffectPoint = effectPoints[0];
			// 			for(let j = 1; j < effectPoints.length; j++ )
			// 			{
			// 				if( effectPoints[j].material.size < ourEffectPoint.material.size )
			// 				{
			// 					ourEffectPoint = effectPoints[j];
			// 				}
			// 			}

			// 			ourEffectPoint.material.size = particlesMesh.material.size * 6;
			// 			ourEffectPoint.positionToCopy = p.position
			// 		}
			// 	}
			// }

			particlesGeometry.colors[i].copy( discreteViridis[particles[i].element].color )

			particlesGeometry.colors[i].setRGB( state[0], state[1], 0. )

			// black (can switch to blue) ones that occasionally turn red
			// aaaaand green ones can occasionally turn black
		}

		particlesGeometry.verticesNeedUpdate = true;
		particlesGeometry.colorsNeedUpdate = true;

		for(let i = 0; i < effectPoints.length; i++)
		{
			effectPoints[i].geometry.vertices[0].copy( effectPoints[i].positionToCopy )
			effectPoints[i].geometry.verticesNeedUpdate = true;
			effectPoints[i].material.size -= 0.002;
		}
	})
}

async function initGrayScottSimulation(gl)
{
	let dimensions = new THREE.Vector2(64,64);
	let numStepsPerFrame = 2;

	let state = new Float32Array( dimensions.x * dimensions.y * 4 );
	for ( let row = 0; row < dimensions.y; row ++ )
	for ( let column = 0; column < dimensions.x; column ++ )
	{
		let firstIndex = (row * dimensions.x + column) * 4;

		state[ firstIndex + 0 ] = 0.;
		state[ firstIndex + 1 ] = 0.;
		state[ firstIndex + 2 ] = 0.;
		state[ firstIndex + 3 ] = 0.;

		// let d = sq(row)+sq(column)
		// if(  )

		// if( 4 < column && column < 8 )
		// {
		// 	state[ firstIndex + 0 ] = 1.;
		// }
		// if( 4 < row && row < 8 )
		// {
		// 	state[ firstIndex + 1 ] = 1.;
		// }
	}

	let brush = new THREE.Vector2(.5,.5);

	let displayMaterial = new THREE.ShaderMaterial( {
		blending: 0, //prevent default premultiplied alpha values
		uniforms:
		{
			simulationTexture: { value: null },
			blackOverride:{ value: false },
			brush
		},
		vertexShader: [
			'precision highp float;',
			'varying vec2 vUV;',

			'void main (void) {',
				'vUV = uv;', //necessary? Needs to be varying vec2
				'gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );',
			'}'
		].join( '\n' ),
		fragmentShader: [
			'precision highp float;',
			'varying vec2 vUV;',
			'uniform sampler2D simulationTexture;',

			'uniform bool blackOverride;',

			//discrete viridis
			'const vec4 pallette1 = vec4(0.984375,0.89453125,0.1171875,1.);',
			'const vec4 pallette2 = vec4(0.28515625,0.7421875,0.328125,1.);',
			'const vec4 pallette3 = vec4(0.1640625,0.27734375,0.4765625,1.);',

			// 'const vec4 pallette1 = vec4(0.,0.,0.,1.);',
			// 'const vec4 pallette2 = vec4(0.,1.,0.,1.);',
			// 'const vec4 pallette3 = vec4(1.,0.,0.,1.);',

			'void main (void)',
			'{',
				'if(blackOverride)',
				'{',
					'gl_FragColor = vec4(0.,0.,0.,1.);',
					'return;',
				'}',

				'vec2 uv = texture2D(simulationTexture, vUV).rg;',
				'float r = uv.r; // < .5 ? 0.:1.;',
				'float g = uv.g; // < .1 ? 0.:1.;',

				'gl_FragColor = r * pallette3 + g * 2. * pallette2;',
				'gl_FragColor.a = 1.;',
			'}'
		].join( '\n' )
	} );

	let paused = await Simulation(
		dimensions,"grayScottSimulation", "periodic", state, numStepsPerFrame,
		displayMaterial.uniforms.simulationTexture,
		{brush:{value:brush}} )

	let displayMesh = new THREE.Mesh(
		new THREE.OriginCorneredPlaneBufferGeometry( dimensions.x / dimensions.y, 1. ),
		displayMaterial );
	scene.add( displayMesh );
	displayMesh.scale.setScalar(0.3)
	displayMesh.position.copy(hands[0].position)
	displayMesh.position.x -= displayMesh.scale.x/2
	displayMesh.position.y -= displayMesh.scale.y/2

	updateFunctions.push(function()
	{
		brush.copy(rightHand.position)
		brush.y -= 1.6;
		brush.multiplyScalar(1./displayMesh.scale.x)
		brush.x += .5;
		brush.y += .5;
	})

	initGrayScottParticles(displayMesh, state)
}

//Quadtree
// {
// 	//surely if you have to rebuild the fucking thing every time, very little has changed

// 	//discrete grid but particles (which may be larger than a grid square) move pretty fast
// 	//yeah it's a question of constraining the set of places they might be

// 	//Because recording, you probably do need to have a simulation where you're guaranteed some collision.
// 	//Ehhhhh... not necessarily, It's probably ok to have a dozen on screen or whatever

// 	//trickery option: could do your mean field thing and just randomly select some points to transform and delete
// 	//would probably be transparently shit though!

// 	let qt = d3.quadtree()
// 	let a = [2.2,1.2]
// 	a.selected = false
// 	a.scanned = false

// 	let b = [3.3,1.3]
// 	b.selected = false
// 	b.scanned = false

// 	qt.addAll([a,b])
// 	log(qt)


// 	function inCircle(x, y, cx, cy, radius) {
// 		return (x - cx) * (x - cx) + (y - cy) * (y- cy) < radius * radius;
// 	}

// 	function rectCircleIntersect(rx, ry, rwidth, rheight, cx, cy, radius) {
// 		let dx = cx - Math.max(rx, Math.min(cx, rx + rwidth));
// 		let dy = cy - Math.max(ry, Math.min(cy, ry + rheight));
// 		return (dx * dx + dy * dy) < (radius * radius);
// 	}
// 	// Find the nodes within the specified circle.
// 	function search(quadtree, cx, cy, radius)
// 	{
// 		quadtree.visit(function(node, x1, y1, x2, y2) {
// 			if (!node.length) {
// 				do {
// 					var d = node.data;
// 					d.scanned = true;
// 					d.selected = inCircle(d[0], d[1], cx, cy, searchRadius);
// 				} while (node = node.next);
// 			}

// 			return !rectCircleIntersect(x1, y1, x2 - x1, y2 - y1, cx, cy, searchRadius);
// 		});
// 	}
// }