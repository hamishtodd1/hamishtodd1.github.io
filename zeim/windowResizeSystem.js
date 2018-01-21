function centerToFrameDistanceAtZ1GivenFov(fov)
{
	return Math.tan( (TAU/360) * fov / 2);
}
function fovGivenCenterToFrameDistanceAtZ1(centerToFrameDistance)
{
	return 2 * (360/TAU) * Math.atan(centerToFrameDistance);
}

function otherFov(inputFov,ratio)
{
	var centerToFrameInput = centerToFrameDistanceAtZ1GivenFov(inputFov)
	var centerToFrameOutput = centerToFrameInput * ratio;
	var outputFov = fovGivenCenterToFrameDistanceAtZ1(centerToFrameOutput);
	return outputFov;
}

function initWindowResizeSystem(monitorer, renderer)
{
	function respondToResize() 
	{
		if( window.innerWidth < window.innerHeight )
		{
			//could force landscape
		}

		renderer.setSize( window.innerWidth, window.innerHeight );
		
		spectatorCamera.aspect = renderer.domElement.width / renderer.domElement.height;

		var minimumHorizontalFov = otherFov(SPECTATOR_MINIMUM_FOV,SPECTATOR_DESIRED_ASPECT_RATIO);
		
		if( spectatorCamera.aspect >= SPECTATOR_DESIRED_ASPECT_RATIO )
		{
			spectatorCamera.fov = SPECTATOR_MINIMUM_FOV;
		}
		else
		{
			spectatorCamera.fov = otherFov(minimumHorizontalFov, 1 / spectatorCamera.aspect);
		}

		spectatorCamera.updateProjectionMatrix();

		monitorer.setUiSize();
	}
	respondToResize();
	window.addEventListener( 'resize', respondToResize, false );
}