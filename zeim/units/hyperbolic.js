/*
	maybe you just want to get the longest geodesic possible?
	Maybe your projectile has a radius and it shouldn't get too close in a parallel-ish way

		https://cs.stanford.edu/people/jbaek/18.821.paper2.pdf
	Requires a fast way to "find the closest point on the surface to r in ambient space
	http://www.staff.uni-mainz.de/schoemer/publications/GMP02.pdf

		Let's say it's a quartic surface in affine space
		Could define it using spherical coordinates somehow? We know we want it to be closed

	Do for plane, sphere, torus, elipsoid, weirdly curved torus? Cylinder. Hyperboloid?
	Surfaces of revolution? Picture a skewed figure-of-8

	In script: in reality, our universe is weirdly curved and has a huge number of dimensions.
	The path that particles take through it are always geodesics, so studies of this are very important for physics
	Finding paths for paint on robots spraying car parts - so the Tesla Model 3 plant might do well to take account of this
	Also useful in geometric optics? "illumination problem"

	Would be nice to be able to "take the distance between two points"

	does it, or does it not, come back? = simple vs non simple

	surfaces (function = 0)
		sphere			x2+y2+z2 - 1
		cross cap		4x2*(x2+y2+z2)+(y2+z2-1)
		Torus			(x2+y2+z2+R2−r2)2−4R2(x2+y2)
		Cylinder		x2+y2-1
		klein quartic	x3y + y3z + z3x = 0 supposed to be in complex numbers but surely something?
		Klein bottle?
		double torus? nicholas schmitt/dugan hammock. 
		https://arxiv.org/pdf/1307.6938.pdf
		Things with punctures?
	Can nicely morph between these because it's just lerping a few coefficients
*/

