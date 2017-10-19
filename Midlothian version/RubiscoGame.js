var CO2s = Array(250);
var O2s = Array(250); //want way more of these

var O2s_present = false;

var rubisco_attached = 1;

var PLAY_AREA_WIDTH = 3;
var PLAY_AREA_HEIGHT = 2;
var default_mol_scale = 0.0078125;

var current_chapter = 0;

//we could have this only apply to oxygen, to make them seem more dangerous
var randomvibration_magnitude = 0.006;

function initRubiscoGame()
{	
	RubiscoModel.oscillation_amplitude = 0;
	
	var C_atom_radius = 1.4;
	var C_atom = new THREE.Mesh(new THREE.SphereGeometry( C_atom_radius * 1.24, 32, 32 ), new THREE.MeshPhongMaterial( {color: 0x000000, transparent: true } ) );
	var O_atom = new THREE.Mesh(new THREE.SphereGeometry( C_atom_radius / 0.5 * 0.4, 32, 32 ), new THREE.MeshPhongMaterial( {color: 0xff0000, transparent: true } ) );
	
	var cuberadius = C_atom_radius*2.4;
	
	var SignLoader = new THREE.TextureLoader();
	SignLoader.crossOrigin = true;
	SignLoader.load(
		"Data/Skullcrossbones.png",
		function(texture) {
			BadSign = new THREE.Mesh(new THREE.PlaneGeometry(cuberadius*1.5,cuberadius*1.5), new THREE.MeshBasicMaterial( {color: 0xffffff, transparent: true, opacity:0, map:texture} ) );
		}, function ( xhr ) {}, function ( xhr ) {console.log( 'texture loading error' );} );
	SignLoader.load(
		"Data/sugartexture.png",
		function(texture) {
			SugarCube = new THREE.Mesh(new THREE.BoxGeometry(cuberadius,cuberadius*0.75 ,cuberadius), new THREE.MeshBasicMaterial( {transparent: true, opacity:0, map:texture } ) );
		}, function ( xhr ) {}, function ( xhr ) {console.log( 'texture loading error' );} );
	
	var CO2_original = new THREE.Object3D();
	CO2_original.add( O_atom.clone() );
	CO2_original.children[0].position.x = 0.4 * C_atom_radius / 0.5 * 1.24 + C_atom_radius / 0.5 * 0.4;
	CO2_original.add( O_atom.clone() );
	CO2_original.children[1].position.x = -CO2_original.children[0].position.x;
	CO2_original.add( C_atom.clone() );
	
	CO2_original.position.y = 0.1;
	
	var O2_original = new THREE.Object3D();
	O2_original.add( O_atom.clone() );
	O2_original.children[0].position.x = 0.2 * C_atom_radius / 0.5;
	O2_original.add( O_atom.clone() );
	O2_original.children[1].position.x = -O2_original.children[0].position.x;
	
	for(var i = 0; i < CO2s.length; i++)
	{
		CO2s[i] = CO2_original.clone();
		for(var j = 0; j < CO2s[i].children.length; j++ )
		{
			CO2s[i].children[j].material = CO2_original.children[j].material.clone(); //hack to deal with threejs silliness
		}
		CO2s[i].velocity = new THREE.Vector3();
		CO2s[i].caughtness = 0;
		reset_aspects( CO2s[i], new THREE.Vector3() );
		Scene.add(CO2s[i]);

		CO2s[i].visible = false;
	}
	
	for(var i = 0; i < O2s.length; i++)
	{
		O2s[i] = O2_original.clone();
		for(var j = 0; j < O2s[i].children.length; j++ )
		{
			O2s[i].children[j].material = O2_original.children[j].material.clone(); //hack to deal with threejs silliness
		}
		O2s[i].velocity = new THREE.Vector3();
		O2s[i].caughtness = 0;
		reset_aspects( O2s[i], new THREE.Vector3() );
		Scene.add(O2s[i]);
		
		O2s[i].visible = false;
	}
	
	Level_positions = Array(3);
	Level_positions[0] = (new THREE.CylinderGeometry(     0, 0, 0.6, 0, 30, true )).vertices;
	Level_positions[1] = (new THREE.RingGeometry(	   0.35, 0.35,   50, 0, 0, 5 )).vertices;
	Level_positions[2] = (new THREE.TorusKnotGeometry( 0.35, 0.0001, 80, 1 )).vertices; //third parameter is the number of points along. 1 might need to be 3
}

