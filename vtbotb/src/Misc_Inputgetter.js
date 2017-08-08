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
	
	react_to_video();	
}

function onWindowResizeExceptYoutube( canvasWidthOverHeight )
{
	var maxCanvasDimension = window.innerHeight * (447/550); //chosen by inspection
	if( maxCanvasDimension > document.body.clientWidth / 2 ) 
		maxCanvasDimension = Math.floor( document.body.clientWidth / 2 );
	if(maxCanvasDimension % 2)
		maxCanvasDimension -= 1;
	
//	var finalCanvasDimension = 144;
//	var possibleDimensions = [240,360,480,720,1080];
//	for(var i = 0; i < possibleDimensions.length; i++ )
//		if( maxCanvasDimension >= possibleDimensions[i] )
//			finalCanvasDimension = possibleDimensions[i];
//	if( maxCanvasDimension >= 1080 * 4/3 )
//		finalCanvasDimension = maxCanvasDimension;
	
	var finalCanvasDimension = maxCanvasDimension;
	
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
		var fontSizeOverFinalCanvasDimension = 0.0854;
		var fontSize = Math.round( fontSizeOverFinalCanvasDimension * finalCanvasDimension );
		
		var titleDiv = document.getElementById( "title" );
		titleDiv.style.fontSize = fontSize.toString() + "px";
		titleDiv.style.lineHeight = 2.6 * playerAndCanvasBottomToWindowBottom / fontSize;
		
		var warningDiv = document.getElementById( "warning" );
		
		if( window.innerHeight>window.innerWidth )
		{
			warningDiv.style.fontSize = fontSize.toString() + "px";
			warningDiv.style.lineHeight = 0;
			warningDiv.style.visibility='visible';
		}
		else
			warningDiv.style.visibility='hidden';
	}
	
	{
		var extras = document.getElementById("extras");
		var halfExtrasWidth = extras.offsetWidth / 2;
		extras.style.margin = "0 0 0 -" + halfExtrasWidth.toString() + "px";
	}
	
	renderer.setSize( finalCanvasDimension * canvasWidthOverHeight, finalCanvasDimension );
	
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
}, false);
document.addEventListener( 'mouseup', 	function(event) {
	event.preventDefault();
	
	InputObject.isMouseDown = false;
}, false);

function updateInputObjectMousePosition(unfilteredX, unfilteredY)
{
	var canvasDimension = renderer.domElement.width;
	
	var wasInCanvas = false;
	
	InputObject.mousex = unfilteredX - (document.body.clientWidth / 2 + canvasDimension/2);
	InputObject.mousey = -(unfilteredY - ( ( window.innerHeight - canvasDimension ) * 3/4 + canvasDimension / 2)) - document.body.scrollTop;
	
	if( -0.5 <= InputObject.mousex / canvasDimension && InputObject.mousex / canvasDimension <= 0.5 &&
		-0.5 <= InputObject.mousey / canvasDimension && InputObject.mousey / canvasDimension <= 0.5 )
		wasInCanvas = true;
	
	InputObject.mousex *= playing_field_dimension / canvasDimension;
	InputObject.mousey *= playing_field_dimension / canvasDimension;
	
	InputObject.mousex += camera.position.x;
	InputObject.mousey += camera.position.y;
	InputObject.mousex -= camera.directionalShakeContribution.x;
	InputObject.mousey -= camera.directionalShakeContribution.y;
	
	return wasInCanvas;
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
	
	if( updateInputObjectMousePosition( event.changedTouches[0].clientX, event.changedTouches[0].clientY ) )
		event.preventDefault();
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