/*
	every part of this goes out the window in VR
	It should be the case that if you turn the whole thing upside down it should feel ok
	so fretting about whether up, down, left, right is positive and negative(except relatively) is silly
*/

function initWindowResizeSystemAndSurroundings(renderer)
{
	//the effect of the below is to make it so that the only change is to the viewport, not to the scene itself
	function respondToResize(event)
	{
		if(event!==undefined) event.preventDefault()

		let pixelRatioChangeRatio = window.devicePixelRatio / renderer.getPixelRatio()
		renderer.setPixelRatio(window.devicePixelRatio);
		pad.scale.multiplyScalar(pixelRatioChangeRatio)

		renderer.setSize( window.innerWidth, window.innerHeight );
		camera.aspect = window.innerWidth / window.innerHeight;

		camera.fov = fovGivenCenterToFrameDistance(camera.topAtZZero, camera.position.z )
		camera.rightAtZZero = camera.topAtZZero * camera.aspect

		camera.updateProjectionMatrix();
	}
	window.addEventListener( 'resize', respondToResize, false );

	{
		var pointLight = new THREE.PointLight(0xFFFFFF, 0.4, 0.);
		pointLight.shadow.mapSize.width = 1024;
		pointLight.shadow.mapSize.height = pointLight.shadow.mapSize.width;
		pointLight.castShadow = true;
		scene.add( pointLight );

		scene.add( new THREE.AmbientLight( 0xFFFFFF, 0.7 ) );
	}

	camera.setTopAtZZeroAndAdjustScene = function(newTopAtZZero)
	{
		camera.topAtZZero = newTopAtZZero;
		camera.position.z = camera.topAtZZero * 20.; //subjective

		pointLight.distance = camera.position.z
		pointLight.shadow.camera.far = pointLight.distance;
		pointLight.shadow.camera.near = pointLight.distance * .005;
		pointLight.shadow.camera.updateProjectionMatrix()

		pointLight.position.set(-camera.topAtZZero, camera.topAtZZero, camera.topAtZZero * .25)
		pointLight.position.multiplyScalar(.5)

		camera.far = camera.position.z + 10.
		respondToResize();
	}

	//want unit vectors to be a reasonable size
	camera.setTopAtZZeroAndAdjustScene(20.)
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
		centerToFrameOutput *= aspectRatio;
	else
		centerToFrameOutput /= aspectRatio;
	var outputFov = fovGivenCenterToFrameDistance(centerToFrameOutput,1);
	return outputFov;
}