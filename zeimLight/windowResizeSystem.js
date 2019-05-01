//TODO up top!
function initSurroundings()
{
	var backwardExtension = 1.6;
	//you probably don't need the ceiling or walls!
	let width = 3.3*AUDIENCE_CENTER_TO_SIDE_OF_FRAME_AT_Z_EQUALS_0
	var stage = new THREE.Mesh( 
		new THREE.PlaneGeometry(width,
			3.3*AUDIENCE_CENTER_TO_TOP_OF_FRAME_AT_Z_EQUALS_0),
		new THREE.MeshStandardMaterial({color:0xFFFFFF})
	);
	let floor = new THREE.PlaneGeometry(
		width,
		backwardExtension)
	floor.applyMatrix(new THREE.Matrix4().makeRotationX(-TAU/4)
		.setPosition(new THREE.Vector3(0,-AUDIENCE_CENTER_TO_TOP_OF_FRAME_AT_Z_EQUALS_0,backwardExtension/2)))
	stage.geometry.merge(floor)

	// let backGrid = Grid(40,11,0.1)
	// backGrid.geometry.applyMatrix(new THREE.Matrix4().makeTranslation(0,0,-backwardExtension*0.999))
	// stage.add(backGrid)

	stage.geometry.applyMatrix(new THREE.Matrix4().makeTranslation(0,0,-backwardExtension))
	camera.far = camera.defaultZ + backwardExtension + 0.01
	stage.material.metalness = 0.1;
	stage.material.roughness = 0.2;
	stage.receiveShadow = true;
	scene.add(stage)

	var pointLight = new THREE.PointLight(0xFFFFFF, 0.4, 5.3);
	pointLight.shadow.camera.far = 10;
	pointLight.shadow.camera.near = 0.01;
	pointLight.shadow.mapSize.width = 1024;
	pointLight.shadow.mapSize.height = pointLight.shadow.mapSize.width;
	pointLight.castShadow = true;
	pointLight.position.copy(stage.geometry.vertices[3])
	pointLight.position.negate().multiplyScalar(0.6);
	stage.add( pointLight );

	scene.add( new THREE.AmbientLight( 0xFFFFFF, 0.7 ) );

	return stage;
}

