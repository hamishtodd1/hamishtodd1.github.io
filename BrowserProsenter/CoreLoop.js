//A live fish

function UpdateWorld(Models,Hands)
{
	UpdateHands(Models,Hands);
	
	if(debugging)
		for(var i = 0; i < Models.length; i++)
			Models[i].children[0].BoundingBoxAppearance.update(Models[i]);
	
//	if( typeof video !== 'undefined' && video.readyState === video.HAVE_ENOUGH_DATA)
//	{
//		videoImageContext.drawImage( video, 0, 0 );
//		if ( videoTexture ) 
//			videoTexture.needsUpdate = true;
//	}
}

function Render( Models, Controllers) {
	delta_t = ourclock.getDelta();
//	if(delta_t > 0.1) delta_t = 0.1;
	
	InputObject.processInput( Models );
	UpdateWorld(Models, Controllers);
	
	//setTimeout( function() { requestAnimationFrame( render );}, 100 ); //debugging only
	requestAnimationFrame( function(){
		Render(Models,Controllers);
	} );
	OurVREffect.render( Scene, Camera ); //will be fine if VR is not enabled
}
