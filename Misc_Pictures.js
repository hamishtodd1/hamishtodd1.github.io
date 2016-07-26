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
	virus_texture_urls[0] = "http://hamishtodd1.github.io/Data/ClickableViruses/1 - BV.jpg"; //to be turned into golfball.jpg or whatever
	virus_texture_urls[1] = "http://hamishtodd1.github.io/Data/ClickableViruses/1 - BV.jpg";
	virus_texture_urls[2] = "http://hamishtodd1.github.io/Data/ClickableViruses/9 - N4.gif";
	virus_texture_urls[3] = "http://hamishtodd1.github.io/Data/ClickableViruses/13 - RV.png";
	
	virus_texture_urls[4] = "http://hamishtodd1.github.io/Data/ClickableViruses/3 - PV.png";
	virus_texture_urls[5] = "http://hamishtodd1.github.io/Data/ClickableViruses/4 - SFV.png";
	virus_texture_urls[6] = "http://hamishtodd1.github.io/Data/ClickableViruses/7 - CV.png";
	virus_texture_urls[7] = "http://hamishtodd1.github.io/Data/ClickableViruses/12 - RVFV.png";
	
	virus_texture_urls[ 8] = "http://hamishtodd1.github.io/Data/ClickableViruses/Bocavirus file.png";
	virus_texture_urls[ 9] = "http://hamishtodd1.github.io/Data/ClickableViruses/Bluetongue file.png";
	virus_texture_urls[10] = "http://hamishtodd1.github.io/Data/ClickableViruses/Zika file.png";
	virus_texture_urls[11] = "http://hamishtodd1.github.io/Data/ClickableViruses/HPV file.png";
	
	virus_texture_urls[12] = "http://hamishtodd1.github.io/Data/ClickableViruses/T4 file.png";
	virus_texture_urls[13] = "http://hamishtodd1.github.io/Data/ClickableViruses/Phi29 file.png";
	virus_texture_urls[14] = "http://hamishtodd1.github.io/Data/ClickableViruses/HIV file.png";
	virus_texture_urls[15] = "http://hamishtodd1.github.io/Data/ClickableViruses/Herpes file.png";
	
	//the other things and their widths
	random_texture_urls[0] = "http://hamishtodd1.github.io/Data/Misc textures/CKhider.png";
	random_texture_urls[1] = "http://hamishtodd1.github.io/Data/Misc textures/open.png";
	random_texture_urls[2] = "http://hamishtodd1.github.io/Data/Misc textures/close.png";
	random_texture_urls[3] = "http://hamishtodd1.github.io/Data/Misc textures/Egg cell hawaiireedlab.png";
	random_texture_urls[4] = "http://hamishtodd1.github.io/Data/Misc textures/Transcriptase.png"; //TODO extend the DNA
	random_texture_urls[5] = "http://hamishtodd1.github.io/Data/Misc textures/Grabbable Arrow.png";
	
	random_texture_urls[6] = "http://hamishtodd1.github.io/Data/Misc textures/HIV_name.png";
	random_texture_urls[7] = "http://hamishtodd1.github.io/Data/Misc textures/Hepa_name.png";
	random_texture_urls[8] = "http://hamishtodd1.github.io/Data/Misc textures/Zika_name.png";
	random_texture_urls[9] = "http://hamishtodd1.github.io/Data/Misc textures/Measles_name.png";
	
	//slides
	slide_texture_urls.push( "http://hamishtodd1.github.io/Data/Slides/Zika victim.png");
	slide_texture_urls.push( "http://hamishtodd1.github.io/Data/Slides/HIV victim.png");
	slide_texture_urls.push( "http://hamishtodd1.github.io/Data/Slides/Dad.jpg");
	
	slide_texture_urls.push( "http://hamishtodd1.github.io/Data/Slides/Golfball.png");
	slide_texture_urls.push( "http://hamishtodd1.github.io/Data/Slides/Golfball_virus.png");
	slide_texture_urls.push( "http://hamishtodd1.github.io/Data/Slides/Origami.jpg");
	slide_texture_urls.push( "http://hamishtodd1.github.io/Data/Slides/Origami_virus.png");
	slide_texture_urls.push( "http://hamishtodd1.github.io/Data/Slides/shah nematollah vali shrine.jpg");
	slide_texture_urls.push( "http://hamishtodd1.github.io/Data/Slides/HPV xray.png");
	
	slide_texture_urls.push( "http://hamishtodd1.github.io/Data/Slides/Cell with proteins.png");
	slide_texture_urls.push( "http://hamishtodd1.github.io/Data/Slides/Cell full of viruses.jpg");
	slide_texture_urls.push( "http://hamishtodd1.github.io/Data/Slides/Cell lysis.jpg");

	slide_texture_urls.push( "http://hamishtodd1.github.io/Data/Slides/HIV.png");
	slide_texture_urls.push( "http://hamishtodd1.github.io/Data/Slides/Bonobos.jpg");
	slide_texture_urls.push( "http://hamishtodd1.github.io/Data/Slides/HIV variety.png");

	slide_texture_urls.push( "http://hamishtodd1.github.io/Data/Slides/Semliki.png");
	slide_texture_urls.push( "http://hamishtodd1.github.io/Data/Slides/Greenhouse.jpg");
	slide_texture_urls.push( "http://hamishtodd1.github.io/Data/Slides/Gamma ray detector.jpg");
	slide_texture_urls.push( "http://hamishtodd1.github.io/Data/Slides/Bucky.png");
	slide_texture_urls.push( "http://hamishtodd1.github.io/Data/Slides/Hair and baskets.png");
	slide_texture_urls.push( "http://hamishtodd1.github.io/Data/Slides/First pic of virus.jpg");
	
	slide_texture_urls.push( "http://hamishtodd1.github.io/Data/Slides/Zika Virus.jpg");
	slide_texture_urls.push( "http://hamishtodd1.github.io/Data/Slides/Darb e outside.jpg");
	slide_texture_urls.push( "http://hamishtodd1.github.io/Data/Slides/Darb e above entrance.jpg");
	slide_texture_urls.push( "http://hamishtodd1.github.io/Data/Slides/Darb e inside.jpg");
	slide_texture_urls.push( "http://hamishtodd1.github.io/Data/Slides/Darb e pentagons.jpg"); //next thing is to test (tree and final reused slides) without this extra slide
	slide_texture_urls.push( "http://hamishtodd1.github.io/Data/Slides/Pattern triangular.jpg");
	slide_texture_urls.push( "http://hamishtodd1.github.io/Data/Slides/Pattern square.png");
	slide_texture_urls.push( "http://hamishtodd1.github.io/Data/Slides/Pattern hexagonal.jpg");
	slide_texture_urls.push( "http://hamishtodd1.github.io/Data/Slides/Pentagons.png");
	slide_texture_urls.push( "http://hamishtodd1.github.io/Data/Slides/Pattern pentagonal.png");
	
	slide_texture_urls.push( "http://hamishtodd1.github.io/Data/Slides/Origami geodesic.png");
	slide_texture_urls.push( "http://hamishtodd1.github.io/Data/Slides/Very dodecahedral virus.png");
	slide_texture_urls.push( "http://hamishtodd1.github.io/Data/Slides/golden spiral.png");
	slide_texture_urls.push( "http://hamishtodd1.github.io/Data/Slides/Mona Lisa.jpg");
	slide_texture_urls.push( "http://hamishtodd1.github.io/Data/Slides/Measles virus.png");
	
	//if you change the above, you probably need to change these
	reused_slide_indices[0] = 24;
	reused_slide_indices[1] = 18;
	reused_slide_indices[2] = 22;
	reused_slide_indices[3] = 15;
	reused_slide_indices[4] = 20;

	reused_slide_indices[5] = 12;
	reused_slide_indices[6] = 15;
	reused_slide_indices[7] = 21;
	reused_slide_indices[8] = 34;
	
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
	init_clickable_viruses();
	init_tree();
	init_bocavirus_stuff(); //it needs the egg cell pic
	
	//-----other
	CKHider = new THREE.Mesh( new THREE.CubeGeometry(6.93513143351, 6.93513143351, 0),
		new THREE.MeshBasicMaterial( { transparent:true, map: random_textures[0] } ) );
	
	IrregButton = new THREE.Mesh( new THREE.CubeGeometry(0.6, 0.6, 0),
			new THREE.MeshBasicMaterial( { transparent:true, map: random_textures[1] } ) ); //and can change to [2]
	
	IrregButton.position.set(-playing_field_dimension / 2 + 0.4,-1.4,0.0001);
	IrregButton.capsidopen = 0;

	GrabbableArrow.material.map = random_textures[5];
	
	//first slide
	VisibleSlide = new THREE.Mesh( new THREE.CubeGeometry(playing_field_dimension, playing_field_dimension, 0),
		new THREE.MeshBasicMaterial( { transparent:true } ) );
	
	
	//----Ready
	PICTURES_LOADED = 1;
	attempt_launch();
}