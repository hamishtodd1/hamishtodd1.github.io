function initMouse()
{
	var mouse = {};

	mouse.position = new THREE.Vector3();
	mouse.oldPosition = new THREE.Vector3();
	mouse.delta = new THREE.Vector3();
	mouse.clicking = false;
	mouse.oldClicking = false;

	var asynchronousMouse = {
		position: new THREE.Vector3(),
		clicking: false,
		read: function()
		{
			mouse.oldClicking = mouse.clicking;
			mouse.clicking = this.clicking;
			
			mouse.oldPosition.copy(mouse.position);
			mouse.position.copy(this.position);
			mouse.delta.subVectors(mouse.position, mouse.oldPosition)
		}
	};

	//We assume that you are looking directly at the xy plane, and that the renderer is the view dimensions
	asynchronousMouse.updatePosition = function(rawX,rawY)
	{
		//center
		asynchronousMouse.position.x = rawX - ( renderer.domElement.width / 2 );
		asynchronousMouse.position.y = -rawY+ ( renderer.domElement.height/ 2 ) - document.body.scrollTop;
		
		//scale
		asynchronousMouse.position.x /= renderer.domElement.width / 2;
		asynchronousMouse.position.y /= renderer.domElement.height / 2;
		
		if(camera.isOrthographicCamera)
		{
			var centerToFrameVertical = (camera.top - camera.bottom) / 2;
			var centerToFrameHorizontal = centerToFrameVertical * camera.aspect;
		}
		else
		{
			var centerToFrameVertical = Math.tan( camera.fov * TAU / 360 / 2 ) * camera.position.z;
			var centerToFrameHorizontal = centerToFrameVertical * camera.aspect;
		}
		
		asynchronousMouse.position.x *= centerToFrameHorizontal;
		asynchronousMouse.position.y *= centerToFrameVertical;
		
		asynchronousMouse.position.applyMatrix4(camera.matrix);
	}

	document.addEventListener( 'mousemove', function(event)
	{
		event.preventDefault();
		asynchronousMouse.updatePosition(event.mouseX,event.mouseY);
	}, false );

	document.addEventListener( 'mousedown', function(event) 
	{
		asynchronousMouse.clicking = true;
	}, false );
	
	document.addEventListener( 'mouseup', function(event) 
	{
		asynchronousMouse.clicking = false;
	}, false );

	return asynchronousMouse;
}