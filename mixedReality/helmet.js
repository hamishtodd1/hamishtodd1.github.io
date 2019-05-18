/*
	Hands
		The beak is your hand. The head is "pulled" around behind it, eg position += destination-position * 0.1
		This is more from back when it was a puppet show

	could add some hair easily

	definitely want eyebrows
	could have a pair of eyebrows linked to the intonation of your voice

	A pointy beak could be better

	Quizzical: one brow lifted
	Angry: brow furrowed
	Sad: top lids down, eyebrows slanted up
	Suspicious: squint
	Frustrated: closed
	Tired: furrow beneath
	Condescending: bottom lids down
	Excited: bottom lid up

	you really probably just need some nice half-spheres slanted upwards as lids
	
	Dopey: boss-eyed
*/

function initHelmet()
{
	let helmetHolder = new THREE.Object3D()
	scene.add(helmetHolder)
	updateFunctions.push(function()
	{
		helmetHolder.position.copy(camera.position)
		helmetHolder.quaternion.copy(camera.quaternion)
	})
	markPositionAndQuaternion( helmetHolder )

	let helmetRadius = 0.152
	let radialSegments = 64
	var helmet = new THREE.Mesh(new THREE.SphereGeometry(helmetRadius,radialSegments,radialSegments,0,TAU,0,TAU/4),
	new THREE.MeshPhysicalMaterial({
		color:0x66393B,
		roughness:1,
		metalness:0.5, //not sure!
		reflectivity:0, //can add an environment map easily! Where's that spherical camera? But what about virtual objects?
		clearCoat:1,
		clearCoatRoughness:0.2
	}))
	HELMET = helmet
	helmetHolder.add(helmet)
	helmet.position.z = 0.038
	helmet.visible = false

	let cylinderBit = new THREE.Mesh(new THREE.CylinderBufferGeometry(helmetRadius,helmetRadius,1,radialSegments,1,true),helmet.material)
	cylinderBit.geometry.applyMatrix(new THREE.Matrix4().makeTranslation(0,-0.5,0))
	cylinderBit.scale.y = 0.06
	helmet.add(cylinderBit)
	let annulus = new THREE.Mesh(new THREE.RingGeometry(0.6*helmetRadius,helmetRadius,radialSegments/2,1,0,TAU/2,radialSegments), helmet.material)
	let l = annulus.geometry.vertices.length
	for(let i = 0; i < l / 2; i++)
	{
		if(i < l / 8 )
		{
			var lerpAmt = 1 - i / (l / 8)
			lerpAmt = sq(lerpAmt)
			annulus.geometry.vertices[i].lerp(annulus.geometry.vertices[i+l/2], lerpAmt )
		}
		if( i > l / 2 - l / 8 )
		{
			var lerpAmt = (i - ( l / 2 - l / 8 ) +1) / (l/8)
			lerpAmt = sq(lerpAmt)
			annulus.geometry.vertices[i].lerp(annulus.geometry.vertices[i+l/2], lerpAmt)
		}
	}
	annulus.position.y = -helmet.children[0].scale.y
	annulus.rotation.x = TAU / 4
	annulus.rotation.z = TAU / 2
	helmet.add(annulus)

	let beakTop = new THREE.Mesh(new THREE.Geometry(), new THREE.MeshLambertMaterial(helmet.material));
	let beakWidth = helmetRadius / 2;
	let beakLength = beakWidth*0.6;
	beakTop.geometry.vertices.push(
		new THREE.Vector3( beakWidth/2,0,0),
		new THREE.Vector3(-beakWidth/2,0,0),
		new THREE.Vector3(0,beakWidth*1.2,0), //top
		new THREE.Vector3(0,0,beakLength) //tip
		);
	beakTop.geometry.faces.push(
		new THREE.Face3(0,2,3),
		new THREE.Face3(1,3,2),
		new THREE.Face3(0,3,1)
		);
	beakTop.position.z = -helmetRadius * 0.9
	beakTop.rotation.y = TAU/2
	helmet.add(beakTop)
	beakTop.geometry.computeFaceNormals();
	beakTop.position.y = annulus.position.y

	var eyeRadius = 0.023;
	var eyeballs = Array(2);
	for(var i = 0; i < 2; i++)
	{
		eyeballs[i] = new Eyeball(eyeRadius);
		eyeballs[i].position.set(0,0,-helmetRadius)
		eyeballs[i].position.applyAxisAngle(yUnit,0.07*TAU)
		// eyeballs[i].position.applyAxisAngle(zUnit,-0.125*TAU)
		if(i)
		{
			eyeballs[i].position.x *= -1
		}

		helmet.add(eyeballs[i]);

		for( let j = 0; j < 2; j++ )
		{
			let lid = new THREE.Mesh(new THREE.SphereGeometry(eyeRadius*1.05, 32,32),helmet.material)
			for(let i = lid.geometry.vertices.length/2; i < lid.geometry.vertices.length; i++)
			{
				lid.geometry.vertices[i].y = 0
			}
			lid.position.copy(eyeballs[i].position)
			lid.rotation.x = j ? TAU * 0.13 : TAU / 4
			helmet.add(lid)
		}
	}

	let positionWeAreLookingAt = new THREE.Vector3()
	alwaysUpdateFunctions.push(function()
	{
		if(!helmet.visible)
		{
			return
		}

		let betweenEyes = eyeballs[0].position.clone().lerp(eyeballs[1].position,0.5)
		let inHead = betweenEyes.clone()
		inHead.z += eyeRadius
		helmet.localToWorld(betweenEyes)
		helmet.localToWorld(inHead)
		let lookingDirection = betweenEyes.clone().sub(inHead)

		let closestAngle = null
		let positionToLookTowards = new THREE.Vector3()
		for(let i = 0; i < objectsToBeLookedAtByHelmet.length; i++)
		{
			if( !objectsToBeLookedAtByHelmet[i].visible )
			{
				continue;
			}

			//don't be surprised if this screws some shit up because of updateMatrixWorld
			let worldPosition = objectsToBeLookedAtByHelmet[i].getWorldPosition(new THREE.Vector3())
			let headToWorldPosition = worldPosition.clone().sub(inHead)
			let angle = lookingDirection.angleTo(headToWorldPosition)
			if(objectsToBeLookedAtByHelmet[i].eyeAttractionAngle !== undefined)
			{
				angle -= objectsToBeLookedAtByHelmet[i].eyeAttractionAngle
			}

			if( closestAngle === null || angle < closestAngle )
			{
				closestAngle = angle
				objectsToBeLookedAtByHelmet[i].getWorldPosition(positionToLookTowards)
			}
		}

		positionWeAreLookingAt.lerp(positionToLookTowards,0.4)
		eyeballs[0].lookAt(positionWeAreLookingAt)
		eyeballs[1].lookAt(positionWeAreLookingAt)
	})

	return helmet
}