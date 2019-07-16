/*
	TODO (probably, might need to think more)
		How do you know you're not doing it backwards?


		When you want to lay down a new one, read the atoms near your hand.
			Should be able to grab any residue. It breaks off
			Grab a terminal residue and you start working out of that
			Overlap a residue, and it moves the last Calpha you put down such that it can connect nicely to the calpha of what you've touched
		The new, first, residue still gets put in the same place, but we move the assemblage into the correct orientation
	
	Visualize the ramachandran in place.
	"abstract over" the set of all rotamers:
		You get a circle of phi's of different colors given the current psi, abstracting over position of next Calpha
		And if you hold an extra button, a teeny bit of tau, a little lever. Is this all that's ever needed?
		Like this is super interesting because it cooooould be protein design.
			Would you ever want to design it that way?
			Can you be compelled to make an alpha helix this way?
		Ramachandran data can also be used to detect when you want to "retract"
		Lampshade-like toroidal region
		rama
			can be used to detect when you want to "retract"?
		Check you can rotate assemblage at same time
			if not, probably need to check update order
		exported to pdb
		only able to do it c-to-n, which is a problem

	Might be better without the tetrahedral angle
		You certainly don't have it in good rama
		Maybe have a range, Lynne's thing
		The density is a distraction, again this is for EM
		But look, you are nooooot thinking about those angles and that fit with density simultaneously
*/

