function generate_QCatom_locations(){
	/*
	 * Get everything in one icosa triangle, so everything except y and db
	 * Then y and db.
	 */
	//the three corners of a rhombic triacontahedron that immediately surround its dodeca vertex (a vertex of radius 1)
	var original_dodeca_vertex = 12; //if you change this, need to change the normalized virtualico vertices too!
	var vertex_on_the_way_to_opposite_original_vertex = 8;
	var useful_ico_vertices = Array(3);
	var useful_dod_vertices = Array([8,11,13]);
	var lowest_unused_usefulico_vertex = 0;
	for(var i = 0; i < normalized_virtualico_vertices.length; i++){
		if(normalized_virtualico_vertices[i].angleTo(normalized_virtualdodeca_vertices[original_dodeca_vertex]) < TAU / 8 ){ //no need to work out the exact angle
			useful_ico_vertices[lowest_unused_usefulico_vertex] = i;
			lowest_unused_usefulico_vertex++;
		}
	}
	var to_triaconta_far_corners = Array(3);
	for(var i = 0; i < 3; i++){
		to_triaconta_far_corners[i] = normalized_virtualico_vertices[useful_ico_vertices[i]].clone();
		to_triaconta_far_corners[i].multiplyScalar(Math.sqrt(PHI * Math.sqrt(5)/3));
		to_triaconta_far_corners[i].sub(normalized_virtualdodeca_vertices[original_dodeca_vertex]);
	}
	
//	var dodeca_types = Array(0);
//	for(var i = 0; i < dodeca_types.length; i++)
//		dodeca_types[i] = normalized_virtualdodeca_vertices[original_dodeca_vertex].clone();
	
//	dodeca_types[0].multiplyScalar(43);		//lp
//	dodeca_types[1].multiplyScalar(70);		//dr
//	dodeca_types[0].multiplyScalar(114); 	//lg
	
	var dgverts = Array(3);
	var overts = Array(3);
//	var lbverts = Array(3);
	var yverts = Array(30);
	var iverts = Array(12);
	var pverts = Array(3);
	var bverts = Array(3);
	
	//you get yourself to the right level using the first, give yourself outwardness using the second
	var usable_icosidodeca_verts = Array(3);
	var icosidodeca_displacers = Array(3);
	
	{	//yellow - good, lines up with orange
		var dodeca_vertex_separation_angle = normalized_virtualdodeca_vertices[0].angleTo(normalized_virtualdodeca_vertices[1]);
		var lowest_unused_yvert = 0;
		var lowest_unused_icosidodeca_vert = 0;
		for(var i = 0; i<20; i++){
			for(var j = i+1; j < 20; j++){
				if(Math.abs(normalized_virtualdodeca_vertices[i].angleTo(normalized_virtualdodeca_vertices[j]) - dodeca_vertex_separation_angle ) < 0.01 ){
					yverts[lowest_unused_yvert] = normalized_virtualdodeca_vertices[i].clone();
					yverts[lowest_unused_yvert].add(normalized_virtualdodeca_vertices[j]);
					yverts[lowest_unused_yvert].setLength(131);
					
					if(Math.abs(normalized_virtualdodeca_vertices[original_dodeca_vertex].angleTo(yverts[lowest_unused_yvert]) - dodeca_vertex_separation_angle / 2 ) < 0.01 ) {
						usable_icosidodeca_verts[lowest_unused_icosidodeca_vert] = yverts[lowest_unused_yvert].clone();
						icosidodeca_displacers[lowest_unused_icosidodeca_vert] = new THREE.Vector3();
						icosidodeca_displacers[lowest_unused_icosidodeca_vert].crossVectors(usable_icosidodeca_verts[lowest_unused_icosidodeca_vert],normalized_virtualdodeca_vertices[original_dodeca_vertex]);
						
						icosidodeca_displacers[lowest_unused_icosidodeca_vert].normalize();
						lowest_unused_icosidodeca_vert++;
					}
					
					lowest_unused_yvert++;
				}
			}	
		}
	}
	
	{	//bverts
		var alongness = 43 / (PHI*HS3) / 2;
		var upwardness = Math.sqrt( 92*92 - alongness*alongness);
		for(var i = 0; i < bverts.length; i++){
			bverts[i] = usable_icosidodeca_verts[i].clone();
			bverts[i].setLength(upwardness);
			var backto_normalized_dodeca = new THREE.Vector3();
			backto_normalized_dodeca.crossVectors(icosidodeca_displacers[i],usable_icosidodeca_verts[i]);
			backto_normalized_dodeca.setLength(alongness);
			bverts[i].add(backto_normalized_dodeca);
		}
	}
	
	{	//orange
		//find a way to line up with yellow
		var outwardness = 77/Math.sin(TAU/5) / 2;
		var alongness = PHI * 43 / (PHI*HS3) / 2;
		for(var i = 0; i < dgverts.length; i++ ) {
			overts[i] = usable_icosidodeca_verts[i].clone();
			overts[i].addScaledVector(icosidodeca_displacers[i],outwardness);
			var backto_normalized_dodeca = new THREE.Vector3();
			backto_normalized_dodeca.crossVectors(icosidodeca_displacers[i],usable_icosidodeca_verts[i]);
			backto_normalized_dodeca.setLength(alongness);
			overts[i].add(backto_normalized_dodeca);
		}
	}
	
	{	//purple
		var outwardness = PHI / 2 * 43 / (PHI*HS3);
		var upwardness = Math.sqrt(174*174 - outwardness * outwardness );
		for(var i = 0; i < pverts.length; i++ ) {
			pverts[i] = usable_icosidodeca_verts[i].clone();
			pverts[i].setLength(upwardness);
			pverts[i].addScaledVector(icosidodeca_displacers[i], outwardness);
		}
	}
	
	{	//black
		for(var i = 0; i < iverts.length; i++ ) {
			iverts[i] = normalized_virtualico_vertices[i].clone();
			iverts[i].setLength(77);
		}
	}
	
	{	//dark green
//		var distalong = dist_along_tria_edge(dodeca_types[0].length(),112 );
//		for(var i = 0; i < dgverts.length; i++ ) {
//			dgverts[i] = to_triaconta_far_corners[i].clone();
//			dgverts[i].setLength(distalong);
//			dgverts[i].add(dodeca_types[0]);
//		}
	}
	
	{	//light blue
		//same outwardness as lp
//		for(var i = 0; i < lbverts.length; i++){
//			lbverts[i] = to_triaconta_far_corners[i].clone();
//			lbverts[i].multiplyScalar(0.5);
//			lbverts[i].add(normalized_virtualdodeca_vertices[original_dodeca_vertex]);
//		}
	}
	
	//getting them on every vertex
	{
		//copy them all
		var num_in_dod_cluster = overts.length + pverts.length + bverts.length; // + dgverts.length;
		QCatom_positions = Array(20 * num_in_dod_cluster + yverts.length); // + iverts.length);
		
		//TODO lots of little icosahedrons
		QC_atoms = new THREE.Points( new THREE.BufferGeometry(), new THREE.PointsMaterial({size: 0.79,vertexColors: THREE.VertexColors}));
		QC_atoms.geometry.addAttribute( 'position', new THREE.BufferAttribute(new Float32Array(QCatom_positions.length * 3), 3) );
		QC_atoms.geometry.addAttribute( 'color', new THREE.BufferAttribute(new Float32Array(QCatom_positions.length * 3), 3) );
		QC_atoms.scale.set(2,2,2);
		
		for(var dodeca_vertex_offset = 0; dodeca_vertex_offset < 20 * num_in_dod_cluster; dodeca_vertex_offset += num_in_dod_cluster){
			var offset = dodeca_vertex_offset;
			
//			for(var i = 0; i < dodeca_types.length; i++){
//				QCatom_positions[offset + i] = dodeca_types[i].clone();
//				QC_atoms.geometry.attributes.color.setXYZ(offset+i,141/256,199/256,70/256)
//			}
//			offset += dodeca_types.length;
			
//			for(var i = 0; i < dgverts.length; i++){
//				QCatom_positions[offset + i] = dgverts[i].clone();
//				QC_atoms.geometry.attributes.color.setXYZ(offset+i,88/256,156/256,62/256);
//			}
//			offset += dgverts.length;
			
			for(var i = 0; i < pverts.length; i++) {
				QCatom_positions[offset + i] = pverts[i].clone();
				QC_atoms.geometry.attributes.color.setXYZ(offset+i,149/256,91/256,173/256);
			}
			offset += pverts.length;
			
			for(var i = 0; i < overts.length; i++) {
				QCatom_positions[offset + i] = overts[i].clone();
				QC_atoms.geometry.attributes.color.setXYZ(offset+i,236/256,113/256,38/256);
			}
			offset += overts.length;
			
			for(var i = 0; i < bverts.length; i++) {
				QCatom_positions[offset + i] = bverts[i].clone();
				QC_atoms.geometry.attributes.color.setXYZ(offset+i,0/256,110/256,198/256);
			}
			offset += bverts.length;
			
//			for(var i = 0; i < lbverts.length; i++) {
//				QCatom_positions[offset + i] = lbverts[i].clone();
//				QC_atoms.geometry.attributes.color.setXYZ(offset+i,67/256,196/256,199/256);
//			}
//			offset += lbverts.length;
		}
		
		for(var i = 0; i < yverts.length; i++){
			var myindex = 20 * num_in_dod_cluster + i;
			QCatom_positions[myindex] = yverts[i].clone();
			QC_atoms.geometry.attributes.color.setXYZ(myindex,253/256,232/256,37/256);
		}
//		for(var i = 0; i < iverts.length; i++) {
//			var myindex = 20 * num_in_dod_cluster + yverts.length + i;
//			QCatom_positions[myindex] = iverts[i].clone();
//			QC_atoms.geometry.attributes.color.setXYZ(myindex,0.01,0.01,0.01);
//		}
		
		//a weird axis that we use to get half of them upside-down
		var crazy_axis_intermediate = new THREE.Vector3();
		crazy_axis_intermediate.crossVectors(normalized_virtualdodeca_vertices[original_dodeca_vertex],normalized_virtualdodeca_vertices[vertex_on_the_way_to_opposite_original_vertex]);
		var crazy_axis = new THREE.Vector3();
		crazy_axis.crossVectors(crazy_axis_intermediate,normalized_virtualdodeca_vertices[original_dodeca_vertex]);
		crazy_axis.normalize();
		for(var i = num_in_dod_cluster * 10; i < num_in_dod_cluster * 20 + 0; i++)
			QCatom_positions[i].applyAxisAngle(crazy_axis,Math.PI);
		for(var i = num_in_dod_cluster * 10; i < num_in_dod_cluster * 20 + 0; i++)
			QCatom_positions[i].applyAxisAngle(normalized_virtualdodeca_vertices[original_dodeca_vertex],TAU/6); //thought we made it so this wasn't necessary. But it works
		
		//bring them to the other 18
		for(var i = 0; i < 3; i++){ //for each the axis
			for(var j = 0; j < 3; j++) {//for each rotation amount
				var ourcluster = 1+i*3+j;
				for(var k = 0; k < num_in_dod_cluster; k++){//for each in the cluster
					QCatom_positions[   ourcluster  * num_in_dod_cluster+k].applyAxisAngle(normalized_virtualico_vertices[useful_ico_vertices[i]],(j+1)*TAU/5);
					QCatom_positions[(ourcluster+10)* num_in_dod_cluster+k].applyAxisAngle(normalized_virtualico_vertices[useful_ico_vertices[i]],(j+1)*TAU/5);
				}
			}
		}
	}
	
//	var bigstring = "";
//	bigstring += QCatom_positions.length + "\n" + "test" + "\n";
//	for(var i = 0; i < QCatom_positions.length; i++){
//		var ourlen = Math.sqrt(QCatom_positions[i].x*QCatom_positions[i].x+QCatom_positions[i].y*QCatom_positions[i].y+QCatom_positions[i].z*QCatom_positions[i].z);
//		if( Math.abs(ourlen - 92) < 0.01)
//			bigstring += "N ";
//		else if( Math.abs(ourlen - 114) < 0.01)
//			bigstring += "F ";
//		else if( Math.abs(ourlen - 131) < 0.01)
//			bigstring += "S ";
//		else if( Math.abs(ourlen - 140) < 1)
//			bigstring += "O ";
//		else if( Math.abs(ourlen - 174) < 0.01)
//			bigstring += "C ";
//		else console.log(ourlen);
//		bigstring += QCatom_positions[i].x + " ";
//		bigstring += QCatom_positions[i].y + " ";
//		bigstring += QCatom_positions[i].z + " ";
//		bigstring += "\n"
//	}
//	console.log(bigstring);
	
	for(var i = 0; i < QCatom_positions.length; i++)
		insert_quasiatom(QCatom_positions[i],i);
//	console.log(QCatom_positions.length)
}

