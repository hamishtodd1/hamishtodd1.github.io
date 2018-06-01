/*
	Maybe it should be an ant. Could compare to the escher picture

	maybe you just want to get the longest geodesic possible?
	Maybe your projectile has a radius and it shouldn't get too close in a parallel-ish way

	In script: in reality, our universe is weirdly curved and has a huge number of dimensions.
	The path that particles take through it are always geodesics, so studies of this are very important for physics
	Finding paths for paint on robots spraying car parts - so the Tesla Model 3 plant might do well to take account of this
	Also useful in geometric optics? "illumination problem"

	direction should be gotten by intersecting mouse ray with tangent plane
	should have a "machine gun" shooting in direction of mouse diff
	Intersecting with surface

	Facebook version

	surfaces (function = 0)
		plane
		sphere			x2+y2+z2 - 1
		Trousers
		Torus			(x2+y2+z2+R2−r2)2−4R2(x2+y2)		easy parameterization
		Cylinder		x2+y2-1
		Dini Surface	http://web1.kcn.jp/hp28ah77/us20_pseu.htm https://mathoverflow.net/questions/149842/geodesics-on-the-twisted-pseudosphere-dinis-surface
		Pseudosphere	nonHypotenuseyBit = Math.sqrt(sq(radius)-sq(x)) - choose lots of x's
						y = radius * Math.log((radius+nonHypotenuseyBit)/x) - nonHypotenuseyBit
		Something made of a bunch of pseudospheres?
		https://arxiv.org/pdf/1307.6938.pdf
		hyperbolic paraboloid z = sq(x)-sq(y)
		Hyperboloid

		Five pentagon thing. Glue four edges together and you get a dodecagon
		Hmm so apparently two pentagons parameterize a pair of pants?

	Can nicely morph between these because it's just lerping a few coefficients
*/

