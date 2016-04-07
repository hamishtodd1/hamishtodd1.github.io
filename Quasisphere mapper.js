function Map_To_Quasisphere() {
	var lowest_unused_vertex = 0;
	
	var axis = new THREE.Vector3(0,0,-1);
	var left_triangle_cutout_vector = new THREE.Vector3(cutout_vector1.x, cutout_vector1.y, 0);
	left_triangle_cutout_vector.applyAxisAngle(z_central_axis, -TAU/5);
	
	var right_triangle_cutout_vector = new THREE.Vector3(cutout_vector0.x, cutout_vector0.y, 0);
	right_triangle_cutout_vector.applyAxisAngle(z_central_axis, TAU/5);
	
	//TODO round off errors may mean things on the triangle edge are not in the triangle
	//TODO seriously, at least the top right might be that
	for( var i = 0; i < quasilattice_default_vertices.length; i++ ) {
		if( !point_in_inflated_triangle(	quasilattice_default_vertices[i].x, quasilattice_default_vertices[i].y,
				0, 0, cutout_vector0.x, cutout_vector0.y, cutout_vector1.x, cutout_vector1.y, 
				true) ) {
			if(	(stable_point_of_meshes_currently_in_scene === 4 && i === 6) ||
				(stable_point_of_meshes_currently_in_scene === 5 && i === 6)
			  ){/*this is an exception, we just like this vertex*/}
			else
				continue;
		}
		
		quasicutout_intermediate_vertices[lowest_unused_vertex].copy(quasilattice_default_vertices[i]);
		quasicutout_intermediate_vertices[lowest_unused_vertex].applyAxisAngle(z_central_axis,-TAU/5); //rotates you to the left
		quasicutouts_vertices_components[lowest_unused_vertex][0] = quasicutout_intermediate_vertices[lowest_unused_vertex].x * quasi_shear_matrix[0] + quasicutout_intermediate_vertices[lowest_unused_vertex].y * quasi_shear_matrix[1];
		quasicutouts_vertices_components[lowest_unused_vertex][1] = quasicutout_intermediate_vertices[lowest_unused_vertex].x * quasi_shear_matrix[2] + quasicutout_intermediate_vertices[lowest_unused_vertex].y * quasi_shear_matrix[3];
		lowest_unused_vertex++;
		mirror_point_along_base(quasicutout_intermediate_vertices[lowest_unused_vertex-1], cutout_vector1, left_triangle_cutout_vector,lowest_unused_vertex);
		lowest_unused_vertex++;
		
		quasicutout_intermediate_vertices[lowest_unused_vertex].copy(quasilattice_default_vertices[i]);
		quasicutouts_vertices_components[lowest_unused_vertex][0] = quasicutout_intermediate_vertices[lowest_unused_vertex].x * quasi_shear_matrix[0] + quasicutout_intermediate_vertices[lowest_unused_vertex].y * quasi_shear_matrix[1];
		quasicutouts_vertices_components[lowest_unused_vertex][1] = quasicutout_intermediate_vertices[lowest_unused_vertex].x * quasi_shear_matrix[2] + quasicutout_intermediate_vertices[lowest_unused_vertex].y * quasi_shear_matrix[3];
		lowest_unused_vertex++;
		mirror_point_along_base(quasicutout_intermediate_vertices[lowest_unused_vertex-1], cutout_vector0, cutout_vector1,lowest_unused_vertex);
		lowest_unused_vertex++;
		
		quasicutout_intermediate_vertices[lowest_unused_vertex].copy(quasilattice_default_vertices[i]);
		quasicutout_intermediate_vertices[lowest_unused_vertex].applyAxisAngle(z_central_axis,TAU/5); //rotates you to the right
		quasicutouts_vertices_components[lowest_unused_vertex][0] = quasicutout_intermediate_vertices[lowest_unused_vertex].x * quasi_shear_matrix[0] + quasicutout_intermediate_vertices[lowest_unused_vertex].y * quasi_shear_matrix[1];
		quasicutouts_vertices_components[lowest_unused_vertex][1] = quasicutout_intermediate_vertices[lowest_unused_vertex].x * quasi_shear_matrix[2] + quasicutout_intermediate_vertices[lowest_unused_vertex].y * quasi_shear_matrix[3];
		lowest_unused_vertex++;
		mirror_point_along_base(quasicutout_intermediate_vertices[lowest_unused_vertex-1], right_triangle_cutout_vector, cutout_vector0,lowest_unused_vertex);
		lowest_unused_vertex++;
	}
	
	var lowest_unused_edgepair = 0;
	
	var index_index_triangle_triplets = Array();
	
	var left_triangle_mirrored_top = new THREE.Vector3();
	left_triangle_mirrored_top.addVectors(cutout_vector1, left_triangle_cutout_vector);
	var right_triangle_mirrored_top = new THREE.Vector3();
	right_triangle_mirrored_top.addVectors(right_triangle_cutout_vector, cutout_vector0);
	var center_triangle_mirrored_top = new THREE.Vector3();
	center_triangle_mirrored_top.addVectors(cutout_vector1, cutout_vector0);
	
	var interior_wiggleroom = 0.000000000000003; //...00018 is an important minimum!
	var num_that_got_through = 0;
	for( var i = 0; i < lowest_unused_vertex; i++) {
		//TODO so should we have inflation everywhere?
		if( !point_in_inflated_triangle( quasicutout_intermediate_vertices[i].x, quasicutout_intermediate_vertices[i].y,
				0, 0, cutout_vector0.x, cutout_vector0.y, cutout_vector1.x, cutout_vector1.y, 
				true) )
			continue;
		num_that_got_through++;
		
		for( var j = 0; j < lowest_unused_vertex; j++) {
			var edgelength_minus_1 = quasicutout_intermediate_vertices[i].distanceTo(quasicutout_intermediate_vertices[j]) - 1;
			if( Math.abs( edgelength_minus_1 ) < interior_wiggleroom )
			{
				var inrighttriangle = point_in_inflated_triangle(	quasicutout_intermediate_vertices[j].x, quasicutout_intermediate_vertices[j].y,
						0, 0, right_triangle_cutout_vector.x, right_triangle_cutout_vector.y, cutout_vector0.x, cutout_vector0.y, 
						true);
				var inactualtriangle = point_in_inflated_triangle(	quasicutout_intermediate_vertices[j].x, quasicutout_intermediate_vertices[j].y,
						0, 0, cutout_vector0.x, cutout_vector0.y, cutout_vector1.x, cutout_vector1.y, 
						true);
				var inlefttriangle =  point_in_inflated_triangle(	quasicutout_intermediate_vertices[j].x, quasicutout_intermediate_vertices[j].y,
						0, 0, cutout_vector1.x, cutout_vector1.y, left_triangle_cutout_vector.x, left_triangle_cutout_vector.y, 
						true);
				
				if( inactualtriangle || inlefttriangle || inrighttriangle ) {
					quasicutout_line_pairs[ lowest_unused_edgepair*2 ] = i;
					quasicutout_line_pairs[lowest_unused_edgepair*2+1] = j;
					lowest_unused_edgepair++;
				}
				else{
					var mytriangle = ((j%6)-1)/2;
					if((point_in_triangle(	quasicutout_intermediate_vertices[j].x, quasicutout_intermediate_vertices[j].y,
						cutout_vector1.x, cutout_vector1.y, left_triangle_mirrored_top.x, left_triangle_mirrored_top.y, left_triangle_cutout_vector.x, left_triangle_cutout_vector.y, 
						true) && mytriangle == 0 )
					 ||(point_in_triangle(	quasicutout_intermediate_vertices[j].x, quasicutout_intermediate_vertices[j].y,
						cutout_vector0.x, cutout_vector0.y, center_triangle_mirrored_top.x, center_triangle_mirrored_top.y, cutout_vector1.x, cutout_vector1.y, 
						true) && mytriangle == 1 )
					 ||(point_in_triangle(	quasicutout_intermediate_vertices[j].x, quasicutout_intermediate_vertices[j].y,
						right_triangle_cutout_vector.x, right_triangle_cutout_vector.y, right_triangle_mirrored_top.x, right_triangle_mirrored_top.y, cutout_vector0.x, cutout_vector0.y, 
						true) && mytriangle == 2 )
					   ) {
						var j_equivalent = j-j%6+2;
						index_index_triangle_triplets.push(Array(i,j_equivalent,mytriangle));
						//TODO you don't really want ones on the very edge like on HPV, gives lots of nasty crossing lines when it's open
						//deflating the above by a negative amount gets rid of some but not all 
					}
				}
			}
		}
	}
	for(var i = lowest_unused_edgepair*2; i < quasicutout_line_pairs.length; i++)
		quasicutout_line_pairs[i] = 0;
	
	//Speedup opportunity: we could do a pass of "check there aren't duplicate pairs, or unconnected points. And maybe not interior ones with only one edge attached either"
	
	var ourcenter_veclength = 0.5 * Math.tan(Math.atan(PHI) + dodeca_faceflatness*(TAU/4 - Math.atan(PHI))) / Math.tan(TAU/10);
	var basis_vectors = Array(dodeca_triangle_vertex_indices.length);
	var ourcenters = Array(dodeca_triangle_vertex_indices.length);
	var radius;
	
	for( var i = 0; i < dodeca_triangle_vertex_indices.length; i++) {
		var rightindex = dodeca_triangle_vertex_indices[i][0];
		var leftindex = dodeca_triangle_vertex_indices[i][1]; 
		var topindex = dodeca_triangle_vertex_indices[i][2];
		
		basis_vectors[i] = Array(3);
		basis_vectors[i][0] = new THREE.Vector3(
			dodeca_vertices_numbers[rightindex*3+0] - dodeca_vertices_numbers[topindex*3+0],
			dodeca_vertices_numbers[rightindex*3+1] - dodeca_vertices_numbers[topindex*3+1],
			dodeca_vertices_numbers[rightindex*3+2] - dodeca_vertices_numbers[topindex*3+2] );
		basis_vectors[i][1] = new THREE.Vector3(
			dodeca_vertices_numbers[leftindex*3+0] - dodeca_vertices_numbers[topindex*3+0],
			dodeca_vertices_numbers[leftindex*3+1] - dodeca_vertices_numbers[topindex*3+1],
			dodeca_vertices_numbers[leftindex*3+2] - dodeca_vertices_numbers[topindex*3+2] );
		basis_vectors[i][2] = new THREE.Vector3( //the one that gets them onto the face
			dodeca_vertices_numbers[topindex*3+0],
			dodeca_vertices_numbers[topindex*3+1],
			dodeca_vertices_numbers[topindex*3+2]);
		
		var downward_vector = basis_vectors[i][0].clone();
		downward_vector.cross(basis_vectors[i][1]);
		downward_vector.normalize();
		ourcenters[i] = downward_vector.clone();		
		ourcenters[i].multiplyScalar(ourcenter_veclength);
		ourcenters[i].add(basis_vectors[i][2]);
		if(i===0) radius = Math.sqrt(basis_vectors[i][0].lengthSq() + ourcenter_veclength * ourcenter_veclength );
	}
	
	for(var i = 0; i < quasicutouts.length; i++){
		for( var j = 0; j < quasicutouts[i].geometry.attributes.position.array.length; j++)
			quasicutouts[i].geometry.attributes.position.array[j] = 0;
		
		for( var vertex_index = 0; vertex_index < lowest_unused_vertex; vertex_index++) {
			var ourvertex;
			if( vertex_index % 2 === 1 && i < nearby_quasicutouts.length){
				if(nearby_quasicutouts[i][((vertex_index % 6)-1)/2] === 666)
					ourvertex = get_vertex_position(quasicutouts_vertices_components[vertex_index],basis_vectors[i],ourcenters[i],radius);
				else
					ourvertex = get_vertex_position(
						quasicutouts_vertices_components[vertex_index - 1],
						basis_vectors[nearby_quasicutouts[i][((vertex_index % 6)-1)/2]],
						ourcenters[   nearby_quasicutouts[i][((vertex_index % 6)-1)/2]],radius);
			}
			else
				ourvertex = get_vertex_position(quasicutouts_vertices_components[vertex_index],basis_vectors[i],ourcenters[i],radius);
			
			quasicutouts[i].geometry.attributes.position.array[vertex_index*3+0] = ourvertex.x;
			quasicutouts[i].geometry.attributes.position.array[vertex_index*3+1] = ourvertex.y;
			quasicutouts[i].geometry.attributes.position.array[vertex_index*3+2] = ourvertex.z;
		}
		
		quasicutouts[i].geometry.attributes.position.needsUpdate = true;
		quasicutouts[i].geometry.index.needsUpdate = true;
	}
	
	if(stable_point_of_meshes_currently_in_scene !== 666){
		for(var i = 0; i < quasicutouts.length; i++){
			for(var j = 0; j < quasicutouts[i].geometry.attributes.position.array.length / 3; j++){
				quasicutout_meshes[stable_point_of_meshes_currently_in_scene][i].geometry.vertices[j].x = quasicutouts[i].geometry.attributes.position.array[j*3+0];
				quasicutout_meshes[stable_point_of_meshes_currently_in_scene][i].geometry.vertices[j].y = quasicutouts[i].geometry.attributes.position.array[j*3+1];
				quasicutout_meshes[stable_point_of_meshes_currently_in_scene][i].geometry.vertices[j].z = quasicutouts[i].geometry.attributes.position.array[j*3+2];
			}
			quasicutout_meshes[stable_point_of_meshes_currently_in_scene][i].geometry.verticesNeedUpdate = true;
		}
	}
	
	var lowest_unused_quasicutout_mesh_vertex = quasicutout_meshes[stable_point_of_meshes_currently_in_scene][0].geometry.vertices.length - NUM_QS_VERTICES_FOR_EDGES;
	
//	var EdgesToBeAdded = Array(); //two vertex indices and a triangle index per edge
//	var NullTriangles = Array();
//	var edgeradius = 0.1;
//	
//	for(var i = 0; i < quasicutout_meshes[stable_point_of_meshes_currently_in_scene][0].geometry.faces.length; i++){
//		var ourfaceindices = new Uint16Array([
//		    quasicutout_meshes[stable_point_of_meshes_currently_in_scene][0].geometry.faces[i].a,
//		    quasicutout_meshes[stable_point_of_meshes_currently_in_scene][0].geometry.faces[i].b,
//		    quasicutout_meshes[stable_point_of_meshes_currently_in_scene][0].geometry.faces[i].c]); //replace ourfaceindices with all that if you want
//		
//		if(ourfaceindices[0] === 0 && ourfaceindices[1] === 0 && ourfaceindices[2] === 0)
//			NullTriangles.push(i);
//		else {
//			for(var j = 0; j < 3; j++){
//				var v1 = ourfaceindices[j];
//				var v2 = ourfaceindices[( j+1 ) % 3];
//				
//				var foundpartner = 0;
//				
//				//get the other shape that posesses this edge
//				for(var k = 0; k < EdgesToBeAdded.length / 3; k++){
//					if( (v1 === EdgesToBeAdded[k*2+0] && v2 === EdgesToBeAdded[k*2+1])
//					 || (v2 === EdgesToBeAdded[k*2+0] && v1 === EdgesToBeAdded[k*2+1]) ){
//						if(!triangle_in_same_shape(i, EdgesToBeAdded[k*2+2] ) ) {
//							var startingvertex,endingvertex;
//							if( v1 % 2 + v2 % 2 !== 2 ){
//								if( v1 % 2 === 0 && v2 % 2 === 0 ){
//									startingvertex = quasicutout_meshes[stable_point_of_meshes_currently_in_scene][0].geometry.vertices[v1];
//									endingvertex = quasicutout_meshes[stable_point_of_meshes_currently_in_scene][0].geometry.vertices[v2];
//								}
//								else {
//									var startingvertexindex;
//									if( v1 % 2 === 1){
//										startingvertexindex = v2;
//										endingvertexindex = v1;
//									}
//									else {
//										startingvertexindex = v1;
//										endingvertexindex = v2;
//									}
//									
//									startingvertex=quasicutout_meshes[stable_point_of_meshes_currently_in_scene][0].geometry.vertices[startingvertexindex];
//									endingvertex = quasicutout_meshes[stable_point_of_meshes_currently_in_scene][0].geometry.vertices[endingvertexindex];
//									
//									endingvertex.lerp(startingvertex, dodeca_faceflatness);
//								}
//								
//								var ourpeak = new THREE.Vector3();
//								ourpeak.addVectors(startingvertex,endingvertex);
//								ourpeak.setLength(edgeradius);
//								
//								var StartToEndNorm = endingvertex.clone();
//								StartToEndNorm.sub(startingvertex);
//								StartToEndNorm.normalize();
//								
//								ourpeak.applyAxisAngle(StartToEndNorm, -TAU/3); //speedup opportunity, be a bit smarter. Also this might be the wrong direction
//								for( var c = 0; c < 3; c++) {
//									//need to work out which vertices
//									quasicutout_meshes[stable_point_of_meshes_currently_in_scene][0].geometry.vertices[lowest_unused_quasicutout_mesh_vertex].copy(startingvertex);
//									quasicutout_meshes[stable_point_of_meshes_currently_in_scene][0].geometry.vertices[lowest_unused_quasicutout_mesh_vertex].add(ourpeak);
//									lowest_unused_quasicutout_mesh_vertex++;
//									
//									quasicutout_meshes[stable_point_of_meshes_currently_in_scene][0].geometry.vertices[lowest_unused_quasicutout_mesh_vertex].copy(endingvertex);
//									quasicutout_meshes[stable_point_of_meshes_currently_in_scene][0].geometry.vertices[lowest_unused_quasicutout_mesh_vertex].add(ourpeak);
//									lowest_unused_quasicutout_mesh_vertex++;
//									ourpeak.applyAxisAngle(StartToEndNorm, TAU/3);
//								}
//							}
//						}
//						
//						EdgesToBeAdded.splice(k*2,3);
//						
//						foundpartner = 1;
//						break; //we found the shape sharing edge
//					}
//				}
//				
//				//never found the shape sharing edge, this is either our first time on the edge or it's our "outline"
//				if(foundpartner === 0){
//					EdgesToBeAdded.push(v1);
//					EdgesToBeAdded.push(v2);
//					EdgesToBeAdded.push(i);
//				}
////				console.log(EdgesToBeAdded.length);
//			}
//		}
//	}
	
//	for(var i = 0; i < EdgesToBeAdded.length / 3; i++){
//		if(EdgesToBeAdded[i*3+2] === 0 )
//			continue; //central pentagon
//		
//		var shape_cut = 0;
//		
//		for( var j = 0; j < NullTriangles.length; j++){
//	    	if( triangle_in_same_shape(NullTriangles[j], EdgesToBeAdded[i*3+2]) ){
//	    		shape_cut = 1;
//	    		
//	    		break; //the shape we're in has been cut, so at least ONE of the sides of this triangle should NOT get an edge, therefore let's not give it any 
//		    	//Though it may still be the case that THIS side should =( will probably need to work out which.
//	    		//But there are situations in which you should hold back on the line drawing, such as the pointed hexagon 
//	    	}
//		}
//	      
//    	if( shape_cut === 0 )
//    		new_vertices_in_quasicutout += 6;
//      		//So this shape IS completed within the quasicutout - so we DEFINITELY SHOULD draw a growing line. There's other situations for this too though
//    		//unless it's that pointy hexagon for example :/ eg we are probably going to have an array. Not a big deal
//	}
	
//	for(var i = lowest_unused_quasicutout_mesh_vertex; i < quasicutout_meshes[stable_point_of_meshes_currently_in_scene][0].geometry.vertices.length; i++){
//		quasicutout_meshes[stable_point_of_meshes_currently_in_scene][0].geometry.vertices[i].set(0,0,0);
//	}
	
	//the prism_triangle_indices thing is easy, you just need to put a load into every quasicutout mesh.
	
	/* Number of points needed in quasicutout_meshes?
	 * You want to use put_unbased_triangularprism_in_buffer and prism_triangle_indices
	 * 
	 * We have arrays: EdgesToBeAdded and NullTriangles
	 * So we have a for loop going through the triangles in a mesh.
	 *   if all three indices are 0, put the triangle's index in NullTriangles
	 *   else, go through each vertex pair on that triangle
	 *     For each, check if it's in EdgesToBeAdded already
	 *       If not, add it: index, index, then triangle index
	 *       If so, check if it is in the same shape as this triangle
	 *         If so, they're one shape, so don't add this edge (still maybe though?)
	 *         If not, check whether either of the indices are odd
	 *           If so, we're drawing a growing edge (a line going from the even-numbered one partway to the odd-numbered. 1-faceflatness is the partway)
	 *           If not, regular edge.
	 *           There may be other cases where we don't draw an edge at all, for example an edge that sits directly on the two-fold axis will have two growers this way.
	 *       Then remove that edge from the array
	 *       
	 * All non-duplicate edges, i.e. what's left in the array...
	 * We're not sure if we want an edge on them, because it may or may not be a shape that is completed by its opposite partner
	 * May need to work it out offline. Start by assuming that they don't need ANY extra, but this probably won't work
	 * 
	 * One thing you could do would be look at the category of shape and if it's an incomplete category (i.e. there's half a thin rhomb) don't touch it, otherwise do
	 *   If you have that drawing lines on the non-ordinary shapes, you could easily disable them by pretend-drawing an extra triangle to "finish" that shape
	 * 
	 * 
	 * The conflict: 
	 *   want like shapes to be like colors
	 *	 want shapes to not change color when mouse is held down (could easily hide more of them though)
	 *   and want neighbours to be different colors (tho not that much)
	 * 
	 */
}

