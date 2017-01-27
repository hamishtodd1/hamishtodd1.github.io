function loadMolecule( url ) {

	for ( var i = 0; i < objects.length; i ++ ) {

		var object = objects[ i ];
		object.parent.remove( object );

	}

	objects = [];

	loader.load( url, function ( geometry, geometryBonds ) {

		var offset = geometry.center();
		geometryBonds.translate( offset.x, offset.y, offset.z );

		var positions = geometry.getAttribute( 'position' );
		var colors = geometry.getAttribute( 'color' );

		var position = new THREE.Vector3();
		var color = new THREE.Color();

		for ( var i = 0; i < positions.count; i ++ ) {

			position.x = positions.getX( i );
			position.y = positions.getY( i );
			position.z = positions.getZ( i );

			color.r = colors.getX( i );
			color.g = colors.getY( i );
			color.b = colors.getZ( i );

			var element = geometry.elements[ i ];

			if ( ! colorSpriteMap[ element ] ) {

				var canvas = imageToCanvas( baseSprite );
				var context = canvas.getContext( '2d' );

				colorify( context, canvas.width, canvas.height, color, 1 );

				var dataUrl = canvas.toDataURL();

				colorSpriteMap[ element ] = dataUrl;

			}

			var colorSprite = colorSpriteMap[ element ];

			var atom = document.createElement( 'img' );
			atom.src = colorSprite;

			var object = new THREE.CSS3DSprite( atom );
			object.position.copy( position );
			object.position.multiplyScalar( 75 );

			object.matrixAutoUpdate = false;
			object.updateMatrix();

			root.add( object );

			objects.push( object );

		}

		positions = geometryBonds.getAttribute( 'position' );

		var start = new THREE.Vector3();
		var end = new THREE.Vector3();

		for ( var i = 0; i < positions.count; i += 2 ) {

			start.x = positions.getX( i );
			start.y = positions.getY( i );
			start.z = positions.getZ( i );

			end.x = positions.getX( i + 1 );
			end.y = positions.getY( i + 1 );
			end.z = positions.getZ( i + 1 );

			start.multiplyScalar( 75 );
			end.multiplyScalar( 75 );

			tmpVec1.subVectors( end, start );
			var bondLength = tmpVec1.length() - 50;

			//

			var bond = document.createElement( 'div' );
			bond.className = "bond";
			bond.style.height = bondLength + "px";

			var object = new THREE.CSS3DObject( bond );
			object.position.copy( start );
			object.position.lerp( end, 0.5 );

			object.userData.bondLengthShort = bondLength + "px";
			object.userData.bondLengthFull = ( bondLength + 55 ) + "px";

			//

			var axis = tmpVec2.set( 0, 1, 0 ).cross( tmpVec1 );
			var radians = Math.acos( tmpVec3.set( 0, 1, 0 ).dot( tmpVec4.copy( tmpVec1 ).normalize() ) );

			var objMatrix = new THREE.Matrix4().makeRotationAxis( axis.normalize(), radians );
			object.matrix = objMatrix;
			object.rotation.setFromRotationMatrix( object.matrix, object.rotation.order );

			object.matrixAutoUpdate = false;
			object.updateMatrix();

			root.add( object );

			objects.push( object );

			//

			var bond = document.createElement( 'div' );
			bond.className = "bond";
			bond.style.height = bondLength + "px";

			var joint = new THREE.Object3D( bond );
			joint.position.copy( start );
			joint.position.lerp( end, 0.5 );

			joint.matrix.copy( objMatrix );
			joint.rotation.setFromRotationMatrix( joint.matrix, joint.rotation.order );

			joint.matrixAutoUpdate = false;
			joint.updateMatrix();

			var object = new THREE.CSS3DObject( bond );
			object.rotation.y = Math.PI/2;

			object.matrixAutoUpdate = false;
			object.updateMatrix();

			object.userData.bondLengthShort = bondLength + "px";
			object.userData.bondLengthFull = ( bondLength + 55 ) + "px";

			object.userData.joint = joint;

			joint.add( object );
			root.add( joint );

			objects.push( object );

		}

		//console.log( "CSS3DObjects:", objects.length );

		switch ( visualizationType ) {

			case 0: showAtoms(); break;
			case 1: showBonds(); break;
			case 2: showAtomsBonds(); break;

		}

		render();

	} );


}