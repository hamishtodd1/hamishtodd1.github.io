/* 
	The fastest anyone's typed is 6 characters per second, so in theory you only need to run through it all about that often

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
*/

function boxDraw(im, x, y, matrixToCopy, boundingSphereRadius) {
	m1.copy(matrixToCopy)
	let halfInverseBoundingSphereRadius = .5 / boundingSphereRadius
	m1.scale(v1.setScalar(halfInverseBoundingSphereRadius))
	m1.elements[12] += x
	m1.elements[13] += y
	im.setMatrixAt(im.count, m1)
	++im.count

	im.instanceMatrix.needsUpdate = true
}

async function initPad(characterMeshHeight)
{
	let stack = []

	let spaceWidth = 1. / 3.

	initNamesAndBasis()
	let outlineCollection = OutlineCollection()
	pad.add(outlineCollection)
	let pictogramWidthInCharacters = 3
	let maxVariableNameLength = pictogramWidthInCharacters

	function torusFunc(minorAngleT, majorAngleT, target)
	{
		let minorAngle = intervalToRadians(minorAngleT)
		let majorAngle = intervalToRadians(majorAngleT)

		let majorRadius = 1.
		let minorRadius = .2
		target.x = Math.cos(minorAngle) * (majorRadius + minorRadius * Math.cos(majorAngle))
		target.y = Math.sin(minorAngle) * (majorRadius + minorRadius * Math.cos(majorAngle))
		target.z = minorRadius * Math.sin(majorAngle)
	}
	let torusViz = FuncViz(torusFunc, 2, 3)

	let expFunc = (t1, t2, target) =>
	{
		//more twisted
		// let numTwists = 1.5
		// let angle = lerp(t1, 0., TAU * numTwists)
		// target.x = lerp(t2, -2., 1.) - angle * .07

		// let r = Math.exp(lerp(t2, -2., 1.))
		// target.y = Math.cos(angle) * r
		// target.z = Math.sin(angle) * r

		target.x = lerp(t1, -Math.sqrt(sq(Math.E) + 1.), 1.)
		let angle = lerp(t2, 0., TAU)

		let r = Math.exp(target.x)
		target.y = Math.cos(angle) * r
		target.z = Math.sin(angle) * r

	}
	let expViz = FuncViz(expFunc, 2, 3)
	//hmm, maybe the builtins don't need color?

	initCarat()

	let alphanumerics = "0123456789abcdefghijklmnopqrstuvwxyz"

	let maxCopiesOfALetter = 256
	let characters = initTypeableCharacters(carat, maxCopiesOfALetter)
	let functionDictionary = {}
	{
		characters.add("+")
		functionDictionary["+"] = gSum
		//hey, could visualize "+"" too, x+y = z
		//oh but that's a plane, how very dangerous

		let asteriskOperatorCharacter = String.fromCharCode("8727")
		characters.add("*", asteriskOperatorCharacter)
		functionDictionary["*"] = gProduct

		functionDictionary["exp"] = gExp
		functionDictionary["rev"] = reverse

		//so you want to take the inner product, i.e. curry . with an mv then product that with an mv. Does that work
		//does grade selection involve integers? Yeesh
		//"project on basis multivector"?

		// var tripleEqualsCharacter = String.fromCharCode("8801") //you CAN write "function", but lots of kids don't know "function". In python it's "def"
		//could have them be separate

		characters.add("=") 
		characters.add("(")
		characters.add(")")

		// var rhoCharacter = String.fromCharCode("961")

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
			extract an array of functions (gSum, gProduct) and indices of variables
		*/

		let mapCharacter = String.fromCharCode("8594")
		characters.add(">", mapCharacter)

		let nablaCharacter = String.fromCharCode("8711")
		characters.add("@",nablaCharacter)

		let deltaCharacter = String.fromCharCode("948")
		characters.add("?",deltaCharacter)

		//more marginal
		let wedgeCharacter = String.fromCharCode("8743")
		characters.add("^",wedgeCharacter)
		let descendingWedgeCharacter = String.fromCharCode("8744")
		characters.add("&", descendingWedgeCharacter) // for exponentiate: **? For log, //?

		// backgroundString += wedgeCharacter + descendingWedgeCharacter + deltaCharacter + nablaCharacter + "|"

		//./=+!:{}
	}

	let interimDisplayWindows = []
	let drawingPosition = new THREE.Vector3()
	let positionInStringClosestToCaratPosition = -1
	let positionInStringClosestToCaratPositionVector = new THREE.Vector3()
	let uncaughtCharacters = ""
	updateFunctions.push( () => {
		let drawingPositionInString = 0

		pad.position.x = outputColumn.right() + pad.scale.x
		let paddingAtTopOfPad = .35 * getWorldLineHeight()
		if (pad.position.y < camera.topAtZZero - paddingAtTopOfPad)
			pad.position.y = camera.topAtZZero - paddingAtTopOfPad

		positionInStringClosestToCaratPositionVector.set(Infinity, Infinity, 0.)

		namedMvs.forEach((v) => v.beginFrame()) //TODO only need those in the frame
		torusViz.beginFrame() //it is a variable. Its name is even meant to come from
		expViz.beginFrame()
		grabberIm.beginFrame()

		displayWindows.forEach((dw)=>{dw.beginFrame()})

		let lowestUnusedDisplayWindow = 0
		interimDisplayWindows.forEach((i) => { i.bottomY = camera.topAtZZero})

		for (let i = 0, il = characters.array.length; i < il; i++)
			characters.instancedMeshes[characters.array[i]].count = 0

		let drawCharacters = true
		let tokenCharactersLeft = 0

		let superimposePosition = new THREE.Vector2(Infinity,Infinity)

		let nextOrderedNameNumber = 0
		carat.nextOrderedNameNumber = 0
		function outputToColumn(result) {
			v1.copy(outputColumn.position)
			pad.worldToLocal(v1)
			v1.y = drawingPosition.y
			outlineCollection.draw(v1.x, v1.y, 1.)
			result.drawInPlace(v1.x, v1.y)

			if (carat.position.y === drawingPosition.y)
				mainDw.addToScene(result)
		}
			
		let yPositionOfVerticalCenterOfTopLine = -.5
		drawingPosition.set(0., yPositionOfVerticalCenterOfTopLine, 0.)
		let backgroundStringLength = backgroundString.length
		for(drawingPositionInString; drawingPositionInString <= backgroundStringLength; ++drawingPositionInString)
		{
			//carat position
			{
				if (carat.positionInString !== -1 && drawingPositionInString === carat.positionInString) {
					if (carat.position.x !== drawingPosition.x || carat.position.y !== drawingPosition.y)
						carat.flashingStart = clock.getElapsedTime()
					carat.position.set(drawingPosition.x, drawingPosition.y, carat.position.z)
				}
				
				if (carat.positionInString === -1) {
					let closestYDist = Math.abs(positionInStringClosestToCaratPositionVector.y - carat.position.y)
					let closestXDist = Math.abs(positionInStringClosestToCaratPositionVector.x - carat.position.x)
					let drawingYDist = Math.abs(drawingPosition.y - carat.position.y)
					let drawingXDist = Math.abs(drawingPosition.x - carat.position.x)
					if (drawingYDist < closestYDist || (drawingYDist === closestYDist && drawingXDist < closestXDist)) {
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
			else if (currentCharacter === "\n") {
				if (stack.length >= 3) {
					let operandsAndOperator = [stack.pop(), stack.pop(), stack.pop()]
					for (let i = 0; i < 3; i++) {
						if (typeof operandsAndOperator[i] === 'function' &&
							typeof operandsAndOperator[(i + 1) % 3] !== 'function' &&
							typeof operandsAndOperator[(i + 2) % 3] !== 'function')
						{
							let operator = operandsAndOperator[i]
							let operand1 = operandsAndOperator[i === 0 || i === 1 ? 2 : 1]
							let operand2 = operandsAndOperator[i === 2 || i === 1 ? 0 : 1]

							// o o1 o2 //0, 2, 1
							// o1 o o2 //1, 2, 0
							// o1 o2 o //2, 1, 0

							if(orderedNames[nextOrderedNameNumber] === undefined)
								debugger
							let result = getNamedMv(orderedNames[nextOrderedNameNumber])
							operator(operand1.elements, operand2.elements, result.elements)

							if (getGrade(operand1.elements) === 1 && getGrade(operand2.elements) === 1 )
								result.setScalarDirection(getVector(operand1.elements, v1))

							outputToColumn(result)

							/*
							Scalardirections
								exp of bivector: same as that bivector
								vectors a, b, ab -> scalar direction is a
							*/
						}
					}
				}
				else if(stack.length === 2) {
					let operandAndOperator = [stack.pop(), stack.pop()]
					let operator = typeof operandAndOperator[0] === "function" ? operandAndOperator[0] : operandAndOperator[1]
					let operand = typeof operandAndOperator[0] === "function" ? operandAndOperator[1] : operandAndOperator[0]
					if( typeof operator === "function" && operand.elements !== undefined ) {
						let result = getNamedMv(orderedNames[nextOrderedNameNumber])
						operator(operand.elements, result.elements)

						outputToColumn(result)
					}
				}
				stack.length = 0

				//also retroactively turn this line into a superimposed diagram? Unless carat is on it I guess

				drawingPosition.x = 0.
				drawingPosition.y -= 1.

				++nextOrderedNameNumber
				if (carat.positionInString > drawingPositionInString) //possibly >=
					carat.nextOrderedNameNumber = nextOrderedNameNumber

				superimposePosition.set(Infinity, Infinity)
			}
			else
			{
				if (tokenCharactersLeft <= 0) {
					drawCharacters = true

					let token = ""
					if (functionDictionary[currentCharacter]!==undefined)
						token = currentCharacter //currently all reserved symbols are functions
					else if(currentCharacter === "[" ) { //variable length token whose characters are skipped over
						let target = getNamedMv(orderedNames[nextOrderedNameNumber])
						parseMv(drawingPositionInString,target.elements)
						stack.push(target)

						target.drawInPlace(drawingPosition.x + .5, drawingPosition.y)
						outlineCollection.draw(drawingPosition.x + .5, drawingPosition.y, 1.)
						//a different colored outline? Well, outlines may be used for names

						if (carat.position.y === drawingPosition.y ) {
							mainDw.addToScene(target)
							if (target.name !== "b" && target.name !== "g" && target.name !== "o")
								mainDw.setGrabbablePosition(target,drawingPositionInString)
						}

						//that you can do this means you can skip over letters in other places. It's like tabs instead of spaces
						while(backgroundString[drawingPositionInString] !== "]")
							++drawingPositionInString
						drawingPosition.x += 1.

						++nextOrderedNameNumber
						if (carat.positionInString > drawingPositionInString) //>=?
							carat.nextOrderedNameNumber = nextOrderedNameNumber
						continue
					}
					else {
						let maxTokenLength = 64
						for ( let numSymbolsInToken = 0;
							drawingPositionInString + numSymbolsInToken < backgroundStringLength &&
							numSymbolsInToken < maxTokenLength &&
							backgroundString[drawingPositionInString + numSymbolsInToken] !== " " && 
							backgroundString[drawingPositionInString + numSymbolsInToken] !== "\n" &&
							alphanumerics.indexOf(backgroundString[drawingPositionInString + numSymbolsInToken]) !== -1;
							++numSymbolsInToken)
							token += backgroundString[drawingPositionInString + numSymbolsInToken]
					}
					tokenCharactersLeft = token.length

					////////////////////////////////////////
					//      TOKEN HAS BEEN OBTAINED
					////////////////////////////////////////

					if (functionDictionary[token] !== undefined) {
						stack.push(functionDictionary[token])

						//more that you evaluate the function here

						//if you're on the line you see all the operations split up into mvs and symbols
						//if you have more than one function on a line, and your carat isn't on it, could do the superimposing a little bit

						if(token === "exp") {
							expViz.drawInPlace(drawingPosition.x + .5, drawingPosition.y)
							outlineCollection.draw(drawingPosition.x + .5, drawingPosition.y, 1.)

							if (carat.position.y === drawingPosition.y)
								mainDw.addToScene(expViz)

							drawCharacters = false
						}
					}
					else if (token === "tor") {
						torusViz.drawInPlace(drawingPosition.x + .5, drawingPosition.y)
						outlineCollection.draw(drawingPosition.x + .5, drawingPosition.y, 1.)

						if (carat.position.y === drawingPosition.y)
							mainDw.addToScene(torusViz)

						drawCharacters = false

						//the below needs to be a separate function applicable to this
					}
					else if (token === "display") {
						v1.copy(drawingPosition)
						v1.y -= .5
						let lineBottomYWorld = pad.localToWorld(v1).y
						let maxHeight = 2. * getDisplayColumnWidth()
						if (maxHeight > pad.position.y - lineBottomYWorld)
							maxHeight = pad.position.y - lineBottomYWorld
						if (-camera.topAtZZero < lineBottomYWorld + maxHeight && lineBottomYWorld < camera.topAtZZero) {

							if (lowestUnusedDisplayWindow >= interimDisplayWindows.length)
								interimDisplayWindows.push(DisplayWindow())

							let dw = interimDisplayWindows[lowestUnusedDisplayWindow]
							dw.bottomY = lineBottomYWorld

							dw.scale.y = dw.scale.x
							// dw.scale.y = maxHeight
							// let paddingBetweenDws = .1 * getWorldLineHeight()
							// for (let i = 0; i < lowestUnusedDisplayWindow; i++) {
							// 	if (dw.scale.y > interimDisplayWindows[i].bottomY - lineBottomYWorld)
							// 		dw.scale.y = interimDisplayWindows[i].bottomY - lineBottomYWorld - paddingBetweenDws
							// }

							++lowestUnusedDisplayWindow
						}

						tokenCharactersLeft = "display".length
					}
					else if (getNamedMv(token) !== null) {
						for (let i = token.length; 
							i < maxVariableNameLength && 
							drawingPositionInString + i < backgroundStringLength && 
							carat.positionInString !== drawingPositionInString + i;
							++i)
						{
							if ( backgroundString[drawingPositionInString + i] !== " " ) {
								backgroundString = backgroundString.substring(0, drawingPositionInString + i) + " " + backgroundString.substring(drawingPositionInString + i)
								backgroundStringLength = backgroundString.length
								if (carat.positionInString >= drawingPositionInString + i)
									++carat.positionInString
							}
						}

						let mv = getNamedMv(token)
						stack.push(mv)

						if (carat.position.y === drawingPosition.y)
							mainDw.addToScene(mv)

						let caratInName = drawingPositionInString < carat.positionInString && carat.positionInString <= drawingPositionInString + token.length
						if (!caratInName) {
							if (superimposePosition.x === Infinity && superimposePosition.y === Infinity ) {
								superimposePosition.x = drawingPosition.x + .5
								superimposePosition.y = drawingPosition.y
							}

							// if (carat.position.y !== drawingPosition.y )
							// {
							// 	mv.drawInPlace(superimposePosition.x, superimposePosition.y)
							// 	outlineCollection.draw(superimposePosition.x, superimposePosition.y, 1.)
							// }
							// else
							{
								mv.drawInPlace(drawingPosition.x + .5, drawingPosition.y)
								outlineCollection.draw(drawingPosition.x + .5, drawingPosition.y, 1.)
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

		carat.lineNumber = Math.floor(-carat.position.y)

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