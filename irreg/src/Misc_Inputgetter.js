/*
 * TODO
 * Touchscreen controls
 * Mouse should be projected, shouldn't have dependency on playing field width (but should have dependency on window)
 * 
 * Video should probably just stay to the right, and camera movements should be implemented in the shoot
 * There are things like the footage of sufferers and the polymerase which we want in there too. Separate video.
 * May also "manually" change something, for a bit of fun. Good candidate would be the quasisphere for zika virus. But how to take account of the current shape?
 * 
 * For touchscreen: when you let go and come back down again, your mouse hasn't teleported over. It's exactly like the video area thing
 */

//this is called once a frame and must be the only thing that addresses Inputobject, lest functions get different impressions of inputs.
//this function shouldn't actually *do* anything with the data, it's only to be read elsewhere.
var cursorIsHand = false;
var justLeftiFrame = false;

function ReadInput()
{
	OldMousePosition.copy( MousePosition );
	
	MousePosition.x = InputObject.mousex;
	MousePosition.y = InputObject.mousey;
	
	if( justLeftiFrame )
	{
		OldMousePosition.copy( MousePosition );
		justLeftiFrame = 0;
	}
	
	isMouseDown_previously = isMouseDown;
	isMouseDown = InputObject.isMouseDown;
	
	if(isMouseDown && !isMouseDown_previously) //because touchscreen - you're not jumping from one place to another
	{
		OldMousePosition.copy( MousePosition );
	}
	
	Mouse_delta.set( MousePosition.x - OldMousePosition.x, MousePosition.y - OldMousePosition.y);
}

function onWindowResize(event)
{
	var dimension = window.innerHeight < window.innerWidth ? window.innerHeight : window.innerWidth;
	renderer.setSize( dimension, dimension );
	
	//putting the center in the place that the html puts the thing
	var sideToCenter = dimension / 2;
	renderer.domElement.style.margin = "0 0 0 -" + sideToCenter.toString() + "px";
}
onWindowResize();
window.addEventListener( 'resize', onWindowResize, false );

document.addEventListener( 'mousedown', function(event) {
	event.preventDefault();
	
	InputObject.isMouseDown = true;
}, false);
document.addEventListener( 'mouseup', 	function(event) {
	event.preventDefault();
	
	InputObject.isMouseDown = false;
}, false);

function updateInputObjectMousePosition(unfilteredX, unfilteredY)
{
	InputObject.mousex = unfilteredX - document.body.clientWidth / 2;
	InputObject.mousey = -(unfilteredY - document.body.clientHeight / 2);
	
	var dimension = window.innerHeight < window.innerWidth ? window.innerHeight : window.innerWidth;
	InputObject.mousey *= playing_field_dimension / dimension;
	InputObject.mousex *= playing_field_dimension / dimension;
	
	InputObject.mousex += camera.position.x;
	InputObject.mousey += camera.position.y;
	InputObject.mousex -= camera.directionalShakeContribution.x;
	InputObject.mousey -= camera.directionalShakeContribution.y;
}

document.addEventListener( 'mousemove', function(event) 
{
	event.preventDefault();
	updateInputObjectMousePosition(event.clientX, event.clientY);
}, false ); //window?

document.addEventListener( 'touchmove', function( event )
{
	//only the first one. You could have multitouch, but, well...
	//TODO page scrolls when you hold it down
	
	updateInputObjectMousePosition( event.changedTouches[0].clientX, event.changedTouches[0].clientY )
}, { passive: false } );
document.addEventListener( 'touchstart', function(event)
{
	updateInputObjectMousePosition( event.changedTouches[0].clientX, event.changedTouches[0].clientY );
	InputObject.isMouseDown = true;
}, false );
document.addEventListener( 'touchend', function(event)
{
	InputObject.isMouseDown = false;
}, false );