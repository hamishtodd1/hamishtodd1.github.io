/*  Newest plan:
 * 
 * Maybe we should have one exploration point to the left, one to the right? 
 * 
 * Note that you don't move that far in a given frame. So the first time you move out of the zone, you are probably close, no shape weirdness. It's just after that
 * 
 * When you press the button, it switches in the REAL surface
 * 
 * How about you jump towards it in previously-decided-on-size steps, based on. You know what the straight line would be.
 * 
 * Since the vertex will be springing back and forth, you probably have quite a few evaluations. Though as soon as the button is pressed or another vertex is grabbed, you're done
 * 
 * When the vertex isn't held, it goes slowly-ish back to last_good_position. Probably good to have it be springy, like it can overshoot, but be attracted back
 *   
 */

/*
 * How to deal with concave areas:
 * 
 * Can you make anything of the fact that if you're close to a place where you're about to flip, one of the minimum angles will be pi?
 * That assumes that concavity is your only reason not to converge. This would need to be checked
 * 
 * Could have a triangle surrounding your cursor, one corner pointing in the last direction you went in. Work out whether you can go on the corners, flatten a corner if not
 * 		Go no further than to-one-corner
 * 
 * Don't forget that for non-nerds it is just a cute little toy.
 * 
 * Simplicity is more important than completeness. It was never a good idea to try to implement that unfold-differently thing.
 * 
 * could limit edge lengths to a minimum size, like jeez, that breaks the angular defects
 * it would be a size minimum based on the size of the longest edge, like you can't be less than about a twentieth of its length - that seems to hold for HIV.
 */

//TODO You could graph number of step size reductions over a run. Major tweakables are stepsizemax, initial radii, and newton solver accuracy.

//Maybe some of them require quite different starting radii? If so you could try it with different starters

//is non convergence still related to flipping?

//the edges are disappearing probably because of that find_random_orthogonal_vector thing failing if y1 = y2

var alexandrov_inspection_mode = 0;

var crazy_flip = 0;

