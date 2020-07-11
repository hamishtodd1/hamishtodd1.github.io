/*
	todo
		visualizing multivectors
		altering the things with mouse
		windows with previews, i.e. superimposed multivectors
		demo of making wedge product and "proving it is antisymmetric" by writing ab - ba
		demonstrate numerical integration and differentiation?
			requires at least functions

	integration and differentiation
		You can write your own numerical (dt is small) differentiator and integrator
		https://youtu.be/oUaOucZRlmE?t=1266
		The epsilon of integration is directly linked to the scale at which you are looking at the thing. dt = width of a pixel
		You draw a graph (left to right bottom to top say) by evaluating the function at the left side of a pixel, then at the right, then drawing pixels accordingly
	

	If you want to solve them analytically, it's about using your symbol juggling abilities
	But that is only because integration and differentiation are defined as infinite serieses. Maybe even unrigorous?

	long term
		function definition
		arrays would be nice but you're still unsure of them and can show in abacus
			Hmm, do physicists have arrays?
		shift and arrow keys to highlight
		ctrl c, v
		output glsl
		input latex

	Theoretical computer science
		if you have arrays and functions and recursion you have summation:
			function sumArrayElementsBelowIndex(arr, index) { return index < 0 ? 0 : arr[index] + sumArrayElementsBelowIndex(arr, index - 1) }
		lexical analysis

	Algebraic deduction / reduction
		Most of argumentation for math/phys is showing equalities. Our plan is, instead of a = b, output a - b which is 0
		Rearranging computer code into a simpler form... sounds like delta reduction?
		It's not always "reduction" in the sense of reducting the length of the string. Good to do ab -> a.b + a^b


	Language name: "Victory" lol

	Optimization
		https://www.cs.unm.edu/~crowley/papers/sds.pdf
		https://www.averylaird.com/programming/the%20text%20editor/2017/09/30/the-piece-table/
*/

// function differentiate(f,at)
// {
// 	let dt = 0.0000001
// 	return ( f(at) + f(at+dt) ) / dt
// }

// function integrate(f,at)
// {
// 	let dt = .0001 //the width of a pixel
// 	f()
// 	//for any approximation of integral of f with given dt, we can scale f such that you get that dt level precision
// 	//multiply final result by dt... but that is just a scalar multiple, only relevant if you put symbols on the y axis so to speak
// }

