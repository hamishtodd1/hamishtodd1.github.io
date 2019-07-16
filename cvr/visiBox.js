function initVisiBox()
{
	visiBox = new THREE.LineSegments(new THREE.Geometry(),new THREE.MeshLambertMaterial({color:0x333333}));
	visiBox.planes = []
	scene.add(visiBox);

	let faceToFront = 0.3;

	visiBox.scale.x = 0.23
	visiBox.scale.y = 0.17
	visiBox.scale.z = 0.3
	visiBox.rotation.x = -0.48

	let d = 99999
	visiBox.geometry.vertices.push(
		new THREE.Vector3(-1,1,-1),	new THREE.Vector3(1,1,-1),	new THREE.Vector3(1,1,-1),	new THREE.Vector3(d,d,-d),
		new THREE.Vector3(1,1,-1), 	new THREE.Vector3(1,-1,-1),	new THREE.Vector3(1,-1,-1),	new THREE.Vector3(d,-d,-d),
		new THREE.Vector3(1,-1,-1), new THREE.Vector3(-1,-1,-1),new THREE.Vector3(-1,-1,-1),new THREE.Vector3(-d,-d,-d),
		new THREE.Vector3(-1,-1,-1),new THREE.Vector3(-1,1,-1), new THREE.Vector3(-1,1,-1), new THREE.Vector3(-d,d,-d) )

	let faces = Array(5);
	let planes = []
	let faceMaterial = new THREE.MeshBasicMaterial({
		color:0xFFFFFF,
		// transparent:true,
		// opacity:0.9
	})
	for(let i = 0; i < faces.length; i++)
	{
		faces[i] = new THREE.Mesh( new THREE.PlaneGeometry(2,2), faceMaterial );
		faces[i].visible = false
		visiBox.add( faces[i] );
		
		planes.push( new THREE.Plane() );
		visiBox.planes.push(planes[i])

		if(i)
		{
			faces[i].geometry.vertices[0].set(-d,	d*Math.sqrt(2),0)
			faces[i].geometry.vertices[1].set(d,	d*Math.sqrt(2),0)
			faces[i].geometry.vertices[2].set(-1,	1*Math.sqrt(2),0)
			faces[i].geometry.vertices[3].set(1,	1*Math.sqrt(2),0)
		}
	}

	faces[0].position.z = -1
	faces[0].visible = false

	faces[1].rotation.x = -TAU/8;

	faces[2].rotation.x = -TAU/8-TAU/4;
	faces[2].rotation.y = TAU/2;

	faces[3].rotation.x = -TAU/8;
	faces[4].rotation.x = -3*TAU/8;

	faces[3].rotation.z = TAU/4;
	faces[4].rotation.z = TAU/4;
	faces[3].rotation.order = "ZYX"

	faces[4].rotation.y = TAU/2;
	faces[4].rotation.order = "ZXY"

	{
		visiBox.corners = Array(4);
		let cornerGeometry = new THREE.BoxBufferGeometry(1);
		cornerGeometry.computeBoundingSphere();
		let cornerMaterial = new THREE.MeshLambertMaterial({color: 0x00FFFF});
		visiBox.updateMatrix();

		for(let i = 0; i < visiBox.corners.length; i++)
		{
			visiBox.corners[i] = new THREE.Mesh( cornerGeometry, cornerMaterial );
			visiBox.corners[i].boundingSphere = cornerGeometry.boundingSphere;
			visiBox.add( visiBox.corners[i] );
			visiBox.corners[i].ordinaryParent = visiBox;

			visiBox.updateMatrixWorld();
			visiBox.corners[i].intendedPositionInVisiBox = new THREE.Vector3(1,1,-1)
			if( i%2 )
			{
				visiBox.corners[i].intendedPositionInVisiBox.x *= -1;
			}
			if( i%4 >= 2 )
			{
				visiBox.corners[i].intendedPositionInVisiBox.y *= -1;
			}
			visiBox.corners[i].position.copy(visiBox.corners[i].intendedPositionInVisiBox)
			
			holdables.push( visiBox.corners[i] );
		}
		//happenning here so it's after
		holdables.push(assemblage)
		assemblage.ordinaryParent = scene
	}

	objectsToBeUpdated.push(visiBox)
	visiBox.update = function()
	{
		for(let i = 0; i < visiBox.corners.length; i++)
		{
			if(visiBox.corners[i].parent !== visiBox)
			{
				let localGrabbedCornerPosition = new THREE.Vector3()

				let top = visiBox.corners[i].intendedPositionInVisiBox.y > 0

				let oldFov = 2*Math.atan(visiBox.scale.y/visiBox.scale.z)

				let projectedOnX0World = visiBox.corners[i].getWorldPosition( new THREE.Vector3() ).setComponent(0,0)
				let opposingFrameWorld = visiBox.localToWorld(new THREE.Vector3(0,top?-1:1,-1))
				let newFov = projectedOnX0World.angleTo(opposingFrameWorld)

				let angleIncrease = newFov - oldFov
				visiBox.rotation.x += angleIncrease/2 * (top?1:-1)

				visiBox.updateMatrixWorld();
				visiBox.corners[i].getWorldPosition( localGrabbedCornerPosition )
				visiBox.worldToLocal(localGrabbedCornerPosition);

				visiBox.scale.x *= Math.abs(localGrabbedCornerPosition.x)
				visiBox.scale.z *= -localGrabbedCornerPosition.z
				visiBox.scale.y *= Math.abs(localGrabbedCornerPosition.y)

				visiBox.updateMatrixWorld();

				break;
			}
		}
		
		let cornerRadius = 0.01;
		let cornerScale = new THREE.Vector3(cornerRadius/visiBox.scale.x,cornerRadius/visiBox.scale.y,cornerRadius/visiBox.scale.z);
		for(let i = 0; i < visiBox.corners.length; i++)
		{
			if(visiBox.corners[i].parent === visiBox)
			{
				visiBox.corners[i].scale.copy(cornerScale);
				visiBox.corners[i].rotation.set(0,0,0);
				visiBox.corners[i].position.copy(visiBox.corners[i].intendedPositionInVisiBox)
			}
		}
		
		//beware, the planes may be the negatives of what you expect, seemingly because of threejs bug
		planes[0].constant = -1
		for(let i = 0; i < planes.length; i++)
		{
			planes[i].normal.set(0,0,-1)
			planes[i].normal.applyMatrix4(faces[i].matrix).normalize();
			planes[i].applyMatrix4(visiBox.matrixWorld);
		}
	}

	// visiBox.planes.length = 0
	MenuOnPanel([{
		string:"Toggle clipping planes", buttonFunction:function()
		{
			if( visiBox.planes.length !== 0 )
			{
				visiBox.planes.length = 0
			}
			else
			{
				for(let i = 0; i < planes.length; i++)
				{
					visiBox.planes.push(planes[i])
				}
			}
		}
	}],4.23,5.42)

	visiBox.getCenterInAssemblageSpace = function()
	{
		let center = new THREE.Vector3(0,0,-1 )
		visiBox.localToWorld(center)
		//in the middle of the box, rather than the front
		center.setLength((visiBox.scale.z + panel.scale.z )/2)
		assemblage.updateMatrixWorld();
		assemblage.worldToLocal( center );

		return center
	}
}