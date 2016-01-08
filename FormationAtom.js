/*
 * Perhaps you want something where there is a clear animation when the atoms repel and attract the atom.
 */

var last_sqdist_from_end = 0;
function initialize_formation_atom(){
	/*
	 *  so we generate a series of positions.
	    its movement distance is a random length
	    we generate a random 
	
	    we start it in place, wobble a bit.
	    one position very close to the final position, the penultimate pose
	    then random movements around, subject to:
			-can't get closer to the final position than the penultimate pose
			-to make it easy let's say you can't get closer to the center of the QC than blah, and can't get further away than bleh
		and then we move it away when the time comes in the video by just adding a vector going away from the center.
		we would like the atom to come from the top
		
		No, we have 60 per second. Round secondsthroughvid to the nearest one.
		
		
		Random walk:
		 * -starting with the atom in the final position, generate a trajectory of it, just an array of vector positions
		 * -little vibration at first, then it pops out
		 * -confine it to a sphere. Make it move in random directions with a 
		 * 
		 * How to manage it state-wise? Could have it be triggered if the time is precisely equal to a certain number.
		 * Might want to ensure that it is seen from the right angle? Could rotate lattice in a way that leaves it unchanged.
	 */
	
	var furthestdists = Array(0,0,0, 0,0,0, 0,0,0, 0,0,0);
	var count = 0;
	for(var i = 0; i<QC_atoms.geometry.attributes.position.array.length / 3; i++){
		var dist = 	QC_atoms.geometry.attributes.position.array[i*3+0]*QC_atoms.geometry.attributes.position.array[i*3+0]+
					QC_atoms.geometry.attributes.position.array[i*3+1]*QC_atoms.geometry.attributes.position.array[i*3+1]+
					QC_atoms.geometry.attributes.position.array[i*3+2]*QC_atoms.geometry.attributes.position.array[i*3+2];
		
		if(dist>13.77){
				outermost_QCatom_indices[count] = i;
				count++;
		}
	}
	
	formation_animation_numbers[0] = QC_atoms.geometry.attributes.position.array[outermost_QCatom_indices[1]*3+0];
	formation_animation_numbers[1] = QC_atoms.geometry.attributes.position.array[outermost_QCatom_indices[1]*3+1];
	formation_animation_numbers[2] = QC_atoms.geometry.attributes.position.array[outermost_QCatom_indices[1]*3+2];
	
	var general_direction_vector = new THREE.Vector3(0,0,0.000001);
	
	var newposition = new THREE.Vector3();
	var last_sqdist_from_end = 0;
	for(var i = 1; i < formation_animation_numbers.length/3; i++){
		newposition.set(0,0,0);
		var iterations = 0;
		while(!check_requirements(newposition,i)){
			get_random_movementvector(newposition, i);
			if(i < 300)
				newposition.setLength(0.003*Math.pow(i,1/3));
			newposition.x += formation_animation_numbers[(i-1)*3+0];
			newposition.y += formation_animation_numbers[(i-1)*3+1];
			newposition.z += formation_animation_numbers[(i-1)*3+2];
//			newposition.z -= 0.00001;
			iterations++;
			if(iterations >10){
				console.log("10 tries");
				break;
			}
		}
		formation_animation_numbers[i*3+0] = newposition.x;
		formation_animation_numbers[i*3+1] = newposition.y;
		formation_animation_numbers[i*3+2] = newposition.z;
	}
}

function check_requirements(position, place){
	if(position.lengthSq() < 13.7 )
		return 0;
	if(position.lengthSq() > 15.6 )
		return 0;
//	var dist_from_end = Math.sqrt( 	(position.x - formation_animation_numbers[0]) * (position.x - formation_animation_numbers[0]) +
//									(position.y - formation_animation_numbers[1]) * (position.y - formation_animation_numbers[1]) +
//									(position.z - formation_animation_numbers[2]) * (position.z - formation_animation_numbers[2]) );
//	if( dist_from_end < place * 0.01)
//		return 0;
	
	/*
	 * we also want to get further and further from the endpoint
	 * we may also want to stay in place for a second initially
	 */
//	last_sqdist_from_end = sqdist_from_end;
	return 1;
}

function get_random_movementvector(MovementVector, place){
	var minMovement = 0.01;
	var maxMovement = 0.45;
	var randLength = minMovement + Math.random() * (maxMovement - minMovement);
	MovementVector.set(Math.random() - 0.5,Math.random() - 0.5,Math.random() - 0.5);
	MovementVector.setLength(randLength);
}

function reorient_crystal(){
	/*
	 * We find which corner is closest to where we'd like some one corner to be
	 */
	//we get two corners we'd like to swap
	
	//then just do this once, when we switch to this mode (?)
}

function swap_points(swappedpoint1, swappedpoint2){
	var anglebetween = swappedpoint1.angleTo(swappedpoint2);
	swappedpoint2.setLength(swappedpoint1.length());
	var axis = new THREE.Vector3();
	if(Math.abs(anglebetween - TAU / 2) < 0.01)
		axis.addVectors(swappedpoint1,swappedpoint2);
	else {
		//any random vector at a right angle to one of them will do
		axis.crossVectors(z_central_axis, swappedpoint1);
	}

	axis.normalize();
	
	rotate_3DPenrose_entirety(axis,TAU/2);
}

function update_formation_atom(){
	var nearest_frame = (secondsthroughvid - animation_beginning_second);
	nearest_frame *= 60;
	nearest_frame = Math.round(nearest_frame);
	nearest_frame = formation_animation_numbers.length / 3 - nearest_frame;
	
	if( 0 <= nearest_frame && nearest_frame < formation_animation_numbers.length / 3 ) { 
		QC_atoms.geometry.attributes.position.setXYZ(outermost_QCatom_indices[1], 
			formation_animation_numbers[nearest_frame * 3 + 0],
			formation_animation_numbers[nearest_frame * 3 + 1],
			formation_animation_numbers[nearest_frame * 3 + 2] );
	}
	else{
		QC_atoms.geometry.attributes.position.setXYZ(outermost_QCatom_indices[1], 
			formation_animation_numbers[0 * 3 + 0],
			formation_animation_numbers[0 * 3 + 1],
			formation_animation_numbers[0 * 3 + 2] ); //this is the default.
	}
	
	QC_atoms.geometry.attributes.position.needsUpdate = true;
}