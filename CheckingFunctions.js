function check_triangle_inversion(){
	for(var i = 0; i < 20; i++){
		var cornerAindex = net_triangle_vertex_indices[ i * 3 + 0 ];
		var cornerBindex = net_triangle_vertex_indices[ i * 3 + 1 ];
		var cornerCindex = net_triangle_vertex_indices[ i * 3 + 2 ];
		
		if( point_to_the_right_of_line(	
				flatnet_vertices.array[ 0 + 3 * cornerAindex ],flatnet_vertices.array[ 1 + 3 * cornerAindex ],
				flatnet_vertices.array[ 0 + 3 * cornerBindex ],flatnet_vertices.array[ 1 + 3 * cornerBindex ],
				flatnet_vertices.array[ 0 + 3 * cornerCindex ],flatnet_vertices.array[ 1 + 3 * cornerCindex ]
			)){
			console.log("triangle inverted");
			return 0;
		}
	}
	
	return 1;
}

function check_defects() {
	var wiggleroom = 0.00001;
	for( var corner = 0; corner < 22; corner++) {
		var corners_added = 0;
		var angular_defect = 0;
		for( var triangle = 0; triangle < 20; triangle++) {
			for(var triangle_corner = 0; triangle_corner < 3; triangle_corner++) {
				actual_index = net_triangle_vertex_indices[ triangle * 3 + triangle_corner];
				if( vertex_identifications[corner][actual_index] !== 0) {
					var corner_angle = corner_angle_from_indices(triangle, actual_index);
					if(corner_angle < 0.0006){
						if(net_warnings)console.log("Error: Small angle");
						return 0;
					}
					angular_defect += corner_angle_from_indices(triangle, actual_index);
					corners_added++;
				}
			}
		}
		
		if( Math.abs( angular_defect - TAU * 5/6 ) > wiggleroom ) {
			var error = angular_defect - TAU * 5/6;
			if(net_warnings)console.log( "Error: defect off by " + error);
			return 0;
		}
	}
	return 1;
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
			console.error("request was made for a triangle-angle at a corner that the triangle does not have");
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

function check_edge_lengths(){
	for(var i = 0; i < 20; i++){
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
			if(length_difference > 0.01){
				if(net_warnings)console.log("Error: edge length discrepency");
//				console.log(length_difference);
				return 0;
			}
		}
	}
	return 1;
}

function compare_polyhedron_with_net() {	
	var all_ok = true;
	
	var comparison_done = Array(22);
	for(var i = 0; i < 22; i++) {
		comparison_done[i] = Array(22);
		for(var j = 0; j < 22; j++)
			comparison_done[i][j] = false;
	}
	
	for( var i = 0; i < 20; i++) { //each side of each triangle
		for( var j = 0; j < 3; j++) {
			var a_index = net_triangle_vertex_indices[i*3 + j];
			var b_index = net_triangle_vertex_indices[i*3 + (j+1)%3];
			var c_index = net_triangle_vertex_indices[i*3 + (j+2)%3];
			
			var a_net = new THREE.Vector3(
				flatnet_vertices.array[a_index * 3 + 0],
				flatnet_vertices.array[a_index * 3 + 1],
				flatnet_vertices.array[a_index * 3 + 2] );
			var b_net = new THREE.Vector3(
				flatnet_vertices.array[b_index * 3 + 0],
				flatnet_vertices.array[b_index * 3 + 1],
				flatnet_vertices.array[b_index * 3 + 2] );
			var c_net = new THREE.Vector3(
				flatnet_vertices.array[c_index * 3 + 0],
				flatnet_vertices.array[c_index * 3 + 1],
				flatnet_vertices.array[c_index * 3 + 2] );
				
			var a_poly = new THREE.Vector3(
				polyhedron_vertices.array[a_index * 3 + 0],
				polyhedron_vertices.array[a_index * 3 + 1],
				polyhedron_vertices.array[a_index * 3 + 2] );
			var b_poly = new THREE.Vector3(
				polyhedron_vertices.array[b_index * 3 + 0],
				polyhedron_vertices.array[b_index * 3 + 1],
				polyhedron_vertices.array[b_index * 3 + 2] );
			var c_poly = new THREE.Vector3(
				polyhedron_vertices.array[c_index * 3 + 0],
				polyhedron_vertices.array[c_index * 3 + 1],
				polyhedron_vertices.array[c_index * 3 + 2] );
				
			var side1_net = new THREE.Vector3();
			var side2_net = new THREE.Vector3();
			var side1_poly = new THREE.Vector3();
			var side2_poly = new THREE.Vector3();
			side1_net.subVectors(a_net, b_net);
			side2_net.subVectors(c_net, b_net);
			side1_poly.subVectors(a_poly, b_poly);
			side2_poly.subVectors(c_poly, b_poly);
			
			var angle_net = side1_net.angleTo(side2_net);
			var angle_poly = side1_poly.angleTo(side2_poly);
			var discrepancy_percentage = Math.abs(angle_poly - angle_net) / angle_net * 100;
			discrepancy_percentage = Math.floor(discrepancy_percentage * 10) / 10;
			var wiggleroom = 1;
			if( discrepancy_percentage > wiggleroom ) {
				if(net_warnings)console.log("angle " + a_index + "-" + b_index + "-" + c_index + " off by " + discrepancy_percentage + "%" );			
				all_ok = false;
			}
				
			if( comparison_done[a_index][b_index] ) continue;
				
			var distance_poly = a_poly.distanceTo(b_poly);
			var distance_net = a_net.distanceTo(b_net);
			
			discrepancy_percentage = Math.abs(distance_poly - distance_net) / distance_net * 100;
			discrepancy_percentage = Math.floor(discrepancy_percentage * 10) / 10;
			var wiggleroom = 1;
			if( discrepancy_percentage > wiggleroom ) {
				if(net_warnings)console.log("edge " + a_index + "->" + b_index + " off by " + discrepancy_percentage +"%" );
				all_ok = false;
			}
			
			for(var k = 0; k < 22; k++) {
				if( vertex_identifications[a_index][k] === 0 )
					continue;
				for(var l = 0; l < 22; l++) {
					if( vertex_identifications[b_index][l] === 0 )
						continue;
					
					comparison_done[k][l] = true;
					comparison_done[l][k] = true;
				}
			}
		}
	}
	
	if(all_ok) return true;
	else return false;
}