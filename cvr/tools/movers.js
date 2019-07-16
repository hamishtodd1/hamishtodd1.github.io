/* 
	Want highlighting

	Regularizer is pinch
 */


 function initRigidChainMover()
 {
 	var ball = new THREE.LineSegments( 
 		new THREE.WireframeGeometry(new THREE.EfficientSphereGeometry(0.05) ),
 		new THREE.LineBasicMaterial({color:0xFFFFFF, linewidth:3 }) );
 	var rigidMover = Tool(ball)

 	var capturedAtoms = [];
 	var localCapturedAtomPositions = [];

 	rigidMover.whileHeld = function(positionInAssemblage)
 	{
 		if( this.parent.button1 )
 		{
 			this.parent.updateMatrixWorld();

 			if( capturedAtoms.length === 0 )
 			{
 				let parentClosestAtom = getClosestAtomToWorldPosition(this.parent.getWorldPosition(),function(){return true;})
 				let otherHandClosestAtom = getClosestAtomToWorldPosition(handControllers[1-handControllers.indexOf(this.parent)].getWorldPosition(),function(){return true;})

 				if(otherHandClosestAtom.imol === parentClosestAtom.imol)
 				{
 					let lowerResNo = parentClosestAtom.resNo < otherHandClosestAtom.resNo ? parentClosestAtom.resNo : otherHandClosestAtom.resNo
 					let higherResNo =parentClosestAtom.resNo < otherHandClosestAtom.resNo ? otherHandClosestAtom.resNo : parentClosestAtom.resNo

 					let model = getModelWithImol(parentClosestAtom.imol)
 					for(var i = 0, il = model.atoms.length; i < il; i++)
 					{
 						if( lowerResNo <= model.atoms[i].resNo && model.atoms[i].resNo <= higherResNo )
 						{
 							capturedAtoms.push( model.atoms[i] );
 							localCapturedAtomPositions.push( model.atoms[i].position.clone() );
 							model.localToWorld( localCapturedAtomPositions[localCapturedAtomPositions.length-1] );
 							this.parent.worldToLocal( localCapturedAtomPositions[localCapturedAtomPositions.length-1] );
 						}
 					}
 				}
 			}
 			else
 			{
 				for(var i = 0, il = capturedAtoms.length; i < il; i++)
 				{
 					var model = getModelWithImol(capturedAtoms[i].imol);
 					model.updateMatrixWorld()
 					
 					var newAtomPosition = localCapturedAtomPositions[i].clone();
 					this.parent.localToWorld(newAtomPosition);
 					model.worldToLocal(newAtomPosition);
 					model.setAtomRepresentationPosition(capturedAtoms[i], newAtomPosition)
 				}
 			}
 		}

 		if( !this.parent.button1 && this.parent.button1Old )
 		{
 			for(var i = 0, il = capturedAtoms.length; i < il; i++)
 			{
 				var msg = {
 					command: "moveAtom",
 					x: capturedAtoms[i].position.x,
 					y: capturedAtoms[i].position.y,
 					z: capturedAtoms[i].position.z
 				};
 				capturedAtoms[i].assignAtomSpecToObject( msg );
 				// socket.send(JSON.stringify(msg));
 			}

 			capturedAtoms = [];
 			localCapturedAtomPositions = [];
 		}
 	}

 	return rigidMover;
 }


