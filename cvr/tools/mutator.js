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

	When selecting, their ramachandran diagrams should appear?
 */
function initMutator()
{
	let mutator = Tool(0xFFFF00);

	//could read these from a directory
	let aaNames = ["leucine","alanine","serine","glycine","valine","glutamic acid","arginine","threonine", //most common
	               "asparagine","aspartic acid","cysteine","glutamine","histidine","isoleucine","lysine","methionine", "phenylalanine","proline","tryptophan","tyrosine"];
	let aaAbbreviations = ["LEU","ALA","SER","GLY","VAL","GLU","ARG","THR",
	               "ASN","ASP","CYS","GLN","HIS","ILE","LYS","MET", "PHE","PRO","TRP","TYR"];
	mutator.AAs = Array(aaNames.length);
	
	let innerCircleRadius = 0.12;
	let plaque = new THREE.Mesh( new THREE.CircleBufferGeometry(0.432 * innerCircleRadius, 32), new THREE.MeshBasicMaterial({color:0xF0F000, transparent: true, opacity:0.5, side:THREE.DoubleSide}) );
	let textHeight = innerCircleRadius / 9;
	let aasAllLoaded = false
	function singleLoop(aaIndex, position)
	{
		//THE BELOW MAY WELL NEED UDATING
		loadPdbAndMakeSillyModel( "data/AAs/" + aaNames[aaIndex] + ".txt", function ( carbonAlphas, geometryAtoms )
		{
			let newPlaque = plaque.clone();
			newPlaque.position.copy(position);
			newPlaque.visible = false
			mutator.add( newPlaque );

			mutator.AAs[aaIndex] = makeModelFromElementsAndCoords(geometryAtoms.elements,geometryAtoms.attributes.position.array)
			
			mutator.AAs[aaIndex].scale.setScalar(0.01); //it can stay at this too
			newPlaque.add( mutator.AAs[aaIndex] );
			
			let nameMesh = makeTextSign( aaNames[aaIndex] );
			nameMesh.scale.setScalar(textHeight);
			nameMesh.position.copy(mutator.AAs[aaIndex].position)
			nameMesh.position.y -= 0.014;
			nameMesh.position.z = 0.01;
			newPlaque.add(nameMesh);

			for(let i = 0, il = mutator.AAs.length; i < il; i++)
			{
				if(!mutator.AAs[i])
				{
					return;
				}
			}
			aasAllLoaded = true
			mutator.onLetGo()
		},
		function ( xhr ) {}, //progression function
		function ( xhr ) { console.error( "couldn't load PDB (maybe something about .txt): ", aaNames[aaIndex]  );
	});
	}
	let numInLayer1 = 7;
	for(let i = 0, il = mutator.AAs.length; i < il; i++)
	{
		let position = new THREE.Vector3();
		if(i < numInLayer1)
		{
			position.y = innerCircleRadius;
			position.applyAxisAngle( zVector, i / numInLayer1 * TAU );
		}
		else
		{
			position.y = innerCircleRadius * 1.87;
			position.applyAxisAngle( zVector, (i-numInLayer1) / (il-numInLayer1) * TAU );
		}
		
		singleLoop(i,position);
	}

	mutator.whileHeld = function()
	{
		if(!aasAllLoaded )
		{
			return
		}
		/*
		 * If it's on an amino acid it's working on that
		 * You take it off, the menu disappears.
		 * While you're holding it it's not looking for anything
		 * Let go of it and 
		 * 		If you've put it on your belt, it stays there
		 * 		else, it works out which is the closest amino acid and goes straight for that. It is basically impossible to move the molecule in time.
		 * 
		 * It starts out on your belt
		 * 
		 * You've selected an amino acid.
		 * We send a message to coot. It mutates and autofits.
		 */
		let mutatorAaAngstrom = getAngstrom();
		if(mutatorAaAngstrom > 0.0125)
		{
			mutatorAaAngstrom = 0.0125;
		}
		for(let i = 0, il = this.AAs.length; i < il; i++)
		{
			this.AAs[i].parent.visible = true
			this.AAs[i].parent.children[0].visible = this.AAs[i].parent.visible;
			this.AAs[i].parent.children[1].visible = this.AAs[i].parent.visible;

			this.AAs[i].scale.setScalar(mutatorAaAngstrom);
		}

		// let msg = { command: "mutateAndAutofit", newResidue:"CYS" };
		// closestAtom.assignAtomSpecToObject( msg );
		// socket.send( JSON.stringify( msg ) );
	}

	mutator.onLetGo = function()
	{
		for(let i = 0, il = this.AAs.length; i < il; i++)
		{
			this.AAs[i].parent.visible = false
			this.AAs[i].parent.children[0].visible = this.AAs[i].parent.visible;
			this.AAs[i].parent.children[1].visible = this.AAs[i].parent.visible;
		}
	}
	
	return mutator;
}