//returns true if the minimum angles ended up getting modified
function correct_minimum_angles(vertices_buffer_array) {
	/*
	 * So you actually need to first check whether the triangulation is delaunay. Yo, that might be enough to make sure the algorithm always converges
	 * The thing that is seen may become convex.
	 */
	var highlight_endings = 1;
	
	reset_net(vertices_buffer_array);
	
	var old_ATVIs = new Uint16Array(alexandrov_triangle_vertex_indices.length);
	var old_PELs = Array(polyhedron_edge_length.length);
	for(var i = 0; i < old_ATVIs.length; i++)
		old_ATVIs[i] = alexandrov_triangle_vertex_indices[i];
	for(var i = 0; i < polyhedron_edge_length.length; i++){
		old_PELs[i] = new Float32Array(polyhedron_edge_length[i].length);
		for(var j = 0; j < polyhedron_edge_length[i].length; j++)
			old_PELs[i][j] = polyhedron_edge_length[i][j];
	}
	
	var flipped_last_iteration = delaunay_triangulate();
	
	var total_flips = 0;
	
	var stepsizemax = 0.75;
	var stepsize = stepsizemax;	
	var epsilon = 0.00005; //about the minimum to close HIV. Can make it lower.
	var steps = 0;
	
	//curvatures is a 12D vector with curvatures[i] coming from vertex (i.e. radius) i
	var curvatures_current = get_curvatures(radii,0);	//get the length of this to zero!
	//there may still be places that aren't using the alexandrov triangle array
	var curvatures_current_quadrance = quadrance(curvatures_current);
	var curvatures_intended = Array(curvatures_current.length);
	
	var num_reductions = 0;
	
	while( curvatures_current_quadrance > epsilon)  {
		for( var i = 0; i < curvatures_current.length; i++)
			curvatures_intended[i] = (1 - stepsize) * curvatures_current[i];

		var radii_intended;
		var solve_worked;
		
		if(crazy_flip){ //don't bother trying
			solve_worked = 0;
			crazy_flip = 0;
		}
		else{
			radii_intended = newton_solve(curvatures_intended); //we get radii_intended : curvatures(radii_intended) === curvatures_intended
			solve_worked = radii_intended === 666 ? 0 : 1;
		}
		
		//speedup opportunity: there are several early warning signs that it is time to flip back
		
		if( solve_worked ) {
			var flips_to_perform = Array();
			
			for( var i = 0; i < radii_intended.length; i++) {
				for(var j = i+1; j < radii_intended.length; j++) {
					if( polyhedron_edge_length[i][j] === 666)
						continue;
					
					var angle = get_polyhedron_dihedral_angle_from_indices(i,j, radii_intended);
					
					if(angle >= Math.PI ) {
						flips_to_perform.push(i);
						flips_to_perform.push(j);
					}
				}
			}
			
			if(flips_to_perform.length > 0) {
				if(alexandrov_inspection_mode) console.log("	FLIPS ", flips_to_perform.length / 2);
				total_flips += flips_to_perform.length / 2;
				
				for(var i = 0; i < polyhedron_edge_length.length; i++)
					for(var j = 0; j < polyhedron_edge_length[i].length; j++)
						old_PELs[i][j] = polyhedron_edge_length[i][j];
				for(var i = 0; i < old_ATVIs.length; i++)
					old_ATVIs[i] = alexandrov_triangle_vertex_indices[i];
				
				for( var i = 0; i < flips_to_perform.length / 2; i++){
					var ourindices = get_diamond_indices(flips_to_perform[i*2+0],flips_to_perform[i*2+1]);
					flip(ourindices);
					
					if( crazy_flip )
						break;
				}
				//sooo, there are several steps that request a ridiculous number of flips. And in a row. Not an unheard of number, but maybe inspect them
				//shouldn't there be some logic about adjacent edges not being flipped?
				//should this really "go through"?
				
				flipped_last_iteration = 1;
			}
			else { //hooray, we took a step size the correct amount and can progress
				for( var i = 0; i < radii.length; i++)
					radii[i] = radii_intended[i];
				
				curvatures_current = get_curvatures(radii,0);
				curvatures_current_quadrance = quadrance(curvatures_current);
				
				stepsize = stepsizemax;
				
				//check how many it really is
				if( num_reductions > 5 ) console.error("HEY! We DID progress after " + num_reductions + " reductions");
				
				num_reductions = 0;
				
				flipped_last_iteration = 0;
			}
		}
		else {
			
			if( flipped_last_iteration ){
				if(alexandrov_inspection_mode)
					console.log("	DON'T WORRY, rolling back" );
				for(var i = 0; i < polyhedron_edge_length.length; i++)
					for(var j = 0; j < polyhedron_edge_length[i].length; j++)
						polyhedron_edge_length[i][j] = old_PELs[i][j];
				for(var i = 0; i < alexandrov_triangle_vertex_indices.length; i++)
					alexandrov_triangle_vertex_indices[i] = old_ATVIs[i];
			}
			
			flipped_last_iteration = 0;
			
			//clear flips_to_perform here, and somewhere else
			//if it is soluble, you clear, so probably just after the if != 666
			stepsize = stepsize*stepsize;
			
			num_reductions++;
			if(num_reductions > 5){
				if(alexandrov_inspection_mode){
					console.error("NOOOOOO! Quitting Al after " + num_reductions + " reductions");
					console.log(manipulation_surface.geometry.attributes.position.array);
				}
				return 0;
			}
		}
		
		steps++;
		if(steps > 1000){ //limited by your patience at the moment, who's to say they wouldn't get there?
			if(alexandrov_inspection_mode){
				console.error("NOOOOOO! Quitting Al after " + steps + " steps");
				console.log(manipulation_surface.geometry.attributes.position.array);
			}
			return 0;
		}
	}
	
	
	for(var i = 0; i< net_triangle_vertex_indices.length / 3; i++) {
		for(var j = 0; j < 3; j++){
			var a_index = polyhedron_index(net_triangle_vertex_indices[i*3 + j]);
			var b_index = polyhedron_index(net_triangle_vertex_indices[i*3 + (j+1)%3]);
			
			if( polyhedron_edge_length[a_index][b_index] === 666 || 
				polyhedron_edge_length[b_index][a_index] === 666 ){
				if(alexandrov_inspection_mode) 
					console.error("concave! though hey, at least it worked"); //flipped combinatorics, didn't flip back
				/*
				 * Could see about drawing a perimeter by dotting all the places where minimum angles are close to pi, see what that tells you
				 */
				return 0;
			}
		}
	}

	for(var i = 2; i < minimum_angles.length; i++) {
		minimum_angles[i] = get_polyhedron_dihedral_angle_from_indices( polyhedron_index( vertices_derivations[i][0] ),
																		polyhedron_index( vertices_derivations[i][1] ), 
																		radii);
		
//		if( Math.PI - minimum_angles[i] < 0.01)
//			console.log("you're about to get convex!");
	}
	
	if(total_flips != 0){
		if(alexandrov_inspection_mode) 
			console.error("success, and it involved " + total_flips + " flips");
		total_flips = 0;
	}
	else if(alexandrov_inspection_mode)
		console.error("success");
	
	return 1;
}

