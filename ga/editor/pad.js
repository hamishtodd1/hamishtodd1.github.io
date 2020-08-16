/* 

	Is the location of the carat the place it has exectued up to? Maybe the preview window is dependent on where it is?
		reverse polish might be pretty good. You see this thing, that thing, now they're in the same coord system, THEN some shit happens
		Could at least have a mode that enables this
		reduced and replaced with their actual values
		Has the benefit of showing you the top of the stack, because the lines get collapsed away
		Which is a good way of having selective visibility
		Hmm, and cache coherence
		could highlight whatever's in the stack where your carat is
		Maybe when the carat is at the place where a = b - c, 
		The little cartoon character buzzes around the preview window, animates the line you're on
		But you see the result of everything anyway
        
	Language symbols
		capital sigma (931), Parallel, orthogonal?. Still got £$%^
		exponentiation/log/radical/triangle of power
		can't you find something that reflects that integration is differentiation backwards?
		for all? There exists? Would you need that? proportional?
		Angle brackets ("the part of the mv that has this grade")
		dagger, conjugate, hat, reverse, sigh
		11*11*11 = 8 outputs (pictures) not in decimal, why should inputs be?
		{} for making a new mv?
		if you have arrays and functions and recursion you have summation:
			function sumArrayElementsBelowIndex(arr, index) { return index < 0 ? 0 : arr[index] + sumArrayElementsBelowIndex(arr, index - 1) }
		arrays might be nice (you don't have integers though?) but you're still unsure of them and can show in abacus
            Is an array always ok to think of as a function mapping from natural numbers to things?
            Maybe a continuous mapping that you just happen to have stored a bunch of results of
            Hmm, maybe continuous-everywhere is a good idea? requires sigma -> integral
		https://en.wikipedia.org/wiki/List_of_common_physics_notations

	Colors
        string of color codes = multivector, possibly a new one, initialized to random
        + / *
        lambda a b c . [function body]
        string of letters = function name
	    you are expecting function, variable, variable. Get anything else? Ignore the line
        Colorblindness
            https://www.reddit.com/r/ColorBlind/comments/hjw6ie/i_am_making_a_game_and_i_want_to_use_a_large/
            https://personal.sron.nl/~pault/
            viridis folks https://www.youtube.com/watch?v=xAoljeRJ3lU
			mark brown https://www.youtube.com/watch?v=xrqdU4cZaLw

	Temporary:
	a ?auburn (red)
	b ?black blue? brown
	c cyan (blue)
	d
	e ?emerald (green)
	f ?fuscia (purple)
	g green gray
	h
	i ?indigo (purple)
	j
	k
	l ?lilac ?lemon
	m magenta (technical people should know. Colorblindness though. But so many will call it purple)
	n
	o orange
	p pink ("fuck purple") purple
	q
	r red
	s
	t turquoise or teal. People just call it blue or green
	u ultramarine
	v ?violet ?viridian
	w white
	x x axis
	y y axis yellow? cream? lemon?
	z z axis

	w, b, m, c, r, o, g, p

	x,y,z
*/

