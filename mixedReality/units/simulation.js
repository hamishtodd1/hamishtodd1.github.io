async function initBasicSimulation() {
	let dimensions = new THREE.Vector2(11,7);

	let initialState = new Float32Array( dimensions.x * dimensions.y * 4 );
	for ( let row = 0; row < dimensions.y; row ++ )
	for ( let column = 0; column < dimensions.x; column ++ )
	{
		let firstIndex = (row * dimensions.x + column) * 4;

		initialState[ firstIndex + 0 ] = Math.random();
		initialState[ firstIndex + 1 ] = 0.;
		initialState[ firstIndex + 2 ] = 0.;
		initialState[ firstIndex + 3 ] = 0.;

		if( column == 1 )
			initialState[ firstIndex + 0 ] = 0.;
		if( row == 2 )
			initialState[ firstIndex + 0 ] = 0.;
	}

	let displayMaterial = new THREE.ShaderMaterial( {
		blending: 0, //prevent default premultiplied alpha values
		uniforms:
		{
			simulationTexture: { value: null },
		},
		vertexShader:	[
			'precision highp float;',
			'varying vec2 vUV;',

			'void main (void) {',
				'vUV = uv;', //necessary? Needs to be vec2
				'gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );',
			'}'
		].join( '\n' ),
		fragmentShader:	[
			'precision highp float;',
			'varying vec2 vUV;',
			'uniform sampler2D simulationTexture;',

			'void main (void) {',
				'vec3 simulationRgb = texture2D(simulationTexture, vUV).rgb;',

				'float shadeOfGrey = clamp(simulationRgb.r,0.,1.);',

				'gl_FragColor = vec4( shadeOfGrey, shadeOfGrey, shadeOfGrey, 1.0 );',
			'}'
		].join( '\n' )
	} );

	let numStepsPerFrame = 1;
	await Simulation(dimensions,"basicSimulation", "clamped", initialState, numStepsPerFrame, displayMaterial.uniforms.simulationTexture )

	let displayMesh = new THREE.Mesh(
		new THREE.PlaneBufferGeometry( 0.3 * dimensions.x / dimensions.y, 0.3 ),
		displayMaterial );
	scene.add( displayMesh );
	log(displayMesh)
	
	updateFunctions.push(()=>{
		displayMesh.position.copy(hands[0].position)
	})
}

async function Simulation( 
	dimensions, simulationShaderFilename,
	boundaryConditions,
	stateArray,
	numStepsPerFrameSpecification,
	objectToAssignSimulationTexture,
	extraUniforms,
	filter)
{
	let wrap = boundaryConditions === "periodic" ? THREE.RepeatWrapping : THREE.ClampToEdgeWrapping;

	//would be good to make it always nearest in simulation, always linear in viz
	if(filter === undefined)
	{
		filter = THREE.NearestFilter;
	}

	let params = {
		minFilter: filter,
		magFilter: filter,
		wrapS: wrap,
		wrapT: wrap,
		format: THREE.RGBAFormat,
		stencilBuffer: false,
		depthBuffer: false,
		premultiplyAlpha: false,
		type: THREE.FloatType // THREE.HalfFloat for speed
	};
	let pingFramebuffer = new THREE.WebGLRenderTarget( dimensions.x, dimensions.y, params );
	let pongFramebuffer = new THREE.WebGLRenderTarget( dimensions.x, dimensions.y, params );

	let initialStateTexture = new THREE.DataTexture( stateArray, dimensions.x, dimensions.y, THREE.RGBAFormat );
	initialStateTexture.wrapS = wrap;
	initialStateTexture.wrapT = wrap;
	initialStateTexture.type = params.type;
	initialStateTexture.needsUpdate = true;

	let simulationMaterial = new THREE.ShaderMaterial( { //not raw coz you need position
		uniforms:
		{
			"oldState":	{ value: null },
			"deltaTime":{ value: null },
			"dimensions":{ value: dimensions }
		},
		vertexShader: [
			'varying vec2 vUV;',

			'void main (void) {',
				'vUV = position.xy * 0.5 + 0.5;',
				'gl_Position = vec4(position, 1.0 );',
			'}'
		].join( '\n' ),
		blending: 0, //prevent default premultiplied alpha values
		depthTest: false
	} );

	if(extraUniforms !== undefined)
	{
		Object.assign(simulationMaterial.uniforms,extraUniforms)
		log(simulationMaterial.uniforms)
	}

	await assignShader(simulationShaderFilename, simulationMaterial, "fragment");

	let ping = true;
	let simScene = new THREE.Scene();
	let simCamera = new THREE.OrthographicCamera();
	simCamera.position.z = 1;
	renderer.clearColor( 0xffffff ); //hmm
	let simulationMesh = new THREE.Mesh( new THREE.PlaneBufferGeometry( 2, 2 ), simulationMaterial );
	simScene.add( simulationMesh );

	let doneOne = false;

	let renderTarget = null;

	let simulation = {
		// simulationTexture: null,
		speed:10.,
		paused:false,
		stateArray,
		updateStateArray:function() {
			renderer.readRenderTargetPixels( renderTarget,0,0,64,64,stateArray )
		}
	}

	let initial = true;
	updateFunctions.push( function()
	{
		let numStepsPerFrame = typeof numStepsPerFrameSpecification === "number" ? numStepsPerFrameSpecification:numStepsPerFrameSpecification.value;

		if(simulation.paused || numStepsPerFrame === 0)
			return;

		let nonSimulationRenderTarget = renderer.getRenderTarget();
		{
			for( let i = 0; i < numStepsPerFrame; i++ )
			{
				if( initial )
				{
					simulationMaterial.uniforms.oldState.value = initialStateTexture;
					initial = false;
				}
				else
				{
					simulationMaterial.uniforms.oldState.value = ping ? pingFramebuffer.texture : pongFramebuffer.texture;
				}

				simulationMaterial.uniforms.deltaTime.value = clamp(frameDelta,0.,1./30) * simulation.speed;

				renderTarget = ping ? pongFramebuffer : pingFramebuffer
				renderer.setRenderTarget( renderTarget );
				renderer.render( simScene, simCamera );
				simulationMaterial.uniforms.oldState.value = renderTarget.texture;
				
				ping = !ping;
			}

			objectToAssignSimulationTexture.value = renderTarget.texture;
		}
		renderer.setRenderTarget( nonSimulationRenderTarget );
	} );

	return simulation
}