//this can get us the radii such that curvature = curvatures_intended
function newton_solve(final_curvatures_intended) {
	var newton_warnings = 0;
	
	var radii_guess = Array(12);
	for( var i = 0; i < 12; i++)
		radii_guess[i] = radii[i];
	
	var jacobian;
	var delta_radii;
	var desired_jacobianmultiplication_output = get_curvatures(radii_guess,1); //This is the result of the function at the next place we intend to call it at it.
	if(desired_jacobianmultiplication_output === 666 ){
		if(newton_warnings) console.log("  newton: instantly bad");
		return 666;
	}
	for( var i = 0; i < 12; i++)
		desired_jacobianmultiplication_output[i] = final_curvatures_intended[i] - desired_jacobianmultiplication_output[i]; //make sure the destination is zero.
	
	var iterations = 0;
	var impossibility_alert = 0;
	var epsilon = 0.00001; //it converges quadratically so you can be greedy. This is minimum to avoid a certain flip-and-flip-back. Stefan uses 1E-10!
	
	var hadanegative = 0;
	
	do {
		jacobian = get_Jacobian(radii_guess);
		
		delta_radii = numeric.solve(jacobian, desired_jacobianmultiplication_output);
		
		for( var i = 0; i < 12; i++){
			radii_guess[i] += delta_radii[i];
			if(radii_guess[i] < 0)
				hadanegative = 1;
		}
		
		//triangle inequalities
		for(var i = 0; i < 12; i++){
			for(var j = 0; j < 12; j++){
				if(polyhedron_edge_length[i][j] === 666 ) continue;
				if(	Math.abs(radii_guess[i]) + Math.abs(radii_guess[j]) < polyhedron_edge_length[i][j] ||
					Math.abs(radii_guess[j]) + polyhedron_edge_length[i][j] < Math.abs(radii_guess[i]) ||
					polyhedron_edge_length[i][j] + Math.abs(radii_guess[i]) < Math.abs(radii_guess[j])
				  ){
					if(newton_warnings) console.error("  newton: triangle inequality violated after " + iterations + " iterations");
					
					//mu- minus numbers??????? Does that ever happen with ones that succeed? Check stefan's source, he might be abs()ing them
					return 666;
				}
			}
		}
		
		desired_jacobianmultiplication_output = get_curvatures(radii_guess,1);
		if(desired_jacobianmultiplication_output === 666 ){
			if(newton_warnings) console.log("  newton: went bad naturally")
			return 666;
		}
		
		for( var i = 0; i < 12; i++)
			desired_jacobianmultiplication_output[i] = final_curvatures_intended[i] - desired_jacobianmultiplication_output[i];
		
		iterations++;
		if(iterations >= 20 ) {
			if(newton_warnings) console.log("  newton: failed to converge after 20 iterations"); //Works for Stefan
			return 666;
		}
		
	} while( quadrance(desired_jacobianmultiplication_output) > epsilon && iterations < 20); //and, perhaps, radii_guess[i] < radii[i]. This would deal with "flip and flip back"

//	if(hadanegative)console.error( "success after negative!")
	return radii_guess;
}

