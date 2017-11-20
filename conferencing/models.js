/*
 * Change color of carbons as you go down the chain, to give you landmarks. This is interesting. Useful though?
 */

function loadModel(modelURL, thingsToBeUpdated, visiBoxPlanes)
{
	var CPK = { "h": [ 255, 255, 255 ], "he": [ 217, 255, 255 ], "li": [ 204, 128, 255 ], "be": [ 194, 255, 0 ], "b": [ 255, 181, 181 ], "c": [ 144, 144, 144 ], "n": [ 48, 80, 248 ], "o": [ 255, 13, 13 ], "f": [ 144, 224, 80 ], "ne": [ 179, 227, 245 ], "na": [ 171, 92, 242 ], "mg": [ 138, 255, 0 ], "al": [ 191, 166, 166 ], "si": [ 240, 200, 160 ], "p": [ 255, 128, 0 ], "s": [ 255, 255, 48 ], "cl": [ 31, 240, 31 ], "ar": [ 128, 209, 227 ], "k": [ 143, 64, 212 ], "ca": [ 61, 255, 0 ], "sc": [ 230, 230, 230 ], "ti": [ 191, 194, 199 ], "v": [ 166, 166, 171 ], "cr": [ 138, 153, 199 ], "mn": [ 156, 122, 199 ], "fe": [ 224, 102, 51 ], "co": [ 240, 144, 160 ], "ni": [ 80, 208, 80 ], "cu": [ 200, 128, 51 ], "zn": [ 125, 128, 176 ], "ga": [ 194, 143, 143 ], "ge": [ 102, 143, 143 ], "as": [ 189, 128, 227 ], "se": [ 255, 161, 0 ], "br": [ 166, 41, 41 ], "kr": [ 92, 184, 209 ], "rb": [ 112, 46, 176 ], "sr": [ 0, 255, 0 ], "y": [ 148, 255, 255 ], "zr": [ 148, 224, 224 ], "nb": [ 115, 194, 201 ], "mo": [ 84, 181, 181 ], "tc": [ 59, 158, 158 ], "ru": [ 36, 143, 143 ], "rh": [ 10, 125, 140 ], "pd": [ 0, 105, 133 ], "ag": [ 192, 192, 192 ], "cd": [ 255, 217, 143 ], "in": [ 166, 117, 115 ], "sn": [ 102, 128, 128 ], "sb": [ 158, 99, 181 ], "te": [ 212, 122, 0 ], "i": [ 148, 0, 148 ], "xe": [ 66, 158, 176 ], "cs": [ 87, 23, 143 ], "ba": [ 0, 201, 0 ], "la": [ 112, 212, 255 ], "ce": [ 255, 255, 199 ], "pr": [ 217, 255, 199 ], "nd": [ 199, 255, 199 ], "pm": [ 163, 255, 199 ], "sm": [ 143, 255, 199 ], "eu": [ 97, 255, 199 ], "gd": [ 69, 255, 199 ], "tb": [ 48, 255, 199 ], "dy": [ 31, 255, 199 ], "ho": [ 0, 255, 156 ], "er": [ 0, 230, 117 ], "tm": [ 0, 212, 82 ], "yb": [ 0, 191, 56 ], "lu": [ 0, 171, 36 ], "hf": [ 77, 194, 255 ], "ta": [ 77, 166, 255 ], "w": [ 33, 148, 214 ], "re": [ 38, 125, 171 ], "os": [ 38, 102, 150 ], "ir": [ 23, 84, 135 ], "pt": [ 208, 208, 224 ], "au": [ 255, 209, 35 ], "hg": [ 184, 184, 208 ], "tl": [ 166, 84, 77 ], "pb": [ 87, 89, 97 ], "bi": [ 158, 79, 181 ], "po": [ 171, 92, 0 ], "at": [ 117, 79, 69 ], "rn": [ 66, 130, 150 ], "fr": [ 66, 0, 102 ], "ra": [ 0, 125, 0 ], "ac": [ 112, 171, 250 ], "th": [ 0, 186, 255 ], "pa": [ 0, 161, 255 ], "u": [ 0, 143, 255 ], "np": [ 0, 128, 255 ], "pu": [ 0, 107, 255 ], "am": [ 84, 92, 242 ], "cm": [ 120, 92, 227 ], "bk": [ 138, 79, 227 ], "cf": [ 161, 54, 212 ], "es": [ 179, 31, 212 ], "fm": [ 179, 31, 186 ], "md": [ 179, 13, 166 ], "no": [ 189, 13, 135 ], "lr": [ 199, 0, 102 ], "rf": [ 204, 0, 89 ], "db": [ 209, 0, 79 ], "sg": [ 217, 0, 69 ], "bh": [ 224, 0, 56 ], "hs": [ 230, 0, 46 ], "mt": [ 235, 0, 38 ], "ds": [ 235, 0, 38 ], "rg": [ 235, 0, 38 ], "cn": [ 235, 0, 38 ], "uut": [ 235, 0, 38 ], "uuq": [ 235, 0, 38 ], "uup": [ 235, 0, 38 ], "uuh": [ 235, 0, 38 ], "uus": [ 235, 0, 38 ], "uuo": [ 235, 0, 38 ] };
	for(var e in CPK)
	{
		CPK[e][0] /= 255; CPK[e][1] /= 255; CPK[e][2] /= 255;
	}

	DEFAULT_BOND_RADIUS = 0.13;
	DEFAULT_ATOM_RADIUS = DEFAULT_BOND_RADIUS * 3;
	
	function Atom(x,y,z,element,index)
	{
		this.element = element;
		
		this.labelString = "element: " + this.element + "\nindex: " + index;
		
		if(this.element === undefined)
			console.error("unrecognized element: ", element)
		this.position = new THREE.Vector3(x,y,z);
	}
	
	new THREE.PDBLoader().load( modelURL,
		function ( backboneData, atomData )
		{
			var backbones = new THREE.Group();
		
			for(var i = 0, il = backboneData.length; i < il; i++)
			{
				var curve = new THREE.CatmullRomCurve3( backboneData[i] );
				// console.log(backboneData[i])
				var tubeGeometry = new THREE.TubeBufferGeometry( 
						curve,
						backboneData[i].length * 8, DEFAULT_BOND_RADIUS * 5, 16 );
				
				var backbone = new THREE.Mesh( tubeGeometry, new THREE.MeshLambertMaterial({
//					clippingPlanes:visiBoxPlanes
					}));
				backbone.material.color.setRGB(Math.random(),Math.random(),Math.random());
				backbones.add(backbone);
			}
			
			backbones.position.z = -0.3;
			model.add(backbones);
			
			/* Alpha and beta are in pdb file?
			 * OPTIONAL! Plausibly makes it worse, a single tube is less confusing when you're looking at something in density!
			 * to extend along binormal, note that the normal is the 0th index https://github.com/mrdoob/three.js/blob/master/src/geometries/TubeGeometry.js
			 */

			var ballsAndSticks = new THREE.Mesh(new THREE.BufferGeometry(), new THREE.MeshLambertMaterial( { 
				vertexColors: THREE.VertexColors,
//				clippingPlanes:visiBoxPlanes
			} ) );
			model.add(ballsAndSticks);
			
			var numberOfAtoms = atomData.length;
			model.atoms = Array(numberOfAtoms);
			for(var i = 0; i < numberOfAtoms; i++)
			{
				model.atoms[i] = new Atom( atomData[i][0],atomData[i][1],atomData[i][2],atomData[i][3], i);
			}
			
			var lowestUnusedAtom = 0;
			
			var bondData = {};
			{
				for(var element in CPK)
				{
					bondData[element] = [];
				}
				//could make linear time?
				for( var i = 0, il = model.atoms.length; i < il; i++ )
				{
					for( var j = i+1, jl = model.atoms.length; j < jl; j++)
					{
						if( model.atoms[i].position.distanceTo( model.atoms[j].position ) < 1.81 ) //quantum chemistry
						{
							var midPoint = model.atoms[i].position.clone();
							midPoint.lerp( model.atoms[j].position, 0.5 );

							bondData[ model.atoms[i].element ].push( [ 
	                             [ model.atoms[i].position.x, model.atoms[i].position.y, model.atoms[i].position.z ],
	                             [ midPoint.x, midPoint.y, midPoint.z ]
	                           ]
							);
							
							bondData[ model.atoms[j].element ].push( [ 
		                         [ midPoint.x, midPoint.y, midPoint.z ],
		                         [ model.atoms[j].position.x, model.atoms[j].position.y, model.atoms[j].position.z ]
		                       ]
							);
						}
					}
				}
			}

			var numberOfCylinders = 0;
			for(var element in CPK)
				numberOfCylinders += bondData[element].length;
			
			var hydrogenGeometry = new THREE.EfficientSphereGeometry(DEFAULT_BOND_RADIUS);
			var atomGeometry = new THREE.EfficientSphereGeometry(DEFAULT_ATOM_RADIUS);
			atomGeometry.vertexNormals = Array(atomGeometry.vertices.length);
			for(var i = 0, il = atomGeometry.vertices.length; i < il; i++)
				atomGeometry.vertexNormals[i] = atomGeometry.vertices[i].clone().normalize();
			
			var nSphereVertices = atomGeometry.vertices.length;
			var nSphereFaces = atomGeometry.faces.length;
			var cylinderSides = 15;
			
			var numberOfAtoms = model.atoms.length;
			ballsAndSticks.geometry.addAttribute( 'position',new THREE.BufferAttribute(new Float32Array( 3 * (cylinderSides * numberOfCylinders * 2 + numberOfAtoms * nSphereVertices) ), 3) );
			ballsAndSticks.geometry.addAttribute( 'color', 	new THREE.BufferAttribute(new Float32Array( 3 * (cylinderSides * numberOfCylinders * 2 + numberOfAtoms * nSphereVertices) ), 3) ); //Speedup opportunity: you only need as many colors as there are atoms and bonds
			ballsAndSticks.geometry.addAttribute( 'normal',	new THREE.BufferAttribute(new Float32Array( 3 * (cylinderSides * numberOfCylinders * 2 + numberOfAtoms * nSphereVertices) ), 3) );
			ballsAndSticks.geometry.setIndex( new THREE.BufferAttribute(new Uint32Array( 3 * (cylinderSides * numberOfCylinders * 2 + numberOfAtoms * nSphereFaces) ), 1) );
			
			ballsAndSticks.geometry.index.setABC = function(index,a,b,c) //can't use XYZ because itemsize is 1
			{
				this.array[index*3+0] = a;
				this.array[index*3+1] = b;
				this.array[index*3+2] = c;
			}
			
			ballsAndSticks.geometry.colorAtom = function( atomIndex, newColor )
			{
				if(!newColor)
					newColor = CPK[ model.atoms[atomIndex].element ];
				
				for(var k = 0; k < nSphereVertices; k++)
				{
					this.attributes.color.setXYZ( model.atoms[atomIndex].firstVertexIndex + k, 
						newColor[0], 
						newColor[1], 
						newColor[2] );
				}
			}
			
			for(var i = 0, il = model.atoms.length; i < il; i++ )
			{
				model.atoms[i].firstVertexIndex = i*nSphereVertices;
				model.atoms[i].firstFaceIndex = i*nSphereFaces;
				
				ballsAndSticks.geometry.colorAtom(i);
				
				for(var k = 0; k < nSphereVertices; k++)
				{
					if(model.atoms[i].element === 9)
					{
						ballsAndSticks.geometry.attributes.position.setXYZ( model.atoms[i].firstVertexIndex + k, 
								hydrogenGeometry.vertices[k].x + model.atoms[i].position.x, 
								hydrogenGeometry.vertices[k].y + model.atoms[i].position.y, 
								hydrogenGeometry.vertices[k].z + model.atoms[i].position.z );
					}
					else
					{
						ballsAndSticks.geometry.attributes.position.setXYZ( model.atoms[i].firstVertexIndex + k, 
								atomGeometry.vertices[k].x + model.atoms[i].position.x, 
								atomGeometry.vertices[k].y + model.atoms[i].position.y, 
								atomGeometry.vertices[k].z + model.atoms[i].position.z );
					}
					
					ballsAndSticks.geometry.attributes.normal.setXYZ( model.atoms[i].firstVertexIndex + k, 
							atomGeometry.vertexNormals[k].x, 
							atomGeometry.vertexNormals[k].y, 
							atomGeometry.vertexNormals[k].z );
				}
				for(var k = 0; k < nSphereFaces; k++)
				{
					ballsAndSticks.geometry.index.setABC( model.atoms[i].firstFaceIndex + k, 
							atomGeometry.faces[k].a + model.atoms[i].firstVertexIndex, 
							atomGeometry.faces[k].b + model.atoms[i].firstVertexIndex, 
							atomGeometry.faces[k].c + model.atoms[i].firstVertexIndex );
				}
			}
			
			var cylinderBeginning = new THREE.Vector3();
			var cylinderEnd = new THREE.Vector3();
			var firstFaceIndex = model.atoms.length * model.atoms[1].firstFaceIndex;
			var firstVertexIndex = model.atoms.length * model.atoms[1].firstVertexIndex;
			for(var i in CPK )
			{
				for(var j = 0, jl = bondData[i].length; j < jl; j++)
				{
					for(var k = 0; k < cylinderSides; k++)
					{
						ballsAndSticks.geometry.index.setABC(firstFaceIndex+k*2,
							(k*2+1) + firstVertexIndex,
							(k*2+0) + firstVertexIndex,
							(k*2+2) % (cylinderSides*2) + firstVertexIndex );
						
						ballsAndSticks.geometry.index.setABC(firstFaceIndex+k*2 + 1,
							(k*2+1) + firstVertexIndex,
							(k*2+2) % (cylinderSides*2) + firstVertexIndex,
							(k*2+3) % (cylinderSides*2) + firstVertexIndex );
					}
					
					cylinderBeginning.fromArray( bondData[i][j][0] );
					cylinderEnd.fromArray( bondData[i][j][1] );
					
					var bondRadius = DEFAULT_BOND_RADIUS;
		 			if( i === 9) //hydrogen
						bondRadius /= 3;
					else if(bondData[i][j][2] )
						bondRadius /= bondData[i][j][2];
		 			
		 			if(bondData[i][j][2] === 2)
		 				console.log("double?")
					
					insertCylinderCoordsAndNormals( cylinderBeginning, cylinderEnd, ballsAndSticks.geometry.attributes.position, ballsAndSticks.geometry.attributes.normal, cylinderSides, firstVertexIndex, bondRadius );
					
					for(var k = 0, kl = cylinderSides * 2; k < kl; k++)
					{
						ballsAndSticks.geometry.attributes.color.setXYZ( firstVertexIndex + k, 
							CPK[i][0],
							CPK[i][1],
							CPK[i][2] );
					}
					
					firstVertexIndex += cylinderSides * 2;
					firstFaceIndex += cylinderSides * 2;
				}
			}
			
			{
				var averagePosition = new THREE.Vector3();
				for(var i = 0, il = model.atoms.length; i < il; i++)
				{
					averagePosition.add(model.atoms[i].position);
				}
				averagePosition.multiplyScalar( 1 / model.atoms.length);
				
				var furthestDistanceSquared = -1;
				for(var i = 0, il = model.atoms.length; i < il; i++)
				{
					var distSq = averagePosition.distanceToSquared(model.atoms[i].position)
					if(distSq>furthestDistanceSquared)
						furthestDistanceSquared = distSq;
				}
				
				model.position.sub( averagePosition.multiplyScalar(model.scale.x) );
			}
			
			//-----Labels
			{
				var labels = [];
				thingsToBeUpdated.labels = labels;
				
				var updateLabel = function()
				{
					if(!this.visible)
						return;
					this.scale.setScalar( 20 * Math.sqrt(this.getWorldPosition().distanceTo(camera.position)));
					
//					var positionToLookAt = camera.position.clone();
//					this.worldToLocal(positionToLookAt);
//					//and something about up?
//					this.lookAt(positionToLookAt);
				}
				
				var labelMaterial = new THREE.MeshLambertMaterial( { color: 0x156289 });
				model.toggleLabel = function(atomIndex)
				{
					if( this.atoms[atomIndex].label === undefined)
					{
						this.atoms[atomIndex].label = new THREE.Mesh(
							new THREE.TextGeometry( this.atoms[atomIndex].labelString, {size: DEFAULT_BOND_RADIUS * 2, height: DEFAULT_BOND_RADIUS / 2, font: THREE.defaultFont }),
							labelMaterial );
						
						labels.push( this.atoms[atomIndex].label );
						
						this.atoms[atomIndex].label.update = updateLabel;
						
						this.atoms[atomIndex].label.position = this.atoms[atomIndex].position;
						this.add( this.atoms[atomIndex].label );
						
						return;
					}
					else
					{
						if( this.atoms[atomIndex].label.visible )
							this.atoms[atomIndex].label.visible = false;
						else
							this.atoms[atomIndex].label.visible = true;
					}
				}
			}
		},
		function ( xhr ) {}, //progression function
		function ( xhr ) { console.error( "couldn't load PDB" ); }
	);
}

