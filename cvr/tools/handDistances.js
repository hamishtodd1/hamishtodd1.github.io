function initHandDistance()
{
	var handDistancer = new THREE.Object3D();
	
	var radius = 0.05;
	var ball = new THREE.Mesh(new THREE.EfficientSphereBufferGeometry(radius), new THREE.MeshLambertMaterial({transparent:true,color:0xFF69B4, opacity: 0.4}));
	handDistancer.add( ball );
	ball.geometry.computeBoundingSphere();
	handDistancer.boundingSphere = ball.geometry.boundingSphere;

	var label = makeTextSign( "hand Distances" );
	label.position.z = radius;
	label.scale.setScalar(radius/3)
	handDistancer.add(label);

	var connectionMeshes = [];
	
	// handDistancer.onGrab = function(controller)
	// {
	// 	this.scale.setScalar(1);

	// 	//TODO have one seed many?
	// 	// var newEnvironmentDistancer = new THREE.Mesh(handDistancer.geometry, handDistancer.material);
	// 	// newEnvironmentDistancer.label = new THREE.Mesh(label.geometry,label.material);
	// 	// scene.add(newEnvironmentDistancer);
	// 	// newEnvironmentDistancer.position.copy(handDistancer.position);
	// 	// newEnvironmentDistancer.quaternion.copy(handDistancer.quaternion);
	// 	// establishAttachment(newEnvironmentDistancer, controller);

	// 	// newEnvironmentDistancer.update = updateEnvironmentDistancer;

	// 	// holdables.push(newEnvironmentDistancer)
	// 	// objectsToBeUpdated.push(newEnvironmentDistancer);
	// 	// newEnvironmentDistancer.ordinaryParent = newEnvironmentDistancer.parent;
	// }

	var mostRecentlyRequestedResNo = null;

	function updateEnvironmentDistancer()
	{
		var localRadiusSq = sq( radius / getAngstrom() );

		label.visible = this.parent === scene || this.parent === assemblage;

		//label showing length
		//might be nice to also show/otherwise make aware of some typical lengths?
		if(this.parent !== scene && this.parent !== this.ordinaryParent)
		{
			var closestAtom = null;
			var closestAtomDistSq = Infinity;
			for(var i = 0; i < models.length; i++)
			{
				var ourPosition = new THREE.Vector3();
				this.getWorldPosition(ourPosition);
				models[i].updateMatrixWorld();
				models[i].worldToLocal(ourPosition);
				
				for(var j = 0, jl = models[i].atoms.length; j < jl; j++)
				{
					var distanceSq = ourPosition.distanceToSquared(models[i].atoms[j].position);
					if(	distanceSq < localRadiusSq && distanceSq < closestAtomDistSq)
					{
						closestAtom = models[i].atoms[j];
						closestAtomDistSq = ourPosition.distanceToSquared(models[i].atoms[j].position);
					}
				}
			}


			var closestAtomResNo = null;
			if(closestAtom !== null)
			{
				closestAtomResNo = closestAtom.resNo;

				if(mostRecentlyRequestedResNo !== closestAtomResNo )
				{
					var msg = { command: "getEnvironmentDistances" };
					closestAtom.assignAtomSpecToObject( msg );
					socket.send( JSON.stringify( msg ) );
				}
			}

			if( mostRecentlyRequestedResNo !== closestAtomResNo )
			{
				for(var i = connectionMeshes.length-1; i >= 0; i--)
				{
					assemblage.remove( connectionMeshes[i] );
					// connectionMeshes[i].geometry.dispose();
					// connectionMeshes[i].dispose();
					removeSingleElementFromArray(connectionMeshes, connectionMeshes[i])
				}
				mostRecentlyRequestedResNo = closestAtomResNo;
				connectionMeshes.length = 0;
			}
		}
	}
	handDistancer.update = updateEnvironmentDistancer;

	//maybe reversed
	var materials = [
		new THREE.MeshLambertMaterial({color:new THREE.Color(0.7,0.7,0.2)}),
		new THREE.MeshLambertMaterial({color:new THREE.Color(0.7,0.2,0.7)})];

	{
		var start = new THREE.Vector3().fromArray(connection[0]);
		var end = new THREE.Vector3().fromArray(connection[1])
		var length = start.distanceTo(end);

		var numDots = Math.floor(length* 3);
		var connectionMesh = new THREE.Mesh( DottedLineGeometry(numDots,0.07), materials[i]);
		var newY = end.clone().sub(start).multiplyScalar(0.5 / numDots);
		redirectCylinder(connectionMesh, start, newY );
		assemblage.add(connectionMesh);
		connectionMeshes.push(connectionMesh);
	}
	
	holdables.push(handDistancer)
	objectsToBeUpdated.push(handDistancer);
	scene.add(handDistancer);
	handDistancer.ordinaryParent = scene;

	return handDistancer;
}

