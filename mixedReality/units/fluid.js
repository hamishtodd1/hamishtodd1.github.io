async function initFluid(gl)
{
	let displayMaterial = new THREE.ShaderMaterial( {
		blending: 0, //prevent default premultiplied alpha values
		uniforms:
		{
			simulationTexture: { value: null },
		},
		vertexShader: `
			precision highp float;
			varying vec2 vUV;

			void main (void) {
				vUV = uv;
				gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
			}
		`,
		fragmentShader: `
			precision highp float;
			varying vec2 vUV;
			uniform sampler2D simulationTexture;

			void main (void)
			{
				float c = texture2D(simulationTexture, vUV).r;
				gl_FragColor = vec4(c, c, 1., 1.);
			}
		`
	} );

	let dimensions = new THREE.Vector2(512, 512);
	let numStepsPerFrame = { value: 3 };
	{
		let n = dimensions.x
		let n1 = n - 1, h = 1 / n1, t = 0;
		var fluidInitialState = new Float32Array(4 * n * n);
		for (let i = 0; i < n; i++)
		for (let j = 0; j < n; j++) {
			let x = h * (j - n / 2), y = h * (i - n / 2);
			// fluidInitialState[t++] = 50. * Math.exp(-5000. * (x * x + y * y));
			// fluidInitialState[t++] = 50. * Math.exp(-5000. * (x * x + y * y));
			fluidInitialState[t++] = 0.;
			fluidInitialState[t++] = 0.;
			fluidInitialState[t++] = 0; fluidInitialState[t++] = 0;
		}
	}

	let brush = new THREE.Vector2(-.5, -.5);
	let oldBrush = new THREE.Vector2(-.5, -.5);
	let newBrush = new THREE.Vector2(-.5, -.5);
	updateFunctions.push(() => {
		hands[0].visible = false
		{
			displayMesh.scale.setScalar(0.3)
			displayMesh.position.copy(hands[0].position)
			displayMesh.position.x -= displayMesh.scale.x / 2
			displayMesh.position.y -= displayMesh.scale.y / 2
		}

		let zZeroPosition = mouse.rayIntersectionWithZPlane(hands[0].position.z)
		newBrush.copy(zZeroPosition)
		newBrush.sub(displayMesh.position)
		newBrush.x /= displayMesh.scale.x
		newBrush.y /= displayMesh.scale.y

		if (!oldBrush.equals(newBrush))
			brush.copy(newBrush)
		else
			brush.set(-.5,-.5)

		oldBrush.copy(newBrush)
	})

	let simulation = await Simulation(
		dimensions,"fluid", "nonperiodic", fluidInitialState, numStepsPerFrame,
		displayMaterial.uniforms.simulationTexture,
		{brush:{value:brush}},
		THREE.LinearFilter,
		fluidInitialState )

	bindToggle("p",simulation,"paused")

	let displayMesh = new THREE.Mesh(
		new THREE.OriginCorneredPlaneBufferGeometry( dimensions.x / dimensions.y, 1. ),
		displayMaterial );
	scene.add( displayMesh );
}