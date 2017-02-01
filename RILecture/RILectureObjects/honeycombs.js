function initHoneycombs( presentation )
{
	var octaHoneycomb = new THREE.Object3D();
	
	var baseRD = new THREE.Mesh(new THREE.Geometry(),new THREE.MeshPhongMaterial({shading: THREE.FlatShading, color: 0xa3dfFF, transparent: true, opacity:1}));
//	var RDmat = new THREE.MeshPhongMaterial({shading: THREE.FlatShading, color: 0xa3dfFF, transparent: true, opacity:1});
	var RDhoneycomb = new THREE.Object3D();
	//we're imagining one with "cube" corners at (1,1,1)
	for(var i = 0; i < 6; i++) {
		var extra_pyramid = new THREE.ConeGeometry(Math.sqrt(2),1,4,1,true,TAU / 8);
		for(var j = 0; j < extra_pyramid.vertices.length; j++)
			extra_pyramid.vertices[j].y += 1.5;
		var extra_pyramid_matrix = new THREE.Matrix4();
		if(i===1) extra_pyramid_matrix.makeRotationAxis(xAxis, TAU / 4);
		if(i===2) extra_pyramid_matrix.makeRotationAxis(zAxis, TAU / 4);
		if(i===3) extra_pyramid_matrix.makeRotationAxis(xAxis,-TAU / 4);
		if(i===4) extra_pyramid_matrix.makeRotationAxis(zAxis,-TAU / 4);
		if(i===5) extra_pyramid_matrix.makeRotationAxis(xAxis, TAU / 2);
		baseRD.geometry.merge(extra_pyramid, extra_pyramid_matrix ); //might need another argument?
	}
	baseRD.geometry.computeFaceNormals();
	baseRD.geometry.computeVertexNormals();
		
	var lattice_width = 3;
	var spacing = 1.08;
	
	for(var i = -lattice_width; i < lattice_width; i++) {
	for(var j = -lattice_width; j < lattice_width; j++) {
	for(var k = -lattice_width; k < lattice_width; k++) {
		if( (i+j+k) % 2 
//				|| i+j+k > 0 
				)
			continue;
		
		var new_RD = new THREE.Mesh(new THREE.Geometry(),new THREE.MeshPhongMaterial({shading: THREE.FlatShading, color: 0xa3dfFF, transparent: true, opacity:1}));
		new_RD.geometry.copy(baseRD.geometry);
		new_RD.position.set(i * spacing * 2,j * spacing * 2,k * spacing * 2);
		RDhoneycomb.add( new_RD );
		
		var new_octa = new THREE.Mesh(new THREE.OctahedronGeometry(1), new THREE.MeshPhongMaterial({shading: THREE.FlatShading, transparent:true, opacity:1}));
		new_octa.position.set(i * spacing,j * spacing,k * spacing);
		octaHoneycomb.add( new_octa );
		
		var new_l_tet = new THREE.Mesh( new THREE.TetrahedronGeometry( Math.sqrt(3) / 2 ), new THREE.MeshPhongMaterial({shading: THREE.FlatShading, color: 0x47837B, transparent:true, opacity:1}));
		new_l_tet.position.set(i * spacing + spacing * -0.5,j * spacing + spacing * -0.5,k * spacing + spacing * 0.5);
		octaHoneycomb.add( new_l_tet );
		
		var new_r_tet = new THREE.Mesh( new THREE.TetrahedronGeometry( Math.sqrt(3) / 2 ), new THREE.MeshPhongMaterial({shading: THREE.FlatShading, color: 0x47837B, transparent:true, opacity:1}));
		new_r_tet.rotateOnAxis(yAxis, TAU / 4);
		new_r_tet.position.set(i * spacing + spacing * -0.5,j * spacing + spacing * 0.5,k * spacing + spacing * 0.5);
		octaHoneycomb.add( new_r_tet );
	}
	}
	}
	
	var updateDisappearingHoneycomb = function()
	{
		this.updateMatrixWorld();
		for(var i = 0, il = this.children.length; i < il; i++)
		{
			var abs_position = this.children[i].position.clone();
			this.localToWorld(abs_position);
			var hiddenY = -0.07;
			var visibleY = -0.08;
			if( abs_position.y > hiddenY )
				this.children[i].material.opacity = 0;
			if( abs_position.y < visibleY )
				this.children[i].material.opacity = 1;
			else
				this.children[i].material.opacity = 1 - ( abs_position.y - visibleY ) / ( hiddenY - visibleY );
		}
	}
	
	octaHoneycomb.update = updateDisappearingHoneycomb;
	RDhoneycomb.update = updateDisappearingHoneycomb;
	presentation.createNewHoldable("octaHoneycomb",octaHoneycomb);
	presentation.createNewHoldable("RDhoneycomb",RDhoneycomb);
	
	var cubicLattice = new THREE.Mesh(new THREE.Geometry(), new THREE.MeshPhongMaterial({shading: THREE.FlatShading}));
	var atomicCubicLattice = new THREE.Object3D();
	var latticeShadow = new THREE.Object3D();
	var cubes_wide = 9;
	var cube_edgelen = 0.2;
	var cubicLatticeScale = 0.06;
	var cube_spacing = cube_edgelen * 1.4;
	var atomTemplate = new THREE.Mesh(new THREE.SphereGeometry(cube_edgelen/5), new THREE.MeshPhongMaterial({}));
	var shadowTemplate = new THREE.Mesh(new THREE.CircleGeometry(cube_edgelen/5, 14), new THREE.MeshBasicMaterial({color:0x000000}));
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
				atomicCubicLattice.add(cubicAtom);
				var atomShadow = new THREE.Mesh( shadowTemplate.geometry, shadowTemplate.material );
				latticeShadow.add( atomShadow );
				
				var newcube_geo = new THREE.BoxGeometry(cube_edgelen,cube_edgelen,cube_edgelen);
				var newcube_mat = new THREE.Matrix4();
				newcube_mat.setPosition( cubicAtom.position );
				cubicLattice.geometry.merge(newcube_geo, newcube_mat);
			}
	cubicLattice.geometry.mergeVertices();
	
	cubicLattice.scale.setScalar( cubicLatticeScale );
	atomicCubicLattice.scale.setScalar( cubicLatticeScale );
	latticeShadow.scale.setScalar(cubicLatticeScale);
	
	atomicCubicLattice.update = function()
	{
		atomicCubicLattice.updateMatrix();
		var rotationMatrix = new THREE.Matrix4().extractRotation( atomicCubicLattice.matrix );
		for(var i = 0, il = latticeShadow.children.length; i < il; i++ )
		{
			latticeShadow.children[i].position.copy( atomicCubicLattice.children[i].position );
			latticeShadow.children[i].position.applyMatrix4(rotationMatrix);
			latticeShadow.children[i].position.y = 0;
			//speedup opportunity: single geometry
		}
		latticeShadow.position.copy(atomicCubicLattice.position);
		latticeShadow.position.y = -1.3;
	}
	
	presentation.createNewHoldable("atomicCubicLattice",atomicCubicLattice);
	presentation.createNewHoldable("latticeShadow",latticeShadow);
	presentation.createNewHoldable("cubicLattice",cubicLattice);
	
	var baseOcta = new THREE.Mesh(new THREE.OctahedronGeometry(1), new THREE.MeshPhongMaterial({shading: THREE.FlatShading}));
	var baseLTet = new THREE.Mesh( new THREE.TetrahedronGeometry( Math.sqrt(3) / 2 ), new THREE.MeshPhongMaterial({shading: THREE.FlatShading, color: 0x47837B, transparent:true, opacity:1}));
	
	presentation.createNewHoldable("baseRD", baseRD);
	presentation.createNewHoldable("baseLTet", baseLTet);
	presentation.createNewHoldable("baseOcta", baseOcta);
	
	var rhombicDodecaScale = 0.02;
	RDhoneycomb.scale.setScalar(rhombicDodecaScale);
	octaHoneycomb.scale.setScalar( rhombicDodecaScale*2);
	baseRD.scale.setScalar( rhombicDodecaScale);
	baseLTet.scale.setScalar( rhombicDodecaScale*2);
	baseOcta.scale.setScalar( rhombicDodecaScale*2);
}