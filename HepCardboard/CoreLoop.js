//A live fish

/*
 * TODO
 * Color in the surfaces
 * Rethink the scales. Hepa is huge and you realize this when you bring it to your face.
 * Record, take picture
 */

function UpdateWorld(Models,Hands)
{
	if( typeof video !== 'undefined' && video.readyState === video.HAVE_ENOUGH_DATA)
	{
		if( video.paused)
			video.play();
		
		videoImageContext.drawImage( video, 0, 0 );
		if ( videoTexture ) 
			videoTexture.needsUpdate = true;
	}
	
	RecordingDevice.update(Models,Hands, images);
}

function Render(Models,Users, ControllerModel) {
	delta_t = ourclock.getDelta();
//	if(delta_t > 0.1) delta_t = 0.1;
	
	ReadInput(Users, ControllerModel,Models);
	UpdateWorld(Models, Users);
	
	//setTimeout( function() { requestAnimationFrame( render );}, 100 ); //debugging only
	requestAnimationFrame( function(){
		Render(Models,Users,ControllerModel);
	} );
	if(isMobileOrTablet)
		OurStereoEffect.render( Scene, Camera ); //will be fine if VR is not enabled
	else
		Renderer.render( Scene, Camera ); //will be fine if VR is not enabled
}

init();