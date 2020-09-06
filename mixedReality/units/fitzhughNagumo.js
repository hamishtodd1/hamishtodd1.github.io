/*
	Make it, show it to friston, tell him what you can do, get 1-2yr postdoc. What does friston have to do with interfaces though?

	TODO
		make the 3d model of the thing
		make it so you can wire them up appropriately
		Color them based on state
		paint initial cond.

	Script
	Title
		Brain waves: can we know enough to simulate our brains yet?
		Brain waves: is this what thoughts look like?
		What actually are brain waves?
	Intro
		Human civilization will one day be able to simulate brains, and
		Here's a very basic simulation, its only sense is a very basic sense of sound, in particular it can only hear this one low frequency: *paaaaarp*
		its only capability is moving away from the fart noise. (or twitching the ear? Hey I can twitch my ear, maybe you can't)
		Lobster, honeybee, mosquito, c elegans
		This doesn't accurately simulate part of a human brain or even part of an animal brain, but it is a brain
		But actually it is already quite an impressive simulation, it already has more neurons than worms and honeybees
		We do now have the technology to scan your brain. Show them that tomogram, just need an obj from chimera
	Neuron wiring
		First we need to understand this - it's a neuron, a very wonderful and beautiful thing which our bodies and especially our brains contain loads of
		This neuron has the ability to create a surge of electricity going all the way through it (hopefully chemistry unneccessary)
		The surge disappears quickly and there's a period during which it can't surge again, but that's sort of all it needs
		Here's a video of a real neuron creating a surge of electricity
		But why do neurons do this though? Well there are two things.
		One might be the ear
		The other thing that usually causes the neuron to surge is another neuron (bring it in). If we connect these two up, then a surge in this one can cause a surge in this one
		Make some circuit. eg make eyes then say "If you get an alternating pattern of surges from this neuron and this neuron, then this neuron fires, and this might be the zebra-detecting neuron"
	Making sure models work
		So there's the basics, and we've known them really since the 40s, but how far have we gotten with simulating our brains?
		One thing about simulations is that you have to get things right, otherwise your simulation won't replicate the results of your experiments
		And if we're talking about simulating a human's brain, then what this means is that we might set up a simulation and
			find that the simulated human either behaves in a slightly weird way, or they behave in a REALLY weird way, like all they do is jump up and down and have epileptic seizures.
		So if we clear all the crap away, does this one simulated neuron replicate the results of experiments? The answer is yes
		Sometimes mother nature scientists a gift, and in 1950(?) mother nature's gift was the giant squid.
			In particular, this genus(?) of squid has a single neuron that is, in comparison with other neurons, gigantic
		It's important to understand how we're simulating even this one neuron. HH->FHN
		There is also a variant of this simulation that is used to simulate heart tissue, because heart cells are actually quite similar to neurons. This model works so well it is FDA approved
	Dealing with the fact that resources are limited
		Any brain that we simulate will have to have some amount of simplification
		Even Hodgkin Huxley neurons are a pain in the ass. This thing (the sim) does not use HH. Could graph the 4 variables?
		FHN!
		Interestingness that the simplification was discovered independently. Supports the idea that this simplification is a fundamental insight, the ur-neuron
		Compare FHN and HH side by side
		In simplifying, we lose something
			This means that if I scan your brain and run fitzhugh nagumo with it, probably you'll behave differently to RL
			Doing that is just kicking the can down the road. One day we will simulate brains with atomic detail
			Simple as FHN - or maybe even simpler, maybe just like a neural net
		Because computers have to use these simplifications, it will always be reasonable to object that no brain simulation is ever accurate.
			You could even say that HH is nowhere near enough, you have to simulate from the electrons upward, and you have to have an analytical solution for the schrodinger equation!
		On the other hand, neurons are so diverse that it's probably reasonable to say that really they're just a lot of complex infrastructure trying to do somehting simple
		We all have slightly different neurons due to mutations. Are you saying that
		This kind of argument was anticipated by this great man though. Ultimately, Turing test is the goal!


	Have a brain, zoom in, it's made of neruons
	Patch clamping
	We are ignoring
		Different kinds of neuron
		Myelin
		You need to know chemistry for real neuroscience
			cure epilepsy
			alzheimers
			hormones
			depression
			Different neuron setups should give you different wave patterns
	Philosophy
		What happens if I freeze this thing then duplicate it and run it?
		If I save out all the frames it makes then "play them back" but don't run the code that derives them?
		There are, well, questions about which entities are conscious and which aren't
			If it's about number of neurons, long-finned pilot whales deserve a lot of attention
			Is an unborn child conscious? Is a born child conscious? If so how come
			A comatose patient
*/

