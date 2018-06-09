'use strict';
/*
	TODO
		Get images to illustrate everything, put them in a powerpoint
		Test marking system
		Compression...
		System for fitting arbitrary rectangles into a rectangle. Packing problem
		Set up markings for all objects
		Lay it all out on a board
		Implement such that the board tweens nicely to where you put it
			Step back--move--step forward
		Auto-zoom, surely?
		Eh, not a whole lot of point in controlling the trajectory; set it up like powerpoint
		Choose colors
		Record, on twitch
		Facebook version?
		Show to diego, get suggestions about zoom speed and such

	Script. 4 things?
		She used to doodle so much that her daughter thought she was an artist.
			Long rolls of parchment, on the floor
			And this is not a surprise given what you're about to see
		She once earned infinity dollars
			Bit of a long story to this
		first of any gender to get full marks at olympiad
			Enthusiastic and driven
		Her work is connected to big bang
			New approach to witten's conjecture
			"Chainsaw"
		First female fields medallist - also first Iranian + Muslim!
			First to be shown without a headscarf in media
		
		Surfaces part
			Compare to the escher picture, the tree images from petworth
			Useful in 3D graphics http://igl.ethz.ch/projects/developable/
			in reality, our universe is weirdly curved and has a huge number of dimensions.
			The path that particles take through it are always geodesics, so studies of this are very important for physics
			Finding paths for paint on robots spraying car parts - so the Tesla Model 3 plant might do well to take account of this
			She would study infinite sets of possible surfaces like this one
			What you'll find if you shoot is that choosing a place at random and a direction at random,
				you always likely get some completely insane path
				I as the programmer of this thing have the ability to do stuff like choose a nice specific point and set it off in a nice direction
			Did she love the azadi tower?

		Ending
			When she received her fields medal at the age of 37, she already knew she had terminal cancer
			Also the first Iranian fields medallist, there's a tribute to her in Farsi
			Headscarf stuff. No women in football stadiums

	surfaces in order
		Sphere
		Plane
		Cylinder		x2+y2-1 
		Torus			(x2+y2+z2+R2−r2)2−4R2(x2+y2)		easy parameterization
		hyperbolic paraboloid z = sq(x)-sq(y)
		Hyperboloid
*/

function initConditionsVisualization()
{
	var gridDimension = 20;
	for(var i = 0; i < gridDimension; i++){
	for(var j = 0; j < gridDimension; j++){
	for(var k = 0; k < gridDimension; k++){
		(i,j,k);
	}
	}
	}

	function evenCondition(i,j,k)
	{
		var allEven = ( i%2 === 0 && j%2 === 0 && k%2 === 0 );
		var allOdd  = ( i%2 === 1 && j%2 === 1 && k%2 === 1 );
		return allEven || allOdd;
	}
	function divisibilityCondition(i,j,k)
	{
		var interestingSum = i*j + j*k + k*i;
		return interestingSum % 5 !== 0;
	}
	function weirdCondition(i,j,k)
	{
		var array = [i,j,k].sort();
		var r = array[0], s = array[1], t = array[2];
		return t <= 4*r*s/(r+s);
	}
}

