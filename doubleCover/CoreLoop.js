function Render() {
	delta_t = ourclock.getDelta();
	
	if(isMobileOrTablet)
		OurOrientationControls.update();
	
	var displacementVector = new THREE.Vector3(0,0,-0.5);
	camera.updateMatrixWorld();
	camera.localToWorld(displacementVector);
//	doubleShape.position.copy(displacementVector)
	RP2.position.copy(displacementVector)
//	doubleSphere.position.copy(displacementVector);
	
	{
		var mouseMovementAxis = new THREE.Vector3( -mouseDelta.y, mouseDelta.x, 0);
		mouseMovementAxis.normalize();
		
		var mouseMovementQuaternion = new THREE.Quaternion().setFromAxisAngle(mouseMovementAxis, mouseDelta.length() / 200 );
		
		RP2.spectatorDirection.copy(spectatorPosition);
		RP2.spectatorDirection.sub(RP2.position);
		RP2.spectatorDirection.normalize();
		
		for(var i = 0, il = RP2.surface.geometry.vertices.length; i < il; i++)
		{
			var ourVertex = RP2.surface.geometry.vertices[i];
			ourVertex.applyQuaternion(mouseMovementQuaternion);
			
			if( ourVertex.angleTo(RP2.spectatorDirection) > TAU / 4 )
			{
				var correctionAxis = ourVertex.clone();
				correctionAxis.cross(RP2.spectatorDirection);
				correctionAxis.cross(ourVertex);
				correctionAxis.normalize();
				
				ourVertex.applyAxisAngle(correctionAxis, TAU / 2);
			}
		}

		RP2.surface.geometry.verticesNeedUpdate = true;
		mouseDelta.set(0,0)
	}
	
	requestAnimationFrame( function(){
		Render();
	} );
	if(isMobileOrTablet)
		OurStereoEffect.render( scene, camera );
	else
		Renderer.render( scene, camera );
}
