'use strict';
/*
	Script outline. 4 things
		Incredibly lovely and fun person, Not necessarily all that common in mathematics
		first of any gender to get full marks at olympiad
		Not just these surfaces, but all possible similar surfaces
		If you draw a random loop on a genus-2 surface, the probability that it cuts it in 2 is 1/7
		Didn’t like maths when she was at school
		But this is what mathematics really is
		Geodesics are important for the same reason straight lines are important
			These surfaces might exist in a billion dimensions or be weirdly distorted, so trying to draw straight lines on them is one way of getting an idea of their structure
		Compare to the escher picture, the tree images from petworth

	Former ideas
		a race? Get from here to here in the time limit?
		Ok a stealth game with lines of sight. Or helsing’s fire-esque
		As the things move around the surface, depict their length. Ask: can you think of a geodesic whose length would be between these two?
*/



function putSomewhereOnParentSurface(projectile,rayCaster, locationToBeCloserToInWorldSpace)
{
	var possibleIntersections = rayCaster.intersectObject( projectile.parent );
	if( possibleIntersections.length === 0 )
	{
		projectile.speed = 0;
		console.log("off surface")
		projectile.faceThatWeAreOn = null;
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
	projectile.faceThatWeAreOn = intersection.face;
}

function initGeodesics()
{
	//--------------Surfaces

	var surfaceMaterial = new THREE.MeshStandardMaterial({color:0x5050FF, side:THREE.DoubleSide});
	var surfaces = [];
	makeToroidalSurfaces(surfaces)
	surfaces.push(makeRotationallySymmetricHandleBody(3))

	for(var i = 0; i < surfaces.length; i++)
	{
		scene.add(surfaces[i])
		surfaces[i].castShadow = true;
		clickables.push(surfaces[i])

		if( surfaces[i].update === undefined)
		{
			updatables.push(surfaces[i])
			surfaces[i].update = function()
			{
				if( mouse.clicking && mouse.lastClickedObject === null )
				{
					mouse.rotateObjectByGesture(this)
				}
			}
		}
	}

	//------------------Ladybird
	var trail = new THREE.Mesh(new THREE.Geometry(), new THREE.MeshBasicMaterial({color: 0xD2AC01}) );
	trail.currentSegment = 0;
	trail.numSegments = 600;
	trail.radius = 0.003;
	trail.cylinderSides = 16;
	trail.points = Array(trail.numSegments);
	for(var i = 0; i < trail.numSegments; i++)
	{
		trail.points[i] = new THREE.Vector3();
	}
	trail.geometry.vertices = Array(trail.cylinderSides*2);
	trail.geometry.faces = Array(trail.cylinderSides*2);
	var firstVertexIndex = 0;
	for(var i = 0; i < trail.numSegments; i++)
	{
		for( var j = 0; j < trail.cylinderSides; j++)
		{
			trail.geometry.vertices[firstVertexIndex+j*2+0] = new THREE.Vector3();
			trail.geometry.vertices[firstVertexIndex+j*2+1] = new THREE.Vector3();
			
			trail.geometry.faces[firstVertexIndex+j*2 ] = new THREE.Face3(
				firstVertexIndex + (j*2+1),
				firstVertexIndex + (j*2+0),
				firstVertexIndex + (j*2+2) % (trail.cylinderSides*2) );
			
			trail.geometry.faces[firstVertexIndex+j*2+1 ] = new THREE.Face3(
				firstVertexIndex + (j*2+1),
				firstVertexIndex + (j*2+2) % (trail.cylinderSides*2),
				firstVertexIndex + (j*2+3) % (trail.cylinderSides*2) );
		}
		firstVertexIndex += trail.cylinderSides * 2;
	}

	trail.reset = function(pointToCopy)
	{
		for(var i = 0; i < trail.points.length; i++ )
		{
			trail.points[i].copy(pointToCopy);
		}
		for(var i = 0, il = trail.geometry.vertices.length; i < il; i++)
		{
			trail.geometry.vertices[i].copy(pointToCopy);
		}
		trail.geometry.verticesNeedUpdate = true;
		trail.currentSegment = 0;
	}

	var ladybird = new THREE.Group();
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
		ladybird.add(
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
			ladybird.add(spot,symmetricSpot);
		}

		var eyeThing = new THREE.Mesh(new THREE.SphereBufferGeometry(1.02,16,2,
			0,TAU/2,
			0,0.34), new THREE.MeshPhongMaterial() )
		eyeThing.rotation.z = 0.5;
		var otherEyeThing = eyeThing.clone();
		otherEyeThing.rotation.z *= -1;
		ladybird.add(eyeThing,otherEyeThing)

		ladybird.scale.setScalar(0.05);
		ladybird.scale.y *= 1.13
	}

	makeProjectile(ladybird, surfaces, 7, trail)
	ladybird.speed = 0;

	updatables.push(ladybird);
	ladybird.speedWhenMoving = 0.01;
	ladybird.update = function()
	{
		//hmm, can do better than this. Then, maybe remove oldClicking?

		if( !firingMachineGun )
		{
			if( surfaces.indexOf(mouse.lastClickedObject) !== -1 )
			{
				if( mouse.clicking )
				{
					if( !mouse.oldClicking )
					{
						mouse.lastClickedObject.add(this)
						putSomewhereOnParentSurface(this, mouse.rayCaster, camera.position)

						this.parent.add(trail)
						trail.reset(this.position);
						this.speed = 0;
					}

					this.pointTowardsMouse()
				}
				else
				{
					if(mouse.oldClicking)
					{
						this.speed = this.speedWhenMoving;
					}
				}
			}

			this.move();
		}
	}

	ladybird.multiplySpeed = function( multiple )
	{
		ladybird.speedWhenMoving *= multiple;
		if(ladybird.speed !== 0 )
		{
			ladybird.speed = ladybird.speedWhenMoving;
		}
	}

	bindButton( "up", function()
	{
		ladybird.multiplySpeed(1.2)
	}, "increases ladybird speed" )
	bindButton( "down", function()
	{
		ladybird.multiplySpeed(1/1.2)
	}, "decreases ladybird speed" )

	//---------------Machine gun
	{
		var machineGunProjectiles = Array(15);
		var machineGunProjectileGeometry = new THREE.EfficientSphereGeometry(0.01)
		for(var i = 0; i < machineGunProjectiles.length; i++)
		{
			machineGunProjectiles[i] = new THREE.Mesh(machineGunProjectileGeometry);
			machineGunProjectiles[i].material.color.setRGB(Math.random(),Math.random(),Math.random())
			makeProjectile(machineGunProjectiles[i], surfaces, 2)

			updatables.push(machineGunProjectiles[i])
			machineGunProjectiles[i].update = function()
			{
				if(firingMachineGun)
				{
					this.move();
				}
			}
		}

		var machineGun = {}
		var firingMachineGun = false
		var bulletIndex = 0;

		if(!PUBLIC_FACING)
		{
			bindButton("m",function()
			{
				firingMachineGun = !firingMachineGun

				if(!firingMachineGun)
				{
					for(var i = 0; i < machineGunProjectiles.length; i++)
					{
						if( machineGunProjectiles[i].parent )
						{
							machineGunProjectiles[i].parent.remove(machineGunProjectiles[i])
						}
					}
				}
				else
				{
					if(ladybird.parent)
					{
						ladybird.parent.remove(ladybird)
					}
					if(trail.parent)
					{
						trail.parent.remove(trail)
					}
				}
			}, "toggle machine gun")
		}

		updatables.push(machineGun)
		machineGun.update = function()
		{
			if( firingMachineGun && mouse.clicking && surfaces.indexOf(mouse.lastClickedObject) !== -1 && frameCount % 4 === 0 )
			{
				var previousRayCaster = new THREE.Raycaster(mouse.previousRay.origin,mouse.previousRay.direction)

				var projectile = machineGunProjectiles[bulletIndex];
				var surface = mouse.lastClickedObject
				
				surface.add(projectile)
				putSomewhereOnParentSurface(projectile, previousRayCaster, camera.position)
				if( projectile.faceThatWeAreOn !== null )
				{
					projectile.pointTowardsMouse()
					projectile.speed = 0.03

					bulletIndex = (bulletIndex+1) % machineGunProjectiles.length
				}
			}
		}
	}
}

