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

function Create_first_model( geometryAtoms ) {
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
	
	ReturnedModel = new THREE.Object3D();
	//note that "children.push" instead of "add" will make it a child, but the child won't have a parent!
	ReturnedModel.add( Create_sphere_representation_mesh( geometryAtoms ) );
	ReturnedModel.add( Create_trace_representation_mesh( geometryAtoms ) );
//	ModelZero.add( Create_ribbon_representation_mesh( geometryAtoms ) );
	
	for(var i = 0; i < 7; i++) //hack because units
		ReturnedModel.scale.multiplyScalar(0.5);
	
	return ReturnedModel;
}

function IsBackBone(atomID){
	if( atomID === "ca"
	 || atomID === "n" || atomID === "c"
			)
		return true;
	else
		return false;
}

