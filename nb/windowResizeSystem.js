function initStage()
{
	var backwardExtension = 0.6;
	stage = new THREE.Mesh( 
		new THREE.BoxGeometry(2*AUDIENCE_CENTER_TO_SIDE_OF_FRAME_AT_Z_EQUALS_0,2*AUDIENCE_CENTER_TO_TOP_OF_FRAME_AT_Z_EQUALS_0,backwardExtension),
		new THREE.MeshStandardMaterial({side:THREE.BackSide, vertexColors:THREE.FaceColors})
	);
	// stage.material.depthTest = false
	stage.geometry.applyMatrix(new THREE.Matrix4().makeTranslation(0,0,-backwardExtension/2))
	for(var i = 0; i< stage.geometry.faces.length; i++)
	{
		// if(i === 0 || i === 1)
		// {
		// 	stage.geometry.faces[i].color.setHex(0x6964D0)
		// }
		// else if(i === 2 || i === 3)
		// {
		// 	stage.geometry.faces[i].color.setHex(0xCD6166)
		// }
		// else
		{
			stage.geometry.faces[i].color.setHex(0xFFFFFF)
		}
	}
	stage.material.metalness = 0.1;
	stage.material.roughness = 0.2;
	stage.receiveShadow = true;
	camera.add(stage)

	var pointLight = new THREE.PointLight(0xFFFFFF, 0.4, 5.3);
	pointLight.shadow.camera.far = 10;
	pointLight.shadow.camera.near = 0.01;
	pointLight.shadow.mapSize.width = 1024;
	pointLight.shadow.mapSize.height = pointLight.shadow.mapSize.width;
	pointLight.castShadow = true;
	pointLight.position.copy(stage.geometry.vertices[3])
	pointLight.position.negate().multiplyScalar(0.6);
	stage.add( pointLight );
}

function initCameraAndRendererResizeSystem(renderer)
{ 
	scene.add( new THREE.AmbientLight( 0xFFFFFF, 0.7 ) );
	renderer.shadowMap.enabled = true;
	renderer.shadowMap.type = THREE.BasicShadowMap;

	{
		function respondToResize() 
		{
			renderer.setPixelRatio( window.devicePixelRatio );
			
			//could try to turn it on its side!
			// if( window.innerWidth < window.innerHeight )
			// {
			// 	camera.projectionMatrix.multiply(new THREE.Matrix4().makeRotationZ(TAU/4))
			// }

			renderer.setSize( window.innerWidth, window.innerHeight );
			console.log( "Renderer dimensions: ", renderer.domElement.width, renderer.domElement.height )
			camera.aspect = renderer.domElement.width / renderer.domElement.height;
			var horizontalFov = fovGivenCenterToFrameDistance(AUDIENCE_CENTER_TO_SIDE_OF_FRAME_AT_Z_EQUALS_0,camera.position.z);
			camera.fov = otherFov(horizontalFov,camera.aspect, false);

			camera.updateProjectionMatrix();
		}

		camera.position.z = 1.8; //feel free to change
		stage.position.z = -camera.position.z
		respondToResize();
		window.addEventListener( 'resize', respondToResize, false );
	}
}

function centerToFrameDistance(fov, distance)
{
	return Math.tan( fov / 2 * (TAU/360) ) * distance;
}
function fovGivenCenterToFrameDistance(centerToTopOfFrame, distance)
{
	return 2 * Math.atan(centerToTopOfFrame / distance) * (360/TAU);
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