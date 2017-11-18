/*
 * It starts out on your belt
 * Take it off, but leave it in midair, it stays
 * Put it in proximity to your belt and look away from it and it'll go there
 * 
 * If you look down, all your tools return to your belt
 */

/* Other tools
 * In real life: say you're picking things off a bush. If you want to get a few things you pinch, if you want a lot then you scoop. It's a natural action of your hand
 * Ok here: Sphere is both hands
 * Regularizer is pinch
 * 
 * Maybe the general way to do it is "let people just manipulate the atoms and then when they look away, correct them"
 * 
 * Undo is a button on the controller that makes a sign flash up
 * 
 * Staple gun style?
 */

/*
 * sidechain flipper. Should be part of atom movement
 * do-180-degree-side-chain-flip imol chain id resno inscode altconf [function]
Where:
• imol is an integer number
• chain id is a string
• resno is an integer number
• inscode is a string
• altconf is a string
 */

/* 
 * 
 * peptide flipper - once again, grabbing it and moving it!
 * 
 * need these things
 *imol is an integer number
• chain id is a string
• resno is an integer number
• inscode is a string
• altconf
 */

/*
 * atom deleter
 * imol is an integer number
• chain id is a string
• resno is an integer number
• ins code is a string
• at name is a string
• altloc is a string
 */
function initAtomDeleter(tools)
{
	atomDeleter = new THREE.Object3D();
	
	var ball = new THREE.Mesh(new THREE.EfficientSphereBufferGeometry(1), new THREE.MeshLambertMaterial({transparent:true,color:0xFF0000, opacity: 0.3}));
	atomDeleter.add( ball );
	ball.scale.setScalar(0.05);
	
	atomDeleter.highlightedAtoms = [];
	
	atomDeleter.update = function()
	{
		if(!modelAndMap.model )
			return;
		
		var ourPosition = this.getWorldPosition();
		modelAndMap.model.updateMatrixWorld();
		modelAndMap.model.worldToLocal(ourPosition);
		
		var ourRadiusSq = sq( ball.scale.x / getAngstrom() );
		
		var highlightColor = new THREE.Color(1,1,1);
		
		for(var i = 0, il = modelAndMap.model.atoms.length; i < il; i++)
		{
			if( modelAndMap.model.atoms[i].position.distanceToSquared( ourPosition ) < ourRadiusSq )
			{
				modelAndMap.model.geometry.colorAtom(i, highlightColor);
				this.highlightedAtoms.push(i);
			}
		}
		for(var i = 0; i < this.highlightedAtoms.length; i++)
		{
			if( modelAndMap.model.atoms[ this.highlightedAtoms[i] ].position.distanceToSquared( ourPosition ) >= ourRadiusSq )
			{
				modelAndMap.model.geometry.colorAtom( this.highlightedAtoms[i] );
				this.highlightedAtoms.splice(i,1);
				i--;
			}
		}
		modelAndMap.model.geometry.attributes.color.needsUpdate = true;
		
		if( this.parent !== scene )
		{
			if( this.parent.button1 || this.parent.button2 )
			{
				for(var i = 0, il = this.highlightedAtoms.length; i < il; i++)
				{
//					socket.send("delete|" + this.highlightedAtoms[i].labelString);
				}
				this.highlightedAtoms.length = 0;
			}
		}
	}
	
	tools.push(atomDeleter);
	scene.add(atomDeleter)	
}



/*Rotamer changer
 * Put it over an atom. Sends to coot, gets different conformations, shows them. They are selectable
 * 
 * This is a specific tool because Coot has specific suggestions. But why shouldn't it have suggestions for an arbitrary atom?
 * 
 */
//function initRotamerChanger(residues)
//{
//	rotamerChanger.update = function()
//	{
//		var selectedResidue = -1;
//		for(var i = 0; i < residues.length; i++)
//		{
//			if(residues[i].position.distanceTo(this.position) < this.selectionRadius)
//		}
//		socket.send("Rotamers needed for residue " + )
//	}
//}

