function init()
{
	var renderer = new THREE.WebGLRenderer({antialias: true});
	renderer.setPixelRatio( window.devicePixelRatio );
	renderer.setClearColor( 0x808080 );	
	document.body.prepend( renderer.domElement );
	
	camera.aspect = 1;
	camera.position.z = 16;
	
	var respondToResize = function() 
	{
		renderer.setSize( document.documentElement.clientWidth,window.innerHeight ); //different because we do expect a scrollbar. Bullshit that you can't use both in the same way but whatever
		camera.aspect = renderer.domElement.width / renderer.domElement.height;
		
		//eg playing field is 1x1 square
		var minimumCenterToFrameVertical = 0.5;
		var minimumCenterToFrameHorizontal = 0.5;
		
		if( camera.aspect >= 1 )
		{
			camera.top = 0.5;
			camera.bottom = -0.5;
			camera.right = camera.top * camera.aspect;
			camera.left = camera.bottom * camera.aspect;
		}
		else
		{
			camera.right = 0.5;
			camera.left = -0.5;
			camera.top = camera.right / camera.aspect;
			camera.bottom = camera.left / camera.aspect;
		}
		
		camera.updateProjectionMatrix();
		
		var sideToCenter = renderer.domElement.width / 2;
		var topToCenter = renderer.domElement.height / 2;
		
		{
			var extras = document.getElementById("extras");
			var halfExtrasWidth = extras.offsetWidth / 2;
			extras.style.margin = "0 0 0 -" + halfExtrasWidth.toString() + "px";
		}
	}
	respondToResize();
	window.addEventListener( 'resize', respondToResize, false );
	
	var lights = Array(2);
	lights[0] = new THREE.AmbientLight( 0xffffff, 0.82 );
	lights[1] = new THREE.PointLight( 0xffffff, 0.5 );
	lights[1].position.set(1,0.5,1);
	lights[1].position.setLength( 100 );
	scene.add(lights[0]);
	scene.add(lights[1]);
	
	//---------SOUND
	Sounds = {};
	var soundInfoArray = [
		"change0",
		"change1",
		"grab",
		"release",
		"pop1",
		"pop2",
		"pop3"
	];
	for(var i = 0; i < soundInfoArray.length; i++)
		Sounds[soundInfoArray[i]] = new Audio( "data/" + soundInfoArray[i] + ".mp3" );
	
	var squareDimension = 0.03;

	var numTypes = 5;
	var grid = arrayOfArrays(numTypes*4+1+2);
	/*
		0 = floor
		1 = wall
		2 = trainer
		3 = pokeball
	*/

	function makeSquare(color)
	{
		if(color === undefined)
		{
			color = new THREE.Color(Math.random(),Math.random(),Math.random())
		}
		var newSquare = new THREE.Mesh(new THREE.PlaneGeometry(squareDimension,squareDimension),new THREE.MeshBasicMaterial());
		newSquare.material.color.copy(color);
		scene.add(newSquare);
		return newSquare;
	}
	var wallColor = new THREE.Color(0.1,0.2,0.6);
	var opponentColor = new THREE.Color(1,0,0);
	var pokeballColor = new THREE.Color(0,1,0);
	function makeGameObject(type)
	{
		if(type === "floor")
		{
			return makeSquare();
		}
		if(type === "wall")
		{
			return makeSquare(wallColor);
		}
		if(type === "opponent")
		{
			return makeSquare(opponentColor);
		}
		if(type === "pokeball")
		{
			return makeSquare(pokeballColor);
		}
	}

	var avatar = makeSquare();
	avatar.velocity = new THREE.Vector3();
	avatar.position.y = -squareDimension * 2;

	for(var i = 0; i < grid.length; i++)
	{
		for(var j = 0; j < grid.length; j++)
		{ 
			objectType = "";
			if(i===0 || i === grid.length-1 || j===0 || j === grid.length-1 ||
				((i-2)%4 === 0 && (j-4)%4 === 0 ) ||
				((i-3)%4 === 0 && (j-4)%4 === 0 ) ||
				((i-4)%4 === 0 && (j-4)%4 === 0 ) ||
				((i-2)%4 === 0 && (j-3)%4 === 0 ) ||
				((i-2)%4 === 0 && (j-2)%4 === 0 ) ||
				((i-4)%4 === 0 && (j-3)%4 === 0 ) )
			{
				objectType = "wall";
			}
			else if( (i-4)%4 === 0 && (j-2)%4 === 0 )
			{
				objectType = "opponent";
			}
			else if( (i-3)%4 === 0 && (j-3)%4 === 0 )
			{
				objectType = "pokeball";
			}
			else
			{
				continue;
			}

			if( j === grid.length-1 && i === Math.floor(grid.length/2) )
			{
				objectType = "opponent";
			}

			grid[i][j] = makeGameObject(objectType);

			grid[i][j].position.set(
				( i - grid.length / 2 + 0.5 ) * squareDimension,
				( j - grid.length / 2 + 0.5 ) * squareDimension,0);
		}
	}
	/*
	Aqua
	Bug
	
	Dark
	Electric
	Fire
	Grass
	Ice

	Normal
	Poison
	Rock
	Steel
	Water

	*/

	var buttonsHeld = {};
	function associateKeyHoldToBoolean(keyCode, buttonKey)
	{
		document.addEventListener( 'keydown', function(event)
		{
			if(event.keyCode === keyCode )
			{
				buttonsHeld[buttonKey] = true;
			}
		});
		document.addEventListener( 'keyup', function(event)
		{
			if(event.keyCode === keyCode )
			{
				buttonsHeld[buttonKey] = false;
			}
		});
	}
	associateKeyHoldToBoolean(87, "forward");
	associateKeyHoldToBoolean(83, "backward");
	associateKeyHoldToBoolean(65, "left");
	associateKeyHoldToBoolean(68, "right");
	
	(function loop()
	{
		frameDelta = ourclock.getDelta();
		timeSinceStart += frameDelta;

		// if()
		// if(buttonsHeld.forward)
		// {
		// 	avatar.velocity.y = 1;
		// 	avatar.velocity.x = 0;
		// }
		// else if(buttonsHeld.backward)
		// {
		// 	avatar.velocity.y = -1;
		// 	avatar.velocity.x = 0;
		// }

		// if(buttonsHeld.left)
		// {
		// 	avatar.velocity.x = -1;
		// 	avatar.velocity.y = 0;
		// }
		// else if(buttonsHeld.right)
		// {
		// 	avatar.velocity.x = 1;
		// 	avatar.velocity.y = 0;
		// }
		// else
		// {
		// 	avatar.velocity.set(0,0,0);
		// }
		
		requestAnimationFrame( loop );
		renderer.render( scene, camera );
	})();
}