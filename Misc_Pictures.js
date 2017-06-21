var texture_loader = new THREE.TextureLoader(); //only one? TODO

var CKHider;
var IrregButtonOpen;
var IrregButtonClosed;

var slideObjects;

/*
 * you have to overhaul pretty much everything that currently controls their position
 * 
 * Problem with having multiple pictures visible together: if some of them have 1024 borders, they'll overlap :/ unless you avoid that
 * So you need transparency there
 * 
 * Agh, note that if you insert or remove any 
 */

function load_AV_stuff()
{
	var picturesLoaded;
	var introLoaded = false;
	var percentageLoaded = 10; //youtube 5%, initializations 5%
	var borderMultiplier = 1024 / 720;
	
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
					var width = bordered[index] ? playing_field_dimension * borderMultiplier : playing_field_dimension;
					slideObjects[index] = new THREE.Mesh( new THREE.CubeGeometry(width,width, 0),
							new THREE.MeshBasicMaterial( 
									{ 
										transparent:true, 
										map: texture, 
										depthTest: false //no fade?
									} ) );
					
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
					                      "bump",
					                      
					                      "buttonPressed",
					                      "buttonReleased",
					                      
					                      "pop1",
					                      "pop3",
					                      "pop4",
					                      
					                      "rotateAntiClockwise",
					                      "rotateClockwise",
					                      
					                      "shapeSettles", //the worst. Maybe use Monet's open or close?
					                      
					                      //got work to do
					                      "sizeDecreaseLong",
					                      "sizeDecreaseMedium",
					                      "sizeDecreaseShort",
					                      "sizeIncreaseLong",
					                      "sizeIncreaseMedium",
					                      "sizeIncreaseShort",
					                      
					                      "sizeLimitLower",
					                      "sizeLimitUpper",
					                      
					                      "shapeOpen",
					                      "shapeClose",
					                      
					                      "triangleEdgeBump",
					                      "triangleEdgeSound",
					                      
					                      "vertexGrabbed",
					                      "vertexReleased",
					                      ];
					for(var i = 0; i < soundInfoArray.length; i++)
					{
						Sounds[soundInfoArray[i]] = new Audio( "Data/Sounds/" + soundInfoArray[i] + ".mp3" );
					}
					var sizeVolume = 0.4;
					Sounds.sizeDecreaseLong.volume = sizeVolume;
					Sounds.sizeDecreaseMedium.volume = sizeVolume;
					Sounds.sizeDecreaseShort.volume = sizeVolume;
					
					Sounds.sizeDecreaseLong.defaultVolume = sizeVolume;
					Sounds.sizeDecreaseMedium.defaultVolume = sizeVolume;
					Sounds.sizeDecreaseShort.defaultVolume = sizeVolume;

					Sounds.sizeIncreaseLong.volume = sizeVolume;
					Sounds.sizeIncreaseMedium.volume = sizeVolume;
					Sounds.sizeIncreaseShort.volume = sizeVolume;

					Sounds.sizeIncreaseLong.defaultVolume = sizeVolume;
					Sounds.sizeIncreaseMedium.defaultVolume = sizeVolume;
					Sounds.sizeIncreaseShort.defaultVolume = sizeVolume;
					
					PICTURES_LOADED = 1; //this may create problems with skipping forward to places where you haven't loaded the pic yet
					attempt_launch();
				}
			},
			function ( xhr ) {}, function ( xhr ) {
				console.error( "couldn't load texture with url ", url );
			}
		);
	}
	
	//TODO put the numbers in here
	var random_texture_urls = Array();
	var slide_texture_urls = Array();
	
	//the other things and their widths
	random_texture_urls.push( "Data/Misc textures/CKhider.png");
	random_texture_urls.push( "Data/Misc textures/Egg cell hawaiireedlab.png");
	random_texture_urls.push( "Data/Slides/Opening selection.png"); //better: have looooads more, incl. all the ones from later puzzles. They all pop in
	
	random_texture_urls.push( "Data/Misc textures/Boca_name.png");
	random_texture_urls.push( "Data/Misc textures/Hepa_name.png");
	random_texture_urls.push( "Data/Misc textures/HIV_name.png");
	random_texture_urls.push( "Data/Misc textures/Zika_name.png");
	random_texture_urls.push( "Data/Misc textures/Measles_name.png");
	
	random_texture_urls.push( "Data/Misc textures/Boca_icon.png");
	random_texture_urls.push( "Data/Slides/Polio.png");
	random_texture_urls.push( "Data/Slides/HIV.png");
	random_texture_urls.push( "Data/Slides/Zika Virus.jpg");
	random_texture_urls.push( "Data/Slides/Measles virus.png");
	
	//that one part
	random_texture_urls.push( "Data/Misc textures/hep a.jpg");
	random_texture_urls.push( "Data/Misc textures/Polio.jpg");
	random_texture_urls.push( "Data/Misc textures/semliki.jpg");
	random_texture_urls.push( "Data/Misc textures/sortaHepA.jpg");
	random_texture_urls.push( "Data/Misc textures/sortaHepB.jpg");
	random_texture_urls.push( "Data/Misc textures/hep b.jpg");

	random_texture_urls.push( "Data/Slides/Zika Virus.jpg");
	random_texture_urls.push( "Data/Slides/bluetongue.jpg");
	random_texture_urls.push( "Data/Slides/HPV non xray.png");
	
	
	var randomTargets = Array(random_texture_urls.length);
	randomTargets[0] = CKHider;
	randomTargets[1] = EggCell;
	randomTargets[2] = Cornucopia;
	for(var i = 0; i < Virus_chapter_icons.length; i++ )
	{
		randomTargets[ 3+i] = Virus_chapter_names[i];
		randomTargets[ 8+i] = Virus_chapter_icons[i];
	}
	
	movingPictures = {hepA:null,hepB:null,aMimic1:null,aMimic2:null,bMimic1:null,bMimic2:null,
			zika:null,bluetongue:null, hpv:null};
	var COSdimension = 1;
	var randomTargetIndex = randomTargets.length-9;
	for( var virus in movingPictures)
	{	
		movingPictures[virus] = new THREE.Mesh( new THREE.CubeGeometry(COSdimension, COSdimension, 0),
				  								new THREE.MeshBasicMaterial() );
//		movingPictures[i].position.y = playing_field_dimension / 2 + COSdimension / 2;
		randomTargets[randomTargetIndex] = movingPictures[virus];
		randomTargetIndex++;
	}
	
	//slides
	var bordered = [];
	
	slide_texture_urls.push( "Data/Slides/Zika victim.png"); bordered.push(0);
	slide_texture_urls.push( "Data/Slides/HIV.jpg"); bordered.push(1);
	slide_texture_urls.push( "Data/Slides/Dad.jpg"); bordered.push(1);

	slide_texture_urls.push( "Data/Slides/slapped-cheek.jpg"); bordered.push(1);
	slide_texture_urls.push( "Data/Slides/pregnant.jpg"); bordered.push(1);
	
	slide_texture_urls.push( "Data/Slides/humans.jpg"); bordered.push(0);
	
	slide_texture_urls.push( "Data/Slides/golf-ball.jpg"); bordered.push(1);
	slide_texture_urls.push( "Data/Slides/Opening selection 1.png"); bordered.push(0);
	slide_texture_urls.push( "Data/Slides/Opening selection 2a.jpg"); bordered.push(0);
	slide_texture_urls.push( "Data/Slides/Opening selection 2.png"); bordered.push(0);
	slide_texture_urls.push( "Data/Slides/shrine.jpg"); bordered.push(1);
	slide_texture_urls.push( "Data/Slides/bluetongue.jpg"); bordered.push(0);

	slide_texture_urls.push( "Data/Slides/Cell with proteins.png"); bordered.push(0);
	slide_texture_urls.push( "Data/Slides/humans.jpg"); bordered.push(0);
	slide_texture_urls.push( "Data/Slides/Cell full of viruses.jpg"); bordered.push(0);
	slide_texture_urls.push( "Data/Slides/Cell lysis.jpg"); bordered.push(0);
	slide_texture_urls.push( "Data/Slides/infect other cells.jpg"); bordered.push(0);
	
	slide_texture_urls.push( "Data/Misc textures/Boca_icon.png"); bordered.push(0);
	
	var slidesInIntro = slide_texture_urls.length;
	
	//polio
	slide_texture_urls.push( "Data/Slides/Polio.png"); bordered.push(0);
	slide_texture_urls.push( "Data/Slides/Polio small.png"); bordered.push(0);
	slide_texture_urls.push( "Data/Slides/footy.jpg"); bordered.push(0);
	slide_texture_urls.push( "Data/Slides/hepatitis.png"); bordered.push(0);
	
	slide_texture_urls.push( "Data/Slides/Geodesic example 1.jpg"); bordered.push(0);
	slide_texture_urls.push( "Data/Slides/Geodesic example 2.png"); bordered.push(0);
	slide_texture_urls.push( "Data/Slides/Geodesic example 3.png"); bordered.push(0);
	slide_texture_urls.push( "Data/Slides/geodesic.jpg"); bordered.push(0);
	slide_texture_urls.push( "Data/Slides/mimivirus.png"); bordered.push(0);
	slide_texture_urls.push( "Data/Slides/Buckminster.jpg"); bordered.push(0);
	slide_texture_urls.push( "Data/Slides/basket.png"); bordered.push(0);
	slide_texture_urls.push( "Data/Slides/hair.jpg"); bordered.push(0);
	slide_texture_urls.push( "Data/Slides/First pic of virus.jpg"); bordered.push(0);
	slide_texture_urls.push( "Data/Slides/fuller-DIY-sun-dome.jpg"); bordered.push(0);

	//HIV
	slide_texture_urls.push( "Data/Slides/HIV.png"); bordered.push(0);
	slide_texture_urls.push( "Data/Slides/HIV variety.png"); bordered.push(0);
	slide_texture_urls.push( "Data/Slides/otherUneven.jpg"); bordered.push(0);
	slide_texture_urls.push( "Data/Slides/very icosahedral.png"); bordered.push(0);
	slide_texture_urls.push( "Data/Slides/monkey.jpg"); bordered.push(0);
	slide_texture_urls.push( "Data/Slides/trim5.jpg"); bordered.push(0);
	slide_texture_urls.push( "Data/Slides/drug.jpg"); bordered.push(0);
	slide_texture_urls.push( "Data/Slides/model1.jpg"); bordered.push(0);
	slide_texture_urls.push( "Data/Slides/model2.jpg"); bordered.push(0);
