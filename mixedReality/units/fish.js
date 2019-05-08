function initFish( visiBox )
{
	let universeWidth = 1;

	let fish = new THREE.Object3D();
	markPositionAndQuaternion(fish)
	let fishLength = 0.3;
	let fishMaterial = new THREE.MeshBasicMaterial({
		side: THREE.DoubleSide,
		transparent: true,
		// clippingPlanes: visiBox.planes
	})
	fish.add( new THREE.Mesh(
			new THREE.PlaneGeometry(fishLength,fishLength),
			fishMaterial ) );
	fish.add( new THREE.Mesh(
			new THREE.PlaneGeometry(fishLength,fishLength),
			fishMaterial ) );
	fish.children[0].position.z = 0.00006;
	fish.children[1].position.z =-0.00006;

	let loader = new THREE.TextureLoader().setCrossOrigin(true)
	loader.load("data/fish.png",function(texture)
	{
		let openMouthTexture = texture
		fishMaterial.map = openMouthTexture
		fishMaterial.needsUpdate = true

		loader.load("data/fish2.png",function(texture)
		{
			let closedMouthMesh = new THREE.Mesh(new THREE.PlaneGeometry(fishLength,fishLength),fishMaterial.clone() )
			closedMouthMesh.material.map = texture
			closedMouthMesh.material.needsUpdate = true
			fish.add(closedMouthMesh)
			markObjectProperty(closedMouthMesh,"visible")

			updateFunctions.push(function()
			{
				closedMouthMesh.visible = handControllers[RIGHT_CONTROLLER_INDEX].grippingTop
			})
		},function(){},function(e){console.error(e)})
	},function(){},function(e){console.error(e)})

	//don't have an octahedron, just have a pair of circles

	{
		let fishEye = new THREE.Object3D();
		let pupilRadius = fishLength / 80;
		let eyeWhite = new THREE.Mesh(new THREE.CylinderBufferGeometry(pupilRadius*2, pupilRadius*2, fish.children[0].position.z * 4, 20), new THREE.MeshBasicMaterial({ color:0xFFFFFF }));
		let fishPupil = new THREE.Mesh(new THREE.CylinderBufferGeometry(pupilRadius, pupilRadius, fish.children[0].position.z * 6, 20), new THREE.MeshBasicMaterial({ color:0x000000 }));
		let blickCountdown = 0;
		fishEye.add(eyeWhite);
		fishEye.add(fishPupil);
		fishEye.rotation.x = TAU / 4;
		fishEye.position.x = -0.06 * fishLength
		fish.add(fishEye);

		let closedMouth = new THREE.Mesh(new THREE.CircleBufferGeometry)
	}

	updateFunctions.push(function()
	{
		if(0)
		{
			let focusPosition = new THREE.Vector3(0,0,0);
			fish.updateMatrix();
			fishEye.updateMatrix();
			let invFish = new THREE.Matrix4();
			let invEye = new THREE.Matrix4();
			invFish.getInverse(fish.matrix);
			invEye.getInverse(fishEye.matrix);
			
			//could control the eye with the joystick?
			
			fishPupil.position.copy(focusPosition);
			fishPupil.position.applyMatrix4(invFish);
			fishPupil.position.applyMatrix4(invEye);
			fishPupil.position.setLength(pupilRadius);
			fishPupil.position.y = 0;
			
			//untested
	//			if(Math.random() < 0.01)
	//			{
	//				eyeWhite.material.color.set(0,0,0);
	//				blickCountdown = 0.1;
	//			}
	//			blickCountdown -= delta_t;
	//			if( blickCountdown < 0 )
	//				eyeWhite.material.color.set(1,1,1);
		}
	})

	return fish
}