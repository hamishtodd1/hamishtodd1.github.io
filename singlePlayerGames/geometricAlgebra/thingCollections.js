/*
	Here the goals are channelling human resource machine, so probably input varies over one dimension
	Or, really, you should just see what you find
*/

//it can be a display of multivectors
//or a set of inputs to choose from
//or a set of outputs that you can link to something in your scope
//it might even show a single output but vary over time
//it's flexible
	//line
	//plot
	//scatter plot
	//inside 3D volume
//Maybe everything should be given the same location and if you want a list of numbers you need to use vectors that are increasingly diagonal
//and then it needs to be extended. Heh, inheritance... except there are only a few things
//come on, let's have a parabola
ThingCollection = function ()
{
	let group = new THREE.Group()

	let things = [] //multivectors, sets of multivectors, video frames, vectors to be interpreted as vertices of a curve
	group.things = things

	group.addThing = function(thing)
	{
		things.push(thing)
		group.add(thing)
		background.scale.y = background.scale.x * things.length
		for (let i = 0; i < things.length; i++)
			things[i].position.y = -1.2 * (i - (things.length - 1.) / 2.)
	}

	group.clear = function ()
	{
		for (let i = things.length - 1; i > -1; i--)
		{
			things.pop()
			group.remove(things[i])
			removeSingleElementFromArray(clickables, things[i].thingYouClick)
		}
	}

	let background = new THREE.Mesh( unchangingUnitSquareGeometry, new THREE.MeshBasicMaterial({ color: 0xFFFFFF }) )
	group.background = background
	background.scale.x = 1.3
	background.position.z = -.001
	group.add(background)
	
	// var line = new THREE.Line(new THREE.Geometry(), new THREE.LineBasicMaterial({ color: 0x0000FF }));
	// lineVertices = line.geometry.vertices
	// for (let i = 0; i < 3; i++)
	// 	lineVertices.push(new THREE.Vector3(i));
	// goalOutputGroup.line = line

	group.intendedPosition = new THREE.Vector3()
	updateFunctions.push(function ()
	{
		group.position.lerp(group.intendedPosition, .1)
	})

	return group;
}

function initInputAndOutputGroups(inputGroup,outputGroup)
{
	function SelectionIndicator()
	{
		let selectionIndicator = new THREE.Mesh(new THREE.Geometry(), new THREE.MeshBasicMaterial({ color: 0x00FF80, side: THREE.DoubleSide }))
		selectionIndicator.geometry.faces.push(new THREE.Face3(0, 1, 2))
		selectionIndicator.geometry.vertices.push(
			new THREE.Vector3(0., .2, 0.),
			new THREE.Vector3(1., 0., 0.),
			new THREE.Vector3(0., -.2, 0.)
		)

		let indicatorVector = new THREE.Vector3()
		selectionIndicator.matrixAutoUpdate = false

		selectionIndicator.setStartAndEnd = function (start, end)
		{
			indicatorVector.copy(end)
			indicatorVector.sub(start)
			indicatorVector.z = .02

			selectionIndicator.matrix.makeBasis(indicatorVector, yUnit, zUnit)
			selectionIndicator.matrix.setPosition(start)
			selectionIndicator.matrix.elements[14] = -.01
		}

		return selectionIndicator
	}

	let inputScopeMultivector = ScopeMultivector();
	{
		inputGroup.indicator = SelectionIndicator()
		scene.add(inputGroup.indicator)
		let worldspacePlaceToPoint = new THREE.Vector3()
		updateFunctions.push(function()
		{
			worldspacePlaceToPoint.copy(inputGroup.things[inputIndex].position)
			worldspacePlaceToPoint.add(inputGroup.position)
			inputGroup.indicator.setStartAndEnd(inputScopeMultivector.position, worldspacePlaceToPoint)
		})

		let inputIndex = 0
		selectInput = function (multivec)
		{
			inputIndex = inputGroup.things.indexOf(multivec)

			copyMultivector(multivec.elements, inputScopeMultivector.elements)
			inputScopeMultivector.updateAppearance()

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

					mv.updateAppearance()
				}
			}
			//TODO support limited-scope puzzles?
		}

		clickables.push(inputGroup.background)
		inputGroup.background.onClick = function ()
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
			let positionGetter = new THREE.Vector3()
			function updateInputGroupIntendedPosition()
			{
				inputGroup.intendedPosition.x = -camera.rightAtZZero + inputGroup.background.scale.x / 2.
				getMultivectorScopePosition(multivectorScope.length - 1, positionGetter)
				inputGroup.intendedPosition.x += positionGetter.x + .9 + camera.rightAtZZero

				inputGroup.intendedPosition.y = camera.topAtZZero - inputGroup.background.scale.y / 2. - .1
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
			clickables.push(inputScopeMultivector.thingYouClick)

			for (let i = 0; i < multivectorScope.length; i++)
				getMultivectorScopePosition(i, multivectorScope[i].position)
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
		scene.add(outputGroup.indicator)

		clickables.push(outputGroup.background)
		outputGroup.background.onClick = cycleScopeMultivectorDirectedAt
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
			outputGroup.position.y =-inputGroup.position.y

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
				outputGroup.things[i].updateAppearance()
			}
		})
	}
}