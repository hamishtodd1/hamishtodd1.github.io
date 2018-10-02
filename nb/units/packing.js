/*
	Chapters
		They compete to see how many they can get in
			Same, but with rotation and a bigger container
		resize the container and more pop in
			Gotta get a certain number in
		Multiple choice for how many and you can see them in there (have to count)
		Multiple choice for how many and you have to multiply them/picture it (but not rotate them)
		Same but you have to rotate them

		Pack circles into rectangle
		You're a bee and you want lots of cells
		You're evolution packing circlular eye things onto a spherical big eye
		Pack spheres into sphere (gobstopper)
		Signal processing
			Pack lines into line

	When you rotate them, they all rotate at the same time

	Applications / texture maps
		Breeze block
		Cardboard box
		pallet
		Truck https://www.turbosquid.com/3d-models/truck-games-obj/988351
		Shipping container
		Ship
		Balls - bowling, football, basketball
		Bricks
		cuboid sweeties/fig rolls in a stack, or books
		Book
		Boxes of toothepaste, tissues, bananas
		Thylakoid?
		Books, boxes with labels on the side eg computer, bananas
		Teacher can zoom, showing you can have box in box in box?

	Discs inside circle 
	Discs on sphere. Could have two stereographically projected
	Balls inside Sphere

	Old ideas/extra credit
		Spheres, can drag them around. Repulsors, why not? "How many squidgy spheres can you get in?"
		https://en.wikipedia.org/wiki/Slothouber%E2%80%93Graatsma_puzzle
		Can pack the surface of a cylinder?
		Find some "pretty" packings?
	Spheres
		Good thing that rotations wouldn't change them!
		Pack on a hyperbolic paraboloid, get seven discs around every disc
		Martin Gardner
			g12 18
			g3 7
			g14 20
			g9 3
			g7 11
		Leech lattice / e8 stuff
		Fibrations? Packing into S3 or RP3? eg making 24 cell or whatever
		There was a black and white cube thing in wikipedia

	You could use circle packing on the surface of a sphere to draw a ladybird
	They can click to add repelling dots to a bunch of other repelling dots
	You want to pack 6 circles of radius r on a sphere.
		What’s the minimum radius that sphere can have? Answer cube
		Those stone things up the road are relevant

	poster tubes
	tins of beans

	Zeimlight version
		"Where geometers throws its hand up: cuboid packing"
		Stuff about knapsack problem
		An illustration of NP-hard stuff

	Applications
		Origami
		Oranges
		Crystals
		How gobstoppers end up in a gumball machine
		What videos can you get?

	You get them to pack in as many of the boxes as they can, see who has the most
	That gets you the rotation intuition
*/

