function initCameraAndRendererResizeSystem(renderer)
{
	var cameraDestinations = [1.27,0.3]
	var cameraDestinationIndex;
	var zoomT;

	bindButton( "space", function()
	{
		cameraDestinationIndex = 1 - cameraDestinationIndex
		zoomT = 0;
	}, "Zooms in and out" )
	objectsToBeUpdated.push(camera)

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
	camera.update = function()
	{
		zoomT += 0.019;
		zoomT = clamp(zoomT,0,1)
		this.position.z = smoothTween(cameraDestinations[1-cameraDestinationIndex],cameraDestinations[cameraDestinationIndex],zoomT)
	}

	var audienceScreenIndicator = new THREE.Mesh(new THREE.RingBufferGeometry(Math.sqrt(2), Math.sqrt(2) + 0.01, 4, 1, TAU / 8), new THREE.MeshBasicMaterial({color:0xFF0000}));
	camera.add(audienceScreenIndicator)
	audienceScreenIndicator.position.z = -camera.near-0.0001

	function respondToResize() 
	{
		console.log( "Renderer dimensions: ", window.innerWidth, window.innerHeight )
		renderer.setSize( window.innerWidth, window.innerHeight );
		camera.aspect = window.innerWidth / window.innerHeight;

		cameraDestinationIndex = 0;
		camera.position.z = cameraDestinations[cameraDestinationIndex]
		zoomT = 1;

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