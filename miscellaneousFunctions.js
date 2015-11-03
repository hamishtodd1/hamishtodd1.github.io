//aka ourpoint and ourline_top are lines originating from ourline_bottom and we wish to know which line is clockwise of other
function point_to_the_right_of_line_vecs(ourpoint, line_top, line_bottom) {
	//Say you have two 2D vectors p and q with same origin. p will be "clockwise of" q if z-component of cross product is positive
	if( 	(ourpoint.x-line_bottom.x) * (line_top.y-line_bottom.y)
		  <=(ourpoint.y-line_bottom.y) * (line_top.x-line_bottom.x)
	  ) return false;
	else
		return true;
}

function deduce_most_of_surface(openness, vertices_numbers) {
	for( var i = 3; i < 22; i++) {
		var theta = minimum_angles[i] + openness * (TAU/2 - minimum_angles[i]);
		
		var a_index = vertices_derivations[i][0];
		var b_index = vertices_derivations[i][1];
		var c_index = vertices_derivations[i][2];
		
		var a = new THREE.Vector3( //this is our origin
			vertices_numbers.array[a_index * 3 + 0],
			vertices_numbers.array[a_index * 3 + 1],
			vertices_numbers.array[a_index * 3 + 2]);	
			
		var a_net = new THREE.Vector3( //this is our origin
			flatnet_vertices.array[a_index * 3 + 0],
			flatnet_vertices.array[a_index * 3 + 1],
			0);	
		
		var crossbar_unit = new THREE.Vector3(
			vertices_numbers.array[b_index * 3 + 0],
			vertices_numbers.array[b_index * 3 + 1],
			vertices_numbers.array[b_index * 3 + 2]);
		crossbar_unit.sub(a);			
		crossbar_unit.normalize();
		
		var net_crossbar_unit = new THREE.Vector3(
			flatnet_vertices.array[b_index*3+0],
			flatnet_vertices.array[b_index*3+1],
			0);
		net_crossbar_unit.sub(a_net);
		net_crossbar_unit.normalize();
		
		var d_net = new THREE.Vector3( 
			flatnet_vertices.array[i*3+0],
			flatnet_vertices.array[i*3+1],
			0);
		d_net.sub(a_net);
		var d_hinge_origin_length = d_net.length() * get_cos( d_net, net_crossbar_unit);	
		
		var d_hinge_origin = new THREE.Vector3(
			crossbar_unit.x * d_hinge_origin_length,
			crossbar_unit.y * d_hinge_origin_length,
			crossbar_unit.z * d_hinge_origin_length);
			
		var d_hinge_origin_net = new THREE.Vector3(
			net_crossbar_unit.x * d_hinge_origin_length,
			net_crossbar_unit.y * d_hinge_origin_length,
			net_crossbar_unit.z * d_hinge_origin_length);
			
		var d_hinge_net = d_net.clone();
		d_hinge_net.sub( d_hinge_origin_net );

		var c = new THREE.Vector3(
			vertices_numbers.array[c_index * 3 + 0],
			vertices_numbers.array[c_index * 3 + 1],
			vertices_numbers.array[c_index * 3 + 2]);
		c.sub(a);
		var c_hinge_origin_length = c.length() * get_cos(crossbar_unit, c);		
		var c_hinge_origin = new THREE.Vector3(
			crossbar_unit.x * c_hinge_origin_length,
			crossbar_unit.y * c_hinge_origin_length,
			crossbar_unit.z * c_hinge_origin_length);
			
		var c_hinge_unit = new THREE.Vector3();
		c_hinge_unit.subVectors( c, c_hinge_origin);
		c_hinge_unit.normalize();
		var c_hinge_component = c_hinge_unit.clone();
		c_hinge_component.multiplyScalar( Math.cos(theta) * d_hinge_net.length());
			
		var downward_vector_unit = new THREE.Vector3();		
		downward_vector_unit.crossVectors(crossbar_unit, c);
		downward_vector_unit.normalize();
		var downward_component = downward_vector_unit.clone();
		downward_component.multiplyScalar(Math.sin(theta) * d_hinge_net.length());
		
		var d = new THREE.Vector3();
		d.addVectors(downward_component, c_hinge_component);
		d.add( d_hinge_origin );
		d.add( a );
		
		vertices_numbers.setXYZ(i, d.x,d.y,d.z);
	}
}

