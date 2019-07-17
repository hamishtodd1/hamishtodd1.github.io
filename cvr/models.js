/*
	When you come to refactor this:
		The cylinders and spheres (separate arrays) are a "resource"
		You can change their color. They don't need an order
		When an atom is deleted, you make an "orphan" sphere and cylinder with all vertices 0
		When an atom is added, go through the spheres and cylinders and find orphans

	Raycasting
		Hybrid demo https://github.com/gam0022/webgl-sandbox/blob/master/raymarching_hybrid.html https://gam0022.net/webgl/#raymarching_hybrid


 * Change color of carbons as you go down the chain, to give you landmarks. This is interesting. Useful though?
 */

/*
 * Ribbon
 * 
	1. Get all carbon alphas, ribbon will go through all of them
	2. For all points, look at point just before and just after. Normal+tangent vector is in the same plane as all 3.
	3. For all carbon alphas, look at the one just in front and cubic bezier to get a curve connecting the two
	4. "Extrude a tube" going along all these connected curves
	
	OPTIONAL! Plausibly makes it worse, a single tube is less confusing when you're looking at something in density!
	5. At places along tube where there are alpha helices and beta sheets, "thicken" tube along the curve's binomial vector.
	6. AAs which are part of an alpha helix or beta sheet are listed in pdb file
 */



function changeBondBetweenAtomsToDouble(bondData, atomA, atomB)
{
	for(var j = 0; j < bondData.length; j++)
	{
		for(var i = 0; i < bondData[j].length; i++)
		{
			if( (atomA === bondData[j][i][3] && atomB === bondData[j][i][4])
			 || (atomB === bondData[j][i][3] && atomA === bondData[j][i][4]) )
			{
				bondData[j][i][2] = 2;
			}
		}
	}
}