//assumes ourVector is not zeroVector
function randomPerpVector(ourVector){
	var perpVector = new THREE.Vector3();
	
	if( ourVector.equals(zAxis))
		perpVector.crossVectors(ourVector, yAxis);
	else
		perpVector.crossVectors(ourVector, zAxis);
	
	return perpVector;
}

function insertCylinderCoordsAndNormals(A,B, vertexAttribute, normalAttribute, cylinderSides, firstVertexIndex, radius ) {
	var aToB = new THREE.Vector3().subVectors(B,A);
	aToB.normalize();
	var tickVector = randomPerpVector(aToB);
	tickVector.normalize(); 
	for( var i = 0; i < cylinderSides; i++)
	{
		vertexAttribute.setXYZ(  firstVertexIndex + i*2, tickVector.x*radius + A.x,tickVector.y*radius + A.y,tickVector.z*radius + A.z );
		vertexAttribute.setXYZ(firstVertexIndex + i*2+1, tickVector.x*radius + B.x,tickVector.y*radius + B.y,tickVector.z*radius + B.z );
		
		normalAttribute.setXYZ(  firstVertexIndex + i*2, tickVector.x,tickVector.y,tickVector.z );
		normalAttribute.setXYZ(firstVertexIndex + i*2+1, tickVector.x,tickVector.y,tickVector.z );
		
		tickVector.applyAxisAngle(aToB, TAU / cylinderSides);
	}
}














