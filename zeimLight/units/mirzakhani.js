'use strict';
/*
	TODO
		Stick the things - graph, conditions lattice, the surfaces - around the frame the

		If nothing else, do trail collision
		Bind button to stereographic projection location. Also visibox
		Urrrrrgh it'd be better with a single renderer in the middle of a webpage
		Send to mum for music


	Script outline. 4 things
		As a teenager, she won a prize technically worth infinity dollars
		Didn’t like maths when she was at school
		Ridiculously modest
			https://www.youtube.com/watch?v=TxbE6mkYUAg her drawing on board
			First female fields medallist - also first Iranian + Muslim! There's a tribute to her in farsi in the description
			first of any gender to get full marks at olympiad
			First to be shown without a headscarf in media
			pic of her with dad in front of islamic art
			Towards the end of her life she worked at Harvard and Stanford
			Her parents couldn't travel to US due to Trump's ban
			She was considering not attending the ceremony due to sickness
		Her work is connected to big bang
			"Chainsaw"
			Snake
			Not just these surfaces, but all possible similar surfaces
			In ordinary mathematics we integrate over a single line - she had to integrate over the moduli space of riemann surfaces
			If you draw a random loop on a genus-2 surface, the probability that it cuts it in 2 is 1/7
			New approach to witten's conjecture
		She used to doodle so much that her daughter thought she was an artist.
			Long rolls of parchment, on the floor
			That's what mathematics really is - show cool animations
			Hey, maybe that's what she was!
			When she received her fields medal at the age of 37, she already knew she had terminal cancer
		She once survived a bus crash

		
		Surfaces part
			Geodesics are important for the same reason straight lines are important
				These surfaces might exist in a billion dimensions or be weirdly distorted, so trying to draw straight lines on them is one way of getting an idea of their structure
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


	surfaces in order
		Sphere
		Plane
		Cylinder		x2+y2-1 
		Torus			(x2+y2+z2+R2−r2)2−4R2(x2+y2)		easy parameterization
		hyperbolic paraboloid z = sq(x)-sq(y)
		Hyperboloid
*/

var mirzakhaniConditions;

function initConditionsVisualization()
{
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
	mirzakhaniConditions = function(i,j,k)
	{
		return evenCondition(i,j,k) && weirdCondition(i,j,k) && divisibilityCondition(i,j,k);
	}

	var conditionsLattice = new THREE.Group()
	// conditionsLattice.position.x = -0.5
	scene.add(conditionsLattice)
	var gridDimension = 21;
	conditionsLattice.scale.setScalar(0.5 * 1/gridDimension)

	var pointGeometry = new THREE.EfficientSphereGeometry(1)
	var points = new THREE.Group()
	conditionsLattice.add(points)
	points.position.setScalar(-(gridDimension-1) / 2)
	for(var i = 0; i < gridDimension; i++){
	for(var j = i; j < gridDimension; j++){
	for(var k = j; k < gridDimension; k++){
		var newPoint = new THREE.Mesh(pointGeometry, new THREE.MeshPhongMaterial({color:0x000000}))
		newPoint.position.set(i,j,k);
		newPoint.castShadow = true
		if( mirzakhaniConditions(i,j,k) )
		{
			newPoint.scale.setScalar(0.3)
		}
		else
		{
			newPoint.scale.setScalar(0.3)
			// newPoint.visible = false
		}
		points.add(newPoint)
	}
	}
	}

	objectsToBeUpdated.push(conditionsLattice)
	conditionsLattice.update = function()
	{
		if(mouse.clicking && mouse.lastClickedObject === null )
		{
			mouse.rotateObjectByGesture(this)
		}
	}

	function toggleCondition(conditionFunction,col)
	{
		for(var i = 0, il = points.children.length; i < il; i++)
		{
			if(conditionFunction(points.children[i].position.x,points.children[i].position.y,points.children[i].position.z))
			{
				points.children[i].material.color[col] = 1-points.children[i].material.color[col]
			}
		}
	}

	bindButton("1",
		function()
		{
			toggleCondition(evenCondition,"r")
		},
		"toggle visual of even condition"
	);
	bindButton("2",
		function()
		{
			toggleCondition(divisibilityCondition,"g")
		},
		"toggle visual of divisibility condition"
	);
	bindButton("3",
		function()
		{
			toggleCondition(weirdCondition,"b")
		},
		"toggle visual of weird condition"
	);
	bindButton("4",
		function()
		{
			for( var i = 0, il = points.children.length; i < il; i++ )
			{
				if( !mirzakhaniConditions(points.children[i].position.x,points.children[i].position.y,points.children[i].position.z) )
				{
					points.children[i].visible = !points.children[i].visible;
				}
			}
		},
		"toggle visual of non mirzakhani points"
	);

	//probably you want inflation AND color change
}


