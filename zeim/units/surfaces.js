'use strict';
/*
	Pevsner / ruled surrfaces / stereographic projection
		Bring back that lovely circle-enclosing-line
		Sliced torus getting two circles, what's up with that?
		Look these surfaces you've come up with are quite "nice". 
		You probably are going to do some minimal surface shit in future
		But you do want to do stereographic projection stuff and they really are suuuuuper nice in that context so FUCK IT
		Ruled surfaces probably allow for badass animations that you can do at some point
		Antoine pevsner liked them, and he was a scultor that loads of people like, so fuck it, ruled surfaces are cool
		And, you know, that nice rolly thingy on grand illusions
		This is much more of an aesthetic thing than you usually do. Probably? What's the generalization of a ruled surface...
		These things are cartesian products of circles in S3. What's the equation post-stereographic projection

	TODO
		Trouser crotches and collars are perfect because people know about ironing; there again, we won't be mentioning hyperbolics much
		lerping
		check what this was for https://arxiv.org/pdf/1307.6938.pdf

	Post mirzakhani
		Clifford torus: x2+y2 = z2+w2 = 0.5
		Bolza
			y2 = x5 - x
			x = r + i
			1 5 10 10 5 1
			r^5 + 5*r^4i + 

		Cone
		clebsch		x0^3+x1^3+x2^3+x3^3+x4^3=0, x0+x1+x2+x3+x4=0
		cross cap		4x2*(x2+y2+z2)+(y2+z2-1)
		Klein bottle?
		Helicoid
		Genus 3		((x−1)x2(x+1)+y2)2+((y−1)y2(y+1)+z2)2+0.1y2+0.05(y−1)y2(y+1)
*/

function lerpSurfacesMadeOfPatchworks(from,To,t)
{
	/*
		Take the one made of more. Lerp each individual vertex
		Of course, you can lerp them in S3 and then stereographically project
	*/
}

function initSurfaces()
{
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
		var radius = 0.45;
		surfaces.spherical = new THREE.Mesh(new THREE.EfficientSphereGeometry(0.45,4), surfaceMaterial);
		surfaces.spherical.closestPointToPoint = function(ambientPoint)
		{
			return ambientPoint.clone().setLength(radius)
		}
	}

	MakeToroidalSurfaces(surfaces);

	return surfaces;
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

	{
		verticesWide = 31;
		surfaces.genus2 = new THREE.Mesh(new THREE.Geometry(), surfaces.planar.material.clone());
		surfaces.genus2.material.vertexColors = THREE.FaceColors;
		var numArms = 3; //genus plus 1
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

		var nodeTops = [
			new THREE.Quaternion(1,0,0,0),
			new THREE.Quaternion(-1,0,0,0)
		]
		var nodeBottoms = [
			new THREE.Quaternion(0,0,0,1),
			new THREE.Quaternion(0,0,0,-1)
		]

		var centerForTicks = new THREE.Vector2(0,0);
		var armSideCenters = [];
		for( var armSideCenter = 0; armSideCenter < numArms*2; armSideCenter++ )
		{
			var positionAroundEquator = armSideCenter / (numArms*2) * TAU;
			var tickVertex = new THREE.Vector2(-1,0).rotateAround(centerForTicks, positionAroundEquator );
			armSideCenters.push( new THREE.Quaternion(0,tickVertex.x,tickVertex.y,0) );
		}
		// console.log(nodeTops,nodeBottoms,armSideCenters)

		//the fundamental thing is the handle, much easier to consider
		//You want to make it so that you can just give a set of nodes and edges in S3
		//Two nodes, two edges: torus
		//Two nodes, n edges: genus n torus
		surfaces.genus2.deriveVertexPositions = function()
		{
			for(var i = 0; i < numArms; i++ )
			{
				var nearbyArmACenter = armSideCenters[moduloWithNegatives(i*2-1,numArms*2)]
				var armSideCenterA = armSideCenters[i*2+0];
				var armSideCenterB = armSideCenters[i*2+1];
				var nearbyArmBCenter = armSideCenters[moduloWithNegatives(i*2+2,numArms*2)]

				var nodeL = 0;
				var nodeR = 1;

				//real arm
				insertS3TetrahedronSurface(
					nodeTops[0],	armSideCenterA,
					armSideCenterB,	nodeBottoms[0],
					( i * 4 + 0 ) * sq(verticesWide), verticesWide, surfaces.genus2.geometry);
				insertS3TetrahedronSurface(
					armSideCenterB,	nodeBottoms[1],
					nodeTops[1],	armSideCenterA,
					( i * 4 + 1 ) * sq(verticesWide), verticesWide, surfaces.genus2.geometry);

				// //extra arm
				insertS3TetrahedronSurface(
					armSideCenterB,	nodeBottoms[1],
					nodeTops[0],	nearbyArmBCenter,
					( i * 4 + 2 ) * sq(verticesWide), verticesWide, surfaces.genus2.geometry);

				insertS3TetrahedronSurface(
					nodeTops[1],	nearbyArmACenter,
					armSideCenterA,	nodeBottoms[0],
					( i * 4 + 3 ) * sq(verticesWide), verticesWide, surfaces.genus2.geometry);
			}

			// function insertS3TetrahedronHandle(
			// 	nearbyArmACenter,armSideCenterA, armSideCenterB,nearbyArmBCenter,
			// 	nodeLTop,nodeRTop, nodeLBottom,nodeRBottom,
			// 	handleIndex )
			// {
			// 	insertS3TetrahedronSurface(
			// 		nodeLTop,	armSideCenterA,
			// 		armSideCenterB,		nodeLBottom,
			// 		( handleIndex * 4 + 0 ) * sq(verticesWide), verticesWide, surfaces.genus2.geometry);
			// 	insertS3TetrahedronSurface(
			// 		nodeRTop,	armSideCenterA,
			// 		armSideCenterB,		nodeRBottom,
			// 		( handleIndex * 4 + 1 ) * sq(verticesWide), verticesWide, surfaces.genus2.geometry);

			// 	insertS3TetrahedronSurface(
			// 		nodeRTop,	nearbyArmACenter,
			// 		armSideCenterA,		nodeRBottom,
			// 		( handleIndex * 4 + 2 ) * sq(verticesWide), verticesWide, surfaces.genus2.geometry);

			// 	insertS3TetrahedronSurface(
			// 		nodeLTop,	nearbyArmBCenter,
			// 		armSideCenterB,		nodeLBottom,
			// 		( handleIndex * 4 + 3 ) * sq(verticesWide), verticesWide, surfaces.genus2.geometry);
			// }

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

		surfaces.genus2.update = function()
		{
			if(mouse.clicking )
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
	}

	function jonSlerp(q0,q1,t)
	{
		var theta0 = Math.acos(q0.dot(q1))
		var theta = t * theta0;
		var toSubtract = q0.clone().multiplyScalar( q0.dot(q1) );
		var q2 = q1.clone().sub( toSubtract ).normalize();

		return q0.clone().multiplyScalar(Math.cos(theta)).add( q2.clone().multiplyScalar(Math.sin(theta)) );
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
				var newPointInS3 = jonSlerp(endsOfRule[0],endsOfRule[1], j/(verticesWide-1) );
				geometry.vertices[ firstVertexIndex + i * verticesWide + j ].copy( getStereographicProjection( newPointInS3.ToVector4() ) );
			}
		}
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