/*
	TODO
		Switch triangly to soccer ball?
		superimpose numbers?
		sound effects?
			Grab and ungrab, fairly easy to check
			visibility change, easy to check
			Rotation of fish and heptagon? fairly easy
			Camera shake? You'd want to set screen in place - not too hard
		Probably can get the lag such that it's on-frame
		Deadline is 23rd I guess. Nice as it would be to "go viral" in time

	"How do things rotate in 4D? in VR" Thumbnail: nice MR thing, "4 space dimensions??"
	Description
		Tags: flatland

	Send to
		Pierre
		Vi
		Bret
		Marc
		Grant
		Andy
		Destin
		Robin Hunicke, Richard Lemarchand
		MrDoob, tojiro, some other webvr person
		inigo quilez with that job!

	Script, 
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

		It is possible for we as 3D creatures to rotate a 4D sphere

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
		Interesting when a surface turned inside-out looks the same roight? You would think that that was only true with spheres
		Hahaha boy's surface, or at least a cross-cap. Lawson klein probably
		Bring in chirality
		600-cell tet ring thing
		hopf fibration, spinors
		can do jigsaws!

		S1xS2
			It's the equivalent of taking the 2D plane and bringing it into 4D on a clifford torus. You stereographically project that clifford torus onto an infinite cylinder wrapped around it. Then stereographically project that onto and projecting that
			Picture the circle in R4, it's on say x and y axes
				Any given point on it does have two whole axes that are orthogonal to the arc going through it, namely z and w
*/

