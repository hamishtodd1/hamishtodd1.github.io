function correct_defects() {
	for( var corner = 0; corner < 22; corner++) {
		var angular_defect = 0;
		for( var triangle = 0; triangle < 20; triangle++) {
			for(var triangle_corner = 0; triangle_corner < 3; triangle_corner++) {
				actual_index = net_triangle_vertex_indices[ triangle * 3 + triangle_corner];
				if( vertex_identifications[corner][actual_index] !== 0) {
					angular_defect += corner_angle_from_indices(triangle, actual_index);
				}
			}
		}
		
		var wiggleroom = 0.00001;
		if( Math.abs( angular_defect - TAU * 5/6 ) > wiggleroom ) {
			var error = angular_defect - TAU * 5/6;
			if(net_warnings) console.log( "Warning: defect at net vertex " + corner + " off by " + error);
			return 0;
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
				console.log("angle " + a_index + "-" + b_index + "-" + c_index + " off by " + discrepancy_percentage + "%" );			
				all_ok = false;
			}
				
			if( comparison_done[a_index][b_index] ) continue;
				
			var distance_poly = a_poly.distanceTo(b_poly);
			var distance_net = a_net.distanceTo(b_net);
			
			discrepancy_percentage = Math.abs(distance_poly - distance_net) / distance_net * 100;
			discrepancy_percentage = Math.floor(discrepancy_percentage * 10) / 10;
			var wiggleroom = 1;
			if( discrepancy_percentage > wiggleroom ) {
				console.log("edge " + a_index + "->" + b_index + " off by " + discrepancy_percentage +"%" );
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