function initHyperbolic()
{
	var rotator = new THREE.Mesh(new THREE.CircleGeometry(0.1), new THREE.MeshBasicMaterial({color:0x0F0F0F}));
	scene.add(rotator)
	rotator.position.z = -10
	// rotator.rotation.x = TAU / 8
	rotator.position.y = -1

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
			function resetTrail()
			{
				for(var i = 0, il = trail.geometry.vertices.length; i < il; i++)
				{
					trail.geometry.vertices[i].copy(ball.position);
				}
			}

			var positionRayCaster = new THREE.Raycaster()
			var faceThatBallIsOn = null;
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

	var surfaceMaterial = new THREE.MeshStandardMaterial({color:0x5050FF, side:THREE.DoubleSide});
	var surfaces = {};

	{
		surfaces.planar = new THREE.Mesh(new THREE.PlaneGeometry(0.9,0.9), surfaceMaterial )
		surfaces.planar.closestPointToPoint = function(ambientPoint)
		{
			return ambientPoint.clone().setComponent(2,0)
		}
	}

	{
		surfaces.hyperbolicParaboloid = new THREE.Mesh(new THREE.Geometry(), surfaceMaterial);
		var verticesWide = 30;
		for(var i = 0; i < verticesWide; i++)
		{
			for(var j = 0; j < verticesWide; j++)
			{
				var newPoint = new THREE.Vector3((i-verticesWide/2),0,(j-verticesWide/2));
				newPoint.applyAxisAngle(yUnit,TAU/8)
				newPoint.y = (sq(newPoint.x)-sq(newPoint.z))/verticesWide;
				newPoint.multiplyScalar(0.02)
				surfaces.hyperbolicParaboloid.geometry.vertices.push(newPoint);
			}
		}
		insertPatchworkFaces(verticesWide, surfaces.hyperbolicParaboloid.geometry.faces, 0)
		surfaces.hyperbolicParaboloid.geometry.computeFaceNormals();
		surfaces.hyperbolicParaboloid.geometry.computeVertexNormals();

		surfaces.hyperbolicParaboloid.closestPointToPoint = function(ambientPoint)
		{
			return new THREE.Vector3(ambientPoint.x,sq(ambientPoint.x)-sq(ambientPoint.z),ambientPoint.z)
		}
	}

	{
		surfaces.dini = new THREE.Mesh(new THREE.Geometry(), surfaceMaterial);
		surfaces.dini.radius = 0.2;
		var numTurns = 3;
		var totalHelixHeight = 0.1;
		var turnHeight = totalHelixHeight / numTurns;
		var diniVerticesWide = numTurns * 40;
		for(var i = 0; i < diniVerticesWide; i++)
		{
			var u = (i / diniVerticesWide) * TAU * numTurns; //The thing does not "close up" completely for numTurns = 0, the cause is in here
			for(var j = 0; j < diniVerticesWide; j++)
			{
				var v = (j / diniVerticesWide) * TAU/2; //increase if you want the "other end" of the pseudosphere
				var logTanHalfV = v === 0 ? -1000000 : Math.log( Math.tan(v/2) );
				surfaces.dini.geometry.vertices.push(
					new THREE.Vector3(
						surfaces.dini.radius * Math.cos(u) * Math.sin(v),
						surfaces.dini.radius * Math.sin(u) * Math.sin(v),
						surfaces.dini.radius *(Math.cos(v) + logTanHalfV ) + turnHeight * u
					)
				);
			}
		}
		insertPatchworkFaces(diniVerticesWide, surfaces.dini.geometry.faces, 0)
		surfaces.dini.geometry.computeFaceNormals();
		surfaces.dini.geometry.computeVertexNormals();
		surfaces.dini.rotation.x = -TAU/4;
		// surfaces.dini.geometry = new THREE.EfficientSphereGeometry(0.45,2)
	}

	MakeToroidalSurfaces(surfaces);
	// surfaces.genus2.geometry = new THREE.EfficientSphereGeometry(0.45,2)

	{
		var radius = 0.45;
		surfaces.spherical = new THREE.Mesh(new THREE.EfficientSphereGeometry(0.45,2), surfaceMaterial);
		surfaces.spherical.closestPointToPoint = function(ambientPoint)
		{
			return ambientPoint.clone().setLength(radius)
		}
	}

	var chosenSurface = surfaces.dini;
	chosenSurface.update = function()
	{
		if(mouse.clicking && mouse.lastClickedObject === null)
		{
			var rotationAmount = mouse.ray.direction.angleTo(mouse.previousRay.direction) * 12
			var rotationAxis = mouse.ray.direction.clone().cross(mouse.previousRay.direction);
			rotationAxis.applyQuaternion(this.quaternion.clone().inverse()).normalize();
			this.quaternion.multiply(new THREE.Quaternion().setFromAxisAngle(rotationAxis, rotationAmount))
		}

		// var timeScaled = frameCount / 100;
		// projectionOriginAsQuaternion.x = Math.sin( timeScaled )
		// projectionOriginAsQuaternion.w = Math.cos( timeScaled )
		// updateProjectionSetup()

		// surfaces.genus2.deriveVertexPositions()
	}
	markedThingsToBeUpdated.push( chosenSurface )
	scene.add(chosenSurface)
	clickables.push(chosenSurface)
	chosenSurface.position.z = -10;
	chosenSurface.add(ball, trail);
}

