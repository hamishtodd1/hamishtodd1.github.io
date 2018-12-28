/*
	What it's fundamentally about is cool stuff you can do with this stereographic projection

	alternative way of looking at it: the sphere is stuck in place
	but your plane and projection point are moving
	so the fish universe's z is equal to your hand z and pitch and yaw at first
	but you can make it so that... the board keeps its z and sphere does too...

	worth mentioning that you have "great spheres" rather than great circles

	Sequel: "turning things inside-out with 4D spheres"
		Surfaces
		Interesting when a surface turned inside-out looks the same roight?
		Bring in chirality

	Want that 600-cell tet ring thing

	Deffo want momentum on the spin

	"View only 1D/2D slice" button

	Take the ray through the origin out to infinity and the sphere that is normal to that ray at your hand. Now when you move your hand toward the origin, that sphere will become a plane
	That sphere cuts space into two equal parts
	Call it "Rotating a 4D sphere in VR" and deffo have hopf fibration

	To avoid nastiness:
		If you have a triangle whose interior contains, erm, the point at infinity, don't show it

	You grab a board with a fish on it and the fish is where your hand is

	//----------double sphere thing
	You put a slice through the sphere and project from points either side of it, on the surface and as far away as possible from the slice
	The location and orientation of the slice is what matters

	There's an "equator" controlling where the projection is limited to

	You do want this "go from 2 to one having everything" thing
	That requires you to think of this universe as S3. ok.
	Either one "inflates" (around an inflation point quite close to the other)
	To match up with the other
	Or one is "sapped" by the other

	If there's a triangle whose vertices are in separate spheres, urgh, gotta "cut" it
		Make sure that you're rendering twice I guess

	The shells of the spheres are both projections of the slice plane
	For both spheres, the area outside it is area that COULD be projected to, you just reduce it to the other sphere

	Script 
		Map analogy: You see the two hemispheres, they have quite a separation
		"Rotate the globe". Show you can increase and decrease the size of the slice, putting more of the globe on one of the two things
		Unfolds to a fish universe with a little fish in it
		It was "wrapped around" the hemisphere with a single widely-curved fold.
		Make that fold bigger and smaller, showing how that redistributes bits of the globe or makes the same projection bigger and smaller
		And then you can still move the fold back and forth
		Close up the fold, showing how it becomes very much like the globe is "squashed" to the center
			And you can remove the equator

	//------Previous script, on quaternions
	Belt trick - separete:
		The double cover is "this shitty little thing"
			That idea about the fish and its shadow world
			Attach it to *something outside its world*, and now it can tell whether it is in shadow world
*/


