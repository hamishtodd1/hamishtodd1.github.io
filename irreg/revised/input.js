var clientPosition = new THREE.Vector3();
var oldClientPosition = new THREE.Vector3();
var clientClicking = false;
var oldClientClicking = false;

function getClientRay()
{
	if(camera.isOrthographicCamera)
	{
		return new THREE.Line3( clientPosition.clone().setZ(camera.position.z), clientPosition.clone().setZ(-camera.position.z) );
	}
	else
	{
		return new THREE.Line3( camera.position.clone(), clientPosition.clone().sub(camera.position).multiplyScalar(2).add(camera.position) );
	}
}

function initInputSystem()
{
	var asynchronousInput = { //only allowed to use this in this file, and maybe in init
		clientPosition: new THREE.Vector3(),
		clientClicking: false,
		read: function()
		{
			oldClientClicking = clientClicking;
			clientClicking = this.clientClicking;
			
			oldClientPosition.copy(clientPosition);
			clientPosition.copy(this.clientPosition);
		}
	};

	//We assume that you are looking directly at the xy plane, and that the renderer is the view dimensions
	asynchronousInput.updateClientPosition = function(rawX,rawY)
	{
		//center
		asynchronousInput.clientPosition.x = rawX - ( renderer.domElement.width / 2 );
		asynchronousInput.clientPosition.y = -rawY+ ( renderer.domElement.height/ 2 ) - document.body.scrollTop;
		
		//scale
		asynchronousInput.clientPosition.x /= renderer.domElement.width / 2;
		asynchronousInput.clientPosition.y /= renderer.domElement.height / 2;
		
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
		
		asynchronousInput.clientPosition.x *= centerToFrameHorizontal;
		asynchronousInput.clientPosition.y *= centerToFrameVertical;
		
		asynchronousInput.clientPosition.x += camera.position.x;
		asynchronousInput.clientPosition.y += camera.position.y;
	}

	document.addEventListener( 'mousemove', function(event)
	{
		event.preventDefault();
		
		asynchronousInput.updateClientPosition(event.clientX,event.clientY);
	}, false );
	document.addEventListener( 'touchmove', function( event )
	{
		asynchronousInput.updateClientPosition( event.changedTouches[0].clientX, event.changedTouches[0].clientY );
	}, { passive: false } );

	document.addEventListener( 'touchstart', function(event)
	{
		Sounds.grab.play();
		
		asynchronousInput.updateClientPosition( event.changedTouches[0].clientX, event.changedTouches[0].clientY );
		asynchronousInput.clientClicking = true;
	}, false );
	document.addEventListener( 'mousedown', function(event) 
	{
		Sounds.grab.play();
		asynchronousInput.clientClicking = true;
	}, false );
	
	document.addEventListener( 'touchend', function(event)
	{
		Sounds.release.play();
		asynchronousInput.clientClicking = false;
	}, false );
	document.addEventListener( 'mouseup', function(event) 
	{
		Sounds.release.play();
		asynchronousInput.clientClicking = false;
	}, false );

	return asynchronousInput;
}