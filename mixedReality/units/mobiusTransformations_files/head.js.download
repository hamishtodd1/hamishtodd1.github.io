//eyes in your head either look at camera or object

function initHead()
{
	let helmetRadius = 0.15
	var helmet = new THREE.Mesh(new THREE.SphereGeometry(helmetRadius,32,32,0,TAU,0,TAU*0.31), new THREE.MeshPhongMaterial({color:0xFF0000,opacity:0.96,transparent:true}))
	scene.add(helmet)

	var eyeRadius = 0.023;
	function Eyeball(radius)
	{
		var pupilAngle = TAU / 17;
		var eyeball = new THREE.Mesh(new THREE.SphereBufferGeometry(radius, 32, 32, 0, TAU, pupilAngle, TAU/2-pupilAngle), new THREE.MeshPhongMaterial({color:0xFFFFFF}) );
		var pupil = new THREE.Mesh(new THREE.SphereBufferGeometry(radius, 32, 32, 0, TAU, 0, pupilAngle), new THREE.MeshPhongMaterial({color:0x000000}) );
		eyeball.add(pupil);
		return eyeball;
	}
	var eyeballs = Array(2);
	for(var i = 0; i < 2; i++)
	{
		eyeballs[i] = new Eyeball(eyeRadius);
		eyeballs[i].position.set(1,1,-1)
		if(i)
		{
			eyeballs[i].position.x *= -1
		}
		eyeballs[i].position.setLength(helmetRadius)
		eyeballs[i].rotation.x -= TAU/4

		helmet.add(eyeballs[i]);
	}

	let helmetHolder = new THREE.Object3D()
	helmetHolder.add(helmet)
	helmet.position.z += 0.13
	scene.add(helmetHolder)
	markPositionAndQuaternion(helmetHolder)
}