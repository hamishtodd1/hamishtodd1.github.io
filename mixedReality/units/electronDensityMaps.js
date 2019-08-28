'use strict';
/*
	TODO
		there is a "cubicles" thing in uglymol's molecules that was good for searching?
		would be nice to have the opacity drop off away from the center
			alpha https://threejs.org/docs/#api/materials/MeshBasicMaterial.alphaMap	https://threejs.org/docs/#api/textures/DataTexture
			Probably won't work but could try having fog, and have it turned off for everything except these
		When you have multiple maps, urgh, only want them one at a time too
*/

var starProcessingMapData;
function initMapCreationSystem(visiBox)
{
	let worker = new Worker("mapExtractionAndMeshing.js")

	worker.onmessage = function(event)
	{
		maps[ event.data.mapIndex ].receiveMessageConcerningSelf( event.data );
	}

	Map = function(arrayBuffer, isDiffMap)
	{
		// isDiffMap = true;
		var map = new THREE.Group();
		maps.push(map);
		assemblage.add(map);

		var isolevel = isDiffMap ? 3.0 : 1.5;
		var latestUserCenterOnGrid = null;
		var waitingOnResponse = false;
		var mostRecentBlockIsolevel = Infinity; //we care because there might be some recent arrivals whose isolevel is better than most recent

		map.update = function()
		{
			removeABadBlockIfOneExists();

			if( !waitingOnResponse )
			{
				let assemblageSpaceFocalPoint = visiBox.position.clone()
				//when zoomed out the map is a bit far back. You can do better than the below though
				// assemblageSpaceFocalPoint.z += 0.0009 / getAngstrom()
				assemblage.updateMatrixWorld();
				var center = assemblage.worldToLocal( assemblageSpaceFocalPoint );

				var msg = {
					isolevel,
					userCenterOffGrid: assemblageSpaceFocalPoint.toArray(),
					chickenWire: false,
					currentCenterOnGrids: []
				};

				for(var i = 0; i < map.children.length; i++)
				{
					if(map.children[i] === map.unitCellMesh) continue;

					if( map.children[i].isolevel === isolevel )
					{
						msg.currentCenterOnGrids.push(map.children[i].centerOnGrid);
					}
				}

				for(var i = 0; i < 2; i++)
				{
					if( Math.abs( hands[i].thumbStickAxes[1] ) > 0.1 )
					{
						isolevel += 0.06 * hands[i].thumbStickAxes[1] * hands[i].thumbStickAxes[1] * hands[i].thumbStickAxes[1];
						msg.currentCenterOnGrids.length = 0;
					}
				}

				this.postMessageConcerningSelf(msg);
				waitingOnResponse = true;
			}
		}

		map.receiveMessageConcerningSelf = function(msg)
		{
			waitingOnResponse = false;

			if( msg.userCenterOnGrid)
			{
				latestUserCenterOnGrid = msg.userCenterOnGrid;
			}

			if( msg.centerOnGrid )
			{
				for(var i = 0; i < msg.meshData.length; i++)
				{
					var meshDatum = msg.meshData[i];
					var newBlock = geometricPrimitivesToMesh(meshDatum.color,meshDatum.wireframeGeometricPrimitives,meshDatum.nonWireframeGeometricPrimitives, meshDatum.relativeIsolevel);
					newBlock.isolevel = meshDatum.relativeIsolevel;
					newBlock.centerOnGrid = msg.centerOnGrid;
					map.add( newBlock );
				}

				mostRecentBlockIsolevel = msg.meshData[0].relativeIsolevel;
				for(var i = 0; i < map.children.length; i++)
				{
					if(map.children[i] === map.unitCellMesh) continue;
					map.children[i].visible = Math.abs(map.children[i].isolevel) === Math.abs(mostRecentBlockIsolevel);
				}
			}

			if(msg.orthogonalMatrix)
			{
				map.unitCellMesh = UnitCellMesh( msg.orthogonalMatrix );
				map.add(map.unitCellMesh);
				map.unitCellMesh.visible = false;
				//TODO make it movable? Keep it centered in visibox?

				updatables.push(map);
			}
		}

		function getBlockCenterOffset(block)
		{
			var offset = Array(3);
			for(var i = 0; i < 3; i++)
			{
				offset[i] = block.centerOnGrid[i]-latestUserCenterOnGrid[i]
			}
			return offset;
		}
		function getArrayVectorLengthSq(array)
		{
			return array[0]*array[0] + array[1]*array[1] + array[2]*array[2];
		}

		function removeABadBlockIfOneExists()
		{
			var blocks = [];
			map.children.forEach( function(child)
			{
				if(child !== map.unitCellMesh)
				{
					blocks.push(child);
				}
			});
			if(!blocks.length)
			{
				return;
			}

			blocks.sort(function(a,b)
			{
				var aHasGoodIsolevel = Math.abs( a.isolevel ) === Math.abs( mostRecentBlockIsolevel )
				var bHasGoodIsolevel = Math.abs( b.isolevel ) === Math.abs( mostRecentBlockIsolevel )
				if( aHasGoodIsolevel && !bHasGoodIsolevel )
				{
					return -1;
				}
				if( !aHasGoodIsolevel && bHasGoodIsolevel )
				{
					return 1;
				}

				var aCenterOffset = getBlockCenterOffset(a);
				var bCenterOffset = getBlockCenterOffset(b);

				var lengthDifference = getArrayVectorLengthSq( aCenterOffset ) - getArrayVectorLengthSq( bCenterOffset );
				if( lengthDifference !== 0 )
				{
					return lengthDifference;
				}
				else
				{
					for(var i = 0; i < 3; i++)
					{
						if( aCenterOffset[i] < bCenterOffset[i] )
						{
							return -1;
						}
						else if( aCenterOffset[i] > bCenterOffset[i] )
						{
							return 1;
						}
					}
					return 0;
				}
			});

			if( ( Math.abs( blocks[blocks.length-1].isolevel ) !== Math.abs( mostRecentBlockIsolevel ) ) ||
				(!isDiffMap && blocks.length > 27) ||
				( isDiffMap && blocks.length > 27 * 2) )
			{
				var blockToBeRemoved = blocks.pop();
				
				removeAndRecursivelyDispose(blockToBeRemoved);
			}
		}

		map.postMessageConcerningSelf = function(msg)
		{
			msg.mapIndex = maps.indexOf(this);
			worker.postMessage(msg);
		}

		function geometricPrimitivesToMesh(color, wireframeGeometricPrimitives, nonWireframeGeometricPrimitives, relativeIsolevel)
		{
			if( nonWireframeGeometricPrimitives === undefined )
			{
				return wireframeIsomeshFromGeometricPrimitives(wireframeGeometricPrimitives,color)
			}
			else
			{
				var geo = new THREE.BufferGeometry();
				geo.addAttribute( 'position',	new THREE.BufferAttribute( nonWireframeGeometricPrimitives.positionArray, 3 ) );
				geo.addAttribute( 'normal',		new THREE.BufferAttribute( nonWireframeGeometricPrimitives.normalArray, 3 ) );
				
				// var transparent = new THREE.Mesh( geo,
				// 	new THREE.MeshPhongMaterial({
				// 		color: color, //less white or bluer. Back should be less blue because nitrogen
				// 		clippingPlanes: visiBox.planes,
				// 		transparent:true,
				// 		opacity:0.36
				// 	}));
				var back = new THREE.Mesh( geo,
					new THREE.MeshPhongMaterial({
						color: color,
						clippingPlanes: visiBox.planes,
						side: isDiffMap && relativeIsolevel < 0 ? THREE.FrontSide : THREE.BackSide //probably?
					}));

				if(wireframeGeometricPrimitives !== undefined)
				{
					//super high quality
					var wireframe = wireframeIsomeshFromGeometricPrimitives(wireframeGeometricPrimitives,color);
				}
				else
				{
					var wireframe = new THREE.LineSegments( new THREE.WireframeGeometry( geo ),
						new THREE.LineBasicMaterial({
							clippingPlanes: visiBox.planes
						}));
				}

				return new THREE.Group().add(
					wireframe,
					// transparent,
					back)
			}
		}

		map.postMessageConcerningSelf({arrayBuffer:arrayBuffer,isDiffMap:isDiffMap});
		waitingOnResponse = true;
	}

	var white = new THREE.Color(0xFFFFFF)
	function wireframeIsomeshFromGeometricPrimitives(geometricPrimitives,color)
	{
		var isomesh = new THREE.LineSegments(new THREE.BufferGeometry(),
			new THREE.LineBasicMaterial({
				color: color,
				linewidth: 1.25,
				clippingPlanes: visiBox.planes
			}));
		isomesh.material.color.lerp(white,0.5)
		isomesh.geometry.addAttribute('position', new THREE.BufferAttribute(new Float32Array(geometricPrimitives.vertices), 3));
		isomesh.geometry.setIndex(new THREE.BufferAttribute(new Uint32Array(geometricPrimitives.segments), 1));
		return isomesh;
	}

	function UnitCellMesh(orthogonalMatrix)
	{
		var CUBE_EDGES = [	[0, 0, 0], [1, 0, 0],
							[0, 0, 0], [0, 1, 0],
							[0, 0, 0], [0, 0, 1],
							[1, 0, 0], [1, 1, 0],
							[1, 0, 0], [1, 0, 1],
							[0, 1, 0], [1, 1, 0],
							[0, 1, 0], [0, 1, 1],
							[0, 0, 1], [1, 0, 1],
							[0, 0, 1], [0, 1, 1],
							[1, 0, 1], [1, 1, 1],
							[1, 1, 0], [1, 1, 1],
							[0, 1, 1], [1, 1, 1] ];
		var vertices = CUBE_EDGES.map(function (a)
		{
			return {
				xyz: [  orthogonalMatrix[0] * a[0]  + orthogonalMatrix[1] * a[1]  + orthogonalMatrix[2] * a[2],
					  /*orthogonalMatrix[3] * a[0]*/+ orthogonalMatrix[4] * a[1]  + orthogonalMatrix[5] * a[2],
					  /*orthogonalMatrix[6] * a[0]  + orthogonalMatrix[7] * a[1]*/+ orthogonalMatrix[8] * a[2]]
			};
		});

		var geometry = new THREE.BufferGeometry();
		var pos = new Float32Array(vertices.length * 3);
		if (vertices && vertices[0].xyz)
		{
			for (var i = 0; i < vertices.length; i++)
			{
				var xyz = vertices[i].xyz;
				pos[3*i] = xyz[0];
				pos[3*i+1] = xyz[1];
				pos[3*i+2] = xyz[2];
			}
		}
		else
		{
			for (var i = 0; i < vertices.length; i++)
			{
				var v = vertices[i];
				pos[3*i] = v.x;
				pos[3*i+1] = v.y;
				pos[3*i+2] = v.z;
			}
		}
		geometry.addAttribute('position', new THREE.BufferAttribute(pos, 3));

		var colors = new Float32Array([ 1,0,0,1,0.66667,0,0,1,0,0.66667,1,0,0,0,1,0,0.66667,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1 ]);
		geometry.addAttribute('color', new THREE.BufferAttribute(colors, 3));

		return new THREE.LineSegments( geometry, new THREE.LineBasicMaterial({vertexColors: THREE.VertexColors, linewidth:1}) );
	}
}