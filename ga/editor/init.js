/*
	todo
		backspace
		visualizing multivectors
		tweaking the things with mouse
		windows with previews showing them superimposed
		demonstrate numerical integration and differentiation?
		functions? Probably not

	You can write your own numerical (dt is small) differentiator and integrator

	If you want to solve them analytically, it's about using your symbol juggling abilities
	But that is only because integration and differentiation are defined as infinite serieses. Maybe even unrigorous?

	long term
		arrays would be nice but you're still unsure of them and can show in abacus
			Hmm, do physicists have arrays?
		shift and arrow keys to highlight
		ctrl c, v
		output glsl
		input latex

	Theoretical computer science
		if you have arrays and functions and recursion you have summation:
			function sumArrayElementsBelowIndex(arr, index) { return index < 0 ? 0 : arr[index] + sumArrayElementsBelowIndex(arr, index - 1) }
*/

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

	let backgroundString = ""
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
			carat.position.x += .5
			caratFlashingStart = clock.getElapsedTime()
		})
	}
	bindButton("backspace", function ()
	{
		backgroundString = backgroundString.slice(0, caratPositionInString - 1) + backgroundString.slice(caratPositionInString, backgroundString.length)
		carat.position.x -= .5
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
	
	let drawingPosition = new THREE.Vector3()
	updateFunctions.push(function()
	{
		//gotta display
		//webgl would be better
		//we have this thing that maintains consistency. Parser I guess

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
			if (drawingPosition.distanceToSquared(carat.position) < closestDistanceSqToCarat)
			{
				caratPositionInString = positionInString
				closestDistanceSqToCarat = drawingPosition.distanceToSquared(carat.position)
				v1.copy(drawingPosition)
			}
			if(positionInString >= backgroundStringLength)
				break
			
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

		carat.position.copy(v1)

		// log(instancedLetterMeshes["a"].count)
	})
	
	let carat = new THREE.Mesh(unchangingUnitSquareGeometry, new THREE.MeshBasicMaterial({ color: 0xF8F8F0 }))
	let caratPositionInString = -1
	carat.scale.x = .1
	let caratFlashingStart = 0.
	updateFunctions.push(function () { carat.visible = Math.floor((clock.getElapsedTime() - caratFlashingStart) * 2.) % 2 ? false : true })
	pad.add(carat)

	//irritation involving things going behind it
	// let lineHighlight = new THREE.Mesh(unchangingUnitSquareGeometry.clone(), new THREE.MeshBasicMaterial({ color: 0x3E3D32 }))
	// lineHighlight.position.z = -1.
	// lineHighlight.scale.x = 999999999.
	// updateFunctions.push(function(){lineHighlight.position.y = carat.position.y})
	// scene.add(lineHighlight)
	
	bindButton("up",function()
	{
		carat.position.y += 1.
		caratFlashingStart = clock.getElapsedTime()
	})
	bindButton("down", function ()
	{
		carat.position.y -= 1.
		caratFlashingStart = clock.getElapsedTime()
	})
	bindButton("left", function ()
	{
		carat.position.x -= .5
		caratFlashingStart = clock.getElapsedTime()
	})
	bindButton("right", function ()
	{
		carat.position.x += .5
		caratFlashingStart = clock.getElapsedTime()
	})

	//highlightedBlocks 0x575A5A

	updateFunctions.push(function()
	{
		if(mouse.clicking )
		{
			mouse.getZZeroPosition(v1)
			pad.worldToLocal(v1)

			carat.position.x = Math.round(v1.x)
			carat.position.y = Math.round(v1.y)

			caratFlashingStart = clock.getElapsedTime()
		}
	})
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