function initCameraZoomSystem()
{
	camera.defaultZ = 2.5
	camera.setToDefaultZoom = function()
	{
		camera.zoomTo = camera.defaultZ
		camera.zoomFrom = camera.defaultZ
		camera.zoomProgress = 1;
		setZoomToBeingConsidered(camera.defaultZ)
		camera.updatePosition()
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
	function linearTween(start, end, t)
	{
		return start + t * (end-start);
	}
	var timeSinceZoomToConsideration = 0;
	updateFunctions.push(function()
	{
		var timeToWaitBeforeZooming = 0.18
		if(timeSinceZoomToConsideration < timeToWaitBeforeZooming && timeToWaitBeforeZooming < timeSinceZoomToConsideration + frameDelta )
		{
			camera.zoomTo = zoomToBeingConsidered;
			camera.zoomFrom = camera.position.z;
			camera.zoomProgress = 0;
		}
		timeSinceZoomToConsideration += frameDelta;
		camera.zoomProgress += 1.1 * frameDelta;
		camera.zoomProgress = clamp(camera.zoomProgress,0,1)
		camera.updatePosition()
	})

	camera.updatePosition = function()
	{
		camera.position.z = smoothTween(
			camera.zoomFrom,
			camera.zoomTo,
			camera.zoomProgress)
	}

	var considerationIndicatorHorizontal = new THREE.LineSegments(new THREE.Geometry(), new THREE.LineBasicMaterial({color:0xFFFFFF}))
	scene.add(considerationIndicatorHorizontal)
	var a = AUDIENCE_CENTER_TO_SIDE_OF_FRAME_AT_Z_EQUALS_0;
	considerationIndicatorHorizontal.geometry.vertices.push(
		new THREE.Vector3(a,1,0), new THREE.Vector3(a+1,1,0),
		new THREE.Vector3(-a,1,0), new THREE.Vector3(-a-1,1,0),

		new THREE.Vector3(a,-1,0), new THREE.Vector3(a+1,-1,0),
		new THREE.Vector3(-a,-1,0), new THREE.Vector3(-a-1,-1,0) )
	var considerationIndicatorVertical = new THREE.LineSegments(new THREE.Geometry(), considerationIndicatorHorizontal.material)
	scene.add(considerationIndicatorVertical)
	a = AUDIENCE_CENTER_TO_TOP_OF_FRAME_AT_Z_EQUALS_0;
	considerationIndicatorVertical.geometry.vertices.push(
		new THREE.Vector3(1,a,0), new THREE.Vector3(1,a+1,0),
		new THREE.Vector3(1,-a,0), new THREE.Vector3(1,-a-1,0),

		new THREE.Vector3(-1,a,0), new THREE.Vector3(-1,a+1,0),
		new THREE.Vector3(-1,-a,0), new THREE.Vector3(-1,-a-1,0) )

	var zoomToBeingConsidered;
	if(!PUBLIC_FACING)
	{
		document.onwheel = function (event)
		{
			event.preventDefault();
			if(!event.ctrlKey)
			{
				var proposedZoomTo = zoomToBeingConsidered + 0.14 * event.deltaY / 250 * camera.defaultZ;
				setZoomToBeingConsidered(proposedZoomTo)
				timeSinceZoomToConsideration = 0;
			}
		}
	}
	
	function setZoomToBeingConsidered(proposedZoomTo)
	{
		zoomToBeingConsidered = clamp( proposedZoomTo, 0.0001, camera.defaultZ)
		considerationIndicatorVertical.scale.x = AUDIENCE_CENTER_TO_SIDE_OF_FRAME_AT_Z_EQUALS_0 * (zoomToBeingConsidered/camera.defaultZ);
		considerationIndicatorHorizontal.scale.y = considerationIndicatorVertical.scale.x / AUDIENCE_ASPECT_RATIO
	}
	setZoomToBeingConsidered(camera.defaultZ)
}

function initCameraAndRendererResizeSystem(renderer)
{
	initCameraZoomSystem()

	if(!PUBLIC_FACING)
	{
		var audienceScreenIndicator = new THREE.Mesh(
			new THREE.RingBufferGeometry(Math.sqrt(2), Math.sqrt(2) + 0.1, 4, 1, TAU / 8), 
			new THREE.MeshBasicMaterial({color:0x000000}));
		audienceScreenIndicator.position.z = -camera.near-0.0001
		camera.add(audienceScreenIndicator)
	}

	function respondToResize() 
	{
		// console.log( "Renderer dimensions: ", window.innerWidth, window.innerHeight )
		renderer.setSize( window.innerWidth, window.innerHeight );
		camera.aspect = window.innerWidth / window.innerHeight;

		camera.setToDefaultZoom()

		if( !PUBLIC_FACING )
		{
			var audienceProportionOfWindowWidth = getAudienceProportionOfWindowWidth();
			var horizontalCenterToFrameDistance = AUDIENCE_CENTER_TO_SIDE_OF_FRAME_AT_Z_EQUALS_0 / audienceProportionOfWindowWidth

			var horizontalFov = fovGivenCenterToFrameDistance( horizontalCenterToFrameDistance, camera.position.z );
			camera.fov = otherFov(horizontalFov,camera.aspect, false)

			audienceScreenIndicator.scale.x = centerToFrameDistance(horizontalFov, audienceScreenIndicator.position.z) * audienceProportionOfWindowWidth
			audienceScreenIndicator.scale.y = audienceScreenIndicator.scale.x / AUDIENCE_ASPECT_RATIO;
		}
		else
		{
			if(camera.aspect > AUDIENCE_ASPECT_RATIO)
			{
				camera.fov = fovGivenCenterToFrameDistance(AUDIENCE_CENTER_TO_TOP_OF_FRAME_AT_Z_EQUALS_0, camera.position.z )
			}
			else
			{
				var horizontalFov = camera.fov = fovGivenCenterToFrameDistance(AUDIENCE_CENTER_TO_SIDE_OF_FRAME_AT_Z_EQUALS_0, camera.position.z )
				camera.fov = otherFov( horizontalFov, camera.aspect, false )
			}
		}

		camera.updateProjectionMatrix();

		camera.projectionMatrix.elements[9] = -2/3
	}
	respondToResize();

	// console.log(camera.view)
	// camera.setViewOffset(
	// 	camera.view.fullWidth,
	// 	camera.view.fullHieght,
	// 	camera.view.offsetX,
	// 	0.1,
	// 	camera.view.width,
	// 	camera.view.height)
	// camera.updateProjectionMatrix();
	
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
	return AUDIENCE_CENTER_TO_SIDE_OF_FRAME_PIXELS * 2 / (window.innerWidth*window.devicePixelRatio)
}