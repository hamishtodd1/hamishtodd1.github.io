function initWindowResizeSystem(monitorer, renderer, spectatorCameraRepresentation)
{
	function respondToResize() 
	{
		renderer.setSize( window.innerWidth, window.innerHeight );

		pilotCamera.aspect = window.innerWidth / window.innerHeight;
		pilotCamera.updateProjectionMatrix();
		
		var minimumCenterToFrameVertical = 0.4;
		var minimumCenterToFrameHorizontal = 16 / 9 * minimumCenterToFrameVertical;

		spectatorCamera.aspect = renderer.domElement.width / renderer.domElement.height;
		
		if( spectatorCamera.aspect >= 16/9 )
		{
			spectatorCamera.top = minimumCenterToFrameVertical;
			spectatorCamera.bottom = -minimumCenterToFrameVertical;
			spectatorCamera.right = spectatorCamera.top * spectatorCamera.aspect;
			spectatorCamera.left = spectatorCamera.bottom * spectatorCamera.aspect;
		}
		else
		{
			spectatorCamera.right = minimumCenterToFrameHorizontal;
			spectatorCamera.left = -minimumCenterToFrameHorizontal;
			spectatorCamera.top = spectatorCamera.right / spectatorCamera.aspect;
			spectatorCamera.bottom = spectatorCamera.left / spectatorCamera.aspect;
		}
		spectatorCamera.updateProjectionMatrix();

		spectatorCameraRepresentation.scale.set( spectatorCamera.right-spectatorCamera.left,spectatorCamera.top-spectatorCamera.bottom,1);
		if( spectatorCameraRepresentation.scale.x > spectatorCameraRepresentation.scale.y * 16/9 )
		{
			spectatorCameraRepresentation.scale.x = spectatorCameraRepresentation.scale.y * 16/9
		}
		else
		{
			spectatorCameraRepresentation.scale.y = spectatorCameraRepresentation.scale.x / (16/9);
		}

		monitorer.setUiSize();
	}
	respondToResize();
	window.addEventListener( 'resize', respondToResize, false );
}