function initPacking()
{
	{
		var packCounter = makeTextSign("")
		packCounter.stringPrecedingScore = "Packed: "
		objectsToBeUpdated.push(packCounter)
		packCounter.update = function(){}
		packCounter.position.x = -0.95
		packCounter.position.y = -0.95 / (16/9)
		packCounter.defaultPosition = packCounter.position.clone()
		packCounter.geometry = new THREE.OriginCorneredPlaneBufferGeometry(0.05,0.05)
		camera.add(packCounter)
		packCounter.position.z = -camera.position.z
		packCounter.excitedness = 0;
	}

	// {
	// 	var rightArrow = new THREE.Mesh(new THREE.Geometry(), new THREE.MeshBasicMaterial({side:THREE.DoubleSide, color:0xFF0000}))
	// 	rightArrow.geometry.vertices.push(new THREE.Vector3(0,0,0),new THREE.Vector3(-1,1,0),new THREE.Vector3(-1,-1,0))
	// 	rightArrow.geometry.faces.push(new THREE.Face3(0,1,2))
	// 	rightArrow.scale.multiplyScalar(0.07)
	// 	var leftArrow = rightArrow.clone()
	// 	leftArrow.scale.x *= -1
	// 	rightArrow.position.x = 1
	// 	leftArrow.position.x = -1

	// 	camera.add(rightArrow,leftArrow)
	// 	leftArrow.position.z = rightArrow.position.z = -camera.position.z

	// 	clickables.push(rightArrow)
	// 	rightArrow.onClick = function()
	// 	{
	// 		for(var i = scene.children.length-1; i > -1; i--)
	// 		{
	// 			if(scene.children[i] !== camera)
	// 			{
	// 				scene.remove(scene.children[i])
	// 			}
	// 		}
	// 	}
	// 	clickables.push(leftArrow)
	// 	leftArrow.onClick = function()
	// 	{
	// 	}
	// }

	{
		var orbitControls = {}
		var previousIntersection = mouse.rayIntersectionWithZPlane(0)
		objectsToBeUpdated.push(orbitControls)
		orbitControls.update = function()
		{
			if(mouse.lastClickedObject === null && mouse.clicking)
			{
				var newIntersection = mouse.rayIntersectionWithZPlane(0)

				if( previousIntersection !== null )
				{
					var displacement = newIntersection.clone().sub(previousIntersection)
					if( Math.abs( displacement.x ) > Math.abs( displacement.y ) )
					{
						camera.rotation.y += displacement.x * 0.3;
						camera.rotation.y = clamp(camera.rotation.y,-0.16,0.16)
					}
				}
				else
				{
					previousIntersection = new THREE.Vector3();
				}

				previousIntersection.copy(newIntersection)
			}
			else
			{
				previousIntersection = null;
			}
		}
	}

	// {
	// 	var resetButton = makeTextSign("Reset")
	// 	resetButton.geometry = new THREE.OriginCorneredPlaneBufferGeometry(0.05,0.05)
	// 	rotateButton.position.copy(packCounter.position)
	// 	rotateButton.position.y *= -1
	// 	rotateButton.position.y -= 0.05 * rotateButton.scale.y
	// 	clickables.push(resetButton)
	// 	resetButton.onClick = function()
	// 	{
	// 		console.log("yo")
	// 	}
	// 	scene.add(resetButton)
	// }

	// initManualPacking(packCounter,true)
	// initResizingRectangle(packCounter)
	initMultipleChoice()
	return

	{
		var applicationButton = makeTextSign( "Different object" )
		applicationButton.scale.multiplyScalar(1.6)
		applicationButton.position.y = 0.5
		clickables.push(applicationButton)

		var cuboidsToChange = []
		var applications = []
		applicationButton.onClick = function()
		{
			var newIndex = Math.floor(Math.random() * applications.length)
			//ideally you can't get the same one repeatedly
			for(var i = 0; i < cuboidsToChange.length; i++)
			{
				
			}
		}
		scene.add(applicationButton)
	}

	new THREE.OBJLoader().load("data/meshes/book.obj", function(obj)
	{
		var scaleMatrix = new THREE.Matrix4().makeScale(0.1,0.1,0.1)
		var coverGeometry = obj.children[1].geometry.applyMatrix( scaleMatrix )
		coverGeometry.computeBoundingBox()

		var pagesGeometry = obj.children[2].geometry.applyMatrix( scaleMatrix )

		var book = new THREE.Mesh(coverGeometry, new THREE.MeshPhongMaterial({color:0xFF0000}) )
		book.add( new THREE.Mesh(pagesGeometry, new THREE.MeshBasicMaterial({color:0xFFFFFF}) ) )

		scene.add(book)
	})

	{
		var cereal = new THREE.Group()
		scene.add(cereal)

		var names = ["front", "side", "top"]
		var addition = new THREE.Vector3(0.5,0.5,0.5)
		for(var i = 0; i < 3; i++)
		{
			var texture = new THREE.TextureLoader().load('data/textures/cereal/' + names[i] + '.jpg')
			var a = new THREE.Mesh(new THREE.PlaneGeometry(1,1), new THREE.MeshBasicMaterial({map:texture,side:THREE.DoubleSide}) )
			var b = new THREE.Mesh(new THREE.PlaneGeometry(1,1), a.material )
			a.position.setComponent((i+2)%3, 0.5)
			b.position.setComponent((i+2)%3,-0.5)

			a.position.add(addition)
			b.position.add(addition)

			if(i===1)
			{
				a.rotation.y = b.rotation.y = TAU/4
			}
			if(i===2)
			{
				a.rotation.x = b.rotation.x = TAU/4
			}
			b.rotation.y += TAU / 2
			cereal.add(a,b)
		}
		cereal.scale.set(0.228,0.414,0.072)
		objectsToBeRotated.push(cereal)
	}
}