async function initFitzhughNagumo()
{
	let dimension = 128; //still kinda works at 180, but uh, best not to go there
	let textureDimensions = new THREE.Vector2(dimension,dimension*dimension);

	let initialState = new Float32Array( textureDimensions.x * textureDimensions.y * 4 );

	let layersToExciteU = [dimension / 2 + 10,dimension / 2 + 11];
	let layersToExciteV = [dimension / 2 + 12,dimension / 2 + 13,dimension / 2 + 14,dimension / 2 + 15];

	//try it as a blob!
	let ijkToI = (i, j, k) => i + k * dimension * dimension + dimension * j
	let center = new THREE.Vector3(Math.floor(dimension/2),Math.floor(dimension/2),Math.floor(dimension/2));
	let a = new THREE.Vector3();
	for(let i = 0; i < dimension; i++)
	for(let j = 0; j < dimension; j++)
	for(let k = 0; k < dimension; k++) {
		if( j > dimension / 2. ) {
			let t = (i + .2 * k - dimension / 2 ) * .1;

			initialState[ 4 * ijkToI(i,j,k) + 0] =    Math.exp(-sq( t ));
			initialState[ 4 * ijkToI(i,j,k) + 1] = .5*Math.exp(-sq(t-2));
		}

		// a.set(i,j,k);
		// let t = .12 * a.distanceTo(center);

		// initialState[ 4 * ijkToI(i,j,k) + 1] = Math.exp(-sq( t ));
		// initialState[ 4 * ijkToI(i,j,k) + 0] = Math.exp(-sq(t-2));
	}

	let brush = new THREE.Vector3(.5,.5,.5);

	let extraUniforms = {
		threeDDimensions:{ value:new THREE.Vector3( dimension, dimension, dimension ) },
		brush:{value:brush}
	}

	let numStepsPerFrame = 4;
	var data2d = {value:null};
	await Simulation( textureDimensions, "fitzHughNagumo", "clamped", initialState, numStepsPerFrame, 
		data2d,
		extraUniforms,
		THREE.LinearFilter )

	let scalarField = await scalarFieldVisualization({data2d,dimension});
	updateFunctions.push(function()
	{
		scalarField.position.copy(rightHand.position)

		if(mouse.clicking)
			mouse.rotateObjectByGesture(scalarField)

		// brush.copy( scalarField.worldToLocal(rightHand.position.clone()) )
		// brush.x = -1000

		// scalarField.rotation.y += 0.01
		// scalarField.rotation.x += 0.01
	})
}

