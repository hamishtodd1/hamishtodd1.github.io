/* 
	You grab a sphere's worth and they continue to move.
	Every hand movement (serious hand movement?) gets sent as a force restraint
	Could send the movement itself to coot
	
	getIntermediateAtoms(newDrags):
		for(drag in newDrags)
	    intermediateAtoms = get_intermediate_atoms_bonds_representation()
	    if( intermediateAtoms == False )
	    	//we're finished, need to send final thing
	    else:
	    	if()
	    	intermediate_atoms_distortions(residues_spec_list)
	    	jsify_and_send( intermediateAtoms )


	intermediate_atoms_distortions(residues_spec_list)

	continue to hold the thing in place and it continues to send force vectors


	"residues_distortions(imol, residues_spec_list)"

	
	Paul sent you an image of "distortions" at some point, cartoony looking
	You may want to see environment distances as the things are moving
	could make them glow or whatever
 */

function initRefiner()
{
	startRefinement = function()
	{
		var dummyResidues = [['A',88,''],['A',89,''],['A',90,'']]
		var msg = {
			command: "commence refinement",
			imol: 0, //TODO
			residues: dummyResidues
		};
		socket.send(JSON.stringify(msg));
	}
	stopRefinement = function()
	{
		var msg = { command: "cease refinement" };
		socket.send(JSON.stringify(msg));
		//would be nice to display stats
	}

	console.log("commencing refinement")
	startRefinement()

	socket.commandReactions.intermediateAtoms = function(msg)
	{
		console.log("got intermediate atoms!", msg)
		// stopRefinement()
		socket.send(JSON.stringify({ command: "add restraint" }))
	}

	return

	var autoRefiner = new THREE.Object3D();
	
	var radius = 0.05;
	var ball = new THREE.Mesh(new THREE.EfficientSphereBufferGeometry(radius), new THREE.MeshLambertMaterial({transparent:true,color:0x00FFFF, opacity: 0.7}));
	autoRefiner.add( ball );
	ball.geometry.computeBoundingSphere();
	autoRefiner.boundingSphere = ball.geometry.boundingSphere;

	var label = makeTextSign( "Auto refiner" );
	label.position.z = radius;
	label.scale.setScalar(radius/3)
	autoRefiner.add(label);

	var oldPosition = autoRefiner.position.clone();
	
	autoRefiner.update = function()
	{
		label.visible = this.parent === scene;

		var ourRadiusSq = sq( radius / getAngstrom() );

		if(this.parent !== scene )
		{
			if( this.parent.button1 && !this.parent.button1Old )
			{
				for(var i = 0; i < 1; i++)
				{
					var ourPosition = new THREE.Vector3();
					this.getWorldPosition(ourPosition);
					models[i].updateMatrixWorld();
					models[i].worldToLocal(ourPosition);

					var residuesToRefine = [];
					
					for(var j = 0, jl = models[i].atoms.length; j < jl; j++)
					{
						if( models[i].atoms[j].position.distanceToSquared( ourPosition ) < ourRadiusSq )
						{
							var inThereAlready = false;
							for(var k = 0, kl = residuesToRefine.length; k < kl; k++)
							{
								if( residuesToRefine[k][0] === models[i].atoms[j].chainId &&
									residuesToRefine[k][1] === models[i].atoms[j].resNo &&
									residuesToRefine[k][2] === models[i].atoms[j].insertionCode )
								{
									inThereAlready = true;
									break;
								}
							}
							if(!inThereAlready)
							{
								residuesToRefine.push([
									models[i].atoms[j].chainId,
									models[i].atoms[j].resNo,
									models[i].atoms[j].insertionCode
								]);
							}
						}
					}

					if( residuesToRefine.length )
					{
						var msg = {
							command: "commence refinement",
							imol: 0, //TODO CONTINGENT!!!!
							residues: residuesToRefine
						};
						socket.send(JSON.stringify(msg));
					}
					break;
				}
			}

			if( !this.parent.button1 && this.parent.button1Old )
			{
				stopRefinement();
			}

			if( this.parent.button1 && this.parent.button2 )
			{
				//this.matrix.clone.multiply( new THREE.Matrix4().getInverse(oldMatrix) );
				// var closestAtom = getClosestAtomToWorldPosition(this.getWorldPosition());
				// closestAtom.assignAtomSpecToObject(msg);

				// var deltaVector = this.position.clone().sub(oldPosition);
				// var msg = {
				// 	command:"forceRestraint",
				// 	newPosition: [
				// 		closestAtom.position.x + deltaVector.x,
				// 		closestAtom.position.y + deltaVector.y,
				// 		closestAtom.position.z + deltaVector.z
				// 		//TODO work it out server side from get_intermediate_etc, less out-of-date
				// 	]
				// }

				// socket.send(JSON.stringify(msg));
			}
		}

		oldPosition.copy(this.position)
	}

	autoRefiner.onLetGo = stopRefinement;
	
	objectsToBeUpdated.push(autoRefiner);
	holdables.push(autoRefiner)
	scene.add(autoRefiner);
	autoRefiner.ordinaryParent = autoRefiner.parent;

	return autoRefiner;
}