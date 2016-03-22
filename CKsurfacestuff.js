/*
 * TODO
 * colors
 * make lattice points little spheres
 * more comfortable system for showing the pictures. 
 * 	-you probably need 3 anyway, along the top or whatever: EM (always b&w)->EM+points->just points
 *  -or picture could move to the corner where there's no arms
 * Some spherical projection lol. I mean it is a nice visual effect. Maybe make it semi icosahedral, QS semi dodecahedral
 * Could make the virus pictures 3D? urgh, maybe in VR
 * 
 * Could have a solid circle (might be better as a dodecagon so you can see it spin), out of which the surface is "cut"
 */
function put_picture_in_place(){
	for(var i = 0; i < picture_objects.length; i++){
		scene.remove(picture_objects[i]);
	}
	
	var tolerance = 0.01;
	for(var i = 0; i < viruspicture_scales.length; i++){
		if(Math.abs(LatticeScale-viruspicture_scales[i]) < tolerance)
			scene.add(picture_objects[i]);
	}
}

function UpdateCapsid() {
	var oldcapsidopenness = capsidopenness;
	
	if(isMouseDown)
		capsidopeningspeed = 0.018;
	else
		capsidopeningspeed = -0.018;
	
	capsidopenness += capsidopeningspeed;
	
	if(capsidopenness > 1) {
		capsidopenness = 1;
		capsidopeningspeed = 0;
	}
	if(capsidopenness < 0) {
		capsidopenness = 0;
		capsidopeningspeed = 0;
	}
	
//	if( (oldcapsidopenness != 0 && capsidopenness == 0) || (oldcapsidopenness == 0 && capsidopenness != 0 ) )
		put_picture_in_place();
	for(var i = 0; i < picture_objects.length; i++)
		picture_objects[i].material.opacity = 1 - capsidopenness;
	
	CK_deduce_surface(capsidopenness, surface_vertices);
	
	surface_vertices.needsUpdate = true;
	
	//when player clicks, it rotates so an axis points at them, then opens. Could be a nice anticipation, like the foot-stamp - make edges glow, or have particles from around it get sucked in
	
	var normalturningspeed = TAU/5/2; //this is the amount you want to do in a second
	normalturningspeed *= delta_t;	
	
	if(capsidopenness ===0) {
		surfaceangle += normalturningspeed;
	}
	else { //we want to get surfaceangle to zero
		while(surfaceangle > TAU / 10)
			surfaceangle -= TAU/5; //unnoticeable
		
		//when capsidopenness = 1, we want turningspeed to be -surfaceangle. We also want it to be a minimum of TAU/5/2 
		var turningspeed = Math.pow(capsidopenness, 5) * -surfaceangle;
		if(Math.abs(turningspeed) < normalturningspeed) {
			if(turningspeed > 0)
				turningspeed = normalturningspeed;
			else
				turningspeed = -normalturningspeed;
		}
		
		surfaceangle += turningspeed;
		
		if(Math.abs(surfaceangle) <= Math.abs(turningspeed) )
			surfaceangle = 0;
	}
	
	var idle_axis = new THREE.Vector3( 	surface_vertices.array[6*3+0] - surface_vertices.array[19*3+0],
									surface_vertices.array[6*3+1] - surface_vertices.array[19*3+1],
									surface_vertices.array[6*3+2] - surface_vertices.array[19*3+2]);
	idle_axis.normalize();
	
	var central_axis = new THREE.Vector3(0,0,1);
	
	for( var i = 0; i < 22; i++){
		var d = get_vector(i, SURFACE);
		d.applyAxisAngle(idle_axis, surfaceangle);
		d.applyAxisAngle(central_axis, -LatticeAngle);
		d.multiplyScalar(lattice_scalefactor/LatticeScale);
		surface_vertices.setXYZ(i, d.x,d.y,d.z);
	}
}

