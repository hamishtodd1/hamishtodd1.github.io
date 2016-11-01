function ReadInput()
{	
	OurOrientationControls.update();
	Camera.rotation.x = 0;
//	console.log("oo")
}

document.addEventListener( 'mousedown', go_fullscreen, false );
document.addEventListener('touchstart', go_fullscreen, false );
function go_fullscreen(event) 
{
	event.preventDefault();
	
	if( THREEx.FullScreen.activated() )
		return;
	
	THREEx.FullScreen.request(Renderer.domElement);
}

window.addEventListener( 'resize', function(event)
{
	Renderer.setSize( window.innerWidth, window.innerHeight );
	Camera.aspect = Renderer.domElement.width / Renderer.domElement.height; //shouldn't there be a division by 2?
	Camera.updateProjectionMatrix();
}, false );