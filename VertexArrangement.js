/*
 * Todo:
 * -check under what circumstances angular defects are ok
 * -translational net, you can't move the top or bottom vertex
 */

function update_movementzone() {
	//we have an array of 20 points, paired in 10 line segments.
	
	//jiminy, you might have to put limitations on relating to the associated vertex as well
	
	//you're going to have to rotate the whole thing to stick on to the edge that is stuck in place.
	
	var max_movementzone = Array(20); //
	
	//we get the V diagram stuff, our basis
	for( var i = 0; i<10; i++) {
		V_index = i + Math.floor(i/2); //want it so that there are no numbers congruent to 2 mod 3 in there, so we're on the outside.
		vertex_index = V_vertex_indices[CORE][vertex_tobechanged][V_index];
		
		max_movementzone[ i * 2 + 0 ] = flatnet_vertices.array[vertex_index * 3 + 0];
		max_movementzone[ i * 2 + 1 ] = flatnet_vertices.array[vertex_index * 3 + 1];
	}
	
	var line_is_fixed = Array(10);
	for(var i = 0; i < 10; i++)
		line_is_fixed[i] = 0;
	
	for( var i = 0; i < 5; i++) {
		var this_side = new THREE.Vector2(	max_movementzone[(i)*4+2 + 0] - max_movementzone[i*4 + 0],
											max_movementzone[(i)*4+2 + 1] - max_movementzone[i*4 + 1]);
		var next_side = new THREE.Vector2(	max_movementzone[(i+1)*4+2 + 0] - max_movementzone[i*4 + 0],
											max_movementzone[(i)*4+2 + 1] - max_movementzone[i*4 + 1]);
										
		var mintheta = ( V_angles[vertex_tobechanged][i] - polyhedron_angle ) / 2;
										
		var line_point1 = new THREE.Vector2( max_movementzone[i*4+2 + 0], max_movementzone[i*4+2 + 1] );		
		var line_point2 = vector_from_bearing(ourside, 1, mintheta);
		
		//intersect it with the polygon. If it doesn't intersect the polygon put the points on the same point
		
		ourside.negate();
		
		var line_point1 = new THREE.Vector2( max_movementzone[i*4 + 0], max_movementzone[i*4 + 1] );		
		var line_point2 = vector_from_bearing(ourside, 1, someothertheta);
	}
	
	//gamefeel idea: if you pull far on the vertex and it's against the wall of the movementzone, the whole net will be pulled slightly in the direction you pull
	//also make it vibrate maybe
	
	//initialize them to the positions of the points on the net surrounding the vertex
	//Hmm, or rather, to the places they would be if the net weren't split up
	
	
	//create line, check which line segments it cuts
	//it should cut at least, and maybe most, two line segments, so the points on the ends that it cuts off can go to make the new corners.
	//check all points to see if they're to the right of the line. If not, move them to one of the new corners
	//no, you can't predict it like that, when you slice off a corner you increase the number of corners in that area by 1. vertices won't be in order.
	
	
	
	//LEEEEEET's just turn off everything except keeping identified edge lengths the same and see what happens
}


