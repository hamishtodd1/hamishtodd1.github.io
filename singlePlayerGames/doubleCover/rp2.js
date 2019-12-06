function initRP2()
{
	var RP2 = new THREE.Object3D();
	
	var circumferenceSegments = 32;
	var arcSegments = 16;
	RP2.surface = new THREE.Mesh(new THREE.SphereGeometry(0.1, circumferenceSegments, arcSegments, 0, TAU, 0, TAU / 4 ),
		new THREE.MeshPhongMaterial({vertexColors: THREE.FaceColors, side: THREE.DoubleSide}) );
	
	//they wrap around circumference-wise
	for(var i = 0; i < RP2.surface.geometry.faces.length; i++)
	{
		if( i%4 < 2 )
			RP2.surface.geometry.faces[i].color.setRGB(1,0,1);
		else
			RP2.surface.geometry.faces[i].color.setRGB(0,1,1);
		
		if( i < circumferenceSegments * (arcSegments/8+1) )
			RP2.surface.geometry.faces[i].color.setRGB(0,0,1);
	}
	
	RP2.add(RP2.surface);
	
	RP2.hider = new THREE.Mesh(new THREE.CylinderGeometry(0.1005,0.1005,0.014,circumferenceSegments), new THREE.MeshPhongMaterial({color:0x000000}));
	RP2.hider.geometry.applyMatrix( (new THREE.Matrix4()).makeTranslation(0,0.007,0));
	RP2.hider.geometry.applyMatrix( (new THREE.Matrix4()).makeRotationAxis(xAxis, TAU / 4));
	RP2.add(RP2.hider);
	
	//maybe: you can look around and that lets you see the back. But it slowly turns back towards you
	
	RP2.update = function()
	{
		var initialDisplacementVector = new THREE.Vector3(0,0,-0.32);
		var displacementVector = initialDisplacementVector.clone();
		camera.updateMatrixWorld();
		camera.localToWorld(displacementVector);
		
		this.position.copy(displacementVector)
		
		var mouseMovementAxis = new THREE.Vector3( -mouseDelta.y, mouseDelta.x, 0);
		mouseMovementAxis.normalize();
		
		var mouseMovementQuaternion = new THREE.Quaternion().setFromAxisAngle(mouseMovementAxis, mouseDelta.length() / 80 );
		
		var spectatorDirection = initialDisplacementVector.clone();
		spectatorDirection.negate();
		
		for(var i = 0, il = this.surface.geometry.vertices.length; i < il; i++)
		{
			var ourVertex = this.surface.geometry.vertices[i];
			ourVertex.applyQuaternion(mouseMovementQuaternion);
			
			if( ourVertex.angleTo( spectatorDirection) > TAU / 4 )
			{
				var correctionAxis = ourVertex.clone();
				correctionAxis.cross( spectatorDirection);
				correctionAxis.cross(ourVertex);
				correctionAxis.normalize();
				
				ourVertex.applyAxisAngle(correctionAxis, TAU / 2);
			}
		}

		this.surface.geometry.verticesNeedUpdate = true;
		mouseDelta.set(0,0)
	}

	scene.add(RP2);
	
	return RP2;
}