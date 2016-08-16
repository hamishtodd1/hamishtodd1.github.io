/*
 * Ones that are appearing for the first time deffo need to fade in
* You could have all the ones that are possible in each model come out of them. 
* 		Make sure that once they're there, clicking on that model again highlights the whole group

You need a "selector". Get a UI person to design it for you. Until then have a big blue ball behind them

Should the user be able to select the same virus again?

You should zoom in and out on the tree to navigate :)

      bocavirus											Cell?
    ______|___________________________
   |                |                 |
  HIV           Hepatitis           Zika
  _|__       _______|_______       ___|__
 |    |     |               |     |      |
Phi29 T4  Cauliomaviridae Polio  HPV Bluetongue

Measles

* Hopefully it's sufficient to use a simple sheet with some alpha and just have that come down revealing whatever's there?
* 
Does DNA show up on there? Was "viruses and cells are different" the same slide?

Need sound effects here, if nowhere else

*/

var Chapters_visible = Array(1,1,0,0);
var Chapters_completed = Array(0,0,0,0); //or in other words "chapter complete"

var Virus_chapter_icons = Array(4);
var Virus_chapter_names = Array(4);

var Chapter_start_times = Array(4);

//everything you decide about this is temporary, but: dark blue circle, quite transparent
var Chapter_highlighter;

var IconDimension = playing_field_dimension * 0.48;

var player_has_never_hovered = 1;

function add_tree_stuff_to_scene()
{
	if( Chapters_completed[0] || Chapters_completed[1] )
		Chapters_visible[2] = 1;
	
	if(	Chapters_completed[0] === 1 && 
		Chapters_completed[1] === 1 && 
		Chapters_completed[2] === 1)
		Chapters_visible[3] = 1;
	
	for(var i = 0; i < Virus_chapter_icons.length; i++ )
	{
		if( Chapters_visible[i] )
		{
			scene.add(Virus_chapter_icons[i]);
			scene.add(Virus_chapter_names[i]);
		}
		
		if( Chapters_completed[i] )
		{
			Virus_chapter_icons[i].material.opacity = 0.3;
			//also put children here
		}
	}
	
	scene.add(Chapter_highlighter);
}

function init_tree()
{
	//You should probably "generate" the tree in case you want to change things. Just a bunch of plane geometries.

	Chapter_highlighter = new THREE.Mesh( 
			new THREE.CircleGeometry( IconDimension / 2, 32 ), 
			new THREE.MeshBasicMaterial( { transparent: true, opacity: 0.3, color: 0x0000ff } ) );
	Chapter_highlighter.position.z = 0.01;
	Chapter_highlighter.position.y = playing_field_dimension;
	
	Virus_chapter_icons[0] = new THREE.Mesh( new THREE.PlaneGeometry( IconDimension, IconDimension ), new THREE.MeshBasicMaterial({map: slide_textures[reused_slide_indices[5]], transparent: true}) );
	Virus_chapter_icons[1] = new THREE.Mesh( new THREE.PlaneGeometry( IconDimension, IconDimension ), new THREE.MeshBasicMaterial({map: slide_textures[reused_slide_indices[6]], transparent: true}) );
	Virus_chapter_icons[2] = new THREE.Mesh( new THREE.PlaneGeometry( IconDimension, IconDimension ), new THREE.MeshBasicMaterial({map: slide_textures[reused_slide_indices[7]], transparent: true}) );
	Virus_chapter_icons[3] = new THREE.Mesh( new THREE.PlaneGeometry( IconDimension, IconDimension ), new THREE.MeshBasicMaterial({map: slide_textures[reused_slide_indices[8]], transparent: true}) );
	
	var IconHorizontalDistfromCenter = playing_field_dimension * 0.25;
	Virus_chapter_icons[0].position.set(-IconHorizontalDistfromCenter, IconHorizontalDistfromCenter, 0 ); //HIV
	Virus_chapter_icons[1].position.set( IconHorizontalDistfromCenter, IconHorizontalDistfromCenter, 0 ); //polio
	Virus_chapter_icons[2].position.set(-IconHorizontalDistfromCenter,-IconHorizontalDistfromCenter, 0 ); //Zika
	Virus_chapter_icons[3].position.set( IconHorizontalDistfromCenter,-IconHorizontalDistfromCenter, 0 ); //Measles
	
	var name_dimension = IconDimension / 3;
	for(var i = 0; i < 4; i++)
	{
		Virus_chapter_names[i] = new THREE.Mesh( new THREE.CubeGeometry(name_dimension, name_dimension, 0),
				  new THREE.MeshBasicMaterial( { map: random_textures[6+i] } ) );
		Virus_chapter_names[i].position.copy( Virus_chapter_icons[i].position );
		Virus_chapter_names[i].position.x -= IconDimension / 2;
		Virus_chapter_names[i].position.x += name_dimension / 2;
		Virus_chapter_names[i].position.y -= IconDimension / 2;
		Virus_chapter_names[i].position.y += name_dimension / 2;
		Virus_chapter_names[i].position.z += 0.01;
	}
}

//maybe this should be called before anything in the loop
function update_tree()
{	
	var highlight_dest = Chapter_highlighter.position.clone();
	
	//for each you do, first check if it's in the scene
	for(var i = 0; i < Virus_chapter_icons.length; i++ )
	{
		if( scene.getObjectById(Virus_chapter_icons[i].id) === undefined )
			continue;
		
		//for the time being, you can't repeat chapters. If you want to, we need to make a "back button", sooo... yeah, almost certainly fuck it
		//if repeats are allowed, should have bocavirus.
		if( Chapters_completed[i] )
			continue;
			
		if( MousePosition.distanceTo(Virus_chapter_icons[i].position) < IconDimension / 2 ) //the radius, we're modelling them as circles
		{
			//player has officially hovered
			highlight_dest.set( Virus_chapter_icons[i].position.x, Virus_chapter_icons[i].position.y, 0.01 );
			
			if(player_has_never_hovered)
			{
				Chapter_highlighter.visible = true;
				Chapter_highlighter.position.copy(highlight_dest);
				player_has_never_hovered = 0;
			}
			
			//and have they clicked?
			if(isMouseDown && !isMouseDown_previously)
			{
				console.log(Chapter_start_times[i])
				
				//skip to it being there, don't want to come back here and see it moving weirdly
				Chapter_highlighter.position.copy(highlight_dest);
				Chapters_completed[i] = 1;
				ytplayer.seekTo(Chapter_start_times[i]);
			}
		}
	}
	
	var highlight_displacement_from_dest = highlight_dest.clone();
	highlight_displacement_from_dest.sub( Chapter_highlighter.position );
	var highlight_movement_speed = 0.2;
	if(highlight_displacement_from_dest.length() < highlight_movement_speed )
		Chapter_highlighter.position.copy( highlight_dest );
	else
	{
		highlight_displacement_from_dest.setLength(highlight_movement_speed);
		Chapter_highlighter.position.add( highlight_displacement_from_dest );
	}
	
	//also here you will have stuff about moving blockers out of the way etc
}