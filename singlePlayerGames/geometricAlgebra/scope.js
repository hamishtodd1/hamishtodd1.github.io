/*
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

//much to do, big gaps and why the hell is it needed in input crap
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

	let spacing = .1 //needs to be greater than zero because round off errors
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
	// better packing http://www.optimization-online.org/DB_FILE/2016/01/5293.pdf
	updateFunctions.push(function()
	{
		updateScopePositions()
		for(let i = 0; i < multivectorScope.length; i++ )
			multivectorScope[i].position.lerp(multivectorScope[i].scopePosition,.1)

		for(let i = 0; i < operatorScope.length; i++)
			operatorScope[i].position.x += .1 * (getOperatorScopeX(i) - operatorScope[i].position.x)
	})

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

	//both angle and distance play a part in which one you choose. We threshold the angle and choose the closest
	let directionChecker = new THREE.Vector3()
	function checkIfPositionIsInDirection(origin,direction,position)
	{
		directionChecker.copy(position).sub(origin)
		return directionChecker.angleTo(direction) < TAU / 8.
	}
	bindButton("k",function()
	{
		let selection = getSelection()

		let closestDistSq = Infinity
		let closestIndex = -1
		for(let i = 0; i < multivectorScope.length; i++)
		{
			//it has to be less than 45 degrees from where you are, otherwise you'd go down to get to it
			//buuuuut if there's nothing where do you go?
			if(multivectorScope[i] === selection)
				continue;

			if( checkIfPositionIsInDirection(selection.position,xUnit,multivectorScope[i].position) )
			{
				let distSq = selection.position.distanceToSquared(multivectorScope[i].position)
				if (distSq < closestDistSq)
				{
					closestDistSq = distSq
					closestIndex = i
				}
			}
		}
		if(closestIndex !== -1)
		{
			multivectorScopeSelected = true
			multivectorSelection = closestIndex
			log(multivectorSelection)
		}
	})
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
			scene.add(keyboardSelectionIndicator)

			multivectorScopeSelected = false
			multivectorSelection = 0;
			operatorSelection = 0;

			updateFunctions.push(function ()
			{
				let currentSelection = getSelection()
				keyboardSelectionIndicator.position.copy(currentSelection.position)
				if (multivectorScope.indexOf(currentSelection) !== -1)
				{
					for (let i = 0; i < keyboardSelectionIndicator.children.length; i++)
					{
						keyboardSelectionIndicator.children[i].position.x = Math.sign(keyboardSelectionIndicator.children[i].position.x) * currentSelection.boundingBox.scale.x / 2.
						keyboardSelectionIndicator.children[i].position.y = Math.sign(keyboardSelectionIndicator.children[i].position.y) * currentSelection.boundingBox.scale.y / 2.

						keyboardSelectionIndicator.children[i].scale.x = keyboardSelectionIndicator.children[i].scale.x === keyboardSelectionIndicator.thickness ? keyboardSelectionIndicator.thickness : currentSelection.boundingBox.scale.x + keyboardSelectionIndicator.thickness
						keyboardSelectionIndicator.children[i].scale.y = keyboardSelectionIndicator.children[i].scale.y === keyboardSelectionIndicator.thickness ? keyboardSelectionIndicator.thickness : currentSelection.boundingBox.scale.y + keyboardSelectionIndicator.thickness
					}
				}
				else
				{
					for (let i = 0; i < keyboardSelectionIndicator.children.length; i++)
					{
						keyboardSelectionIndicator.children[i].position.x = Math.sign(keyboardSelectionIndicator.children[i].position.x)
						keyboardSelectionIndicator.children[i].position.y = Math.sign(keyboardSelectionIndicator.children[i].position.y)

						keyboardSelectionIndicator.children[i].scale.x = keyboardSelectionIndicator.children[i].scale.x === keyboardSelectionIndicator.thickness ? keyboardSelectionIndicator.thickness : 2. + keyboardSelectionIndicator.thickness
						keyboardSelectionIndicator.children[i].scale.y = keyboardSelectionIndicator.children[i].scale.y === keyboardSelectionIndicator.thickness ? keyboardSelectionIndicator.thickness : 2. + keyboardSelectionIndicator.thickness
					}
				}
			})
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