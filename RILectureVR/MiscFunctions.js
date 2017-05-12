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

function loadpic(url, materialToMapTo) {
	var texture_loader = new THREE.TextureLoader();
	texture_loader.crossOrigin = true;
	texture_loader.load(
			url,
		function(texture) {			
			materialToMapTo.map = texture;
			materialToMapTo.needsUpdate = true;
		},
		function ( xhr ) {}, function ( xhr ) {
			console.log( 'texture loading error: ' + url );
		}
	);
}

function init_cylinder(ourGeometry, cylinder_sides, num_added)
{
	var firstVertexIndex = num_added * cylinder_sides * 2;
	for(var i = 0; i < cylinder_sides; i++)
	{
		ourGeometry.vertices.push(new THREE.Vector3());
		ourGeometry.vertices.push(new THREE.Vector3());
		ourGeometry.faces.push( new THREE.Face3(
			firstVertexIndex + i*2+1,
			firstVertexIndex + i*2+0,
			firstVertexIndex + (i*2+2) % (cylinder_sides*2)
				) );
		ourGeometry.faces.push( new THREE.Face3(
			firstVertexIndex + i*2+1,
			firstVertexIndex + (i*2+2) % (cylinder_sides*2),
			firstVertexIndex + (i*2+3) % (cylinder_sides*2)
				) );
	}
}

function Random_perp_vector(OurVector){
	var PerpVector = new THREE.Vector3();
	
	if( OurVector.equals(zAxis))
		PerpVector.crossVectors(OurVector, yAxis);
	else
		PerpVector.crossVectors(OurVector, zAxis);
	
	return PerpVector;
}
function insert_cylindernumbers(A,B, vertices_array, cylinder_sides, cylinderIndex, radius ) {
	var array_startpoint = cylinder_sides * 2 * cylinderIndex;
	
	var A_to_B = new THREE.Vector3(B.x-A.x, B.y-A.y, B.z-A.z);
	A_to_B.normalize();
	var perp = Random_perp_vector(A_to_B);
	perp.normalize(); 
	for( var i = 0; i < cylinder_sides; i++)
	{
		var radiuscomponent = perp.clone();
		radiuscomponent.multiplyScalar(radius);
		radiuscomponent.applyAxisAngle(A_to_B, i * TAU / cylinder_sides);
		
		vertices_array[array_startpoint + i*2 ].copy(radiuscomponent);
		vertices_array[array_startpoint + i*2 ].add(A);
		
		vertices_array[array_startpoint + i*2+1 ].copy(radiuscomponent);
		vertices_array[array_startpoint + i*2+1 ].add(B);
	}
}

//assumes center is at 0,0,0
function clockwise_on_polyhedronsurface(A,B,C)
{
	var ourcross = (new THREE.Vector3()).crossVectors( A, B );
	var clockwise = ( ourcross.dot( C ) < 0 );
	return clockwise;
}