function initHoneycombs()
{
	var octa_honeycomb = new THREE.Object3D();
	
	var base_RD = new THREE.Mesh(new THREE.Geometry(), new THREE.MeshPhongMaterial({shading: THREE.FlatShading}));
	var RD_honeycomb = new THREE.Object3D();
	//we're imagining one with "cube" corners at (1,1,1)
	for(var i = 0; i < 6; i++) {
		var extra_pyramid = new THREE.ConeGeometry(Math.sqrt(2),1,4,1,true,TAU / 8); //the last one is theta start, which might be TAU / 8
		for(var j = 0; j < extra_pyramid.vertices.length; j++)
			extra_pyramid.vertices[j].y += 1.5;
		var extra_pyramid_matrix = new THREE.Matrix4();
		if(i===1) extra_pyramid_matrix.makeRotationAxis(xAxis, TAU / 4);
		if(i===2) extra_pyramid_matrix.makeRotationAxis(zAxis, TAU / 4);
		if(i===3) extra_pyramid_matrix.makeRotationAxis(xAxis,-TAU / 4);
		if(i===4) extra_pyramid_matrix.makeRotationAxis(zAxis,-TAU / 4);
		if(i===5) extra_pyramid_matrix.makeRotationAxis(xAxis, TAU / 2);
		base_RD.geometry.merge(extra_pyramid, extra_pyramid_matrix ); //might need another argument?
	}
	
	var base_octa = new THREE.Mesh(new THREE.OctahedronGeometry(1), new THREE.MeshPhongMaterial({shading: THREE.FlatShading}));
	var base_l_tet = new THREE.Mesh( new THREE.TetrahedronGeometry( Math.sqrt(3) / 2 ), new THREE.MeshPhongMaterial({shading: THREE.FlatShading, color: 0xFF0000}));
	var base_r_tet = base_l_tet.clone();
	base_r_tet.rotateOnAxis(yAxis, TAU / 4);
	
	var lattice_width = 6;
	var spacing = 1.22;
	
	for(var i = -lattice_width; i < lattice_width; i++) {
	for(var j = -lattice_width; j < lattice_width; j++) {
	for(var k = -lattice_width; k < lattice_width; k++) {
		if( (i+j+k) % 2 
//				|| i+j+k > 0 
				)
			continue;
		
		var new_RD = base_RD.clone();
		new_RD.position.set(i * spacing * 2,j * spacing * 2,k * spacing * 2);
		RD_honeycomb.add( new_RD );
		
		var new_octa = base_octa.clone();
		new_octa.position.set(i * spacing,j * spacing,k * spacing);
		octa_honeycomb.add( new_octa );
		
		var new_l_tet = base_l_tet.clone();
		new_l_tet.position.set(i * spacing + spacing * -0.5,j * spacing + spacing * -0.5,k * spacing + spacing * 0.5);
		octa_honeycomb.add( new_l_tet );
		
		var new_r_tet = base_r_tet.clone();
		new_r_tet.position.set(i * spacing + spacing * -0.5,j * spacing + spacing * 0.5,k * spacing + spacing * 0.5);
		octa_honeycomb.add( new_r_tet );
	}
	}
	}
	
	octa_honeycomb.update = function()
	{
		octa_honeycomb.updateMatrixWorld();
		for(var i = 0, il = octa_honeycomb.children.length; i < il; i++)
		{
			var abs_position = octa_honeycomb.children[i].position.clone();
			octa_honeycomb.localToWorld(abs_position);
			if( abs_position.y > -0.2 )
				octa_honeycomb.children[i].visible = false;
			else
				octa_honeycomb.children[i].visible = true;
		}
	}
	
	var cubic_lattice = new THREE.Mesh(new THREE.Geometry(), new THREE.MeshPhongMaterial({shading: THREE.FlatShading}));
	var atomic_cubic_lattice = new THREE.Object3D();
	var latticeShadow = new THREE.Object3D();
	var cubes_wide = 9;
	var cube_edgelen = 0.3;
	var cubicLatticeScale = 0.3;
	var cube_spacing = cube_edgelen * 1.1;
	var atomTemplate = new THREE.Mesh(new THREE.SphereGeometry(cube_edgelen/5), new THREE.MeshPhongMaterial({}));
	var shadowTemplate = new THREE.Mesh(new THREE.CircleGeometry(cube_edgelen/5*cubicLatticeScale, 14), new THREE.MeshBasicMaterial({color:0x000000}));
	for(var i = 0; i < shadowTemplate.geometry.vertices.length; i++)
	{
		shadowTemplate.geometry.vertices[i].z =-shadowTemplate.geometry.vertices[i].y;
		shadowTemplate.geometry.vertices[i].y =-cube_edgelen/5;
	}
	for(var i = 0; i < cubes_wide; i++)
		for(var j = 0; j < cubes_wide; j++)
			for(var k = 0; k < cubes_wide; k++)
			{
				var cubicAtom = new THREE.Mesh( atomTemplate.geometry, atomTemplate.material );
				cubicAtom.position.set(
						(i- (cubes_wide-1) / 2) * cube_spacing,
						(j- (cubes_wide-1) / 2) * cube_spacing,
						(k- (cubes_wide-1) / 2) * cube_spacing );
				atomic_cubic_lattice.add(cubicAtom);
				var atomShadow = new THREE.Mesh( shadowTemplate.geometry, shadowTemplate.material );
				latticeShadow.add( atomShadow );
				
				var newcube_geo = new THREE.BoxGeometry(cube_edgelen,cube_edgelen,cube_edgelen);
				var newcube_mat = new THREE.Matrix4();
				newcube_mat.setPosition( cubicAtom.position );
				cubic_lattice.geometry.merge(newcube_geo, newcube_mat);
			}
	cubic_lattice.geometry.mergeVertices();
	
	cubic_lattice.scale.set(cubicLatticeScale,cubicLatticeScale,cubicLatticeScale);
	atomic_cubic_lattice.scale.set(cubicLatticeScale,cubicLatticeScale,cubicLatticeScale);
//	latticeShadow.scale.set(cubicLatticeScale*cubicLatticeScale,cubicLatticeScale*cubicLatticeScale,cubicLatticeScale*cubicLatticeScale);
	latticeShadow.position.y =-cube_edgelen * cubes_wide * cubicLatticeScale;
	atomic_cubic_lattice.update = function()
	{
		Protein.updateMatrixWorld();
		for(var i = 0, il = latticeShadow.children.length; i < il; i++ )
		{
			latticeShadow.children[i].position.copy( atomic_cubic_lattice.children[i].position );
			latticeShadow.children[i].position.applyMatrix4(atomic_cubic_lattice.matrix);
			latticeShadow.children[i].position.y = 0;
			//speedup opportunity: single geometry
		}
	}
	
//	Protein.add( atomic_cubic_lattice );
//	Protein.add( latticeShadow );
//	Protein.add(cubic_lattice);
	
	var rhombicDodecaScale = 0.02;
	RD_honeycomb.scale.set(rhombicDodecaScale,rhombicDodecaScale,rhombicDodecaScale);
	octa_honeycomb.scale.set(rhombicDodecaScale*2,rhombicDodecaScale*2,rhombicDodecaScale*2);
	Protein.add(octa_honeycomb);
}