function initHyperbolic()
{
	var maxSpeed = 0.05;

	//maybe two balls sent in opposite directions?
	{
		var ball = new THREE.Mesh(new THREE.EfficientSphereGeometry(0.05), new THREE.MeshPhongMaterial({color:0xFF0000}));
		ball.velocity = new THREE.Vector3();
		
		{
			var trailCurrentSegment = 0;
			var trailSegments = 600;
			var trail;
			var trailThickness = 0.01;
			var trailCylinderSides = 16;
			trail = new THREE.Mesh(new THREE.Geometry(), new THREE.MeshBasicMaterial({color: ball.material.color}) );
			trail.geometry.vertices = Array(trailCylinderSides*2);
			trail.geometry.faces = Array(trailCylinderSides*2);
			var firstVertexIndex = 0;
			for(var i = 0; i < trailSegments; i++)
			{
				for( var j = 0; j < trailCylinderSides; j++)
				{
					trail.geometry.vertices[firstVertexIndex+j*2  ] = new THREE.Vector3();
					trail.geometry.vertices[firstVertexIndex+j*2+1] = new THREE.Vector3();
					
					trail.geometry.faces[firstVertexIndex+j*2 ] = new THREE.Face3(
						firstVertexIndex +  j*2+1,
						firstVertexIndex +  j*2+0,
						firstVertexIndex + (j*2+2) % (trailCylinderSides*2) );
					
					trail.geometry.faces[firstVertexIndex+j*2+1 ] = new THREE.Face3(
						firstVertexIndex +  j*2+1,
						firstVertexIndex + (j*2+2) % (trailCylinderSides*2),
						firstVertexIndex + (j*2+3) % (trailCylinderSides*2) );
				}
				firstVertexIndex += trailCylinderSides * 2;
			}
			function resetTrail()
			{
				for(var i = 0, il = trail.geometry.vertices.length; i < il; i++)
				{
					trail.geometry.vertices[i].copy(ball.position);
				}
			}
		}

		function objectsOverlapping(a,b)
		{
			var dist = a.position.clone().add(a.geometry.boundingSphere.center).distanceTo( b.position.clone().add(b.geometry.boundingSphere.center) );
			if( dist < a.geometry.boundingSphere.radius + b.geometry.boundingSphere.radius )
			{
				return true;
			}
			else return false;
		}
		
		markedThingsToBeUpdated.push(ball);
		ball.update = function()
		{
			if(mouse.lastClickedObject === this.parent)
			{
				if(mouse.clicking && !mouse.oldClicking)
				{
					var clickedPoint = mouse.rayCaster.intersectObject( this.parent )[0].point;
					this.parent.updateMatrixWorld()
					this.parent.worldToLocal(clickedPoint);

					this.position.copy(clickedPoint)
					this.position.copy(this.parent.closestPointToPoint(this.position))
					resetTrail();
					this.velocity.set(0,0,0)
				}

				if(!mouse.clicking && mouse.oldClicking)
				{
					var cameraSpaceZ = this.position.clone().applyMatrix4(this.parent.matrix).z;
					this.velocity.copy( mouse.rayIntersectionWithZPlaneInCameraSpace(cameraSpaceZ) );
					this.parent.worldToLocal(this.velocity)
					this.velocity.sub(this.position).setLength(maxSpeed)
				}
			}

			var formerPosition = this.position.clone();
			var formerNormal = this.parent.getNormal(this.position);
			this.position.add(this.velocity)
			this.position.copy(this.parent.closestPointToPoint(this.position))
			var normal = this.parent.getNormal(this.position);
			var normalChangingQuaternion = new THREE.Quaternion().setFromUnitVectors(formerNormal,normal);
			this.velocity.applyQuaternion(normalChangingQuaternion)

			insertCylindernumbers( this.position, formerPosition,
				trail.geometry.vertices, trailCylinderSides, trailCurrentSegment * trailCylinderSides * 2, trailThickness );
			trail.geometry.verticesNeedUpdate = true;
			
			trailCurrentSegment++;
			if( trailCurrentSegment === trailSegments )
			{
				trailCurrentSegment = 0;
			}

			
			
			// for(var i = 0; i < goodObjects.length; i++)
			// {
			// 	if(goodObjects[i].parent !== scene)
			// 	{
			// 		continue;
			// 	}
			// 	if( objectsOverlapping( avatar, goodObjects[i] ) )
			// 	{
			// 		scene.remove(goodObjects[i]);
			// 		Sounds.pop1.play();
			// 	}
			// }
			
			// for(var i = 0; i < badObjects.length; i++)
			// {
			// 	if(badObjects[i].parent !== scene)
			// 	{
			// 		continue;
			// 	}
			// 	if( objectsOverlapping( avatar, badObjects[i] ) )
			// 	{
			// 		Sounds.change1.play();
			// 	}
			// }
		}
	}

	var surfaceMaterial = new THREE.MeshStandardMaterial({color:0x00FF00});

	var planarSurface = new THREE.Mesh(new THREE.PlaneGeometry(0.9,0.9), surfaceMaterial )
	planarSurface.position.z = -10;
	scene.add(planarSurface)
	clickables.push(planarSurface)
	planarSurface.closestPointToPoint = function(ambientPoint)
	{
		return ambientPoint.clone().setComponent(2,0)
	}
	planarSurface.getNormal = function(pointOnSurface)
	{
		return zUnit.clone();
	}
	planarSurface.add(ball, trail);

	// var radius = 0.45;
	// var sphericalSurface = new THREE.Mesh(new THREE.EfficientSphereGeometry(0.45,2), surfaceMaterial);
	// sphericalSurface.position.z = -10;
	// scene.add(sphericalSurface)
	// clickables.push(sphericalSurface)
	// sphericalSurface.closestPointToPoint = function(ambientPoint)
	// {
	// 	return ambientPoint.clone().setLength(radius)
	// }
	// sphericalSurface.getNormal = function(pointOnSurface)
	// {
	// 	return pointOnSurface.clone().normalize();
	// }
	// sphericalSurface.add(ball, trail);

	{
		var badObjects = Array(2);
		var badMat = new THREE.MeshBasicMaterial({color:0xFF0000, side: THREE.DoubleSide});
		for( var i = 0; i < badObjects.length; i++)
		{
			badObjects[i] = new THREE.Mesh(new THREE.CircleGeometry(0.03,32), badMat);
			badObjects[i].position.set(Math.random() - 0.5,Math.random() - 0.5,0);
			badObjects[i].geometry.computeBoundingSphere();
			
			scene.add(badObjects[i]);
		}
		
		var goodObjects = Array(1);
		var goodMat = new THREE.MeshBasicMaterial({color:0x00FF00, side: THREE.DoubleSide});
		for( var i = 0; i < goodObjects.length; i++)
		{
			goodObjects[i] = new THREE.Mesh(new THREE.CircleGeometry(0.01,32), goodMat);
			goodObjects[i].position.set(Math.random() - 0.5,Math.random() - 0.5,0);
			goodObjects[i].geometry.computeBoundingSphere();
			
			scene.add(goodObjects[i]);
		}
	}
}