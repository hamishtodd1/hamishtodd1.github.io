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
		It is weird enough just to go inside a surface, it does not look how you expect
*/

function lerpSurfacesMadeOfPatchworks(from,To,t)
{
	/*
		Take the one made of more. Lerp each individual vertex
		Of course, you can lerp them in S3 and then stereographically project
	*/
}

function makeToroidalSurfaces(surfaces)
{
	var s3SurfaceMaterial = surfaces[0].material.clone();
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
		var handleBody = new THREE.Mesh(new THREE.Geometry(), s3SurfaceMaterial );
		handleBody.geometry.verticesWide = 22;
		handleBody.geometry.vertices.length = sq(handleBody.geometry.verticesWide) * 4 * arms.length;
		for(var k = 0; k < arms.length * 4; k++)
		{
			var firstVertexIndex = sq(handleBody.geometry.verticesWide) * k;
			for(var i = 0; i < handleBody.geometry.verticesWide; i++)
			{
				for(var j = 0; j < handleBody.geometry.verticesWide; j++)
				{
					handleBody.geometry.vertices[ firstVertexIndex + i * handleBody.geometry.verticesWide + j ] = new THREE.Vector3();
				}
			}
			insertPatchworkFaces(handleBody.geometry.verticesWide, handleBody.geometry.faces, firstVertexIndex, true);
		}

		handleBody.deriveVertexPositions = function()
		{
			for(var i = 0; i < arms.length; i++ )
			{
				insertS3TetrahedronHandle(
					arms[i].nearbyArmASideCenter,arms[i].nearbyArmBSideCenter,
					arms[i].armSideCenterA,arms[i].armSideCenterB,
					arms[i].nodeLTop,arms[i].nodeLBot,
					arms[i].nodeRTop,arms[i].nodeRBot,
					i * 4 * sq(handleBody.geometry.verticesWide), this.geometry);
			}

			handleBody.geometry.vertices.forEach(function(vertex)
			{
				vertex.multiplyScalar(0.18)
			});

			handleBody.geometry.computeFaceNormals();
			handleBody.geometry.computeVertexNormals();
			handleBody.geometry.verticesNeedUpdate = true;
			handleBody.geometry.normalsNeedUpdate = true;	
		}
		handleBody.deriveVertexPositions()

		objectsToBeUpdated.push(handleBody)
		handleBody.update = function()
		{
			if( mouse.clicking && mouse.lastClickedObject === null )
			{
				mouse.rotateObjectByGesture(this)
			}

			// var timeScaled = frameCount * 0.001;
			// projectionOriginAsQuaternion.x = Math.sin( timeScaled )
			// projectionOriginAsQuaternion.w = Math.cos( timeScaled )
			// updateProjectionSetup()

			// handleBody.deriveVertexPositions()
		}
		return handleBody;
	}

	function makeRotationallySymmetricHandleBody(numArms)
	{
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
				nodeLTop:	new THREE.Quaternion(1,0,0,0),
				nodeLBot:	new THREE.Quaternion(0,0,0,1),
				nodeRTop:	new THREE.Quaternion(-1,0,0,0),
				nodeRBot:	new THREE.Quaternion(0,0,0,-1),

				nearbyArmASideCenter: 	armSideCenters[moduloWithNegatives(i*2-1,numArms*2)],
				armSideCenterA: 		armSideCenters[i*2+0],
				armSideCenterB: 		armSideCenters[i*2+1],
				nearbyArmBSideCenter: 	armSideCenters[moduloWithNegatives(i*2+2,numArms*2)],
			}
		}
		return makeHandleBody(arms)
	}
	surfaces.push( makeRotationallySymmetricHandleBody(3))
	surfaces.push( makeRotationallySymmetricHandleBody(7))
	surfaces.push( makeRotationallySymmetricHandleBody(2))

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

	if(startingIndex === undefined)
	{
		startingIndex = 0
	}

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