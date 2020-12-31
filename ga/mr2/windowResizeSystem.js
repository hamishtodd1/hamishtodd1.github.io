/*
*/

function initWindowResizeSystem()
{
	//all derives from mainCamera.topAtZZero. Tweaked to make 100% look ok on our little preview

	let oldPixelRatio = window.devicePixelRatio
	function respondToResize(event) {
		if (event !== undefined)
			event.preventDefault()

		let pixelRatio = window.devicePixelRatio
		if (pixelRatio > oldPixelRatio )
			--mainCamera.topAtZZero
		if (pixelRatio < oldPixelRatio)
			++mainCamera.topAtZZero
		oldPixelRatio = pixelRatio

		let width = window.innerWidth
		let height = window.innerHeight

		gl.canvas.width = Math.ceil(width * pixelRatio);
		gl.canvas.height = Math.ceil(height * pixelRatio);
		gl.canvas.style.width = width + 'px';
		gl.canvas.style.height = height + 'px';
		
		gl.viewport(0, 0, width * pixelRatio, height * pixelRatio)
		
		let aspect = width / height
		mainCamera.rightAtZZero = mainCamera.topAtZZero * aspect
		mainCamera.frontAndBackZ = Math.max(mainCamera.topAtZZero, mainCamera.rightAtZZero)
	}
	window.addEventListener('resize', respondToResize, false);
	respondToResize();

	// document.addEventListener('wheel', (event) => {
	// 	if (!event.ctrlKey) //handled by window resize
	// 		return

	// 	event.preventDefault()

	// 	log("y")
	// }, true);
}