function load_level(levelnumber)
{
	console.log(levelnumber)
	if( levelnumber < 0)
		return;
	if( levelnumber > Level_positions.length - 1 )
		levelnumber = Level_positions.length - 1;
	
	var max_level_positions = 0;
	for(var i = 0; i < Level_positions.length; i++)
		if( max_level_positions < Level_positions[i].length)
			max_level_positions = Level_positions[i].length;
	
//	if(levelnumber === 1)
//		levelnumber = 2;
	
	var zerovector = new THREE.Vector3();
	
	for(var i = 0; i < max_level_positions; i++)
	{
		if( i < Level_positions[levelnumber].length )
		{
//			if(Math.random() > 0.5)
//			{
//				O2s[i].position.copy(Level_positions[1][i]);
//				O2s[i].velocity.set(0,0,0);
//			}
//			else
			{
				CO2s[i].position.copy(Level_positions[levelnumber][i]);
				CO2s[i].velocity.set(0,0,0);
			}
		}
		else if(CO2s[i].velocity.equals(zerovector))
			reset_aspects( CO2s[i], new THREE.Vector3() );
	}
}

var default_rubisco_offset = new THREE.Vector3(0.004,-0.075,-0.1);
function updateRubiscoGame( Users )
{
	if(Users.length === 0)
		return;
	
	var rubiscoradius = 0.13;
	var neck_radius = rubiscoradius / 7;
	
	var RubiscoAxisP1 = new THREE.Vector3();
	var RubiscoAxisP2 = new THREE.Vector3();
	
	var controller_central_position = new THREE.Vector3(0,0,0.08);
	controller_central_position.applyQuaternion(Users[0].Controller.quaternion);
	
	RubiscoAxisP1.copy( controller_central_position );
	RubiscoAxisP2.copy( controller_central_position );
	RubiscoAxisP1.setLength( rubiscoradius );
	RubiscoAxisP2.setLength( rubiscoradius );
	RubiscoAxisP2.multiplyScalar(-1);
	
	RubiscoAxisP1.add(Users[0].Controller.position.clone());
	RubiscoAxisP2.add(Users[0].Controller.position.clone());
	controller_central_position.add(Users[0].Controller.position);
	
	indicatorsphere.position.copy(RubiscoAxisP1);
	
	var rubisco_offset = default_rubisco_offset.clone();
	rubisco_offset.applyQuaternion(Users[0].Controller.quaternion);
	
	if(rubisco_attached)
	{
		copyquat(RubiscoModel.quaternion,Users[0].Controller.quaternion);
		RubiscoModel.position.copy(controller_central_position);
		RubiscoModel.position.add(rubisco_offset);
	}
	else
	{
		RubiscoModel.position.add(new THREE.Vector3(0,0.00017,-0.00005));
		RubiscoModel.rotateOnAxis(Central_X_axis, 0.001);
	}
	
	RubiscoModel.position.add(new THREE.Vector3(RubiscoModel.oscillation_amplitude * 0.019 * Math.sin((1-RubiscoModel.oscillation_amplitude) * 30),0,0));
	RubiscoModel.oscillation_amplitude -= 0.013;
	if(RubiscoModel.oscillation_amplitude < 0)
		RubiscoModel.oscillation_amplitude = 0;
	
	var fix_radius = rubiscoradius / 3.5;
	
	if(current_chapter > 0)
		for(var i = 0,il = CO2s.length; i < il; i++)
			update_mol(CO2s[i], rubiscoradius, neck_radius, controller_central_position, RubiscoAxisP1, RubiscoAxisP2, fix_radius);
	
	if(current_chapter > 1)
		for(var i = 0, il = O2s.length; i < il; i++)
			update_mol(O2s[i], rubiscoradius, neck_radius, controller_central_position, RubiscoAxisP1,RubiscoAxisP2, fix_radius);
}

