function initGliderSystem()
{
	var gliderSystem = new THREE.Object3D();
	
	var bgs = Array(9);
	bgs[0] = new THREE.Mesh( new THREE.PlaneGeometry(1,1), new THREE.MeshBasicMaterial({transparent:true}) ); //transparent because png has transparency
	bgs[0].scale.setScalar(1.2);
	gliderSystem.add( bgs[0] );
	
	ourTextureLoader.load(
		"data/satellite.png",
		function(texture) {
			bgs[0].material.map = texture;
			bgs[0].material.needsUpdate = true;
		},
		function ( xhr ) {}, function ( xhr ) {console.log( 'texture loading error' );}
	);
	
	for(var i = 1; i < bgs.length; i++)
	{
		bgs[i] = bgs[0].clone();
		gliderSystem.add( bgs[i] );
	}
	
	var glider = new THREE.Mesh(new THREE.Geometry(), new THREE.MeshPhongMaterial());
	gliderSystem.glider = glider;
	gliderSystem.add( glider );
	glider.position.z = 0.06;
	glider.flipAnimation = -1;
	new THREE.OBJLoader().load( "data/paraglider.obj",
		function ( object ) 
		{
			glider.geometry = object.children[0].geometry;
			glider.material = object.children[0].material;
			
			var corrector = new THREE.Matrix4();
			glider.geometry.computeBoundingSphere();
			var correctorScale = 0.3/glider.geometry.boundingSphere.radius;
			for(var i = 0; i < 3; i++)
				corrector.elements[i*5] *= correctorScale;
			corrector.setPosition( glider.geometry.boundingSphere.center.clone().multiplyScalar(-correctorScale))
			corrector.premultiply(new THREE.Matrix4().makeRotationAxis( xAxis,TAU/4 + 0.1 ) );
//			corrector.premultiply(new THREE.Matrix4().makeRotationAxis( zAxis,TAU/4 ) );
			
			glider.geometry.applyMatrix( corrector );
			glider.material.color.setRGB(1,0,0);
			glider.material.needsUpdate = true;
		},
		function ( xhr ) {}, function ( xhr ) {console.log( 'texture loading error' );}
	);
	
	var horizontalSpacer = new THREE.Vector3(bgs[0].scale.x * 0.826,bgs[0].scale.y * 0.026,0);
	var verticalSpacer = horizontalSpacer.clone().applyAxisAngle(zAxis,TAU/4).setLength(horizontalSpacer.length());
	var hNormal = horizontalSpacer.clone().normalize();
	var vNormal = verticalSpacer.clone().normalize();
	
	//start with the glider "jumping from plane" - they swing into position?
	
	//----arrow shit
	{
		var directionArrow = new THREE.Mesh( new THREE.Geometry(), new THREE.MeshBasicMaterial({color: 0xFFFFFF, side:THREE.DoubleSide}) );
		var full_length = 0.45;
		var head_length = full_length / 3;
		var head_width = head_length / (Math.sqrt(3) / 2);
		var body_width = head_width / 2.8;
		
		directionArrow.geometry.vertices.push(
			new THREE.Vector3( 0, full_length, 0 ),
			new THREE.Vector3( head_width / 2, full_length - head_length, 0 ),
			new THREE.Vector3(-head_width / 2, full_length - head_length, 0 )
		);
		directionArrow.geometry.faces.push(new THREE.Face3(0,2,1));
		
		directionArrow.geometry.vertices.push(
				new THREE.Vector3(-body_width / 2, full_length - head_length, 0 ),
				new THREE.Vector3( body_width / 2, full_length - head_length, 0 ),
				new THREE.Vector3(-body_width / 2, 0, 0 ),
				new THREE.Vector3( body_width / 2, 0, 0 )
			);
		directionArrow.geometry.faces.push(new THREE.Face3(3,6,4));
		directionArrow.geometry.faces.push(new THREE.Face3(5,6,3));
		
		directionArrow.matrixAutoUpdate = false;
		
		directionArrow.flipAnimation = -1;
		
		gliderSystem.add(directionArrow);
	}
	
	glider.rotation.z = TAU / 8;
	var directionRotation = -TAU / 8;
	
	function setOrientation( orientationChange )
	{
		glider.rotation.z = orientationChange;
		while(glider.rotation.z > TAU)
			glider.rotation.z -= TAU;
		while(glider.rotation.z < 0 )
			glider.rotation.z += TAU;
	}
	
	function getMouseAngleChange()
	{
		var oldClientRelative = oldClientPosition.clone();
		oldClientRelative.x -= gliderSystem.position.x;
		oldClientRelative.y -= gliderSystem.position.y;
		var clientRelative = clientPosition.clone();
		clientRelative.x -= gliderSystem.position.x;
		clientRelative.y -= gliderSystem.position.y;
		return getSignedAngleBetween(oldClientRelative,clientRelative);
	}
	
	gliderSystem.update = function(direction,orientation)
	{
		//----The business end
		if( gliderGrabbed )
		{
			var oldOrientation = glider.rotation.z;
			
			setOrientation( glider.rotation.z + getMouseAngleChange() );
			
			if( ( oldOrientation > Math.PI && glider.rotation.z <= Math.PI) ||
				( oldOrientation <= Math.PI && glider.rotation.z > Math.PI) )
			{
				kbSystem.diamond.material.color.r = 1;
				var randomSoundIndex = Math.round( Math.random() * 2 ) + 1;
				Sounds["pop"+randomSoundIndex.toString()].play();
//				glider.flipAnimation = 0;
			}
		}
		else if( bgGrabbed )
		{
			directionRotation += getMouseAngleChange();
		}
		else if( typeof direction !== 'undefined' )
		{
			var oldOrientation = glider.rotation.z;
			setOrientation( orientation );
			
			directionRotation = direction;
			
			var ourFlip = -1;
			if( oldOrientation > Math.PI && glider.rotation.z <= Math.PI)
				ourFlip = 1;
			if( oldOrientation <=Math.PI && glider.rotation.z > Math.PI)
				ourFlip = 0;
				
			var allowedForNoFlip = 0.1;
			console.log(directionRotation)
			if(ourFlip !== -1 && Math.abs(directionRotation - TAU/4) > allowedForNoFlip && Math.abs(directionRotation - 3*TAU/4) > allowedForNoFlip )
			{
				directionArrow.flipAnimation = 0;
				Sounds[ "change" + ourFlip.toString() ].play();
			}
		}
		
		if( bgGrabbed || gliderGrabbed )
			kbSystem.update( directionRotation, glider.rotation.z);
		
		//----"Implementing" the above
		{
			if(glider.flipAnimation !== -1)
			{
//				if( glider.flipAnimation < 0.5)
//					glider.scale.y = 1 - 2 * glider.flipAnimation;
//				else
//					glider.scale.y = -1 + 2 * glider.flipAnimation;
				
				var power = 2;
				glider.scale.y = Math.abs(Math.pow( glider.flipAnimation - 0.5, power )) / Math.pow( 0.5, power );
				
				glider.flipAnimation += frameDelta * 4;
				if(glider.flipAnimation > 1)
					glider.flipAnimation = -1;
			}
			else glider.scale.y = 1;
			
			var dASquash = 1;
			if(directionArrow.flipAnimation !== -1)
			{
				//make a dotted line appear?
				
				dASquash = -1 + directionArrow.flipAnimation * 2;
				
				directionArrow.flipAnimation += frameDelta * 1.9;
				if( directionArrow.flipAnimation > 1 )
					directionArrow.flipAnimation = -1;
			}
			
			var dAXVector = new THREE.Vector3(1,0,0).applyAxisAngle(zAxis,directionRotation);
			var dAYVector = new THREE.Vector3(0,1,0).applyAxisAngle(zAxis,directionRotation);
			dAXVector.y *= dASquash;
			dAYVector.y *= dASquash;
			directionArrow.matrix.makeBasis(dAXVector,dAYVector, new THREE.Vector3(0,0,1));
			directionArrow.matrix.setPosition( new THREE.Vector3(0,0,bgs[0].position.z + 0.01) );
			
			var mouseInGliderCircleSpace = clientPosition.clone();
			mouseInGliderCircleSpace.sub(this.position)
			glider.updateMatrix();
			mouseInGliderCircleSpace.applyMatrix4( new THREE.Matrix4().getInverse( glider.matrix.clone() ) );
			mouseInGliderCircleSpace.y *= 568/153;
			var mouseIsInGlider = ( mouseInGliderCircleSpace.length() < 0.3 );
			
			if( kbPointGrabbed || bgGrabbed )
				directionArrow.visible = true;
			else
				directionArrow.visible = false;
			
			if( gliderGrabbed || (mouseIsInGlider && !bgGrabbed ) )
				glider.material.emissive.b = 0.4;
			else
				glider.material.emissive.b = 0;

			var velocity = new THREE.Vector3(0,frameDelta/10,0);
			velocity.applyAxisAngle(zAxis,directionRotation);
			bgs[4].position.sub( velocity );
			//wrapping
			while( bgs[4].position.dot(hNormal) > horizontalSpacer.length() / 2 )
				bgs[4].position.sub(horizontalSpacer);
			while( bgs[4].position.dot(hNormal) < horizontalSpacer.length() /-2 )
				bgs[4].position.add(horizontalSpacer);
			while( bgs[4].position.dot(vNormal) > verticalSpacer.length() / 2 )
				bgs[4].position.sub(verticalSpacer);
			while( bgs[4].position.dot(vNormal) < verticalSpacer.length() /-2 )
				bgs[4].position.add(verticalSpacer);
			
			for(var i = 0; i < bgs.length; i++)
			{
				if(i===4)
					continue;
				
				bgs[i].position.copy( bgs[4].position );
				
				/*
				 * 036
				 * 147
				 * 258
				 */
				if(i<3)
				{
					bgs[i].position.sub(horizontalSpacer);
				}
				if(i>=6)
				{
					bgs[i].position.add(horizontalSpacer);
				}
				
				if( i%3 === 0 )
				{
					bgs[i].position.add(verticalSpacer);
				}
				if( i%3 === 2 )
				{
					bgs[i].position.sub(verticalSpacer);
				}
			}
		}
	}
	
	return gliderSystem;
}