/*
	Abstract level ideas
		the threejs demo with the parented cubes
		A puzzle where there are 2 inputs and 2 outputs. One pair seems easy. The other appears to be blank- it's 0. Player has to understand this
		Puzzle such that for each vector you must make the bivector of it and the X axis
		Get in-plane component
		Make rotor from axis and angle

	Levels:
		Scalar multiplication is the first aspect of the clifford product to show
		Add only, diagonal
		Add only, two along three up
		"Double the size of this" - shows elegance of scalar multiplication
		People like animals! Dung beetle rolls dung for the turning
		it would be funny to have 0 as a goal!

	General structure
		Addition only, scalars only
		Addition only, vectors only
		Addition only, bivectors only
		multiplication and addition, scalars
		multiplication and addition, scalars and vectors
		multiplication and addition, scalars and bivectors

	Could limit the number of operations they have?

	General ideas that might lead to levels
		A part where you derive the length of a vector. Even that drops out!
		Knowing distributivity lets you reduce
		Puzzles based around Orientation could be about a snake trying to eat an apple
*/

let reactToNewMultivector = function(){}
let dismantleCurrentMode = function(){}
let scopeIsLimited = true

function initSingularGoals(modeChange)
{
	let singularGoalMultivector = MultivectorAppearance(function(){})
	let goalIrritation
	let victorySavouringCounter
	let reactionToVictory;

	{
		var defaultPosition = new THREE.Vector3(
			camera.rightAtZZero - 1.4,
			camera.topAtZZero - 1.4,
			0.)
		var victoryPosition = defaultPosition.clone()
		victoryPosition.y = 0.

		var goalBox = new THREE.Group()
		goalBox.position.copy(defaultPosition)
		goalBox.add(singularGoalMultivector)

		var defaultText = "Make this:"
		goalBox.title = makeTextSign(defaultText)
		goalBox.title.scale.multiplyScalar(.5)
		goalBox.title.position.y = .9
		goalBox.add(goalBox.title)

		let background = new THREE.Mesh(unchangingUnitSquareGeometry,new THREE.MeshBasicMaterial({color:0x000000}))
		background.scale.set(goalBox.title.scale.x*1.1,goalBox.title.scale.y*4.3,1.)
		background.position.z -= .001
		background.position.y += .18
		goalBox.add(background)
	}

	updateFunctions.push(function()
	{
		if(!checkIfObjectIsInScene(goalBox))
			return

		let oscillating = .5 + .5 * Math.sin(frameCount * .14)
		goalBox.title.children[0].material.color.setRGB(1.,1.,1.)		

		if( goalIrritation !== 0.)
		{
			goalIrritation -= frameDelta * .75
			if( goalIrritation < 0. )
				goalIrritation = 0.
			singularGoalMultivector.position.x = goalIrritation * .2 * Math.sin(frameCount * .3)

			goalBox.title.children[0].material.color.setRGB(1.,1.-oscillating,1.-oscillating)
		}

		if(victorySavouringCounter !== -1.)
		{
			goalBox.title.children[0].material.color.setRGB(1.-oscillating,1.,1.-oscillating)

			victorySavouringCounter -= frameDelta
			if( victorySavouringCounter < 0. )
				reactionToVictory()
		}

		goalBox.position.lerp(victorySavouringCounter==-1.?defaultPosition:victoryPosition,.1)
	})

	function ourReactionToNewMultivector(newMultivectorElements)
	{
		if( equalsMultivector(singularGoalMultivector.elements,newMultivectorElements) )
		{
			goalBox.title.children[0].material.setText("You win!")
			victorySavouringCounter = 2.
		}
		else
		{
			goalIrritation = 1.
		}
	}

	function makeSureSingularModeIsSetUp(goalElements,scope)
	{
		goalBox.title.children[0].material.setText(defaultText)
		scene.add(goalBox)

		victorySavouringCounter = -1.
		goalIrritation = 0.

		reactToNewMultivector = ourReactionToNewMultivector
		dismantleCurrentMode = function()
		{
			scene.remove(goalBox)
		}
	}

	modeChange.endlessRandomizedSingular = function()
	{
		dismantleCurrentMode()

		scopeIsLimited = false
		reactionToVictory = function()
		{
			makeSureSingularModeIsSetUp()
			setScope()
			
			let randomMultivectorElements = generateRandomMultivectorElementsFromScope(multivectorScope)
			copyMultivector(randomMultivectorElements, singularGoalMultivector.elements)
			singularGoalMultivector.updateAppearance()
			delete randomMultivectorElements
		}
		reactionToVictory()
	}

	//randomize/sandbo

	let levelIndex = 0;
	let levels = [
		{
			goal: 
				new Float32Array([0.,1.,1.,0.,0.,0.,0.,0.]),
			options: [
				new Float32Array([0.,1.,0.,0.,0.,0.,0.,0.]),
				new Float32Array([0.,0.,1.,0.,0.,0.,0.,0.])
			]
		},
		{
			goal:
				new Float32Array([0.,2.,0.,0.,0.,0.,0.,0.]),
			options: [
				new Float32Array([0.,1.,0.,0.,0.,0.,0.,0.]),
				new Float32Array([0.,1.,0.,0.,0.,0.,0.,0.])
			]
		}
	]
	modeChange.campaign = function()
	{
		dismantleCurrentMode()

		scopeIsLimited = true
		reactionToVictory = function()
		{
			makeSureSingularModeIsSetUp()

			if(levelIndex >= levels.length)
			{
				let sign = makeTextSign("Well done! That's all the levels so far :)")
				sign.scale.multiplyScalar(.55)
				scene.add(sign)
				scene.remove(goalBox)

				let countDown = 3.2;
				updateFunctions.push(function()
				{
					countDown -= frameDelta
					if(countDown < 0.)
						location.reload()
				})

				return
			}

			setScope(levels[levelIndex].options)
			copyMultivector(levels[levelIndex].goal, singularGoalMultivector.elements)
			singularGoalMultivector.updateAppearance()

			levelIndex++
		}
		reactionToVictory()
	}
}

