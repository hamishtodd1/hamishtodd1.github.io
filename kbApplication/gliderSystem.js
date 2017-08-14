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
	
	gliderSystem.glider = new THREE.Mesh(new THREE.Geometry(), new THREE.MeshPhongMaterial());
	gliderSystem.add( gliderSystem.glider );
	gliderSystem.glider.position.z = 0.06;
	new THREE.OBJLoader().load( "data/paraglider.obj",
		function ( object ) 
		{
			gliderSystem.glider.geometry = object.children[0].geometry;
			gliderSystem.glider.material = object.children[0].material;
			
			var corrector = new THREE.Matrix4();
			gliderSystem.glider.geometry.computeBoundingSphere();
			var correctorScale = 0.3/gliderSystem.glider.geometry.boundingSphere.radius;
			for(var i = 0; i < 3; i++)
				corrector.elements[i*5] *= correctorScale;
			corrector.setPosition( gliderSystem.glider.geometry.boundingSphere.center.clone().multiplyScalar(-correctorScale))
			var corrector2 = new THREE.Matrix4().makeRotationAxis( xAxis,TAU/4 + 0.1 );
			
			gliderSystem.glider.geometry.applyMatrix( corrector );
			gliderSystem.glider.geometry.applyMatrix( corrector2 );
			gliderSystem.glider.material.color.setRGB(1,0,0);
			gliderSystem.glider.material.needsUpdate = true;
		},
		function ( xhr ) {}, function ( xhr ) {console.log( 'texture loading error' );}
	);
	
	var horizontalSpacer = new THREE.Vector3(bgs[0].scale.x * 0.826,bgs[0].scale.y * 0.026,0);
	var verticalSpacer = horizontalSpacer.clone().applyAxisAngle(zAxis,TAU/4).setLength(horizontalSpacer.length());
	var hNormal = horizontalSpacer.clone().normalize();
	var vNormal = verticalSpacer.clone().normalize();
	
	gliderSystem.direction = 0;
	gliderSystem.orientation = 0;
	
	var angleFromUpward = 0;
	
	//start with the glider "jumping from plane" - they swing into position?
	
	//----arrow shit
	{
		var directionArrow = new THREE.Mesh( new THREE.Geometry(), new THREE.MeshBasicMaterial({color: 0xFFFFFF}) );
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
		directionArrow.position.z = bgs[0].position.z + 0.01;
		
		gliderSystem.add(directionArrow);
	}
	
	gliderSystem.addToOrientation = function( orientationChange )
	{
		this.glider.rotation.z += orientationChange;
		while(this.glider.rotation.z > TAU)
			this.glider.rotation.z -= TAU;
		while(this.glider.rotation.z < 0 )
			this.glider.rotation.z += TAU;
	}
	
	gliderSystem.update = function(direction,orientation)
	{
		var mouseInGliderCircleSpace = clientPosition.clone();
		mouseInGliderCircleSpace.sub(this.position)
		this.glider.updateMatrix();
		mouseInGliderCircleSpace.applyMatrix4( new THREE.Matrix4().getInverse( this.glider.matrix.clone() ) );
		mouseInGliderCircleSpace.y *= 568/153;
		var mouseIsInGlider = ( mouseInGliderCircleSpace.length() < 0.3 );
		
		if( gliderGrabbed || (mouseIsInGlider && !bgGrabbed ) )
			this.glider.material.emissive.b = 0.4;
		else
			this.glider.material.emissive.b = 0;
		
		var oldClientRelative = oldClientPosition.clone();
		oldClientRelative.x -= this.position.x;
		oldClientRelative.y -= this.position.y;
		var clientRelative = clientPosition.clone();
		clientRelative.x -= this.position.x;
		clientRelative.y -= this.position.y;
		var angleChange = getSignedAngleBetween(oldClientRelative,clientRelative);
		
		if( gliderGrabbed )
		{	
			this.addToOrientation(angleChange);
		}
		else if( bgGrabbed )
		{
			angleFromUpward += angleChange;
		}
		else if( typeof direction !== 'undefined' )
		{
			angleFromUpward = direction;
			this.addToOrientation(orientation - this.glider.rotation.z);
		}
		
		if( kbPointGrabbed || bgGrabbed || gliderGrabbed )
		{
			directionArrow.visible = true;
			directionArrow.rotation.z = angleFromUpward + this.glider.rotation.z;
		}
		else
			directionArrow.visible = false;
		
		var velocity = new THREE.Vector3(0,frameDelta/10,0);
		velocity.applyAxisAngle(zAxis,angleFromUpward);
		velocity.applyAxisAngle(zAxis,this.glider.rotation.z);
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
		
		if( bgGrabbed || gliderGrabbed )
			kbSystem.update( angleFromUpward, this.glider.rotation.z);
	}
	
	return gliderSystem;
}