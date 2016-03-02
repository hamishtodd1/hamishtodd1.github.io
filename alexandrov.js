//could limit edge lengths to a minimum size, like jeez, that breaks the angular defects
//it would be a size minimum based on the size of the longest edge, like you can't be less than about a twentieth of its length - that seems to hold for HIV.

//TODO You could graph number of step size reductions over a run. Major tweakables are stepsizemax, initial radii, and newton solver accuracy.

//TODO frame-stagger. Notes on that:
//Possibly, the only thing that is important in terms of preserving the illusion is that the angles be strictly decreasing.
//Perhaps find some way to relate the angle that is used to epsilon and openness in a way that makes it so they're strictly decreasing?
//or, only write to those dihedral angles that are less than what they were in the previous frame (which may be dependent on openness)
//It's taking on the order of 300 steps. That can almost certainly be reduced by tweaking what you can tweak. But you can't have one step per frame if it's too many.

/*
 * Plan:
 * Player can move vertex all they like, but when they let go it snaps to the closest lattice vertex that works
 * When it is determined as being vertex_tobechanged, we start putting together a list of potential snap-to lattice vertices
 */

/*
 * (other) Compromise possibilities.
 * 
 * Can you put extra edges in when they press the fold button?
 * Can you squash the edge lengths on the surface when capsid is closed? Probably it wouldn't be contracted that much, the  
 * 
 * Shall we at least see about whether it's true that they can SOMETIMES flip back? It's a fuck of a time investment
 * Would it be hard to check that the combinatorics are what they were?
 * 
 * Can you make anything of the fact that if you're close to a place where you're about to flip, one of the minimum angles will be pi?
 * 
 * Could: Say p1 worked and player is now at p2. Try p2. If it doesn't work, next frame move to (p1+p2)/2
 * 
 * Could have the algorithm run a bunch of times on a patch to profile where you can and can't go without flips, from there get an idea of stuff
 * Could have a triangle surrounding your cursor, one corner pointing in the last direction you went in. Work out whether you can go on the corners, flatten a corner if not
 * 		Go no further than to-one-corner
 * 
 * Could just have it break, elegantly! When an edge wants to be flipped, quarantine the four vertices around it and try to run the algorithm as best you can with the others
 * 
 * Don't forget that for non-nerds it is just a cute little toy.
 * Simplicity is more important than completeness. It was never a good idea to try to implement that unfold-differently thing.
 * 
 * Many of these options would be made easier by speeding up the algorithm, which you need to do anyway.
 */



function polyhedron_index(i) {
	if(i<2)	   return i; //the two in the central crack
	if(i===16) return 10;
	if(i===18) return 1;
	if(i===20) return 2;
	
	if( i % 4 === 2) return (i+4) / 2;
	if( i % 4 === 3) return (i+1) / 2;
	if( i % 4 === 0) return (i+4) / 2;
	if( i % 4 === 1) return 11;
}

function correct_minimum_angles() {
	/*
	 * So you actually need to first check whether the triangulation is delaunay. Yo, that might be enough to make sure the algorithm always converges
	 * The thing that is seen may become convex.
	 */
	
	var this_all_takes_place_in_one_frame = true;
	
	if(this_all_takes_place_in_one_frame) reset_net();
	else console.log( "No, you need to reset the net");
	
	var stepsizemax = 0.75;
	var stepsize = stepsizemax;	
	var epsilon = 0.0025; //subjectively chosen
	var steps = 0;
	
	//curvatures is a 12D vector with curvatures[i] coming from vertex (i.e. radius) i. Get its length to zero!
	var curvatures_current = get_curvatures(radii,0);	//get this to zero!
	//there may still be places that aren't using the alexandrov triangle array
	var curvatures_current_quadrance = quadrance(curvatures_current);
	
	while( curvatures_current_quadrance > epsilon)  {
		var curvatures_intended = Array(curvatures_current.length);
		for( var i = 0; i < curvatures_current.length; i++)
			curvatures_intended[i] = (1 - stepsize) * curvatures_current[i];

		var radii_intended = newton_solve(curvatures_intended); //we get radii_intended : curvatures(radii_intended) === curvatures_intended	
		
		if( radii_intended !== 666 ) { //it worked!
			var concave_edges = Array();
			for( var i = 0; i < radii_intended.length; i++) {
				for(var j = i+1; j < radii_intended.length; j++) {
					if( polyhedron_edge_length[i][j] === 666)
						continue;
					
					var angle = get_polyhedron_dihedral_angle_from_indices(i,j, radii_intended,0);
					
					if(angle >= Math.PI ) {
						concave_edges.push(i);
						concave_edges.push(j);
					}
				}
			}
			
			if(concave_edges.length == 0) { //hooray, we took a step size the correct amount and can progress
				for( var i = 0; i < curvatures_current.length; i++)
					radii[i] = radii_intended[i];
				
				if(this_all_takes_place_in_one_frame) {
					curvatures_current = get_curvatures(radii,0);
					curvatures_current_quadrance = quadrance(curvatures_current);
					
					stepsize = stepsizemax;
				}
				else break; //we only want one step
			}
			else {//unsolvable, concave edges
				console.log("found " + concave_edges.length + " concave edge(s)");
				return 0;
			}
		}
		else
			stepsize = stepsize*stepsize;
		
		steps++;
		if(steps > 1500){
			if(net_warnings)console.log("Quitting Al. More than " + steps + " steps");
			return 0;
		}
	}
	
//	if(steps === 0)console.error("no algorithm, bad curvature probably")

	for(var i = 2; i < minimum_angles.length; i++) {
		//we will need to make this function give us the choice of the visible or virtual combinatorics
		minimum_angles[i] = get_polyhedron_dihedral_angle_from_indices( polyhedron_index( vertices_derivations[i][0] ),
																		polyhedron_index( vertices_derivations[i][1] ), 
																		radii,1);
	}
	
	return 1;
}

