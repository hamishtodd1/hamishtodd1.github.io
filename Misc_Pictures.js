var texture_loader = new THREE.TextureLoader(); //only one? TODO
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
	
	var audioListener = new THREE.AudioListener();
	camera.add( audioListener );
	EndingMusic = new THREE.Audio( audioListener );
	EndingMusic.load(
		'http://hamishtodd1.github.io/Data/Rustavi Choir - Tsmindao Ghmerto (Holy God).ogg'
	);
	
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
	
	random_texture_urls[6] = "http://hamishtodd1.github.io/Data/Misc textures/Boca_name.png";
	random_texture_urls[7] = "http://hamishtodd1.github.io/Data/Misc textures/Hepa_name.png";
	random_texture_urls[8] = "http://hamishtodd1.github.io/Data/Misc textures/HIV_name.png";
	random_texture_urls[9] = "http://hamishtodd1.github.io/Data/Misc textures/Zika_name.png";
	random_texture_urls[10] = "http://hamishtodd1.github.io/Data/Misc textures/Measles_name.png";
	
	//slides
	slide_texture_urls.push( "http://hamishtodd1.github.io/Data/Slides/Zika victim.png");
	slide_texture_urls.push( "http://hamishtodd1.github.io/Data/Slides/HIV victim.png");
	slide_texture_urls.push( "http://hamishtodd1.github.io/Data/Slides/Dad.jpg");
	
	slide_texture_urls.push( "http://hamishtodd1.github.io/Data/Slides/Opening selection.png"); //better: have looooads more, incl. all the ones from later puzzles. They all pop in
	slide_texture_urls.push( "http://hamishtodd1.github.io/Data/Slides/Opening selection 1a.png");
	slide_texture_urls.push( "http://hamishtodd1.github.io/Data/Slides/Opening selection 1.png");
	slide_texture_urls.push( "http://hamishtodd1.github.io/Data/Slides/Opening selection 2a.jpg");
	slide_texture_urls.push( "http://hamishtodd1.github.io/Data/Slides/Opening selection 2.png");
	slide_texture_urls.push( "http://hamishtodd1.github.io/Data/Slides/Opening selection 3a.jpg");
	slide_texture_urls.push( "http://hamishtodd1.github.io/Data/Slides/Opening selection 3.png");
	
	slide_texture_urls.push( "http://hamishtodd1.github.io/Data/Slides/Cell with proteins.png");
	slide_texture_urls.push( "http://hamishtodd1.github.io/Data/Slides/Cell full of viruses.jpg");
	slide_texture_urls.push( "http://hamishtodd1.github.io/Data/Slides/Cell lysis.jpg");
	
	slide_texture_urls.push( "http://hamishtodd1.github.io/Data/Misc textures/Boca_icon.png");
	reused_slide_indices[9] = slide_texture_urls.length - 1;
	
	//----QS
	slide_texture_urls.push( "http://hamishtodd1.github.io/Data/Slides/Zika Virus.jpg");
	reused_slide_indices[7] = slide_texture_urls.length - 1;
	slide_texture_urls.push( "http://hamishtodd1.github.io/Data/Slides/HPV non xray.png");
	slide_texture_urls.push( "http://hamishtodd1.github.io/Data/Slides/HPV xray.png");
	slide_texture_urls.push( "http://hamishtodd1.github.io/Data/Slides/HPV blobs.png");
	slide_texture_urls.push( "http://hamishtodd1.github.io/Data/Slides/HPV connections.png");
	slide_texture_urls.push( "http://hamishtodd1.github.io/Data/Slides/HPV abstract.png");
	slide_texture_urls.push( "http://hamishtodd1.github.io/Data/Slides/Pattern square.png");
	slide_texture_urls.push( "http://hamishtodd1.github.io/Data/Slides/Pattern triangular.png");
	slide_texture_urls.push( "http://hamishtodd1.github.io/Data/Slides/Darb e modified.png");
	slide_texture_urls.push( "http://hamishtodd1.github.io/Data/Slides/Darb e above entrance.jpg");
	slide_texture_urls.push( "http://hamishtodd1.github.io/Data/Slides/Darb e inside.jpg");
	slide_texture_urls.push( "http://hamishtodd1.github.io/Data/Slides/Darb e pentagons.jpg"); //next thing is to test (tree and final reused slides) without this extra slide
	slide_texture_urls.push( "http://hamishtodd1.github.io/Data/Slides/Pentagons.png");
	slide_texture_urls.push( "http://hamishtodd1.github.io/Data/Slides/Pattern pentagonal.png");

	slide_texture_urls.push( "http://hamishtodd1.github.io/Data/Slides/HIV.png");
	reused_slide_indices[6] = slide_texture_urls.length - 1; 
	slide_texture_urls.push( "http://hamishtodd1.github.io/Data/Slides/HIV variety.png");
	slide_texture_urls.push( "http://hamishtodd1.github.io/Data/Slides/Rhesus.png");
