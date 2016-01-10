var maxspeed = 34;
function updatelattice() {
	var costheta = Math.cos(LatticeAngle);
	var sintheta = Math.sin(LatticeAngle);

	for(var i = 1; i < number_of_lattice_points; i++) {
		var vertex_destinationX = (flatlattice_default_vertices[i*3+0] * costheta - flatlattice_default_vertices[i*3+1] * sintheta) * LatticeScale;
		var vertex_destinationY = (flatlattice_default_vertices[i*3+0] * sintheta + flatlattice_default_vertices[i*3+1] * costheta) * LatticeScale;
		var vertex_destinationZ = (1-capsidopenness) * camera.position.z * 1.5;
		
		flatlattice_vertices.array[i*3+0] = vertex_destinationX;
		flatlattice_vertices.array[i*3+1] = vertex_destinationY;
		flatlattice_vertices.array[i*3+2] = 0;
	}
	
	flatlattice.geometry.attributes.position.needsUpdate = true;
}

function HandleNetMovement() {
	if( isMouseDown){
		var Mousedist = MousePosition.distanceTo(flatlattice_center);
		var OldMousedist = OldMousePosition.distanceTo(flatlattice_center); //unless the center is going to change?
		
		var active_radius = 0.18;
		if(Mousedist > active_radius && OldMousedist > active_radius && Mouse_delta.lengthSq() != 0 ){
			LatticeGrabbed = true;
			
			var oldmouse_to_center = new THREE.Vector3(flatlattice_center.x - OldMousePosition.x,flatlattice_center.y - OldMousePosition.y,0);
			var oldmouse_to_newmouse = new THREE.Vector3(MousePosition.x - OldMousePosition.x,MousePosition.y - OldMousePosition.y,0);
			var ourangle = oldmouse_to_center.angleTo(oldmouse_to_newmouse);
			
			var oldLatticeScale = LatticeScale;
			
			if(Math.abs(ourangle) < TAU / 8 || Math.abs(ourangle) > TAU / 8 * 3 ){
				var LatticeScaleChange = OldMousedist / Mousedist;
				var max_lattice_scale_change = 0.08;
				
				var min_lattice_scale_given_angle = get_min_lattice_scale(LatticeAngle);
				LatticeScale *= LatticeScaleChange;
				if(LatticeScale < min_lattice_scale_given_angle  ) //10/3 * HS3 / number_of_hexagon_rings)
					LatticeScale = min_lattice_scale_given_angle ; //10/3 * HS3 / number_of_hexagon_rings;
				if(LatticeScale > 1)
					LatticeScale = 1;
				
				//TODO checks of this kind should really apply to the automatic stuff too, i.e. this should be moved down.
			}
			
			//if you didn't change scale (or if your change was ineffectual) we'll change angle.
			if( oldLatticeScale == LatticeScale) {
				var MouseAngle = Math.atan2( (MousePosition.x - flatlattice_center.x), (MousePosition.y - flatlattice_center.y) );
				if(MousePosition.x - flatlattice_center.x === 0 && MousePosition.y - flatlattice_center.y === 0)
					MouseAngle = 0; //well, undefined
				
				var OldMouseAngle = Math.atan2( (OldMousePosition.x - flatlattice_center.x), (OldMousePosition.y - flatlattice_center.y) );
				if(OldMousePosition.x - flatlattice_center.x === 0 && OldMousePosition.y - flatlattice_center.y === 0)
					OldMouseAngle = 0;
				
				//speed up opening. TODO Sensetive enough so you know it happens, not so sensetive that touchscreens don't see slow opening
				//if(Math.abs(OldMouseAngle - MouseAngle) > 0.08) capsidopeningspeed += 0.0045;
				
				//TODO remember where the original point the player clicked is, that's what you want to be moving. Currently that point is forgotten, in a sense, if the scale limit is hit
				
				var maxLatticeAngleChange = TAU / 12;
				var LatticeAngleChange = MouseAngle - OldMouseAngle;
				LatticeAngle += LatticeAngleChange;
			}
		}
	} else {
		LatticeGrabbed = false;

		var centralaxis = new THREE.Vector3(0, 0, 1);	
		
		var firstnetvertex = new THREE.Vector3(flatnet_vertices.array[ 3 ],flatnet_vertices.array[ 4 ],0);
		firstnetvertex.multiplyScalar(1/LatticeScale);
		firstnetvertex.applyAxisAngle(centralaxis,-LatticeAngle);
		
		var closestlatticevertices_indices = indices_of_closest_default_lattice_vertices(firstnetvertex.x,firstnetvertex.y); //TODO you don't want a lattice vertex not on the visible lattice.
		
		var scaleaugmentation;
		var angleaugmentation;
		var min_lattice_scale_given_angle; //do you need to initialize them in order for the while to work?
		var ourchoice = 0;
		
		do {
			var close_latticevertex = new THREE.Vector3(flatlattice_default_vertices[closestlatticevertices_indices[ourchoice]*3+0],flatlattice_default_vertices[closestlatticevertices_indices[ourchoice]*3+1],0);
			
			//how much you WOULD augment to snap the net straight there
			scaleaugmentation = firstnetvertex.length()/close_latticevertex.length();
			angleaugmentation = close_latticevertex.angleTo(firstnetvertex);
			if(point_to_the_right_of_line(	close_latticevertex.x,close_latticevertex.y,
											firstnetvertex.x,firstnetvertex.y, 0,0) ===0 )
				angleaugmentation*=-1;
			
			min_lattice_scale_given_angle = get_min_lattice_scale(LatticeAngle+angleaugmentation);
			
			var full_scale_addition = LatticeScale * scaleaugmentation - LatticeScale;
			
			ourchoice++;
		} while(LatticeScale + full_scale_addition < min_lattice_scale_given_angle - 0.000001 && ourchoice < 7)
			
		var speed_towards_fix = 0.03 + 0.97 * Math.pow((1-capsidopenness), 10); //sure this won't change which one you're heading for?
		LatticeAngle += angleaugmentation*speed_towards_fix;
		LatticeScale += full_scale_addition*speed_towards_fix;
	}
	updatelattice();
}

