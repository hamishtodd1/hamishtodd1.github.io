function ReadInput()
{	
	if(isMobileOrTablet)
		OurOrientationControls.update();
	
	update_PointOfFocus();
}

function update_PointOfFocus()
{
	PointOfFocus.set(0,0,-1);
	Camera.updateMatrixWorld();
	Camera.localToWorld(PointOfFocus);
	/*
	 * Could try to smooth it.
	 * But your phone is probably unusually bad so it won't affect many
	 * Disadvantage: people might want to do the movement that your phone simulates
	 * 
	 * var OldPointOfFocus = PointOfFocus.clone();
	PointOfFocus.set(0,0,-1);
	Camera.localToWorld(PointOfFocus);
	if(PointOfFocus.angleTo(OldPointOfFocus) > TAU / 100 ) //revert to make it smooth
		PointOfFocus.copy(OldPointOfFocus);
	 */
}

window.addEventListener( 'resize', function(event)
{
	Renderer.setSize( window.innerWidth, window.innerHeight );
	Camera.aspect = Renderer.domElement.width / Renderer.domElement.height;
	Camera.updateProjectionMatrix();
}, false );

document.addEventListener( 'mousemove', function(event) {
	if(!isMobileOrTablet)
	{
		Camera.rotation.y = (event.clientX - Renderer.domElement.offsetLeft) / Renderer.domElement.offsetWidth  * TAU;
		Camera.rotation.x = ( (event.clientY - Renderer.domElement.offsetTop ) / Renderer.domElement.offsetHeight * TAU / 2 - TAU / 4 );
	} 
}, false );