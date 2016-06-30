function check_ATVIs_against_PELs(ATVIs, PELs){
	for(var i = 0; i < 20; i++){
		for(var j = 0; j < 3; j++){
			var index1 = ATVIs[i*3+j];
			var index2 = ATVIs[i*3+(j+1)%3];
			
			if(PELs[index1][index2] === 666 )
				console.error("DISAGREEMENT", index1,index2);
		}
	}
}

//Get some numbers to test this with.
function flip(ourindices){
	var old_edgelen = polyhedron_edge_length[ourindices[0]][ourindices[1]];
	var l_a = polyhedron_edge_length[ourindices[0]][ourindices[2]];
	var l_b = polyhedron_edge_length[ourindices[1]][ourindices[2]];
	var l_c = polyhedron_edge_length[ourindices[0]][ourindices[3]];
	var l_d = polyhedron_edge_length[ourindices[1]][ourindices[3]];
	
	var cosalpha  = get_cos_of_summed_acoses(get_cos_rule(l_b,l_a,old_edgelen),get_cos_rule(l_d,l_c,old_edgelen) );
	var newlength = Math.sqrt( l_a*l_a + l_c*l_c - 2*l_a*l_c * cosalpha );
	
	polyhedron_edge_length[ourindices[0]][ourindices[1]] = 666;
	polyhedron_edge_length[ourindices[1]][ourindices[0]] = 666;
	
	polyhedron_edge_length[ourindices[2]][ourindices[3]] = newlength;
	polyhedron_edge_length[ourindices[3]][ourindices[2]] = newlength;
	
	//want to change	ourindices[0 then 2 then 1 ] to	[0 then 2 then 3 ]
	//and 				ourindices[0 then 1 then 3 ] to [2 then 1 then 3]
	
	var num_triangles_swapped = 0;
	for(var i = 0; i < 20; i++){ //we got more to do in here?
		for(var j = 0; j < 3; j++){
			if( alexandrov_triangle_vertex_indices[i*3+(j+0)%3] === ourindices[0] &&
				alexandrov_triangle_vertex_indices[i*3+(j+1)%3] === ourindices[2] &&
				alexandrov_triangle_vertex_indices[i*3+(j+2)%3] === ourindices[1] 
			 ){
				alexandrov_triangle_vertex_indices[i*3+(j+2)%3] = ourindices[3];
				num_triangles_swapped++;
			}
			else
			if(	alexandrov_triangle_vertex_indices[i*3+(j+0)%3] === ourindices[0] &&
				alexandrov_triangle_vertex_indices[i*3+(j+1)%3] === ourindices[1] &&
				alexandrov_triangle_vertex_indices[i*3+(j+2)%3] === ourindices[3] 
			 ){
				alexandrov_triangle_vertex_indices[i*3+(j+0)%3] = ourindices[2];
				num_triangles_swapped++;
			}
		} 
	}
	
	//so for every pair of triangles, we check for crossings
//	for(var i = 0; i < 12; i++){
//		for(var j = 0; j < 12; j++){
//			if(polyhedron_edge_length[i][j] !== 666){
//				var crossindices = get_diamond_indices(i,j);
//				if(polyhedron_edge_length[crossindices[2] ] [ crossindices[3] ] !== 666 )
//					console.log("crossing!", crossindices); //expect these to be reported in pairs
//			}
//		}
//	}
	
//	if(num_triangles_swapped != 2){
//		console.log("tried to swap " + num_triangles_swapped + " triangles, should be 2");
//	}
	
	//crossing is the first problem to arise, this is canary #2
//	for(var i = 0; i < 20; i++){
//		for(var j = i+1; j < 20; j++){
//			if(	alexandrov_triangle_vertex_indices[i*3+0] === alexandrov_triangle_vertex_indices[j*3+0] ||
//				alexandrov_triangle_vertex_indices[i*3+0] === alexandrov_triangle_vertex_indices[j*3+1] ||
//				alexandrov_triangle_vertex_indices[i*3+0] === alexandrov_triangle_vertex_indices[j*3+2] ){
//				if(	alexandrov_triangle_vertex_indices[i*3+1] === alexandrov_triangle_vertex_indices[j*3+0] ||
//					alexandrov_triangle_vertex_indices[i*3+1] === alexandrov_triangle_vertex_indices[j*3+1] ||
//					alexandrov_triangle_vertex_indices[i*3+1] === alexandrov_triangle_vertex_indices[j*3+2] ){
//					if(	alexandrov_triangle_vertex_indices[i*3+2] === alexandrov_triangle_vertex_indices[j*3+0] ||
//						alexandrov_triangle_vertex_indices[i*3+2] === alexandrov_triangle_vertex_indices[j*3+1] ||
//						alexandrov_triangle_vertex_indices[i*3+2] === alexandrov_triangle_vertex_indices[j*3+2] )
//						console.log("duplicate triangle")
//					//the only way for this to make sense is if there was previously a "cross"?
//				}
//			}		
//		}
//	}
}

//	  0          0
//	 /|\        / \
//	3 | 2  ->  3---2
//	 \|/        \ /
//	  1          1
function get_diamond_indices(topcorner,bottomcorner){
	var ourindices = Array(4);
	ourindices[0] = topcorner;
	ourindices[1] = bottomcorner;
	ourindices[2] = get_third_corner(topcorner,bottomcorner,1);
	ourindices[3] = get_third_corner(topcorner,bottomcorner,0);
	return ourindices;
}