function put_tube_in_buffer(A,B, mybuffer, radius ) {
	if(radius==undefined)
		radius = 0.02; 
	
	var A_to_B = new THREE.Vector3(B.x-A.x, B.y-A.y, B.z-A.z);
	var perp = new THREE.Vector3(A_to_B.y*A_to_B.y+A_to_B.z*A_to_B.z,   A_to_B.y*-A_to_B.x,  A_to_B.z*-A_to_B.x);
	perp.normalize();
	A_to_B.normalize();
	for( var i = 0; i < mybuffer.length/3/2; i++) {
		var theta = i * TAU/(mybuffer.length/3/2);
		var radiuscomponent = perp.clone();
		radiuscomponent.multiplyScalar(radius);
		radiuscomponent.applyAxisAngle(A_to_B, theta);
		
		mybuffer[ i*2 * 3 + 0] = A.x + radiuscomponent.x;
		mybuffer[ i*2 * 3 + 1] = A.y + radiuscomponent.y;
		mybuffer[ i*2 * 3 + 2] = A.z + radiuscomponent.z;
		
		mybuffer[(i*2+1) * 3 + 0] = B.x + radiuscomponent.x;
		mybuffer[(i*2+1) * 3 + 1] = B.y + radiuscomponent.y;
		mybuffer[(i*2+1) * 3 + 2] = B.z + radiuscomponent.z;
	}
}

//we're not going to treat this like it is performance sensetive
function put_unbased_triangularprism_in_buffer(A,B,mybuffer,peak){
	var A_to_B = new THREE.Vector3(B.x-A.x, B.y-A.y, B.z-A.z);
	A_to_B.normalize();
	peak.applyAxisAngle(A_to_B, -TAU/3);
	for( var i = 0; i < 3; i++) {
		mybuffer[ i*2 * 3 + 0] = A.x + peak.x;
		mybuffer[ i*2 * 3 + 1] = A.y + peak.y;
		mybuffer[ i*2 * 3 + 2] = A.z + peak.z;
		
		mybuffer[(i*2+1) * 3 + 0] = B.x + peak.x;
		mybuffer[(i*2+1) * 3 + 1] = B.y + peak.y;
		mybuffer[(i*2+1) * 3 + 2] = B.z + peak.z;
		
		peak.applyAxisAngle(A_to_B, TAU/3);
	}
}

function point_to_the_right_of_line(ourpointx,ourpointy,
									line_topx,line_topy, line_bottomx,line_bottomy) {
	var z_coord = 	(ourpointx * line_topy + line_bottomx *-line_topy + ourpointx *-line_bottomy + line_bottomx * line_bottomy)
				  -	(ourpointy * line_topx + line_bottomy *-line_topx + ourpointy *-line_bottomx + line_bottomy * line_bottomx);
	if( z_coord < 0 ) return 0;
	else if( z_coord > 0 ) return 1;
	else return 2; //on the line
}

//if it's on the line segments, it's in
function point_in_triangle( ourpointx,ourpointy,
							cornerAx, cornerAy,cornerBx, cornerBy, cornerCx,cornerCy, 
							clockwise)
{
//	if(!logged) console.log(point_to_the_right_of_line(ourpointx, ourpointy, cornerAx, cornerAy, cornerBx, cornerBy));
//	if(!logged) console.log(point_to_the_right_of_line(ourpointx, ourpointy, cornerBx, cornerBy, cornerCx, cornerCy));
//	if(!logged) console.log(point_to_the_right_of_line(ourpointx, ourpointy, cornerCx, cornerCy, cornerAx, cornerAy));
		
	if(clockwise === undefined) {
		if( point_to_the_right_of_line(cornerC, cornerA, cornerB))
			clockwise = true;
		else
			clockwise = false;		
	}
	
	if( clockwise ) {
		if( 	point_to_the_right_of_line(ourpointx, ourpointy, cornerAx, cornerAy, cornerBx, cornerBy) != 1
			&&	point_to_the_right_of_line(ourpointx, ourpointy, cornerBx, cornerBy, cornerCx, cornerCy) != 1
			&&	point_to_the_right_of_line(ourpointx, ourpointy, cornerCx, cornerCy, cornerAx, cornerAy) != 1
			) return true;
	}
	else {
		if( 	point_to_the_right_of_line(ourpointx, ourpointy, cornerAx, cornerAy, cornerCx, cornerCy) != 0
			&&	point_to_the_right_of_line(ourpointx, ourpointy, cornerCx, cornerCy, cornerBx, cornerBy) != 0
			&&	point_to_the_right_of_line(ourpointx, ourpointy, cornerBx, cornerBy, cornerAx, cornerAy) != 0
			) return true;
	}
	return false;
}