function initMultipleChoice()
{
	// var adviceSign = makeTextSign("Click on one of these:")
	// adviceSign.position.y = -0.43
	// adviceSign.material.color.setRGB(1,1,0)
	// scene.add(adviceSign)

	var countdownTilNext = Infinity;
	var correctAnswer = null

	var answers = []
	setUpQuestion = function()
	{
		var dimensionsInCuboids = new THREE.Vector3(3,3,3)
		// for(var i = 0; i < 3; i++)
		// {
		// 	dimensionsInCuboids.setComponent(i, Math.max(2,(Math.floor( Math.random() * maxDimensions[i] )) ) )
		// }

		var smallunDimensions = new THREE.Vector3()
		var maxDimensions = [4,4,4]
		for(var i = 0; i < 3; i++)
		{
			smallunDimensions.setComponent(i,0.1 * (Math.floor( Math.random() * 3)+1))
		}
		var smallunPosition = new THREE.Vector3(-0.5,0,0)
		var smallun = ResizingCuboid(smallunDimensions,smallunPosition,true,false,false)

		var biggunDimensions = smallunDimensions.clone().multiply(dimensionsInCuboids).multiplyScalar(1.01)
		var biggun = ResizingCuboid(biggunDimensions,new THREE.Vector3(0.25,0,0),true,false,true,dimensionsInCuboids)
		for(var i = 0; i < biggun.cuboidsInside.length; i++)
		{
			biggun.cuboidsInside[i].place(smallunDimensions)
			// biggun.cuboidsInside[i].visible = false
		}

		var movementSegment = 0;
		var standIn = {}
		var numSegments = dimensionsInCuboids.x + (dimensionsInCuboids.y-1) + (dimensionsInCuboids.z-1)
		var cuboidsMovingInSegments = Array(Math.round(numSegments))
		for(var i = 0 ; i < numSegments; i++)
		{
			cuboidsMovingInSegments[i] = []
		}

		var lowestUnallocatedCuboidIndex = 0
		var segmentIndex = 0;
		for(segmentIndex; segmentIndex < dimensionsInCuboids.x; segmentIndex++)
		{
			cuboidsMovingInSegments[segmentIndex].push(biggun.cuboidsInside[lowestUnallocatedCuboidIndex])
			lowestUnallocatedCuboidIndex++
		}

		for(segmentIndex; segmentIndex < dimensionsInCuboids.x + dimensionsInCuboids.y - 1; segmentIndex++)
		{
			for(var j = 0; j < dimensionsInCuboids.x; j++)
			{
				console.log("uo")
				cuboidsMovingInSegments[segmentIndex].push(biggun.cuboidsInside[lowestUnallocatedCuboidIndex])
				lowestUnallocatedCuboidIndex++
			}
		}

		for(segmentIndex; segmentIndex < cuboidsMovingInSegments.length; segmentIndex++)
		{
			for(var i = 0; i < dimensionsInCuboids.x; i++)
			{
				for(var j = 0; j < dimensionsInCuboids.y; j++)
				{
					cuboidsMovingInSegments[segmentIndex].push(biggun.cuboidsInside[lowestUnallocatedCuboidIndex])
					lowestUnallocatedCuboidIndex++
				}
			}
		}
		
		console.log(cuboidsMovingInSegments)
		objectsToBeUpdated.push(standIn)
		standIn.update = function()
		{
			movementSegment += frameDelta
			movementSegment = clamp(movementSegment,0,cuboidsMovingInSegments.length-1)
			var currentSegment = cuboidsMovingInSegments[Math.floor(movementSegment)]
			for(var i = 0; i < biggun.cuboidsInside.length; i++)
			{
				var cuboidInside = biggun.cuboidsInside[i]
				if( currentSegment.indexOf( cuboidInside ) !== -1)
				{
					cuboidInside.position.lerp(cuboidInside.eventualPosition,0.1 )
				}
			}
		}

		for(var i = 0; i < biggun.cuboidsInside.length; i++)
		{
			var cuboidInside = biggun.cuboidsInside[i];
			cuboidInside.visible = true

			cuboidInside.eventualPosition = cuboidInside.position.clone()

			cuboidInside.position.copy(smallunPosition)
			cuboidInside.position.addScaledVector(smallunDimensions,-0.5)
		}
		
		var correctValue = dimensionsInCuboids.x * dimensionsInCuboids.y * dimensionsInCuboids.z

		var numPresentedAnswers = 8; //the minimum correct answer!
		var whereCorrectValueIsInAnswers = Math.floor( Math.random() * numPresentedAnswers )
		var lowestAnswerToPresent = correctValue - whereCorrectValueIsInAnswers;
		for(var i = 0; i < numPresentedAnswers; i++ )
		{
			var num = lowestAnswerToPresent+i
			var answer = makeTextSign(num.toString())
			answers.push(answer)
			scene.add(answer)
			answer.position.x = 0.16 * (i-(numPresentedAnswers-1)/2)
			answer.position.y = -0.5

			if(i === whereCorrectValueIsInAnswers)
			{
				correctAnswer = answer
			}
			clickables.push(answer)
			answer.onClick = function()
			{
				if( this !== correctAnswer )
				{
					this.material.color.setRGB(1,0,0)
				}
				else
				{
					correctSign.material.opacity = 1
				}
				countdownTilNext = 2.3
				// scene.remove(adviceSign)

				for(var i = 0; i < biggun.cuboidsInside.length; i++)
				{
					biggun.cuboidsInside[i].visible = checkBoxMeshContainment(biggun,biggun.cuboidsInside[i])
				}
			}
		}
	}
	setUpQuestion()

	var correctSign = makeTextSign("Correct!")
	correctSign.material.color.setRGB(0,1,0)
	correctSign.scale.multiplyScalar(3)
	correctSign.position.set(-0.5,-0.34,0)
	correctSign.material.transparent = true
	correctSign.material.opacity = 0.0001
	scene.add(correctSign)

	var handler = {}
	objectsToBeUpdated.push(handler)
	handler.update = function()
	{
		countdownTilNext -= frameDelta

		if(countdownTilNext !== Infinity)
		{
			var oscillating = sq(Math.sin(frameCount * 0.1))
			correctAnswer.material.color.setRGB(oscillating,1,oscillating)
		}

		if(countdownTilNext < 0)
		{
			var hackSign = new THREE.Mesh(new THREE.PlaneGeometry(0.8,0.2), new THREE.MeshBasicMaterial({map:new THREE.TextureLoader().load('data/textures/refresh.jpg'),side:THREE.DoubleSide}) )
			hackSign.material.depthTest = false
			hackSign.position.y = 0.4
			scene.add(hackSign)

			countdownTilNext = Infinity
			correctAnswer.material.color.setRGB(1,1,1)

			for(var i = 0; i < answers.length; i++)
			{
				clickables.splice(clickables.indexOf(answers[i]),1)
				scene.remove(answers[i])
				answers[i].material.dispose()
				answers[i].geometry.dispose()
			}
			answers = []

			// setUpQuestion()
		}
	}
}