//	slide_texture_urls.push( "Data/Slides/very cone shaped HIV.png");
	slide_texture_urls.push( "Data/Slides/Origami_virus.png"); bordered.push(0);
	slide_texture_urls.push( "Data/Slides/PHi29 corners.png"); bordered.push(0);
	slide_texture_urls.push( "Data/Slides/PHi29 abstract.png"); bordered.push(0);
	slide_texture_urls.push( "Data/Slides/T4.png"); bordered.push(0);
	slide_texture_urls.push( "Data/Slides/Lucky.jpg"); bordered.push(0);
	slide_texture_urls.push( "Data/Slides/book.jpg"); bordered.push(0);
	slide_texture_urls.push( "Data/Slides/how-to-fold.jpg"); bordered.push(0);
	
	//----QS
	slide_texture_urls.push( "Data/Slides/HPV non xray.png"); bordered.push(0);
	slide_texture_urls.push( "Data/Slides/HPV xray.png"); bordered.push(0);
	slide_texture_urls.push( "Data/Slides/HPV blobs.png"); bordered.push(0);
	slide_texture_urls.push( "Data/Slides/HPV connections.png"); bordered.push(0);
	slide_texture_urls.push( "Data/Slides/HPV abstract.png"); bordered.push(0);

	slide_texture_urls.push( "Data/Slides/islamic examples (2).jpg"); bordered.push(0);
	slide_texture_urls.push( "Data/Slides/islamic examples (1).png"); bordered.push(0);
	slide_texture_urls.push( "Data/Slides/islamic examples (1).jpg"); bordered.push(0);
