function Random_perp_vector(OurVector){
	var PerpVector = new THREE.Vector3();
	
	if( OurVector.equals(Central_Z_axis))
		PerpVector.crossVectors(OurVector, Central_Z_axis);
	else
		PerpVector.crossVectors(OurVector, Central_Y_axis);
	
	return PerpVector;
}

function move_smooth_vectors(startposition,finalposition,time_final, time_current){
	if(time_current >= time_final)
		return finalposition;
	else if(time_current < 0)
		return startposition;
	
	var whole_movement_vector = new THREE.Vector3();
	whole_movement_vector.subVectors(finalposition,startposition);
	var current_position = whole_movement_vector.clone();
	current_position.multiplyScalar( move_smooth(time_final, time_current) );
	current_position.add(startposition);
	return current_position;
}

function move_smooth(time_final, time_current){
	if(time_current >= time_final)
		return 1;
	else if(time_current < 0)
		return 0;
	
	var startaccel = 6 / ( time_final * time_final );
	return startaccel * time_current * time_current * ( 1 / 2 - time_current / 3 / time_final );
}

//crap for telling you where it came from
//function logonce(thing){
//	if(!logged)console.error(thing);
//	logged = 1;
//}

//doing this because apparently things sent over the network change, causing an error if you use threejs's function. May be something else
function copyvec(copytoVec, copyfromVec){
	copytoVec.x = copyfromVec.x;
	copytoVec.y = copyfromVec.y;
	copytoVec.z = copyfromVec.z;
}
function copyquat(copytoQuat, copyfromQuat){
	copytoQuat._x = copyfromQuat._x;
	copytoQuat._y = copyfromQuat._y;
	copytoQuat._z = copyfromQuat._z;
	copytoQuat._w = copyfromQuat._w;
}

//the rainbow would be nice
function NumberToHexColor(ournum)
{
	console.log(ournum)
	ournum *= 16777216;
	ournum = Math.round(ournum);
	
	if(ournum > 16777215)
		ournum = 16777215;
	if(ournum < 0)
		ournum = 0;
	
	var ourstring = ournum.toString(16);
	console.log(ournum,ourstring)
	ourstring = "0x" + ournum; //yeah dunno about this
	return ournum;
}

function point_distance_to_line(p0,p1,p2)
{
	
}