/*
	Ideas
		Placing spheres and cylinders would be nice, for corners
		Arrows too
		volumetric ray cast
		scalar fields
			wavefunctions
			Reaction diffusion
			complex analysis
		Amman beenker!
		bezier tetrahedra
		SDF
			These are interesting for constructive geometry
			But are they even the best way of doing eg toruses? Can surely get arbitrary intersection immediately

	QM
		particle in a 1D box. Visualize as the series of complex planes along the line, eg a 3D space
		It's vertical
		Or could be a donut, which makes it simpler
		Amplitude to probability distribution is easy, it's a surface of revolution of |phi^2|

	z buffer crap? Can intersect hand controller? Test

	<script type="x-shader/x-vertex" id="vertexShader">
		void main() 
		{
			gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
		}
	</script>
	<script type="x-shader/x-fragment" id="fragmentShader">
		void main()
		{
			gl_FragColor = vec4(1.0, 0.0, 0.0, 1.0);
		}
	</script>
*/

async function initShaderExperimentation()
{
	let material = new THREE.ShaderMaterial({
		uniforms: {
			numberGoingBetweenZeroAndOne: {value: 0}
		},
	});
	await assignShader("vertex2", material, "vertex")
	// await assignShader("sdfFragment", material, "fragment")
	await assignShader("fragment2", material, "fragment")

	let plane = new THREE.Mesh(new THREE.PlaneBufferGeometry(0.5, 0.5, 10, 10), material);
	plane.position.y = 1.6
	plane.position.z = -0.5;
	scene.add(plane);
	
	let vertexDisplacement = new Float32Array(plane.geometry.attributes.position.count);
	for(let i = 0; i < vertexDisplacement.length; i ++)
	{
		vertexDisplacement[i] = 0//Math.sin(i);
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