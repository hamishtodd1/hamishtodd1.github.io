/*
	every part of this goes out the window in VR
	It should be the case that if you turn the whole thing upside down it should feel ok
	so fretting about whether up, down, left, right is positive and negative(except relatively) is silly
*/

function initWindowResizeSystem()
{
	mainCamera.topAtZZero = 8. //all derives from this. Tweaked to make 100% look ok on our little preview
	
	function respondToResize(event) {
		if (event !== undefined)
			event.preventDefault()

		let pixelRatio = window.devicePixelRatio
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
}