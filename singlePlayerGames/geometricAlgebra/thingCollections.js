/*
	Instead of a specific value, you could have the whole column move and see them all change. Or a whole 2d patch. (what the hell does this mean)

	Here the goals are channelling human resource machine, so probably input varies over one dimension
	Or, really, you should just see what you find

	If you change an input while an animation is happening, skip to its end

	it can be a display of multivectors
	or a set of inputs to choose from
	or a set of outputs that you can link to something in your scope
	it might even show a single output but vary over time
	it's flexible
		could even have a scalar field or some weird orientation based thing
	Maybe everything should be given the same location and if you want a list of numbers you need to use vectors that are increasingly diagonal
	and then it needs to be extended. Heh, inheritance... except there are only a few things
	come on, let's have a parabola
*/

ThingCollection = function ()
{
	let group = new THREE.Group()

	let maxThings = sq(256)
	let things = [] //multivectors, sets of multivectors, video frames, vectors to be interpreted as vertices of a curve
	group.things = things

	group.addThing = function(thing)
	{
		console.assert(things.length < maxThings)

		things.push(thing)
		group.add(thing)
	}

	group.clear = function ()
	{
		for (let i = things.length - 1; i > -1; i--)
		{
			things.pop()
			group.remove(things[i])
			if (things[i] !== undefined &&things[i].boundingBox !== undefined)
				removeSingleElementFromArray(clickables, things[i].boundingBox)
		}
	}

	let background = new THREE.Mesh( unchangingUnitSquareGeometry, new THREE.MeshBasicMaterial({ color: 0xFFFFFF }) )
	group.background = background
	background.position.z = -.001
	group.add(background)
	clickables.push(background)
	let representationNames = ["multivectors", "surface","line","points"]
	background.onClick = function()
	{
		// group.representation = representationNames[1 + representationNames.indexOf(group.representation)]
	}

	//other representations
	let line = null
	let points = null
	let surface = null
	let coords = new Float32Array(maxThings * 3);
	{
		//could also have a single thing whose orientation is controlled. Orientation and position and scale?
		line = new THREE.Line(new THREE.BufferGeometry(), new THREE.LineBasicMaterial({ color: 0x0000FF }));
		{
			line.visible = false
			group.line = line
			group.add(line)
			
			line.geometry.addAttribute('position', new THREE.BufferAttribute(coords, 3))
		}

		points = new THREE.Points(new THREE.BufferGeometry(), new THREE.PointsMaterial({ color: 0x0000FF, size: .08 }));
		{
			points.visible = false
			group.points = points
			group.add(points)

			points.geometry.addAttribute('position', new THREE.BufferAttribute(coords, 3))
		}
		
		surface = new THREE.LineSegments(new THREE.BufferGeometry(), new THREE.LineBasicMaterial({ color: 0x0000FF }));
		{
			surface.visible = false
			group.surface = surface
			group.add(surface)

			surface.geometry.addAttribute('position', new THREE.BufferAttribute(coords, 3))
			
			let indices = new Uint16Array(256*256*2 - 256*2)
			let n = 0
			for(let i = 0; i < 256; i++)
			{
				for( let j = 0; j < 256; j++)
				{
					let index = i*256+j;
					if(i < 255)
					{
						indices[n] = index; n++
						indices[n] = index + 1; n++
					}
					if (j < 255)
					{
						indices[n] = index; n++
						indices[n] = index + 256; n++
					}
				}
			}
			surface.geometry.setIndex(new THREE.BufferAttribute(indices, 1))
		}
	}

	group.representation = "multivectors"

	group.intendedPosition = new THREE.Vector3()
	updateFunctions.push(function ()
	{
		if(group.parent !== scene)
			return

		group.position.lerp(group.intendedPosition, .1)

		for (let i = 0; i < group.things.length; i++)
			group.things[i].visible = group.representation === "multivectors"
		line.visible = group.representation === "line"
		surface.visible = group.representation === "surface"
		points.visible = group.representation === "points"

		if(group.representation === "multivectors")
		{
			things[0].position.y = 0.
			for (let i = 1; i < things.length; i++)
				things[i].position.y = things[i - 1].position.y - things[i - 1].boundingBox.scale.y / 2. - things[i].boundingBox.scale.y / 2.
			background.scale.y = .4 + things[0].boundingBox.scale.y / 2. + Math.abs(things[things.length - 1].position.y) + things[things.length - 1].boundingBox.scale.y / 2.
			for (let i = 0; i < things.length; i++)
				things[i].position.y += Math.abs(things[things.length - 1].position.y) / 2.

			for (let i = 0; i < things.length; i++)
				background.scale.x = Math.max(background.scale.x, things[i].boundingBox.scale.x + .2)
		}

		if (line.visible || points.visible)
		{
			let thingElements = null
			for (let i = 0; i < maxThings; i++)
			{
				thingElements = i < group.things.length ? group.things[i].elements : group.things[group.things.length - 1 ].elements
				coords[i * 3 + 0] = thingElements[1]
				coords[i * 3 + 1] = thingElements[2]
				coords[i * 3 + 2] = thingElements[3]
			}
			line.geometry.attributes.position.needsUpdate = line.visible
			points.geometry.attributes.position.needsUpdate = points.visible
		}

		if(surface.visible)
		{
			let thingElements = null
			surface.geometry.attributes.position.needsUpdate = surface.visible
		}
		
		//"add input" is better
		// group.makeThisAGrid = function()
		// {
		// 	let width = 3
		// 	group.addThing(new Float32Array([0., 0., 0., 0., 0., 0., 0., 0.]))
		// 	for(let i = 0; i < maxThings; i++)
		// 	{
		// 		surfaceCoords[i * 3 + 0] = i % width;
		// 		surfaceCoords[i * 3 + 1] = (i - i % width) / width;
		// 		surfaceCoords[i * 3 + 2] = 0.;
		// 	}
		// }

		//could scale it down?
		// let boundingBox = new THREE.Box3()
		// boundingBox.min.copy(firstVertex)
		// boundingBox.max.copy(boundingBox.min)
		// for(let i = 0; i < ; i++)
		// 	boundingBox.expandByPoint(v)
	})

	return group;
}

