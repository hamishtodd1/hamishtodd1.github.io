function initDefaultGame()
{
	{
		var avatar = new THREE.Mesh(new THREE.CircleGeometry(0.05,32), new THREE.MeshBasicMaterial({color:0x0000FF, side: THREE.DoubleSide}));
		avatar.geometry.computeBoundingSphere();
		scene.add(avatar);
	}
	
	var badObjects = Array(2);
	var badMat = new THREE.MeshBasicMaterial({color:0xFF0000, side: THREE.DoubleSide});
	for( var i = 0; i < badObjects.length; i++)
	{
		badObjects[i] = new THREE.Mesh(new THREE.CircleGeometry(0.03,32), badMat);
		badObjects[i].position.set(Math.random() - 0.5,Math.random() - 0.5,0);
		badObjects[i].geometry.computeBoundingSphere();
		
		scene.add(badObjects[i]);
	}
	
	var goodObjects = Array(1);
	var goodMat = new THREE.MeshBasicMaterial({color:0x00FF00, side: THREE.DoubleSide});
	for( var i = 0; i < goodObjects.length; i++)
	{
		goodObjects[i] = new THREE.Mesh(new THREE.CircleGeometry(0.01,32), goodMat);
		goodObjects[i].position.set(Math.random() - 0.5,Math.random() - 0.5,0);
		goodObjects[i].geometry.computeBoundingSphere();
		
		scene.add(goodObjects[i]);
	}
	
	var neutralObjects = Array(3);
	var neutralMat = new THREE.MeshBasicMaterial({color:0x000000, side: THREE.DoubleSide});
	for( var i = 0; i < neutralObjects.length; i++)
	{
		neutralObjects[i] = new THREE.Mesh( new THREE.CircleGeometry(0.1,32), neutralMat);
		neutralObjects[i].position.set(Math.random() - 0.5,Math.random() - 0.5,0);
		neutralObjects[i].geometry.computeBoundingSphere();
		
		scene.add(neutralObjects[i]);
	}
	
	function objectsOverlapping(a,b)
	{
		var dist = a.position.clone().add(a.geometry.boundingSphere.center).distanceTo( b.position.clone().add(b.geometry.boundingSphere.center) );
		if( dist < a.geometry.boundingSphere.radius + b.geometry.boundingSphere.radius )
		{
			return true;
		}
		else return false;
	}
	
	markedThingsToBeUpdated.push(avatar)
	avatar.update = function()
	{
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