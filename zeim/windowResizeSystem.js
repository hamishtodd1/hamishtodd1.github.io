function centerToFrameDistanceAtZ1GivenFov(fov)
{
	return Math.tan( (TAU/360) * fov / 2);
}
function fovGivenCenterToFrameDistanceAtZ1(centerToFrameDistance)
{
	return 2 * (360/TAU) * Math.atan(centerToFrameDistance);
}

function otherFov(inputFov,ratio)
{
	var centerToFrameInput = centerToFrameDistanceAtZ1GivenFov(inputFov)
	var centerToFrameOutput = centerToFrameInput * ratio;
	var outputFov = fovGivenCenterToFrameDistanceAtZ1(centerToFrameOutput);
	return outputFov;
}

function initCameraAndRendererResizeSystemAndCameraRepresentation(renderer)
{
	var spectatorMinimumFov = 30;
	var desiredSpectatorAspectRatio = 16/9;

	function respondToResize() 
	{
		if( window.innerWidth < window.innerHeight )
		{
			/*
				You could try to deal with this. Bit nutty
			*/
			// camera.projectionMatrix.multiply(new THREE.Matrix4().makeRotationZ(TAU/4))
		}

		renderer.setSize( window.innerWidth, window.innerHeight );
		
		camera.aspect = renderer.domElement.width / renderer.domElement.height;

		var minimumHorizontalFov = otherFov(spectatorMinimumFov,desiredSpectatorAspectRatio);
		
		if( camera.aspect >= desiredSpectatorAspectRatio )
		{
			camera.fov = spectatorMinimumFov;
		}
		else
		{
			camera.fov = otherFov(minimumHorizontalFov, 1 / camera.aspect);
		}

		camera.updateProjectionMatrix();
	}
	respondToResize();
	window.addEventListener( 'resize', respondToResize, false );

	var cameraRepresentation = new THREE.Mesh(
		new THREE.CylinderGeometry(Math.sqrt(2),0,1,4),
		new THREE.MeshLambertMaterial({color:0xA0A0A0, side:THREE.DoubleSide}));
	cameraRepresentation.geometry.applyMatrix(new THREE.Matrix4().makeTranslation(0,0.5,0))
	cameraRepresentation.geometry.applyMatrix(new THREE.Matrix4().makeRotationX(-TAU/4))
	cameraRepresentation.geometry.applyMatrix(new THREE.Matrix4().makeRotationZ( TAU/8))

	var lineMaterial = new THREE.LineBasicMaterial({ color: 0xA0A0A0 });
	for(var i = 0; i < 4; i++)
	{
		cameraRepresentation.add(new THREE.Line(new THREE.Geometry(),lineMaterial));
		cameraRepresentation.children[i].geometry.vertices.push(new THREE.Vector3());
		cameraRepresentation.children[i].geometry.vertices.push(cameraRepresentation.geometry.vertices[i].clone().setLength(100));
	}

	// cameraRepresentation.position = camera.position;

	cameraRepresentation.scale.x = centerToFrameDistanceAtZ1GivenFov( otherFov( spectatorMinimumFov, desiredSpectatorAspectRatio ) );
	cameraRepresentation.scale.y = centerToFrameDistanceAtZ1GivenFov( spectatorMinimumFov );
	cameraRepresentation.scale.z = 1;
	cameraRepresentation.scale.multiplyScalar(0.1);

	// scene.add(cameraRepresentation)
}