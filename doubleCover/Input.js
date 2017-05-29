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

//document.addEventListener( 'mousemove', function(event) {
//	var mouseDelta = new THREE.Vector2( event.clientX - previousMousePosition.x, -(event.clientY - previousMousePosition.y) );
//	var mouseMovementAxis = new THREE.Vector3( -mouseDelta.y, mouseDelta.x, 0);
//	var mouseMovementAmount = mouseDelta.length() / 200;
//	
//	var spectatorMouseMovementAxis = mouseMovementAxis.clone();
//	spectatorMouseMovementAxis.applyQuaternion(doubleSphere.spectatorQuaternion);
//	spectatorMouseMovementAxis.normalize();
//	var spectatorMouseMovementQuaternion = new THREE.Quaternion().setFromAxisAngle(spectatorMouseMovementAxis, mouseMovementAmount );
//	doubleSphere.spectatorQuaternion.multiply(spectatorMouseMovementQuaternion);
//	
//	var visible = 0;
//	
//	for(var i = 0; i < doubleSphere.triangles.length; i++ )
//	{
//		var specificAxis = mouseMovementAxis.clone();
//		doubleSphere.triangles[i].updateMatrixWorld();
//		doubleSphere.triangles[i].worldToLocal(specificAxis);
//		specificAxis.normalize();
//
//		var mouseMovementQuaternion = new THREE.Quaternion().setFromAxisAngle(specificAxis, mouseMovementAmount );
//		
//		doubleSphere.triangles[i].quaternion.multiply(mouseMovementQuaternion);
//		
//		/*
//		 * Mkay, cylinder inside S3.
//		 * It is the intersection of
//		 * 		the hyper hemisphere (a solid ball) representing the neighbourhood of quaternions you want to see, eg the ones that are in the world
//		 * 		and the solid donut that is the quaternions that you usually see at the front of whatever you look at
//		 * Well so... it's ok to just exclude those outside the hyper hemisphere. The seeing stuff takes care of itslf
//		 * things entering and leaving visibility is entering and leaving the hyper hemisphere. So you don't want to be looking at a triangle when it does that
//		 * 		when it leaves, its partner enters on the opposite pole, eg it changes color
//		 * 		Therefore: things are only allowed to enter from the sides of the cylinder, not from the caps, because the caps touch the top of that sphere
//		 * 		As you move the cylinder nothing can come through the caps  
//		 * The axis pointing towards you is the circle that the cylinder partly surrounds
//		 * 
//		 * 
//		 * Sooo: flip if distanceTo is greater than 
//		 */
//		
//		if( doubleSphere.triangles[i].quaternion.distanceTo(doubleSphere.spectatorQuaternion) < TAU / 4)
//		{
//			doubleSphere.triangles[i].visible = true;
//			visible++;
//		}
//		else
//			doubleSphere.triangles[i].visible = false;
//	}
//	
//	console.log( visible / doubleSphere.triangles.length )
//	
//	previousMousePosition.set(event.clientX, event.clientY);
//}, false );

mouseDelta = new THREE.Vector2();
document.addEventListener( 'mousemove', function(event) {
	mouseDelta.set( event.clientX - previousMousePosition.x, -(event.clientY - previousMousePosition.y) );
	previousMousePosition.set(event.clientX, event.clientY);
}, false );

document.addEventListener( 'keydown', function(event)
{
	//arrow keys
	if( 37 <= event.keyCode && event.keyCode <= 40)
	{
		var positionChange = 0.07;
		if(event.keyCode === 39)
		{
			spectatorPosition.sub(RP2.position);
			spectatorPosition.applyAxisAngle(yAxis, positionChange);
			spectatorPosition.add(RP2.position);
		}
		if(event.keyCode === 37)
		{
			spectatorPosition.sub(RP2.position);
			spectatorPosition.applyAxisAngle(yAxis, -positionChange);
			spectatorPosition.add(RP2.position);
		}
	}	
}, false );

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