function initScaleStick()
{
	var clippingPlane = new THREE.Plane();
	var scaleStick = new THREE.Mesh(
		DottedLineGeometry(99,0.002),
		new THREE.MeshLambertMaterial(
		{
			color:0xFF0000,
			clippingPlanes: [clippingPlane]
		}));

	scene.add(scaleStick);
	scaleStick.update = function()
	{
		this.visible = (handControllers[0].grippingSide && handControllers[1].grippingSide);

		var direction = handControllers[1].position.clone().sub(handControllers[0].position).normalize();
		
		var newY = direction.clone().multiplyScalar(getAngstrom());
		redirectCylinder(this, handControllers[0].position, newY)

		clippingPlane.normal.copy( direction ).negate();
		clippingPlane.constant = handControllers[1].position.dot( direction );
	}
	objectsToBeUpdated.push( scaleStick );
}