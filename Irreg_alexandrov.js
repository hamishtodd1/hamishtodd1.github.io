//look into history for stuff about improving algorithm (concavity, running time)

AO.alexandrov_inspection_mode = 0;

AO.crazy_flip = 0;

//returns true if the minimum angles ended up getting modified
AO.correct_minimum_angles = function(vertices_buffer_array)
{
	this.reset_net(vertices_buffer_array);
	
	var old_ATVIs = new Uint16Array(this.alexandrov_triangle_vertex_indices.length);
	var old_PELs = Array(this.polyhedron_edge_length.length);
	for(var i = 0, il = old_ATVIs.length; i < il; i++)
		old_ATVIs[i] = this.alexandrov_triangle_vertex_indices[i];
	for(var i = 0, il = this.polyhedron_edge_length.length; i < il; i++){
		old_PELs[i] = new Float32Array(this.polyhedron_edge_length[i].length);
		for(var j = 0, jl = this.polyhedron_edge_length[i].length; j < jl; j++)
			old_PELs[i][j] = this.polyhedron_edge_length[i][j];
	}
	
	var flipped_last_iteration = this.delaunay_triangulate();
	
	this.update_cos_rho(this.radii); //here because it needs the combinatorics above
	
	var total_flips = 0;

	var stepsizemax = 0.1; //making this low caused misfolding
	var stepsize = stepsizemax;	
	var epsilon = 0.00005; //about the minimum to close HIV. Can make it lower.
	var steps = 0;
	
	//curvatures is a 12D vector with curvatures[i] coming from vertex (i.e. radius) i
	var curvatures_current = this.get_curvatures(this.radii,0);	//get the length of this to zero!
	if(curvatures_current === 999)
		return 0;
	//there may still be places that aren't using the alexandrov triangle array
	var curvatures_current_quadrance = quadrance(curvatures_current);
	var curvatures_intended = Array(curvatures_current.length);
	
	var num_reductions = 0;
	
	while( curvatures_current_quadrance > epsilon)  {
		for( var i = 0, il = curvatures_current.length; i < il; i++)
			curvatures_intended[i] = (1 - stepsize) * curvatures_current[i];

		var solve_worked;
		
		if(this.crazy_flip){ //don't bother trying
//			console.log("crazy flip")
			solve_worked = 0;
			this.crazy_flip = 0;
		}
		else{
			solve_worked = this.newton_solve(curvatures_intended);
			//This causes radii_guess to become what we formerly caled radii_intended. It is such that curvatures(radii_intended) === curvatures_intended
		}
		
		//speedup opportunity: there are several early warning signs that it is time to flip back
		
		if( solve_worked )
		{
			var flips_to_perform = Array(); //speedup opportunity (?): don't make it every iteration
			
			for( var i = 0, il = this.radii_guess.length; i < il; i++) {
				for(var j = i+1, jl = this.radii_guess.length; j < jl; j++) {
					if( this.polyhedron_edge_length[i][j] === 999)
						continue;
					
					var angle = this.get_polyhedron_dihedral_angle_from_indices(i,j, this.radii_guess);
					
					if(angle >= Math.PI ) {
						flips_to_perform.push(i);
						flips_to_perform.push(j);
					}
				}
			}
			
			if(flips_to_perform.length > 0) {
				if(this.alexandrov_inspection_mode) console.log("	FLIPS ", flips_to_perform.length / 2);
				total_flips += flips_to_perform.length / 2;
				
				for(var i = 0, il = this.polyhedron_edge_length.length; i < il; i++)
					for(var j = 0, jl = this.polyhedron_edge_length[i].length; j < jl; j++)
						old_PELs[i][j] = this.polyhedron_edge_length[i][j];
				for(var i = 0, il = old_ATVIs.length; i < il; i++)
					old_ATVIs[i] = this.alexandrov_triangle_vertex_indices[i];
				
				for( var i = 0, il = flips_to_perform.length / 2; i < il; i++){
					var ourindices = this.get_diamond_indices(flips_to_perform[i*2+0],flips_to_perform[i*2+1]);
					this.flip(ourindices);
					
					if( this.crazy_flip )
						break;
				}
				this.update_cos_rho(this.radii);
				
				flipped_last_iteration = 1;
			}
			else { //hooray, we took a step size the correct amount and can progress
				for( var i = 0, il = this.radii.length; i < il; i++)
					this.radii[i] = this.radii_guess[i];
				this.update_cos_rho(this.radii); //speedup: copy instead of calculate
				
				curvatures_current = this.get_curvatures(this.radii,0);
				curvatures_current_quadrance = quadrance(curvatures_current);
				
				if(num_reductions === 0)
					stepsizemax = Math.pow( stepsizemax, 0.7 ); //this is an addition perhaps worth running by Stefan.
//				if(num_reductions > 0)
//					stepsizemax = stepsizemax * stepsizemax; //you could do this when there have been two in a row that have needed reductions
				
				stepsize = stepsizemax;
				
				if( num_reductions > 5 ) //this is considered unlikely
					console.error("HEY! We DID progress after " + num_reductions + " reductions");
				
				num_reductions = 0;
				
				flipped_last_iteration = 0;
			}
		}
		else {
			
			if( flipped_last_iteration ){
				if(this.alexandrov_inspection_mode)
					console.log("	DON'T WORRY, rolling back" );
				for(var i = 0, il = this.polyhedron_edge_length.length; i < il; i++)
					for(var j = 0, jl = this.polyhedron_edge_length[i].length; j < jl; j++)
						this.polyhedron_edge_length[i][j] = old_PELs[i][j];
				for(var i = 0, il = this.alexandrov_triangle_vertex_indices.length; i < il; i++)
					this.alexandrov_triangle_vertex_indices[i] = old_ATVIs[i];
			}
			
			flipped_last_iteration = 0;
			
			//clear flips_to_perform here, and somewhere else
			//if it is soluble, you clear, so probably just after the if != 999
			stepsize = stepsize*stepsize;
			
			num_reductions++;
			if(num_reductions > 5){
				if(this.alexandrov_inspection_mode){
					console.error("NOOOOOO! Quitting Al after " + num_reductions + " reductions");
					console.log(manipulation_surface.geometry.attributes.position.array);
				}
				return 0;
			}
		}
		
		steps++;
		if(steps > 400){ //Lenient cutoff based on general values seen. Would they get there? Doesn't happen much
			if(this.alexandrov_inspection_mode)
			{
				console.error("NOOOOOO! Quitting Al after " + steps + " steps");
				console.log(manipulation_surface.geometry.attributes.position.array);
			}
			return 0;
		}
	}
//	performance_checker.report_samples_avg()
	
	for(var i = 0, il = net_triangle_vertex_indices.length / 3; i < il; i++) {
		for(var j = 0; j < 3; j++){
			var a_index = this.polyhedron_index(net_triangle_vertex_indices[i*3 + j]);
			var b_index = this.polyhedron_index(net_triangle_vertex_indices[i*3 + (j+1)%3]);
			
			if( this.polyhedron_edge_length[a_index][b_index] === 999 || 
				this.polyhedron_edge_length[b_index][a_index] === 999 ){
				if(this.alexandrov_inspection_mode) 
					console.error("concave! though hey, at least it worked"); //flipped combinatorics, didn't flip back. No, this is not usable
				/*
				 * Could see about drawing a perimeter by dotting all the places where minimum angles are close to pi, see what that tells you
				 */
				return 0;
			}
		}
	}

	for(var i = 2, il = minimum_angles.length; i < il; i++) {
		minimum_angles[i] = this.get_polyhedron_dihedral_angle_from_indices( this.polyhedron_index( vertices_derivations[i][0] ),
																		this.polyhedron_index( vertices_derivations[i][1] ), 
																		this.radii);
		
//		if( Math.PI - minimum_angles[i] < 0.01)
//			console.log("you're about to get convex!");
	}
	
	if(total_flips != 0){
		if(this.alexandrov_inspection_mode) 
			console.error("success, and it involved " + total_flips + " flips");
		total_flips = 0;
	}
	else if(this.alexandrov_inspection_mode)
		console.error("success");
	
	return 1;
}

