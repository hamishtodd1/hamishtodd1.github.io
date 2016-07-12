/* "Playing field width/height" appears in here, and we want to get rid of that.
 * It just means the area that the camera can see on the plane z = 0.
 * Actually we certainly don't want dependence on window size. State a size for the window. Give a certain number of pixels.
 * Orthographic projection may simplify you walking around.
 * 
 * 
 * Rift Valley Fever (big one) - 12
 * may want to aim to have the t=1 CK arrangment look like the QS version
 * 
 * QS
 * How about layering konevtsova's spots on them? 
 * Would you need the density maps? Those are nice. Could fade to a density map and put "x-ray" underneath. Hopefully you saved those nice maps on work computer :(
 * Could get the viruses into chimera and color them yourself trying to suggest the quasilattice shapes
 * Or you could just say in the video "the proteins on these viruses sit at the corners of the shapes, and connected corners are connected proteins"
 * 
 * So we have bocavirus on all of them? Four each is nice.
 * 
 * TODO they highlight somehow when mouse is over them
 * 
 * When do they pop up? When you get them? When you've been playing a while?
 */

var texture_loader = new THREE.TextureLoader(); //only one?
var clickable_viruses = Array(16);

var CKHider;
var VisibleSlide;
var IrregButtonOpen;
var IrregButtonClosed;

var pictures_loaded = 0;

var virus_textures;
var random_textures;
var slide_textures;

function load_AV_stuff()
{
	//TODO put the numbers in here
	var virus_texture_urls = Array();
	var random_texture_urls = Array();
	var slide_texture_urls = Array();
	
	//-----clickable viruses
	virus_texture_urls[0] = "http://hamishtodd1.github.io/Data/1 - BV.jpg"; //to be turned into golfball.jpg or whatever
	virus_texture_urls[1] = "http://hamishtodd1.github.io/Data/1 - BV.jpg";
	virus_texture_urls[2] = "http://hamishtodd1.github.io/Data/9 - N4.gif";
	virus_texture_urls[3] = "http://hamishtodd1.github.io/Data/13 - RV.png";
	
	virus_texture_urls[4] = "http://hamishtodd1.github.io/Data/3 - PV.png";
	virus_texture_urls[5] = "http://hamishtodd1.github.io/Data/4 - SFV.png";
	virus_texture_urls[6] = "http://hamishtodd1.github.io/Data/7 - CV.png";
	virus_texture_urls[7] = "http://hamishtodd1.github.io/Data/12 - RVFV.png";
	
	virus_texture_urls[ 8] = "http://hamishtodd1.github.io/Data/Bocavirus file.png";
	virus_texture_urls[ 9] = "http://hamishtodd1.github.io/Data/Bluetongue file.png";
	virus_texture_urls[10] = "http://hamishtodd1.github.io/Data/Zika file.png";
	virus_texture_urls[11] = "http://hamishtodd1.github.io/Data/HPV file.png";
	
	virus_texture_urls[12] = "http://hamishtodd1.github.io/Data/T4 file.png";
	virus_texture_urls[13] = "http://hamishtodd1.github.io/Data/Phi29 file.png";
	virus_texture_urls[14] = "http://hamishtodd1.github.io/Data/HIV file.png";
	virus_texture_urls[15] = "http://hamishtodd1.github.io/Data/Herpes file.png";
	
	//the other things and their widths
	random_texture_urls[0] = "http://hamishtodd1.github.io/Data/CKhider.png";
	random_texture_urls[1] = "http://hamishtodd1.github.io/Data/open.png";
	random_texture_urls[2] = "http://hamishtodd1.github.io/Data/close.png";
	
	//slides
	slide_texture_urls[0] = "http://hamishtodd1.github.io/Data/warning.png"; //playing field wide
	
	virus_textures = Array(virus_texture_urls.length);
	random_textures = Array(random_texture_urls.length);
	slide_textures = Array(slide_texture_urls.length);
	
	for(var i = 0; i < virus_texture_urls.length; i++ )
		loadpic(virus_texture_urls[i], 0, i);
	for(var i = 0; i < random_texture_urls.length; i++ )
		loadpic(random_texture_urls[i], 1, i);

	for(var i = 0; i < slide_texture_urls.length; i++ )
	{
		var last_three_letters = slide_texture_urls[i].substr( slide_texture_urls[i].length - 3);
		
		//might be quite nice to have failsafe pictures in case they can't show videos
		if( last_three_letters === "png" || last_three_letters === "gif" || last_three_letters === "jpg" )
			loadpic(slide_texture_urls[i], 2, i);
		else console.log( "unrecognized format", last_three_letters);
	}
}