//	slide_texture_urls.push( "Data/Slides/islamic examples (2).png"); bordered.push(0);
	slide_texture_urls.push( "Data/Slides/Darb e modified.png"); bordered.push(0);
//	slide_texture_urls.push( "Data/Slides/Darb e highlighted.png");
	slide_texture_urls.push( "Data/Slides/Darb e above entrance.jpg"); bordered.push(0);
	slide_texture_urls.push( "Data/Slides/Darb e inside.jpg"); bordered.push(0);
	slide_texture_urls.push( "Data/Slides/darb e sharp.jpg"); //next thing is to test (tree and final reused slides) without this extra slide
	slide_texture_urls.push( "Data/Slides/Pentagons.png"); bordered.push(0);
	slide_texture_urls.push( "Data/Slides/Pattern pentagonal.png"); bordered.push(0);
	slide_texture_urls.push( "Data/Slides/drug.jpg"); bordered.push(0);

	//----Ending
	slide_texture_urls.push( "Data/Slides/Measles virus.png");
	slide_texture_urls.push( "Data/Slides/Tomoko.jpg");
	slide_texture_urls.push( "Data/Slides/shell.jpg");
	slide_texture_urls.push( "Data/Slides/golden spiral.png");
	slide_texture_urls.push( "Data/Slides/nautilus with spiral.jpg");
	slide_texture_urls.push( "Data/Slides/Opening selection 1a.png");
	
	for(var i = bordered.length; i< slide_texture_urls.length; i++)
		bordered[i] = 0;
	
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