//separate because the positions in geometryAtoms may change

/*
 * We will have N vectors going along the chain with us, N being the number of cylinder sides
 * shoot them along parallel with each backbone bond (or whatever else)
 * intersect them with planes.
 */

function Insert_trace_representation_mesh(MyGeometry,geometryAtoms,CylinderSides){
	var TraceRadius = 0.2;
	
	var BondVectorNorm = new THREE.Vector3();
	
	var PP_index = 0;
	var ActivePositions = Array(3);
	for(var i = 0; i < ActivePositions.length; i++)
		ActivePositions[i] = new THREE.Vector3();
	
	{
		var gotPP0 = 0;
		for(var i = 0; i < geometryAtoms.atomIDs.length; i++){
			if(IsBackBone(geometryAtoms.atomIDs[i] ) ){
				if(!gotPP0){
					ActivePositions[0].copy(geometryAtoms.vertices[i]);
					gotPP0 = 1;
				} else {
					ActivePositions[1].copy(geometryAtoms.vertices[i]);
					break;
				}
			}
		}
		
		var LeftArm = ActivePositions[1].clone();
		LeftArm.sub(ActivePositions[0]);
		LeftArm.normalize();
		
		var TickVector = Random_perp_vector(LeftArm);
		TickVector.setLength(TraceRadius);
		
		for(var j = 0; j < CylinderSides; j++) {
			MyGeometry.vertices[j].set(
					TickVector.x + ActivePositions[0].x,
					TickVector.y + ActivePositions[0].y,
					TickVector.z + ActivePositions[0].z);
			
			TickVector.applyAxisAngle(LeftArm, -TAU / CylinderSides);
		}
	}
	
	var PlaneNormal = new THREE.Vector3();
	
	for(var i = 0; i < geometryAtoms.atomIDs.length; i++){
		if(IsBackBone(geometryAtoms.atomIDs[i] ) ){
			ActivePositions[0].copy(ActivePositions[1]);
			ActivePositions[1].copy(ActivePositions[2]);
			ActivePositions[2].copy(geometryAtoms.vertices[i]);
			
			if( 2 <= PP_index ){
				
				
				for(var j = 0; j < CylinderSides; j++){
					VertexBundleIndex = (PP_index - 1) * CylinderSides;
					
					Insert_PlaneNormal_and_turnvertices(MyGeometry, ActivePositions, VertexBundleIndex, PlaneNormal,CylinderSides);
				}
				
//				for(var j = 0; j < CylinderSides; j++)
//					MyGeometry.vertices[(PP_index - 1) * CylinderSides + j].copy(ActivePositions[1]);
			}
			
			PP_index++;
		}
	}
	
	//last one
	for(var j = 0; j < CylinderSides; j++)
		MyGeometry.vertices[(PP_index - 1) * CylinderSides + j].copy(ActivePositions[2]);
	
	MyGeometry.computeFaceNormals();
	MyGeometry.computeVertexNormals();
}

function Create_trace_representation_mesh(geometryAtoms){
	var MyGeometry = new THREE.Geometry();
	
	var CylinderSides = 6;
	var TraceColor = new THREE.Color( 0xffff00 );
	
	var num_CAs = 0;
	for(var i = 0; i < geometryAtoms.atomIDs.length; i++)
		if(IsBackBone(geometryAtoms.atomIDs[i] ) )
			num_CAs++;
	
	MyGeometry.vertices = Array(num_CAs  * CylinderSides);
	MyGeometry.faces = Array((num_CAs-1) * CylinderSides);	
	for(var i = 0; i < MyGeometry.vertices.length; i++)
		MyGeometry.vertices[i] = new THREE.Vector3();
	for(var i = 0; i < num_CAs; i++) {
		for(var j = 0; j < CylinderSides; j++) {
			MyGeometry.faces[ (i-1) * CylinderSides * 2 + j*2+0 ] = new THREE.Face3(
					 i   * CylinderSides +  j,
					(i-1)* CylinderSides + (j + 1)%CylinderSides,
					(i-1)* CylinderSides +  j,
					new THREE.Vector3(),
					TraceColor,
					0 );
			
			MyGeometry.faces[ (i-1) * CylinderSides * 2 + j*2+1 ] = new THREE.Face3(
					 i   * CylinderSides +  j,
					 i   * CylinderSides + (j + 1)%CylinderSides,
					(i-1)* CylinderSides + (j + 1)%CylinderSides,
					new THREE.Vector3(),
					TraceColor,
					0 );
		}
	}
	
//	for(var i = CylinderSides * 2 * 2; i < MyGeometry.faces.length; i++){
//		MyGeometry.faces[i].a = 0;
//		MyGeometry.faces[i].b = 0;
//		MyGeometry.faces[i].c = 0;
//	}

	Insert_trace_representation_mesh(MyGeometry,geometryAtoms,CylinderSides );
	
	var TraceMaterial = new THREE.MeshPhongMaterial( { 
		specular: 0xffffff, 
		shininess: 100,
		vertexColors: THREE.FaceColors,
		shading: THREE.SmoothShading } );
	var TraceMesh = new THREE.Mesh( MyGeometry,TraceMaterial );
	TraceMesh.castShadow = true;
	TraceMesh.receiveShadow = true;
	
	return TraceMesh;
}

//Next thing to do is angle the circles. When the length of the cylinders is small and the trace is curved, "bend" won't matter 
//function Put_cylinder_in_geometry(MyGeometry)

function Create_sphere_representation_mesh(geometryAtoms){	
	var MyGeometry = new THREE.Geometry();	
	var SphereRadius = 0.4;
	var TemplateAtomGeometry = new THREE.IcosahedronGeometry( 0.4,1 );
	
	MyGeometry.vertices = Array(geometryAtoms.vertices.length * TemplateAtomGeometry.vertices.length);
	MyGeometry.faces 	= Array(geometryAtoms.vertices.length * TemplateAtomGeometry.faces.length);
	
	for(var i = 0; i < geometryAtoms.vertices.length; i++) {
		for( var j = 0; j < TemplateAtomGeometry.vertices.length; j++){
			MyGeometry.vertices[i * TemplateAtomGeometry.vertices.length + j] = new THREE.Vector3(
					TemplateAtomGeometry.vertices[j].x + geometryAtoms.vertices[i].x,
					TemplateAtomGeometry.vertices[j].y + geometryAtoms.vertices[i].y,
					TemplateAtomGeometry.vertices[j].z + geometryAtoms.vertices[i].z);
		}
		
		for( var j = 0; j < TemplateAtomGeometry.faces.length; j++){			
			MyGeometry.faces[i * TemplateAtomGeometry.faces.length + j] = new THREE.Face3(
					TemplateAtomGeometry.faces[j].a + i * TemplateAtomGeometry.vertices.length,
					TemplateAtomGeometry.faces[j].b + i * TemplateAtomGeometry.vertices.length,
					TemplateAtomGeometry.faces[j].c + i * TemplateAtomGeometry.vertices.length,
					new THREE.Vector3(),
					geometryAtoms.colors[i],
					0 );
		}
	}
	
	MyGeometry.computeFaceNormals();
	MyGeometry.computeVertexNormals();
	
	var SpheresMaterial = new THREE.MeshPhongMaterial( { 
		specular: 0xffffff, 
		shininess: 100,
		vertexColors: THREE.VertexColors,
		shading: THREE.SmoothShading } );
	
	var SpheresMesh = new THREE.Mesh( MyGeometry,SpheresMaterial );
	SpheresMesh.castShadow = true;
	SpheresMesh.receiveShadow = true;
	return SpheresMesh;
}