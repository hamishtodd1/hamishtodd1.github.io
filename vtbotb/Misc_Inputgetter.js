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
var resetMouse = false;

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
	
	Mouse_delta.set( MousePosition.x - OldMousePosition.x, MousePosition.y - OldMousePosition.y);
	
	isMouseDown_previously = isMouseDown;
	isMouseDown = InputObject.isMouseDown;
	
	if(isMouseDown && !isMouseDown_previously) //because touchscreen - you're not jumping from one place to another
		resetMouse = true;
	
	if(resetMouse && !OldMousePosition.equals(MousePosition))
	{
		OldMousePosition.copy( MousePosition );
		resetMouse = false; //test on jessie's computer
	}
	
	react_to_video();	
}

function onWindowResizeExceptYoutube( canvasWidthOverHeight )
{
	var maxCanvasDimension = window.innerWidth / 2;
	if( maxCanvasDimension > window.innerHeight ) 
		maxCanvasDimension = window.innerHeight;
	
	var finalCanvasDimension = 144;
	var possibleDimensions = [240,360,480,720,1080];
	for(var i = 0; i < possibleDimensions.length; i++ )
		if( maxCanvasDimension >= possibleDimensions[i] )
			finalCanvasDimension = possibleDimensions[i];
	if( maxCanvasDimension >= 1080 * 1.5 )
	{
		while( maxCanvasDimension >= finalCanvasDimension * 1.5 )
			finalCanvasDimension = finalCanvasDimension * 1.5;
	}
	/* on a >1080 monitor, you probably have to scale up the... picture of the youtube video, or however you put it. Try putting in 2160 or whatever.
	 * todo: test on that. Buuuut that can wait a long time, like whenever you see one. People could just resize the window? Hopefully that works?
	 * 
	 * Siiiigh re dpi. Jesus, 1.5?
	 */
	
	var spacing = 0;
	var bodyWidth = spacing + finalCanvasDimension + finalCanvasDimension * canvasWidthOverHeight;
	var bodySideToCenter = bodyWidth / 2;
	var bodyTopToCenter = finalCanvasDimension / 2;
	
	var divHeight = finalCanvasDimension / 2 + window.innerHeight / 2;
	var divWidth = finalCanvasDimension + finalCanvasDimension * canvasWidthOverHeight;
	
	var playerAndCanvas = document.getElementById("playerAndCanvas");
	
	playerAndCanvas.style.width = divWidth.toString() + "px";
	playerAndCanvas.style.height = divHeight.toString() + "px";
	playerAndCanvas.style.margin = "-" + bodyTopToCenter.toString() + "px 0 0 -" + bodySideToCenter.toString() + "px";
	
	window_width = finalCanvasDimension * canvasWidthOverHeight;
	window_height = finalCanvasDimension;
	
	renderer.setSize( window_width, window_height );
	
	return finalCanvasDimension;
}
onWindowResizeExceptYoutube(1);

function onWindowResize()
{
	var finalCanvasDimension = onWindowResizeExceptYoutube(1);
	
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
	InputObject.mousex -= camera.directionalShakeContribution.x;
	InputObject.mousey -= camera.directionalShakeContribution.y;
}, false ); //window?



//remember there can be weirdness for multiple fingers, so make sure any crazy series of inputs are interpretable
document.addEventListener( 'touchmove', function( event ) {
	event.preventDefault();
	//only the first one. You could have multitouch, but, well...
	//TODO page scrolls when you hold it down
	InputObject.mousex = event.changedTouches[0].clientX - window.innerWidth / 2 - renderer.domElement.offsetLeft / 2;
	InputObject.mousey = -(event.changedTouches[0].clientY - window.innerHeight / 2 - renderer.domElement.offsetTop / 2);
	InputObject.mousex *= playing_field_dimension / renderer.domElement.width;
	InputObject.mousey *= playing_field_dimension / renderer.domElement.height;
	
	InputObject.mousex += camera.position.x;
	InputObject.mousey += camera.position.y;
	InputObject.mousex -= camera.directionalShakeContribution.x;
	InputObject.mousey -= camera.directionalShakeContribution.y;
}, false );
document.addEventListener( 'touchstart', function(event)
{
	event.preventDefault();
	InputObject.isMouseDown = true;
}, false );
document.addEventListener( 'touchend', function(event)
{
	event.preventDefault();
	InputObject.isMouseDown = false;
}, false );