/*
 * "Mutator"
	put it over an amino acid, they all appear
	with their names, 
	as soon as you move your hand over an AA in its array it glows and replaces what's in there. And you should be able to change the angles or whatever without closing this menu
	Grab the one you've just hovered over and that's it. Another way to confirm you're done is to take the ring away
	Ring should gravitate towards AA. And become transparent when it's there
	All AAs should be oriented in the way they would be oriented in the place
	
	Alternative shapes: circle because it creates a circular array, torus so it's like a handle
	Or a torus so that it has a specific plane that you can put the AA in
	
	It should also be possible to select between them using the thumbstick, so you can look at different results without moving your eyes
 */
function initMutator(tools)
{
	mutator = new THREE.Object3D();
	console.log(mutator)
	
	var handleRadius = 0.02;
	var handleTubeRadius = handleRadius / 3;
	var chunkOut = TAU / 4;
	mutator.handle = new THREE.Mesh(new THREE.TorusGeometry(handleRadius, handleTubeRadius, 7, 31, TAU - chunkOut), new THREE.MeshBasicMaterial({transparent:true,color:0xFFFF00}));
	mutator.handle.rotation.y = TAU / 4;
	mutator.handle.rotation.z = chunkOut / 2;
	mutator.handle.geometry.computeBoundingSphere();
	mutator.add(mutator.handle);
	
	mutator.boundingSphere = mutator.handle.geometry.boundingSphere;

	var labelMaterial = new THREE.MeshLambertMaterial( { color: 0x156289 });
	var aaNames = ["leucine","alanine","serine","glycine","valine","glutamic acid","arginine","threonine", //most common
	               "asparagine","aspartic acid","cysteine","glutamine","histidine","isoleucine","lysine","methionine", "phenylalanine","proline","tryptophan","tyrosine"];
	var aaAbbreviations = ["LEU","ALA","SER","GLY","VAL","GLU","ARG","THR",
	               "ASN","ASP","CYS","GLN","HIS","ILE","LYS","MET", "PHE","PRO","TRP","TYR"];
	mutator.AAs = Array(aaNames.length);
	var ourPDBLoader = new THREE.PDBLoader();
	var plaque = new THREE.Mesh( new THREE.CircleBufferGeometry(4,32), new THREE.MeshBasicMaterial({color:0xF0F000, transparent: true, opacity:0.5}) );
	var innerCircleRadius = 0.1;
	var textWidth = innerCircleRadius / 3;
	function singleLoop(aaIndex, position)
	{
		ourPDBLoader.load( "data/AAs/" + aaNames[aaIndex] + ".txt",
			function ( geometryAtoms ) {
				mutator.AAs[aaIndex] = new THREE.Mesh(new THREE.BufferGeometry(), new THREE.MeshLambertMaterial( {vertexColors:THREE.VertexColors} ) );
				mutator.AAs[aaIndex].atoms = Array(geometryAtoms.elements.length);
			 	for(var i = 0; i < mutator.AAs[aaIndex].atoms.length; i++)
			 		mutator.AAs[aaIndex].atoms[i] = new Atom( geometryAtoms.elements[i], "", new THREE.Vector3().fromArray(geometryAtoms.attributes.position.array,3*i) );

			 	makeMoleculeMesh( mutator.AAs[aaIndex].geometry, mutator.AAs[aaIndex].atoms );
			 	
			 	mutator.AAs[aaIndex].position.copy(position)
			 	mutator.AAs[aaIndex].scale.setScalar(getAngstrom()); //it can stay at this too
				mutator.add( mutator.AAs[aaIndex] );
				
				var textureLoader = new THREE.TextureLoader();
				textureLoader.crossOrigin = true;
				textureLoader.load(
					"data/AAs/" + aaNames[aaIndex] + ".png",
					function(texture) {
						var nameMesh = new THREE.Mesh( new THREE.PlaneBufferGeometry( textWidth, textWidth * (texture.image.naturalHeight/texture.image.naturalWidth) ), new THREE.MeshBasicMaterial({ map: texture }) );
						nameMesh.position.copy(mutator.AAs[aaIndex].position)
						nameMesh.position.y -= 0.01;
						nameMesh.position.z = 0.01;
						mutator.add(nameMesh)
					},
					function ( xhr ) {}, function ( xhr ) {console.log( 'texture loading error' );}
				);
				
				mutator.AAs[aaIndex].add( plaque.clone() );
			},
			function ( xhr ) {}, //progression function
			function ( xhr ) { console.error( "couldn't load PDB (maybe something about .txt): ", aaNames[aaIndex]  ); }
		);
	}
	var numInLayer1 = 7;
	for(var i = 0, il = mutator.AAs.length; i < il; i++)
	{
		var position = new THREE.Vector3();
		if(i < numInLayer1)
		{
			position.y = innerCircleRadius;
			position.applyAxisAngle( zAxis, i / numInLayer1 * TAU );
		}
		else
		{
			position.y = innerCircleRadius * 1.9;
			position.applyAxisAngle( zAxis, (i-numInLayer1) / (il-numInLayer1) * TAU );
		}
		
		singleLoop(i,position);
	}

//	mutator.update = function()
//	{
//		/*
//		 * If it's on an amino acid it's working on that
//		 * You take it off, the menu disappears.
//		 * While you're holding it it's not looking for anything
//		 * Let go of it and 
//		 * 		If you've put it on your belt, it stays there
//		 * 		else, it works out which is the closest amino acid and goes straight for that. It is basically impossible to move the molecule in time.
//		 * 
//		 * It starts out on your belt
//		 * 
//		 * You've selected an amino acid.
//		 * We send a message to coot. It mutates and autofits.
//		 */
//		
//		if(this.residueSelected)
//		for(var i = 0, il = this.potentialResidues.length; i < il; i++)
//		{
//			
//		}
//		
//		if(0)
//		{
////			socket.send("mutate|" + residueNumber.toString() + "," + residue-number chain-id mol mol-for-map residue-type )
//		}
//	}
	
	mutator.position.z = -FOCALPOINT_DISTANCE;
	tools.mutator = mutator;
	scene.add(mutator);
}