async function initPad()
{
	let stack = []

	let spaceWidth = 1. / 3.

	let VariableAppearance = MultivectorAppearance
	let copyVariable = copyMultivector

	let variables = [] //all in the pad
	for(let i = 0; i < 59; ++i)
	{
		let variable = VariableAppearance()
		variables.push(variable)
		pad.add(variable)
	}
	function getVariableWithName(name)
	{
		for (let i = 0, il = variables.length; i < il; i++)
			if (checkAnagram(name, variables[i].name))
				return variables[i]

		return null
	}
	//use one unassigned and it'll have random values.
	function assignNamedVariable(name,vec)
	{
		let variable = getVariableWithName(name)
		if (variable === null)
			console.error("unrecognized variable name: ", name)
		copyVariable(vec, variable.elements)
	}
	//could have something different, say [1,0,0] in the code that turns these into things
	//well of course that's the idea of the drawing in coord thing

	let outlines = initOutlines()

	let carat = new THREE.Mesh(new THREE.PlaneBufferGeometry(1.,1.), new THREE.MeshBasicMaterial({ color: 0xF8F8F0 }))
	carat.positionInString = -1
	initCaratAndNavigation(carat)

	let maxCopiesOfALetter = 256
	let characters = initTypeableCharacters(carat, maxCopiesOfALetter)
	let operationDictionary = {}
	{
		characters.add("+")
		operationDictionary["+"] = geometricSum

		let asteriskOperatorCharacter = String.fromCharCode("8727")
		characters.add(asteriskOperatorCharacter, "*")
		operationDictionary[asteriskOperatorCharacter] = geometricProduct

		let lambdaCharacter = String.fromCharCode("955") //you CAN write "function", but lots of kids don't know "function". In python it's "def"
		characters.add(lambdaCharacter, "#")

		let nablaCharacter = String.fromCharCode("8711")
		characters.add(nablaCharacter, "@")
		let integralCharacter = String.fromCharCode("8747")
		characters.add(integralCharacter, "~")
		let deltaCharacter = String.fromCharCode("948")
		characters.add(deltaCharacter, "?")

		//more marginal
		let wedgeCharacter = String.fromCharCode("8743")
		characters.add(wedgeCharacter, "^")
		let descendingWedgeCharacter = String.fromCharCode("8744")
		characters.add(descendingWedgeCharacter, "&") // for exponentiate: **? For log, //?

		backgroundString += lambdaCharacter+nablaCharacter+integralCharacter+deltaCharacter+wedgeCharacter+descendingWedgeCharacter

		//./=+!:{}
	}

	let tokenCharactersLeft = 0
	let drawCharacters = true
	let drawingPosition = new THREE.Vector3()
	let positionInStringClosestToCaratPosition = -1
	let positionInStringClosestToCaratPositionVector = new THREE.Vector3()
	updateFunctions.push(function ()
	{
		if (mouse.clicking && !mouse.oldClicking)
		{
			mouse.getZZeroPosition(v1)
			pad.worldToLocal(v1)
			carat.teleport(v1.x, v1.y)
		}
		positionInStringClosestToCaratPositionVector.set(Infinity, Infinity, 0.)

		assignNamedVariable(colorCharacters[0], xUnit)
		assignNamedVariable(colorCharacters[1], yUnit)
		assignNamedVariable(colorCharacters[2], zUnit)
		let lowestUndeterminedVariable = 3
		for (let i = 0, il = variables.length; i < il; i++)
			variables[i].count = 0

		for (let i = 0; i < outlines.length; ++i)
			outlines[i].visible = false
		let lowestUnusedOutline = 0
		//could just have it done as part of drawing multivector
		function drawOutline(x,y)
		{
			outlines[lowestUnusedOutline].visible = true
			outlines[lowestUnusedOutline].position.set(x,y,0.)
			++lowestUnusedOutline
			console.assert( lowestUnusedOutline < outlines.length )
		}

		let lowestUnusedDisplayWindow = 0
		for (let i = 0; i < displayWindows.length; i++)
			displayWindows[i].screen.bottomY = camera.topAtZZero

		for (let i = 0, il = characters.array.length; i < il; i++)
			characters.instancedMeshes[characters.array[i]].count = 0
			
		let yPositionOfVerticalCenterOfTopLine = -.5
		drawingPosition.set(0., yPositionOfVerticalCenterOfTopLine, 0.)
		let backgroundStringLength = backgroundString.length
		for(let drawingPositionInString = 0; drawingPositionInString <= backgroundStringLength; ++drawingPositionInString)
		{
			if (carat.positionInString !== -1 && drawingPositionInString === carat.positionInString )
			{
				if (carat.position.x !== drawingPosition.x || carat.position.y !== drawingPosition.y)
					carat.flashingStart = clock.getElapsedTime()
				carat.position.set(drawingPosition.x, drawingPosition.y, carat.position.z)
			}
			if (carat.positionInString === -1)
			{
				let closestYDist = Math.abs(positionInStringClosestToCaratPositionVector.y - carat.position.y)
				let closestXDist = Math.abs(positionInStringClosestToCaratPositionVector.x - carat.position.x)
				let drawingYDist = Math.abs(drawingPosition.y - carat.position.y)
				let drawingXDist = Math.abs(drawingPosition.x - carat.position.x)
				if ( drawingYDist < closestYDist || (drawingYDist === closestYDist && drawingXDist < closestXDist) )
				{
					positionInStringClosestToCaratPosition = drawingPositionInString
					positionInStringClosestToCaratPositionVector.copy(drawingPosition)
				}
			}
			if (drawingPositionInString >= backgroundStringLength)
				break

			let currentCharacter = backgroundString[drawingPositionInString]

			if(tokenCharactersLeft <= 0)
			{
				drawCharacters = true

				if (operationDictionary[currentCharacter] !== undefined)
				{
					stack.push(operationDictionary[currentCharacter])
					tokenCharactersLeft = 1
				}
				else if (colorCharacters.indexOf(currentCharacter) !== -1)
				{
					let maxNameLength = 1. / spaceWidth
					
					let name = ""
					// debugger

					let addToName = true
					for (let i = 0; i < maxNameLength && drawingPositionInString + i < backgroundStringLength; ++i)
					{
						let character = backgroundString[drawingPositionInString + i]
						if (colorCharacters.indexOf(character) === -1)
							addToName = false
							
						if (addToName)
							name += character
						else if (character !== " " && carat.positionInString !== drawingPositionInString + i)
						{
							backgroundString = backgroundString.substring(0, drawingPositionInString + i) + " " + backgroundString.substring(drawingPositionInString + i)
							if(carat.positionInString >= drawingPositionInString+i)
								++carat.positionInString
						} 
					}
					tokenCharactersLeft = name.length

					let mv = getVariableWithName(name)
					// debugger
					if (mv === null)
					{
						//new name?
					}
					else
					{
						stack.push(mv)
						let caratInName = drawingPositionInString < carat.positionInString && carat.positionInString <= drawingPositionInString + name.length
						if (!caratInName)
						{
							mv.drawInPlace(drawingPosition.x + .5, drawingPosition.y)
							drawOutline(drawingPosition.x + .5, drawingPosition.y)
							drawCharacters = false
						}
					}
				}
				else if ( backgroundString.substring(drawingPositionInString, drawingPositionInString + 7) === "display" )
				{
					v1.copy(drawingPosition)
					v1.y -= .5
					let lineBottomYWorld = pad.localToWorld(v1).y
					let maxHeight = 2. * getDisplayColumnWidth()
					if (maxHeight > pad.position.y - lineBottomYWorld)
						maxHeight = pad.position.y - lineBottomYWorld
					if (-camera.topAtZZero < lineBottomYWorld + maxHeight && lineBottomYWorld < camera.topAtZZero)
					{
						if (lowestUnusedDisplayWindow >= displayWindows.length)
							DisplayWindow()

						let dw = displayWindows[lowestUnusedDisplayWindow]
						dw.screen.bottomY = lineBottomYWorld

						dw.screen.scale.y = maxHeight
						let paddingBetweenDws = .1 * getWorldLineHeight()
						for (let i = 0; i < lowestUnusedDisplayWindow; i++)
						{
							if (dw.screen.scale.y > displayWindows[i].screen.bottomY - lineBottomYWorld)
								dw.screen.scale.y = displayWindows[i].screen.bottomY - lineBottomYWorld - paddingBetweenDws
						}

						++lowestUnusedDisplayWindow
					}
					
					tokenCharactersLeft = "display".length
				}
			}

			//individual characters
			if (currentCharacter === "\n")
			{
				if (stack.length >= 3)
				{
					let operandsAndOperator = [stack.pop(), stack.pop(), stack.pop()]
					for (let i = 0; i < 3; i++)
					{
						if (typeof operandsAndOperator[i] === 'function' &&
							typeof operandsAndOperator[(i + 1) % 3] !== 'function' &&
							typeof operandsAndOperator[(i + 2) % 3] !== 'function')
						{
							let operator = operandsAndOperator[i]
							let operand1 = operandsAndOperator[i === 0 ? 1 : 0]
							let operand2 = operandsAndOperator[i === 2 ? 1 : 2]

							v2.copy(outputColumn.position)
							pad.worldToLocal(v2)
							v2.y = drawingPosition.y - 1. / 3.
							drawOutline(v2.x, v2.y)

							let mv = variables[lowestUndeterminedVariable]
							operator(operand1.elements, operand2.elements, mv.elements)
							mv.drawInPlace(v2.x, v2.y)
							stack.push(mv)
							++lowestUndeterminedVariable
						}
					}
				}
				stack.length = 0

				//also retroactively turn this line into a superimposed diagram? Unless carat is on it I guess

				drawingPosition.x = 0.
				drawingPosition.y -= 1.
			}
			else
			{
				if (currentCharacter !== " " && drawCharacters)
				{
					if (characters.array.indexOf(currentCharacter) === -1)
						console.warn("Uncaught character, there will just be a space: ", currentCharacter)
					else
					{
						characters.array.indexOf(currentCharacter) === -1

						let ilm = characters.instancedMeshes[currentCharacter]
						if (ilm.count >= maxCopiesOfALetter)
							console.error("too many copies of a letter!")

						m1.identity()
						m1.elements[0] = .4 * ilm.aspect //Width. Currently tweaked to make overlap of m rare. i looks shit
						//scale of the things is unrelated to how much space they get
						m1.elements[5] = m1.elements[0] / ilm.aspect
						m1.elements[12] = drawingPosition.x + spaceWidth / 2.
						m1.elements[13] = drawingPosition.y
						ilm.setMatrixAt(ilm.count, m1)
						ilm.instanceMatrix.needsUpdate = true
						++ilm.count
					}
				}

				drawingPosition.x += spaceWidth
				--tokenCharactersLeft
			}
		}

		if (carat.positionInString === -1)
		{
			carat.positionInString = positionInStringClosestToCaratPosition
			carat.position.copy(positionInStringClosestToCaratPositionVector)
		}

		//the last line of the pad can be just above the top of the screen, no higher
		{
			v1.copy(drawingPosition)
			v1.y -= 1.
			pad.localToWorld(v1)
			if (v1.y > camera.topAtZZero)
				pad.position.y -= v1.y - camera.topAtZZero
		}
	})
}

