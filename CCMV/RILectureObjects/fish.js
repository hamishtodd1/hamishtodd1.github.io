/*
 * No need to grab the fish, just keep the hand that moves it offscreen
 */

function initFishUniverse()
{
	var fishUniverse = new THREE.Object3D();
	var universeWidth = 1;
	var backdrop = new THREE.Mesh(new THREE.PlaneGeometry(universeWidth,universeWidth/16*9), new THREE.MeshBasicMaterial({color:0xFFFFFF, side:THREE.DoubleSide}) );
	fishUniverse.add(backdrop);
	
	var fish = new THREE.Object3D();
	var fishLength = universeWidth / 5;
	fish.add( new THREE.Mesh(
			new THREE.PlaneGeometry(fishLength,fishLength),
			new THREE.MeshBasicMaterial({side:THREE.DoubleSide, transparent: true})) );
	fish.add( new THREE.Mesh(
			new THREE.PlaneGeometry(fishLength,fishLength),
			new THREE.MeshBasicMaterial({side:THREE.DoubleSide, transparent: true})) );
	fish.children[0].position.z = 0.001;
	fish.children[1].position.z =-0.001;
	fish.position.y = 1/4;
	var fishEye = new THREE.Object3D();
	var pupilRadius = fishLength / 40;
	var fishPupil = new THREE.Mesh(new THREE.CylinderGeometry(pupilRadius, pupilRadius, fish.children[0].position.z * 6, 20), new THREE.MeshBasicMaterial({ color:0x000000 }));
	fishEye.add(new THREE.Mesh(new THREE.CylinderGeometry(pupilRadius*2, pupilRadius*2, fish.children[0].position.z * 4, 20), new THREE.MeshBasicMaterial({ color:0xFFFFFF })));
	fishEye.add(fishPupil);
	fishEye.rotation.x = TAU / 4;
	fishEye.position.x = 0.04 * fishLength / (universeWidth / 8);
	fish.add(fishEye);
	fishUniverse.add(fish);
	
	for(var i = 0; i < 3; i++)
	{
		var Octagon = new THREE.Mesh(new THREE.CylinderGeometry(fishLength / 2,fishLength / 2, fish.children[0].position.z * 4, 8, 1, false, TAU / 16), new THREE.MeshBasicMaterial({ color:0xFF6A00 }));
		Octagon.rotation.x = TAU / 4;
		Octagon.position.x = i * fishLength;
		//outline for them
		fishUniverse.add(Octagon);
	}
	
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
	Protein.add(fishUniverse);
	
	fishUniverse.update = function()
	{
		/*
		 * TODO: moves and rotates with your left hand - or maybe just when you're holding some button down?
		 * but it's limited to being inside the universe
		 */
		var focusPosition = new THREE.Vector3(0,0,0);
		fish.updateMatrix();
		fishEye.updateMatrix();
		var invFish = new THREE.Matrix4();
		var invEye = new THREE.Matrix4();
		invFish.getInverse(fish.matrix);
		invEye.getInverse(fishEye.matrix);
		
		fishPupil.position.copy(focusPosition);
		fishPupil.position.applyMatrix4(invFish);
		fishPupil.position.applyMatrix4(invEye);
		fishPupil.position.setLength(pupilRadius);
		fishPupil.position.y = 0;
	}
}