function initThreeSphereExploration()
{
	tubeGeometriesAffectedByProjection = []

	let imitationHand = new THREE.Group()
	imitationHand.grippingTopOld = false
	imitationHand.gripping = true
	imitationHand.position.x = 0.5
	imitationHand.add(new THREE.Mesh(new THREE.CylinderGeometry(0.01,0.01,0.1)))
	imitationHand.add(new THREE.Mesh(new THREE.CylinderGeometry(0.01,0.01,0.1)))
	imitationHand.add(new THREE.Mesh(new THREE.CylinderGeometry(0.01,0.01,0.1)))
	imitationHand.children[0].rotation.x += TAU/4
	imitationHand.children[1].rotation.y += TAU/4
	imitationHand.children[2].rotation.z += TAU/4
	scene.add(imitationHand)

	bindButton("space",function(){imitationHand.grippingTop = !imitationHand.grippingTop},"toggle gripping")

	let fourSpaceGrabLocation = null
	let grabOrientation = null
	updateFunctions.push( function()
	{
		// if(frameCount>1)return
		let t = frameCount*0.03

		// imitationHand.position.set(0.3+0.2*Math.sin(t), 0.3+0.1*Math.cos(t),0.3*Math.sin(t))
		imitationHand.position.set(0.3, 0.1*Math.sin(t),0)

		// imitationHand.rotation.z = 0.2*Math.sin(t*3)

		//take the quaternions and store them, they won't change until you let go

		if(imitationHand.grippingTop)
		{
			let pFourSpace = stereographicallyUnproject(imitationHand.position)
			if( !imitationHand.grippingTopOld )
			{
				fourSpaceGrabLocation = stereographicallyUnproject(imitationHand.position.clone())
				grabOrientation = imitationHand.quaternion.clone()

				let singleCircle = GreatCircle(
					fourSpaceGrabLocation,
					stereographicallyUnproject(zeroVector)
				)

				let surfaceCircles = Array(5)
				normalizedGrabLocation = grabLocation.clone().normalize()
				let otherPoint0 = randomPerpVector(grabLocation).normalize()
				for(let i = 0; i < surfaceCircles.length; i++)
				{
					let otherPoint = otherPoint0.clone()
					otherPoint.applyAxisAngle(normalizedGrabLocation,TAU/2 * i/surfaceCircles.length)
					otherPoint.multiplyScalar(0.01)
					otherPoint.add(grabLocation)

					GreatCircle(
						fourSpaceGrabLocation,
						stereographicallyUnproject(otherPoint),
					)
				}
			}
		}
		else
		{
			grabOrientation = null
			grabLocation = null
		}

		imitationHand.grippingTopOld = imitationHand.grippingTop

		//you get the line connecting your hand directly to the pole
		//	and also the great sphere passing thr
		//...but then if you angle your hand?
	} )

	let rayOrigin = new THREE.Vector4(0,0,0,1) //opposite to the default
	let fourSpaceAxes = [
		new THREE.Vector4(1,0,0,0),
		new THREE.Vector4(0,1,0,0),
		new THREE.Vector4(0,0,1,0)
	]
	function stereographicallyProject(q)
	{
		let rayDirection = new THREE.Vector4().copy(q).sub(rayOrigin);
		let distanceAlongAxis = -1 * rayDirection.dot(rayOrigin)
		if(distanceAlongAxis===0||distanceAlongAxis===-0)
		{
			console.warn("singularity")
			return new THREE.Vector3()
		}
		let fourSpaceProjection = rayDirection.clone().multiplyScalar(1/distanceAlongAxis).add(rayOrigin)
		
		let threeSpaceProjection = new THREE.Vector3()
		for(let i = 0; i < 3; i++)
		{
			threeSpaceProjection.setComponent(i,fourSpaceProjection.dot(fourSpaceAxes[i]))
		}
		return threeSpaceProjection
	}
	function stereographicallyUnproject(p)
	{
		let fourSpaceProjection = new THREE.Vector4(0,0,0,0)
		for(let i = 0; i < 3; i++)
		{
			fourSpaceProjection.add( fourSpaceAxes[i].clone().multiplyScalar( p.getComponent(i) ) )
		}
		// console.assert(fourSpaceProjection.dot(rayOrigin) === 0)

		let projectionLengthSq = fourSpaceProjection.lengthSq()
		let unprojectedPointDistanceAlongOriginSpindle = 1 + (1-projectionLengthSq)/(1+projectionLengthSq) //algebra

		let rayDirection = fourSpaceProjection.clone().sub(rayOrigin)
		rayDirection.multiplyScalar(unprojectedPointDistanceAlongOriginSpindle).add(rayOrigin)

		let unprojected = new THREE.Quaternion().copy(rayDirection)
		return unprojected
	}

	//could have points too
	//alternatively could have had a torusgeometry. Disadvantage is that radius could get small
	function GreatCircle(controlPointA,controlPointB)
	{
		if(controlPointB === undefined)
		{
			var controlPointA = new THREE.Quaternion().set(Math.random(),Math.random(),Math.random(),Math.random()).normalize()
			var controlPointB = new THREE.Quaternion().set(Math.random(),Math.random(),Math.random(),Math.random()).normalize()
		}
		let separationAngle = Math.acos(controlPointA.dot(controlPointB))

		var curve = new THREE.Curve();
		let furthestOutDistance = 0
		curve.getPoint = function( t )
		{
			let positionOnThreeSphere = jonSlerp(controlPointA,controlPointB, t * TAU / separationAngle )
			let projection = stereographicallyProject(positionOnThreeSphere)
			if( projection.length() > furthestOutDistance )
			{
				furthestOutDistance = projection.length()
			}
			return projection
		}
		let tubularSegments = 60
		let radius = 0.04
		let representation = new THREE.Mesh( new THREE.TubeBufferGeometry( curve, tubularSegments, radius,5 ), new THREE.MeshLambertMaterial() )
		// representation.scale.setScalar(0.1)
		scene.add( representation )
		
		let log = Math.log(furthestOutDistance)
		representation.material.color.setHSL(clamp(log / 2,0,1),0.5,0.5)

		updateFunctions.push( function()
		{
			// representation.rotation.y += 0.01
			// representation.rotation.x += 0.01
		})

		// tubeGeometriesAffectedByProjection.push(representation.geometry)
	}

	//hyper octahedron
	// {
	// 	GreatCircle(new THREE.Quaternion(1,0,0,0),new THREE.Quaternion(0,1,0,0))
	// 	GreatCircle(new THREE.Quaternion(1,0,0,0),new THREE.Quaternion(0,0,1,0))
	// 	GreatCircle(new THREE.Quaternion(1,0,0,0),new THREE.Quaternion(0,0,0,1))

	// 	GreatCircle(new THREE.Quaternion(0,1,0,0),new THREE.Quaternion(0,0,1,0))
	// 	GreatCircle(new THREE.Quaternion(0,1,0,0),new THREE.Quaternion(0,0,0,1))

	// 	GreatCircle(new THREE.Quaternion(0,0,1,0),new THREE.Quaternion(0,0,0,1))
	// }

	let fixedAxes = [];

	let icoVertices = new THREE.IcosahedronGeometry(1,2).vertices
	fixedAxes = icoVertices

	// for(let i = 0; i < 20; i++)
	// {
	// 	fixedAxes[i] = yUnit.clone().applyAxisAngle(zUnit,i*TAU/20) //icoVertices[i]
	// }

	function hopfFibrate(axisToPoint)
	{
		for(let i = 0; i < fixedAxes.length; i++)
		{
			let q1 = new THREE.Quaternion().setFromUnitVectors(axisToPoint,fixedAxes[i])
			let q2 = q1.clone().premultiply(new THREE.Quaternion().setFromAxisAngle(fixedAxes[i],TAU/4))
			GreatCircle(q1,q2)
		}
	}
	// hopfFibrate(xUnit)
	// hopfFibrate(yUnit)
	// hopfFibrate(zUnit)

	updateFunctions.push(function()
	{
		for(let i = 0; i < tubeGeometriesAffectedByProjection.length; i++)
		{
			tubeGeometriesAffectedByProjection[i].updateFromCurve()
		}
	})
}

