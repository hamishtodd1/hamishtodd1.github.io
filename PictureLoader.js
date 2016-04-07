var texture_loader = new THREE.TextureLoader();
var picture_properties = Array(8);

picture_properties[0] = {}; picture_properties[0].name = "http://hamishtodd1.github.io/Data/1 - BV.jpg";
picture_properties[1] = {}; picture_properties[1].name = "http://hamishtodd1.github.io/Data/3 - PV.png";
picture_properties[2] = {}; picture_properties[2].name = "http://hamishtodd1.github.io/Data/4 - SFV.png";
picture_properties[3] = {};	picture_properties[3].name = "http://hamishtodd1.github.io/Data/7 - CV.png";
picture_properties[4] = {}; picture_properties[4].name = "http://hamishtodd1.github.io/Data/9 - N4.gif";
picture_properties[5] = {};	picture_properties[5].name = "http://hamishtodd1.github.io/Data/12 - RVFV.png";
picture_properties[6] = {}; picture_properties[6].name = "http://hamishtodd1.github.io/Data/13 - RV.png";
picture_properties[7] = {}; picture_properties[7].name = "http://hamishtodd1.github.io/Data/warning.png";

var picture_loaded = 0;

function loadpic(i) {
	texture_loader.load(
		picture_properties[i].name,
		function(texture) {
			var mywidth = 3;
			if( picture_loaded < 7 ){
				var myscale = 2;
				picture_objects[picture_loaded] = new THREE.Mesh(new THREE.CubeGeometry(mywidth , mywidth , 0),new THREE.MeshBasicMaterial({map: texture, transparent:true}) );

				picture_objects[picture_loaded].position.x = -playing_field_width / 2 + 1.2;
				picture_objects[picture_loaded].position.y = playing_field_width / 2 - 1.2;
				picture_objects[picture_loaded].position.z = 0.01;
			}
			else{
				picture_objects[picture_loaded] = new THREE.Mesh(new THREE.CubeGeometry(playing_field_width, playing_field_width, 0),new THREE.MeshBasicMaterial({map: texture}) );
			}
			//so they're offscreen by default
			
			console.log(picture_loaded);
			picture_loaded++;

			if(picture_loaded < picture_properties.length )
				loadpic(picture_loaded);
			else {
				console.log("done");

				launch();
			}
		},
		function ( xhr ) {}, function ( xhr ) {console.log( 'texture loading error' );}
	);
}