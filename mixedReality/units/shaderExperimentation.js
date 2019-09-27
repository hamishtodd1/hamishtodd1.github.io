/*
	Ideas
		Placing spheres and cylinders would be nice, for corners
		Arrows too
		complex analysis
		Amman beenker
		Complex functions; height = modulus, color = angle
			Throw any polynomial in you like, could be fun
			Will replicate the recognizable stuff along the real axis?
				Better for that might be height = real, color = im

	QM
		particle in a 1D box. Visualize as the series of complex planes along the line, eg a 3D space
		It's vertical
		Or could be a donut, which makes it simpler
		Amplitude to probability distribution is easy, it's a surface of revolution of |phi^2|
		Some wave functions that would be interesting to diffuse

	Parametric stuff, use vertex shader
		Lines
		Surfaces

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

async function initShaderExperimentation( gl )
{
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
}