AO.update_cos_rho = function(input_radii)
{
	for(var i = 0; i < 12; i++)
		for(var j = 0; j < 12; j++)
			if(this.polyhedron_edge_length[i][j] !== 999 ) //speedup opportunity : you could do it with all of them. Irrelevant ones just wouldn't be used. 7 extra though
				input_radii.cos_rho[i][j] = get_cos_rule(input_radii[j], this.polyhedron_edge_length[i][j], input_radii[i]);
}

//this can get us the radii such that curvature = curvatures_intended
AO.newton_solve = function(final_curvatures_intended)
{
	var newton_warnings = 0;
	
	for( var i = 0; i < 12; i++)
		this.radii_guess[i] = this.radii[i];
	this.update_cos_rho(this.radii_guess);
	
	var jacobian;
	var delta_radii;
	var desired_jacobianmultiplication_output = this.get_curvatures(this.radii_guess,1); //This is the result of the function at the next place we intend to call it at it.
	if(desired_jacobianmultiplication_output === 999 ){
		if(newton_warnings) console.log("  newton: instantly bad");
		return 0;
	}
	for( var i = 0; i < 12; i++)
		desired_jacobianmultiplication_output[i] = final_curvatures_intended[i] - desired_jacobianmultiplication_output[i]; //make sure the destination is zero.
	
	var iterations = 0;
	var impossibility_alert = 0;
	var epsilon = 0.00001; //it converges quadratically so you can be greedy. This is minimum to avoid a certain flip-and-flip-back. Stefan uses 1E-10!
	
	var hadanegative = 0;
	
	do {
		jacobian = this.get_Jacobian(this.radii_guess);
		
		delta_radii = numeric.solve(jacobian, desired_jacobianmultiplication_output);
		
		for( var i = 0; i < 12; i++){
			this.radii_guess[i] += delta_radii[i];
			if( this.radii_guess[i] < 0 )
				hadanegative = 1;
		}
		this.update_cos_rho(this.radii_guess);
		
		//triangle inequalities
		for(var i = 0; i < 12; i++){
			for(var j = 0; j < 12; j++){
				if(this.polyhedron_edge_length[i][j] === 999 ) continue;
				if(	Math.abs(this.radii_guess[i]) + Math.abs(this.radii_guess[j]) < this.polyhedron_edge_length[i][j] ||
					Math.abs(this.radii_guess[j]) + this.polyhedron_edge_length[i][j] < Math.abs(this.radii_guess[i]) ||
					this.polyhedron_edge_length[i][j] + Math.abs(this.radii_guess[i]) < Math.abs(this.radii_guess[j])
				  ){
					if(newton_warnings) console.error("  newton: triangle inequality violated after " + iterations + " iterations");
					
					//minus numbers??????? Does that ever happen with ones that succeed? Check stefan's source, he might be abs()ing them
					return 0;
				}
			}
		}
		
		desired_jacobianmultiplication_output = this.get_curvatures(this.radii_guess,1);
		if(desired_jacobianmultiplication_output === 999 ){
			if(newton_warnings) console.log("  newton: went bad naturally")
			return 0;
		}
		
		for( var i = 0; i < 12; i++)
			desired_jacobianmultiplication_output[i] = final_curvatures_intended[i] - desired_jacobianmultiplication_output[i];
		
		iterations++;
		if(iterations >= 20 ) {
			if(newton_warnings) console.log("  newton: failed to converge after 20 iterations"); //Works for Stefan
			return 0;
		}
		
	} while( quadrance(desired_jacobianmultiplication_output) > epsilon && iterations < 20); //and, perhaps, radii_guess[i] < radii[i]. This would deal with "flip and flip back"

	return 1;
//	if(hadanegative)console.error( "success after negative!")
}

