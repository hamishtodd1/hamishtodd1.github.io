function initImitationHand()
{
	imitationHand = new THREE.Group()
	imitationHand.grippingTop = false
	imitationHand.grippingTopOld = imitationHand.grippingTop
	// imitationHand.position.x = 1
	// imitationHand.position.y = 0.5
	imitationHand.add( new THREE.Mesh( new THREE.CylinderGeometry(0.04,0.04,0.3)))
	imitationHand.add( new THREE.Mesh( new THREE.CylinderGeometry(0.04,0.04,0.3)))
	imitationHand.add( new THREE.Mesh( new THREE.CylinderGeometry(0.04,0.04,0.3)))
	imitationHand.children[0].rotation.x += TAU/4
	imitationHand.children[1].rotation.y += TAU/4
	imitationHand.children[2].rotation.z += TAU/4
	scene.add( imitationHand )

	bindButton("space",
		function(){imitationHand.grippingTop = !imitationHand.grippingTop},
		"toggle gripping")
}