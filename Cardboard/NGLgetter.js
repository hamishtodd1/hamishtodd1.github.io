var loose_surface;
function get_NGL_protein()
{
	//Trp-Cage Miniprotein Construct TC5b, 20 residues: 1l2y. Rubisco: 1rcx. Insulin: 4ins
	var testproteinlink = "http://files.rcsb.org/download/4ins.pdb";
	var testobjlink = "http://threejs.org/examples/obj/male02/male02.obj";
		
	var xhr = new XMLHttpRequest();
	xhr.open( "GET", "http://files.rcsb.org/download/4ins.pdb", true );
	xhr.addEventListener( 'load', function( event ){
		var blob = new Blob( [ xhr.response ], { type: 'application/octet-binary'} );
		
		stage.loadFile( blob, {
				ext: "pdb", defaultRepresentation: true
		} ).then( function( o ){
			o.addRepresentation( "surface" );
			loose_surface = o.reprList[3].repr;
			console.log(loose_surface)
			
			//we would like to know when it has finished making its representation and call the code currently in input			
		} );
	} );
	xhr.responseType = "arraybuffer";
	xhr.send( null );
}

var previous_position_length = -1;
var previous_normal_length = -1;
var previous_index_length = -1;

var frames_since_last_unsuccessful_poll_of_model = 0;

function appauling_hacky_model_loader()
{
	//already got model
	if( frames_since_last_unsuccessful_poll_of_model === -1)
		return;
	
	if( frames_since_last_unsuccessful_poll_of_model < 20 )
	{
		frames_since_last_unsuccessful_poll_of_model++;
		return;
	}
	
	frames_since_last_unsuccessful_poll_of_model = 0;
	
	if(typeof loose_surface.bufferList[0] === 'undefined')
		return;
	
	console.log("GOT THROUGH")
	placeholder_interpret_ngl();
	
	frames_since_last_unsuccessful_poll_of_model = -1;
	
	if( loose_surface.bufferList[0].geometry.attributes.position.array.length !== previous_position_length )
	{
		if( typeof loose_surface.bufferList[0].geometry.attributes.normal.array.length !== 'undefined' )
			previous_position_length = loose_surface.bufferList[0].geometry.attributes.normal.array.length;
		return;
	}
	if( loose_surface.bufferList[0].geometry.attributes.normal.array.length !== previous_normal_length )
	{
		if( typeof loose_surface.bufferList[0].geometry.attributes.normal.array.length !== 'undefined' )
			previous_normal_length = loose_surface.bufferList[0].geometry.attributes.normal.array.length;
		return;
	}
	if( loose_surface.bufferList[0].geometry.index.array.length !== previous_index_length )
	{
		if( typeof loose_surface.bufferList[0].geometry.index.array.length !== 'undefined' )
			previous_index_length = loose_surface.bufferList[0].geometry.index.array.length;
		return;
	}
	
	//you'll have trouble if there is actually a point where it becomes stable
	
	//model is stable
	
}

function placeholder_interpret_ngl()
{
	//if it's surface then you need loose_surface.bufferList[0].group.children[0].children[0].geometry
//			console.log(loose_surface);
	var ProteinGeometry = loose_surface.bufferList[0].geometry;
	
	ourcopy = new THREE.Mesh( new THREE.BufferGeometry(),
				  new THREE.MeshPhongMaterial({side: THREE.DoubleSide /* temp */ }) );
	
	ourcopy.geometry.addAttribute( 'position', 
			new THREE.BufferAttribute( ProteinGeometry.attributes.position.array, 3 ) );
	ourcopy.geometry.addAttribute( 'normal', 
			new THREE.BufferAttribute( ProteinGeometry.attributes.normal.array, 3 ) );
	ourcopy.geometry.setIndex(
			new THREE.BufferAttribute( ProteinGeometry.index.array, 1 ) );
	
	var num_NaNs =  0;
	for(var i = 0; i < ProteinGeometry.attributes.position.array.length; i++)
		if( isNaN( ProteinGeometry.attributes.position.array[i] ))
		{
			num_NaNs++; //you get this with some proteins
			
			//patch it up
			if(i >= 3)
				ProteinGeometry.attributes.position.array[i] = ProteinGeometry.attributes.position.array[i-3];
			else
				ProteinGeometry.attributes.position.array[i] = ProteinGeometry.attributes.position.array[i+3];
		}
	if(num_NaNs)console.log("NaNs: ", num_NaNs);
	
	ourcopy.geometry.computeBoundingSphere();
	console.log(ourcopy.geometry.boundingSphere);
	var center_coords = ourcopy.geometry.boundingSphere.center.toArray();
	
	for(var i = 0, il = ProteinGeometry.attributes.position.array.length; i < il; i++)
		ProteinGeometry.attributes.position.array[i] -= center_coords[i%3];
	
	var ourscale = 0.0004 * ourcopy.geometry.boundingSphere.radius;
	ourcopy.scale.set(ourscale,ourscale,ourscale);
	
	if(Protein.children.length !== 0)
		Protein.remove(Protein.children[0]); //hopefully they got the message about going fullscreen, though TODO what if their phone is a supercomputer? 
	Protein.add(ourcopy);
	
	//then need to scale it so that it is of a reasonable size
}