AO.get_Jacobian = function (input_radii){
	var jacobian = Array(12);
	
	for(var i = 0; i < 12; i++){
		jacobian[i] = new Float32Array(12);
		jacobian[i][i] = 0;
		
		for( var j = 0; j < 12; j++){
			if(i===j) continue;
			
			if( this.polyhedron_edge_length[i][j] === 999){
				jacobian[i][j] = 0;
				continue;
			}
			
			var sin_rho_ij_times_sin_rho_ji = Math.sqrt( 
					(1-input_radii.cos_rho[i][j]*input_radii.cos_rho[i][j]) * //can separate these out into two sqrts which are sin rho ij and ji
					(1-input_radii.cos_rho[j][i]*input_radii.cos_rho[j][i]) ); //And these might be reused in other functions? No point reusing here though. But you need to check what angles they are
			
			var cos_alpha_ij_or_ji = this.get_cos_tetrahedron_dihedral_angle_from_indices(i,j,0, input_radii);
			var cos_alpha_ji_or_ij = this.get_cos_tetrahedron_dihedral_angle_from_indices(i,j,1, input_radii);
			
			jacobian[i][j] = ( 
					cos_alpha_ij_or_ji / Math.sqrt( 1 - cos_alpha_ij_or_ji * cos_alpha_ij_or_ji ) + //=cot_alpha_ij_or_ji
					cos_alpha_ji_or_ij / Math.sqrt( 1 - cos_alpha_ji_or_ij * cos_alpha_ji_or_ij ) ) //=cot_alpha_ji_or_ij
			/ (this.polyhedron_edge_length[i][j] * sin_rho_ij_times_sin_rho_ji );
			
			var cos_phi_ij = get_cos_rule(this.polyhedron_edge_length[i][j], input_radii[i], input_radii[j]); //reuse this too?
			
			jacobian[i][i] += cos_phi_ij * jacobian[i][j];
		}
		
		jacobian[i][i] *= -1;
	}

	return jacobian;
}