function initNeuron() {
	let neuronMaterial = new THREE.MeshStandardMaterial();

	let somaRadius = .025
	let termRadius = .008

	let somaCenter = somaRadius;
	let axonStart = somaRadius + somaRadius * .35
	let axonEnd = axonStart + somaRadius * 5
	let termCenter = axonEnd + termRadius * .35
	let totalLength = termCenter + termRadius;

	let placeWhereAxonMeetsSoma = new THREE.Vector2(Math.sqrt(sq(somaRadius) - sq(axonStart - somaCenter)), axonStart);
	let placeWhereAxonMeetsTerm = new THREE.Vector2(Math.sqrt(sq(termRadius) - sq(axonEnd - termCenter)), axonEnd);
	let somaGuide = new THREE.Vector2(0., somaCenter).sub(placeWhereAxonMeetsSoma).rotateAround(new THREE.Vector2(), -TAU / 4)
	somaGuide.multiplyScalar(1.8)
	let termGuide = new THREE.Vector2(0., termCenter).sub(placeWhereAxonMeetsTerm).rotateAround(new THREE.Vector2(), TAU / 4)
	termGuide.multiplyScalar(1.9)

	let curve = new THREE.CubicBezierCurve(
		placeWhereAxonMeetsSoma,
		somaGuide.add(placeWhereAxonMeetsSoma),
		termGuide.add(placeWhereAxonMeetsTerm),
		placeWhereAxonMeetsTerm)
	log(placeWhereAxonMeetsSoma, placeWhereAxonMeetsTerm)

	let neuronRadialSegments = 64;
	let neuronHeightSegments = 100;
	let neuron = new THREE.Mesh(
		new THREE.CylinderGeometryUncentered(1., totalLength, neuronRadialSegments, neuronHeightSegments),
		neuronMaterial);//should cast shadow on itself
	scene.add(neuron)
	neuron.position.copy(rightHand.position)

	log(neuron.geometry.vertices.length - 2)
	let v = null;
	let radius = -1;
	for (let i = 0; i < (neuronHeightSegments + 1); i++)
	{
		v = neuron.geometry.vertices[i * neuronRadialSegments + 0];

		if (axonStart <= v.y && v.y < axonEnd)
		{
			let proportionThrough = (v.y - axonStart) / (axonEnd - axonStart)
			radius = curve.getPoint(proportionThrough).x;
		}
		else if (v.y < axonStart)
		{
			let distFromSphereCenterOnAxis = Math.abs(v.y - somaCenter)
			radius = Math.sqrt(Math.max(0, sq(somaRadius) - sq(distFromSphereCenterOnAxis)));
		}
		else
		{
			let distFromSphereCenterOnAxis = Math.abs(v.y - termCenter)
			radius = Math.sqrt(Math.max(0, sq(termRadius) - sq(distFromSphereCenterOnAxis)));
		}

		for (let j = 0; j < neuronRadialSegments; j++)
		{
			v = neuron.geometry.vertices[i * neuronRadialSegments + j];
			// v.multiplyScalar(1. + Math.random() * .1)
			v.x *= radius + Math.random() * 0.0014;
			v.z *= radius + Math.random() * 0.0014;
		}
	}

	for (let i = 0, il = neuron.geometry.vertices.length; i < il; i++)
		neuron.geometry.vertices[i].y -= somaRadius;

	neuron.geometry.computeFaceNormals();
	neuron.geometry.computeVertexNormals();

	neuron.rotation.z -= TAU * 3 / 8

	let radialSegments = 8;
	let heightSegments = 4;
	let dendriteRadius = .01
	let dendrite = new THREE.Mesh(new THREE.CylinderGeometryUncentered(dendriteRadius, .1, radialSegments, heightSegments, true), neuronMaterial);//should cast shadow on itself
	scene.add(dendrite)
	dendrite.position.copy(rightHand.position)

	let intendedDendriteEndPosition = new THREE.Vector3();
	let direction = new THREE.Vector3()

	rightHand.visible = false

	updateFunctions.push(function ()
	{
		// neuron.quaternion.copy(rightHand.quaternion)

		intendedDendriteEndPosition.set(0, 1, 1).applyAxisAngle(zUnit, frameCount * .06).add(rightHand.position)

		direction.copy(intendedDendriteEndPosition).sub(neuron.position).setLength(1)
		dendrite.position.copy(direction).setLength(somaRadius * neuron.scale.x).add(neuron.position)
		redirectCylinder(dendrite, dendrite.position, direction)

		// let dendriteDirection = intendedDendriteEndPosition.clone().applyMatrix(neuron.matrixWorldInverse);
		// dendriteDirection.sub()

		dendrite.updateMatrixWorld()
		neuron.updateMatrixWorld()

		let v = new THREE.Vector3()
		for (let i = dendrite.geometry.vertices.length - radialSegments, il = dendrite.geometry.vertices.length; i < il; i++)
		{
			v.copy(dendrite.geometry.vertices[i - radialSegments])
			v.y = 0. //"what the bottom vertices are supposed to be"
			dendrite.localToWorld(v)
			neuron.worldToLocal(v)

			let closestDistSq = Infinity;
			let distSq = 0.;
			let attachingV = new THREE.Vector3()
			for (let j = 0, jl = neuron.geometry.vertices.length; j < jl; j++)
			{
				distSq = v.distanceToSquared(neuron.geometry.vertices[j])
				if (distSq < closestDistSq)
				{
					distSq = closestDistSq
					attachingV.copy(neuron.geometry.vertices[j])
				}
			}


			// log(attachingV)
			neuron.localToWorld(attachingV)
			dendrite.worldToLocal(attachingV)
			dendrite.geometry.vertices[i].copy(attachingV)
		}
		dendrite.geometry.verticesNeedUpdate = true
	})
	/*
		Mesh instancing
		Ehhhhh, ooooor, a few neurons for wiring and a single big mesh
	*/
}