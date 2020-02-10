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

function initGoals(modeChange,restartButton)
{
	let victorySavouringCounter = Infinity
	updateFunctions.push(function()
	{
		victorySavouringCounter -= frameDelta
		if( victorySavouringCounter < 0. )
			reactToVictory()
	})

	let youWinSign = makeTextSign("Puzzle solved!")
	youWinSign.scale.multiplyScalar(.6)
	youWinSign.position.y = camera.topAtZZero - .4
	scene.add(youWinSign)

	let goalExcitedness = 0.
	reactToNewMultivector = function(newMultivectorElements)
	{
		if(goalBox.parent === scene)
		{
			if( equalsMultivector(singularGoalMultivector.elements,newMultivectorElements) )
				victorySavouringCounter = 2.
			goalExcitedness = 1.
		}
		else if(outputGroup.parent === scene)
		{
			log("here we would check against output vectors")
			if(0)
			{
				victorySavouringCounter = 2.
			}
		}
	}

	//singular goal
	{
		var goalBox = new THREE.Group()
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
	}

	//input and output goal
	{
		var scopeInputMultivector = ScopeMultivector();
		removeFromScope(scopeInputMultivector)

		var inputSelectionIndicator = RectangleIndicator()
		var outputSelectionIndicator = RectangleIndicator()
		var selectInput = function(multivec)
		{
			inputSelectionIndicator.position.copy(multivec.position)
			outputSelectionIndicator.position.copy(multivec.position)

			copyMultivector(multivec.elements, scopeInputMultivector.elements)
			scopeInputMultivector.updateAppearance()

			//probably have it shake a little. Well I mean this is what the pipes were meant to be

			console.error("Need to update ALL the scope")
			// for(let i = 0; i < multivectorScope.length; i++)
			// {
			// 	let mv = multivectorScope[i]
			// }
			// //as a result of choosing multivectors and scopes, you have a certain scope. Each . As a result of that
			// //so for each thing in the scope you keep a record of how it was made

			// record = [
			// 	geometricProduct, new Float32Array([0.,0.,0.,0.,0.,0.,0.,0.]),
			// 	geometricSum, scopeInputMultivector.elements,

			// ]

			//it shouldn't care about whether scope is limited
		}
		
		var inputGroup = new THREE.Group()
		// let inputs = Array(numPairs)
		inputGroup.background = new THREE.Mesh(unchangingUnitSquareGeometry, new THREE.MeshBasicMaterial({color:0xFFFFFF}))
		inputGroup.background.scale.x = 1.3
		inputGroup.background.position.z = -.001
		inputGroup.add(inputGroup.background)
		inputGroup.add(inputSelectionIndicator)
		{
			// for(let i = 0; i < inputs.length; i++)
			// {
			// 	let elements = new Float32Array(8)
			// 	for(let j = 0; j < 5; j++) //ONLY USING THOSE THAT WORK
			// 		elements[j] = (Math.random()-.5)*2.
			// 	elements[0] = Math.floor(Math.random()*20) - 10.
			// 	elements[3] = 0.

			// 	inputs[i] = MultivectorAppearance(selectInput,elements)
			// 	delete elements
			// 	inputs[i].position.y = 1.2 * (i-(numPairs-1)/2.);
			// 	inputGroup.add(inputs[i])
			// }

			// selectInput(inputs[0])
		}

		var outputGroup = new THREE.Group()
		outputGroup.background = inputGroup.background.clone()
		outputGroup.add(outputGroup.background)
		outputGroup.add(outputSelectionIndicator)
		{
			// let outputs = Array(inputs.length)

			// let seedForRandomActivity = Math.random()
			// let scopeWithOneExtra = Array(multivectorScope.length+1)
			// for(let i = 0; i < multivectorScope.length; i++)
			// 	scopeWithOneExtra[i] = multivectorScope[i]
			// for(let i = 0; i < outputs.length; i++)
			// {
			// 	scopeWithOneExtra[multivectorScope.length] = inputs[i]
			// 	//possible bug: you're getting both outputs the same sometimes
			// 	let elements = generateRandomMultivectorElementsFromScope(scopeWithOneExtra,seedForRandomActivity)

			// 	outputs[i] = MultivectorAppearance(function(){},elements)
			// 	delete elements
			// 	outputs[i].position.y = 1.2 * (i-(numPairs-1)/2.);
			// 	outputGroup.add(outputs[i])
			// }
		}

		inputGroup.intendedPosition = new THREE.Vector3(0., camera.topAtZZero - 1.6, 0.)
		outputGroup.intendedPosition= new THREE.Vector3(0., camera.topAtZZero - 1.6, 0.)
		outputGroup.position.copy(outputGroup.intendedPosition)
		inputGroup.position.copy(inputGroup.intendedPosition)
		let positionGetter = new THREE.Vector3()
		updateFunctions.push(function()
		{
			inputGroup.intendedPosition.x = -camera.rightAtZZero + inputGroup.background.scale.x/2.
			// outputGroup.intendedPosition.x = camera.rightAtZZero - inputGroup.background.scale.x/2. - .1
			outputGroup.intendedPosition.x = -inputGroup.intendedPosition.x

			getMultivectorScopePosition( multivectorScope.length-1, positionGetter )
			inputGroup.intendedPosition.x += positionGetter.x + .9 + camera.rightAtZZero

			outputGroup.position.lerp(outputGroup.intendedPosition,.1)
			inputGroup.position.lerp( inputGroup.intendedPosition,.1)
		})
	}

	updateFunctions.push( function()
	{
		if( checkIfObjectIsInScene(goalBox) )
		{
			let oscillating = .5 + .5 * Math.sin(frameCount * .14)	

			goalExcitedness -= frameDelta * .75
			if( goalExcitedness < 0. )
				goalExcitedness = 0.
			singularGoalMultivector.position.x = goalExcitedness * .2 * Math.sin(frameCount * .3)
			goalBox.title.children[0].material.color.setRGB(1.,1.-goalExcitedness*oscillating,1.-goalExcitedness*oscillating)

			if(victorySavouringCounter !== Infinity)
				goalBox.title.children[0].material.color.setRGB(1.-oscillating,1.,1.-oscillating)

			goalBox.position.x = camera.rightAtZZero - 1.4
			goalBox.position.y = 0.//camera.topAtZZero - 2.2
		}

		youWinSign.visible = victorySavouringCounter !== Infinity
	})

	let levels = Levels()
	levelSetUp = function()
	{
		victorySavouringCounter = Infinity

		let l = levels[levelIndex]

		setScope(l.options,l.operators)

		if(l.singularGoal !== undefined)
		{
			scene.add(goalBox)
			copyMultivector(l.singularGoal, singularGoalMultivector.elements)
			singularGoalMultivector.updateAppearance()
		}
		else
			scene.remove(goalBox)

		if(l.inputs)
		{
			scene.add(inputGroup,outputGroup)

			for(let i = 0; i < l.inputs.length; i++)
			{
				let inputMv = MultivectorAppearance( selectInput,l.inputs[i])
				inputGroup.add( inputMv )
				inputMv.position.y = 1.2 * (i-(l.inputs.length-1)/2.)
			}

			let swapMultivector = multivectorScope[0]
			multivectorScope[0] = scopeInputMultivector
			if(swapMultivector)
				multivectorScope.push( swapMultivector )
			scene.add(scopeInputMultivector)
			clickables.push(scopeInputMultivector.thingYouClick)

			inputGroup.background.scale.y  = inputGroup.background.scale.x * l.inputs.length
			outputGroup.background.scale.y = inputGroup.background.scale.y
			selectInput(inputGroup.children[inputGroup.children.length-1])

			for(let i = 0; i < multivectorScope.length; i++)
				getMultivectorScopePosition(i,multivectorScope[i].position)
		}

		if(l.videoDetails !== undefined)
		{
			setVideo(
				l.videoDetails.filename,
				l.videoDetails.startTime,
				l.videoDetails.endTime,
				l.videoDetails.markerTimes,
				l.videoDetails.markerPositions)
		}
		else if(l.steps !== undefined)
		{
			//compute the outputs
			let outputs = Array(l.inputs.length)
			let tempScope = []
			for(let i = 0; i < outputs.length; i++)
			{
				tempScope.push(l.inputs[i])
				for(let j = 0; j < l.options.length; j++)
					tempScope.push(l.options[j])

				for(let j = 0; j < l.steps.length; j++)
				{
					let s = l.steps[j]
					tempScope.push( s[0](tempScope[s[1]],tempScope[s[2]]) )
				}
				outputs[i] = tempScope[tempScope.length-1]
				for(let j = tempScope.length-1; j > -1; j--)
					delete tempScope[j]
				tempScope.length = 0
			}

			for(let i = 0; i < l.inputs.length; i++)
			{
				let outputMv = MultivectorAppearance(function(){},outputs[i])
				outputGroup.add( outputMv )
				outputMv.position.y = 1.2 * (i-(l.inputs.length-1)/2.)
			}
		}
		else
		{
			scene.remove(inputGroup,outputGroup)
		}
	}

	let levelIndex = -1;
	function reactToVictory()
	{
		levelIndex++
		if( levelIndex >= levels.length )
		{
			let sign = makeTextSign("Well done! That's all the levels so far :)")
			sign.scale.multiplyScalar(.4)
			scene.add(sign)
			let countDown = 3.2;
			updateFunctions.push(function()
			{
				countDown -= frameDelta
				if(countDown < 0.)
					location.reload()
			})

			return
		}

		levelSetUp()
	}
	bindButton("l",reactToVictory)

	modeChange.campaign = function()
	{
		levelIndex = -1;
		reactToVictory()

		scopeIsLimited = true

		//for now restart is only for campaign mode. Only useful in random mode if/when you have 
		scene.add(restartButton)
	}
	modeChange.sandbox = function()
	{
		scene.remove(goalBox)
		scene.remove(inputGroup,outputGroup)
		scene.remove(restartButton)
		
		scopeIsLimited = false
		setScope()
	}
}