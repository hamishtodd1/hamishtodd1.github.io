/*
	todo
		visualizing multivectors
		altering the things with mouse
		windows with previews, i.e. superimposed multivectors
		demonstrate numerical integration and differentiation?

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

	Algebraic deduction / reduction
		Most of argumentation for math/phys is showing equalities. Our plan is, instead of a = b, output a - b which is 0
		Rearranging computer code into a simpler form... sounds like delta reduction?
		It's not always "reduction" in the sense of reducting the length of the string. Good to do ab -> a.b + a^b


	Language name: "Victory" lol
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

	document.addEventListener('wheel', function (event)
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

	let backgroundString = "ass\nass"
	let alphabet = "abcdefghijklmnopqrstuvwxyz"
	let colorCodes = "wbmcrogp"
	let instancedLetterMeshes = {}
	let maxCopiesOfALetter = 256
	for(let i = 0; i < alphabet.length; i++)
	{
		let material = text(alphabet[i], true)

		instancedLetterMeshes[alphabet[i]] = new THREE.InstancedMesh(unchangingUnitSquareGeometry, material, maxCopiesOfALetter);
		instancedLetterMeshes[alphabet[i]].instanceMatrix.setUsage(THREE.DynamicDrawUsage);
		pad.add(instancedLetterMeshes[alphabet[i]])
		instancedLetterMeshes[alphabet[i]].aspect = material.getAspect()

		bindButton(alphabet[i], function ()
		{
			backgroundString = backgroundString.slice(0, caratPositionInString) + alphabet[i] + backgroundString.slice(caratPositionInString, backgroundString.length)
			++caratPositionInString
			caratFlashingStart = clock.getElapsedTime()
		})
	}
	bindButton("backspace", function ()
	{
		backgroundString = backgroundString.slice(0, caratPositionInString - 1) + backgroundString.slice(caratPositionInString, backgroundString.length)
		--caratPositionInString
		caratFlashingStart = clock.getElapsedTime()
	})
	bindButton("enter", function ()
	{
		if(frameCount < 15) //because there are some random enters that get sent when you start the page????
			return

		backgroundString = backgroundString.slice(0, caratPositionInString) + "\n" + backgroundString.slice(caratPositionInString, backgroundString.length)
		carat.position.x += .5
		caratFlashingStart = clock.getElapsedTime()
	})

	//coooooould... type code which is potentially even one letter (they are assigned in a certain order)
	let maxCopiesOfMv = 16
	let mvs = []
	mv = new THREE.InstancedMesh(unchangingUnitSquareGeometry, new THREE.MeshBasicMaterial({color:0xFF0000}), maxCopiesOfMv)
	mv.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
	pad.add(mv)
	mv.name = "wbmo"
	mvs.push(mv)

	let carat = new THREE.Mesh(unchangingUnitSquareGeometry, new THREE.MeshBasicMaterial({ color: 0xF8F8F0 }))
	let overrideCaratPositionInString = true
	let caratPositionInString = -1
	carat.scale.x = .1
	let caratFlashingStart = 0.
	updateFunctions.push(function () { carat.visible = Math.floor((clock.getElapsedTime() - caratFlashingStart) * 2.) % 2 ? false : true })
	pad.add(carat)

	function addToCaratPosition(x, y)
	{
		carat.position.x += x
		carat.position.y += y
		caratFlashingStart = clock.getElapsedTime()
		overrideCaratPositionInString = true
	}
	bindButton(   "up", function () { addToCaratPosition(0., 1.) })
	bindButton( "down", function () { addToCaratPosition(0., -1.) })
	bindButton("right", function () { addToCaratPosition(.5, 0.) })
	bindButton( "left", function () { addToCaratPosition(-.5, 0.) })
	
	let drawingPosition = new THREE.Vector3()
	updateFunctions.push(function()
	{
		//webgl would be better
		if (mouse.clicking && !mouse.oldClicking)
		{
			mouse.getZZeroPosition(v1)
			pad.worldToLocal(v1)

			carat.position.x = Math.round(v1.x)
			carat.position.y = Math.round(v1.y)

			caratFlashingStart = clock.getElapsedTime()

			overrideCaratPositionInString = true
		}

		for(let i = 0, il = alphabet.length; i < il; i++)
			instancedLetterMeshes[alphabet[i]].count = 0
		for (let i = 0, il = mvs.length; i < il; i++)
			mvs[i].count = 0

		let positionInString = 0
		drawingPosition.set(0.,0.,0.)
		let backgroundStringLength = backgroundString.length
		let closestDistanceSqToCarat = Infinity
		while(positionInString <= backgroundStringLength)
		{
			if ( !overrideCaratPositionInString && positionInString === caratPositionInString)
				carat.position.copy(drawingPosition)
			if ( overrideCaratPositionInString && drawingPosition.distanceToSquared(carat.position) < closestDistanceSqToCarat)
			{
				closestDistanceSqToCarat = drawingPosition.distanceToSquared(carat.position)
				caratPositionInString = positionInString
				v1.copy(drawingPosition)
			}

			if(positionInString >= backgroundStringLength)
				break

			if (backgroundString[positionInString] == "\n")
			{
				
			}
			
			if (positionInString + 3 < backgroundStringLength &&
				colorCodes.indexOf(backgroundString[positionInString + 0]) !== -1 &&
				colorCodes.indexOf(backgroundString[positionInString + 1]) !== -1 &&
				colorCodes.indexOf(backgroundString[positionInString + 2]) !== -1 &&
				colorCodes.indexOf(backgroundString[positionInString + 3]) !== -1 )
			{
				let mvFound = false
				for (let i = 0, il = mvs.length; i < il; i++)
				{
					if (backgroundString[positionInString + 0] === mvs[i].name[0] &&
						backgroundString[positionInString + 1] === mvs[i].name[1] &&
						backgroundString[positionInString + 2] === mvs[i].name[2] &&
						backgroundString[positionInString + 3] === mvs[i].name[3])
					{
						mvFound = true

						m1.identity()
						m1.elements[0] = .5 //want it bigger
						m1.elements[5] = m1.elements[0]
						m1.setPosition(drawingPosition)
						m1.elements[12] += .25 //half a space
						mv.setMatrixAt(mv.count, m1)
						mv.instanceMatrix.needsUpdate = true
						++mv.count

						positionInString += 4
						drawingPosition.x += .5
						break
					}
				}

				if (mvFound)
					continue
			}
			
			if( alphabet.indexOf(backgroundString[positionInString]) !== -1 )
			{
				let ilm = instancedLetterMeshes[backgroundString[positionInString]]
				if (ilm.count >= maxCopiesOfALetter)
					console.error("too many copies of a letter!")
				
				m1.identity()
				m1.elements[0] = .8 * ilm.aspect //tweaked to make m not overlap stuff
				m1.elements[5] = m1.elements[0]/ilm.aspect
				m1.setPosition(drawingPosition)
				m1.elements[12] += .25 //half a space
				ilm.setMatrixAt(ilm.count, m1)
				ilm.instanceMatrix.needsUpdate = true
				++ilm.count
				
				++positionInString
				drawingPosition.x += .5

				continue
			}
			
			++positionInString
			continue
		}

		if(overrideCaratPositionInString)
		{
			carat.position.copy(v1)
			overrideCaratPositionInString = false
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

/*
	Colors
		https://www.reddit.com/r/ColorBlind/comments/hjw6ie/i_am_making_a_game_and_i_want_to_use_a_large/
		https://personal.sron.nl/~pault/
		viridis folks https://www.youtube.com/watch?v=xAoljeRJ3lU
		mark brown https://www.youtube.com/watch?v=xrqdU4cZaLw

	Temporary:
	a ?auburn (red)
	b ?black blue?
	c cyan (blue)
	d
	e ?emerald (green)
	f ?fuscia (purple)
	g green
	h
	i ?indigo (purple)
	j
	k
	l ?lilac ?lemon
	m magenta (technical people should know. Colorblindness though)
	n
	o orange
	p pink ("fuck purple")
	q
	r red
	s
	t turquoise or teal "blue green"
	u ultramarine
	v ?violet ?viridian
	w white
	x x axis
	y y axis yellow? cream? lemon?
	z z axis

	w, b, m, c, r, o, g, p

	x,y,z
*/