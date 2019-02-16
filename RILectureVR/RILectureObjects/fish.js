function initFishUniverse( presentation, transferredObjectData )
{
	var fishUniverse = new THREE.Object3D();
	var universeWidth = 1;
	var universeHeight = universeWidth/16*9;
	var backdrop = new THREE.Mesh(new THREE.PlaneGeometry(universeWidth,universeHeight), new THREE.MeshBasicMaterial({color:0xFFFFFF, side:THREE.DoubleSide, transparent:true, opacity: 0.7}) );
	fishUniverse.add(backdrop);
	
	var fish = new THREE.Object3D();
	var fishLength = universeWidth / 5;
	fish.add( new THREE.Mesh(
			new THREE.PlaneGeometry(fishLength,fishLength),
			new THREE.MeshBasicMaterial({side:THREE.DoubleSide, transparent:true})) );
	fish.add( new THREE.Mesh(
			new THREE.PlaneGeometry(fishLength,fishLength),
			new THREE.MeshBasicMaterial({side:THREE.DoubleSide, transparent:true})) );
	fish.children[0].position.z = 0.001;
	fish.children[1].position.z =-0.001;
	fish.position.y = 1/4;
	var fishEye = new THREE.Object3D();
	var pupilRadius = fishLength / 40;
	var fishPupil = new THREE.Mesh(new THREE.CylinderGeometry(pupilRadius, pupilRadius, fish.children[0].position.z * 6, 20), new THREE.MeshBasicMaterial({ color:0x000000 }));
	var eyeWhite = new THREE.Mesh(new THREE.CylinderGeometry(pupilRadius*2, pupilRadius*2, fish.children[0].position.z * 4, 20), new THREE.MeshBasicMaterial({ color:0xFFFFFF }));
	var blickCountdown = 0;
	fishEye.add(eyeWhite);
	fishEye.add(fishPupil);
	fishEye.rotation.x = TAU / 4;
	fishEye.position.x = 0.04 * fishLength / (universeWidth / 8);
	fish.add(fishEye);
	fishUniverse.add(fish);
	
	let octagon = new THREE.Mesh(new THREE.CylinderGeometry(fishLength / 2,fishLength / 2, fish.children[0].position.z * 4, 8, 1, false, TAU / 16), new THREE.MeshBasicMaterial({ color:0xFF6A00 }));
	updateFunctions.push(function()
	{
		this.position.z = fishUniverse.position.z + 0.0001;
		this.rotation.x = TAU / 4;
		this.rotation.z = 0;
	})
	
	var OurTextureLoader = new THREE.TextureLoader();
	OurTextureLoader.crossOrigin = true;
	OurTextureLoader.load(
		'http://hamishtodd1.github.io/RILecture/Data/2Dfish.png',
		function ( texture ) {
			fish.children[0].material.map = texture;
			fish.children[1].material.map = texture;
			fish.children[0].material.needsUpdate = true;
			fish.children[1].material.needsUpdate = true;
		}
	);
	
	presentation.createNewHoldable("fishUniverse", fishUniverse);
	fishUniverse.movable = false;
	fishUniverse.rotateable = false; //objects in this situation probably shouldn't be in that array, they just "distract"!
	fishUniverse.reset = function()
	{
		this.position.set(0,0,-0.2); 
	}
	
	fishUniverse.update = function()
	{
		var focusPosition = new THREE.Vector3(0,0,0);
		fish.updateMatrix();
		fishEye.updateMatrix();
		var invFish = new THREE.Matrix4();
		var invEye = new THREE.Matrix4();
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
		var fishRadiusScalar = 0.6;
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
}