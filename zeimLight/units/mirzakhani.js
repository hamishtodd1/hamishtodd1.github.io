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
		Incredibly lovely and fun person
			Not necessarily all that common in mathematics
			https://www.youtube.com/watch?v=TxbE6mkYUAg her drawing on board
			First female fields medallist - also first Iranian + Muslim! There's a tribute to her in farsi in the description
			first of any gender to get full marks at olympiad
			First to be shown without a headscarf in media
			pic of her with dad in front of islamic art
			Towards the end of her life she worked at Harvard and Stanford
			Her parents couldn't travel to US due to Trump's ban
			She was considering not attending the ceremony due to sickness
		Her work is connected to big bang
			The witten conjecture can be proved using Mirzakhani's work
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

	Former ideas
		a race? Get from here to here in the time limit?
		Ok a stealth game with lines of sight. Or helsing’s fire-esque
		As the things move around the surface, depict their length. Ask: can you think of a geodesic whose length would be between these two?
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

	var gridDimension = 11;
	var conditionsVisualization = new THREE.Mesh(
		new THREE.BoxGeometry(gridDimension,gridDimension,gridDimension), 
		new THREE.MeshBasicMaterial({visible:false})
	);
	conditionsVisualization.scale.setScalar(0.5 * 1/gridDimension)
	conditionsVisualization.rotation.y += TAU / 4

	objectsToBeUpdated.push(conditionsVisualization)
	toysToBeArranged.push(conditionsVisualization)
	conditionsVisualization.update = function()
	{
		if( mouse.clicking && mouse.lastClickedObject === null )
		{
			mouse.rotateObjectByGesture(this)
		}
	}

	var pointGeometry = efficientSphereGeometryWithRadiusOne;
	var points = new THREE.Group()
	conditionsVisualization.add(points)
	points.position.setScalar(-(gridDimension-1) / 2)

	function Point(i,j,k)
	{
		var point = new THREE.Mesh(pointGeometry, new THREE.MeshPhongMaterial({color:0x444444}))
		point.position.set(i,j,k);
		point.scale.setScalar(0.23)
		points.add(point)

		point.add( new THREE.Mesh(pointGeometry, new THREE.MeshBasicMaterial({color:0x000000, side:THREE.BackSide}) ) )
		point.children[0].scale.multiplyScalar(1.35)
		point.children[0].castShadow = true

		clickables.push(point)
		point.onClick = function()
		{
			var graph = PartiteGraph( this.position.toArray() );
			scene.add(graph)
			graph.position.x = 0.5
		}
	}

	for(var i = 1; i < gridDimension; i++){
	for(var j = 1; j < gridDimension; j++){
	for(var k = 1; k < gridDimension; k++){
		Point(i,j,k)
	}
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
	return conditionsVisualization
}

function putSomewhereOnParentSurface(projectile,rayCaster, locationToBeCloserToInWorldSpace)
{
	var possibleIntersections = rayCaster.intersectObject( projectile.parent );
	if( possibleIntersections.length === 0 )
	{
		projectile.speed = 0;
		console.log("off surface")
		projectile.position.set(0,0,0)
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

	surfaces.push( new THREE.Mesh(new THREE.PlaneGeometry(0.75,0.75), surfaceMaterial ) )
	surfaces.push( new THREE.Mesh(new THREE.EfficientSphereGeometry(0.3,4), surfaceMaterial) )

	var hyperbolicParaboloid = new THREE.Mesh(new THREE.Geometry(), surfaceMaterial);
	var verticesWide = 30;
	for(var i = 0; i < verticesWide; i++)
	{
		for(var j = 0; j < verticesWide; j++)
		{
			var newPoint = new THREE.Vector3((i-verticesWide/2),0,(j-verticesWide/2));
			newPoint.applyAxisAngle(yUnit,TAU/8)
			newPoint.y = (sq(newPoint.x)-sq(newPoint.z))/verticesWide;
			newPoint.multiplyScalar(0.02)
			hyperbolicParaboloid.geometry.vertices.push(newPoint);
		}
	}
	insertPatchworkFaces(verticesWide, hyperbolicParaboloid.geometry.faces)
	hyperbolicParaboloid.geometry.computeFaceNormals();
	hyperbolicParaboloid.geometry.computeVertexNormals();
	surfaces.push(hyperbolicParaboloid)

	makeToroidalSurfaces(surfaces);

	for(var i = 0; i < surfaces.length; i++)
	{
		toysToBeArranged.push(surfaces[i])
		surfaces[i].castShadow = true;
		clickables.push(surfaces[i])

		if( surfaces[i].update === undefined)
		{
			objectsToBeUpdated.push(surfaces[i])
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

	objectsToBeUpdated.push(ladybird);
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

			objectsToBeUpdated.push(machineGunProjectiles[i])
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

		objectsToBeUpdated.push(machineGun)
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
		objectsToBeUpdated.push(warningSign)
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