//A live fish

//TODO for RI

function UpdateWorld(holdables, presentation)
{
	//For the sake of replication, can you make it so that the only contingency in updates is on the position and quaternion of things?
	for(var i = 0, il = presentation.pages[presentation.currentPageIndex].holdablesInScene.length; i < il; i++)
		if( typeof presentation.pages[presentation.currentPageIndex].holdablesInScene[i].update !== 'undefined' )
			presentation.pages[presentation.currentPageIndex].holdablesInScene[i].update();
	
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
			presentation,
			Controllers );
	UpdateWorld(holdables, presentation );
	
	//setTimeout( function() { requestAnimationFrame( render );}, 100 ); //debugging only
	OurVREffect.requestAnimationFrame( function(){
		OurVREffect.render( Scene, Camera );
		Render(holdables, Controllers, presentation );
	} );
}