function loadpic(url, type, index) {
	//these lines are for if you have no internet
//	clickable_viruses[i].material.color = 0x000000;
//	pictures_loaded++;
//	if(pictures_loaded === clickable_viruses.length ) {
//		PICTURES_LOADED = 1;
//		attempt_launch();
//	}
	
	texture_loader.load(
			url,
		function(texture) {
			if(type === 0)
				virus_textures[index] = texture;
			if(type === 1)
				random_textures[index] = texture;
			if(type === 2)
				slide_textures[index] = texture;
			
			pictures_loaded++;

			if(pictures_loaded === virus_textures.length + random_textures.length + slide_textures.length ) {
				bind_pictures();
			}
		},
		function ( xhr ) {}, function ( xhr ) {
			console.log( 'texture loading error, switch to using the other code in this function' );
		}
	);
}

function bind_pictures()
{
	//------Clickable viruses
	//TODO later add their names as meshes to them as children
	var picturepanel_width = playing_field_dimension;
	var y_of_picturepanel_bottom = -0.5 * playing_field_dimension;
	
	for(var i = 0; i < clickable_viruses.length; i++){
		clickable_viruses[i] = new THREE.Mesh(
			new THREE.CubeGeometry(picturepanel_width / 4, picturepanel_width / 4, 0),
			new THREE.MeshBasicMaterial( { transparent:true
//					, depthTest: false, depthWrite: false, transparent: true //trying to put them on top stuff
				} ) );
		
		//clickable_viruses[i].renderOrder = 0;
	}
	
	for(var i = 1; i < clickable_viruses.length; i++){
		clickable_viruses[i].enabled = 0; //switch to 1 when clicked, switch all to 0 when player changes anything
		clickable_viruses[i].TimeThroughMovement = 100; //start at a place where you're settled
		
		clickable_viruses[i].default_position = new THREE.Vector3(0,0,0.01);
		clickable_viruses[ i ].default_position.x = -3/8 * picturepanel_width;
		clickable_viruses[ i ].default_position.x += (i%4) * picturepanel_width / 4;
		clickable_viruses[ i ].default_position.y = y_of_picturepanel_bottom + 0.5 * picturepanel_width / 4; //they are in the frame, right?
		if( 11 < i && i < 16 ) //needs to be in front of the surface
			clickable_viruses[ i ].default_position.z *= -1;
		
		clickable_viruses[i].enabled_position = clickable_viruses[i].default_position.clone();
		clickable_viruses[i].enabled_position.y += 0.4; //maybe too much
		clickable_viruses[i].position.copy(clickable_viruses[i].default_position);
	}
	
	for(var i = 0; i < clickable_viruses.length; i++)
	{
		clickable_viruses[i].material.map = virus_textures[i];
	}
	
	//-----other
	CKHider = new THREE.Mesh( new THREE.CubeGeometry(6.93513143351, 6.93513143351, 0),
		new THREE.MeshBasicMaterial( { transparent:true, map: random_textures[0] } ) );
	
	IrregButtonOpen = new THREE.Mesh( new THREE.CubeGeometry(0.6, 0.6, 0),
		new THREE.MeshBasicMaterial( { transparent:true, map: random_textures[1] } ) );
	IrregButtonClosed = new THREE.Mesh( new THREE.CubeGeometry(0.6, 0.6, 0),
		new THREE.MeshBasicMaterial( { transparent:true, map: random_textures[2] } ) );
	
	IrregButtonOpen.position.set(1.9,-0.7,0.0001);
	IrregButtonOpen.capsidopen = 0;
	IrregButtonClosed.position.set(1.9,-0.7,0.0001);
	IrregButtonClosed.capsidopen = 0;
	
	//first slide
	VisibleSlide = new THREE.Mesh( new THREE.CubeGeometry(playing_field_dimension, playing_field_dimension, 0),
		new THREE.MeshBasicMaterial( { transparent:true, map: slide_textures[0] } ) );
		
	//----Ready
	PICTURES_LOADED = 1;
	attempt_launch();
}

