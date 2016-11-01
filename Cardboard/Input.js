function ReadInput()
{	
	if(isMobileOrTablet)
		OurOrientationControls.update();
	else
		Camera.rotation.x += TAU / 60;
	
	update_PointOfFocus();
}

function update_PointOfFocus()
{
	PointOfFocus.set(0,0,-1);
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

document.addEventListener( 'mousedown', go_fullscreen_and_init_object, false );
document.addEventListener('touchstart', go_fullscreen_and_init_object, false );
function go_fullscreen_and_init_object(event) 
{
	event.preventDefault();
	
	if( THREEx.FullScreen.activated() )
		return;
	
	THREEx.FullScreen.request(Renderer.domElement);
	
	OurObject.remove(FullScreenSign);
	OurObject.add(Protein);
}

window.addEventListener( 'resize', function(event)
{
	Renderer.setSize( window.innerWidth, window.innerHeight );
	Camera.aspect = Renderer.domElement.width / Renderer.domElement.height;
	Camera.updateProjectionMatrix();
}, false );