/*
	Liquid
		Hybrid approach?
			So long as you start the points off in a parallelogram shape, possibly it is ok for them to twitch a little before moving
			Interpolate the distance function between some value and some other?
		Could use GL_POINTS to avoid overdraw
			Points need a bigger radius than the balls, specifically big enough to contain the largest smoothMin extension
			On the other hand there might be some point at which you're zoomed all the way in on it
		Balls and springs
			Triangles area preserved
			The vertices are at the boundary, and are connected with springs to the middle
			You can change the length of the springs
			No good for merging though

	Meta
		most important is to conserve area
		This may be astonishingly misguided and you are better off leaving it to the artist
		Amount of time this is worth?
			May turn out to be unnecessary
			Bivectors and trivectors are quite interesting and exotic. It makes sense to give them an intriguing characterization

	Which bivectors are positive, which negative?
		Look if you're asking "what is the bivector that gets vector a to vector b?" Then you can have your answer, it's red or blue depending on clockwise or counter
		Obviously (hah, except for story with dad) if you turn two vectors around you are changing, therefore one side is one way and one t'other
		Why don't vectors have this going on?

	Other ideas
		little ripples going diagonally
		Requirements:
			ability to control it
			probably ability to know when
			You don't exactly know what you want yet, figure out the needs first while having something temporary, probably lerping
			There are going to be multiple blobs in the same plane that get combined into one
			It probably needs to be able to become LOTS of special-case things, probably even take on special case animations
				For example, say there's some new scene where the bivector has some specific interesting embodiment
			Should converge fast, ideally fast enough to know exactly how to control
		Some geometric flow. It might be a scalar field
			Geodesic flow preserves volume
				It would be great to know this because it'd be transferrable to a project related to hamiltonians / stat mech
				https://en.wikipedia.org/wiki/Liouville%27s_theorem_(Hamiltonian)
				https://math.stackexchange.com/questions/2221237/geodesic-flow-preserves-the-volume-liouville-s-theorem
			Mean curvature aka "surface tension flow"
				Too general or not general enough? https://mathoverflow.net/questions/265670/derivation-of-the-volume-preserving-mean-curvature-flow	
			A Hyperbolic Geometric Flow for Evolving Films and Foams
				They have an area correction step
			ALGORITHMS FOR AREA PRESERVING FLOWS
		Diffusion?
			Very simple equation of course
		Loads of special cases
			Would be nice if you can find some underlying thing
*/