function initProteinPainter()
{
	// let rama = Ramachandran()
	// objectsToBeUpdated.push(rama)
	// scene.add(rama)
	// rama.update = function()
	// {
	// 	if(amides.length >= 2)
	// 	{
	// 		// rama.position.copy(activeAmide.position)

	// 		// let previousNitrogenLocation = carbon.clone().negate().add(nextCAlpha)
	// 		// let previousAmide = amides[ amides.indexOf(activeAmide) - 1 ]
	// 		// previousNitrogenLocation.applyMatrix( previousAmide.matrix )
	// 		// previousNitrogenLocation.sub(activeAmide.position)

	// 		// let nextCarbon = carbon.clone().applyQuaternion(activeAmide.quaternion)
			
			

	// 		//when you put a new amide in, the rama moves
	// 		let phi = 0
	// 		let psi = 0
	// 	}
	// 	else
	// 	{
	// 		rama.visible = false
	// 	}
	// }

	let proteinPainterMesh = new THREE.Mesh(new THREE.CylinderBufferGeometry(0.08,0.08,0.002,32), new THREE.MeshBasicMaterial({color:0x000000,transparent:true,opacity:0.5}))
	proteinPainterMesh.geometry.applyMatrix(new THREE.Matrix4().makeRotationX(TAU/4))
	let proteinPainter = Tool(proteinPainterMesh)

	proteinPainter.onPickUp = function()
	{
		this.rotation.x = -TAU/4
	}

	//different segments. Do not screw around lightly, their positions are expected to be where they currently are
	{
		var amidePdbRead = {
			elements:["C","O","C","N","C"],
			names:[" CA "," O  "," C  "," N  ", " CA "],
			positions:[
				new THREE.Vector3(0.0,		0.0,0.0),
				new THREE.Vector3(HS3*2,	0.0,0.0),
				new THREE.Vector3(HS3,		0.5,0.0),
				new THREE.Vector3(HS3,		1.5,0.0),
				new THREE.Vector3(HS3*2,	2.0,0.0),
			]
		}

		var amideWithNTerminusPdbRead = {
			elements:["N","C","O","C","N","C"],
			names:[" N  ", " CA "," O  "," C  "," N  ", " CA "],
			positions:[
				new THREE.Vector3(0.0,	-0.5, -HS3),
				new THREE.Vector3(0.0,		0.0,0.0),
				new THREE.Vector3(HS3*2,	0.0,0.0),
				new THREE.Vector3(HS3,		0.5,0.0),
				new THREE.Vector3(HS3,		1.5,0.0),
				new THREE.Vector3(HS3*2,	2.0,0.0),
			]
		}

		var cTerminusPdbRead = {
			elements:["C","O","C","O"],
			names:[" CA "," O  "," C  "," O  "],
			positions:[
				new THREE.Vector3(0.0,	0.0,0.0),
				new THREE.Vector3(HS3*2,0.0,0.0),
				new THREE.Vector3(HS3,	0.5,0.0),
				new THREE.Vector3(HS3,	1.5,0.0)
			]
		}

		var sideChainAndHydrogenPdbRead = {
			elements:["H","C","C"],
			names:[" H  "," CB "," CA "],
			positions:[
				new THREE.Vector3(-HS3,	0.5, 	0.0),
				new THREE.Vector3(0.0,	-0.5,	HS3),
				new THREE.Vector3(0.0,	0.0,	0.0),
			]
		}

		var allOfThem = [ amidePdbRead, amideWithNTerminusPdbRead, sideChainAndHydrogenPdbRead, cTerminusPdbRead ];
		for(var j = 0; j < allOfThem.length; j++)
		{
			for(var i = 0; i < allOfThem[j].positions.length; i++)
			{
				allOfThem[j].positions[i].y *= Math.sqrt(1.5)
				allOfThem[j].positions[i].multiplyScalar(1.8/Math.sqrt(1.5));
			}
		}

		var amideWithNTerminusAtoms = [];
		for(var i = 0; i < amideWithNTerminusPdbRead.elements.length; i++)
		{
			amideWithNTerminusAtoms.push( new Atom( amideWithNTerminusPdbRead.elements[i], amideWithNTerminusPdbRead.positions[i].clone(),
				null,null,null,null,amideWithNTerminusPdbRead.names[i] ) );
		}
		var amideWithNTerminus = makeMoleculeMesh( amideWithNTerminusAtoms, false );

		var amideAtoms = [];
		for(var i = 0; i < amidePdbRead.elements.length; i++)
		{
			amideAtoms.push( new Atom( amidePdbRead.elements[i], amidePdbRead.positions[i].clone(),
				null,null,null,null,amidePdbRead.names[i] ) );
		}
		// var bondData = [[[[],[],1,0,2],[[],[],1,2,3]],[],[[[],[],1,1,2]],[[[],[],1,3,4],[[],[],1,3,5]],[],[],[],[],[],[]];
		// changeBondBetweenAtomsToDouble(bondData, 1,2);
		var amide = makeMoleculeMesh( amideAtoms, false );
		var amideDiagonalLength = amide.atoms[ amide.atoms.length - 1 ].position.length();

		var cTerminusAtoms = [];
		for(var i = 0; i < cTerminusPdbRead.elements.length; i++)
		{
			cTerminusAtoms.push( new Atom( cTerminusPdbRead.elements[i], cTerminusPdbRead.positions[i].clone(),
				null,null,null,null,cTerminusPdbRead.names[i] ) );
		}
		// var bondData = [[[[],[],1,0,2],[[],[],1,2,3]],[],[[[],[],1,1,2],[[],[],1,3,4]],[],[],[],[],[],[],[]];
		// changeBondBetweenAtomsToDouble(bondData, 1,2);
		var cTerminus = makeMoleculeMesh( cTerminusAtoms, false );	 	

		var sideChainAndHydrogenAtoms = [];
		for(var i = 0; i < sideChainAndHydrogenPdbRead.elements.length; i++)
		{
			sideChainAndHydrogenAtoms.push( new Atom( sideChainAndHydrogenPdbRead.elements[i], sideChainAndHydrogenPdbRead.positions[i].clone(),
				null,null,null,null,sideChainAndHydrogenPdbRead.names[i] ) );
		}
		var sideChainAndHydrogen = makeMoleculeMesh( sideChainAndHydrogenAtoms, false );

		var sideChainAndHydrogenActualSpindle = new THREE.Vector3().addVectors(sideChainAndHydrogenPdbRead.positions[0],sideChainAndHydrogenPdbRead.positions[1]).normalize();
		var sideChainAndHydrogenActualLeft = sideChainAndHydrogenActualSpindle.clone().cross(sideChainAndHydrogenPdbRead.positions[0]).cross(sideChainAndHydrogenActualSpindle).normalize();
		var carbon = amidePdbRead.positions[2].clone();
		var nextCAlpha = amidePdbRead.positions[amidePdbRead.positions.length-1].clone();
		var nextCAlphaAngleToCarbonSpindle = nextCAlpha.angleTo(carbon)
	}

	let amides = [];
	let sideChainAndHydrogens = []
	let activeAmide = null;

	{
		let placementIndicatorMesh = new THREE.Mesh(amideWithNTerminus.geometry,amideWithNTerminus.material.clone())
		placementIndicatorMesh.material.transparent = true
		placementIndicatorMesh.material.opacity = 0.7
		proteinPainter.add(placementIndicatorMesh)
		placementIndicatorMesh.update = function()
		{
			this.scale.setScalar(getAngstrom() )
			this.visible = ( handControllers.indexOf(proteinPainter.parent) !== -1 && amides.length === 0 )
		}
		objectsToBeUpdated.push(placementIndicatorMesh)
	}

	function createActiveAmideAtPosition(position)
	{
		let toClone = amides.length === 0 ? amideWithNTerminus : amide
		let newAmide = toClone.cloneWithAtoms()
		activeAmide = newAmide;
		amides.push(newAmide);

		newAmide.position.copy(position);
		assemblage.add(newAmide)

		return newAmide;
	}

	function planeAngle(origin,z,nonProjectedX,nonProjectedP)
	{
		//hopefully not collinear
		let n = z.clone().sub(origin).normalize()
		let plane = new THREE.Plane( n, 0 )
		let x = plane.projectPoint(nonProjectedX,new THREE.Vector3()).normalize()
		let y = n.clone().cross(x)

		let p = plane.projectPoint(nonProjectedP,new THREE.Vector3())
		let p2D = new THREE.Vector2(p.dot(x), p.dot(y))
		return p2D.angle()
	}

	let activeSideChainAndHydrogen = null;

	// let illustrative = new THREE.Mesh(new THREE.BoxGeometry(getAngstrom(),getAngstrom(),getAngstrom()))
	// assemblage.add(illustrative)

	// let amidePlaneIndicator = new THREE.Mesh(new THREE.PlaneBufferGeometry(1,1))
	// assemblage.add(amidePlaneIndicator)

	{
		var line = new THREE.Mesh(new THREE.CylinderBufferGeometryUncentered(0.13,1),
			new THREE.MeshLambertMaterial(
			{
				color:0xFF0000,
			}))
		assemblage.add(line);
		line.visible = false
	}

	let laying = false;

	proteinPainter.whileHeld = function(handPositionInAssemblage)
	{
		// amidePlaneIndicator.position.copy(handPositionInAssemblage)

		// if( Math.abs(assemblage.scale.x - 0.026) > 0.005 )
		// {
		// 	let centerInAssemblageSpace = visiBox.getCenterInAssemblageSpace()
		// 	let centerInWorld = assemblage.localToWorld( centerInAssemblageSpace.clone() )

		// 	assemblage.scale.setScalar( assemblage.scale.x + (0.026-assemblage.scale.x) * 0.1 )
		// 	assemblage.updateMatrixWorld()
		// 	let centerMovementDueToScale = assemblage.localToWorld(centerInAssemblageSpace.clone())
		// 	assemblage.position.sub(centerMovementDueToScale).add(centerInWorld)

		// 	handPositionInAssemblage.copy(this.parent.position)
		// 	assemblage.updateMatrixWorld()
		// 	assemblage.worldToLocal(handPositionInAssemblage)
		// }

		if( this.parent.button1 && !this.parent.button1Old && !laying )
		{
			laying = true
			line.visible = laying
			// cap.visible = cap.plane.visible = laying
		}

		if(!laying)
		{
			//we're going to find the closest atom, we need its nitrogen and its carbon
			//highlight
			// let worldPosition = assemblage.localToWorld(handPositionInAssemblage.clone())
			// let closestCAlpha = getClosestAtomToWorldPosition(worldPosition, function(atom)
			// {
			// 	return atom.name === " CA "
			// })
		}
		else
		{
			let hand = proteinPainter.parent

			if( amides.length === 0 )
			{
				let newAmide = createActiveAmideAtPosition(handPositionInAssemblage)
				// newAmide.quaternion.copy(proteinPainter.quaternion).premultiply()

				let toolQuaternionInAssemblage = proteinPainter.quaternion.clone().premultiply( proteinPainter.parent.quaternion )
				toolQuaternionInAssemblage.premultiply( assemblage.quaternion.getInverse() )
				newAmide.quaternion.copy(toolQuaternionInAssemblage)

				//Oooooor, you might be continuing
			}

			//need indicators
			let prevCAlphaAcrossAmide = nextCAlpha.clone().applyQuaternion(activeAmide.quaternion).normalize()
			let prevCAlphaToHand = handPositionInAssemblage.clone().sub(activeAmide.position)
			let lengthOnAmide = prevCAlphaToHand.dot(prevCAlphaAcrossAmide)
			if( this.parent.button1 && !this.parent.button1Old )
			{
				let newAmidePosition = nextCAlpha.clone();
				activeAmide.updateMatrixWorld();
				activeAmide.localToWorld(newAmidePosition)
				assemblage.worldToLocal(newAmidePosition)

				let newAmide = createActiveAmideAtPosition(newAmidePosition)

				let newSideChainAndHydrogen = sideChainAndHydrogen.cloneWithAtoms();
				newSideChainAndHydrogen.position.copy(activeAmide.position)
				assemblage.add(newSideChainAndHydrogen);

				activeSideChainAndHydrogen = newSideChainAndHydrogen;
				sideChainAndHydrogens.push(activeSideChainAndHydrogen)
			}

			if(!activeSideChainAndHydrogen)
			{
				// redirectCylinder(line,
				// 	nextCAlpha.clone().applyQuaternion(activeAmide.quaternion).add(activeAmide.position),
				// 	handPositionInAssemblage.clone().sub(activeAmideToNextCAlpha).sub(activeAmide.position) )
				return
			}

			let activeAmideToNextCAlpha = prevCAlphaToHand.clone().setLength(nextCAlpha.length())
			
			var prevNitrogen = carbon.clone().negate().applyQuaternion(amides[amides.indexOf(activeAmide)-1].quaternion)
			let angleToSpindle = prevNitrogen.angleTo(prevCAlphaToHand)
			if( this.parent.button2 && !this.parent.button2Old )
			{
				let indexOfAmideToChangeTo = amides.indexOf(activeAmide)-1
				if( indexOfAmideToChangeTo > -1 )
				{
					activeAmide = amides[indexOfAmideToChangeTo]
					if( indexOfAmideToChangeTo === 0 )
					{
						activeSideChainAndHydrogen = null
					}
					else
					{
						activeSideChainAndHydrogen = sideChainAndHydrogens[indexOfAmideToChangeTo-1]
					}

					//cheeeeeck this ok
					removeAndRecursivelyDispose(amides.pop())
					removeAndRecursivelyDispose(sideChainAndHydrogens.pop())
					return
				}
			}

			let carbonDist = carbon.length()
			let nDist = carbon.length() //not exactly
			let carbonToNextCAlphaDist = carbon.distanceTo(nextCAlpha)
			let prevNitrogenToCarbonDistance = Math.sqrt( sq(carbonDist) + sq(nDist) - (2 * nDist * carbonDist * Math.cos(TETRAHEDRAL_ANGLE ) ) )
			
			let possibleCarbons = tetrahedronTops(
				new THREE.Vector3(),
				activeAmideToNextCAlpha,
				prevNitrogen,
				carbonDist,carbonToNextCAlphaDist,prevNitrogenToCarbonDistance)

			let newCarbon = null

			if(possibleCarbons === false)
			{
				let handAtTopOfLampShade = prevCAlphaToHand.angleTo(prevNitrogen) > TETRAHEDRAL_ANGLE ? 1:-1

				let axis = prevNitrogen.clone().cross(prevCAlphaToHand).normalize()

				newCarbon = prevNitrogen.clone()
				newCarbon.applyAxisAngle(axis, TETRAHEDRAL_ANGLE )

				let allowance = THREE.Math.DEG2RAD * 15 //Feels right; Lynne Regan would say 5
				let extraAttractionTowardHand = prevCAlphaToHand.angleTo(newCarbon) - carbon.angleTo(nextCAlpha)
				extraAttractionTowardHand = clamp( extraAttractionTowardHand, 0, allowance )
				extraAttractionTowardHand *= handAtTopOfLampShade
				newCarbon.applyAxisAngle(axis, extraAttractionTowardHand )
				
				activeAmideToNextCAlpha.copy(newCarbon).setLength(nextCAlpha.length())
				activeAmideToNextCAlpha.applyAxisAngle(axis, carbon.angleTo(nextCAlpha) * handAtTopOfLampShade )
			}
			else
			{
				let currentCarbon = carbon.clone().applyQuaternion( activeAmide.quaternion )
				let closerIndex = possibleCarbons[0].distanceToSquared(currentCarbon) < possibleCarbons[1].distanceToSquared(currentCarbon)? 0:1

				newCarbon = possibleCarbons[closerIndex]

				if( this.parent.thumbstickButton && !this.parent.thumbstickButtonOld )
				{
					newCarbon = possibleCarbons[1-closerIndex]
				}
			}

			redirectCylinder(line, activeAmideToNextCAlpha.clone().add(activeAmide.position), handPositionInAssemblage.clone().sub(activeAmideToNextCAlpha).sub(activeAmide.position))


			{
				let newCarbonAxis = newCarbon.clone().normalize()
				activeAmide.quaternion.setFromUnitVectors(carbon.clone().normalize(),newCarbonAxis)

				let localNextCAlpha = activeAmideToNextCAlpha.clone().applyQuaternion(activeAmide.quaternion.clone().inverse())

				let orthogonalCurrentCAlpha = nextCAlpha.clone().projectOnPlane(carbon).normalize()
				let orthogonalNextCAlpha = localNextCAlpha.projectOnPlane(carbon).normalize()
				let secondQuat = new THREE.Quaternion().setFromUnitVectors(orthogonalCurrentCAlpha,orthogonalNextCAlpha)
				activeAmide.quaternion.multiply(secondQuat)
			}

			//repelling
			{
				let carbonDirection = carbon.clone().applyQuaternion(activeAmide.quaternion).normalize()

				let intendedSpindle = prevNitrogen.clone().normalize().lerp(carbonDirection,0.5).normalize().negate()
				activeSideChainAndHydrogen.quaternion.setFromUnitVectors( sideChainAndHydrogenActualSpindle,intendedSpindle )

				let intendedLeft = carbonDirection.clone().cross(intendedSpindle).normalize();
				let leftInCurrentSpace = sideChainAndHydrogenActualLeft.clone().applyQuaternion(activeSideChainAndHydrogen.quaternion);
				activeSideChainAndHydrogen.quaternion.premultiply(new THREE.Quaternion().setFromUnitVectors( leftInCurrentSpace, intendedLeft ) );
			}
		}
	}

	function addCTerminusAndcastOffNewChain()
	{
		if( !activeAmide )
		{
			return;
		}

		if(amides.length > 1)
		{
			{
				assemblage.remove(activeAmide)
				removeSingleElementFromArray(amides, activeAmide)
				var allGroups = amides.concat( sideChainAndHydrogens )

				let newCTerminus = cTerminus.cloneWithAtoms()
				newCTerminus.quaternion.copy(activeAmide.quaternion)
				newCTerminus.position.copy(activeAmide.position)
				assemblage.add(newCTerminus)
				allGroups.push(newCTerminus)
			}

			removeAndRecursivelyDispose(amides.pop())
			if( sideChainAndHydrogens.length > 0 )
			{
				removeAndRecursivelyDispose(sideChainAndHydrogens.pop())
			}

			//make the thing a chain in its own right

			let allAtoms = []
			let alreadyInThere = false
			for(let i = 0; i < allGroups.length; i++)
			{
				allGroups[i].updateMatrix()
				for(let j = 0, jl = allGroups[i].atoms.length; j < jl; j++)
				{
					let atom = allGroups[i].atoms[j]
					atom.position.applyMatrix4(allGroups[i].matrix)

					alreadyInThere = false
					for(let k = 0; k < allAtoms.length; k++)
					{
						if(allAtoms[k].name === atom.name && allAtoms[k].position.distanceTo(atom.position) < 0.001 )
						{
							alreadyInThere = true
							break;
						}
					}
					if(!alreadyInThere)
					{
						allAtoms.push( atom )
					}
				}
			}

			let model = makeMoleculeMesh( allAtoms, true )
			assemblage.add(model);
			models.push(model);

			let imol = 0
			for(let i = 0; i < models.length; i++)
			{
				if(models[i].imol === imol)
				{
					imol++
					i = -1
				}
			}

			model.residues = []
			for(let i = 0; i < model.atoms.length; i++)
			{
				model.atoms[i].imol = imol
				if( model.atoms[i].name === " CA ")
				{
					let cA = model.atoms[i]
					model.residues.push("ALA") //dunno if we're going up chain or down
					let resNo = model.residues.length-1

					cA.resNo = resNo
					for(let j = 0; j < cA.bondPartners.length; j++)
					{
						let atomDefinitelyInThisAa = cA.bondPartners[j]
						atomDefinitelyInThisAa.resNo = resNo

						for( var k = 0; k < atomDefinitelyInThisAa.bondPartners.length; k++)
						{
							let atomPossiblyInThisAa = atomDefinitelyInThisAa.bondPartners[k]
							if( atomPossiblyInThisAa === cA )
							{
								continue
							}
							if( atomPossiblyInThisAa.name === " O  " ) //doesn't work hugely rigorously
							{
								atomPossiblyInThisAa.resNo = resNo
							}
						}
					}
				}
			}
			// for(let i = 0; i < model.atoms.length; i++)
			// {
			// 	log(model.atoms[i])
			// }
		}
		else
		{
			let allGroups = amides.concat(sideChainAndHydrogens)
			for(let i = allGroups.length-1; i >= 0; i--)
			{
				removeAndRecursivelyDispose( allGroups[i] )
			}
		}

		activeAmide = null;
		amides = [];
		activeSideChainAndHydrogen = null;
		sideChainAndHydrogens = []

		// exportPdb()
	}

	proteinPainter.onLetGo = function()
	{
		this.rotation.x = 0
		addCTerminusAndcastOffNewChain()
		line.visible = false
		laying = false
	}

	return proteinPainter;
}

// Sending it off to coot
// many cAlphas need deleting - sidechain AND both amide planes
// take all the atoms in the originals, "clone" them for each copy
// take their positions, convert them from local to assemblage space
// 	If it's a new chain, have to make that, then residues start at 0
// 	Otherwise,
// 	add_new_chain does exist
// 	You make this thing, you send it off to coot, coot probably refines it, then you get it back and delete.