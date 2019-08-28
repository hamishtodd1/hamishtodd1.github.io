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
		let t = frameCount * 0.2

		let p = rightHand.position

		p.set(0,0,0) //no don't remove, you're doing a function of t

		p.x = 0.2*Math.sin(t*0.03)
		p.y = 0.1*Math.sin(t*0.02)
		p.z = 0.07*Math.sin(t*0.05)

		// {
		// 	// let oldL = Math.sqrt( sq(p.x) + sq(p.y) );
		// 	p.x = Math.cos(t)
		// 	p.y = Math.sin(t)
		// 	p.multiplyScalar(t*0.015)

		// 	p.y += 0.08
		// 	p.x += 0.01
		// }
		// p.x = 0.2

		p.add(visiblePosition)

		rightHand.rotation.x = 1.6*Math.sin(t*0.1)
		rightHand.rotation.y = 1.5*Math.sin(t*0.13)
		rightHand.rotation.z = 1.4*Math.sin(t*0.07)
		rightHand.quaternion.setFromEuler(rightHand.rotation)

		rightHand.updateMatrixWorld()

		if( grippingToggled )
		{
			rightHand.grippingTop = !rightHand.grippingTop
			grippingToggled = false
		}
	}
}