function initCaratAndNavigation(carat)
{
	carat.renderOrder = Infinity
	carat.material.depthTest = false
	carat.geometry.translate(.5, 0., 0.)
	pad.add(carat)
	carat.scale.x = .1
	carat.flashingStart = 0.
	updateFunctions.push(() => 
	{
		carat.visible = Math.floor((clock.getElapsedTime() - carat.flashingStart) * 2.) % 2 ? false : true
	})
	carat.teleport = function(x, y)
	{
		carat.position.set(x, y, carat.position.z)
		carat.flashingStart = clock.getElapsedTime()
		carat.positionInString = -1
	}
	carat.addToPosition = function(x, y)
	{
		carat.teleport(
			carat.position.x + x,
			carat.position.y + y)
	}
	carat.moveAlongString = function(amount)
	{
		carat.positionInString = clamp(carat.positionInString + amount, 0, backgroundString.length)
	}
	bindButton("ArrowRight", () => carat.moveAlongString(1))
	bindButton("ArrowLeft", () => carat.moveAlongString(-1))

	bindButton("ArrowUp", () => carat.addToPosition(0., 1.))
	bindButton("ArrowDown", () => carat.addToPosition(0., -1.))
	bindButton("Home", () => carat.addToPosition(-999., 0.))
	bindButton("End", () => carat.addToPosition(999., 0.))

	//TODO scrolling down too
	function getNumLinesOnScreen() {
		return camera.topAtZZero * 2. / getWorldLineHeight()
	}
	bindButton("PageUp", () => {
		carat.addToPosition(0., Math.floor(getNumLinesOnScreen()))
	})
	bindButton("PageDown", () => {
		carat.addToPosition(0., -Math.floor(getNumLinesOnScreen()))
	})
}

