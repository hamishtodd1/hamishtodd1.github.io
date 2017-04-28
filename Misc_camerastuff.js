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
//	
//	//we do it in this order because acceleration is what has been changed elswhere
//	camera.velocity.add(camera.acceleration);
//	camera.position.add(camera.velocity);
//	camera.acceleration.copy(camera.position);
//	camera.acceleration.z = 0;
//	camera.acceleration.multiplyScalar(-0.1);
//	
//	camera.updateMatrix();
//	camera.updateMatrixWorld();
	
	
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
	 * Popping causes shake.
	 * Grabbing and letting go causes zoom in and out
	 * measuring stick vibrates
	 * intro: scales up, from a point
	 * 
	 * Boca
	 * Grabbing momentarily causes speedup to undulation
	 * intro: proteins appear one by one
	 */
}

function camera_changes_for_mode_switch(){
	camera.position.copy( camera_default_position );
}