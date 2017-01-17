function init_atoms()
{
	var atomRadius = 0.07;
	var bondLength = atomRadius * 3; //i.e. place where potential is zero
	//todo: local
	attractedAtom = new THREE.Mesh(new THREE.SphereGeometry(atomRadius,32,32), new THREE.MeshPhongMaterial({color:0xFF0000}) );
	
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
		/* Thoughts:
		 * Could use a better integrator. Actually shouldn't there be a differential equation solvable in closed form?
		 * there's something about time and accuracy bundled up in "forceScalar". It is technically 1/mass, but not clear what sense it makes to think of it that way
		 * Your movement of the neighbourhood atoms represents a discontinuous, i.e. infinite force, change. Or you could say "over the last delta_t it moved continuously"
		 * Unfortunate that forceScalar is in part compensating for a bad solver
		 * DON'T THINK TOO HARD THE ONLY PURPOSE OF THIS IS TO DEMONSTRATE THE BOND LENGTH THING
		 */
	}
	
	//------Readying the others
	var holdingAtom = attractedAtom.clone();
	holdingAtom.add( new THREE.Mesh(new THREE.SphereGeometry(bondLength,32,32), new THREE.MeshPhongMaterial({color:0xFF0000, transparent: true, opacity: 0.1}) ) );
	holdingAtom.position.x = atomRadius * 2;
	holdingAtom.position.z = -1;
	
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
	Scene.add(attractedAtom);
	var justTheOne = false;
	if( justTheOne )
	{
		Scene.add(holdingAtom);
		attractedAtom.position.copy(holdingAtom.position);
		attractedAtom.position.x -= bondLength;
		attractedAtom.partnerAtoms.push(holdingAtom);
	}
	else
	{
		Scene.add(atomCage);
		attractedAtom.position.copy(atomCage.position);
		for(var i = 0; i < atomCage.children.length; i++)
			attractedAtom.partnerAtoms.push( atomCage.children[i] );
	}
	
	//TODO get rid of this
	previousMousePosition = new THREE.Vector3(0,0,0);
	document.addEventListener( 'mousemove', function(event) {
		if(previousMousePosition.equals(THREE.zeroVector))
			previousMousePosition.set(event.clientX, event.clientY, 0);
		var mouseMovement = new THREE.Vector3(event.clientX-previousMousePosition.x,-event.clientY+previousMousePosition.y, 0);
		mouseMovement.multiplyScalar(0.001);
		if( justTheOne )
			holdingAtom.position.add(mouseMovement);
		else
			atomCage.position.add(mouseMovement);
		previousMousePosition.set(event.clientX,event.clientY, 0);
	}, false );
}