function initResizingRectangle(packCounter)
{
	// camera.position.applyAxisAngle(yUnit,TAU/8)
	// camera.rotation.y += TAU / 8
	// scene.rotation.y += TAU/8

	var containingCuboid = ResizingCuboid(new THREE.Vector3(0.5,0.5,0.5),new THREE.Vector3(0.4,0,0),false,true,true)
	var cuboidToAffectLittleOnes = ResizingCuboid(new THREE.Vector3(0.15,0.15,0.15),new THREE.Vector3(-0.5,0,0),false,true,false)

	for(var i = 0; i < containingCuboid.cuboidsInside.length; i++)
	{
		objectsToBeUpdated.push(containingCuboid.cuboidsInside[i])
		containingCuboid.cuboidsInside[i].update = function()
		{
			this.place(cuboidToAffectLittleOnes.currentDimensions)
		}
	}

	packCounter.update = function()
	{
		var score = 0;
		for(var i = 0; i < containingCuboid.cuboidsInside.length; i++)
		{
			if( containingCuboid.cuboidsInside[i].visible === true )
			{
				score++
			}
		}
		packCounter.updateText(packCounter.stringPrecedingScore + score.toString())
	}
}

function measuringStick(sideLength)
{
	var markerSpacing = 0.1
	var numMarkers = Math.max(sideLength / markerSpacing + 1,3)
	console.log(sideLength,numMarkers)
	var markerThickness = 0.01
	var markerMaterial = new THREE.MeshBasicMaterial({color:0x0000FF})
	var lengthMarker = new THREE.Mesh(
		new THREE.CylinderBufferGeometryUncentered(markerThickness/2,numMarkers * markerSpacing * 1.03),
		markerMaterial)
	var cmMarkers = Array(Math.floor(numMarkers) )
	var markerLength = markerThickness*4
	var cmMarkerGeometry = new THREE.CylinderBufferGeometryUncentered(markerThickness/2,markerLength).applyMatrix(new THREE.Matrix4().makeRotationZ(-TAU/4))
	for( var i = 0; i < cmMarkers.length; i++ )
	{
		cmMarkers[i] = new THREE.Mesh(
			cmMarkerGeometry,
			markerMaterial)
		cmMarkers[i].position.y = i * markerSpacing
		cmMarkers[i].position.x = lengthMarker.position.x - markerLength

		// cmMarkers[i].numberSign = makeTextSign( i.toString() )
		// cmMarkers[i].numberSign.position.x = -markerLength/2
		// cmMarkers[i].add( cmMarkers[i].numberSign ) //sure you need these?

		lengthMarker.add( cmMarkers[i] )
	}

	lengthMarker.updateCmMarkers = function()
	{
		// for(var i = 0; i < cmMarkers.length; i++)
		// {
		// 	cmMarkers[i].numberSign.rotation.x = -lengthMarker.rotation.x
		// 	cmMarkers[i].numberSign.rotation.y = -lengthMarker.rotation.y
		// 	cmMarkers[i].numberSign.rotation.z = -lengthMarker.rotation.z
		// }
	}

	return lengthMarker
}