function update_mol(OurMol, rubiscoradius, neck_radius, controller_central_position, RubiscoAxisP1, RubiscoAxisP2, fix_radius)
{
	var dist_squared = OurMol.position.distanceToSquared(controller_central_position);
	
	if( dist_squared < rubiscoradius * rubiscoradius * 2 )
	{
		if(OurMol.caughtness === 0)
		{
			//attract to the top of the neck
			var attraction_vector = controller_central_position.clone();
			
			attraction_vector.sub(OurMol.position);
			attraction_vector.setLength(rubiscoradius / 128);
			OurMol.position.add( attraction_vector );
			
			dist_squared = OurMol.position.distanceToSquared(controller_central_position);
		}
		
		if( dist_squared < rubiscoradius * rubiscoradius )
		{
			var projected_on_rubisco_axis = RubiscoAxisP2.clone();
			projected_on_rubisco_axis.sub(RubiscoAxisP1); //it's now equal to the axis itself in a sense
			var posn_rel_to_RAP1 = OurMol.position.clone();
			posn_rel_to_RAP1.sub(RubiscoAxisP1);
			projected_on_rubisco_axis.multiplyScalar( posn_rel_to_RAP1.dot(projected_on_rubisco_axis) / projected_on_rubisco_axis.lengthSq() );
			projected_on_rubisco_axis.add(RubiscoAxisP1);
			
			var axis_to_point = OurMol.position.clone();
			axis_to_point.sub(projected_on_rubisco_axis);
			
			if( axis_to_point.length() < neck_radius * 1.5 )
			{
				if(axis_to_point.length() > neck_radius ) //go onto the surface of the neck if you're just outside it
				{
					OurMol.position.copy(axis_to_point);
					OurMol.position.setLength(neck_radius);
					OurMol.position.add(projected_on_rubisco_axis);
				}
				
				//fix!
				if( rubisco_attached && OurMol.position.distanceTo(controller_central_position) < fix_radius && OurMol.caughtness === 0 )
				{
					for(var j = 0; j < OurMol.children.length; j++)
						OurMol.children[j].visible = false;
					
					if(OurMol.children.length === 3) //it's CO2
					{
						OurMol.add(SugarCube.clone());
						OurMol.children[OurMol.children.length-1].material = SugarCube.material.clone();
						socket.emit( 'Carbon caught' );
						GoodSound.position.copy(OurMol.position);
						GoodSound.play();
					}
					else
					{
						OurMol.add(BadSign.clone());
						OurMol.children[OurMol.children.length-1].material = BadSign.material.clone();
						socket.emit( 'Oxygen caught' );
						BadSound.position.copy(OurMol.position);
						BadSound.play();
					}
					OurMol.children[OurMol.children.length-1].material.opacity = 1;
					
					RubiscoModel.oscillation_amplitude = 1;
					OurMol.caughtness = 0.0001;
				}
			}
			else //project onto surface of sphere
			{
				if( dist_squared < rubiscoradius * rubiscoradius )
				OurMol.position.sub(controller_central_position);
				OurMol.position.setLength(rubiscoradius);
				OurMol.position.add(controller_central_position);
			}
		}
	}
	else if(OurMol.caughtness === 0 ) advance_mol_position( OurMol );
	else advance_caughtness( OurMol, controller_central_position );
	
	if(OurMol.caughtness > 0)
		advance_mol_position( OurMol );
}

function advance_caughtness( OurMol, rubiscoposition )
{
	OurMol.caughtness += 0.0017;
	
//	OurMol.scale.set( 
//			default_mol_scale * ( 1 + OurMol.caughtness * 5), 
//			default_mol_scale * ( 1 + OurMol.caughtness * 5), 
//			default_mol_scale * ( 1 + OurMol.caughtness * 5) );
	var start_fading_time = 0.5;
	if(OurMol.caughtness > start_fading_time)
		for(var i = 0; i < OurMol.children.length; i++ )
			OurMol.children[i].material.opacity = 1 - (OurMol.caughtness-start_fading_time)*2;
	
	if(OurMol.children.length === 4) //it's CO2 because we include sugarcube
	{
		var start_spinning_time = 0.3;
		if(OurMol.caughtness > start_spinning_time)
		OurMol.rotation.y += (OurMol.caughtness - start_spinning_time) / 4;
	}
	else
		OurMol.lookAt(Camera.position);
	
	if( OurMol.caughtness >= 1 )
		reset_aspects( OurMol, rubiscoposition );
}

