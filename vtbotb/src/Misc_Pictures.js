var texture_loader = new THREE.TextureLoader(); //only one? TODO

var CKHider;
var IrregButtonOpen;
var IrregButtonClosed;

var slideObjects;

function load_AV_stuff()
{
	var picturesLoaded;
	var introLoaded = false;
	var percentageLoaded = 15; //youtube 10%, initializations 5%
	
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
					if( index === 4 )
						console.log(playing_field_dimension * borderMultiplier[index]);
					var width = playing_field_dimension * borderMultiplier[index];
					
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
					percentageLoaded += 85 / (random_texture_urls.length + slidesInIntro);
					console.log(percentageLoaded)
					for(var i = 0; i < scene.children.length; i++)
					{
						scene.children[i].material.opacity = (percentageLoaded/100 - i/scene.children.length ) * scene.children.length;
						if(scene.children[i].material.opacity < 0)
							scene.children[i].material.opacity=0;
						if(scene.children[i].material.opacity > 1)
							scene.children[i].material.opacity=1;
						
						scene.children[i].material.needsUpdate = true;
					}
//					scene.children[0].scale.x = percentageLoaded / 100;
					
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
					                      "pop2",
					                      "pop3",
					                      
					                      "rotateAntiClockwise",
					                      "rotateClockwise",
					                      
					                      "shapeSettles", //the worst. Maybe use Monet's open or close?
					                      
					                      "sizeLimitLower",
					                      "sizeLimitUpper",
					                      
					                      "shapeOpen",
					                      "shapeClose",
					                      
					                      "triangleEdgeSound",
					                      
					                      "vertexGrabbed",
					                      "vertexReleased",
					                      ];
					for(var i = 0; i < soundInfoArray.length; i++)
					{
						Sounds[soundInfoArray[i]] = new Audio( "Data/Sounds/" + soundInfoArray[i] + ".mp3" );
					}
					
					var openCloseVolume = 0.2;
					Sounds.shapeOpen.defaultVolume = openCloseVolume;
					Sounds.shapeClose.defaultVolume = openCloseVolume;
					Sounds.shapeOpen.volume = openCloseVolume;
					Sounds.shapeClose.volume = openCloseVolume;
					Sounds.triangleEdgeSound.volume = 0.4;
					
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
	random_texture_urls.push( "Data/Misc textures/button.png");
	
	random_texture_urls.push( "Data/Misc textures/cell/cell-1.jpg"); //jpg!
	var highestCellLayer = 6;
	for(var i = 2; i <= highestCellLayer; i++)
		random_texture_urls.push( "Data/Misc textures/cell/cell-" + i.toString() + ".png");
	
	//Tree
	random_texture_urls.push( "Data/Misc textures/tree/Boca_name.png");
	random_texture_urls.push( "Data/Misc textures/tree/Hepa_name.png");
	random_texture_urls.push( "Data/Misc textures/tree/HIV_name.png");
	random_texture_urls.push( "Data/Misc textures/tree/Zika_name.png");
	random_texture_urls.push( "Data/Misc textures/tree/Measles_name.png");
	
	random_texture_urls.push( "Data/Misc textures/tree/Boca_icon.png");
	random_texture_urls.push( "Data/Slides/hepA.jpg");
	random_texture_urls.push( "Data/Slides/HIV.png");
	random_texture_urls.push( "Data/Slides/Zika Virus.jpg");
	random_texture_urls.push( "Data/Slides/measles.jpg");
	
	for(var i = 0; i < treeBranches.length; i++)
		random_texture_urls.push( "Data/Misc textures/tree/branches/"+i.toString()+".png");
	
	//moving pictures
	random_texture_urls.push( "Data/Slides/golf-ball.jpg");
	random_texture_urls.push( "Data/Slides/rota.jpg");
	random_texture_urls.push( "Data/Slides/greenhouse.jpg");
	random_texture_urls.push( "Data/Slides/phi29.jpg");
	random_texture_urls.push( "Data/Slides/shrine.jpg");
	random_texture_urls.push( "Data/Slides/bluetongue.jpg");
	
	random_texture_urls.push( "Data/Slides/hepA.jpg");
	random_texture_urls.push( "Data/Slides/hepB.jpg");
	random_texture_urls.push( "Data/Slides/hepAspikes.jpg");
	random_texture_urls.push( "Data/Slides/hepAdimples.jpg");
	random_texture_urls.push( "Data/Slides/hepBspikes.jpg");
	random_texture_urls.push( "Data/Slides/hepBdimples.jpg");

	random_texture_urls.push( "Data/Slides/HIV.png");
	random_texture_urls.push( "Data/Slides/amv.png");
	random_texture_urls.push( "Data/Slides/pp2.jpg");
	random_texture_urls.push( "Data/Slides/uneven.png");

	random_texture_urls.push( "Data/Slides/Zika Virus.jpg");
	random_texture_urls.push( "Data/Slides/bluetongue.jpg");
	random_texture_urls.push( "Data/Slides/HPV.jpg");
	
	
	var randomTargets = Array(random_texture_urls.length);
	
	randomTargets[0] = CKHider;
	randomTargets[1] = IrregButton.children[1];
	
	for(var i = 0; i < highestCellLayer; i++)
		randomTargets[i+2] = EggCell.children[i];
	
	for(var i = 0; i < Virus_chapter_icons.length; i++ )
	{
		randomTargets[ highestCellLayer+2+i] = Virus_chapter_names[i];
		randomTargets[ highestCellLayer+7+i] = Virus_chapter_icons[i];
	}
	
	for(var i = 0; i < treeBranches.length; i++)
	{
		randomTargets[ 2+highestCellLayer+Virus_chapter_icons.length*2+i] = treeBranches[i];
	}
	
	movingPictures = {
			golf:null,golfVirus:null,building:null,buildingVirus:null,art:null,artVirus:null,
			hepA:null,hepB:null,aMimic1:null,aMimic2:null,bMimic1:null,bMimic2:null,
			hiv:null, amv:null, pp2:null,uneven:null,
			zika:null,bluetongue:null, hpv:null};
	var randomTargetIndex = randomTargets.length-19;
	for( var picture in movingPictures)
	{
		var picWidth = 1;
		if( picture === "hpv" )
			picWidth = 1024/808;
		if( picture === "hepB" || picture === "bMimic1" || picture === "bMimic2" )
			picWidth = 1.15;
		movingPictures[picture] = new THREE.Mesh( new THREE.CubeGeometry(picWidth,picWidth, 0),
				  								new THREE.MeshBasicMaterial({transparent:true}) );
		
		if( randomTargetIndex >= randomTargets.length-3 )
			movingPictures[picture].chapter = QC_SPHERE_MODE;
		else if( randomTargetIndex >= randomTargets.length-7 )
			movingPictures[picture].chapter = IRREGULAR_MODE;
		else if( randomTargetIndex >= randomTargets.length-13 )
			movingPictures[picture].chapter = CK_MODE;
		else
		{
			movingPictures[picture].chapter = BOCAVIRUS_MODE;
			if(randomTargetIndex!==randomTargets.length-19)//first one
				movingPictures[picture].position.x = playing_field_dimension;
		}
		
		randomTargets[randomTargetIndex] = movingPictures[picture];
		randomTargetIndex++;
	}

	movingPictures.bluetongue.position.set( playing_field_dimension, -playing_field_dimension,0 );
	movingPictures.hpv.position.set( -playing_field_dimension, -playing_field_dimension,0 );
	
	movingPictures.amv.position.set( -playing_field_dimension, -playing_field_dimension,0 );
	movingPictures.pp2.position.set( playing_field_dimension, -playing_field_dimension,0 );
	movingPictures.uneven.position.set( 0, -playing_field_dimension,0.001 );
	
	//slides
	var normalBorderMultiplier = 1024 / 720;
	var borderMultiplier = [];
	
	slide_texture_urls.push( "Data/Slides/Zika victim.jpg"); borderMultiplier.push(normalBorderMultiplier);
	slide_texture_urls.push( "Data/Slides/hiv victim.jpg"); borderMultiplier.push(normalBorderMultiplier);
	slide_texture_urls.push( "Data/Slides/Dad.jpg"); borderMultiplier.push(normalBorderMultiplier);

	slide_texture_urls.push( "Data/Slides/slapped-cheek.jpg"); borderMultiplier.push(normalBorderMultiplier);
	slide_texture_urls.push( "Data/Slides/pregnant.jpg"); borderMultiplier.push(normalBorderMultiplier);

	slide_texture_urls.push( "Data/Slides/allViruses.jpg"); borderMultiplier.push(1);
	slide_texture_urls.push( "Data/Slides/humans.jpg"); borderMultiplier.push(normalBorderMultiplier);

	slide_texture_urls.push( "Data/Slides/Cell with proteins.png"); borderMultiplier.push(1);
	slide_texture_urls.push( "Data/Slides/femaleSkeleton.jpg"); borderMultiplier.push(normalBorderMultiplier);
	slide_texture_urls.push( "Data/Slides/Cell full of viruses.jpg"); borderMultiplier.push(1);
	slide_texture_urls.push( "Data/Slides/Cell lysis.jpg"); borderMultiplier.push(1);
	slide_texture_urls.push( "Data/Slides/infect other cells.jpg"); borderMultiplier.push(1);
	
	slide_texture_urls.push( "Data/Misc textures/tree/Boca_icon.png"); borderMultiplier.push(normalBorderMultiplier*0.6);
	
	var slidesInIntro = slide_texture_urls.length;
	
	//polio
	slide_texture_urls.push( "Data/Slides/hepA.jpg"); borderMultiplier.push(1);
	slide_texture_urls.push( "Data/Slides/footy.jpg"); borderMultiplier.push(normalBorderMultiplier);
	
	slide_texture_urls.push( "Data/Slides/hepB.jpg"); borderMultiplier.push(0.25);
	slide_texture_urls.push( "Data/Slides/hepA.jpg"); borderMultiplier.push(0.21);
	slide_texture_urls.push( "Data/Slides/thousands.jpg"); borderMultiplier.push(1);
	
	slide_texture_urls.push( "Data/Slides/sewing.jpg"); borderMultiplier.push(normalBorderMultiplier);
	slide_texture_urls.push( "Data/Slides/zorb.jpg"); borderMultiplier.push(normalBorderMultiplier);
	slide_texture_urls.push( "Data/Slides/lightSphere.jpg"); borderMultiplier.push(normalBorderMultiplier);
	slide_texture_urls.push( "Data/Slides/gammaSphere.jpg"); borderMultiplier.push(normalBorderMultiplier);
	slide_texture_urls.push( "Data/Slides/geodesic.jpg"); borderMultiplier.push(normalBorderMultiplier);
	slide_texture_urls.push( "Data/Slides/chlorella.jpg"); borderMultiplier.push(normalBorderMultiplier);
	slide_texture_urls.push( "Data/Slides/Buckminster.jpg"); borderMultiplier.push(normalBorderMultiplier);
	slide_texture_urls.push( "Data/Slides/basket.jpg"); borderMultiplier.push(normalBorderMultiplier);
	slide_texture_urls.push( "Data/Slides/hair.jpg"); borderMultiplier.push(normalBorderMultiplier);
	slide_texture_urls.push( "Data/Slides/First pic of virus.jpg"); borderMultiplier.push(1);
	slide_texture_urls.push( "Data/Slides/fuller-DIY-sun-dome.jpg"); borderMultiplier.push(1);

	//HIV
	slide_texture_urls.push( "Data/Slides/HIV.png"); borderMultiplier.push(1);
	slide_texture_urls.push( "Data/Slides/HIV variety.jpg"); borderMultiplier.push(1);
	
	slide_texture_urls.push( "Data/Slides/mimi.jpg"); borderMultiplier.push(1/(807/512));
	
	slide_texture_urls.push( "Data/Slides/monkey.jpg"); borderMultiplier.push(normalBorderMultiplier);
	slide_texture_urls.push( "Data/Slides/trim5.jpg"); borderMultiplier.push(1);
	slide_texture_urls.push( "Data/Slides/syringe.jpg"); borderMultiplier.push(normalBorderMultiplier); //TODO syringe
	slide_texture_urls.push( "Data/Slides/model1.jpg"); borderMultiplier.push(1);
	slide_texture_urls.push( "Data/Slides/model2.jpg"); borderMultiplier.push(1);
	slide_texture_urls.push( "Data/Slides/model2a.jpg"); borderMultiplier.push(1);
	slide_texture_urls.push( "Data/Slides/model3a.jpg"); borderMultiplier.push(1);
	slide_texture_urls.push( "Data/Slides/t4.jpg"); borderMultiplier.push(1);
	slide_texture_urls.push( "Data/Slides/t4corners.jpg"); borderMultiplier.push(1);
	slide_texture_urls.push( "Data/Slides/t4 shape.jpg"); borderMultiplier.push(1);
	
	slide_texture_urls.push( "Data/Slides/phi29.jpg"); borderMultiplier.push(1);
	
	slide_texture_urls.push( "Data/Slides/Lucky.jpg"); borderMultiplier.push(512/720);
	slide_texture_urls.push( "Data/Slides/book.jpg"); borderMultiplier.push(normalBorderMultiplier);
	slide_texture_urls.push( "Data/Slides/excerpt.jpg"); borderMultiplier.push(normalBorderMultiplier);
	
	//----QS
	slide_texture_urls.push( "Data/Slides/HPV.jpg"); borderMultiplier.push(1);
	slide_texture_urls.push( "Data/Slides/HPV xray.png"); borderMultiplier.push(1);
	slide_texture_urls.push( "Data/Slides/HPV blobs.png"); borderMultiplier.push(1);
	slide_texture_urls.push( "Data/Slides/HPV connections.png"); borderMultiplier.push(1);
	slide_texture_urls.push( "Data/Slides/HPV abstract.png"); borderMultiplier.push(808/619);

	slide_texture_urls.push( "Data/Slides/shrine.jpg"); borderMultiplier.push(1);
	slide_texture_urls.push( "Data/Slides/spa_1808.jpg"); borderMultiplier.push(1);
	slide_texture_urls.push( "Data/Slides/tra_0114.jpg"); borderMultiplier.push(1);
	slide_texture_urls.push( "Data/Slides/syr_0203.jpg"); borderMultiplier.push(1);
	slide_texture_urls.push( "Data/Slides/spa_2220.jpg"); borderMultiplier.push(1);
	slide_texture_urls.push( "Data/Slides/Darb e modified.png"); borderMultiplier.push(590/720);
	slide_texture_urls.push( "Data/Slides/Darb e above entrance.jpg"); borderMultiplier.push(1);
	slide_texture_urls.push( "Data/Slides/Darb e inside.jpg"); borderMultiplier.push(1);
	slide_texture_urls.push( "Data/Slides/Darb e pentagons.jpg"); borderMultiplier.push(1);
	slide_texture_urls.push( "Data/Slides/darb e sharp.jpg"); borderMultiplier.push(1); //next thing is to test (tree and final reused slides) without this extra slide
	slide_texture_urls.push( "Data/Slides/drug.jpg"); borderMultiplier.push(1);
	slide_texture_urls.push( "Data/Slides/Zika Virus.jpg"); borderMultiplier.push(normalBorderMultiplier);

	//----Ending
	slide_texture_urls.push( "Data/Slides/measles.jpg"); borderMultiplier.push(normalBorderMultiplier);
	slide_texture_urls.push( "Data/Slides/Tomoko.jpg"); borderMultiplier.push(normalBorderMultiplier);
	slide_texture_urls.push( "Data/Slides/boca.jpg"); borderMultiplier.push( normalBorderMultiplier);
	slide_texture_urls.push( "Data/Slides/shell.jpg"); borderMultiplier.push(normalBorderMultiplier);
	slide_texture_urls.push( "Data/Slides/golden spiral.jpg"); borderMultiplier.push(1);
	slide_texture_urls.push( "Data/Slides/nautilus with spiral.jpg"); borderMultiplier.push(1);
	slide_texture_urls.push( "Data/Slides/hk97.jpg"); borderMultiplier.push(normalBorderMultiplier);
	
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