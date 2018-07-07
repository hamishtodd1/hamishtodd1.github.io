'use strict';
/*
	Pevsner / ruled surfaces / stereographic projection
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
		The radially symmetric ones are self-dual.
			They cut S3 into two equal pieces. 
			One way to show the self duality is to make two small copies of them with nodes in slightly different places
		https://arxiv.org/pdf/1307.6938.pdf
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
		surfaces.hyperbolicParaboloid.verticesWide = 30;
		for(var i = 0; i < surfaces.hyperbolicParaboloid.verticesWide; i++)
		{
			for(var j = 0; j < surfaces.hyperbolicParaboloid.verticesWide; j++)
			{
				var newPoint = new THREE.Vector3((i-surfaces.hyperbolicParaboloid.verticesWide/2),0,(j-surfaces.hyperbolicParaboloid.verticesWide/2));
				newPoint.applyAxisAngle(yUnit,TAU/8)
				newPoint.y = (sq(newPoint.x)-sq(newPoint.z))/surfaces.hyperbolicParaboloid.verticesWide;
				newPoint.multiplyScalar(0.02)
				surfaces.hyperbolicParaboloid.geometry.vertices.push(newPoint);
			}
		}
		insertPatchworkFaces(surfaces.hyperbolicParaboloid.verticesWide, surfaces.hyperbolicParaboloid.geometry.faces, 0)
		surfaces.hyperbolicParaboloid.geometry.computeFaceNormals();
		surfaces.hyperbolicParaboloid.geometry.computeVertexNormals();

		surfaces.hyperbolicParaboloid.closestPointToPoint = function(ambientPoint)
		{
			return new THREE.Vector3(ambientPoint.x,sq(ambientPoint.x)-sq(ambientPoint.z),ambientPoint.z)
		}
	}

	{
		var radius = 0.45;
		surfaces.spherical = new THREE.Mesh(new THREE.EfficientSphereGeometry(0.3,4), surfaceMaterial);
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
	var s3SurfaceMaterial = surfaces.planar.material.clone();
	s3SurfaceMaterial.vertexColors = THREE.FaceColors;

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

	function jonSlerp(q0,q1,t)
	{
		var theta0 = Math.acos(q0.dot(q1))
		var theta = t * theta0;
		var toSubtract = q0.clone().multiplyScalar( q0.dot(q1) );
		var q2 = q1.clone().sub( toSubtract ).normalize();

		return q0.clone().multiplyScalar(Math.cos(theta)).add( q2.clone().multiplyScalar(Math.sin(theta)) );
	}

	function insertS3TetrahedronSurface(
		tl,tr,bl,br,
		firstVertexIndex, geometry)
	{
		//we go left to right, up to down
		//consider instead taking the canonical one, 16-cell/clifford torus and distorting; might make shit line up.
		
		for(var i = 0; i < geometry.verticesWide; i++)
		{
			var endsOfRule = [
				tl.clone().slerp(bl,i/(geometry.verticesWide-1)),
				tr.clone().slerp(br,i/(geometry.verticesWide-1))
			];
			for(var j = 0; j < geometry.verticesWide; j++)
			{
				var newPointInS3 = jonSlerp( endsOfRule[0], endsOfRule[1], j/(geometry.verticesWide-1) );
				geometry.vertices[ firstVertexIndex + i * geometry.verticesWide + j ].copy( getStereographicProjection( newPointInS3.ToVector4() ) );
			}
		}
	}

	function insertS3TetrahedronHandle(
		nearbyArmASideCenter,nearbyArmBSideCenter,
		armSideCenterA,armSideCenterB,
		nodeLTop,nodeLBot,
		nodeRTop,nodeRBot,
		lowestVertexIndex, geometry )
	{
		//real arm
		insertS3TetrahedronSurface(
			nodeLTop,		armSideCenterA,
			armSideCenterB,	nodeLBot,
			lowestVertexIndex + 0 * sq(geometry.verticesWide), geometry);
		insertS3TetrahedronSurface(
			nodeRTop,		armSideCenterA,
			armSideCenterB,	nodeRBot,
			lowestVertexIndex + 1 * sq(geometry.verticesWide), geometry);

		//extra arm
		insertS3TetrahedronSurface(
			nodeLTop,		nearbyArmBSideCenter,
			armSideCenterB,	nodeRBot,
			lowestVertexIndex + 2 * sq(geometry.verticesWide), geometry);

		insertS3TetrahedronSurface(
			nodeRTop,		nearbyArmASideCenter,
			armSideCenterA,	nodeLBot,
			lowestVertexIndex + 3 * sq(geometry.verticesWide), geometry);
	}

	function makeHandleBody(arms)
	{
		var newSurface = new THREE.Mesh(new THREE.Geometry(), s3SurfaceMaterial );
		newSurface.geometry.verticesWide = 60;
		newSurface.geometry.vertices.length = sq(newSurface.geometry.verticesWide) * 4 * arms.length;
		for(var k = 0; k < arms.length * 4; k++)
		{
			var firstVertexIndex = sq(newSurface.geometry.verticesWide) * k;
			for(var i = 0; i < newSurface.geometry.verticesWide; i++)
			{
				for(var j = 0; j < newSurface.geometry.verticesWide; j++)
				{
					newSurface.geometry.vertices[ firstVertexIndex + i * newSurface.geometry.verticesWide + j ] = new THREE.Vector3();
				}
			}
			insertPatchworkFaces(newSurface.geometry.verticesWide, newSurface.geometry.faces, firstVertexIndex, true);
		}

		newSurface.deriveVertexPositions = function()
		{
			for(var i = 0; i < arms.length; i++ )
			{
				insertS3TetrahedronHandle(
					arms[i].nearbyArmASideCenter,arms[i].nearbyArmBSideCenter,
					arms[i].armSideCenterA,arms[i].armSideCenterB,
					arms[i].nodeLTop,arms[i].nodeLBot,
					arms[i].nodeRTop,arms[i].nodeRBot,
					i * 4 * sq(newSurface.geometry.verticesWide), this.geometry);
			}

			newSurface.geometry.vertices.forEach(function(vertex)
			{
				vertex.multiplyScalar(0.3)
			});

			newSurface.geometry.computeFaceNormals();
			newSurface.geometry.computeVertexNormals();
			newSurface.geometry.verticesNeedUpdate = true;
			newSurface.geometry.normalsNeedUpdate = true;	
		}
		newSurface.deriveVertexPositions()

		// newSurface.update = function()
		// {
		// 	if(mouse.clicking && mouse.lastClickedObject === null)
		// 	{
		// 		var rotationAmount = mouse.ray.direction.angleTo(mouse.previousRay.direction) * 12
		// 		var rotationAxis = mouse.ray.direction.clone().cross(mouse.previousRay.direction);
		// 		rotationAxis.applyQuaternion(this.quaternion.clone().inverse()).normalize();
		// 		this.quaternion.multiply(new THREE.Quaternion().setFromAxisAngle(rotationAxis, rotationAmount))


		// 	}

		// 	var timeScaled = frameCount / 1000;
		// 	projectionOriginAsQuaternion.x = Math.sin( timeScaled )
		// 	projectionOriginAsQuaternion.w = Math.cos( timeScaled )
		// 	updateProjectionSetup()

		// 	newSurface.deriveVertexPositions()
		// }
		newSurface.geometry.applyMatrix(new THREE.Matrix4().makeScale(0.6,0.6,0.6))
		return newSurface;
	}

	{
		var numArms = 3;

		var centerForTicks = new THREE.Vector2(0,0);
		var armSideCenters = [];
		for( var armSideCenter = 0; armSideCenter < numArms*2; armSideCenter++ )
		{
			var positionAroundEquator = armSideCenter / (numArms*2) * TAU;
			var tickVertex = new THREE.Vector2(-1,0).rotateAround(centerForTicks, positionAroundEquator );
			armSideCenters.push( new THREE.Quaternion(0,tickVertex.x,tickVertex.y,0) );
		}

		var arms = [];
		for(var i = 0; i < numArms; i++)
		{
			arms[i] = {
				nodeLTop:		new THREE.Quaternion(1,0,0,0),
				nodeLBot:	new THREE.Quaternion(0,0,0,1),
				nodeRTop:		new THREE.Quaternion(-1,0,0,0),
				nodeRBot:	new THREE.Quaternion(0,0,0,-1),

				nearbyArmASideCenter: 	armSideCenters[moduloWithNegatives(i*2-1,numArms*2)],
				armSideCenterA: 		armSideCenters[i*2+0],
				armSideCenterB: 		armSideCenters[i*2+1],
				nearbyArmBSideCenter: 	armSideCenters[moduloWithNegatives(i*2+2,numArms*2)],
			}
		}

		surfaces["genus"+(numArms-1).toString()] = makeHandleBody(arms);
	}

	{
		// var armSideCenters = [];
		
		// var nodes = [
		// 	new THREE.Quaternion( 1,  1, 1, 0),
		// 	new THREE.Quaternion(-1, -1, 1, 0),
		// 	new THREE.Quaternion(1, -1, -1, 0),
		// 	new THREE.Quaternion(-1, 1, -1, 0),
		// ]
		// nodes.forEach(function(node){node.normalize()})

		// var wUnit = new THREE.Quaternion(0,0,0,1)

		// //the arm centers are just plus or minus 1 for x,y,z, octahedron vertices
		// //slerp in the direction of 
		// //eh this'd be easy with a picture
		// //probably you do not want it dependent on node thickness

		// var armCenters = Array(6)
		// var edgeIndices = [[0,1],[0,2],[0,3],[1,2],[1,3],[2,3]]
		// for(var i = 0; i < armCenters.length; i++)
		// {
		// 	armCenters[i] = nodes[edgeIndices[i][0]];
		// 	armCenters[i].slerp( nodes[edgeIndices[i][1]], 0.5 );
		// 	console.assert( Math.abs(armCenters[i].w) < 0.00001 )
		// }
		// var armSideCenters = Array(6);
		// for(var i = 0; i < armSideCenters.length; i++)
		// {
		// 	armSideCenters[i] = [
		// 		armCenters[i].clone()
		// 	]
		// }

		// for(var i = 0; i < 1; i++)
		// {
		// 	arms[i] = {
		// 		nodeLTop:	nodes[0].clone(),
		// 		nodeLBot:	nodes[0].clone(),
		// 		nodeRTop:	nodes[1].clone(),
		// 		nodeRBot:	nodes[1].clone(),
		// 	}

		// 	//w is topward
		// 	//these will still be on the surface of an S2
		// 	arms[i].nodeLTop.slerp(wUnit,0.1)
		// 	arms[i].nodeLBot.slerp(wUnit,-0.1)
		// 	arms[i].nodeRTop.slerp(wUnit,0.1)
		// 	arms[i].nodeRBot.slerp(wUnit,-0.1)

		// 	var 

		// 	arms[i].armSideCenters[nodes[0].clone().slerp(nodes[1])],
		// 	arms[i].armSideCenters[i*2+0],
		// 	arms[i].armSideCenters[i*2+1],
		// 	arms[i].armSideCenters[moduloWithNegatives(i*2+2,numArms*2)],
		// }

		// surfaces.experimental = makeHandleBody(arms);
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