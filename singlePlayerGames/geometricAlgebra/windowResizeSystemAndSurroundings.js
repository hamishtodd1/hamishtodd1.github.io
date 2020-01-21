function initWindowResizeSystemAndSurroundings(renderer)
{
	camera.topAtZZero = 4.5; //want unit vectors to be a reasonable size
	camera.position.z = 16.; //subjective. Stage depth should probably be same as width

	{
		let depth = camera.topAtZZero*2;
		var stage = new THREE.Mesh( 
			new THREE.BoxGeometry(1.,camera.topAtZZero*2,depth),
			new THREE.MeshStandardMaterial({color:0xFFFFFF,side:THREE.BackSide})
		);
		stage.geometry.applyMatrix(new THREE.Matrix4().makeTranslation(0.,0.,-.5 * depth))

		camera.near = .1
		camera.far = camera.position.z + depth + .01
		camera.updateProjectionMatrix()
		stage.material.metalness = 0.1;
		stage.material.roughness = 0.2;
		stage.receiveShadow = true;
		scene.add(stage)
	}

	function respondToResize() 
	{
		renderer.setSize( window.innerWidth, window.innerHeight );
		camera.aspect = window.innerWidth / window.innerHeight;

		camera.fov = fovGivenCenterToFrameDistance(camera.topAtZZero, camera.position.z )
		camera.rightAtZZero = camera.topAtZZero * camera.aspect

		stage.scale.x = camera.rightAtZZero*2.

		if(camera.topAtZZero < camera.rightAtZZero)
			console.error("might consider switching side and bottom")

		//and rearrange all the icons

		camera.updateProjectionMatrix();
	}
	respondToResize();
	//user can rotate the screen, go fullscreen, un-fullscreen, have the address bar disappear
	window.addEventListener( 'resize', respondToResize, false );

	{
		var pointLight = new THREE.PointLight(0xFFFFFF, 0.4, 20.);

		pointLight.shadow.camera.far = 20.;
		pointLight.shadow.camera.near = 0.01;
		pointLight.shadow.mapSize.width = 1024;
		pointLight.shadow.mapSize.height = pointLight.shadow.mapSize.width;

		pointLight.castShadow = true;
		pointLight.position.set(-camera.topAtZZero,camera.topAtZZero,camera.topAtZZero*.25)
		pointLight.position.multiplyScalar(.5)
		scene.add( pointLight );

		scene.add( new THREE.AmbientLight( 0xFFFFFF, 0.7 ) );
	}

	return stage;
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