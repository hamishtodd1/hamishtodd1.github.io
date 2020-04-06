/*
	Put the whole scope on the pictures?

	Surely want scope on right because that's the way people hold it

	Optimal Arrangement
		exponential but n is small
		Except there is one side along which you do want to fill
		Not really desirable because you want the simple stuff in one place

	Could try putting them beneath each one in turn and sliding them left and right
*/

function intersectRectangleMeshes(a, b)
{
	let aMaxX = a.intendedPosition.x + a.scale.x * .5
	let aMaxY = a.intendedPosition.y + a.scale.y * .5
	let bMaxX = b.intendedPosition.x + b.scale.x * .5
	let bMaxY = b.intendedPosition.y + b.scale.y * .5
	let aMinX = a.intendedPosition.x - a.scale.x * .5
	let aMinY = a.intendedPosition.y - a.scale.y * .5
	let bMinX = b.intendedPosition.x - b.scale.x * .5
	let bMinY = b.intendedPosition.y - b.scale.y * .5

	return !(aMaxX < bMinX || aMinX > bMaxX ||
			 aMaxY < bMinY || aMinY > bMaxY )
}

function packRectangles(rects)
{
	let numRects = rects.length

	let rectsOrderedBySideRightness = Array(multivectorScope.length)
	let rectsOrderedByBottomLowness = Array(multivectorScope.length)
	for (let i = 0; i < multivectorScope.length; i++)
	{
		rectsOrderedBySideRightness[i] = rects[i]
		rectsOrderedByBottomLowness[i] = rects[i]
	}

	let roundoffPadding = .005
	let avoidanceOfSides = .3
	for (let i = 0, il = multivectorScope.length; i < il; i++)
	{
		for(let j = -1; j < i; j++) // put it next to each rect
		{
			rects[i].intendedPosition.x = j === -1 ?
				-camera.rightAtZZero + avoidanceOfSides + rects[i].scale.x / 2. :
				rectsOrderedBySideRightness[j].intendedPosition.x + rectsOrderedBySideRightness[j].scale.x / 2. + roundoffPadding + rects[i].scale.x / 2.
			
			//start at top and move down whenever there's a clash
			rects[i].intendedPosition.y = camera.topAtZZero - avoidanceOfSides - rects[i].scale.y / 2.
			let goneOffBottom = false
			for (let k = 0; k < i; k++)
			{
				if(intersectRectangleMeshes(rects[i],rectsOrderedByBottomLowness[k]))
				{
					rects[i].intendedPosition.y = rectsOrderedByBottomLowness[k].intendedPosition.y - rectsOrderedByBottomLowness[k].scale.y / 2. - rects[i].scale.y / 2. - roundoffPadding
					if (rects[i].intendedPosition.y - rects[i].scale.y / 2. < -camera.topAtZZero + avoidanceOfSides)
					{
						goneOffBottom = true
						break;
					}
				}
			}

			if (!goneOffBottom)
			{
				rectsOrderedByBottomLowness.sort(function(a,b)
				{
					let aLowness = a.intendedPosition.y - a.scale.y / 2.
					let bLowness = b.intendedPosition.y - b.scale.y / 2.
					return bLowness - aLowness //because larger numbers come first
				})
				rectsOrderedBySideRightness.sort(function(a,b)
				{
					let aRightness = a.intendedPosition.x + a.scale.x / 2.
					let bRightness = b.intendedPosition.x + b.scale.x / 2.
					return aRightness - bRightness
				})

				break;
			}
		}
	}

	delete rectsOrderedBySideRightness
	delete rectsOrderedByBottomLowness
}

operatorScope = []
multivectorScope = []

function removeFromScope(entity)
{
	let isMultivector = multivectorScope.indexOf(entity) !== -1

	removeSingleElementFromArray(isMultivector ? multivectorScope : operatorScope, entity)
	scene.remove(entity)
	removeSingleElementFromArray(clickables,isMultivector ? entity.boundingBox:entity)

	// multivec.dispose() //TODO
	//You need to get rid of everything that is "new" in multivectorAppearance.js
	//and things in updateFunctions
}

