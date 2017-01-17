var axis1D = new THREE.Object3D();
var axis2D = new THREE.Object3D();
var axis3D = new THREE.Object3D();
var axis4D = new THREE.Object3D();
var axis6D = new THREE.Object3D();

//you need to make sure that the vertices are given in the same order as the extrusion in the poly array function.
//from what we have in poly arrays, this simply means the vectors lined up around a center
function extrude(ourGeometry, axis_vectors, edgelen, extrusion_level, first_vertex, num_vertices_to_change)
{
	if( typeof extrusion_level === 'undefined')
		extrusion_level = axis_vectors.length;
	if( typeof first_vertex === 'undefined')
		first_vertex = 0;
	if( typeof num_vertices_to_change === 'undefined')
		num_vertices_to_change = ourGeometry.vertices.length;
	
	var axis_addition = new THREE.Vector3();
	for(var i = 0; i < num_vertices_to_change; i++)
		ourGeometry.vertices[first_vertex + i].set(0,0,0);
	
	for(var i = 0; i < axis_vectors.length; i++) //don't get any more axis vectors, don't get any more extrusion
	{
		axis_addition.copy( axis_vectors[i] );
		if( extrusion_level > i )
		{
			var addition_length = extrusion_level - i;
			if( addition_length > 1 ) addition_length = 1;
			addition_length *= edgelen;
			axis_addition.multiplyScalar(addition_length); //you could have it be setlength if you always want them to be the same length
		}
		else continue;
		
		for(var j = 0; j < num_vertices_to_change; j++)
			if( j & powers_of_2[i] )
				ourGeometry.vertices[first_vertex + j].add(axis_addition);
	}
	
	ourGeometry.verticesNeedUpdate = true;
}

function init_axes()
{
	var axisLength = 0.6;
	var axisRadius = 0.009;
	var base_axis = new THREE.CylinderGeometry(axisRadius,axisRadius, axisLength, 32,1,true);
	var up_arrow = new THREE.ConeGeometry(axisRadius * 2, axisLength / 12, 32);
	for(var i = 0; i < up_arrow.vertices.length; i++)
		up_arrow.vertices[i].y += axisLength / 2;
	base_axis.merge(up_arrow, new THREE.Matrix4() );
	var down_arrow = up_arrow.clone();
	var down_arrow_matrix = new THREE.Matrix4();
	down_arrow_matrix.makeRotationAxis(xAxis, TAU / 2);
	base_axis.merge(down_arrow, down_arrow_matrix );
	
	function add_axis(axis_set, Y_rotation, Z_rotation)
	{
		var axis_index = axis_set.children.length;
		var axis_color;
		if(axis_index === 0) { axis_color = 0xFF0000; labelstring = "  y"; }
		if(axis_index === 2) { axis_color = 0x00FF00; labelstring = "  x"; }
		if(axis_index === 4) { axis_color = 0x0000FF; labelstring = "  z"; }
		if(axis_index === 6) { axis_color = 0x00FFFF; labelstring = "  w"; }
		if(axis_index === 8) { axis_color = 0xFF00FF; labelstring = "  u"; }
		if(axis_index === 10){ axis_color = 0x0000FF; labelstring = "  v"; }
		
		axis_set.add( new THREE.Mesh( base_axis.clone(), new THREE.MeshPhongMaterial({ color: axis_color }) ) );
		axis_set.children[axis_index].rotateOnAxis(yAxis, Y_rotation);
		axis_set.children[axis_index].rotateOnAxis(zAxis, Z_rotation);
		
		axis_set.add( new THREE.Mesh(
				new THREE.BoxGeometry(0.01,0.01,0.01),
				new THREE.TextGeometry( labelstring, {size: axisLength / 13, height: axisLength / 80, font: gentilis}),
				new THREE.MeshPhongMaterial( { color: axis_color,  shading: THREE.FlatShading } ) ) );
		axis_set.children[axis_index + 1].position.y = axisLength / 2;
		axis_set.children[axis_index + 1].position.applyAxisAngle(zAxis, Z_rotation);
		axis_set.children[axis_index + 1].position.applyAxisAngle(yAxis, Y_rotation);
	}
		
	add_axis( axis1D, 0,0 );
	axis1D.update = axis_update;
	
	add_axis( axis2D, 0,0 );
	add_axis( axis2D, 0, TAU / 4 );
	axis2D.update = axis_update;

	add_axis( axis3D, 0,0 );
	add_axis( axis3D, 0, TAU / 4 );
	add_axis( axis3D, TAU / 4, TAU / 4 );
	axis3D.update = axis_update;
	
	var adjacent_square_corner_angle = 2*Math.atan(1/Math.sqrt(2));
	add_axis( axis4D, 0,0 );
	for(var i = 0; i < 3; i++)
		add_axis( axis4D, i * TAU / 3, adjacent_square_corner_angle );
	axis4D.update = axis_update;
	
	var adjacent_ico_corner_angle = 2*Math.atan(1/PHI);
	for(var i = 0; i < 5; i++)
		add_axis( axis6D, i * TAU / 5, adjacent_ico_corner_angle );
	add_axis( axis6D, 0,0 ); //because the tria is extruded after the others
	axis6D.update = axis_update;
	
//	Protein.add(axis3D);
}

function axis_update()
{
	var welookat = new THREE.Vector3();
	this.updateMatrixWorld();
	this.worldToLocal(welookat);
	for(var i = 0; i < this.children.length; i++)
		if( this.children[i].geometry.type === "TextGeometry" )
			this.children[i].lookAt(welookat);
}

function Random_perp_vector(OurVector){
	var PerpVector = new THREE.Vector3();
	
	if( OurVector.equals(zAxis))
		PerpVector.crossVectors(OurVector, yAxis);
	else
		PerpVector.crossVectors(OurVector, zAxis);
	
	return PerpVector;
}
function insert_cylindernumbers(A,B, vertices_array, cylinder_sides, array_startpoint, radius ) {
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