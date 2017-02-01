function init_atoms( presentation )
{
	var atomRadius = 0.03;
	var bondLength = atomRadius * 3; //i.e. place where potential is zero

	var attractedAtom = new THREE.Mesh(new THREE.SphereGeometry(atomRadius,32,32), new THREE.MeshPhongMaterial({color:0xFF0000}) );
	
	attractedAtom.velocity = new THREE.Vector3();
	attractedAtom.partnerAtoms = Array();
	attractedAtom.update = function() 
	{
		var netForce = new THREE.Vector3();
		var potentialWellDepth = 1;
		for(var i = 0, il = this.partnerAtoms.length; i < il; i++)
		{
			var forceDirection = this.partnerAtoms[i].getWorldPosition(); //presumably this is a clone of the position
			forceDirection.sub(this.position);
			var interAtomDistance = forceDirection.length();
			forceDirection.normalize();
			var forceStrength = 4 * potentialWellDepth * ( 
					Math.pow( bondLength / interAtomDistance, 12) - //repulsive
					Math.pow( bondLength / interAtomDistance, 6) ); //attractive
			var force = forceDirection.clone();
			force.multiplyScalar(-forceStrength );
			netForce.add(force);
		}
		var acceleration = netForce.clone();
		var forceScalar = 0.00006; //a tweaked thing. See below
		acceleration.multiplyScalar(forceScalar);
		this.velocity.add(acceleration);
		this.position.add(this.velocity);
//		/* Thoughts:
//		 * Could use a better integrator. Actually shouldn't there be a differential equation solvable in closed form?
//		 * there's something about time and accuracy bundled up in "forceScalar". It is technically 1/mass, but not clear what sense it makes to think of it that way
//		 * Your movement of the neighbourhood atoms represents a discontinuous, i.e. infinite force, change. Or you could say "over the last delta_t it moved continuously"
//		 * Unfortunate that forceScalar is in part compensating for a bad solver
//		 * DON'T THINK TOO HARD THE ONLY PURPOSE OF THIS IS TO DEMONSTRATE THE BOND LENGTH THING
//		 */
	}
	
	//------Readying the others
	var holdingAtom = attractedAtom.clone();
	holdingAtom.add( new THREE.Mesh(new THREE.SphereGeometry(bondLength,32,32), new THREE.MeshPhongMaterial({color:0xFF0000, transparent: true, opacity: 0.1}) ) );
	
	var atomCage = new THREE.Object3D();
	atomCage.position.x = 0;
	atomCage.position.z = -1;
	for(var i = 0; i < 3; i++)
	{
		for(var j = 0; j < 3; j++)
		{
			for(var k = 0; k < 3; k++)
			{
				if( i === 1 && k === 1 && j === 1 )
					continue;
				var newAtom = new THREE.Mesh( new THREE.SphereGeometry( atomRadius, 32, 32 ), new THREE.MeshPhongMaterial( { color:0xFF0000 } ) );
				newAtom.position.set( i - 1, j - 1, k - 1 );
				newAtom.position.multiplyScalar(bondLength);
				atomCage.add( newAtom );
			}
		}
	}
	
	//readying the scene
	var justTheOne = true;
	if( justTheOne )
	{
		attractedAtom.position.copy( holdingAtom.position );
		attractedAtom.position.x -= bondLength;
		attractedAtom.partnerAtoms.push(holdingAtom);
	}
	else
	{
		attractedAtom.position.copy(atomCage.position);
		for(var i = 0; i < atomCage.children.length; i++)
			attractedAtom.partnerAtoms.push( atomCage.children[i] );
	}
	
	presentation.createNewHoldable( "holdingAtom", holdingAtom );
	presentation.createNewHoldable( "attractedAtom", attractedAtom );
	presentation.createNewHoldable( "atomCage", atomCage );
}