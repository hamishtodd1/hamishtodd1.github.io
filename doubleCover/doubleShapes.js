function initDoubleShape()
{
	var doubleShape = new THREE.Object3D();
	doubleShape.virtualQuaternion = new THREE.Quaternion();
	
	var singleFace = new THREE.Mesh(new THREE.Geometry, new THREE.MeshBasicMaterial({side:THREE.DoubleSide }));
	var radius = 0.1;
	singleFace.geometry.vertices.push(new THREE.Vector3( radius, radius, radius));
	singleFace.geometry.vertices.push(new THREE.Vector3(-radius, radius, radius));
	singleFace.geometry.vertices.push(new THREE.Vector3( radius,-radius, radius));
	singleFace.geometry.vertices.push(new THREE.Vector3(-radius,-radius, radius));
	
	singleFace.geometry.faces.push(new THREE.Face3(0,1,2));
	singleFace.geometry.faces.push(new THREE.Face3(3,2,1));
	
	singleFace.geometry.computeBoundingSphere();
	
	for(var i = 0; i < 6; i++)
	{
		var newFace = new THREE.Mesh(singleFace.geometry, singleFace.material.clone())
		newFace.material.color.setRGB(Math.random(),Math.random(),Math.random())
		
		newFace.defaultQuaternion = new THREE.Quaternion();
		
		if( i < 4)
			newFace.defaultQuaternion.setFromAxisAngle(yAxis, i * TAU / 4 );
		else if( i === 4 )
			newFace.defaultQuaternion.setFromAxisAngle(xAxis, TAU / 4 );
		else if( i === 5 )
			newFace.defaultQuaternion.setFromAxisAngle(xAxis, TAU / 4 * 3 );
		
		newFace.quaternion.copy(newFace.defaultQuaternion);
		
		doubleShape.add(newFace);
		
		var extraFace = new THREE.Mesh(singleFace.geometry, singleFace.material.clone());
		extraFace.material.color.setRGB(Math.random(),Math.random(),Math.random());
		
		extraFace.defaultQuaternion = new THREE.Quaternion(
				-newFace.defaultQuaternion.x,
				-newFace.defaultQuaternion.y,
				-newFace.defaultQuaternion.z,
				-newFace.defaultQuaternion.w);
		
		extraFace.quaternion.copy(extraFace.defaultQuaternion);
		
		doubleShape.add(extraFace);
	}
	scene.add(doubleShape);
	
	doubleShape.virtualQuaternion = new THREE.Quaternion();
	
//	doubleShape.update = function()
//	{
//		var characteristicQuaternion
//		
//		var differenceQuaternion = previousQuaternion.clone().inverse().multiply(camera.quaternion);
//		
//		//do something with the vertices here
//		vertex.applyQuaternion(differenceQuaternion);
//		
//		ourShape.geometry.verticesNeedUpdate = true;
//		
//		previousQuaternion.copy(camera.quaternion);
//	}
	
	return doubleShape
}

function initDoubleSphere()
{
	var doubleSphere = new THREE.Object3D();
	
	doubleSphere.triangles = [];
	
	//tetrakis hexahedron. Could have triakis octahedron
	{
		doubleSphere.triangles.length = 4*6*2;
		templateTriangle = new THREE.Mesh(new THREE.Geometry(),
				new THREE.MeshBasicMaterial({color:0xFF0000} ) );
		templateTriangle.geometry.vertices.push(new THREE.Vector3( 0,0,1 ) );
		templateTriangle.geometry.vertices.push(new THREE.Vector3( 1,1,1 ) );
		templateTriangle.geometry.vertices.push(new THREE.Vector3( -1,1,1 ) );
		for(var i = 0; i < templateTriangle.geometry.vertices.length; i++)
			templateTriangle.geometry.vertices[i].setLength(0.1);
		templateTriangle.geometry.faces.push( new THREE.Face3( 0,1,2 ) );
		templateTriangle.geometry.computeFaceNormals();
		templateTriangle.geometry.computeVertexNormals();

		for(var i = 0; i < doubleSphere.triangles.length; i++)
		{
			doubleSphere.triangles[i] = templateTriangle = new THREE.Mesh( templateTriangle.geometry,
					templateTriangle.material.clone() );
			doubleSphere.triangles[i].material.color.setRGB(Math.random(),Math.random(),Math.random());
			
			doubleSphere.add(doubleSphere.triangles[i]);
		}
		
		for(var i = 0; i < 6; i++)
		{
			var faceQuaternion = new THREE.Quaternion();
			
			if( i < 4)
				faceQuaternion.setFromAxisAngle(yAxis, i * TAU / 4 );
			else if( i === 4 )
				faceQuaternion.setFromAxisAngle(xAxis, TAU / 4 );
			else if( i === 5 )
				faceQuaternion.setFromAxisAngle(xAxis, TAU / 4 * 3 );
			
			for(var j = 0; j < 4; j++)
			{
				var teepeeQuaternion = new THREE.Quaternion().setFromAxisAngle(zAxis, TAU / 4 * j);
				
				doubleSphere.triangles[i*8+j*2+0].quaternion.multiplyQuaternions(faceQuaternion, teepeeQuaternion);
				doubleSphere.triangles[i*8+j*2+1].quaternion.multiplyQuaternions(faceQuaternion, teepeeQuaternion);
				doubleSphere.triangles[i*8+j*2+1].quaternion.negate();
			}
		}
	}
	
	doubleSphere.spectatorQuaternion = new THREE.Quaternion(); //do you need to make sure it is a particular one?

	scene.add(doubleSphere);
	
	return doubleSphere;
	
	//to do the dice thing, you'd have to make the points very small
}