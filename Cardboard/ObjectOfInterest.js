var LoadingSign;

function init_OurObject()
{
	OurObject.position.copy(PointOfFocus);
	
	OurObject.velocity = new THREE.Vector3();
	OurObject.acceleration = new THREE.Vector3();
	
	//loading sign stuff
	LoadingSign = new THREE.Mesh(
		new THREE.TextGeometry("Loading...",{size: 5 * 0.02, height: 0.01, font: gentilis}),
		new THREE.MeshPhongMaterial( {
			color: 0x156289,
			emissive: 0x072534,
			shading: THREE.FlatShading
		}) );
	
	var TextCenter = new THREE.Vector3();
	for ( var i = 0, l = LoadingSign.geometry.vertices.length; i < l; i ++ ){
		TextCenter.add( LoadingSign.geometry.vertices[ i ] );
	}
	TextCenter.multiplyScalar( 1 / LoadingSign.geometry.vertices.length );
	for ( var i = 0, l = LoadingSign.geometry.vertices.length; i < l; i ++ ){
		LoadingSign.geometry.vertices[ i ].sub(TextCenter)
	}
	
	LoadingSign.throb_parameter = 0;
	
	LoadingSign.position.copy(PointOfFocus);
	LoadingSign.lookAt(Camera.position); //it *begins* by looking at them, so they can read it
	LoadingSign.position.set(0,0,0);
	
	OurObject.add(LoadingSign);
	
	//what if the protein comes before the loading sign? Pretty unlikely...
}

function update_ourobject()
{
	if( typeof LoadingSign === 'undefined') //kinda hacky
		return;
	
	var displacementFromDest = PointOfFocus.clone();
	displacementFromDest.sub(OurObject.position);
	
	OurObject.acceleration.copy(displacementFromDest);
	if(OurObject.acceleration.length > 0.00007) //if it's less then "we're there"? What does it mean to collide with the thing you're attracted to?
		OurObject.acceleration.setLength(0.00007);
	
	var opposingforce = OurObject.velocity.clone();
	opposingforce.multiplyScalar(0.005);
	OurObject.acceleration.sub(opposingforce);
	
	OurObject.velocity.add(OurObject.acceleration);
	
//	if( OurObject.velocity.length() > displacementFromDest.length() )
//		OurObject.position.copy(PointOfFocus);
//	else
		OurObject.position.add(OurObject.velocity);
	
	//there's a sphere, centered on you
	//we will change the position of the protein based on where you are looking
	//it will "catch up", maybe bounce back and forth a bit. Destination is a set distance from you, on a sphere, but it can go through the sphere, allowing you to fly through.
}

function update_loadingsign()
{
	if( typeof LoadingSign === 'undefined')
		return;
	
	LoadingSign.throb_parameter += 0.05;
	while( LoadingSign.throb_parameter > TAU )
		LoadingSign.throb_parameter -= TAU;
	
	var OurScale = ( 1 + 0.07 * Math.sin(LoadingSign.throb_parameter) );
//	LoadingSign.scale.set(OurScale, OurScale, OurScale);
	
//	LoadingSign.lookAt(Camera.position); //could do this, but you don't intend to do that with the protein, so it may be bad for the mental model
	
	//maybe change the number of dots after the string and glow a bit?
}