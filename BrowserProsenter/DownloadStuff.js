function Loadpdb(linkstring, Models)
{
	if(linkstring.length === 4)
	{
		var OurPDBLoader = new THREE.PDBLoader();
		
		linkstring = "http://files.rcsb.org/download/" + linkstring + ".pdb"
		
		OurPDBLoader.load(linkstring,
			function ( geometryAtoms, geometryBonds, json ) {
				Models.push( Create_first_model( geometryAtoms ) );
				
				var thisModelIndex = Models.length - 1;
				
				InputObject.ModelPositions.push( Models[thisModelIndex].position.clone() );
				InputObject.ModelQuaternions.push( Models[thisModelIndex].quaternion.clone() );
				
				InputObject.ModelPositions[thisModelIndex].z = -0.3;
				Models[thisModelIndex].position.z = -0.3;
				var initial_model_spacing = 0.4;
				Models[thisModelIndex].position.x = thisModelIndex * initial_model_spacing;
				
				console.log(Models[thisModelIndex].children[0].geometry.merge);
				
				Scene.add( Models[thisModelIndex]);
				
				Make_collisionbox( Models[thisModelIndex] );
			},
			function ( xhr ) {}, //progression function
			function ( xhr ) { console.error( "couldn't load PDB" ); }
		);
	}
}

function Make_collisionbox(Model)
{
	Model.children[0].BoundingBoxAppearance = new THREE.BoxHelper(Model.children[0]);
	if(debugging)
		Model.children[0].BoundingBoxAppearance.visible = true;
	else
		Model.children[0].BoundingBoxAppearance.visible = false;
	
	Scene.add( Model.children[0].BoundingBoxAppearance );
}