//TODO this could be done with the irreg one actually. Replace this if there are ever any problems with either. 
function deduce_first_triangle(openness, vertices_numbers, rotation) {
	var origin_height = (1-capsidopenness) * Math.sqrt( PHI*PHI+1) / 2;
	
	vertices_numbers.setXYZ(0, 0, 0, origin_height);
	
	var p = Math.atan(PHI) + capsidopenness * (TAU/4 - Math.atan(PHI));
	var v = new THREE.Vector3( Math.sin(p), 0, -Math.cos(p));
	v.setY(-Math.sin(rotation)*v.x);
	v.setX( Math.cos(rotation)*v.x);
	
	vertices_numbers.setXYZ(1, v.x, v.y, v.z + origin_height );
	
	var q = Math.atan(PHI/(PHI-1)) + capsidopenness* (TAU/4-Math.atan(PHI/(PHI-1))); //angle between triangle and the plane containing v and the z axis
	var sideways_vector = new THREE.Vector3(Math.sin(rotation),Math.cos(rotation),0); //it's in the xy plane
	sideways_vector.multiplyScalar(Math.sin(q));		
	var downward_vector = new THREE.Vector3(0,0,0);
	downward_vector.crossVectors(sideways_vector,v);
	downward_vector.normalize();
	downward_vector.multiplyScalar(Math.cos(q));
	var base_to_top_unit_vector = new THREE.Vector3(); //this unit vector goes along the surface of the triangle, perpendicularly up from its base, v.
	base_to_top_unit_vector.addVectors(downward_vector, sideways_vector);
	
	var top_origin = v.clone();
	top_origin.normalize();
	var cos_first_triangle_angle = get_cos_rule(1,1,1);
	var top_origin_length = cos_first_triangle_angle;
	top_origin.multiplyScalar(top_origin_length);
	
	var base_to_top_length = Math.sqrt(1-top_origin_length*top_origin_length);
	var top = base_to_top_unit_vector.clone();
	top.multiplyScalar(base_to_top_length);
	top.add(top_origin);
	
	vertices_numbers.setXYZ(2, top.x, top.y, top.z + origin_height );
	
	var v2 = new THREE.Vector2(v.x,v.y);
	var top_planar = new THREE.Vector2(top.x,top.y);
	return Math.acos(v2.dot(top_planar) / v2.length() / top_planar.length());
}

function CK_deduce_surface(openness, vertices_numbers){
	//you need to just rotate it so that the first two points are in the same 2D locations as the 2D ones.
	//the first three vertices
	{		
		var triangle_projected_angle = deduce_first_triangle(openness, vertices_numbers, 0);
		deduce_first_triangle(openness, vertices_numbers, 2.5 * triangle_projected_angle - TAU/3);
	}
	
	deduce_most_of_surface_regular(openness, vertices_numbers); //to use the flatnet all you need to do is take away the _regular
}

function ziplocation(a1,a2,b1,b2,zipwidth){
	dist1 = a1.distanceTo(b1);
	dist2 = a2.distanceTo(b2);
	if(dist1 > zipwidth && dist2 > zipwidth) return "not on here";
	
	var proportion_along_midline;
	var zippoint;
	if(dist1>dist2){
		proportion_along_midline = (zipwidth-dist2)/(dist1-dist2);
		if(proportion_along_midline > 1 || proportion_along_midline < 0) return "invalid";
		
		zippoint = a2.clone();
		zippoint.lerp(b2,0.5);
		
		var endzippoint = a1.clone();
		endzippoint.lerp(b1,0.5);
		
		zippoint.lerp(endzippoint,proportion_along_midline);
	}
	else {
		proportion_along_midline = (zipwidth-dist1)/(dist2-dist1);
		if(proportion_along_midline > 1 || proportion_along_midline < 0) return "invalid";
		
		zippoint = a1.clone();
		zippoint.lerp(b1,0.5);
		
		var endzippoint = a2.clone();
		endzippoint.lerp(b2,0.5);
		
		zippoint.lerp(endzippoint,proportion_along_midline);
	}
	
	return zippoint;
}

function change_radius(sphere, radius) {
	var current_radius = Math.sqrt( Math.pow(sphere.geometry.attributes.position.array[0],2)+Math.pow(sphere.geometry.attributes.position.array[1],2)+Math.pow(sphere.geometry.attributes.position.array[2],2) );
	for( var i = 0; i < sphere.geometry.attributes.position.array.length; i++) {
		sphere.geometry.attributes.position.array[i] *= radius / current_radius;
	}
	sphere.geometry.attributes.position.needsUpdate = true;
}

