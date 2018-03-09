/*
	TODO
	just points on the hexamers, that's fine
	extremely easy to generate them based on a single basis vector
	forget about the hexagon cutting shit

	once you click, you're holding that point.
	The edge is frozen along the line it is now along
	when you drag a vertex, it is AS IF you were on the lattice.
	The other vertex is the guide

	urgh, need to re assess rotation anyway, it's getting the wrong one or something
		No it's ok, it's focussed on the triangle, you need to change that

	Round off errors are a bitch, but oh well

	7 viruses you never thought could be so beautiful!
*/

function getDiscrepancy(coords)
{
	var total = 0;
	for(var edge = 0; edge < 30; edge++)
	{
		var vertexIndexA = edgeIndices[edge][0];
		var vertexIndexB = edgeIndices[edge][1];

		var displacementX = coords[vertexIndexA*3+0] - coords[vertexIndexB*3+0];
		var displacementY = coords[vertexIndexA*3+1] - coords[vertexIndexB*3+1];
		var displacementZ = coords[vertexIndexA*3+2] - coords[vertexIndexB*3+2];
		total += sq( Math.sqrt(
			sq( displacementX ) +
			sq( displacementY ) +
			sq( displacementZ ) ) - l[edge] );
	}
	
	return total;
}
//can try and do without this...
function discrepancyGradient(coords)
{
	var derivatives = Array(36);

	for(var edge = 0; edge < 30; edge++)
	{
		var vertexIndexA = edgeIndices[edge][0];
		var vertexIndexB = edgeIndices[edge][1];

		var displacementX = coords[vertexIndexA*3+0] - coords[vertexIndexB*3+0];
		var displacementY = coords[vertexIndexA*3+1] - coords[vertexIndexB*3+1];
		var displacementZ = coords[vertexIndexA*3+2] - coords[vertexIndexB*3+2];
		var currentEdgeLen = Math.sqrt(
			sq( displacementX ) +
			sq( displacementY ) +
			sq( displacementZ ) );

		var leftFactor = 2 * (currentEdgeLen - l[edge]) / currentEdgeLen;

		derivatives[vertexIndexA*3+0] += leftFactor * displacementX;
		derivatives[vertexIndexA*3+1] += leftFactor * displacementY;
		derivatives[vertexIndexA*3+2] += leftFactor * displacementZ;

		derivatives[vertexIndexB*3+0] -= leftFactor * displacementX;
		derivatives[vertexIndexB*3+1] -= leftFactor * displacementY;
		derivatives[vertexIndexB*3+2] -= leftFactor * displacementZ;
	}
	
	return total;
}

function correctPositions(l)
{
	var coords = Array(12*3);//Float32Array
	for(var i = 0; i < ico.vertices.length; i++)
	{
		coords[i*3+0] = ico.vertices[i].x;
		coords[i*3+1] = ico.vertices[i].y;
		coords[i*3+2] = ico.vertices[i].z;
	}

	var maxIterations = 20;
	var maxDiscrepancy = 0.001; //or something about the lengths?
	var newCoords = numeric.uncmin(
		getDiscrepancy, coords,maxDiscrepancy,
		discrepancyGradient,maxIterations ).solution;

	for(var i = 0; i < ico.vertices.length; i++)
	{
		ico.vertices[i].x = newCoords[i*3+0];
		ico.vertices[i].y = newCoords[i*3+1];
		ico.vertices[i].z = newCoords[i*3+2];
	}
}