function triangle_in_same_shape(triangle, othertriangle){
	if( 9 <= triangle && triangle <= 13 &&
		9 <= othertriangle && othertriangle <= 13 && 
		othertriangle != triangle )
		return 1;
	
	var partnerindex;
	
	if(triangle < 9 ){
		if(triangle %2 === 1)
			partnerindex = triangle + 1;
		else
			partnerindex = triangle - 1;
	}
	else if( triangle > 13){
		if(triangle % 2 === 0)
			partnerindex = triangle + 1;
		else
			partnerindex = triangle - 1;
	}
	
	if(othertriangle === partnerindex)
		return 1;
	
	return 0;
}

function get_vertex_position(local_vertices_components,basis_vectors,ourcenter,radius){
	var ourvertex = new THREE.Vector3();
	
	for( var component = 0; component < basis_vectors.length; component++) {
		ourvertex.x += local_vertices_components[component] * basis_vectors[component].x;
		ourvertex.y += local_vertices_components[component] * basis_vectors[component].y;
		ourvertex.z += local_vertices_components[component] * basis_vectors[component].z;
	}
	
	//spherically project. TODO ~30-fold opportunity, store lengths or something?
	if( dodeca_faceflatness != 1 ) {
		ourvertex.sub(ourcenter);
		
		var radius_ratio;
		var max_lengthening = radius / ourvertex.length(); //this is how much you would lengthen it by if surface was closed
		radius_ratio = 1 - max_lengthening;
		radius_ratio *= dodeca_faceflatness;
		radius_ratio += max_lengthening;
		
		ourvertex.multiplyScalar(radius_ratio);
		ourvertex.add(ourcenter);
	}
	
	return ourvertex;
}