function get_Jacobian(input_radii){
	var jacobian = Array(12);
	for(var i = 0; i < 12; i++){
		jacobian[i] = new Float32Array(12);
		jacobian[i][i] = 0;
		for( var j = 0; j < 12; j++){
			if(i===j) continue;
			
			if( polyhedron_edge_length[i][j] === 666){
				jacobian[i][j] = 0;
				continue;
			}
			
			var cos_alpha_ij_or_ji = get_cos_tetrahedron_dihedral_angle_from_indices(i,j,0, input_radii);
			var cos_alpha_ji_or_ij = get_cos_tetrahedron_dihedral_angle_from_indices(i,j,1, input_radii);
			var cot_alpha_ij_or_ji = cos_alpha_ij_or_ji / Math.sqrt( 1 - cos_alpha_ij_or_ji*cos_alpha_ij_or_ji ); //speedup opportunity: one-line this.
			var cot_alpha_ji_or_ij = cos_alpha_ji_or_ij / Math.sqrt( 1 - cos_alpha_ji_or_ij*cos_alpha_ji_or_ij );

			var cos_rho_ij = get_cos_rule(input_radii[j], polyhedron_edge_length[i][j], input_radii[i]);
			var cos_rho_ji = get_cos_rule(input_radii[i], polyhedron_edge_length[j][i], input_radii[j] );
			var sin_rho_ij = Math.sqrt(1-cos_rho_ij*cos_rho_ij);
			var sin_rho_ji = Math.sqrt(1-cos_rho_ji*cos_rho_ji); //speedup: save and reuse these
			
			jacobian[i][j] = ( cot_alpha_ij_or_ji + cot_alpha_ji_or_ij ) / (polyhedron_edge_length[i][j] * sin_rho_ij * sin_rho_ji);
			
			var cos_phi_ij = get_cos_rule(polyhedron_edge_length[i][j], input_radii[i], input_radii[j]);
			
			jacobian[i][i] += cos_phi_ij * jacobian[i][j];
		}
		
		jacobian[i][i] *= -1;
	}

	return jacobian;
}



