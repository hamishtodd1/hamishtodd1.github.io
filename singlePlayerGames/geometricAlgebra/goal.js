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

let modeDependentReactionToResult = function(){}
let dismantleCurrentGoal = function(){}

function initInputOutputGoal(scope,scopeOnClick)
{
	let numPairs = 2;

	let background = new THREE.Mesh(unchangingUnitSquareGeometry, new THREE.MeshBasicMaterial({color:0xFFFFFF}))
	background.scale.x = numPairs * 1.3
	background.scale.y = 1.3
	background.position.z = -.001

	modeDependentReactionToResult = function(){}

	var inputSelectionIndicator = RectangleIndicator()
	var outputSelectionIndicator = RectangleIndicator()

	let scopeInputMultivector = MultivectorAppearance(scopeOnClick);
	scope.push(scopeInputMultivector)
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
		let scopeWithOneExtra = Array(scope.length+1)
		for(let i = 0; i < scope.length; i++)
			scopeWithOneExtra[i] = scope[i]
		for(let i = 0; i < outputs.length; i++)
		{
			scopeWithOneExtra[scope.length] = inputs[i]
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

	dismantleCurrentGoal = function()
	{
		scene.remove(inputGroup)
		scene.remove(outputGroup)

		//and removing that shit from the scope?
	}

	return inputScope
}

function initSingularGoal(goalElements, scope)
{
	{
		var goalBox = new THREE.Group()
		scene.add(goalBox)
		goalBox.position.y = -camera.topAtZZero + 1.4

		goalBox.title = makeTextSign("Make this:")
		goalBox.title.scale.multiplyScalar(.5)
		goalBox.title.position.y = .9
		goalBox.add(goalBox.title)

		let background = new THREE.Mesh(unchangingUnitSquareGeometry,new THREE.MeshBasicMaterial({color:0x000000}))
		background.scale.set(goalBox.title.scale.x*1.1,goalBox.title.scale.y*4.3,1.)
		background.position.z -= .001
		background.position.y += .18
		goalBox.add(background)
	}

	let singularGoalMultivector = null

	//level generator
	let randomMultivectorElements = generateRandomMultivectorElementsFromScope(scope)
	console.assert(!equalsMultivector(randomMultivectorElements,zeroMultivector))
	singularGoalMultivector = MultivectorAppearance(function(){},randomMultivectorElements)
	goalBox.add(singularGoalMultivector)
	delete randomMultivectorElements

	// singularGoalMultivector = MultivectorAppearance(function(){},goalElements)
	// goalBox.add(singularGoalMultivector)

	var goalIrritation = 0.
	updateFunctions.push(function()
	{
		goalBox.position.x = camera.rightAtZZero - 1.4
		
		singularGoalMultivector.position.x = goalIrritation * .2 * Math.sin(frameCount * .3)

		//no, don't do this, there's only one material
		// for(let i = 0; i < singularGoalMultivector.children.length; i++)
		// {
		// 	if(singularGoalMultivector.children[i].isGroup)
		// 	{
		// 		singularGoalMultivector.children[i].children[0].material.color.g = 1.-goalIrritation
		// 		singularGoalMultivector.children[i].children[1].material.color.b = 1.-goalIrritation
		// 	}
		// 	else
		// 	{
		// 		singularGoalMultivector.children[i].material.color.g = 1.-goalIrritation
		// 		singularGoalMultivector.children[i].material.color.b = 1.-goalIrritation
		// 	}
		// }

		goalIrritation = Math.max(goalIrritation - frameDelta * .75,0.);
	})

	let goalAchieved = false
	modeDependentReactionToResult = function(newMultivectorElements)
	{
		if( equalsMultivector(singularGoalMultivector.elements,newMultivectorElements) )
		{
			if(!goalAchieved )
			{
				goalBox.title.children[0].material.setText("You win!")

				updateFunctions.push(function()
				{
					// for(let i = 0; i < singularGoalMultivector.children.length; i++)
					// {
					// 	singularGoalMultivector.children[i].material.color.r = Math.sin(frameCount * .14)
					// 	singularGoalMultivector.children[i].material.color.b = Math.sin(frameCount * .14)
					// }

					goalBox.title.children[0].material.color.r = Math.sin(frameCount * .14)
					goalBox.title.children[0].material.color.b = Math.sin(frameCount * .14)

					goalBox.position.y *= .9
				})

				goalAchieved = true
			}
		}
		else
		{
			goalIrritation = 1.
		}
	}

	dismantleCurrentGoal = function()
	{
		scene.remove(goalBox)
	}

	return goalBox
}