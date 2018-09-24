function initOptics()
{
/*
	Shouldn't this be a stealth game? Could be super fun in 3D with the ability to see the guards' POV

	Terminology (urgh)
		Normal
		Incident / reflected

	Wavelength and speed are separate mechanics. You can have a single wavefront first

	Funky curved mirrors! Eg parabolic
	The mirror does not work the same way as your "receptor" things.
	Make the things you have to make first

	Defffffinitely need to show this is how images are created, otherwise it's just a load of lines
		So probably a "camera" that you can click and it "takes an image". "video" too complex
		Can show 1D case
		Let's just say black and white.
		Then you can "speed them up", to a single frame
		rays get shot from each part of the thing you're looking at
		Thing in a grid, maybe some wires coming out the back of a surface
			Or that might just be unnecessary; just have some "atoms" that change color when hit at a frequency
		Show why you use lenses for so many things in the first place. Unfocusing

	Shortest path principle: could show what a scene looks like from the point of view of "optical path"
		No idea what that means mate

	"Shadow volume" or "light volume" approach. Like nicky's thing

	Objects
		Sources
		Lenses (of which "blockers" are a special case)
		Plates / receivers. Which recieve more or less depending on the angle you get
		The waves themselves, visualized as 2 or 3 or more crests of the waves
	Controls
		Obviously wanna move and rotate lens with both fingers
	Levels
		half-cylinder block
		Draw the lens yourself?
		concave lens
		Eye
			Source is LED array
			Lenses include cornea, iris ("blocker"), 
		Camera
			Photographic plate
			Many lenses, and aperture
			camera lens setup https://upload.wikimedia.org/wikipedia/commons/c/c2/Reflex_camera_simple_labels.svg
		Fingerprint detector
		Insect eye?
		https://en.wikipedia.org/wiki/Total_internal_reflection#Applications
		Burning stuff with magnifying glass
		General relativity thing?
		Prism with splitting
		Fibre optic
			Want to be able to grab and curve it
			Hmm, cladding is only 1% different refractive index!
			If you want to talk about fibre optics, you need to talk about curves
			Very easy to show a surface and show its normals. Useful for curved surfaces like fibre
		Something in which you find critical angle
		Game where you shoot at things underwater
			Want that refracted-pencil thing!
		Deeper water has a different angle of incidence due to greater pressure (more particles around)
			Submarine slide
		Get them to invent the "index of refraction" for themselves
			They see that some materials slow the rays down different amounts
			Get them to rank the materials, stick them on a line?
			So they invent taking the sin?

	So you're missing
		Polarization
		Diffraction (?) - just tell them "these are lasers only"
		The small amount that gets reflected(?)
*/

// {
	/*
		Stuff coming directly out of zoomed-in view
			A thin enough slice of anything will let light through
			Can change wavelength to get different refractions
			the fact that surfaces absorb a lot of light because of roughness. 
			Show what happens if you don't skew the line the correct amount?
			You might have to give up on this. Just

		In this model, do you get TIR?
		this is a big deal, you want all the bouncing etc to emerge from it
		really don't know what it would mean for more than two vertices. Even them, what the end doesn't "hit" the atom... which is point-like?
		well it's like the vertices are moving along as rays? That's why you often show loads at a time?
		how about it's like the edges are elastic? They'll pull

		Project point onto direction of travel. Is it between
	*/
	
// 	var waveFront = new THREE.Line(new THREE.Geometry())
// 	waveFront.geometry.vertices.push(new THREE.Vector3(5,0,0),new THREE.Vector3(-5,0,0))
// 	objectsToBeUpdated.push(waveFront)
// 	waveFront.update = function()
// 	{
// 		var velocityThisFrame = new THREE.Vector3(0,-0.003,0)
// 		for(var i = 0, il = waveFront.geometry.vertices.length; i < il;i++)
// 		{
// 			waveFront.geometry.vertices[i].add(velocityThisFrame)
// 		}
// 		waveFront.geometry.verticesNeedUpdate = true

// 		var velocityNormal = velocityThisFrame.clone().normalize()
// 	}
// 	//a line segment that IS a certain width
// 	//each vertex can get "pushed" by the one at its side

// 	var maxDistanceWeCanGo = refractiveIndexOfMedium * speedInAir
	
// 	var block = new THREE.Mesh(
// 		new THREE.OriginCorneredPlaneBufferGeometry(10,10),
// 		new THREE.MeshBasicMaterial({
// 			color:0xFF0000,
// 			transparent:true,
// 			opacity:0.4
// 		}))
// 	scene.add(block)
// 	block.rotation.z = -TAU/4
// 	block.position.x = -5
// 	block.position.y = -0.25
// 	//ideally wanna be able to paint with the stuff

// 	//well really you want a surface!
// 	scene.add(waveFront)
// }
// return

{
	var mirrorRadius = 0.4;
	var mirror = new THREE.Reflector( new THREE.CircleBufferGeometry( mirrorRadius, 64 ), {
		clipBias: 0.003,
		textureWidth: window.innerWidth * window.devicePixelRatio,
		textureHeight: window.innerHeight * window.devicePixelRatio,
		color: 0x777777,
		recursion: 1
	} );
	mirror.add(new THREE.Mesh(new THREE.CircleBufferGeometry(mirrorRadius*1.04,64), new THREE.MeshBasicMaterial({color:0x000000})))
	mirror.children[0].position.z = -0.001
	scene.add(mirror)
	mirror.rotation.x = -TAU / 4
	mirror.position.y = -0.5

	objectsToBeUpdated.push(mirror)
	clickables.push(mirror)
	mirror.update = function()
	{
		if(mouse.lastClickedObject === this && mouse.clicking)
		{
			mouse.rotateObjectByGesture(this)
		}
	}
}

var rayCaster = new THREE.Raycaster();
var reflectiveMeshes = [];

var projectileGeometry = new THREE.SphereBufferGeometry(0.04);
var speed = 0.01
function Projectile(initialVelocity)
{
	var projectile = new THREE.Mesh(projectileGeometry)
	scene.add(projectile)
	objectsToBeUpdated.push(projectile)

	var normalizedVelocity = initialVelocity.normalize()

	projectile.update = function()
	{
		rayCaster.set(this.position, normalizedVelocity)
		var intersections = rayCaster.intersectObjects(reflectiveMeshes)
		if(intersections.length !== 0)
		{
			var faceNormal = intersections[0].face.normal;
			var portionAfterBounce = speed - intersections[0].point.distanceTo(this.position)
			if(portionAfterBounce < 0)
			{
				this.position.addScaledVector(normalizedVelocity,speed)
			}
			else
			{
				this.position.sub( intersections[0].point ).applyAxisAngle(faceNormal,Math.PI)
				this.position.setLength(portionAfterBounce).add( intersections[0].point )
				normalizedVelocity.applyAxisAngle(faceNormal,Math.PI).negate()
			}
		}
		else
		{
			this.position.addScaledVector(normalizedVelocity,speed)
		}
	}
	return projectile
}

// var dispersions = new THREE.IcosahedronGeometry(0.01,2).vertices;
// for(var i = 0; i < dispersions.length; i++)
// {
// 	Projectile(dispersions[i])
// }

initFibreOptic();
initJewel();

function initFibreOptic()
{
	var fibreOpticCurve = new THREE.Curve();
	fibreOpticCurve.getPoint = function( t )
	{
		var upperLimit = 3;
		var lowerLimit = upperLimit * -1;
		var x = ( t - 0.5 ) * ( upperLimit - lowerLimit )
		var scale = new THREE.Vector3().setScalar(0.25)
		return new THREE.Vector3( x, x*x / 7, 0 ).multiply( scale )
	}
	var fibreOpticGeometry = new THREE.TubeGeometry( fibreOpticCurve, 60, 0.1 )
	var fibreOptic = new THREE.Mesh( fibreOpticGeometry, new THREE.MeshPhongMaterial({
		transparent:true,
		opacity:0.4,
		color:0xFF0000,
		side:THREE.DoubleSide,
		// visible:false
	}) )
	scene.add( fibreOptic );
	reflectiveMeshes.push(fibreOptic)

	var projectile = Projectile(new THREE.Vector3(0,-1,0))
	projectile.position.copy( fibreOpticCurve.getPointAt(0) )
}

function initJewel()
{
	function applyDihedralSymmetry(vertices, numRotations)
	{
		//each triplet of vertices is one triangle
		var geo = new THREE.BufferGeometry();
		geo.addAttribute( 'position', new THREE.BufferAttribute( new Float32Array(numRotations * vertices.length*3), 3 ) );
		
		for(var i = 0; i < numRotations; i++)
		{
			for(var j = 0, jl = vertices.length; j < jl; j++)
			{
				var coords = vertices[j].clone().applyAxisAngle(zUnit, i / numRotations * TAU).toArray();
				for(var k = 0; k < 3; k++)
				{
					geo.attributes.position.array[(i*jl+j)*3+k] = coords[k]
				}
			}
		}
		return geo
	}

	var vertices = []
	
	var octahedronGeometry = applyDihedralSymmetry([
		new THREE.Vector3(0,0,1),
		new THREE.Vector3(0,1,0),
		new THREE.Vector3(1,0,0),

		new THREE.Vector3(0,0,-1),
		new THREE.Vector3(0,1,0),
		new THREE.Vector3(1,0,0)
		], 4);

	function mirrorLastTriangle(array)
	{
		var lowestIndex = array.length-3;
		for(var i = 0; i < 3; i++)
		{
			var newV = array[lowestIndex+i].clone();
			if(newV.y !== 0)
			{
				newV.y *= -1;
			}
			array.push( newV )
		}
	}

	var brilliantCutVertices = []
	var tableZ = 1;
	var tableRadius = 1
	brilliantCutVertices.push(
		new THREE.Vector3(0,0,tableZ),
		new THREE.Vector3(tableRadius,0,tableZ),
		new THREE.Vector3(tableRadius,0,tableZ).applyAxisAngle(zUnit,TAU/8)
	)

	var starZ = 0.76;
	var starRadius = 1.5;
	brilliantCutVertices.push(
		new THREE.Vector3(tableRadius,0,tableZ).applyAxisAngle(zUnit,TAU/8),
		new THREE.Vector3(tableRadius,0,tableZ),
		new THREE.Vector3(starRadius,0,starZ).applyAxisAngle(zUnit,TAU/16)
	)

	brilliantCutVertices.push(
		new THREE.Vector3(tableRadius,0,tableZ),
		new THREE.Vector3(starRadius,0,starZ).applyAxisAngle(zUnit,TAU/16)
	)
	var girdleVec = brilliantCutVertices[brilliantCutVertices.length-1].clone().sub( brilliantCutVertices[brilliantCutVertices.length-2] )
	girdleVec.multiplyScalar(3.1).setComponent(1,0).add(brilliantCutVertices[brilliantCutVertices.length-2])
	brilliantCutVertices.push(girdleVec);
	mirrorLastTriangle(brilliantCutVertices)

	brilliantCutVertices.push(
		new THREE.Vector3(starRadius,0,starZ).applyAxisAngle(zUnit,-TAU/16),
		girdleVec,
		girdleVec.clone().applyAxisAngle(zUnit,-TAU/16)
	)
	mirrorLastTriangle(brilliantCutVertices)

	console.log(girdleVec)
	brilliantCutVertices.push(
		girdleVec,
		girdleVec.clone().applyAxisAngle(zUnit,-TAU/16),
		new THREE.Vector3(0,0,-girdleVec.x)
	)
	mirrorLastTriangle(brilliantCutVertices)


	var brilliantCutGeometry = applyDihedralSymmetry(brilliantCutVertices,8)
	//who can get the most brilliant diamond? make the TIR angle highest. Just drag bottom point

	var diamond = new THREE.Mesh( brilliantCutGeometry, new THREE.MeshPhongMaterial({
		transparent:true,
		opacity:0.7,
		// color:0xFF0000,
		flatShading:true,
		side:THREE.DoubleSide
	}) )
	diamond.scale.setScalar(0.1)
	objectsToBeUpdated.push(diamond)
	diamond.update = function()
	{
		if(mouse.lastClickedObject === null && mouse.clicking)
		{
			mouse.rotateObjectByGesture(this)
		}
	}
	reflectiveMeshes.push( diamond )
	scene.add( diamond )
}

}