function move_vertices(vertex_tobechanged, starting_movement_vector, initial_changed_vertex)
{
	var V_angles_subtraction = Array(0,0,0,0);
	if(initial_changed_vertex === vertex_tobechanged) {
		V_angles_subtraction[0] = corner_angle_from_indices( W_triangle_indices[initial_changed_vertex][ 5 ], W_vertex_indices[initial_changed_vertex][11] );
		V_angles_subtraction[3] = corner_angle_from_indices( W_triangle_indices[initial_changed_vertex][ 3 ], W_vertex_indices[initial_changed_vertex][6] );
		
		Vmode = CORE;
	}
	else {
		V_angles_subtraction[0]= corner_angle_from_indices( W_triangle_indices[initial_changed_vertex][ 2 ], W_vertex_indices[initial_changed_vertex][5] );
		V_angles_subtraction[3] = corner_angle_from_indices( W_triangle_indices[initial_changed_vertex][ 0 ], W_vertex_indices[initial_changed_vertex][0] );
		
		Vmode = ASSOCIATED;
	}
	
	for( var i = 0; i < 4; i++ ) {
		var W_index = 0;
		
		if(initial_changed_vertex === vertex_tobechanged)
			W_index = (i+5)%6;
		else
			W_index = i+2;
		
		V_angles[vertex_tobechanged][i] = TAU * 5/6 - W_surrounding_angles[W_index] - V_angles_subtraction[i];
	}
	
	flatnet_vertices.array[vertex_tobechanged * 3 + 0 ] += starting_movement_vector.x;
	flatnet_vertices.array[vertex_tobechanged * 3 + 1 ] += starting_movement_vector.y;
	
	var triangle_done = [0,0,0,0,0];
	
	//tick off the triangle(s) we've started with
	for( var i = 0; i < 5; i++ ) {
		var triangle_tobechecked = V_triangle_indices[Vmode][initial_changed_vertex][i];
		for( var j = 0; j < 3; j++ ) {
			if( net_triangle_vertex_indices[ triangle_tobechecked * 3 + j ] === vertex_tobechanged ) {
				triangle_done[i] = 1;
			}
		}
	}
	if( triangle_done[0] + triangle_done[1] + triangle_done[2] + triangle_done[3] + triangle_done[4] === 0 )
		console.log( "error: attempted to adjust triangles without any basis" );
	
	//we're going to go around until it's done
	while( triangle_done[0] + triangle_done[1] + triangle_done[2] + triangle_done[3] + triangle_done[4] !== 5) {
		var triangle_to_use;
		var triangle_to_fix; //note that these are entries in the "V vertices" array. The ACTUAL indices will come later.
		for( var i = 0; i < 4; i++) {
			if( triangle_done[i] && !triangle_done[i+1] ) {
				triangle_to_use = i;
				triangle_to_fix = i+1;
				break;
			}
			else if( triangle_done[i] === 0 && triangle_done[i+1] === 1) {
				triangle_to_use = i+1;
				triangle_to_fix = i;
				break;
			}
		}
		
		var vertex_to_use_index = V_vertex_indices[Vmode][initial_changed_vertex][triangle_to_use * 3 + 2];
		var vertex_to_fix_index = V_vertex_indices[Vmode][initial_changed_vertex][triangle_to_fix * 3 + 2];
		
		var outside_vertex_to_use_index;
		var outside_vertex_to_fix_index;
		var outside_vertex_opposing_index;
		
		if( triangle_to_fix > triangle_to_use ) {
			outside_vertex_to_use_index = V_vertex_indices[Vmode][initial_changed_vertex][triangle_to_use * 3 + 1];
			outside_vertex_to_fix_index = V_vertex_indices[Vmode][initial_changed_vertex][triangle_to_fix * 3 + 0]; //because we ascend clockwise (apart from the center), they're just next to each other
			outside_vertex_opposing_index = V_vertex_indices[Vmode][initial_changed_vertex][triangle_to_fix * 3 + 1];
		}
		else {
			outside_vertex_to_use_index = V_vertex_indices[Vmode][initial_changed_vertex][triangle_to_use * 3 + 0];
			outside_vertex_to_fix_index = V_vertex_indices[Vmode][initial_changed_vertex][triangle_to_fix * 3 + 1]; //because we ascend anticlockwise
			outside_vertex_opposing_index = V_vertex_indices[Vmode][initial_changed_vertex][triangle_to_fix * 3 + 0];			
		}
		
		var vertex_to_use = new THREE.Vector2(
			flatnet_vertices.array[vertex_to_use_index * 3 + 0 ],
			flatnet_vertices.array[vertex_to_use_index * 3 + 1 ] );
		var vertex_to_fix = new THREE.Vector2(
			flatnet_vertices.array[vertex_to_fix_index * 3 + 0 ],
			flatnet_vertices.array[vertex_to_fix_index * 3 + 1 ] );		
		
		var outside_vertex_to_use = new THREE.Vector2(
			flatnet_vertices.array[outside_vertex_to_use_index * 3 + 0 ],
			flatnet_vertices.array[outside_vertex_to_use_index * 3 + 1 ]);
		var outside_vertex_to_fix = new THREE.Vector2(
			flatnet_vertices.array[outside_vertex_to_fix_index * 3 + 0 ],
			flatnet_vertices.array[outside_vertex_to_fix_index * 3 + 1 ]);
		var outside_vertex_opposing = new THREE.Vector2(
			flatnet_vertices.array[outside_vertex_opposing_index * 3 + 0 ],
			flatnet_vertices.array[outside_vertex_opposing_index * 3 + 1 ]);
			
		var identified_edge_to_use = new THREE.Vector2();
		
		identified_edge_to_use.subVectors(outside_vertex_to_use, vertex_to_use);
		
		var angle_to_use = corner_angle_from_indices( V_triangle_indices[Vmode][initial_changed_vertex][ triangle_to_use ], outside_vertex_to_use_index );
		var imposed_angle;
		if( triangle_to_fix > triangle_to_use )
			imposed_angle = angle_to_use - V_angles[vertex_tobechanged][ triangle_to_use ];
		else
			imposed_angle = V_angles[vertex_tobechanged][triangle_to_use-1] - angle_to_use;
		
		var triangle_tofix_side = new THREE.Vector2(); //it'll be pointing toward outside_vertex_to_fix
		triangle_tofix_side.subVectors(outside_vertex_to_fix, outside_vertex_opposing );
		
		var final_edge = vector_from_bearing(triangle_tofix_side, identified_edge_to_use.length(), imposed_angle );
		final_edge.add(outside_vertex_to_fix);		
		
		flatnet_vertices.array[vertex_to_fix_index * 3 + 0 ] = final_edge.x;
		flatnet_vertices.array[vertex_to_fix_index * 3 + 1 ] = final_edge.y;
		
		triangle_done[triangle_to_fix] = 1;
		for( var i = 0; i < 5; i++ ) {
			triangle_mayhavebeendone = V_triangle_indices[Vmode][initial_changed_vertex][i];			
			for( var j = 0; j < 3; j++ ) {
				if( net_triangle_vertex_indices[ triangle_mayhavebeendone * 3 + j ] === vertex_to_fix_index ) {
					triangle_done[i] = 1;
				}
			}
		}
	}
	
	flatnet_vertices.needsUpdate = true;
}

