async function initGrayScottSimulation()
{
	//would be nice to have looooads of them and it is when you zoom out that they blur together
	{
		let pointsGeometry = new THREE.Geometry();
		let numPoints = 100;
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
				color: new THREE.Color().setHex(discreteViridis[Math.floor(Math.random() * 4)].hex)
			}

			pointsGeometry.vertices.push(points[i].position);
			pointsGeometry.colors.push(points[i].color);
		}

		let vShader = ['float size = 10.;', //yo
		'uniform float scale;',
		'#include <common>',
		'#include <color_pars_vertex>',
		'#include <fog_pars_vertex>',
		'#include <morphtarget_pars_vertex>',
		'#include <logdepthbuf_pars_vertex>',
		'#include <clipping_planes_pars_vertex>',
		'void main() {',
			'#include <color_vertex>',
			'#include <begin_vertex>',
			'#include <morphtarget_vertex>',
			'#include <project_vertex>',
			'gl_PointSize = size;',
			'#ifdef USE_SIZEATTENUATION',
				'bool isPerspective = ( projectionMatrix[ 2 ][ 3 ] == - 1.0 );',
				'if ( isPerspective ) gl_PointSize *= ( scale / - mvPosition.z );',
			'#endif',
			'#include <logdepthbuf_vertex>',
			'#include <clipping_planes_vertex>',
			'#include <worldpos_vertex>',
			'#include <fog_vertex>',
		'}'].join( '\n' )

		// log(THREE.ShaderLib.points.uniforms.size.value)
		let pointsMesh = new THREE.Points(pointsGeometry, new THREE.ShaderMaterial(
		{
			vertexColors: THREE.VertexColors,
			fragmentShader: THREE.ShaderLib.points.fragmentShader,
			vertexShader: vShader,
			uniforms: THREE.ShaderLib.points.uniforms
		}))
		// log(THREE.ShaderLib.points.uniforms.size.value)
		// pointsMesh.material.needsUpdate = true;

		scene.add(pointsMesh)
		pointsMesh.position.copy(rightHand.position)
		pointsMesh.position.z += 0.1

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
			}

			pointsGeometry.verticesNeedUpdate = true;
			pointsGeometry.colorsNeedUpdate = true;

			// numNearby = 0;
			// for(otherParticles)
			// {
			// 	if( particle.position.distanceSq(otherParticles.position) )
			// 	{
			// 		numNearby++;
			// 	}
			// }
			// if(numNearby >= 2)
			// {
			// 	particle.color = blah;
			// }

			// kill and feed
			// black (can switch to blue) ones that occasionally turn red
			// aaaaand green ones can occasionally turn black
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