function MakeToroidalSurfaces(surfaces)
{
	var verticesWide = 30;

	var projectionOriginAsQuaternion = new THREE.Quaternion(1,0,0,0);
	projectionOriginAsQuaternion.slerp(new THREE.Quaternion(0,0,0,1),0.4999999)
	var projectionOrigin = new THREE.Vector4()
	var projectedHyperplaneBasis = [
		new THREE.Vector4(),
		new THREE.Vector4(),
		new THREE.Vector4()
	];
	
	function updateProjectionSetup()
	{
		var basicQuaternions = [
			new THREE.Quaternion().setFromAxisAngle(xUnit,Math.PI),
			new THREE.Quaternion().setFromAxisAngle(yUnit,Math.PI),
			new THREE.Quaternion().setFromAxisAngle(zUnit,Math.PI)
		]

		projectionOrigin.copy(projectionOriginAsQuaternion.ToVector4())
		for(var i = 0; i < 3; i++)
		{
			projectedHyperplaneBasis[i].fromQuaternion(projectionOriginAsQuaternion.clone().multiply(basicQuaternions[i]))
		}
	}
	updateProjectionSetup()

	function getStereographicProjection(vector)
	{
		if(vector.x===projectionOrigin.x)
		{
			return new THREE.Vector3(9999,9999,9999)
			//formerly infinity, but that appears to break raycaster
		}
		var rayDirection = vector.clone().sub( projectionOrigin );
		var multiplier = 1 / rayDirection.dot( projectionOrigin );
		var stereographicProjectionInFourSpace = rayDirection.multiplyScalar(multiplier);
		stereographicProjectionInFourSpace.sub( projectionOrigin );
		
		var stereographicProjection = new THREE.Vector3(
			stereographicProjectionInFourSpace.dot(projectedHyperplaneBasis[0]),
			stereographicProjectionInFourSpace.dot(projectedHyperplaneBasis[1]),
			stereographicProjectionInFourSpace.dot(projectedHyperplaneBasis[2]) );
		return stereographicProjection;
	}
	function insertS3TetrahedronSurface(
		tl,tr,bl,br, //quaternions
		firstVertexIndex, verticesWide, geometry)
	{
		//we go left to right, up to down
		//consider instead taking the canonical one, 16-cell/clifford torus and distorting; might make shit line up.
		for(var i = 0; i < verticesWide; i++)
		{
			var endsOfRule = [
				tl.clone().slerp(bl,i/(verticesWide-1)),
				tr.clone().slerp(br,i/(verticesWide-1))
			];
			for(var j = 0; j < verticesWide; j++)
			{
				var newPointInS3 = endsOfRule[0].clone().slerp(endsOfRule[1],j/(verticesWide-1));
				geometry.vertices[ firstVertexIndex + i * verticesWide + j ].copy( getStereographicProjection(newPointInS3.ToVector4()) );
			}
		}
	}

	{
		verticesWide = 31;
		surfaces.genus2 = new THREE.Mesh(new THREE.Geometry(), new THREE.MeshStandardMaterial({vertexColors:THREE.FaceColors}));
		surfaces.genus2.rotation.z = -TAU/4
		var numArms = 5; //genus plus 1
		var numFacesPerSquarePatchwork = sq(verticesWide-1)*2;

		surfaces.genus2.geometry.vertices.length = sq(verticesWide) * 4 * numArms;
		for(var k = 0; k < numArms * 4; k++)
		{
			var firstVertexIndex = sq(verticesWide) * k;
			for(var i = 0; i < verticesWide; i++)
			{
				for(var j = 0; j < verticesWide; j++)
				{
					surfaces.genus2.geometry.vertices[ firstVertexIndex + i * verticesWide + j ] = new THREE.Vector3();
				}
			}
			insertPatchworkFaces(verticesWide, surfaces.genus2.geometry.faces, firstVertexIndex, true);
		}

		var quaternionVertices = {
			top: new THREE.Quaternion(1,0,0,0), bottom: new THREE.Quaternion(-1,0,0,0),
			in: new THREE.Quaternion(0,0,0,1), out: new THREE.Quaternion(0,0,0,-1),
		};

		//the fundamental thing is the handle, much easier to consider
		surfaces.genus2.deriveVertexPositions = function()
		{
			for(var i = 0; i < numArms; i++ )
			{
				var center = new THREE.Vector2(0,0);
				var tickVertices =
				[
					new THREE.Vector2(-1,0).rotateAround(center,  -i  / numArms * TAU),
					new THREE.Vector2(-1,0).rotateAround(center,-(i+0.5)/ numArms * TAU),
					new THREE.Vector2(-1,0).rotateAround(center,-(i+1)/ numArms * TAU)
				];
				var tickQuaternions = 
				[
					new THREE.Quaternion(0,tickVertices[0].x,tickVertices[0].y,0),
					new THREE.Quaternion(0,tickVertices[1].x,tickVertices[1].y,0),
					new THREE.Quaternion(0,tickVertices[2].x,tickVertices[2].y,0)
				]

				insertS3TetrahedronSurface(
					tickQuaternions[1],			quaternionVertices.in,
					quaternionVertices.top,		tickQuaternions[2],
					( i * 4 + 0 ) * sq(verticesWide), verticesWide,surfaces.genus2.geometry);
				insertS3TetrahedronSurface(
					tickQuaternions[1], quaternionVertices.out,
					quaternionVertices.bottom,tickQuaternions[2],
					( i * 4 + 1 ) * sq(verticesWide), verticesWide,surfaces.genus2.geometry);
				insertS3TetrahedronSurface(
					quaternionVertices.bottom,	tickQuaternions[0],
					tickQuaternions[1], 		quaternionVertices.in,
					( i * 4 + 2 ) * sq(verticesWide), verticesWide,surfaces.genus2.geometry);
				insertS3TetrahedronSurface(
					quaternionVertices.top, 	tickQuaternions[0],
					tickQuaternions[1], 		quaternionVertices.out,
					( i * 4 + 3 ) * sq(verticesWide), verticesWide,surfaces.genus2.geometry);
			}

			surfaces.genus2.geometry.vertices.forEach(function(vertex)
			{
				vertex.multiplyScalar(0.3)
			});

			surfaces.genus2.geometry.computeFaceNormals();
			surfaces.genus2.geometry.computeVertexNormals();
			surfaces.genus2.geometry.verticesNeedUpdate = true;
			surfaces.genus2.geometry.normalsNeedUpdate = true;	
		}
		surfaces.genus2.deriveVertexPositions()
	}
}

