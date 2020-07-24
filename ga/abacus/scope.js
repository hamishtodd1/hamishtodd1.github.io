/*
	Your scope duplicates a scene full of multivectors that you're looking at. Can hold on one in your scope and see its duplicate highlighted

	Would be very nice to move the selector there when you hover

	Put the whole scope on the pictures?

	Surely want scope on right because that's the way people hold it

	Optimal Arrangement
		exponential but n is small
		Except there is one side along which you do want to fill
		Downsides:
			the basis isn't in one place
			"undo" will cause big rearrangements
*/

function intersectBoundingBoxes(a, b)
{
	let aMaxX = a.scopePosition.x + a.boundingBox.scale.x * .5
	let aMaxY = a.scopePosition.y + a.boundingBox.scale.y * .5
	let bMaxX = b.scopePosition.x + b.boundingBox.scale.x * .5
	let bMaxY = b.scopePosition.y + b.boundingBox.scale.y * .5
	let aMinX = a.scopePosition.x - a.boundingBox.scale.x * .5
	let aMinY = a.scopePosition.y - a.boundingBox.scale.y * .5
	let bMinX = b.scopePosition.x - b.boundingBox.scale.x * .5
	let bMinY = b.scopePosition.y - b.boundingBox.scale.y * .5

	return !(
		aMaxX < bMinX ||
		aMinX > bMaxX ||
		aMaxY < bMinY ||
		aMinY > bMaxY )
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
	let num = multivectorScope.length
	let orderedBySideRightness = Array(num)
	let orderedByBottomLowness = Array(num)
	for (let i = 0, il = num; i < il; i++)
	{
		orderedBySideRightness[i] = multivectorScope[i]
		orderedByBottomLowness[i] = multivectorScope[i]
	}

	function doSorts()
	{
		orderedByBottomLowness.sort(function (a, b)
		{
			let aLowness = a.scopePosition.y - a.boundingBox.scale.y / 2.
			let bLowness = b.scopePosition.y - b.boundingBox.scale.y / 2.
			return bLowness - aLowness //because larger numbers come first
		})
		orderedBySideRightness.sort(function (a, b)
		{
			let aRightness = a.scopePosition.x + a.boundingBox.scale.x / 2.
			let bRightness = b.scopePosition.x + b.boundingBox.scale.x / 2.
			return aRightness - bRightness
		})
	}

	let spacing = .35 //needs to be greater than zero because round off errors
	let avoidanceOfSides = .3
	for (let i = 0, il = num; i < il; i++)
	{
		orderedBySideRightness[i].scopePosition.x = Infinity
		orderedByBottomLowness[i].scopePosition.y =-Infinity //want the infinities to be at the end
	}
	doSorts()

	for (let i = 0, il = num; i < il; i++)
	{
		for (let j = -1; j < i; j++) // put it next to each rect
		{
			multivectorScope[i].scopePosition.x = j === -1 ?
				-camera.rightAtZZero + avoidanceOfSides + multivectorScope[i].boundingBox.scale.x / 2. :
				orderedBySideRightness[j].scopePosition.x + orderedBySideRightness[j].boundingBox.scale.x / 2. + spacing + multivectorScope[i].boundingBox.scale.x / 2.

			//start at top and move down whenever there's a clash
			multivectorScope[i].scopePosition.y = camera.topAtZZero - avoidanceOfSides - multivectorScope[i].boundingBox.scale.y / 2.
			let goneOffBottom = false
			for (let k = 0; k < i; k++)
			{
				if (
					//TODO completely in-line with vertical first, fuck precalculating
					intersectBoundingBoxes(multivectorScope[i], orderedByBottomLowness[k]))
				{
					multivectorScope[i].scopePosition.y = orderedByBottomLowness[k].scopePosition.y - orderedByBottomLowness[k].boundingBox.scale.y / 2. - multivectorScope[i].boundingBox.scale.y / 2. - spacing
					if (multivectorScope[i].scopePosition.y - multivectorScope[i].boundingBox.scale.y / 2. < -camera.topAtZZero + avoidanceOfSides)
					{
						goneOffBottom = true
						break; //well this is more like double-break
					}
				}
			}

			if (!goneOffBottom)
			{
				doSorts()
				break;
			}
		}
	}

	delete orderedBySideRightness
	delete orderedByBottomLowness
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
	updateFunctions.push(function()
	{
		updateScopePositions()
		for(let i = 0; i < multivectorScope.length; i++ )
			multivectorScope[i].position.lerp(multivectorScope[i].scopePosition,.1)

		for(let i = 0; i < operatorScope.length; i++)
			operatorScope[i].position.x += .1 * (getOperatorScopeX(i) - operatorScope[i].position.x)
	})

	let selection = null
	let keyboardSelectionIndicator = null
	{
		let material = new THREE.MeshBasicMaterial({ color: 0xFFFF00 })

		keyboardSelectionIndicator = new THREE.Group()
		keyboardSelectionIndicator.thickness = .1
		for (let i = 0; i < 4; i++)
		{
			let r = new THREE.Mesh(unchangingUnitSquareGeometry, material)
			keyboardSelectionIndicator.add(r)
			if (i < 2)
			{
				r.position.x = .5 - keyboardSelectionIndicator.thickness * .5
				r.scale.x = keyboardSelectionIndicator.thickness
			}
			else
			{
				r.position.y = .5 - keyboardSelectionIndicator.thickness * .5
				r.scale.y = keyboardSelectionIndicator.thickness
			}
			if (i % 2)
				r.position.multiplyScalar(-1.);
			r.position.z = .01
		}
	}

	function setSelectionIndicatorSize(width, height)
	{
		width = Math.max(Math.abs(width), .001)
		height = Math.max(Math.abs(height), .001)
		for (let i = 0; i < keyboardSelectionIndicator.children.length; i++)
		{
			keyboardSelectionIndicator.children[i].position.x = Math.sign(keyboardSelectionIndicator.children[i].position.x) * width  / 2.
			keyboardSelectionIndicator.children[i].position.y = Math.sign(keyboardSelectionIndicator.children[i].position.y) * height / 2.

			keyboardSelectionIndicator.children[i].scale.x = keyboardSelectionIndicator.children[i].scale.x === keyboardSelectionIndicator.thickness ? keyboardSelectionIndicator.thickness : width  + keyboardSelectionIndicator.thickness
			keyboardSelectionIndicator.children[i].scale.y = keyboardSelectionIndicator.children[i].scale.y === keyboardSelectionIndicator.thickness ? keyboardSelectionIndicator.thickness : height + keyboardSelectionIndicator.thickness
		}
	}

	function makeSureSelectorIsSetUp()
	{
		if (!checkIfObjectIsInScene(keyboardSelectionIndicator))
		{
			scene.add(keyboardSelectionIndicator)

			console.assert(multivectorScope.length !== 0)
			selection = multivectorScope[0]

			updateFunctions.push(function ()
			{
				if (selection.parent !== scene)
				{
					let closest = getClosest()
					if (closest !== null)
						selection = closest
					else
						return
				}

				keyboardSelectionIndicator.position.copy(selection.position)
				if (multivectorScope.indexOf(selection) !== -1)
					setSelectionIndicatorSize(selection.boundingBox.scale.x, selection.boundingBox.scale.y)
				else
					setSelectionIndicatorSize(2., 2.)
			})
		}
	}

	//both angle and distance play a part in which one you choose
	function changeSelection(componentIndex,positiveDirection)
	{
		makeSureSelectorIsSetUp()

		let max = -Infinity
		let min = Infinity
		for (let i = 0; i < multivectorScope.length; i++)
		{
			if( multivectorScope[i].position.x < min)
				min = multivectorScope[i].position.x
			if (multivectorScope[i].position.x > max)
				max = multivectorScope[i].position.x
		}
		for (let i = 0; i < operatorScope.length; i++)
		{
			if (operatorScope[i].position.x < min)
				min = operatorScope[i].position.x
			if (operatorScope[i].position.x > max)
				max = operatorScope[i].position.x
		}
		let wholeScopeWidth = max-min

		//urgh but it's also about their bounding box
		let lowestProximity = Infinity
		let closestThing = null
		let relativePosition = new THREE.Vector3()
		function checkIfClosest(mvOrOperator)
		{
			if (mvOrOperator === selection)
				return;

			relativePosition.copy(mvOrOperator.position).sub(selection.position)
			let componentValue = relativePosition.getComponent(componentIndex)
			if(Math.abs(componentValue)<.1)
				return
			if (componentValue < 0. && positiveDirection)
				componentValue += componentIndex ? 2. * camera.topAtZZero : wholeScopeWidth
			if (componentValue > 0. && !positiveDirection)
				componentValue -= componentIndex ? 2. * camera.topAtZZero : wholeScopeWidth

			let nonComponentHandicap = 3. //you have to be this much closer to be equivalently proximate
			let proximity = Math.abs(componentValue) + nonComponentHandicap * Math.abs( relativePosition.getComponent(1-componentIndex) )
			if (proximity < lowestProximity)
			{
				lowestProximity = proximity
				closestThing = mvOrOperator
			}
		}

		if( multivectorScope.indexOf(selection) !== -1 || componentIndex === 0 )
		{
			for (let i = 0; i < operatorScope.length; i++)
				checkIfClosest(operatorScope[i])
		}
		for(let i = 0; i < multivectorScope.length; i++)
			checkIfClosest(multivectorScope[i])
		if (closestThing !== null)
			selection = closestThing
	}

	bindButton("ArrowUp", 		function ()	{changeSelection(1,true )})
	bindButton("ArrowDown", 	function ()	{changeSelection(1,false)})
	bindButton("ArrowRight", 	function ()	{changeSelection(0,true )})
	bindButton("ArrowLeft", 	function ()	{changeSelection(0,false)})

	function getClosest()
	{
		let closestDistSq = Infinity
		let closest = null
		function forEachScope(scopeEntity)
		{
			if (scopeEntity === selection)
				return

			let distSq = scopeEntity.position.distanceToSquared(keyboardSelectionIndicator.position)
			if (distSq < closestDistSq)
			{
				closest = scopeEntity
				closestDistSq = distSq
			}
		}
		multivectorScope.forEach(forEachScope)
		operatorScope.forEach(forEachScope)

		return closest
	}

	bindButton("Enter",function()
	{
		makeSureSelectorIsSetUp()

		let closest = getClosest()
		
		if (operatorScope.indexOf(selection) !== -1)
			selection.onClick()
		else if (multivectorScope.indexOf(selection) !== -1)
			selection.boundingBox.onClick()

		if (closest !== null && scopeIsLimited)
			selection = closest
	})
}