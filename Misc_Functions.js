//TODO: use this on surface opening
//tells you how far along you are, as a proportion
function move_smooth(time_final, time_current){
	if(time_current >= time_final)
		return 1;
	else if(time_current < 0)
		return 0;
	
	var startaccel = 6 / ( time_final * time_final );
	return startaccel * time_current * time_current * ( 1 / 2 - time_current / 3 / time_final );
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



function difference_between_angles(angle1, angle2){
	//this would be worthwhile
}

function Square(a){
	return a*a;
}

//top left, top right, bottom left, bottom right
function apply2Dmatrix(Matrix, vector){
	var oldX = vector.x;
	vector.x = Matrix[0] * vector.x + Matrix[1] * vector.y;
	vector.y = Matrix[2] * oldX		+ Matrix[3] * vector.y;
}

function two_way_reduce(num, destnum,reduction_speed){
	if(num > destnum){
		num -= reduction_speed;
		if(num < destnum){
			num = destnum;
		}
	}
	else{
		num += reduction_speed;
		if(num > destnum){
			num = destnum;
		}
	}
	
	return num;
}

//v and w are ends of a line segment, p is a point and we wish to know its dist from the line
function minimum_distance(v0, w0, p0) {
	var w = new THREE.Vector2(w0.x,w0.y);
	var v = new THREE.Vector2(v0.x,v0.y);
	var p = new THREE.Vector2(p0.x,p0.y);
	
	var l2 = v.distanceTo(w);  // i.e. |w-v|^2 -  avoid a sqrt
	l2 = l2 * l2;
	if (l2 == 0.0) return p.distanceTo(v);   // v == w case
	var VtoP = v.clone();
	VtoP.sub(p);
	var VtoW = w.clone();
	VtoW.sub(v);
	var t = -VtoP.dot(VtoW) / l2;
	if (t < 0.0) return p.distanceTo(v);       // Beyond the 'v' end of the segment
	else if (t > 1.0) return p.distanceTo(w);  // Beyond the 'w' end of the segment
	var projection =v.clone();
	projection.addScaledVector(VtoW,t);  // Projection falls on the segment
	return p.distanceTo(projection);
}

function deduce_stable_points_from_fanning_vertex(fanning_vertex_start, lattice_vertex_index, spoke_to_side_angle){
	var fanning_vertex_length = fanning_vertex_start.length();
	var hand = 1;
	if(fanning_vertex_length < 0.6)
		hand = 0;
	if(fanning_vertex_length > 0.7)
		hand = 2;
	
	for(var j = 0; j < 10; j++){
		var fanning_vertex = fanning_vertex_start.clone();
		fanning_vertex.applyAxisAngle(z_central_axis, j * TAU / 10);
		
		var potential_stable_point = fanning_vertex.clone();
		potential_stable_point.add(quasilattice_default_vertices[lattice_vertex_index]);
		
		potential_stable_point_spoke = potential_stable_point.clone();
		potential_stable_point_spoke.negate();
		
		var latticevertex_for_stablepoint = fanning_vertex.clone();
		latticevertex_for_stablepoint.negate();
		var in_ness_angle = potential_stable_point_spoke.angleTo(latticevertex_for_stablepoint);
		if(lattice_vertex_index == 0 && hand == 0 && j == 0 )
			console.log(in_ness_angle,spoke_to_side_angle - 0.00001, potential_stable_point_spoke, latticevertex_for_stablepoint );
		if( in_ness_angle > spoke_to_side_angle + 0.00001 )
			continue; //the point we originate from wouldn't be in the face
		
		var confirmed_stablepoint = 1;
		
		//gotta check what points WOULD be in the face IF we snapped to this point.
		for(var k = 0; k < quasilattice_default_vertices.length; k++) {
			if(k==lattice_vertex_index || k%8==7 || k == quasilattice_default_vertices.length-1)
				continue;
			var k_dist_to_potentialpoint = quasilattice_default_vertices[k].distanceTo(potential_stable_point);
			if( 0.00001 < k_dist_to_potentialpoint && k_dist_to_potentialpoint < fanning_vertex_length + 0.00001){ //points on points ARE allowed in.
				var point_relative_to_corner = quasilattice_default_vertices[k].clone();
				point_relative_to_corner.sub(potential_stable_point);
				
				in_ness_angle = point_relative_to_corner.angleTo(potential_stable_point_spoke);
				
				if( in_ness_angle < spoke_to_side_angle + 0.00001 ){
					confirmed_stablepoint = 0;
					break;
				}
			}
		}
		
		if(confirmed_stablepoint){
			stable_points[lowest_unused_stablepoint].copy(potential_stable_point);
//			console.log(j,hand);
			lowest_unused_stablepoint++;
		}
	}
}

function vec2_crossprod(a,b){
	return a.x*b.y-a.y*b.x;
}

function line_line_intersection(startpointA,startpointB,endpointA,endpointB){
	var lineA = endpointA.clone();
	lineA.sub(startpointA);
	var lineB = endpointB.clone();
	lineB.sub(startpointB);
	return line_line_intersection_vecs(startpointA,startpointB,lineA,lineB);
}
//p connected to r, q connected to s.
function line_line_intersection_vecs(p,q,r,s) {
	var r_cross_s = vec2_crossprod(r,s); //it's a scalar, representing z.
	if(r_cross_s === 0)
		return 0;
	
	var r_over_r_cross_s = r.clone();
//	r_over_r_cross_s.multiplyScalar(1/r_cross_s);
	var s_over_r_cross_s = s.clone();
//	s_over_r_cross_s.multiplyScalar(1/r_cross_s);
	
	var p_to_q = q.clone();
	p_to_q.sub(p);
	
	var u = vec2_crossprod(p_to_q,r_over_r_cross_s);
	var t = vec2_crossprod(p_to_q,s_over_r_cross_s);
	
	u /= r_cross_s;
	t /= r_cross_s;
	
//	if(!logged)console.log(u,t)
	if( 0 <= u && u <= 1 
	 && 0 <= t && t <= 1 ){
		var answer = p.clone();
//		if(!logged)console.log(answer, r, t)
		answer.addScaledVector(r, t);
		return answer;
	}
	else return 0;
}

//this assumes that the first three vertices are in the same shape as that first flatnet triangle
function deduce_most_of_surface(openness, vertices_numbers) {
	for( var i = 3; i < 22; i++) {
		var a_index = vertices_derivations[i][0];
		var b_index = vertices_derivations[i][1];
		var c_index = vertices_derivations[i][2];
			
		var a_net = new THREE.Vector3( //this is our origin
			flatnet_vertices.array[a_index * 3 + 0],
			flatnet_vertices.array[a_index * 3 + 1],
			0);	
		
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
		var d_hinge_net = d_net.clone();
		var d_hinge_origin_net = new THREE.Vector3(
				net_crossbar_unit.x * d_hinge_origin_length,
				net_crossbar_unit.y * d_hinge_origin_length,
				net_crossbar_unit.z * d_hinge_origin_length);
		d_hinge_net.sub( d_hinge_origin_net );
		
		var a = new THREE.Vector3(
			vertices_numbers.array[a_index * 3 + 0],
			vertices_numbers.array[a_index * 3 + 1],
			vertices_numbers.array[a_index * 3 + 2]);	
		var b = new THREE.Vector3(
			vertices_numbers.array[b_index * 3 + 0],
			vertices_numbers.array[b_index * 3 + 1],
			vertices_numbers.array[b_index * 3 + 2]);
		var c = new THREE.Vector3(
			vertices_numbers.array[c_index * 3 + 0],
			vertices_numbers.array[c_index * 3 + 1],
			vertices_numbers.array[c_index * 3 + 2]);
		
		var bend_angle = minimum_angles[i] + openness * (TAU/2 - minimum_angles[i]);
		
		var d = bent_down_quad_corner(a,b,c,bend_angle,d_hinge_origin_length, d_hinge_net.length());
		
		vertices_numbers.setXYZ(i, d.x,d.y,d.z);
	}
}

function deduce_most_of_surface_regular(openness, vertices_numbers) {
	var bend_angle = Math.acos(-Math.sqrt(5)/3);
	bend_angle = bend_angle + openness * (TAU/2 - bend_angle);
	
	var a = new THREE.Vector3(
			vertices_numbers.array[0 * 3 + 0],
			vertices_numbers.array[0 * 3 + 1],
			vertices_numbers.array[0 * 3 + 2]);	
	var b = new THREE.Vector3(
			vertices_numbers.array[1 * 3 + 0],
			vertices_numbers.array[1 * 3 + 1],
			vertices_numbers.array[1 * 3 + 2]);
	var edgelength = a.distanceTo(b);
		
	for( var i = 3; i < 22; i++) {
		var a_index = vertices_derivations[i][0];
		var b_index = vertices_derivations[i][1];
		var c_index = vertices_derivations[i][2];
			
		var a = new THREE.Vector3(
			vertices_numbers.array[a_index * 3 + 0],
			vertices_numbers.array[a_index * 3 + 1],
			vertices_numbers.array[a_index * 3 + 2]);	
		var b = new THREE.Vector3(
			vertices_numbers.array[b_index * 3 + 0],
			vertices_numbers.array[b_index * 3 + 1],
			vertices_numbers.array[b_index * 3 + 2]);
		var c = new THREE.Vector3(
			vertices_numbers.array[c_index * 3 + 0],
			vertices_numbers.array[c_index * 3 + 1],
			vertices_numbers.array[c_index * 3 + 2]);
		
		var d = bent_down_quad_corner(a,b,c,bend_angle,0.5 * edgelength, HS3 * edgelength);
		
		vertices_numbers.setXYZ(i, d.x,d.y,d.z);
	}
}

function bent_down_quad_corner(a,b,c,theta,d_hinge_origin_length, d_hinge_length) {
	var crossbar_unit = b.clone();
	crossbar_unit.sub(a);			
	crossbar_unit.normalize();
	
	var d_hinge_origin = new THREE.Vector3(
		crossbar_unit.x * d_hinge_origin_length,
		crossbar_unit.y * d_hinge_origin_length,
		crossbar_unit.z * d_hinge_origin_length);

	c.sub(a);
	var c_hinge_origin_length = c.length() * get_cos(crossbar_unit, c);		
	var c_hinge_origin = new THREE.Vector3(
		crossbar_unit.x * c_hinge_origin_length,
		crossbar_unit.y * c_hinge_origin_length,
		crossbar_unit.z * c_hinge_origin_length);
		
	var c_hinge_unit = new THREE.Vector3();
	c_hinge_unit.subVectors( c, c_hinge_origin);
	c_hinge_unit.normalize();
	var forward_component = c_hinge_unit.clone();
	forward_component.multiplyScalar( Math.cos(theta) * d_hinge_length);
		
	var downward_vector_unit = new THREE.Vector3();		
	downward_vector_unit.crossVectors(crossbar_unit, c);
	downward_vector_unit.normalize();
	var downward_component = downward_vector_unit.clone();
	downward_component.multiplyScalar(Math.sin(theta) * d_hinge_length);
	
	var d = new THREE.Vector3();
	d.addVectors(downward_component, forward_component);
	d.add( d_hinge_origin );
	d.add( a );
	
	return d;
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
//then this goes with prism_triangle_indices
function put_unbased_triangularprism_in_buffer(A,B,mybuffer,peak, startingindex){
	if(startingindex === undefined)
		startingindex = 0;
	
	var A_to_B = new THREE.Vector3(B.x-A.x, B.y-A.y, B.z-A.z);
	A_to_B.normalize();
	peak.applyAxisAngle(A_to_B, -TAU/3);
	for( var i = 0; i < 3; i++) {
		mybuffer[ startingindex + (i*2+0) * 3 + 0] = A.x + peak.x;
		mybuffer[ startingindex + (i*2+0) * 3 + 1] = A.y + peak.y;
		mybuffer[ startingindex + (i*2+0) * 3 + 2] = A.z + peak.z;
		
		mybuffer[ startingindex + (i*2+1) * 3 + 0] = B.x + peak.x;
		mybuffer[ startingindex + (i*2+1) * 3 + 1] = B.y + peak.y;
		mybuffer[ startingindex + (i*2+1) * 3 + 2] = B.z + peak.z;
		
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

//aka ourpoint and ourline_top are lines originating from ourline_bottom and we wish to know which line is clockwise of other
function point_to_the_right_of_line_vecs(ourpoint, line_top, line_bottom) {
	//Say you have two 2D vectors p and q with same origin. p will be "clockwise of" q if z-component of cross product is positive
	if( 	(ourpoint.x-line_bottom.x) * (line_top.y-line_bottom.y)
		  <=(ourpoint.y-line_bottom.y) * (line_top.x-line_bottom.x)
	  ) return 0;
	else
		return 1;
}

function point_in_triangle_vecs(ourpointx,ourpointy,
							cornerA,cornerB,cornerC, 
							clockwise)
{
	return point_in_triangle( ourpointx,ourpointy,
			cornerA.x, cornerA.y,cornerB.x, cornerB.y, cornerC.x,cornerC.y, 
			clockwise);
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

function point_on_triangle_boundaries(ourpointx,ourpointy,
		cornerA,cornerB,cornerC, 
		clockwise)
{
	if( 2 === point_to_the_right_of_line(ourpointx, ourpointy, cornerA.x, cornerA.y, cornerB.x, cornerB.y) ||
		2 === point_to_the_right_of_line(ourpointx, ourpointy, cornerB.x, cornerB.y, cornerC.x, cornerC.y) ||
		2 === point_to_the_right_of_line(ourpointx, ourpointy, cornerC.x, cornerC.y, cornerA.x, cornerA.y))
		return true;
		
	return false;
}

function point_in_inflated_triangle( 
		ourpointx,ourpointy,
		cornerAx, cornerAy,cornerBx, cornerBy, cornerCx,cornerCy, 
		clockwise,
		inflation){
	if(inflation === undefined)
		inflation = 0.00000000000000078;
	//0.00000000000000057 - we get the central pentagon near HPV, but no bands near STMV. But we also fuck up ONE of the three-pents meeting ones
	
	var center = new THREE.Vector2();
	center.x = ( cornerAx + cornerBx + cornerCx ) / 3;
	center.y = ( cornerAy + cornerBy + cornerCy ) / 3;
	
	var IcornerAx = (cornerAx - center.x) * (1+inflation) + center.x;
	var IcornerAy = (cornerAy - center.y) * (1+inflation) + center.y;
	var IcornerBx = (cornerBx - center.x) * (1+inflation) + center.x;
	var IcornerBy = (cornerBy - center.y) * (1+inflation) + center.y;
	var IcornerCx = (cornerCx - center.x) * (1+inflation) + center.x;
	var IcornerCy = (cornerCy - center.y) * (1+inflation) + center.y;
	
	return point_in_triangle(
			ourpointx,ourpointy,
			IcornerAx, IcornerAy,IcornerBx, IcornerBy, IcornerCx,IcornerCy, 
			clockwise);
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
	var result = (b*b + c*c - a*a) / (2*b*c);
	if(result > 1) //the sum of two of the sides are close to being the third side
		result = 1;
	return result;
}

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

function tetrahedron_top(P1,P2,P3, r1,r2,r3) {
	P3.sub(P1);
	P2.sub(P1);
	var cos_P3_P2_angle = P3.dot(P2)/P2.length()/P3.length();
	var sin_P3_P2_angle = Math.sqrt(1-cos_P3_P2_angle*cos_P3_P2_angle);
	
	var P1_t = new THREE.Vector3(0,0,0);
	var P2_t = new THREE.Vector3(P2.length(),0,0);
	var P3_t = new THREE.Vector3(P3.length() * cos_P3_P2_angle, P3.length() * sin_P3_P2_angle,0);
	
	var cp_t = new THREE.Vector3(0,0,0);
	cp_t.x = ( r1*r1 - r2*r2 + P2_t.x * P2_t.x ) / ( 2 * P2_t.x );
	cp_t.y = ( r1*r1 - r3*r3 + P3_t.x * P3_t.x + P3_t.y * P3_t.y ) / ( P3_t.y * 2 ) - ( P3_t.x / P3_t.y ) * cp_t.x;
	if(r1*r1 - cp_t.x*cp_t.x - cp_t.y*cp_t.y < 0) {
		console.log("Impossible tetrahedron");
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