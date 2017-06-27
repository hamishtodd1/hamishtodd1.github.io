var playingWithInversions = false;

function move_vertices(vertex_tobemoved, changed_position, initial_changed_vertex)
{
	var V_angles_subtraction = Array(0,0,0,0);
	if(initial_changed_vertex === vertex_tobemoved) {
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
		
		if(initial_changed_vertex === vertex_tobemoved)
			W_index = (i+5)%6;
		else
			W_index = i+2;
		
		V_angles[vertex_tobemoved][i] = TAU * 5/6 - W_surrounding_angles[W_index] - V_angles_subtraction[i];
	}
	
	manipulation_surface.geometry.attributes.position.array[vertex_tobemoved * 3 + 0 ] = changed_position.x;
	manipulation_surface.geometry.attributes.position.array[vertex_tobemoved * 3 + 1 ] = changed_position.y;
	
	var triangle_done = [0,0,0,0,0];
	
	//tick off the triangle(s) we've started with
	for( var i = 0; i < 5; i++ ) {
		var triangle_tobechecked = V_triangle_indices[Vmode][initial_changed_vertex][i];
		for( var j = 0; j < 3; j++ ) {
			if( net_triangle_vertex_indices[ triangle_tobechecked * 3 + j ] === vertex_tobemoved ) {
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
			imposed_angle = angle_to_use - V_angles[vertex_tobemoved][ triangle_to_use ];
		else
			imposed_angle = V_angles[vertex_tobemoved][triangle_to_use-1] - angle_to_use;
		
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
	manipulation_surface.geometry.attributes.position.needsUpdate = true;
}

function manipulate_vertices()
{
	notConverging = false;
	var changed_position = new THREE.Vector2(999,999);
	if( isMouseDown ) {
		if( vertex_tobechanged === 999 && capsidopenness === 1) {
			var lowest_quadrance_so_far = 10;
			var closest_vertex_so_far = 999;
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
			
			var maximum_quadrance_to_be_selected = 0.025;
			if( lowest_quadrance_so_far < maximum_quadrance_to_be_selected) {
				vertex_tobechanged = closest_vertex_so_far;

				if(!Sounds.vertexGrabbed.isPlaying)
					Sounds.vertexGrabbed.play();
				
				settle_manipulationsurface_and_flatnet();
			}
		}
		
		if( vertex_tobechanged !== 999) {
			changed_position.x = (MousePosition.x-flatnet.position.x); //yeesh, why is x changing but not y?
			changed_position.y = MousePosition.y;
			
			if( !( (i == 0 || i % 4 == 1) && i != 1) ){
				varyingsurface_spheres[vertex_tobechanged].children[0].material.color.setHex(0x7997B3);
				
				//if it's blue then it's normal size
				varyingsurface_spheres[vertex_tobechanged].scale.set(0.05,0.05,0.05);
			}
		}
	}
	else {
		if(vertex_tobechanged !== 999) //it was something previously
		{
			if(!Sounds.vertexReleased.isPlaying)
				Sounds.vertexReleased.play();
			varyingsurface_spheres[vertex_tobechanged].scale.set(0.05,0.05,0.05);
		}
			
		vertex_tobechanged = 999;
		for(var i = 0; i < varyingsurface_spheres.length; i++){
			if( !( (i == 0 || i % 4 == 1) && i != 1) ){
				varyingsurface_spheres[i].children[0].material.color.setHex(0xA94D5A);
			}
		}
		
		//manipulation_surface wants to adjust itself to become the flatnet
		//TODO give them momentum
		if( capsidopenness === 1 )
		{
			var max_corner_mvmt = 0.01 * delta_t / 0.016;
			for(var i = 0; i < flatnet_vertices.array.length / 3; i++){
				var displacement_vector = new THREE.Vector3(
						flatnet_vertices.array[i*3+0] - manipulation_surface.geometry.attributes.position.array[i*3+0],
						flatnet_vertices.array[i*3+1] - manipulation_surface.geometry.attributes.position.array[i*3+1],
						flatnet_vertices.array[i*3+2] - manipulation_surface.geometry.attributes.position.array[i*3+2]);
				if(displacement_vector.lengthSq() > 0.0001 ) {
					//if you want it to wiggle into place it needs remembered momentum
					if( displacement_vector.length() > max_corner_mvmt)
						displacement_vector.setLength(max_corner_mvmt);
					
					manipulation_surface.geometry.attributes.position.array[i*3+0] += displacement_vector.x;
					manipulation_surface.geometry.attributes.position.array[i*3+1] += displacement_vector.y;
					manipulation_surface.geometry.attributes.position.array[i*3+2] += displacement_vector.z;
					
					if( !Sounds.shapeSettles.isPlaying && ytplayer.getPlayerState() === 2 )
						Sounds.shapeSettles.play();
					
					manipulation_surface.geometry.attributes.position.needsUpdate = true;
					
					//you also want the minimum_angles to get there at the same rate. adjust the correction function to take an array, and pass it a "to be gotten to" one
				}
			}
		}
		else
			settle_manipulationsurface_and_flatnet();
	}
	
	if( vertex_tobechanged === 999 || (changed_position.x === 999 && changed_position.y === 999) ){
		//TODO attempt to correct flatnet.
		//Need to remember an index and a desired_location from the correct_minimum_angles at the end of the last frame where things were unsuccessfully moved
		return;
	}
	
	if( !MousePosition.equals(OldMousePosition) && !theyknowyoucanchangevertices ) //might be that they sort of swooped in, but eh
	{
		theyknowyoucanchangevertices = 1;
		for(var i = 0; i < varyingsurface_spheres.length; i++)
			varyingsurface_spheres[i].scale.set(0.05,0.05,0.05);
	}
	
	//log the current positions
	var net_log = new Array(66);
	for( var i = 0; i < 66; i++)
		net_log[i] = manipulation_surface.geometry.attributes.position.array[i];
	
	//-----DETERMINATION STARTS
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
	
	move_vertices(vertex_tobechanged, changed_position, vertex_tobechanged);
	
	//Maybe curve limit should be first? It may project you onto a point outside quadrilateral. That would be bad
	{
		//go around the three, check triangle inversion, if inverted, check t,
		var t_array = [];
		
		/*
		 * You might not need to do the same for the associated vertex, because it will snap back anyway! but if you do need to:
		 * 	The same thing for the associated vertex
		 * 	And correct this one back if associated vertex was moved (hopefully by just turning the code the other way around)
		 * 	And check the original's triangles. If they can be inverted, an infinite loop is possible, and god help you.
		 * Then do the curve thing, which is deffo possible just from looking at the first one. Resist the urge to check for triangle inversion, it tells you nothing without the associated mvmt
		 */
		
		var vertex_failed_to_move_when_it_should_have = false;
		var squashingtriangles_indices = Array(3);
		squashingtriangles_indices[0] = Array(3);
		squashingtriangles_indices[1] = Array(3);
		squashingtriangles_indices[2] = Array(3);
		
		var someTriangleInverted = false;
		
		for( var i = 0; i < 3; i++ ) //triangles we want
		{
			var triangle = V_triangle_indices[CORE][vertex_tobechanged][i+1];
			
			if( check_single_triangle_inversion(triangle, manipulation_surface.geometry.attributes.position.array ) )
			{
				someTriangleInverted = true;
				
				vertex_failed_to_move_when_it_should_have = true;
				
				squashingtriangles_indices[i][0] = 999; //the changer
				squashingtriangles_indices[i][1] = 999; //"A"
				squashingtriangles_indices[i][2] = 999; //"B"
				
				for( var j = 0; j < 3; j++)
				{
					if( vertex_identifications[vertex_tobechanged][net_triangle_vertex_indices[triangle*3+j]] )
					{
						squashingtriangles_indices[i][0] = net_triangle_vertex_indices[triangle * 3 + j];
						squashingtriangles_indices[i][1] = net_triangle_vertex_indices[triangle * 3 + (j+1)%3];
						squashingtriangles_indices[i][2] = net_triangle_vertex_indices[triangle * 3 + (j+2)%3]; //may need to switch these
						
						t_array[i] = t_along_line_of_closest_point(
								manipulation_surface.geometry.attributes.position.array[squashingtriangles_indices[i][0] * 3 + 0],
								manipulation_surface.geometry.attributes.position.array[squashingtriangles_indices[i][0] * 3 + 1],
								manipulation_surface.geometry.attributes.position.array[squashingtriangles_indices[i][1] * 3 + 0],
								manipulation_surface.geometry.attributes.position.array[squashingtriangles_indices[i][1] * 3 + 1],
								manipulation_surface.geometry.attributes.position.array[squashingtriangles_indices[i][2] * 3 + 0],
								manipulation_surface.geometry.attributes.position.array[squashingtriangles_indices[i][2] * 3 + 1] );
						
						//how to deal with less than 90 degree corners?
						
						if( (0 <= t_array[i] && t_array[i] <= 1) || 
								(t_array[i] < 0 && i === 2) || (t_array[i] > 1 && i === 0) //extremities where it's sort of combined with the curve 
								)
						{
							var squashed_back_position = new THREE.Vector2(
									(manipulation_surface.geometry.attributes.position.array[squashingtriangles_indices[i][2] * 3 + 0] - 
									manipulation_surface.geometry.attributes.position.array[squashingtriangles_indices[i][1] * 3 + 0] ) * t_array[i] +
									manipulation_surface.geometry.attributes.position.array[squashingtriangles_indices[i][1] * 3 + 0],
									(manipulation_surface.geometry.attributes.position.array[squashingtriangles_indices[i][2] * 3 + 1] - 
									manipulation_surface.geometry.attributes.position.array[squashingtriangles_indices[i][1] * 3 + 1] ) * t_array[i] +
									manipulation_surface.geometry.attributes.position.array[squashingtriangles_indices[i][1] * 3 + 1] ); //CHECK THAT IT STILL WORKS WITHOUT THIS YOU CHANGED FROM RELATIVE MVMT TO ABSOLUTE
							
							move_vertices(squashingtriangles_indices[i][0], squashed_back_position, squashingtriangles_indices[i][0]);
							
							noInvertedTriangles = false;
							
							
							vertex_failed_to_move_when_it_should_have = false;
						}
						
						break; //we got the right corner
					}
				}
				
				if(!vertex_failed_to_move_when_it_should_have)
					break;
			}
		}
		
		
		
		if( vertex_failed_to_move_when_it_should_have && (
			squashingtriangles_indices[0][0] !== 'undefined' || 
			squashingtriangles_indices[1][0] !== 'undefined' || 
			squashingtriangles_indices[2][0] !== 'undefined' ) ) //triangle inversions that can only be resolved with some corner situation
		{
			//multiple t values to latch onto? It looks like two of them were happenning!
			for( var i = 0; i < t_array.length; i++)
			{
				//the situation is that a or whatever is greater than 1 or less than 0 or whatever but it DOES need to be projected, the other triangle isn't inverted
				if( i > 0 && t_array[i - 1] < 0 && t_array[i] > 1)
				{
					var corner_position = new THREE.Vector2(
							manipulation_surface.geometry.attributes.position.array[squashingtriangles_indices[i][2] * 3 + 0],
							manipulation_surface.geometry.attributes.position.array[squashingtriangles_indices[i][2] * 3 + 1] );
					
					move_vertices(squashingtriangles_indices[i][0], corner_position, squashingtriangles_indices[i][0]);
				}
				else if( i < 2 && t_array[i] < 0 && typeof t_array[i + 1] === 'undefined' )
				{
					var corner_position = new THREE.Vector2(
							manipulation_surface.geometry.attributes.position.array[squashingtriangles_indices[i][1] * 3 + 0],
							manipulation_surface.geometry.attributes.position.array[squashingtriangles_indices[i][1] * 3 + 1] );
					
					move_vertices(squashingtriangles_indices[i][0], corner_position, squashingtriangles_indices[i][0]);
				}
				else if( i > 0 && t_array[i] > 1 && typeof t_array[i - 1] === 'undefined' )
				{
					var corner_position = new THREE.Vector2(
							manipulation_surface.geometry.attributes.position.array[squashingtriangles_indices[i][2] * 3 + 0],
							manipulation_surface.geometry.attributes.position.array[squashingtriangles_indices[i][2] * 3 + 1] );
					
					move_vertices(squashingtriangles_indices[i][0], corner_position, squashingtriangles_indices[i][0]);
				}
			}
		}
	}
	
	var vertex_tobechanged_home_index = 999; //the version of vertex_tobechanged that is in the first triangle
	for(var i = 0; i < 22; i++) {
		if( vertex_identifications[vertex_tobechanged][i] ) {
			for( var j = 0; j < 3; j++ ) {
				if( net_triangle_vertex_indices[ W_triangle_indices[vertex_tobechanged][0] * 3 + j ] === i) {
					vertex_tobechanged_home_index = i;
				}
			}
		}			
	}
	var left_defect = new THREE.Vector2(
		manipulation_surface.geometry.attributes.position.array[ 3 * vertex_tobechanged_home_index + 0 ],
		manipulation_surface.geometry.attributes.position.array[ 3 * vertex_tobechanged_home_index + 1 ] );
	left_defect.sub(origin_absolute);
	
	var nonexistant_corner = new THREE.Vector2( //the middle point of the w
		left_defect.x * 0.5 - HS3 * left_defect.y,
		left_defect.y * 0.5 + HS3 * left_defect.x);
	
	var right_defect = new THREE.Vector2(
		0.5 * (ultimate_vector.x - nonexistant_corner.x) + HS3 * (ultimate_vector.y - nonexistant_corner.y),
		0.5 * (ultimate_vector.y - nonexistant_corner.y) - HS3 * (ultimate_vector.x - nonexistant_corner.x));
	
	if( point_to_the_right_of_line(nonexistant_corner.x,nonexistant_corner.y,
			0,0, ultimate_vector.x,ultimate_vector.y) ) //remove this rather unnatural check for mathematical interestingness!
	{
		var defect_scalar = Math.sqrt(ultimate_vector.lengthSq() / ( right_defect.lengthSq() + left_defect.lengthSq() + right_defect.length() * left_defect.length()) );
		if( defect_scalar < 1)
		{
			var new_ld_length = defect_scalar * left_defect.length();
			var new_rd_length = defect_scalar * right_defect.length();
			
			//from the lengths you reconstitute nonexistant corner, from which you reconstitute left defect and right
			nonexistant_corner.copy(ultimate_vector);
			nonexistant_corner.setLength( new_ld_length );
			
			nonexistant_corner.copy( rotate_vector2_counterclock( nonexistant_corner, Math.acos( get_cos_rule( new_rd_length, new_ld_length, ultimate_vector.length() ) ) ) );
			//maybe have to negate that acos?
			
			//but FYI: just because the angular defect is conserved doesn't mean that the triangles aren't inverted
			//Leave it, unless it gives you problems
			//That said it would be nice to stop the flicking from "catch by triangle inversion" to "catch by curve"
			
			left_defect.copy(nonexistant_corner);
			left_defect.copy( rotate_vector2_counterclock( left_defect, -TAU / 6 ) );
			
			var squashed_back_position = left_defect.clone();
			squashed_back_position.add(origin_absolute);
			
			move_vertices(vertex_tobechanged_home_index, squashed_back_position, vertex_tobechanged_home_index);
			
			someTriangleInverted = true;
			
			right_defect.set(
					0.5 * (ultimate_vector.x - nonexistant_corner.x) + HS3 * (ultimate_vector.y - nonexistant_corner.y),
					0.5 * (ultimate_vector.y - nonexistant_corner.y) - HS3 * (ultimate_vector.x - nonexistant_corner.x));
		}
	}
	
	if(someTriangleInverted)
	{
		if(!playingWithInversions)
		{
			Sounds.bump.play();
			playingWithInversions = true;
		}	
	}
	else{
		playingWithInversions = false;
		if( !OldMousePosition.equals(MousePosition) && !Sounds.triangleEdgeSound.isPlaying )
			Sounds.triangleEdgeSound.play();
	}
	
	right_defect.add(nonexistant_corner);
	
	right_defect.sub(ultimate_vector);
	penultimate_vector.sub(ultimate_vector);
	
	var right_defect_anglefromside = get_angle(right_defect, penultimate_vector );
	
	var right_defect_absolute = vector_from_bearing(finalside_absolute, right_defect.length(), right_defect_anglefromside);
	right_defect_absolute.add(ultimate_vector_absolute);
	
	var right_defect_index = W_vertex_indices[vertex_tobechanged][ RIGHT_DEFECT ];
	
	move_vertices(right_defect_index, right_defect_absolute, vertex_tobechanged);
	
//	performance_checker.begin_sample();
	if( AO.correct_minimum_angles(manipulation_surface.geometry.attributes.position.array ) )
	{
		for( var i = 0; i < 66; i++)
			flatnet_vertices.array[i] = manipulation_surface.geometry.attributes.position.array[i];
			
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
		notConverging = true;
		varyingsurface_spheres[vertex_tobechanged].children[0].material.color.setRGB(1,0,0);
	}
//	performance_checker.end_sample();
}

function getVaryingSurfaceSphereScale(sphereIndex)
{
	var spherescale = capsidopenness;
	if(!spherescale)
		spherescale = 0.000000001;
	if( !theyknowyoucanchangevertices )
		spherescale *= (0.5+0.5*Math.cos((ourclock.elapsedTime - ourclock.startTime)*8))
	if( sphereIndex === vertex_tobechanged && notConverging )
		spherescale *= (0.5+0.5*Math.cos((ourclock.elapsedTime - ourclock.startTime)*13.5)) * 2; //if you're on a touchscreen then really this should be much bigger
	return spherescale * maxVSSphereScale;
}

function update_wedges()
{
	var wedgeaxis = new THREE.Vector3();
	var intended_x_axis = new THREE.Vector3();
	var current_x_axis = new THREE.Vector3();
	for(var i = 0; i < wedges.length; i++)
	{
		current_x_axis.set( 1, 0, 0 );
		wedges[i].position.set( 0, 0, 0 );
		wedges[i].updateMatrixWorld();
		wedges[i].localToWorld( current_x_axis );
		
		if( isMouseDown )
		{
			wedges[i].position.set( 
					manipulation_surface.geometry.attributes.position.array[ wedges_assigned_vertices[i*2+0] * 3 + 0 ],
					manipulation_surface.geometry.attributes.position.array[ wedges_assigned_vertices[i*2+0] * 3 + 1 ],
					0 );
			
			intended_x_axis.set(
				manipulation_surface.geometry.attributes.position.array[ wedges_assigned_vertices[i*2+1] * 3 + 0 ],
				manipulation_surface.geometry.attributes.position.array[ wedges_assigned_vertices[i*2+1] * 3 + 1 ],
				0 );
		}
		else
		{
			wedges[i].position.set( 
					flatnet_vertices.array[ wedges_assigned_vertices[i*2+0] * 3 + 0 ],
					flatnet_vertices.array[ wedges_assigned_vertices[i*2+0] * 3 + 1 ],
					0 );
			
			intended_x_axis.set(
				flatnet_vertices.array[ wedges_assigned_vertices[i*2+1] * 3 + 0 ],
				flatnet_vertices.array[ wedges_assigned_vertices[i*2+1] * 3 + 1 ],
				0 );
		}
		
		
		intended_x_axis.sub( wedges[i].position );
		
		wedgeaxis.crossVectors( intended_x_axis, current_x_axis );
		wedgeaxis.normalize();
		wedges[i].rotateOnAxis( wedgeaxis, -intended_x_axis.angleTo( current_x_axis ) );
		
		wedges[i].position.z = -0.01;
		
		//next do the little center for QS. Is there a TrapeziumGeometry for the blades?
	}
	
	var wedgesopacity = wedges[0].material.opacity;
	wedgesopacity -= (wedgesopacity - Story_states[Storypage].wedgesOpacity ) * 0.07;
	
	var start_fadein_capsidopenness = 0.8;
	if( capsidopenness > start_fadein_capsidopenness )
		wedgesopacity *= ( capsidopenness - start_fadein_capsidopenness ) / (1-start_fadein_capsidopenness);
	else
		wedgesopacity *= 0;
	
	for( var i = 0; i < wedges.length; i++ )
		wedges[i].material.opacity = wedgesopacity;
}