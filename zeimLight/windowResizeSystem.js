function initSurroundings()
{
	var backwardExtension = 0.6;
	var box = new THREE.Mesh( 
		new THREE.BoxGeometry(2*AUDIENCE_CENTER_TO_SIDE_OF_FRAME_AT_Z_EQUALS_0,2*AUDIENCE_CENTER_TO_TOP_OF_FRAME_AT_Z_EQUALS_0,backwardExtension),
		new THREE.MeshStandardMaterial({side:THREE.BackSide, vertexColors:THREE.FaceColors})
	);
	box.geometry.applyMatrix(new THREE.Matrix4().makeTranslation(0,0,-backwardExtension/2))
	for(var i = 0; i< box.geometry.faces.length; i++)
	{
		if(i === 0 || i === 1)
		{
			box.geometry.faces[i].color.setHex(0x6964D0)
		}
		else if(i === 2 || i === 3)
		{
			box.geometry.faces[i].color.setHex(0xCD6166)
		}
		else
		{
			box.geometry.faces[i].color.setHex(0xFFFFFF)
		}
	}
	box.material.metalness = 0.1;
	box.material.roughness = 0.2;
	box.receiveShadow = true;
	//you only see the back half
	scene.add(box)

	var pointLight = new THREE.PointLight(0xFFFFFF, 0.4, 5.3);
	pointLight.shadow.camera.far = 10;
	pointLight.shadow.camera.near = 0.01;
	pointLight.shadow.mapSize.width = 1024;
	pointLight.shadow.mapSize.height = pointLight.shadow.mapSize.width;
	pointLight.castShadow = true;
	pointLight.position.copy(box.geometry.vertices[3])
	pointLight.position.negate().multiplyScalar(0.6);
	box.add( pointLight );

	scene.add( new THREE.AmbientLight( 0xFFFFFF, 0.7 ) );
}

function initCameraZoomSystem()
{
	camera.defaultZ = 1.27
	camera.setToDefaultZoom = function()
	{
		camera.zoomTo = camera.defaultZ
		camera.zoomFrom = camera.defaultZ
		camera.zoomProgress = 1;
		setZoomToBeingConsidered(camera.defaultZ)
		camera.updatePosition()
		//and stuff about indicator
	}

	function smoothTween(start, end, t)
	{
		if(t < 0.5)
		{
			var areaUnderVelocityGraph = sq(t) / 2
		}
		else
		{
			var displacementFromHalf = t - 0.5;
			var extraArea = displacementFromHalf / 2 - sq(displacementFromHalf) / 2
			var areaUnderVelocityGraph = 1 / 8 + extraArea;
		}
		var scaledToMakeUnitIntegral1 = areaUnderVelocityGraph * 4;

		return start + scaledToMakeUnitIntegral1 * (end-start);
	}
	var timeSinceZoomToConsideration = 0;
	objectsToBeUpdated.push(camera)
	camera.update = function()
	{
		var timeToWaitBeforeZooming = 0.1
		if(timeSinceZoomToConsideration < timeToWaitBeforeZooming && timeToWaitBeforeZooming < timeSinceZoomToConsideration + frameDelta )
		{
			camera.zoomTo = zoomToBeingConsidered;
			camera.zoomFrom = camera.position.z;
			camera.zoomProgress = 0;
		}
		timeSinceZoomToConsideration += frameDelta;
		camera.zoomProgress += 0.019;
		camera.zoomProgress = clamp(camera.zoomProgress,0,1)
		camera.updatePosition()
	}

	camera.updatePosition = function()
	{
		camera.position.z = smoothTween(
			camera.zoomFrom,
			camera.zoomTo,
			camera.zoomProgress)
	}

	var considerationIndicator = new THREE.Mesh(new THREE.RingBufferGeometry(Math.sqrt(2), Math.sqrt(2) + 0.03, 4, 1, TAU / 8), new THREE.MeshBasicMaterial({color:0x0000FF}));
	considerationIndicator.position.z = 0;
	considerationIndicator.scale.set(
		AUDIENCE_CENTER_TO_SIDE_OF_FRAME_AT_Z_EQUALS_0,
		AUDIENCE_CENTER_TO_TOP_OF_FRAME_AT_Z_EQUALS_0,
		1 )
	console.log(considerationIndicator.scale)
	scene.add(considerationIndicator)
	var zoomToBeingConsidered = camera.defaultZ;
	document.onwheel = function (event)
	{
		event.preventDefault();
		if(event.ctrlKey)
		{
			var proposedZoomTo = zoomToBeingConsidered + 0.07 * -event.deltaY / 250;
			setZoomToBeingConsidered(proposedZoomTo)
			timeSinceZoomToConsideration = 0;
		}
	}
	function setZoomToBeingConsidered(proposedZoomTo)
	{
		zoomToBeingConsidered = clamp( proposedZoomTo, 0.0001, camera.defaultZ)
		considerationIndicator.scale.x = AUDIENCE_CENTER_TO_SIDE_OF_FRAME_AT_Z_EQUALS_0 * (zoomToBeingConsidered/camera.defaultZ);
		considerationIndicator.scale.y = considerationIndicator.scale.x / AUDIENCE_ASPECT_RATIO
	}
}

