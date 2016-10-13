/*
 * TODO
 * Ok so we're making a "close" button. Demonstrate it before showing hexagon lattice. It snaps(?), it closes, it inflates. It deflates, it opens.
 * So should you have irreg first? Snapping and projecting do make CK a little more complex
 * 
 * Size limits: don't have them when they're interacting, even if they make it colossal. Bring it back when they let go, but don't snap it. It just feels overcomplicated.
 * QS still has size limits but that's because of pattern limitation and the fact that it stays shut. It gets the GrabbableArrow too.
 * 
 * Couldn't you cut a football out of a football-like pattern? Such a neat idea
 * 
 * How about the CK "curiosity" is that you get pentagons out of a pattern of hexagons? Gives them an opportunity to notice the irreg connection
 * 
 * colors
 * change angles of mouse movement such that rotation is slightly more probable than it currently is
 * get rid of weird flash. Probably occurring because you have some special case for keeping the hexagons visible when openness is 1
 * some alpha for the boundaries of the circle
 * click on lattice, little flash and explosion. Bigger flash when they let go
 * remove flatlattice crap
 * Maybe take a few frames to snap it, THEN let it start closing
 * 
 * Have black edges inside the net too
 * 
 * When it closes up, could have it close up in the position that all the viruses are in.
 * 
 * It does require training, it is a bit weird. Not everyone gets that letting go changes it.
 * Could show the capsid closed, then open,
 * 
 * Could have a combination for snapping: when they make it MASSIVE or tiny, it automatically goes back when they let go
 * But it's when they press the button that it snapes properly.
 * Reasoning is that the size thing they'll see why, and it will look weird to have it go far like that when they press the button.
 */

