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
		else if(goalOutputGroup.parent === scene)
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

	// initOutputDisplays()
	let goalOutputGroup = MultivectorCollection()
	let inputGroup = MultivectorCollection()
	initInputsAndOutputGoal(inputGroup,goalOutputGroup)

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

			scopeIsLimited = true
		}
		else
			scene.remove(goalBox)

		if( l.singularGoal === undefined) //it's either a video or non-video level
		{
			scene.add(inputGroup,goalOutputGroup)

			let inputs = null
			if(l.inputs !== undefined)
				inputs = l.inputs
			else
			{
				inputs = Array(l.videoDetails.markerTimes.length)
				for(let i = 0; i < l.videoDetails.markerTimes.length; i++)
				{
					let scalar = l.videoDetails.markerTimes[i] - l.videoDetails.startTime
					inputs[i] = new Float32Array([scalar,0.,0.,0.,0.,0.,0.,0.])
				}
			}

			clearInputAndOutputGoal()
			for(let i = 0; i < inputs.length; i++)
				inputGroup.addInput(inputs[i])

			addInputScopeMultivectorToScope()

			scopeIsLimited = false
		}

		if(l.videoDetails !== undefined)
		{
			let outputPositions = Array(l.videoDetails.markerTimes.length)
			goalOutputGroup.background.scale.x *= 1.7
			
			for(let i = 0; i < l.videoDetails.markerTimes.length; i++)
				outputPositions[i] = getInput(i).position.clone().add(goalOutputGroup.position)

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

			for(let i = 0; i < l.inputs.length; i++)
			{
				let outputMv = MultivectorAppearance(function(){},outputs[i])
				goalOutputGroup.add( outputMv )
				outputMv.position.y = 1.2 * (i-(l.inputs.length-1)/2.)
			}
		}
		else
		{
			scene.remove(inputGroup,goalOutputGroup)
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

		//for now restart is only for campaign mode
		scene.add(restartButton)
	}
	modeChange.calculator = function()
	{
		scene.remove(goalBox)
		scene.remove(restartButton)
		scene.remove(inputGroup,goalOutputGroup)

		scopeIsLimited = false

		setScope()
	}
	modeChange.shaderProgramming = function ()
	{
		scene.remove(goalBox)
		scene.remove(restartButton)

		scopeIsLimited = false

		setScope()

		scene.add(inputGroup)

		clearInputAndOutputGoal()
		for (let i = 0; i < 3; i++)
			inputGroup.addInput(new Float32Array([i * .8 + .1, 0., 0., 0., 0., 0., 0., 0.]))
		addInputScopeMultivectorToScope()
		scene.add(goalOutputGroup.line);
		
		//how to choose the bloody output from the scope
		//The output CAN be a list of individual multivectors. More generally it is a thing in a white box
	}
}