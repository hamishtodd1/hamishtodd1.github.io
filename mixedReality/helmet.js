/*
	definitely want eyebrows
	could have a pair of eyebrows linked to the intonation of your voice

	Quizzical: one brow lifted
	Angry: brow furrowed
	Dopey: boss-eyed
	Sad: bottom lids up, eyebrows slanted up
	suspicious: squint
	Frustrated: closed
	Tired: furrow beneath
	Condescending: bottom lids down
	Excited: bottom lid up
*/

function initHelmet()
{
	let helmetRadius = 0.152
	let radialSegments = 64
	var helmet = new THREE.Mesh(new THREE.SphereGeometry(helmetRadius,radialSegments,radialSegments,0,TAU,0,TAU/4), new THREE.MeshPhongMaterial({
		color:0x66393B,
		transparent:true,
		opacity:1.0,
	}))
	helmet.position.z = 0.038
	let cylinderBit = new THREE.Mesh(new THREE.CylinderBufferGeometry(helmetRadius,helmetRadius,1,radialSegments,1,true),helmet.material)
	cylinderBit.geometry.applyMatrix(new THREE.Matrix4().makeTranslation(0,-0.5,0))
	cylinderBit.scale.y = 0.06
	helmet.add(cylinderBit)
	let annulus = new THREE.Mesh(new THREE.RingGeometry(0.6*helmetRadius,helmetRadius,radialSegments/2,1,0,TAU/2,radialSegments), helmet.material)
	let l = annulus.geometry.vertices.length
	for(let i = 0; i < l / 2; i++)
	{
		//you really probably just need some nice half-spheres slanted upwards as lids
		if(i < l / 8 )
		{
			var lerpAmt = 1 - i / (l / 8)
			annulus.geometry.vertices[i].lerp(annulus.geometry.vertices[i+l/2], lerpAmt )
		}
		if( i > l / 2 - l / 8 )
		{
			var lerpAmt = (i - ( l / 2 - l / 8 ) +1) / (l/8)
			annulus.geometry.vertices[i].lerp(annulus.geometry.vertices[i+l/2], lerpAmt)
		}
		log(i, lerpAmt)
	}
	annulus.position.y = -helmet.children[0].scale.y
	annulus.rotation.x = TAU / 4
	annulus.rotation.z = TAU / 2
	helmet.add(annulus)
	HELMET = helmet
	helmet.visible = false

	var eyeRadius = 0.023;
	var eyeballs = Array(2);
	for(var i = 0; i < 2; i++)
	{
		eyeballs[i] = new Eyeball(eyeRadius);
		// let lid = new THREE.Mesh(new THREE.SphereGeometry())
		eyeballs[i].position.set(0,0,-helmetRadius)
		eyeballs[i].position.applyAxisAngle(yUnit,0.125*TAU)
		eyeballs[i].position.applyAxisAngle(zUnit,-0.125*TAU)
		if(i)
		{
			eyeballs[i].position.x *= -1
		}

		helmet.add(eyeballs[i]);
	}

	let helmetHolder = new THREE.Object3D()
	helmetHolder.add(helmet)
	scene.add(helmetHolder)
	updateFunctions.push(function()
	{

		helmetHolder.position.copy(camera.position)
		helmetHolder.quaternion.copy(camera.quaternion)
	})
	markPositionAndQuaternion(helmetHolder)

	alwaysUpdateFunctions.push(function()
	{
		if(!helmet.visible)
		{
			return
		}

		let betweenEyes = eyeballs[0].position.clone().lerp(eyeballs[1].position,0.5)
		let inHead = betweenEyes.clone().setComponent(2,0)
		helmet.localToWorld(betweenEyes)
		helmet.localToWorld(inHead)
		let sightRay = new THREE.Ray(inHead,betweenEyes.clone().sub(inHead))

		let closestWorldPosition = null
		for(let i = 0; i < objectsToBeLookedAtByHelmet.length; i++)
		{
			//don't be surprised if this screws some shit up because of updateMatrixWorld
			let worldPosition = objectsToBeLookedAtByHelmet[i].getWorldPosition(new THREE.Vector3())

			let dist = sightRay.distanceSqToPoint( worldPosition )
			if( closestWorldPosition === null || dist < sightRay.distanceSqToPoint( closestWorldPosition ) )
			{
				closestWorldPosition = worldPosition
			}
		}

		eyeballs[0].lookAt(closestWorldPosition)
		eyeballs[1].lookAt(closestWorldPosition)
	})

	return helmet
}