function initInputAndOutputGroups()
{
	// inputGroup.representation = "line"
	// outputGroup.representation = "line"

	function SelectionIndicator()
	{
		let selectionIndicator = new THREE.Mesh(new THREE.Geometry(), new THREE.MeshBasicMaterial({ color: 0x00FF80, side: THREE.DoubleSide }))
		selectionIndicator.geometry.faces.push(new THREE.Face3(0, 1, 2))
		selectionIndicator.geometry.vertices.push(
			new THREE.Vector3(0., .1, 0.),
			new THREE.Vector3(1., 0., 0.),
			new THREE.Vector3(0., -.1, 0.)
		)

		let indicatorVector = new THREE.Vector3()
		selectionIndicator.matrixAutoUpdate = false
		selectionIndicator.height = 1.

		selectionIndicator.setStartAndEnd = function (start, end)
		{
			indicatorVector.copy(end)
			indicatorVector.sub(start)
			indicatorVector.z = .02

			selectionIndicator.matrix.makeBasis(indicatorVector, yUnit, zUnit)
			selectionIndicator.matrix.elements[5] = selectionIndicator.height
			selectionIndicator.matrix.setPosition(start)
			selectionIndicator.matrix.elements[14] = -.01
		}

		return selectionIndicator
	}

	let inputScopeMultivector = ScopeMultivector();
	{
		inputGroup.indicator = SelectionIndicator()
		inputGroup.indicator.height = 4.
		let worldspacePlaceToPoint = new THREE.Vector3()
		updateFunctions.push(function()
		{
			if(inputGroup.parent === scene)
			{
				worldspacePlaceToPoint.copy(inputGroup.things[inputIndex].position)
				worldspacePlaceToPoint.add(inputGroup.position)
				inputGroup.indicator.setStartAndEnd(inputScopeMultivector.position, worldspacePlaceToPoint)
			}
		})

		let inputIndex = 0
		selectInput = function (multivec)
		{
			inputIndex = inputGroup.things.indexOf(multivec)

			copyMultivector(multivec.elements, inputScopeMultivector.elements)
			inputScopeMultivector.skipAnimation()

			//probably have it shake a little. Well I mean this is what the pipes were meant to be

			for (let i = 0; i < multivectorScope.length; i++)
			{
				let mv = multivectorScope[i]

				if (mv.howIWasMade !== undefined)
				{
					mv.howIWasMade.operation(
						multivectorScope[mv.howIWasMade.operandIndices[0]].elements,
						multivectorScope[mv.howIWasMade.operandIndices[1]].elements,
						mv.elements)

					mv.skipAnimation()
				}
			}
			//TODO support limited-scope puzzles?
		}

		clickables.push(inputGroup.indicator)
		inputGroup.indicator.onClick = function ()
		{
			inputIndex--
			if(inputIndex < 0)
				inputIndex = inputGroup.things.length-1
			selectInput(inputGroup.things[inputIndex])
		}

		addInput = function (elements)
		{
			let multivec = MultivectorAppearance(selectInput, elements)
			inputGroup.addThing(multivec)
			outputGroup.addThing(MultivectorAppearance(cycleScopeMultivectorDirectedAt ) )
			selectInput(multivec)
		}

		{
			function updateInputGroupIntendedPosition()
			{
				if(checkIfObjectIsInScene(inputGroup))
				{
					inputGroup.intendedPosition.x = -camera.rightAtZZero + inputGroup.background.scale.x / 2.
					updateScopePositions()
					inputGroup.intendedPosition.x += multivectorScope[multivectorScope.length - 1].scopePosition.x + .9 + camera.rightAtZZero

					inputGroup.intendedPosition.y = camera.topAtZZero - inputGroup.background.scale.y / 2. - .1
				}
			}
			updateInputGroupIntendedPosition()
			inputGroup.position.copy(inputGroup.intendedPosition)
			updateFunctions.push(updateInputGroupIntendedPosition)
		}

		removeFromScope(inputScopeMultivector)
		addInputScopeMultivectorToScope = function ()
		{
			let swapMultivector = multivectorScope[0]
			multivectorScope[0] = inputScopeMultivector
			if (swapMultivector)
				multivectorScope.push(swapMultivector)
			scene.add(inputScopeMultivector)
			clickables.push(inputScopeMultivector.boundingBox)

			updateScopePositions()
			for (let i = 0; i < multivectorScope.length; i++)
				multivectorScope[i].position.copy(multivectorScope[i].scopePosition)
		}
	}
		
	outputScopeMultivectorIndex = 1;
	function cycleScopeMultivectorDirectedAt()
	{
		outputScopeMultivectorIndex -= 1
		if (outputScopeMultivectorIndex < 0)
			outputScopeMultivectorIndex = multivectorScope.length - 1
	}
	{
		outputGroup.indicator = SelectionIndicator()
		outputGroup.indicator.height = 20.

		clickables.push(outputGroup.indicator)
		outputGroup.indicator.onClick = cycleScopeMultivectorDirectedAt

		let multivectorScopeForSimulation = Array(128)
		for (let i = 0; i < multivectorScopeForSimulation.length; i++)
			multivectorScopeForSimulation[i] = new Float32Array(8)

		updateFunctions.push( function ()
		{
			if (!checkIfObjectIsInScene(outputGroup) || !checkIfObjectIsInScene(inputGroup))
				return

			outputGroup.position.x = inputGroup.position.x
			outputGroup.position.y = -camera.topAtZZero * .5

			outputGroup.indicator.setStartAndEnd(outputGroup.position, multivectorScope[outputScopeMultivectorIndex].position)

			if( multivectorScope.length > multivectorScopeForSimulation.length )
			{
				console.error("Too big for simulation!")
				debugger;
			}

			for(let i = 0; i < inputGroup.things.length; i++)
			{
				for (let j = 0; j < multivectorScope.length; j++)
				{
					if (multivectorScope[j] === inputScopeMultivector)
						copyMultivector(inputGroup.things[i].elements, multivectorScopeForSimulation[j])
					else if (multivectorScope[j].howIWasMade === undefined)
						copyMultivector(multivectorScope[j].elements, multivectorScopeForSimulation[j])
					else
					{
						multivectorScope[j].howIWasMade.operation(
							multivectorScopeForSimulation[multivectorScope[j].howIWasMade.operandIndices[0]],
							multivectorScopeForSimulation[multivectorScope[j].howIWasMade.operandIndices[1]],
							multivectorScopeForSimulation[j])
					}
				}

				copyMultivector(multivectorScopeForSimulation[outputScopeMultivectorIndex], outputGroup.things[i].elements )
				outputGroup.things[i].skipAnimation()
			}
		})
	}
}