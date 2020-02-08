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

	A basic smooth input thing to do would be series of numbers to corkscrew

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

let scopeIsLimited = false
let reactToNewMultivector = function(){}

function initPlayModes(modeChange)
{
	let dismantleCurrentGoalApparatus = function(){}

	//singularGoal
	{
		let goalExcitedness = 0.
		let victorySavouringCounter = -1.

		let goalBox = new THREE.Group()
		var singularGoalMultivector = MultivectorAppearance(function(){})
		goalBox.add(singularGoalMultivector)

		let defaultText = "Make this:"
		{
			goalBox.title = makeTextSign(defaultText)
			goalBox.title.scale.multiplyScalar(.5)
			goalBox.title.position.y = .9
			goalBox.add(goalBox.title)

			let background = new THREE.Mesh(unchangingUnitSquareGeometry,new THREE.MeshBasicMaterial({color:0xffa500 }))
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

			if( goalExcitedness !== 0.)
			{
				goalExcitedness -= frameDelta * .75
				if( goalExcitedness < 0. )
					goalExcitedness = 0.
				singularGoalMultivector.position.x = goalExcitedness * .2 * Math.sin(frameCount * .3)

				goalBox.title.children[0].material.color.setRGB(1.,1.-oscillating,1.-oscillating)
			}

			if(victorySavouringCounter !== -1.)
			{
				goalBox.title.children[0].material.color.setRGB(1.-oscillating,1.,1.-oscillating)

				victorySavouringCounter -= frameDelta
				if( victorySavouringCounter < 0. )
					reactionToVictory()
			}

			goalBox.position.x = camera.rightAtZZero - 1.4
			goalBox.position.y = 0.//camera.topAtZZero - 2.2
		})

		function ourReactionToNewMultivector(newMultivectorElements)
		{
			if( equalsMultivector(singularGoalMultivector.elements,newMultivectorElements) )
			{
				goalBox.title.children[0].material.setText("You win!")
				victorySavouringCounter = 2.
			}
			goalExcitedness = 1.
		}

		function makeSureSingularGoalIsSetUp()
		{
			goalBox.title.children[0].material.setText(defaultText)
			scene.add(goalBox)

			victorySavouringCounter = -1.
			goalExcitedness = 0.

			reactToNewMultivector = ourReactionToNewMultivector
			dismantleCurrentGoalApparatus = function()
			{
				scene.remove(goalBox)
			}
		}
	}

	modeChange.sandbox = function()
	{
		dismantleCurrentGoalApparatus()
		
		scopeIsLimited = false
		reactToNewMultivector = function(){}
		dismantleCurrentGoalApparatus = function(){}
		setScope()
	}

	//inputOutputGoal
	{
		let numPairs = 2;

		let background = new THREE.Mesh(unchangingUnitSquareGeometry, new THREE.MeshBasicMaterial({color:0xFFFFFF}))
		background.scale.y = numPairs * 1.3
		background.scale.x = 1.3
		background.position.z = -.001

		let scopeInputMultivector = ScopeMultivector();
		removeFromScope(scopeInputMultivector)

		function makeSureInputOutputGoalIsSetUp()
		{
			scene.add(inputGroup,outputGroup)

			// victorySavouringCounter = -1.
			// goalExcitedness = 0.

			let swapMultivector = multivectorScope[0]
			multivectorScope[0] = scopeInputMultivector
			if(swapMultivector)
				multivectorScope.push( swapMultivector )
			clickables.push(scopeInputMultivector.thingYouClick)
			scene.add(scopeInputMultivector)
			getMultivectorScopePosition(multivectorScope.indexOf(scopeInputMultivector),scopeInputMultivector.position)

			reactToNewMultivector = function(){} //TODO
			dismantleCurrentGoalApparatus = function()
			{
				scene.remove(inputGroup,outputGroup)
				removeFromScope(scopeInputMultivector)
			}
		}

		var inputSelectionIndicator = RectangleIndicator()
		var outputSelectionIndicator = RectangleIndicator()
		function selectInput(multivec)
		{
			inputSelectionIndicator.position.copy(multivec.position)
			outputSelectionIndicator.position.copy(multivec.position)

			copyMultivector(multivec.elements, scopeInputMultivector.elements)
			scopeInputMultivector.updateAppearance()

			//probably have it shake a little. Well I mean this is what the pipes were meant to be

			console.error("Need to update ALL the scope")
		}

		let inputGroup = new THREE.Group()
		let inputs = Array(numPairs)
		{
			inputGroup.add(background)

			inputGroup.add(inputSelectionIndicator)

			for(let i = 0; i < inputs.length; i++)
			{
				let elements = new Float32Array(8)
				for(let j = 0; j < 5; j++) //ONLY USING THOSE THAT WORK
					elements[j] = (Math.random()-.5)*2.
				elements[0] = Math.floor(Math.random()*20) - 10.
				elements[3] = 0.

				inputs[i] = MultivectorAppearance(selectInput,elements)
				delete elements
				inputs[i].position.y = 1.2 * (i-(numPairs-1)/2.);
				inputGroup.add(inputs[i])
			}

			selectInput(inputs[0])
		}

		let outputGroup = new THREE.Group()
		let outputs = Array(inputs.length)
		{
			outputGroup.add(background.clone())
			outputGroup.add(outputSelectionIndicator)

			let seedForRandomActivity = Math.random()
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
				outputs[i].position.y = inputs[i].position.y
				outputGroup.add(outputs[i])
			}
		}

		inputGroup.intendedPosition = new THREE.Vector3( -camera.rightAtZZero + background.scale.x/2. + 3., camera.topAtZZero - 1.6, 0.)
		outputGroup.intendedPosition= new THREE.Vector3( camera.rightAtZZero - background.scale.x/2. - .1, camera.topAtZZero - 1.6, 0.)
		outputGroup.position.copy(outputGroup.intendedPosition)
		inputGroup.position.copy(inputGroup.intendedPosition)
		updateFunctions.push(function()
		{
			outputGroup.intendedPosition.x = camera.rightAtZZero - background.scale.x/2. - .1
			inputGroup.intendedPosition.x = -camera.rightAtZZero + background.scale.x/2. + 3.
			outputGroup.position.lerp(outputGroup.intendedPosition,.1)
			inputGroup.position.lerp( inputGroup.intendedPosition,.1)
		})
	}
	// makeSureInputOutputGoalIsSetUp()

	//levels
	let levels = Levels()
	{
		bindButton("r",function()
		{
			setLevel(levelIndex)
		})

		//might be nice to make it flash when the level isn't completable

		let restartButtonObj = makeTextSign("Restart")
		var restartButton = restartButtonObj.children[0]
		restartButton.scale.copy(restartButtonObj.scale)
		restartButton.scale.multiplyScalar(.4)

		//"undo" might be better

		clickables.push(restartButton)
		restartButton.onClick = function()
		{
			setLevel(levelIndex)
		}

		scopeIsLimited = true

		let halfMenuTitleWidth = restartButton.scale.x / 2.
		let halfMenuTitleHeight = restartButton.scale.y / 2.
		let padding = .25

		updateFunctions.push(function()
		{
			restartButton.position.x =  camera.rightAtZZero - (halfMenuTitleWidth  + padding)
			restartButton.position.y = -camera.topAtZZero   + (halfMenuTitleHeight + padding) * 2.
		})
	}
	function setLevel(levelIndex)
	{
		if(levels[levelIndex].singularGoal !== undefined)
		{
			makeSureSingularGoalIsSetUp()

			setScope(levels[levelIndex].options,levels[levelIndex].operators)
			copyMultivector(levels[levelIndex].singularGoal, singularGoalMultivector.elements)
			singularGoalMultivector.updateAppearance()
		}
		else //inputOutput
		{
			makeSureInputOutputGoalIsSetUp()

			//compute the outputs
			let outputs = Array(levels[levelIndex].inputs.length)
			let tempScope = []
			for(let i = 0; i < outputs.length; i++)
			{
				tempScope.push(levels[levelIndex].inputs[i])
				for(let j = 0; j < levels[levelIndex].options.length; j++)
					tempScope.push(levels[levelIndex].options[j])

				for(let j = 0; j < levels[levelIndex].steps.length; j++)
				{
					let s = levels[levelIndex].steps[j]
					tempScope.push( s[0](tempScope[s[1]],tempScope[s[2]]) )
				}
				outputs[i] = tempScope[tempScope.length-1]
				for(let j = tempScope.length-1; j > -1; j--)
					delete tempScope[j]
				tempScope.length = 0
			}

			setScope(levels[levelIndex].options,levels[levelIndex].operators)
		}
	}

	let levelIndex = -1;
	modeChange.campaign = function()
	{
		dismantleCurrentGoalApparatus()

		reactionToVictory = function()
		{
			levelIndex++
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

			setLevel(levelIndex)
		}
		reactionToVictory()

		//for now restart is only for campaign mode. Only useful in random mode if/when you have 
		scene.add(restartButton)
	}
}