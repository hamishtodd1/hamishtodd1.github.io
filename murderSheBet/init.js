function initButtons()
{
	let buttonBindings = {};
	bindButton = function( buttonName, ourFunction, functionDescription )
	{
		if(buttonBindings[buttonName] !== undefined)
		{
			console.error("attempted to bind a button that already has a binding")
		}

		console.log("\n",buttonName + ": " + functionDescription)
		buttonBindings[buttonName] = ourFunction;
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
	//don't use ctrl or other things that conflict
	document.addEventListener( 'keydown', function(event)
	{
		for( let buttonName in buttonBindings )
		{
			if( event.keyCode === buttonIndexGivenName[buttonName] )
			{
				buttonBindings[buttonName]();
			}
		}

		let arrayposition;
		if( 48 <= event.keyCode && event.keyCode <= 57 )
		{
			arrayposition = event.keyCode - 48;
		}
		if( 65 <= event.keyCode && event.keyCode <= 90 )
		{
			arrayposition = event.keyCode - 55;
		}
		if( buttonBindings[ keycodeArray[arrayposition] ] !== undefined )
		{
			buttonBindings[ keycodeArray[arrayposition] ]();
		}
	}, false );
}

let tag = document.createElement('script');
tag.src = "https://www.youtube.com/iframe_api";
let firstScriptTag = document.getElementsByTagName('script')[0];
firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
function onYouTubeIframeAPIReady()
{
	ytPlayer = new YT.Player('embed',
	{
		playerVars: 
		{
			autoplay: 0,
			fs: 0,
			rel: 0,
			showinfo: 0,
			modestbranding: 1,
		},
		events: {
			'onReady': init
		}
	});
}

function init()
{
	console.log("yo")
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

	addButtonBelowVideo("Round up!",function()
	{
		console.log("yo")
	})
	addButtonBelowVideo("New suspect",function()
	{
		console.log("yo")
	})

	var textBox = document.createElement("TEXTAREA");
	textBox.cols = 25;
	textBox.rows = 1;
	textBox.value = "Paste new video link here"
	let textBoxContainer = document.getElementById( "textBoxContainer" )
	textBoxContainer.appendChild( textBox );

	// initVideo()
	initSelectors() 

	render();
}