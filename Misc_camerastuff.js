//not allowed to do anything with camera outside of here! Including read from its position!
function camera_changes_for_mode_switch(){
	camera.position.z = min_cameradist;
	camera.cameraO.left =-playing_field_width / 2;
	camera.cameraO.right = playing_field_width / 2;
	camera.cameraO.top = playing_field_height / 2;
	camera.cameraO.bottom =-playing_field_height / 2;
	camera.updateProjectionMatrix();
	
	switch(MODE){
		case STATIC_PROTEIN_MODE:
			camera.toOrthographic();
			break;
		case STATIC_DNA_MODE:
			camera.toOrthographic();
			break;
		case CK_MODE:
			camera.toPerspective();
			break;
		case IRREGULAR_MODE:
			camera.toPerspective();
			break;
		case QC_SPHERE_MODE:
			camera.toPerspective();
			break;
	}
	
	//was trying to get pictures on top
//	if(MODE === QC_SPHERE_MODE)
//		renderer.sortObjects = false;
//	else
//		renderer.sortObjects = true;
}

function UpdateCamera() 
{
	//vertical_fov = 2 * Math.atan(playing_field_height/(2*camera.position.z));
	//camera.fov = vertical_fov * 360 / TAU;
	camera.updateMatrix();
	camera.updateMatrixWorld();
	
	//watch the vlambeer / juice it or lose it videos again when in need of inspiration
	//weird visual touches will improve it too, like Bret's tiny shadows. Shadows/shininess in general... could try to detect speed... :(
	//things fade in, that's not so hard, just have a white surface that changes alpha
	
	//A lot of these might not necessarily be good ideas, since the player only spends small amounts of time on the demos :/
	//things should be drawn towards the mouse a little bit. No need for that if you're rotating Finger?
	//take distance of mouse from center of screen, square root that, and move the camera towards the mouse by a multiple of that amount
	//maybe have screenshake "energy"? like things can cause it to vibrate until it stops.
	//think of it as a wooden peg maybe, that is basically rigid, but can be twanged in any direction
	//remember if you have any other objects in there, they have to shake too.
	//so what sort of "object" are all these things? are they hanging on the wall? Sitting on an airhockey table?
	//but camera can go from graceful mathematically-correct thing to feeling like a physics object.
	//Hey, aztez pulled the camera around by the side, you should too
	//Maybe make the virus glow when altered
	//Should have one effect for rotation, another for scaling, both of which have intensity.
	//objects could come in from top, camera could tilt up to see them
	//maybe think about Ikaruga's camera?
	//one nice movement is the "WHOOSH-stooooop..."
	//little screenshakes for little things, big ones for big things
	//could have the camera move over to focus on something that you hover your mouse over
	//give the net a flashy rim, that points ust come in through. Make it look like the capsid "cracks" open
	//don't just shake, sway
	//an invisible lamp on your mouse that impacts the surfaces you touch
	//Ask Ben before working on ANYTHING
	
	

	//When a hexagon comes onto the net, it should flash a color. Flash a different color when crossing other way
	//a streaming light effect may encourage players to move it into an orthogonal projection
	//sleep()
	
	//can you think of a way to engineer a situation where you really DON'T want to click on certain vertices? Would be interesting for a bit
	
}
