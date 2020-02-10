function initInputOutputApparatus(inputGroup,outputGroup)
{
	let inputSelectionIndicator = RectangleIndicator()
	let outputSelectionIndicator = RectangleIndicator()
	selectInput = function(multivec)
	{
		inputSelectionIndicator.position.copy(multivec.position)
		outputSelectionIndicator.position.copy(multivec.position)

		copyMultivector(multivec.elements, inputScopeMultivector.elements)
		inputScopeMultivector.updateAppearance()

		//probably have it shake a little. Well I mean this is what the pipes were meant to be

		console.error("Need to update ALL the scope")
		// for(let i = 0; i < multivectorScope.length; i++)
		// {
		// 	let mv = multivectorScope[i]
		// }
		// //as a result of choosing multivectors and scopes, you have a certain scope. Each . As a result of that
		// //so for each thing in the scope you keep a record of how it was made

		// record = [
		// 	geometricProduct, new Float32Array([0.,0.,0.,0.,0.,0.,0.,0.]),
		// 	geometricSum, inputScopeMultivector.elements,

		// ]

		//it shouldn't care about whether scope is limited
	}
	
	{
		// let inputs = Array(numPairs)
		inputGroup.background = new THREE.Mesh(unchangingUnitSquareGeometry, new THREE.MeshBasicMaterial({color:0xFFFFFF}))
		inputGroup.background.scale.x = 1.3
		inputGroup.background.position.z = -.001
		inputGroup.add(inputGroup.background)
		inputGroup.add(inputSelectionIndicator)
		var numNonInputChildren = inputGroup.children.length
		getInput = function(index)
		{
			return inputGroup.children[index+numNonInputChildren]
		}
		{
			// for(let i = 0; i < inputs.length; i++)
			// {
			// 	let elements = new Float32Array(8)
			// 	for(let j = 0; j < 5; j++) //ONLY USING THOSE THAT WORK
			// 		elements[j] = (Math.random()-.5)*2.
			// 	elements[0] = Math.floor(Math.random()*20) - 10.
			// 	elements[3] = 0.

			// 	inputs[i] = MultivectorAppearance(selectInput,elements)
			// 	delete elements
			// 	inputs[i].position.y = 1.2 * (i-(numPairs-1)/2.);
			// 	inputGroup.add(inputs[i])
			// }

			// selectInput(inputs[0])
		}

		inputGroup.addInput = function(elements)
		{
			let newInput = MultivectorAppearance( selectInput,elements)
			inputGroup.add( newInput )

			let numInputs = inputGroup.children.length - numNonInputChildren

			inputGroup.background.scale.y  = inputGroup.background.scale.x * numInputs
			outputGroup.background.scale.y = inputGroup.background.scale.y

			for(let i = 0; i < numInputs; i++)
				getInput(i).position.y = -1.2 * (i - (numInputs-1.) / 2. )

			selectInput(newInput)
		}
	}
	clearInputAndOutput = function()
	{
		for(let i = inputGroup.children.length - numNonInputChildren - 1; i > -1; i--)
		{
			let input = getInput(i)
			inputGroup.remove(input)
			removeSingleElementFromArray(clickables,input.thingYouClick)

			let output = getOutput(i)
			if(output !== null)
				outputGroup.remove(output)
		}
	}

	outputGroup.background = inputGroup.background.clone()
	outputGroup.add(outputGroup.background)
	outputGroup.add(outputSelectionIndicator)
	getOutput = function(index)
	{
		let ret = outputGroup.children[index+numNonInputChildren]
		return ret ? ret : null
	}
	{
		// let outputs = Array(inputs.length)

		// let seedForRandomActivity = Math.random()
		// let scopeWithOneExtra = Array(multivectorScope.length+1)
		// for(let i = 0; i < multivectorScope.length; i++)
		// 	scopeWithOneExtra[i] = multivectorScope[i]
		// for(let i = 0; i < outputs.length; i++)
		// {
		// 	scopeWithOneExtra[multivectorScope.length] = inputs[i]
		// 	//possible bug: you're getting both outputs the same sometimes
		// 	let elements = generateRandomMultivectorElementsFromScope(scopeWithOneExtra,seedForRandomActivity)

		// 	outputs[i] = MultivectorAppearance(function(){},elements)
		// 	delete elements
		// 	outputs[i].position.y = 1.2 * (i-(numPairs-1)/2.);
		// 	outputGroup.add(outputs[i])
		// }
	}

	{
		inputGroup.intendedPosition = new THREE.Vector3()
		outputGroup.intendedPosition= new THREE.Vector3()
		let positionGetter = new THREE.Vector3()
		function updateOutputInputGroupIntendedPositions()
		{
			inputGroup.intendedPosition.x = -camera.rightAtZZero + inputGroup.background.scale.x/2.
			getMultivectorScopePosition( multivectorScope.length-1, positionGetter )
			inputGroup.intendedPosition.x += positionGetter.x + .9 + camera.rightAtZZero

			inputGroup.intendedPosition.y = camera.topAtZZero - inputGroup.background.scale.y/2. - .1
			outputGroup.intendedPosition.y = inputGroup.intendedPosition.y

			// outputGroup.intendedPosition.x = camera.rightAtZZero - inputGroup.background.scale.x/2. - .1
			outputGroup.intendedPosition.x = -inputGroup.intendedPosition.x
		}

		updateOutputInputGroupIntendedPositions()
		outputGroup.position.copy(outputGroup.intendedPosition)
		inputGroup.position.copy(inputGroup.intendedPosition)

		updateFunctions.push(function()
		{
			updateOutputInputGroupIntendedPositions()
			outputGroup.position.lerp(outputGroup.intendedPosition,.1)
			inputGroup.position.lerp( inputGroup.intendedPosition,.1)
		})
	}

	let inputScopeMultivector = ScopeMultivector();
	removeFromScope(inputScopeMultivector)
	addInputScopeMultivectorToScope = function()
	{
		let swapMultivector = multivectorScope[0]
		multivectorScope[0] = inputScopeMultivector
		if(swapMultivector)
			multivectorScope.push( swapMultivector )
		scene.add(inputScopeMultivector)
		clickables.push(inputScopeMultivector.thingYouClick)

		for(let i = 0; i < multivectorScope.length; i++)
			getMultivectorScopePosition(i,multivectorScope[i].position)
		log(multivectorScope)
	}

	if(0)
	{
		var line = new THREE.Line( new THREE.Geometry(), new THREE.LineBasicMaterial({color:0x0000FF}) );
		lineVertices = line.geometry.vertices
		for(let i = 0; i < 3; i++)
			lineVertices.push(new THREE.Vector3(i));
		scene.add( line );
	}
}