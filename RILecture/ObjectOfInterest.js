var LoadingSign;
var FullScreenSign;

function init_OurObject()
{
	OurObject.position.copy(PointOfFocus);
	
	Scene.add(OurObject);
}

function create_and_center_and_orient_text( ourstring )
{
	var signsize = 0.1;
	
	OurSign = new THREE.Mesh(
		new THREE.TextGeometry(ourstring,{size: signsize, height: signsize / 10, font: gentilis}),
		new THREE.MeshPhongMaterial( {
			color: 0x156289,
			emissive: 0x072534,
			shading: THREE.FlatShading
		}) );
	
	var TextCenter = new THREE.Vector3();
	for ( var i = 0, l = OurSign.geometry.vertices.length; i < l; i ++ ){
		TextCenter.add( OurSign.geometry.vertices[ i ] );
	}
	TextCenter.multiplyScalar( 1 / OurSign.geometry.vertices.length );
	for ( var i = 0, l = OurSign.geometry.vertices.length; i < l; i ++ ){
		OurSign.geometry.vertices[ i ].sub(TextCenter)
	}
	
	OurSign.position.copy(PointOfFocus);
	OurSign.lookAt(Camera.position); //it *begins* by looking at them, so they can read it. Except for how devicecontrols resets it...
	OurSign.position.set(0,0,0);
	
	return OurSign;
}

function update_ourobject_position()
{
	OurObject.position.copy(PointOfFocus);
}

function update_signs()
{
	if( typeof LoadingSign !== 'undefined')
	{
		var relCameraPosition = Camera.position.clone();
		OurObject.worldToLocal(relCameraPosition);
		LoadingSign.lookAt(relCameraPosition); //maybe better for the mental model to make it the same as the protein?
	}
	
	if( typeof FullScreenSign !== 'undefined')
	{
		var relCameraPosition = Camera.position.clone();
		OurObject.worldToLocal(relCameraPosition);
		FullScreenSign.lookAt(relCameraPosition);		
	}
}