//put them in in cross-product order and your fingers, going from the first vector to the second, will be going along the angle this returns the sin of
function get_sin_Vector2(side1, side2)
{
	return (side1.x * side2.y - side1.y * side2.x ) / side1.length() / side2.length();
}

function get_cos(side1, side2)
{
	return side1.dot( side2 ) / side1.length() / side2.length();
}

function get_angle(side1, side2) {
	return Math.acos(get_cos(side1, side2));
}

function get_vector(index, vertex_array) {
	var ourvector = new THREE.Vector3();
	if(vertex_array = FLATNET) {
		ourvector.set(
			flatnet_vertices.array[index * 3 + 0],
			flatnet_vertices.array[index * 3 + 1],
			flatnet_vertices.array[index * 3 + 2] );
		return ourvector;
	}
	if(vertex_array = SURFACE) {
		ourvector.set(
			surface_vertices.array[index * 3 + 0],
			surface_vertices.array[index * 3 + 1],
			surface_vertices.array[index * 3 + 2] );
		return ourvector;
	}
	if(vertex_array = POLYHEDRON) {
		ourvector.set(
			polyhedron_vertices.array[index * 3 + 0],
			polyhedron_vertices.array[index * 3 + 1],
			polyhedron_vertices.array[index * 3 + 2] );
		return ourvector;
	}
	
	console.log("Error: array unrecognized");
}

//a is the length of the side that is opposite the desired angle
function get_cos_rule(a,b,c)
{
	return (b*b + c*c - a*a) / (2*b*c);
}

//COUNTER CLOCKWISE
function rotate_vector2_counterclock( myvector, angle)
{
	var costheta = Math.cos(angle);
	var sintheta = Math.sin(angle);
	var newvector = new THREE.Vector2(
		myvector.x * costheta - myvector.y * sintheta,
		myvector.x * sintheta + myvector.y * costheta);
		
	return newvector;
}

//new vector would be at an angle to the rootvector
function vector_from_bearing( rootvector, length, angle, cos, sin) {
	if( sin === undefined ) {			
		var newvector = new THREE.Vector2(
			length / rootvector.length() * ( -Math.sin( angle) * rootvector.y - Math.cos(angle) * rootvector.x),
			length / rootvector.length() * (  Math.sin( angle) * rootvector.x - Math.cos(angle) * rootvector.y ) );
			
		return newvector;
	}
	else { //we might have been given a shortcut
		var newvector = new THREE.Vector2(
			length / rootvector.length() * ( cos * rootvector.x + sin * rootvector.y),
			length / rootvector.length() * ( cos * rootvector.y - sin * rootvector.x) );
			
		return newvector;
	}
}

//never know, it might come in handy
function tetrahedron_top(P1,P2,P3, r1,r2,r3) {
	P3.sub(P1);
	P2.sub(P1);
	var P3_P2_angle = Math.acos(P3.dot(P2)/P2.length()/P3.length());
	
	var P1_t = new THREE.Vector3(0,0,0);
	var P2_t = new THREE.Vector3(P2.length(),0,0);
	var P3_t = new THREE.Vector3(P3.length() * Math.cos(P3_P2_angle), P3.length() * Math.sin(P3_P2_angle),0);
	
	var cp_t = new THREE.Vector3(0,0,0);
	cp_t.x = ( r1*r1 - r2*r2 + P2_t.x * P2_t.x ) / ( 2 * P2_t.x );
	cp_t.y = ( r1*r1 - r3*r3 + P3_t.x * P3_t.x + P3_t.y * P3_t.y ) / ( P3_t.y * 2 ) - ( P3_t.x / P3_t.y ) * cp_t.x;
	if(r1*r1 - cp_t.x*cp_t.x - cp_t.y*cp_t.y < 0) {
		//console.log("Impossible tetrahedron");
		return false;			
	}
	cp_t.z = Math.sqrt(r1*r1 - cp_t.x*cp_t.x - cp_t.y*cp_t.y);
	
	var cp = new THREE.Vector3(0,0,0);
	
	var z_direction = new THREE.Vector3();
	z_direction.crossVectors(P2,P3);
	z_direction.normalize(); 
	z_direction.multiplyScalar(cp_t.z);
	cp.add(z_direction);
	
	var x_direction = P2.clone();
	x_direction.normalize();
	x_direction.multiplyScalar(cp_t.x);
	cp.add(x_direction);
	
	var y_direction = new THREE.Vector3();
	y_direction.crossVectors(z_direction,x_direction);
	y_direction.normalize();
	y_direction.multiplyScalar(cp_t.y);
	cp.add(y_direction);		
	cp.add(P1);
	
	P2.add(P1);
	P3.add(P1);
	
	return cp;
}