function initDoubleSphereThreeSphere()
{
	let stereographicThreeSphere = new THREE.Group();
	let sphereRepresentations = Array(2);
	for(let i = 0; i < 2; i++)
	{
		sphereRepresentations[i] = new THREE.Mesh(
			new THREE.EfficientSphereBufferGeometry(1),
			new THREE.MeshPhongMaterial({transparent:true,opacity:0.3}));
		sphereRepresentations[i].position.x = i?1:-1;
		sphereRepresentations[i].material.color.setRGB(Math.random(),Math.random(),Math.random());
		stereographicThreeSphere.add(sphereRepresentations[i]);
	}
	stereographicThreeSphere.position.z = -0.5;
	stereographicThreeSphere.scale.setScalar(0.1);
	scene.add(stereographicThreeSphere);

	let positionsOnThreeSphere = Array(5);
	updatePositionOnThreeSphere = function()
	{
		// this.add(new THREE.Vector4().setToRandomQuaternion().multiplyScalar(0.05))
		this.setLength(1);
		
		this.representation.position.copy(getStereographicProjectionToDoubleSpheres(this));
		if( this.representation.position.distanceTo(sphereRepresentations[ 0 ].position) > 1 &&
			this.representation.position.distanceTo(sphereRepresentations[ 1 ].position) > 1 )
		{
			console.error("hmm")
		}
	}
	for(let i = 0; i < positionsOnThreeSphere.length; i++)
	{
		positionsOnThreeSphere[i] = new THREE.Vector4().setToRandomQuaternion();
		markedThingsToBeUpdated.push(positionsOnThreeSphere[i]);

		positionsOnThreeSphere[i].update = updatePositionOnThreeSphere;

		positionsOnThreeSphere[i].representation = new THREE.Mesh(
			new THREE.EfficientSphereBufferGeometry(0.03),
			new THREE.MeshPhongMaterial());
		positionsOnThreeSphere[i].representation.material.color.setRGB(Math.random(),Math.random(),Math.random());
		stereographicThreeSphere.add(positionsOnThreeSphere[i].representation);
	}

	function getStereographicProjectionToDoubleSpheres(vector)
	{
		let rayOrigin = new THREE.Vector4(-1,0,0,0);
		//projects from the side of the sphere it's on to the hyperplane at x = 0
		let sphereToGoInto = null;
		if(vector.x > 0)
		{
			sphereToGoInto = sphereRepresentations[0].position.x > sphereRepresentations[1].position.x ? sphereRepresentations[0] : sphereRepresentations[1];
		}
		else
		{
			rayOrigin.negate()
			sphereToGoInto = sphereRepresentations[0].position.x > sphereRepresentations[1].position.x ? sphereRepresentations[1] : sphereRepresentations[0];
		}

		let rayDirection = vector.clone().sub(rayOrigin);
		let multiplier = 1 / rayDirection.x;
		let stereographicProjectionInFourSpace = rayDirection.multiplyScalar(multiplier);
		stereographicProjectionInFourSpace.add(rayOrigin);
		//if you've done it right these will not leave the spheres
		let stereographicProjection = new THREE.Vector3(
			stereographicProjectionInFourSpace.y,
			stereographicProjectionInFourSpace.z,
			stereographicProjectionInFourSpace.w );
		stereographicProjection.add(sphereToGoInto.position)
		return stereographicProjection;
	}

	return stereographicThreeSphere;
}

THREE.Vector4.prototype.distanceTo = function(otherVec)
{
	let displacement = otherVec.clone().sub(this);
	return displacement.length();
}
THREE.Vector4.prototype.setToRandomQuaternion = function()
{
	this.set(
		Math.random()-0.5,
		Math.random()-0.5,
		Math.random()-0.5,
		Math.random()-0.5);
	this.setLength(1);

	return this;
}