/*
	Operation operand operand
		Quite possibly it is better to have your things chosen in sequence: 
			you HAVE to go multivecotr multivector operator, and if you don't then you have to delete the whole thing
		And it is better if they are stacked in a column like in lamda calculus?
		Very important to emphasize the importance of order
		Buuuuuut, spatially, you did think of a bunch of reasons for current situation
		And what are you going to do to indicate to people what they have to click? Could take scope off the screen

	When there's loads of the things and we have to do the animations one by one and then add them
		You probably want to make a full table and as soon as the mv enters the register it breaks up (horizontally or vertically)

	There's an argument for lambda calculus style: operation, operand1, operand2
		"Is the next one I touch going to go up top or on side?" so at least maybe get rid of automation there

	Click and hold should probably have the calculation freeze there for a bit
*/

function initOperationInterface(restartButton)
{
	var activeOperator = OperatorAppearance()

	var operands = [
		MultivectorAppearance(function(){}),
		MultivectorAppearance(function(){}) ]
	scene.remove(operands[0],operands[1])
	var operandAndActiveOperatorPositions = [
		new THREE.Vector3( 0.,activeOperator.scale.y,0.),
		new THREE.Vector3(activeOperator.scale.x,0.,0.),
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

			copyMultivector(multivecToCopy.elements, operandToUse.elements)
			operandToUse.skipAnimation()
			operandToUse.position.copy(multivecToCopy.position)
			scene.add(operandToUse)

			if(scopeIsLimited)
				removeFromScope(multivecToCopy)

			potentiallyTriggerAnimation()
		}

		let newScopeMultivector = MultivectorAppearance(onClick,elements)
		multivectorScope.push(newScopeMultivector)
		newScopeMultivector.scopePosition = new THREE.Vector3()

		if(sendToScopeImmediately)
		{
			while (true)
			{
				updateScopePositions()
				let overflowedSide = false
				// for (let i = 0; i < multivectorScope.length; i++)
				// {
				// 	if (multivectorScope[i].boundingBox.scale.x > idealScopeWidth)
				// 	{
				// 		continue
				// 	}
				// 	if (multivectorScope[i].intendedPosition.x > -camera.rightAtZZero + idealScopeWidth)
				// 	{
				// 		overflowedSide = true
				// 	}
				// }
				if (overflowedSide === false)
					break
				camera.setTopAtZZeroAndAdjustScene(camera.topAtZZero + 1.5)
			}
			newScopeMultivector.position.copy(newScopeMultivector.scopePosition)
		}

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

		operatorScope.push( newScopeOperator )

		scene.add(newScopeOperator)

		updateFunctions.push(function()
		{
			newScopeOperator.position.y = -camera.topAtZZero + .9
			newScopeOperator.position.x = getOperatorScopeX(operatorScope.indexOf(newScopeOperator), eventualScopeSize)
		})

		return newScopeOperator
	}

	initScope()

	let animationMultivector = MultivectorAppearance(function(){})
	animationMultivector.elements[0] = 0.
	animationMultivector.skipAnimation()
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
					// debugger
					animationMultivector.skipAnimation()
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

			case 2: //where we animate
				if (animationMultivector.parent !== scene )
				{
					animationMultivector.animationOngoing = true
					scene.add(animationMultivector)
					scene.remove(operands[0], operands[1], activeOperator)
				}
				if (!animationMultivector.animationOngoing)
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
				console.error("shouldn't be here! animationStage: " +animationStage)
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

		if (!equalsMultivector(zeroMultivector,animationMultivector.elements))
		{
			let newMultivector = ScopeMultivector(animationMultivector.elements)
			newMultivector.howIWasMade = {
				operandIndices: [howCurrentIsMade.operandIndices[0], howCurrentIsMade.operandIndices[1]],
				operation: howCurrentIsMade.operation
			}
			newMultivector.scalar.setIntendedPositionsToSquare()
			newMultivector.skipAnimation()
			reactToNewMultivector(newMultivector)
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