function corner_angle_from_indices(triangle_index, corner_vertex_index) {
	var cornerAindex = 666, cornerBindex = 666;
	for( var i = 0; i < 3; i++) {
		if( corner_vertex_index === net_triangle_vertex_indices[ triangle_index * 3 + i ]) {
			cornerAindex = net_triangle_vertex_indices[ triangle_index * 3 + (i+1)%3 ];
			cornerBindex = net_triangle_vertex_indices[ triangle_index * 3 + (i+2)%3 ];			
			break;
		}
		
		if( i === 2 ) {
			console.log("error: request was made for a triangle-angle at a corner that the triangle does not have");
			return 0;
		}
	}
	
	sideA = new THREE.Vector2(
		flatnet_vertices.array[ 0 + 3 * cornerAindex ] - flatnet_vertices.array[ 0 + 3 * corner_vertex_index ],
		flatnet_vertices.array[ 1 + 3 * cornerAindex ] - flatnet_vertices.array[ 1 + 3 * corner_vertex_index ] );
	sideB = new THREE.Vector2(
		flatnet_vertices.array[ 0 + 3 * cornerBindex ] - flatnet_vertices.array[ 0 + 3 * corner_vertex_index ],
		flatnet_vertices.array[ 1 + 3 * cornerBindex ] - flatnet_vertices.array[ 1 + 3 * corner_vertex_index ] );
		
	return Math.acos(get_cos( sideA, sideB) );
}