function insertPatchworkFaces(verticesWide, facesArray, startingIndex, colorFaces)
{
	var colors = [new THREE.Color(0,0,0),new THREE.Color(1,1,1)];

	for(var i = 1; i < verticesWide; i++)
	{
		for(var j = 1; j < verticesWide; j++)
		{
			var tl = (i-1)*verticesWide + (j-1) + startingIndex;
			var tr = (i-1)*verticesWide + j + startingIndex;
			var bl = i*verticesWide + (j-1) + startingIndex;
			var br = i*verticesWide + j + startingIndex;

			if( colorFaces === undefined )
			{
				facesArray.push(new THREE.Face3(tl,tr,bl))
				facesArray.push(new THREE.Face3(bl,tr,br))	
			}
			else
			{
				if( !(i%2) ) //row!
				{
					if(!(j%2))
					{
						facesArray.push(new THREE.Face3(tl,tr,bl, new THREE.Vector3(), colors[0]))
						facesArray.push(new THREE.Face3(bl,tr,br, new THREE.Vector3(), colors[1]))
					}
					else
					{
						facesArray.push(new THREE.Face3(tl,tr,br, new THREE.Vector3(), colors[0]))
						facesArray.push(new THREE.Face3(bl,tl,br, new THREE.Vector3(), colors[1]))
					}
				}
				else
				{
					if(!(j%2))
					{
						facesArray.push(new THREE.Face3(tl,tr,br, new THREE.Vector3(), colors[1]))
						facesArray.push(new THREE.Face3(bl,tl,br, new THREE.Vector3(), colors[0]))
					}
					else
					{
						facesArray.push(new THREE.Face3(tl,tr,bl, new THREE.Vector3(), colors[1]))
						facesArray.push(new THREE.Face3(bl,tr,br, new THREE.Vector3(), colors[0]))
					}
				}
			}
		}
	}
}