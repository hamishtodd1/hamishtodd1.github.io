function initCameraAndRendererResizeSystem(renderer)
{
	camera.getHorizontalStretching = function()
	{
		let cameraAspect = (camera.right - camera.left) / (camera.top - camera.bottom)
		let windowAspect = window.innerWidth / window.innerHeight
		let horizontalStretching = windowAspect / cameraAspect
		return horizontalStretching
	}

	function respondToResize()
	{
		renderer.setSize( window.innerWidth, window.innerHeight )

		camera.updateProjectionMatrix();
	}
	respondToResize();
	
	window.addEventListener( 'resize', respondToResize, false );
}

function centerToFrameDistance(fov, cameraDistance)
{
	return Math.tan( fov / 2 * (TAU/360) ) * cameraDistance;
}
function fovGivenCenterToFrameDistance(centerToFrame, cameraDistance)
{
	return 2 * Math.atan(centerToFrame / cameraDistance) * (360/TAU);
}

function otherFov(inputFov,aspectRatio,inputIsVertical)
{
	var centerToFrameInput = centerToFrameDistance(inputFov,1)
	var centerToFrameOutput = centerToFrameInput;
	if(inputIsVertical)
	{
		centerToFrameOutput *= aspectRatio;
	}
	else
	{
		centerToFrameOutput /= aspectRatio;
	}
	var outputFov = fovGivenCenterToFrameDistance(centerToFrameOutput,1);
	return outputFov;
}