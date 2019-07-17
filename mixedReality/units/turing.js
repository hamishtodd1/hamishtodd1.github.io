async function initGrayScottSimulation()
{
	//would be nice to have looooads of them and it is when you zoom out that they blur together
	{
		let pointsGeometry = new THREE.Geometry();
		let numPoints = 200;
		let points = Array(numPoints);
		for(let i = 0; i < numPoints; i++)
		{
			points[i] = {
				position: new THREE.Vector3(
							0.1 * Math.random(),
							0.1 * Math.random(),
							0),
				velocity: new THREE.Vector3(
							0.002 * (Math.random() - 0.5),
							0.002 * (Math.random() - 0.5),
							0),
				color: new THREE.Color().copy(discreteViridis[Math.floor(Math.random() * 3)].color)
			}

			pointsGeometry.vertices.push(points[i].position);
			pointsGeometry.colors.push(points[i].color);
		}

		let pointsMesh = new THREE.Points(pointsGeometry, new THREE.PointsMaterial(
		{
			size: 0.006,
			vertexColors: THREE.VertexColors
		}))
		scene.add(pointsMesh)
		pointsMesh.position.copy(rightHand.position)
		pointsMesh.position.z += 0.1

		let pl = new THREE.Mesh(new THREE.OriginCorneredPlaneBufferGeometry(0.1,0.1), new THREE.MeshBasicMaterial({color:0x000000}))
		scene.add(pl)
		pl.position.copy(pointsMesh.position)
		pl.position.z -= 0.001

		let limits = {
			left:0,
			right:0.1,
			top:0.1,
			bottom:0
		}

		updateFunctions.push(function()
		{
			// particle.position.x = upperLimit.Math.random() * 

			for(let i = 0; i < numPoints; i++)
			{
				let p = points[i];
				p.position.add(p.velocity)

				if(p.position.x > limits.right)
				{
					p.velocity.x *= -1;
					p.position.x = limits.right - (p.position.x - limits.right)
				}
				if(p.position.x < limits.left)
				{
					p.velocity.x *= -1;
					p.position.x = limits.left + (-p.position.x + limits.left)
				}
				if(p.position.y > limits.top)
				{
					p.velocity.y *= -1;
					p.position.y = limits.top - (p.position.y - limits.top)
				}
				if(p.position.y < limits.bottom)
				{
					p.velocity.y *= -1;
					p.position.y = limits.bottom + (-p.position.y + limits.bottom)
				}

				// if(p.color.r === discreteViridis[0].color.r && Math.random() < 0.01)
				// {
				// 	p.color.copy(discreteViridis[1].color) //1 gets fed by 0
				// }
				// if(p.color.r === discreteViridis[2].color.r && Math.random() < 0.01)
				// {
				// 	p.color.copy(discreteViridis[0].color) //2 gets killed to 0
				// }

				numNearby = 0;
				if(p.color.r === discreteViridis[1].color.r)
				{
					for(let j = 0; j < numPoints; j++)
					{
						if( points[j].color.r === discreteViridis[2].color.r &&
							points[j].position.distanceToSquared(p.position) < 0.00001 )
						{
							numNearby++;
						}
					}
					if(numNearby >= 2)
					{
						p.color.copy( discreteViridis[2].color )
					}
				}

				// kill and feed
				//why does it happen?
				// black (can switch to blue) ones that occasionally turn red
				// aaaaand green ones can occasionally turn black

				/*
					Ok though, so how does a reaction diffusion system work?

					We are going to pause this thing and massively zoom in on the pixels here.
					What do we see,
					[explain diffusion]
					If you just have diffusion, things are, well, not super interesting, the things just mix together in a simple way
					You have to have this other thing which is reaction. Now this is the part that allows for the diversity of reaction diffusion systems (show all the videos), because there are many chemicals that react in lots of different ways. We're going to take a simple kind of reaction.
					First, 
					
					have the background of the box reflect the chemicals in there
				*/
			}

			pointsGeometry.verticesNeedUpdate = true;
			pointsGeometry.colorsNeedUpdate = true;
		})
	}

	return;

	let dimensions = new THREE.Vector2(1024,1024);

	let initialState = new Float32Array( dimensions.x * dimensions.y * 4 );
	for ( let row = 0; row < dimensions.y; row ++ )
	for ( let column = 0; column < dimensions.x; column ++ )
	{
		let firstIndex = (row * dimensions.x + column) * 4;

		initialState[ firstIndex + 0 ] = 0.;
		initialState[ firstIndex + 1 ] = 0.;
		initialState[ firstIndex + 2 ] = 0.;
		initialState[ firstIndex + 3 ] = 0.;

		if( 40 < column && column < 60 )
		{
			initialState[ firstIndex + 0 ] = 1.;
		}
		if( 40 < row && row < 60 )
		{
			initialState[ firstIndex + 1 ] = 1.;
		}
	}

	let displayMaterial = new THREE.ShaderMaterial( {
		blending: 0, //prevent default premultiplied alpha values
		uniforms:
		{
			simulationTexture: { value: null },
		},
		vertexShader: [
			'precision highp float;',
			'varying vec2 vUV;',

			'void main (void) {',
				'vUV = uv;', //necessary? Needs to be varying vec2
				'gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );',
			'}'
		].join( '\n' ),
		fragmentShader: [
			'precision highp float;',
			'varying vec2 vUV;',
			'uniform sampler2D simulationTexture;',

			'void main (void) {',
				'vec2 uv = texture2D(simulationTexture, vUV).rg;',

				'gl_FragColor = vec4( uv, 0., 1.0 );',
			'}'
		].join( '\n' )
	} );

	let numStepsPerFrame = 30;
	await Simulation(dimensions,"grayScottSimulation", "periodic", initialState, numStepsPerFrame, displayMaterial.uniforms.simulationTexture )

	let displayMesh = new THREE.Mesh(
		new THREE.PlaneBufferGeometry( 0.3 * dimensions.x / dimensions.y, 0.3 ),
		displayMaterial );
	scene.add( displayMesh );
	displayMesh.position.copy(hands[0].position)
}