function get_third_corner(corner1,corner2,clockwise){
	for(var i = 0; i<20; i++){
		for(var j = 0; j < 3; j++){
			if(!clockwise){
				if(	alexandrov_triangle_vertex_indices[i*3+(0+j)%3] === corner1 &&
					alexandrov_triangle_vertex_indices[i*3+(1+j)%3] === corner2 
				  ){
					return alexandrov_triangle_vertex_indices[i*3+(2+j)%3];
				}	
			}
			else {
				if(	alexandrov_triangle_vertex_indices[i*3+(0+j)%3] === corner2 &&
					alexandrov_triangle_vertex_indices[i*3+(1+j)%3] === corner1 
				  ){
					return alexandrov_triangle_vertex_indices[i*3+(2+j)%3];
				}
			}	
		}
	}
	
	if(net_warnings)
	{
		console.error("couldn't find third corner",corner1,corner2);
		print_ATVIs();
	}
	
	crazy_flip = 1;
	return 0; //have to return something otherwise there'll be an error
}

function reset_net(vertices_buffer_array){
	for(var i = 0; i< radii.length; i++)
		radii[i] = 50;
	for(var i = 0; i < polyhedron_edge_length.length; i++)
		for(var j = 0; j < polyhedron_edge_length[i].length; j++)
			polyhedron_edge_length[i][j] = 666;
	for(var i = 0; i< net_triangle_vertex_indices.length / 3; i++) {
		for(var j = 0; j < 3; j++){
			var a_index = polyhedron_index(net_triangle_vertex_indices[i*3 + j]);
			var b_index = polyhedron_index(net_triangle_vertex_indices[i*3 + (j+1)%3]);
			
			polyhedron_edge_length[a_index][b_index] = Math.sqrt( Square(vertices_buffer_array[3*net_triangle_vertex_indices[i*3 + j]  ]-vertices_buffer_array[3*net_triangle_vertex_indices[i*3 + (j+1)%3]  ])
																+ Square(vertices_buffer_array[3*net_triangle_vertex_indices[i*3 + j]+1]-vertices_buffer_array[3*net_triangle_vertex_indices[i*3 + (j+1)%3]+1]) );
			polyhedron_edge_length[b_index][a_index] = polyhedron_edge_length[a_index][b_index]; 
		}
	}
	for(var i = 0; i < net_triangle_vertex_indices.length; i++)
		alexandrov_triangle_vertex_indices[i] = polyhedron_index(net_triangle_vertex_indices[i]);
}

function delaunay_triangulate() {
	var S = Array(0);
	var Markings = Array(polyhedron_edge_length.length);
	for(var i = 0; i < polyhedron_edge_length.length; i++)
		Markings[i] = Array(polyhedron_edge_length.length);
	for(var i = 0; i<polyhedron_edge_length.length; i++){
		for(var j = i+1; j <polyhedron_edge_length.length; j++){
			if(polyhedron_edge_length[i][j] !== 666){
				S.push(Array(i,j));
				Markings[i][j] = 1; //i always less than j
			}
		}
	}
	
	var flips = 0;
	while( S.length > 0 ){
		var ouredge = S.pop();
		Markings[ouredge[0]][ouredge[1]] = 0;
		
		var ourindices = get_diamond_indices(ouredge[0],ouredge[1]);
		
		var old_edgelen = polyhedron_edge_length[ourindices[0]][ourindices[1]];
		var l_a = polyhedron_edge_length[ourindices[0]][ourindices[2]];
		var l_b = polyhedron_edge_length[ourindices[1]][ourindices[2]];
		var l_c = polyhedron_edge_length[ourindices[0]][ourindices[3]];
		var l_d = polyhedron_edge_length[ourindices[1]][ourindices[3]];
		
		var angle2 = Math.acos( get_cos_rule(l_a, l_b, old_edgelen) );
		var angle3 = Math.acos( get_cos_rule(l_c, l_d, old_edgelen) );
		
		if( angle2 + angle3 > Math.PI){
			flip(ourindices);			
			flips++;
			
			for(var i = 0; i<4; i++){
				var index1 = i%2;
				var index2;
				if(i < 2)
					index2 = 2;
				else
					index2 = 3;
				
				if(!Markings[index1][index2]){
					Markings[ourindices[index1]][ourindices[index2]] = 1;
					S.push(Array(ourindices[index1],ourindices[index2]));
				}
			}
		}
	}
	
	if( flips > 0)
		return 1;
	else return 0;
}
//TODO one thing to do is to change all the NTVIs to ATVIs in alexandrov.js

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

function print_ATVIs(){
	for(var i = 0; i <20; i++)
		console.log(alexandrov_triangle_vertex_indices[i*3+0],
					alexandrov_triangle_vertex_indices[i*3+1],
					alexandrov_triangle_vertex_indices[i*3+2]);
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

function get_cos_of_summed_acoses(cos1,cos2){
	return cos1*cos2-Math.sqrt(1-cos1*cos1)*Math.sqrt(1-cos2*cos2);
}