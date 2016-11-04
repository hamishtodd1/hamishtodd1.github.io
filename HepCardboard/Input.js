function ReadInput()
{	
	if(isMobileOrTablet)
		OurOrientationControls.update();
}

document.addEventListener( 'mousedown', go_fullscreen, false );
document.addEventListener('touchstart', go_fullscreen, false );
function go_fullscreen(event) 
{
	event.preventDefault();
	
	video.play();
	
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

document.addEventListener( 'mousemove', function(event) {
	if(!isMobileOrTablet)
	{
		Camera.rotation.y = (event.clientX - Renderer.domElement.offsetLeft) / Renderer.domElement.offsetWidth  * TAU - TAU / 4;
		Camera.rotation.x = ( (event.clientY - Renderer.domElement.offsetTop ) / Renderer.domElement.offsetHeight * TAU / 2 - TAU / 4 )  * 0.4;
	} 
}, false );