/*
	When you let go of the camera holder...
	...it moves back to where it was...
	but changes camera and handPositions such that they are where
*/

function initCameraHolder(screen)
{
	screen.updateMatrix()
	var cameraHolder = new THREE.Group()
	scene.add(cameraHolder)
	let height = 0.2
	let correctPosition = new THREE.Vector3(-0.2547435361785763,1.610,-0.6565080057853395)
	cameraHolder.position.copy(correctPosition)
	cameraHolder.rotation.set(0,3.2115926535,0)
	cameraHolder.add(screen)

	screen.updateMatrix()
	cameraHolder.frustumIndicator = new THREE.LineSegments(new THREE.Geometry())
	cameraHolder.frustumIndicator.material.color.setRGB(0,0,0)
	cameraHolder.frustumIndicator.geometry.vertices.push(
		new THREE.Vector3(),screen.geometry.vertices[0].clone().applyMatrix4(screen.matrix),
		new THREE.Vector3(),screen.geometry.vertices[1].clone().applyMatrix4(screen.matrix),
		new THREE.Vector3(),screen.geometry.vertices[2].clone().applyMatrix4(screen.matrix),
		new THREE.Vector3(),screen.geometry.vertices[3].clone().applyMatrix4(screen.matrix)
		)
	cameraHolder.add(cameraHolder.frustumIndicator)

	updateFunctions.push(function()
	{
		if(handControllers[LEFT_CONTROLLER_INDEX].button1)
		{
			//don't think too hard, will be tweaked away anyway.
			cameraHolder.position.set(0,0,-0.1)
			cameraHolder.position.add(handControllers[LEFT_CONTROLLER_INDEX].position)
		}

		if(handControllers[LEFT_CONTROLLER_INDEX].button1Old && !handControllers[LEFT_CONTROLLER_INDEX].button1)
		{
			let m = new THREE.Matrix4()
			m.setPosition(correctPosition.clone().sub(cameraHolder.position))
			
			cameraHolder.position.copy(correctPosition)

			renderer.vr.userHackMatrixAffectingStandingMatrix.multiply( m )
		}
	})
	
	let velocity = new THREE.Vector3(0.00001,0.00001,0)
	function goInDirection(normalizedDirectionInOurSpace)
	{
		let newVelocity = cameraHolder.localToWorld(normalizedDirectionInOurSpace.clone())
		newVelocity.sub(cameraHolder.getWorldPosition(new THREE.Vector3()))

		if( velocity.angleTo(newVelocity) > 0.1 )
		{
			log(newVelocity.toArray().toString())
			velocity.copy(newVelocity)
			velocity.setLength(0.002)
		}
		else if(velocity.length() < 0.02)
		{
			velocity.multiplyScalar(1.03)
			log(velocity.length())
		}

		cameraHolder.position.add( velocity )
	}

	bindButton( "a", function(){}, "camera left",function()
	{
		goInDirection(xUnit.clone().negate())
		console.log("cameraHolder position: ", cameraHolder.position.toArray().toString() )
	} )
	bindButton( "d", function(){}, "cameraHolder right",function()
	{
		goInDirection(xUnit)
		console.log("cameraHolder position: ", cameraHolder.position.toArray().toString() )
	} )
	bindButton( "w", function(){}, "cameraHolder forward",function()
	{
		goInDirection(zUnit.clone().negate())
		console.log("cameraHolder position: ", cameraHolder.position.toArray().toString() )
	} )
	bindButton( "s", function(){}, "cameraHolder back",function()
	{
		goInDirection(zUnit)
		console.log("cameraHolder position: ", cameraHolder.position.toArray().toString() )
	} )

	bindButton( "q", function(){}, "cameraHolder turn",function()
	{
		cameraHolder.rotation.y += 0.005
		console.log("cameraHolder rotation: ", cameraHolder.rotation.toArray().toString() )
	} )
	bindButton( "e", function(){}, "cameraHolder turn",function()
	{
		cameraHolder.rotation.y -= 0.005
		console.log("cameraHolder rotation: ", cameraHolder.rotation.toArray().toString() )
	} )

	bindButton( "r", function(){}, "cameraHolder down",function()
	{
		goInDirection(yUnit)
		console.log("cameraHolder position: ", cameraHolder.position.toArray().toString() )
	} )
	bindButton( "f", function(){}, "cameraHolder up",function()
	{
		goInDirection(yUnit.clone().negate())
		console.log("cameraHolder position: ", cameraHolder.position.toArray().toString() )
	} )

	//need speed modification

	// bindButton( "t", function(){}, "pitch forward",function()
	// {
	// 	camera.rotation.x += 0.01
	// 	console.log( "camera rotation: " + camera.rotation.toArray().slice(0,3).toString() )
	// } )
	// bindButton( "g", function(){}, "pitch back",function()
	// {
	// 	camera.rotation.x -= 0.01
	// 	console.log( "camera rotation: " + camera.rotation.toArray().slice(0,3).toString() )
	// } )

	//aligning of points
	{
		// clickables.push(screen)
		// let indexBeingLaid = 0
		// bindButton("[",function()
		// {
		// 	indexBeingLaid = 1-indexBeingLaid
		// }, "switch guide point being laid on videoScreen")
		// screen.onClick = function(intersection)
		// {
		// 	let newLocation = intersection.point
		// 	cameraHolder.worldToLocal(newLocation)
		// 	screenGuidePoints[indexBeingLaid].copy(newLocation)
		// 	log("screen guide point " + indexBeingLaid + " at ", newLocation.toArray().toString())

		// 	repositionScreen()
		// }

		// let realSpaceGuidePoints = Array(2)
		// for(let i = 0; i < 2; i++)
		// {
		// 	let mesh = makeTextSign(i?"R":"L",true,false,false)
		// 	mesh.scale.multiplyScalar(0.06)
		// 	scene.add(mesh)

		// 	realSpaceGuidePoints[i] = mesh.position
		// 	realSpaceGuidePoints[i].x = 2 * (i?1:-1) * Math.random()
		// 	realSpaceGuidePoints[i].z = -0.5
		// }
		// realSpaceGuidePoints[0].set(-0.21576,1.30663,2.3199)
		// realSpaceGuidePoints[1].set(-1.24467,1.30663,1.2123)

		// let screenGuidePoints = Array(2)
		// for(let i = 0; i < 2; i++)
		// {
		// 	let mesh = makeTextSign(i?"R":"L",true,false,false)
		// 	mesh.scale.multiplyScalar(0.06)
		// 	cameraHolder.add(mesh)
		// 	screenGuidePoints[i] = mesh.position

		// 	screenGuidePoints[i].z = screen.position.z
		// 	screenGuidePoints[i].x = 0.4 * screen.scale.x * (i?1:-1)
		// 	screenGuidePoints[i].y = -0.25 * screen.scale.y
		// }
		// screenGuidePoints[0].set(-0.9300020912214844,-0.07516934195963221,-1)
		// screenGuidePoints[1].set(0.24473739242654347,-0.0629324723382858,-1)

		// let lines = Array(2)
		// for(let i = 0; i < 2; i++)
		// {
		// 	lines[i] = new THREE.Line(new THREE.Geometry())
		// 	lines[i].geometry.vertices.push( new THREE.Vector3(), new THREE.Vector3(), new THREE.Vector3() )
		// 	cameraHolder.add(lines[i])
		// }

		// updateFunctions.push(function()
		// {
		// 	if( handControllers[LEFT_CONTROLLER_INDEX].button1 )
		// 	{
		// 		realSpaceGuidePoints[0].copy( handControllers[LEFT_CONTROLLER_INDEX].position )
		// 	}
		// 	else if( handControllers[LEFT_CONTROLLER_INDEX].button2 )
		// 	{
		// 		realSpaceGuidePoints[1].copy( handControllers[LEFT_CONTROLLER_INDEX].position )
		// 	}
		// 	else if( handControllers[LEFT_CONTROLLER_INDEX].button1Old )
		// 	{
		// 		realSpaceGuidePoints[1].y = realSpaceGuidePoints[0].y
		// 		log("real space guide point " + 1 + " at ", screenGuidePoints[1].toArray().toString())
		// 	}
		// 	else if( handControllers[LEFT_CONTROLLER_INDEX].button2Old )
		// 	{
		// 		realSpaceGuidePoints[0].y = realSpaceGuidePoints[1].y
		// 		log("real space guide point " + 0 + " at ", screenGuidePoints[0].toArray().toString())
		// 	}

		// 	repositionScreen()

		// 	for(let i = 0; i < 2; i++)
		// 	{
		// 		lines[i].geometry.vertices[0].copy( realSpaceGuidePoints[i] )
		// 		lines[i].geometry.vertices[1].copy( screenGuidePoints[i] )
		// 		cameraHolder.worldToLocal(lines[i].geometry.vertices[0])

		// 		lines[i].geometry.verticesNeedUpdate = true
		// 	}
		// })

		// function repositionScreen()
		// {
		// 	let planarScreenGuidePoints = [screenGuidePoints[0].clone(),screenGuidePoints[1].clone()]
		// 	let toBeFlattenedIndex = planarScreenGuidePoints[0].y < planarScreenGuidePoints[1].y ? 1:0
		// 	planarScreenGuidePoints[toBeFlattenedIndex].multiplyScalar( planarScreenGuidePoints[1-toBeFlattenedIndex].y / planarScreenGuidePoints[toBeFlattenedIndex].y )

		// 	let planarVectorScreen = planarScreenGuidePoints[1].clone().sub(planarScreenGuidePoints[0]).setComponent(1,0)
		// 	let planarVectorRealSpace = realSpaceGuidePoints[1].clone().sub(realSpaceGuidePoints[0]).setComponent(1,0)

		// 	cameraHolder.quaternion.setFromUnitVectors(planarVectorScreen.clone().normalize(),planarVectorRealSpace.clone().normalize())

		// 	let expectedBall0PositionFromCamera = planarScreenGuidePoints[0].clone()
		// 	expectedBall0PositionFromCamera.multiplyScalar( planarVectorRealSpace.length() / planarVectorScreen.length() )
		// 	expectedBall0PositionFromCamera.applyQuaternion( cameraHolder.quaternion )

		// 	cameraHolder.position.copy(realSpaceGuidePoints[0])
		// 	cameraHolder.position.sub(expectedBall0PositionFromCamera)
		// }
		// repositionScreen()
	}

	return cameraHolder
}