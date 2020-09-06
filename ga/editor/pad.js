/* 
	Add reverse

	Is the location of the carat the place it has exectued up to? Maybe the preview window is dependent on where it is?
		But you see the result of everything anyway. So no, it should just be where you get the thing that's in the carat-associated displayWindow
		reverse polish might be pretty good. You see this thing, that thing, now they're in the same coord system, THEN some shit happens
		Could at least have a mode that enables this
		reduced and replaced with their actual values
		Has the benefit of showing you the top of the stack, because the lines get collapsed away
		Which is a good way of having selective visibility
		Hmm, and cache coherence
		could highlight whatever's in the stack where your carat is
		Maybe when the carat is at the place where a = b - c, 
		The little cartoon character buzzes around the preview window, animates the line you're on
		We ask computers to remember so many things; we have so many variables in our text files; that's why you need caches
			Make it so they can relax; make it so that the memory that's in cache is all you can see. So that it's just above where your carat is

	Click the things in the column, what happens?
        They appear in the window?
        Hovering shows the name, you can edit
        When you right click them, context menu:
            "Copy name"
            "Change name" (changes colors?)
            "Paste at carat"
            "change representation"
        
	Language symbols
		capital sigma (931), Parallel, orthogonal?. Still got £$%^
		exponentiation/log/radical/triangle of power
		can't you find something that reflects that integration is differentiation backwards?
		for all? There exists? Would you need that? proportional?
		Angle brackets ("the part of the mv that has this grade")
		dagger, conjugate, hat, reverse, sigh
		11*11*11 = 8 outputs (pictures) not in decimal, why should inputs be?
		{} for making a new mv?
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

async function initPad(characterMeshHeight)
{
	let stack = []

	let spaceWidth = 1. / 3.

	let VariableAppearance = () =>
	{
		let mv = MultivectorAppearance()
		variables.push(mv)
		pad.add(mv)
		return mv
	}
	let copyVariable = copyMultivector

	initCaratAndNavigation()

	for(let i = 0; i < 63; i++)
		VariableAppearance()
	let pictogramWidthInCharacters = 3
	let outlines = initOutlines(pictogramWidthInCharacters * spaceWidth)
	let maxVariableNameLength = pictogramWidthInCharacters
	function getVariableWithName(name)
	{
		for (let i = 0, il = variables.length; i < il; i++)
			if (checkAnagram(name, variables[i].name))
				return variables[i]

		return null
	}

	copyVariable(xUnit,variables[0].elements)
	copyVariable(yUnit,variables[1].elements)
	copyVariable(zUnit,variables[2].elements)
	copyVariable(new THREE.Vector3(-1., 0., 0.),variables[3].elements)
	variables[4].elements[7] = 2.
	variables[5].elements[4] = 1.5
	numFreeParameterMultivectors = 6

	initMainDw()

	let maxCopiesOfALetter = 256
	let characters = initTypeableCharacters(carat, maxCopiesOfALetter)
	let functionDictionary = {}
	{
		characters.add("+")
		functionDictionary["+"] = geometricSum

		let asteriskOperatorCharacter = String.fromCharCode("8727")
		characters.add("*", asteriskOperatorCharacter)
		functionDictionary["*"] = geometricProduct

		// var tripleEqualsCharacter = String.fromCharCode("8801") //you CAN write "function", but lots of kids don't know "function". In python it's "def"
		//could have them be separate

		characters.add("=") 
		characters.add("(")
		characters.add(")")

		var lambdaCharacter = String.fromCharCode("955") //you CAN write "function", but lots of kids don't know "function". In python it's "def"
		characters.add("#", lambdaCharacter)
		// functionDictionary[lambdaCharacter] = defineFunction
		/*
			Name
			you have your arguments.
				You can choose how many
				Names chosen for you
				You can grab and edit the example values
			use indents to say what's part of the function
				Is there a way to know when the function ends from looking at the stack? Probably not
				Whatever's at the bottom is the return value
			extract an array of functions (geometricSum, geometricProduct) and indices of variables
		*/

		let nablaCharacter = String.fromCharCode("8711")
		characters.add("@",nablaCharacter)

		let deltaCharacter = String.fromCharCode("948")
		characters.add("?",deltaCharacter)

		//more marginal
		let wedgeCharacter = String.fromCharCode("8743")
		characters.add("^",wedgeCharacter)
		let descendingWedgeCharacter = String.fromCharCode("8744")
		characters.add("&", descendingWedgeCharacter) // for exponentiate: **? For log, //?

		backgroundString += wedgeCharacter + descendingWedgeCharacter + deltaCharacter + nablaCharacter+"~"

		//./=+!:{}
	}

	let interimDisplayWindows = []
	let drawingPosition = new THREE.Vector3()
	let positionInStringClosestToCaratPosition = -1
	let positionInStringClosestToCaratPositionVector = new THREE.Vector3()
	let uncaughtCharacters = ""
	onClicks.push({
		z: () => mouse.areaIn() === "pad" ? 0. : -Infinity,
		start: () => {
			mouse.getZZeroPosition(v1)
			pad.worldToLocal(v1)
			carat.teleport(v1.x, v1.y)
		}
	})
	updateFunctions.push(function ()
	{
		positionInStringClosestToCaratPositionVector.set(Infinity, Infinity, 0.)

		let lowestUndeterminedVariable = numFreeParameterMultivectors
		for (let i = 0, il = variables.length; i < il; i++)
			variables[i].resetCount()

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
		for (let i = 0; i < interimDisplayWindows.length; i++)
			interimDisplayWindows[i].bottomY = camera.topAtZZero

		for (let i = 0, il = characters.array.length; i < il; i++)
			characters.instancedMeshes[characters.array[i]].count = 0

		let drawCharacters = true
		let tokenCharactersLeft = 0

		let superimposePosition = new THREE.Vector2(Infinity,Infinity)
			
		let yPositionOfVerticalCenterOfTopLine = -.5
		drawingPosition.set(0., yPositionOfVerticalCenterOfTopLine, 0.)
		let backgroundStringLength = backgroundString.length
		for(let drawingPositionInString = 0; drawingPositionInString <= backgroundStringLength; ++drawingPositionInString)
		{
			//carat position
			{
				if (carat.positionInString !== -1 && drawingPositionInString === carat.positionInString)
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
					if (drawingYDist < closestYDist || (drawingYDist === closestYDist && drawingXDist < closestXDist))
					{
						positionInStringClosestToCaratPosition = drawingPositionInString
						positionInStringClosestToCaratPositionVector.copy(drawingPosition)
					}
				}
				if (drawingPositionInString >= backgroundStringLength)
					break
			}

			let currentCharacter = backgroundString[drawingPositionInString]

			if (currentCharacter === " ")
				drawingPosition.x += spaceWidth
			else if (currentCharacter === "\n")
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
							v2.y = drawingPosition.y //- 1. / 3.
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

				superimposePosition.set(Infinity, Infinity)
			}
			else
			{
				if (tokenCharactersLeft <= 0)
				{
					drawCharacters = true

					let maxTokenLength = 64
					let token = ""
					if (functionDictionary[currentCharacter]!==undefined)
						token = currentCharacter
					else {
						for ( let i = 0;
							i < maxTokenLength && backgroundString[drawingPositionInString + i] !== " " && 
							backgroundString[drawingPositionInString + i] !== "\n" &&
							drawingPositionInString + i < backgroundStringLength;
							++i)
							token += backgroundString[drawingPositionInString + i]
					}
					tokenCharactersLeft = token.length

					if (functionDictionary[token] !== undefined)
					{
						stack.push(functionDictionary[token])
						tokenCharactersLeft = 1

						//more that you evaluate the function here

						//if you're on the line you see all the operations split up into mvs and symbols
						//if you have more than one function on a line, and your carat isn't on it, could do the superimposing a little bit
					}
					else if (token === "display")
					{
						v1.copy(drawingPosition)
						v1.y -= .5
						let lineBottomYWorld = pad.localToWorld(v1).y
						let maxHeight = 2. * getDisplayColumnWidth()
						if (maxHeight > pad.position.y - lineBottomYWorld)
							maxHeight = pad.position.y - lineBottomYWorld
						if (-camera.topAtZZero < lineBottomYWorld + maxHeight && lineBottomYWorld < camera.topAtZZero)
						{
							if (lowestUnusedDisplayWindow >= interimDisplayWindows.length)
								interimDisplayWindows.push(DisplayWindow())

							let dw = interimDisplayWindows[lowestUnusedDisplayWindow]
							dw.bottomY = lineBottomYWorld

							dw.scale.y = maxHeight
							let paddingBetweenDws = .1 * getWorldLineHeight()
							for (let i = 0; i < lowestUnusedDisplayWindow; i++)
							{
								if (dw.scale.y > interimDisplayWindows[i].bottomY - lineBottomYWorld)
									dw.scale.y = interimDisplayWindows[i].bottomY - lineBottomYWorld - paddingBetweenDws
							}

							++lowestUnusedDisplayWindow
						}

						tokenCharactersLeft = "display".length
					}
					else if (getVariableWithName(token) !== null)
					{
						for (let i = token.length; 
							i < maxVariableNameLength && 
							drawingPositionInString + i < backgroundStringLength && 
							carat.positionInString !== drawingPositionInString + i;
							++i)
						{
							if ( backgroundString[drawingPositionInString + i] !== " " )
							{
								backgroundString = backgroundString.substring(0, drawingPositionInString + i) + " " + backgroundString.substring(drawingPositionInString + i)
								backgroundStringLength = backgroundString.length
								if (carat.positionInString >= drawingPositionInString + i)
									++carat.positionInString
							}
						}

						let mv = getVariableWithName(token)
						stack.push(mv)
						let caratInName = drawingPositionInString < carat.positionInString && carat.positionInString <= drawingPositionInString + token.length
						if (!caratInName)
						{
							if (superimposePosition.x === Infinity && superimposePosition.y === Infinity )
							{
								superimposePosition.x = drawingPosition.x + .5
								superimposePosition.y = drawingPosition.y
							}

							// if (carat.position.y !== drawingPosition.y )
							// {
							// 	mv.drawInPlace(superimposePosition.x, superimposePosition.y)
							// 	drawOutline(superimposePosition.x, superimposePosition.y)
							// }
							// else
							{
								mv.drawInPlace(drawingPosition.x + .5, drawingPosition.y)
								drawOutline(drawingPosition.x + .5, drawingPosition.y)
							}
							drawCharacters = false
						}
					}
					else //function definition is next. But undefined names are interesting
					{
						//reverse polish function definition? Take whatever's in the stack and... something?

						//the stack is a bunch of variable names and function names
						//if it's a terrible idea, who cares? You're making add ons with the editor features for more familiar contexts anyway
						//it can be an editor feature to highlight whatever's in the function you just made
						//ordinary lambda calculus you "swallow up whatever's to the right"
						//fuck "return", fuck }

						//ok so you're putting it at the end, looking back through the stack, finding the leaves on the tree
						//then you're taking the argument names that are specified and saying "the tree above actually comes from these"

						// def sq(x)
						// {
						// 	return x*x
						// }

						// sq(2)
						// sq(sq(3))
						// let a = 3;
						// sq(a)

						// x -> x*x

						// sq x -> x*x

						// x x * lambda

						// m sq m m * - //everything between the first new parameter and the = is local.
						//what if you want to declare a variable just before defining the function?

						//people don't like keeping track of the stack. But physicists do it

						//could put a box around the whole thing?

						//"always equals" symbol? Like, "for any multivectors and function names?"
						//you wanna write stuff like "a*(b+c) = a*b+a*c"

						//it's different for us because...
						//"=" is for omicron reduction and assignment is done with the column
						//things are also strange because when you have this "name replaced by picture" thing,
						//	if you've got the same name used for different things, scope/context-dependent...
						// 	Different scopes/contexts get their own display window
						//		some work that is usually done by syntax is done by "change input and see results immediately"
						//braces maybe aren't so bad. It's like they're making a line that evaluates to one thing
						//postfix is interesting though. It says "take the preceding but do something to its context"
						//we also have this "default value" thing everywhere for visualization purposes
						//we have this implicit = for what's in the output column
						//you also name things automatically, kinda like variables having indices
						//you get a visualization of what's in the stack with every line so you're more able to do things in a rpn way
						//hmm maybe polish notation is ok... if you reverse the whole thing?
						//"show this vector, show that vector, do a thing"

						//will you ever want to make an assertion that's only true for certain multivectors?


					// 	//it is a function. Potentially just a function that returns an mv but a function nonetheless

					// 	tokenCharactersLeft = 1
					// 	//a separate stack?
					// 	//and the next thing you'll encounter is the name
					// 	//could look ahead

					// 	if (backgroundString[drawingPositionInString + 1] === " ") //well what you need is lambda,space,name,then either { or arguments
					// 	{
					// 		//hang on why do you need lambda?
					// 	}
					// 	else
					// 	{
					// 		if (carat.position.y !== drawingPosition.y)
					// 		{
					// 			console.error("improperly defined function, breaking")
					// 			break; //who knows what this will do
					// 		}
					// 	}
					}
				}

				if ( drawCharacters )
				{
					if (characters.array.indexOf(currentCharacter) === -1 )
					{
						if (uncaughtCharacters.indexOf(currentCharacter) === -1)
						{
							console.warn("Uncaught character: ", currentCharacter)
							uncaughtCharacters += currentCharacter
						}
					}
					else
					{
						let ilm = characters.instancedMeshes[currentCharacter]
						if (ilm.count >= maxCopiesOfALetter)
							console.error("too many copies of a letter!")

						m1.identity()
						m1.elements[0] = characterMeshHeight * ilm.aspect //Width. Currently tweaked to make overlap of m rare. i looks shit
						//scale of the things is currently unrelated to how much space they get
						m1.elements[5] = characterMeshHeight
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

		for (let i = 0; i < lowestUnusedDisplayWindow; ++i)
		{
			interimDisplayWindows[i].scale.x = getDisplayColumnWidth()
			interimDisplayWindows[i].position.x = (-camera.rightAtZZero + outputColumn.left()) / 2.
		}
	})
}

function initCaratAndNavigation()
{
	carat.positionInString = -1

	carat.renderOrder = 9999999
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
	addStringAtCarat = function(str)
	{
		backgroundString = backgroundString.substring(0, carat.positionInString) + str + backgroundString.substring(carat.positionInString, backgroundString.length)
		carat.moveAlongString(str.length)
	}
	characters.add = function(character, displayedCharacter)
	{
		if (displayedCharacter === undefined)
			displayedCharacter = character

		let material = null
		if (character === "~") {
			material = new THREE.MeshBasicMaterial()
			new THREE.TextureLoader().load("data/integral.png", function (result) { material.map = result; material.needsUpdate = true} )
			material.getAspect = ()=>{return 1.}
		}
		else material = text(displayedCharacter, true)
		
		if(colors[character] !== undefined)
		{
			material.color.r = colors[character].r * .7 + .3
			material.color.g = colors[character].g * .7 + .3
			material.color.b = colors[character].b * .7 + .3
		}

		let instancedMesh = new THREE.InstancedMesh(unchangingUnitSquareGeometry, material, maxCopiesOfALetter);
		instancedMesh.count = 0
		pad.add(instancedMesh)
		instancedMesh.aspect = material.getAspect()

		characters.instancedMeshes[character] = instancedMesh
		characters.array += character
		if(displayedCharacter !== character)
		{
			characters.instancedMeshes[displayedCharacter] = instancedMesh
			characters.array += displayedCharacter
		}

		bindButton(character, () => addStringAtCarat(character))
	}
	let initialCharacters = "abcdefghijklmnopqrstuvwxyz ~"
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
	bindButton("Tab", () => { for (let i = 0; i < 2; i++) addStringAtCarat(" ") })
	bindButton("Enter", () => addStringAtCarat("\n"))

	return characters
}

function initOutlines(maxVariableNameLength)
{
	let outlineGeometry = new THREE.PlaneGeometry(maxVariableNameLength,1.)
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