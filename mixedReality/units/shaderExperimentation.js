/*
	mimic this shit I suppose
	https://raw.githubusercontent.com/mrdoob/three.js/master/examples/webgl_shaders_ocean2.html
	https://threejs.org/examples/js/Ocean.js
	https://threejs.org/examples/js/shaders/OceanShaders.js

	Ideas
		Placing spheres and cylinders would be nice, for corners
		Arrows too
		volumetric ray cast scalar fields
			wavefunctions
			Reaction diffusion
			complex analysis
			algebraic varieties
				Elliptic curves
		Amman beenker! Could be very fun
		bezier tetrahedra

	Fuck SDFs. Good for constructive geometry and not much else. Even with single toruses, can get intersection immediately

	QM
		particle in a 1D box. Visualize as the series of complex planes along the line, eg a 3D space
		It's vertical
		Or could be a donut, which makes it simpler
		Amplitude to probability distribution is easy, it's a surface of revolution of |phi^2|



	most basic vertex:
	void main() 
	{
		gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
	}

	most basic fragment:
	void main()
	{
		gl_FragColor = vec4(1.0, 0.0, 0.0, 1.0);
	}
*/

async function initShaderExperimentation( canvas )
{
	const gl = canvas.getContext( 'webgl2' );

	//basic
	if(0)
	{
		let material = new THREE.ShaderMaterial({
			uniforms: {
				numberGoingBetweenZeroAndOne: {value: 0}
			},
		});
		await assignShader("basicVertex", material, "vertex")
		await assignShader("basicFragment", material, "fragment")

		let plane = new THREE.Mesh(new THREE.PlaneBufferGeometry(0.5, 0.5, 10, 10), material);
		plane.position.y = 1.6
		plane.position.z = -0.5;
		scene.add(plane);
		
		let vertexDisplacement = new Float32Array(plane.geometry.attributes.position.count);
		for(let i = 0; i < vertexDisplacement.length; i ++)
		{
			vertexDisplacement[i] = Math.sin(i);
		}
		plane.geometry.addAttribute('vertexDisplacement', new THREE.BufferAttribute(vertexDisplacement, 1));

		updateFunctions.push( function() 
		{
			//uniform
			material.uniforms.numberGoingBetweenZeroAndOne.value = 0.5 + Math.sin(clock.elapsedTime) * 0.5;
		
			//attribute
			for( let i = 0, il = vertexDisplacement.length; i < il; i++ )
			{
				vertexDisplacement[i] = Math.sin(i + clock.elapsedTime);
			}
			plane.geometry.attributes.vertexDisplacement.needsUpdate = true;
		} )
	}

	//heat 2D
	// if(0)
	{

		{
			// webGl2Context
			/*
				2 textures

				Use raw shaders for the simulation
				Then how to communicate?
			*/

			let dimension = 64;
			let initialState = new Float32Array(64*64*64)
			for(let i = 0; i < 64*64*64; i++)
			{
				initialState[i] = Math.random()
			}

			function halfSimulation()
			{
				let texture = gl.createTexture()



				// gl.bindTexture(gl.TEXTURE_2D, texture);
				// gl.pixelStorei(gl.UNPACK_ALIGNMENT, 1);
				// gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, dimension, dimension, 0, gl.RGBA, gl.UNSIGNED_BYTE,
				// 	initialState);
				// gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
				// gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
				// gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
				// gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);

				// let framebuffer = gl.createFramebuffer();
				// gl.bindFramebuffer(gl.FRAMEBUFFER, framebuffer);
				// gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0,
				// 	gl.TEXTURE_2D, texture, 0);

				// texture.stepSimulation = function()
				// {
				// 	gl.bindTexture(gl.TEXTURE_2D, texture);
				// 	gl.bindFramebuffer(gl.FRAMEBUFFER, framebuffer);
				// }

				return texture;
			}

			// var texture1 = halfSimulation()
			// let texture2 = halfSimulation()

			// updateFunctions.push( function() 
			// {
			// 	gl.useProgram(prog);
			// 	lastOneStepped ? texture1.stepSimulation() : texture2.stepSimulation()
			// 	gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
			// 	gl.flush();
			// } )
		}

		let material = new THREE.ShaderMaterial({});
		await assignShader("simulation2dDisplayVertex", material, "vertex")
		await assignShader("simulation2dDisplayFragment", material, "fragment")

		let offscreenMaterial = new THREE.ShaderMaterial() //raw might be better
		await assignShader("heatVertex", offscreenMaterial, "vertex")
		await assignShader("heatFragment", offscreenMaterial, "fragment")
		let offscreenPlane = new THREE.Mesh(new THREE.PlaneBufferGeometry(1.0, 1.0), offscreenMaterial);

		updateFunctions.push(function()
		{
			//urgh but you need to make it so each fucking pixel gets "drawn"
			offscreenMaterial.needsUpdate = true


			//almost certainly it's useProgram
			// renderer.state.activeTexture( gl.TEXTURE0 );
			// renderer.state.bindTexture( gl.TEXTURE_2D, textureToWriteTo );
		})

		//do consider using the compute shaders!
		//

		//alright so next thing to do is get those heat things to run and then communicate their value
		//probably have to mimic how three.js does it, because it probably is doing it somehow

		let plane = new THREE.Mesh(new THREE.PlaneBufferGeometry(1.0, 1.0), material);
		plane.position.y = 1.6
		plane.position.z = -1.5;
		scene.add(plane);
	}
}

function assignShader(fileName, materialToReceiveAssignment, vertexOrFragment)
{
	var propt = vertexOrFragment + "Shader"
	var fullFileName = "units/shaders/" + fileName + ".glsl"

	return new Promise(resolve => {
		var xhr = new XMLHttpRequest();
		xhr.open("GET", fullFileName, true);
		xhr.onload = function(e)
		{
			materialToReceiveAssignment[propt] = xhr.response
			resolve();
		};
		xhr.onerror = function ()
		{
			console.error(fullFileName, "didn't load");
		};
		xhr.send();
	})
}