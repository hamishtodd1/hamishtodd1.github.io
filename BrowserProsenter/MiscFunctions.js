function Random_perp_vector(OurVector){
	var PerpVector = new THREE.Vector3();
	
	if( OurVector.equals(Central_Z_axis))
		PerpVector.crossVectors(OurVector, Central_Z_axis);
	else
		PerpVector.crossVectors(OurVector, Central_Y_axis);
	
	return PerpVector;
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