//not allowed to do anything with camera outside of here!
//you don't need it to be a combined camera any more

var camera_default_position = new THREE.Vector3(0,0,min_cameradist);
	
function UpdateCamera() 
{
	//vertical_fov = 2 * Math.atan(playing_field_height/(2*camera.position.z));
	//camera.fov = vertical_fov * 360 / TAU;
	camera.updateMatrix();
	camera.updateMatrixWorld();
	
	
	if(MODE === BOCAVIRUS_MODE)
	{
		var movement_duration = 2;
		
		var pullback_start_time = 142.8;
		var cell_move_time = 145.6;
		var zoomin_start_time = 149.8;
		var cell_fadeout_start_time = zoomin_start_time + movement_duration / 2;
		var Transcriptase_ogling_time = 169.5;
		var second_pullback_start_time = 179.4;
		var whole_thing_finish_time = 197;
		
		
		
		
		
		if( our_CurrentTime < pullback_start_time || cell_fadeout_start_time + movement_duration < our_CurrentTime)
			EggCell.visible = false;
		else
			EggCell.visible = true;
		
		if( our_CurrentTime < Transcriptase_ogling_time || whole_thing_finish_time < our_CurrentTime)
			Transcriptase.visible = false;
		else
			Transcriptase.visible = true;
		
		var cell_eaten_bocavirus_position = new THREE.Vector3( EggCell_initialposition.x - ( EggCell_initialposition.x - EggCell_radius ) * 2, 0, 0);
		var Transcriptase_ogling_position = new THREE.Vector3(playing_field_dimension,0,min_cameradist);
		var Transcriptase_DNAcage_visible_position = new THREE.Vector3( playing_field_dimension / 2, 0, min_cameradist * 2 );
		
		var rightmost_visible_x = EggCell_initialposition.x + EggCell_radius;
		var leftmost_visible_x = cell_eaten_bocavirus_position.x - EggCell_radius;
		var CEPx = ( rightmost_visible_x + leftmost_visible_x ) / 2;
		var CEPz = ( rightmost_visible_x - leftmost_visible_x ) / 2 / Math.tan( camera.fov / 360 * TAU / 2 );
		var Cell_virus_visible_position = new THREE.Vector3( CEPx, 0, CEPz );
		
		if( our_CurrentTime < pullback_start_time )
			camera.position.set(0,0,min_cameradist);
		else if( our_CurrentTime < pullback_start_time + movement_duration )
			camera.position.copy( move_smooth_vectors(camera_default_position, Cell_virus_visible_position, movement_duration, our_CurrentTime - pullback_start_time) );
		else if( our_CurrentTime < zoomin_start_time )
			camera.position.copy(Cell_virus_visible_position);
		else if( our_CurrentTime < zoomin_start_time + movement_duration )
			camera.position.copy( move_smooth_vectors(Cell_virus_visible_position, camera_default_position, movement_duration, our_CurrentTime - zoomin_start_time) );
		else if( our_CurrentTime < Transcriptase_ogling_time )
			camera.position.copy(camera_default_position);
		else if( our_CurrentTime < Transcriptase_ogling_time + movement_duration )
			camera.position.copy( move_smooth_vectors(camera_default_position, Transcriptase_ogling_position, movement_duration, our_CurrentTime - Transcriptase_ogling_time) );
		else if( our_CurrentTime < second_pullback_start_time )
			camera.position.copy(Transcriptase_ogling_position);
		else if( our_CurrentTime < second_pullback_start_time + movement_duration )
			camera.position.copy( move_smooth_vectors(Transcriptase_ogling_position, Transcriptase_DNAcage_visible_position, movement_duration, our_CurrentTime - second_pullback_start_time) );
		else if( our_CurrentTime < whole_thing_finish_time )
			camera.position.copy( Transcriptase_DNAcage_visible_position );
		else
			camera.position.copy( camera_default_position );
		
		EggCell.position.copy( move_smooth_vectors( EggCell_initialposition, cell_eaten_bocavirus_position, movement_duration, our_CurrentTime - cell_move_time ) );
		
		var fadeout_duration = movement_duration / 2;
		if( our_CurrentTime <= cell_fadeout_start_time )
			EggCell.material.opacity = 1;
		if( cell_fadeout_start_time < our_CurrentTime && our_CurrentTime < cell_fadeout_start_time + fadeout_duration )
			EggCell.material.opacity = 1 - ( our_CurrentTime - cell_fadeout_start_time) / fadeout_duration;
		if( cell_fadeout_start_time + fadeout_duration < our_CurrentTime )
			EggCell.material.opacity = 0;
		
		
		//you're going to zoom in on the cell and it is going to fade out
		//you're going to zoom out from the cell and it will fade back
		//bocavirus will go into it (on "viruses can be absorbed into cells too")
		//zoom in (on "if bocavirus gets into a cell")
	}
	
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
	camera.position.copy( camera_default_position );
}