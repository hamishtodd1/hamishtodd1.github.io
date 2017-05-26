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
	var mouseDelta = new THREE.Vector2( event.clientX - previousMousePosition.x, -(event.clientY - previousMousePosition.y) );
	
	var mouseMovementAxis = new THREE.Vector3( -mouseDelta.y, mouseDelta.x, 0);
	
	doubleSphere.spectatorDirection.copy(camera.position);
	doubleSphere.spectatorDirection.sub(doubleSphere.position);
	doubleSphere.spectatorDirection.normalize();
	
	for(var i = 0; i < doubleSphere.triangles.length; i++ )
	{
		var specificAxis = mouseMovementAxis.clone();
		doubleSphere.triangles[i].updateMatrixWorld();
		doubleSphere.triangles[i].worldToLocal(specificAxis);
		specificAxis.normalize();

		var mouseMovementQuaternion = new THREE.Quaternion().setFromAxisAngle(specificAxis, mouseDelta.length() / 200 );
		
		doubleSphere.triangles[i].quaternion.multiply(mouseMovementQuaternion);
	}
	
	previousMousePosition.set(event.clientX, event.clientY);
}, false );

//document.addEventListener( 'mousemove', function(event) {
//	var mouseDelta = new THREE.Vector2( event.clientX - previousMousePosition.x, -(event.clientY - previousMousePosition.y) );
//	
//	var mouseMovementAxis = new THREE.Vector3( -mouseDelta.y, mouseDelta.x, 0);
//	mouseMovementAxis.normalize();
//	
//	var mouseMovementQuaternion = new THREE.Quaternion().setFromAxisAngle(mouseMovementAxis, mouseDelta.length() / 200 );
//	
//	RP2.spectatorDirection.copy(camera.position);
//	RP2.spectatorDirection.sub(RP2.position);
//	RP2.spectatorDirection.normalize();
//	
//	for(var i = 0, il = RP2.surface.geometry.vertices.length; i < il; i++)
//	{
//		var ourVertex = RP2.surface.geometry.vertices[i];
//		ourVertex.applyQuaternion(mouseMovementQuaternion);
//		
//		if( ourVertex.angleTo(RP2.spectatorDirection) > TAU / 4 )
//		{
//			var correctionAxis = ourVertex.clone();
//			correctionAxis.cross(RP2.spectatorDirection);
//			correctionAxis.cross(ourVertex);
//			correctionAxis.normalize();
//			
//			ourVertex.applyAxisAngle(correctionAxis, TAU / 2);
//		}
//	}
//
//	RP2.surface.geometry.verticesNeedUpdate = true;
//	
//	previousMousePosition.set(event.clientX, event.clientY);
//}, false );

//document.addEventListener( 'mousemove', function(event) {
////	if(!isMobileOrTablet)
////	{
////		camera.rotation.y = (event.clientX - Renderer.domElement.offsetLeft) / Renderer.domElement.offsetWidth  * TAU;
////		camera.rotation.x = ( (event.clientY - Renderer.domElement.offsetTop ) / Renderer.domElement.offsetHeight * TAU / 2 - TAU / 4 )  * 0.4;
////	}
//	
//	var mouseDelta = new THREE.Vector2( event.clientX - previousMousePosition.x, -(event.clientY - previousMousePosition.y) );
//	
//	for(var i = 0; i < doubleShape.children.length; i++)
//	{
////		doubleShape.children[i].quaternion.copy( doubleShape.children[i].defaultQuaternion );
//		
//		var mouseMovementAxis = new THREE.Vector3( -mouseDelta.y, mouseDelta.x, 0);
//		doubleShape.children[i].updateMatrixWorld();
//		doubleShape.children[i].worldToLocal( mouseMovementAxis );
//		mouseMovementAxis.normalize();
//		var mouseMovementQuaternion = new THREE.Quaternion().setFromAxisAngle(mouseMovementAxis, mouseDelta.length() / 100 );
//		
//		doubleShape.children[i].quaternion.multiply( mouseMovementQuaternion );
//	}
//	
//	var mostVisibleChild = -1;
//	var closestDistance = 9999999;
//	for(var i = 0; i < doubleShape.children.length; i++)
//	{
//		if( !doubleShape.children[i].visible )
//			continue;
//		var centralPosition = doubleShape.children[i].geometry.boundingSphere.center.clone();
//		doubleShape.children[i].updateMatrixWorld();
//		doubleShape.children[i].localToWorld(centralPosition);
//		if( centralPosition.distanceTo(camera.position) < closestDistance)
//		{
//			mostVisibleChild = i;
//			closestDistance = centralPosition.distanceTo(camera.position)
//		}
//	}
//	for(var i = 0; i < doubleShape.children.length; i++)
//	{
//		if( doubleShape.children[i].defaultQuaternion.fourDAngleTo(doubleShape.children[mostVisibleChild].defaultQuaternion) <= TAU / 4 )
//		{
//			doubleShape.children[i].visible = true;
//		}
//		else
//			doubleShape.children[i].visible = false;
//	}
//	
//	
//	/*
//	 * How bout: for all visible faces, find the one closest to the camera. 
//	 * Then only show those faces whose quaternion is in the hemisphere surrounding it.
//	 * 
//	 * Why doesn't that work? You may be impementing it wrong
//	 * It is probably worth trying to prove or disprove it. What the fuck are the combinatorics?
//	 */
//	
//	previousMousePosition.set(event.clientX, event.clientY);
//}, false );