function initMirzakhani()
{
	initConditionsVisualization()
	return;
	// // initGraphTheory();
	
	var surfaces = initSurfaces();

	var movementSpeed = 0.01;

	/*
	TODO
		Put a character on the surface that you move, and that shoots
			Click outside the surface to move in that direction
			Click inside it to shoot from current location
			Give them limits and targets. Multitouch, or eight way, or keyboard and mouse.
			Also: an enemy that shoots a bunch at you, but you lure it into shooting ones that will not be on simple geodesics, i.e. they will die.
		should have a "machine gun" shooting in direction of mouse diff

		You are playing snake / shooting the things. do need the self-intersection code probably

		Former ideas
			a race? Get from here to here in the time limit?
			Ok a stealth game with lines of sight. Or helsing’s fire-esque
			As the things move around the surface, depict their length. Ask: can you think of a geodesic whose length would be between these two?

		Making the trail collide
			closestDistanceBetweenLineSegments()
			What's the radii?
	*/
	//maybe two projectiles sent in opposite directions?
	{
		var projectile = new THREE.Group();
		{
			var blackMaterial = new THREE.MeshPhongMaterial({color:0x000000})
			var carapace = new THREE.Mesh(new THREE.SphereBufferGeometry(1,8,16,0,TAU/2), blackMaterial)
			carapace.castShadow = true
			var headVerticalProportion = 0.243;
			var wingGap = 0.02;
			var shellLeft = new THREE.Mesh(new THREE.SphereBufferGeometry(1.04,8,16,
				0,TAU/4-wingGap,
				TAU/2*headVerticalProportion,TAU/2*(1-headVerticalProportion)), new THREE.MeshPhongMaterial({color:0xFF0000}))
			var shellRight = new THREE.Mesh(new THREE.SphereBufferGeometry(1.04,8,16,
				TAU/4+wingGap,TAU/4-wingGap,
				TAU/2*headVerticalProportion,TAU/2*(1-headVerticalProportion)), new THREE.MeshPhongMaterial({color:0xFF0000}))
			projectile.add(
				shellLeft,shellRight,
				carapace
				);

			var spotRotations = [[1.5,0.3],[2.2,0.4],[0.8,1]];
			var spotMinRadius = 0.17;
			for(var i = 0; i < spotRotations.length; i++)
			{
				var spot = new THREE.Mesh(new THREE.SphereBufferGeometry(1.06,16,2,0,TAU,
				0,spotMinRadius*(1+i/20)), blackMaterial )
				
				spot.rotation.x = spotRotations[i][0];
				spot.rotation.z = spotRotations[i][1];

				var symmetricSpot = spot.clone();
				symmetricSpot.rotation.z *= -1;
				projectile.add(spot,symmetricSpot);
			}

			var eyeThing = new THREE.Mesh(new THREE.SphereBufferGeometry(1.02,16,2,
				0,TAU/2,
				0,0.34), new THREE.MeshPhongMaterial() )
			eyeThing.rotation.z = 0.5;
			var otherEyeThing = eyeThing.clone();
			otherEyeThing.rotation.z *= -1;
			projectile.add(eyeThing,otherEyeThing)

			projectile.scale.setScalar(0.05);
			projectile.scale.y *= 1.13
		}
		
		projectile.speed = 0;
		
		{
			var trailCurrentSegment = 0;
			var trailSegments = 60;
			var trail;
			var trailThickness = 0.003;
			var trailCylinderSides = 16;
			trail = new THREE.Mesh(new THREE.Geometry(), new THREE.MeshBasicMaterial({color: 0xD2AC01}) );
			trail.points = Array(trailSegments);
			for(var i = 0; i < trailSegments; i++)
			{
				trail.points[i] = new THREE.Vector3();
			}
			trail.geometry.vertices = Array(trailCylinderSides*2);
			trail.geometry.faces = Array(trailCylinderSides*2);
			var firstVertexIndex = 0;
			for(var i = 0; i < trailSegments; i++)
			{
				for( var j = 0; j < trailCylinderSides; j++)
				{
					trail.geometry.vertices[firstVertexIndex+j*2+0] = new THREE.Vector3();
					trail.geometry.vertices[firstVertexIndex+j*2+1] = new THREE.Vector3();
					
					trail.geometry.faces[firstVertexIndex+j*2 ] = new THREE.Face3(
						firstVertexIndex + (j*2+1),
						firstVertexIndex + (j*2+0),
						firstVertexIndex + (j*2+2) % (trailCylinderSides*2) );
					
					trail.geometry.faces[firstVertexIndex+j*2+1 ] = new THREE.Face3(
						firstVertexIndex + (j*2+1),
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
				trail.geometry.vertices[i].copy(projectile.position);
			}
			for(var i = 0; i < trail.points.length; i++ )
			{
				trail.points[i].copy(projectile.position);
			}
		}

		function putSomewhereOnSurfaceUsingRayCast(rayCaster, locationToBeCloserToInWorldSpace)
		{
			var possibleIntersections = rayCaster.intersectObject( projectile.parent );
			if( possibleIntersections.length === 0 )
			{
				console.error("off surface!")
				projectile.speed = 0;
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

			projectile.position.copy(intersection.point)
			projectile.parent.worldToLocal(projectile.position);
			faceThatBallIsOn = intersection.face;
		}

		objectsToBeUpdated.push(projectile);
		projectile.update = function()
		{
			if(!this.parent)
			{
				return
			}

			this.parent.updateMatrixWorld()

			if(mouse.lastClickedObject === this.parent)
			{
				if( mouse.clicking )
				{
					if( !mouse.oldClicking )
					{
						putSomewhereOnSurfaceUsingRayCast(mouse.rayCaster, camera.position)

						resetTrail();
						this.speed = 0;
					}

					var newUp = faceThatBallIsOn.normal.clone();
					var towardCamera = camera.position.clone();
					this.parent.worldToLocal(towardCamera)
					towardCamera.sub(this.position);
					if(faceThatBallIsOn.normal.dot(towardCamera)<0)
					{
						newUp.negate()
					}
					this.quaternion.premultiply( new THREE.Quaternion().setFromUnitVectors(zUnit.clone().applyQuaternion(this.quaternion),newUp) );

					var worldZ = this.position.clone().applyMatrix4(this.parent.matrix).z;
					var lookTowards = mouse.rayIntersectionWithZPlane(worldZ);
					this.parent.worldToLocal(lookTowards)
					lookTowards.sub(this.position)
					lookTowards.projectOnPlane(newUp);
					lookTowards.normalize();
					this.quaternion.premultiply( new THREE.Quaternion().setFromUnitVectors(yUnit.clone().applyQuaternion(this.quaternion),lookTowards) );
				}
				else
				{
					if(mouse.oldClicking)
					{
						this.speed = movementSpeed;
					}
				}
			}

			if(faceThatBallIsOn !== null && this.speed !== 0 && !mouse.clicking )
			{
				var formerPosition = this.position.clone();
				var numIterations = 3;
				for(var i = 0; i < numIterations; i++)
				{
					var formerNormal = zUnit.clone().applyQuaternion(this.quaternion) //we do have a definition of "up" that is not exactly the normal
					
					var velocity = new THREE.Vector3(0,this.speed/numIterations,0).applyQuaternion(this.quaternion)
					this.position.add(velocity)

					positionRayCaster.set(
						this.position.clone().add(formerNormal).applyMatrix4(this.parent.matrix),
						formerNormal.clone().negate().applyQuaternion(this.parent.quaternion) );

					putSomewhereOnSurfaceUsingRayCast(positionRayCaster,this.position.clone().applyMatrix4(this.parent.matrix));

					//wouldn't need the if statement if all the normals were pointing in same direction
					//won't work if you're doing non-orientable
					if(formerNormal.dot(faceThatBallIsOn.normal) < 0 )
					{
						var deltaQuaternion = new THREE.Quaternion().setFromUnitVectors(formerNormal.clone().negate(),faceThatBallIsOn.normal);
					}
					else
					{
						var deltaQuaternion = new THREE.Quaternion().setFromUnitVectors(formerNormal,faceThatBallIsOn.normal);
					}
					this.quaternion.premultiply(deltaQuaternion);
				}

				{
					trail.points[trailCurrentSegment].copy(this.position);
					insertCylindernumbers( trail.points[trailCurrentSegment], trail.points[moduloWithNegatives(trailCurrentSegment-1,trailSegments)],
						trail.geometry.vertices, trailCylinderSides, trailCurrentSegment * trailCylinderSides * 2, trailThickness );
					trail.geometry.verticesNeedUpdate = true;

					trailCurrentSegment++;
					if( trailCurrentSegment === trailSegments )
					{
						trailCurrentSegment = 0;
					}

					//also closure check
					for(var i = 0, il = trail.points.length; i < il; i++)
					{
						if( i === trailCurrentSegment )
						{
							continue;
						}

						if( trailThickness / 10 > closestDistanceBetweenLineSegments(
							trail.points[ trailCurrentSegment ],
							trail.points[ moduloWithNegatives(trailCurrentSegment-1,trailSegments) ],
							trail.points[ i ],
							trail.points[ moduloWithNegatives(i-1,trailSegments) ]
							) )
						{
							//lots of false positives. And shouldn't radius be in there???
							console.log("cross")
						}
					}
				}
			}
		}
	}

	bindButton( "up", function()
	{
		if(projectile.speed === movementSpeed)
		{
			projectile.speed *= 1.2;
		}
		movementSpeed *= 1.2
	}, "increases projectile speed" )
	bindButton( "down", function()
	{
		if(projectile.speed === movementSpeed)
		{
			projectile.speed /= 1.2;
		}
		movementSpeed /= 1.2
	}, "decreases projectile speed" )

	var chosenSurface = surfaces.genus2
	if(chosenSurface.update === undefined)
	{
		chosenSurface.update = function()
		{
			if(mouse.clicking && mouse.lastClickedObject === null )
			{
				mouse.rotateObjectByGesture(this)
			}
		}
	}
	objectsToBeUpdated.push( chosenSurface )
	scene.add(chosenSurface)
	chosenSurface.castShadow = true
	mouseables.push(chosenSurface)
	chosenSurface.add(
		projectile,
		trail
	);
}