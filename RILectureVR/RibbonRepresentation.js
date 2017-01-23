function Insert_ribbon_representation_mesh(MyGeometry,geometryAtoms,CylinderSides,Num_vertices_between_CAs){
	//first, try giving the length between the CAs as the length of the normal vectors
		
	var TraceRadius = 0.2;
	
	var BondVectorNorm = new THREE.Vector3();
	
	var PP_index = 0;
	var ActivePositions = Array(3);
	for(var i = 0; i < ActivePositions.length; i++)
		ActivePositions[i] = new THREE.Vector3();
	
	var BezierLengths = 0;
	
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
		BezierLengths = LeftArm.length(); 
		LeftArm.normalize();
		
		var TickVector = Random_perp_vector(LeftArm);
		TickVector.setLength(TraceRadius);
		
		for(var j = 0; j < CylinderSides; j++) {
			MyGeometry.vertices[j].set(
					TickVector.x + ActivePositions[0].x,
					TickVector.y + ActivePositions[0].y,
					TickVector.z + ActivePositions[0].z); //hmm, this is the only place where you have absolute position!
			
			TickVector.applyAxisAngle(LeftArm, -TAU / CylinderSides);
		}
	}
	
	var PlaneNormal = new THREE.Vector3();
	var BezNormal = new THREE.Vector3();
	var CurrBezReverseNormal = new THREE.Vector3();
	var VertexBundleIndex = 0;
	
	for(var i = 0; i < geometryAtoms.atomIDs.length; i++){
		if(IsBackBone(geometryAtoms.atomIDs[i] ) ){
			ActivePositions[0].copy(ActivePositions[1]);
			ActivePositions[1].copy(ActivePositions[2]);
			ActivePositions[2].copy(geometryAtoms.vertices[i]);
			
			if( 2 <= PP_index ){
				VertexBundleIndex = (PP_index - 1) * Num_vertices_between_CAs * CylinderSides;
				
				Insert_PlaneNormal_and_turnvertices(MyGeometry, ActivePositions, VertexBundleIndex, PlaneNormal);
				
//				for(var j = 0; j < CylinderSides; j++)
//					MyGeometry.vertices[(PP_index - 1) * CylinderSides + j].copy(ActivePositions[1]);
				
				CurrBezReverseNormal.copy(PlaneNormal);
				CurrBezReverseNormal.negate();
				CurrBezReverseNormal.add(ActivePositions[3]);
				
				var InterpolationCurve = new THREE.CubicBezierCurve3(
						ActivePositions[0],
						PrevBezNormal,
						CurrBezReverseNormal,
						ActivePositions[1]
					);
				
				for(var i = 0; i < Num_vertices_between_CAs; i++){
							InterpolationCurve.getPoint(i / Num_vertices_between_CAs);
							InterpolationCurve.getTangent(i/Num_vertices_between_CAs);
					
							Insert_PlaneNormal_and_turnvertices(MyGeometry, ActivePositions, PrevVertexBundleIndex, PlaneNormal);
				}
				
				PrevBezNormal.copy(PlaneNormal);
				PrevBezNormal.setLength(BezierLengths);
				PrevBezNormal.add(ActivePositions[1]);
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

function Insert_PlaneNormal_and_turnvertices(MyGeometry,ActivePositions, VertexBundleIndex, PlaneNormal,CylinderSides){
	var LeftArm = ActivePositions[1].clone();
	var RightArm = ActivePositions[1].clone();
	LeftArm.sub(ActivePositions[0]);
	RightArm.sub(ActivePositions[2]);
	
	var Crossprod = new THREE.Vector3();
	Crossprod.crossVectors(LeftArm,RightArm);
	Crossprod.normalize();
	
	var BetweenArms = new THREE.Vector3();
	BetweenArms.copy(LeftArm);
	BetweenArms.applyAxisAngle(Crossprod, LeftArm.angleTo(RightArm) / 2); //SO, Speedup Opportunity
	PlaneNormal.crossVectors(Crossprod,BetweenArms);
	
	var PrevVertexToPP = new THREE.Vector3();
	var DistToPlane = 0;
	var PrevVertexBundleIndex = VertexBundleIndex - CylinderSides;
	
	for(var j = 0; j < CylinderSides; j++){
		PrevVertexToPP.copy(ActivePositions[1] );
		PrevVertexToPP.sub(MyGeometry.vertices[PrevVertexBundleIndex + j] );
		DistToPlane = PrevVertexToPP.dot(PlaneNormal) / LeftArm.dot(PlaneNormal);
		
		MyGeometry.vertices[VertexBundleIndex + j].copy(LeftArm);
		MyGeometry.vertices[VertexBundleIndex + j].multiplyScalar(DistToPlane);
		MyGeometry.vertices[VertexBundleIndex + j].add(
			MyGeometry.vertices[PrevVertexBundleIndex + j] );
	}
}

function Create_ribbon_representation_mesh(geometryAtoms){
	var MyGeometry = new THREE.Geometry();
	
	var CylinderSides = 6;
	var TraceColor = new THREE.Color( 0xff00ff );
	
	var num_CAs = 0;
	for(var i = 0; i < geometryAtoms.atomIDs.length; i++)
		if(IsBackBone(geometryAtoms.atomIDs[i] ) )
			num_CAs++;
	
	var Num_vertices_between_CAs = 1;
	var NumPPs = (num_CAs - 1) * (Num_vertices_between_CAs+1);
	
	MyGeometry.vertices = Array(NumPPs  * CylinderSides);
	MyGeometry.faces = Array((NumPPs-1) * CylinderSides);	
	for(var i = 0; i < MyGeometry.vertices.length; i++)
		MyGeometry.vertices[i] = new THREE.Vector3();
	for(var i = 0; i < NumPPs; i++) {
		for(var j = 0; j < CylinderSides; j++) {
			MyGeometry.faces[ (i-1) * CylinderSides * 2 + j*2+0 ] = new THREE.Face3(
					  i  * CylinderSides +  j,
					(i-1)* CylinderSides + (j + 1)%CylinderSides,
					(i-1)* CylinderSides +  j,
					new THREE.Vector3(),
					TraceColor,
					0 );
			
			MyGeometry.faces[ (i-1) * CylinderSides * 2 + j*2+1 ] = new THREE.Face3(
					  i  * CylinderSides +  j,
					  i  * CylinderSides + (j + 1)%CylinderSides,
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

	Insert_ribbon_representation_mesh(MyGeometry,geometryAtoms,CylinderSides,Num_vertices_between_CAs );
	
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