function initWindowResize() {
	
	camera.near = .1
	camera.position.z = 4.
	camera.far  = camera.position.z * 16.

	function respondToResize() {
		renderer.setSize(window.innerWidth, window.innerHeight)
		camera.aspect = window.innerWidth / window.innerHeight

		camera.fov = 90.

		camera.updateProjectionMatrix()
	}
	window.addEventListener('resize', respondToResize, false)
	respondToResize()
}