function makeProjectile(projectile, surfaces, numIterations, trail)
{
	projectile.positionRayCaster = new THREE.Raycaster()
	projectile.faceThatWeAreOn = null;

	projectile.pointTowardsMouse = function()
	{ 
		var newUp = projectile.faceThatWeAreOn.normal.clone();
		var towardCamera = camera.position.clone();
		this.parent.worldToLocal(towardCamera)
		towardCamera.sub(this.position);
		if( projectile.faceThatWeAreOn.normal.dot(towardCamera) < 0 )
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

	if(trail !== undefined)
	{
		var warningSign = makeTextSign( "Closed geodesic found!", false, false, false)
		warningSign.position.y = 0.5
		warningSign.scale.multiplyScalar(0.094)
		scene.add(warningSign)
		warningSign.material.transparent = true
		warningSign.update = function()
		{ 
			this.material.opacity -= 0.8 * frameDelta
			this.material.opacity = clamp(this.material.opacity,0,1)
		}
		updatables.push(warningSign)
	}

	projectile.move = function()
	{
		if(!this.parent)
		{
			return 
		}

		this.parent.updateMatrixWorld()

		if(projectile.faceThatWeAreOn !== null && this.speed !== 0 )
		{
			var formerPosition = this.position.clone();
			for(var i = 0; i < numIterations; i++)
			{
				var formerNormal = zUnit.clone().applyQuaternion(this.quaternion) //we do have a definition of "up" that is not exactly the normal
				
				var velocity = new THREE.Vector3(0,this.speed/numIterations,0).applyQuaternion(this.quaternion)
				this.position.add(velocity)

				projectile.positionRayCaster.set(
					this.position.clone().add(formerNormal).applyMatrix4(this.parent.matrix),
					formerNormal.clone().negate().applyQuaternion(this.parent.quaternion) );

				putSomewhereOnParentSurface(projectile, projectile.positionRayCaster,this.position.clone().applyMatrix4(this.parent.matrix));
				if(projectile.faceThatWeAreOn !== null)
				{
					//wouldn't need the if statement if all the normals were pointing in same direction
					//won't work if you're doing non-orientable
					if(formerNormal.dot(projectile.faceThatWeAreOn.normal) < 0 )
					{
						var deltaQuaternion = new THREE.Quaternion().setFromUnitVectors(formerNormal.clone().negate(),projectile.faceThatWeAreOn.normal);
					}
					else
					{
						var deltaQuaternion = new THREE.Quaternion().setFromUnitVectors(formerNormal,projectile.faceThatWeAreOn.normal);
					}
					this.quaternion.premultiply(deltaQuaternion);
				}
				else
				{
					break;
				}
			}

			if(trail !== undefined)
			{
				trail.points[trail.currentSegment].copy(this.position);
				insertCylindernumbers( trail.points[trail.currentSegment], trail.points[moduloWithNegatives(trail.currentSegment-1,trail.numSegments)],
					trail.geometry.vertices, trail.cylinderSides, trail.currentSegment * trail.cylinderSides * 2, trail.radius );
				trail.geometry.verticesNeedUpdate = true;

				var lastSegment = trail.points[trail.currentSegment].clone().sub( trail.points[moduloWithNegatives(trail.currentSegment-1,trail.numSegments)] )
				var firstSegment = trail.points[1].clone().sub( trail.points[0] )
				if( trail.currentSegment > 10 && this.position.distanceTo(trail.points[0]) < 0.007 && lastSegment.angleTo(firstSegment) )
				{
					this.speed = 0;
					warningSign.material.opacity = 2;
				}

				trail.currentSegment++;
				if( trail.currentSegment === trail.numSegments )
				{
					trail.currentSegment = 0;
				}
			}
		}
	}

	return projectile
}