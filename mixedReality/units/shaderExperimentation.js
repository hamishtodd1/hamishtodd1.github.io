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
		Complex functions; height = modulus, color = angle
			Throw any polynomial in you like, could be fun
			Will replicate the recognizable stuff along the real axis?
				Better for that might be height = real, color = im

	Fuck SDFs. Good for constructive geometry and not much else. Even with single toruses, can get intersection immediately

	QM
		particle in a 1D box. Visualize as the series of complex planes along the line, eg a 3D space
		It's vertical
		Or could be a donut, which makes it simpler
		Amplitude to probability distribution is easy, it's a surface of revolution of |phi^2|

	Reaction diffusion
		https://www.youtube.com/watch?v=BV9ny785UNc
		https://pmneila.github.io/jsexp/grayscott/
		https://www.quantamagazine.org/wrinkles-and-dimples-obey-simple-rules-20150408/
		howto http://www.karlsims.com/rd.html to go with reaction diffusion what would be cool would be a cube of it,
		maybe even concentric spheres.
		You could have a “graph” going along the time axis next to the rectangle that shows the feed rate and death rate,
		and you could change them.

	z buffer crap? Can intersect hand controller? Test


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
		plane.position.z = -0.45;
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

	// if(0)
	/*
		mkay so first it's just face-on and you're making a sphere
	*/
	{
		let scalarFieldCameraPosition = new THREE.Vector3();
		let material = new THREE.ShaderMaterial({
			uniforms: {
				// isolevel:{value:0.1}
				scalarFieldCameraPosition: {value: scalarFieldCameraPosition },
				renderRadiusSquared: {value:0.005}
				//hope frontside works
			},
		});
		await assignShader("scalarFieldVertex", material, "vertex")
		await assignShader("scalarFieldFragment", material, "fragment")

		let scalarField = new THREE.Object3D();
		scene.add(scalarField);
		{
			let radius = Math.sqrt( material.uniforms.renderRadiusSquared.value );
			let displayPlane = new THREE.Mesh(new THREE.IcosahedronBufferGeometry(radius,4), material)
			scalarField.add( displayPlane )

			//Idea of the container is to give some sense of occasion, maybe have it open up
			//also to make sure that it make sense that the pixels behind are black
			//maybe make sense of the fact that it's rotating too?
			//justify black on the inside
			//pokeballs are a structure that makes sense
			// let backHider = new THREE.Circ
		}

		updateFunctions.push(function()
		{
			// scalarField.position.x = 0.14 * Math.sin(frameCount * 0.04)
			// scalarField.rotation.x = 0.4 * Math.sin(frameCount * 0.05)

			scalarField.position.copy(handControllers[0].position);
			scalarField.quaternion.copy( handControllers[0].quaternion );

			scalarField.updateMatrixWorld();
			scalarFieldCameraPosition.copy(camera.position);
			scalarField.worldToLocal( scalarFieldCameraPosition ); //not scalarField, but scalarField
		})
	}
}