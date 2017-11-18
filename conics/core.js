function init()
{
	window.addEventListener( 'resize', function(){
		console.log("resizing")
	    renderer.setSize( window.innerWidth, window.innerHeight );
	    camera.aspect = window.innerWidth / window.innerHeight;
	    camera.updateProjectionMatrix();
	}, false );
	
	ourVREffect = new THREE.VREffect( renderer );
	
	var controllers = Array(2);
	var vrInputSystem = VRInputSystem(controllers);
	
	makeStandardScene(true);
	
	document.addEventListener( 'keydown', function(event)
	{
		if(event.keyCode === 190 && ( navigator.getVRDisplays !== undefined || navigator.getVRDevices !== undefined ) )
		{
			event.preventDefault();
			vrInputSystem.startGettingInput();
			ourVREffect.setFullScreen( true );
		}
	}, false );
	
	//so that it's not black when you start
	controllers[0].position.z = camera.position.z - 1;
	controllers[1].position.z = camera.position.z - 1;
	
	function loop(controllers, vrInputSystem) {
		delta_t = ourclock.getDelta();
		
		vrInputSystem.update();
		
		ourVREffect.requestAnimationFrame( function(){
			ourVREffect.render( scene, camera );
			loop(controllers, vrInputSystem);
		} );
	}
	
	loop(controllers, vrInputSystem);
}