//moving mouse left and right causes it to rotate. Holding mouse down makes your reticle appear? Yeah, because the 3d effect is the point

initializers.simpleDesktop = function(socket, pdbWebAddress, roomKey, launcher, visiBox, thingsToBeUpdated, renderer, userManager )
{
	camera.rotation.order = "YXZ";

	var mouse = initMouseSystem(renderer);

	var ctrlHeld = false;
	document.addEventListener( 'keydown', function(event)
	{
		if(event.keyCode === 17 )
		{
			ctrlHeld = true;
		}
	} );
	document.addEventListener( 'keyup', function(event)
	{
		if(event.keyCode === 17 )
		{
			ctrlHeld = false;
		}
	} );

	var poiSphere = new THREE.Object3D();
	for(var i = 0; i < 3; i++)
	{
		poiSphere.add(new THREE.Line(new THREE.Geometry(), new THREE.LineBasicMaterial({color:0xFFFFFF, linewidth: 4})));
		var numVertices = 32;
		for(var j = 0; j < numVertices+1; j++)
		{
			var a = new THREE.Vector3().setComponent((i+1)%3,0.01);
			a.applyAxisAngle(new THREE.Vector3().setComponent(i,1), j/numVertices * TAU);
			poiSphere.children[i].geometry.vertices.push(a)
		}
	}	
	scene.add(poiSphere)

	var reticle = new THREE.Mesh(new THREE.CircleBufferGeometry(0.0009,32), new THREE.MeshBasicMaterial({color:0xFFFFFF, side: THREE.DoubleSide}));
	scene.add(reticle);

	coreLoops.simpleDesktop = function( socket, visiBox, thingsToBeUpdated, userManager, mouse )
	{
		frameDelta = ourClock.getDelta();

		mouse.readFromAsynchronousInput();
		if(!ctrlHeld)
		{
			// model.localToWorld(pointOfInterestInModel);
			// camera.worldToLocal(pointOfInterestInModel);
			var pointOfInterestInModel = new THREE.Vector3(0,0,-0.1)
			camera.localToWorld( pointOfInterestInModel );

			camera.rotation.y += -mouse.proportionalDelta.x;
			camera.rotation.x += mouse.proportionalDelta.y;
			camera.rotation.y = clamp(camera.rotation.y, -TAU/2, TAU/2);
			camera.rotation.x = clamp(camera.rotation.x, -TAU/4, TAU/4);
			camera.updateMatrixWorld();

			var currentLocationOfPOI = new THREE.Vector3(0,0,-0.1)
			camera.localToWorld( currentLocationOfPOI );
			model.position.sub(pointOfInterestInModel);
			model.position.add(currentLocationOfPOI);

			poiSphere.position.copy(currentLocationOfPOI)
		}
		else
		{
			model.position.addScaledVector(mouse.delta,0.1);
		}

		reticle.position.copy(mouse.position);
		reticle.position.lerp(camera.position,0.98)
		reticle.lookAt(camera.position);
		reticle.visible = mouse.clicking;
		
		for( var thing in thingsToBeUpdated)
		{
			if( thingsToBeUpdated[thing].length !== undefined)
			{
				for(var i = 0, il = thingsToBeUpdated[thing].length; i < il; i++)
					thingsToBeUpdated[thing][i].update();
			}
			else
				thingsToBeUpdated[thing].update();
		}
		
		userManager.sendOurUpdate();
	}

	function render()
	{
		coreLoops.simpleDesktop( socket, visiBox, thingsToBeUpdated, userManager, mouse )

		requestAnimationFrame( render );
		renderer.render( scene, camera );
	}
	launcher.render = render;
}

function clamp(n, min, max)
{
	return Math.max(min, Math.min(n, max))
}

function initMouseSystem(renderer)
{
	var mouse = {
		position: new THREE.Vector3(),
		oldPosition: new THREE.Vector3(),

		delta: new THREE.Vector3(),

		clicking: false,
		oldClicking: false,

		proportionalPosition: new THREE.Vector2(),
		oldProportionalPosition: new THREE.Vector2(),
		proportionalDelta:new THREE.Vector2()
	};

	mouse.readFromAsynchronousInput = function()
	{
		this.oldClicking = this.clicking;
		this.clicking = asynchronousInput.clicking;

		this.oldProportionalPosition.copy(this.proportionalPosition);
		this.proportionalPosition.copy(asynchronousInput.proportionalPosition);
		this.proportionalDelta.subVectors(this.proportionalPosition,this.oldProportionalPosition);
		
		this.oldPosition.copy(mouse.position);
		this.position.copy(asynchronousInput.position);
		this.delta.subVectors(this.position, this.oldPosition);
	}

	var asynchronousInput = { //only allowed to use this in this file, and maybe in init
		position: new THREE.Vector3(),
		proportionalPosition: new THREE.Vector2(),
		leftClicking: false,
		rightClicking: false,
	};

	//We assume that you are looking directly at the xy plane, and that the renderer is the view dimensions
	asynchronousInput.updateMousePosition = function(rawX,rawY)
	{
		//center
		var rendererDimensions = renderer.getSize();
		asynchronousInput.proportionalPosition.x = rawX - ( rendererDimensions.width / 2 );
		asynchronousInput.proportionalPosition.y = -rawY+ ( rendererDimensions.height/ 2 ) - document.body.scrollTop;
		
		//scale
		asynchronousInput.proportionalPosition.x /= rendererDimensions.width / 2;
		asynchronousInput.proportionalPosition.y /= rendererDimensions.height / 2;

		if(camera.isOrthographicCamera)
		{
			var centerToFrameVertical = (camera.top - camera.bottom) / 2;
			var centerToFrameHorizontal = centerToFrameVertical * camera.aspect;
		}
		else
		{
			var centerToFrameVertical = Math.tan( camera.fov * TAU / 360 / 2 );
			var centerToFrameHorizontal = centerToFrameVertical * camera.aspect;
		}
		
		asynchronousInput.position.z = -1;
		asynchronousInput.position.x = asynchronousInput.proportionalPosition.x * centerToFrameHorizontal;
		asynchronousInput.position.y = asynchronousInput.proportionalPosition.y * centerToFrameVertical;
		
		camera.localToWorld( asynchronousInput.position );
		//and maybe angle the pointer? Maybe it has some fake perspective?
	}

	document.addEventListener( 'mousemove', function(event)
	{
		// console.log(event)
		asynchronousInput.updateMousePosition(event.clientX,event.clientY);
	} );
	document.addEventListener( 'mousedown', function(event) 
	{
		asynchronousInput.leftClicking = true;
	} );
	document.addEventListener( 'mouseup', function(event) 
	{
		asynchronousInput.leftClicking = false;
	} );

	document.addEventListener( 'mousedown', function(event) 
	{
		asynchronousInput.clicking = true;
	} );
	document.addEventListener( 'mouseup', function(event) 
	{
		asynchronousInput.clicking = false;
	} );

	return mouse;
}