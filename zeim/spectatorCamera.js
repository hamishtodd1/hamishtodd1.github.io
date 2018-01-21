function initSpectatorCamera()
{
	var spectatorCameraRepresentation = new THREE.Mesh(
		new THREE.CylinderGeometry(Math.sqrt(2),0,1,4),
		new THREE.MeshLambertMaterial({color:0xA0A0A0, side:THREE.DoubleSide}));
	spectatorCameraRepresentation.geometry.applyMatrix(new THREE.Matrix4().makeTranslation(0,0.5,0))
	spectatorCameraRepresentation.geometry.applyMatrix(new THREE.Matrix4().makeRotationX(-TAU/4))
	spectatorCameraRepresentation.geometry.applyMatrix(new THREE.Matrix4().makeRotationZ( TAU/8))

	var lineMaterial = new THREE.LineBasicMaterial({ color: 0xA0A0A0 });
	for(var i = 0; i < 4; i++)
	{
		spectatorCameraRepresentation.add(new THREE.Line(new THREE.Geometry(),lineMaterial));
		spectatorCameraRepresentation.children[i].geometry.vertices.push(new THREE.Vector3());
		spectatorCameraRepresentation.children[i].geometry.vertices.push(spectatorCameraRepresentation.geometry.vertices[i].clone().setLength(100));
	}

	// spectatorCameraRepresentation.position = spectatorCamera.position;

	spectatorCameraRepresentation.scale.x = centerToFrameDistanceAtZ1GivenFov( otherFov( SPECTATOR_MINIMUM_FOV, SPECTATOR_DESIRED_ASPECT_RATIO ) );
	spectatorCameraRepresentation.scale.y = centerToFrameDistanceAtZ1GivenFov( SPECTATOR_MINIMUM_FOV );
	spectatorCameraRepresentation.scale.z = 1;
	spectatorCameraRepresentation.scale.multiplyScalar(0.1);

	// scene.add(spectatorCameraRepresentation)
}