/*
	TODO for slack / Cambridge demo
		Get the wheel in there
		Some tutorial levels
		Every aspect of the multiplication and addition needs to be visualized. Well, for 2D!
			Coplanar bivector addition - easy and fun
			Vector addition - just do something
			Scalar multiplication - obvious, duplication then addition
			Coplanar bivector multiplication - complex multiplication!
			Bivector-vector multiplication
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
			if(animationStage !== -1.)
				completeAnimation()

			operandToUse = operands[1-lastAssignedOperand]
			lastAssignedOperand = 1 - lastAssignedOperand

			operandToUse.copyElements(multivecToCopy.elements)
			operandToUse.position.copy(multivecToCopy.position)
			scene.add(operandToUse)

			potentiallyTriggerAnimation()
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

		// let littleScalar = MultivectorAppearance(scopeOnClick)
		// scope.push(littleScalar)
		// littleScalar.elements[0] = .2
		// littleScalar.updateAppearance()

		// let trivec = MultivectorAppearance(scopeOnClick)
		// scope.push(trivec)
		// trivec.elements[7] = 1.
		// trivec.updateTrivectorAppearance()

		var operands = [
			MultivectorAppearance(function(){}),
			MultivectorAppearance(function(){}) ]
		scene.remove(operands[0],operands[1])
	}

	initInputOutputGoal(scope,scopeOnClick)

	// let goalElements = new Float32Array(8)
	// goalElements[1] = 1.
	// goalElements[2] = 1.
	// let goalBox = initSingularGoal( goalElements,scope )

	await initMenu()

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

			o.position.y = -camera.topAtZZero + .9
			o.position.x = (i - 0.5 * (operatorOriginals.length-1) ) * 2.
			scene.add(o)

			clickables.push(o)
			o.onClick = function()
			{
				if(animationStage !== -1.)
					completeAnimation()

				activeOperator.material.color.copy(this.material.color)
				activeOperator.position.copy(o.position)
				activeOperator.function = o.function
				scene.add(activeOperator)

				potentiallyTriggerAnimation()
			}
		}

		var operandsAndActiveOperator = [
			operands[0],
			operands[1],
			activeOperator
		]
		var operandAndActiveOperatorPositions = [
			new THREE.Vector3( 0.,1.,0.),
			new THREE.Vector3( 1.,0.,0.),
			zeroVector]
	}

	//is it a multivector? Possibly. It would be nice if they could all animate
	let animationMultivector = MultivectorAppearance(function(){})
	let animationStage = -1.;

	let scopePosition = new THREE.Vector3()
	updateFunctions.push(function()
	{
		let allowedWidth = .7
		scopePosition.x = -camera.rightAtZZero + allowedWidth
		scopePosition.y = camera.topAtZZero
		for(let i = 0; i < scope.length; i++ )
		{
			let halfMultivectorHeight = scope[i].getHeightWithPadding() / 2.;

			if( scopePosition.y - halfMultivectorHeight < -camera.topAtZZero)
			{
				scopePosition.x += allowedWidth
				scopePosition.y = camera.topAtZZero
			}

			scopePosition.y -= halfMultivectorHeight
			scope[i].position.lerp(scopePosition,.1)
			scopePosition.y -= halfMultivectorHeight
		}

		for(let i = 0; i < 3; i++)
			operandsAndActiveOperator[i].position.lerp(operandAndActiveOperatorPositions[i],.1)

		if(animationStage !== -1.) switch(Math.floor(animationStage))
		{
			case 0: //creating new thing
				{
					let newMultivectorElements = activeOperator.function(operands[0].elements,operands[1].elements)
					log(newMultivectorElements)
					copyMultivector(newMultivectorElements, animationMultivector.elements)
					animationMultivector.updateAppearance()
					scene.remove(animationMultivector)

					// if( searchArray(scope,newMultivectorElements) ) //already in scope, could do something here

					animationStage++;
				}
				break;

			case 1: //waiting til they get into place then a little staring to clarify what's going to happen
				{
					let secondsThisSectionTakes = .9;
					animationStage += frameDelta / secondsThisSectionTakes
				}
				break;

			case 2:
				scene.add(animationMultivector)
				scene.remove(operands[0],operands[1],activeOperator)
				animationStage++;
				break;

			case 3: //admiring result
				{
					let secondsThisSectionTakes = 1.1;
					animationStage += frameDelta / secondsThisSectionTakes
				}
				break;

			case 4:
				completeAnimation()
				break;

			default:
				console.error("shouldn't be here")
				break;
		}
	})

	function potentiallyTriggerAnimation()
	{
		animationStage = 0.
		for(let i = 0; i < 3; i++)
		{
			if(operandsAndActiveOperator[i].parent !== scene)
				animationStage = -1.
		}
	}

	function completeAnimation()
	{
		modeDependentReactionToResult(animationMultivector.elements)
		scene.remove(operands[0],operands[1],activeOperator)
		scene.remove(animationMultivector)

		let newMultivector = MultivectorAppearance(scopeOnClick, animationMultivector.elements)
		scope.push(newMultivector) //currently it waits for animation to complete before pulling this to scope
		animationStage = -1.;
	}
}