function initVisiBox(thingsToBeUpdated,holdables)
{
	//should its edges only appear sometimes?
	var visiBox = new THREE.Object3D();
	
	thingsToBeUpdated.visiBox = visiBox;
	
	visiBox.scale.setScalar(0.9)
	visiBox.position.z = -FOCALPOINT_DISTANCE
	scene.add(visiBox);
	
	var ourSquareGeometry = new THREE.RingGeometry( 0.9 * Math.sqrt( 2 ) / 2, Math.sqrt( 2 ) / 2,4,1);
	ourSquareGeometry.applyMatrix( new THREE.Matrix4().makeRotationZ( TAU / 8 ) );
	visiBox.planes = [];
	for(var i = 0; i < 6; i++)
	{
		visiBox.add( new THREE.Mesh(ourSquareGeometry, new THREE.MeshLambertMaterial({color:0xFF0000,transparent:true, opacity:0.5, side:THREE.DoubleSide}) ) );
		if( i === 1) visiBox.children[ visiBox.children.length-1 ].rotation.x = TAU/2;
		if( i === 2) visiBox.children[ visiBox.children.length-1 ].rotation.x = TAU/4;
		if( i === 3) visiBox.children[ visiBox.children.length-1 ].rotation.x = -TAU/4;
		if( i === 4) visiBox.children[ visiBox.children.length-1 ].rotation.y = TAU/4;
		if( i === 5) visiBox.children[ visiBox.children.length-1 ].rotation.y = -TAU/4;
		visiBox.children[ visiBox.children.length-1 ].position.set(0,0,0.5);
		visiBox.children[ visiBox.children.length-1 ].position.applyEuler( visiBox.children[ visiBox.children.length-1 ].rotation );
		
		visiBox.planes.push( new THREE.Plane() );
	}
	
	//there's an argument for doing this with sides rather than corners, but corners are easier to aim for and give more power?
	{
		visiBox.corners = Array(8);
		var cornerGeometry = new THREE.EfficientSphereBufferGeometry(1);
		cornerGeometry.computeBoundingSphere();
		var cornerMaterial = new THREE.MeshLambertMaterial({color: 0x00FFFF, side:THREE.DoubleSide});
		visiBox.updateMatrix();
		
		function assignPosition(i, position)
		{
			position.setScalar(0.5);
			if( i%2 )
				position.x *= -1;
			if( i%4 >= 2 )
				position.y *= -1;
			if( i>=4 )
				position.z *= -1;
		}
		for(var i = 0; i < visiBox.corners.length; i++)
		{
			visiBox.corners[i] = new THREE.Mesh( cornerGeometry, cornerMaterial );
			visiBox.corners[i].scale.setScalar( 0.01 );
			visiBox.corners[i].boundingSphere = cornerGeometry.boundingSphere;
			visiBox.add( visiBox.corners[i] );
			visiBox.corners[i].ordinaryParent = visiBox;

			visiBox.updateMatrixWorld();
			
			assignPosition(i, visiBox.corners[i].position)
			
			holdables[ "visiBoxCorner" + i.toString() ] = visiBox.corners[i];
		}
	}
	
//	function setFaceToChangedVertex(changedIndex,xOrYOrZ, cornerIndices)
//	{
//		for(var i = 0; i < cornerIndices.length; i++)
//		{
//			visiBox.corners[cornerIndices[i]].position.setComponent(xOrYOrZ, visiBox.corners[cornerIndices[i]].position.getComponent(xOrYOrZ ) );
//		}
//	}
	
	visiBox.update = function()
	{
		visiBox.updateMatrixWorld();
		for(var i = 0; i < visiBox.corners.length; i++)
		{
			if(visiBox.corners[i].parent !== visiBox)
			{
				var newCornerPosition = visiBox.corners[ i ].getWorldPosition();
				visiBox.worldToLocal(newCornerPosition);
				visiBox.scale.x *= ( Math.abs(newCornerPosition.x)-0.5 ) + 1;
				visiBox.scale.y *= ( Math.abs(newCornerPosition.y)-0.5 ) + 1;
				visiBox.scale.z *= ( Math.abs(newCornerPosition.z)-0.5 ) + 1;
//				console.log(visiBox.scale)
				
				visiBox.updateMatrixWorld();
				
				var newNewCornerPosition = new THREE.Vector3();
				assignPosition(i, newNewCornerPosition );
				visiBox.localToWorld(newNewCornerPosition);
				
				var displacement = visiBox.corners[ i ].getWorldPosition().sub( newNewCornerPosition )//.multiply(visiBox.scale);
				
				visiBox.position.add(displacement)
				
				break;
			}
		}
		
		for(var i = 0; i < visiBox.corners.length; i++)
		{
			if(visiBox.corners[i].parent === visiBox)
			{
				visiBox.corners[i].scale.set(0.01/visiBox.scale.x,0.01/visiBox.scale.y,0.01/visiBox.scale.z);
				visiBox.corners[i].rotation.set(0,0,0);
			}
		}
		
		//beware, the planes may be the negatives of what you expect, seemingly because of threejs bug
		for(var i = 0; i < this.planes.length; i++)
		{
			var planeVector = new THREE.Vector3();
			planeVector.applyMatrix4(this.children[i].matrix);
			this.planes[i].normal.copy(planeVector).normalize();
			this.planes[i].constant = planeVector.dot( this.planes[i].normal );
			
			this.planes[i].applyMatrix4(visiBox.matrixWorld);
		}
	}
	
	return visiBox;
}