function initFish()
{
	let fishUniverse = new THREE.Object3D();
	let universeWidth = 1;
	let universeHeight = universeWidth/16*9;

	let fish = new THREE.Object3D();
	let fishLength = 1;
	let fishMaterial = new THREE.MeshBasicMaterial({side:THREE.DoubleSide, transparent:true})
	fish.add( new THREE.Mesh(
			new THREE.PlaneGeometry(fishLength,fishLength),
			fishMaterial ) );
	fish.add( new THREE.Mesh(
			new THREE.PlaneGeometry(fishLength,fishLength),
			fishMaterial ) );
	fish.children[0].position.z = 0.001;
	fish.children[1].position.z =-0.001;

	{
		let fishEye = new THREE.Object3D();
		let pupilRadius = fishLength / 40;
		let fishPupil = new THREE.Mesh(new THREE.CylinderGeometry(pupilRadius, pupilRadius, fish.children[0].position.z * 6, 20), new THREE.MeshBasicMaterial({ color:0x000000 }));
		let eyeWhite = new THREE.Mesh(new THREE.CylinderGeometry(pupilRadius*2, pupilRadius*2, fish.children[0].position.z * 4, 20), new THREE.MeshBasicMaterial({ color:0xFFFFFF }));
		let blickCountdown = 0;
		fishEye.add(eyeWhite);
		fishEye.add(fishPupil);
		fishEye.rotation.x = TAU / 4;
		fishEye.position.x = 0.04 * fishLength / (universeWidth / 8);
		fish.add(fishEye);
	}

	scene.add(fishUniverse)
	fishUniverse.add(fish);
	// let backdrop = new THREE.Mesh(new THREE.PlaneGeometry(universeWidth,universeHeight), new THREE.MeshBasicMaterial({color:0xFFFFFF, side:THREE.DoubleSide, transparent:true, opacity: 0.7}) );
	// fishUniverse.add(backdrop);
	let spacing = 0.1
	for(let i = 1; i < 10; i++)
	{
		let a = new THREE.LineSegments( new THREE.Geometry() )
		a.geometry.vertices.push(new THREE.Vector3(),new THREE.Vector3(0,universeHeight,0))
		fishUniverse.add(a)
	}
	for(let i = 1; i < 10; i++)
	{

	}

	//give the fish universe a square grid

	fishUniverse.update = function()
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
		
		fish.position.copy(Controller.position);
		fish.position.z = 0;
		let fishRadiusScalar = 0.6;
		if( fish.position.x < -universeWidth/2 * fishRadiusScalar)
			fish.position.x = -universeWidth / 2 * fishRadiusScalar;
		if( fish.position.x > universeWidth/2 * fishRadiusScalar)
			fish.position.x = universeWidth / 2 * fishRadiusScalar;
		if( fish.position.y < -universeHeight/2 * fishRadiusScalar)
			fish.position.y = -universeHeight / 2 * fishRadiusScalar;
		if( fish.position.y > universeHeight/2 * fishRadiusScalar)
			fish.position.y = universeHeight / 2 * fishRadiusScalar;
		
		//untested
//			if(Math.random() < 0.01)
//			{
//				eyeWhite.material.color.set(0,0,0);
//				blickCountdown = 0.1;
//			}
//			blickCountdown -= delta_t;
//			if( blickCountdown < 0 )
//				eyeWhite.material.color.set(1,1,1);
		
		fish.rotation.z = imitationHand.rotation.z;
	}

	// new THREE.TextureLoader().load(
	// 	'data/2Dfish.png',
	// 	function ( texture )
	// 	{
	// 		console.log("yo")
			// fishMaterial.map = texture;
			// fishMaterial.needsUpdate = true;
	// 	}
	// );

	return
	let octagon = new THREE.Mesh(new THREE.CylinderGeometry(fishLength / 2,fishLength / 2, fish.children[0].position.z * 4, 8, 1, false, TAU / 16), new THREE.MeshBasicMaterial({ color:0xFF6A00 }));
	updateFunctions.push(function()
	{
		octagon.position.z = fishUniverse.position.z + 0.0001;
		octagon.rotation.x = TAU / 4;
		octagon.rotation.z = 0;
	})
}