//function planesFromMesh( vertices, indices ) {
//	// creates a clipping volume from a convex triangular mesh
//	// specified by the arrays 'vertices' and 'indices'
//	var n = indices.length / 3,
//		result = new Array( n );
//	for ( var i = 0, j = 0; i < n; ++ i, j += 3 ) {
//		var a = vertices[ indices[   j   ] ],
//			b = vertices[ indices[ j + 1 ] ],
//			c = vertices[ indices[ j + 2 ] ];
//		result[ i ] = new THREE.Plane().
//				setFromCoplanarPoints( a, b, c );
//	}
//	return result;
//}
//function createPlanes( n ) {
//	// creates an array of n uninitialized plane objects
//	var result = new Array( n );
//	for ( var i = 0; i !== n; ++ i )
//		result[ i ] = new THREE.Plane();
//	return result;
//}
//function cylindricalPlanes( n, innerRadius ) {
//	var result = createPlanes( n );
//	for ( var i = 0; i !== n; ++ i ) {
//		var plane = result[ i ],
//			angle = i * Math.PI * 2 / n;
//		plane.normal.set(
//				Math.cos( angle ), 0, Math.sin( angle ) );
//		plane.constant = innerRadius;
//	}
//	return result;
//}
//var planeToMatrix = ( function() {
//	// creates a matrix that aligns X/Y to a given plane
//	// temporaries:
//	var xAxis = new THREE.Vector3(),
//		yAxis = new THREE.Vector3(),
//		trans = new THREE.Vector3();
//	return function planeToMatrix( plane ) {
//		var zAxis = plane.normal,
//			matrix = new THREE.Matrix4();
//		if ( Math.abs( zAxis.x ) > Math.abs( zAxis.z ) ) {
//			yAxis.set( -zAxis.y, zAxis.x, 0 );
//		} else {
//			yAxis.set( 0, -zAxis.z, zAxis.y );
//		}
//		xAxis.crossVectors( yAxis.normalize(), zAxis );
//		plane.coplanarPoint( trans );
//		return matrix.set(
//			xAxis.x, yAxis.x, zAxis.x, trans.x,
//			xAxis.y, yAxis.y, zAxis.y, trans.y,
//			xAxis.z, yAxis.z, zAxis.z, trans.z,
//				0,		0,		0,			1 );
//	};
//} )();
//// A regular tetrahedron for the clipping volume:
//var Vertices = [
//		new THREE.Vector3( + 1,   0, + Math.SQRT1_2 ),
//		new THREE.Vector3( - 1,   0, + Math.SQRT1_2 ),
//		new THREE.Vector3(   0, + 1, - Math.SQRT1_2 ),
//		new THREE.Vector3(   0, - 1, - Math.SQRT1_2 )
//	],
//	Indices = [
//		0, 1, 2,	0, 2, 3,	0, 3, 1,	1, 3, 2
//	],
//	Planes = planesFromMesh( Vertices, Indices ),
//	PlaneMatrices = Planes.map( planeToMatrix ),
//	GlobalClippingPlanes = cylindricalPlanes( 5, 3.5 ),
//	Empty = Object.freeze( [] );
//function init()
//{
//	// Geometry
//	clipMaterial = new THREE.MeshPhongMaterial( {
//		color: 0xee0a10,
//		shininess: 100,
//		side: THREE.DoubleSide,
//		// Clipping setup:
//		clippingPlanes: createPlanes( Planes.length ),
//		clipShadows: true
//	} );
//	object = new THREE.Group();
//	var geometry = new THREE.BoxBufferGeometry( 0.18, 0.18, 0.18 );
//	for ( var z = -2; z <= 2; ++ z )
//	for ( var y = -2; y <= 2; ++ y )
//	for ( var x = -2; x <= 2; ++ x ) {
//		var mesh = new THREE.Mesh( geometry, clipMaterial );
//		mesh.position.set( x / 5, y / 5, z / 5 );
//		mesh.castShadow = true;
//		object.add( mesh );
//	}
//	scene.add( object );
//	var planeGeometry =
//			new THREE.PlaneBufferGeometry( 3, 3, 1, 1 );
//	volumeVisualization = new THREE.Group();
//	volumeVisualization.visible = false;
//	for ( var i = 0, n = Planes.length; i !== n; ++ i ) {
//		var material = new THREE.MeshBasicMaterial( {
//			color:  color.setHSL( i / n, 0.5, 0.5 ).getHex(),
//			side: THREE.DoubleSide,
//			opacity: 0.2,
//			transparent: true,
//			// clip to the others to show the volume (wildly
//			// intersecting transparent planes look bad)
//			clippingPlanes: clipMaterial.clippingPlanes.
//					filter( function( _, j ) { return j !== i; } )
//			// no need to enable shadow clipping - the plane
//			// visualization does not cast shadows
//		} );
//		volumeVisualization.add(
//				new THREE.Mesh( planeGeometry, material ) );
//	}
//	scene.add( volumeVisualization );
//	var ground = new THREE.Mesh( planeGeometry,
//			new THREE.MeshPhongMaterial( {
//				color: 0xa0adaf, shininess: 150 } ) );
//	ground.rotation.x = - Math.PI / 2;
//	ground.scale.multiplyScalar( 3 );
//	ground.receiveShadow = true;
//	scene.add( ground );
//	
//	// Clipping setup:
//	globalClippingPlanes = createPlanes( GlobalClippingPlanes.length );
//	renderer.clippingPlanes = Empty;
//	renderer.localClippingEnabled = true;
//
//	// GUI
//	var gui = new dat.GUI(),
//		folder = gui.addFolder( "Local Clipping" ),
//		props = {
//			get 'Enabled'() { return renderer.localClippingEnabled; },
//			set 'Enabled'( v ) {
//					renderer.localClippingEnabled = v;
//					if ( ! v ) volumeVisualization.visible = false; },
//			get 'Shadows'() { return clipMaterial.clipShadows; },
//			set 'Shadows'( v ) { clipMaterial.clipShadows = v; },
//			get 'Visualize'() { return volumeVisualization.visible; },
//			set 'Visualize'( v ) {
//					if ( renderer.localClippingEnabled )
//						volumeVisualization.visible = v; }
//		};
//	folder.add( props, 'Enabled' );
//	folder.add( props, 'Shadows' );
//	folder.add( props, 'Visualize' ).listen();
//	gui.addFolder( "Global Clipping" ).
//			add( {
//				get 'Enabled'() { return renderer.clippingPlanes !== Empty; },
//				set 'Enabled'( v  ) { renderer.clippingPlanes = v ?
//						globalClippingPlanes : Empty; }
//			}, "Enabled" );
//	// Start
//	startTime = Date.now();
//}
//	
//	clipMaterial.clippingPlanes and globalClippingPlanes are the culprits
//	volumeVisualization.children is where the first comes from
//}


//it's a truncated cone (perspective), and the front face is as close to you as is comfortable. You grab the back rim and resize
//Eh... if the lateral boundaries don't matter, probably you just need near and far!
//Handle could be what you see when you look up with your eyes(not your head), but you don't see it normally, that's distracting
//Spin the rim to make the front move away?
//Jesus stereoscopy, you'd need different things happenning in the renderers. Don't do this, a cone is fine
//Jesus... if people go far with this and it's a very thin slice, it is very much like a 2D screen
//Ideally you also have lamps around your hands
//hmm maybe your hands should be the planes, when you're not holding anything?
//it's a very simple shader to make it spherical