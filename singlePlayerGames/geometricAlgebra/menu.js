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
	let menu = new THREE.Group()
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
				let padding = .25
				intendedMenuPosition.x =  camera.rightAtZZero - (halfMenuTitleWidth  + padding)
				intendedMenuPosition.y =  camera.topAtZZero   - (halfMenuTitleHeight + padding)
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

	{
		let randomizeButton = makeTextSign("Random puzzle")
		menuEntries.push(randomizeButton)
	}

	{
		let fullscreenButton = makeTextSign("Fullscreen: F11")
		//but you need more because no F11 on tablets and phones
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

	//best laid out using markup dude, do NOT think about this any further
	{
		let creditsSignObject = makeTextSign("Credits")
		let creditsSign = creditsSignObject.children[0]
		creditsSign.scale.copy(creditsSignObject.scale)
		menuEntries.push(creditsSign)
		clickables.push(creditsSign)
		
		creditsSign.onClick = function()
		{
			credits.position.x = 0.;
		}

		{
			var credits = new THREE.Mesh(new THREE.PlaneGeometry(100.,100.))
			credits.position.x = 1000.;
			scene.add(credits)

			credits.position.z = camera.position.z / 2.
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
					sign.scale.multiplyScalar(.4)
					sign.position.y = ((strings.length-1) / 2. - i) * .4
					sign.position.z = .001
					credits.add(sign)
				}
			}

			clickables.push(credits)
			credits.onClick = function()
			{
				credits.position.x = 1000;
			}
		}
	}

	menuEntries.push(back)

	for(let i = 0; i < menuEntries.length; i++)
	{
		menuEntries[i].position.y = -1 - i
		menuEntries[i].position.y *= .9
		menuEntries[i].scale.multiplyScalar(.7)
	}
}