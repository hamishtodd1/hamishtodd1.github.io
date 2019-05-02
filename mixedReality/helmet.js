//eyes in your head either look at camera or object

function initHelmet()
{
	let helmetRadius = 0.15
	var helmet = new THREE.Mesh(new THREE.SphereGeometry(helmetRadius,32,32,0,TAU,0,TAU*0.31), new THREE.MeshPhongMaterial({color:0xFF0000,opacity:0.96,transparent:true}))
	scene.add(helmet)

	function Eyeball(radius)
	{
		// var eyeWhite = new THREE.Mesh(eyeWhiteGeometry, new THREE.MeshPhongMaterial({color:0xFFFFFF}) );
		// var pupil = new THREE.Mesh(pupilGeometry, new THREE.MeshPhongMaterial({color:0x000000}) );
		// eyeWhite.scale.setScalar(radius)
		// pupil.scale.setScalar(radius)
		let eyeball = new THREE.Group()
		return eyeball;
	}

	var eyeRadius = 0.023;
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

	updateFunctions.push(function()
	{
		helmetHolder.position.copy(camera.position)
		helmetHolder.quaternion.copy(camera.quaternion)
	})
	markPositionAndQuaternion(helmetHolder)
	scene.add(helmetHolder)

	return helmet
}