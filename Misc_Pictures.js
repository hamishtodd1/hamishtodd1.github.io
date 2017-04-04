var texture_loader = new THREE.TextureLoader(); //only one? TODO

var CKHider;
var IrregButtonOpen;
var IrregButtonClosed;

var slideObjects;

function load_AV_stuff()
{
	var picturesLoaded;
	var introLoaded = false;
	var percentageLoaded = 10; //youtube 5%, initializations 5%
	
	function loadpic(url, type, index) {
		texture_loader.load(
				url,
			function(texture) {
				if(type === 1)
				{
					randomTargets[index].material.map = texture;
					randomTargets[index].material.needsUpdate = true;
					
					picturesLoaded[index] = 1;
				}
				if(type === 2)
				{
					slideObjects[index] = new THREE.Mesh( new THREE.CubeGeometry(playing_field_dimension, playing_field_dimension, 0),
							new THREE.MeshBasicMaterial( { transparent:true, map: texture } ) );
					
					picturesLoaded[ random_texture_urls.length + index] = 1;
				}
				
				if(!introLoaded)
				{
					percentageLoaded += 90 / (random_texture_urls.length + slidesInIntro);
					scene.children[0].scale.x = percentageLoaded / 100;
					
					for( var i = 0; i < random_texture_urls.length + slidesInIntro; i++ )
						if( !picturesLoaded[i] )
							return;
					
					introLoaded = true;
					for(var i = slidesInIntro; i < slide_texture_urls.length; i++ )
						loadpic(slide_texture_urls[i], 2, i);
					
					//---------SOUND
					Sounds = {};
					var soundInfoArray = [
					                      "endingMusic", "Rustavi Choir - Tsmindao Ghmerto (Holy God).ogg",
					                      "enlarge", "enlarge",
					                      "ensmall", "ensmall",
					                      "pop1", "pop1 260614__kwahmah-02__pop",
					                      "pop2", "pop2 34460__anbo__pop-lo-normal",
					                      "pop3", "pop3 268822__kwahmah-02__woodblock",
					                      "pop4", "pop4 25880__acclivity__fingerplop4",
					                      "grab", "irreg grab 323740__reitanna__mouth-pop2",
					                      "snap", "irreg snap 70105__timbre__tin-can-ping-scale",
					                      "openAndClose", "wobble",
					                      "button", "button press round_pop_click2"
					                      ];
					for(var i = 0; i < soundInfoArray.length / 2; i++)
					{
						//default file type
						if( soundInfoArray[i*2+1][soundInfoArray[i*2+1].length-4] !== "." )
							soundInfoArray[i*2+1] += ".wav";
						Sounds[soundInfoArray[i*2]] = new Audio( "http://hamishtodd1.github.io/Data/Sounds/' + soundInfoArray[i*2+1]" );
					}
					Sounds.enlarge.setVolume(3);
					Sounds.ensmall.setVolume(3);
					
					PICTURES_LOADED = 1; //this may create problems with skipping forward to places where you haven't loaded the pic yet
					attempt_launch();
				}
			},
			function ( xhr ) {}, function ( xhr ) {
				console.error( "couldn't load texture ", index );
			}
		);
	}
	
	//TODO put the numbers in here
	var random_texture_urls = Array();
	var slide_texture_urls = Array();
	
	//the other things and their widths
	random_texture_urls.push( "http://hamishtodd1.github.io/Data/Misc textures/CKhider.png");
	random_texture_urls.push( "http://hamishtodd1.github.io/Data/Misc textures/Egg cell hawaiireedlab.png");
	random_texture_urls.push( "http://hamishtodd1.github.io/Data/Slides/Opening selection.png"); //better: have looooads more, incl. all the ones from later puzzles. They all pop in
	
	random_texture_urls.push( "http://hamishtodd1.github.io/Data/Misc textures/Boca_name.png");
	random_texture_urls.push( "http://hamishtodd1.github.io/Data/Misc textures/Hepa_name.png");
	random_texture_urls.push( "http://hamishtodd1.github.io/Data/Misc textures/HIV_name.png");
	random_texture_urls.push( "http://hamishtodd1.github.io/Data/Misc textures/Zika_name.png");
	random_texture_urls.push( "http://hamishtodd1.github.io/Data/Misc textures/Measles_name.png");

	random_texture_urls.push( "http://hamishtodd1.github.io/Data/Misc textures/Boca_icon.png");
	random_texture_urls.push( "http://hamishtodd1.github.io/Data/Slides/Polio.png");
	random_texture_urls.push( "http://hamishtodd1.github.io/Data/Slides/HIV.png");
	random_texture_urls.push( "http://hamishtodd1.github.io/Data/Slides/Zika Virus.jpg");
	random_texture_urls.push( "http://hamishtodd1.github.io/Data/Slides/Measles virus.png");
	
	var randomTargets = Array(random_texture_urls.length);
	randomTargets[0] = CKHider;
	randomTargets[1] = EggCell;
	randomTargets[2] = Cornucopia;
	for(var i = 0; i < Virus_chapter_icons.length; i++ )
	{
		randomTargets[ 3+i] = Virus_chapter_names[i];
		randomTargets[ 8+i] = Virus_chapter_icons[i];
	}
	
	//slides
	slide_texture_urls.push( "http://hamishtodd1.github.io/Data/Slides/Zika victim.png");
	slide_texture_urls.push( "http://hamishtodd1.github.io/Data/Slides/HIV victim.png");
	slide_texture_urls.push( "http://hamishtodd1.github.io/Data/Slides/Dad.jpg");
	
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
	
	var slidesInIntro = slide_texture_urls.length;
	
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
	slide_texture_urls.push( "http://hamishtodd1.github.io/Data/Slides/Darb e highlighted.png");
	slide_texture_urls.push( "http://hamishtodd1.github.io/Data/Slides/Darb e above entrance.jpg");
	slide_texture_urls.push( "http://hamishtodd1.github.io/Data/Slides/Darb e inside.jpg");
	slide_texture_urls.push( "http://hamishtodd1.github.io/Data/Slides/Darb e pentagons.jpg"); //next thing is to test (tree and final reused slides) without this extra slide
	slide_texture_urls.push( "http://hamishtodd1.github.io/Data/Slides/Pentagons.png");
	slide_texture_urls.push( "http://hamishtodd1.github.io/Data/Slides/Pattern pentagonal.png");
	slide_texture_urls.push( "http://hamishtodd1.github.io/Data/Slides/drug.jpg");

	slide_texture_urls.push( "http://hamishtodd1.github.io/Data/Slides/HIV.png");
	reused_slide_indices[6] = slide_texture_urls.length - 1; 
	slide_texture_urls.push( "http://hamishtodd1.github.io/Data/Slides/HIV variety.png");
	slide_texture_urls.push( "http://hamishtodd1.github.io/Data/Slides/very icosahedral.png");
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
	slide_texture_urls.push( "http://hamishtodd1.github.io/Data/Slides/polio hep A comparison.png");
	slide_texture_urls.push( "http://hamishtodd1.github.io/Data/Slides/polio rhinovirus comparison.png");
	slide_texture_urls.push( "http://hamishtodd1.github.io/Data/Slides/polio hepatitis comparison.png");
	slide_texture_urls.push( "http://hamishtodd1.github.io/Data/Slides/Polio small.png");
	slide_texture_urls.push( "http://hamishtodd1.github.io/Data/Slides/RVF.png");
	slide_texture_urls.push( "http://hamishtodd1.github.io/Data/Slides/Geodesic example 1.jpg");
	slide_texture_urls.push( "http://hamishtodd1.github.io/Data/Slides/Football.png");
	slide_texture_urls.push( "http://hamishtodd1.github.io/Data/Slides/geodesic building.png");
	slide_texture_urls.push( "http://hamishtodd1.github.io/Data/Slides/Bucky.png");
	slide_texture_urls.push( "http://hamishtodd1.github.io/Data/Slides/basket.png");
	slide_texture_urls.push( "http://hamishtodd1.github.io/Data/Slides/hair.png");
	slide_texture_urls.push( "http://hamishtodd1.github.io/Data/Slides/First pic of virus.jpg");
	slide_texture_urls.push( "http://hamishtodd1.github.io/Data/Slides/fly eye.jpg");


	slide_texture_urls.push( "http://hamishtodd1.github.io/Data/Slides/Measles virus.png");
	reused_slide_indices[8] = slide_texture_urls.length - 1;
	slide_texture_urls.push( "http://hamishtodd1.github.io/Data/Slides/Tomoko Fuse.png");
	slide_texture_urls.push( "http://hamishtodd1.github.io/Data/Slides/golden spiral.png");
	slide_texture_urls.push( "http://hamishtodd1.github.io/Data/Slides/nautilus.jpg");
	slide_texture_urls.push( "http://hamishtodd1.github.io/Data/Slides/nautilus with spiral.jpg");
	slide_texture_urls.push( "http://hamishtodd1.github.io/Data/Slides/Opening selection 1a.png");
	
	//if you change the above, you probably need to change these
	reused_slide_indices[0] = 24;
	reused_slide_indices[1] = 18;
	reused_slide_indices[2] = 22;
	reused_slide_indices[3] = 15;
	reused_slide_indices[4] = 20;
	
	slideObjects = Array(slide_texture_urls.length);
	
	picturesLoaded = new Uint8Array(random_texture_urls.length + slide_texture_urls.length);
	for(var i = 0; i < picturesLoaded.length; i++ )
		picturesLoaded[i] = 0;
	
	for(var i = 0; i < random_texture_urls.length; i++ )
		loadpic(random_texture_urls[i], 1, i);
	
	for(var i = 0; i < slide_texture_urls.length; i++ )
	{
		var last_three_letters = slide_texture_urls[i].substr( slide_texture_urls[i].length - 3);
		
		if( last_three_letters === "png" || last_three_letters === "gif" || last_three_letters === "jpg" )
			{}
		else console.log( "unrecognized format", last_three_letters);
	}

	for(var i = 0; i < slidesInIntro; i++ )
		loadpic(slide_texture_urls[i], 2, i);
}