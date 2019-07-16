'use strict';
/*
	Man this was dumb. The center of a cube? madman.
	It was based on the idea that
		if the zoom level is right
		you can be moving smoothly in any 3D direction
		and you'll never see uncontoured molecule

	Ideally (apart from a shader...)

	At least pre-allocate for god's sake

	Better: for each cube in the assemblage
		We test whether it is in the visiBox
		We test which of 9 z-penetrating columns it is in
		If it's not textured we request it

	This is a compsci kind of thing. There is a pool

	TODO
		there is a "cubicles" thing in uglymol's molecules that was good for searching?
		would be nice to have the opacity drop off away from the center
			alpha https://threejs.org/docs/#api/materials/MeshBasicMaterial.alphaMap	https://threejs.org/docs/#api/textures/DataTexture
			Probably won't work but could try having fog, and have it turned off for everything except these
		When you have multiple maps, urgh, only want them one at a time too
*/

function initMapCreationSystem()
{
	let worker = new Worker("mapExtractionAndMeshing.js")

	worker.onmessage = function(event)
	{
		maps[ event.data.mapIndex ].receiveMessageConcerningSelf( event.data );
	}

	Map = function(arrayBuffer, initialIsolevel)
	{
		if(initialIsolevel === undefined)
		{
			initialIsolevel = 3.0
		}

		let map = new THREE.Group();
		maps.push(map);
		assemblage.add(map);

		let isDiffMap = false
		map.toggleDiffMap = function()
		{
			isDiffMap = !isDiffMap
			isolevel = isDiffMap ? 1.5 : initialIsolevel;
		}

		let isolevel = isDiffMap ? 1.5 : initialIsolevel;

		let latestUserCenterOnGrid = null;
		let waitingOnResponse = false;
		let mostRecentBlockIsolevel = Infinity; //we care because there might be some recent arrivals whose isolevel is better than most recent

		let megaContouringToggled = false;

		map.update = function()
		{
			removeABadBlockIfOneExists();

			if( !waitingOnResponse )
			{
				let center = visiBox.getCenterInAssemblageSpace()
				assemblage.localToWorld(center)
				center.multiplyScalar(0.8)
				assemblage.worldToLocal(center)

				let msg = {
					isolevel,
					userCenterOffGrid: center.toArray(),
					chickenWire: false,
					currentCenterOnGrids: [],
					isDiffMap:isDiffMap,
					toggleMegaContouring:false
				};

				for(let i = 0; i < map.children.length; i++)
				{
					if(map.children[i] === map.unitCellMesh) continue;

					if( map.children[i].isolevel === isolevel )
					{
						msg.currentCenterOnGrids.push(map.children[i].centerOnGrid);
					}
				}

				if(megaContouringToggled)
				{
					msg.toggleMegaContouring = true
					msg.currentCenterOnGrids.length = 0;
					megaContouringToggled = false
				}

				for(let i = 0; i < 2; i++)
				{
					if( Math.abs( handControllers[i].thumbStickAxes[1] ) > 0.1 )
					{
						isolevel += 0.06 * Math.pow(handControllers[i].thumbStickAxes[1],3)
						isolevelSign.material.setText("isolevel (RMSD): " + isolevel.toFixed(4))
						msg.currentCenterOnGrids.length = 0;
					}
				}

				this.postMessageConcerningSelf(msg);
				waitingOnResponse = true;
			}
		}

		let isolevelSign = null
		map.receiveMessageConcerningSelf = function(msg)
		{
			waitingOnResponse = false;

			if( msg.userCenterOnGrid)
			{
				latestUserCenterOnGrid = msg.userCenterOnGrid;
			}

			if( msg.centerOnGrid )
			{
				for(let i = 0; i < msg.meshData.length; i++)
				{
					let meshDatum = msg.meshData[i];
					let newBlock = geometricPrimitivesToMesh(meshDatum.color,meshDatum.wireframeGeometricPrimitives,meshDatum.nonWireframeGeometricPrimitives, meshDatum.relativeIsolevel);
					newBlock.isolevel = meshDatum.relativeIsolevel;
					newBlock.centerOnGrid = msg.centerOnGrid;
					map.add( newBlock );
				}

				mostRecentBlockIsolevel = msg.meshData[0].relativeIsolevel;
				for(let i = 0; i < map.children.length; i++)
				{
					if(map.children[i] === map.unitCellMesh) continue;
					map.children[i].visible = Math.abs(map.children[i].isolevel) === Math.abs(mostRecentBlockIsolevel);
				}
			}

			if(msg.orthogonalMatrix)
			{
				map.unitCellMesh = UnitCellMesh( msg.orthogonalMatrix );
				map.add(map.unitCellMesh);
				// map.unitCellMesh.visible = false;
				//TODO make it movable? Keep it centered in visibox?

				//so this is where we're "done" apparently, quite hacky
				objectsToBeUpdated.push(map);

				//you assumed you'd do it coot style, but no reason to
				let displayManagerMenu = MenuOnPanel([
					{string:"		Map"}, //maybe filename
					{string:"				Whole visible", 	switchObject:	map, 				switchProperty:"visible"},
					{string:"				Unit cell visible", switchObject:	map.unitCellMesh, 	switchProperty:"visible"},
					{string:"				Difference map", 	buttonFunction: map.toggleDiffMap },

					{string:"				Chickenwire",buttonFunction:function()
					{
						for(let i = 0; i < map.children.length; i++)
						{
							if( map.children[i] !== map.unitCellMesh)
							{
								map.children[i].back.visible = !map.children[i].back.visible
								// map.children[i].transparent.visible = !map.children[i].transparent.visible
							}
						}
					}},
					{string: "toggle mega-contouring (puke warning!)", buttonFunction:function()
					{
						megaContouringToggled = true
					}},
					{string: "isolevel in RMSD units: " + isolevel.toFixed(4)}
				])
				isolevelSign = displayManagerMenu.textMeshes[displayManagerMenu.textMeshes.length-1]
			}
		}

		function getBlockCenterOffset(block)
		{
			let offset = Array(3);
			for(let i = 0; i < 3; i++)
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
			let blocks = [];
			map.children.forEach( function(child)
			{
				if(child !== map.unitCellMesh)
				{
					blocks.push(child);
				}
			});
			if( blocks.length === 0 )
			{
				return;
			}

			blocks.sort(function(a,b)
			{
				let aHasGoodIsolevel = Math.abs( a.isolevel ) === Math.abs( mostRecentBlockIsolevel )
				let bHasGoodIsolevel = Math.abs( b.isolevel ) === Math.abs( mostRecentBlockIsolevel )
				if( aHasGoodIsolevel && !bHasGoodIsolevel )
				{
					return -1;
				}
				if( !aHasGoodIsolevel && bHasGoodIsolevel )
				{
					return 1;
				}

				let aCenterOffset = getBlockCenterOffset(a);
				let bCenterOffset = getBlockCenterOffset(b);

				let lengthDifference = getArrayVectorLengthSq( aCenterOffset ) - getArrayVectorLengthSq( bCenterOffset );
				if( lengthDifference !== 0 )
				{
					return lengthDifference;
				}
				else
				{
					for(let i = 0; i < 3; i++)
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
				let blockToBeRemoved = blocks.pop();
				
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
			let block = new THREE.Group()

			let geo = new THREE.BufferGeometry();
			geo.addAttribute( 'position',	new THREE.BufferAttribute( nonWireframeGeometricPrimitives.positionArray, 3 ) );
			geo.addAttribute( 'normal',		new THREE.BufferAttribute( nonWireframeGeometricPrimitives.normalArray, 3 ) );
			
			// let transparent = new THREE.Mesh( geo,
			// 	new THREE.MeshPhongMaterial({
			// 		color: color, //less white or bluer. Back should be less blue because nitrogen
			// 		clippingPlanes: visiBox.planes,
			// 		transparent:true,
			// 		opacity:0.36
			// 	}));
			// block.add(block.transparent)

			block.back = new THREE.Mesh( geo,
				new THREE.MeshPhongMaterial({
					color: color,
					clippingPlanes: visiBox.planes,
					side: isDiffMap && relativeIsolevel < 0 ? THREE.FrontSide : THREE.BackSide //probably?
				}));
			block.add(block.back)
			if(map.children.length > 1 && map.children[1].back !== undefined)
			{
				block.back.visible = map.children[1].back.visible
			}

			if(wireframeGeometricPrimitives !== undefined)
			{
				//super high quality
				block.wireframe = wireframeIsomeshFromGeometricPrimitives(wireframeGeometricPrimitives,color);
			}
			else
			{
				block.wireframe = new THREE.LineSegments( new THREE.WireframeGeometry( geo ),
					new THREE.LineBasicMaterial({
						clippingPlanes: visiBox.planes
					}));
			}
			block.add(block.wireframe)

			return block
		}

		map.postMessageConcerningSelf({arrayBuffer:arrayBuffer});
		waitingOnResponse = true;
	}

	let white = new THREE.Color(0xFFFFFF)
	function wireframeIsomeshFromGeometricPrimitives(geometricPrimitives,color)
	{
		let isomesh = new THREE.LineSegments(new THREE.BufferGeometry(),
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
		let CUBE_EDGES = [	[0, 0, 0], [1, 0, 0],
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
		let vertices = CUBE_EDGES.map(function (a)
		{
			return {
				xyz: [  orthogonalMatrix[0] * a[0]  + orthogonalMatrix[1] * a[1]  + orthogonalMatrix[2] * a[2],
					  /*orthogonalMatrix[3] * a[0]*/+ orthogonalMatrix[4] * a[1]  + orthogonalMatrix[5] * a[2],
					  /*orthogonalMatrix[6] * a[0]  + orthogonalMatrix[7] * a[1]*/+ orthogonalMatrix[8] * a[2]]
			};
		});

		let geometry = new THREE.BufferGeometry();
		let pos = new Float32Array(vertices.length * 3);
		if (vertices && vertices[0].xyz)
		{
			for (let i = 0; i < vertices.length; i++)
			{
				let xyz = vertices[i].xyz;
				pos[3*i] = xyz[0];
				pos[3*i+1] = xyz[1];
				pos[3*i+2] = xyz[2];
			}
		}
		else
		{
			for (let i = 0; i < vertices.length; i++)
			{
				let v = vertices[i];
				pos[3*i] = v.x;
				pos[3*i+1] = v.y;
				pos[3*i+2] = v.z;
			}
		}
		geometry.addAttribute('position', new THREE.BufferAttribute(pos, 3));

		let colors = new Float32Array([ 1,0,0,1,0.66667,0,0,1,0,0.66667,1,0,0,0,1,0,0.66667,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0 ]);
		geometry.addAttribute('color', new THREE.BufferAttribute(colors, 3));

		let material = new THREE.LineBasicMaterial({
			vertexColors: THREE.VertexColors,
			linewidth:1,
			clippingPlanes: visiBox.planes,
		})

		return new THREE.LineSegments( geometry, material );
	}
}