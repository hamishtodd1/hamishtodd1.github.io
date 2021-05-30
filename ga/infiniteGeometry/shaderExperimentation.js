async function initShaderExperimentation( gl )
{
	let material = new THREE.ShaderMaterial({
		uniforms: {
			mvs: {
				value: [new Float32Array(32), new Float32Array(32)]
			}
		},
	});
	await assignShader("vs", material, "vertex")
	await assignShader("fs", material, "fragment")

	let plane = new THREE.Mesh(new THREE.PlaneGeometry(1.,1.), material);
	plane.position.y = 1.6

	let cameraPlaneHeight = camera.near * Math.tan(camera.fov * Math.PI/180. / 2.) * 2.
	plane.scale.y = cameraPlaneHeight * camera.position.z / camera.near
	plane.scale.x = plane.scale.y * camera.aspect

	scene.add(plane);
	
	ufs.push( () => {
		material.uniforms.mvs.value[0][0] = 0.5 + Math.sin(clock.elapsedTime) * 0.5;
	} )
}