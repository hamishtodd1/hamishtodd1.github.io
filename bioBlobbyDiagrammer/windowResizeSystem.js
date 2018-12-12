function initCameraAndRendererResizeSystem(renderer)
{
	function respondToResize()
	{
		renderer.setSize( window.innerWidth, window.innerHeight )

		//always 2 wide
		let cameraHeight = 2 / (window.innerWidth/window.innerHeight)
		camera.top = cameraHeight/2
		camera.bottom = -cameraHeight/2
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