function initTypeableCharacters(carat,maxCopiesOfALetter)
{
	let characters = {
		array: "",
		instancedMeshes:{}
	}
	function addCharacter(character)
	{
		backgroundString = backgroundString.substring(0, carat.positionInString) + character + backgroundString.substring(carat.positionInString, backgroundString.length)
		carat.moveAlongString(1)
	}
	characters.add = function(character, pressedKeyboardCharacter)
	{
		let material = text(character, true)

		characters.instancedMeshes[character] = new THREE.InstancedMesh(unchangingUnitSquareGeometry, material, maxCopiesOfALetter);
		characters.instancedMeshes[character].count = 0
		pad.add(characters.instancedMeshes[character])
		characters.instancedMeshes[character].aspect = material.getAspect()

		if (pressedKeyboardCharacter === undefined)
			pressedKeyboardCharacter = character
		
		characters.array += character

		bindButton(pressedKeyboardCharacter, () => addCharacter(character))
	}
	let initialCharacters = "abcdefghijklmnopqrstuvwxyz "
	for (let i = 0; i < initialCharacters.length; i++)
		characters.add(initialCharacters[i])

	bindButton("Delete", () =>
	{
		if (carat.positionInString < backgroundString.length)
			backgroundString = backgroundString.substring(0, carat.positionInString) + backgroundString.substring(carat.positionInString + 1, backgroundString.length)
	})
	bindButton("Backspace", () =>
	{
		if (carat.positionInString !== 0)
		{
			backgroundString = backgroundString.substring(0, carat.positionInString - 1) + backgroundString.substring(carat.positionInString, backgroundString.length)
			carat.moveAlongString(-1)
		}
	})
	bindButton("Tab", () => { for (let i = 0; i < 4; i++) addCharacter(" ") })
	bindButton("Enter", () => addCharacter("\n"))

	return characters
}

function initOutlines()
{
	let outlineGeometry = new THREE.PlaneGeometry()
	let outlineMaterial = new THREE.LineBasicMaterial({ color: 0xFFFFFF })
	v1.copy(outlineGeometry.vertices[3])
	outlineGeometry.vertices[3].copy(outlineGeometry.vertices[2])
	outlineGeometry.vertices[2].copy(v1)

	let outlines = Array(256)
	for (let i = 0; i < outlines.length; ++i)
	{
		outlines[i] = new THREE.LineLoop(outlineGeometry, outlineMaterial)
		pad.add(outlines[i])
	}

	return outlines
}