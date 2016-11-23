function Loadpdb(linkstring, Models)
{
	if(linkstring.length === 4)
	{
		var OurPDBLoader = new THREE.PDBLoader();
		
		linkstring = "http://files.rcsb.org/download/" + linkstring + ".pdb"
		
		OurPDBLoader.load(linkstring,
			function ( geometryAtoms, geometryBonds, json ) {
				Models.push( Create_first_model( geometryAtoms ) );
				
				Collisionbox_and_sceneaddition( Models[Models.length - 1] );
			},
			function ( xhr ) {}, //progression function
			function ( xhr ) { console.error( "couldn't load PDB" ); }
		);
	}
}

function Collisionbox_and_sceneaddition(Model)
{
	Scene.add( Model);
	
	Model.children[0].BoundingBoxAppearance = new THREE.BoxHelper(Model.children[0]);
	if(debugging)
		Model.children[0].BoundingBoxAppearance.visible = true;
	else
		Model.children[0].BoundingBoxAppearance.visible = false;
	
	Scene.add( Model.children[0].BoundingBoxAppearance );
}

function Loadfont_initially(linkstring,ThisIndex,OurLoadedThings, PreInitChecklist)
{
	var OurFontLoader = new THREE.FontLoader();
	OurFontLoader.load(  linkstring, 
		function ( reponse ) {
			gentilis = reponse;
			PreInitChecklist.Downloads[ThisIndex] = 1;
			AttemptFinalInit(OurLoadedThings,PreInitChecklist);
		},
		function ( xhr ) {}, //progression function
		function ( xhr ) { console.error( "couldn't load font" ); }
	);
}

//separated these out so that "ThisIndex" becomes call-by-parameter
function Loadpdb_initially(linkstring,ThisIndex,OurLoadedThings, PreInitChecklist)
{
	var OurPDBLoader = new THREE.PDBLoader(); //or are you supposed to create these on the fly?
	
	OurPDBLoader.load(linkstring,
		function ( geometryAtoms, geometryBonds, json ) {
			OurLoadedThings[ThisIndex] = Create_first_model( geometryAtoms );
			PreInitChecklist.Downloads[ThisIndex] = 1;
			AttemptFinalInit(OurLoadedThings,PreInitChecklist);
		},
		function ( xhr ) {}, //progression function
		function ( xhr ) { console.error( "couldn't load PDB" ); }
	);
}
function Loadobj_initially(linkstring,ThisIndex,OurLoadedThings, PreInitChecklist)
{
	var OurOBJLoader = new THREE.OBJLoader();
	
	OurOBJLoader.load(linkstring,
		function ( object ) {
			OurLoadedThings[ThisIndex] = object;
			PreInitChecklist.Downloads[ThisIndex] = 1;
			AttemptFinalInit(OurLoadedThings,PreInitChecklist);
		},
		function ( xhr ) {}, //progression function
		function ( xhr ) { console.error( "couldn't load OBJ" ); }
	);
}

function LoadOBJ(linkstring)
{
	var OurOBJLoader = new THREE.OBJLoader();
	
	OurOBJLoader.load(linkstring,
		function ( object ) {
			OurLoadedThings[ThisIndex] = object;
			PreInitChecklist.Downloads[ThisIndex] = 1;
			AttemptFinalInit(OurLoadedThings,PreInitChecklist);
		},
		function ( xhr ) {}, //progression function
		function ( xhr ) { console.error( "couldn't load OBJ" ); }
	);
}

function Loadpic_initially(linkstring,ThisIndex,OurLoadedThings, PreInitChecklist)
{
	var OurPicLoader = new THREE.TextureLoader();
	OurPicLoader.crossOrigin = '';
	OurPicLoader.load(linkstring,
		function ( texture ) {		
			OurLoadedThings[ThisIndex] = new THREE.Mesh(
					new THREE.CubeGeometry(0.83, 0.83, 0),
					new THREE.MeshBasicMaterial({map: texture}) );
			
			PreInitChecklist.Downloads[ThisIndex] = 1;
			AttemptFinalInit(OurLoadedThings,PreInitChecklist);
		},
		function ( xhr ) {}, //progression function
		function ( xhr ) { console.error( "couldn't load pic" ); }
	);
}