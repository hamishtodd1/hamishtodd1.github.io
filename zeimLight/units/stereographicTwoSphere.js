/*
	Stereographic projection = very high FOV game.

	Example of a game format where seeing right angles is important?

	Could have lines on there quite easily, circles of course. 
	Grab a little circle on the projected field and move it around.
	Have to touch some things and avoid other things and other things you crash into
	Maybe: the light automatically opposes the "screen"?

	TODO
		Grab to rotate the sphere
		Lines(/circles) that map to circles and vice versa. Three points on each, grab and move
			out of which you build crosses mapping to perfect right angle crosses
		A little dot to move around. You can then change the projection but not such that it is inside shapes. It has a destination
		A "sheet" it projects onto
		fix triangle stretching problem?
		They should be able to move the sphere arbitrarily
		Surface of jupiter?
			Yes but screw texture mapper, make it yourself with triangles.
			You want a concentric circles thing anyway
			Can you make a virtue of this? Yes, the red spot can be circles
		Projectiles, dummy. They move on the sphere so have interesting behaviour
		Or a constant stream of projectiles on plane that look funny on sphere, forever slowing down

		Visualize the formula? Nah, not your style. But

		That old rainbow square from Mobius Transformations revealed

		You're looking at a sphere.
		You click on its surface, it selects the correct pt
		You click outside the sphere, it selects a point on the side you couldn't reach

	Script
		Thanks to Henry Segerman for making me aware of the coolness of this

	Sliding shapes around on this surface would be nice
		Think of the 1D analogy
		All lines are great circles
		Easy to imagine for a line on a 2-sphere: "lay" it on. Any shape WILL have its gaussian curvature changed, it's a different shape
		Any shape can be turned into triangles, and those triangles can be put on the sphere?
		Any convex regular polygon is fine
		The case you're picturing is a cube net being stretched over

	Use toon material

	It all works if you assume vertices are on circle
*/



function initStereographicTwoSphere()
{
	// initShapeStretchedOverSphere()

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

	new THREE.OBJLoader().load( "data/meshes/worldMap.obj",
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
			console.log(worldMap.geometry.vertices.length)

			worldMap.position.z -= 0.5
			// worldMap.scale.setScalar(1/60);
			scene.add(worldMap)
			worldMap.update = function()
			{
				this.rotation.y += 0.01
			}
			objectsToBeUpdated.push(worldMap)

			var worldStereographicProjection = new THREE.Mesh(
				worldMap.geometry.clone(),
				worldMap.material.clone());
			worldStereographicProjection.material.side = THREE.DoubleSide
			worldStereographicProjection.projectionPoint = new THREE.Vector3(-1,0,0)
			worldStereographicProjection.scale.setScalar(worldMap.scale.x);
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
			objectsToBeUpdated.push(worldStereographicProjection)
		},
		function ( xhr ) {}, function ( xhr ) { console.error( "couldn't load OBJ" ); } );
}

function initShapeStretchedOverSphere()
{
	var radius = 0.5;
	var sphere = new THREE.Mesh(new THREE.EfficientSphereBufferGeometry(radius,3), new THREE.MeshPhongMaterial({transparent:true,opacity:0.7}))
	scene.add(sphere)

	var regularShape = new THREE.Mesh(new THREE.Geometry(), new THREE.MeshStandardMaterial(
		{
			color:0x5050FF
		}));
	regularShape.geometry.vertices.push(new THREE.Vector3(0,0,1))
	var sidedness = 4;
	for(var i = 0; i < sidedness; i++)
	{
		var newVertex = new THREE.Vector3(0,0.1,1);
		newVertex.applyAxisAngle( zUnit, i * TAU / sidedness )
		newVertex.setLength( radius )
		regularShape.geometry.vertices.push(newVertex)
		regularShape.geometry.faces.push(new THREE.Face3(0,i+1,1 + (i+1) % sidedness ) )
	}
	regularShape.update = function()
	{
		/*
			Translations and rotations are obviously easy

			Dunno what scaling means for irregular shapes. Possibly nothing
				Maybe keeping edge length ratio?

			Not hard to add the interior stuff

			Could make a nice jigsaw for Maya
		*/

		var center = regularShape.geometry.vertices[0]
		for(var i = 0; i < regularShape.geometry.vertices.length; i++)
		{
			var axis = center.clone().cross(regularShape.geometry.vertices[i]).normalize()
			var angleToCenter = center.angleTo(regularShape.geometry.vertices[i])
			angleToCenter += 0.02
			regularShape.geometry.vertices[i].copy(center)
			regularShape.geometry.vertices[i].applyAxisAngle(axis,angleToCenter)
			regularShape.geometry.vertices[i].setLength(radius)
		}

		regularShape.geometry.verticesNeedUpdate = true;
	}
	objectsToBeUpdated.push(regularShape)
	sphere.add(regularShape)
}