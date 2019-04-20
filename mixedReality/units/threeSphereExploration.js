/*
	TODO
		monitoring
			fish
			thingy matrix
			position and orientation of sphere
		Make sure everything can easily be made visible and invisible
			Or hack that in in post?

	Script, "Rotating a 4D sphere in VR"
		So to describe 4D rotations, in this video we're going to use basically the same approach to describing 4D
		That you might have seen elsewhere, which is we're going to think about a 2D creature, and we're going to try to empathize with it
		We're going to use standard approach, [fish]
		And we have this sphere here which we can rotate in the normal way
		To this fish it is a truly crazy idea that you could rotate in more than one way

		degrees of freedom

		The fish can take this point anywhere it likes and put it at any orientation
		And there will always be some orientation of the sphere that gives it that
		Can even get a nice rotation effect

		Have to give general sphere definition
		you have "great spheres" rather than great circles
	
		You can rotate while keeping a whole plane in place

		That sphere cuts space into two equal parts

		The 4D sphere is staying at the same location

		So in 2D you get 1 degree of rotational freedom, in 3D we have 3. How many do they have in 4D?
		Maybe pause the video. If you said 6, well done! In 5D it is 10. Try to work out why!

		You can support me on patreon
			And get access to the VR page
			If I make it to $x I will do more

	alternative way of looking at it: the sphere is stuck in place
	but your plane and projection point are moving
	so the fish universe's z is equal to your hand z and pitch and yaw at first
	but you can make it so that... the board keeps its z and sphere does too...

	Sequel: "turning things inside-out with 4D spheres"
		Surfaces
		Interesting when a surface turned inside-out looks the same roight?
		Bring in chirality
		600-cell tet ring thing
		hopf fibration, spinors
*/

//these are not changing
let rayOrigin = new THREE.Vector4(0,0,0,-1)	
let fourSpaceAxes = [
	new THREE.Vector4(1,0,0,0),
	new THREE.Vector4(0,1,0,0),
	new THREE.Vector4(0,0,1,0)
]

