//ok we have a bug because the lattice is not precisely on the surface

function Map_lattice() {
	var surface_hexamers_color = Story_states[Storypage].hexamers_color.clone();
	var final_pentamers_color = Story_states[Storypage].pentamers_color.clone();
	
	
	var pentamers_color = new THREE.Color( 
			surface_hexamers_color.r + (1-capsidopenness) * ( final_pentamers_color.r - surface_hexamers_color.r ),
			surface_hexamers_color.g + (1-capsidopenness) * ( final_pentamers_color.g - surface_hexamers_color.g ),
			surface_hexamers_color.b + (1-capsidopenness) * ( final_pentamers_color.b - surface_hexamers_color.b ) );
	
	//this is all crap about that one part where we explain things
	{
		var non_surface_hexamers_color = surface_hexamers_color.clone();
		
		var lattice_fadein_duration = 2;
		var lattice_opacity = 1;
		if( our_CurrentTime < lattice_fadein_time )
			lattice_opacity = 0;
		else if( our_CurrentTime < lattice_fadein_time + lattice_fadein_duration )
			lattice_opacity = ( our_CurrentTime - lattice_fadein_time ) / lattice_fadein_duration;
		//otherwise it's 1.
		non_surface_hexamers_color.lerp( new THREE.Color(1,1,1), 1-lattice_opacity );
		//hack, you have this in the mapper because it uses lattice_opacity
		var surface_elevation = 0;
		if( lattice_opacity === 0 )
			surface_elevation = 3 * (1-capsidopenness);
		
		surface.position.z = surface_elevation;
		for(var i = 0; i < surfperimeter_cylinders.length; i++ )
			surfperimeter_cylinders[i].position.z = surface_elevation;
	}

	var LatticeRotationAndScaleMatrix = new Float32Array([ 
           //divided by density factor because mapfromlatticetosurface. Change this when rid off points.
  		 LatticeScale * Math.cos(LatticeAngle),
  		-LatticeScale * Math.sin(LatticeAngle),
  		 LatticeScale * Math.sin(LatticeAngle),
  		 LatticeScale * Math.cos(LatticeAngle)
  		]);
	
	var hexcorner_nettriangles = new Uint16Array(12);
	var edgecorner_nettriangles = new Uint16Array(4);
	
	var hexagonlattice_index = 0;
	
	var intersections = Array(4);
	for(var i = 0; i < intersections.length; i++)
		intersections[i] = new THREE.Vector3();
	
	got_a_problem = 0;
	for(var j = 0; j < ProblemClosests.length; j++){
		for(var i = 0; i < net_vertices_closest_lattice_vertex.length; i++)
		{
			if(i === 0)
				continue;
//			if(!(i === 0 || (i % 4 === 2 && i !== 18) || i % 4 === 3 ))
//				continue; //if the outermost ones differ we still have a problem
				
			if(net_vertices_closest_lattice_vertex[i] === ProblemClosests[j][i])
			{
				got_a_problem = 1; //we have one of the arrays
				break;
			}
		}
		if(got_a_problem)
			break;
	}

	for(var i = 0; i < number_of_lattice_points; i++){
		IsRoundedVertex[i] = 0;
		IsProblemVertex[i] = 0;
	}
	for(var j = 0; j < net_vertices_closest_lattice_vertex.length; j++){
		IsRoundedVertex[net_vertices_closest_lattice_vertex[j]] = 1;
		if( got_a_problem &&
			(j === 0 || (j % 4 === 2 && j !== 18) || j % 4 === 3 ) ) //also none at all if it's not one of the problem LatticeScales. Don't use latticescale to measure that though
			IsProblemVertex[net_vertices_closest_lattice_vertex[j]] = 1;
	}

	logged = 1;

	for(var i = 0; i < number_of_lattice_points; i++)
	{
		for(var tri_i = 0; tri_i < 4 * 6; tri_i++ )
			HexagonLattice.geometry.faces[i * 4 * 6 + tri_i].color.copy(non_surface_hexamers_color);
	}
	HexagonLattice.geometry.colorsNeedUpdate = true;
	
	var potential_nettriangles = new Uint16Array(8); //each of the four points can be in 2 nettriangles

	var chipped_side_vertices = Array(6);
	for(var i = 0; i < chipped_side_vertices.length; i++)
		chipped_side_vertices[i] = new THREE.Vector3();
	
	var indices_clockwise_on_edge_from_pariahvertex = Array(4);
	indices_clockwise_on_edge_from_pariahvertex[0] = new Uint16Array([0,2,3,1]);
	indices_clockwise_on_edge_from_pariahvertex[1] = new Uint16Array([1,0,2,3]);
	indices_clockwise_on_edge_from_pariahvertex[2] = new Uint16Array([2,3,1,0]);
	indices_clockwise_on_edge_from_pariahvertex[3] = new Uint16Array([3,1,0,2]);

	var vertex_resolved = new Uint8Array(4);

	for(var hexagon_i = 0; hexagon_i < number_of_lattice_points; hexagon_i++) 
	{		
		var hexagon_first_squarelatticevertex_index = hexagon_i*12;
		
		for(var i = 0; i < hexcorner_nettriangles.length; i++){
			hexcorner_nettriangles[i] =
				locate_in_squarelattice_net(squarelattice_hexagonvertices[hexagon_first_squarelatticevertex_index + i]);
			//speedup opportunity: map the points here, too.
		}
		
		for(var side_i = 0; side_i < 6; side_i++)
		{
			if(IsProblemVertex[hexagon_i]) //we're more precise, because they might all be on edges
			{
				for(var i = 0; i < potential_nettriangles.length; i++)
					potential_nettriangles[i] = 667;
				
				for(var i = 0; i < 4; i++){
					double_locate_in_squarelattice_net(squarelattice_hexagonvertices[hexagon_first_squarelatticevertex_index + (side_i * 2 + i) % 12],
							potential_nettriangles, i*2 );
				}
				
				var foundit = 0;
				for(var i = 0; i < potential_nettriangles.length; i++)
				{
					if(potential_nettriangles[i] === 667)
						continue;
					for( var j = 0; j < 4; j++)
					{
						if(	potential_nettriangles[i] !== potential_nettriangles[j*2+0] &&
							potential_nettriangles[i] !== potential_nettriangles[j*2+1] )
						{
							break; //there's no potential for this triangle to contain every corner
						}
						
						if( j === 3) { //every edgecorner is either in here or on the edge
							for(var k = 0; k < 4; k++)
								hexcorner_nettriangles[( side_i * 2 + k ) % 12] = potential_nettriangles[i]; 
							foundit = 1;
							break;
						}
					}
					if(foundit)
						break;
				}
			}

			for(var i = 0; i < 4; i++)
				edgecorner_nettriangles[i] = hexcorner_nettriangles[(side_i * 2 + i) % 12];
			
			if(IsRoundedVertex[hexagon_i])
			{
				if( hexcorner_nettriangles[ ( side_i * 2 + 0 ) % 12 ] !== 666 )
				{
					HexagonLattice.geometry.faces[hexagon_i * 4 * 6 + side_i * 4 + 0 ].color.copy(pentamers_color);
					HexagonLattice.geometry.faces[hexagon_i * 4 * 6 + side_i * 4 + 1 ].color.copy(pentamers_color);
				}
				if( hexcorner_nettriangles[ ( side_i * 2 + 3 ) % 12 ] !== 666 )
				{
					HexagonLattice.geometry.faces[hexagon_i * 4 * 6 + side_i * 4 + 2 ].color.copy(pentamers_color);
					HexagonLattice.geometry.faces[hexagon_i * 4 * 6 + side_i * 4 + 3 ].color.copy(pentamers_color);
				}
			}
			else
			{
				if( hexcorner_nettriangles[ ( side_i * 2 + 0 ) % 12 ] !== 666 )
				{
					HexagonLattice.geometry.faces[hexagon_i * 4 * 6 + side_i * 4 + 0 ].color.copy(surface_hexamers_color);
					HexagonLattice.geometry.faces[hexagon_i * 4 * 6 + side_i * 4 + 1 ].color.copy(surface_hexamers_color);
				}
				if( hexcorner_nettriangles[ ( side_i * 2 + 3 ) % 12 ] !== 666 )
				{
					HexagonLattice.geometry.faces[hexagon_i * 4 * 6 + side_i * 4 + 2 ].color.copy(surface_hexamers_color);
					HexagonLattice.geometry.faces[hexagon_i * 4 * 6 + side_i * 4 + 3 ].color.copy(surface_hexamers_color);
				}
			}
			
			//------------possibilities begin here
			
			if(	edgecorner_nettriangles[0] === edgecorner_nettriangles[1] &&
				edgecorner_nettriangles[2] === edgecorner_nettriangles[3] && 
				edgecorner_nettriangles[0] !== edgecorner_nettriangles[3])
			{
				//split widthways
				
				//there is an "equivalence" between intersections and the actual corners
				for(var i = 0; i < 4; i++){
					var leftend;
					var rightend;
					if(i % 2 === 0){
						leftend = 0;
						rightend= 2;
					}
					else{
						leftend = 1;
						rightend= 3;
					}
					
					leftend = squarelattice_hexagonvertices[hexagon_first_squarelatticevertex_index + (side_i * 2 + leftend) % 12 ];
					rightend= squarelattice_hexagonvertices[hexagon_first_squarelatticevertex_index + (side_i * 2 +rightend) % 12 ];
					
					var ourtriangle = edgecorner_nettriangles[i] === 666? edgecorner_nettriangles[(i+2)%4] : edgecorner_nettriangles[i];
					
					//going around this, you're actually caught by a line you don't want to intersect with
					//ideally you want to go straight for the edge with one triangle on one side and one on the other
					//keep this loop but for each edge check that it falls on both triangles
					for(var k = 0; k < 3; k++) 
					{
						//speedup: also if you're 666, no need to get the intersection again
						
						var potentialintersection = line_line_intersection(
								squarelatticevertex_rounded_triangle_vertex(ourtriangle, k),
								leftend,
								squarelatticevertex_rounded_triangle_vertex(ourtriangle, (k+1)%3),
								rightend);
					
						if(potentialintersection !== 0){
							intersections[i].copy(potentialintersection);
							break;
						}

						if(k === 2)console.error("no intersection")
					}
				}
				
				
				for(var tri_i = 0; tri_i < 4; tri_i++)
				{
//					if(IsRoundedVertex[i] )
//						HexagonLattice.geometry.faces[i * 4 * 6 + tri_i].color.setRGB(capsidopenness,0,1-capsidopenness);
//					else
//						HexagonLattice.geometry.faces[i * 4 * 6 + tri_i].color.setRGB(1,0,0);
					
					for(var corner_i = 0; corner_i < 3; corner_i++)
					{
						var is_an_intersection = 0;
						var corner;
						if( tri_i === 0 ){
							if(corner_i === 0 ) { is_an_intersection = 0; corner = 1; }
							if(corner_i === 1 ) { is_an_intersection = 1; corner = 1; }
							if(corner_i === 2 ) { is_an_intersection = 0; corner = 0; }
						}
						else 
						if( tri_i === 1 ){
							if(corner_i === 0 ) { is_an_intersection = 1; corner = 0; }
							if(corner_i === 1 ) { is_an_intersection = 0; corner = 0; }
							if(corner_i === 2 ) { is_an_intersection = 1; corner = 1; }
						}
						else 
						if( tri_i === 2 ){
							if(corner_i === 0 ) { is_an_intersection = 1; corner = 3; }
							if(corner_i === 1 ) { is_an_intersection = 0; corner = 3; }
							if(corner_i === 2 ) { is_an_intersection = 1; corner = 2; }
						}
						else 
						if( tri_i === 3 ){
							if(corner_i === 0 ) { is_an_intersection = 0; corner = 2; }
							if(corner_i === 1 ) { is_an_intersection = 1; corner = 2; }
							if(corner_i === 2 ) { is_an_intersection = 0; corner = 3; }
						}
						
						if(is_an_intersection){
							map_hex_point(intersections[corner], 
									hexcorner_nettriangles[ ( side_i * 2 + corner ) % 12],
									hexagonlattice_index, LatticeRotationAndScaleMatrix);
						}
						else{
							corner = ( side_i * 2 + corner ) % 12;
							
							map_hex_point(squarelattice_hexagonvertices[hexagon_first_squarelatticevertex_index+corner], 
									hexcorner_nettriangles[ corner],
									hexagonlattice_index, LatticeRotationAndScaleMatrix);
						}
						
						hexagonlattice_index++;
					}
				}
			}
			else if(edgecorner_nettriangles[0] === edgecorner_nettriangles[1] && 
					edgecorner_nettriangles[0] === edgecorner_nettriangles[2] && 
					edgecorner_nettriangles[0] === edgecorner_nettriangles[3] )
			{
				//all in one triangle
				for(var tri_i = 0; tri_i < 4; tri_i++)
				{
					for(var corner_i = 0; corner_i < 3; corner_i++)
					{
						var corner;
						if( tri_i < 2 ) //they just get the corner
							corner = 0;
						else {
							if( tri_i === 2 ){
								if(corner_i === 0 ) corner = 1;
								if(corner_i === 1 ) corner = 3;
								if(corner_i === 2 ) corner = 0;
							}
							else if( tri_i === 3) {
								if(corner_i === 0 ) corner = 2;
								if(corner_i === 1 ) corner = 0;
								if(corner_i === 2 ) corner = 3;
							}
							
							corner = ( side_i * 2 + corner ) % 12;
						}
						
						map_hex_point(squarelattice_hexagonvertices[hexagon_first_squarelatticevertex_index+corner], 
								hexcorner_nettriangles[ corner],
								hexagonlattice_index, LatticeRotationAndScaleMatrix);
						
						hexagonlattice_index++;
					}
				}
				
			}
			else if(edgecorner_nettriangles[0] === edgecorner_nettriangles[2] &&
					edgecorner_nettriangles[1] === edgecorner_nettriangles[3])
			{
				//split lengthways
				for(var i = 0; i < 4; i++){ //intersection point
					var topend;
					var bottomend;
					if(i % 2 === 0){
						topend = 0;
						bottomend= 1;
					}
					else{						
						topend = 2;
						bottomend= 3;
					}
					
					topend   = squarelattice_hexagonvertices[hexagon_first_squarelatticevertex_index + (side_i * 2 + topend) % 12 ];
					bottomend= squarelattice_hexagonvertices[hexagon_first_squarelatticevertex_index + (side_i * 2 +bottomend) % 12 ];
					
					var ourtriangle = edgecorner_nettriangles[i] === 666 ? edgecorner_nettriangles[(5-i)%4] : edgecorner_nettriangles[i];
					
					for(var k = 0; k < 3; k++)
					{
						//speedup: also if you're 666, no need to get the intersection again
						var potentialintersection = line_line_intersection(
								squarelatticevertex_rounded_triangle_vertex(ourtriangle, k),
								topend,
								squarelatticevertex_rounded_triangle_vertex(ourtriangle, (k+1)%3),
								bottomend);
					
						if(potentialintersection !== 0){
							intersections[i].copy(potentialintersection);
							break;
						}
						else if(k === 2)console.error("no intersection")
					}
				}
				
				
				for(var tri_i = 0; tri_i < 4; tri_i++)
				{
					for(var corner_i = 0; corner_i < 3; corner_i++)
					{
						var is_an_intersection = 0;
						var corner;
						if( tri_i === 0 ){
							if(corner_i === 0 ) { is_an_intersection = 1; corner = 0; }
							if(corner_i === 1 ) { is_an_intersection = 1; corner = 2; }
							if(corner_i === 2 ) { is_an_intersection = 0; corner = 0; }
						}
						else 
						if( tri_i === 1 ){
							if(corner_i === 0 ) { is_an_intersection = 0; corner = 2; }
							if(corner_i === 1 ) { is_an_intersection = 0; corner = 0; }
							if(corner_i === 2 ) { is_an_intersection = 1; corner = 2; }
						}
						else 
						if( tri_i === 2 ){
							if(corner_i === 0 ) { is_an_intersection = 0; corner = 1; }
							if(corner_i === 1 ) { is_an_intersection = 0; corner = 3; }
							if(corner_i === 2 ) { is_an_intersection = 1; corner = 1; }
						}
						else 
						if( tri_i === 3 ){
							if(corner_i === 0 ) { is_an_intersection = 1; corner = 3; }
							if(corner_i === 1 ) { is_an_intersection = 1; corner = 1; }
							if(corner_i === 2 ) { is_an_intersection = 0; corner = 3; }
						}
						
						if(is_an_intersection){
							map_hex_point(intersections[corner], 
									hexcorner_nettriangles[ ( side_i * 2 + corner ) % 12],
									hexagonlattice_index, LatticeRotationAndScaleMatrix);
						}
						else{
							corner = ( side_i * 2 + corner ) % 12;
							
							map_hex_point(squarelattice_hexagonvertices[hexagon_first_squarelatticevertex_index+corner], 
									hexcorner_nettriangles[ corner],
									hexagonlattice_index, LatticeRotationAndScaleMatrix);
						}
						
						hexagonlattice_index++;
					}
				}
			}
			
			else
			{
				//one vertex separated
				
				var pariahvertex = 666;
				
				for(var potential_pariah = 0; potential_pariah < 4; potential_pariah++){
					for(var k = 0; k < 4; k++){
						if( k !== potential_pariah && edgecorner_nettriangles[potential_pariah] === edgecorner_nettriangles[k] )
							break;
						
						if(k === 3)
							pariahvertex = potential_pariah;
					}
					if( potential_pariah === 3 && pariahvertex === 666 ) console.error("no pariahvertex found");
				}
				
				var regular_index_place = 0;
				if(!logged) console.log( hexagon_first_squarelatticevertex_index)
				for(var i = 0; i < chipped_side_vertices.length; i++){
					if(i === 1 || i === 5)
						continue;
					
					var hexagonvertexindex = (side_i * 2 + indices_clockwise_on_edge_from_pariahvertex[pariahvertex][regular_index_place]) % 12;
					if(!logged)console.log(hexagonvertexindex)
					chipped_side_vertices[i].copy( squarelattice_hexagonvertices[hexagon_first_squarelatticevertex_index + hexagonvertexindex] );
					
					regular_index_place++;
				}
				
				for(var i = 0; i < chipped_side_vertices.length; i++){
					if(i !== 1 && i !== 5)
						continue;
					
					var checktriangle = edgecorner_nettriangles[pariahvertex] === 666 ? 
							edgecorner_nettriangles[(pariahvertex+1)%4] : edgecorner_nettriangles[pariahvertex];
							
//					if(!logged)console.log(edgecorner_nettriangles,
//							locate_in_squarelattice_net(chipped_side_vertices[0]),
//							locate_in_squarelattice_net(chipped_side_vertices[2]),
//							locate_in_squarelattice_net(chipped_side_vertices[3]),
//							locate_in_squarelattice_net(chipped_side_vertices[4]) );
							
					for(var k = 0; k < 3; k++)
					{
//						if(!logged)console.log((i+5)%6,(i+1)%6)
						
						var potentialintersection = line_line_intersection(
								squarelatticevertex_rounded_triangle_vertex(checktriangle, k),
								chipped_side_vertices[(i+5)%6],
								squarelatticevertex_rounded_triangle_vertex(checktriangle, (k+1)%3),
								chipped_side_vertices[(i+1)%6]);
					
						if( potentialintersection ){
							chipped_side_vertices[i].copy(potentialintersection);
							break;
						}
						else if(k === 2 ){
//							console.error("no intersection", edgecorner_nettriangles,pariahvertex )
								logged = 1
						}
					}
				}
				
				for(var tri_i = 0; tri_i < 4; tri_i++)
				{
					for(var corner_i = 0; corner_i < 3; corner_i++)
					{
						var chipped_vertex;
						if( tri_i === 0 ){
							if(corner_i === 0 ) chipped_vertex = 0;
							if(corner_i === 1 ) chipped_vertex = 5;
							if(corner_i === 2 ) chipped_vertex = 1;
						}
						else 
						if( tri_i === 1 ){
							if(corner_i === 0 ) chipped_vertex = 3;
							if(corner_i === 1 ) chipped_vertex = 1;
							if(corner_i === 2 ) chipped_vertex = 5;
						}
						else 
						if( tri_i === 2 ){
							if(corner_i === 0 ) chipped_vertex = 2;
							if(corner_i === 1 ) chipped_vertex = 1;
							if(corner_i === 2 ) chipped_vertex = 3;
						}
						else 
						if( tri_i === 3 ){
							if(corner_i === 0 ) chipped_vertex = 4;
							if(corner_i === 1 ) chipped_vertex = 3;
							if(corner_i === 2 ) chipped_vertex = 5;
						}
						
						//inspect tri's here next, they shouldn't be stretched from the lattice
						
						if( tri_i === 0 ) //chipped triangle
							map_hex_point(chipped_side_vertices[chipped_vertex], 
								edgecorner_nettriangles[pariahvertex],
								hexagonlattice_index, LatticeRotationAndScaleMatrix);
						else
							map_hex_point(chipped_side_vertices[chipped_vertex], 
								edgecorner_nettriangles[ (pariahvertex+1) % 4],
								hexagonlattice_index, LatticeRotationAndScaleMatrix);
						
						hexagonlattice_index++;
					}
				}
			}
		}
	}
		
		
	//potential optimisation: break out of the loop when you're past a certain radius. That only helps small capsids though.
	//potential optimisation: just put one in each net triangle and extrapolate
	for(var i = 0; i < number_of_lattice_points; i++) {
		var latticevertex_nettriangle = locate_in_squarelattice_net(squarelattice_vertices[i]);
		
		if( latticevertex_nettriangle !== 666 ) {
			var mappedpoint = map_XY_from_lattice_to_surface(
					flatlattice_vertices.array[ i*3+0 ], flatlattice_vertices.array[ i*3+1 ],
					latticevertex_nettriangle );
			if(capsidopenness != 1) 
				surflattice_geometry.attributes.position.setXYZ(i, mappedpoint.x, mappedpoint.y, mappedpoint.z );
//			else //just as normal with extra z to appear above the edges
//				surflattice_geometry.attributes.position.setXYZ(i, mappedpoint.x, mappedpoint.y, mappedpoint.z + 0.01 );
			
			lattice_colors[i*3+0] = 1;
			lattice_colors[i*3+1] = 0;
			lattice_colors[i*3+2] = 0;
		}
		else 
		{
			surflattice_geometry.attributes.position.setXYZ(i, 
					Lattice_ring_density_factor*flatlattice_default_vertices[ i*3+0 ],
					Lattice_ring_density_factor*flatlattice_default_vertices[ i*3+1 ],0);
			
			lattice_colors[i*3+0] = 1;
			lattice_colors[i*3+1] = 0.682;
			lattice_colors[i*3+2] = 0.682;
		}
	}
	
	
	surflattice.geometry.attributes.position.needsUpdate = true;
	surflattice.geometry.attributes.color.needsUpdate = true;
	HexagonLattice.geometry.verticesNeedUpdate = true;
}