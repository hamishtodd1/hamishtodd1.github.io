//TODO up top!

function initSurroundings()
{
	var backwardExtension = 0.6;
	var stage = new THREE.Mesh( 
		new THREE.PlaneGeometry(
			2*AUDIENCE_CENTER_TO_SIDE_OF_FRAME_AT_Z_EQUALS_0,
			2*AUDIENCE_CENTER_TO_TOP_OF_FRAME_AT_Z_EQUALS_0,
			backwardExtension),
		new THREE.MeshStandardMaterial({side:THREE.BackSide, color:0xFFFFFF})
	);
	stage.geometry.applyMatrix(new THREE.Matrix4().makeTranslation(0,0,-backwardExtension/2))
	camera.far = camera.defaultZ + backwardExtension + 0.01
	for(var i = 0; i< stage.geometry.faces.length; i++)
	{
		if(i === 0 || i === 1)
		{
			stage.geometry.faces[i].color.setHex(0x6964D0)
		}
		else if(i === 2 || i === 3)
		{
			stage.geometry.faces[i].color.setHex(0xCD6166)
		}
		else
		{
			stage.geometry.faces[i].color.setHex(0xFFFFFF)
		}
	}
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

// function smoothTween(start, end, t)
// {
// 	if(t < 0.5)
// 	{
// 		var areaUnderVelocityGraph = sq(t) / 2
// 	}
// 	else
// 	{
// 		var displacementFromHalf = t - 0.5;
// 		var extraArea = displacementFromHalf / 2 - sq(displacementFromHalf) / 2
// 		var areaUnderVelocityGraph = 1 / 8 + extraArea;
// 	}
// 	var scaledToMakeUnitIntegral1 = areaUnderVelocityGraph * 4;

// 	return start + scaledToMakeUnitIntegral1 * (end-start);
// }
// function linearTween(start, end, t)
// {
// 	return start + t * (end-start);
// }

function initCameraAndRendererResizeSystem(renderer)
{
	camera.position.z = 2.5
	camera.fov = 70;

	function respondToResize() 
	{
		renderer.setSize( window.innerWidth, window.innerHeight );
		camera.aspect = window.innerWidth / window.innerHeight;
		camera.updateProjectionMatrix();
	}
	respondToResize();
	log(camera.fov)
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