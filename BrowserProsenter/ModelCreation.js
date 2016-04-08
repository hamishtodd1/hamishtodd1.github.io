//let's make it so that this just creates a model, most protein-specific ideas are contained
//you will need to make them flexible but that is fine
/*
 * Parsing the input string, acceptable formats:
 * -serialnumber.pdb
 * -serialnumber
 * -whole weblink ending with ".pdb"
 * -whole weblink ending with ".obj"
 * -name of protein. Get a table with conversion to serial number
 */
function Load_model() {
	
	//Trp-Cage Miniprotein Construct TC5b, 20 residues: http://files.rcsb.org/download/1L2Y.pdb
	var OurPDBLoader = new THREE.PDBLoader();	
	OurPDBLoader.load('http://files.rcsb.org/download/1RLC.pdb',
		function( geometryAtoms, geometryBonds, json ){
			Set_up_first_model(geometryAtoms);
			Render();
		},
		// Function called when download progresses
		function ( xhr ) {},
		// Function called when download errors
		function ( xhr ) {
			console.error( "didn't load PDB" );
		}
	);
}

function Set_up_first_model( geometryAtoms ) {
	var AveragePosition = new THREE.Vector3();
	var Num_backbone_atoms = 0;
	for(var i = 0; i < geometryAtoms.vertices.length; i++){
		if(IsBackBone(geometryAtoms.atomIDs[i] ) ){
			AveragePosition.add(geometryAtoms.vertices[i]);
			Num_backbone_atoms++;
		}
	}
	AveragePosition.multiplyScalar(1/Num_backbone_atoms);
	for(var i = 0; i < geometryAtoms.vertices.length; i++){
		geometryAtoms.vertices[i].sub(AveragePosition);
	}
	
	ModelZero = new THREE.Object3D();
	//note that "children.push" instead of "add" will make it a child, but the child won't have a parent!
//	ModelZero.add( Create_sphere_representation_mesh( geometryAtoms ) );
	ModelZero.add( Create_trace_representation_mesh( geometryAtoms ) );
//	ModelZero.add( Create_ribbon_representation_mesh( geometryAtoms ) );
	
	Scene.add(ModelZero);
}

function IsBackBone(atomID){
	if(atomID === "ca"
//		|| atomID === "n" || atomID === "c"
			)
		return true;
	else
		return false;
}

