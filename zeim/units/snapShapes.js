/*
	TODO
	When you do S3, do that lovely ring of tetrahedra

	visiplanes
	"Clone" is terribly important. If there's multiple shapes obv clone them too
	Want to unsnap. grabbingSide vs grabbingTop for hand separation

	"Face" data structure is just series of points that build up the fan. Check respective lengths, that's surely enough to identify face types

	//-------Snapping
	maybe show a ghost first? All shapes have a ghost of their volume.
	note that so long as you have a teeny bit of depth, you can have snapping squares
*/


function initSnapShapes(allPolyhedra)
{
	// {
	// 	var visibilityPanel = new THREE.Mesh(new THREE.OriginCorneredPlaneGeometry(), new THREE.MeshBasicMaterial());
	// 	visibilityPanel.position.z = -0.1
	// 	visibilityPanel.position.y = 0.08
	// 	visibilityPanel.scale.setScalar(0.03)
	// 	// bestowDefaultMouseDragProperties(visibilityPanel)
	// 	// scene.add(visibilityPanel);

	// 	var signs = [];
	// 	signs.push(makeTextSign( "Visibilities" ));
	// 	signs.push(makeTextSign( "volume" ))
	// 	signs.push(makeTextSign( "edges" ))
	// 	signs.push(makeTextSign( "vertices" ))

	// 	var onColor = new THREE.Color(0x808080)
	// 	var offColor = new THREE.Color(0xFFFFFF);
		
	// 	for(var i = 0; i < signs.length; i++)
	// 	{
	// 		signs[i].scale.multiplyScalar(0.15)
	// 		signs[i].position.x = 0.5;
	// 		signs[i].position.y = (0.9 - 0.24 * i);
	// 		signs[i].position.z = 0.01;
			
	// 		visibilityPanel.add(signs[i]);

	// 		if(i)
	// 		{
	// 			signs[i].material.color.copy(onColor)
	// 			clickables.push(signs[i]);
	// 			signs[i].onClick = function()
	// 			{
	// 				var toSetTo = 1 - allPolyhedra[0][this.text+"Mesh"].material.opacity;
	// 				for(var j = 0; j < allPolyhedra.length; j++)
	// 				{
	// 					allPolyhedra[j][this.text+"Mesh"].material.opacity = toSetTo;
	// 				}

	// 				if(toSetTo)
	// 				{
	// 					this.material.color.copy(onColor)
	// 				}
	// 				else
	// 				{
	// 					this.material.color.copy(offColor)
	// 				}
	// 			}
	// 		}
	// 	}
	// }

	var point = new THREE.Mesh( new THREE.EfficientSphereBufferGeometry(1),
		new THREE.MeshPhongMaterial({
			color: 0xD4AF37,
			shininess: 100,
			transparent:true, opacity:1
		}) );

	Shape = function(coordsOrVertices, facesData, vertexRadiusMultiplier)
	{
		var shape = new THREE.Group();
		allPolyhedra.push(shape);

		var edges = [];
		var faces = [];
		shape.faces = faces;
		//array of arrays of vertex indices, counter-clockwise, triangles fanning from first

		var verticesMesh = new THREE.Mesh(new THREE.BufferGeometry(),point.material);
		var edgesMesh = new THREE.Mesh(new THREE.Geometry(),new THREE.MeshPhongMaterial({color:0x000000, transparent:true, opacity:1}));
		var volumeMesh = new THREE.Mesh(new THREE.Geometry(), new THREE.MeshBasicMaterial({color:0xFF0000, transparent:true, opacity:1}));
		shape.verticesMesh = verticesMesh;
		shape.edgesMesh = edgesMesh;
		shape.volumeMesh = volumeMesh;

		//faceColors
		shape.add(verticesMesh);
		shape.add(edgesMesh);
		shape.add(volumeMesh);

		//make what you can with the geometry
		{
			if( typeof( coordsOrVertices[0] ) !== "number")
			{
				var vertices = coordsOrVertices;
			}
			else
			{
				var vertices = Array(coordsOrVertices.length / 3);
				for(var i = 0; i < vertices.length; i++)
				{
					vertices[i] = new THREE.Vector3(
						coordsOrVertices[i*3+0],
						coordsOrVertices[i*3+1],
						coordsOrVertices[i*3+2]);
				}
			}	

			volumeMesh.geometry.vertices = vertices;
			volumeMesh.geometry.computeBoundingSphere();
			shape.boundingSphere = volumeMesh.geometry.boundingSphere;

			var numCoords = vertices.length * point.geometry.attributes.position.array.length;
			verticesMesh.geometry.addAttribute( 'position', new THREE.BufferAttribute( new Float32Array( numCoords ), 3 ) );
			verticesMesh.geometry.addAttribute( 'normal', new THREE.BufferAttribute( new Float32Array( numCoords), 3 ) );
			if(vertexRadiusMultiplier === undefined)
			{
				vertexRadiusMultiplier = 2;
			}
			var vertexRadius = getEdgeRadius(shape) * vertexRadiusMultiplier;

			for(var i = 0; i < vertices.length; i++)
			{
				var newVertexGeometry = point.geometry.clone();
				newVertexGeometry.applyMatrix(new THREE.Matrix4().scale(new THREE.Vector3().setScalar( vertexRadius ) ) )
				newVertexGeometry.applyMatrix(new THREE.Matrix4().setPosition(vertices[i]) )

				verticesMesh.geometry.merge(newVertexGeometry,i*point.geometry.attributes.position.count);
			}
		}

		shape.addFace = function(vertexIndexArray, log)
		{
			var face = vertexIndexArray;
			face.center = new THREE.Vector3();
			faces.push(face);

			if(log)
			{
				var facesString = "[";
				for(var i = 0; i < faces.length; i++)
				{
					facesString += "[" + faces[i].toString() + "]";
					if(i<faces.length-1)
					{
						facesString += ",";
					}
				}
				facesString += "]";
				console.log(facesString)
			}

			face.center.set(0,0,0);
			for(var j = 0; j < face.length; j++)
			{
				face.center.add( vertices[ face[j] ] )
				if( j === 0 || j === face.length-1)
				{
					continue;
				}

				volumeMesh.geometry.faces.push( new THREE.Face3(
					face[0],
					face[j],
					face[j+1]) );
			}
			face.center.multiplyScalar( 1 / face.length );
			volumeMesh.geometry.computeBoundingSphere();
			volumeMesh.geometry.elementsNeedUpdate = true; //who knew?

			//edges
			{
				var edgeRadius = getEdgeRadius(this);
				var cylinderSides = 15;

				for(var j = 0, jl = face.length; j < jl; j++)
				{
					var potentialNewEdgePair = face[j] < face[(j+1)%jl] ? [face[j], face[(j+1)%jl]] : [face[(j+1)%jl], face[j]];
					var alreadyListed = false;
					for(var k = 0, kl = edges.length; k < kl; k++)
					{
						if( ( potentialNewEdgePair[0] === edges[k][0] &&
							  potentialNewEdgePair[1] === edges[k][1] ) ||
							( potentialNewEdgePair[0] === edges[k][1] &&
							  potentialNewEdgePair[1] === edges[k][0] ) )
						{
							alreadyListed = true;
							break;
						}
					}
					if(!alreadyListed)
					{
						edges.push(potentialNewEdgePair);
					}
				}
				
				var cylinderBeginning = new THREE.Vector3();
				var cylinderEnd = new THREE.Vector3();
				var cylinderSides = 5;
				var firstFaceIndex = 0;
				var firstVertexIndex = 0;
				for(var i = 0, il = edges.length; i < il; i++ )
				{
					cylinderBeginning.copy(vertices[edges[i][0]])
					cylinderEnd.copy(vertices[edges[i][1]])
					
					for(var k = 0; k < cylinderSides; k++)
					{
						edgesMesh.geometry.faces[firstFaceIndex+k*2] = new THREE.Face3(
							(k*2+1) + firstVertexIndex,
							(k*2+0) + firstVertexIndex,
							(k*2+2) % (cylinderSides*2) + firstVertexIndex );
						
						edgesMesh.geometry.faces[firstFaceIndex+k*2 + 1] = new THREE.Face3(
							(k*2+1) + firstVertexIndex,
							(k*2+2) % (cylinderSides*2) + firstVertexIndex,
							(k*2+3) % (cylinderSides*2) + firstVertexIndex );
					}
					
					var edgeVector = new THREE.Vector3().subVectors(cylinderEnd,cylinderBeginning);
					edgeVector.normalize();
					var tickVector = randomPerpVector(edgeVector);
					tickVector.normalize();
					for( var j = 0; j < cylinderSides; j++)
					{
						edgesMesh.geometry.vertices[firstVertexIndex + j*2  ] = new THREE.Vector3( tickVector.x*edgeRadius + cylinderBeginning.x,	tickVector.y*edgeRadius + cylinderBeginning.y,	tickVector.z*edgeRadius + cylinderBeginning.z );
						edgesMesh.geometry.vertices[firstVertexIndex + j*2+1] = new THREE.Vector3( tickVector.x*edgeRadius + cylinderEnd.x,			tickVector.y*edgeRadius + cylinderEnd.y,		tickVector.z*edgeRadius + cylinderEnd.z );
						
						tickVector.applyAxisAngle(edgeVector, TAU / cylinderSides);
					}

					edgesMesh.geometry.elementsNeedUpdate = true;
					edgesMesh.geometry.computeVertexNormals();
					
					firstVertexIndex += cylinderSides * 2;
					firstFaceIndex += cylinderSides * 2;
				}
			}
		}

		if(facesData)
		{
			for(var i = 0; i < facesData.length; i++)
			{
				shape.addFace(facesData[i]);
			}
		}

		/*
			Fucks up if you move some of the vertices, so cube is a pathological case

			//it's not necessarily the case that you want to snap 0 to 0 ><
			//a problem in cases where the face has symmetry that the whole does not
			//but NOT in the case of the octagon you're thinking about, that probably does respect symmetry

			Maybe instead do the tetrahedronTop first then work out where the things should go
		*/
		shape.snapToNearestPolyhedron = function()
		{
			//we assume the face vertex list has been ordered in a specific way (that only works if it's convex)

			var them = null; //polyhedron to snap to
			var theirFace = null;
			var ourFace = null;
			var distanceBetweenTwo = Infinity;
			for(var i = 0; i < allPolyhedra.length; i++)
			{
				if(allPolyhedra[i] === this)
				{
					continue;
				}
				if(this.position.distanceTo(allPolyhedra[i].position) < this.boundingSphere.radius * 2 + allPolyhedra[i].boundingSphere.radius * 2 )
				{
					for(var j = 0; j < faces.length; j++)
					{
						for(var k = 0; k < allPolyhedra[i].faces.length; k++)
						{
							var potentialFace = allPolyhedra[i].faces[k];
							var potentialDistance = potentialFace.center.clone().applyMatrix4(allPolyhedra[i].matrixWorld).distanceTo(
								faces[j].center.clone().applyMatrix4(this.matrixWorld) );
							if( potentialDistance < distanceBetweenTwo )
							{
								if( faces[j].length === potentialFace.length ) //"topology"
								{
									var faceCongruent = true;
									for(var l = 0; l < faces[j].length; l++)
									{
										if( !basicallyEqual( this.fanRibLength(j,l), allPolyhedra[i].fanRibLength(j,l) ) )
										{
											faceCongruent = false;
											break;
										}
									}
									if( faceCongruent )
									{
										theirFace = potentialFace;
										ourFace = faces[j];
										distanceBetweenTwo = potentialDistance;
										them = allPolyhedra[i];
									}
								}
							}
						}
					}
				}
			}
			if(them === null)
			{
				return;
			}

			//use three reference points to make the faces overlap (polyhedra intersect)
			{
				them.updateMatrixWorld();
				var theirVerticesWorld = [
					them.vertices[theirFace[0]].clone().applyMatrix4(them.matrix),
					them.vertices[theirFace[1]].clone().applyMatrix4(them.matrix),
					them.vertices[theirFace[2]].clone().applyMatrix4(them.matrix)
				];
				var ourVertices = [
					vertices[ourFace[0]],
					vertices[ourFace[1]],
					vertices[ourFace[2]]
				];

				var matrixSendingTheirVerticesToUnitAxes = new THREE.Matrix4().makeBasis(
					theirVerticesWorld[0].clone().sub(them.position),
					theirVerticesWorld[1].clone().sub(them.position),
					theirVerticesWorld[2].clone().sub(them.position) );
				var matrixSendingUnitAxesToOurVertices = new THREE.Matrix4().getInverse( new THREE.Matrix4().makeBasis(
					ourVertices[0],
					ourVertices[1],
					ourVertices[2] ) );
				var matrixWithFacesOverlapping = matrixSendingTheirVerticesToUnitAxes.clone().multiply( matrixSendingUnitAxesToOurVertices );

				//tetrahedron has two tops, so this part is specific to order
				var positionWithFacesOverlapping = tetrahedronTop(
					theirVerticesWorld[0],
					theirVerticesWorld[2],
					theirVerticesWorld[1],
					ourVertices[0].length() * this.scale.x,
					ourVertices[2].length() * this.scale.x,
					ourVertices[1].length() * this.scale.x );
				matrixWithFacesOverlapping.setPosition( positionWithFacesOverlapping );

				this.matrix.copy(matrixWithFacesOverlapping);
				this.matrixAutoUpdate = false;
			}

			//make an axis through face and rotate around it
			{
				var axisStart = vertices[ourFace[0]];
				var axisEnd = null;
				if( ourFace.length % 2 === 0 )
				{
					var middleFaceVertex = ourFace.length / 2;
					var axisEnd = vertices[ourFace[middleFaceVertex]]
				}
				else
				{
					var beforeMiddleVertex = Math.floor(ourFace.length / 2);
					var afterMiddleVertex = Math.ceil(ourFace.length / 2);

					var axisEnd = vertices[ourFace[beforeMiddleVertex]].clone();
					axisEnd.lerp( vertices[ourFace[afterMiddleVertex]], 0.5 );
				}
				var axis = axisEnd.clone().sub(axisStart).normalize();

				var pBeforeRotation = vertices[ourFace[0]].clone().applyMatrix4(this.matrix);
				this.matrix.multiply(new THREE.Matrix4().makeRotationAxis(axis, TAU/2));
				var pAfterRotation = vertices[ourFace[0]].clone().applyMatrix4(this.matrix);
				var finalPosition = positionWithFacesOverlapping.sub(pAfterRotation).add(pBeforeRotation);
				this.matrix.setPosition(finalPosition);
			}
		}

		shape.fanRibLength = function(faceIndex, ribIndex)
		{
			return vertices[faces[ faceIndex ][0]].distanceTo( 
				   vertices[faces[ faceIndex ][ribIndex]] )
		}

		function getEdgeRadius(shape)
		{
			return vertices[0].distanceTo(vertices[1]) / 40; //guess
		}

		clickables.push(verticesMesh);
		var newPotentialFace = null;
		verticesMesh.onClick = function(cameraSpaceClickedPoint)
		{
			var localPosition = cameraSpaceClickedPoint.clone();
			camera.localToWorld(localPosition);
			this.worldToLocal(localPosition);
			var nearestVertexIndex = getClosestPointToPoint(localPosition, vertices);

			if(newPotentialFace === null)
			{
				newPotentialFace = [];
				newPotentialFace.push(nearestVertexIndex)
			}
			else if( newPotentialFace[0] !== nearestVertexIndex )
			{
				newPotentialFace.push(nearestVertexIndex)
			}
			else
			{
				shape.addFace(newPotentialFace,true);
				newPotentialFace = null;
			}
		}

		clickables.push(volumeMesh);



		// var cameraSpaceClickedPoint = null;
		// volumeMesh.onClick = function(newCameraSpaceClickedPoint)
		// {
		// 	cameraSpaceClickedPoint = newCameraSpaceClickedPoint;
		// }
		markedThingsToBeUpdated.push(shape);
		shape.update = function()
		{
			if(mouse.clicking && this.children.includes(mouse.lastClickedObject) )
			{
				var oldCenterWorld = worldClone(volumeMesh.geometry.boundingSphere.center,this);

				var angle = 20 * mouse.ray.direction.angleTo(mouse.previousRay.direction);
				var axis = mouse.ray.direction.clone().cross(mouse.previousRay.direction).normalize(); //put it in object space?
				axis.applyQuaternion(this.quaternion.clone().inverse());
				var quat = new THREE.Quaternion().setFromAxisAngle(axis,angle);
				this.quaternion.multiply(quat);

				var newCenterWorld = worldClone(volumeMesh.geometry.boundingSphere.center,this);
				this.position.sub(newCenterWorld).add(oldCenterWorld);
			}
		}

		return shape;
	}

	return allPolyhedra;
}