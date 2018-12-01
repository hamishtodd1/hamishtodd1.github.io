let ytPlayer = {
	setSize: function(){}
}
init()

// let tag = document.createElement('script');
// tag.src = "https://www.youtube.com/iframe_api";
// let firstScriptTag = document.getElementsByTagName('script')[0];
// firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
// function onYouTubeIframeAPIReady()
// {
// 	ytPlayer = new YT.Player('embed',
// 	{
// 		playerVars: 
// 		{
// 			autoplay: 0,
// 			fs: 0,
// 			rel: 0,
// 			showinfo: 0,
// 			modestbranding: 1,
// 		},
// 		events: {
// 			'onReady': init
// 		}
// 	});
// }

function init()
{
	initButtons()

	let renderer = new THREE.WebGLRenderer();
	renderer.setClearColor(0xFFFFFF)
	let rendererDomElementContainer = document.getElementById( 'rendererDomElementContainer' );
	rendererDomElementContainer.appendChild( renderer.domElement )

	let buttonContainer = document.getElementById( 'buttonContainer' );
	addButtonBelowVideo = function(label,buttonFunction)
	{
		let button = document.createElement("BUTTON");
		let textNode = document.createTextNode(label);       // Create a text node
		button.appendChild(textNode); 
		button.addEventListener('click',buttonFunction)
		buttonContainer.appendChild(button)
	}
	addButtonBelowVideo("Play tutorial",function()
	{
		ytPlayer.loadVideoById('uZgbKrDEzAs')
		ytPlayer.playVideo()
	})

	function render()
	{
		{
			frameDelta = clock.getDelta();
			
			// mouse.updateFromAsyncAndCheckClicks();

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
	let stage = initSurroundings();
	initMouse();

	addButtonBelowVideo("Finish game",function()
	{
		console.log("yo")
	})

	addButtonBelowVideo("New suspect",function()
	{
		//this is the hard part; you want screenshots; there isn't a whole lot of point in a computer version without screenshots
		//there are apparently plans for iframes to have .getScreenshot

		//one way to do this: tell people to ctrl+printscreen whenever they want a new one
		//the embed should have, on its right and bottom, a recognizable series of pixels eg black white black white etc

		// let domvasTestCanvasContext = document.getElementById("domvasTestCanvas").getContext('2d');
		// domvas.toImage(embed, function()
		// {
		// 	domvasTestCanvasContext.drawImage(this, 20, 20);
		// });

		//maaaay want to delete suspects
		let a = makeTextSign("Anonymous new suspect", false, true)
		a.material.color.setRGB(Math.random(),Math.random(),Math.random())
		a.scale.multiplyScalar(0.1)
		scene.add(a)
		updatables.push(a)
		a.update = function()
		{
			console.log(newSuspectTextBox.value)
		}

		let newSuspectTextBox = document.createElement("TEXTAREA");
		newSuspectTextBox.value = ""
		newSuspectTextBox.focus()
	})

	let textBox = document.createElement("TEXTAREA");
	textBox.cols = 19;
	textBox.rows = 1;
	textBox.value = "Paste video id here"
	let textBoxContainer = document.getElementById( "textBoxContainer" )
	textBoxContainer.appendChild( textBox );

	bindButton( "enter", function(event)
	{
		//uZgbKrDEzAs
		//gUog9ku0ptk
		let ytId = textBox.value
		ytPlayer.loadVideoById(ytId)
		ytPlayer.playVideo()
	})

	let copiedImageNotFoundSign = makeTextSign("Copied image not found")
	copiedImageNotFoundSign.scale.multiplyScalar(0.1)
	copiedImageNotFoundSign.material.opacity = 0;
	copiedImageNotFoundSign.material.transparent = true
	updatables.push(copiedImageNotFoundSign)
	copiedImageNotFoundSign.update = function()
	{
		this.material.opacity -= frameDelta * 0.9
	}
	scene.add(copiedImageNotFoundSign)

	{
		let selectionBox = new THREE.LineLoop(new THREE.Geometry())
		selectionBox.geometry.vertices.push(
			new THREE.Vector3(0,0,0),
			new THREE.Vector3(1,0,0),
			new THREE.Vector3(1,-1,0),
			new THREE.Vector3(0,-1,0)
		)
		selectionBox.update = function()
		{
			selectionBox.scale.subVectors(mouse.zZeroPosition,selectionBox.position)
			selectionBox.scale.z = 1
		}
		//click the profile picture and it opens this again

		document.addEventListener('paste', function (e)
		{
			if(e.clipboardData)
			{
				var items = e.clipboardData.items;
				if (!items) return;
				
				for (var i = 0; i < items.length; i++)
				{
					if (items[i].type.indexOf("image") !== -1)
					{
						makingSuspectPortrait = true

						var blob = items[i].getAsFile();
						var URLObj = window.URL || window.webkitURL;
						var source = URLObj.createObjectURL(blob);
						
						var pastedImage = new Image();
						pastedImage.onload = function ()
						{
							let canvas = document.createElement('canvas')
							let ctx = canvas.getContext('2d')
							canvas.width = pastedImage.width;
							canvas.height = pastedImage.height;
							ctx.drawImage(pastedImage, 0, 0);

							let pastedImageMesh = new THREE.Mesh(new THREE.PlaneGeometry(2,2*pastedImage.height/pastedImage.width),new THREE.MeshBasicMaterial({map: new THREE.CanvasTexture( canvas )}))
							pastedImageMesh.material.depthTest = false
							scene.add(pastedImageMesh)

							selectionBox.position.copy(mouse.zZeroPosition)
							selectionBox.scale.set(0.001,0.001,1)
							scene.add(selectionBox)
						}
						pastedImage.src = source;

						e.preventDefault();
						return;
					}
				}
				copiedImageNotFoundSign.material.opacity = 2;
			}
		}, false);
	}

	// initVideo()
	initSelectors() 

	render();
}

function initButtons()
{
	let buttons = {};

	bindButton = function( buttonName, onDown, buttonDescription,whileDown )
	{
		if(buttons[buttonName] !== undefined)
		{
			console.error("attempted to bind a button that already has a binding")
		}

		if(buttonDescription !== undefined)
		{
			console.log("\n",buttonName + ": " + buttonDescription)
		}
		buttons[buttonName] = {
			down: false,
			onDown: onDown
		}
		if(whileDown)
		{
			buttons[buttonName].whileDown = whileDown
		}
	}

	let buttonIndexGivenName = {
		"enter":13,
		"alt":18,
		"shift":16,

		"left":37,
		"up":38,
		"right":39,
		"down":12,
		"space":32,

		"[":219,
		"]":221
	}
	let keycodeArray = "0123456789abcdefghijklmnopqrstuvwxyz";
	function getButton(keyCode)
	{
		for( let buttonName in buttons )
		{
			if( keyCode === buttonIndexGivenName[buttonName] )
			{
				return buttons[buttonName]
			}
		}
		if( 48 <= keyCode && keyCode <= 57 )
		{
			let buttonName = keycodeArray[keyCode - 48]
			return buttons[buttonName]
		}
		if( 65 <= keyCode && keyCode <= 90 )
		{
			let buttonName = keycodeArray[keyCode - 55]
			return buttons[buttonName]
		}
		return null
	}

	//don't use ctrl or other things that conflict
	document.addEventListener( 'keydown', function(event)
	{
		let button = getButton(event.keyCode)

		if(button === null || button === undefined)
		{
			return
		}

		if(!button.down)
		{
			button.onDown()
			button.down = true
		}
	}, false );
	document.addEventListener( 'keyup', function(event)
	{
		let button = getButton(event.keyCode)

		if(button === null || button === undefined)
		{
			return
		}

		if( button.down )
		{
			// button.onUp()
			button.down = false
		}
	}, false );

	updatables.push(buttons)
	buttons.update = function()
	{
		for(let buttonName in buttons )
		{
			if( buttons[buttonName].down && buttons[buttonName].whileDown )
			{
				buttons[buttonName].whileDown()
			}
		}
	}
}