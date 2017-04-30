//you don't need it to be a combined camera any more

var camera_default_position = new THREE.Vector3(0,0,min_cameradist);

//function updateShakeVector( shakeDuration, t )
//{
//	var shakeDuration = 0.8;
//	var amplitudeEnvelope = Math.pow( 2, -t/shakeDuration*5 );
//	if( amplitudeEnvelope < 0.0001 ) // done
//	{
//		amplitudeEnvelope = 0;
//		camera.directionalShake.set(0,0,0);
//	}
//	
//	var periodsPerSecond = 10;
//	var amplitude = Math.sin( t * TAU * periodsPerSecond );
//	amplitude *= amplitudeEnvelope;
//	
//	var 
//	
//	camera.position.x = camera.directionalShake.x * amplitude;
//	camera.position.y = camera.directionalShake.y * amplitude;
//}
	
function UpdateCamera() 
{
//	switch(MODE)
//	{	
//		case TREE_MODE: //NOTE THIS MAY BREAK THE CLICK DETECTION. Could do in tree code?
//			var dampener = 200;
//			camera.position.x = Math.sqrt(MousePosition.x) / dampener;
//			camera.position.y = Math.sqrt(MousePosition.y) / dampener;
//			break;
//	}
//	
//	//we do it in this order because acceleration is what has been changed elswhere
	if( !camera.directionalShake.equals(THREE.zeroVector) )
	{
		//z is the time through
		var shakeDuration = 0.8;
		var amplitudeEnvelope = Math.pow( 2, -camera.directionalShake.z/shakeDuration*5 );
		if( amplitudeEnvelope < 0.0001 ) //finished
		{
			amplitudeEnvelope = 0;
			camera.directionalShake.set(0,0,0);
		}
		
		var periodsPerSecond = 10;
		var amplitude = Math.sin( camera.directionalShake.z * TAU * periodsPerSecond );
		amplitude *= amplitudeEnvelope;
		
		camera.position.x = camera.directionalShake.x * amplitude;
		camera.position.y = camera.directionalShake.y * amplitude;
		
		camera.directionalShake.z += delta_t;
	}
	
	camera.updateMatrix();
	camera.updateMatrixWorld();
	
	
	//Screenshake "momentum", things can cause it to vibrate until it stops.
	
	/*
	 * Watch juice it or lose it again
	 * 
	 * Irreg
	 * Slight vibration as it settles
	 * camera moves in when you grab
	 * grabber that you've grabbed should throb when you have them, and vibrate when you mouse over. Mouse should be a source of low-radius light.
	 * 
	 * CK
	 * Scale up or rotate both cause shake. Fast = high energy, slow = low
	 * intro: hexagon lattice comes out from a point? eg start the hider as a much smaller circle?
	 * 
	 * QS
	 * Grabbing and letting go causes zoom in and out (has sound effect)
	 * intro: scales up, from a point
	 * random vibration while settling
	 * 
	 * Boca
	 * Grabbing momentarily causes speedup to undulation
	 * intro: proteins appear one by one
	 */
}

function camera_changes_for_mode_switch(){
	camera.position.copy( camera_default_position );
	camera.fov = vertical_fov * 360 / TAU;
	camera.updateProjectionMatrix();
}