function initLatticeMapper(ico)
{
	//true then false
	console.log(circleTriangleIntersection(
		0,0,1,
		0,0,
		0,0.5,
		0.5,0))

	console.log(circleTriangleIntersection(
		0,0,1,
		2,0,
		2,0.5,
		2.5,0))


	//for each triangle we want to draw the lattice on it
	//for that we need its vertex positions in 3D
	//we try to make the ico fit these triangles by we may fail

	var HS3 = Math.sqrt(3)/2

	var net = new THREE.Mesh(new THREE.Geometry(), new THREE.MeshBasicMaterial({color:0xFF0000, side:THREE.DoubleSide}));
	net.scale.setScalar(0.1)
	net.position.set(0.3,0,-1)

	scene.add( net );
	
	net.geometry.vertices.push(
		new THREE.Vector3(0,0,0),
		new THREE.Vector3(HS3,-0.5,0),
		
		new THREE.Vector3(HS3, 0.5, 0),
		new THREE.Vector3(2*HS3, 0,0),
		new THREE.Vector3(2*HS3,1,0),
		new THREE.Vector3(3*HS3,0.5,0),
		
		new THREE.Vector3(0,1,0),
		new THREE.Vector3(HS3,1.5,0),
		new THREE.Vector3(0,2,0),
		new THREE.Vector3(HS3,2.5,0),
		
		new THREE.Vector3(-HS3,0.5,0),
		new THREE.Vector3(-HS3,1.5,0),
		new THREE.Vector3(-2*HS3,1,0),
		new THREE.Vector3(-2*HS3,2,0),
		
		new THREE.Vector3(-HS3,-0.5,0),
		new THREE.Vector3(-2*HS3,0,0),
		new THREE.Vector3(-2*HS3,-1,0),
		new THREE.Vector3(-3*HS3,-0.5,0),
		
		new THREE.Vector3(0,-1,0),
		new THREE.Vector3(-HS3,-1.5,0),
		new THREE.Vector3(0,-2,0),
		new THREE.Vector3(-HS3,-2.5,0) );

	var derivations = new Array(
		[null,null,null],
		[null,null,null],
		[0,1,null],
		
		[2,1,0],
		[2,3,1],
		[4,3,2],
		
		[0,2,1],
		[6,2,0],
		[6,7,2],
		[8,7,6],
		
		[0,6,2],
		[10,6,0],
		[10,11,6],
		[12,11,10],
		
		[0,10,6],
		[14,10,0],
		[14,15,10],
		[16,15,14],
		
		[0,14,10],
		[18,14,0],
		[18,19,14],
		[20,19,18]);

	var equivalencies = [
		0,10,
		8,1,6,3,
		4,6,9,3,
		2,9,11,3,
		5,11,7,3,
		10,7,1,3];

	// for(var i = 2; i < derivations.length; i++)
	// {
	// 	net.geometry.vertices.push(new THREE.Vector3())
	// }

	net.geometry.faces.push(
		new THREE.Face3(2,1,0),
		new THREE.Face3(1,2,3),
		new THREE.Face3(4,3,2),
		new THREE.Face3(3,4,5),
		
		new THREE.Face3(6,2,0),
		new THREE.Face3(2,6,7),
		new THREE.Face3(8,7,6),
		new THREE.Face3(7,8,9),
		
		new THREE.Face3(10, 6, 0),
		new THREE.Face3(6, 10,11),
		new THREE.Face3(12,11,10),
		new THREE.Face3(11,12,13),
		
		new THREE.Face3(14,10, 0),
		new THREE.Face3(10,14,15),
		new THREE.Face3(16,15,14),
		new THREE.Face3(15,16,17),
		
		new THREE.Face3(18,14, 0),
		new THREE.Face3(14,18,19),
		new THREE.Face3(20,19,18),
		new THREE.Face3(19,20,21) );

	// markedThingsToBeUpdated.push(net)
	net.update = function()
	{
		for( var i = 2; i < derivations.length; i++)
		{
			//This is about mapping - the flat approximates the wrapped
			//when you're moving, it's done in the flat
			// you have fewer vertices than this

			var aR = ico.geometry.vertices[ equivalencies[i]].distanceTo(
					 ico.geometry.vertices[ equivalencies[derivations[i][0]] ] );
			var a =  net.geometry.vertices[ derivations[i][0] ];
			var bR = ico.geometry.vertices[ equivalencies[i]].distanceTo(
					 ico.geometry.vertices[ equivalencies[derivations[i][1] ] ] );
			var b =  net.geometry.vertices[ derivations[i][1] ];

			var proposedPosition = counterClockwiseTrianglePoint(
				a,aR,b,bR);
			console.log(i,proposedPosition,net.geometry.vertices[i])
			// net.geometry.vertices[i].copy( );
		}
	}
	net.update()

	var mappingSpheres = Array(5000);
	var msGeometry = new THREE.EfficientSphereBufferGeometry(0.03);
	var msMaterial = new THREE.MeshPhongMaterial({color:0x000000})
	for(var i = 0; i < mappingSpheres.length; i++)
	{
		mappingSpheres[i] = new THREE.Mesh(msGeometry, msMaterial);
		mappingSpheres[i].position.set(i*0.5,0,0)
		net.add(mappingSpheres[i]);

		// circleTriangleIntersection(
		// 	centreX,centreY,radius,
		// 	v1x,v1y,v2x,v2y,v3x,v3y)
	}
	/*
		make a fuckload of spheres
	*/
}

