
/*
	Pevsner / ruled surfaces / stereographic projection
		Bring back that lovely circle-enclosing-line
		Sliced torus getting two circles, what's up with that?
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

function makeToroidalSurfaces()
{
	var s3SurfaceMaterial = new THREE.MeshStandardMaterial({color:0x5050FF, side:THREE.DoubleSide})
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

		updateFunctions.push( function()
		{
			if( mouse.clicking && mouse.lastClickedObject === null )
			{
				mouse.rotateObjectByGesture(handleBody)
			}

			var timeScaled = frameCount * 0.01;
			projectionOriginAsQuaternion.x = Math.sin( timeScaled )
			projectionOriginAsQuaternion.w = Math.cos( timeScaled )
			updateProjectionSetup()

			handleBody.deriveVertexPositions()
		} )
		return handleBody;
	}

	let makeRotationallySymmetricHandleBody = function(numArms)
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

	let a = makeRotationallySymmetricHandleBody(5);
	scene.add(a)
}