function put_picture_in_place(){
	for(var i = 0; i < picture_objects.length; i++){
		scene.remove(picture_objects[i]);
	}
	if(!isMouseDown){
		var tolerance = 0.01;
		for(var i = 0; i < viruspicture_scales.length; i++){
			if(Math.abs(LatticeScale-viruspicture_scales[i]) < tolerance)
				scene.add(picture_objects[i]);
		}
	}
}

function get_min_lattice_scale(ourangle) {
	//this value needs updating if you ever change hexagon_rings
//	var min_lattice_scale = 1/(2*Math.sqrt(2.5*2.5+3/4));
//	var angle_for_min_lattice = TAU/6 - Math.atan(Math.sqrt(3)/2 / 2.5);
//
//	var virtual_angle = ourangle - angle_for_min_lattice + TAU/12;
//	while(virtual_angle< -TAU/12) virtual_angle += TAU/6;
//	while(virtual_angle > TAU/12) virtual_angle -= TAU/6;
//	return min_lattice_scale / HS3 * Math.cos(virtual_angle);
	return 0.27735;
}

function Map_lattice() {
	//potential optimisation: break out of the loop when you're past a certain radius. That only helps small capsids though.
	//potential optimisation: just put one in each net triangle and extrapolate
	for(var i = 0; i < number_of_lattice_points; i++) {
		latticevertex_nettriangle[i] = locate_in_squarelattice_net(i);
		
		if( latticevertex_nettriangle[i] !== 666 ) {
			var mappedpoint = map_from_lattice_to_surface(
					flatlattice_vertices.array[ i*3+0 ], flatlattice_vertices.array[ i*3+1 ],
					latticevertex_nettriangle[i] );
			if(capsidopenness != 1) 
				surflattice_vertices.setXYZ(i, mappedpoint.x, mappedpoint.y, mappedpoint.z );
			else //just as normal with extra z to appear above the edges
				surflattice_vertices.setXYZ(i, mappedpoint.x, mappedpoint.y, mappedpoint.z + 0.01 );
			
			lattice_colors[i*3+0] = 1;
			lattice_colors[i*3+1] = 0;
			lattice_colors[i*3+2] = 0;
		}
		else {
			surflattice_vertices.setXYZ(i, lattice_scalefactor*flatlattice_default_vertices[ i*3+0 ],lattice_scalefactor*flatlattice_default_vertices[ i*3+1 ],0);
			
			lattice_colors[i*3+0] = 1;
			lattice_colors[i*3+1] = 0.682;
			lattice_colors[i*3+2] = 0.682;
		}
	}
	
	surflattice.geometry.attributes.position.needsUpdate = true;
	surflattice.geometry.attributes.color.needsUpdate = true;
	
	/* 
	 * Alternative location thing if the below doesn't work:
	 * get the integer positions of their CENTERS, doing something (if you're not already doing it) whereby each appears in precisely one face.
	 * for a square triangle with vertices at 0,0, 1,0 and 0,1, the center is at 1/3, 1/3 
	 */ 

	
	
	//protein_vertex_indices will probably be a function actually
	for(var i = 0; i < number_of_proteins_in_lattice; i++){
		var net_status = 0;
		if(latticevertex_nettriangle[ protein_vertex_indices[i][0] ] === 666 ) net_status++;
		if(latticevertex_nettriangle[ protein_vertex_indices[i][1] ] === 666 ) net_status++;
		if(latticevertex_nettriangle[ protein_vertex_indices[i][2] ] === 666 ) net_status++;
		
		var corner1;
		var corner2;
		var corner3;
		
//		if(net_status === 2 || net_status === 3) { //3 or 2 vertices not on the capsid
			corner1 = new THREE.Vector3(lattice_scalefactor*flatlattice_default_vertices[ protein_vertex_indices[i][0]*3+0 ],lattice_scalefactor*flatlattice_default_vertices[ protein_vertex_indices[i][0]*3+1 ],0);
			corner2 = new THREE.Vector3(lattice_scalefactor*flatlattice_default_vertices[ protein_vertex_indices[i][1]*3+0 ],lattice_scalefactor*flatlattice_default_vertices[ protein_vertex_indices[i][1]*3+1 ],0);
			corner3 = new THREE.Vector3(lattice_scalefactor*flatlattice_default_vertices[ protein_vertex_indices[i][2]*3+0 ],lattice_scalefactor*flatlattice_default_vertices[ protein_vertex_indices[i][2]*3+1 ],0);
//		}
//		else if(net_status === 0){ //fully on the capsid
//			corner1 = new THREE.Vector3(surflattice_vertices.array[ protein_vertex_indices[i][0]*3+0 ],surflattice_vertices.array[ protein_vertex_indices[i][0]*3+1 ],surflattice_vertices.array[ protein_vertex_indices[i][0]*3+2 ]);
//			corner2 = new THREE.Vector3(surflattice_vertices.array[ protein_vertex_indices[i][1]*3+0 ],surflattice_vertices.array[ protein_vertex_indices[i][1]*3+1 ],surflattice_vertices.array[ protein_vertex_indices[i][1]*3+2 ]);
//			corner3 = new THREE.Vector3(surflattice_vertices.array[ protein_vertex_indices[i][2]*3+0 ],surflattice_vertices.array[ protein_vertex_indices[i][2]*3+1 ],surflattice_vertices.array[ protein_vertex_indices[i][2]*3+2 ]); 
//		}
//		else if(net_status === 1){ //bending time. TODO IF you don't want proteins overlapping we could have only some of the net triangles able to have protein corners poking off
//			var protein_vertex_outside_net;
//			for(protein_vertex_outside_net = 0; protein_vertex_outside_net < 3; protein_vertex_outside_net++){
//				if(latticevertex_nettriangle[ protein_vertex_indices[i][protein_vertex_outside_net] ]!==666)
//					continue;
//				else break;
//			}
//			//protein corner 1 is by no means necessarily going to be the final corner1.
//			var protein_exterior_corner_index = protein_vertex_indices[i][   protein_vertex_outside_net   ];
//			var protein_corner1_index	      = protein_vertex_indices[i][(protein_vertex_outside_net+1)%3];
//			var protein_corner2_index		  = protein_vertex_indices[i][(protein_vertex_outside_net+2)%3];
//			
//			//note these are vector2's
//			var protein_exterior_corner = new THREE.Vector2(flatlattice_vertices.array[ protein_exterior_corner_index * 3 + 0 ],flatlattice_vertices.array[ protein_exterior_corner_index * 3 + 1 ]);
//			var protein_corner1 		= new THREE.Vector2(flatlattice_vertices.array[ protein_corner1_index * 3 + 0 ],		flatlattice_vertices.array[ protein_corner1_index * 3 + 1 ]);
//			var protein_corner2 		= new THREE.Vector2(flatlattice_vertices.array[ protein_corner2_index * 3 + 0 ],		flatlattice_vertices.array[ protein_corner2_index * 3 + 1 ]);
//			
//			//we're going to assume both of the interior vertices are in here. There may be exceptions to that 
//			var containing_nettriangle = latticevertex_nettriangle[ protein_vertex_indices[i][(protein_vertex_outside_net+2)%3] ] *3+k];
//			var other_containing_nettriangle = latticevertex_nettriangle[ protein_vertex_indices[i][(protein_vertex_outside_net+1)%3] ] *3+k];
//			if( containing_nettriangle != other_containing_nettriangle ){
//				console.log("error: two vertices in different net triangles connected to one outside the net");
//				break;
//			}
//			
//			var intersection_a;
//			var intersection_b;
//			var net_triangle_corner;
//			for(net_triangle_corner = 0; net_triangle_corner < 3; net_triangle_corner++){
//				var net_edge_start_index = net_triangle_vertex_indices[containing_nettriangle*3+ net_triangle_corner];
//				var net_edge_end_index = net_triangle_vertex_indices[containing_nettriangle*3+ (net_triangle_corner+1)%3];
//				var net_edge_start = new THREE.Vector2(flatnet_vertices.array[net_edge_start_index * 3 + 0], flatnet_vertices.array[net_edge_start_index * 3 + 1]);
//				var net_edge_end  =  new THREE.Vector2(flatnet_vertices.array[ net_edge_end_index  * 3 + 0], flatnet_vertices.array[ net_edge_end_index  * 3 + 1]);
//				
//				intersection_a = line_line_intersection( protein_corner1, net_edge_start, protein_exterior_corner, net_edge_end);
//				if(intersection_a !== 0) {
//					intersection_b = line_line_intersection(protein_corner2, net_edge_start, protein_exterior_corner, net_edge_end);
//					if(intersection_b === 0)
//						console.log("protein only intersected one side of a net triangle. Weird");
//					else break; //that was our intersecting net triangle side
//				}
//			}
//			
//			var b_to_d = Math.sqrt( (protein_exterior_corner.x-intersection_b.x)*(protein_exterior_corner.x-intersection_b.x) + (protein_exterior_corner.y-intersection_b.y)*(protein_exterior_corner.y-intersection_b.y) );
//			var d_to_a = Math.sqrt( (protein_exterior_corner.x-intersection_a.x)*(protein_exterior_corner.x-intersection_a.x) + (protein_exterior_corner.y-intersection_a.y)*(protein_exterior_corner.y-intersection_a.y) );
//			var a_to_b = Math.sqrt( (intersection_b.x-intersection_a.x)*(intersection_b.x-intersection_a.x) + (intersection_b.y-intersection_a.y)*(intersection_b.y-intersection_a.y) );
//			var cos_corner_b_angle = get_cos_rule(d_to_a,a_to_b,b_to_d);
//			var d_hinge_origin_length = cos_corner_b_angle * b_to_d;
//			var d_hinge_length = Math.sqrt(b_to_d * b_to_d - d_hinge_origin_length * d_hinge_origin_length );
//			
//			//here you turn something 2D into something 3D
//			var net_edge_lengthSq = (net_edge_end.x - net_edge_start.x) * (net_edge_end.x - net_edge_start.x) + (net_edge_end.y - net_edge_start.y) * (net_edge_end.y - net_edge_start.y);
//			
//			var a_on_edge = intersection_a.clone();
//			var b_on_edge = intersection_b.clone();
//			a_on_edge.sub(net_edge_start);
//			b_on_edge.sub(net_edge_start);
//			var a_edge_proportion = Math.sqrt(a_on_edge.lengthSq() / net_edge_lengthSq);
//			var b_edge_proportion = Math.sqrt(b_on_edge.lengthSq() / net_edge_lengthSq);
//			
//			var surface_cornerA = new THREE.Vector3(
//					surface_vertices.array[ net_edge_start_index * 3 + 0],
//					surface_vertices.array[ net_edge_start_index * 3 + 1],
//					surface_vertices.array[ net_edge_start_index * 3 + 2]);
//			var surface_edge = new THREE.Vector3(
//					surface_vertices.array[ net_edge_end_index * 3 + 0],
//					surface_vertices.array[ net_edge_end_index * 3 + 1],
//					surface_vertices.array[ net_edge_end_index * 3 + 2]);
//			surface_edge.sub(surface_cornerA);
//			
//			var a_surface = surface_edge.clone();
//			var b_surface = surface_edge.clone();
//			a_surface.multiplyScalar(a_edge_proportion);
//			b_surface.multiplyScalar(b_edge_proportion);
//			a_surface.add(surface_cornerA);
//			b_surface.add(surface_cornerA);
//			
//			var net_opposite_corner_index = net_triangle_vertex_indices[containing_nettriangle*3+(net_triangle_corner+2)%3];
//			var c_surface = new THREE.Vector3(surface_vertices.array[ net_opposite_corner_index * 3 + 0],surface_vertices.array[ net_opposite_corner_index * 3 + 1],surface_vertices.array[ net_opposite_corner_index * 3 + 2]);
//
//			corner1 = bent_down_quad_corner(a_surface,b_surface,c_surface,
//					icosahedron_dihedral_angle,d_hinge_origin_length, d_hinge_length);
//			corner2 = new THREE.Vector3(surflattice_vertices.array[ protein_vertex_indices[i][(protein_vertex_outside_net+1)%3]*3+0 ],surflattice_vertices.array[ protein_vertex_indices[i][(protein_vertex_outside_net+1)%3]*3+1 ],surflattice_vertices.array[ protein_vertex_indices[i][(protein_vertex_outside_net+1)%3]*3+2 ]);
//			corner3 = new THREE.Vector3(surflattice_vertices.array[ protein_vertex_indices[i][(protein_vertex_outside_net+2)%3]*3+0 ],surflattice_vertices.array[ protein_vertex_indices[i][(protein_vertex_outside_net+2)%3]*3+1 ],surflattice_vertices.array[ protein_vertex_indices[i][(protein_vertex_outside_net+2)%3]*3+2 ]);
//			
//			//should have a minimum angle in there. Net_edge_start_index and net_edge_end_index are shared between two triangles. Whichever of those two it is.
//		}
		
		//yeah no, you need one mesh
//		fix_meshprotein_to_anchors_vecs(corner1,corner2,corner3, i);
//		proteinlattice.geometry.attributes.position.needsUpdate = true;
	}
}

