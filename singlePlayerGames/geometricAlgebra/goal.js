/*
	Level ideas
		Puzzle such that for each vector you must make the bivector of it and the X axis
		Classic: person walking on a train. Train machinery on the wheels
		Videos
			Diver
			Dancer
			Juggler. Lots of circus skills
		Bee going from flower to flower
		A puppy that is enjoying licking a lolly. The lolly moves away ordinarily, but if you can get its jetpack to follow the lolly it can continue licking

	Levels:
		Add only, diagonal
		Add only, two along three up
		"Double the size of this" - shows elegance of scalar multiplication

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

function initInputOutputGoal(scope,scopeOnClick)
{
	let background = new THREE.Mesh(new THREE.PlaneGeometry(1.,1.), new THREE.MeshBasicMaterial({color:0xFFFFFF}))
	background.scale.x = 3.65
	background.scale.y = 1.2
	background.position.z = -.001

	let intendedPositions = [
		new THREE.Vector3( 0.,-camera.topAtZZero + .9, 0.),
		new THREE.Vector3( 0., camera.topAtZZero - 2.1, 0.)
	]

	{
		var inputSelectionIndicator = new THREE.Group()
		let yellowRect = new THREE.Mesh(new THREE.PlaneGeometry(1.,1.), new THREE.MeshBasicMaterial({color:0xFFFF00}))
		let thickness = .1
		for(let i = 0; i < 4; i++)
		{
			let r = new THREE.Mesh(yellowRect.geometry,yellowRect.material)
			inputSelectionIndicator.add(r)
			if(i < 2)
			{
				r.position.x = .5 - thickness * .5
				r.scale.x = thickness
			}
			else
			{
				r.position.y = .5 - thickness * .5
				r.scale.y = thickness
			}
			if(i%2)
				r.position.multiplyScalar(-1.);
			r.position.z = .01
		}
		var outputSelectionIndicator = inputSelectionIndicator.clone()
	}

	let scopeInputMultivector = MultivectorAppearance(scopeOnClick,new Float32Array(8));
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

		var inputs = Array(3)
		for(let i = 0; i < inputs.length; i++)
		{
			let elements = new Float32Array(8)
			for(let j = 0; j < 5; j++) //ONLY USING THOSE THAT WORK
				elements[j] = (Math.random()-.5)*2.
			elements[0] = Math.floor(Math.random()*20) - 10.
			elements[3] = 0.

			inputs[i] = MultivectorAppearance(selectInput,elements)
			inputs[i].position.x = (i-1) * 1.2;
			inputGroup.add(inputs[i])
		}

		var inputScope = [inputs[2]]
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
			let elements = generateRandomMultivectorElementsFromScope(scopeWithOneExtra,seedForRandomActivity)

			outputs[i] = MultivectorAppearance(function(){},elements)
			outputs[i].position.x = (i-1) * 1.2;
			outputGroup.add(outputs[i])
		}

		// let goalSign = makeTextSign("Goal:")
		// goalSign.scale.multiplyScalar(.7)
		// outputGroup.add(goalSign)
		// goalSign.position.x -= background.scale.x * .5 + goalSign.scale.x * .5 + .1
	}

	updateFunctions.push(function()
	{
		intendedPositions[0].x = camera.rightAtZZero - 2
		intendedPositions[1].x = camera.rightAtZZero - 2
		outputGroup.position.lerp(intendedPositions[0],frameCount===0?1.:.1)
		inputGroup.position.lerp( intendedPositions[1],frameCount===0?1.:.1)
	})

	return inputScope
}

let singularGoalMultivector = null
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

		let background = new THREE.Mesh(new THREE.PlaneGeometry(1.,1.),new THREE.MeshBasicMaterial({color:0x000000}))
		background.scale.set(goalBox.title.scale.x*1.1,goalBox.title.scale.y*4.3,1.)
		background.position.z -= .001
		background.position.y += .18
		goalBox.add(background)
	}

	//level generator
	let randomMultivectorElements = generateRandomMultivectorElementsFromScope(scope)
	singularGoalMultivector = MultivectorAppearance(function(){},randomMultivectorElements)
	goalBox.add(singularGoalMultivector)

	// singularGoalMultivector = MultivectorAppearance(function(){},goalElements)
	// goalBox.add(singularGoalMultivector)

	var goalIrritation = 0.
	updateFunctions.push(function()
	{
		goalBox.position.x = camera.rightAtZZero - 1.4
		
		singularGoalMultivector.position.x = goalIrritation * .2 * Math.sin(frameCount * .3)

		for(let i = 0; i < singularGoalMultivector.children.length; i++)
		{
			singularGoalMultivector.children[i].material.color.g = 1.-goalIrritation
			singularGoalMultivector.children[i].material.color.b = 1.-goalIrritation
		}

		goalIrritation = Math.max(goalIrritation - frameDelta * .75,0.);
	})

	let goalAchieved = false
	setGoalAchievement = function(newGoalAchieved)
	{
		if(!goalAchieved && newGoalAchieved)
		{
			goalBox.title.children[0].material.setText("You win!")

			updateFunctions.push(function()
			{
				for(let i = 0; i < singularGoalMultivector.children.length; i++)
				{
					singularGoalMultivector.children[i].material.color.r = Math.sin(frameCount * .14)
					singularGoalMultivector.children[i].material.color.b = Math.sin(frameCount * .14)
				}

				goalBox.title.children[0].material.color.r = Math.sin(frameCount * .14)
				goalBox.title.children[0].material.color.b = Math.sin(frameCount * .14)

				goalBox.position.y *= .9
			})

			goalAchieved = newGoalAchieved
		}
	}
	setGoalIrritation = function(newValue)
	{
		goalIrritation = 1.
	}
}