//vector3s where we ignore z
//https://math.stackexchange.com/a/1367732/352304
function counterClockwiseTrianglePoint(p1,r1,p2,r2)
{
	var R2 = p2.distanceToSquared(p1);
	if(R2>r1+r2)
	{
		console.error("impossible")
	}

	var halfComponent = p1.clone()
	halfComponent.lerp(p2,0.5);

	var simpleComponent = p2.clone().sub(p1);
	simpleComponent.multiplyScalar((sq(r1)-sq(r2))/(2*R2));

	var complexComponent = new THREE.Vector3(p2.y-p1.y,p1.x-p2.x,0);
	var left = 2 * ( sq(r1)+sq(r2) ) / R2;
	var right = sq(sq(r1)-sq(r2)) / sq(R2);
	complexComponent.multiplyScalar(0.5 * Math.sqrt(left-right-1) )

	return complexComponent.add(simpleComponent).add(halfComponent)
}

function initIrreg()
{
	var PHI = (1+Math.sqrt(5))/2

	var ico = new THREE.Mesh(new THREE.Geometry(), new THREE.MeshPhongMaterial(
		{
			vertexColors:THREE.FaceColors, 
			side:THREE.DoubleSide
		}));
	ico.scale.setScalar(0.1)
	ico.position.z = -1
	scene.add( ico );
	
	var fundamentalIcoVertices = [new THREE.Vector3(1,0,PHI),new THREE.Vector3(0,PHI,1),new THREE.Vector3(PHI,1,0)];
	for(var i = 0; i < 3; i++)
		fundamentalIcoVertices[i].setLength(Math.sqrt(PHI*Math.sqrt(5))/2);
	var coords = ["x","y","z"]
	for(var i = 0; i < 3; i++)
	{
		ico.geometry.vertices.push(fundamentalIcoVertices[i]);
		
		for(var j = 0; j < 3; j++)
		{
			if( ico.geometry.vertices[ ico.geometry.vertices.length-1 ][ coords[j] ] === 0 )
			{
				ico.geometry.vertices.push(fundamentalIcoVertices[i].clone());
				ico.geometry.vertices[ico.geometry.vertices.length-1][ coords[(j+1)%3] ] *= -1;
				
				ico.geometry.vertices.push(fundamentalIcoVertices[i].clone());
				ico.geometry.vertices[ ico.geometry.vertices.length-1 ][ coords[(j+2)%3] ] *= -1;
				
				ico.geometry.vertices.push(fundamentalIcoVertices[i].clone());
				ico.geometry.vertices[ ico.geometry.vertices.length-1 ].negate();
			}
		}
	}
	var triangleColor = new THREE.Color(1,0,0)
	for(var i = 0, il = ico.geometry.vertices.length; i < il; i++)
	{
		for(var j = i+1; j < il; j++)
		{
			if(ico.geometry.vertices[i].distanceTo(ico.geometry.vertices[j]) - 1 < 0.0001)
			{
				for(var k = j+1; k < il;k++)
				{
					if(ico.geometry.vertices[k].distanceTo(ico.geometry.vertices[i]) - 1 < 0.0001
					&& ico.geometry.vertices[k].distanceTo(ico.geometry.vertices[j]) - 1 < 0.0001 )
					{
						ico.geometry.faces.push( new THREE.Face3(i,j,k, new THREE.Vector3(), triangleColor.clone() ) );
					}
				}
			}
		}
	}
	ico.geometry.computeFaceNormals();
	
	var destinationQuaternion = ico.quaternion.clone();
	var destination = ico.position.clone();
	
	var edgeRadius = 0.034;
	var ourCylinderGeometry = new THREE.CylinderBufferGeometry( 1,1,1,15,1, true);
	for(var i = 0, il = ourCylinderGeometry.attributes.position.array.length / 3; i < il; i++)
	{
		ourCylinderGeometry.attributes.position.array[i*3+1] += 0.5;
	}
	
	var placeCylinder = function()
	{
		this.scale.set(edgeRadius,this.end.distanceTo(this.start),edgeRadius);
		this.position.copy(this.start);
		this.quaternion.setFromUnitVectors(yUnit,this.end.clone().sub(this.start).normalize());
	}
	function makePlaceableCylinder(startIndex,endIndex)
	{
		var ourPlaceableCylinder = new THREE.Mesh( ourCylinderGeometry, new THREE.MeshPhongMaterial({color:0x000000, side:THREE.DoubleSide}));
		ourPlaceableCylinder.place = placeCylinder;
		
		ourPlaceableCylinder.startIndex = startIndex;
		ourPlaceableCylinder.endIndex = endIndex;

		ourPlaceableCylinder.start = ico.geometry.vertices[startIndex];
		ourPlaceableCylinder.end = ico.geometry.vertices[endIndex];
		
		ourPlaceableCylinder.place();
		
		ourPlaceableCylinder.line3 = new THREE.Line3( ourPlaceableCylinder.start, ourPlaceableCylinder.end );
		return ourPlaceableCylinder;
	}
	
	var grabbableEdges = [];
	var wholeGrabbed = false;
	var grabbedEdge = -1;
	var grabbedVertexIndex = -1;
	
	for(var i = 0, il = ico.geometry.vertices.length; i < il; i++ )
	{
		for(var j = i+1; j < ico.geometry.vertices.length; j++)
		{
			if( ico.geometry.vertices[i].distanceTo(ico.geometry.vertices[j]) - 1 < 0.0001)
			{
				var grabbableEdge = makePlaceableCylinder( i, j );
				ico.add(grabbableEdge);
				grabbableEdges.push( grabbableEdge );
			}
		}
	}
	
	var getFirstTriangleConnectedToVertex = function(vertexIndex, apartFrom)
	{
		for(var i = 0, il = this.faces.length; i < il; i++)
		{
			if( this.faces[i].indexOfCorner(vertexIndex) !== -1 )
			{
//				if( apartFrom !== undefined)
//					console.log(apartFrom, this.faces[i])
				if( apartFrom === undefined || this.faces[i] !== apartFrom)
					return this.faces[i];
			}
		}
		console.error("no triangle connected to that vertex")
	}
	
	for(var i = 0, il = ico.geometry.vertices.length; i < il; i++)
	{
		ico.geometry.vertices[i].getFirstTriangleConnectedToVertex = getFirstTriangleConnectedToVertex;
		ico.geometry.vertices[i].faces = [];
		for(var j = 0, jl = ico.geometry.faces.length; j < jl; j++)
		{
			for(var k = 0; k < 3; k++)
			{
				if(ico.geometry.faces[j].cornerFromIndex(k) === i)
					ico.geometry.vertices[i].faces.push( ico.geometry.faces[j] );
			}
		}
	}

	var indicatorSphere = new THREE.Mesh(new THREE.SphereGeometry(0.09), new THREE.MeshBasicMaterial({color:0x888888}));
	ico.add(indicatorSphere)
	var indicatorSphere2 = new THREE.Mesh(new THREE.SphereGeometry(0.09), new THREE.MeshBasicMaterial({color:0xFF00F0}));
	ico.add(indicatorSphere2)

	markedThingsToBeUpdated.push(ico)
	ico.update = function()
	{
		var hoveringEdge = -1;
		var hoveringVertexIndex = -1;
		
		//determination of selection
		if( !wholeGrabbed && grabbedEdge === -1)
		{
			var hoveringEdgePlaneClientRayIntersectionZ = -Infinity;
//			ico.updateMatrixWorld();
			for(var i = 0; i < grabbableEdges.length; i++)
			{
				var clientRay = getClientRay();
				grabbableEdges[i].parent.worldToLocal(clientRay.start);
				grabbableEdges[i].parent.worldToLocal(clientRay.end);
				
				//it lies in the plane orthogonal to the edge and in the z = 0 plane. Could also set from normal
				var pointInEdgePlane = grabbableEdges[i].line3.delta().cross(clientRay.start).add(grabbableEdges[i].start);
				
				var edgePlane = new THREE.Plane().setFromCoplanarPoints(grabbableEdges[i].start, grabbableEdges[i].end, pointInEdgePlane);
				
				var edgePlaneClientRayIntersection = edgePlane.intersectLine( clientRay );
				if( edgePlaneClientRayIntersection )
				{
					var closestPointOnEdgeLineParameter = grabbableEdges[i].line3.closestPointToPointParameter( edgePlaneClientRayIntersection );
					if( 0 < closestPointOnEdgeLineParameter && closestPointOnEdgeLineParameter < 1 &&
							edgeRadius * 3 > grabbableEdges[i].line3.at( closestPointOnEdgeLineParameter ).distanceTo( edgePlaneClientRayIntersection )
					)
					{
						var worldspaceIntersection = edgePlaneClientRayIntersection.clone();
						grabbableEdges[i].parent.localToWorld(worldspaceIntersection);
						
						if( worldspaceIntersection.z > hoveringEdgePlaneClientRayIntersectionZ )
						{
							hoveringEdge = i;
							if( edgePlaneClientRayIntersection.distanceTo(grabbableEdges[i].start) < 
								edgePlaneClientRayIntersection.distanceTo(grabbableEdges[i].end) )
								hoveringVertexIndex = grabbableEdges[i].startIndex;
							else
								hoveringVertexIndex = grabbableEdges[i].endIndex;
								
							hoveringEdgePlaneClientRayIntersectionZ = worldspaceIntersection.z;
							
							indicatorSphere.position.copy( edgePlaneClientRayIntersection )
							indicatorSphere.visible = true;
							indicatorSphere2.position.copy( ico.geometry.vertices[ hoveringVertexIndex ] )
							break;
						}
					}
				}

				if(i === grabbableEdges.length-1)
				{
					indicatorSphere.visible = false;
				}
			}
			
			for(var i = 0; i < grabbableEdges.length; i++)
			{
				if( i === hoveringEdge )
				{
					grabbableEdges[i].material.color.setRGB(0.6,0.6,0.6);
				}
				else
				{
					grabbableEdges[i].material.color.setRGB(0,0,0);
				}
				
				grabbableEdges[i].material.needsUpdate = true;
			}
		}

		if( mouse.clicking )
		{
			if( !mouse.oldClicking )
			{
				if( hoveringEdge !== -1)
				{
					grabbedEdge = hoveringEdge;
					grabbableEdges[ grabbedEdge ].material.color.setRGB(1,1,1);
					grabbableEdges[ grabbedEdge ].materialNeedsUpdate = true;
					
					grabbedVertexIndex = hoveringVertexIndex;

					//get triangle that we'll see as flat
					{
						var ungrabbedVertexIndex = grabbedVertexIndex === grabbableEdges[ grabbedEdge ].startIndex ? grabbableEdges[ grabbedEdge ].endIndex : grabbableEdges[ grabbedEdge ].startIndex;
						var triangleAdjacentToGE = ico.geometry.vertices[grabbedVertexIndex].getFirstTriangleConnectedToVertex( 
								ungrabbedVertexIndex );
						
						var adjacentCorner = triangleAdjacentToGE.indexOfThirdCorner( 
								grabbableEdges[grabbedEdge].startIndex, 
								grabbableEdges[grabbedEdge].endIndex );
						var triangleAdjacentToTATGE = ico.geometry.vertices[grabbedVertexIndex].getFirstTriangleConnectedToVertex( 
								adjacentCorner, 
								triangleAdjacentToGE );
						
						var flattenedTriangleCornerA = triangleAdjacentToTATGE.indexOfThirdCorner(
								grabbedVertexIndex,
								adjacentCorner );
						var triangleOppositeGE = ico.geometry.vertices[grabbedVertexIndex].getFirstTriangleConnectedToVertex( 
								flattenedTriangleCornerA, 
								triangleAdjacentToTATGE );
						
						var flattenedTriangleCornerB = triangleOppositeGE.indexOfThirdCorner(
								grabbedVertexIndex,
								flattenedTriangleCornerA );

						var facePlane = new THREE.Plane().setFromCoplanarPoints(
								ico.geometry.vertices[ flattenedTriangleCornerA ],
								ico.geometry.vertices[ flattenedTriangleCornerB ],
								ico.geometry.vertices[ grabbedVertexIndex ] );
						if(facePlane.normal.angleTo( ico.geometry.vertices[ grabbedVertexIndex ] ) > TAU / 4 )
							facePlane.normal.negate();
						destinationQuaternion.setFromUnitVectors( facePlane.normal, zUnit );
						
						var edgeInIQ = grabbableEdges[ grabbedEdge ].line3.delta().applyQuaternion(ico.quaternion).setZ(0).normalize();
						var edgeInDQ = grabbableEdges[ grabbedEdge ].line3.delta().applyQuaternion(destinationQuaternion).setZ(0).normalize();
						destinationQuaternion.premultiply(new THREE.Quaternion().setFromUnitVectors( edgeInDQ,edgeInIQ ))
						
						var geWorld = ico.geometry.vertices[grabbedVertexIndex].clone().multiplyScalar(ico.scale.x).applyQuaternion(destinationQuaternion).add(ico.position);
						var movementToMouse = getClientPosition().sub(geWorld);
						destination.addVectors(ico.position,movementToMouse);
					}
				}
				else {
					wholeGrabbed = true;
				}
			}
			
			if( grabbedEdge !== -1 )
			{
				var clientRay = getClientRay();
				grabbableEdges[grabbedEdge].parent.worldToLocal(clientRay.start);
				grabbableEdges[grabbedEdge].parent.worldToLocal(clientRay.end);
				
				var facePlane = new THREE.Plane().setFromCoplanarPoints(
						grabbableEdges[grabbedEdge].parent.geometry.vertices[0],
						grabbableEdges[grabbedEdge].parent.geometry.vertices[1],
						grabbableEdges[grabbedEdge].parent.geometry.vertices[2] );
				
				var facePlaneClientRayIntersection = facePlane.intersectLine( clientRay );
				
				/* Increase the triangle's size
				 * 		at first ignore the angular defect thing
				 * 		so don't bother with AO
				 * 		That's it
				 * 
				 * Later
				 * Increase size
				 * deal with implications for other edge lengths
				 * send to AO, put vertices in our thing
				 * 
				 */
			}
			else
			{
				//this is about rotating the whole thing
				// var rotationAmount = getClientPosition.sub(oldClientPosition).length() * 5;
				// var rotationAxis = getClientPosition.sub(oldClientPosition).applyAxisAngle(zUnit,TAU/4);
				// ico.updateMatrixWorld();
				// ico.worldToLocal(rotationAxis)
				// rotationAxis.normalize();
				// var quaternion = new THREE.Quaternion().setFromAxisAngle(rotationAxis, rotationAmount);
				// ico.quaternion.multiply(quaternion)
			}
		}
		else {
			wholeGrabbed = false;
			grabbedEdge = -1;
		}
		
		ico.quaternion.slerp(destinationQuaternion, 0.12);
		ico.position.lerp(destination, 0.12);
	}

	initLatticeMapper(ico);
}

