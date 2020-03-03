/*
	When there's loads of the things and we have to do the animations one by one and then add them
		You probably want to make a full table and as soon as the mv enters the register it breaks up (horizontally or vertically)
*/

function initOperationInterface(restartButton)
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
	howCurrentIsMade = {
		operation: null,
		operandIndices: [-1,-1]
	}

	let lastAssignedOperand = 0
	ScopeMultivector = function(elements, sendToScopeImmediately)
	{
		let onClick = function(multivecToCopy)
		{
			if(animationStage !== -1.)
				completeAnimation()

			let operandToUse = operands[1-lastAssignedOperand]
			lastAssignedOperand = 1 - lastAssignedOperand

			howCurrentIsMade.operandIndices[lastAssignedOperand] = multivectorScope.indexOf(multivecToCopy)

			operandToUse.copyElements(multivecToCopy.elements)
			operandToUse.position.copy(multivecToCopy.position)
			scene.add(operandToUse)

			if(scopeIsLimited)
				removeFromScope(multivecToCopy)

			potentiallyTriggerAnimation()
		}

		let newScopeMultivector = MultivectorAppearance(onClick,elements)
		multivectorScope.push(newScopeMultivector)

		if(sendToScopeImmediately)
			getMultivectorScopePosition(multivectorScope.length-1,newScopeMultivector.position)

		return newScopeMultivector
	}

	ScopeOperator = function(func,eventualScopeSize)
	{
		let newScopeOperator = OperatorAppearance(func)
		clickables.push(newScopeOperator)
		newScopeOperator.onClick = function()
		{
			if(animationStage !== -1.)
				completeAnimation()

			activeOperator.material.color.copy(newScopeOperator.material.color)
			activeOperator.material.map = newScopeOperator.material.map
			activeOperator.position.copy(newScopeOperator.position)
			activeOperator.function = newScopeOperator.function
			scene.add(activeOperator)

			howCurrentIsMade.operation = newScopeOperator.function

			if(scopeIsLimited)
				removeFromScope(newScopeOperator)

			potentiallyTriggerAnimation()
		}

		newScopeOperator.position.y = -camera.topAtZZero + .9

		operatorScope.push( newScopeOperator )

		scene.add(newScopeOperator)

		newScopeOperator.position.x = getOperatorScopeX(operatorScope.length-1,eventualScopeSize)

		return newScopeOperator
	}

	initScope()

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
		newMultivector.howIWasMade = {
			operandIndices: [howCurrentIsMade.operandIndices[0], howCurrentIsMade.operandIndices[1]],
			operation: howCurrentIsMade.operation
		}
		animationStage = -1.;
	}

	//restart button
	//"undo" might be better
	{
		//might be nice to make it flash when the level isn't completable
		let halfMenuTitleWidth = restartButton.scale.x / 2.
		let halfMenuTitleHeight = restartButton.scale.y / 2.
		let padding = .25
		updateFunctions.push(function()
		{
			restartButton.position.x =  camera.rightAtZZero - (halfMenuTitleWidth  + padding)
			restartButton.position.y = -camera.topAtZZero   + (halfMenuTitleHeight + padding) * 2.

			let levelUncompletable = false
			if(levelUncompletable)
				restartButton.material.color.setRGB(Math.sin(frameCount*.01),1.,1.)
			else
				restartButton.material.color.setRGB(1.,1.,1.)
		})

		clickables.push(restartButton)
		restartButton.onClick = function()
		{
			if(animationStage === -1.) //temporary, better would be to completeAnimation
			{
				scene.remove(operands[0],operands[1],activeOperator)
				levelSetUp()
			}
		}
	}
}