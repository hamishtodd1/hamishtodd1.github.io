/*
	You can write your own numerical (dt is small) differentiator and integrator
	If you want to solve them analytically, it's about using your symbol juggling abilities
	But just because integration and differentiation are defined asymptotically


	shift and arrow keys to highlight
	ctrl c, v

	zoom in and out

	Colors
		https://www.reddit.com/r/ColorBlind/comments/hjw6ie/i_am_making_a_game_and_i_want_to_use_a_large/
		https://personal.sron.nl/~pault/
		viridis folks https://www.youtube.com/watch?v=xAoljeRJ3lU
		mark brown https://www.youtube.com/watch?v=xrqdU4cZaLw

*/



async function init()
{
	let backgroundString = "wbmc "

	let alphabet = "abcdefghijklmnopqrstuvwxyz"
	let colorCodes = "wbmcrogp"
	let instancedLetterMeshes = {}
	for(let i = 0; i < alphabet.length; i++)
	{
		let material = text(alphabet[i], true)

		let numOfThisLetter = 256
		instancedLetterMeshes[alphabet[i]] = new THREE.InstancedMesh(unchangingUnitSquareGeometry, material, numOfThisLetter);
		instancedLetterMeshes[alphabet[i]].instanceMatrix.setUsage(THREE.DynamicDrawUsage);
		scene.add(instancedLetterMeshes[alphabet[i]])
		instancedLetterMeshes[alphabet[i]].numOfThisOneInScene = 0
		instancedLetterMeshes[alphabet[i]].aspect = material.getAspect()

		bindButton(alphabet[i], function ()
		{
			backgroundString += alphabet[i]
			carat.position.x += .5
		})
	}


	
	
	let drawingPosition = new THREE.Vector3()
	updateFunctions.push(function()
	{
		//gotta display
		//webgl would be better
		//we have this thing that maintains consistency. Parser I guess

		for(let i = 0; i < alphabet.length; i++)
			instancedLetterMeshes[alphabet[i]].numOfThisOneInScene = 0

		let parsePosition = 0;
		drawingPosition.set(0.,0.,0.)
		let bsl = backgroundString.length
		while(parsePosition < bsl)
		{
			if (colorCodes.indexOf(backgroundString[parsePosition + 0]) !== -1 &&
				colorCodes.indexOf(backgroundString[parsePosition + 1]) !== -1 &&
				colorCodes.indexOf(backgroundString[parsePosition + 2]) !== -1 &&
				colorCodes.indexOf(backgroundString[parsePosition + 3]) !== -1 )
			{
				//draw a multivector!
				parsePosition += 4
			}
			else if( alphabet.indexOf(backgroundString[parsePosition]) !== -1 )
			{
				let ilm = instancedLetterMeshes[backgroundString[parsePosition]]
				++ilm.numOfThisOneInScene

				m1.identity()
				m1.elements[0] = ilm.aspect
				m1.setPosition(drawingPosition)
				m1.elements[12] += .25
				ilm.setMatrixAt(ilm.numOfThisOneInScene, m1)
				ilm.instanceMatrix.needsUpdate = true

				++parsePosition
				drawingPosition.x += .5
			}
			else
			{
				++parsePosition
			}
		}

		//you are declaring that a new line is a certain kind of thing
		// for (let i = 0; i < backgroundString.length; i++)
		// 	console.assert(backgroundString[i] === displayedThings[i].material.getText())
	})
	
	let carat = new THREE.Mesh(unchangingUnitSquareGeometry, new THREE.MeshBasicMaterial({ color: 0xF8F8F0 }))
	carat.scale.x = .1
	let caratFlashingStart = 0.
	updateFunctions.push(function () { carat.visible = Math.floor((clock.getElapsedTime() - caratFlashingStart) * 2.) % 2 ? false : true })
	scene.add(carat)

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
		carat.position.x -= 1.
		caratFlashingStart = clock.getElapsedTime()
	})
	bindButton("right", function ()
	{
		carat.position.x += 1.
		caratFlashingStart = clock.getElapsedTime()
	})

	//highlightedBlocks 0x575A5A

	updateFunctions.push(function()
	{
		if(mouse.clicking )
		{
			mouse.getZZeroPosition(v1)

			carat.position.x = Math.round(v1.x)
			carat.position.y = Math.round(v1.y)
		}
	})
}

/*
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