function ResizingCuboid(dimensions,position,measurementMarkers,modifiable,filled,dimensionsInCuboids)
{
	var cuboidInitialDimension = 1.0
	var binColor = new THREE.Color(0.8,0.8,0.8);
	var transparentMaterial = new THREE.MeshPhongMaterial({transparent:true, opacity: 0.3, color:binColor})
	var cuboid = new THREE.Mesh(new THREE.CubeGeometry(cuboidInitialDimension,cuboidInitialDimension,cuboidInitialDimension), transparentMaterial)
	cuboid.geometry.computeBoundingBox()
	cuboid.currentDimensions = new THREE.Vector3()
	scene.add(cuboid)

	var vertexGeometry = new THREE.SphereBufferGeometry(0.015)
	var vertexMaterial = new THREE.MeshPhongMaterial({color:0xFFD700})
	function Vertex()
	{
		var vertex = new THREE.Mesh(vertexGeometry,vertexMaterial)
		scene.add(vertex)
		return vertex
	}

	var edgeMaterial = new THREE.MeshPhongMaterial({color:0x000000})
	var edgeGeometry = new THREE.CylinderBufferGeometryUncentered(0.01,1)
	function Edge(start,end)
	{
		var edge = new THREE.Mesh(edgeGeometry,edgeMaterial )
		scene.add( edge )
		return edge;
	}

	cuboid.vertices = Array(cuboid.geometry.vertices.length)
	for(var i = 0; i < cuboid.geometry.vertices.length; i++)
	{
		cuboid.vertices[i] = Vertex()
	}

	cuboid.edges = []
	for(var i = 0; i < cuboid.geometry.vertices.length; i++)
	{
		for(var j = i+1; j < cuboid.geometry.vertices.length; j++)
		{
			if(Math.abs(cuboid.geometry.vertices[i].distanceTo(cuboid.geometry.vertices[j]) - cuboidInitialDimension ) < 0.001)
			{
				var edge = Edge()
				cuboid.edges.push(edge)

				edge.start = cuboid.vertices[i].position
				edge.end = cuboid.vertices[j].position
			}
		}
	}

	cuboid.updateVerticesAndEdges = function()
	{
		cuboid.updateMatrixWorld()
		for(var i = 0; i < cuboid.geometry.vertices.length; i++)
		{
			cuboid.vertices[i].position.copy(cuboid.geometry.vertices[i])
			cuboid.localToWorld(cuboid.vertices[i].position)
		}
		for(var i = 0; i < cuboid.edges.length; i++)
		{
			cuboid.edges[i].position.copy( cuboid.edges[i].start )
			pointCylinder(cuboid.edges[i], cuboid.edges[i].end )
			cuboid.edges[i].scale.y = cuboid.edges[i].start.distanceTo(cuboid.edges[i].end)
		}
	}

	var grabbedVertex = null
	var grabbingPlaneWorld = null
	var mouseIntersectionWithFacePlane = null

	if(modifiable)
	{
		objectsToBeUpdated.push(cuboid)
		cuboid.update = function()
		{
			//Can't use onclick because intersectObject doesn't always work whereas this does
			if(mouse.clicking && !mouse.oldClicking)
			{
				var localRay = mouse.rayCaster.ray.clone()
				localRay.direction.add(localRay.origin)

				cuboid.worldToLocal(localRay.origin)
				cuboid.worldToLocal(localRay.direction)

				localRay.direction.sub(localRay.origin)
				localRay.direction.normalize()

				var intersectionPoint = localRay.intersectBox( cuboid.geometry.boundingBox )
				if( intersectionPoint !== null )
				{
					mouse.lastClickedObject = this

					grabbedVertex = cuboid.geometry.vertices[ getClosestPointToPoint(intersectionPoint,cuboid.geometry.vertices) ]
					mouseIntersectionWithFacePlane = intersectionPoint

					var closestPlaneDist = Infinity
					for(var i = 0; i < cuboid.geometry.faces.length; i++)
					{
						var face = cuboid.geometry.faces[i]
						var worldGrabbedFaceVertices = [cuboid.geometry.vertices[face.getCorner(0)].clone(),cuboid.geometry.vertices[face.getCorner(1)].clone(),cuboid.geometry.vertices[face.getCorner(2)].clone()]
						for(var j = 0; j < 3; j++)
						{
							cuboid.localToWorld( worldGrabbedFaceVertices[j] )
						}
						var facePlane = new THREE.Plane().setFromCoplanarPoints(worldGrabbedFaceVertices[0],worldGrabbedFaceVertices[1],worldGrabbedFaceVertices[2])
						if( Math.abs( facePlane.distanceToPoint(intersectionPoint) ) < Math.abs( closestPlaneDist ) )
						{
							grabbingPlaneWorld = facePlane
							closestPlaneDist = facePlane.distanceToPoint(intersectionPoint)
						}
					}
				}
			}

			//the distance that the mouseray intersection with face has moved = distance our vertex
			if( grabbedVertex )
			{
				var newMouseIntersectionWithFacePlane = mouse.rayCaster.ray.intersectPlane( grabbingPlaneWorld )
				if( newMouseIntersectionWithFacePlane === null)
				{
					//hack, projective plane alert (quite interesting)
					return
				}
				var displacement = newMouseIntersectionWithFacePlane.clone().sub(mouseIntersectionWithFacePlane)

				var oldGrabbedVertex = grabbedVertex.clone()
				grabbedVertex.add(displacement)
				for(var d = 0; d < 3; d++)
				{
					for(var i = 0; i < cuboid.geometry.vertices.length; i++)
					{
						if(cuboid.geometry.vertices[i].getComponent(d) === oldGrabbedVertex.getComponent(d) )
						{
							cuboid.geometry.vertices[i].setComponent(d,grabbedVertex.getComponent(d))
						}
					}
				}

				cuboid.geometry.verticesNeedUpdate = true
				cuboid.geometry.computeBoundingBox()
				mouseIntersectionWithFacePlane.copy(newMouseIntersectionWithFacePlane)

				if(!mouse.clicking)
				{
					grabbedVertex = null
					grabbingPlaneWorld = null
					mouseIntersectionWithFacePlane = null
				}
			}
			cuboid.updateVerticesAndEdges()
			cuboid.updateMatrixWorld()

			cuboid.geometry.boundingBox.getSize(cuboid.currentDimensions)
		}
	}

	cuboid.geometry.applyMatrix(new THREE.Matrix4().scale(dimensions))

	if(filled)
	{
		if(dimensionsInCuboids === undefined)
		{
			dimensionsInCuboids = new THREE.Vector3(9,9,9)
		}
		var cuboidsInside = Array(Math.round(dimensionsInCuboids.x*dimensionsInCuboids.y*dimensionsInCuboids.z) );
		cuboid.cuboidsInside = cuboidsInside
		var placeholderGeo = new THREE.BoxBufferGeometry(1,1,1).applyMatrix(new THREE.Matrix4().makeTranslation(0.5,0.5,0.5))
		placeholderGeo.computeBoundingBox()
		function CuboidInside(i,j,k)
		{
			var index = k+j*dimensionsInCuboids.z+i*dimensionsInCuboids.z*dimensionsInCuboids.y;
			cuboidsInside[index] = new THREE.Mesh(placeholderGeo,new THREE.MeshPhongMaterial({color:new THREE.Color(Math.random(),Math.random(),Math.random())}))
			cuboidsInside[index].i = i; cuboidsInside[index].j = j; cuboidsInside[index].k = k;
			cuboidsInside[index].place = function(dimensions)
			{
				this.scale.copy(dimensions)

				this.position.set(this.i,this.j,this.k)
				this.position.multiply(dimensions)
				this.position.add(cuboid.geometry.vertices[6])

				this.visible = checkBoxMeshContainment(cuboid,this)
			}
			scene.add( cuboidsInside[index] )
		}
		
		for(var i = 0; i < dimensionsInCuboids.x; i++) {
		for(var j = 0; j < dimensionsInCuboids.y; j++) {
		for(var k = 0; k < dimensionsInCuboids.z; k++) {
			CuboidInside(i,j,k)
		}
		}
		}
	}

	cuboid.geometry.applyMatrix(new THREE.Matrix4().setPosition(position))
	if(measurementMarkers)
	{
		for(var i = 0; i < 3; i++)
		{
			var lengthMarker = measuringStick( dimensions.getComponent(i) ) 
			scene.add(lengthMarker)
			if(position.x > 0)
			{
				lengthMarker.position.copy( cuboid.geometry.vertices[7] )
				if(i===0) {lengthMarker.rotation.z -= TAU*3/4;lengthMarker.rotation.y -= TAU/2;}
				if(i===2) lengthMarker.rotation.x -= TAU/4
			}
			else
			{
				lengthMarker.position.copy( cuboid.geometry.vertices[2] )
				if(i===0) {lengthMarker.rotation.z += TAU/4;}
				if(i===1) {lengthMarker.rotation.y += TAU/2;}
				if(i===2) {lengthMarker.rotation.y += TAU/2;lengthMarker.rotation.x -= TAU/4;}
			}
			lengthMarker.updateCmMarkers()
		}
	}
	cuboid.updateVerticesAndEdges()

	return cuboid
}

