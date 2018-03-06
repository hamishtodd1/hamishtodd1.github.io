/*
	TODO
	shapes rotateable with mouse
	visiplanes
	"Clone" is terribly important. If there's multiple shapes obv clone them too
	Want to unsnap. grabbingSide vs grabbingTop for hand separation

	A method of creating new ones would be best, is there one? May wanna make looooots.
	I mean, you do like polyhedra.

	Stick in vertices specify faces by hitting clicking the vertices one at a time. Create a fan
	Export an array easy to copypaste.
	"Face" data structure is just series of points that build up the fan. Check respective lengths, that's surely enough to identify face types
	You decide what color they are

	//-------Snapping
	go through triangles in shape B. Find the one closest to that triangle.
	if you're within some minim distance, snap. Just multiply by that matrix, making sure that you have the clockwise shit right
	maybe show a ghost first; all shapes have a ghost of their volume.
	when a shape is ready to snap, a "ghost" version of it appears in the prospective place. Letting go causes the snap
	note that so long as you have a teeny bit of depth, you can have snapping squares

*/



function initSnapShapes()
{
	var allPolyhedra = [];

	{
		var visibilityPanel = new THREE.Mesh(new THREE.OriginCorneredPlaneGeometry(), new THREE.MeshBasicMaterial());
		bestowDefaultMouseDragProperties(visibilityPanel)
		visibilityPanel.position.z = -0.1
		visibilityPanel.position.y = 0.08
		visibilityPanel.scale.setScalar(0.03)
		scene.add(visibilityPanel);

		var signs = [];
		signs.push(makeTextSign( "Visibilities" ));
		signs.push(makeTextSign( "volume" ))
		signs.push(makeTextSign( "edges" ))
		signs.push(makeTextSign( "vertices" ))

		var onColor = new THREE.Color(0x808080)
		var offColor = new THREE.Color(0xFFFFFF);
		
		for(var i = 0; i < signs.length; i++)
		{
			signs[i].scale.multiplyScalar(0.15)
			signs[i].position.x = 0.5;
			signs[i].position.y = (0.9 - 0.24 * i);
			signs[i].position.z = 0.01;
			
			visibilityPanel.add(signs[i]);

			if(i)
			{
				signs[i].material.color.copy(onColor)
				clickables.push(signs[i]);
				signs[i].onClick = function()
				{
					var toSetTo = 1 - allPolyhedra[0][this.text+"Mesh"].material.opacity;
					for(var j = 0; j < allPolyhedra.length; j++)
					{
						allPolyhedra[j][this.text+"Mesh"].material.opacity = toSetTo;
					}

					if(toSetTo)
					{
						this.material.color.copy(onColor)
					}
					else
					{
						this.material.color.copy(offColor)
					}
				}
			}
		}
	}

	var point = new THREE.Mesh( new THREE.EfficientSphereBufferGeometry(1/20), 
		new THREE.MeshPhongMaterial({
			color: 0xD4AF37,//gold
			shininess: 100,
			transparent:true, opacity:1
		}) );

	function Cube()
	{
		var cube = new THREE.Group();
		
		var coords = [
			0,0,0,
			1,0,0,
			0,1,0,
			1,1,0,

			0,0,-1,
			1,0,-1,
			0,1,-1,
			1,1,-1,
			];
		cube.vertices = Array(coords.length / 3);
		for(var i = 0; i < cube.vertices.length; i++)
		{
			cube.vertices[i] = new THREE.Vector3(
				coords[i*3+0],
				coords[i*3+1],
				coords[i*3+2]);
		}

		cube.volumeMesh = new THREE.Mesh(new THREE.Geometry(), new THREE.MeshBasicMaterial({color:0xFF0000, side:THREE.DoubleSide, transparent:true, opacity:1}));
		cube.volumeMesh.geometry.vertices = cube.vertices;
		cube.add(cube.volumeMesh)

		{
			var verticesMesh = new THREE.Mesh(new THREE.BufferGeometry(),point.material);
			cube.verticesMesh = verticesMesh;
			var numCoords = cube.vertices.length * point.geometry.attributes.position.array.length;
			verticesMesh.geometry.addAttribute( 'position', new THREE.BufferAttribute( new Float32Array( numCoords ), 3 ) );
			verticesMesh.geometry.addAttribute( 'normal', new THREE.BufferAttribute( new Float32Array( numCoords), 3 ) );
			cube.add(verticesMesh);

			for(var i = 0; i < cube.vertices.length; i++)
			{
				var newVertexGeometry = point.geometry.clone();
				newVertexGeometry.applyMatrix(new THREE.Matrix4().setPosition(cube.vertices[i]))
				verticesMesh.geometry.merge(newVertexGeometry,i*point.geometry.attributes.position.count);
			}
		}

		var edgesMesh = new THREE.Mesh(new THREE.BufferGeometry(),new THREE.MeshPhongMaterial({color:0x000000, transparent:true, opacity:1}));
		cube.edgesMesh = edgesMesh;
		edgesMesh.geometry.addAttribute( 'position',new THREE.BufferAttribute(new Float32Array(), 3) );
		edgesMesh.geometry.addAttribute( 'normal',	new THREE.BufferAttribute(new Float32Array(), 3) );
		edgesMesh.geometry.setIndex( new THREE.BufferAttribute(new Uint32Array(), 1) );
		cube.add(edgesMesh)

		cube.faces = []; //array of arrays of verices, ordered in a specific way
		var face = [1,3,7,5];
		face.center = new THREE.Vector3();
		cube.faces.push(face);

		cube.refreshFromFaces = function()
		{
			delete cube.volumeMesh.geometry.faces;
			cube.volumeMesh.geometry.faces = [];
			for(var i = 0; i <cube.faces.length; i++)
			{
				cube.faces[i].center.set(0,0,0);
				for(var j = 0; j < cube.faces[i].length; j++)
				{
					cube.faces[i].center.add(cube.vertices[ cube.faces[i][j] ])
					if( j === 0|| j === cube.faces[i].length-1)
					{
						continue;
					}

					cube.volumeMesh.geometry.faces.push( new THREE.Face3(
						cube.faces[i][0],
						cube.faces[i][j],
						cube.faces[i][j+1]) );
				}
				cube.faces[i].center.multiplyScalar( 1 / cube.faces[i].length);
			}
			cube.volumeMesh.geometry.computeBoundingSphere();
			cube.boundingSphere = cube.volumeMesh.geometry.boundingSphere;

			{
				var edgeRadius = 1/40;
				var cylinderSides = 15;

				var edgePairs = [];
				for(var i = 0; i < cube.faces.length; i++)
				{
					for(var j = 0, jl = cube.faces[i].length; j < jl; j++)
					{
						var potentialNewEdgePair = cube.faces[i][j] < cube.faces[i][(j+1)%jl] ? [cube.faces[i][j], cube.faces[i][(j+1)%jl]] : [cube.faces[i][(j+1)%jl], cube.faces[i][j]];
						var alreadyListed = false;
						for(var k = 0, kl = edgePairs.length; k < kl; k++)
						{
							if(	potentialNewEdgePair[0] === edgePairs[k][0] &&
								potentialNewEdgePair[1] === edgePairs[k][1])
							{
								alreadyListed = true;
								break;
							}
						}
						if(!alreadyListed)
						{
							edgePairs.push(potentialNewEdgePair);
						}
					}
				}
				
				edgesMesh.geometry.attributes.position.setArray( new Float32Array( 3 * (cylinderSides * edgePairs.length * 2) ) );
				edgesMesh.geometry.attributes.normal.setArray( new Float32Array( 3 * (cylinderSides * edgePairs.length * 2) ) );
				edgesMesh.geometry.index.setArray( new Uint32Array( 3 * (cylinderSides * edgePairs.length * 2) ) );

				//can't use setXYZ because itemsize is 1
				edgesMesh.geometry.index.setABC = function(index,a,b,c)
				{
					this.array[ index*3+0 ] = a;
					this.array[ index*3+1 ] = b;
					this.array[ index*3+2 ] = c;
				}

				var cylinderBeginning = new THREE.Vector3();
				var cylinderEnd = new THREE.Vector3();
				var cylinderSides = 5;
				var firstFaceIndex = 0;
				var firstVertexIndex = 0;
				for(var i = 0, il = edgePairs.length; i < il; i++ )
				{
					cylinderBeginning.copy(cube.vertices[edgePairs[i][0]])
					cylinderEnd.copy(cube.vertices[edgePairs[i][1]])
					
					for(var k = 0; k < cylinderSides; k++)
					{
						edgesMesh.geometry.index.setABC(firstFaceIndex+k*2,
							(k*2+1) + firstVertexIndex,
							(k*2+0) + firstVertexIndex,
							(k*2+2) % (cylinderSides*2) + firstVertexIndex );
						
						edgesMesh.geometry.index.setABC(firstFaceIndex+k*2 + 1,
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
						edgesMesh.geometry.attributes.position.setXYZ(  firstVertexIndex + j*2, tickVector.x*edgeRadius + cylinderBeginning.x,tickVector.y*edgeRadius + cylinderBeginning.y,tickVector.z*edgeRadius + cylinderBeginning.z );
						edgesMesh.geometry.attributes.position.setXYZ(firstVertexIndex + j*2+1, tickVector.x*edgeRadius + cylinderEnd.x,tickVector.y*edgeRadius + cylinderEnd.y,tickVector.z*edgeRadius + cylinderEnd.z );
						
						edgesMesh.geometry.attributes.normal.setXYZ(  firstVertexIndex + j*2, tickVector.x,tickVector.y,tickVector.z );
						edgesMesh.geometry.attributes.normal.setXYZ(firstVertexIndex + j*2+1, tickVector.x,tickVector.y,tickVector.z );
						
						tickVector.applyAxisAngle(edgeVector, TAU / cylinderSides);
					}
					
					firstVertexIndex += cylinderSides * 2;
					firstFaceIndex += cylinderSides * 2;
				}
			}
		}
		cube.refreshFromFaces();

		markedThingsToBeUpdated.push(cube);
		cube.update = function()
		{
		}

		cube.fanRibLength = function(faceIndex, ribIndex)
		{
			return cube.vertices[cube.faces[ faceIndex ][0]].distanceTo( 
				   cube.vertices[cube.faces[ faceIndex ][ribIndex]] )
		}

		allPolyhedra.push(cube)
		return cube;
	}

	{
		var cubeA = Cube();
		var cubeB = Cube();
		scene.add(cubeA,cubeB)
		cubeB.position.x = 0.12
		cubeB.position.z = -0.6
		cubeB.rotation.y = TAU/4
		cubeB.scale.setScalar(0.1)

		cubeA.position.z = -0.5
		cubeA.scale.setScalar(0.1)
		cubeA.position.x = -0.12

		cubeB.refreshFromFaces();
	}

	clickables.push(cubeB.volumeMesh)
	cubeB.cameraSpaceClickedPoint = null;
	cubeB.volumeMesh.onClick = function(cameraSpaceClickedPoint)
	{
		this.cameraSpaceClickedPoint = cameraSpaceClickedPoint;
	}
	cubeB.update = function()
	{
		if( mouse.clicking && mouse.lastClickedObject === this.volumeMesh )
		{
			var newCameraSpaceClickedPoint = mouse.rayIntersectionWithZPlaneInCameraSpace(this.volumeMesh.cameraSpaceClickedPoint.z);

			var mouseDisplacement = newCameraSpaceClickedPoint.clone().sub(this.volumeMesh.cameraSpaceClickedPoint);
			camera.getWorldDirection();
			var directionToCamera = camera.getWorldDirection().negate();
			var axis = directionToCamera.clone().cross(mouseDisplacement).normalize();
			var angle = mouseDisplacement.length() * -10;

			if(angle!== 0 && angle !== -0)
				console.log(axis,angle);
			this.position.sub(this.boundingSphere.center);
			this.rotateOnAxis(axis,angle);
			this.position.add(this.boundingSphere.center);

			this.volumeMesh.cameraSpaceClickedPoint.copy(newCameraSpaceClickedPoint)
		}
		else
		{
			this.cameraSpaceClickedPoint = null;
		}
	}

	cubeA.update = function()
	{

		//we assume the face vertex list has been ordered in a specific way (that only works if it's convex)

		//it's not necessarily the case that you want to snap 0 to 0 ><
		//a problem in cases where the face has symmetry that the whole does not
		//we'll see how much of a problem this is
		var polyhedronToSnapTo = null;
		var faceToSnapTo = null;
		var faceOnThis = null;
		var distanceBetweenTwo = Infinity;
		for(var i = 0; i < allPolyhedra.length; i++)
		{
			if(allPolyhedra[i] === this)
			{
				continue;
			}
			if(this.position.distanceTo(allPolyhedra[i].position) < this.boundingSphere.radius * 2 + allPolyhedra[i].boundingSphere.radius * 2 )
			{
				for(var j = 0; j < this.faces.length; j++)
				{
					for(var k = 0; k < allPolyhedra[i].faces.length; k++)
					{
						var potentialFace = allPolyhedra[i].faces[k];
						var potentialDistance = potentialFace.center.clone().applyMatrix4(allPolyhedra[i].matrixWorld).distanceTo(
							this.faces[j].center.clone().applyMatrix4(this.matrixWorld) );
						if( potentialDistance < distanceBetweenTwo )
						{
							if( this.faces[j].length === potentialFace.length )
							{
								var faceCongruent = true;
								for(var l = 0; l < this.faces[j].length; l++)
								{
									if( !basicallyEqual( cubeA.fanRibLength(j,l), cubeB.fanRibLength(j,l) ) )
									{
										faceCongruent = false;
										break;
									}
								}
								if( faceCongruent )
								{
									faceToSnapTo = potentialFace;
									faceOnThis = this.faces[j];
									distanceBetweenTwo = potentialDistance;
									polyhedronToSnapTo = allPolyhedra[i];
								}
							}
						}
					}
				}
			}
		}

		if(faceToSnapTo === null)
		{
			return;
		}

		polyhedronToSnapTo.updateMatrixWorld();
		var polyhedronToSnapToVerticesWorld = [
			polyhedronToSnapTo.vertices[faceToSnapTo[0]].clone().applyMatrix4(polyhedronToSnapTo.matrix),
			polyhedronToSnapTo.vertices[faceToSnapTo[1]].clone().applyMatrix4(polyhedronToSnapTo.matrix),
			polyhedronToSnapTo.vertices[faceToSnapTo[2]].clone().applyMatrix4(polyhedronToSnapTo.matrix)
		];
		var thisVertices = [
			this.vertices[faceOnThis[0]],
			this.vertices[faceOnThis[1]],
			this.vertices[faceOnThis[2]]
		];

		var newMatrix = new THREE.Matrix4();

		newMatrix.makeBasis(
			polyhedronToSnapToVerticesWorld[0].clone().sub(polyhedronToSnapTo.position),
			polyhedronToSnapToVerticesWorld[1].clone().sub(polyhedronToSnapTo.position),
			polyhedronToSnapToVerticesWorld[2].clone().sub(polyhedronToSnapTo.position) );

		newMatrix.multiply( new THREE.Matrix4().getInverse( new THREE.Matrix4().makeBasis(
			thisVertices[0],
			thisVertices[1],
			thisVertices[2] ) ) );

		var positionWithFacesOverlapping = tetrahedronTop(
			polyhedronToSnapToVerticesWorld[0],
			polyhedronToSnapToVerticesWorld[1],
			polyhedronToSnapToVerticesWorld[2],
			thisVertices[0].length() * this.scale.x,
			thisVertices[1].length() * this.scale.x,
			thisVertices[2].length() * this.scale.x );
		newMatrix.setPosition( positionWithFacesOverlapping );

		this.matrix.copy(newMatrix);
		this.matrixAutoUpdate = false;

		var axisStart = this.vertices[faceOnThis[0]];
		var axisEnd = null;
		if( faceOnThis.length % 2 === 0 )
		{
			var middleFaceVertex = faceOnThis.length / 2;
			var axisEnd = this.vertices[faceOnThis[middleFaceVertex]]
		}
		else
		{
			var beforeMiddleVertex = Math.floor(faceOnThis.length / 2);
			var afterMiddleVertex = Math.ceil(faceOnThis.length / 2);

			var axisEnd = this.vertices[faceOnThis[beforeMiddleVertex]].clone();
			axisEnd.lerp( this.vertices[faceOnThis[afterMiddleVertex]], 0.5 );
		}
		var axis = axisEnd.clone().sub(axisStart).normalize();

		var pBeforeRotation = this.vertices[faceOnThis[0]].clone().applyMatrix4(this.matrix);
		this.matrix.multiply(new THREE.Matrix4().makeRotationAxis(axis, TAU/2));
		var pAfterRotation = this.vertices[faceOnThis[0]].clone().applyMatrix4(this.matrix);
		var finalPosition = positionWithFacesOverlapping.sub(pAfterRotation).add(pBeforeRotation);
		this.matrix.setPosition(finalPosition);
	}
}

//coords or Vector3s is fine
var truncatedCubeVertices = [];
var exceptionalCoord = Math.sqrt(2)-1;
for(var i = 0; i < 3; i++)
{
	for(var j = 0; j < 8; j++)
	{
		var a = [1,1,1];
		a[i] = exceptionalCoord;
		for(var k = 0; k < 3; k++ )
		{
			if( j & (1 << k) )
			{
				a[k] *= -1;
			}
		}
		truncatedCubeVertices.push(new THREE.Vector3().fromArray(a));
	}
}
var octahedronVertices = [];
for(var i = 0; i < 3; i++)
{
	for(var j = 0; j < 2; j++)
	{
		var a = [0,0,0];
		if(j)
		{
			a[i] = -1;
		}
		else
		{
			a[i] = 1;
		}
		octahedronVertices.push(new THREE.Vector3().fromArray(a));
	}
}

var truncatedOctahedronVertices = [];
for(var i = 0; i < 3; i++)
{
	for(var j = 0; j < 8; j++)
	{
		var a = [0,0,0];
		var oneIndex = null;
		var twoIndex = null;
		if(j>3)
		{
			oneIndex = (i+1)%3;
			twoIndex = (i+2)%3;
		}
		else
		{
			oneIndex = (i+2)%3;
			twoIndex = (i+1)%3;
		}
		a[oneIndex] = 1;
		a[twoIndex] = 2;
		if(j&1)
		{
			a[oneIndex] *= -1;
		}
		if(j&2)
		{
			a[twoIndex] *= -1;
		}
		console.log(a)
		truncatedOctahedronVertices.push(new THREE.Vector3().fromArray(a));
	}
}

/*
	Need a way to rotate them

	Quasicrystals!

	icosahedron - you've got them somewhere
	truncated octahedron (0,±1,±2), whoah
	truncated cuboctahedron (±1, ±(1 + Math.sqrt(2)), ±(1 + 2*Math.sqrt(2)))
	snub cube (±1, ±1/t, ±t) even permutations
	truncated cube
		a = Math.sqrt(2)-1
		(±a, ±1, ±1),
		(±1, ±a, ±1),
		(±1, ±1, ±a)

	hendecahedron
		[
		13 / 7, 3*Math.sqrt(3) / 7, 1, 
		1, Math.sqrt(3), 0, 
		2, Math.sqrt(3), 0.5, 
		2.5, Math.sqrt(3) / 2, 0, 
		2.25, Math.sqrt(3) / 4, 0.5, 
		2, 0, 0, 
		0, 0, 0.5, 
		2, Math.sqrt(3), -0.5, 
		2.25, Math.sqrt(3) / 4, -0.5, 
		0, 0, -0.5, 
		13 / 7, 3*Math.sqrt(3) / 7, -1
		];

	octagonal prism - (1,0,0) and rotate

	triakis truncated tetrahedron - have to work them out

	rhombic dod
	(±1, ±1, ±1); (±2, 0, 0), (0, ±2, 0) and (0, 0, ±2)

	doggy - mirror symmetry but nothing else

	Weaire–Phelan
		"3.1498   0        6.2996
		-3.1498   0        6.2996
		 4.1997   4.1997   4.1997
		 0        6.2996   3.1498
		-4.1997   4.1997   4.1997
		-4.1997  -4.1997   4.1997
		 0       -6.2996   3.1498
		 4.1997  -4.1997   4.1997
		 6.2996   3.1498   0
		-6.2996   3.1498   0
		-6.2996  -3.1498   0
		 6.2996  -3.1498   0
		 4.1997   4.1997  -4.1997
		 0        6.2996  -3.1498
		-4.1997   4.1997  -4.1997
		-4.1997  -4.1997  -4.1997
		 0       -6.2996  -3.1498
		 4.1997  -4.1997  -4.1997
		 3.1498   0       -6.2996
		-3.1498   0       -6.2996"

		"3.14980   3.70039   5
		-3.14980   3.70039   5
		-5         0         5
		-3.14980  -3.70039   5
		 3.14980  -3.70039   5
		 5         0         5
		 4.19974   5.80026   0.80026
		-4.19974   5.80026   0.80026
		-6.85020   0         1.29961
		-4.19974  -5.80026   0.80026
		 4.19974  -5.80026   0.80026
		 6.85020   0         1.29961
		 5.80026   4.19974  -0.80026
		 0         6.85020  -1.29961
		-5.80026   4.19974  -0.80026
		-5.80026  -4.19974  -0.80026
		 0        -6.85020  -1.29961
		 5.80026  -4.19974  -0.80026
		 3.70039   3.14980  -5
		 0         5        -5
		-3.70039   3.14980  -5
		-3.70039  -3.14980  -5
		 0        -5        -5
		 3.70039  -3.14980  -5"
*/