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
	let victorySavouringTime = 2.
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

	let goalOutputGroup = ThingCollection()
	{
		function updateOutputGroupIntendedPosition()
		{
			// goalOutputGroup.intendedPosition.x = camera.rightAtZZero - inputGroup.background.scale.x/2. - .1

			goalOutputGroup.intendedPosition.copy(inputGroup.intendedPosition)
			goalOutputGroup.intendedPosition.x *= -1.
		}
		updateOutputGroupIntendedPosition()
		goalOutputGroup.position.copy(goalOutputGroup.intendedPosition)
		updateFunctions.push(function()
		{
			updateOutputGroupIntendedPosition()

			if (victorySavouringCounter === Infinity && checkIfObjectIsInScene(goalOutputGroup))
			{
				let victorious = true
				for (let i = 0; i < goalOutputGroup.things.length; i++)
				{
					if (!equalsMultivector(goalOutputGroup.things[i].elements, outputGroup.things[i].elements))
						victorious = false
				}

				if (victorious)
					victorySavouringCounter = victorySavouringTime
			}
		})
	}

	initVideo(goalOutputGroup)

	let goalExcitedness = 0.
	reactToNewMultivector = function(newMultivector)
	{
		if(goalBox.parent === scene)
		{
			if( equalsMultivector(singularGoalMultivector.elements,newMultivector.elements) )
				victorySavouringCounter = victorySavouringTime
			goalExcitedness = 1.
		}

		if(outputGroup.parent === scene)
			outputScopeMultivectorIndex = multivectorScope.length-1
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

		updateFunctions.push(function ()
		{
			if (checkIfObjectIsInScene(goalBox))
			{
				let oscillating = .5 + .5 * Math.sin(frameCount * .14)

				goalExcitedness -= frameDelta * .75
				if (goalExcitedness < 0.)
					goalExcitedness = 0.
				singularGoalMultivector.position.x = goalExcitedness * .2 * Math.sin(frameCount * .3)
				goalBox.title.children[0].material.color.setRGB(1., 1. - goalExcitedness * oscillating, 1. - goalExcitedness * oscillating)

				if (victorySavouringCounter !== Infinity)
					goalBox.title.children[0].material.color.setRGB(1. - oscillating, 1., 1. - oscillating)

				goalBox.position.x = camera.rightAtZZero - 1.4
				goalBox.position.y = 0.//camera.topAtZZero - 2.2
			}

			youWinSign.visible = victorySavouringCounter !== Infinity
		})
	}

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

			scopeIsLimited = true
		}
		else
			scene.remove(goalBox)

		if( l.singularGoal === undefined)
		{
			scene.add(goalOutputGroup)
			scene.add(inputGroup, inputGroup.indicator)
			scene.add(outputGroup, outputGroup.indicator)

			inputGroup.clear()
			goalOutputGroup.clear()
			
			if (l.videoDetails === undefined)
			{
				for (let i = 0; i < l.inputs.length; i++)
					addInput(l.inputs[i])
			}
			else
			{
				let inputs = Array(l.videoDetails.markerTimes.length)
				for(let i = 0; i < l.videoDetails.markerTimes.length; i++)
				{
					let elements = new Float32Array([
						l.videoDetails.markerTimes[i] - l.videoDetails.startTime,
						0.,0.,0.,0.,0.,0.,0.])
					addInput(elements)

					//there to make space. The video doesn't currently end up on it
					//since we might not even be doing it this way!
					goalOutputGroup.addThing(MultivectorAppearance(selectInput, new Float32Array([
						0.,0., 0., 0., 0., 0., 0., 0.])))
				}
			}

			addInputScopeMultivectorToScope()

			scopeIsLimited = false
		}

		if(l.videoDetails !== undefined)
		{
			let outputPositions = Array(l.videoDetails.markerTimes.length)
			goalOutputGroup.background.scale.x *= 1.7
			
			for(let i = 0; i < l.videoDetails.markerTimes.length; i++)
				outputPositions[i] = outputGroup.things[i].position.clone().add(goalOutputGroup.position)

			setVideo(
				l.videoDetails.filename,
				l.videoDetails.startTime,
				l.videoDetails.endTime,
				l.videoDetails.markerTimes,
				outputPositions)
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

			for (let i = 0; i < l.inputs.length; i++)
			{
				goalOutputGroup.addThing(
					MultivectorAppearance(function () { }, outputs[i])
				)
			}
		}
		else
		{
			scene.remove(
				inputGroup,
				goalOutputGroup,
				outputGroup,
				inputGroup.indicator,
				outputGroup.indicator )
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

		victorySavouringCounter = Infinity
		levelSetUp()
	}
	bindButton("l",reactToVictory)

	modeChange.campaign = function()
	{
		levelIndex = -1;
		reactToVictory()

		//for now restart is only for campaign mode
		scene.add(restartButton)
	}
	modeChange.calculator = function()
	{
		scene.remove(goalBox)
		scene.remove(restartButton)
		scene.remove(inputGroup,inputGroup.indicator,goalOutputGroup)

		scopeIsLimited = false

		setScope()
		ScopeMultivector(new Float32Array([ 1., 0., 0., 0., 0., 0., 0., 0.]), true)
		ScopeMultivector(new Float32Array([-1., 0., 0., 0., 0., 0., 0., 0.]), true)
		// ScopeMultivector(new Float32Array([0., 1., 0., 0., 0., 0., 0., 0.]), true)
		// ScopeMultivector(new Float32Array([0., 1., 0., 0., 0., 0., 0., 0.]), true)
		// ScopeMultivector(new Float32Array([0., 1., 0., 0., 0., 0., 0., 0.]), true)
		// ScopeMultivector(new Float32Array([0., 1., 0., 0., 0., 0., 0., 0.]), true)
		// ScopeMultivector(new Float32Array([0., 1., 0., 0., 0., 0., 0., 0.]), true)
		// ScopeMultivector(new Float32Array([33., 0., 0., 0., 0., 0., 0., 0.]), true)
	}
	modeChange.shaderProgramming = function ()
	{
		scene.remove(goalBox)
		scene.remove(restartButton)

		scopeIsLimited = false

		setScope()

		scene.add(inputGroup, inputGroup.indicator)
		scene.add(outputGroup,outputGroup.indicator)
		
		inputGroup.clear()

		for (let i = 0; i < 3; i++)
			addInput(new Float32Array([0., 0., i * .4 + .2, 0., 0., 0., 0., 0.]))
		//need to forget about their positions so you can do the 2D thing

		//next thing: make it
		// for (let i = 0; i < 3; i++)
		// {
		// 	for(let j = 0; j < 3; j++)
		// 	{
		// 		addInput(new Float32Array([0., i * .5, j * .5, 0., 0., 0., 0., 0.]))
		// 	}
		// }

		addInputScopeMultivectorToScope()
		// scene.add(goalOutputGroup.line);

		
		// ScopeMultivector(new Float32Array([1., 0., 0., 0., 0., 0., 0., 0.]),true)
		
		//how to choose the bloody output from the scope
		//The output CAN be a list of individual multivectors. More generally it is a thing in a white box
	}
}