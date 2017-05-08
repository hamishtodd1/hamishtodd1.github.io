//you don't need it to be a combined camera any more

var camera_default_position = new THREE.Vector3(0,0,min_cameradist);
	
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
	
	{
		//z is the time through
		var displacementAtZero = 0.1;
		var amplitudeEnvelope = Math.pow( 2, -camera.directionalShake.z * 6 ) * displacementAtZero; //can make it "sharper" by changing 2
		//0.5 is just about noticeable, 
		if( amplitudeEnvelope < 0.0001 ) //finished
		{
			amplitudeEnvelope = 0;
			camera.directionalShake.x = 0;
			camera.directionalShake.y = 0;
		}
		
		var frequency = 5;
		var amplitude = Math.sin( camera.directionalShake.z * TAU * frequency );
		amplitude *= amplitudeEnvelope;
		
		camera.position.sub( camera.directionalShakeContribution );
		
		camera.directionalShakeContribution.copy( camera.directionalShake );
		camera.directionalShakeContribution.z = 0;
		camera.directionalShakeContribution.setLength(amplitude); //magnitude of the directionalShake x and y are irrelevant
		
		camera.position.add( camera.directionalShakeContribution );
		
		camera.directionalShake.z += delta_t;
	}
	
	if( camera.randomShake != 0)
	{
		var randomTheta = Math.random() * TAU;
		var randomLength = Math.random() * camera.randomShake; //probably times something
		var shakeVector = new THREE.Vector3( randomLength * Math.sin(randomTheta), randomLength * math.cos(randomTheta), 0 );

		camera.position.x = shakeVector.x;
		camera.position.y = shakeVector.y;
		
		camera.randomShake -= delta_t;
		if(camera.randomShake < 0)
			camera.randomShake = 0;
	}
	
	camera.updateMatrix();
	camera.updateMatrixWorld();
	
	
	//Screenshake "momentum", things can cause it to vibrate until it stops.
	
	/*
	 * 
	 * Irreg
	 * Slight vibration as it settles
	 * camera moves in when you grab
	 * grabber that you've grabbed should throb when you have them, and vibrate when you mouse over. Mouse should be a source of low-radius light.
	 * random shake when not converging
	 * Big whack when you hit the side
	 * vertex grabber that you're holding stretches in the direction of mouse movement
	 * random vibration while settling
	 * 
	 * CK
	 * Scale up or rotate both cause shake. Fast = high energy, slow = low
	 * shake as it closes?
	 * intro: hexagon lattice comes out from a point? eg start the hider as a much smaller circle?
	 * 
	 * QS
	 * intro: scales up, from a point
	 * colors get deeper on state change and then quickly go back
	 * 
	 * Boca
	 * Grabbing momentarily causes speedup to undulation
	 * intro: proteins appear one by one, or maybe in fours
	 * 
	 * very simple to create a "circle fades in and scales down on one point"
	 */
}

function camera_changes_for_mode_switch(){
	camera.position.copy( camera_default_position );
	camera.fov = vertical_fov * 360 / TAU;
	camera.updateProjectionMatrix();
}