function initThreeSphereExploration( height )
{
	initProjectionSystem()

	let visiBox = VisiBox()
	for(let i = 0; i < visiBox.children.length; i++)
	{
		if(visiBox.children[i].isMesh)
		{
			visiBox.children[i].visible = false
		}
	}
	visiBox.scale.set(0.335,0.185,0.195)
	visiBox.position.set(0.0,1.49,0.015)
	visiBox.rotation.y = 0.075
	VISIBOX = visiBox

	let threeSphereMatrix = new THREE.Matrix4()
	let threeSphereMatrixInverse = new THREE.Matrix4()
	markMatrix(threeSphereMatrix)

	function GreatCircle(controlPoint0,controlPoint1, color, lotsOfSegments)
	{
		if(lotsOfSegments === undefined)
		{
			lotsOfSegments = true
		}

		let greatCircle = {}

		let controlPoints = [
			controlPoint0 !== undefined ? controlPoint0 : stereographicallyUnproject( new THREE.Vector3(0,1,0) ),
			controlPoint1 !== undefined ? controlPoint1 : stereographicallyUnproject( new THREE.Vector3(1,0,0) )
		]

		let triggered = 0

		//representation/real space
		{
			let line = false

			let boundingSphereRadius = 20

			let realSpaceCenter = new THREE.Vector3()
			let realSpaceRadius = 1;
			let realSpaceNormal = new THREE.Vector3()
			let realSpaceStart = new THREE.Vector3()
			let arc = TAU

			let realSpaceOrigin = new THREE.Vector3()
			let realSpaceDirection = new THREE.Vector3()
			function rederive()
			{
				let realSpacePoint0 = stereographicallyProject(controlPoints[0].clone().applyMatrix4(threeSphereMatrix))
				let realSpacePoint1 = stereographicallyProject(controlPoints[1].clone().applyMatrix4(threeSphereMatrix))

				let pointBetween = controlPoints[0].clone().slerp(controlPoints[1],0.5).applyMatrix4(threeSphereMatrix)
				let realSpacePointBetween = stereographicallyProject(pointBetween)

				let angle = realSpacePoint0.clone().sub(realSpacePointBetween).angleTo( realSpacePoint1.clone().sub(realSpacePointBetween) )
				line = (Math.abs(angle-Math.PI) < 0.0000001 )

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

					if( realSpaceCenter.length() < boundingSphereRadius )
					{
						realSpaceStart.copy( randomPerpVector( realSpaceNormal ) ).normalize()
						arc = TAU
					}
					else
					{
						let pointToConstrainCircle = realSpaceNormal.clone().multiplyScalar(realSpaceRadius).add(realSpaceCenter)
						let distToConstrainCircle = Math.sqrt(2)*realSpaceRadius

						let arcEnds = tetrahedronTops(
							zeroVector,realSpaceCenter,pointToConstrainCircle,
							boundingSphereRadius,realSpaceRadius,distToConstrainCircle)

						if(arcEnds === false)
						{
							arc = 0
						}
						else
						{
							realSpaceStart.copy(arcEnds[1]).sub(realSpaceCenter).normalize()
							arc = arcEnds[0].sub( realSpaceCenter ).angleTo( arcEnds[1].sub( realSpaceCenter ) )
						}
					}
				}
			}

			greatCircle.setControlPoint = function(index,value)
			{
				controlPoints[index].copy( value )

				rederive()
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
					//but in what direction? it seems to work
					var p = realSpaceStart.clone().applyAxisAngle(realSpaceNormal,t*arc).multiplyScalar(realSpaceRadius).add(realSpaceCenter)
				}

				if( p.length() > furthestOutDistance )
				{
					furthestOutDistance = p.length()
				}

				return p
			}
			let tubularSegments = lotsOfSegments ? 72:36
			let tubeRadius = 0.02
			let representation = new THREE.Mesh(
				new THREE.TubeBufferGeometry( curve, tubularSegments, tubeRadius,3,false ),
				new THREE.MeshStandardMaterial({clippingPlanes:visiBox.planes}) )
			greatCircle.representation = representation
			assemblage.add( representation )

			if(color === undefined)
			{
				let logarithm = Math.log(furthestOutDistance)
				color = new THREE.Color().setHSL(clamp(logarithm /3,0,1),0.5,0.5)
			}
			representation.material.color.copy(color)

			alwaysUpdateFunctions.push( function()
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

			//no rotating the assemblage!
			let localPosition = assemblage.worldToLocal(position.clone())
			let localHandMatrix = new THREE.Matrix4().makeRotationFromQuaternion(quaternion)
			localHandMatrix.setPosition(localPosition)

			//maybe the one corresponding to position should be in the direction of the ray origin?
			//projection can cause mirror-reversal?
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
			//helpful observation: if you've not moved the diff should be the identity
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
				imitationHand.positionOld.copy(imitationHand.position)
				imitationHand.position.y += 0.2

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
			if(imitationHand !== null)
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
			
			if( designatedHand.thumbstickButton )
			{
				if( !designatedHand.thumbstickButtonOld )
				{
					matrixWhenGrabbed.copy(threeSphereMatrix)
					whenGrabbedHandPosition.copy(designatedHand.position)
					whenGrabbedHandQuaternion.copy(designatedHand.quaternion)
				}

				virtualHand.position.copy(designatedHand.position)
				virtualHand.quaternion.copy(designatedHand.quaternion)
				virtualHand.velocity.copy(designatedHand.position).sub(designatedHand.positionOld)
				virtualHand.angularVelocity.copy(designatedHand.quaternionOld).inverse().multiply(designatedHand.quaternion)
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

				// if( designatedHand.thumbstickDown )
				// {
				// 	assemblage.position.add(designatedHand.deltaPosition)
				// }
				// else if(designatedHand.thumbstickDownOld)
				// {
				// 	log(assemblage.position)
				// }
			}
			applyVirtualHandDiffToRotatingThreeSphereMatrix()

			if( designatedHand.button2 && !designatedHand.button2Old )
			{
				cycleThreeSpheres()
			}
		} )
	}

	initProjectionControls()

	let assemblage = new THREE.Group()
	assemblage.position.y = 1.6 - height * 0.6
	assemblage.scale.setScalar(0.05)
	assemblage.updateMatrixWorld()
	scene.add(assemblage)

	let faceToLookAt = visiBox.faces[1]
	faceToLookAt.eyeAttractionAngle = 0.3
	objectsToBeLookedAtByHelmet.push(faceToLookAt)

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

				hopfCircles.push( GreatCircle( new THREE.Vector4().copy(q1), new THREE.Vector4().copy(q2), color, false ) )
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

	{
		let visibleSet = {value:greatCircleSets.length}
		markObjectProperty(visibleSet,"value")

		function cycleThreeSpheres()
		{
			visibleSet.value++
			if(visibleSet.value > greatCircleSets.length)
			{
				visibleSet.value = 0
			}
		}

		alwaysUpdateFunctions.push(function()
		{
			if( visibleSet.value === greatCircleSets.indexOf(hyperOctahedronCircles) )
			{
				assemblage.scale.setScalar(0.038)
			}
			else
			{
				assemblage.scale.setScalar(0.05)
			}

			for(let i = 0; i < greatCircleSets.length; i++)
			{
				if( greatCircleSets[i][0].representation.visible !== (i === visibleSet.value) )
				{
					for(let j = 0; j < greatCircleSets[i].length; j++)
					{
						greatCircleSets[i][j].representation.visible = (i === visibleSet.value)
					}
				}
			}

			for(let i = 0; i < visiBox.faces.length; i++)
			{
				visiBox.faces[i].visible = (visibleSet.value !== greatCircleSets.length)
			}
		})
	}
}

function initProjectionSystem()
{
	//these are not changing
	let rayOrigin = new THREE.Vector4(0,0,0,-1)	
	let fourSpaceAxes = [
		new THREE.Vector4(1,0,0,0),
		new THREE.Vector4(0,1,0,0),
		new THREE.Vector4(0,0,1,0)
	]

	stereographicallyProject = function(q)
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
	stereographicallyUnproject = function(p)
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