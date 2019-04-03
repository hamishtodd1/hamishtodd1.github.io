function initImitationHand()
{
	imitationHand = new THREE.Group()

	imitationHand.grippingTop = false
	imitationHand.grippingTopOld = imitationHand.grippingTop
	imitationHand.oldPosition = new THREE.Vector3()
	imitationHand.oldQuaternion = new THREE.Quaternion()

	let radius = 0.01
	imitationHand.add( new THREE.Mesh( new THREE.CylinderGeometry(radius,radius,radius*7)))
	imitationHand.add( new THREE.Mesh( new THREE.CylinderGeometry(radius,radius,radius*7)))
	imitationHand.add( new THREE.Mesh( new THREE.CylinderGeometry(radius,radius,radius*7)))
	imitationHand.children[0].rotation.x += TAU/4
	imitationHand.children[1].rotation.y += TAU/4
	imitationHand.children[2].rotation.z += TAU/4

	let grippingToggled = false
	bindButton( "space", function()
	{
		grippingToggled = true
	}, "toggle gripping" )

	imitationHand.standardVigorousMovement = function()
	{
		imitationHand.position.x = 0.6*Math.sin(frameCount*0.03)
		imitationHand.position.y = 0.3*Math.sin(frameCount*0.02)
		imitationHand.position.z = 0.4

		imitationHand.rotation.z = 0.4*Math.sin(frameCount*0.07)
		imitationHand.rotation.x = 0.6*Math.sin(frameCount*0.1)

		imitationHand.quaternion.setFromEuler(imitationHand.rotation)

		imitationHand.updateMatrixWorld()
	}

	updateImitationHand = function()
	{
		imitationHand.oldPosition.copy(imitationHand.position)
		imitationHand.oldQuaternion.copy(imitationHand.quaternion)

		imitationHand.grippingTopOld = imitationHand.grippingTop
		if( grippingToggled )
		{
			imitationHand.grippingTop = !imitationHand.grippingTop
			grippingToggled = false
		}
	}
}