function Update_pictures_in_scene(){
	for(var i = 0; i < clickable_viruses.length; i++){
		if( scene.getObjectById(clickable_viruses[i].id) !== undefined )
			Update_virus_picture(i);
	}
}

function Disable_virus_pictures(){
	for(var i = 1; i < 16; i++){
		if(clickable_viruses[i].enabled === 1){
			clickable_viruses[i].enabled = 0;
			clickable_viruses[i].TimeThroughMovement = 0;
		}
	}
}

function Update_virus_picture(index){
	scene.add(VisibleSlide);
	var MouseRelative = MousePosition.clone();
	MouseRelative.sub(clickable_viruses[index].position);
	/*
	 * Bluetongue is 8, boca is 2, zika is 9, hpv is 7.
	 */
	
	if( isMouseDown && !isMouseDown_previously ){
		var ClickWasInPicture = 0;
		if( Math.abs(MouseRelative.x) < clickable_viruses[index].geometry.vertices[0].x &&
		    Math.abs(MouseRelative.y) < clickable_viruses[index].geometry.vertices[0].y )
			ClickWasInPicture = 1;
		
		if(clickable_viruses[index].enabled == 0){
			if( ClickWasInPicture ){
				Disable_virus_pictures();
				
				clickable_viruses[index].enabled = 1;
				clickable_viruses[index].TimeThroughMovement = 0;
				
				if( 12 <= index && index < 16){
					for(var i = 0; i < flatnet_vertices.array.length; i++)
						flatnet_vertices.array[i] = setvirus_flatnet_vertices[index-12][i];
					correct_minimum_angles(flatnet_vertices.array);
				}
				else if( 4 <= index && index < 8){
					if( index === 4){ LatticeScale=0.577; LatticeAngle = 0.5236; }
					if( index === 5){ LatticeScale = 0.5; LatticeAngle = 0; }
					if( index === 6){ LatticeScale=0.3779; LatticeAngle =0.714; }
					if( index === 7){ LatticeScale = 1/3; LatticeAngle = 0.5236; }
				}
				else if(8 <= index && index < 12){
					if(index === 8){cutout_vector0.set(-0.5,1.2139220723547204,0); 				cutout_vector1.set(1,0.85065080835204,0); }
					if(index === 9){cutout_vector0.set( 0.309016994374947,1.801707324647194,0); cutout_vector1.set(1.809016994374948,0.2628655560595675,0); }
					if(index ===10){cutout_vector0.set(1.809016994374948, 1.4384360606445132,0);cutout_vector1.set(1.9270509831248428, 1.2759762125280603,0); }
					if(index ===11){cutout_vector0.set(0,3.47930636894770,0); 					cutout_vector1.set(3.309016994374948, 1.075164796641833,0); }
					
					cutout_vector0_player.copy(cutout_vector0);cutout_vector1_player.copy(cutout_vector1);
				}
			}
		}
	}
	else if( clickable_viruses[index].enabled === 0 && !isMouseDown && //pics can also be turned on by us being in the right place
	   ((stable_point_of_meshes_currently_in_scene === 2 && index === 8) ||
		(stable_point_of_meshes_currently_in_scene === 8 && index === 9) ||
		(stable_point_of_meshes_currently_in_scene === 9 && index === 10)||
		(stable_point_of_meshes_currently_in_scene === 7 && index === 11)) )
	{
		Disable_pictures();
		clickable_viruses[index].enabled = 1;
		clickable_viruses[index].TimeThroughMovement = 0;
	}
	//TODO more of those
	
	clickable_viruses[index].TimeThroughMovement += delta_t;	
	var MovementTime = 0.65; //tweakable
	if(clickable_viruses[index].enabled){
		clickable_viruses[index].position.copy( move_smooth_vectors(
				clickable_viruses[index].default_position,
				clickable_viruses[index].enabled_position,
				MovementTime,
				clickable_viruses[index].TimeThroughMovement) );
	}
	else{
		clickable_viruses[index].position.copy( move_smooth_vectors(
				clickable_viruses[index].enabled_position,
				clickable_viruses[index].default_position,
				MovementTime,
				clickable_viruses[index].TimeThroughMovement) );
	}
}