//base goes from c0 to c1
function mirror_point_along_base(ourpoint, c0,c1, lowest_unused_vertex){
	var c0_to_1 = c1.clone();
	c0_to_1.sub(c0);
	var c0_c1_summed_unit = c0.clone();
	c0_c1_summed_unit.add(c1);
	c0_c1_summed_unit.normalize();
	
	var c0_to_point = ourpoint.clone();
	c0_to_point.sub(c0);
	var c1_to_point = ourpoint.clone();
	c1_to_point.sub(c1);
	
	var dist_from_bottom = ourpoint.distanceTo(c0) * get_sin_Vector2(c0_to_point, c0_to_1);
	
//	if(dist_from_bottom < 1) //see we COULD test for this and only do the below if it's true but we wouldn't have the convenient expectations of the indices of inserted points
	var horizontal_dist_from_c0 = Math.sqrt(c0_to_point.lengthSq() - dist_from_bottom * dist_from_bottom );
	var closest_point_on_bottom = c0_to_1.clone();
	closest_point_on_bottom.setLength(c0_to_1.length() - horizontal_dist_from_c0 ); //mirrored
	closest_point_on_bottom.add(c0);
	
	quasicutout_intermediate_vertices[lowest_unused_vertex].copy(c0_c1_summed_unit);
	quasicutout_intermediate_vertices[lowest_unused_vertex].multiplyScalar(dist_from_bottom);
	quasicutout_intermediate_vertices[lowest_unused_vertex].add(closest_point_on_bottom);
	
	quasicutouts_vertices_components[lowest_unused_vertex][0] = quasicutout_intermediate_vertices[lowest_unused_vertex].x * quasi_shear_matrix[0] + quasicutout_intermediate_vertices[lowest_unused_vertex].y * quasi_shear_matrix[1];
	quasicutouts_vertices_components[lowest_unused_vertex][1] = quasicutout_intermediate_vertices[lowest_unused_vertex].x * quasi_shear_matrix[2] + quasicutout_intermediate_vertices[lowest_unused_vertex].y * quasi_shear_matrix[3];
}