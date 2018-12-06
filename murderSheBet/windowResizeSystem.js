//TODO up top!

function initSurroundings()
{
	var stage = new THREE.Mesh( 
		new THREE.PlaneGeometry(camera.right-camera.left,camera.top-camera.bottom),
		new THREE.MeshBasicMaterial({color:0xFFFFFF})
	)
	stage.position.z = -1
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

function initCameraAndRendererResizeSystem(renderer)
{
	camera.position.z = 1
	function respondToResize()
	{
		renderer.setSize( window.innerWidth, window.innerHeight );
		camera.aspect = renderer.domElement.width / renderer.domElement.height;

		camera.updateProjectionMatrix();
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