async function initPerimeterBivectorAppearance()
{
	// initFluidBivectorAppearance()
	// return

	let interior = new THREE.Mesh(new THREE.Geometry(), new THREE.MeshBasicMaterial({ color: 0xFF0000, side: THREE.DoubleSide, transparent: true, opacity: .6 }))
	let exterior = new THREE.Mesh(new THREE.Geometry(), new THREE.MeshBasicMaterial({ color: 0x0000FF, side: THREE.DoubleSide, transparent: true, opacity: .6 }))

	let bivectorAppearance = new THREE.Group()
	bivectorAppearance.add(interior, exterior)
	scene.add(bivectorAppearance)

	let bandLength = 32 + 1
	function fillIn(geometry)
	{
		for (let i = 0; i < bandLength; i++)
		{
			geometry.vertices[i * 2 + 0] = new THREE.Vector3()
			geometry.vertices[i * 2 + 1] = new THREE.Vector3()

			if (i !== 0)
			{
				geometry.faces.push(
					new THREE.Face3(i * 2 - 2, i * 2 + 1, i * 2), //0,3,2		2| /|3
					new THREE.Face3(i * 2 - 2, i * 2 - 1, i * 2 + 1)  //0,1,3		0|/_|1
				)
			}
		}
	}
	fillIn(interior.geometry)
	fillIn(exterior.geometry)

	function bandVertexArray()
	{
		let arr = Array(bandLength * 2)
		for (let i = 0; i < bandLength * 2; i++)
			arr[i] = new THREE.Vector3()

		return arr
	}

	let iv = interior.geometry.vertices
	for (let i = 0; i < bandLength; i++)
	{
		iv[i * 2 + 0].set(1., i * 1, 0.)
		iv[i * 2 + 1].set(2., i * 1, 0.)
	}

	let ev = exterior.geometry.vertices
	for (let i = 0; i < bandLength; i++)
	{
		ev[i * 2 + 0].set(.5, i * 1, 0.)
		ev[i * 2 + 1].set(1., i * 1, 0.)
	}

	let circleValues = null
	let sliceValues = null
	let squareValues = null
	{
		circleValues = {
			iv: bandVertexArray(),
			ev: bandVertexArray(),
		}
		for (let i = 0; i < bandLength; i++)
		{
			let theta = i * TAU / (bandLength - 1)

			circleValues.iv[i * 2 + 1].set(1., 0., 0.)
			circleValues.iv[i * 2 + 1].applyAxisAngle(zUnit, theta)

			circleValues.ev[i * 2 + 0].copy(circleValues.iv[i * 2 + 1])
			circleValues.ev[i * 2 + 1].copy(circleValues.iv[i * 2 + 1])
			circleValues.ev[i * 2 + 1].multiplyScalar(1.1)
		}

		sliceValues = {
			iv: bandVertexArray(),
			ev: bandVertexArray(),
		}
		// sliceValues.iv[0].set(0.,0.,0.)
		let fullAngle = 1. //arbitrarily chosen, dunno what to do with this
		for (let i = 0; i < bandLength; i++)
		{
			let theta = i * fullAngle / (bandLength - 1)

			sliceValues.iv[i * 2 + 1].set(1., 0., 0.)
			sliceValues.iv[i * 2 + 1].applyAxisAngle(zUnit, theta)

			sliceValues.ev[i * 2 + 0].copy(sliceValues.iv[i * 2 + 1])
			sliceValues.ev[i * 2 + 1].copy(sliceValues.iv[i * 2 + 1])
			sliceValues.ev[i * 2 + 1].multiplyScalar(1.1)
		}

		squareValues = {
			iv: bandVertexArray(), //interior
			ev: bandVertexArray(), //exterior
		}
		for (let i = 0; i < bandLength; i++)
		{
			let theta = i * TAU / (bandLength - 1)

			let thetaInFundamentalDomain = theta //fundamental domain is triangle
			while (thetaInFundamentalDomain > TAU / 4.)
				thetaInFundamentalDomain -= TAU / 4.
			if (thetaInFundamentalDomain > TAU / 8.)
				thetaInFundamentalDomain = TAU / 4. - thetaInFundamentalDomain
			let pInFundamentalDomain = new THREE.Vector3()
			pInFundamentalDomain.set(1.0, 0., 0.)
			pInFundamentalDomain.applyAxisAngle(zUnit, thetaInFundamentalDomain)
			let inflationFactor = 1. / pInFundamentalDomain.x

			squareValues.iv[i * 2 + 1].set(1.0, 0., 0.)
			squareValues.iv[i * 2 + 1].applyAxisAngle(zUnit, theta)
			squareValues.iv[i * 2 + 1].multiplyScalar(inflationFactor)

			squareValues.ev[i * 2 + 0].copy(squareValues.iv[i * 2 + 1])
			squareValues.ev[i * 2 + 1].copy(squareValues.iv[i * 2 + 1])
			squareValues.ev[i * 2 + 1].multiplyScalar(1.1)

			squareValues.iv[i * 2 + 0].y *= 2.
			squareValues.iv[i * 2 + 1].y *= 2.
			squareValues.ev[i * 2 + 0].y *= 2.
			squareValues.ev[i * 2 + 1].y *= 2.

			squareValues.iv[i * 2 + 0].x += squareValues.iv[i * 2 + 0].y
			squareValues.iv[i * 2 + 1].x += squareValues.iv[i * 2 + 1].y
			squareValues.ev[i * 2 + 0].x += squareValues.ev[i * 2 + 0].y
			squareValues.ev[i * 2 + 1].x += squareValues.ev[i * 2 + 1].y
		}
	}

	for (let i = 0, il = ev.length; i < il; i++)
	{
		ev[i].copy(sliceValues.ev[i])
		iv[i].copy(sliceValues.iv[i])
	}

	let valuesToLerpTo = squareValues
	updateFunctions.push(function ()
	{
		for (let i = 0, il = ev.length; i < il; i++)
		{
			ev[i].lerp(valuesToLerpTo.ev[i], .1)
			iv[i].lerp(valuesToLerpTo.iv[i], .1)
		}

		interior.geometry.verticesNeedUpdate = true
		exterior.geometry.verticesNeedUpdate = true
	})

	bindButton("q", function ()
	{
		valuesToLerpTo = valuesToLerpTo == sliceValues ? squareValues : sliceValues
	})

	return bivectorAppearance
}

