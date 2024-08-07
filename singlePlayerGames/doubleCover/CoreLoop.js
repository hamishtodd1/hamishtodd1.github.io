/*
 * Possibly fun: you're holding a sphere with a few circles in it. The circles move on the sphere
 *  There are lines coming in from every direction
 *  rotate the sphere so the lines are going into the circles
 *  in theory you need only look at three

 	Simple way to do this would be to have the color change depending on whether you're in the top or bottom half of the quaternions
 */

function Render() {
	delta_t = ourclock.getDelta();
	
	if(isMobileOrTablet)
		OurOrientationControls.update();
	
	var initialDisplacementVector = new THREE.Vector3(0,0,-0.32);
	var displacementVector = initialDisplacementVector.clone();
	camera.updateMatrixWorld();
	camera.localToWorld(displacementVector);
//	doubleShape.position.copy(displacementVector)
	RP2.position.copy(displacementVector)
//	doubleSphere.position.copy(displacementVector);
	
	{
		var mouseMovementAxis = new THREE.Vector3( -mouseDelta.y, mouseDelta.x, 0);
		mouseMovementAxis.normalize();
		
		var mouseMovementQuaternion = new THREE.Quaternion().setFromAxisAngle(mouseMovementAxis, mouseDelta.length() / 80 );
		
		var spectatorDirection = initialDisplacementVector.clone();
		spectatorDirection.negate();
		
		for(var i = 0, il = RP2.surface.geometry.vertices.length; i < il; i++)
		{
			var ourVertex = RP2.surface.geometry.vertices[i];
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
