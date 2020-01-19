/*
	TODO
		playground
		switch horizontal/vertical display method
			detect region and change appropriately
			It's linked to what direction time flows in, what direction symbols are read in

		Physicist: bottom to top
		Coder(me): Top to bottom
		Arabic layperson: right to left
		Non-arabic layperson: left to right

		use keyboard?

		subtitle language
		video speed
*/

async function initMenu()
{
	let menu = new THREE.Object3D()
	scene.add(menu)

	let menuFader = new THREE.Mesh(new THREE.PlaneGeometry(1.,1.), new THREE.MeshBasicMaterial({color:0x020202, transparent:true, opacity:0.}))
	menuFader.scale.set(100.,100.,1.)
	scene.add(menuFader)

	let menuEntries = []

	{
		let titleObject = makeTextSign("Menu")
		let title = titleObject.children[0]
		title.scale.copy(titleObject.scale)
		title.scale.multiplyScalar(.4)
		menu.add(title)
		clickables.push(title)

		title.onClick = function()
		{
			menuMode = true
		}

		let intendedFaderOpacity = 0.
		let intendedMenuPosition = new THREE.Vector3(0.,0.,.001)
		function updateFromMenuMode()
		{
			if(menuMode)
			{
				intendedMenuPosition.y = (menu.children.length-1) / 2. * 1.1
				intendedMenuPosition.x = 0.
				intendedFaderOpacity = .5

				for(let i = 0; i < menuEntries.length; i++)
					menu.add(menuEntries[i])
			}
			else
			{
				let halfMenuTitleWidth = title.scale.x / 2.
				let halfMenuTitleHeight = title.scale.y / 2.
				intendedMenuPosition.x = -camera.rightAtZZero + (halfMenuTitleWidth + .1)
				intendedMenuPosition.y =  camera.topAtZZero   - (halfMenuTitleHeight + .1)
				intendedFaderOpacity = 0.

				for(let i = 0; i < menuEntries.length; i++)
					menu.remove(menuEntries[i])
			}
		}
		updateFunctions.push(function()
		{
			updateFromMenuMode()

			menu.position.lerp(intendedMenuPosition,.1)
			menuFader.material.opacity += (intendedFaderOpacity - menuFader.material.opacity ) * .1
		})

		let menuMode = false
		updateFromMenuMode()
		menu.position.copy(intendedMenuPosition)
		menuFader.material.opacity = intendedFaderOpacity

		let backObject = makeTextSign("Back to game")
		var back = backObject.children[0]
		back.scale.copy(backObject.scale)
		clickables.push(back)
		back.onClick = function()
		{
			menuMode = false
		}
	}

	//because on tablets you don't have F11
	{
		let fullscreenButton = makeTextSign("Fullscreen")
		menuEntries.push(fullscreenButton)

		//it's not a normal clickable because fullscreen policy

		// document.addEventListener( 'mousedown', function(event) 
		// {
		// 	if(event.which === 1)
		// 	{
		// 		asynchronous.clicking = true;
		// 	}
		// 	if(event.which === 3)
		// 	{
		// 		asynchronous.rightClicking = true;
		// 	}

		// 	asynchronous.normalizedDevicePosition.x = ( clientX / window.innerWidth  ) * 2 - 1;
		// 	asynchronous.normalizedDevicePosition.y =-( clientY / window.innerHeight ) * 2 + 1;
		// }, false );

		// document.addEventListener( 'touchstart', function(event)
		// {
		// 	event.preventDefault();

		// 	asynchronous.clicking = true;

		// 	updateNdc(event.changedTouches[0].clientX,event.changedTouches[0].clientY)
		// }, { passive: false } );
	}

	// if(0)
	//best laid out using markup dude, do NOT think about this any further
	{
		let creditsSignObject = makeTextSign("Credits")
		let creditsSign = creditsSignObject.children[0]
		creditsSign.scale.copy(creditsSignObject.scale)
		menuEntries.push(creditsSign)
		clickables.push(creditsSign)

		creditsSign.onClick = function()
		{
			scene.add(credits)
		}

		{
			var credits = new THREE.Object3D()
			credits.position.z = .01
			let strings = [
				"Creator",
				"Hamish Todd",
				"gap",
				"Playtesters",
				"Pontus Grandstrom",
				"Ivan Erofeev",
				"Nina Erofeev", //check surname
				"(Your name goes here!)",
			]
			for(let i = 0; i < strings.length; i++)
			{
				if(strings[i] !== "gap")
				{
					let sign = makeTextSign(strings[i])
					sign.position.y = (strings.length-1) / 2. - i
					credits.add(sign)
				}
			}

			var creditsBackground = new THREE.Mesh(new THREE.PlaneGeometry(1.,1.))
			creditsBackground.scale.x = camera.rightAtZZero * 2.
			creditsBackground.scale.y = camera.topAtZZero * 2.
			creditsBackground.position.z = -.001
			credits.add(creditsBackground)

			clickables.push(creditsBackground)
			creditsBackground.onClick = function()
			{
				scene.remove(credits)
			}
		}
	}

	menuEntries.push(back)

	for(let i = 0; i < menuEntries.length; i++)
	{
		menuEntries[i].position.y = -1 - i
		menuEntries[i].position.y *= 1.1
		menuEntries[i].scale.multiplyScalar(.8)
	}
}