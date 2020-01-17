// for(let i = 0; i < points.length; i++)
// {
// 	for(let j = 0; j < points.length; j++)
// 	{

// 	}
// }

/*
	Amount of time this is worth?
		May turn out to be unnecessary
		Bivectors and trivectors are quite interesting and exotic. It makes sense to give them an intriguing characterization

	Addition
		They glob together on the side where they are both the same color

	Liquid simulation
		Set of balls with momentum, which can be confined to a plane or line or whatever
		For now, have the vertex positions calculated on the CPU. Ideally, no round trip needed
		Some underlying forcefield that sends them to the shape you want
			Probably represented as a texture
			probably just fill in the shape you want in the texture with black (velocity = 0)
				all other pixels are "pointed" in the direction of the nearest bit of that shape
		They bounce off each other / repel
		"Metaballs" in appearance

	
	SDF!

	Which bivectors are positive, which negative?
		The going idea currently is that it's whirlpool-like
		Whatever you decide distinguishes clockwise and anticlockwise (positive and negative) bivectors, that surely applies to vectors
			Maybe you can even deduce it from the trivectors
		Choose a plane:
			y=0
				People do think of "up" as being special
				Conjugation is fundamental
			x+y+z=0
				It seems like for vectors on the x,y,z axes you definitely know which are positive, like this is embedded in your system
			z=0
				This may be just a question of perspective
		It seems like turning the plane around actually DOES turn red into blue?
			Yes, in the same way that looking at the same vector from a different 
			These are spatial things. Of *course* changing your perspective changes the thing itself
		Surely it is arbitary, same as right hand/left hand. The important thing is that for a given plane, 
			whichever ones you decide are positive are all a positive multiple of one another and
			whichever ones you decide are negative are all a positive multiple of one another
		So:
			get the normal vector to that plane
			check its dot product with the vector(float_min,0.,1.)
			If it's positive your bivectors are one way, negative another
			Ideally a vector such that dot product is never 0. If it is sometimes 0 you need to divide that plane in half too

	Other ideas
		Requirements:
			ability to control it
			probably ability to know when
			You don't exactly know what you want yet, figure out the needs first while having something temporary, probably lerping
			There are going to be multiple blobs in the same plane that get combined into one
			It probably needs to be able to become LOTS of special-case things, probably even take on special case animations
				For example, say there's some new scene where the bivector has some specific interesting embodiment
			Should converge fast, ideally fast enough that
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
		Masses and springs
			Triangles area preserved
		Loads of special cases
			Would be nice if you can find some underlying thing
*/

