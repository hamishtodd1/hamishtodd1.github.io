/*
	TODO for slack / Cambridge demo
		Every aspect of the multiplication and addition needs to be visualized. Well, for 2D!
			Bivector multiplication - complex multiplication!
		Some tutorial levels
		Sandbox available
	
	Long term
		They should be able to scope things, and delete them
		QM
			a vector of complex numbers can separate into a vector and bivector (i*vector) parts?
		Bootstrapping!
			Maybe you should use GA for your camera projection and that should be considered part of the system
			After all, if you pick up a vector and rotate it it can be rotated to become its negative
			Rotating the basis vectors rotates eeeeverything
			If you rotate a vector, well, it is a different vector
		So how about when you have too many multivectors in your scope?
			Could rearrange to put recent ones at top
			Could pack rectangles
			Scrollbar
		Helping make shaders
			Ideally you paste and it tells you what it thinks you pasted
			Spit out glsl?
			Heh, have it be possible for the input and output to be arranged in a rectangle with x and y smoothly varying, i.e. a framebuffer
*/

async function init()
{
	// await initBivectorAppearance()
	// return

	// let otherThingToCheckDistanceTo = []
	// let littleScene = await initWheelScene()
	// otherThingToCheckDistanceTo.push(littleScene.hummingbird)

	initMultivectorAppearances()

	var scope = []
	{
		let lastAssignedOperand = 0
		var scopeOnClick = function(multivecToCopy)
		{
			if(animationStage !== null)
			{
				log("not doin nothing")
				return
			}
			//better: fastforward animation

			operandToUse = operands[1-lastAssignedOperand]

			operandToUse.copyElements(multivecToCopy.elements)
			operandToUse.position.copy(multivecToCopy.position)
			scene.add(operandToUse)

			lastAssignedOperand = 1 - lastAssignedOperand
		}

		let xBasisElement = MultivectorAppearance(scopeOnClick)
		scope.push(xBasisElement)
		xBasisElement.setTo1Blade(xUnit)
		let yBasisElement = MultivectorAppearance(scopeOnClick)
		scope.push(yBasisElement)
		yBasisElement.setTo1Blade(yUnit)
		// let zBasisElement = MultivectorAppearance(scopeOnClick)
		// scope.push(zBasisElement)
		// zBasisElement.setTo1Blade(zUnit)

		// let trivec = MultivectorAppearance(scopeOnClick)
		// scope.push(trivec)
		// trivec.elements[7] = 1.
		// trivec.updateTrivectorAppearance()

		var operands = [
			MultivectorAppearance(function(){}),
			MultivectorAppearance(function(){}) ]
		scene.remove(operands[0],operands[1])

		var operandPositions = Array(2)
		operandPositions[0] = new THREE.Vector3( 0.,1.,0.)
		operandPositions[1] = new THREE.Vector3( 1.,0.,0.)
	}

	// initInputOutputGoal(scope,scopeOnClick)

	let goalElements = new Float32Array(8)
	goalElements[1] = 1.
	goalElements[2] = 1.
	let goalBox = initSingularGoal( goalElements,scope )

	await initMenu(goalBox)

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

			o.position.y = camera.topAtZZero - .4
			o.position.x = (i - 0.5 * (operatorOriginals.length-1) ) * 2.
			scene.add(o)

			clickables.push(o)
			o.onClick = function()
			{
				if(animationStage !== null)
				{
					log("not doin nothing")
					return
				}

				activeOperator.material.color.copy(this.material.color)
				activeOperator.position.copy(o.position)
				activeOperator.function = o.function
				scene.add(activeOperator)
			}
		}
	}

	let scopePosition = new THREE.Vector3()

	let animationStage = null;
	updateFunctions.push(function()
	{
		let allowedWidth = .7
		scopePosition.x = -camera.rightAtZZero + allowedWidth

		if(animationStage === null)
		{
			scopePosition.y = camera.topAtZZero
			for(let i = 0; i < scope.length; i++ )
			{
				let halfMultivectorHeight = scope[i].getHeightWithPadding() / 2.;

				if( scopePosition.y - halfMultivectorHeight < -.5 * camera.topAtZZero)
				{
					scopePosition.x += allowedWidth
					scopePosition.y = -camera.topAtZZero
				}

				scopePosition.y -= halfMultivectorHeight
				scope[i].position.lerp(scopePosition,.1)
				scopePosition.y -= halfMultivectorHeight
			}

			let ready = true
			let distanceRequirement = .03

			for(let i = 0; i < operands.length; i++)
			{
				if(operands[i].parent !== scene)
					ready = false
				else
				{
					operands[i].position.lerp(operandPositions[i],0.1)
					if( operands[i].position.distanceTo(operandPositions[i] ) > distanceRequirement )
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
				animationStage = 0.
		}
		else
		{
			// if( mouse.clicking && !mouse.oldClicking )
			// 	animationStage = 1. - frameDelta * .001

			switch(Math.floor(animationStage))
			{
				case 0: //just staring, til the end
					{
						let secondsThisSectionTakes = .3;
						let increment = frameDelta / secondsThisSectionTakes

						animationStage += increment
					}
					break;

				case 1:
					let newMultivectorElements = activeOperator.function(operands[0].elements,operands[1].elements)
					if( searchArray(scope,newMultivectorElements) )
					{
						console.error("already got that in the scope, can do something here")
					}

					let newMultivector = MultivectorAppearance(scopeOnClick, newMultivectorElements)
					clickables.push(newMultivector)
					
					newMultivector.updateAppearance()

					scene.remove(operands[0],operands[1],activeOperator)
					scene.add(newMultivector)
					log(newMultivector.elements)

					//goal
					modeDependentReactionToResult(newMultivector.elements)
					scope.push(newMultivector) //currently it waits for animation to complete before pulling this to scope

					animationStage = 2.;
					break;

				case 2:
					{
						let secondsThisSectionTakes = 1.1;
						animationStage += frameDelta / secondsThisSectionTakes
					}
					break;

				case 3:
					animationStage = null;
					break;
			}
		}
	})
}