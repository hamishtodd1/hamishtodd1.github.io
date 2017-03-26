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

function onWindowResizeExceptYoutube()
{
	var maxCanvasDimension = window.innerWidth / 2;
	if( maxCanvasDimension > window.innerHeight ) 
		maxCanvasDimension = window.innerHeight;
	
	var finalCanvasDimension = 240;
	var possibleDimensions = [360,480,720,1080];
	for(var i = 0; i < possibleDimensions.length; i++ )
		if( maxCanvasDimension >= possibleDimensions[i] )
			finalCanvasDimension = possibleDimensions[i];
	if( maxCanvasDimension >= 1080 * 1.5 )
	{
		while( maxCanvasDimension >= finalCanvasDimension * 1.5 )
			finalCanvasDimension = finalCanvasDimension * 1.5;
	}
	//on a >1080 monitor, you probably have to scale up the... picture of the youtube video, or however you put it. Try putting in 2160 or whatever.
	//todo: test on that. Buuuut that can wait a long time, like whenever you see one. People could just resize the window? Hopefully that works?
	
	var spacing = 0;
	var bodyWidth = spacing + finalCanvasDimension * 2;
	var bodySideToCenter = bodyWidth / 2;
	var bodyTopToCenter = finalCanvasDimension / 2;
	document.body.style.width = bodyWidth.toString() + "px";
	document.body.style.height = finalCanvasDimension.toString() + "px";
	document.body.style.margin = "-" + bodyTopToCenter.toString() + "px 0 0 -" + bodySideToCenter.toString() + "px";
	//eventually the body will have more shit. probably the above needs to be "container" or something.
	
	window_width = finalCanvasDimension;
	window_height = window_width;
	
	renderer.setSize( window_width, window_height );
	
	return finalCanvasDimension;
}
onWindowResizeExceptYoutube();

function onWindowResize()
{
	var finalCanvasDimension = onWindowResizeExceptYoutube();
	
	var qualityString = "";
	if(finalCanvasDimension === 240)
		qualityString += "small";
	else if(finalCanvasDimension === 360)
		qualityString += "medium";
	else if(finalCanvasDimension === 480)
		qualityString += "large";
	else if(finalCanvasDimension === 720)
		qualityString += "hd720";
	else if(finalCanvasDimension >= 1080)
		qualityString += "hd1080";
	else qualityString += "default";
	
	ytplayer.setPlaybackQuality( qualityString ); //and if their connection is too slow, they have the cog
	ytplayer.setSize(finalCanvasDimension,finalCanvasDimension);
}		
window.addEventListener( 'resize', onWindowResize, false );

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