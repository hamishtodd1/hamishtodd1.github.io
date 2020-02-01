/*
	TODO for slack / Cambridge demo
		Level progression to get you to the "inputs outputs" point and to say how you can learn
		Get the wheel in there. Animated
		And just some videos plus extracting pictures
		Tutorial levels
		AR https://jeromeetienne.github.io/AR.js/three.js/examples/basic.html

	TODO for sandbox / tool for thought
		Every aspect of the multiplication and addition needs to be visualized. Well, for 2D!
			Coplanar bivector addition - easy and fun
			Vector addition - just do something
			Vector multiplication - need both scalar and bivector part
			Scalar multiplication - obvious, duplication then addition
			Coplanar bivector multiplication - complex multiplication!
			Bivector-vector multiplication
			Bivector multiplication???
		Helping make shaders
			Ideally you paste and it tells you what it thinks you pasted
			Spit out glsl?
			Heh, have it be possible for the input and output to be arranged in a rectangle with x and y smoothly varying, i.e. a framebuffer

	TODO for GDC
		A fast to access webpage
		With something that creates surprises and communicates its purpose in 45s
		And can show something quaternion-related in short order

	TODO for academic course

	TODO 
	
	Long term
		Oculus quest / hololens thing where you record a video, and it automatically takes the frames
		They should be able to rearrange multivectorScope, and delete bits of it
		Have a "superimpose everything so it's in the same coord system" button
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
*/

multivectorScope = []

async function init()
{
	// await initBivectorAppearance()
	// return

	initMultivectorAppearances()
	await initOperatorAppearances()

	// initWheelScene()
	// await initVideo()

	{
		var activeOperator = OperatorAppearance()

		var operands = [
			MultivectorAppearance(function(){}),
			MultivectorAppearance(function(){}) ]
		scene.remove(operands[0],operands[1])
		var operandAndActiveOperatorPositions = [
			new THREE.Vector3( 0.,1.,0.),
			new THREE.Vector3( 1.,0.,0.),
			new THREE.Vector3( 0.,0.,0.)]
		var operandsAndActiveOperator = [
			operands[0],
			operands[1],
			activeOperator
		]

		let lastAssignedOperand = 0
		ScopeMultivector = function(elements, sendToScopeImmediately)
		{
			let newScopeMultivector = MultivectorAppearance(function(multivecToCopy)
			{
				if(animationStage !== -1.)
					completeAnimation()

				let operandToUse = operands[1-lastAssignedOperand]
				lastAssignedOperand = 1 - lastAssignedOperand

				operandToUse.copyElements(multivecToCopy.elements)
				operandToUse.position.copy(multivecToCopy.position)
				scene.add(operandToUse)

				potentiallyTriggerAnimation()
			},elements)
			multivectorScope.push(newScopeMultivector)

			if(sendToScopeImmediately)
				getScopePosition(multivectorScope.length-1,newScopeMultivector.position)

			return newScopeMultivector
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

		initScope(operatorScopeOnClick)
	}

	// initInputOutputGoal()

	let modeChange = {}
	initSingularGoals(modeChange)
	modeChange.campaign()

	await initMenu(modeChange)

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
				reactToNewMultivector(animationMultivector.elements)
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
		scene.remove(operands[0],operands[1],activeOperator)
		scene.remove(animationMultivector)

		let newMultivector = ScopeMultivector(animationMultivector.elements)
		animationStage = -1.;
	}
}