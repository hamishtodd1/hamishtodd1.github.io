/* 
	Make the background close so you see the shadows and color it like text editor
	
	Language symbols
		exponentiation, log, radical, want triangle of power
		can't you find something that reflects that integration is differentiation backwards
		for all? There exists? Would you need that?
		proportional?
		Parallel, orthogonal?
        arrays might be nice (you don't have integers though?) but you're still unsure of them and can show in abacus
            Is an array always ok to think of as a function mapping from natural numbers to things?
            Maybe a continuous mapping that you just happen to have stored a bunch of results of
            Hmm, maybe continuous-everywhere is a good idea?
		Angle brackets ("the part of the mv that has this grade")
		dagger, conjugate hat
		11*11*11 = 8 outputs (pictures) not in decimal, why should inputs be?
		{} for making a new mv?
		if you have arrays and functions and recursion you have summation:
            function sumArrayElementsBelowIndex(arr, index) { return index < 0 ? 0 : arr[index] + sumArrayElementsBelowIndex(arr, index - 1) }
            
    Auto hide/show
		As you know from pwg, it is important to show and hide stuff, as it is with text
		Need to have an idea of scope that auto hides/shows. Maybe there are certain arrows that only appear when you reach out?
        windows could go offscreen when you scroll up
        
    Brackets
		You might say brackets are about control flow, but it's about order of operations too. They ain't so bad. Kids don't have to use them at first
		do you need if statements if you have sigmoid and tanh?
		Could have some vector in scope that always follows your mouse? Eh, better to have a grabbable tip. Humm, bootstrap
		Currying: instead of 2 you can have "the function that multiplies by 2" and "the function that adds 2". Does it matter?
		You may be tempted to make visualizations and animations for the other datatypes. Nice that you can but you probably shouldn'ts
		Fragment shaders are nice but fuck them for now, need to focus, do vertex shaders
		Vertex shaders are the special case where the input is any amount of crap and the output is specifically a vertex. Hmm, except for geometry
	
	Is the location of the carat the place it has exectued up to? Maybe the preview window is dependent on where it is?
		Maybe when the carat is at the place where a = b - c, 
        The little cartoon character buzzes around the preview window
        
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

	https://en.wikipedia.org/wiki/List_of_common_physics_notations

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

let backgroundString = "\n bog hey\nbog \n\n\n\n\n\n\n\n\n\n\n\n\ndisplay\na"
async function initPad()
{
	let spaceWidth = 1. / 3.

	let mvs = [] //the ones in the pad
	for(let i = 0; i < 59; ++i)
	{
		let mv = VectorAppearance()
		mvs.push(mv)
		pad.add(mv)
	}

	{
		let outlineGeometry = new THREE.PlaneGeometry()
		let outlineMaterial = new THREE.LineBasicMaterial({ color: 0xFFFFFF })
		v1.copy(outlineGeometry.vertices[3])
		outlineGeometry.vertices[3].copy(outlineGeometry.vertices[2])
		outlineGeometry.vertices[2].copy(v1)

		var outlines = Array(256)
		for(let i = 0; i < outlines.length; ++i)
		{
			outlines[i] = new THREE.LineLoop(outlineGeometry, outlineMaterial)
			pad.add(outlines[i])
		}
	}

	var carat = new THREE.Mesh(new THREE.PlaneBufferGeometry(1.,1.), new THREE.MeshBasicMaterial({ color: 0xF8F8F0 }))
	carat.positionInString = -1
	initCaratAndNavigation(carat)

	//typing
	let characters = "abcdefghijklmnopqrstuvwxyz /=*+!:{}"
	let alphanumerics = "abcdefghijklmnopqrstuvwxyz0123456789"
	let instancedLetterMeshes = {}
	let maxCopiesOfALetter = 256
	initTyping(carat,characters, instancedLetterMeshes, maxCopiesOfALetter)

	let tokenCharactersleft = 0

	let drawingPosition = new THREE.Vector3()
	let positionInStringClosestToCaratPosition = -1
	let positionInStringClosestToCaratPositionVector = new THREE.Vector3()
	updateFunctions.push(function ()
	{
		let yPositionOfVerticalCenterOfTopLine = -.5
		drawingPosition.set(0., yPositionOfVerticalCenterOfTopLine, 0.)
		let backgroundStringLength = backgroundString.length

		if (mouse.clicking && !mouse.oldClicking)
		{
			mouse.getZZeroPosition(v1)
			pad.worldToLocal(v1)
			carat.teleport(v1.x, v1.y)
		}

		for (let i = 0, il = characters.length; i < il; i++)
			instancedLetterMeshes[characters[i]].count = 0
		for (let i = 0, il = mvs.length; i < il; i++)
			mvs[i].count = 0
		for (let i = 0; i < outlines.length; ++i)
			outlines[i].visible = false
		let lowestInvisibleOutline = 0

		let lowestUnusedDisplayWindow = 0
		for (let i = 0; i < displayWindows.length; i++)
			displayWindows[i].screen.bottomY = camera.topAtZZero

		positionInStringClosestToCaratPositionVector.set(Infinity,Infinity,0.)

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

			if(tokenCharactersleft === 0)
			{
				if ( backgroundString[drawingPositionInString] === "\n" )
				{
					// mv.drawInPlace(drawingPosition)
					outlines[lowestInvisibleOutline].visible = true
					v1.copy(outputColumn.position)
					pad.worldToLocal(v1)
					outlines[lowestInvisibleOutline].position.x = v1.x
					outlines[lowestInvisibleOutline].position.y = drawingPosition.y
					++lowestInvisibleOutline

					//a line that's well-formed gets turned into a declaration

					//also, retro-actively turn this line into a diagram?

					drawingPosition.x = 0.
					drawingPosition.y -= 1.
					
					continue
				}
				else if (colorCharacters.indexOf(backgroundString[drawingPositionInString]) !== -1)
				{
					let pictogramEnd = drawingPositionInString
					while (pictogramEnd < backgroundStringLength && colorCharacters.indexOf(backgroundString[pictogramEnd]) !== -1)
						++pictogramEnd
					//spaces distinguish black mv then white mv from black and white mv

					let pictogramName = backgroundString.slice(drawingPositionInString, pictogramEnd)
					let mv = null
					for (let i = 0, il = mvs.length; i < il; i++)
						if (checkAnagram(pictogramName, mvs[i].name))
						{
							mv = mvs[i]
							break
						}
					let caratInPictogram = drawingPositionInString < carat.positionInString && carat.positionInString < pictogramEnd
					if (caratInPictogram)
						tokenCharactersleft = pictogramEnd - drawingPositionInString
					else if (pictogramEnd > drawingPositionInString && mv !== null)
					{
						drawingPosition.x += .5

						mv.drawInPlace(drawingPosition)
						outlines[lowestInvisibleOutline].visible = true
						outlines[lowestInvisibleOutline].position.copy(drawingPosition)
						++lowestInvisibleOutline

						drawingPosition.x += -.5 + spaceWidth * (pictogramEnd - drawingPositionInString)
						drawingPositionInString = pictogramEnd - 1

						//and push onto the stack

						continue
					}
				}
				else if ( backgroundString.slice(drawingPositionInString, drawingPositionInString + 7) === "display" )
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
					
					tokenCharactersleft = "display".length
				}
			}

			if (characters.indexOf(backgroundString[drawingPositionInString]) === -1)
				console.warn("Uncaught character, there will just be a space")
			else
			{
				let ilm = instancedLetterMeshes[backgroundString[drawingPositionInString]]
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

			drawingPosition.x += spaceWidth
			--tokenCharactersleft
			if (tokenCharactersleft < 0)
				tokenCharactersleft = 0
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

	//irritation involving things going behind it
	// let lineHighlight = new THREE.Mesh(unchangingUnitSquareGeometry.clone(), new THREE.MeshBasicMaterial({ color: 0x3E3D32 }))
	// lineHighlight.position.z = -1.
	// lineHighlight.scale.x = 999999999.
	// updateFunctions.push(function(){lineHighlight.position.y = carat.position.y})
	// scene.add(lineHighlight)
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

	function getNumLinesOnScreen()
	{
		return camera.topAtZZero * 2. / getWorldLineHeight()
	}
	bindButton("PageUp", () => {
		carat.addToPosition(0., Math.floor(getNumLinesOnScreen()))
	})
	bindButton("PageDown", () => {
		carat.addToPosition(0., -Math.floor(getNumLinesOnScreen()))
	})
}

function initTyping(carat,characters, instancedLetterMeshes, maxCopiesOfALetter)
{
	function addCharacter(character)
	{
		backgroundString = backgroundString.slice(0, carat.positionInString) + character + backgroundString.slice(carat.positionInString, backgroundString.length)
		carat.moveAlongString(1)
	}
	function makeCharacterTypeable(character, typedCharacter)
	{
		let material = text(character, true)

		instancedLetterMeshes[character] = new THREE.InstancedMesh(unchangingUnitSquareGeometry, material, maxCopiesOfALetter);
		instancedLetterMeshes[character].count = 0
		pad.add(instancedLetterMeshes[character])
		instancedLetterMeshes[character].aspect = material.getAspect()

		if (typedCharacter === undefined)
			typedCharacter = character
		else
			characters += character

		bindButton(typedCharacter, () => addCharacter(character))
	}
	for (let i = 0; i < characters.length; i++)
		makeCharacterTypeable(characters[i])
	let nablaCharacter = String.fromCharCode("8711")
	makeCharacterTypeable(nablaCharacter, "@")
	let integralCharacter = String.fromCharCode("8747")
	makeCharacterTypeable(integralCharacter, "~")
	let deltaCharacter = String.fromCharCode("948")
	makeCharacterTypeable(deltaCharacter, "?")

	let lambdaCharacter = String.fromCharCode("955")
	makeCharacterTypeable(lambdaCharacter, "#")
	//you CAN write "function", but lots of kids don't know "function". In python it's "def"
	// capital sigma (931) (just integral, whoah), wedge symbol(8743). Still got £$%^&

	bindButton("Delete", () =>
	{
		if (carat.positionInString < backgroundString.length)
			backgroundString = backgroundString.slice(0, carat.positionInString) + backgroundString.slice(carat.positionInString + 1, backgroundString.length)
	})
	bindButton("Backspace", () =>
	{
		if (carat.positionInString !== 0)
		{
			backgroundString = backgroundString.slice(0, carat.positionInString - 1) + backgroundString.slice(carat.positionInString, backgroundString.length)
			carat.moveAlongString(-1)
		}
	})
	bindButton("Tab", () => { for (let i = 0; i < 4; i++) addCharacter(" ") })
	bindButton("Enter", () => addCharacter("\n"))
}