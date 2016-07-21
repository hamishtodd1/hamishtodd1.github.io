//not allowed to do anything with camera outside of here! Including read from its position!
//you don't need it to be a combined camera any more

function UpdateCamera() 
{
	//vertical_fov = 2 * Math.atan(playing_field_height/(2*camera.position.z));
	//camera.fov = vertical_fov * 360 / TAU;
	camera.updateMatrix();
	camera.updateMatrixWorld();
	
	var camera_default_position = new THREE.Vector3(0,0,min_cameradist);
	
	if(MODE === BOCAVIRUS_MODE)
	{
		var camera_move_duration = 3.5;
		
		var rightmost_visible_x = EggCell.position.x + EggCell_width / 2;
		var leftmost_visible_x = -playing_field_dimension / 2;
		var CEPx = ( rightmost_visible_x + leftmost_visible_x ) / 2;
		var CEPz = ( rightmost_visible_x - leftmost_visible_x ) / 2 / Math.tan( camera.fov / 360 * TAU / 2 );
		var Cell_encompassing_position = new THREE.Vector3( CEPx, 0, CEPz );
		
		var in_cell_position = Cell_encompassing_position.clone();
		in_cell_position.z *= 0.3; //probably closer
		
		var bocavirus_in_cell_x = 2 * (EggCell.position.x - EggCell_width / 2);
		
		var slightly_in_cell_position = new THREE.Vector3( bocavirus_in_cell_x,0,min_cameradist);
		
		
		
		var pullback_start_time = 146;
		if( pullback_start_time - 0.03 < our_CurrentTime && our_CurrentTime < pullback_start_time + camera_move_duration + 0.03)
			camera.position.copy( move_smooth_vectors(camera_default_position, Cell_encompassing_position, camera_move_duration, our_CurrentTime - pullback_start_time) );
		
		var zoomin_start_time = 150;
		if( zoomin_start_time - 0.03 < our_CurrentTime && our_CurrentTime < zoomin_start_time + camera_move_duration + 0.03)
			camera.position.copy( move_smooth_vectors(Cell_encompassing_position, camera_default_position, camera_move_duration, our_CurrentTime - zoomin_start_time) );
		
		//you're going to zoom in on the cell and it is going to fade out
		//you're going to zoom out from the cell and it will fade back
		//bocavirus will go into it (on "viruses can be absorbed into cells too")
		//zoom in (on "if bocavirus gets into a cell")
	}
	else
		camera.position.copy( camera_default_position );
	
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

function camera_changes_for_mode_switch(){	
	//was trying to get pictures on top
//	if(MODE === QC_SPHERE_MODE)
//		renderer.sortObjects = false;
//	else
//		renderer.sortObjects = true;
}