async function initFluidBivectorAppearance()
{
	let elements = new Float32Array(8)
	elements[4] = 1.

	let numBlobs = 60; //IF YOU WANT TO CHANGE THIS THEN CHANGE IT IN THE FRAGMENT SHADER TOOOO!!!!!
	//is it possible to extract a constant from a compiled shader?

	let positions = Array(numBlobs);
	let velocities = Array(numBlobs); //next thing to do is get an array in there, suuuurely possible

	for (let i = 0; i < numBlobs; i++)
	{
		velocities[i] = new THREE.Vector3()
		positions[i] = new THREE.Vector3(
			(Math.random() - .5) * 2.,
			(Math.random() - .5) * 2.,
			0.)
	}

	for (let i = 0; i < numBlobs; i++)
	{
		let index = Math.round(Math.random())
		positions[i].setComponent(index, positions[i].getComponent(index) + 3.4)
	}

	let material = new THREE.ShaderMaterial({
		uniforms: {
			positions: { value: positions },
			radius: { value: .15 },
			smooshedness: { value: 0.7 }, //1.45
			bivector: { value: new THREE.Vector3() }
		}
	});
	await assignShader("bivectorVertex", material, "vertex")
	await assignShader("bivectorFragment", material, "fragment")

	{
		//TODO of course it's bloody built in somewhere
		// material.uniforms.pointLightPosition = {value:new THREE.Vector3()}
		// let pointLight = scene.children[2];
	}

	bindButton("]", function () { }, "", function ()
	{
		material.uniforms.smooshedness.value += .03
		log(material.uniforms.smooshedness.value)
	})
	bindButton("[", function () { }, "", function ()
	{
		material.uniforms.smooshedness.value -= .03
		log(material.uniforms.smooshedness.value)
	})

	let plane = new THREE.Mesh(new THREE.PlaneBufferGeometry(20., 20., 10, 10), material);
	scene.add(plane);

	let fieldAcceleration = new THREE.Vector3()

	// let circleRadius = 1.1
	// let fieldIndicator = new THREE.Mesh(new THREE.CircleBufferGeometry(circleRadius,32), new THREE.MeshBasicMaterial({color:0x00FF00,transparent:true,opacity:.6}))
	// scene.add(fieldIndicator)

	let circleCenter = new THREE.Vector3()
	bindButton("a", function ()
	{
		if (circleCenter.equals(zeroVector))
		{
			circleCenter.copy(xUnit).multiplyScalar(3.)
		}
		else
		{
			circleCenter.set(0., 0., 0.)
		}
	})

	let inherentFriction = .0015
	let repulsiveForceMagnitude = .00200001;
	let fieldMagnitude = .0020001
	updateFunctions.push(function () 
	{
		// let acceleration = new THREE.Vector3()
		// function repulsion(distance)
		// {

		// }

		material.uniforms.bivector.value.fromArray(elements, 4)

		if (frameCount < 30)
			return

		let iterations = 1;
		for (let iter = 0; iter < iterations; iter++)
		{
			// let fieldAcceleration = new THREE.Vector3()
			for (let i = 0; i < numBlobs; i++)
			{
				/*
					Arbitrary forcefield
						loop through a set of line segments, get your distance to them
						Not easy to work out whether you're in or out

					slight attraction maybe

					So there's a shape.
					If you're inside the shape, nothing.
					Outside, go in direction of closest part. H

					Adding coplanar bivectors is arguably aberrant and you shouldn't think about it too much

					verlet integration might be nice
				*/

				let p = positions[i]

				// //rectangle
				// // if( Math.abs(p.x) > rectangleWidth / 2. || Math.abs(p.y) > rectangleHeight / 2. )
				// // 	fieldAcceleration.copy(p).negate().setLength(1.)

				//circular
				fieldAcceleration.set(0., 0., 0.)
				// if( p.length() > circleRadius )
				fieldAcceleration.copy(p).sub(circleCenter).negate().multiplyScalar(fieldMagnitude)

				velocities[i].add(fieldAcceleration)

				//sponge balls
				let displacement = new THREE.Vector3()
				for (let j = i + 1; j < numBlobs; j++)
				{
					displacement.subVectors(p, positions[j])
					if (displacement.length() < material.uniforms.radius.value * 2.)
					{
						// debugger;
						displacement.setLength(repulsiveForceMagnitude / displacement.length())

						velocities[i].add(displacement)
						velocities[j].sub(displacement)
					}
				}

				velocities[i].setLength(Math.max(velocities[i].length() - inherentFriction, 0.))
			}

			for (let i = 0; i < numBlobs; i++)
			{
				positions[i].add(velocities[i])
				positions[i].z = 0.; //TODO better projection. If only there was some kind of mathematical system that etc
			}
		}
	})
}