function setScope(elementses, operators)
{
	for(let i = multivectorScope.length-1; i > -1; i--)
		removeFromScope(multivectorScope[i])
	for(let i = operatorScope.length-1; i > -1; i--)
		removeFromScope(operatorScope[i])

	if(elementses === undefined)
	{
		elementses = [
			new Float32Array([0.,1.,0.,0.,0.,0.,0.,0.]),
			new Float32Array([0.,0.,1.,0.,0.,0.,0.,0.])
		]
	}
	for(let i = 0; i < elementses.length; i++)
		ScopeMultivector(elementses[i],true)

	if(operators === undefined)
	{
		operators = [
			geometricSum,
			geometricProduct 
		]
	}
	for(let i = 0; i < operators.length; i++)
		ScopeOperator(operators[i], operators.length)
}

function updateScopePositions()
{
	//if you do want to get them all at once (which you do once per frame) can just pass an array in here
	for(let j = 0; j < multivectorScope.length; j++)
	{
		let dest = multivectorScope[j].scopePosition

		let allowedWidth = .7
		dest.x = -camera.rightAtZZero + allowedWidth
		dest.y = camera.topAtZZero
		for (let i = 0; i <= j; i++)
		{
			let halfMultivectorHeight = multivectorScope[i].boundingBox.scale.y / 2.;

			if (dest.y - halfMultivectorHeight < -camera.topAtZZero)
			{
				dest.x += allowedWidth
				dest.y = camera.topAtZZero
			}

			dest.y -= halfMultivectorHeight
			if(j!==i)
				dest.y -= halfMultivectorHeight
		}
	}
}
function getOperatorScopeX(desiredindex,eventualScopeSize)
{
	if(eventualScopeSize === undefined)
		eventualScopeSize = operatorScope.length
		
	let spacing = 3.
	return (desiredindex - 0.5 * (eventualScopeSize - 1)) * spacing
}