//you know so well what your hand is doing, do you HAVE to have refinement turned on for this?
//It's more that the "rigid mover" should be the default tool. Maybe it only appears when you stick your hands in
function initRigidSphereMover()
{
	/*
		Replaces peptide flipper and sidechainflipper.
		Can work during refinement or not!

		all residues in a spherical region surrounding your hand are refining
		A switch that says "refinement on/off"

		Next plan: make it a sphere unless your hands are close, in which case it's a pill shape
		One end in each hand

		Or, two spheres, and all the residues between them, along the chain, get highlighted
			Paul says this may help select them https://github.com/pemsley/coot/blob/f4630d7da146ecece648600f7208c46809072063/python/fitting.py
			python_representation(imol) - you get a list of chain, chains have list of residues, residues have list of atoms, atoms have list of atom-properties.  You can find your chain by chain-id, and look for the residue numbers in that chain.
	*/

	var ball = new THREE.LineSegments( 
		new THREE.WireframeGeometry(new THREE.EfficientSphereGeometry(0.05) ),
		new THREE.LineBasicMaterial({color:0xFFFFFF, linewidth:3 }) );
	var rigidMover = Tool(ball)

	rigidMover.onLetGo = turnOffAllHighlights;

	var capturedAtoms = [];
	var localCapturedAtomPositions = [];

	rigidMover.whileHeld = function(positionInAssemblage)
	{
		if( this.parent.button1 )
		{
			this.parent.updateMatrixWorld();

			if( !this.parent.button1Old )
			{
				var localRadiusSq = sq(ball.geometry.boundingSphere.radius * this.scale.x / getAngstrom())
				for(var i = 0; i < models.length; i++)
				{
					for(var j = 0, jl = models[i].atoms.length; j < jl; j++)
					{
						if(models[i].atoms[j].position.distanceToSquared( positionInAssemblage ) < localRadiusSq )
						{
							capturedAtoms.push(models[i].atoms[j]);
							localCapturedAtomPositions.push(models[i].atoms[j].position.clone());
							models[i].localToWorld(localCapturedAtomPositions[localCapturedAtomPositions.length-1]);
							this.parent.worldToLocal(localCapturedAtomPositions[localCapturedAtomPositions.length-1]);
						}
					}
				}
			}

			for(var i = 0, il = capturedAtoms.length; i < il; i++)
			{
				var model = getModelWithImol(capturedAtoms[i].imol);
				model.updateMatrixWorld()
				
				var newAtomPosition = localCapturedAtomPositions[i].clone();
				this.parent.localToWorld(newAtomPosition);
				model.worldToLocal(newAtomPosition);
				model.setAtomRepresentationPosition(capturedAtoms[i], newAtomPosition)
			}
		}
		else
		{
			// highlightAtomsOverlappingSphere(this, sq(ball.geometry.boundingSphere.radius * this.scale.x / getAngstrom()) )
		}

		if( !this.parent.button1 && this.parent.button1Old )
		{
			for(var i = 0, il = capturedAtoms.length; i < il; i++)
			{
				var msg = {
					command: "moveAtom",
					x: capturedAtoms[i].position.x,
					y: capturedAtoms[i].position.y,
					z: capturedAtoms[i].position.z
				};
				capturedAtoms[i].assignAtomSpecToObject( msg );
				// socket.send(JSON.stringify(msg));
			}

			capturedAtoms = [];
			localCapturedAtomPositions = [];
		}
	}

	return rigidMover;
}

function initAutoRotamer()
{
	/* Rotamer changer
	 * Put it over an atom. Sends to coot, gets different conformations, shows them. They are selectable
	 * This is a specific tool because Coot has specific suggestions. But why shouldn't it have suggestions for an arbitrary atom?
	 */

	var autoRotamer = Tool(0x00FF00)
	
	autoRotamer.onLetGo = turnOffAllHighlights;

	autoRotamer.whileHeld = function(positionInAssemblage)
	{
		var ourRadiusSq = sq( this.boundingSphere.radius / getAngstrom() );

		if( this.parent.button1 && !this.parent.button1Old )
		{
			for(var i = 0; i < models.length; i++)
			{
				for(var j = 0, jl = models[i].atoms.length; j < jl; j++)
				{
					if( models[i].atoms[j].position.distanceToSquared( positionInAssemblage ) < ourRadiusSq )
					{
						var msg = {command:"autoFitBestRotamer"};
						models[i].atoms[j].assignAtomSpecToObject( msg );
						// socket.send(JSON.stringify(msg));
						//TODO this gets sent more than you would like
					}
				}
			}
		}
		else
		{
			highlightResiduesOverlappingSphere(this, ourRadiusSq)
		}
	}

	return autoRotamer;
}