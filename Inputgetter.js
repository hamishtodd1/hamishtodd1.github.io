document.addEventListener( 'mousedown', onDocumentMouseDown, false);
document.addEventListener( 'mouseup', onDocumentMouseUp, false);
document.addEventListener( 'mousemove', onDocumentMouseMove, false ); //window?
document.addEventListener( 'touchstart', onDocumentMouseDown, false );
document.addEventListener( 'touchmove', onDocumentTouchMove, false );
document.addEventListener( 'touchend', onDocumentMouseUp, false );

//remember there can be weirdness for multiple fingers, so make sure any crazy series of inputs are interpretable
function onDocumentMouseDown(event) {
	event.preventDefault();
	InputObject.isMouseDown = true;
}
function onDocumentMouseUp(event) {
	event.preventDefault();
	InputObject.isMouseDown = false;
	//minimum amount of time so that people don't hammer the screen?
}

function onDocumentMouseMove( event ) {
	event.preventDefault();
	InputObject.mousex = event.clientX;
	InputObject.mousey = event.clientY;
}

function onDocumentTouchMove( event ) {
	event.preventDefault();
	InputObject.mousex = event.changedTouches[0].clientX; //only looking at the first one. TODO multi-touch!
	InputObject.mousey = event.changedTouches[0].clientY;
}

function update_mouseblob(){
	var Xdists_from_center = Array(circle.geometry.vertices.length);
	var Ydists_from_center = Array(circle.geometry.vertices.length);
	for(var i = 0; i < circle.geometry.vertices.length; i++) {
		Xdists_from_center[i] = circle.geometry.vertices[i].x - circle.geometry.vertices[0].x;
		Ydists_from_center[i] = circle.geometry.vertices[i].y - circle.geometry.vertices[0].y;
	}
	
	var cursorposition = new THREE.Vector2(MousePosition.x,MousePosition.y);
	if(MODE==CUBIC_LATTICE_MODE)
		cursorposition.multiplyScalar(4.5);
	for(var i = 0; i < circle.geometry.vertices.length; i++) {
		circle.geometry.vertices[i].x = cursorposition.x + Xdists_from_center[i];
		circle.geometry.vertices[i].y = cursorposition.y + Ydists_from_center[i];
	}
	
	circle.geometry.verticesNeedUpdate = true;
}

//this is called once a frame and must be the only thing that addresses Inputobject, lest functions get different impressions of inputs.
//this function shouldn't actually *do* anything with the data, it's only to be read elsewhere.
function ReadInput() {
	OldMousePosition.copy( MousePosition );
	MousePosition.x = (InputObject.mousex-window_width/2) * (playing_field_width / window_width);
	MousePosition.y = -(InputObject.mousey-window_height/2) * (playing_field_height / window_height);
	
	Mouse_delta.set( MousePosition.x - OldMousePosition.x, MousePosition.y - OldMousePosition.y);
	
	isMouseDown_previously = isMouseDown;
	isMouseDown = InputObject.isMouseDown;
	
	var secondsthroughvid = get_time();
	if(secondsthroughvid > 3 && MODE != CK_MODE)
		console.log("woo");
//		function ChangeScene(CK_MODE);
}