function initWindowResize()
{
	camera.topAtZZero = 1.
	{
		camera.position.z = camera.topAtZZero * 2. //subjective
		camera.near = .1
		camera.far  = camera.position.z * 16.
	}

	// window.devicePixelRatio, prior to resizing, seems to come from the device. Don't consider it, just changes to it
	//the effect of the below is to make it so that the only change is to the viewport, not to the scene itself
	function respondToResize(event) {
		if (event !== undefined)
			event.preventDefault()

		renderer.setPixelRatio(window.devicePixelRatio)

		renderer.setSize(window.innerWidth, window.innerHeight)
		
		camera.top = camera.topAtZZero
		camera.bottom = -camera.topAtZZero
		camera.right = camera.top * window.innerWidth / window.innerHeight
		camera.left = -camera.right

		camera.rightAtZZero = camera.topAtZZero * camera.aspect

		camera.updateProjectionMatrix();
	}
	window.addEventListener('resize', respondToResize, false);
	respondToResize();
}

function centerToFrameDistance(fov, cameraDistance) {
	return Math.tan( fov / 2. * (TAU/360.) ) * cameraDistance;
}
function fovGivenCenterToFrameDistance(centerToFrame, cameraDistance) {
	return 2 * Math.atan(centerToFrame / cameraDistance) * (360./TAU);
}

function otherFov(inputFov,aspectRatio,inputIsVertical)
{
	var centerToFrameInput = centerToFrameDistance(inputFov,1)
	var centerToFrameOutput = centerToFrameInput;
	if(inputIsVertical)
		centerToFrameOutput *= aspectRatio;
	else
		centerToFrameOutput /= aspectRatio;
	var outputFov = fovGivenCenterToFrameDistance(centerToFrameOutput,1);
	return outputFov;
}