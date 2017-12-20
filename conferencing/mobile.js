//gets the mouse from the rift computer

initializers.mobile = function(socket, pdbWebAddress, roomKey, launcher, visiBox, thingsToBeUpdated, renderer, userManager )
{
	//initializing cursor
	// {
	// 	var coneHeight = 0.1;
	// 	var coneRadius = coneHeight * 0.4;
	// 	var cursorGeometry = new THREE.ConeGeometry(coneRadius, coneHeight,31);
	// 	cursorGeometry.computeFaceNormals();
	// 	cursorGeometry.computeVertexNormals();
	// 	cursorGeometry.merge( new THREE.CylinderGeometry(coneRadius / 4, coneRadius / 4, coneHeight / 2, 31 ), (new THREE.Matrix4()).makeTranslation(0, -coneHeight/2, 0) );
	// 	cursorGeometry.applyMatrix( (new THREE.Matrix4()).makeTranslation(0, -coneHeight / 2, 0) );
	// 	cursorGeometry.applyMatrix( (new THREE.Matrix4()).makeRotationZ(TAU/8) );
	// 	var cursor = new THREE.Mesh(
	// 			cursorGeometry, 
	// 			new THREE.MeshLambertMaterial({color:0x888888, side: THREE.DoubleSide })
	// 	);
		
	// 	cursor.grabbing = false;
		
	// 	cursor.followers = [];
	// 	cursor.oldWorldPosition = new THREE.Vector3();
		
	// 	camera.add(cursor);
	// }

	var load = initPoiSphereAndButtonMonitorerAndMovementSystem();
	var poiSphere = load.poiSphere;
	var buttonsHeld = load.buttonsHeld;
	var moveCamera = load.moveCamera;

	camera.position.copy(model.position);

	// socket.on('poiUpdate', function(msg)
	// 	{
	// 		var currentPoi = getPoi(camera);
	// 		camera.position.sub(currentPoi).add(msg)
	// 		camera.updateMatrix();
	// 		camera.updateMatrixWorld();
	// 		poiSphere.position.copy(getPoi(camera));
	// 	});

	coreLoops.mobile = function( socket, visiBox, thingsToBeUpdated, userManager, mouse )
	{
		frameDelta = ourClock.getDelta();

		var poi = getPoi(camera);

		ourOrientationControls.update();

		camera.updateMatrixWorld();
		var offsetPoiSphereLocation = getPoi(camera);
		camera.position.sub(offsetPoiSphereLocation).add(poi);

		camera.updateMatrixWorld();
		poiSphere.position.copy(getPoi(camera));
		
		userManager.sendOurUpdate();
		userManager.checkForDormancy();
	}

	document.addEventListener( 'mousedown', function(event)
	{
		if( THREEx.FullScreen.activated() )
			return;
		
		THREEx.FullScreen.request(renderer.domElement);
	}, false );

	window.addEventListener( 'resize', function(event)
	{
		renderer.setSize( window.innerWidth, window.innerHeight );
		ourStereoEffect.setSize( window.innerWidth, window.innerHeight );

		camera.aspect = renderer.domElement.width / renderer.domElement.height;
		camera.updateProjectionMatrix();
	}, false );

	var ourOrientationControls = new THREE.DeviceOrientationControls(camera);
	var ourStereoEffect = new THREE.StereoEffect( renderer );
	ourStereoEffect.stereoCamera.eyeSep = 0.0065;
	function render()
	{
		coreLoops.mobile( socket, visiBox, thingsToBeUpdated, userManager )

		requestAnimationFrame( render );
		ourStereoEffect.render( scene, camera );
	}
	launcher.render = render;
}