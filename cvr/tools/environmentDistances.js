//HEY, COULD JUST HAVE THEM ALWAYS BE ON, SAME WITH PROBE DOTS, WHY NOT?

function initEnvironmentDistances()
{
	var environmentDistancer = Tool(0xFFFFFF)

	var connectionMeshes = [];
	
	// environmentDistancer.onGrab = function(controller)
	// {
	// 	this.scale.setScalar(1);

	// 	//TODO have one seed many?
	// 	// var newEnvironmentDistancer = new THREE.Mesh(environmentDistancer.geometry, environmentDistancer.material);
	// 	// newEnvironmentDistancer.label = new THREE.Mesh(label.geometry,label.material);
	// 	// scene.add(newEnvironmentDistancer);
	// 	// newEnvironmentDistancer.position.copy(environmentDistancer.position);
	// 	// newEnvironmentDistancer.quaternion.copy(environmentDistancer.quaternion);
	// 	// establishAttachment(newEnvironmentDistancer, controller);
	// }

	var mostRecentlyRequestedResNo = null;

	environmentDistancer.whileHeld = function(positionInAssemblage)
	{
		var localRadiusSq = sq( this.boundingSphere.radius / getAngstrom() );

		var closestAtom = null;
		var closestAtomDistSq = Infinity;
		for(var i = 0; i < models.length; i++)
		{
			for(var j = 0, jl = models[i].atoms.length; j < jl; j++)
			{
				var distanceSq = positionInAssemblage.distanceToSquared(models[i].atoms[j].position);
				if(	distanceSq < localRadiusSq && distanceSq < closestAtomDistSq)
				{
					closestAtom = models[i].atoms[j];
					closestAtomDistSq = positionInAssemblage.distanceToSquared(models[i].atoms[j].position);
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

	//maybe reversed
	var materials = [
		new THREE.MeshLambertMaterial({color:new THREE.Color(0.7,0.7,0.2)}),
		new THREE.MeshLambertMaterial({color:new THREE.Color(0.7,0.2,0.7)})];

	socket.commandReactions["environmentDistances"] = function(msg)
	{
		var model = getModelWithImol( msg.imol );
		var connectionsByColor = [ msg.data[1][0], msg.data[1][1] ]
		for(var i = 0; i < connectionsByColor.length; i++)
		{
			for(var j = 0; j < connectionsByColor[i].length; j++)
			{
				//getting some weirdness, are the indices definitely right?
				var connection = connectionsByColor[i][j];
				
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
		}
	}

	// environmentDistancer.onLetGo()
	// {
	// 	this.scale.setScalar(1/getAngstrom());
	// }

	return environmentDistancer;
}