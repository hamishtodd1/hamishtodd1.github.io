///*
// * Perhaps you want something where there is a clear animation when the atoms repel and attract the atom.
// */
//
//function initialize_formation_atom(){
//	/*
//	 *  so we generate a series of positions.
//	    its movement distance is a random length
//	    we generate a random 
//	
//	    we start it in place, wobble a bit.
//	    one position very close to the final position, the penultimate pose
//	    then random movements around, subject to:
//			-can't get closer to the final position than the penultimate pose
//			-to make it easy let's say you can't get closer to the center of the QC than blah, and can't get further away than bleh
//		and then we move it away when the time comes in the video by just adding a vector going away from the center.
//		we would like the atom to come from the top
//		
//		No, we have 60 per second. Round secondsthroughvid to the nearest one.
//		
//		
//		Random walk:
//		 * -starting with the atom in the final position, generate a trajectory of it, just an array of vector positions
//		 * -little vibration at first, then it pops out
//		 * -confine it to a sphere. Make it move in random directions with a 
//		 * 
//		 * How to manage it state-wise? Could have it be triggered if the time is precisely equal to a certain number.
//		 * Might want to ensure that it is seen from the right angle? Could rotate lattice in a way that leaves it unchanged.
//	 */
//	var minMovement = 0.1;
//	var maxMovement = 5;
//	
//	for(var i = 0; i < ){
//		var randLength = minMovement + Math.random() * (maxMovement - minMovement);
//		var MovementVector = new THREE.Vector3(Math.random() - 0.5,Math.random() - 0.5,Math.random() - 0.5);
//		MovementVector.setLength(randLength);
//		
//		//if that takes it into the bubble, just generate a new one
//		
//	}
//}
//
//function reorient_crystal(){
//	/*
//	 * We find which corner is closest to where we'd like some one corner to be
//	 */
//	//we get two corners we'd like to swap
//}
//
//function swap_points(swappedpoint1, swappedpoint2){
//	var anglebetween = swappedpoint1.angleTo(swappedpoint2);
//	swappedpoint2.setLength(swappedpoint1.length());
//	var axis = new THREE.Vector3();
//	if(Math.abs(anglebetween - TAU / 2) < 0.01)
//		axis.addVectors(swappedpoint1,swappedpoint2);
//	else {
//		//any random vector at a right angle to one of them will do
//		axis.crossVectors(z_central_axis, swappedpoint1);
//	}
//
//	axis.normalize();
//	
//	rotate_3DPenrose_entirety(axis,TAU/2);
//}
//
//function update_formation_atom(){
//	var animation_beginning_second = 55; //or whatever
//	var nearest_frame = (secondsthroughvid - animation_beginning_second);
//	nearest_frame *= 60;
//	nearest_frame = Math.round(nearest_frame);
//	
//	QC_atoms.geometry.attributes.position.setXYZ(outermost_QCatom_indices[0], 
//		formation_animation_numbers[nearest_frame * 3 + 0],
//		formation_animation_numbers[nearest_frame * 3 + 1],
//		formation_animation_numbers[nearest_frame * 3 + 2] );
//	
//	//we could do a rotation thing to adjust them to whatever position is convenient
//	//we could store them as linear combinations of three vectors
//	
//	//so we're going to try turning it imperceptibly
//}