function insert_quasiatom(ourposition,lowest_unused_index){
	var multfactor = 0.0169;
	QC_atoms.geometry.attributes.position.setXYZ(lowest_unused_index, ourposition.x * multfactor, ourposition.y * multfactor, ourposition.z * multfactor );
	
	if(	QC_atoms.geometry.attributes.color.array[lowest_unused_index*3+0]===0 &&
		QC_atoms.geometry.attributes.color.array[lowest_unused_index*3+1]===0 &&
		QC_atoms.geometry.attributes.color.array[lowest_unused_index*3+2]===0
	  ){
		var wavelength = ourposition.lengthSq();
		wavelength /= 25000; //apparently as large as we get
		wavelength *= (781-380);
		wavelength += 380;
		if((wavelength >= 380) && (wavelength<440)){
	        QC_atoms.geometry.attributes.color.setXYZ(lowest_unused_index,	-(wavelength - 440) / (440 - 380),	0,	1);
	    }else if((wavelength >= 440) && (wavelength<490)){
	        QC_atoms.geometry.attributes.color.setXYZ(lowest_unused_index,	0,	(wavelength - 440) / (490 - 440),	1);
	    }else if((wavelength >= 490) && (wavelength<510)){
	        QC_atoms.geometry.attributes.color.setXYZ(lowest_unused_index,	0,	1,	-(wavelength - 510) / (510 - 490));
	    }else if((wavelength >= 510) && (wavelength<580)){
	        QC_atoms.geometry.attributes.color.setXYZ(lowest_unused_index,	(wavelength - 510) / (580 - 510),	1,	0);
	    }else if((wavelength >= 580) && (wavelength<645)){
	        QC_atoms.geometry.attributes.color.setXYZ(lowest_unused_index,	1,	-(wavelength - 645) / (645 - 580),	0);
	    }else if((wavelength >= 645) && (wavelength<781)){
	    	QC_atoms.geometry.attributes.color.setXYZ(lowest_unused_index,	1,	0,	0);
	    }else{
	    	QC_atoms.geometry.attributes.color.setXYZ(lowest_unused_index,	0,	0,	0);
	    };
	}
}