async function init()
{
	let pad = new THREE.Group()
	scene.add(pad)
	updateFunctions.push(function()
	{
		pad.position.x = -camera.rightAtZZero + 1. * pad.scale.x
		pad.position.y = camera.topAtZZero - 1. * pad.scale.y
	})

	let backgroundString = ""

	let carat = new THREE.Mesh(unchangingUnitSquareGeometry, new THREE.MeshBasicMaterial({ color: 0xF8F8F0 }))
	carat.position.z = .01
	pad.add(carat)
	carat.scale.x = .1
	let caratFlashingStart = 0.
	updateFunctions.push(() => {carat.visible = Math.floor((clock.getElapsedTime() - caratFlashingStart) * 2.) % 2 ? false : true })
	let caratPositionInString = -1
	let overrideCaratPositionInString = true
	function setCaratPosition(x, y)
	{
		carat.position.set(x, y, carat.position.z)
		caratFlashingStart = clock.getElapsedTime()
		overrideCaratPositionInString = true
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
	bindButton("ArrowRight",() => moveCaratAlongString(1))
	bindButton("ArrowLeft", () => moveCaratAlongString(-1))
	bindButton("ArrowUp",   () => addToCaratPosition(0., 1.))
	bindButton("ArrowDown", () => addToCaratPosition(0., -1.))
	bindButton("Home",		() => addToCaratPosition(-999., 0.))
	bindButton("End",		() => addToCaratPosition( 999., 0.))
	bindButton("PageUp",  	() => addToCaratPosition(0., 999.))
	bindButton("PageDown",	() => addToCaratPosition(0.,-999.))
	
	let characters = "abcdefghijklmnopqrstuvwxyz /-"
	function addCharacter(character)
	{
		backgroundString = backgroundString.slice(0, caratPositionInString) + character + backgroundString.slice(caratPositionInString, backgroundString.length)
		moveCaratAlongString(1)
	}
	let instancedLetterMeshes = {}
	let maxCopiesOfALetter = 256
	for(let i = 0; i < characters.length; i++)
	{
		let material = text(characters[i], true)

		instancedLetterMeshes[characters[i]] = new THREE.InstancedMesh(unchangingUnitSquareGeometry, material, maxCopiesOfALetter);
		instancedLetterMeshes[characters[i]].count = 0
		pad.add(instancedLetterMeshes[characters[i]])
		instancedLetterMeshes[characters[i]].aspect = material.getAspect()

		bindButton(characters[i], ()=> addCharacter(characters[i]))
	}
	bindButton("Backspace", () =>
	{
		backgroundString = backgroundString.slice(0, caratPositionInString - 1) + backgroundString.slice(caratPositionInString, backgroundString.length)
		moveCaratAlongString(-1)
	})
	bindButton("Enter", () => addCharacter("\n"))

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

		// m1.identity()
		// m1.elements[0] = .5 //want it bigger
		// m1.elements[5] = m1.elements[0]
		// // m1.setPosition(drawingPosition)
		// m1.elements[12] += .25 //half a space
		// gsSymbolInstanced.getMatrixAt(gsSymbolInstanced.count, m1)
		// log(m1.elements)
		// // gsSymbolInstanced.setMatrixAt(gsSymbolInstanced.count, m1)
		// // gsSymbolInstanced.instanceMatrix.needsUpdate = true
		// // ++gsSymbolInstanced.count

		// let animatedGeometricProductSymbol = new THREE.Mesh(unchangingUnitSquareGeometry, materials.geometricProduct)
		// let animatedGeometricSumSymbol = new THREE.Mesh(unchangingUnitSquareGeometry, materials.geometricSum)
	}

	//coooooould... type code which is potentially even one letter (they are assigned in a certain order)
	// let questionMarkMaterial = text("?",true) //can be colored with vertex attributes
	let colorCodes = "wbmcrogp"
	let maxCopiesOfMv = 16
	let mvs = []
	{
		let mv = new THREE.InstancedMesh(unchangingUnitSquareGeometry, new THREE.MeshBasicMaterial({color:0xFF0000}), maxCopiesOfMv)
		mv.count = 0
		pad.add(mv)
		mv.name = "wbmo"
		mvs.push(mv)

		let vectorRadius = .2
		let vectorGeometry = new THREE.CylinderBufferGeometry(0., vectorRadius, 1., 16, 1, false);
		vectorGeometry.applyMatrix(new THREE.Matrix4().makeTranslation(0., .5, 0.))
		let vectorMaterial = new THREE.MeshStandardMaterial({color:0xFF0000})
		// log(vectorMaterial.program.fragmentShader)
		let v = new THREE.Mesh(vectorGeometry,vectorMaterial)
		scene.add(v)
	}
	
	let drawingPosition = new THREE.Vector3()
	updateFunctions.push(function()
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

		for(let i = 0, il = characters.length; i < il; i++)
			instancedLetterMeshes[characters[i]].count = 0
		for (let i = 0, il = mvs.length; i < il; i++)
			mvs[i].count = 0

		let positionInString = 0
		drawingPosition.set(0.,0.,0.)
		let backgroundStringLength = backgroundString.length
		let xClosestToCarat = Infinity
		let yClosestToCarat = Infinity

		while(positionInString <= backgroundStringLength)
		{
			if ( !overrideCaratPositionInString && positionInString === caratPositionInString)
				carat.position.set(drawingPosition.x, drawingPosition.y, carat.position.z)
			if ( overrideCaratPositionInString )
			{
				if ( Math.abs(drawingPosition.y - carat.position.y) < yClosestToCarat ||
					(Math.abs(drawingPosition.y - carat.position.y) === yClosestToCarat && Math.abs(drawingPosition.x - carat.position.x) < xClosestToCarat ) )
				{
					yClosestToCarat = Math.abs(drawingPosition.y - carat.position.y)
					xClosestToCarat = Math.abs(drawingPosition.x - carat.position.x)

					caratPositionInString = positionInString
					v1.copy(drawingPosition)
				}
			}

			if(positionInString >= backgroundStringLength)
				break

			if (backgroundString[positionInString] === "\n")
			{
				drawingPosition.x = 0.
				drawingPosition.y -= 1.
				++positionInString
				continue
			}

			let couldBeFirstCharacterOfPictogram = 
				positionInString === 0 ||
				backgroundString[positionInString - 1] === " " || 
				backgroundString[positionInString - 1] === "\n"
			if (couldBeFirstCharacterOfPictogram )
			{
				let pictogramEnd = positionInString + 1
				let maxTokenLength = 4
				while (
					pictogramEnd < backgroundStringLength &&
					backgroundString[pictogramEnd] !== " " &&
					backgroundString[pictogramEnd] !== "\n" &&
					pictogramEnd < positionInString + maxTokenLength)
					++pictogramEnd

				//maybe function tokens too

				//but also it's not a pictogram if your carat is in it?
				let caratInPictogram = positionInString <= caratPositionInString && caratPositionInString <= pictogramEnd
				if (pictogramEnd > positionInString + 1 && !caratInPictogram)
				{
					let pictogramName = backgroundString.slice(positionInString, pictogramEnd)

					let pictogramFound = false
					for (let i = 0, il = mvs.length; i < il; i++)
					{
						if (pictogramName === mvs[i].name)
						{
							m1.identity()
							m1.elements[0] = .5 //want it bigger
							m1.elements[5] = m1.elements[0]
							m1.setPosition(drawingPosition)
							m1.elements[12] += .25 //half a space
							mvs[i].setMatrixAt(mvs[i].count, m1)
							mvs[i].instanceMatrix.needsUpdate = true
							++mvs[i].count

							positionInString = pictogramEnd
							drawingPosition.x += .5 //well, the width of the thing
							pictogramFound = true

							break
						}
					}
					if (pictogramFound)
						continue

					let newMv = true
					for (let i = 0, il = pictogramName.length; i < il; i++)
					{
						if (colorCodes.indexOf(pictogramName[0]) === -1)
							newMv = false
					}
					if (newMv)
					{
						log("gotta make a new one then break!")
						//then never delete it because need to reserve that name?
						//then you associate it with an existing vector somehow?

						//you should only refer to ones defined above you

						// positionInString = pictogramEnd
						// drawingPosition.x += .5
					}
				}
			}
			
			//just characters
			if (characters.indexOf(backgroundString[positionInString]) !== -1)
			{
				let ilm = instancedLetterMeshes[backgroundString[positionInString]]
				if (ilm.count >= maxCopiesOfALetter)
					console.error("too many copies of a letter!")

				m1.identity()
				m1.elements[0] = .8 * ilm.aspect //tweaked to make m not overlap stuff
				m1.elements[5] = m1.elements[0] / ilm.aspect
				m1.setPosition(drawingPosition)
				m1.elements[12] += .25 //half a space
				ilm.setMatrixAt(ilm.count, m1)
				ilm.instanceMatrix.needsUpdate = true
				++ilm.count

				++positionInString
				drawingPosition.x += .5

				continue
			}
			else
			{
				//uncaught character?
				console.warn("Uncaught character, not drawn")
				++positionInString
			}
		}

		if(overrideCaratPositionInString)
		{
			carat.position.set(v1.x,v1.y,carat.position.z)
			overrideCaratPositionInString = false
		}

		// log(instancedLetterMeshes["a"].count)
	})

	document.addEventListener('wheel', (event) =>
	{
		mouse.getZZeroPosition(v1)
		pad.worldToLocal(v1)

		pad.scale.setScalar(pad.scale.x * (event.deltaY < 0 ? 1.1 : 0.91))
		pad.updateMatrixWorld()

		pad.localToWorld(v1)
		mouse.getZZeroPosition(v2)

		pad.position.add(v2).sub(v1)
		pad.position.x = 0.

	}, false);

	//irritation involving things going behind it
	// let lineHighlight = new THREE.Mesh(unchangingUnitSquareGeometry.clone(), new THREE.MeshBasicMaterial({ color: 0x3E3D32 }))
	// lineHighlight.position.z = -1.
	// lineHighlight.scale.x = 999999999.
	// updateFunctions.push(function(){lineHighlight.position.y = carat.position.y})
	// scene.add(lineHighlight)
}

/*
	string of color codes = multivector, possibly a new one, initialized to random
	+ / * 
	if = if
	fn = function - or can you just do it with an arrow? lambda a b c . [function body]
	string of letters = function name

	you are expecting function, variable, variable. Get anything else? Ignore the line


	Colors
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