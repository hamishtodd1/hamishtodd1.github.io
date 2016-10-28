//A live fish

/*
 * TODO
 * Color in the surfaces
 * Rethink the scales. Hepa is huge and you realize this when you bring it to your face.
 * Record, take picture
 */

function UpdateWorld(Models,Hands)
{
	UpdateHands(Models,Hands);
	
	if( typeof video !== 'undefined' && video.readyState === video.HAVE_ENOUGH_DATA)
	{
		videoImageContext.drawImage( video, 0, 0 );
		if ( videoTexture ) 
			videoTexture.needsUpdate = true;
	}
	
	update_pictures(Hands);
	
	update_hepa_zoom();
	
	RecordingDevice.update(Models,Hands, images);
}

function update_hepa_zoom()
{
	var position_of_gravitation = new THREE.Vector3(); //Camera.position;
	var current_dist = Models[2].position.distanceTo( position_of_gravitation );
	
	var start_moving_radius = 0.23;
	var steady_speed_radius = start_moving_radius * 0.8;
	
	if( current_dist < start_moving_radius && Models[2].velocity.length() === 0 )
	{
		//you're not moving but we want you to start, so we're going to choose our direction which we will stick with
		Models[2].velocity.copy( position_of_gravitation );
		Models[2].velocity.sub( Models[2].getWorldPosition() );
	}
	
	if( Models[2].velocity.length() > 0 )
	{		
		var maxspeed = 0.00007;
		Models[2].velocity.setLength(Models[2].velocity.length() + 0.0000005 );
		if( Models[2].velocity.length() > maxspeed )
			Models[2].velocity.setLength( maxspeed );
		
		Models[2].position.add( Models[2].velocity );
	}
	
	if( Models[2].position.distanceTo( position_of_gravitation ) > start_moving_radius )
		Models[2].velocity.set(0,0,0);
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
	OurVREffect.render( Scene, Camera ); //will be fine if VR is not enabled
}

init();