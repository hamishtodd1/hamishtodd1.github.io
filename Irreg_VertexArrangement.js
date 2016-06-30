/*
 * Todo:
 * -check under what precise circumstances angular defects are ok
 * -make folding code better so it can do more
 * -label the button
 * -make things fade in in a certain order that suggests its operation
 * -transition to clicked virus is smooth even if capsid is closed
 * 
 * if the player has clicked on the button 8 times,  the capsid appears?
 * 
 * Slideyness:
 * -could watch Casey's stuff
 * -big problem is that you have to take account of the associated vertices too.
 * -it's something like "find the closest point to your mouse position in a polygon" - that's a solved problem
 * -It's a polygon bounded (at least) by a few edges you know. But then also this crazy curve you don't. It may not be that crazy
 * -you can proooobably work it out mathematically. List the angular constraints and the formulae
 */

function move_vertices(vertex_tobechanged, starting_movement_vector, initial_changed_vertex)
{
	var V_angles_subtraction = Array(0,0,0,0);
	if(initial_changed_vertex === vertex_tobechanged) {
		V_angles_subtraction[0] = corner_angle_from_indices( W_triangle_indices[initial_changed_vertex][ 5 ], W_vertex_indices[initial_changed_vertex][11],manipulation_surface.geometry.attributes.position.array );
		V_angles_subtraction[3] = corner_angle_from_indices( W_triangle_indices[initial_changed_vertex][ 3 ], W_vertex_indices[initial_changed_vertex][6], manipulation_surface.geometry.attributes.position.array );
		
		Vmode = CORE;
	}
	else {
		V_angles_subtraction[0]= corner_angle_from_indices( W_triangle_indices[initial_changed_vertex][ 2 ], W_vertex_indices[initial_changed_vertex][5], manipulation_surface.geometry.attributes.position.array );
		V_angles_subtraction[3] = corner_angle_from_indices( W_triangle_indices[initial_changed_vertex][ 0 ], W_vertex_indices[initial_changed_vertex][0],manipulation_surface.geometry.attributes.position.array );
		
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
	
	manipulation_surface.geometry.attributes.position.array[vertex_tobechanged * 3 + 0 ] += starting_movement_vector.x;
	manipulation_surface.geometry.attributes.position.array[vertex_tobechanged * 3 + 1 ] += starting_movement_vector.y;
	
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
			manipulation_surface.geometry.attributes.position.array[vertex_to_use_index * 3 + 0 ],
			manipulation_surface.geometry.attributes.position.array[vertex_to_use_index * 3 + 1 ] );
		var vertex_to_fix = new THREE.Vector2(
			manipulation_surface.geometry.attributes.position.array[vertex_to_fix_index * 3 + 0 ],
			manipulation_surface.geometry.attributes.position.array[vertex_to_fix_index * 3 + 1 ] );		
		
		var outside_vertex_to_use = new THREE.Vector2(
			manipulation_surface.geometry.attributes.position.array[outside_vertex_to_use_index * 3 + 0 ],
			manipulation_surface.geometry.attributes.position.array[outside_vertex_to_use_index * 3 + 1 ]);
		var outside_vertex_to_fix = new THREE.Vector2(
			manipulation_surface.geometry.attributes.position.array[outside_vertex_to_fix_index * 3 + 0 ],
			manipulation_surface.geometry.attributes.position.array[outside_vertex_to_fix_index * 3 + 1 ]);
		var outside_vertex_opposing = new THREE.Vector2(
			manipulation_surface.geometry.attributes.position.array[outside_vertex_opposing_index * 3 + 0 ],
			manipulation_surface.geometry.attributes.position.array[outside_vertex_opposing_index * 3 + 1 ]);
			
		var identified_edge_to_use = new THREE.Vector2();
		
		identified_edge_to_use.subVectors(outside_vertex_to_use, vertex_to_use);
		
		var angle_to_use = corner_angle_from_indices( V_triangle_indices[Vmode][initial_changed_vertex][ triangle_to_use ], outside_vertex_to_use_index,manipulation_surface.geometry.attributes.position.array );
		var imposed_angle;
		if( triangle_to_fix > triangle_to_use )
			imposed_angle = angle_to_use - V_angles[vertex_tobechanged][ triangle_to_use ];
		else
			imposed_angle = V_angles[vertex_tobechanged][triangle_to_use-1] - angle_to_use;
		
		var triangle_tofix_side = new THREE.Vector2(); //it'll be pointing toward outside_vertex_to_fix
		triangle_tofix_side.subVectors(outside_vertex_to_fix, outside_vertex_opposing );
		
		var final_edge = vector_from_bearing(triangle_tofix_side, identified_edge_to_use.length(), imposed_angle );
		final_edge.add(outside_vertex_to_fix);		
		
		manipulation_surface.geometry.attributes.position.array[vertex_to_fix_index * 3 + 0 ] = final_edge.x;
		manipulation_surface.geometry.attributes.position.array[vertex_to_fix_index * 3 + 1 ] = final_edge.y;
		
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
	
	manipulation_surface.geometry.attributes.position.needsUpdate = true;
}

