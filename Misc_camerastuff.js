//you don't need it to be a combined camera any more

var camera_default_position = new THREE.Vector3(0,0,min_cameradist);
	
function UpdateCamera() 
{
	camera.updateMatrix();
	camera.updateMatrixWorld();
	
	//things should be drawn towards the mouse a little bit. No need for that if you're rotating Finger?
	//take distance of mouse from center of screen, square root that, and move the camera towards the mouse by a multiple of that amount
	//maybe have screenshake "energy"? like things can cause it to vibrate until it stops.
	//think of it as a wooden peg maybe, that is basically rigid, but can be twanged in any direction
	//remember if you have any other objects in there, they have to shake too.
	//Hey, aztez pulled the camera around by the side, you should too
	//Should have one effect for rotation, another for scaling, both of which have intensity.
	//objects could come in from top, camera could tilt up to see them
	//little screenshakes for little things, big ones for big things
	//Tree: could have the camera move over to focus on something that you hover your mouse over
	//an invisible lamp on your mouse that impacts the surfaces you touch
}

function camera_changes_for_mode_switch(){	
	//was trying to get pictures on top
//	if(MODE === QC_SPHERE_MODE)
//		renderer.sortObjects = false;
//	else
//		renderer.sortObjects = true;
	camera.position.copy( camera_default_position );
}