//vertex *destination*. Not vertex, which may be interesting.
function index_of_closest_default_lattice_vertex(x,y) {
	var closest_point_so_far_index = 66666;
	var lowest_quadrance_so_far = 66666;
	for( var j = 0; j < number_of_lattice_points; j++) {
		var quadrance = (x-flatlattice_default_vertices[j*3 + 0])*(x-flatlattice_default_vertices[j*3 + 0]) + 
						(y-flatlattice_default_vertices[j*3 + 1])*(y-flatlattice_default_vertices[j*3 + 1]);
		
		if( quadrance < lowest_quadrance_so_far) {
			closest_point_so_far_index = j;
			lowest_quadrance_so_far = quadrance;
		}
	}
	return closest_point_so_far_index;
}

//vertex *destination*. Not vertex, which may be interesting.
function indices_of_closest_default_lattice_vertices(x,y) {
	var number_of_returns = 7; //all the points near a point, should be ok?
	var closest_points_indices = Array(number_of_returns);
	var lowest_quadrances_so_far = Array(number_of_returns );
	for(var i = 0; i<number_of_returns; i++){
		closest_points_indices[i] = 66666;
		lowest_quadrances_so_far[i] = 66666;
	}
	//speedup opportunity: only go through a sixth of them
	//speedup opportunity: discard those whose quadrance from the center of the lattice is larger than that of the closest one
	for( var i = 0; i < number_of_lattice_points; i++) {
		var quadrance = (x-flatlattice_default_vertices[i*3 + 0])*(x-flatlattice_default_vertices[i*3 + 0]) + 
						(y-flatlattice_default_vertices[i*3 + 1])*(y-flatlattice_default_vertices[i*3 + 1]);
		
		for(var j = number_of_returns - 1; j >= 0; j--) {
			if( quadrance < lowest_quadrances_so_far[j]) {
				//well this one is being shifted
				if(j < number_of_returns - 1){
					closest_points_indices[j+1] = closest_points_indices[j];
					lowest_quadrances_so_far[j+1] = lowest_quadrances_so_far[j];
				}
				if(j==0){
					closest_points_indices[0] = i;
					lowest_quadrances_so_far[0] = quadrance;
				}
			}
			else{
				if(j !== number_of_returns - 1) {
					//so we know we're in the list, we need to put them in the previous place
					closest_points_indices[j+1] = i;
					lowest_quadrances_so_far[j+1] = quadrance;
				}
				break;
			}
		}
	}
	return closest_points_indices;
}