function initCircleInRectanglePacking()
{
	var rect = new THREE.Mesh(new THREE.BoxGeometry(1,0.5,0.0000000001))
	scene.add(rect)

	var circle = new THREE.Mesh(new THREE.CircleBufferGeometry(0.1,32))
	scene.add(circle)
	clickables.push(circle)
	var clickedPoint = new THREE.Vector3()
	circle.onClick = function(intersectionInformation)
	{
		clickedPoint = intersectionInformation.point;
	}

	objectsToBeUpdated.push(circle)
	circle.update = function()
	{
		if( mouse.lastClickedObject === this && mouse.clicking )
		{
			var newClickedPoint = mouse.rayIntersectionWithZPlane(clickedPoint.z)
			this.position.sub(clickedPoint).add(newClickedPoint)
			clickedPoint.copy(newClickedPoint)
		}
	}
}

function initCircleOnSpherePacking()
{
	var sphereRadius = 0.4
	var sphere = new THREE.Mesh(
		new THREE.SphereBufferGeometry(sphereRadius,16,16,0),
		new THREE.MeshPhongMaterial({color:0xFF0000}))
	sphere.castShadow = true
	scene.add( sphere );
	objectsToBeUpdated.push(sphere)
	sphere.update = function()
	{
		this.rotation.y += 0.01
	}

	var spotRotations = [[1.5,0.3],[2.2,0.4],[0.8,1]];
	var spotMinRadius = 0.17;
	for(var i = 0; i < spotRotations.length; i++)
	{
		var spot = new THREE.Mesh(
			new THREE.SphereBufferGeometry(sphereRadius * 1.01,16,2,0,TAU,0,spotMinRadius*(1+i/20)),
			new THREE.MeshPhongMaterial({color:0x000000}) )
		
		spot.rotation.x = spotRotations[i][0];
		spot.rotation.z = spotRotations[i][1];
		objectsToBeUpdated.push(spot)
		spot.update = function()
		{
			this.rotation.y += 0.008
		}
		scene.add(spot);
	}
}