function initCameraAndRendererResizeSystem(renderer)
{
	initCameraZoomSystem()

	var audienceScreenIndicator = new THREE.Mesh(new THREE.RingBufferGeometry(Math.sqrt(2), Math.sqrt(2) + 0.1, 4, 1, TAU / 8), new THREE.MeshBasicMaterial({color:0xFF0000}));
	camera.add(audienceScreenIndicator)
	audienceScreenIndicator.position.z = -camera.near-0.0001

	function respondToResize() 
	{
		console.log( "Renderer dimensions: ", window.innerWidth, window.innerHeight )
		renderer.setSize( window.innerWidth, window.innerHeight );
		camera.aspect = window.innerWidth / window.innerHeight;

		camera.setToDefaultZoom()

		var audienceProportionOfWindowWidth = getAudienceProportionOfWindowWidth();
		var horizontalCenterToFrameDistance = AUDIENCE_CENTER_TO_SIDE_OF_FRAME_AT_Z_EQUALS_0 / audienceProportionOfWindowWidth

		var horizontalFov = fovGivenCenterToFrameDistance( horizontalCenterToFrameDistance, camera.position.z );
		camera.fov = otherFov(horizontalFov,camera.aspect, false)
		camera.updateProjectionMatrix();

		audienceScreenIndicator.scale.x = centerToFrameDistance(horizontalFov, audienceScreenIndicator.position.z) * audienceProportionOfWindowWidth
		audienceScreenIndicator.scale.y = audienceScreenIndicator.scale.x / AUDIENCE_ASPECT_RATIO;
	}
	respondToResize();
	window.addEventListener( 'resize', respondToResize, false );
}

function centerToFrameDistance(fov, cameraDistance)
{
	return Math.tan( fov / 2 * (TAU/360) ) * cameraDistance;
}
function fovGivenCenterToFrameDistance(centerToFrame, cameraDistance)
{
	return 2 * Math.atan(centerToFrame / cameraDistance) * (360/TAU);
}

function otherFov(inputFov,aspectRatio,inputIsVertical)
{
	var centerToFrameInput = centerToFrameDistance(inputFov,1)
	var centerToFrameOutput = centerToFrameInput;
	if(inputIsVertical)
	{
		centerToFrameOutput *= aspectRatio;
	}
	else
	{
		centerToFrameOutput /= aspectRatio;
	}
	var outputFov = fovGivenCenterToFrameDistance(centerToFrameOutput,1);
	return outputFov;
}

function getAudienceProportionOfWindowWidth()
{
	return AUDIENCE_CENTER_TO_SIDE_OF_FRAME_PIXELS / (window.innerWidth*0.5*window.devicePixelRatio)
}