//this gets us the radii such that curvature = curvatures_intended
function newton_solve(final_curvatures_intended) {
	var radii_guess = Array(12);
	for( var i = 0; i < 12; i++)
		radii_guess[i] = radii[i];
	
	var jacobian;
	var delta_radii;
	var desired_jacobianmultiplication_output = get_curvatures(radii_guess,0); //This is the result of the function at the next place we intend to call it at it.
	for( var i = 0; i < 12; i++)
		desired_jacobianmultiplication_output[i] = final_curvatures_intended[i] - desired_jacobianmultiplication_output[i]; //make sure the destination is zero.
	
	var iterations = 0;
	var impossibility_alert = 0;
	var epsilon = 0.01; //it converges quadratically so you can be greedier?
	
	do {
		jacobian = get_Jacobian(radii_guess);
		
		delta_radii = numeric.solve(jacobian, desired_jacobianmultiplication_output);
		
		for( var i = 0; i < 12; i++)
			radii_guess[i] += delta_radii[i];
		//if(!logged)console.log(quadrance(radii_guess));
		
		for(var i = 0; i < 12; i++){
			for(var j = 0; j < 12; j++){
				if(polyhedron_edge_length[i][j] === 666 ) continue;
				
				//triangle inequalities
				if(	radii_guess[i] + radii_guess[j] < polyhedron_edge_length[i][j] ||
					radii_guess[j] + polyhedron_edge_length[i][j] < radii_guess[i] ||
					polyhedron_edge_length[i][j] + radii_guess[i] < radii_guess[j]
				  )
					return 666;
			}
		}
		
		desired_jacobianmultiplication_output = get_curvatures(radii_guess,1);
		if(desired_jacobianmultiplication_output === 666 )
			return 666;
		
		for( var i = 0; i < 12; i++)
			desired_jacobianmultiplication_output[i] = final_curvatures_intended[i] - desired_jacobianmultiplication_output[i];
		
		iterations++;
		if(iterations >= 20 ) {
			console.log("newton failed to converge after 20 iterations");
			return 666;
		}
	} while( quadrance(desired_jacobianmultiplication_output) > epsilon && iterations < 20);

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
			
			var cos_alpha_ij_or_ji = get_cos_tetrahedron_dihedral_angle_from_indices(i,j,0, input_radii,0);
			var cos_alpha_ji_or_ij = get_cos_tetrahedron_dihedral_angle_from_indices(i,j,1, input_radii,0);
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

function print_ATVIs(){
	for(var i = 0; i <20; i++)
		console.log(alexandrov_triangle_vertex_indices[i*3+0],
					alexandrov_triangle_vertex_indices[i*3+1],
					alexandrov_triangle_vertex_indices[i*3+2]);
}

//curvature is like angular defect, but of dihedral angles around a radius.
function get_curvatures(input_radii, failure_is_acceptable) {
	var curvature_array = new Float32Array([-TAU,-TAU,-TAU,-TAU,-TAU,-TAU,-TAU,-TAU,-TAU,-TAU,-TAU,-TAU]);
	for( var i = 0; i < 12; i++) {
		for( var j = 0; j < 12; j++) {
			if(polyhedron_edge_length[i][j] === 666 )
				continue;
			
			var k = get_third_corner(i,j,0); //doesn't matter if you get the clockwise or anti clockwise one
			
			var cos_gamma_ijk = get_cos_rule(polyhedron_edge_length[j][k],polyhedron_edge_length[i][j], polyhedron_edge_length[k][i]);
			var cos_rho_ij = get_cos_rule(input_radii[j], polyhedron_edge_length[i][j], input_radii[i]);
			var cos_rho_ik = get_cos_rule(input_radii[k], polyhedron_edge_length[i][k], input_radii[i]);
			var sin_rho_ij_TIMES_sin_rho_ik = Math.sqrt((1-cos_rho_ij*cos_rho_ij)*(1-cos_rho_ik*cos_rho_ik));

			var cos_omega_ijk = ( cos_gamma_ijk - cos_rho_ij * cos_rho_ik ) / sin_rho_ij_TIMES_sin_rho_ik;
			
			curvature_array[i] += Math.acos(cos_omega_ijk);
			
			if(!failure_is_acceptable && isNaN(Math.acos(cos_omega_ijk))){
				if(cos_gamma_ijk < -1 || 1 < cos_gamma_ijk){
						if( polyhedron_edge_length[j][k] > polyhedron_edge_length[i][j] + polyhedron_edge_length[k][i]
						 || polyhedron_edge_length[j][i] > polyhedron_edge_length[k][j] + polyhedron_edge_length[k][i]
						 || polyhedron_edge_length[i][k] > polyhedron_edge_length[k][j] + polyhedron_edge_length[j][i] ){
							console.log("triangle inequality violated");
							console.log(polyhedron_edge_length[j][k], polyhedron_edge_length[i][j], polyhedron_edge_length[k][i])
							console.log(i,j,k)
							print_ATVIs();
						}
				}
				if(cos_rho_ij < -1 || 1 < cos_rho_ij)
					console.log("cos_rho_ij")
				if(cos_rho_ik < -1 || 1 < cos_rho_ik){
					console.log(polyhedron_edge_length[i][k]);
					console.log("cos_rho_ik")
				}
				if(sin_rho_ij_TIMES_sin_rho_ik < -1 || 1 < sin_rho_ij_TIMES_sin_rho_ik)
					console.log("sin_rho_ij_TIMES_sin_rho_ik");
			}
		}
		if(isNaN(curvature_array[i])) {
			if(!failure_is_acceptable) 
				console.error("crazy curvature");
			return 666;
		}
		curvature_array[i] *= -1;
	}
	//currently the question is "what's giving us NaN curvatures?"
	return curvature_array;
}

function get_third_corner(corner1,corner2,clockwise){
	for(var i = 0; i<20; i++){
		for(var j = 0; j < 3; j++){
			if(!clockwise){
				if(	alexandrov_triangle_vertex_indices[i*3+(0+j)%3] === corner1 &&
					alexandrov_triangle_vertex_indices[i*3+(1+j)%3] === corner2 
				  ){
					if(	polyhedron_edge_length[corner1][corner2]===666 )
						console.log(1,2);
					if(	polyhedron_edge_length[corner1][alexandrov_triangle_vertex_indices[i*3+(2+j)%3]] === 666)
						console.log(1,3);
					if(	polyhedron_edge_length[alexandrov_triangle_vertex_indices[i*3+(2+j)%3]][corner2] ===666)
						console.log(3,2);
					return alexandrov_triangle_vertex_indices[i*3+(2+j)%3];
				}	
			}
			else {
				if(	alexandrov_triangle_vertex_indices[i*3+(0+j)%3] === corner2 &&
					alexandrov_triangle_vertex_indices[i*3+(1+j)%3] === corner1 
				  ){
					if(	polyhedron_edge_length[corner1][corner2]===666 )
						console.log(1,2);
					if(	polyhedron_edge_length[corner1][alexandrov_triangle_vertex_indices[i*3+(2+j)%3]] === 666)
						console.log(1,3);
					if(	polyhedron_edge_length[alexandrov_triangle_vertex_indices[i*3+(2+j)%3]][corner2] ===666)
						console.log(3,2);
					return alexandrov_triangle_vertex_indices[i*3+(2+j)%3];
				}
			}	
		}
	}
	console.error("couldn't find third corner",corner1,corner2);
	for(var i = 0; i<20; i++)
		console.log(alexandrov_triangle_vertex_indices[i*3+0],alexandrov_triangle_vertex_indices[i*3+1],alexandrov_triangle_vertex_indices[i*3+2]);
}

//we need to make this function (and the polyhedron dihedral angle) able to use either visible or virtual combinatorics.
function get_cos_tetrahedron_dihedral_angle_from_indices(i,j,use_first_corner_hit,input_radii, visible_combinatorics) {
	var k = 666;

	//we need that k that is clockwise of j, for some triangle
	if(!visible_combinatorics){
		k = get_third_corner(i,j,use_first_corner_hit); //you always call this function with clockwise and anticlockwise
	}
	else{
		if(use_first_corner_hit){ //doesn't matter which you get so long as you get both
			for(var a = 0; a < net_triangle_vertex_indices.length; a+=3){
				if( polyhedron_index( net_triangle_vertex_indices[ a ] ) === i && polyhedron_index( net_triangle_vertex_indices[a+1] ) === j)
					{k = polyhedron_index( net_triangle_vertex_indices[a+2] ); break;}
				if( polyhedron_index( net_triangle_vertex_indices[a+1] ) === i && polyhedron_index( net_triangle_vertex_indices[a+2] ) === j)
					{k = polyhedron_index( net_triangle_vertex_indices[ a ] ); break;}
				if( polyhedron_index( net_triangle_vertex_indices[a+2] ) === i && polyhedron_index( net_triangle_vertex_indices[ a ] ) === j)
					{k = polyhedron_index( net_triangle_vertex_indices[a+1] ); break;}
			}
		}
		else {
			for(var a = 0; a < net_triangle_vertex_indices.length; a+=3){
				if( polyhedron_index( net_triangle_vertex_indices[ a ] ) === j && polyhedron_index( net_triangle_vertex_indices[a+1] ) === i)
					{k = polyhedron_index( net_triangle_vertex_indices[a+2] ); break;}
				if( polyhedron_index( net_triangle_vertex_indices[a+1] ) === j && polyhedron_index( net_triangle_vertex_indices[a+2] ) === i)
					{k = polyhedron_index( net_triangle_vertex_indices[ a ] ); break;}
				if( polyhedron_index( net_triangle_vertex_indices[a+2] ) === j && polyhedron_index( net_triangle_vertex_indices[ a ] ) === i)
					{k = polyhedron_index( net_triangle_vertex_indices[a+1] ); break;}
			}
		}
	}
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

function get_polyhedron_dihedral_angle_from_indices(i,j, input_radii,visible_combinatorics){
	return Math.acos(get_cos_tetrahedron_dihedral_angle_from_indices(i,j,0, input_radii,visible_combinatorics) ) 
		 + Math.acos(get_cos_tetrahedron_dihedral_angle_from_indices(i,j,1, input_radii,visible_combinatorics) );
}

function quadrance(vector_values) {
	var result = 0;
	
	for( var i = 0; i < vector_values.length; i++)
		result += vector_values[i] * vector_values[i];
	
	return result;
}


function reset_net(){
	for(var i = 0; i< radii.length; i++)
		radii[i] = 100;
	for(var i = 0; i < polyhedron_edge_length.length; i++)
		for(var j = 0; j < polyhedron_edge_length[i].length; j++)
			polyhedron_edge_length[i][j] = 666;
	for(var i = 0; i< net_triangle_vertex_indices.length / 3; i++) {
		for(var j = 0; j < 3; j++){
			var a_index = polyhedron_index(net_triangle_vertex_indices[i*3 + j]);
			var b_index = polyhedron_index(net_triangle_vertex_indices[i*3 + (j+1)%3]);
			
			polyhedron_edge_length[a_index][b_index] = Math.sqrt( Square(flatnet_vertices.array[3*net_triangle_vertex_indices[i*3 + j]  ]-flatnet_vertices.array[3*net_triangle_vertex_indices[i*3 + (j+1)%3]  ])
																+ Square(flatnet_vertices.array[3*net_triangle_vertex_indices[i*3 + j]+1]-flatnet_vertices.array[3*net_triangle_vertex_indices[i*3 + (j+1)%3]+1]) );
			polyhedron_edge_length[b_index][a_index] = polyhedron_edge_length[a_index][b_index]; 
		}
	}
	for(var i = 0; i < net_triangle_vertex_indices.length; i++)
		alexandrov_triangle_vertex_indices[i] = polyhedron_index(net_triangle_vertex_indices[i]);
	
	//Create the delaunay triangulation
	
//	var S = Array(0);
//	var Markings = Array(polyhedron_edge_length.length);
//	for(var i = 0; i < Markings.length; i++){
//		Markings[i] = Array(Markings.length);
//		for(var j = 0; j < Markings[i].length; j++)
//			Markings[i][j] = 1;
//	}
//	for(var i = 0; i<polyhedron_edge_length.length; i++){
//		for(var j = i+1; j <polyhedron_edge_length.length; j++){
//			if(polyhedron_edge_length[i][j] !== 666)
//				S.push(Array(i,j));
//		}
//	}
//	
////	console.log("S: ")
////	for(var i = 0; i < S.length; i++)
////		console.log(S[i]);
//	var flips = 0;
//	while( S.length > 0 ){
//		var ouredge = S.pop();
//		Markings[ouredge[0]][ouredge[1]] = 0;
//		
//		var ourindices = get_diamond_indices(ouredge[0],ouredge[1]);
//		
//		var old_edgelen = polyhedron_edge_length[ourindices[0]][ourindices[1]];
//		var l_a = polyhedron_edge_length[ourindices[0]][ourindices[2]];
//		var l_b = polyhedron_edge_length[ourindices[1]][ourindices[2]];
//		var l_c = polyhedron_edge_length[ourindices[0]][ourindices[3]];
//		var l_d = polyhedron_edge_length[ourindices[1]][ourindices[3]];
//		
//		var angle2 = Math.acos( get_cos_rule(l_a, l_b, old_edgelen) );
//		var angle3 = Math.acos( get_cos_rule(l_c, l_d, old_edgelen) );
//		
//		if(angle2+angle3 > Math.PI){
//			flip(ourindices, l_a,l_b,l_c,l_d, old_edgelen);			
//			flips++;
//			
//			for(var i = 0; i<4; i++){
//				var index1 = ourindices[i];
//				var index2;
//				if(i < 2)
//					index2 = ourindices[i + 2];
//				else
//					index2 = ourindices[3 - i];
//				if(!Markings[index1][index2]){
//					Markings[index1][index2] = 1;
//					S.push(Array(index1,index2));
//				}
//			}
//		}
//	}
//	if(flips>0)
//		console.log("had " + flips + " flips");
}

function get_diamond_indices(topcorner,bottomcorner){
	var ourindices = Array(4);
	ourindices[0] = topcorner;
	ourindices[1] = bottomcorner;
	ourindices[2] = get_third_corner(topcorner,bottomcorner,0);
	ourindices[3] = get_third_corner(topcorner,bottomcorner,1); //it shouldn't matter which way around
	return ourindices;
}

function get_cos_of_summed_acoses(cos1,cos2){
	return cos1*cos2-Math.sqrt(1-cos1*cos1)*Math.sqrt(1-cos2*cos2);
}

//Get some numbers to test this with.
function flip(ourindices, l_a,l_b,l_c,l_d, old_edgelen){
	var violations = check_triangle_inequalities(0);
	
	var cosalpha = get_cos_of_summed_acoses(get_cos_rule(l_b,l_a,old_edgelen),get_cos_rule(l_d,l_c,old_edgelen) );
	var cosalpha2 = get_cos_of_summed_acoses(get_cos_rule(l_a,l_b,old_edgelen),get_cos_rule(l_c,l_d,old_edgelen) );
	
	var newlength = Math.sqrt( l_a*l_a + l_d*l_d - 2*l_b*l_c * cosalpha );
	var newlength2 =Math.sqrt( l_b*l_b + l_c*l_c - 2*l_a*l_d * cosalpha2 );
	console.log("compare", newlength, newlength2) //shouldn't these be the same?
	
	var experiment_length1 = Math.sqrt( l_b*l_b + l_d*l_d - 2*l_b*l_d * cosalpha );
	
	var cosbeta = get_cos_of_summed_acoses(get_cos_rule(l_a,l_b,old_edgelen),get_cos_rule(l_c,l_d,old_edgelen) );
	console.log(cosbeta, Math.cos(Math.acos(get_cos_rule(l_c,l_d,old_edgelen) )+Math.acos(get_cos_rule(l_a,l_b,old_edgelen) ) ) )
	
	console.log("tau?",Math.acos(get_cos_rule(old_edgelen,l_c,l_d) )+Math.acos(get_cos_rule(old_edgelen,l_a,l_b) )
			+Math.acos(cosalpha)+Math.acos(get_cos_rule(l_c,l_d,old_edgelen) )+Math.acos(get_cos_rule(l_a,l_b,old_edgelen) ))
	console.log(Math.acos(get_cos_rule(l_c,l_d,old_edgelen) )+Math.acos(get_cos_rule(l_d,l_c,old_edgelen) )+Math.acos(get_cos_rule(old_edgelen,l_c,l_d) ))
	console.log(Math.acos(get_cos_rule(l_a,l_b,old_edgelen) )+Math.acos(get_cos_rule(l_b,l_a,old_edgelen) )+Math.acos(get_cos_rule(old_edgelen,l_a,l_b) ))
	var experiment_length2 = Math.sqrt( l_c*l_c + l_a*l_a - 2*l_c*l_a * cosbeta );
	if(Math.abs(experiment_length1-experiment_length2) > 0.001) //it is possible that because of the cos/acosing, these two ARE different
		console.error("different lengths to swap to ", experiment_length1,experiment_length2, "newlength",newlength )
	
	console.log("lengths involved", l_a,l_b,l_c,l_d, old_edgelen);
	
	if(newlength > l_a+l_c )
		console.log("baa")
	if(newlength > l_d+l_b )
		console.log("bee");
	
	polyhedron_edge_length[ourindices[0]][ourindices[1]] = 666;
	polyhedron_edge_length[ourindices[1]][ourindices[0]] = 666;
	
	polyhedron_edge_length[ourindices[2]][ourindices[3]] = newlength;
	polyhedron_edge_length[ourindices[3]][ourindices[2]] = newlength;
	
	console.log("old triangle: ",ourindices[0],ourindices[2],ourindices[1]);
	console.log("old triangle: ",ourindices[0],ourindices[1],ourindices[3]);
	console.log("new triangle: ",ourindices[0],ourindices[2],ourindices[3]);
	console.log("new triangle: ",ourindices[2],ourindices[1],ourindices[3]);
	print_ATVIs();
	
	//our two old triangles will have been ourindices[0 then 1 then 2 ] and ourindices[0 then 3 then 1]
	//we want to change them to ourindices[0 then 3 then 2] and ourindices[2 then 3 then 1]
	
	var num_triangles_swapped = 0;
	for(var i = 0; i < 20; i++){
		for(var j = 0; j < 3; j++){
			if( alexandrov_triangle_vertex_indices[i*3+(j+0)%3] === ourindices[0] &&
				alexandrov_triangle_vertex_indices[i*3+(j+1)%3] === ourindices[1] &&
				alexandrov_triangle_vertex_indices[i*3+(j+2)%3] === ourindices[2] 
			 ){
				alexandrov_triangle_vertex_indices[i*3+(j+1)%3] = ourindices[3];
				num_triangles_swapped++;
			}
			else if( alexandrov_triangle_vertex_indices[i*3+(j+0)%3] === ourindices[0] &&
					alexandrov_triangle_vertex_indices[i*3+(j+1)%3] === ourindices[3] &&
					alexandrov_triangle_vertex_indices[i*3+(j+2)%3] === ourindices[1] 
			 ){
				alexandrov_triangle_vertex_indices[i*3+(j+0)%3] = ourindices[2];
				num_triangles_swapped++;
			}
		} 
	}
	if(num_triangles_swapped != 2)
		console.error("only found " + num_triangles_swapped + " triangles to swap");
	
	if(check_triangle_inequalities(1) > violations){
		console.log("triangle inequality NOW violated")
	}
}

function check_triangle_inequalities(print_violations){
	var num_violations = 0;
	
	for(var i = 0; i < 20; i++){
		var ind0 = alexandrov_triangle_vertex_indices[i*3+0];
		var ind1 = alexandrov_triangle_vertex_indices[i*3+1];
		var ind2 = alexandrov_triangle_vertex_indices[i*3+2];
		
		if( polyhedron_edge_length[ind0][ind1] > polyhedron_edge_length[ind1][ind2] + polyhedron_edge_length[ind2][ind0] ){
			num_violations++;
			if(print_violations)console.log(ind0,ind1,ind2)
		}
		if( polyhedron_edge_length[ind1][ind2] > polyhedron_edge_length[ind2][ind0] + polyhedron_edge_length[ind0][ind1] ){
			num_violations++;
			if(print_violations)console.log(ind0,ind1,ind2);
		}
		if( polyhedron_edge_length[ind2][ind0] > polyhedron_edge_length[ind0][ind1] + polyhedron_edge_length[ind1][ind2] ){
			num_violations++;
			if(print_violations)console.log(ind0,ind1,ind2)
		}
	}
	return num_violations;
}