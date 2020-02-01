function removeFromScope(multivec)
{
	removeSingleElementFromArray(multivectorScope, multivec)
	scene.remove(multivec)
	removeSingleElementFromArray(clickables,multivec.thingYouClick)

	// multivec.dispose() //TODO
	//You need to get rid of everything that is "new" in multivectorAppearance.js
}

function setScope(elementses)
{
	for(let i = multivectorScope.length-1; i > -1; i--)
		removeFromScope(multivectorScope[i])

	if(elementses === undefined)
	{
		ScopeMultivector(new Float32Array([0.,1.,0.,0.,0.,0.,0.,0.]),true)
		ScopeMultivector(new Float32Array([0.,0.,1.,0.,0.,0.,0.,0.]),true)
	}
	else
	{
		for(let i = 0; i < elementses.length; i++)
			ScopeMultivector(elementses[i],true)
	}
}

function getScopePosition(desiredindex,dest)
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

function initScope(operatorScopeOnClick)
{
	// better packing http://www.optimization-online.org/DB_FILE/2016/01/5293.pdf
	let scopePosition = new THREE.Vector3()
	updateFunctions.push(function()
	{
		for(let i = 0; i < multivectorScope.length; i++ ) //n^2 but hey scope sucks
		{
			getScopePosition(i,scopePosition)
			multivectorScope[i].position.lerp(scopePosition,.1)
		}
	})

	let operatorScope = [
		OperatorAppearance(geometricSum),
		OperatorAppearance(geometricProduct)
	];

	for(let i = 0; i < operatorScope.length; ++i )
	{
		if(i)
			operatorScope[i].material.color.setRGB(1.,0.,0.)

		operatorScope[i].position.y = -camera.topAtZZero + .9
		operatorScope[i].position.x = (i - 0.5 * (operatorScope.length-1) ) * 2.
		scene.add(operatorScope[i])

		clickables.push(operatorScope[i])
		operatorScope[i].onClick = function(){operatorScopeOnClick(operatorScope[i])}
	}

	let keyboardSelectionIndicator = RectangleIndicator()
	let multivectorScopeSelected
	let multivectorSelection
	let operatorSelection
	function initKeyboardSelectionIfNotNotAlreadyDone()
	{
		if( !checkIfObjectIsInScene(keyboardSelectionIndicator) )
		{
			multivectorScopeSelected = true
			multivectorSelection = 0;
			operatorSelection = 0;
			getSelection().add(keyboardSelectionIndicator)
		}
	}
	function getSelection()
	{
		if( multivectorScopeSelected )
			return multivectorScope[multivectorSelection]
		else
			return operatorScope[operatorSelection]
	}

	bindButton("up",function()
	{
		initKeyboardSelectionIfNotNotAlreadyDone()

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
		initKeyboardSelectionIfNotNotAlreadyDone()

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
		initKeyboardSelectionIfNotNotAlreadyDone()

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
				multivectorScopeSelected = true
			}
		}

		getSelection().add(keyboardSelectionIndicator)
	})
	bindButton("right",function()
	{
		initKeyboardSelectionIfNotNotAlreadyDone()

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
				multivectorScopeSelected = true
			}
		}

		getSelection().add(keyboardSelectionIndicator)
	})

	bindButton("enter",function()
	{
		initKeyboardSelectionIfNotNotAlreadyDone()		

		let selection = getSelection()
		if(operatorScope.indexOf(selection) !== -1)
			selection.onClick()
		else if(multivectorScope.indexOf(selection) !== -1)
			selection.thingYouClick.onClick()
	})
}