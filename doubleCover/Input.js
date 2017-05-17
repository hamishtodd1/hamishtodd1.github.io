document.addEventListener( 'mousedown', go_fullscreen_and_init_object, false );
document.addEventListener('touchstart', go_fullscreen_and_init_object, false );
function go_fullscreen_and_init_object(event) 
{
	event.preventDefault();
	
	if( THREEx.FullScreen.activated() )
		return;
	
	THREEx.FullScreen.request(Renderer.domElement);
}

window.addEventListener( 'resize', function(event)
{
	Renderer.setSize( window.innerWidth, window.innerHeight );
	camera.aspect = Renderer.domElement.width / Renderer.domElement.height;
	camera.updateProjectionMatrix();
}, false );

var previousMousePosition = new THREE.Vector2();

document.addEventListener( 'mousemove', function(event) {
//	if(!isMobileOrTablet)
//	{
//		camera.rotation.y = (event.clientX - Renderer.domElement.offsetLeft) / Renderer.domElement.offsetWidth  * TAU;
//		camera.rotation.x = ( (event.clientY - Renderer.domElement.offsetTop ) / Renderer.domElement.offsetHeight * TAU / 2 - TAU / 4 )  * 0.4;
//	}
	
	var mouseDelta = new THREE.Vector2( event.clientX - previousMousePosition.x, -(event.clientY - previousMousePosition.y) );
	
	for(var i = 0; i < doubleShape.children.length; i++)
	{
//		doubleShape.children[i].quaternion.copy( doubleShape.children[i].defaultQuaternion );
		
		var mouseMovementAxis = new THREE.Vector3( -mouseDelta.y, mouseDelta.x, 0);
		doubleShape.children[i].updateMatrixWorld();
		doubleShape.children[i].worldToLocal( mouseMovementAxis );
		mouseMovementAxis.normalize();
		var mouseMovementQuaternion = new THREE.Quaternion().setFromAxisAngle(mouseMovementAxis, mouseDelta.length() / 100 );
		
		doubleShape.children[i].quaternion.multiply( mouseMovementQuaternion );
		
		if(doubleShape.children[i].quaternion.w > 0)
			doubleShape.children[i].visible = false;
		else
			doubleShape.children[i].visible = true;
	}
	
	previousMousePosition.set(event.clientX, event.clientY);
}, false );