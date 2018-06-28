function initCameraAndRendererResizeSystemAndCameraRepresentation(renderer)
{
	var centerToSideOfFrameAtZ0 = 1.0;
	var intendedAspectRatio = 16/9; //because that's YOUR screen. It's also the youtube screen; that on it's own wouldn't necessarily mean you want it, but it's easy/simple to think of them as the same
	var backwardExtension = 0.6;
	var box = new THREE.Mesh( 
		new THREE.BoxGeometry(2*centerToSideOfFrameAtZ0,2*centerToSideOfFrameAtZ0/intendedAspectRatio,backwardExtension),
		new THREE.MeshStandardMaterial({side:THREE.BackSide, vertexColors:THREE.FaceColors})
	);
	box.geometry.applyMatrix(new THREE.Matrix4().makeTranslation(0,0,-backwardExtension/2))
	for(var i = 0; i< box.geometry.faces.length; i++)
	{
		// if(i === 0 || i === 1)
		// {
		// 	box.geometry.faces[i].color.setHex(0x6964D0)
		// }
		// else if(i === 2 || i === 3)
		// {
		// 	box.geometry.faces[i].color.setHex(0xCD6166)
		// }
		// else
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

	{
		function respondToResize() 
		{
			//could try to turn it on its side!
			// if( window.innerWidth < window.innerHeight )
			// {
			// 	camera.projectionMatrix.multiply(new THREE.Matrix4().makeRotationZ(TAU/4))
			// }

			renderer.setSize( window.innerWidth, window.innerHeight );
			console.log(renderer.domElement.width, renderer.domElement.height)
			camera.aspect = renderer.domElement.width / renderer.domElement.height;
			var horizontalFov = fovGivenCenterToFrameDistance(centerToSideOfFrameAtZ0,camera.position.z);
			camera.fov = otherFov(horizontalFov,camera.aspect, false);

			camera.updateProjectionMatrix();
		}

		camera.position.z = 1; //just to start
		respondToResize();
		window.addEventListener( 'resize', respondToResize, false );
	}

	document.addEventListener("mousewheel", function(event)
	{
		/*
			camera zooms in and out
			There is a 1280x720 part of the screen that is what the audience sees
			There are a bunch of things outside that get brought in

			could have everything else in a separate renderer?
		*/
		var delta = event.deltaY/125;

		camera.position.z += delta / 10;
		//not so close that you 
	});
}

function centerToFrameDistanceGivenFov(fov, distance)
{
	return Math.tan( fov / 2 * (TAU/360) ) * distance;
}
function fovGivenCenterToFrameDistance(centerToTopOfFrame, distance)
{
	return 2 * Math.atan(centerToTopOfFrame / distance) * (360/TAU);
}

function otherFov(inputFov,aspectRatio,inputIsVertical)
{
	var centerToFrameInput = centerToFrameDistanceGivenFov(inputFov,1)
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