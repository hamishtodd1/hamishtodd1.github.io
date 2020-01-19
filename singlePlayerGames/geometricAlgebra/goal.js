let goalMultivector = null

function initGoal()
{
	var goalBox = new THREE.Object3D()
	scene.add(goalBox)
	goalBox.position.y = camera.topAtZZero - 1.4

	goalBox.title = makeTextSign("Make this:")
	goalBox.title.scale.multiplyScalar(.5)
	goalBox.title.position.y = .9
	goalBox.add(goalBox.title)

	let background = new THREE.Mesh(new THREE.PlaneGeometry(1.,1.),new THREE.MeshBasicMaterial({color:0x000000}))
	background.scale.set(goalBox.title.scale.x*1.1,goalBox.title.scale.y*4.3,1.)
	background.position.z -= .001
	background.position.y += .18
	goalBox.add(background)

	let goalElements = new Float32Array(8)
	goalElements[1] = 1.
	goalElements[2] = 1.
	goalMultivector = MultivectorAppearance(function(){},goalElements)
	goalBox.add(goalMultivector)

	var goalIrritation = 0.
	updateFunctions.push(function()
	{
		goalBox.position.x = camera.rightAtZZero - 1.4
		
		goalMultivector.position.x = goalIrritation * .2 * Math.sin(frameCount * .3)

		for(let i = 0; i < goalMultivector.children.length; i++)
		{
			goalMultivector.children[i].material.color.g = 1.-goalIrritation
			goalMultivector.children[i].material.color.b = 1.-goalIrritation
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
				for(let i = 0; i < goalMultivector.children.length; i++)
				{
					goalMultivector.children[i].material.color.r = Math.sin(frameCount * .14)
					goalMultivector.children[i].material.color.b = Math.sin(frameCount * .14)
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

	//level generator
	// {
	// 	let numOperations = 4;
	// 	let generatorScope = []
	// 	for(let i = 0; i < scope.length; i++)
	// 		generatorScope.push(scope[i].elements)
	// 	for(let operation = 0; operation < numOperations; operation++)
	// 	{
	// 		let operandA = generatorScope[ Math.floor( Math.random() * generatorScope.length ) ];
	// 		let operandB = generatorScope[ Math.floor( Math.random() * generatorScope.length ) ];

	// 		let functionToUse = Math.random() < .5 ? geometricProduct : geometricSum;

	// 		let result = functionToUse(operandA,operandB)

	// 		// if(searchArray(generatorScope,result))
	// 		// {
	// 		// 	operation--
	// 		// }
	// 		// else
	// 		{
	// 			generatorScope.push(result)
	// 		}
	// 	}

	// 	var goalMultivector = MultivectorAppearance(function(){},generatorScope[generatorScope.length-1])
	// }
}