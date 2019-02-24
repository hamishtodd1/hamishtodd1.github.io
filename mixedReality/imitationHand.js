function initImitationHand()
{
	imitationHand = new THREE.Group()

	imitationHand.grippingTop = false
	imitationHand.grippingTopOld = imitationHand.grippingTop
	imitationHand.oldPosition = new THREE.Vector3()
	imitationHand.oldQuaternion = new THREE.Quaternion()

	imitationHand.add( new THREE.Mesh( new THREE.CylinderGeometry(0.03,0.03,0.2)))
	imitationHand.add( new THREE.Mesh( new THREE.CylinderGeometry(0.03,0.03,0.2)))
	imitationHand.add( new THREE.Mesh( new THREE.CylinderGeometry(0.03,0.03,0.2)))
	imitationHand.children[0].rotation.x += TAU/4
	imitationHand.children[1].rotation.y += TAU/4
	imitationHand.children[2].rotation.z += TAU/4

	let grippingToggled = false
	bindButton( "space", function()
	{
		grippingToggled = true
	}, "toggle gripping" )

	updateImitationHand = function()
	{
		imitationHand.oldPosition.copy(imitationHand.position)
		imitationHand.oldQuaternion.copy(imitationHand.quaternion)

		imitationHand.grippingTopOld = imitationHand.grippingTop
		if( grippingToggled )
		{
			imitationHand.grippingTop = !imitationHand.grippingTop
		}
	}
}