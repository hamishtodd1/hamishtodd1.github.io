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

	initPortraits()	

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