function UpdateCapsid() {
	var oldcapsidopenness = capsidopenness;
	
	var magnitudespeed = 0.012;
	
	if( IrregButton.capsidopen )
		capsidopeningspeed = magnitudespeed;
	else
		capsidopeningspeed = -magnitudespeed;
	
	capsidopenness += capsidopeningspeed;
	
	if(capsidopenness > 1) {
		capsidopenness = 1;
		capsidopeningspeed = 0;
	}
	if(capsidopenness < 0) {
		capsidopenness = 0;
		capsidopeningspeed = 0;
	}
	
	CK_deduce_surface(capsidopenness, surface_vertices);
	
	surface_vertices.needsUpdate = true;
	
	//-------Rotation. If you're open you see nothing because the quaternion is slerped to the open_quaternion
	if(capsidopenness === 0)
	{
		if( !IrregButton.capsidopen ) 
		{
			surfaceangle = Mouse_delta.length() / 2.3;
			
			surface_rotationaxis.set(-Mouse_delta.y, Mouse_delta.x, 0);
			surface.worldToLocal(surface_rotationaxis);
			surface_rotationaxis.normalize();
		}
		else
			surfaceangle *= 0.93;
		//TODO swap it around so it doesn't have to rotate that much when opening
		
		surface.rotateOnAxis(surface_rotationaxis,surfaceangle);
		for(var i = 0; i < surfperimeter_cylinders.length; i++ )
			surfperimeter_cylinders[i].rotateOnAxis(surface_rotationaxis,surfaceangle);
		surface.updateMatrixWorld();
		for(var i = 0; i < surfperimeter_cylinders.length; i++ )
			surfperimeter_cylinders[i].updateMatrixWorld()
	}
	
	//when you're opening, move towards this certain quaternion
	if( IrregButton.capsidopen )
	{
		var open_quaternion = new THREE.Quaternion(0,0,0,1);
		var interpolationfactor = 0.03 + 0.97 * Math.pow(capsidopenness,10); //may want to massively reduce this power
		
		surface.quaternion.slerp(open_quaternion, interpolationfactor); //if capsidopenness = 1 we want it to be entirely the open quaternion, i.e. t = 1
		for(var i = 0; i < surfperimeter_cylinders.length; i++ )
			surfperimeter_cylinders[i].quaternion.slerp(open_quaternion, interpolationfactor);
	}
	else if( capsidopenness !== 0 ) { //while you're closing, move towards this certain quaternion
		//we'd like to have something about making it look like the picture, but there's an unfortunate dependence on which of the six states can give you CMV
		var closed_quaternion = new THREE.Quaternion();
		var truncated_latticeAngle = LatticeAngle;
		while( truncated_latticeAngle < 0 )
			truncated_latticeAngle += TAU;
		while( truncated_latticeAngle > TAU )
			truncated_latticeAngle -= TAU;
		if( Math.abs( truncated_latticeAngle - 0.7137243 ) < 0.1 )
			closed_quaternion.set(-0.253408169337206, 0.027135037557069655, 0.0840263953918781, 0.96332110655139);
		if( Math.abs( truncated_latticeAngle - 1.76092194 ) < 0.1 )
			closed_quaternion.set(-0.265881135161026, 0.001549389187642092, -0.020181975326924, 0.96379329175426);
		if( Math.abs( truncated_latticeAngle - 2.808119463 ) < 0.1 )
			closed_quaternion.set(-0.247214685644899, -0.02639585945717817, -0.124304951581996, 0.96059171181996);
		if( Math.abs( truncated_latticeAngle - (-2.42786829 + TAU) ) < 0.1 )
			closed_quaternion.set(0.3053824464601475, -0.03619975061311337, 0.0804235151960733, 0.94813669776729);
		if( Math.abs( truncated_latticeAngle - (-1.38067069 + TAU) ) < 0.1 )
			closed_quaternion.set(0.2985449012177967, -0.00111538304141928, -0.017842511786579, 0.95422813972900);
		if( Math.abs( truncated_latticeAngle - (-0.33347318 + TAU) ) < 0.1 )
			closed_quaternion.set(0.28726102554023203, 0.0337422051876268, -0.1236943313920196, 0.94923246845866);
		var interpolationfactor = 0.03 + 0.97 * Math.pow(1-capsidopenness,10); //may want to massively reduce this power
		
		surface.quaternion.slerp(closed_quaternion, interpolationfactor);
		for(var i = 0; i < surfperimeter_cylinders.length; i++ )
			surfperimeter_cylinders[i].quaternion.slerp(closed_quaternion, interpolationfactor);
	}

	surface.updateMatrixWorld();
	
	//avoid the back face showing
//	{
//		var forwardvector = new THREE.Vector3(0,0,1);
//		surface.worldToLocal( forwardvector );
//		
//		var face_centers_indices = Array(3,7,12,16,21,25,30,34,38,42);
//		var closest_angle = surface.geometry.vertices[ 0 ].angleTo( forwardvector );
//		var closest_index = 0;
//		
//		//0 is the one you swap with
//		for(var i = 0; i < face_centers_indices.length; i++)
//		{
//			var potential_angle = surface.geometry.vertices[ face_centers_indices[i] ].angleTo( forwardvector );
//			if( potential_angle < closest_angle )
//			{
//				closest_angle = potential_angle;
//				closest_index = face_centers_indices[i];
//			}
//		}
//		
//		if(closest_index !== 0 )
//		{
//			var swap_axis = surface.geometry.vertices[ closest_index ].clone();
//			swap_axis.add( surface.geometry.vertices[ 0 ] );
//			swap_axis.normalize();
//			surface.rotateOnAxis( swap_axis, Math.PI );
//		}
//	}
	
	for( var i = 0; i < 22; i++){
		var d = get_vector(i, SURFACE);
		d.applyAxisAngle( z_central_axis, -LatticeAngle);
		d.multiplyScalar(Lattice_ring_density_factor/LatticeScale);
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

function CK_deduce_surface(openness){
	//you need to just rotate it so that the first two points are in the same 2D locations as the 2D ones.
	//the first three vertices
	{		
		var triangle_projected_angle = deduce_first_triangle(openness, surface_vertices, 0);
		deduce_first_triangle(openness, surface_vertices, 2.5 * triangle_projected_angle - TAU/3);
	}
	
	var bend_angle = Math.acos(-Math.sqrt(5)/3);
	bend_angle = bend_angle + openness * (TAU/2 - bend_angle);
	
	var a = new THREE.Vector3(
			surface_vertices.array[0 * 3 + 0],
			surface_vertices.array[0 * 3 + 1],
			surface_vertices.array[0 * 3 + 2]);	
	var b = new THREE.Vector3(
			surface_vertices.array[1 * 3 + 0],
			surface_vertices.array[1 * 3 + 1],
			surface_vertices.array[1 * 3 + 2]);
	var edgelength = a.distanceTo(b);
		
	for( var i = 3; i < 22; i++) {
		var a_index = vertices_derivations[i][0];
		var b_index = vertices_derivations[i][1];
		var c_index = vertices_derivations[i][2];
			
		var a = new THREE.Vector3(
			surface_vertices.array[a_index * 3 + 0],
			surface_vertices.array[a_index * 3 + 1],
			surface_vertices.array[a_index * 3 + 2]);	
		var b = new THREE.Vector3(
			surface_vertices.array[b_index * 3 + 0],
			surface_vertices.array[b_index * 3 + 1],
			surface_vertices.array[b_index * 3 + 2]);
		var c = new THREE.Vector3(
			surface_vertices.array[c_index * 3 + 0],
			surface_vertices.array[c_index * 3 + 1],
			surface_vertices.array[c_index * 3 + 2]);
		
		var d = bent_down_quad_corner(a,b,c,bend_angle,0.5 * edgelength, HS3 * edgelength);
		
		surface_vertices.setXYZ(i, d.x,d.y,d.z);
	}
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
			
			put_tube_in_buffer(A,B, surfperimeter_cylinders[i].geometry.attributes.position.array, surfperimeterradius/LatticeScale*Lattice_ring_density_factor);
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