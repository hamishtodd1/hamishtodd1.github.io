/*
	TODO for slack / Cambridge demo
		Every aspect of the multiplication and addition needs to be visualized
		Already a nice product/tool for thinking that can be shown to folks!

	Wanna grab and rotate the whole scene

	"Bootstrapping"
		Maybe you should use GA for your camera projection and that should be considered part of the system
		After all, if you pick up a vector and rotate it it can be rotated to become its negative
		Rotating the basis vectors rotates eeeeverything
		If you rotate a vector, well, it is a different vector

	Levels:
		Add only, diagonal
		Add only, two along three up

	General structure
		Addition only, scalars only
		Addition only, vectors only
		Addition only, bivectors only
		multiplication and addition, scalars
		multiplication and addition, scalars and vectors
		multiplication and addition, scalars and bivectors
*/

async function init()
{

	// await initBivectorAppearance()
	// return

	var otherThingToCheckDistanceTo = []
	// let littleScene = await initWheelScene()
	// otherThingToCheckDistanceTo.push(littleScene.hummingbird)

	{
		initMultivectorAppearances()

		var scope = []

		function scopeOnClick(multivecToCopy)
		{
			let activeMultivectorToUse = null
			if(activeMultivectors[0].parent !== scene)
				activeMultivectorToUse = activeMultivectors[0]
			else if(activeMultivectors[1].parent !== scene)
				activeMultivectorToUse = activeMultivectors[1]

			activeMultivectorToUse.copyElements(multivecToCopy.elements)
			activeMultivectorToUse.position.copy(multivecToCopy.position)
			scene.add(activeMultivectorToUse)
		}

		let yBasisElement = MultivectorAppearance(scopeOnClick)
		scope.push(yBasisElement)
		yBasisElement.setTo1Blade(yUnit)
		let xBasisElement = MultivectorAppearance(scopeOnClick)
		scope.push(xBasisElement)
		xBasisElement.setTo1Blade(xUnit)
		// let zBasisElement = MultivectorAppearance(scopeOnClick)
		// scope.push(zBasisElement)
		// zBasisElement.setTo1Blade(zUnit)

		// let trivec = MultivectorAppearance(scopeOnClick)
		// scope.push(trivec)
		// trivec.elements[7] = 1.
		// trivec.updateTrivectorAppearance()

		var activeMultivectors = [
			MultivectorAppearance(function(){}),
			MultivectorAppearance(function(){}) ]
		scene.remove(activeMultivectors[0],activeMultivectors[1])
	}

	{
		await initOperatorAppearance()

		addOperatorOriginal = OperatorAppearance()
		multiplyOperatorOriginal = OperatorAppearance()

		addOperatorOriginal.function = geometricSum
		multiplyOperatorOriginal.function = geometricProduct

		let operatorOriginals = [addOperatorOriginal,multiplyOperatorOriginal];
		var activeOperator = OperatorAppearance()

		for(let i = 0; i < operatorOriginals.length; ++i )
		{
			let o = operatorOriginals[i]

			if(i)
				o.material.color.setRGB(1.,0.,0.)

			o.position.y = -3.5
			o.position.x = (i - 0.5 * (operatorOriginals.length-1) ) * 2.
			scene.add(o)

			clickables.push(o)
			o.onClick = function()
			{
				activeOperator.material.color.copy(this.material.color)
				activeOperator.position.copy(o.position)
				activeOperator.function = o.function
				scene.add(activeOperator)
			}
		}
	}

	{
		let goal = new THREE.Object3D()
		scene.add(goal)
		goal.position.x = -camera.rightAtZZero + 1.4

		let goalSign = makeTextSign("Make this:")
		goalSign.scale.multiplyScalar(.5)
		goalSign.position.y = .9
		goal.add(goalSign)

		let background = new THREE.Mesh(new THREE.PlaneGeometry(1.,1.),new THREE.MeshBasicMaterial({color:0x000000}))
		background.scale.set(goalSign.scale.x*1.1,goalSign.scale.y*4.3,1.)
		background.position.z -= .001
		background.position.y += .18
		goal.add(background)

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

		{
			let goalElements = new Float32Array(8)
			goalElements[1] = 1.
			goalElements[2] = 1.
			var goalMultivector = MultivectorAppearance(function(){},goalElements)
		}

		goal.add(goalMultivector)
	}

	{
		var inputRegisters = Array(2)
		inputRegisters[0] = new THREE.Vector3(0.,1.,0.)
		inputRegisters[1] = new THREE.Vector3(-1.,0.,0.)
	}

	let scopePosition = new THREE.Vector3()
	let animationT = -1.; //-1 = no animation in progress
	updateFunctions.push(function()
	{
		if(animationT === -1.)
		{
			for(let i = 0; i < scope.length; i++ )
			{
				scopePosition.y = 4. - i;
				scopePosition.x = camera.rightAtZZero - 1.4
				scope[i].position.lerp(scopePosition,.1)
			}

			let ready = true
			let distanceRequirement = .03

			for(let i = 0; i < activeMultivectors.length; i++)
			{
				if(activeMultivectors[i].parent !== scene)
					ready = false
				else
				{
					activeMultivectors[i].position.lerp(inputRegisters[i],0.1)
					if( activeMultivectors[i].position.distanceTo(inputRegisters[i] ) > distanceRequirement )
						ready = false
				}
			}

			if( activeOperator.parent !== scene )
				ready = false
			else
			{
				activeOperator.position.lerp(zeroVector,0.1)
				if( activeOperator.position.distanceTo(zeroVector ) > distanceRequirement )
					ready = false
			}

			if(ready)
				animationT = 0.
		}
		else
		{
			animationT += frameDelta

			switch(Math.floor(animationT))
			{
				case 0:
					log("y")
					break;

				case 1:
					log("y")
					break;

				case 2:
					log("y")
					break;
			}
			

			//animation finished. We want a way to fast forward to this
			if(animationT > 1.1)
			{
				animationT = -1.;
				let newMultivectorElements = activeOperator.function(activeMultivectors[0].elements,activeMultivectors[1].elements)
				let newMultivector = MultivectorAppearance(scopeOnClick, newMultivectorElements)
				clickables.push(newMultivector)
				
				newMultivector.updateAppearance()

				scene.remove(activeMultivectors[0],activeMultivectors[1],activeOperator)
				scene.add(newMultivector)
				log(newMultivector.elements)

				if( searchArray(scope,newMultivector) )
				{
					log("already got that in the scope, can do something here")
				}

				if( equalsMultivector(goalMultivector.elements,newMultivector.elements) )
				{
					let winSign = makeTextSign("You win!!!")
					winSign.scale.multiplyScalar(.5)
					winSign.position.y = 2;
					scene.add(winSign)
				}
				else
				{
					scope.push(newMultivector)
				}
			}
		}
	})
}