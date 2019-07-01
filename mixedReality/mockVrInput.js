function initMockVrInput()
{
	let grippingToggled = false
	bindButton( "space", function()
	{
		grippingToggled = true
	}, "toggle gripping" )

	let visiblePosition = new THREE.Vector3(0,1.6,-0.5)
	rightHand.position.copy(visiblePosition)

	return function()
	{
		let t = frameCount * 0.1

		rightHand.position.set(0,0,0)
		// rightHand.position.x = 0.2*Math.sin(t*0.03)
		// rightHand.position.y = 0.1*Math.sin(t*0.02)
		// rightHand.position.z = 0.07*Math.sin(t*0.05)

		rightHand.position.add(visiblePosition)

		rightHand.rotation.x = 1.6*Math.sin(t*0.1)
		rightHand.rotation.y = 1.5*Math.sin(t*0.13)
		// rightHand.rotation.z = 0.4*Math.sin(t*0.07)
		rightHand.quaternion.setFromEuler(rightHand.rotation)

		rightHand.updateMatrixWorld()

		if( grippingToggled )
		{
			rightHand.grippingTop = !rightHand.grippingTop
			grippingToggled = false
		}
	}
}