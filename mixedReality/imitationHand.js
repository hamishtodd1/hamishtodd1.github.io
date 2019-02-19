function initImitationHand()
{
	imitationHand = new THREE.Group()

	imitationHand.grippingTop = false
	imitationHand.grippingTopOld = imitationHand.grippingTop
	imitationHand.oldPosition = new THREE.Vector3()
	imitationHand.oldQuaternion = new THREE.Quaternion()

	// imitationHand.position.x = 1
	// imitationHand.position.y = 0.5
	imitationHand.add( new THREE.Mesh( new THREE.CylinderGeometry(0.04,0.04,0.3)))
	imitationHand.add( new THREE.Mesh( new THREE.CylinderGeometry(0.04,0.04,0.3)))
	imitationHand.add( new THREE.Mesh( new THREE.CylinderGeometry(0.04,0.04,0.3)))
	imitationHand.children[0].rotation.x += TAU/4
	imitationHand.children[1].rotation.y += TAU/4
	imitationHand.children[2].rotation.z += TAU/4

	imitationHand.scale.multiplyScalar(0.1)

	let grippingToggled = false
	bindButton("space",
		function(){grippingToggled = true},
		"toggle gripping")

	updateImitationHand = function()
	{
		imitationHand.oldPosition.copy(imitationHand.position)
		imitationHand.oldQuaternion.copy(imitationHand.quaternion)

		imitationHand.grippingTopOld = imitationHand.grippingTop
		if(grippingToggled)
		{
			imitationHand.grippingTop = !imitationHand.grippingTop
		}

		{
			// camera.position.applyAxisAngle(yUnit, 0.01)
			// camera.rotation.y += 0.01

			let t = frameCount*0.03

			imitationHand.position.set(0, assemblage.position.y,assemblage.position.z+assemblage.scale.z)
			imitationHand.position.y += 0.04*Math.sin(t)

			// imitationHand.position.set( 0*0.2*Math.sin(t), 2*0.1*Math.sin(t),3.8)
			imitationHand.rotation.set(
				0.4*Math.sin(t*1.0),
				0.5*Math.sin(t*1.6),
				0.6*Math.sin(t*1.3)
				)
			imitationHand.quaternion.setFromEuler(imitationHand.rotation)

			imitationHand.grippingTop = true
		}
	}
}