//http://www.phatcode.net/articles.php?id=459
function circleTriangleIntersection(
	centreX,centreY,radius,
	v1x,v1y,v2x,v2y,v3x,v3y)
{
	var c1x = centreX - v1x
	var c1y = centreY - v1y

	var radiusSqr = radius*radius
	var c1sqr = c1x*c1x + c1y*c1y - radiusSqr

	if( c1sqr <= 0)
		return true

	var c2x = centreX - v2x
	var c2y = centreY - v2y
	var c2sqr = c2x*c2x + c2y*c2y - radiusSqr

	if( c2sqr <= 0)
		return true

	var c3x = centreX - v3x
	var c3y = centreY - v3y

	var c3sqr = radiusSqr	// reference to radiusSqr var USED TO BE &
	 c3sqr = c3x*c3x + c3y*c3y - radiusSqr

	if( c3sqr <= 0)
		return true


	//
	// TEST 2: Circle centre within triangle
	//

	//
	// Calculate edges
	//
	var e1x = v2x - v1x
	var e1y = v2y - v1y

	var e2x = v3x - v2x
	var e2y = v3y - v2y

	var e3x = v1x - v3x
	var e3y = v1y - v3y

	if(e1y*c1x - e1x*c1y >= 0 &&
	   e2y*c2x - e2x*c2y >= 0 &&
	   e3y*c3x - e3x*c3y >= 0 )
	     return true


	//
	// TEST 3: Circle intersects edge
	//
	var k = c1x*e1x + c1y*e1y

	if( k > 0)
	{
		len = e1x*e1x + e1y*e1y     // squared len

		if( k < len)
		{
		if( c1sqr * len <= k*k)
			return true
		}
	}

	// Second edge
	var k = c2x*e2x + c2y*e2y

	if( k > 0)
	{
		len = e2x*e2x + e2y*e2y

		if( k < len)
		{
		if( c2sqr * len <= k*k)
			return true
		}
	}

	// Third edge
	var k = c3x*e3x + c3y*e3y

	if( k > 0)
	{
		len = e3x*e3x + e3y*e3y

		if( k < len)
		{
		if( c3sqr * len <= k*k)
			return true
		}
	}

	// We're done, no intersection
	return false
}