//curvature is like angular defect, but of dihedral angles around a radius.
//TODO so you have screwed this thing up in some way. Just copypaste back from the old alexandrov, it's fine, though finish what you started
function get_curvatures(input_radii, failure_is_acceptable) {
	var curvature_array = new Float32Array([-TAU,-TAU,-TAU,-TAU,-TAU,-TAU,-TAU,-TAU,-TAU,-TAU,-TAU,-TAU]);
	for( var i = 0; i < 12; i++) {
//		var report_array = Array(5);
		for( var j = 0; j < 12; j++) {
			if(polyhedron_edge_length[i][j] === 666 )
				continue;
			
			var k = get_third_corner(i,j,0); //for i,j we get the anticlockwise one, then j,i we get the (from this point of view) clockwise one
			
			var cos_gamma_ijk = get_cos_rule(polyhedron_edge_length[j][k],polyhedron_edge_length[i][j], polyhedron_edge_length[k][i]);
			var cos_rho_ij = get_cos_rule(input_radii[j], polyhedron_edge_length[i][j], input_radii[i]);
			var cos_rho_ik = get_cos_rule(input_radii[k], polyhedron_edge_length[i][k], input_radii[i]);
			var sin_rho_ij_TIMES_sin_rho_ik = Math.sqrt((1-cos_rho_ij*cos_rho_ij)*(1-cos_rho_ik*cos_rho_ik));

			var cos_omega_ijk = ( cos_gamma_ijk - cos_rho_ij * cos_rho_ik ) / sin_rho_ij_TIMES_sin_rho_ik;
			
			if( -1.001 < cos_omega_ijk && cos_omega_ijk < -1)
				curvature_array[i] += Math.PI;
			else if( cos_omega_ijk < 1) //and if slightly more than 1, we're adding 0.
				curvature_array[i] += Math.acos(cos_omega_ijk);
//			if( cos_omega_ijk < -1.001 || 1.001 < cos_omega_ijk  )
//				{report_array[0] = cos_gamma_ijk; report_array[1] = cos_rho_ij; report_array[2] = cos_rho_ik; report_array[3] = sin_rho_ij_TIMES_sin_rho_ik; report_array[4] = cos_omega_ijk;}
			
//			if(!failure_is_acceptable && isNaN(Math.acos(cos_omega_ijk))){ //TODO remove from final thing
//				if(cos_gamma_ijk < -1 || 1 < cos_gamma_ijk){
//						if( polyhedron_edge_length[j][k] > polyhedron_edge_length[i][j] + polyhedron_edge_length[k][i]
//						 || polyhedron_edge_length[j][i] > polyhedron_edge_length[k][j] + polyhedron_edge_length[k][i]
//						 || polyhedron_edge_length[i][k] > polyhedron_edge_length[k][j] + polyhedron_edge_length[j][i] ){
//							console.error("triangle inequality violated");
//							console.log(polyhedron_edge_length[j][k], polyhedron_edge_length[i][j], polyhedron_edge_length[k][i])
//							console.log(i,j,k)
//							print_ATVIs();
//							console.log(flatnet_vertices.array)
//						}
//				}
//				if(cos_rho_ij < -1 || 1 < cos_rho_ij)
//					console.log("cos_rho_ij")
//				if(cos_rho_ik < -1 || 1 < cos_rho_ik){
//					console.log(polyhedron_edge_length[i][k]);
//					console.log("cos_rho_ik")
//				}
//				if(sin_rho_ij_TIMES_sin_rho_ik < -1 || 1 < sin_rho_ij_TIMES_sin_rho_ik)
//					console.log("sin_rho_ij_TIMES_sin_rho_ik");
//			}
		}
		if(isNaN(curvature_array[i])) {
			if(!failure_is_acceptable) {
				//this is probably just a "don't allow this" situation
				if(net_warnings)console.error("crazy curvature");
			}
			return 666;
		}
		curvature_array[i] *= -1;
	}
	return curvature_array;
}

function get_cos_tetrahedron_dihedral_angle_from_indices(i,j,clockwise,input_radii) {
	var k = 666;

	k = get_third_corner(i,j,clockwise); //you always call this function with both 0 and 1 in there
	if( k === 666 ) {
		//this should really not happen unless this function is given i,j not on an edge.
		console.error("requested dihedral angle from nonexistant tetrahedron connecting polyhedron vertices " + i + " and " + j);
		return 0;
	}
	
	var cos_rho_ij = get_cos_rule(input_radii[j], polyhedron_edge_length[i][j], input_radii[i]);
	var cos_rho_ik = get_cos_rule(input_radii[k], polyhedron_edge_length[i][k], input_radii[i]);
	var cos_gamma_ijk = get_cos_rule(polyhedron_edge_length[j][k],polyhedron_edge_length[i][j], polyhedron_edge_length[k][i]);
	var sin_rho_ij_TIMES_sin_gamma_ijk = Math.sqrt((1-cos_rho_ij*cos_rho_ij)*(1-cos_gamma_ijk*cos_gamma_ijk));
	
	return (cos_rho_ik - cos_gamma_ijk * cos_rho_ij)/sin_rho_ij_TIMES_sin_gamma_ijk;
}

function get_polyhedron_dihedral_angle_from_indices(i,j, input_radii){
	return Math.acos(get_cos_tetrahedron_dihedral_angle_from_indices(i,j,0, input_radii) ) 
		 + Math.acos(get_cos_tetrahedron_dihedral_angle_from_indices(i,j,1, input_radii) );
}

function quadrance(vector_values) {
	var result = 0;
	
	for( var i = 0; i < vector_values.length; i++)
		result += vector_values[i] * vector_values[i];
	
	return result;
}