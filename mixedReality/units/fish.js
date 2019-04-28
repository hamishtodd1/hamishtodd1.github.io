function initFish( visiBox )
{
	let universeWidth = 1;

	let fish = new THREE.Object3D();
	markPositionAndQuaternion(fish)
	let fishLength = 0.3;
	let fishMaterial = new THREE.MeshBasicMaterial({
		side: THREE.DoubleSide,
		transparent: true,
		clippingPlanes: visiBox.planes
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
		let eyeWhite = new THREE.Mesh(new THREE.CylinderGeometry(pupilRadius*2, pupilRadius*2, fish.children[0].position.z * 4, 20), new THREE.MeshBasicMaterial({ color:0xFFFFFF, clippingPlanes: visiBox.planes }));
		let fishPupil = new THREE.Mesh(new THREE.CylinderGeometry(pupilRadius, pupilRadius, fish.children[0].position.z * 6, 20), new THREE.MeshBasicMaterial({ color:0x000000, clippingPlanes: visiBox.planes }));
		let blickCountdown = 0;
		fishEye.add(eyeWhite);
		fishEye.add(fishPupil);
		fishEye.rotation.x = TAU / 4;
		fishEye.position.x = -0.017
		fish.add(fishEye);

		let closedMouth = new THREE.Mesh(new THREE.CircleBufferGeometry)
	}

	{
		var octagon = new THREE.Mesh(new THREE.CylinderGeometry(fishLength / 2,fishLength / 2, fish.children[0].position.z * 4, 8, 1, false, TAU / 16), new THREE.MeshBasicMaterial({ color:0xFF6A00 }));
		octagon.geometry.applyMatrix(new THREE.Matrix4().makeRotationX(TAU/4))
		// flatland.add(octagon)
	}

	let grabbed2DObject = fish

	let designatedHand = handControllers[0]
	// designatedHand = imitationHand

	let pointInHand = new THREE.Vector3(1,0,0)
	updateFunctions.push(function()
	{
		if(designatedHand.grippingSide)
		{
			grabbed2DObject.position.x += designatedHand.position.x - designatedHand.oldPosition.x
			grabbed2DObject.position.y += designatedHand.position.y - designatedHand.oldPosition.y

			//hand is origin
			let worldishPointInHand = pointInHand.clone().applyQuaternion(designatedHand.quaternion)
			let worldishPointInHandOnPlane = worldishPointInHand.clone().projectOnPlane(zUnit).normalize()

			let oldWorldishPointInHand = pointInHand.clone().applyQuaternion(designatedHand.oldQuaternion)
			let oldWorldishPointInHandOnPlane = oldWorldishPointInHand.clone().projectOnPlane(zUnit).normalize()

			let diff = new THREE.Quaternion().setFromUnitVectors(oldWorldishPointInHandOnPlane,worldishPointInHandOnPlane)
			grabbed2DObject.quaternion.multiply(diff)

			pointInHand.copy(worldishPointInHand).applyQuaternion(designatedHand.quaternion.clone().inverse())
		}

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
	
	if(0)
	{
		let spacing = 0.07
		let grid = new THREE.LineSegments( new THREE.Geometry(), new THREE.MeshBasicMaterial({
			color:0x333333,
			clippingPlanes: visiBox.planes
		}) )
		let numWide = 36
		let numTall = 20
		let verticalExtent = numTall/2*spacing
		let horizontalExtent = numWide/2*spacing
		for(let i = 0; i < numWide+1; i++)
		{
			let x = (i-numWide/2)*spacing
			grid.geometry.vertices.push(new THREE.Vector3(x,-verticalExtent,0),new THREE.Vector3(x,verticalExtent,0))
		}
		for( let i = 0; i < numTall+1; i++)
		{
			let y = (i-numTall/2)*spacing
			grid.geometry.vertices.push(new THREE.Vector3(-horizontalExtent,y,0),new THREE.Vector3(horizontalExtent,y,0))
		}
		scene.add(grid)
	}

	return fish
}