function dist_along_tria_edge(triaconta_minorvertex_radius,desired_r){
	
//	desired_r = triaconta_majorvertex_radius; //we want to make it so we can see them on the tria vertices and then remove this
//	var dodecaedgelen = triaconta_minorvertex_radius / (Math.sqrt(3)/4*(1+Math.sqrt(5)));
//	var tria_edgelen = 0.5 * Math.sqrt(1+PHI*PHI) * dodecaedgelen;
//	
//	console.log(Math.acos(get_cos_rule(triaconta_majorvertex_radius, tria_edgelen,triaconta_minorvertex_radius)));
	
	var ourangle = 1.3820857960113346;
	var completed_square_factor = desired_r * desired_r - Square(triaconta_minorvertex_radius * Math.sin(ourangle));
	var sol1 = triaconta_minorvertex_radius * Math.cos(ourangle) + Math.sqrt(completed_square_factor);
	var sol2 = triaconta_minorvertex_radius * Math.cos(ourangle) - Math.sqrt(completed_square_factor);
	if(sol2 > 0 && sol1 > 0){
		console.error("two positive solutions?"); //bastard. So do it by sight, it needs to line up with lb.
//		return sol2;
	}
	if(sol1 > 0)
		return sol1;
	else
		console.error("no positive solution?");
}