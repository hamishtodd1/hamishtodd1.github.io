THREE.Ocean = function ( renderer, camera, actualScene )
{
	const geometrySize = 512
	const sunDirectionX = -1.0
	const sunDirectionY = 1.0
	const sunDirectionZ = 1.0
	const waterColor = new THREE.Vector3( 0.004, 0.016, 0.047 )
	const skyColor = new THREE.Vector3( 3.2, 9.6, 12.8 )
	const exposure = 0.35
	const resolution = 1024
	const geometryResolution = resolution / 2
	const windX = 10.0
	const windY = 10.0
	const size = 256.0
	const choppiness = 1.5

	// parameter change flags
	let changed = true;
	let initial = true;

	let pingPhase = true;
	let ourScene = new THREE.Scene();
	let ourCamera = new THREE.OrthographicCamera();
	ourCamera.position.z = 1;
	renderer.clearColor( 0xffffff );

	// framebuffers
	{
		var renderTargetType = THREE.FloatType //THREE.HalfFloatType

		var LinearClampParams = {
			minFilter: THREE.LinearFilter,
			magFilter: THREE.LinearFilter,
			wrapS: THREE.ClampToEdgeWrapping,
			wrapT: THREE.ClampToEdgeWrapping,
			format: THREE.RGBAFormat,
			stencilBuffer: false,
			depthBuffer: false,
			premultiplyAlpha: false,
			type: renderTargetType
		};
		var NearestClampParams = {
			minFilter: THREE.NearestFilter,
			magFilter: THREE.NearestFilter,
			wrapS: THREE.ClampToEdgeWrapping,
			wrapT: THREE.ClampToEdgeWrapping,
			format: THREE.RGBAFormat,
			stencilBuffer: false,
			depthBuffer: false,
			premultiplyAlpha: false,
			type: renderTargetType
		};
		var NearestRepeatParams = {
			minFilter: THREE.NearestFilter,
			magFilter: THREE.NearestFilter,
			wrapS: THREE.RepeatWrapping,
			wrapT: THREE.RepeatWrapping,
			format: THREE.RGBAFormat,
			stencilBuffer: false,
			depthBuffer: false,
			premultiplyAlpha: false,
			type: renderTargetType
		};
		var initialSpectrumFramebuffer	 = new THREE.WebGLRenderTarget( resolution, resolution, NearestRepeatParams );
		var spectrumFramebuffer			 = new THREE.WebGLRenderTarget( resolution, resolution, NearestClampParams );
		var pingPhaseFramebuffer		 = new THREE.WebGLRenderTarget( resolution, resolution, NearestClampParams );
		var pongPhaseFramebuffer		 = new THREE.WebGLRenderTarget( resolution, resolution, NearestClampParams );
		var pingTransformFramebuffer	 = new THREE.WebGLRenderTarget( resolution, resolution, NearestClampParams );
		var pongTransformFramebuffer	 = new THREE.WebGLRenderTarget( resolution, resolution, NearestClampParams );
		var displacementMapFramebuffer	 = new THREE.WebGLRenderTarget( resolution, resolution, LinearClampParams );
		var normalMapFramebuffer		 = new THREE.WebGLRenderTarget( resolution, resolution, LinearClampParams );
	}

	// Shaders and constant uniforms
	{
		// 0 - The vertex shader used in all of the simulation steps
		var fullscreenVertexShader = THREE.ShaderLib[ "ocean_sim_vertex" ];

		// 1 - Horizontal wave vertices used for FFT
		var windHorizontalShader = THREE.ShaderLib[ "ocean_subtransform" ];
		var materialWindHorizontal = new THREE.ShaderMaterial( {
			uniforms: THREE.UniformsUtils.clone( windHorizontalShader.uniforms ),
			vertexShader: fullscreenVertexShader.vertexShader,
			fragmentShader: "#define HORIZONTAL \n" + windHorizontalShader.fragmentShader
		} );
		materialWindHorizontal.uniforms.u_transformSize = { value: resolution };
		materialWindHorizontal.uniforms.u_subtransformSize = { value: null };
		materialWindHorizontal.uniforms.u_input = { value: null };
		materialWindHorizontal.depthTest = false;

		// 2 - Vertical wave vertices used for FFT
		var windVerticalShader = THREE.ShaderLib[ "ocean_subtransform" ];
		var materialWindVertical = new THREE.ShaderMaterial( {
			uniforms: THREE.UniformsUtils.clone( windVerticalShader.uniforms ),
			vertexShader: fullscreenVertexShader.vertexShader,
			fragmentShader: windVerticalShader.fragmentShader
		} );
		materialWindVertical.uniforms.u_transformSize = { value: resolution };
		materialWindVertical.uniforms.u_subtransformSize = { value: null };
		materialWindVertical.uniforms.u_input = { value: null };
		materialWindVertical.depthTest = false;

		// 3 - Initial spectrum used to generate height map
		var initialSpectrumShader = THREE.ShaderLib[ "ocean_initial_spectrum" ];
		var materialInitialSpectrum = new THREE.ShaderMaterial( {
			uniforms: THREE.UniformsUtils.clone( initialSpectrumShader.uniforms ),
			vertexShader: initialSpectrumShader.vertexShader,
			fragmentShader: initialSpectrumShader.fragmentShader
		} );
		materialInitialSpectrum.uniforms.u_wind = { value: new THREE.Vector2() };
		materialInitialSpectrum.uniforms.u_resolution = { value: resolution };
		materialInitialSpectrum.depthTest = false;

		// 4 - Phases used to animate heightmap
		var materialPhase = new THREE.ShaderMaterial( {
			uniforms: THREE.UniformsUtils.clone( THREE.ShaderLib[ "ocean_phase" ].uniforms ),
			vertexShader: fullscreenVertexShader.vertexShader,
			fragmentShader: THREE.ShaderLib[ "ocean_phase" ].fragmentShader
		} );
		materialPhase.uniforms.u_resolution = { value: resolution };
		materialPhase.depthTest = false;

		// 5 - Shader used to update spectrum
		var materialSpectrum = new THREE.ShaderMaterial( {
			uniforms: THREE.UniformsUtils.clone( THREE.ShaderLib[ "ocean_spectrum" ].uniforms ),
			vertexShader: fullscreenVertexShader.vertexShader,
			fragmentShader: THREE.ShaderLib[ "ocean_spectrum" ].fragmentShader
		} );
		materialSpectrum.uniforms.u_initialSpectrum = { value: null };
		materialSpectrum.uniforms.u_resolution = { value: resolution };
		materialSpectrum.depthTest = false;

		// 6 - Shader used to update spectrum normals
		var materialNormal = new THREE.ShaderMaterial( {
			uniforms: THREE.UniformsUtils.clone( THREE.ShaderLib[ "ocean_normals" ].uniforms ),
			vertexShader: fullscreenVertexShader.vertexShader,
			fragmentShader: THREE.ShaderLib[ "ocean_normals" ].fragmentShader
		} );
		materialNormal.uniforms.u_displacementMap = { value: null };
		materialNormal.uniforms.u_resolution = { value: resolution };
		materialNormal.depthTest = false;

		// 7 - Shader used to update normals
		var materialDisplay = new THREE.ShaderMaterial( {
			uniforms: THREE.UniformsUtils.clone( THREE.ShaderLib[ "oceanDisplay" ].uniforms ),
			vertexShader: THREE.ShaderLib[ "oceanDisplay" ].vertexShader,
			fragmentShader: THREE.ShaderLib[ "oceanDisplay" ].fragmentShader
		} );
		materialDisplay.uniforms.u_geometrySize = { value: resolution };
		materialDisplay.uniforms.u_displacementMap = { value: displacementMapFramebuffer.texture };
		materialDisplay.uniforms.u_normalMap = { value: normalMapFramebuffer.texture };
		materialDisplay.uniforms.u_waterColor = { value: waterColor };
		materialDisplay.uniforms.u_skyColor = { value: skyColor };
		materialDisplay.uniforms.u_sunDirection = { value: new THREE.Vector3( sunDirectionX, sunDirectionY, sunDirectionZ ) };
		materialDisplay.uniforms.u_exposure = { value: exposure };
		materialDisplay.uniforms.u_size.value = size;
		materialDisplay.uniforms.u_projectionMatrix = { value: camera.projectionMatrix };
		materialDisplay.uniforms.u_viewMatrix = { value: camera.matrixWorldInverse };
		materialDisplay.uniforms.u_cameraPosition = { value: camera.position };
		materialDisplay.depthTest = true;

		// Disable blending to prevent default premultiplied alpha values
		materialWindHorizontal.blending = 0;
		materialWindVertical.blending = 0;
		materialInitialSpectrum.blending = 0;
		materialPhase.blending = 0;
		materialSpectrum.blending = 0;
		materialNormal.blending = 0;
		materialDisplay.blending = 0;
	}

	let simulationPlane = new THREE.Mesh( new THREE.PlaneBufferGeometry( 2, 2 ), materialPhase );
	ourScene.add( simulationPlane );

	let mesh = new THREE.Mesh(
		new THREE.PlaneBufferGeometry( geometrySize, geometrySize, geometryResolution, geometryResolution ).rotateX( - Math.PI / 2 ),
		materialDisplay );
	actualScene.add( mesh );

	//---------------------

	this.update = function()
	{
		var nonSimulationRenderTarget = renderer.getRenderTarget();

		if( changed )
		{
			renderInitialSpectrum();
		}
		renderWhole()

		renderer.setRenderTarget( nonSimulationRenderTarget );
	};

	let renderInitialSpectrum = function ()
	{
		ourScene.overrideMaterial = materialInitialSpectrum;
		materialInitialSpectrum.uniforms.u_wind.value.set( windX, windY );
		materialInitialSpectrum.uniforms.u_size.value = size;

		renderer.setRenderTarget( initialSpectrumFramebuffer );
		renderer.clear();
		renderer.render( ourScene, ourCamera );
	};

	let lastTime = ( new Date() ).getTime();
	let deltaTime = 0
	function renderWhole()
	{
		//render WavePhase
		{
			ourScene.overrideMaterial = materialPhase;

			if( initial )
			{
				var initialPhaseArray = new window.Float32Array( resolution * resolution * 4 );
				for ( var i = 0; i < resolution; i ++ )
				{
					for ( var j = 0; j < resolution; j ++ )
					{
						initialPhaseArray[ i * resolution * 4 + j * 4 + 0 ] = Math.random() * 2.0 * Math.PI;
						initialPhaseArray[ i * resolution * 4 + j * 4 + 1 ] = 0.0;
						initialPhaseArray[ i * resolution * 4 + j * 4 + 2 ] = 0.0;
						initialPhaseArray[ i * resolution * 4 + j * 4 + 3 ] = 0.0;
					}
				}
				var initialPhaseTexture = new THREE.DataTexture( initialPhaseArray, resolution, resolution, THREE.RGBAFormat );
				initialPhaseTexture.wrapS = THREE.ClampToEdgeWrapping;
				initialPhaseTexture.wrapT = THREE.ClampToEdgeWrapping;
				initialPhaseTexture.type = THREE.FloatType;
				initialPhaseTexture.needsUpdate = true;

				materialPhase.uniforms.u_phases.value = initialPhaseTexture;

				initial = false;
			}
			else
			{
				materialPhase.uniforms.u_phases.value = pingPhase ? pingPhaseFramebuffer.texture : pongPhaseFramebuffer.texture;
			}

			let currentTime = new Date().getTime();
			materialPhase.uniforms.u_deltaTime.value = ( currentTime - lastTime ) / 1000
			lastTime = currentTime;

			materialPhase.uniforms.u_size.value = size;
			renderer.setRenderTarget( pingPhase ? pongPhaseFramebuffer : pingPhaseFramebuffer );
			renderer.render( ourScene, ourCamera );
			pingPhase = ! pingPhase;

		};

		//render Spectrum
		{
			ourScene.overrideMaterial = materialSpectrum;

			materialSpectrum.uniforms.u_initialSpectrum.value = initialSpectrumFramebuffer.texture;
			materialSpectrum.uniforms.u_phases.value = pingPhase ? pingPhaseFramebuffer.texture : pongPhaseFramebuffer.texture;
			materialSpectrum.uniforms.u_choppiness.value = choppiness;
			materialSpectrum.uniforms.u_size.value = size;

			renderer.setRenderTarget( spectrumFramebuffer );
			renderer.render( ourScene, ourCamera );
		};

		//render SpectrumFFT
		{
			ourScene.overrideMaterial = materialWindHorizontal;

			// GPU FFT using Stockham formulation
			var iterations = Math.log( resolution ) / Math.log( 2 ); // log2
			for ( var i = 0; i < iterations; i ++ )
			{
				if ( i === 0 )
				{
					materialWindHorizontal.uniforms.u_input.value = spectrumFramebuffer.texture;
					materialWindHorizontal.uniforms.u_subtransformSize.value = Math.pow( 2, ( i % ( iterations ) ) + 1 );

					renderer.setRenderTarget( pingTransformFramebuffer );
					renderer.render( ourScene, ourCamera );

				} else if ( i % 2 === 1 )
				{
					materialWindHorizontal.uniforms.u_input.value = pingTransformFramebuffer.texture;
					materialWindHorizontal.uniforms.u_subtransformSize.value = Math.pow( 2, ( i % ( iterations ) ) + 1 );

					renderer.setRenderTarget( pongTransformFramebuffer );
					renderer.render( ourScene, ourCamera );

				} else
				{
					materialWindHorizontal.uniforms.u_input.value = pongTransformFramebuffer.texture;
					materialWindHorizontal.uniforms.u_subtransformSize.value = Math.pow( 2, ( i % ( iterations ) ) + 1 );

					renderer.setRenderTarget( pingTransformFramebuffer );
					renderer.render( ourScene, ourCamera );
				}
			}

			ourScene.overrideMaterial = materialWindVertical;

			for ( var i = iterations; i < iterations * 2; i ++ )
			{
				if ( i === iterations * 2 - 1 )
				{
					materialWindVertical.uniforms.u_input.value = ( iterations % 2 === 0 ) ? pingTransformFramebuffer.texture : pongTransformFramebuffer.texture;
					materialWindVertical.uniforms.u_subtransformSize.value = Math.pow( 2, ( i % ( iterations ) ) + 1 );

					renderer.setRenderTarget( displacementMapFramebuffer );
					renderer.render( ourScene, ourCamera );
				}
				else if ( i % 2 === 1 )
				{
					materialWindVertical.uniforms.u_input.value = pingTransformFramebuffer.texture;
					materialWindVertical.uniforms.u_subtransformSize.value = Math.pow( 2, ( i % ( iterations ) ) + 1 );

					renderer.setRenderTarget( pongTransformFramebuffer );
					renderer.render( ourScene, ourCamera );
				}
				else
				{
					materialWindVertical.uniforms.u_input.value = pongTransformFramebuffer.texture;
					materialWindVertical.uniforms.u_subtransformSize.value = Math.pow( 2, ( i % ( iterations ) ) + 1 );

					renderer.setRenderTarget( pingTransformFramebuffer );
					renderer.render( ourScene, ourCamera );
				}
			}
		};

		//render NormalMap
		{
			ourScene.overrideMaterial = materialNormal;

			if ( changed ) materialNormal.uniforms.u_size.value = size;
			materialNormal.uniforms.u_displacementMap.value = displacementMapFramebuffer.texture;

			renderer.setRenderTarget( normalMapFramebuffer );
			renderer.clear();
			renderer.render( ourScene, ourCamera );
		};

		ourScene.overrideMaterial = null;
	}
};