function initCameraAndRendererResizeSystemAndCameraRepresentation(renderer)
{
	{
		var backwardExtension = 0.4;
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
		renderer.shadowMap.enabled = true;
		renderer.shadowMap.type = THREE.BasicShadowMap;
	}

	
	{
		function respondToResize() 
		{
			console.log( "Renderer dimensions: ", window.innerWidth, window.innerHeight )
			renderer.setSize( window.innerWidth, window.innerHeight );
			camera.aspect = window.innerWidth / window.innerHeight;

			var audienceCenterToFramePixels = 640;
			var audienceHorizontalProportion = audienceCenterToFramePixels / (window.innerWidth*0.5*window.devicePixelRatio)
			var centerToFrameDistance = AUDIENCE_CENTER_TO_SIDE_OF_FRAME_AT_Z_EQUALS_0 / audienceHorizontalProportion

			var horizontalFov = fovGivenCenterToFrameDistance( centerToFrameDistance, camera.position.z );
			camera.fov = otherFov( horizontalFov, camera.aspect, false );
			camera.updateProjectionMatrix();
		}

		camera.position.z = 1;
		respondToResize();
		window.addEventListener( 'resize', respondToResize, false );
	}

	var cameraDestination = 1;
	camera.position.z = cameraDestination;
	bindButton( "space", function()
	{
		if( cameraDestination === 1 )
		{
			cameraDestination = 0.3
		}
		else
		{
			cameraDestination = 1
		}
	}, "Zooms in and out" )
	objectsToBeUpdated.push(camera)
	camera.update = function()
	{
		this.position.z += (cameraDestination-this.position.z) * 0.1
	}
}

function centerToFrameDistance(fov, distance)
{
	return Math.tan( fov / 2 * (TAU/360) ) * distance;
}
function fovGivenCenterToFrameDistance(centerToFrame, distance)
{
	return 2 * Math.atan(centerToFrame / distance) * (360/TAU);
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