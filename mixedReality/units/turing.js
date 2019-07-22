/*
	https://www.youtube.com/watch?v=Av6EUqf10vM
*/

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
					But what exactly is a reaction diffusion system? Well, I have a simple simulation of one here
						it's quite interesting and dynamic
						You can make lots of pretty stuff with some fairly clear resemblence to different animals
						Especially if I change the colors
					But how is this thing actually generating the patterns? Well it's very simple,
						we're going to zoom in and slow down
					Full of particles, just moving around randomly, which is what what molecules do all the time
					Now "diffusion" is something that you can already see going on here, and I'm going to make it a bit easier to see. Let's pause
					Suppose that for some reason you have a situation where, temporarily, we have a high concentration of one kind of molecule in one place like this
					If we let time run forward, it all spreads out slowly, and eventually it's all completely equal
						This situation is exactly what you have when somebody farts, as captured by this thermal camera
					Aaaaand this is what diffusion is, the spreading out of chemicals until everything is mixed.

					The reaction part you can probably guess. Let's zoom in again and pretend there are very few molecules around.
					The chemicals that we can see now can transform into one another


					Features needed:
						Hide all
						Show those that don't react
						Show only those that react into one another
						Reduce such that there are only enough to see a single reaction
						Change averaged colors.
						Confine to a single square
						"paint"

					You have to have this other thing which is reaction. Now . We're going to take a simple kind of reaction.

					this is the part that allows for the diversity of reaction diffusion systems (show all the videos), because there are many chemicals that react in lots of different ways
					
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