function advance_mol_position( OurMol )
{
	//might resetting the velocity lead to molecules gathering on the edges?
	//TODO actually a cylinder
	OurMol.position.add( OurMol.velocity );
	if( OurMol.position.x < -PLAY_AREA_WIDTH / 2 )
		{OurMol.position.x += PLAY_AREA_WIDTH; reset_velocity(OurMol);}
	if( PLAY_AREA_WIDTH / 2 <= OurMol.position.x )
		{OurMol.position.x -= PLAY_AREA_WIDTH; reset_velocity(OurMol);}
	
	if( OurMol.position.z < -PLAY_AREA_WIDTH / 2 )
		{OurMol.position.z += PLAY_AREA_WIDTH; reset_velocity(OurMol);}
	if( PLAY_AREA_WIDTH / 2 <= OurMol.position.z )
		{OurMol.position.z -= PLAY_AREA_WIDTH; reset_velocity(OurMol);}
	
	if( OurMol.position.y < -PLAY_AREA_HEIGHT / 2 )
		{OurMol.position.y += PLAY_AREA_HEIGHT; reset_velocity(OurMol);}
	if( PLAY_AREA_HEIGHT / 2 <= OurMol.position.y )
		{OurMol.position.y -= PLAY_AREA_HEIGHT; reset_velocity(OurMol);}
	
	//could have "if stromata mode, put it behind the stromata until it's ready to be shot out"
	
	//random vibration
//	OurMol.position.x += (Math.random() - 0.5) * randomvibration_magnitude;
//	OurMol.position.y += (Math.random() - 0.5) * randomvibration_magnitude;
//	OurMol.position.z += (Math.random() - 0.5) * randomvibration_magnitude;
}

function reset_aspects( OurMol, rubiscoposition )
{
	var position_to_be_avoided;
	var radius_to_avoid_by = 0.3;
	
	position_to_be_avoided = rubiscoposition;	
	
	do {
		OurMol.position.x = -PLAY_AREA_WIDTH / 2 + Math.random() * PLAY_AREA_WIDTH;
		OurMol.position.z = -PLAY_AREA_WIDTH / 2 + Math.random() * PLAY_AREA_WIDTH;

		OurMol.position.y = -PLAY_AREA_HEIGHT / 2 + Math.random() * PLAY_AREA_HEIGHT;
	} while( OurMol.position.distanceTo( position_to_be_avoided ) < radius_to_avoid_by ); //can't have it appear inside the thing
	
	for(var j = 0; j < OurMol.children.length; j++)
		OurMol.children[j].visible = true;

	reset_velocity(OurMol);
	
	if(OurMol.caughtness !== 0)
		OurMol.remove(OurMol.children[OurMol.children.length - 1]);
	
	OurMol.caughtness = 0;
	OurMol.scale.set(default_mol_scale,default_mol_scale,default_mol_scale );
	for(var i = 0; i < OurMol.children.length; i++ )
		OurMol.children[i].material.opacity = 1;
	
	//OKAY something's broken and it doesn't LOOK like it's this stuff, which was working previously.
}

function reset_velocity(OurMol)
{
	var maxvelocity = 0.002; //note that this is velocity in a direction
	OurMol.velocity.set(maxvelocity * (Math.random() - 0.5),maxvelocity * (Math.random() - 0.5),maxvelocity * (Math.random() - 0.5) );
//	if( OurMol.velocity.length() < randomvibration_magnitude ) //clearly faster than vibration
//	if( Math.random() < 0.5 )
//		OurMol.velocity.negate(); //??
}

//have a 3D torus woo :)