function initMirzakhani()
{
	// initGraphTheory();
	var surfaces = initSurfaces();

	/*
	TODO
		direction should be gotten by intersecting mouse ray with tangent plane
		Change controls to be more like klein bottle, with arrow?
		should have a "machine gun" shooting in direction of mouse diff

		Put a character on the surface that you move, and that shoots
			Click outside the surface to move in that direction
			Click inside it to shoot from current location
			Give them limits and targets. Multitouch, or eight way, or keyboard and mouse. Also: an enemy that shoots a bunch at you, but you lure it into shooting ones that will not be on simple geodesics, i.e. they will die.

		You are playing snake / shooting the things. do need the self-intersection code probably

		Former ideas
			a race? Get from here to here in the time limit?
			Ok a stealth game with lines of sight. Or helsing’s fire-esque
			As the things move around the surface, depict their length. Ask: can you think of a geodesic whose length would be between these two?

		ArrowGeometry()
	*/
	//maybe two balls sent in opposite directions?
	{
		var ball = new THREE.Mesh(new THREE.EfficientSphereGeometry(0.05), new THREE.MeshPhongMaterial({color:0xFF0000}));
		ball.velocity = new THREE.Vector3();
		
		{
			var trailCurrentSegment = 0;
			var trailSegments = 600;
			var trail;
			var trailThickness = 0.003;
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

			var positionRayCaster = new THREE.Raycaster()
			var faceThatBallIsOn = null;
		}

		function resetTrail()
		{
			for(var i = 0, il = trail.geometry.vertices.length; i < il; i++)
			{
				trail.geometry.vertices[i].copy(ball.position);
			}
		}

		function updateFromRayCastToSurface(rayCaster, locationToBeCloserToInWorldSpace)
		{
			var possibleIntersections = rayCaster.intersectObject( ball.parent );
			if(possibleIntersections.length === 0)
			{
				ball.velocity.set(0,0,0)
				return;
			}

			var intersection = possibleIntersections[0];
			var closestDist = Infinity;
			//erm, apparently they're already sorted? Should be [0]
			for(var i = 0; i < possibleIntersections.length; i++)
			{
				if( possibleIntersections[i].point.distanceTo(locationToBeCloserToInWorldSpace) < closestDist )
				{
					intersection = possibleIntersections[i];
					closestDist = possibleIntersections[i].point.distanceTo(locationToBeCloserToInWorldSpace);
				}
			}
			ball.position.copy(intersection.point)
			ball.parent.worldToLocal(ball.position);
			faceThatBallIsOn = intersection.face;
		}

		markedThingsToBeUpdated.push(ball);
		ball.update = function()
		{
			// for(var i = 0; i < numDots; i++ )
			// {
			// 	if( /*raycast from camera to dot hits surface at before hitting ball*/)
			// 	{
			// 		dots[i].visible = true;
			// 	}
			// 	else
			// 	{
			// 		dots[i].visible = false;
			// 	}
			// }
			if(!this.parent)
			{
				return
			}

			this.parent.updateMatrixWorld()

			if(mouse.lastClickedObject === this.parent)
			{
				if(mouse.clicking && !mouse.oldClicking)
				{
					updateFromRayCastToSurface(mouse.rayCaster, camera.position)

					resetTrail();
					this.velocity.set(0,0,0);
				}

				if(!mouse.clicking && mouse.oldClicking)
				{
					var cameraSpaceZ = this.position.clone().applyMatrix4(this.parent.matrix).z;
					this.velocity.copy( mouse.rayIntersectionWithZPlaneInCameraSpace(cameraSpaceZ) );
					this.parent.worldToLocal(this.velocity)
					var maxSpeed = 0.04;
					this.velocity.sub(this.position).setLength(maxSpeed)
				}
			}

			if(faceThatBallIsOn !== null)
			{
				if(!this.velocity.equals(zeroVector))
				{
					var formerPosition = this.position.clone();
					var numIterations = 10;
					for(var i = 0; i < numIterations; i++)
					{
						var formerNormal = faceThatBallIsOn.normal.clone();
						this.position.add(this.velocity.clone().multiplyScalar(1/numIterations))
						positionRayCaster.set(
							this.position.clone().add(formerNormal).applyMatrix4(this.parent.matrix),
							formerNormal.clone().negate().applyQuaternion(this.parent.quaternion) );

						updateFromRayCastToSurface(positionRayCaster,this.position.clone().applyMatrix4(this.parent.matrix));

						var normalChangingQuaternion = new THREE.Quaternion().setFromUnitVectors(formerNormal,faceThatBallIsOn.normal);
						this.velocity.applyQuaternion(normalChangingQuaternion);
					}

					insertCylindernumbers( this.position, formerPosition,
						trail.geometry.vertices, trailCylinderSides, trailCurrentSegment * trailCylinderSides * 2, trailThickness );
					trail.geometry.verticesNeedUpdate = true;
					trailCurrentSegment++;
					if( trailCurrentSegment === trailSegments )
					{
						trailCurrentSegment = 0;
					}	
				}
			}
		}
	}

	var chosenSurface = surfaces.genus2;
	if(chosenSurface.update === undefined)
	{
		chosenSurface.update = function()
		{
			if(mouse.clicking )
			{
				var rotationAmount = mouse.ray.direction.angleTo(mouse.previousRay.direction) * 12
				var rotationAxis = mouse.ray.direction.clone().cross(mouse.previousRay.direction);
				rotationAxis.applyQuaternion(this.quaternion.clone().inverse()).normalize();
				this.quaternion.multiply(new THREE.Quaternion().setFromAxisAngle(rotationAxis, rotationAmount))
			}
		}
	}
	markedThingsToBeUpdated.push( chosenSurface )
	scene.add(chosenSurface)
	clickables.push(chosenSurface)
	chosenSurface.position.z = -10;
	chosenSurface.add(ball, trail);
}