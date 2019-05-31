function init()
{
	camera.position.z = min_cameradist;
	
	init_CK_and_irreg();
	initAO();
	
	for( var i = 0; i < varyingsurface_cylinders.length; i++)
		scene.add(varyingsurface_cylinders[i]);
	for( var i = 0; i < varyingsurface_spheres.length; i++)
		scene.add(varyingsurface_spheres[i]);
	for(var i = 0; i< lights.length; i++)
		scene.add( lights[i] );
	scene.add(IrregButton);
	
	function render() {
		delta_t = ourclock.getDelta();

		ReadInput();

		CheckIrregButton();
		manipulate_vertices();
		update_varyingsurface();
		//correct_minimum_angles();

		UpdateCamera();

		requestAnimationFrame( render );
		renderer.render( scene, camera );
	}
	
	render();
}