function HandleVertexRearrangement() {
	var movement_vector = new THREE.Vector2(0,0);
	if( isMouseDown ) {
		if( vertex_tobechanged === 666 && capsidopenness === 1) {
			var lowest_quadrance_so_far = 10;
			var closest_vertex_so_far = 666;
			for( var i = 0; i < 22; i++) {
				if(i==0||i==5||i==9||i==13||i==17||i==21)
					continue;
				var quadrance = (flatnet_vertices.array[i*3+0] - (MousePosition.x-flatnet.position.x)) * (flatnet_vertices.array[i*3+0] - (MousePosition.x-flatnet.position.x))
								+ (flatnet_vertices.array[i*3+1] - MousePosition.y) * (flatnet_vertices.array[i*3+1] - MousePosition.y);
				if( quadrance < lowest_quadrance_so_far) {
					lowest_quadrance_so_far = quadrance;
					closest_vertex_so_far = i;
				}
			}
			
			var maximum_quadrance_to_be_selected = 0.005;
			if( lowest_quadrance_so_far < maximum_quadrance_to_be_selected) {
				vertex_tobechanged = closest_vertex_so_far;
			}
		}
		
		if( vertex_tobechanged !== 666) {
			movement_vector.x = (MousePosition.x-flatnet.position.x) - flatnet_vertices.array[vertex_tobechanged * 3 + 0];
			movement_vector.y = MousePosition.y - flatnet_vertices.array[vertex_tobechanged * 3 + 1];
		}
	}
	else {
		vertex_tobechanged = 666;
	}
	
	if( vertex_tobechanged === 666 || (movement_vector.x === 0 && movement_vector.y === 0) )
		return;
	
	//log the current positions
	var net_log = new Array(66);
	for( var i = 0; i < 66; i++)
		net_log[i] = flatnet_vertices.array[i];
	
	//preparation: get the angles surrounding the corners of the stitched-up W, which will remain constant
	for( var corner = 0; corner < 6; corner++ ) {
		W_surrounding_angles[corner] = 0;
		
		var corner_vertex_index = W_vertex_indices[vertex_tobechanged][ 2 + corner * 2 ];
		
		for( var triangle = 0; triangle < 20; triangle++ ) {
			var in_W_diagram = false;
			var in_V_diagram = false; //the CORE'S V diagram
			var subtracting_vertex_index = 0;
			
			for(var k = 0; k < 8; k++ ) {
				if(triangle === W_triangle_indices[vertex_tobechanged][k])
					in_W_diagram = true;
			}		
			
			for( var j = 0; j < 5; j++ ){
				if( triangle === V_triangle_indices[CORE][corner_vertex_index][j] ) {
					in_V_diagram = true;
					subtracting_vertex_index = V_vertex_indices[CORE][corner_vertex_index][j*3+2];
				}
			}
			
			if( in_V_diagram && !in_W_diagram ) {
				W_surrounding_angles[corner] += corner_angle_from_indices(triangle, subtracting_vertex_index);
			}
		}
	}
	
	var ultimate_vector = new THREE.Vector2(0,0);
	var penultimate_vector;
	var prev_vector;
	var finalside_absolute;
	var origin_absolute;
	var ultimate_vector_absolute;
	
	for( var i = 0; i < 6; i++) {
		var corner1index = W_vertex_indices[vertex_tobechanged][ i * 2 + 0 ];
		var corner2index = W_vertex_indices[vertex_tobechanged][ i * 2 + 1 ];
		
		var corner1 = new THREE.Vector2( 
			flatnet_vertices.array[     3 * corner1index ],
			flatnet_vertices.array[ 1 + 3 * corner1index ] );
		var corner2 = new THREE.Vector2( 
			flatnet_vertices.array[     3 * corner2index ],
			flatnet_vertices.array[ 1 + 3 * corner2index ] );
			
		var side_Vector = corner2.clone();
		side_Vector.sub(corner1);
		var side_AdditionToUltimate;
		
		if(i===0)
			side_AdditionToUltimate = side_Vector.clone();
		else
			side_AdditionToUltimate = vector_from_bearing(prev_vector, side_Vector.length(), TAU*5/6 - W_surrounding_angles[i-1]);
		
		ultimate_vector.add(side_AdditionToUltimate);
		
		prev_vector = side_AdditionToUltimate.clone();
		
		if( i === 0 ) origin_absolute = corner1.clone();
		if( i === 4 ) penultimate_vector = ultimate_vector.clone();
		if( i === 5 ) finalside_absolute = side_Vector.clone(); //absolute in the sense of it being a side
		if( i === 5 ) ultimate_vector_absolute = corner2.clone();
	}
	//console.log(ultimate_vector); //the first arm is fine, at least
	
	move_vertices(vertex_tobechanged, movement_vector, vertex_tobechanged);
	
	var vertex_tobechanged_home_index = 666; //which is in the first triangle
	for(var i = 0; i < 22; i++) {
		if( vertex_identifications[vertex_tobechanged][i] ) {
			for( var j = 0; j < 3; j++ ) {
				ourtriangleindex = W_triangle_indices[vertex_tobechanged][0];
				if( net_triangle_vertex_indices[ ourtriangleindex * 3 + j ] === i) {
					vertex_tobechanged_home_index = i;
				}
			}
		}			
	}
	
	var left_defect = new THREE.Vector2(
		flatnet_vertices.array[ 3 * vertex_tobechanged_home_index + 0 ],
		flatnet_vertices.array[ 3 * vertex_tobechanged_home_index + 1 ] );
	left_defect.sub(origin_absolute);
	
	var nonexistant_corner = new THREE.Vector2(
		left_defect.x * 0.5 - HS3 * left_defect.y,
		left_defect.y * 0.5 + HS3 * left_defect.x);
	var right_defect = new THREE.Vector2(
		0.5 * (ultimate_vector.x - nonexistant_corner.x) + HS3 * (ultimate_vector.y - nonexistant_corner.y),
		0.5 * (ultimate_vector.y - nonexistant_corner.y) - HS3 * (ultimate_vector.x - nonexistant_corner.x));
	right_defect.add(nonexistant_corner);
	
	right_defect.sub(ultimate_vector);
	penultimate_vector.sub(ultimate_vector);
	
	var right_defect_anglefromside = get_angle(right_defect, penultimate_vector );
	
	var right_defect_absolute = vector_from_bearing(finalside_absolute, right_defect.length(), right_defect_anglefromside);
	right_defect_absolute.add(ultimate_vector_absolute);
	
	var right_defect_index = W_vertex_indices[vertex_tobechanged][ RIGHT_DEFECT ];
	
	var imposed_movement_vector = new THREE.Vector2(
		right_defect_absolute.x - flatnet_vertices.array[right_defect_index * 3 + 0 ],
		right_defect_absolute.y - flatnet_vertices.array[right_defect_index * 3 + 1 ]);
		
	move_vertices(right_defect_index, imposed_movement_vector, vertex_tobechanged);
	
	
	
	for(var i = 0; i< radii.length; i++)
		radii[i] = 100;
	for(var i = 0; i< net_triangle_vertex_indices.length / 3; i++) {
		for(var j = 0; j < 3; j++){
			var a_index = polyhedron_index(net_triangle_vertex_indices[i*3 + j]);
			var b_index = polyhedron_index(net_triangle_vertex_indices[i*3 + (j+1)%3]);
			
			polyhedron_edge_length[a_index][b_index] = Math.sqrt( Math.pow(flatnet_vertices.array[3*net_triangle_vertex_indices[i*3 + j]]-flatnet_vertices.array[3*net_triangle_vertex_indices[i*3 + (j+1)%3]],2)
																+ Math.pow(flatnet_vertices.array[3*net_triangle_vertex_indices[i*3 + j]+1]-flatnet_vertices.array[3*net_triangle_vertex_indices[i*3 + (j+1)%3]+1],2) );
			polyhedron_edge_length[b_index][a_index] = polyhedron_edge_length[a_index][b_index]; 
		}
	}
	
	if(!correct_minimum_angles()){ //we'd rather not have this dependence, you should be able to predict what won't work and put correct_minimum_angles in coreloop.
		for( var i = 0; i < 66; i++)
			flatnet_vertices.array[i] = net_log[i];
		correct_minimum_angles();
	}
	
	//TODO remove this on release
	for(var i = 0; i < 20; i++){
		var angular_defect = TAU;
		for(var j = 0; j < 5; j++){
			angular_defect -= corner_angle_from_indices(V_triangle_indices[0][i][j], V_vertex_indices[0][i][3*j+2]);
		}
		if(Math.abs(angular_defect-TAU/6) > 0.01 ){
			console.log("angular defect at vertex " + i + " off by:" )
			console.log(angular_defect-TAU/6);
		}
		
		for(var j = 0; j < 5; j++){
			var central_vertex1_index = V_vertex_indices[0][i][3*j+2];
			var central_vertex2_index = V_vertex_indices[0][i][(3*(j+1))%15+2];
			var outer_vertex1_index = V_vertex_indices[0][i][3*j+1];
			var outer_vertex2_index = V_vertex_indices[0][i][(3*(j+1))%15+0];
			var central_vertex1 = new THREE.Vector3(flatnet_vertices.array[central_vertex1_index*3+0],flatnet_vertices.array[central_vertex1_index*3+1],flatnet_vertices.array[central_vertex1_index*3+2]);
			var central_vertex2 = new THREE.Vector3(flatnet_vertices.array[central_vertex2_index*3+0],flatnet_vertices.array[central_vertex2_index*3+1],flatnet_vertices.array[central_vertex2_index*3+2]);
			var outer_vertex1 = new THREE.Vector3(flatnet_vertices.array[outer_vertex1_index*3+0],flatnet_vertices.array[outer_vertex1_index*3+1],flatnet_vertices.array[outer_vertex1_index*3+2]);
			var outer_vertex2 = new THREE.Vector3(flatnet_vertices.array[outer_vertex2_index*3+0],flatnet_vertices.array[outer_vertex2_index*3+1],flatnet_vertices.array[outer_vertex2_index*3+2]);
			var length_difference = Math.abs(outer_vertex1.distanceTo(central_vertex1) - outer_vertex2.distanceTo(central_vertex2) );
			if(length_difference > 0.01)
				console.log("edge length discrepency", length_difference);
		}
	}
	
	//now we need the "height" of the capsid
	for(var i = 0; i<9; i++)
		varyingsurface.geometry.attributes.position.array[i] = flatnet_vertices.array[i];	
	deduce_most_of_surface(0, varyingsurface.geometry.attributes.position);
	var central_vertex = new THREE.Vector3(varyingsurface.geometry.attributes.position.array[0],varyingsurface.geometry.attributes.position.array[1],varyingsurface.geometry.attributes.position.array[2]);
	var center_3D = new THREE.Vector3(varyingsurface.geometry.attributes.position.array[13*3+0],varyingsurface.geometry.attributes.position.array[13*3+1],varyingsurface.geometry.attributes.position.array[13*3+2]);
	center_3D.sub(central_vertex);
	center_3D.multiplyScalar(0.5);
	varyingsurface_orientingradius[0] = center_3D.length();
	center_3D.add(central_vertex);
	varyingsurface_orientingradius[1] = center_3D.distanceTo(new THREE.Vector3(varyingsurface.geometry.attributes.position.array[1*3+0],varyingsurface.geometry.attributes.position.array[1*3+1],varyingsurface.geometry.attributes.position.array[1*3+2]) );
	varyingsurface_orientingradius[2] = center_3D.distanceTo(new THREE.Vector3(varyingsurface.geometry.attributes.position.array[2*3+0],varyingsurface.geometry.attributes.position.array[2*3+1],varyingsurface.geometry.attributes.position.array[2*3+2]) );
}