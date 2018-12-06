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
	renderer.setPixelRatio( window.devicePixelRatio )
	document.body.appendChild( renderer.domElement )

	let buttonContainer = document.getElementById( 'buttonContainer' );
	
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
	let stage = initSurroundings();
	initMouse();

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
		let pastedImageMesh = new THREE.Mesh(new THREE.OriginCorneredPlaneGeometry(1,1),new THREE.MeshBasicMaterial())
		pastedImageMesh.visible = false
		pastedImageMesh.position.z = 0.3
		scene.add(pastedImageMesh)

		let selectionBox = new THREE.LineLoop(new THREE.Geometry())
		selectionBox.position.z = pastedImageMesh.position.z + 0.01
		scene.add(selectionBox)
		selectionBox.geometry.vertices.push(
			new THREE.Vector3(0,0,0),
			new THREE.Vector3(1,0,0),
			new THREE.Vector3(1,1,0),
			new THREE.Vector3(0,1,0)
		)
		let selecting = false
		selectionBox.visible = false
		updatables.push(selectionBox)
		let initialMousePosition = new THREE.Vector3()
		selectionBox.update = function()
		{
			if( !makingSuspectPortrait )
			{
				return
			}

			if(mouse.clicking && !mouse.oldClicking && selecting === false)
			{
				selecting = true
				initialMousePosition.copy(mouse.zZeroPosition)
				selectionBox.visible = true
				selectionBox.scale.copy(zeroVector)
			}

			if(selecting)
			{
				selectionBox.position.x = mouse.zZeroPosition.x < initialMousePosition.x? mouse.zZeroPosition.x : initialMousePosition.x
				selectionBox.position.y = mouse.zZeroPosition.y < initialMousePosition.y? mouse.zZeroPosition.y : initialMousePosition.y
				selectionBox.scale.x  = Math.abs(mouse.zZeroPosition.x - initialMousePosition.x)
				selectionBox.scale.y  = Math.abs(mouse.zZeroPosition.y - initialMousePosition.y)
				selectionBox.scale.z = 1
			}

			if(!mouse.clicking && selecting === true)
			{
				if(selectionBox.scale.length()<1.01)
				{
					console.log("yo")
					selecting = false
					selectionBox.visible = false
				}
				else
				{
					selecting = false
					makingSuspectPortrait = false

					selectionBox.visible = false
					pastedImageMesh.visible = false

					let clippedMesh = new THREE.Mesh(new THREE.PlaneGeometry(1,1),new THREE.MeshBasicMaterial({map:pastedImageMesh.material.map}))
					clippedMesh.scale.copy(selectionBox.scale)
					clippedMesh.position.copy(selectionBox.position)

					for(let i = 0; i < 4; i++)
					{
						let onPastedImage = selectionBox.geometry.vertices[i].clone()
						selectionBox.localToWorld(onPastedImage)
						pastedImageMesh.worldToLocal(onPastedImage)

						for(let j = 0; j < clippedMesh.geometry.faceVertexUvs[0].length; j++)
						{
							for(let k = 0; k < clippedMesh.geometry.faceVertexUvs[0][j].length; k++)
							{
								if( clippedMesh.geometry.faceVertexUvs[0][j][k].x === selectionBox.geometry.vertices[i].x &&
									clippedMesh.geometry.faceVertexUvs[0][j][k].y === selectionBox.geometry.vertices[i].y )
								{
									clippedMesh.geometry.faceVertexUvs[0][j][k].x = onPastedImage.x
									clippedMesh.geometry.faceVertexUvs[0][j][k].y = onPastedImage.y
								}
							}
						}
					}
					clippedMesh.geometry.uvsNeedUpdate = true

					scene.add(clippedMesh)
				}
			}
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

							makingSuspectPortrait = true

							pastedImageMesh.scale.set(1,pastedImage.height/pastedImage.width,1)
							pastedImageMesh.material.map = new THREE.CanvasTexture( canvas )
							pastedImageMesh.visible = true
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
		"down":40,
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