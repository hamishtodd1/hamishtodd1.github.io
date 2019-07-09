async function initGrayScottSimulation()
{
	let dimension = 512;

	let initialState = new window.Float32Array( dimension * dimension * 4 );
	for ( let i = 0; i < dimension; i ++ )
	{
		for ( let j = 0; j < dimension; j ++ )
		{
			let firstIndex = i * dimension * 4 + j * 4;

			initialState[ firstIndex + 0 ] = 0;
			initialState[ firstIndex + 1 ] = 0;
			initialState[ firstIndex + 2 ] = 0.;
			initialState[ firstIndex + 3 ] = 0.;

			if( 40 < i && i < 60 )
			{
				initialState[ firstIndex + 0 ] = 1.;
			}
			if( 40 < j && j < 60 )
			{
				initialState[ firstIndex + 1 ] = 1.;
			}
		}
	}

	let displayMaterial = new THREE.ShaderMaterial( {
		uniforms:
		{
			"simulationTexture":	{ value: null },
		},
		vertexShader: [
			'precision highp float;',

			'varying vec2 vUV;',

			'void main (void) {',
				'vUV = uv;', //necessary? Needs to be vec2
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
		].join( '\n' ),
		blending: 0 //prevent default premultiplied alpha values
	} );

	let numStepsPerFrame = 100;
	await Simulation(dimension,"grayScottSimulation", "periodic", initialState, numStepsPerFrame, displayMaterial )

	let displayMesh = new THREE.Mesh(
		new THREE.PlaneBufferGeometry( 0.3, 0.3 ),
		displayMaterial );
	scene.add( displayMesh );
	displayMesh.position.copy(handControllers[0].position)
}

async function initBasicSimulation()
{
	let dimension = 8;

	let initialState = new window.Float32Array( dimension * dimension * 4 );
	for ( let i = 0; i < dimension; i ++ )
	{
		for ( let j = 0; j < dimension; j ++ )
		{
			initialState[ i * dimension * 4 + j * 4 + 0 ] = Math.random();
			initialState[ i * dimension * 4 + j * 4 + 1 ] = 0.0;
			initialState[ i * dimension * 4 + j * 4 + 2 ] = 0.0;
			initialState[ i * dimension * 4 + j * 4 + 3 ] = 0.0;
		}
	}

	let displayMaterial = new THREE.ShaderMaterial( {
		uniforms:
		{
			"simulationTexture":	{ value: null },
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
		].join( '\n' ),
		blending: 0 //prevent default premultiplied alpha values
	} );

	let numStepsPerFrame = 1;
	await Simulation(dimension,"basicSimulation", "clamped", initialState, numStepsPerFrame, displayMaterial )

	let displayMesh = new THREE.Mesh(
		new THREE.PlaneBufferGeometry( 0.3, 0.3 ),
		displayMaterial );
	scene.add( displayMesh );
	displayMesh.position.copy(handControllers[0].position)
}

async function Simulation( dimension, simulationShaderFilename, boundaryConditions, initialState, numStepsPerFrame, displayMaterial)
{
	let wrap = boundaryConditions === "periodic" ? THREE.RepeatWrapping : THREE.ClampToEdgeWrapping;

	let params = {
		minFilter: THREE.NearestFilter,
		magFilter: THREE.NearestFilter,
		wrapS: wrap,
		wrapT: wrap,
		format: THREE.RGBAFormat,
		stencilBuffer: false,
		depthBuffer: false,
		premultiplyAlpha: false,
		type: THREE.FloatType // THREE.HalfFloat for speed
	};
	let pingFramebuffer = new THREE.WebGLRenderTarget( dimension, dimension, params );
	let pongFramebuffer = new THREE.WebGLRenderTarget( dimension, dimension, params );

	let initialStateTexture = new THREE.DataTexture( initialState, dimension, dimension, THREE.RGBAFormat );
	initialStateTexture.wrapS = wrap;
	initialStateTexture.wrapT = wrap;
	initialStateTexture.type = params.type;
	initialStateTexture.needsUpdate = true;

	let simulationMaterial = new THREE.ShaderMaterial( { //not raw coz you need position
		uniforms:
		{
			"oldState":	{ value: null },
			"deltaTime":{ value: null },
			"dimension":{ value: dimension } //worth knowing so you can get the surrounding ones
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

	await assignShader(simulationShaderFilename, simulationMaterial, "fragment");

	let ping = true;
	let simScene = new THREE.Scene();
	let simCamera = new THREE.OrthographicCamera();
	simCamera.position.z = 1;
	renderer.clearColor( 0xffffff ); //hmm
	let simulationMesh = new THREE.Mesh( new THREE.PlaneBufferGeometry( 2, 2 ), simulationMaterial );
	simScene.add( simulationMesh );

	let initial = true;
	updateFunctions.push( function()
	{
		let nonSimulationRenderTarget = renderer.getRenderTarget();

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

			simulationMaterial.uniforms.deltaTime.value = frameDelta;

			var renderTarget = ping ? pongFramebuffer : pingFramebuffer
			renderer.setRenderTarget( renderTarget );
			renderer.render( simScene, simCamera );
			simulationMaterial.uniforms.oldState.value = renderTarget.texture;
			
			ping = !ping;
		}

		displayMaterial.uniforms.simulationTexture.value = renderTarget.texture;

		renderer.setRenderTarget( nonSimulationRenderTarget );
	} );
}