function initInputOutputGoal()
{
	let numPairs = 2;

	let background = new THREE.Mesh(unchangingUnitSquareGeometry, new THREE.MeshBasicMaterial({color:0xFFFFFF}))
	background.scale.x = numPairs * 1.3
	background.scale.y = 1.3
	background.position.z = -.001

	reactToNewMultivector = function(){}

	var inputSelectionIndicator = RectangleIndicator()
	var outputSelectionIndicator = RectangleIndicator()

	let scopeInputMultivector = ScopeMultivector();
	multivectorScope.push(scopeInputMultivector)
	function selectInput(multivec)
	{
		inputSelectionIndicator.position.copy(multivec.position)
		outputSelectionIndicator.position.copy(multivec.position)

		for(let i = 0; i < 8; i++)
			scopeInputMultivector.elements[i] = multivec.elements[i]
		scopeInputMultivector.updateAppearance()

		//probably have it shake a little. Well I mean this is what the pipes were meant to be

		console.error("Need to update ALL the scope")
	}

	{
		var inputGroup = new THREE.Group()
		scene.add(inputGroup)
		inputGroup.add(background)

		inputGroup.add(inputSelectionIndicator)

		var inputs = Array(numPairs)
		for(let i = 0; i < inputs.length; i++)
		{
			let elements = new Float32Array(8)
			for(let j = 0; j < 5; j++) //ONLY USING THOSE THAT WORK
				elements[j] = (Math.random()-.5)*2.
			elements[0] = Math.floor(Math.random()*20) - 10.
			elements[3] = 0.

			inputs[i] = MultivectorAppearance(selectInput,elements)
			delete elements
			inputs[i].position.x = 1.2 * (i-(numPairs-1)/2.);
			inputGroup.add(inputs[i])
		}

		var inputScope = [inputs[0]]
		selectInput(inputScope[0])
	}

	{
		var outputGroup = new THREE.Group()
		scene.add(outputGroup)
		outputGroup.add(background.clone())
		outputGroup.add(outputSelectionIndicator)

		let seedForRandomActivity = Math.random()

		let outputs = Array(inputs.length)
		let scopeWithOneExtra = Array(multivectorScope.length+1)
		for(let i = 0; i < multivectorScope.length; i++)
			scopeWithOneExtra[i] = multivectorScope[i]
		for(let i = 0; i < outputs.length; i++)
		{
			scopeWithOneExtra[multivectorScope.length] = inputs[i]
			//possible bug: you're getting both outputs the same sometimes
			let elements = generateRandomMultivectorElementsFromScope(scopeWithOneExtra,seedForRandomActivity)

			outputs[i] = MultivectorAppearance(function(){},elements)
			delete elements
			outputs[i].position.x = inputs[i].position.x
			outputGroup.add(outputs[i])
		}

		// let goalSign = makeTextSign("Goal:")
		// goalSign.scale.multiplyScalar(.7)
		// outputGroup.add(goalSign)
		// goalSign.position.x -= background.scale.x * .5 + goalSign.scale.x * .5 + .1
	}

	let intendedPositions = [
		new THREE.Vector3( 0.,-camera.topAtZZero + 2.1, 0.),
		new THREE.Vector3( 0., camera.topAtZZero - .9, 0.),
	]
	updateFunctions.push(function()
	{
		intendedPositions[0].x = camera.rightAtZZero - background.scale.x/2. - .3
		intendedPositions[1].x = camera.rightAtZZero - background.scale.x/2. - .3
		outputGroup.position.lerp(intendedPositions[0],frameCount===0?1.:.1)
		inputGroup.position.lerp( intendedPositions[1],frameCount===0?1.:.1)
	})

	dismantleCurrentMode = function()
	{
		scene.remove(inputGroup)
		scene.remove(outputGroup)

		//and removing that shit from the multivectorScope?

		
	}

	return inputScope
}