function initScope()
{
	// better packing http://www.optimization-online.org/DB_FILE/2016/01/5293.pdf
	updateFunctions.push(function()
	{
		updateScopePositions()
		for(let i = 0; i < multivectorScope.length; i++ )
			multivectorScope[i].position.lerp(multivectorScope[i].scopePosition,.1)

		for(let i = 0; i < operatorScope.length; i++)
			operatorScope[i].position.x += .1 * (getOperatorScopeX(i) - operatorScope[i].position.x)
	})

	let keyboardSelectionIndicator = RectangleIndicator()

	// updateFunctions.push(function()
	// {
	// 	if( keyboardSelectionIndicator.parent === null )
			
	// })
	// bindButton("enter",function()
	// {
	// 	if(scopeIsLimited)
	// 	{
	// 		let closestMultivector = multivectorScope[ getClosestObjectToPoint(keyboardSelectionIndicator.position,multivectorScope) ]
	// 		let closestOperator = operatorScope[ getClosestObjectToPoint(keyboardSelectionIndicator.position,operatorScope) ]

	// 		let closerEntity = 
	// 			closestMultivector.position.distanceToSquared(keyboardSelectionIndicator.position) < 
	// 			closestOperator.position.distanceToSquared(keyboardSelectionIndicator.position) ?
	// 			closestMultivector : closestOperator

	// 		keyboardSelectionIndicator.position.copy(closerEntity.position)
	// 	}

	// 	let selection = getSelection()
	// 	if(operatorScope.indexOf(selection) !== -1)
	// 		selection.onClick()
	// 	else if(multivectorScope.indexOf(selection) !== -1)
	// 		selection.boundingBox.onClick()
	// })

	// function checkIfPositionIsInDirection(origin,direction,position)
	// {
	// 	if()
	// }
	// bindButton("right",function()
	// {
	// 	let oneOnTheRight = null
	// 	for(let i = 0; i < multivectorScope.length; i++)
	// 	{
	// 		//it has to be less than 45 degrees from where you are, otherwise you'd go down to get to it
	// 		//buuuuut if there's nothing where do you go/
	// 		if(multivectorScope[i] === keyboardSelectionIndicator.parent)
	// 			continue;

	// 		if( checkIfPositionIsInDirection(keyboardSelectionIndicator.parent.position,xUnit,multivectorScope[i].position) )
	// 		{

	// 		}
	// 	}
	// })
	// return;

	let multivectorScopeSelected
	let multivectorSelection
	let operatorSelection
	function getSelection()
	{
		if( multivectorScopeSelected && multivectorScope.length > 0 )
			return multivectorScope[multivectorSelection]
		else
			return operatorScope[operatorSelection]
	}
	function makeSureSelectorIsSetUp()
	{
		if( !checkIfObjectIsInScene(keyboardSelectionIndicator) )
		{
			multivectorScopeSelected = false
			multivectorSelection = 0;
			operatorSelection = 0;
			getSelection().add(keyboardSelectionIndicator)
		}
	}

	bindButton("up",function()
	{
		makeSureSelectorIsSetUp()

		if(!multivectorScopeSelected)
		{
			multivectorScopeSelected = true
			multivectorSelection = multivectorScope.length-1
		}
		else
		{
			multivectorSelection--
			if(multivectorSelection < 0)
			{
				multivectorSelection = multivectorScope.length-1
			}
		}

		getSelection().add(keyboardSelectionIndicator)
	})
	bindButton("down",function()
	{
		makeSureSelectorIsSetUp()

		if(!multivectorScopeSelected)
		{
			multivectorScopeSelected = true
			multivectorSelection = 0
		}
		else
		{
			multivectorSelection++
			if(multivectorSelection > multivectorScope.length-1)
			{
				multivectorSelection = 0
			}
		}

		getSelection().add(keyboardSelectionIndicator)
	})
	bindButton("left",function()
	{
		makeSureSelectorIsSetUp()

		if(multivectorScopeSelected)
		{
			multivectorScopeSelected = false
			operatorSelection = operatorScope.length-1
		}
		else
		{
			operatorSelection--
			if(operatorSelection < 0)
			{
				operatorSelection = operatorScope.length - 1
			}
		}

		getSelection().add(keyboardSelectionIndicator)
	})
	bindButton("right",function()
	{
		makeSureSelectorIsSetUp()

		if(multivectorScopeSelected)
		{
			multivectorScopeSelected = false
			operatorSelection = 0
		}
		else
		{
			operatorSelection++
			if(operatorSelection > operatorScope.length-1)
			{
				operatorSelection = 0
			}
		}

		getSelection().add(keyboardSelectionIndicator)
	})

	bindButton("enter",function()
	{
		makeSureSelectorIsSetUp()		

		let closestDistSq = Infinity
		let closest = null
		function forEachScope(scopeEntity,index)
		{
			if( keyboardSelectionIndicator.parent === scopeEntity )
				return

			let distSq = scopeEntity.position.distanceToSquared(keyboardSelectionIndicator.parent.position)
			if(distSq < closestDistSq)
			{
				closest = scopeEntity
				closestDistSq = distSq
			}
		}
		multivectorScope.forEach(forEachScope)
		operatorScope.forEach(forEachScope)

		let selection = getSelection()
		if(operatorScope.indexOf(selection) !== -1)
			selection.onClick()
		else if(multivectorScope.indexOf(selection) !== -1)
			selection.boundingBox.onClick()

		if( closest !== null && scopeIsLimited )
		{
			closest.add(keyboardSelectionIndicator)
			multivectorScopeSelected = multivectorScope.indexOf(closest) !== -1
		}
	})
}