function update_surfperimeter() {
	var surfperimeterradius = 0;
	var proportion_of_opening_for_swell = 1;
	if( capsidopenness < proportion_of_opening_for_swell )
		surfperimeterradius = capsidopenness / proportion_of_opening_for_swell * surfperimeter_default_radius;
	else
		surfperimeterradius = surfperimeter_default_radius;
	
	var a1index, a2index, b1index, b2index;
	var a1,a2,b1,b2;
	a1 = new THREE.Vector3(0,0,0);
	for( var i = 0; i < surfperimeter_cylinders.length; i++){
		put_tube_in_buffer(a1,a1, surfperimeter_cylinders[i].geometry.attributes.position.array);
		surfperimeter_spheres[i].position.copy(a1);
		
		surfperimeter_cylinders[i].geometry.attributes.position.needsUpdate = true;
		surfperimeter_spheres[i].geometry.attributes.position.needsUpdate = true;
	}
	if(capsidopenness!=0) {
		for(var i = 0; i < 22; i++) {
			var Aindex = surfperimeter_line_index_pairs[i*2];
			var Bindex = surfperimeter_line_index_pairs[i*2+1];
			
			A = new THREE.Vector3(
					surface_vertices.array[Aindex*3+0],
					surface_vertices.array[Aindex*3+1],
					surface_vertices.array[Aindex*3+2]);
			B = new THREE.Vector3(
					surface_vertices.array[Bindex*3+0],
					surface_vertices.array[Bindex*3+1],
					surface_vertices.array[Bindex*3+2]);
			
			change_radius(surfperimeter_spheres[i], surfperimeterradius);
			surfperimeter_spheres[i].position.copy(A);
			
			put_tube_in_buffer(A,B, surfperimeter_cylinders[i].geometry.attributes.position.array, surfperimeterradius/LatticeScale*lattice_scalefactor);
		}
	}
	
	var proportion_of_opening_for_blast = 0.36;
	var blast_location = capsidopenness / proportion_of_opening_for_blast * 3;
	var blast_end = (capsidopenness+0.07) / proportion_of_opening_for_blast * 3;
	
	for( var grooveside = 0; grooveside < 10; grooveside++) {
		var groove = Math.floor(grooveside / 2);
		
		if( blast_end > 3 || blast_location === 0 || capsidopeningspeed < 0 ){
			put_tube_in_buffer(new THREE.Vector3(0,0,0), new THREE.Vector3(0,0,0), blast_cylinders[grooveside].geometry.attributes.position.array, surfperimeter_default_radius);
			blast_cylinders[grooveside].geometry.attributes.position.needsUpdate = true;
			continue;
		}
		
		for( var level = 0; level < groovepoints[groove].length/2-1; level++) {
			if( level < Math.floor(blast_location) || level > Math.floor(blast_end)  )
				continue;
			
			var a1index = a2index = 0;
			if( level < groovepoints[groove].length/2-1) { //if we have a "valid" value
				if( grooveside % 2 === 0) {
					a1index = groovepoints[groove][level*2+0];
					a2index = groovepoints[groove][level*2+2];
				}
				else {
					a1index = groovepoints[groove][level*2+1];
					a2index = groovepoints[groove][level*2+3];
				}
			}
			var a1 = new THREE.Vector3(
					surface_vertices.array[a1index*3+0],
					surface_vertices.array[a1index*3+1],
					surface_vertices.array[a1index*3+2]);
			var a2 = new THREE.Vector3(
					surface_vertices.array[a2index*3+0],
					surface_vertices.array[a2index*3+1],
					surface_vertices.array[a2index*3+2]);
			
			var blastflash_beginning = a2.clone();
			blastflash_beginning.sub(a1);
			var blastflash_end = blastflash_beginning.clone();
			
			blastflash_beginning.multiplyScalar(blast_location - level);
			blastflash_end.multiplyScalar(blast_end - level);
			blastflash_beginning.add(a1);
			blastflash_end.add(a1);
			
			if(blast_end - level > 1)
				blastflash_end.copy(a2);
			if(blast_location - level < 0)
				blastflash_beginning.copy(a1);
					
			put_tube_in_buffer(blastflash_beginning,blastflash_end, blast_cylinders[grooveside].geometry.attributes.position.array, surfperimeter_default_radius * 1.5);
			
			blast_cylinders[grooveside].geometry.attributes.position.needsUpdate = true;
		}
	}
}