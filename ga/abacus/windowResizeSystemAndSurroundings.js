/*
	every part of this goes out the window in VR
	It should be the case that if you turn the whole thing upside down it should feel ok
	so fretting about whether up, down, left, right is positive and negative(except relatively) is silly
*/

function initWindowResizeSystemAndSurroundings(renderer)
{
	{
		var stage = new THREE.Mesh( 
			new THREE.BoxGeometry(1.,1.,1.),
			new THREE.MeshStandardMaterial({color:0xFFFFFF,side:THREE.BackSide})
		);
		stage.geometry.applyMatrix(new THREE.Matrix4().makeTranslation(0.,0.,-.5))
		scene.add(stage)
		stage.material.metalness = 0.1;
		stage.material.roughness = 0.2;
		stage.receiveShadow = true;
	}

	function respondToResize() 
	{
		renderer.setSize( window.innerWidth, window.innerHeight );
		camera.aspect = window.innerWidth / window.innerHeight;
		// if(camera.aspect < 9./21. || camera.aspect > 21./9.)
		// 	log("yep, that's the most extreme (Xperia 1)")
		// if(camera.aspect > 1.)
		// 	console.error("Wider than tall: might consider switching side and bottom for this")

		camera.fov = fovGivenCenterToFrameDistance(camera.topAtZZero, camera.position.z )
		camera.rightAtZZero = camera.topAtZZero * camera.aspect

		stage.scale.x = camera.rightAtZZero*2.

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
		camera.position.z = camera.topAtZZero * 3.5; //subjective

		pointLight.distance = camera.position.z
		pointLight.shadow.camera.far = pointLight.distance;
		pointLight.shadow.camera.near = pointLight.distance * .005;
		pointLight.shadow.camera.updateProjectionMatrix()

		pointLight.position.set(-camera.topAtZZero, camera.topAtZZero, camera.topAtZZero * .25)
		pointLight.position.multiplyScalar(.5)

		stage.scale.z = camera.topAtZZero * 2.
		stage.scale.y = stage.scale.z

		camera.far = camera.position.z + stage.scale.z + .01
		respondToResize();
	}

	//want unit vectors to be a reasonable size
	camera.setTopAtZZeroAndAdjustScene(7.)

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
		centerToFrameOutput *= aspectRatio;
	else
		centerToFrameOutput /= aspectRatio;
	var outputFov = fovGivenCenterToFrameDistance(centerToFrameOutput,1);
	return outputFov;
}