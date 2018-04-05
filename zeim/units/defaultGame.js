function initDefaultGame()
{
	{
		var avatar = new THREE.Mesh(new THREE.CircleGeometry(0.05,32), new THREE.MeshBasicMaterial({color:0x0000FF, side: THREE.DoubleSide}));
		avatar.geometry.computeBoundingSphere();
		scene.add(avatar);
	}
	
	var circlesToInvert = [];
	
	var badObjects = Array(2);
	var badMat = new THREE.MeshBasicMaterial({color:0xFF0000, side: THREE.DoubleSide});
	for( var i = 0; i < badObjects.length; i++)
	{
		badObjects[i] = new THREE.Mesh(new THREE.CircleGeometry(0.03,32), badMat);
		badObjects[i].position.set(Math.random() - 0.5,Math.random() - 0.5,0);
		badObjects[i].geometry.computeBoundingSphere();
		
		scene.add(badObjects[i]);
		circlesToInvert.push(badObjects[i])
	}
	
	var goodObjects = Array(1);
	var goodMat = new THREE.MeshBasicMaterial({color:0x00FF00, side: THREE.DoubleSide});
	for( var i = 0; i < goodObjects.length; i++)
	{
		goodObjects[i] = new THREE.Mesh(new THREE.CircleGeometry(0.01,32), goodMat);
		goodObjects[i].position.set(Math.random() - 0.5,Math.random() - 0.5,0);
		goodObjects[i].geometry.computeBoundingSphere();
		
		scene.add(goodObjects[i]);
		circlesToInvert.push(goodObjects[i])
	}
	
	var neutralObjects = Array(3);
	var neutralMat = new THREE.MeshBasicMaterial({color:0x000000, side: THREE.DoubleSide});
	for( var i = 0; i < neutralObjects.length; i++)
	{
		neutralObjects[i] = new THREE.Mesh( new THREE.CircleGeometry(0.1,32), neutralMat);
		neutralObjects[i].position.set(Math.random() - 0.5,Math.random() - 0.5,0);
		neutralObjects[i].geometry.computeBoundingSphere();
		
		scene.add(neutralObjects[i]);
		circlesToInvert.push(neutralObjects[i])
	}
	
	var inversionRadius = 0.2;
	var perimeterWidth = 0.01;
	var inversionPerimeter = new THREE.Mesh(new THREE.RingBufferGeometry( inversionRadius - perimeterWidth / 2,inversionRadius + perimeterWidth / 2, 32), new THREE.MeshBasicMaterial({color:0xFFFF00, side:THREE.DoubleSide}) );
	inversionPerimeter.position.z -= 0.01;
	scene.add(inversionPerimeter);
	
	function getRadius()
	{
		return this.geometry.vertices[1].distanceTo( this.geometry.vertices[0]);
	}
	
	for(var i = 0; i < circlesToInvert.length; i++)
	{
		circlesToInvert[i].getRadius = getRadius;
	}
	
	function objectsOverlapping(a,b)
	{
		var dist = a.position.clone().add(a.geometry.boundingSphere.center).distanceTo( b.position.clone().add(b.geometry.boundingSphere.center) );
		if( dist < a.geometry.boundingSphere.radius + b.geometry.boundingSphere.radius )
			return true;
		else return false;
	}
	
	invert = function()
	{
		//a nice tween would be if you started with the circle inversion as if it was at the place where the vertex is
		
		//To get exact center: find those two points that would be on a line touching both circle centers. Invert those two points and find their midpoint
		//this requires things to be more virtual
		
		for(var i = 0; i < circlesToInvert.length; i++)
		{
			circlesToInvert[i].updateMatrixWorld();
			for(var j = 0, jl = circlesToInvert[i].geometry.vertices.length; j < jl; j++)
			{
				circlesToInvert[i].localToWorld( circlesToInvert[i].geometry.vertices[j] );
				var newLength = inversionRadius * inversionRadius / circlesToInvert[i].geometry.vertices[j].length();
				circlesToInvert[i].geometry.vertices[j].setLength(newLength);
			}
			
			circlesToInvert[i].geometry.computeBoundingSphere();
			circlesToInvert[i].position.copy( circlesToInvert[i].geometry.boundingSphere.center );
			circlesToInvert[i].updateMatrixWorld();
			
			for(var j = 0, jl = circlesToInvert[i].geometry.vertices.length; j < jl; j++)
			{
				circlesToInvert[i].worldToLocal( circlesToInvert[i].geometry.vertices[j] );
			}
			circlesToInvert[i].geometry.computeBoundingSphere();
			
			circlesToInvert[i].geometry.verticesNeedUpdate = true;
		}
	}
	
	function coreLoop() {
		frameDelta = ourclock.getDelta();
		timeSinceStart += frameDelta;
		
		asynchronousInput.read();
		
		avatar.position.copy(clientPosition);
		
		for(var i = 0; i < neutralObjects.length; i++)
		{
			if(neutralObjects[i].parent !== scene)
				continue;
			if( objectsOverlapping( avatar, neutralObjects[i] ) )
			{
				var newDisplacement = avatar.position.clone();
				newDisplacement.sub(neutralObjects[i].position);
				newDisplacement.setLength(avatar.geometry.vertices[1].x + neutralObjects[i].getRadius() );
				
				avatar.position.addVectors(neutralObjects[i].position, newDisplacement)
			}
		}
		
		for(var i = 0; i < goodObjects.length; i++)
		{
			if(goodObjects[i].parent !== scene)
				continue;
			if( objectsOverlapping( avatar, goodObjects[i] ) )
			{
				scene.remove(goodObjects[i]);
				Sounds.pop1.play();
			}
		}
		
		for(var i = 0; i < badObjects.length; i++)
		{
			if(badObjects[i].parent !== scene)
				continue;
			if( objectsOverlapping( avatar, badObjects[i] ) )
			{
				Sounds.change1.play();
			}
		}
		
		requestAnimationFrame( coreLoop );
		renderer.render( scene, camera );
	}
}