var objectsToBeRotated = []
function initManualPacking(packCounter,haveRotateButton)
{
	if(haveRotateButton)
	{
		var rotateButton = makeTextSign( "Rotate" )
		rotateButton.geometry = new THREE.OriginCorneredPlaneBufferGeometry(0.05,0.05)
		rotateButton.position.copy(packCounter.position)
		rotateButton.position.x *= -1
		rotateButton.position.x -= 0.05 * rotateButton.scale.x
		rotateButton.beenClicked = false
		camera.add(rotateButton)
		rotateButton.position.z = -camera.position.z

		var rotationQueued = 0;

		clickables.push(rotateButton)
		rotateButton.onClick = function()
		{
			rotationQueued += TAU / 3
			this.beenClicked = true
		}
		objectsToBeUpdated.push(rotateButton)
		rotateButton.update = function()
		{
			if(rotationQueued > 0)
			{
				var rotationAmount = 0.1
				if( rotationQueued < rotationAmount )
				{
					rotationAmount = rotationQueued
				}
				rotationQueued -= rotationAmount

				var cuboidRotationAxis = new THREE.Vector3(1,1,1).normalize()
				var m = new THREE.Matrix4().makeRotationAxis(cuboidRotationAxis, -rotationAmount)
				for(var i = 0; i < objectsToBeRotated.length; i++)
				{
					objectsToBeRotated[i].geometry.applyMatrix(m)
					// objectsToBeRotated[i].rotateOnAxis( cuboidRotationAxis, -rotationAmount )
					//and compute bounding box? ;_;
				}
			}

			if( !this.beenClicked )
			{
				var glowColor = 0.7 + 0.3 * (Math.sin(frameCount * 0.1)+1)/2
				this.material.color.setRGB(1,glowColor,1)
			}
			else
			{
				this.material.color.setRGB(1,1,1)
			}
		}
	}

	var _scene = new THREE.Object3D();
	scene.add(_scene)
	_scene.position.z = stage.geometry.vertices[1].z * stage.scale.z;
	_scene.position.y = -9/16
	_scene.rotation.y = -TAU / 8

	var originalCuboidPosition = new THREE.Vector3(0,1/ (16/9),0)

	if(haveRotateButton)
	{
		var binDimensions = new THREE.Vector3(0.41,0.21,0.41)
	}
	else
	{
		var binDimensions = new THREE.Vector3(0.41,0.41,0.41)
	}
	var binGeometry = new THREE.BoxGeometry(binDimensions.x,binDimensions.y,binDimensions.z);
	binGeometry.applyMatrix(new THREE.Matrix4().makeTranslation( binDimensions.x/2,binDimensions.y/2,binDimensions.z/2 ))
	binGeometry.computeBoundingBox();
	var binColor = new THREE.Color(0.8,0.8,0.8);
	var transparentMaterial = new THREE.MeshPhongMaterial({transparent:true, opacity: 0.3, color:binColor})
	var bin = new THREE.Mesh( binGeometry, transparentMaterial )
	// bin.position.y = 0.01
	bin.add( new THREE.Mesh( binGeometry, new THREE.MeshPhongMaterial({side:THREE.BackSide,color:binColor}) ) );
	_scene.add(bin)

	packCounter.update = function()
	{
		var score = 0;
		var thereIsALooseOne = false
		for(var i = 0; i < cuboids.length; i++)
		{
			if( checkBoxMeshContainment(bin, cuboids[i]) )
			{
				score++;
			}
			else
			{
				thereIsALooseOne = true
			}
		}
		var oldText = packCounter.text
		packCounter.updateText(packCounter.stringPrecedingScore + score.toString())
		if( oldText !== packCounter.text && oldText !== "")
		{
			packCounter.excitedness = 1;
		}

		if( !thereIsALooseOne && !mouse.clicking )
		{
			if(haveRotateButton)
			{
				var newCuboid = Cuboid(0.2,0.1,0.1)
			}
			else
			{
				var newCuboid = Cuboid(0.1,0.1,0.1)
			}
			newCuboid.position.copy(originalCuboidPosition)
		}

		packCounter.excitedness -= frameDelta * 1.5
		if(packCounter.excitedness < 0)
		{
			packCounter.excitedness = 0
		}
		packCounter.material.color.g = 1-packCounter.excitedness
		packCounter.position.y = packCounter.defaultPosition.y + packCounter.excitedness * 0.06 * sq(Math.sin(frameCount * 0.2))
	}

	var collideableCuboids = []

	var backgroundCuboidDimension = 4
	for(var i = 0; i < 3; i++)
	{
		var backgroundCuboid = new THREE.Mesh(new THREE.BoxGeometry(backgroundCuboidDimension,backgroundCuboidDimension,backgroundCuboidDimension))
		backgroundCuboid.geometry.computeBoundingBox()
		backgroundCuboid.visible = false
		backgroundCuboid.position.setComponent(i,-backgroundCuboidDimension/2)
		collideableCuboids.push(backgroundCuboid)
		_scene.add(backgroundCuboid)
	}
	
	var cuboids = [];
	function Cuboid(width,height,depth)
	{
		var geo = cuboids.length === 0 ? new THREE.BoxGeometry(width,height,depth):cuboids[0].geometry.clone()
		var cuboid = new THREE.Mesh(
			geo,
			new THREE.MeshPhongMaterial({color:new THREE.Color(0.5,0.5,0.5)})
		)
		cuboid.geometry.computeBoundingBox()
		objectsToBeRotated.push(cuboid)
		cuboid.castShadow = true;
		collideableCuboids.push(cuboid)
		_scene.add(cuboid)

		if(cuboids.length > 0)
		{
			cuboid.rotation.copy(cuboids[0].rotation)
		}
		cuboids.push(cuboid);

		var clickedPoint = new THREE.Vector3();
		clickables.push(cuboid)
		cuboid.onClick = function(intersectionInformation)
		{
			clickedPoint = intersectionInformation.point;
		}

		objectsToBeUpdated.push(cuboid)
		cuboid.update = function()
		{
			if( mouse.clicking && mouse.lastClickedObject === this )
			{
				var newClickedPoint = mouse.rayIntersectionWithZPlane(clickedPoint.z);

				var relativeNcp = this.parent.worldToLocal(newClickedPoint.clone())
				var relativeCp = this.parent.worldToLocal(clickedPoint.clone())

				var delta = relativeNcp.clone().sub(relativeCp)
				this.position.add(delta);

				var cameraPosition = this.parent.worldToLocal(camera.position.clone())
				var fullLengthToCheckAlong = 2
				var furthestPositionToCheck = relativeCp.sub(cameraPosition).setLength(fullLengthToCheckAlong).add(cameraPosition)
				var numPositionsToCheck = 300
				for(var i = 0; i < numPositionsToCheck; i++)
				{
					this.position.lerpVectors(furthestPositionToCheck,cameraPosition,i/numPositionsToCheck)
					var thisPositionRuledOut = false;
					for(var j = 0, jl = collideableCuboids.length; j < jl; j++)
					{
						if( collideableCuboids[j] !== this && checkBoxMeshOverlap(this,collideableCuboids[j]) )
						{
							thisPositionRuledOut = true;
							break;
						}
					}
					if(thisPositionRuledOut)
					{
						continue
					}
					else
					{
						break
					}
				}
				// this.position.add( rcpToCamera.multiplyScalar(Math.random() * 0.1 - 0.05) )

				clickedPoint.copy(newClickedPoint)
			}
			else
			{
				clickedPoint = null;
			}

			this.material.color.g = checkBoxMeshContainment(bin,this) ? 1:0
		}

		return cuboid
	}
}

