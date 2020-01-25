/*
	TODO for slack / Cambridge demo
		Get the wheel in there
		Tutorial levels
		Every aspect of the multiplication and addition needs to be visualized. Well, for 2D!
			Coplanar bivector addition - easy and fun
			Vector addition - just do something
			Vector multiplication - need both scalar and bivector part
			Scalar multiplication - obvious, duplication then addition
			Coplanar bivector multiplication - complex multiplication!
			Bivector-vector multiplication
			Bivector multiplication???
		Sandbox available

	TODO for GDC
		A fast to access webpage
		With something that creates surprises and communicates its purpose in 45s
	
	Long term
		Oculus quest / hololens thing where you record a video, and it automatically takes the frames
		They should be able to rearrange multivectorScope, and delete bits of it
		Have a "superimpose everything so it's in the same coord system" button
		QM
			a vector of complex numbers can separate into a vector and bivector (i*vector) parts?
		Zoom out every time multivectorScope gets big
		Bootstrapping!
			Maybe you should use GA for your camera projection and that should be considered part of the system
			After all, if you pick up a vector and rotate it it can be rotated to become its negative
			Rotating the basis vectors rotates eeeeverything
			If you rotate a vector, well, it is a different vector
		So how about when you have too many multivectors in your multivectorScope?
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

	await initOperatorAppearance()

	let activeOperator = OperatorAppearance()
	let multivectorScope = []

	let operands = [
		MultivectorAppearance(function(){}),
		MultivectorAppearance(function(){}) ]
	scene.remove(operands[0],operands[1])
	let operandAndActiveOperatorPositions = [
		new THREE.Vector3( 0.,1.,0.),
		new THREE.Vector3( 1.,0.,0.),
		zeroVector]
	let operandsAndActiveOperator = [
		operands[0],
		operands[1],
		activeOperator
	]

	{
		let lastAssignedOperand = 0
		function multivectorScopeOnClick(multivecToCopy)
		{
			if(animationStage !== -1.)
				completeAnimation()

			let operandToUse = operands[1-lastAssignedOperand]
			lastAssignedOperand = 1 - lastAssignedOperand

			operandToUse.copyElements(multivecToCopy.elements)
			operandToUse.position.copy(multivecToCopy.position)
			scene.add(operandToUse)

			potentiallyTriggerAnimation()
		}

		function operatorScopeOnClick(operatorSelection)
		{
			if(animationStage !== -1.)
				completeAnimation()

			activeOperator.material.color.copy(operatorSelection.material.color)
			activeOperator.position.copy(operatorSelection.position)
			activeOperator.function = operatorSelection.function
			scene.add(activeOperator)

			potentiallyTriggerAnimation()
		}

		initScope(multivectorScope,multivectorScopeOnClick,operatorScopeOnClick)
	}

	initInputOutputGoal(multivectorScope,multivectorScopeOnClick)

	// let goalElements = new Float32Array(8)
	// goalElements[1] = 1.
	// goalElements[2] = 1.
	// let goalBox = initSingularGoal( goalElements,multivectorScope )

	await initMenu()

	//It's nice if they could all animate
	//A multivector appearance is a group with children that are bits of multivector. So yes.
	let animationMultivector = MultivectorAppearance(function(){})
	let animationStage = -1.;

	updateFunctions.push(function()
	{
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

					// if( searchArray(multivectorScope,newMultivectorElements) ) //already in multivectorScope, could do something here

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

		let newMultivector = MultivectorAppearance(multivectorScopeOnClick, animationMultivector.elements)
		multivectorScope.push(newMultivector) //currently it waits for animation to complete before pulling this to multivectorScope
		animationStage = -1.;
	}
}