function settle_manipulationsurface_and_flatnet() {
	for( var i = 0; i < flatnet_vertices.array.length; i++)
		manipulation_surface.geometry.attributes.position.array[i] = flatnet_vertices.array[i];
}

function manipulate_vertices() {
	check_triangle_inversion(flatnet_vertices.array, "real");
	
	var movement_vector = new THREE.Vector2(0,0);
	if( isMouseDown ) {
		if( vertex_tobechanged === 666 && capsidopenness === 1) {
			var lowest_quadrance_so_far = 10;
			var closest_vertex_so_far = 666;
			for( var i = 0; i < 22; i++) {
				if(i==0||i==5||i==9||i==13||i==17||i==21)
					continue;
				var quadrance = (manipulation_surface.geometry.attributes.position.array[i*3+0] - (MousePosition.x-flatnet.position.x)) * (manipulation_surface.geometry.attributes.position.array[i*3+0] - (MousePosition.x-flatnet.position.x))
								+ (manipulation_surface.geometry.attributes.position.array[i*3+1] - MousePosition.y) * (manipulation_surface.geometry.attributes.position.array[i*3+1] - MousePosition.y);
				if( quadrance < lowest_quadrance_so_far) {
					lowest_quadrance_so_far = quadrance;
					closest_vertex_so_far = i;
				}
			}
			
			var maximum_quadrance_to_be_selected = 0.0079;
			if( lowest_quadrance_so_far < maximum_quadrance_to_be_selected) {
				vertex_tobechanged = closest_vertex_so_far;
				
				settle_manipulationsurface_and_flatnet();
			}
		}
		
		if( vertex_tobechanged !== 666) {
			movement_vector.x = (MousePosition.x-flatnet.position.x) - manipulation_surface.geometry.attributes.position.array[vertex_tobechanged * 3 + 0];
			movement_vector.y = MousePosition.y - manipulation_surface.geometry.attributes.position.array[vertex_tobechanged * 3 + 1];
			
			if( !( (i == 0 || i % 4 == 1) && i != 1) ){
				varyingsurface_spheres[vertex_tobechanged].material.color.r = 0;
				varyingsurface_spheres[vertex_tobechanged].material.color.g = 0;
				varyingsurface_spheres[vertex_tobechanged].material.color.b = 1;
			}
		}
	}
	else {
		vertex_tobechanged = 666;
		for(var i = 0; i <varyingsurface_spheres.length; i++){
			if( !( (i == 0 || i % 4 == 1) && i != 1) ){
				varyingsurface_spheres[i].material.color.r = 0;
				varyingsurface_spheres[i].material.color.g = 1;
				varyingsurface_spheres[i].material.color.b = 0;
			}
		}
		
		//manipulation_surface wants to adjust itself to become the flatnet
		//TODO give them momentum
		for(var i = 0; i < flatnet_vertices.array.length / 3; i++){
			var displacement_vector = new THREE.Vector3(
					flatnet_vertices.array[i*3+0] - manipulation_surface.geometry.attributes.position.array[i*3+0],
					flatnet_vertices.array[i*3+1] - manipulation_surface.geometry.attributes.position.array[i*3+1],
					flatnet_vertices.array[i*3+2] - manipulation_surface.geometry.attributes.position.array[i*3+2]);
			if(displacement_vector.lengthSq() > 0.0001 ) {
				//if you want it to wiggle into place it needs remembered momentum
				displacement_vector.setLength(0.02);
				
				manipulation_surface.geometry.attributes.position.array[i*3+0] += displacement_vector.x;
				manipulation_surface.geometry.attributes.position.array[i*3+1] += displacement_vector.y;
				manipulation_surface.geometry.attributes.position.array[i*3+2] += displacement_vector.z;
				
				manipulation_surface.geometry.attributes.position.needsUpdate = true;
				
				//you also want the minimum_angles to get there at the same rate. adjust the correction function to take an array, and pass it a "to be gotten to" one
				
				//Why only manipulation surface? Why not have the other surface slowly move to it too? Would allow a closed capsid to morph
			}
		}
	}
	
	if( vertex_tobechanged === 666 || (movement_vector.x === 0 && movement_vector.y === 0) ){
		//TODO attempt to correct flatnet.
		//Need to remember an index and a desired_location from the correct_minimum_angles at the end of the last frame where things were unsuccessfully moved
		return;
	}
	
	theyknowyoucanchangevertices = 1;
	
	//log the current positions
	var net_log = new Array(66);
	for( var i = 0; i < 66; i++)
		net_log[i] = manipulation_surface.geometry.attributes.position.array[i];
	
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
				W_surrounding_angles[corner] += corner_angle_from_indices(triangle, subtracting_vertex_index, manipulation_surface.geometry.attributes.position.array);
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
			manipulation_surface.geometry.attributes.position.array[     3 * corner1index ],
			manipulation_surface.geometry.attributes.position.array[ 1 + 3 * corner1index ] );
		var corner2 = new THREE.Vector2( 
			manipulation_surface.geometry.attributes.position.array[     3 * corner2index ],
			manipulation_surface.geometry.attributes.position.array[ 1 + 3 * corner2index ] );
			
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
		manipulation_surface.geometry.attributes.position.array[ 3 * vertex_tobechanged_home_index + 0 ],
		manipulation_surface.geometry.attributes.position.array[ 3 * vertex_tobechanged_home_index + 1 ] );
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
		right_defect_absolute.x - manipulation_surface.geometry.attributes.position.array[right_defect_index * 3 + 0 ],
		right_defect_absolute.y - manipulation_surface.geometry.attributes.position.array[right_defect_index * 3 + 1 ]);
		
	move_vertices(right_defect_index, imposed_movement_vector, vertex_tobechanged);
	
	
	/* 	i.e. every frame a function is called that deals with the problem of "vertex desired location" and the fact that manipulation_surface.geometry.attributes.position isn't there
	 * 	varyingsurface has the folded up nature to it as well
	 * 	when we've tweaked the algorithm, 5 evaluations should be ok?
	 */
	
	
	if( !check_triangle_inversion(manipulation_surface.geometry.attributes.position.array, "manip")
			//extra checks only worth using if you suspect the above has not done its job
//			|| !check_edge_lengths(flatnet_vertices.array) || !check_defects(manipulation_surface.geometry.attributes.position.array) 
			) 
	{
		for( var i = 0; i < 66; i++)
			manipulation_surface.geometry.attributes.position.array[i] = net_log[i];
	}
	else { //Maybe you should be able to predict what won't work and put correct_minimum_angles, and resetter, in coreloop.
		if( correct_minimum_angles(manipulation_surface.geometry.attributes.position.array ) )
		{
			for( var i = 0; i < 66; i++)
				flatnet_vertices.array[i] = manipulation_surface.geometry.attributes.position.array[i];
			
			Disable_pictures();
				
			//now we need the "height" of the capsid
			for(var i = 0; i<9; i++)
				varyingsurface.geometry.attributes.position.array[i] = manipulation_surface.geometry.attributes.position.array[i];	
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
		else{
			varyingsurface_spheres[vertex_tobechanged].material.color.r = 1;
			varyingsurface_spheres[vertex_tobechanged].material.color.g = 0;
			varyingsurface_spheres[vertex_tobechanged].material.color.b = 0;
		}
	}
}