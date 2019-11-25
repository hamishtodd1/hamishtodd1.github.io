/*
	remember mobile is probably upright
*/

//TODO up top!
function initSurroundings()
{
	var backwardExtension = 1.6;
	var stage = new THREE.Mesh( 
		new THREE.BoxGeometry(1.,1.,backwardExtension),
		new THREE.MeshStandardMaterial({color:0xFFFFFF,side:THREE.BackSide})
	);
	stage.scale.y = 2.* centerToFrameDistance(camera.fov, camera.position.z);
	stage.scale.x = stage.scale.y * camera.aspect;
	stage.geometry.applyMatrix(new THREE.Matrix4().setPosition(new THREE.Vector3(0.,0.,backwardExtension/2)))
	stage.geometry.applyMatrix(new THREE.Matrix4().makeTranslation(0.,0.,-backwardExtension))

	camera.far = camera.defaultZ + backwardExtension + 0.01
	stage.material.metalness = 0.1;
	stage.material.roughness = 0.2;
	stage.receiveShadow = true;
	scene.add(stage)

	{
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
	}

	return stage;
}

function initCameraAndRendererResizeSystem(renderer)
{
	function respondToResize() 
	{
		// console.log( "Renderer dimensions: ", window.innerWidth, window.innerHeight )
		renderer.setSize( window.innerWidth, window.innerHeight );
		camera.aspect = window.innerWidth / window.innerHeight;

		// camera.left = -window.innerWidth / window.innerHeight;
		// camera.right = window.innerWidth / window.innerHeight;

		camera.position.z = 2.5;

		camera.fov = fovGivenCenterToFrameDistance(1., camera.position.z )

		camera.updateProjectionMatrix();
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