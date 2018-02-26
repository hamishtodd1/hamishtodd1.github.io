function initStereographicTwoSphere()
{
	function getStereographicProjection(vector, rayOrigin)
	{
		var rayDirection = vector.clone().sub(rayOrigin);
		var multiplier = 1 / rayDirection.x;
		var stereographicProjectionInFourSpace = rayDirection.multiplyScalar(multiplier).add(rayOrigin);

		return new THREE.Vector3(
			0,
			stereographicProjectionInFourSpace.y,
			stereographicProjectionInFourSpace.z );
	}

	new THREE.OBJLoader().load( "data/textures/worldMap.obj",
		function ( object ) 
		{
			var worldMap = new THREE.Mesh(
				new THREE.Geometry().fromBufferGeometry(object.children[0].geometry),
				new THREE.MeshPhongMaterial({color:0x00FF00}));
			//max surface variation appears to be 1/61
			for(var i = 0, il = worldMap.geometry.vertices.length; i<il; i++)
			{
				worldMap.geometry.vertices[i].normalize();
			}
			worldMap.geometry.applyMatrix(new THREE.Matrix4().makeRotationX(-TAU/4))

			worldMap.position.z -= 0.5
			worldMap.scale.setScalar(1/15);
			scene.add(worldMap)
			worldMap.update = function()
			{
				this.rotation.y += 0.01
			}
			markedThingsToBeUpdated.push(worldMap)

			var worldStereographicProjection = new THREE.Mesh(
				worldMap.geometry.clone(),
				worldMap.material.clone());
			worldStereographicProjection.material.side = THREE.DoubleSide
			worldStereographicProjection.projectionPoint = new THREE.Vector3(-1,0,0)
			worldStereographicProjection.scale.setScalar(1/5);
			worldStereographicProjection.position.copy(worldMap.position)
			// worldStereographicProjection.position.x += 0.12;
			scene.add(worldStereographicProjection)
			worldStereographicProjection.update = function()
			{
				for(var i = 0, il = worldMap.geometry.vertices.length; i < il; i++)
				{
					var worldSpaceVertex = worldMap.geometry.vertices[i].clone().applyQuaternion(worldMap.quaternion);
					var sp = getStereographicProjection(worldSpaceVertex,this.projectionPoint);
					// var sp = worldMap.geometry.vertices[i].clone()

					worldStereographicProjection.geometry.vertices[i].copy(sp);
				}
				this.geometry.verticesNeedUpdate = true
				this.rotation.y+=0.01
			}
			markedThingsToBeUpdated.push(worldStereographicProjection)
		},
		function ( xhr ) {}, function ( xhr ) { console.error( "couldn't load OBJ" ); } );
}