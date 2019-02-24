/*
	This is not a sphere, this is the equivalent of a line of longtitude on the earth

	Could have a unit sphere showing the "equator" where they meet at all times

	//homogeneous coords idea: hand orientation controls 2D.
	//Z vector scales hand controller model to where it is, which looks bad but it's ok
	//y and -x directions stay the same for the controller but you can rotate

	alternative way of looking at it: the sphere is stuck in place
	but your plane and projection point are moving
	so the fish universe's z is equal to your hand z and pitch and yaw at first
	but you can make it so that... the board keeps its z and sphere does too...

	Have to give general sphere definition
	worth mentioning that you have "great spheres" rather than great circles
	Show yourself rotating (not translating) the regular sphere

	Sequel: "turning things inside-out with 4D spheres"
		Surfaces
		Interesting when a surface turned inside-out looks the same roight?
		Bring in chirality
		600-cell tet ring thing
		hopf fibration, spinors

	Take the ray through the origin out to infinity and the sphere that is normal to that ray at your hand. Now when you move your hand toward the origin, that sphere will become a plane
	That sphere cuts space into two equal parts
	Call it "Rotating a 4D sphere in VR"

	To avoid nastiness:
		If you have a triangle whose interior contains, erm, the point at infinity, don't show it

	You grab a board with a fish on it and the fish is where your hand is

	Rotating a sphere in 5D: 10 degrees of freedom.

	What you want to get out of your
	Low-d topology, thurston

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

//these are not changing
let rayOrigin = new THREE.Vector4(0,0,0,-1)	
let fourSpaceAxes = [
	new THREE.Vector4(1,0,0,0),
	new THREE.Vector4(0,1,0,0),
	new THREE.Vector4(0,0,1,0)
]
let assemblage = new THREE.Group()
assemblage.position.y += 1.6
assemblage.position.z -= 0.3
assemblage.scale.setScalar(0.1)
assemblage.updateMatrixWorld()
scene.add(assemblage)

function initThreeSphereExploration()
{
	initProjectionControls()

	// GreatCircle()

	//hyper octahedron
	if(0)
	{
		GreatCircle(new THREE.Vector4(1,0,0,0),new THREE.Vector4(0,1,0,0))
		GreatCircle(new THREE.Vector4(1,0,0,0),new THREE.Vector4(0,0,1,0))
		GreatCircle(new THREE.Vector4(1,0,0,0),new THREE.Vector4(0,0,0,1))

		GreatCircle(new THREE.Vector4(0,1,0,0),new THREE.Vector4(0,0,1,0))
		GreatCircle(new THREE.Vector4(0,1,0,0),new THREE.Vector4(0,0,0,1))

		GreatCircle(new THREE.Vector4(0,0,1,0),new THREE.Vector4(0,0,0,1))
	}

	//hopf fibrating
	{
		let fixedAxes = [];

		let icoVertices = new THREE.IcosahedronGeometry(1,1).vertices
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

				GreatCircle( new THREE.Vector4().copy(q1), new THREE.Vector4().copy(q2) )
			}
		}
		hopfFibrate(xUnit)
		// hopfFibrate(yUnit)
		// hopfFibrate(zUnit)
		// hopfFibrate(xUnit.clone().negate())
		// hopfFibrate(yUnit.clone().negate())
		// hopfFibrate(zUnit.clone().negate())
	}
}

let threeSphereMatrix = new THREE.Matrix4()
let threeSphereMatrixInverse = new THREE.Matrix4()

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

	let rayDirection = fourSpaceProjection.clone().sub( rayOrigin )

	let unprojected = new THREE.Vector4().copy(rayDirection)
	unprojected.multiplyScalar(unprojectedPointDistanceAlongOriginSpindle).add(rayOrigin)

	return unprojected
}

function initProjectionControls()
{
	let matrixWhenGrabbed = new THREE.Matrix4()
	let whenGrabbedHandPosition = new THREE.Vector3()
	let whenGrabbedHandQuaternion = new THREE.Quaternion()

	let sphereFrameGreatCircles = []
	{
		let numCirclesInGreatSphere = 5
		for(let i = 0; i < numCirclesInGreatSphere+1; i++)
		{
			sphereFrameGreatCircles.push( GreatCircle() )
		}
	}
	//could have latitude lines, at least the equator

	let designatedHand = handControllers[0]
	// if(0)
	{
		designatedHand = imitationHand
		scene.add( imitationHand )
	}
	function getHandBasis(position, quaternion,targetMatrix)
	{
		if(targetMatrix === undefined)
		{
			targetMatrix = new THREE.Matrix4()
		}

		//no rotating the assemblage.
		let localPosition = assemblage.worldToLocal(position.clone())
		let localHandMatrix = new THREE.Matrix4().makeRotationFromQuaternion(quaternion)
		localHandMatrix.setPosition(localPosition)

		//maybe the one corresponding to position should be in the direction of the ray origin?
		//projection can cause mirror-reversal
		let unprojectedPosition = stereographicallyUnproject( localPosition )

		for(let i = 0; i < 3; i++)
		{
			let unitVector = new THREE.Vector3().setComponent(i,0.000001) //"epsilon". Can't be too miniscule because round-off in angle acquisition
			unitVector.applyMatrix4(localHandMatrix)
			let curvedAwayUnitVector = stereographicallyUnproject( unitVector )

			let amountToSlerp = (TAU/4) / unprojectedPosition.angleTo( curvedAwayUnitVector )
			let basisVector = unprojectedPosition.clone()
			basisVector.slerp( curvedAwayUnitVector, amountToSlerp )
			targetMatrix.setBasisVector(i,basisVector)
		}
		targetMatrix.setBasisVector(3,unprojectedPosition)
		checkOrthonormality(targetMatrix)

		return targetMatrix
	}

	function applyHandDiffToRotatingThreeSphereMatrix()
	{
		//if you've not moved the diff should be the identity

		let currentBasis = getHandBasis(designatedHand.position,designatedHand.quaternion)
		let whenGrabbedBasis = getHandBasis(whenGrabbedHandPosition,whenGrabbedHandQuaternion)
		let whenGrabbedBasisInverse = new THREE.Matrix4().getInverse( whenGrabbedBasis )
		let diff = currentBasis.clone().multiply(whenGrabbedBasisInverse)
		// log(oldGrabBasis.elements)//suspicious


		threeSphereMatrix.copy(matrixWhenGrabbed).premultiply(diff) //possibly premultiply, but surely not
		threeSphereMatrixInverse.getInverse(threeSphereMatrix)

		//obv you're solving for the three vectors, from which you ought to be able to get the projection pt
		// Deffo want momentum on the spin
	}

	if(0)
	{
		imitationHand.position.copy(assemblage.position)

		imitationHand.position.x = 1

		let original = new THREE.Vector3(Math.random()-0.5,Math.random()-0.5,Math.random()-0.5)
		original.setLength(0.0000000) //should be able to do other nearby values but for now...

		let v = original.clone()
		imitationHand.updateMatrixWorld()
		imitationHand.localToWorld(v)
		let vLocalToRotatingThreeSphere = stereographicallyUnproject(v).applyMatrix4(threeSphereMatrixInverse)
		console.warn(vLocalToRotatingThreeSphere.toArray())

		for(let i = 0; i < 3; i++)
		{
			imitationHand.oldPosition.copy(imitationHand.position)
			imitationHand.position.y += 0.2
			// imitationHand.position.set(  Math.random()-0.5,Math.random()-0.5,Math.random()-0.5)
			// imitationHand.quaternion.set(Math.random()-0.5,Math.random()-0.5,Math.random()-0.5,Math.random()-0.5).normalize()

			checkOrthonormality(threeSphereMatrix)

			applyHandDiffToRotatingThreeSphereMatrix()

			checkOrthonormality(threeSphereMatrix)
		}

		v = original.clone()
		imitationHand.updateMatrixWorld()
		imitationHand.localToWorld(v)
		vLocalToRotatingThreeSphere = stereographicallyUnproject(v).applyMatrix4(threeSphereMatrixInverse)
		console.warn(vLocalToRotatingThreeSphere.toArray(), "should be same as above")
	}

	updateFunctions.push( function()
	{
		if(0)
		{
			// camera.position.applyAxisAngle(yUnit, 0.01)
			// camera.rotation.y += 0.01

			let t = frameCount*0.03

			imitationHand.position.set(0, assemblage.position.y,assemblage.position.z+assemblage.scale.z)
			imitationHand.position.y += 0.04*Math.sin(t)

			// imitationHand.position.set( 0*0.2*Math.sin(t), 2*0.1*Math.sin(t),3.8)
			imitationHand.rotation.set(
				0.4*Math.sin(t*1.0),
				0.5*Math.sin(t*1.6),
				0//0.6*Math.sin(t*1.3)
				)
			// imitationHand.quaternion.setFromEuler(imitationHand.rotation)

			imitationHand.grippingTop = true
		}
		
		if(designatedHand.grippingTop)
		{
			// console.log(designatedHand.grippingTop)
			if( !designatedHand.grippingTopOld )
			{
				matrixWhenGrabbed.copy(threeSphereMatrix)
				whenGrabbedHandPosition.copy(designatedHand.position)
				whenGrabbedHandQuaternion.copy(designatedHand.quaternion)

				let grabLocation = designatedHand.position.clone()
				let fourSpaceGrabLocation = stereographicallyUnproject(grabLocation)

				let localGrabLocation = fourSpaceGrabLocation.clone().applyMatrix4( threeSphereMatrixInverse )

				let normalizedGrabLocation = grabLocation.clone().normalize()
				let otherPoint0 = randomPerpVector(grabLocation).normalize()
				for(let i = 0; i < sphereFrameGreatCircles.length; i++)
				{
					sphereFrameGreatCircles[i].setControlPoint( 0, localGrabLocation )

					if(i===0)
					{
						sphereFrameGreatCircles[i].setControlPoint( 1, stereographicallyUnproject( zeroVector ).applyMatrix4( threeSphereMatrixInverse ) )
					}
					else
					{
						let otherPoint = otherPoint0.clone()
						otherPoint.applyAxisAngle( normalizedGrabLocation, TAU/2 * (i / (sphereFrameGreatCircles.length-1)) )
						otherPoint.multiplyScalar( 0.01 )
						otherPoint.add( grabLocation )

						sphereFrameGreatCircles[i].setControlPoint( 1, stereographicallyUnproject( otherPoint ).applyMatrix4( threeSphereMatrixInverse ) )
					}

					sphereFrameGreatCircles[i].representation.geometry.updateFromCurve()
				}
			}
			else
			{
				// console.log("yo")
				applyHandDiffToRotatingThreeSphereMatrix()

				/*
					in 2D, the plane is (1,0,0), (0,1,0)
					your grab defines a position and a pair of unit vectors (a 2x2 matrix?)
						You get that position and unit vectors on the sphere and normalize them
					you move. stereographically project from (0,0,1)
					To get the sphere in the right place, you'd rotate it to align the grab position
					Take the curved unit vectors and put them all the way oot to
					Then you'd rotate it

					in 1D
					there is where you've grabbed on line and where you grabbed on circle. Uniquely defines orientation
					take the ray from the projection point
					Orient circle such that grabbed position intersects with that ray (but is not on thingy point)
				*/
			}
		}

		for(let i = 0; i < sphereFrameGreatCircles.length; i++)
		{
			//nicer would be some cool explosion from your hand
			sphereFrameGreatCircles[i].representation.visible = false//designatedHand.grippingTop
		}
	} )
}

