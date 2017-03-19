/*
 * TODO
 * Touchscreen controls
 * Mouse should be projected, shouldn't have dependency on playing field width (but should have dependency on window)
 * 
 * Video should probably just stay to the right, and camera movements should be implemented in the shoot
 * There are things like the footage of sufferers and the polymerase which we want in there too. Separate video.
 * May also "manually" change something, for a bit of fun. Good candidate would be the quasisphere for zika virus. But how to take account of the current shape?
 */

//this is called once a frame and must be the only thing that addresses Inputobject, lest functions get different impressions of inputs.
//this function shouldn't actually *do* anything with the data, it's only to be read elsewhere.
function ReadInput()
{
	OldMousePosition.copy( MousePosition );
	MousePosition.x = InputObject.mousex;
	MousePosition.y = InputObject.mousey;
	
	Mouse_delta.set( MousePosition.x - OldMousePosition.x, MousePosition.y - OldMousePosition.y);
	
	isMouseDown_previously = isMouseDown;
	isMouseDown = InputObject.isMouseDown;
	
	react_to_video();	
}

window.addEventListener( 'resize', function(event)
{
	var newCanvasResolution = window.innerWidth / 2;
//	var possibleResolutions = [1080]
	//sooo, what to do if they have a colossal monitor? What should be the next steps up?
	//The worst case scenario for 720 is 1439. That gap should be your max, proportionally
//	Renderer.setSize( window.innerWidth, window.innerHeight );
//	Camera.aspect = Renderer.domElement.width / Renderer.domElement.height;
//	Camera.updateProjectionMatrix();
}, false );

document.addEventListener( 'mousedown', function(event) {
	event.preventDefault();
	InputObject.isMouseDown = true;
}, false);
document.addEventListener( 'mouseup', 	function(event) {
	event.preventDefault();
	InputObject.isMouseDown = false;
}, false);

document.addEventListener( 'mousemove', function(event) {
	event.preventDefault();
	InputObject.mousex = event.clientX - window.innerWidth / 2 - renderer.domElement.offsetLeft / 2;
	InputObject.mousey = -(event.clientY - window.innerHeight / 2 - renderer.domElement.offsetTop / 2);
	InputObject.mousex *= playing_field_dimension / renderer.domElement.width;
	InputObject.mousey *= playing_field_dimension / renderer.domElement.height;
	InputObject.mousex += camera.position.x;
	InputObject.mousey += camera.position.y;
}, false ); //window?

//document.addEventListener( 'touchstart', onDocumentMouseDown, false );
//document.addEventListener( 'touchmove', onDocumentTouchMove, false );
//document.addEventListener( 'touchend', onDocumentMouseUp, false );

//remember there can be weirdness for multiple fingers, so make sure any crazy series of inputs are interpretable
//function onDocumentTouchMove( event ) {
//	event.preventDefault();
//	InputObject.mousex = event.changedTouches[0].clientX; //only looking at the first one. TODO multi-touch!
//	InputObject.mousey = event.changedTouches[0].clientY;
//}