function checkBoxMeshContainment(a,b)
{
	console.assert(a.parent === b.parent)

	var convertedBoxAMin = a.geometry.boundingBox.min.clone().multiply(a.scale).add(a.position)
	var convertedBoxAMax = a.geometry.boundingBox.max.clone().multiply(a.scale).add(a.position)
	var convertedBoxA = new THREE.Box3(convertedBoxAMin,convertedBoxAMax)

	var convertedBoxBMin = b.geometry.boundingBox.min.clone().multiply(b.scale).add(b.position)
	var convertedBoxBMax = b.geometry.boundingBox.max.clone().multiply(b.scale).add(b.position)
	var convertedBoxB = new THREE.Box3(convertedBoxBMin,convertedBoxBMax)

	return convertedBoxA.containsBox(convertedBoxB)
}

function checkBoxMeshOverlap(a,b)
{
	console.assert(a.parent === b.parent)

	var convertedBoxAMin = a.geometry.boundingBox.min.clone().multiply(a.scale).add(a.position)
	var convertedBoxAMax = a.geometry.boundingBox.max.clone().multiply(a.scale).add(a.position)
	var convertedBoxA = new THREE.Box3(convertedBoxAMin,convertedBoxAMax)

	var convertedBoxBMin = b.geometry.boundingBox.min.clone().multiply(b.scale).add(b.position)
	var convertedBoxBMax = b.geometry.boundingBox.max.clone().multiply(b.scale).add(b.position)
	var convertedBoxB = new THREE.Box3(convertedBoxBMin,convertedBoxBMax)

	return convertedBoxA.intersectsBox(convertedBoxB)
}