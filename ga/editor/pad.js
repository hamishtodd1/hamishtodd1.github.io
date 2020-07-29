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

async function initPad()
{
	let backgroundString = " b \n b "

	scene.add(pad)
	updateFunctions.push(function ()
	{
		pad.position.x = -camera.rightAtZZero + 1. * pad.scale.x
		pad.position.y = camera.topAtZZero - 1. * pad.scale.y
	})

	let mvs = []

	{
		let carat = new THREE.Mesh(unchangingUnitSquareGeometry, new THREE.MeshBasicMaterial({ color: 0xF8F8F0 }))
		var caratPositionInString = -1
		carat.position.z = .01
		pad.add(carat)
		carat.scale.x = .1
		let caratFlashingStart = 0.
		updateFunctions.push(() => { carat.visible = Math.floor((clock.getElapsedTime() - caratFlashingStart) * 2.) % 2 ? false : true })
		function setCaratPosition(x, y)
		{
			carat.position.set(x, y, carat.position.z)
			caratFlashingStart = clock.getElapsedTime()
			caratPositionInString = -1
		}
		function addToCaratPosition(x, y)
		{
			setCaratPosition(
				carat.position.x + x,
				carat.position.y + y)
		}
		function moveCaratAlongString(amount)
		{
			caratPositionInString += amount
			if (caratPositionInString < 0)
				caratPositionInString = 0
			if (caratPositionInString > backgroundString.length)
				caratPositionInString = backgroundString.length
			caratFlashingStart = clock.getElapsedTime()
		}
		bindButton("ArrowRight", () => moveCaratAlongString(1))
		bindButton("ArrowLeft", () => moveCaratAlongString(-1))
		bindButton("ArrowUp", () => addToCaratPosition(0., 1.))
		bindButton("ArrowDown", () => addToCaratPosition(0., -1.))
		bindButton("Home", () => addToCaratPosition(-999., 0.))
		bindButton("End", () => addToCaratPosition(999., 0.))
		bindButton("PageUp", () => addToCaratPosition(0., 999.))
		bindButton("PageDown", () => addToCaratPosition(0., -999.))
	}

	{
		let characters = "abcdefghijklmnopqrstuvwxyz /-=*!:"
		function addCharacter(character)
		{
			backgroundString = backgroundString.slice(0, caratPositionInString) + character + backgroundString.slice(caratPositionInString, backgroundString.length)
			moveCaratAlongString(1)
		}
		let instancedLetterMeshes = {}
		let maxCopiesOfALetter = 256
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
		// capital sigma (931) (just integral, whoah), wedge symbol(8743). Still got dollar sign and pound sign
		//delta is interesting because it's a logical symbol but also a continuous one. Do other logical symbols, AND and OR have equivalents?
		// brackets probably is fine

		bindButton("Delete", () =>
		{
			if (caratPositionInString < backgroundString.length)
				backgroundString = backgroundString.slice(0, caratPositionInString) + backgroundString.slice(caratPositionInString + 1, backgroundString.length)
		})
		bindButton("Backspace", () =>
		{
			if (caratPositionInString !== 0)
			{
				backgroundString = backgroundString.slice(0, caratPositionInString - 1) + backgroundString.slice(caratPositionInString, backgroundString.length)
				moveCaratAlongString(-1)
			}
		})
		bindButton("Tab", () => { for (let i = 0; i < 4; i++) addCharacter(" ") })
		bindButton("Enter", () => addCharacter("\n"))
	}

	//don't need geometric product for the demo necessarily
	{
		let materials = {
			geometricProduct: new THREE.MeshBasicMaterial({ color: 0xFF0000, transparent: true /*because transparent part of texture*/ }),
			geometricSum: new THREE.MeshBasicMaterial({ color: 0x80FF00, transparent: true /*because transparent part of texture*/ }),
		}

		let loader = new THREE.TextureLoader()
		loader.crossOrigin = true
		//don't use a promise, shit goes weird
		loader.load("data/frog.png", function (result)
		{
			materials.geometricSum.map = result
			materials.geometricSum.needsUpdate = true
			materials.geometricProduct.map = result
			materials.geometricProduct.needsUpdate = true
		})

		var gpSymbolInstanced = new THREE.InstancedMesh(unchangingUnitSquareGeometry, materials.geometricProduct, maxCopiesOfALetter)
		gpSymbolInstanced.count = 0
		pad.add(gpSymbolInstanced)
		var gsSymbolInstanced = new THREE.InstancedMesh(unchangingUnitSquareGeometry, materials.geometricSum, maxCopiesOfALetter)
		gsSymbolInstanced.count = 0
		pad.add(gsSymbolInstanced)

		bindButton

		// let animatedGeometricProductSymbol = new THREE.Mesh(unchangingUnitSquareGeometry, materials.geometricProduct)
		// let animatedGeometricSumSymbol = new THREE.Mesh(unchangingUnitSquareGeometry, materials.geometricSum)
	}

	let drawingPosition = new THREE.Vector3()
	updateFunctions.push(function ()
	{
		//webgl would be better
		if (mouse.clicking && !mouse.oldClicking)
		{
			mouse.getZZeroPosition(v1)
			pad.worldToLocal(v1)
			setCaratPosition(
				.5 * Math.round(v1.x * 2.),
				Math.round(v1.y))
		}

		for (let i = 0, il = characters.length; i < il; i++)
			instancedLetterMeshes[characters[i]].count = 0
		for (let i = 0, il = mvs.length; i < il; i++)
			mvs[i].count = 0
		gpSymbolInstanced.count = 0
		gsSymbolInstanced.count = 0

		let drawingPositionInString = 0
		drawingPosition.set(0., 0., 0.)
		let backgroundStringLength = backgroundString.length
		let xClosestToCarat = Infinity
		let yClosestToCarat = Infinity

		let positionInStringClosestToCaratPosition = -1

		while (drawingPositionInString <= backgroundStringLength)
		{
			if (caratPositionInString !== -1 && drawingPositionInString === caratPositionInString)
				carat.position.set(drawingPosition.x, drawingPosition.y, carat.position.z)
			if (caratPositionInString === -1)
			{
				if (Math.abs(drawingPosition.y - carat.position.y) < yClosestToCarat ||
					(Math.abs(drawingPosition.y - carat.position.y) === yClosestToCarat && Math.abs(drawingPosition.x - carat.position.x) < xClosestToCarat))
				{
					yClosestToCarat = Math.abs(drawingPosition.y - carat.position.y)
					xClosestToCarat = Math.abs(drawingPosition.x - carat.position.x)

					positionInStringClosestToCaratPosition = drawingPositionInString
					v1.copy(drawingPosition)
				}
			}

			if (drawingPositionInString >= backgroundStringLength)
				break

			if (backgroundString[drawingPositionInString] === "\n")
			{
				drawingPosition.x = 0.
				drawingPosition.y -= 1.
				++drawingPositionInString
				continue
			}

			let couldBeOnFirstCharacterOfPictogram =
				drawingPositionInString === 0 ||
				backgroundString[drawingPositionInString - 1] === " " ||
				backgroundString[drawingPositionInString - 1] === "\n"

			if (couldBeOnFirstCharacterOfPictogram)
			{
				let pictogramEnd = drawingPositionInString
				let maxTokenLength = 4
				while (
					pictogramEnd < backgroundStringLength &&
					backgroundString[pictogramEnd] !== " " &&
					backgroundString[pictogramEnd] !== "\n" &&
					pictogramEnd < drawingPositionInString + maxTokenLength)
					++pictogramEnd

				//maybe function tokens too

				//but also it's not a pictogram if your carat is in it?
				let caratInPictogram = drawingPositionInString <= caratPositionInString && caratPositionInString <= pictogramEnd
				if (pictogramEnd > drawingPositionInString && !caratInPictogram)
				{
					let pictogramName = backgroundString.slice(drawingPositionInString, pictogramEnd)

					let pictogramFound = false
					for (let i = 0, il = mvs.length; i < il; i++)
					{
						// debugger
						if (checkAnagram(pictogramName, mvs[i].name))
						{
							mvs[i].setPositionAt(mvs[i].count, drawingPosition.x + .25, drawingPosition.y)
							++mvs[i].count

							// m1.elements[ 0] = uniformScale
							// m1.elements[ 5] = uniformScale
							// m1.elements[10] = uniformScale

							drawingPositionInString = pictogramEnd
							drawingPosition.x += .5 //well, the width of the thing
							pictogramFound = true

							break
						}
					}
					if (pictogramFound)
						continue

					// let userWantsNew = true
					// for (let i = 0, il = pictogramName.length; i < il; i++)
					// {
					// 	if (colorCharacters.indexOf(pictogramName[0]) === -1)
					// 		userWantsNew = false
					// }
					// if (userWantsNew)
					// {
					// 	log("gotta make a new one then break!")
					// 	//then never delete it because need to reserve that name?
					// 	//then you associate it with an existing vector somehow?

					// 	//you should only refer to ones defined above you

					// 	// drawingPositionInString = pictogramEnd
					// 	// drawingPosition.x += .5
					// }
				}
			}

			//just characters
			if (characters.indexOf(backgroundString[drawingPositionInString]) !== -1)
			{
				// if (overrideCaratPositionInString && drawingPositionInString === 1)
				// log("y")
				// if (backgroundString[drawingPositionInString] !== " ")
				// 	debugger

				let ilm = instancedLetterMeshes[backgroundString[drawingPositionInString]]
				if (ilm.count >= maxCopiesOfALetter)
					console.error("too many copies of a letter!")

				m1.identity()
				m1.setPosition(drawingPosition)
				m1.elements[12] += .25 //half a space
				m1.elements[0] = .8 * ilm.aspect //tweaked to make overlap rare eg m. i looks shit
				m1.elements[5] = m1.elements[0] / ilm.aspect
				ilm.setMatrixAt(ilm.count, m1)
				ilm.instanceMatrix.needsUpdate = true
				++ilm.count

				++drawingPositionInString
				drawingPosition.x += .5

				continue
			}
			else if (backgroundString[drawingPositionInString] === "+" || backgroundString[drawingPositionInString] === "*")
			{
				m1.identity()
				m1.setPosition(drawingPosition)
				m1.elements[12] += .25 //half a space
				// m1.setUniformScaleAssumingRigid(.5)

				let symbol = backgroundString[drawingPositionInString] === "+" ? gsSymbolInstanced : gpSymbolInstanced
				symbol.setMatrixAt(symbol.count, m1)
				symbol.instanceMatrix.needsUpdate = true
				++symbol.count

				++drawingPositionInString
				drawingPosition.x += .5
			}
			else
			{
				//uncaught character?
				console.warn("Uncaught character, not drawn")
				++drawingPositionInString
			}
		}

		if (caratPositionInString === -1)
		{
			carat.position.set(v1.x, v1.y, carat.position.z)
			caratPositionInString = positionInStringClosestToCaratPosition
		}

		// log(instancedLetterMeshes["a"].count)
	})

	//irritation involving things going behind it
	// let lineHighlight = new THREE.Mesh(unchangingUnitSquareGeometry.clone(), new THREE.MeshBasicMaterial({ color: 0x3E3D32 }))
	// lineHighlight.position.z = -1.
	// lineHighlight.scale.x = 999999999.
	// updateFunctions.push(function(){lineHighlight.position.y = carat.position.y})
	// scene.add(lineHighlight)
}