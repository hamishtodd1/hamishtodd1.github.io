function Render() {
	delta_t = ourclock.getDelta();
	
	if(isMobileOrTablet)
		OurOrientationControls.update();
	
	var displacementVector = new THREE.Vector3(0,0,-0.5);
	camera.updateMatrixWorld();
	camera.localToWorld(displacementVector);
	doubleShape.position.copy(displacementVector)
	
	requestAnimationFrame( function(){
		Render();
	} );
	if(isMobileOrTablet)
		OurStereoEffect.render( scene, camera );
	else
		Renderer.render( scene, camera );
}