function initThreeSphereExploration()
{
	let visiBox = VisiBox()

	//could have points too, maybe travelling along the circles
	//alternatively could have had a torusgeometry. Disadvantage is that radius could get small
	function GreatCircle(controlPoint0,controlPoint1, color)
	{
		let greatCircle = {}

		let controlPoints = [
			controlPoint0 !== undefined ? controlPoint0 : stereographicallyUnproject( new THREE.Vector3(0,1,0) ),
			controlPoint1 !== undefined ? controlPoint1 : stereographicallyUnproject( new THREE.Vector3(1,0,0) )
		]

		let triggered = 0

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

				let angle = realSpacePoint0.clone().sub(realSpacePointBetween).angleTo( realSpacePoint1.clone().sub(realSpacePointBetween) )
				line = (Math.abs(angle-Math.PI) < 0.00000000001 )

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
			let tubeRadius = 0.017
			let representation = new THREE.Mesh( new THREE.TubeBufferGeometry( curve, tubularSegments, tubeRadius,5,false ), new THREE.MeshLambertMaterial({clippingPlanes:visiBox.planes}) )
			greatCircle.representation = representation
			assemblage.add( representation )

			if(color === undefined)
			{
				let logarithm = Math.log(furthestOutDistance)
				color = new THREE.Color().setHSL(clamp(logarithm /3,0,1),0.5,0.5)
			}
			representation.material.color.copy(color)

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

		return greatCircle
	}

	function initProjectionControls()
	{
		let matrixWhenGrabbed = new THREE.Matrix4()
		let whenGrabbedHandPosition = new THREE.Vector3()
		let whenGrabbedHandQuaternion = new THREE.Quaternion()

		let designatedHand = handControllers[0]
		// if(0)
		{
			designatedHand = imitationHand
			scene.add( imitationHand )
		}
		let virtualHand = {
			position:new THREE.Vector3(),
			quaternion:new THREE.Quaternion(),
			velocity:new THREE.Vector3(),
			angularVelocity:new THREE.Quaternion()
		}

		function stereographicallyProjectBasis(position, quaternion,targetMatrix)
		{
			if(targetMatrix === undefined)
			{
				targetMatrix = new THREE.Matrix4()
			}

			//no rotating the assemblage.
			let localPosition = assemblage.worldToLocal(position.clone())
			let localHandMatrix = new THREE.Matrix4().makeRotationFromQuaternion(quaternion) //you better not be rotating the assemblage
			localHandMatrix.setPosition(localPosition)

			//maybe the one corresponding to position should be in the direction of the ray origin?
			//projection can cause mirror-reversal
			let unprojectedPosition = stereographicallyUnproject( localPosition )

			for(let i = 0; i < 3; i++)
			{
				let unitVector = new THREE.Vector3().setComponent(i,0.0001) //"epsilon". Can't be too miniscule because round-off in angle acquisition
				unitVector.applyMatrix4(localHandMatrix)
				let curvedAwayUnitVector = stereographicallyUnproject( unitVector )

				let amountToSlerp = (TAU/4) / unprojectedPosition.angleTo( curvedAwayUnitVector )
				let basisVector = unprojectedPosition.clone()
				basisVector.slerp( curvedAwayUnitVector, amountToSlerp )
				targetMatrix.setBasisVector(i,basisVector)
			}
			targetMatrix.setBasisVector(3,unprojectedPosition)
			
			if( !checkOrthonormality(targetMatrix) )
			{
				debugger;
			}

			return targetMatrix
		}

		function applyVirtualHandDiffToRotatingThreeSphereMatrix()
		{
			//if you've not moved the diff should be the identity
			let currentBasis = stereographicallyProjectBasis(virtualHand.position,virtualHand.quaternion)
			let whenGrabbedBasis = stereographicallyProjectBasis(whenGrabbedHandPosition,whenGrabbedHandQuaternion)
			let whenGrabbedBasisInverse = new THREE.Matrix4().getInverse( whenGrabbedBasis )
			let whenGrabbedToCurrent = currentBasis.clone().multiply(whenGrabbedBasisInverse)

			threeSphereMatrix.copy(matrixWhenGrabbed).premultiply(whenGrabbedToCurrent)
			threeSphereMatrixInverse.getInverse(threeSphereMatrix)
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

				applyVirtualHandDiffToRotatingThreeSphereMatrix()

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
			// if(0)
			{
				// camera.position.applyAxisAngle(yUnit, 0.01)
				// camera.rotation.y += 0.01

				// imitationHand.standardVigorousMovement()

				let t = frameCount*0.03

				// imitationHand.position.set(0, assemblage.position.y,assemblage.position.z+assemblage.scale.z)
				imitationHand.position.y += 0.004*Math.cos(t)
				imitationHand.position.x += 0.0014*Math.cos(t*1.3)

				// imitationHand.position.set( 0*0.2*Math.sin(t), 2*0.1*Math.sin(t),3.8)
				imitationHand.rotation.set(
					0.4*Math.sin(t*2.0),
					0.5*Math.sin(t*3.6),
					0//0.6*Math.sin(t*1.3)
					)
				imitationHand.quaternion.setFromEuler(imitationHand.rotation)
			}
			
			if( designatedHand.grippingTop )
			{
				if( !designatedHand.grippingTopOld )
				{
					matrixWhenGrabbed.copy(threeSphereMatrix)
					whenGrabbedHandPosition.copy(designatedHand.position)
					whenGrabbedHandQuaternion.copy(designatedHand.quaternion)
				}

				virtualHand.position.copy(designatedHand.position)
				virtualHand.quaternion.copy(designatedHand.quaternion)
				virtualHand.velocity.copy(designatedHand.position).sub(designatedHand.oldPosition)
				virtualHand.angularVelocity.copy(designatedHand.oldQuaternion).inverse().multiply(designatedHand.quaternion)
			}
			else
			{
				let deceleration = 0.00001

				if( virtualHand.velocity.length() - deceleration > 0)
				{
					virtualHand.velocity.setLength( virtualHand.velocity.length() - deceleration )
				}
				else
				{
					virtualHand.velocity.set(0,0,0)
				}

				let angularDeceleration = 0.0005

				let currentAngleFromIdentity = virtualHand.angularVelocity.angleTo(new THREE.Quaternion())
				if(currentAngleFromIdentity <= angularDeceleration)
				{
					virtualHand.angularVelocity.copy(new THREE.Quaternion())
				}
				else
				{
					let slerpAmount = angularDeceleration / currentAngleFromIdentity
					virtualHand.angularVelocity.slerp(new THREE.Quaternion(),slerpAmount)
				}

				// if( virtualHand.velocity.length() - deceleration < 0)
				// {
				// 	virtualHand.velocity.set(0,0,0)
				// 	virtualHand.angularVelocity.copy( new THREE.Quaternion() )
				// }
				// else
				// {
				// 	virtualHand.velocity.setLength( virtualHand.velocity.length() - deceleration )

				// 	let oldangularVelocity = virtualHand.angularVelocity.clone()

				// 	let velocityReduction = deceleration / virtualHand.velocity.length()
				// 	virtualHand.angularVelocity.slerp(new THREE.Quaternion(),velocityReduction)

				// 	//a slerp is kiiiinda like multiplying by a quaternion, and that quaternion has a certain dist from 0


				// 	//ok so surely it (velocity) is going toward identity at a constant rate

				// 	//what's happenning to the velocity? it's being lerped towards 0 by a certain amount that depends on deceleration and its length
				// }

				virtualHand.position.add(virtualHand.velocity)
				virtualHand.quaternion.multiply(virtualHand.angularVelocity)
				virtualHand.quaternion.normalize()
			}
			applyVirtualHandDiffToRotatingThreeSphereMatrix()
		} )
	}

	initProjectionControls()

	let assemblage = new THREE.Group()
	assemblage.scale.setScalar(0.1)
	assemblage.updateMatrixWorld()
	scene.add(assemblage)

	let hyperOctahedronCircles = []
	{
		hyperOctahedronCircles.push( GreatCircle(new THREE.Vector4(1,0,0,0),new THREE.Vector4(0,1,0,0)) )
		hyperOctahedronCircles.push( GreatCircle(new THREE.Vector4(1,0,0,0),new THREE.Vector4(0,0,1,0)) )
		hyperOctahedronCircles.push( GreatCircle(new THREE.Vector4(1,0,0,0),new THREE.Vector4(0,0,0,1)) )

		hyperOctahedronCircles.push( GreatCircle(new THREE.Vector4(0,1,0,0),new THREE.Vector4(0,0,1,0)) )
		hyperOctahedronCircles.push( GreatCircle(new THREE.Vector4(0,1,0,0),new THREE.Vector4(0,0,0,1)) )

		hyperOctahedronCircles.push( GreatCircle(new THREE.Vector4(0,0,1,0),new THREE.Vector4(0,0,0,1)) )
	}

	{
		var parasolCircles = Array(14)

		let placeTheyAllMeet = new THREE.Vector3(0.5,0.5,0.5)
		let fourSpacePtam = stereographicallyUnproject(placeTheyAllMeet)
		let normalizedPtam = placeTheyAllMeet.clone().normalize()
		let otherPoint0 = randomPerpVector(placeTheyAllMeet).normalize()

		for(let i = 0; i < parasolCircles.length; i++)
		{
			let otherPoint = null
			if(i===0)
			{
				otherPoint = zeroVector
			}
			else
			{
				otherPoint = otherPoint0.clone()
				otherPoint.applyAxisAngle( normalizedPtam, TAU/2 * (i / (parasolCircles.length-1)) )
				otherPoint.multiplyScalar( 0.01 )
				otherPoint.add( placeTheyAllMeet )
			}

			let un = stereographicallyUnproject( otherPoint )
			parasolCircles[i] = GreatCircle( fourSpacePtam, un )

			// console.log(fourSpacePtam, un)
		}
	}

	let hopfCircles = []
	{

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

				/*
					(1,0,0)  black
					(-1,0,0) white

					(0,y,z): h = atan(y,z)
				*/
				let angle = Math.atan2(fixedAxes[i].y,fixedAxes[i].z)
				let hue = (angle + Math.PI) / TAU
				let xNormalized = (fixedAxes[i].x + 1 ) / 2
				let easedToReduceBlackAndWhite = Math.acos(-(xNormalized*2-1))*2/TAU
				let lightness = easedToReduceBlackAndWhite
				let color = new THREE.Color().setHSL(hue,1,lightness)

				hopfCircles.push( GreatCircle( new THREE.Vector4().copy(q1), new THREE.Vector4().copy(q2), color ) )
			}
		}
		hopfFibrate(xUnit)  
		// hopfFibrate(yUnit)
		// hopfFibrate(zUnit)
		// hopfFibrate(xUnit.clone().negate())
		// hopfFibrate(yUnit.clone().negate())
		// hopfFibrate(zUnit.clone().negate())
	}

	let greatCircleSets = [parasolCircles,hyperOctahedronCircles,hopfCircles]

	bindButton( "v", function()
	{
		let indexToMakeVisible = 0
		for(let i = 0; i < greatCircleSets.length; i++)
		{
			if( greatCircleSets[i][0].representation.visible )
			{
				indexToMakeVisible = (i+1)%greatCircleSets.length
				break;
			}
		}

		for(let i = 0; i < greatCircleSets.length; i++)
		{
			for(let j = 0; j < greatCircleSets[i].length; j++)
			{
				greatCircleSets[i][j].representation.visible = (i === indexToMakeVisible)
			}
		}
	}, "cycle threespheres" )
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
THREE.Quaternion.prototype.randomize = function()
{
	this.set(
		Math.random()-0.5,
		Math.random()-0.5,
		Math.random()-0.5,
		Math.random()-0.5);
	this.setLength(1);

	return this;
}