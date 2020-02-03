operatorScope = [];
multivectorScope = []

function removeFromScope(entity)
{
	let isMultivector = multivectorScope.indexOf(entity) !== -1

	removeSingleElementFromArray(isMultivector ? multivectorScope : operatorScope, entity)
	scene.remove(entity)
	removeSingleElementFromArray(clickables,isMultivector ? entity.thingYouClick:entity)

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
	let allowedWidth = .7
	dest.x = -camera.rightAtZZero + allowedWidth
	dest.y = camera.topAtZZero
	for(let i = 0; i <= desiredindex; i++ )
	{
		let halfMultivectorHeight = multivectorScope[i].getHeightWithPadding() / 2.;

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
	return (desiredindex - 0.5 * (eventualScopeSize-1) ) * 2.
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

	//this is a load of shit, just do it as visualized

	let keyboardSelectionIndicator = RectangleIndicator()
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
				multivectorScopeSelected = false
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
				multivectorScopeSelected = false
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
				if(multivectorScope.length === 0)
					return
				
				operatorSelection = operatorScope.length - 1
				multivectorScopeSelected = true
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
				if(multivectorScope.length === 0)
					return
				
				operatorSelection = 0
				multivectorScopeSelected = true
			}
		}

		getSelection().add(keyboardSelectionIndicator)
	})

	bindButton("enter",function()
	{
		makeSureSelectorIsSetUp()		

		let selection = getSelection()
		if(operatorScope.indexOf(selection) !== -1)
			selection.onClick()
		else if(multivectorScope.indexOf(selection) !== -1)
			selection.thingYouClick.onClick()
	})
}