//curvature is like angular defect, but of dihedral angles around a radius.
//TODO so you have screwed this thing up in some way. Just copypaste back from the old alexandrov, it's fine, though finish what you started
AO.get_curvatures = function(input_radii, failure_is_acceptable) {
	var curvature_array = new Float32Array([-TAU,-TAU,-TAU,-TAU,-TAU,-TAU,-TAU,-TAU,-TAU,-TAU,-TAU,-TAU]);
	for( var i = 0; i < 12; i++)
	{
		for( var j = 0; j < 12; j++)
		{
			if(this.polyhedron_edge_length[i][j] === 999 )
				continue;
			
			var k = this.get_third_corner(i,j,0); //for i,j we get the anticlockwise one, then j,i we get the (from this point of view) clockwise one
			
			var cos_gamma_ijk = get_cos_rule(this.polyhedron_edge_length[j][k],this.polyhedron_edge_length[i][j], this.polyhedron_edge_length[k][i]);
			var sin_rho_ij_TIMES_sin_rho_ik = Math.sqrt((1-input_radii.cos_rho[i][j]*input_radii.cos_rho[i][j])*(1-input_radii.cos_rho[i][k]*input_radii.cos_rho[i][k]));

			var cos_omega_ijk = ( cos_gamma_ijk - input_radii.cos_rho[i][j] * input_radii.cos_rho[i][k] ) / sin_rho_ij_TIMES_sin_rho_ik;
			
			if( -1.001 < cos_omega_ijk && cos_omega_ijk < -1)
				curvature_array[i] += Math.PI;
			else if( cos_omega_ijk < 1) //and if slightly more than 1, we're adding 0.
				curvature_array[i] += Math.acos(cos_omega_ijk);
		}
		if(isNaN(curvature_array[i]))
		{
			if(!failure_is_acceptable) {
				//this is probably just a "don't allow this" situation
				if(net_warnings)console.error("crazy curvature");
			}
			return 999;
		}
		curvature_array[i] *= -1;
	}
	return curvature_array;
}

AO.get_cos_tetrahedron_dihedral_angle_from_indices = function(i,j,clockwise,input_radii) {
	var k = 999;

	k = this.get_third_corner(i,j,clockwise); //you always call this function with both 0 and 1 in there
	if( k === 999 ) {
		//this should really not happen unless this function is given i,j not on an edge.
//		console.error("requested dihedral angle from nonexistant tetrahedron connecting polyhedron vertices " + i + " and " + j);
		return 0;
	}
	
	var cos_gamma_ijk = get_cos_rule(this.polyhedron_edge_length[j][k],this.polyhedron_edge_length[i][j], this.polyhedron_edge_length[k][i]);
	var sin_rho_ij_TIMES_sin_gamma_ijk = Math.sqrt((1-input_radii.cos_rho[i][j]*input_radii.cos_rho[i][j])*(1-cos_gamma_ijk*cos_gamma_ijk));
	
	return (input_radii.cos_rho[i][k] - cos_gamma_ijk * input_radii.cos_rho[i][j]) / sin_rho_ij_TIMES_sin_gamma_ijk;
}

AO.get_polyhedron_dihedral_angle_from_indices = function(i,j, input_radii){
	//Using cos of summed acoses here is a bad idea. Might be a bad idea in general
			
	return Math.acos(this.get_cos_tetrahedron_dihedral_angle_from_indices(i,j,0, input_radii) ) 
		 + Math.acos(this.get_cos_tetrahedron_dihedral_angle_from_indices(i,j,1, input_radii) );
}

function quadrance(vector_values)
{
	var result = 0;
	
	for( var i = 0, il = vector_values.length; i < il; i++)
		result += vector_values[i] * vector_values[i];
	
	return result;
}