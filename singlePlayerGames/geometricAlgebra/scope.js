function initScope(multivectorScope,multivectorScopeOnClick,operatorScopeOnClick)
{
	let xBasisElement = MultivectorAppearance(multivectorScopeOnClick)
	multivectorScope.push(xBasisElement)
	xBasisElement.setTo1Blade(xUnit)
	let yBasisElement = MultivectorAppearance(multivectorScopeOnClick)
	multivectorScope.push(yBasisElement)
	yBasisElement.setTo1Blade(yUnit)
	// let zBasisElement = MultivectorAppearance(multivectorScopeOnClick)
	// multivectorScope.push(zBasisElement)
	// zBasisElement.setTo1Blade(zUnit)

	// let littleScalar = MultivectorAppearance(multivectorScopeOnClick)
	// multivectorScope.push(littleScalar)
	// littleScalar.elements[0] = .2
	// littleScalar.updateAppearance()

	// let trivec = MultivectorAppearance(multivectorScopeOnClick)
	// multivectorScope.push(trivec)
	// trivec.elements[7] = 1.
	// trivec.updateTrivectorAppearance()

	// better packing http://www.optimization-online.org/DB_FILE/2016/01/5293.pdf
	let scopePosition = new THREE.Vector3()
	updateFunctions.push(function()
	{
		let allowedWidth = .7
		scopePosition.x = -camera.rightAtZZero + allowedWidth
		scopePosition.y = camera.topAtZZero
		for(let i = 0; i < multivectorScope.length; i++ )
		{
			let halfMultivectorHeight = multivectorScope[i].getHeightWithPadding() / 2.;

			if( scopePosition.y - halfMultivectorHeight < -camera.topAtZZero)
			{
				scopePosition.x += allowedWidth
				scopePosition.y = camera.topAtZZero
			}

			scopePosition.y -= halfMultivectorHeight
			multivectorScope[i].position.lerp(scopePosition,.1)
			scopePosition.y -= halfMultivectorHeight
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
	let multivectorSelection = 0;
	let operatorSelection = 0;
	function getSelection()
	{
		if(operatorSelection === 0)
			return multivectorScope[multivectorSelection]
		else
			return operatorScope[operatorSelection-1]
	}
	bindButton("up",function()
	{
		if(operatorSelection !== 0)
		{
			operatorSelection = 0
			multivectorSelection = multivectorScope.length - 1
		}
		else
			multivectorSelection--

		if(multivectorSelection < 0 )
		{
			operatorSelection++
			multivectorSelection = multivectorScope.length-1
		}
		scene.add(keyboardSelectionIndicator)
	})
	bindButton("down",function()
	{
		if(operatorSelection !== 0)
		{
			operatorSelection = 0
			multivectorSelection = 0
		}
		else
			multivectorSelection++

		if(multivectorSelection > multivectorScope.length-1 )
		{
			operatorSelection++
			multivectorSelection = 0
		}
		scene.add(keyboardSelectionIndicator)
	})
	bindButton("left",function()
	{
		operatorSelection--
		if(operatorSelection < 0 )
			operatorSelection = 2
		scene.add(keyboardSelectionIndicator)
	})
	bindButton("right",function()
	{
		operatorSelection++
		if(operatorSelection > 2 )
			operatorSelection = 0
		scene.add(keyboardSelectionIndicator)
	})
	bindButton("enter",function()
	{
		if(keyboardSelectionIndicator.parent !== scene)
			scene.add(keyboardSelectionIndicator)
		else
		{
			let selection = getSelection()
			if(operatorScope.indexOf(selection) !== -1)
				selection.onClick()
			else
				selection.thingYouClick.onClick()
		}
	})
	updateFunctions.push(function()
	{
		keyboardSelectionIndicator.position.copy(getSelection().position)
	})
}