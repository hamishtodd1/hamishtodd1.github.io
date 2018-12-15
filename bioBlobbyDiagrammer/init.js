init()

function init()
{
	initButtons()

	let renderer = new THREE.WebGLRenderer();
	renderer.setPixelRatio( window.devicePixelRatio )
	renderer.setClearColor(0xFFFFFF)
	document.body.appendChild( renderer.domElement )

	function render()
	{
		{
			frameDelta = clock.getDelta();
			
			mouse.updateFromAsyncAndCheckClicks();

			for(let i = 0; i < updatables.length; i++)
			{
				updatables[i].update();
			}

			frameCount++;
		}

		requestAnimationFrame( render );
		renderer.render( scene, camera );
	}

	initCameraAndRendererResizeSystem( renderer );
	initMouse();
	initButtons()

	/*
		MVP
			You draw the things
			They can dimerize
			The dimerization animates

		Some folks don't want animations, they want it comic book style. This is not for them

		Beyond minimum
			Flexibility! Powerpoint lets you paste in anything
			it organizes them for you spatially
			it animates them
			it generates some differential equations...
				then animates a "bath" of what you've drawn

		Kinda like loopy!
	*/

	let dimerizeButton = makeTextSign("dimerize")
	console.lo
	dimerizeButton.onClick = function()
	{
		console.log("and something happens")
	}

	bindButton("a",function()
	{
		let newProtein = new THREE.Mesh(new THREE.CircleGeometry(0.1,32))
		scene.add(newProtein)
		newProtein.position.set(Math.random() - 0.5,Math.random() - 0.5,0)

		clickables.push(newProtein)
		newProtein.onClick = function()
		{
			dimerizeButton.position.copy(this.position)
			scene.add(dimerizeButton)
		}
	}, "new blob")

	let newArrow = new THREE.Mesh(new THREE.Geometry(), new THREE.MeshBasicMaterial({color:0x000000}))
	newArrow.geometry.copy(new THREE.OriginCorneredPlaneGeometry(1,1))
	scene.add(newArrow)

	updatables.push(newArrow)
	//can only draw arrows from things to things
	newArrow.update = function()
	{
		if(mouse.clicking && !mouse.oldClicking)
		{
			newArrow.position.copy(mouse.position)
		}
	}

	render();
}