/*
	You get two points to point the pointer
	
	Might want to show their frustum? Their visible set?

	Oh yes and the "snap to my viewpoint" button. Useful but not demo-worthy
*/

function initSpecatorRepresentation()
{
	var headWidth = 0.06;
	var headHeight = headWidth*2/3;
	var headDepth = headWidth/10;

	var head = new THREE.Mesh(new THREE.BoxBufferGeometry(headWidth,headHeight,headDepth), new THREE.MeshBasicMaterial({color:0xFF0000}) );

	var eye = new THREE.Mesh(new THREE.CircleBufferGeometry(headWidth/6,32), new THREE.MeshBasicMaterial({color:0xFFFFFF, side: THREE.DoubleSide}));
	eye.add( new THREE.Mesh(new THREE.CircleBufferGeometry(headWidth/18,32), new THREE.MeshBasicMaterial({color:0x000000, side: THREE.DoubleSide})) );
	eye.children[0].position.z = -0.0001;
	var rightEye = eye.clone();
	var leftEye = eye.clone();
	leftEye.position.set( -headWidth / 4, 0, -headDepth * 0.51);
	rightEye.position.set( headWidth / 4, 0, -headDepth * 0.51);
	head.add(leftEye,rightEye);

	assemblage.add(head);
	head.rotation.y = TAU / 2

	var pointer = new THREE.Mesh( new THREE.CylinderBufferGeometryUncentered(0.002,0.004), new THREE.MeshPhongMaterial({color:0xFF0000}) );
	pointer.add( new THREE.Mesh( new THREE.CylinderBufferGeometryUncentered(0.0005, 3), new THREE.MeshBasicMaterial({transparent:true,opacity:0.2}) ) );
	head.add(pointer)

	objectsToBeUpdated.push(head)
	var pointsOnMouseRay = [new THREE.Vector3(),new THREE.Vector3(1,1,0)];
	head.update = function()
	{
		// pointsOnMouseRay[1].applyAxisAngle(yVector,0.01)
		// pointsOnMouseRay[1].sub(pointsOnMouseRay[0]).setLength(5).add(pointsOnMouseRay[0])
		// redirectCylinder(pointer,pointsOnMouseRay[0],pointsOnMouseRay[1].clone().sub(pointsOnMouseRay[0]))

		// head.position.set(0,0,-0.2);
		// assemblage.worldToLocal(head.position)

		this.scale.setScalar(1.0/getAngstrom())

		if(frameCount % 40 === 0)
		{
			//hopefully? =/
			var cameraPositionInCootSpace = camera.position.clone();
			var msg = {
				command:"vrSpectatorData",
				position:[camera]
			}
			socket.send(JSON.stringify(msg));
		}
	}

	socket.commandReactions.residueInfo = function(msg)
	{
		pointsOnMouseRay[0].set(msg.something)
		pointsOnMouseRay[1].set(msg.something)
		redirectCylinder(pointer,pointsOnMouseRay[0],pointsOnMouseRay[1].clone().sub(pointsOnMouseRay[0]))

		head.position.set(msg.something);
		head.rotation.set(msg.something);
	}
}