//	slide_texture_urls.push( "http://hamishtodd1.github.io/Data/Slides/trim5.png");
	slide_texture_urls.push( "http://hamishtodd1.github.io/Data/Slides/very cone shaped HIV.png");
	slide_texture_urls.push( "http://hamishtodd1.github.io/Data/Slides/Origami_virus.png");
	slide_texture_urls.push( "http://hamishtodd1.github.io/Data/Slides/PHi29 corners.png");
	slide_texture_urls.push( "http://hamishtodd1.github.io/Data/Slides/PHi29 abstract.png");
	slide_texture_urls.push( "http://hamishtodd1.github.io/Data/Slides/T4.png");
	slide_texture_urls.push( "http://hamishtodd1.github.io/Data/Slides/Lucky.jpg");
	slide_texture_urls.push( "http://hamishtodd1.github.io/Data/Slides/book.jpg");
	slide_texture_urls.push( "http://hamishtodd1.github.io/Data/Slides/book excerpt.jpg");
	
	slide_texture_urls.push( "http://hamishtodd1.github.io/Data/Slides/Polio.png");
	reused_slide_indices[5] = slide_texture_urls.length - 1;
	slide_texture_urls.push( "http://hamishtodd1.github.io/Data/Slides/polio rhinovirus comparison.png");
	slide_texture_urls.push( "http://hamishtodd1.github.io/Data/Slides/polio hep A comparison.png");
	slide_texture_urls.push( "http://hamishtodd1.github.io/Data/Slides/polio hepatitis comparison.png");
	slide_texture_urls.push( "http://hamishtodd1.github.io/Data/Slides/Polio small.png");
	slide_texture_urls.push( "http://hamishtodd1.github.io/Data/Slides/RVF.png");
//	slide_texture_urls.push( "http://hamishtodd1.github.io/Data/Slides/hexagon.png");
//	slide_texture_urls.push( "http://hamishtodd1.github.io/Data/Slides/hexagon2.png");
//	slide_texture_urls.push( "http://hamishtodd1.github.io/Data/Slides/hexagon3.png");
	slide_texture_urls.push( "http://hamishtodd1.github.io/Data/Slides/Geodesic example 1.jpg");
	slide_texture_urls.push( "http://hamishtodd1.github.io/Data/Slides/Football.png");
	slide_texture_urls.push( "http://hamishtodd1.github.io/Data/Slides/geodesic building.png");
	slide_texture_urls.push( "http://hamishtodd1.github.io/Data/Slides/Bucky.png");
	slide_texture_urls.push( "http://hamishtodd1.github.io/Data/Slides/basket.png");
	slide_texture_urls.push( "http://hamishtodd1.github.io/Data/Slides/hair.png");
	slide_texture_urls.push( "http://hamishtodd1.github.io/Data/Slides/First pic of virus.jpg");


	slide_texture_urls.push( "http://hamishtodd1.github.io/Data/Slides/Measles virus.png");
	reused_slide_indices[8] = slide_texture_urls.length - 1;
	slide_texture_urls.push( "http://hamishtodd1.github.io/Data/Slides/Tomoko Fuse.png");
	slide_texture_urls.push( "http://hamishtodd1.github.io/Data/Slides/golden spiral.png");
	slide_texture_urls.push( "http://hamishtodd1.github.io/Data/Slides/nautilus.jpg");
	slide_texture_urls.push( "http://hamishtodd1.github.io/Data/Slides/nautilus with spiral.jpg");
	slide_texture_urls.push( "http://hamishtodd1.github.io/Data/Slides/all together.png");
	
	//if you change the above, you probably need to change these
	reused_slide_indices[0] = 24;
	reused_slide_indices[1] = 18;
	reused_slide_indices[2] = 22;
	reused_slide_indices[3] = 15;
	reused_slide_indices[4] = 20;
	
	virus_textures = Array(virus_texture_urls.length);
	random_textures =Array(random_texture_urls.length);
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

function bind_pictures()
{
	init_clickable_viruses();
	init_tree();
	init_bocavirus_stuff(); //it needs the egg cell pic
	
	//-----other
	CKHider = new THREE.Mesh( new THREE.CubeGeometry(6.93513143351, 6.93513143351, 0),
		new THREE.MeshBasicMaterial( { transparent:true, map: random_textures[0],
	        polygonOffset: true,
	        polygonOffsetFactor: -2.0, //on top
	        polygonOffsetUnits: -5.0 } ) );

	if(typeof random_textures[5] !== 'undefined')
		GrabbableArrow.material.map = random_textures[5];
	else
		GrabbableArrow.material.color = new THREE.Color(0,0,0);
		
	//first slide
	VisibleSlide = new THREE.Mesh( new THREE.CubeGeometry(playing_field_dimension, playing_field_dimension, 0),
		new THREE.MeshBasicMaterial( { transparent:true } ) );
	
	
	//----Ready
	PICTURES_LOADED = 1;
	attempt_launch();
}