//could have points too, maybe travelling along the circles
//alternatively could have had a torusgeometry. Disadvantage is that radius could get small
function GreatCircle(controlPoint0,controlPoint1)
{
	let greatCircle = {}

	let controlPoints = [
		controlPoint0 !== undefined ? controlPoint0 : stereographicallyUnproject( new THREE.Vector3(0,1,0) ),
		controlPoint1 !== undefined ? controlPoint1 : stereographicallyUnproject( new THREE.Vector3(1,0,0) )
	]

	//representation/real space
	{
		let line = false

		let realSpaceCenter = new THREE.Vector3()
		let realSpaceRadius = 1;
		let realSpaceNormal = new THREE.Vector3()
		let realSpaceStart = new THREE.Vector3()

		let realSpaceOrigin = new THREE.Vector3()
		let realSpaceDirection = new THREE.Vector3()
		function rederive()
		{
			let realSpacePoint0 = stereographicallyProject(controlPoints[0].clone().applyMatrix4(threeSphereMatrix))
			let realSpacePoint1 = stereographicallyProject(controlPoints[1].clone().applyMatrix4(threeSphereMatrix))

			let pointBetween = controlPoints[0].clone().slerp(controlPoints[1],0.5).applyMatrix4(threeSphereMatrix)
			let realSpacePointBetween = stereographicallyProject(pointBetween)

			let bivectorMagnitudeSq = realSpacePoint0.clone().sub(pointBetween).cross( realSpacePoint1.clone().sub(pointBetween) ).lengthSq()
			line = (bivectorMagnitudeSq < 0.00000001 )

			if(line)
			{
				realSpaceOrigin.copy(realSpacePoint0)
				realSpaceDirection.copy(realSpacePoint1).sub(realSpacePoint0).normalize()
			}
			else
			{
				realSpaceCenter = centerOfCircleThroughThreePoints(realSpacePoint0,realSpacePointBetween,realSpacePoint1)
				realSpaceRadius = realSpaceCenter.distanceTo(realSpacePointBetween)
				realSpaceNormal.copy(realSpacePoint0).sub(realSpaceCenter).cross(realSpacePoint1.clone().sub(realSpaceCenter)).normalize()
				realSpaceStart.copy( randomPerpVector( realSpaceNormal ) ).normalize()
			}
		}

		greatCircle.setControlPoint = function(index,value)
		{
			controlPoints[index].copy( value )

			rederive()

			// console.assert( Math.abs( Math.abs( realSpaceNormal.dot(zUnit) ) - 1 ) < 0.0001 )
		}
		greatCircle.setControlPoint(0,controlPoints[0])

		let curve = new THREE.Curve();
		let furthestOutDistance = 0
		curve.getPoint = function( t )
		{
			if( line )
			{
				var p = realSpaceDirection.clone().multiplyScalar((t-0.5)*400).add(realSpaceOrigin)
			}
			else
			{
				var p = realSpaceStart.clone().applyAxisAngle(realSpaceNormal,t*TAU).multiplyScalar(realSpaceRadius).add(realSpaceCenter)
			}

			if( p.length() > furthestOutDistance )
			{
				furthestOutDistance = p.length()
			}

			return p
		}
		let tubularSegments = 45
		let tubeRadius = 0.007
		let representation = new THREE.Mesh( new THREE.TubeBufferGeometry( curve, tubularSegments, tubeRadius,5,false ), new THREE.MeshLambertMaterial() )
		greatCircle.representation = representation
		assemblage.add( representation )

		let logarithm = Math.log(furthestOutDistance)
		representation.material.color.setHSL(clamp(logarithm /3,0,1),0.5,0.5)

		//a color mapping from the sphere might be nice

		updateFunctions.push( function()
		{
			if(representation.visible)
			{
				rederive()
				representation.geometry.updateFromCurve()
			}
		})
	}

	updateFunctions.push( function()
	{
		if(ROTATING)
		{
			greatCircle.representation.rotation.y += 0.01
			greatCircle.representation.rotation.x += 0.01
		}
	})

	return greatCircle
}
ROTATING = false

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