//A live fish

var count = 0;

function UpdateWorld()
{	
	update_parameterzone();
	update_Phasezone();
	update_graph();
	
	if(count === 0)
		update_Cellular_Automaton();
	count++;
	if(count > 15)
		count = 0;
	
	Update_story();
	
	if( typeof video !== 'undefined' && video.readyState === video.HAVE_ENOUGH_DATA)
	{
		console.log("yo")
		videoImageContext.drawImage( video, 0, 0 );
		if ( videoTexture ) 
			videoTexture.needsUpdate = true;
	}
}

function Render() 
{
	delta_t = ourclock.getDelta();
//	if(delta_t > 0.1) delta_t = 0.1;
	
	ReadInput();
	UpdateWorld();
	
	//setTimeout( function() { requestAnimationFrame( render );}, 100 ); //debugging only
	requestAnimationFrame( Render );
	Renderer.render( Scene, Camera );
}

pre_download_init();