function initModelCreationSystem()
{
	var cylinderSides = 15;

	getModelWithImol = function(imol)
	{
		for(var i = 0; i < models.length; i++)
		{
			if(models[i].imol == imol)
			{
				return models[i]
			}
		}
		console.error("no model with imol ", imol)
	}

	var defaultBondRadius = 0.055;

	var hydrogenGeometry = new THREE.EfficientSphereGeometry(defaultBondRadius * 2.5);
	var atomGeometry = new THREE.EfficientSphereGeometry(defaultBondRadius * 5);
	atomGeometry.vertexNormals = Array(atomGeometry.vertices.length);
	for(var i = 0, il = atomGeometry.vertices.length; i < il; i++)
	{
		atomGeometry.vertexNormals[i] = atomGeometry.vertices[i].clone().normalize();
	}
	
	var nSphereVertices = atomGeometry.vertices.length;
	var nSphereFaces = atomGeometry.faces.length;

	makeModelFromCootString = function( modelStringCoot, callback )
	{
		//position, isHydrogen, spec, "residue"
		var modelStringTranslated = modelStringCoot.replace(/(\()|(\))|(Fa)|(Tr)|(1 "model")/g, function(str,p1,p2,p3,p4,p5,p6,p7)
		{
	        if(p1) return "[";
	        if(p2) return "]";
	        if(p3) return "fa";
	        if(p4) return "tr";
	        if(p5) return "'model 1'";
			// if(p6||p7) return ""; //|(\])|(\[)
	    });
	    var cootArray = eval(modelStringTranslated);

	    if( typeof cootArray[0] === "string")
	    {
	    	//we have a bunch of things, preceded by their names. Necessary given the label?
	    	var modelNumber = cootArray[0]
			var atomDataFromCoot = cootArray[1];
			var bondDataFromCoot = cootArray[3];

			// if(cootArray.length>2)
			// {
			// 	console.error("got more than one model in there!")
			// }
	    }
	    else
	    {
	    	var atomDataFromCoot = cootArray[0];
			var bondDataFromCoot = cootArray[1];
	    }
		
		var numberOfAtoms = 0;
		for(var i = 0, il = atomDataFromCoot.length; i < il; i++ )
		{
			numberOfAtoms += atomDataFromCoot[i].length;
		}
		var modelAtoms = Array(numberOfAtoms);

		let coordArray = null
		let detailsArray = null
		for(var i = 0, il = atomDataFromCoot.length; i < il; i++) //coot orders them by color, not us!
		{
			for(var j = 0, jl = atomDataFromCoot[i].length; j < jl; j++) //atoms
			{
				coordArray = atomDataFromCoot[i][j][0]
				detailsArray = atomDataFromCoot[i][j][2]
				modelAtoms[atomDataFromCoot[i][j][3]] = new Atom(
					i, 
					new THREE.Vector3().fromArray(coordArray),
					detailsArray[0],
					detailsArray[1],
					detailsArray[2],
					detailsArray[3],
					detailsArray[4],
					detailsArray[5] );
			}
		}

		//ok so you want the above to just give you bond data and model atoms
		//which are then fed into the below

		var model = makeMoleculeMesh(modelAtoms, true, bondDataFromCoot);
		model.carbonAlphaPositions = [];
		for(var i = 0, il = model.atoms.length; i < il; i++)
		{
			if(model.atoms[i].name === " CA ")
			{
				model.carbonAlphaPositions[model.atoms[i].resNo] = model.atoms[i].position;
			}
		}
		
		model.imol = model.atoms[0].imol;
		
		putModelInAssemblage(model)
	}

	putModelInAssemblage = function(model)
	{
		assemblage.add(model);
		models.push(model);

		// if(models.length === 1)
		// {
		// 	var averagePosition = new THREE.Vector3();
		// 	for(var i = 0, il = model.atoms.length; i < il; i++)
		// 	{
		// 		averagePosition.add(model.atoms[i].position);
		// 	}
		// 	averagePosition.multiplyScalar( 1 / model.atoms.length);
		// 	assemblage.localToWorld(averagePosition)
		// 	assemblage.position.sub( averagePosition )
		// 	let worldLocationTheyShouldBeAt = assemblage.localToWorld( visiBox.getCenterInAssemblageSpace() )
		// 	assemblage.position.add(worldLocationTheyShouldBeAt);
		// }

		addModelDisplayManager(model)

		return model;
	}

	atomArrayFromElementsAndCoords = function(elements,coords)
	{
		var atoms = Array(elements.length);
		for(var i = 0; i < atoms.length; i++)
		{
			atoms[i] = new Atom( elements[i], new THREE.Vector3().fromArray(coords,3*i) );
		}
		return atoms
	}
	makeModelFromElementsAndCoords = function(elements,coords)
	{
		let atoms = atomArrayFromElementsAndCoords(elements,coords)
		return makeMoleculeMesh( atoms, false );
	}

	putPdbStringIntoAssemblage = function(pdbString)
	{
		//uglymol has parser but not necessary probably
		let atomsAndResidues = parsePdb( pdbString );
		let model = makeMoleculeMesh( atomsAndResidues.atoms, true )
		model.residues = atomsAndResidues.residues

		let lowestUnusedImol = 0
		for(let i = 0; i < models.length; i++)
		{
			if(models[i].imol === lowestUnusedImol)
			{
				lowestUnusedImol++
			}
		}
		model.imol = lowestUnusedImol

		putModelInAssemblage(model)
	}

	makeMoleculeMesh = function( atoms, clip, bondDataFromCoot )
	{
		var moleculeMesh = new THREE.Mesh(new THREE.BufferGeometry(), new THREE.MeshLambertMaterial( { 
			vertexColors: THREE.VertexColors
		} ) );
		moleculeMesh.atoms = atoms;

		moleculeMesh.cloneWithAtoms = function()
		{
			let clone = moleculeMesh.clone()
			clone.atoms = Array(moleculeMesh.atoms.length)
			for(let i = 0; i < clone.atoms.length; i++)
			{
				clone.atoms[i] = moleculeMesh.atoms[i].clone()
			}
			return clone
		}

		if(clip)
		{
			moleculeMesh.material.clippingPlanes = visiBox.planes;
		}

		var bufferGeometry = moleculeMesh.geometry;

		var atomColors = Array(10);
		atomColors[0] = standardAtomColors["carbon"]
		atomColors[1] = standardAtomColors["sulphur"]
		atomColors[2] = standardAtomColors["oxygen"]
		atomColors[3] = standardAtomColors["nitrogen"]
		atomColors[4] = new THREE.Color( 0.2,0.2,0.2 )
		atomColors[5] = new THREE.Color( 0.2,0.2,0.2 )
		atomColors[6] = standardAtomColors["phosphorus"]
		atomColors[7] = new THREE.Color( 0.2,0.2,0.2 )
		atomColors[8] = new THREE.Color( 0.2,0.2,0.2 )
		atomColors[9] = standardAtomColors["hydrogen"]

		var bondData;
		if( bondDataFromCoot )
		{
			bondData = bondDataFromCoot;
		}
		else
		{
			bondData = Array(10);
			for(var i = 0; i < bondData.length; i++)
			{
				bondData[i] = [];
			}

			// if( atoms.length > 100 )
			// {
			// 	console.warn("We've been requested to calculate bond distances for ", atoms.length, " atoms")
			// }
			// else
			{
				for( var i = 0, il = atoms.length; i < il; i++ )
				{
					for( var j = i+1, jl = atoms.length; j < jl; j++)
					{
						if( atoms[i].position.distanceTo( atoms[j].position ) < 1.81 ) //quantum chemistry
						{
							// if(atoms[i].name !== " O  ")
							// {
								//position position, bondNumber, index index
								bondData[ atoms[i].element ].push( [[],[],1,i,j]);
								// bondData[ atoms[i].element ].push( [[],[],1,j,i]);
							// }
							// else
							// {
							// 	bondData[ atoms[i].element ].push( [[],[],2,i,j]);
							// 	bondData[ atoms[i].element ].push( [[],[],2,j,i]);
							// }
						}
					}
				}
			}
		}

		var numberOfCylinders = 0;
		for(var i = 0, il = bondData.length; i < il; i++ )
		{
			for(var j = 0, jl = bondData[i].length; j < jl; j++)
			{
				//TODO
				if( bondData[i][j][3] === -1 || bondData[i][j][4] === -1 )
				{
					continue;
				}
				var atom = atoms[bondData[i][j][3]];
				var bondPartner = atoms[ bondData[i][j][4] ];

				if(atom.bondPartners.indexOf(bondPartner) !== -1)
				{
					continue;
				}

				atom.bondPartners.push( bondPartner );
				bondPartner.bondPartners.push( atom );
				numberOfCylinders += 2;

				if( bondData[i][j][2] > 1)
				{
					atom.extraBondPartners.push(bondPartner)
					bondPartner.extraBondPartners.push( atom );
					numberOfCylinders += 2;

					if( bondData[i][j][2] !== 2)
					{
						console.log( "You have work to do on bonds!", bondData[i][j][2] )
					}
				}
			}
		}

		var numberOfAtoms = atoms.length;

		//Speedup opportunity: you only need as many colors as there are atoms and bonds, not as many as there are triangles.
		//we are assuming fixed length for all these arrays and that is it
		bufferGeometry.addAttribute( 'position',new THREE.BufferAttribute(new Float32Array( 3 * (cylinderSides * numberOfCylinders * 2 + numberOfAtoms * nSphereVertices) ), 3) );
		bufferGeometry.addAttribute( 'color', 	new THREE.BufferAttribute(new Float32Array( 3 * (cylinderSides * numberOfCylinders * 2 + numberOfAtoms * nSphereVertices) ), 3) );
		bufferGeometry.addAttribute( 'normal',	new THREE.BufferAttribute(new Float32Array( 3 * (cylinderSides * numberOfCylinders * 2 + numberOfAtoms * nSphereVertices) ), 3) );
		bufferGeometry.setIndex( new THREE.BufferAttribute(new Uint32Array( 3 * (cylinderSides * numberOfCylinders * 2 + numberOfAtoms * nSphereFaces) ), 1) );

		//can't use XYZ because itemsize is 1
		bufferGeometry.index.setABC = function(index,a,b,c)
		{
			this.array[ index*3+0 ] = a;
			this.array[ index*3+1 ] = b;
			this.array[ index*3+2 ] = c;
		}
		
		moleculeMesh.colorAtom = function( atom, newColor )
		{
			if(!newColor)
			{
				newColor = atomColors[ atom.element ];
			}
			
			for(var k = 0; k < nSphereVertices; k++)
			{
				this.geometry.attributes.color.setXYZ( atom.firstVertexIndex + k, 
					newColor.r, 
					newColor.g, 
					newColor.b );
			}

			this.geometry.attributes.color.needsUpdate = true;

			for(var k = 0, kl = cylinderSides * 2; k < kl; k++)
			{
				for(var j = 0, jl = atom.bondPartners.length; j < jl; j++)
				{
					this.geometry.attributes.color.setXYZ( atom.bondFirstVertexIndices[j] + k,
						newColor.r,
						newColor.g,
						newColor.b );
				}
				for(var j = 0, jl = atom.extraBondPartners.length; j < jl; j++)
				{
					this.geometry.attributes.color.setXYZ( atom.extraBondFirstVertexIndices[j] + k,
						newColor.r,
						newColor.g,
						newColor.b );
				}
			}
		}

		moleculeMesh.setAtomRepresentationPosition = function( atom, newPosition )
		{
			if(newPosition)
			{
				atom.position.copy(newPosition);
			}

			var sourceGeometry = atomGeometry;
			var bondRadius = defaultBondRadius;
			if(atom.element === 9)
			{
				sourceGeometry = hydrogenGeometry;
				// bondRadius /= 3
			}

			for(var k = 0; k < nSphereVertices; k++)
			{
				this.geometry.attributes.position.setXYZ( atom.firstVertexIndex + k, 
						sourceGeometry.vertices[k].x + atom.position.x, 
						sourceGeometry.vertices[k].y + atom.position.y, 
						sourceGeometry.vertices[k].z + atom.position.z );
			}

			for(var i = 0, il = atom.bondPartners.length; i < il; i++)
			{
				var bondPartner = atom.bondPartners[i];
				var midPoint = atom.position.clone().lerp(bondPartner.position,0.5);
				var extraBondIndex = atom.extraBondPartners.indexOf(bondPartner);

				if( extraBondIndex === -1 )
				{
					refreshCylinderCoordsAndNormals( atom.position, midPoint, atom.bondFirstVertexIndices[i],
						this.geometry, cylinderSides, bondRadius );

					var bfviFromPartnersPov = bondPartner.bondFirstVertexIndices[ bondPartner.bondPartners.indexOf( atom ) ];
					refreshCylinderCoordsAndNormals( bondPartner.position, midPoint, bfviFromPartnersPov,
						this.geometry, cylinderSides, bondRadius );
				}
				else
				{
					//ideally the perp vector would be in same plane as other bonds
					//WON'T WORK WHEN YOU MOVE A DOUBLE BOND
					var bondVector = bondPartner.position.clone().sub(atom.position)
					var addition = randomPerpVector(bondVector).setLength(bondRadius*1.5);

					var leftStart = atom.position.clone().add(addition);
					var leftEnd = midPoint.clone().add(addition);

					refreshCylinderCoordsAndNormals( leftStart, leftEnd, atom.bondFirstVertexIndices[i],
						this.geometry, cylinderSides, bondRadius );

					addition.negate();
					var rightStart = atom.position.clone().add(addition);
					var rightEnd = midPoint.clone().add(addition);

					refreshCylinderCoordsAndNormals( rightStart, rightEnd, atom.extraBondFirstVertexIndices[extraBondIndex],
						this.geometry, cylinderSides, bondRadius );
				}
			}
			this.geometry.attributes.position.needsUpdate = true;

			if(atom.label)
			{
				atom.label.position.copy(atom.position)
			}
		}
		
		var cylinderFirstFaceIndex = atoms.length * nSphereFaces;
		var cylinderFirstVertexIndex = atoms.length * nSphereVertices;
		for(var i = 0, il = atoms.length; i < il; i++ )
		{
			var atom = atoms[i];
			atom.firstVertexIndex = i*nSphereVertices;
			atom.firstFaceIndex = i*nSphereFaces;
			
			for(var k = 0; k < nSphereVertices; k++)
			{
				bufferGeometry.attributes.normal.setXYZ( atom.firstVertexIndex + k, 
						atomGeometry.vertexNormals[k].x, 
						atomGeometry.vertexNormals[k].y, 
						atomGeometry.vertexNormals[k].z );
			}
			for(var k = 0; k < nSphereFaces; k++)
			{
				bufferGeometry.index.setABC( atom.firstFaceIndex + k, 
						atomGeometry.faces[k].a + atom.firstVertexIndex, 
						atomGeometry.faces[k].b + atom.firstVertexIndex, 
						atomGeometry.faces[k].c + atom.firstVertexIndex );
			}

			for(var j = 0, jl = atom.bondPartners.length; j < jl; j++)
			{
				atom.bondFirstVertexIndices.push(cylinderFirstVertexIndex);
				insertCylinderFaceIndices( bufferGeometry, cylinderSides, cylinderFirstFaceIndex, cylinderFirstVertexIndex);

				cylinderFirstVertexIndex += cylinderSides * 2;
				cylinderFirstFaceIndex += cylinderSides * 2;

				if( atom.extraBondPartners.indexOf( atom.bondPartners[j] ) !== -1)
				{
					atom.extraBondFirstVertexIndices.push(cylinderFirstVertexIndex);
					insertCylinderFaceIndices(bufferGeometry, cylinderSides, cylinderFirstFaceIndex, cylinderFirstVertexIndex);
					
					cylinderFirstVertexIndex += cylinderSides * 2;
					cylinderFirstFaceIndex += cylinderSides * 2;
				}
			}

			moleculeMesh.colorAtom(atom);
			moleculeMesh.setAtomRepresentationPosition(atom)
		}

		// var traceGeometry = new THREE.TubeBufferGeometry(
		// 		new THREE.CatmullRomCurve3( carbonAlphas ),
		// 		carbonAlphas.length*8, 0.1, 16 );
		// var trace = new THREE.Mesh( tubeGeometry, new THREE.MeshLambertMaterial({color:0xFF0000}));

		return moleculeMesh;
	}

	var highlightColor = new THREE.Color(1,1,1);
	highlightResiduesOverlappingSphere = function(sphericalObject, radiusSquared)
	{
		for(var i = 0; i < models.length; i++)
		{
			var localPosition = new THREE.Vector3();
			sphericalObject.getWorldPosition(localPosition);
			models[i].updateMatrixWorld();
			models[i].worldToLocal(localPosition);
			
			for(var j = 0, jl = models[i].atoms.length; j < jl; j++)
			{
				if( models[i].atoms[j].position.distanceToSquared( localPosition ) < radiusSquared )
				{
					if(!models[i].atoms[j].selected)
					{
						models[i].atoms[j].selected = true;

						for(var k = 0, kl = models[i].atoms.length; k < kl; k++)
						{
							if(models[i].atoms[k].resNo === models[i].atoms[j].resNo)
							{
								models[i].colorAtom(models[i].atoms[k], highlightColor);
							}
						}
					}
				}
				else
				{
					if( models[i].atoms[j].selected )
					{
						models[i].atoms[j].selected = false;

						for(var k = 0, kl = models[i].atoms.length; k < kl; k++)
						{
							if(models[i].atoms[k].resNo === models[i].atoms[j].resNo)
							{
								models[i].colorAtom(models[i].atoms[k]);
							}
						}
					}
				}
			}
		}
	}

	turnOffAllHighlights = function()
	{
		for(var i = 0; i < models.length; i++)
		{
			for(var j = 0, jl = models[i].atoms[j].length; j < jl; j++)
			{
				if( models[i].atoms[j].selected )
				{
					models[i].atoms[j].selected = false;

					for(var k = 0, kl = models[i].atoms.length; k < kl; k++)
					{
						if(models[i].atoms[k].resNo === models[i].atoms[j].resNo)
						{
							models[i].colorAtom(models[i].atoms[k]);
						}
					}
				}
			}
		}
	}

	//------------Socket
	{
		function getAtomWithSpecContainedInHere(objectOrArrayContainingSpec)
		{
			if(objectOrArrayContainingSpec.imol !== undefined)
			{
				var model = getModelWithImol(objectOrArrayContainingSpec.imol);

				for( var i = 0, il = model.atoms.length; i < il; i++ )
				{
					if( model.atoms[i].chainId === objectOrArrayContainingSpec.chainId &&
						model.atoms[i].resNo === objectOrArrayContainingSpec.resNo &&
						model.atoms[i].insertionCode === objectOrArrayContainingSpec.insertionCode &&
						model.atoms[i].name === objectOrArrayContainingSpec.name &&
						model.atoms[i].altloc === objectOrArrayContainingSpec.altloc )
					{
						return model.atoms[i];
					}
				}
			}
			else
			{
				var model = (objectOrArrayContainingSpec[0] === -1 ? models[0]:models[objectOrArrayContainingSpec[0]]);

				for( var i = 0, il = model.atoms.length; i < il; i++ )
				{
					if( model.atoms[i].chainId === objectOrArrayContainingSpec[1] &&
						model.atoms[i].resNo === objectOrArrayContainingSpec[2] &&
						model.atoms[i].insertionCode === objectOrArrayContainingSpec[3] &&
						model.atoms[i].name === objectOrArrayContainingSpec[4] &&
						model.atoms[i].altloc === objectOrArrayContainingSpec[5] )
					{
						return model.atoms[i];
					}
				}
			}
			
			console.error("couldn't find atom with requested spec")
		}

		function removeBond()
		{
			//the below
		}

		// socket.commandReactions.deleteAtom = function(msg)
		// {
		// 	var atom = getAtomWithSpecContainedInHere(msg);
		// 	var model = getModelWithImol(atom.imol);

		// 	for(var i = 0; i < atom.bondPartners.length; i++)
		// 	{
		// 		refreshCylinderCoordsAndNormals( zeroVector, zeroVector, atom.bondFirstVertexIndices[i],
		// 			model.geometry, cylinderSides, 0 );

		// 		var indexInBondPartnersArray = atom.bondPartners[i].bondPartners.indexOf(atom);

		// 		var bondFirstVertexIndex = atom.bondPartners[i].bondFirstVertexIndices[indexInBondPartnersArray];
		// 		refreshCylinderCoordsAndNormals( zeroVector, zeroVector, bondFirstVertexIndex,
		// 			model.geometry, cylinderSides, 0 );

		// 		atom.bondPartners[i].bondPartners.splice(indexInBondPartnersArray, 1);
		// 		atom.bondPartners[i].bondFirstVertexIndices.splice(indexInBondPartnersArray, 1);

		// 		var iDouble = atom.extraBondPartners.indexOf(i);
		// 		if( iDouble !== -1)
		// 		{
		// 			refreshCylinderCoordsAndNormals( zeroVector, zeroVector, atom.extraBondFirstVertexIndices[iDouble],
		// 				model.geometry, cylinderSides, 0 );

		// 			var indexInBondPartnersOtherArray = atom.extraBondPartners[iDouble].bondPartners.indexOf(atom);

		// 			var extraBondFirstVertexIndex = atom.bondPartners[i].extraBondFirstVertexIndices[indexInBondPartnersOtherArray];
		// 			console.log(extraBondFirstVertexIndex)
		// 			refreshCylinderCoordsAndNormals( zeroVector, zeroVector, extraBondFirstVertexIndex,
		// 				model.geometry, cylinderSides, 0 );

		// 			atom.bondPartners[i].extraBondPartners.splice(indexInBondPartnersOtherArray, 1);
		// 			atom.bondPartners[i].extraBondFirstVertexIndices.splice(indexInBondPartnersOtherArray, 1);

		// 			//TODO test this
		// 		}
		// 	}
		// 	for(var k = 0; k < nSphereVertices; k++)
		// 	{
		// 		model.geometry.attributes.position.setXYZ( atom.firstVertexIndex + k, 0, 0, 0 );
		// 	}

		// 	model.geometry.attributes.position.needsUpdate = true;

		// 	removeSingleElementFromArray(model.atoms, atom)
		// 	delete atom;

		// 	return true;
		// }

		// socket.commandReactions.residueInfo = function(msg)
		// {
		// 	/*
		// 	0: [atom-name, alt-conf]
		// 	1: [occ b-factor ele seg-id]
		// 	2: new position
		// 	3: index
		// 	*/
		// 	var model = getModelWithImol(msg.imol);
		// 	for(var i = 0, il = msg.atoms.length; i < il; i++)
		// 	{
		// 		var atom = model.atoms[msg.atoms[i][3]];
		// 		atom.position.fromArray( msg.atoms[i][2] );
		// 		model.setAtomRepresentationPosition(atom);
		// 	} 
		// 	model.geometry.attributes.position.needsUpdate = true;
		// }

		// //could they have different connectivity? :/
		// socket.commandReactions.intermediateRepresentation = function(msg)
		// {
		// 	// console.log("receiving?")
		// 	var model = getModelWithImol(msg.imol);

		// 	var arrayWithSpecs = msg.intermediateRepresentation[0];
		// 	for(var i = 0; i < arrayWithSpecs.length; i++)
		// 	{
		// 		for(var j = 0; j < arrayWithSpecs[i].length; j++)
		// 		{
		// 			var atom = getAtomWithSpecContainedInHere( arrayWithSpecs[i][j][2] );
		// 			atom.position.fromArray( arrayWithSpecs[i][j][0] );
		// 			model.setAtomRepresentationPosition( atom );
		// 		}
		// 	}
		// 	model.geometry.attributes.position.needsUpdate = true;
		// }
	}
}