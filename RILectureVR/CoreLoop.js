//A live fish

//TODO for RI

function UpdateWorld(holdables,Hands, indicatorsound)
{
//	UpdateHands(holdables,Hands, indicatorsound);
	
	if(debugging)
		for(var i = 0; i < holdables.length; i++)
			holdables[i].children[0].BoundingBoxAppearance.update(holdables[i]);
	
//	if( typeof video !== 'undefined' && video.readyState === video.HAVE_ENOUGH_DATA)
//	{
//		videoImageContext.drawImage( video, 0, 0 );
//		if ( videoTexture ) 
//			videoTexture.needsUpdate = true;
//	}
}

function Render( holdables, Controllers, presentation ) {
	delta_t = ourclock.getDelta();
//	if(delta_t > 0.1) delta_t = 0.1;

	//window events, VR positions, and the lecturer
	inputObject.updateFromAsynchronousInput( 
			holdables,
			presentation.pages[ presentation.currentPageIndex ].holdablesInScene,
			Controllers );
	UpdateWorld(holdables, Controllers );
	
	//setTimeout( function() { requestAnimationFrame( render );}, 100 ); //debugging only
	OurVREffect.requestAnimationFrame( function(){
		OurVREffect.render( Scene, Camera );
		Render(holdables, Controllers, presentation );
	} );
}
