/* Name of virus, then in brackets the living thing it affects
 * 
 * Candidates for pictures: 
 * irreg
 *   http://www.ncbi.nlm.nih.gov/pmc/articles/PMC110407/pdf/jv006024.pdf
 *   the one in the video is on your "old" computer
 *   https://news.uns.purdue.edu/images/+2005/Rossmann-phage.jpg - phi29
 *   because the lovely T4 is quite short, really you'd like a long one. AMV http://www.dpvweb.net/dpvfigs/d046f02.jpg
 *   
 * CK
 * https://www.rbvi.ucsf.edu/Research/projects/virus/capsids/viruses.html
 * Do the circle thing, and you won't have to do the points thing. Just replace points with line segments
 * 
 * QS  
 * How about layering konevtsova's spots on them? 
 * Would you need the density maps? Those are nice. Could fade to a density map and put "x-ray" underneath. Hopefully you saved those nice maps on work computer :(
 * Could get the viruses into chimera and color them yourself trying to suggest the quasilattice shapes
 * Or you could just say in the video "the proteins on these viruses sit at the corners of the shapes, and connected corners are connected proteins"
 * 
 * So we have bocavirus on all of them? Four each is nice.
 * 
 * 
 * 
 * When do they pop up? When you get them? When you've been playing a while?
 */

var texture_loader = new THREE.TextureLoader();
var picture_objects = Array(12);

var pictures_loaded = 0;

function loadpics(){
	for(var i = 0; i < picture_objects.length; i++){
		var ourwidth, ourheight;
		if(i === 0){
			ourwidth = playing_field_width;
			ourheight = playing_field_width;
		} else if( i < 8){
			ourwidth = 3;
			ourheight = 3;
		} else if( i < 12){
			ourwidth = playing_field_width / 4;
			ourheight = playing_field_width / 4;
		}
		
		picture_objects[i] = new THREE.Mesh(
				new THREE.CubeGeometry(ourwidth, ourheight, 0),
				new THREE.MeshBasicMaterial({ transparent:true}) );
	}
	
	picture_objects[0].name = "http://hamishtodd1.github.io/Data/warning.png";
	
	picture_objects[1].name = "http://hamishtodd1.github.io/Data/1 - BV.jpg";
	picture_objects[2].name = "http://hamishtodd1.github.io/Data/3 - PV.png";
	picture_objects[3].name = "http://hamishtodd1.github.io/Data/4 - SFV.png";
	picture_objects[4].name = "http://hamishtodd1.github.io/Data/7 - CV.png";
	picture_objects[5].name = "http://hamishtodd1.github.io/Data/9 - N4.gif";
	picture_objects[6].name = "http://hamishtodd1.github.io/Data/12 - RVFV.png";
	picture_objects[7].name = "http://hamishtodd1.github.io/Data/13 - RV.png";
	
	picture_objects[ 8].name = "http://hamishtodd1.github.io/Data/9 - N4.gif";
	picture_objects[ 9].name = "http://hamishtodd1.github.io/Data/4 - SFV.png";
	picture_objects[10].name = "http://hamishtodd1.github.io/Data/12 - RVFV.png";
	picture_objects[11].name = "http://hamishtodd1.github.io/Data/13 - RV.png";
	
	for(var i = 1; i < 12; i++){
		picture_objects[i].enabled = 0; //switch to 1 when clicked, switch all to 0 when player changes anything
		picture_objects[i].TimeThroughMovement = 100;
		
		picture_objects[i].default_position = new THREE.Vector3(0,0,0.01);
		picture_objects[i].enabled_position = picture_objects[i].default_position.clone();
		picture_objects[i].enabled_position.y += 0.4; //maybe too much
		picture_objects[i].position.copy(picture_objects[i].default_position);
	}
	
	for(var i = 0; i < picture_objects.length; i++)
		loadpic(i);
}

function loadpic(i) {
	texture_loader.load(
		picture_objects[i].name,
		function(texture) {
			picture_objects[i].material.map = texture;
			
			pictures_loaded++;

			if(pictures_loaded === picture_objects.length ) {
				PICTURES_LOADED = 1;
				attempt_launch();
			}
		},
		function ( xhr ) {}, function ( xhr ) {console.log( 'texture loading error' );}
	);
}

function move_smooth(startposition,finalposition,time_final, time_current){
	if(time_current >= time_final)
		return finalposition;
	else if(time_current < 0)
		return startposition;
	
	var whole_movement_vector = new THREE.Vector3();
	whole_movement_vector.subVectors(finalposition,startposition);
	var final_dist = whole_movement_vector.length();
	var startaccel = 6 * final_dist / ( time_final * time_final );
	var current_dist = startaccel * time_current * time_current * ( 1 / 2 - time_current / 3 / time_final );
	var current_position = whole_movement_vector.clone();
	current_position.setLength(current_dist);
	current_position.add(startposition);
	return current_position;
}

function Update_picture(index){
	var MouseRelative = MousePosition.clone();
	MouseRelative.sub(picture_objects[index].position);
	
	if(Math.abs(MouseRelative.x) < picture_objects[index].geometry.vertices[0].x &&
	   Math.abs(MouseRelative.y) < picture_objects[index].geometry.vertices[0].y &&
	   isMouseDown && !isMouseDown_previously && picture_objects[index].enabled == false ){
		picture_objects[index].enabled = true;
		picture_objects[index].TimeThroughMovement = 0;
		
		//plus something else!
	}
	
	if(!(Math.abs(MouseRelative.x) < picture_objects[index].geometry.vertices[0].x &&
		 Math.abs(MouseRelative.y) < picture_objects[index].geometry.vertices[0].y ) &&
		 isMouseDown && !isMouseDown_previously && picture_objects[index].enabled == true ){
		picture_objects[index].enabled = false;
		picture_objects[index].TimeThroughMovement = 0;
	}
	
	picture_objects[index].TimeThroughMovement += delta_t;	
	var MovementTime = 0.65;	
	if(picture_objects[index].enabled){
		picture_objects[index].position.copy( move_smooth(
				picture_objects[index].default_position,
				picture_objects[index].enabled_position,
				MovementTime,
				picture_objects[index].TimeThroughMovement) );
	}
	else{
		picture_objects[index].position.copy( move_smooth(
				picture_objects[index].enabled_position,
				picture_objects[index].default_position,
				MovementTime,
				picture_objects[index].TimeThroughMovement) );
	}
}