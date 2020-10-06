/*
	every part of this goes out the window in VR
	It should be the case that if you turn the whole thing upside down it should feel ok
	so fretting about whether up, down, left, right is positive and negative(except relatively) is silly
*/

function initWindowResizeSystem()
{
	mainCamera.topAtZZero = 15.; //all derives from this. Tweaked to make 100% look ok on our little preview

	function respondToResize(event) {
		if (event !== undefined)
			event.preventDefault()

		canvas.width = window.innerWidth
		canvas.height = window.innerHeight
		gl.viewport(0, 0, canvas.width, canvas.height)
		
		mainCamera.aspect = window.innerWidth / window.innerHeight;
		mainCamera.rightAtZZero = mainCamera.topAtZZero * mainCamera.aspect
	}
	window.addEventListener('resize', respondToResize, false);
	respondToResize();
}