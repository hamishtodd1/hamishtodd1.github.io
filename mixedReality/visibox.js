//would be nice if we could have the "rim" where things get cut off make their cross-section glow

function VisiBox()
{
	let visiBox = new THREE.Object3D();
	scene.add(visiBox);

	visiBox.position.y = camera.position.y

	visiBox.scale.setScalar(0.7)
	visiBox.scale.multiplyScalar(1000)
	visiBox.scale.x *= 2

	// markLerpedFloat(visiBox.scale,"x")
	// markLerpedFloat(visiBox.scale,"y")
	// markLerpedFloat(visiBox.scale,"z")

	var cornerRadius = 0.02;

	var ourSquareGeometry = new THREE.Geometry();
	ourSquareGeometry.vertices.push(
		new THREE.Vector3(0.5,0.5,0),
		new THREE.Vector3(0.5,-0.5,0),
		new THREE.Vector3(-0.5,-0.5,0),
		new THREE.Vector3(-0.5,0.5,0) )
	visiBox.planes = [];
	var faces = Array(6);
	visiBox.faces = faces
	for(var i = 0; i < 6; i++)
	{
		faces[i] = new THREE.LineLoop(ourSquareGeometry, new THREE.MeshLambertMaterial({
			color:0x00FFFF,
			// linewidth:4
			// transparent:true,
			// opacity:0.5
		}) );
		visiBox.add( faces[i] );
		if( i === 1 ) faces[i].rotation.x = TAU/2;
		if( i === 2 ) faces[i].rotation.x = TAU/4;
		if( i === 3 ) faces[i].rotation.x = -TAU/4;
		if( i === 4 ) faces[i].rotation.y = TAU/4;
		if( i === 5 ) faces[i].rotation.y = -TAU/4;
		faces[i].position.set(0,0,0.5);
		faces[i].position.applyEuler( faces[i].rotation );
		
		visiBox.planes.push( new THREE.Plane() );
	}
	
	{
		visiBox.corners = Array(8);
		var cornerGeometry = new THREE.EfficientSphereBufferGeometry(1);
		cornerGeometry.computeBoundingSphere();
		var cornerMaterial = new THREE.MeshLambertMaterial({color: 0x00FFFF});
		visiBox.updateMatrix();

		function putOnCubeCorner(i, position)
		{
			position.setScalar(0.5);
			if( i%2 )
			{
				position.x *= -1;
			}
			if( i%4 >= 2 )
			{
				position.y *= -1;
			}
			if( i>=4 )
			{
				position.z *= -1;
			}
		}
		for(var i = 0; i < visiBox.corners.length; i++)
		{
			visiBox.corners[i] = new THREE.Mesh( cornerGeometry, cornerMaterial );
			visiBox.corners[i].boundingSphere = cornerGeometry.boundingSphere;
			visiBox.corners[i].onLetGo = visiBox.onLetGo
			visiBox.add( visiBox.corners[i] )
			visiBox.corners[i].ordinaryParent = visiBox

			visiBox.updateMatrixWorld();
			
			putOnCubeCorner(i, visiBox.corners[i].position)
			
			holdables.push( visiBox.corners[i] );
		}
	}
	
	updateFunctions.push( function()
	{
		// for(let i = 0; i < 2; i++)
		// {
		// 	//if your handController is in it and you press a certain button, toggle size
		// 	let p = visiBox.worldToLocal(handControllers[i].getWorldPosition(new THREE.Vector3()))
		// 	if( -0.5 < p.x && p.x < 0.5 &&
		// 		-0.5 < p.y && p.y < 0.5 &&
		// 		-0.5 < p.z && p.z < 0.5  )
		// 	{
		// 		//light up?
				
		// 		if( handControllers[i].button2 && !handControllers[i].button2Old )
		// 		{
		// 			if(visiBox.scale.x < 100)
		// 			{
		// 				visiBox.scale.multiplyScalar(1000)
		// 			}
		// 			else
		// 			{
		// 				visiBox.scale.multiplyScalar(1/1000)
		// 			}
		// 		}
		// 	}
		// }

		visiBox.updateMatrixWorld();
		for(var i = 0; i < visiBox.corners.length; i++)
		{
			if(visiBox.corners[i].parent !== visiBox)
			{
				var newCornerPosition = new THREE.Vector3()
				visiBox.corners[ i ].getWorldPosition(newCornerPosition);
				visiBox.worldToLocal(newCornerPosition);
				visiBox.scale.x *= ( Math.abs(newCornerPosition.x)-0.5 ) + 1;
				visiBox.scale.y *= ( Math.abs(newCornerPosition.y)-0.5 ) + 1;
				visiBox.scale.z *= ( Math.abs(newCornerPosition.z)-0.5 ) + 1;
				
				visiBox.updateMatrixWorld();
				
				var newNewCornerPosition = new THREE.Vector3();
				putOnCubeCorner(i, newNewCornerPosition );
				visiBox.localToWorld(newNewCornerPosition);
				
				var displacement = new THREE.Vector3()
				visiBox.corners[ i ].getWorldPosition(displacement)
				displacement.sub( newNewCornerPosition )
				
				visiBox.position.add(displacement);
				
				break;
			}
		}
		
		var cornerScale = new THREE.Vector3(cornerRadius/visiBox.scale.x,cornerRadius/visiBox.scale.y,cornerRadius/visiBox.scale.z);
		for(var i = 0; i < visiBox.corners.length; i++)
		{
			if(visiBox.corners[i].parent === visiBox)
			{
				visiBox.corners[i].scale.copy(cornerScale);
				visiBox.corners[i].rotation.set(0,0,0);
				putOnCubeCorner(i, visiBox.corners[i].position );
			}
		}
		
		//beware, the planes may be the negatives of what you expect, seemingly because of threejs bug
		for(var i = 0; i < visiBox.planes.length; i++)
		{
			var planeVector = new THREE.Vector3();
			planeVector.applyMatrix4(visiBox.children[i].matrix);
			visiBox.planes[i].normal.copy(planeVector).normalize();
			visiBox.planes[i].constant = planeVector.dot( visiBox.planes[i].normal );
			
			visiBox.planes[i].applyMatrix4(visiBox.matrixWorld);
		}
	})
	
	return visiBox;
}