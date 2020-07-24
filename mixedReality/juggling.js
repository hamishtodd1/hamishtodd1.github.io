/*
	Tweakables
		ball radius
		Hand radius

	Training wheels
		Keep it in same plane
		Gravity not so bad

	Generalize to higher dimensions
		Juggle with circles
*/

function initJuggling()
{
	{
		//floor
		let floorDimension = 16;
		let floor = new THREE.Mesh( new THREE.PlaneBufferGeometry( floorDimension, floorDimension ), new THREE.MeshLambertMaterial() );
		floor.rotation.x = -TAU / 4;
		scene.add(floor);
		new THREE.TextureLoader().setCrossOrigin(true).load(
			"data/floor.png",
			function(texture)
			{
				texture.magFilter = THREE.NearestFilter;
				floor.material.map = texture;
			},
			function ( xhr ) {}, function ( xhr ) {console.log( 'texture loading error' );}
		);

		updateFunctions.push(function()
		{
			if(hands[RIGHT_CONTROLLER_INDEX].button2)
			{
				floor.position.y = hands[RIGHT_CONTROLLER_INDEX].position.y
			}
		})


	}

	{
		let title = makeTexttitle("Controls:")
		scene.add(title)
		title.scale.multiplyScalar(.1)
		title.position.copy(camera.position)
		title.position.z = -.4

		for(let i = 0; i < controlStrings.length; i++)
		{
			let sign = makeTextSign(controlStrings[i])
			scene.add(sign)
			sign.scale.multiplyScalar(.1)
			sign.position.copy(camera.position)
			sign.position.z = -.4			
		}
	}


	let balls = Array(50)
	let ballRadius = .05
	let ballGeometry = new THREE.SphereBufferGeometry(ballRadius)
	for(let i = 0; i < balls.length; i++)
	{
		balls[i] = new THREE.Mesh(ballGeometry,new THREE.MeshPhongMaterial({color:new THREE.Color(Math.random(),Math.random(),Math.random())}))
		balls[i].position.x = i*.02
		balls[i].position.y = 1.6
		balls[i].position.z = -1.;
		scene.add(balls[i])

		{
			balls[i].velocity = new THREE.Vector3()
		}
	}

	updateFunctions.push(function()
	{
		for(let i = 0; i < balls.length; i++)
		{
			balls[i].velocity.y += -9.81
			balls[i].position.add(balls[i].velocity)
			if(balls[i].position.y < ballRadius)
			{
				balls[i].position.y = 0.
				balls[i].velocity.y *= -1.
			}
		}
	})
}