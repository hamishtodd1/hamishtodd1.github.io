function placeholder_interpret_ngl(Models)
{
	var ProteinGeometry = loose_surface.bufferList[0].geometry;
	
	var ourcopy = new THREE.Mesh( new THREE.BufferGeometry(),
				  new THREE.MeshPhongMaterial() );
	
	ourcopy.geometry.addAttribute( 'position', 
			new THREE.BufferAttribute( ProteinGeometry.attributes.position.array, 3 ) );
	ourcopy.geometry.addAttribute( 'normal', 
			new THREE.BufferAttribute( ProteinGeometry.attributes.normal.array, 3 ) );
	ourcopy.geometry.setIndex(
			new THREE.BufferAttribute( ProteinGeometry.index.array, 1 ) );
	
	var num_NaNs =  0;
	for(var i = 0; i < ProteinGeometry.attributes.position.array.length; i++)
	{
		if( isNaN( ProteinGeometry.attributes.position.array[i] ))
		{
			num_NaNs++;
			
			//patch it up
			if(i >= 3)
				ProteinGeometry.attributes.position.array[i] = ProteinGeometry.attributes.position.array[i-3];
			else
				ProteinGeometry.attributes.position.array[i] = ProteinGeometry.attributes.position.array[i+3];
		}
	}
	if(num_NaNs)console.log("NaNs in surface: ", num_NaNs);
	
	ourcopy.geometry.computeBoundingSphere();
	var center_coords = ourcopy.geometry.boundingSphere.center.toArray();
	
	for(var i = 0, il = ProteinGeometry.attributes.position.array.length; i < il; i++)
		ProteinGeometry.attributes.position.array[i] -= center_coords[i%3];
	
	var ourscale = 0.0005 * ourcopy.geometry.boundingSphere.radius / Models[0].scale.x;
	ourcopy.scale.set(ourscale,ourscale,ourscale);
	ourcopy.position.x -= 1.9;
	ourcopy.position.y += 2.1;
	ourcopy.position.z += 0;

	console.log(Models)
	Models[0].add(ourcopy);
}

function get_NGL_protein()
{
	var xhr = new XMLHttpRequest();
	xhr.open( "GET", "http://mmtf.rcsb.org/v0.2/full/1L2Y", true );
	xhr.addEventListener( 'load', function( event ){
		var blob = new Blob( [ xhr.response ], { type: 'application/octet-binary'} );
		
//		stage.loadFile( blob, {
//				ext: "pdb", defaultRepresentation: true
//		} ).then( function( o ){
//			var rep_name = "surface";
//			o.addRepresentation( rep_name );
//			console.log(o)
//			loose_surface = o.reprList[ o.reprList.length - 1 ].repr;
//			if( rep_name === "surface")
//				stage.tasks.onZeroOnce( placeholder_interpret_ngl );
////			if( rep_name === "ribbon")
////				stage.tasks.onZeroOnce( placeholder_interpret_ngl_ribbon );
//			
//			//we would like to know when it has finished making its representation and call the code currently in input			
//		} );
		
		stage.loadFile( blob, {
				ext: "mmtf", defaultRepresentation: true
		} ).then( function( o ){
			o.addRepresentation( "surface" );
			console.log(o.reprList);
			loose_surface = o.reprList[3].repr;
//			stage.tasks.onZeroOnce( placeholder_interpret_ngl );
			
			//we would like to know when it has finished making its representation and call the code currently in input			
		} );
	} );
	xhr.responseType = "arraybuffer";
	xhr.send( null );
}