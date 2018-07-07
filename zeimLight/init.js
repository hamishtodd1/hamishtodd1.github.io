/*
	Hmm, if it all takes place on a board, and you're moving around on it, well, that's the timeline
	Could be used for navigation / scrollability

	The youtube thing is a colossal perverse incentive
		Subtleties in interactive learning is your raison d'etre, but here we are, making something non-interactive

	Eventually
		-mp3; diffed record.
		-Working on tablets. Phones get embed and maybe message. No need to worry about address bar
		-VR interaction / funkiness in which you move your head and hand around and camera is in right place
		-Would be nice if people could spectate live
		-send to haxiomic/mrdoob/wannerstedt, get "make it nicer looking for free by doing this:"
		-fix lighting
		-editing suite?

	To make
		-Maryam Mirzakhani, 14th of July
		-my favourite 3d patterns/neoshapes
		-Something with bloody puzzles
		-pwg

	You can bring interface bits on and off, less need to think about some great big "game state" thing
*/

// function importScript(scriptName)
// {
// 	var extraScript = document.createElement('script');
// 	extraScript.setAttribute('src',scriptName + '.js');
// 	document.body.appendChild(extraScript);
// 	extraScript.onload = init;
// }
// importScript('variables')

(function init()
{
	var buttonBindings = {};
	bindButton = function( buttonName, ourFunction, functionDescription )
	{
		if(buttonBindings[buttonName] !== undefined)
		{
			console.error("attempted to bind a button that already has a binding")
		}

		console.log(buttonName.toUpperCase() + ": " + functionDescription)
		buttonBindings[buttonName] = ourFunction;
	}

	var platform = getPlatform()
	if(platform === "phone" )
	{
		//and a message telling you it's better on desktop
		var iframe = document.createElement("iframe");
	    iframe.setAttribute("src","https://www.youtube.com/embed/agOdP2Bmieg"); 
	    iframe.style.width  = window.innerWidth;
	    iframe.style.height = window.innerHeight;

	    document.body.appendChild(iframe);
	    return;
	}

	var renderer = new THREE.WebGLRenderer({ antialias: true });
	renderer.setPixelRatio( window.devicePixelRatio );
	renderer.setClearColor(0x000000) //youtube
	renderer.shadowMap.enabled = true;
	renderer.shadowMap.type = THREE.BasicShadowMap;
	document.body.appendChild( renderer.domElement );

	function render()
	{
		{
			frameDelta = clock.getDelta();
			
			mouse.updateFromAsyncAndCheckClicks();

			for(var i = 0; i < objectsToBeUpdated.length; i++)
			{
				objectsToBeUpdated[i].update();
			}

			frameCount++;
		}

		requestAnimationFrame( render );
		renderer.render( scene, camera );
	}

	initCameraAndRendererResizeSystem(renderer);
	initSurroundings()

	initMouse();
	initMirzakhani();

	initImagesAndVideos();

	var buttonIndexGivenName = {
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
	var keycodeArray = "0123456789abcdefghijklmnopqrstuvwxyz";
	//don't use ctrl or other things that conflict
	document.addEventListener( 'keydown', function(event)
	{
		for( var buttonName in buttonBindings )
		{
			if( event.keyCode === buttonIndexGivenName[buttonName] )
			{
				buttonBindings[buttonName]();
			}
		}

		var arrayposition;
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

	render();
})();

function initSurroundings()
{
	var backwardExtension = 0.6;
	var box = new THREE.Mesh( 
		new THREE.BoxGeometry(2*AUDIENCE_CENTER_TO_SIDE_OF_FRAME_AT_Z_EQUALS_0,2*AUDIENCE_CENTER_TO_TOP_OF_FRAME_AT_Z_EQUALS_0,backwardExtension),
		new THREE.MeshStandardMaterial({side:THREE.BackSide, vertexColors:THREE.FaceColors})
	);
	box.geometry.applyMatrix(new THREE.Matrix4().makeTranslation(0,0,-backwardExtension/2))
	for(var i = 0; i< box.geometry.faces.length; i++)
	{
		if(i === 0 || i === 1)
		{
			box.geometry.faces[i].color.setHex(0x6964D0)
		}
		else if(i === 2 || i === 3)
		{
			box.geometry.faces[i].color.setHex(0xCD6166)
		}
		else
		{
			box.geometry.faces[i].color.setHex(0xFFFFFF)
		}
	}
	box.material.metalness = 0.1;
	box.material.roughness = 0.2;
	box.receiveShadow = true;
	//you only see the back half
	scene.add(box)

	var pointLight = new THREE.PointLight(0xFFFFFF, 0.4, 5.3);
	pointLight.shadow.camera.far = 10;
	pointLight.shadow.camera.near = 0.01;
	pointLight.shadow.mapSize.width = 1024;
	pointLight.shadow.mapSize.height = pointLight.shadow.mapSize.width;
	pointLight.castShadow = true;
	pointLight.position.copy(box.geometry.vertices[3])
	pointLight.position.negate().multiplyScalar(0.6);
	box.add( pointLight );

	scene.add( new THREE.AmbientLight( 0xFFFFFF, 0.7 ) );
}