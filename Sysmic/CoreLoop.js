//A live fish

function UpdateWorld()
{	
	update_parameterzone();
	update_Phasezone();
	update_graph();
	
	if( typeof video !== 'undefined' && video.readyState === video.HAVE_ENOUGH_DATA)
	{
		videoImageContext.drawImage( video, 0, 0 );
		if ( videoTexture ) 
			videoTexture.needsUpdate = true;
	}
}

function Render() {
	delta_t = ourclock.getDelta();
//	if(delta_t > 0.1) delta_t = 0.1;
	
	ReadInput();
	UpdateWorld();
	
	//setTimeout( function() { requestAnimationFrame( render );}, 100 ); //debugging only
	requestAnimationFrame( Render );
	Renderer.render( Scene, Camera );
}

pre_download_init();