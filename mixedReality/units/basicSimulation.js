function initBasicSimulation()
{
	let simulationShaderStuff = {
		uniforms: {
			"oldState":	{ value: null },
			"deltaTime":{ value: null },
			"dimension":{ value: null } //worth knowing so you can get the surrounding ones
		},
		vertexShader: [
			'varying vec2 vUV;',

			'void main (void) {',
				'vUV = position.xy * 0.5 + 0.5;', //it's just orthographic, no need for camera crap
				'gl_Position = vec4(position, 1.0 );',
			'}'
		].join( '\n' ),
		fragmentShader: [
			'precision highp float;',
			'#include <common>', //hmm

			'varying vec2 vUV;',

			'uniform sampler2D oldState;',
			'uniform float deltaTime;',
			'uniform float dimension;',

			'void main (void) {',
				'float oldValue = texture2D(oldState, vUV).r;',

				'float newValue = oldValue;',
				// 'if( newValue == 0.0 )',
				// '{',
				// 	'newValue = 1.0;',
				// '}',
				// 'else',
				// '{',
				// 	'newValue = 0.0;',
				// '}',

				'gl_FragColor = vec4(newValue, 0.0, 0.0, 1.0);', //can you get anything into alpha? Dunno
			'}'
		].join( '\n' )
	};

	let displayShaderStuff = {
		uniforms: {
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
				'vec3 simulationRgb = texture2D(simulationTexture, vUV).rgb;',

				'float val = 1.0;',
				'if(simulationRgb.r > 0.5)',
				'{',
					'val = 0.0;',
				'}',

				'gl_FragColor = vec4( val, val, val, 1.0 );',
			'}'
		].join( '\n' )
	};

	const dimension = 8

	{
		var ping = true;
		var simScene = new THREE.Scene();
		var simCamera = new THREE.OrthographicCamera();
		simCamera.position.z = 1;
		renderer.clearColor( 0xffffff );

		var params = {
			minFilter: THREE.NearestFilter,
			magFilter: THREE.NearestFilter,
			wrapS: THREE.ClampToEdgeWrapping,
			wrapT: THREE.ClampToEdgeWrapping,
			format: THREE.RGBAFormat,
			stencilBuffer: false,
			depthBuffer: false,
			premultiplyAlpha: false,
			type: THREE.FloatType // THREE.HalfFloat for speed
		};
		var pingFramebuffer = new THREE.WebGLRenderTarget( dimension, dimension, params );
		var pongFramebuffer = new THREE.WebGLRenderTarget( dimension, dimension, params );

		var simulationMaterial = new THREE.ShaderMaterial( { //not raw coz you need position
			uniforms:		simulationShaderStuff.uniforms,
			vertexShader:	simulationShaderStuff.vertexShader,
			fragmentShader:	simulationShaderStuff.fragmentShader
		} );
		simulationMaterial.uniforms.dimension = { value: dimension };
		simulationMaterial.blending = 0; //prevent default premultiplied alpha values
		simulationMaterial.depthTest = false
		var simulationMesh = new THREE.Mesh( new THREE.PlaneBufferGeometry( 2, 2 ), simulationMaterial );
		simScene.add( simulationMesh );
	}

	let displayMaterial = new THREE.ShaderMaterial( {
		uniforms:		displayShaderStuff.uniforms,
		vertexShader:	displayShaderStuff.vertexShader,
		fragmentShader:	displayShaderStuff.fragmentShader
	} );
	displayMaterial.blending = 0; //prevent default premultiplied alpha values
	let displayMesh = new THREE.Mesh(
		new THREE.PlaneBufferGeometry( 0.3, 0.3 ),
		displayMaterial );
	scene.add( displayMesh );

	displayMesh.position.copy(camera.position)
	displayMesh.position.z -= 1
	log(camera.position)

	function generateInitialTexture()
	{
		let initialState = new window.Float32Array( dimension * dimension * 4 );
		for ( let i = 0; i < dimension; i ++ )
		{
			for ( let j = 0; j < dimension; j ++ )
			{
				initialState[ i * dimension * 4 + j * 4 + 0 ] = Math.random() > 0.5 ? 1.0:0.0;
				initialState[ i * dimension * 4 + j * 4 + 1 ] = 0.0;
				initialState[ i * dimension * 4 + j * 4 + 2 ] = 0.0;
				initialState[ i * dimension * 4 + j * 4 + 3 ] = 0.0;
			}
		}
		let initialStateTexture = new THREE.DataTexture( initialState, dimension, dimension, THREE.RGBAFormat );
		initialStateTexture.wrapS = THREE.ClampToEdgeWrapping;
		initialStateTexture.wrapT = THREE.ClampToEdgeWrapping;
		initialStateTexture.type = THREE.FloatType;
		initialStateTexture.needsUpdate = true;

		return initialStateTexture;
	}

	let initial = true;
	updateFunctions.push( function()
	{
		let nonSimulationRenderTarget = renderer.getRenderTarget();
		{
			if( initial )
			{
				simulationMaterial.uniforms.oldState.value = generateInitialTexture();
				initial = false;
			}
			else
			{
				simulationMaterial.uniforms.oldState.value = ping ? pingFramebuffer.texture : pongFramebuffer.texture;
			}

			simulationMaterial.uniforms.deltaTime.value = frameDelta;

			let renderTarget = ping ? pongFramebuffer : pingFramebuffer
			renderer.setRenderTarget( renderTarget );
			renderer.render( simScene, simCamera );
			simulationMaterial.uniforms.oldState.value = renderTarget.texture;
			displayMaterial.uniforms.simulationTexture.value = renderTarget.texture;
			ping = !ping;
		}
		renderer.setRenderTarget( nonSimulationRenderTarget );
	} )
}