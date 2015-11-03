//not allowed to do anything with camera outside of here!
function UpdateCamera() {
//	if(InputObject.isMouseDown)
//		cameradist += 0.08;
//	else
//		cameradist -= 0.08;

	if(MODE == CUBIC_LATTICE_MODE){
		camera.position.setLength(min_cameradist * 4.5);
		camera.updateProjectionMatrix();
	}
	else{
		camera.z = min_cameradist;
		camera.updateProjectionMatrix();
	}
	
	//vertical_fov = 2 * Math.atan(playing_field_height/(2*camera.position.z));
	//camera.fov = vertical_fov * 360 / TAU;
	camera.updateMatrix();
	camera.updateMatrixWorld();
	
	//watch the videos again when in need of inspiration
	
	//it should follow the mouse a little bit. Finger?
	//take distance of mouse from center of screen, square root that, and move the camera towards the mouse by a multiple of that amount
	//maybe have screenshake "energy"? like things can cause it to vibrate until it stops.
	//think of it as a wooden peg maybe, that is basically rigid, but can be twanged in any direction
	//remember if you have any other objects in there, they have to shake too.
	//so what sort of "object" are all these things? are they hanging on the wall? Sitting on an airhockey table?
	//but camera can go from graceful mathematically-correct thing to feeling like a physics object.
	//Hey, aztez pulled the camera around by the side, you should too
	//objects could come in from top, camera could tilt up to see them
	//maybe think about Ikaruga's camera?
	//one nice movement is the "WHOOSH-stooooop..."
	//little screenshakes for little things, big ones for big things
	//could have the camera move over to focus on something that you hover your mouse over
	//give the net a flashy rim, that points ust come in through. Make it look like the capsid "cracks" open
	//don't just shake, sway
	
	

	//When a point crosses the edge, it should flash a color. Flash a different color when crossing other way
	//a streaming light effect may encourage players to move it into an orthogonal projection
	//could have the lines go wavy	
	//click on lattice, little flash and explosion
	//sleep()	
	//when you make a mistake, something nice should happen too. In nuclear throne there are cactuses that react to missed bullets
	
	//can you think of a way to engineer a situation where you really DON'T want to click on certain vertices? Would be interesting for a bit
	
}
