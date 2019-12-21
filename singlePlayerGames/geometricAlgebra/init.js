/*
	Levels:
		Add only, diagonal
		Add only, two along three up

	TODO for slack / Cambridge demo
		Make it so it's just clicking what you want and your scope is on the right

		Working on smartphone

		Can totally make a nice little countdown style "make this multivector"
		More like a scripting environment / calculator
		make it so there are animations, so it is a good playground (and for your own understanding!)
		Some basic puzzle

		In a scripting-type situation you can still have more than one variable on screen

		Scalar is a line instead? =/ an opacity?
		In the playground you probably want a slidey scalar / number that counts up and up until you click it
			And maybe a vector or orthonormal basis you can play around with?
		Wanna grab and rotate the whole scene
			Hmm, nice unity: rotating the basis vectors rotates eeeeverything
		Every aspect of the multiplication and addition needs to be visualized
			Probably want circles to morph into parallelograms
			Bring two bivectors together, they snap
*/

async function init()
{
	// var otherThingToCheckDistanceTo = []
	// let littleScene = initWheelScene()
	// otherThingToCheckDistanceTo.push(littleScene.hummingbird)

	{
		initMultivectorAppearances()

		var scope = []

		function scopeOnClick(multivecToCopy)
		{
			let activeMultivectorToUse = null
			if(activeMultivectors[0].parent !== scene)
				activeMultivectorToUse = activeMultivectors[0]
			else if(activeMultivectors[1].parent !== scene)
				activeMultivectorToUse = activeMultivectors[1]

			activeMultivectorToUse.copyElements(multivecToCopy.elements)
			activeMultivectorToUse.position.copy(multivecToCopy.position)
			scene.add(activeMultivectorToUse)
		}

		let yBasisElement = MultivectorAppearance(scopeOnClick)
		scope.push(yBasisElement)
		yBasisElement.setTo1Blade(yUnit)
		let xBasisElement = MultivectorAppearance(scopeOnClick)
		scope.push(xBasisElement)
		xBasisElement.setTo1Blade(xUnit)
		let zBasisElement = MultivectorAppearance(scopeOnClick)
		scope.push(zBasisElement)
		zBasisElement.setTo1Blade(zUnit)

		// let trivec = MultivectorAppearance(scopeOnClick)
		// scope.push(trivec)
		// trivec.elements[7] = 1.
		// trivec.updateTrivectorAppearance()

		var activeMultivectors = [
			MultivectorAppearance(function(){}),
			MultivectorAppearance(function(){}) ]
		scene.remove(activeMultivectors[0],activeMultivectors[1])
	}

	{
		await initOperatorAppearance()

		addOperatorOriginal = OperatorAppearance()
		multiplyOperatorOriginal = OperatorAppearance()

		addOperatorOriginal.function = geometricSum
		multiplyOperatorOriginal.function = geometricProduct

		let operatorOriginals = [addOperatorOriginal,multiplyOperatorOriginal];
		var activeOperator = OperatorAppearance()

		for(let i = 0; i < operatorOriginals.length; ++i )
		{
			let o = operatorOriginals[i]

			o.material.color.setHex(discreteViridis[i].hex)

			o.position.y = -3.5
			o.position.x = (i - 0.5 * (operatorOriginals.length-1) ) * 2.
			scene.add(o)

			clickables.push(o)
			o.onClick = function()
			{
				activeOperator.material.color.copy(this.material.color)
				activeOperator.position.copy(o.position)
				activeOperator.function = o.function
				scene.add(activeOperator)
			}
		}
	}

	{
		let goal = new THREE.Object3D()
		scene.add(goal)
		goal.position.x = -camera.rightAtZZero + 1.4

		let goalSign = makeTextSign("Make this:")
		goalSign.scale.multiplyScalar(.5)
		goalSign.position.y = .9
		goal.add(goalSign)

		let background = new THREE.Mesh(new THREE.PlaneGeometry(1.,1.),new THREE.MeshBasicMaterial({color:0x000000}))
		background.scale.set(goalSign.scale.x*1.1,goalSign.scale.y*4.3,1.)
		background.position.z -= .001
		background.position.y += .18
		goal.add(background)

		let goalElements = new Float32Array(8)
		goalElements[1] = 1.
		goalElements[2] = 1.
		var goalMultivector = MultivectorAppearance(function(){},goalElements)
		goal.add(goalMultivector)
	}

	{
		var functionRegisters = Array(2)
		functionRegisters[0] = new THREE.Vector3(0.,1.,0.)
		functionRegisters[1] = new THREE.Vector3(1.,0.,0.)
	}

	let scopePosition = new THREE.Vector3()
	updateFunctions.push(function()
	{
		for(let i = 0; i < scope.length; i++ )
		{
			scopePosition.y = 4. - i;
			scopePosition.x = camera.rightAtZZero - 1.4
			scope[i].position.lerp(scopePosition,.1)
		}

		let ready = true

		let distanceRequirement = .03

		for(let i = 0; i < activeMultivectors.length; i++)
		{
			if(activeMultivectors[i].parent !== scene)
				ready = false
			else
			{
				activeMultivectors[i].position.lerp(functionRegisters[i],0.1)
				if( activeMultivectors[i].position.distanceTo(functionRegisters[i] ) > distanceRequirement )
					ready = false
			}
		}

		if( activeOperator.parent !== scene )
			ready = false
		else
		{
			activeOperator.position.lerp(zeroVector,0.1)
			if( activeOperator.position.distanceTo(zeroVector ) > distanceRequirement )
				ready = false
		}

		if(!ready)
			return

		let newMultivector = MultivectorAppearance(scopeOnClick)
		clickables.push(newMultivector)
		activeOperator.function(
			activeMultivectors[0].elements,
			activeMultivectors[1].elements,
			newMultivector.elements)
		newMultivector.updateAppearance()

		scene.remove(activeMultivectors[0],activeMultivectors[1],activeOperator)
		scene.add(newMultivector)
		log(newMultivector.elements)

		let identical = true
		for(let i = 0; i < 8; i++)
		{
			if(Math.abs(goalMultivector.elements[i]-newMultivector.elements[i]) > .01)
				identical = false
		}
		if(identical)
		{
			let winSign = makeTextSign("You win!!!")
			winSign.scale.multiplyScalar(.5)
			winSign.position.y = 2;
			scene.add(winSign)
		}
		else
		{
			scope.push(newMultivector)
		}



















		return;

		// multivectors[1].updateVectorAppearance(new THREE.Vector3(.4,0,0).applyAxisAngle(zUnit,
		// 	.9//frameCount*.01
		// 	))

		if(mouse.clicking && mouse.lastClickedObject === null)
		{
			for(let i = 0; i < multivectors.length; i++)
			{
				multivectors[i].position.add(mouse.zZeroPosition).sub(mouse.oldZZeroPosition)
			}
			for(let i = 0; i < operatorSymbols.length; i++)
			{
				operatorSymbols[i].position.add(mouse.zZeroPosition).sub(mouse.oldZZeroPosition)
			}

			return
		}

		let multivec = null
		for(let i = 0; i < multivectors.length; i++)
		{
			if( (mouse.clicking||mouse.oldClicking) && multivectors[i].children.indexOf(mouse.lastClickedObject) !== -1 )
			{
				multivec = multivectors[i]
			}
		}
		if(multivec === null)
			return

		multivec.position.add(mouse.zZeroPosition).sub(mouse.oldZZeroPosition)

		let closestObject = null
		let p = new THREE.Vector3()
		for(let i = 0; i < multivectors.length + otherThingToCheckDistanceTo.length; i++)
		{
			let thingToCheckDistanceTo = i < multivectors.length ? multivectors[i] : otherThingToCheckDistanceTo[i-multivectors.length]
			if( thingToCheckDistanceTo === multivec || thingToCheckDistanceTo === multivec.root)
				continue

			//no, don't want to check the ones we come from
			let dist = thingToCheckDistanceTo.getWorldPosition(p).distanceTo(multivec.position)

			if( (closestObject === null || dist < closestObject.position.distanceTo(multivec.position) ) )
			{
				closestObject = thingToCheckDistanceTo
			}
		}

		scene.remove(operatorSymbolForConsidering)

		if( multivectors.indexOf(closestObject) === -1 )
		{
			if(!mouse.clicking)
			{
				closestObject.position.x = multivec.elements[1]
				closestObject.position.y = multivec.elements[2]
				log(closestObject.position)

				scene.remove(multivec) //TODO and destroy
				scene.remove(multivec.connector)
				removeSingleElementFromArray(multivectors,multivec)

				Connector(closestObject,multivec.root)

				return;
			}
		}
		else
		{
			let multivectorToOperateOn = closestObject
			let placeWeWouldGo = multivectorToOperateOn.position.clone()
			placeWeWouldGo.x += 1.
			placeWeWouldGo.y -= 1.
			let dist = placeWeWouldGo.distanceTo(multivec.position)

			let operations = ["add","leftMultiply"] //wanna left multiply? move the other one
			let distances = [.5,.7]
			let operationIndex = -1

			for(let i = operations.length-1; i >= 0; --i)
			{
				if(dist < distances[i])
					operationIndex = i
			}

			if(operationIndex !== -1)
			{
				scene.add(operatorSymbolForConsidering)
				operatorSymbolForConsidering.position.copy(multivectorToOperateOn.position)
				operatorSymbolForConsidering.material.color.setHex(discreteViridis[operationIndex].hex)
				// operatorSymbolForConsidering.position.x += clearance;

				if(!mouse.clicking)
				{
					let newOperatorSymbol = OperatorAppearance()
					newOperatorSymbol.position.copy(operatorSymbolForConsidering.position)
					newOperatorSymbol.material.color.copy(operatorSymbolForConsidering.material.color)
					scene.remove(operatorSymbolForConsidering)
					scene.add(newOperatorSymbol)

					multivec.position.copy(multivectorToOperateOn.position)
					multivec.position.x += 1.;
					multivec.position.y -= 1.;

					//------

					let result = Multivector()
					multivectors.push(result)

					if(operationIndex === operations.indexOf("add"))
						result.addMultivectors(multivectorToOperateOn, multivec)
					if(operationIndex === operations.indexOf("multiply"))
						result.geometricProductMultivectors(multivec, multivectorToOperateOn)

					result.position.copy( multivectorToOperateOn.position )
					result.position.y -= 2.;
					scene.add(result)

					//play animation

					return;
				}
			}
		}
	})
}