async function initBivectorAppearance()
{
	{
		let numBlobs = 10;
		let blobCoords = new Float32Array(numBlobs*3); //next thing to do is get an array in there, suuuurely possible
		for(let i = 0; i < numBlobs; i++)
		{
			blobCoords[i*3+0] = (Math.random()-.5) * 3.;
			blobCoords[i*3+1] = (Math.random()-.5) * 3.;
		}

		let material = new THREE.ShaderMaterial({
			uniforms: {
				blobCoords: {value: blobCoords}
			},
		});
		await assignShader("bivectorVertex", material, "vertex")
		await assignShader("bivectorFragment", material, "fragment")

		let plane = new THREE.Mesh(new THREE.PlaneBufferGeometry(20., 20., 10, 10), material);
		scene.add(plane);

		updateFunctions.push( function() 
		{
			
		} )

		return
	}

	let interior = new THREE.Mesh(new THREE.Geometry(),new THREE.MeshBasicMaterial({color:0xFF0000, side:THREE.DoubleSide,transparent:true,opacity:.6}))
	let exterior = new THREE.Mesh(new THREE.Geometry(),new THREE.MeshBasicMaterial({color:0x0000FF, side:THREE.DoubleSide,transparent:true,opacity:.6}))

	let bivector = new THREE.Object3D()
	bivector.add(interior,exterior)
	scene.add(bivector)

	let stripLength = 32+1
	function fillIn(geometry)
	{
		for(let i = 0; i < stripLength; i++)
		{
			geometry.vertices[i*2+0] = new THREE.Vector3()
			geometry.vertices[i*2+1] = new THREE.Vector3()

			if( i !== 0 )
			{
				geometry.faces.push(
					new THREE.Face3(i*2-2,i*2+1,i*2  ), //0,3,2		2| /|3
					new THREE.Face3(i*2-2,i*2-1,i*2+1)  //0,1,3		0|/_|1
					)
			}
		}
	}
	fillIn(interior.geometry)
	fillIn(exterior.geometry)

	function vertexArray()
	{
		let arr = Array(stripLength*2)
		for(let i = 0; i < stripLength*2; i++)
			arr[i] = new THREE.Vector3()

		return arr
	}

	let iv = interior.geometry.vertices
	for(let i = 0; i < stripLength; i++)
	{
		iv[i*2+0].set(1,i*1,0.)
		iv[i*2+1].set(2,i*1,0.)
	}

	let ev = exterior.geometry.vertices
	for(let i = 0; i < stripLength; i++)
	{
		ev[i*2+0].set(.5,i*1,0.)
		ev[i*2+1].set(1,i*1,0.)
	}
	
	let circleValues = {
		iv:vertexArray(),
		ev:vertexArray(),
	}
	for(let i = 0; i < stripLength; i++)
	{
		let theta = i*TAU / (stripLength-1)

		circleValues.iv[i*2+1].set(1.,0.,0.)
		circleValues.iv[i*2+1].applyAxisAngle(zUnit,theta )

		circleValues.ev[i*2+0].copy(circleValues.iv[i*2+1])
		circleValues.ev[i*2+1].copy(circleValues.iv[i*2+1])
		circleValues.ev[i*2+1].multiplyScalar(1.1)
	}

	let squareValues = {
		iv:vertexArray(),
		ev:vertexArray(),
	}
	for(let i = 0; i < stripLength; i++)
	{
		let theta = i * TAU / (stripLength-1)

		let thetaInFundamentalDomain = theta //fundamental domain is triangle
		while(thetaInFundamentalDomain > TAU/4.)
			thetaInFundamentalDomain -= TAU/4.
		if( thetaInFundamentalDomain > TAU / 8.)
			thetaInFundamentalDomain = TAU/4.-thetaInFundamentalDomain
		let pInFundamentalDomain = new THREE.Vector3()
		pInFundamentalDomain.set(1.0,0.,0.)
		pInFundamentalDomain.applyAxisAngle(zUnit,thetaInFundamentalDomain)
		let inflationFactor = 1. / pInFundamentalDomain.x

		squareValues.iv[i*2+1].set(1.0,0.,0.)
		squareValues.iv[i*2+1].applyAxisAngle(zUnit,theta)
		squareValues.iv[i*2+1].multiplyScalar( inflationFactor )

		squareValues.ev[i*2+0].copy(squareValues.iv[i*2+1])
		squareValues.ev[i*2+1].copy(squareValues.iv[i*2+1])
		squareValues.ev[i*2+1].multiplyScalar(1.1)

		squareValues.iv[i*2+0].y *= 2.
		squareValues.iv[i*2+1].y *= 2.
		squareValues.ev[i*2+0].y *= 2.
		squareValues.ev[i*2+1].y *= 2.
	}

	let lerpValue = 0.
	updateFunctions.push(function()
	{
		lerpValue += .03
		lerpValue = Math.min(1.,lerpValue)

		for(let i = 0, il = ev.length; i < il; i++)
		{
			ev[i].lerpVectors(circleValues.ev[i],squareValues.ev[i],lerpValue)
			iv[i].lerpVectors(circleValues.iv[i],squareValues.iv[i],lerpValue)
		}

		interior.geometry.verticesNeedUpdate = true
		exterior.geometry.verticesNeedUpdate = true
	})
}