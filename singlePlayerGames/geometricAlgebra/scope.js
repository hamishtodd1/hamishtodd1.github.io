/*
	Put the whole scope on the pictures?

	Surely want scope on right because that's the way people hold it

	Optimal Arrangement
		exponential but n is small
		Except there is one side along which you do want to fill
		Not really desirable because you want the simple stuff in one place

	Could try putting them beneath each one in turn and sliding them left and right
*/

function initPacking()
{
	let rects = []
	let rectsOrderedBySideRightness = []
	let rectsOrderedByBottomLowness = []
	let numRects = 56
	for(let i = 0; i < numRects; i++)
	{
		rects[i] = new THREE.Mesh(unchangingUnitSquareGeometry, new THREE.MeshBasicMaterial({ color: new THREE.Color(i / numRects,0.,0.)}))
		rects[i].position.x = camera.rightAtZZero
		rects[i].position.y = -camera.topAtZZero
		rectsOrderedBySideRightness.push(rects[i])
		rectsOrderedByBottomLowness.push(rects[i])
		rects[i].scale.x = .2 + Math.random() * 4.
		rects[i].scale.y = .2 + Math.random() * 4.
		rects[i].intendedPosition = new THREE.Vector3(camera.rightAtZZero*1.5,-camera.topAtZZero,0.)
		scene.add(rects[i])
	}

	function intersect(a,b)
	{
		let aMaxX = a.intendedPosition.x + a.scale.x / 2.
		let aMaxY = a.intendedPosition.y + a.scale.y / 2.
		let bMaxX = b.intendedPosition.x + b.scale.x / 2.
		let bMaxY = b.intendedPosition.y + b.scale.y / 2.
		let aMinX = a.intendedPosition.x - a.scale.x / 2.
		let aMinY = a.intendedPosition.y - a.scale.y / 2.
		let bMinX = b.intendedPosition.x - b.scale.x / 2.
		let bMinY = b.intendedPosition.y - b.scale.y / 2.

		return	aMaxX < bMinX || aMinX > bMaxX ||
				aMaxY < bMinY || aMinY > bMaxY ? false : true
	}

	let roundoffPadding = .005
	for (let i = 0, il = rects.length; i < il; i++)
	{
		for(let j = -1; j < i; j++) // put it next to each rect
		{
			rects[i].intendedPosition.x = j === -1 ?
				-camera.rightAtZZero + .1 + rects[i].scale.x / 2. :
				rectsOrderedBySideRightness[j].intendedPosition.x + rectsOrderedBySideRightness[j].scale.x / 2. + roundoffPadding + rects[i].scale.x / 2.
			
			//start at top and move down on clashes
			rects[i].intendedPosition.y = camera.topAtZZero - .1 - rects[i].scale.y / 2.
			let goneOffBottom = false
			for (let k = 0; k < i; k++)
			{
				if(intersect(rects[i],rectsOrderedByBottomLowness[k]))
				{
					rects[i].intendedPosition.y = rectsOrderedByBottomLowness[k].intendedPosition.y - rectsOrderedByBottomLowness[k].scale.y / 2. - rects[i].scale.y / 2. - roundoffPadding
					if (rects[i].intendedPosition.y - rects[i].scale.y / 2. < -camera.topAtZZero)
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

	for(let i = 0; i < rects.length; i++)
	{
		log(rectsOrderedBySideRightness[i].position.x + rectsOrderedBySideRightness[i].scale.x )
	}

	// let nooks = [{
	// 	x:-camera.rightAtZZero + roundoffPadding + .1,
	// 	y:camera.topAtZZero + roundoffPadding - .1,
	// 	height:camera.topAtZZero*2.,
	// 	width:Infinity}]
	// for(let i = 0, il = rects.length; i < il; i++)
	// {
	// 	for (let n = 0, nl = nooks.length; n < nl; n++)
	// 	{
	// 		rects[i].intendedPosition.x = nooks[n].x + rects[i].scale.x / 2. + roundoffPadding
	// 		rects[i].intendedPosition.y = nooks[n].y - rects[i].scale.y / 2. - roundoffPadding

	// 		let intersection = false
	// 		for (let j = 0; j < i; j++)
	// 		{
	// 			if (intersect(rects[i], rects[j]) ) //even a slight thing poking out just below rules it out
	// 			{
	// 				intersection = true
	// 				break;
	// 			}
	// 		}
	// 		// log(intersection)
	// 		if(intersection) //success
	// 		{
	// 			rects[i].intendedPosition.x = camera.rightAtZZero * 1.5
	// 			rects[i].intendedPosition.y = -camera.topAtZZero
	// 		}
	// 		else
	// 		{
	// 			//right
	// 			if( nooks[n].width > rects[i].scale.x)
	// 			{
	// 				nooks.push({
	// 					x: nooks[n].x + rects[i].scale.x + roundoffPadding,
	// 					width: nooks[n].width - rects[i].scale.x - roundoffPadding,
	// 					y: nooks[n].y,
	// 					height: rects[i].scale.y
	// 				})
	// 			}
	// 			// else
	// 			// {
	// 			// 	nooks.push({
	// 			// 		x: nooks[n].width,
	// 			// 		width: 0.,
	// 			// 		y: nooks[n].y,
	// 					// height: rects[i].scale.y
	// 			// 	})
	// 			// }
	// 			//below
	// 			if (nooks[n].height > rects[i].scale.y)
	// 			{
	// 				nooks.push({
	// 					x: nooks[n].x,
	// 					width: rects[i].scale.x,
	// 					y: nooks[n].y - rects[i].scale.y - roundoffPadding,
	// 					height: nooks[n].height - rects[i].scale.y - roundoffPadding
	// 				})
	// 			}

	// 			removeSingleElementFromArray(nooks, nooks[n])

	// 			nooks.sort(function(a,b)
	// 			{
	// 				if (Math.abs(a.x - b.x ) > .01)
	// 					return a.x - b.x //leftmost first
	// 				else
	// 					return a.y - b.y //top one goes first
	// 			})

	// 			for(let i = 0; i < nooks.length; i++)
	// 				log(nooks[i].x + camera.rightAtZZero,camera.topAtZZero - nooks[i].y, nooks[i].width, nooks[i].height)
	// 			log("next")

	// 			break;
	// 		}
	// 	}
	// }

	updateFunctions.push(function ()
	{
		for (let i = 0; i < rects.length; i++)
		{
			// if( i < frameCount / 30)
			{
				rects[i].position.lerp(rects[i].intendedPosition, 1.)
				rects[i].position.lerp(rects[i].intendedPosition, 1.)
			}
		}
	})
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

function getMultivectorScopePosition(desiredindex,dest)
{
	//if you do want to get them all at once (which you do once per frame) can just pass an array in here

	let allowedWidth = .7
	dest.x = -camera.rightAtZZero + allowedWidth
	dest.y = camera.topAtZZero
	for(let i = 0; i <= desiredindex; i++ )
	{
		let halfMultivectorHeight = multivectorScope[i].boundingBox.scale.y / 2.;

		if( dest.y - halfMultivectorHeight < -camera.topAtZZero)
		{
			dest.x += allowedWidth
			dest.y = camera.topAtZZero
		}

		dest.y -= halfMultivectorHeight
		if(i === desiredindex)
			return dest
		dest.y -= halfMultivectorHeight
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
	let scopePosition = new THREE.Vector3()
	updateFunctions.push(function()
	{
		for(let i = 0; i < multivectorScope.length; i++ ) //n^2 but hey scope sucks
		{
			getMultivectorScopePosition(i,scopePosition)
			multivectorScope[i].position.lerp(scopePosition,.1)
		}

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