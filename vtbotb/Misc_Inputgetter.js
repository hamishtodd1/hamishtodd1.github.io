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
	document.getElementById("extras").style.margin = window.innerHeight.toString() + "px 0 0 0";
	
	var maxCanvasDimension = window.innerHeight * (447/550); //chosen by inspection
	if( maxCanvasDimension > document.body.clientWidth / 2 ) 
		maxCanvasDimension = document.body.clientWidth / 2;
	
//	var finalCanvasDimension = 144;
//	var possibleDimensions = [240,360,480,720,1080];
//	for(var i = 0; i < possibleDimensions.length; i++ )
//		if( maxCanvasDimension >= possibleDimensions[i] )
//			finalCanvasDimension = possibleDimensions[i];
//	if( maxCanvasDimension >= 1080 * 4/3 )
//		finalCanvasDimension = maxCanvasDimension;
	finalCanvasDimension = maxCanvasDimension;
	
	renderer.setSize( finalCanvasDimension * canvasWidthOverHeight, finalCanvasDimension );

	{
		var playerAndCanvas = document.getElementById("playerAndCanvas");
		
		playerAndCanvas.style.height = finalCanvasDimension.toString() + "px";
		var divWidth = finalCanvasDimension + finalCanvasDimension * canvasWidthOverHeight;
		playerAndCanvas.style.width = divWidth.toString() + "px";
		
		//putting the center in the center
		var sideToCenter = divWidth / 2;
		var topToCenter = finalCanvasDimension / 2;
		playerAndCanvas.style.margin = "-" + topToCenter.toString() + "px 0 0 -" + sideToCenter.toString() + "px";
		
		var playerAndCanvasBottomToWindowBottom = ( window.innerHeight - finalCanvasDimension ) / 4;
		var topToDivCenterPercentageOfWindowHeight = ( playerAndCanvasBottomToWindowBottom * 3 + finalCanvasDimension / 2 ) / window.innerHeight * 100;
		playerAndCanvas.style.top = topToDivCenterPercentageOfWindowHeight.toString() + "%";
	}
	
	{
		var titleDiv = document.getElementById( "title" );
		
		var fontSizeOverFinalCanvasDimension = (484/893)/( (476/1200)/(30/480) ); //(484/893) is the titleWidth:divWidth proportion Sheree chose,30:480 is an observed fs/fcd
		var fontSize = Math.round( fontSizeOverFinalCanvasDimension * finalCanvasDimension );
		titleDiv.style.fontSize = fontSize.toString() + "px";
		
		var titleVeryTopToVeryBottomOverCanvasDimension = 45.5 / 600; //but
		titleHalfHeight = Math.round(titleVeryTopToVeryBottomOverCanvasDimension * finalCanvasDimension / 2);
		console.log(titleHalfHeight)
		titleDiv.style.margin = "-" + titleHalfHeight.toString() + "px 0 0 0";
		
		//we'd like to assume its center is in its center
		var topToTitleCenterPercentageOfWindowHeight = ( playerAndCanvasBottomToWindowBottom * 3 / 2 ) / window.innerHeight * 100; //appears to be fine
		console.log(topToTitleCenterPercentageOfWindowHeight)
		titleDiv.style.top = topToTitleCenterPercentageOfWindowHeight.toString() + "%";
	}
	
	return finalCanvasDimension;
}
onWindowResizeExceptYoutube(1);

function onWindowResize()
{
	var finalCanvasDimension = onWindowResizeExceptYoutube(1);
	
	//Hopefully youtube knows what to do (it didn't always listen anyway)
//	var qualityString = "";
//	if(finalCanvasDimension === 240)
//		qualityString += "small";
//	else if(finalCanvasDimension === 360)
//		qualityString += "medium";
//	else if(finalCanvasDimension === 480)
//		qualityString += "large";
//	else if(finalCanvasDimension === 720)
//		qualityString += "hd720";
//	else if(finalCanvasDimension >= 1080)
//		qualityString += "hd1080";
//	else qualityString += "default";
//	ytplayer.setPlaybackQuality( qualityString ); //and if their connection is too slow, they have the cog
	
	ytplayer.setSize(finalCanvasDimension,finalCanvasDimension);
}		
window.addEventListener( 'resize', onWindowResize, false );

document.addEventListener( 'mousedown', function(event) {
	event.preventDefault();
	
	InputObject.isMouseDown = true;
	
	console.log(MousePosition)
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
