function initVisiBox(thingsToBeUpdated,holdables)
{
	//should its edges only appear sometimes?
	var visiBox = new THREE.Object3D();
	
	thingsToBeUpdated.visiBox = visiBox;
	
	visiBox.scale.setScalar(400);
	visiBox.visible = false;
	visiBox.position.z = -FOCALPOINT_DISTANCE
	scene.add(visiBox);
	
	var ourSquareGeometry = new THREE.RingGeometry( 0.9 * Math.sqrt( 2 ) / 2, Math.sqrt( 2 ) / 2,4,1);
	ourSquareGeometry.applyMatrix( new THREE.Matrix4().makeRotationZ( TAU / 8 ) );
	visiBox.planes = [];
	for(var i = 0; i < 6; i++)
	{
		visiBox.add( new THREE.Mesh(ourSquareGeometry, new THREE.MeshLambertMaterial({color:0xFF0000,transparent:true, opacity:0.5, side:THREE.DoubleSide}) ) );
		if( i === 1) visiBox.children[ visiBox.children.length-1 ].rotation.x = TAU/2;
		if( i === 2) visiBox.children[ visiBox.children.length-1 ].rotation.x = TAU/4;
		if( i === 3) visiBox.children[ visiBox.children.length-1 ].rotation.x = -TAU/4;
		if( i === 4) visiBox.children[ visiBox.children.length-1 ].rotation.y = TAU/4;
		if( i === 5) visiBox.children[ visiBox.children.length-1 ].rotation.y = -TAU/4;
		visiBox.children[ visiBox.children.length-1 ].position.set(0,0,0.5);
		visiBox.children[ visiBox.children.length-1 ].position.applyEuler( visiBox.children[ visiBox.children.length-1 ].rotation );
		
		visiBox.planes.push( new THREE.Plane() );
	}
	
	//there's an argument for doing this with sides rather than corners, but corners are easier to aim for and give more power?
	{
		visiBox.corners = Array(8);
		var cornerGeometry = new THREE.EfficientSphereBufferGeometry(1);
		cornerGeometry.computeBoundingSphere();
		var cornerMaterial = new THREE.MeshLambertMaterial({color: 0x00FFFF, side:THREE.DoubleSide});
		visiBox.updateMatrix();
		
		function assignPosition(i, position)
		{
			position.setScalar(0.5);
			if( i%2 )
				position.x *= -1;
			if( i%4 >= 2 )
				position.y *= -1;
			if( i>=4 )
				position.z *= -1;
		}
		for(var i = 0; i < visiBox.corners.length; i++)
		{
			visiBox.corners[i] = new THREE.Mesh( cornerGeometry, cornerMaterial );
			visiBox.corners[i].scale.setScalar( 0.01 );
			visiBox.corners[i].boundingSphere = cornerGeometry.boundingSphere;
			visiBox.add( visiBox.corners[i] );
			visiBox.corners[i].ordinaryParent = visiBox;

			visiBox.updateMatrixWorld();
			
			assignPosition(i, visiBox.corners[i].position)
			
			holdables[ "visiBoxCorner" + i.toString() ] = visiBox.corners[i];
		}
	}
	
//	function setFaceToChangedVertex(changedIndex,xOrYOrZ, cornerIndices)
//	{
//		for(var i = 0; i < cornerIndices.length; i++)
//		{
//			visiBox.corners[cornerIndices[i]].position.setComponent(xOrYOrZ, visiBox.corners[cornerIndices[i]].position.getComponent(xOrYOrZ ) );
//		}
//	}
	
	visiBox.update = function()
	{
		visiBox.updateMatrixWorld();
		for(var i = 0; i < visiBox.corners.length; i++)
		{
			if(visiBox.corners[i].parent !== visiBox)
			{
				var newCornerPosition = visiBox.corners[ i ].getWorldPosition();
				visiBox.worldToLocal(newCornerPosition);
				visiBox.scale.x *= ( Math.abs(newCornerPosition.x)-0.5 ) + 1;
				visiBox.scale.y *= ( Math.abs(newCornerPosition.y)-0.5 ) + 1;
				visiBox.scale.z *= ( Math.abs(newCornerPosition.z)-0.5 ) + 1;
//				console.log(visiBox.scale)
				
				visiBox.updateMatrixWorld();
				
				var newNewCornerPosition = new THREE.Vector3();
				assignPosition(i, newNewCornerPosition );
				visiBox.localToWorld(newNewCornerPosition);
				
				var displacement = visiBox.corners[ i ].getWorldPosition().sub( newNewCornerPosition )//.multiply(visiBox.scale);
				
				visiBox.position.add(displacement)
				
				break;
			}
		}
		
		for(var i = 0; i < visiBox.corners.length; i++)
		{
			if(visiBox.corners[i].parent === visiBox)
			{
				visiBox.corners[i].scale.set(0.01/visiBox.scale.x,0.01/visiBox.scale.y,0.01/visiBox.scale.z);
				visiBox.corners[i].rotation.set(0,0,0);
			}
		}
		
		//beware, the planes may be the negatives of what you expect, seemingly because of threejs bug
		for(var i = 0; i < this.planes.length; i++)
		{
			var planeVector = new THREE.Vector3();
			planeVector.applyMatrix4(this.children[i].matrix);
			this.planes[i].normal.copy(planeVector).normalize();
			this.planes[i].constant = planeVector.dot( this.planes[i].normal );
			
			this.planes[i].applyMatrix4(visiBox.matrixWorld);
		}
	}
	
	return visiBox;
}