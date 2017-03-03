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

	  bocavirus											Cell?
    ______|______
   |      |      |
  HIV   Polio   Zika
  	
  	   Measles
  
How does zika get added? For the time being just have it appear



* Hopefully it's sufficient to use a simple sheet with some alpha and just have that come down revealing whatever's there?
* 
Does DNA show up on there? Was "viruses and cells are different" the same slide?

Need sound effects here, if nowhere else

*/

var Chapters_visible = Array(1,1,1,0,0);
var Chapters_completed = Array(1,0,0,0,0); //first has been done by definition, for the time being at least

var zika_introduction_animation = 0;

var Virus_chapter_icons = Array(5);
var Virus_chapter_names = Array(5);

var Chapter_start_times = Array(5);

var delay_timer = 0;

//everything you decide about this is temporary, but: dark blue circle, quite transparent
var Chapter_highlighter;

var IconDimension = playing_field_dimension * 0.225;

var tree_zoomedness = 1;
var tree_zoomtowards = 666;

function add_tree_stuff_to_scene()
{
	if( Chapters_completed[1] || Chapters_completed[2] )
		Chapters_visible[3] = 1;
		
	
	if(	Chapters_completed[0] === 1 && 
		Chapters_completed[1] === 1 && 
		Chapters_completed[2] === 1 && 
		Chapters_completed[3] === 1)
	{
		Chapters_visible[4] = 1;
		Virus_chapter_icons[4].material.opacity = 0;
		Virus_chapter_icons[4].children[0].material.opacity = 0;
	}
	
	for(var i = 0; i < Virus_chapter_icons.length; i++ )
		scene.add(Virus_chapter_icons[i]);
	
	for(var i = 0; i < Tree_lines.length; i++ )
		scene.add(Tree_lines[i])
	
	scene.add(Chapter_highlighter);
}

function init_tree()
{
	Chapter_highlighter = new THREE.Mesh( 
			new THREE.CircleGeometry( IconDimension / 2, 32 ), 
			new THREE.MeshBasicMaterial( { transparent: true, opacity: 0.3, color: 0x0000ff } ) );
	Chapter_highlighter.position.z = 0.01;
	Chapter_highlighter.position.y = playing_field_dimension;
	
	Virus_chapter_icons[0] = new THREE.Mesh( new THREE.PlaneGeometry( IconDimension, IconDimension ), new THREE.MeshBasicMaterial({map: slide_textures[reused_slide_indices[9]], transparent: true}) );
	Virus_chapter_icons[1] = new THREE.Mesh( new THREE.PlaneGeometry( IconDimension, IconDimension ), new THREE.MeshBasicMaterial({map: slide_textures[reused_slide_indices[5]], transparent: true}) );
	Virus_chapter_icons[2] = new THREE.Mesh( new THREE.PlaneGeometry( IconDimension, IconDimension ), new THREE.MeshBasicMaterial({map: slide_textures[reused_slide_indices[6]], transparent: true}) );
	Virus_chapter_icons[3] = new THREE.Mesh( new THREE.PlaneGeometry( IconDimension, IconDimension ), new THREE.MeshBasicMaterial({map: slide_textures[reused_slide_indices[7]], transparent: true}) );
	Virus_chapter_icons[4] = new THREE.Mesh( new THREE.PlaneGeometry( IconDimension, IconDimension ), new THREE.MeshBasicMaterial({map: slide_textures[reused_slide_indices[8]], transparent: true}) );
	
	var name_dimension = IconDimension / 3;
	for(var i = 0; i < Virus_chapter_icons.length; i++)
	{
		Virus_chapter_names[i] = new THREE.Mesh( new THREE.CubeGeometry(name_dimension, name_dimension, 0),
				  new THREE.MeshBasicMaterial( { map: random_textures[6+i], transparent: true, opacity: 0 } ) );
		
		Virus_chapter_icons[i].add(Virus_chapter_names[i]);
		
		Virus_chapter_names[i].position.y -= IconDimension / 2;
		Virus_chapter_names[i].position.y -= name_dimension / 4;
		Virus_chapter_names[i].position.z -= 0.01;
	}
	
	//somewhere between max and min
	Virus_chapter_icons.icon_spacing = playing_field_dimension * 0.5 - IconDimension * 0.5 - name_dimension * 0.4;
	Virus_chapter_icons[0].position.set(0, Virus_chapter_icons.icon_spacing, 0 ); //boca
	Virus_chapter_icons[1].position.set(-Virus_chapter_icons.icon_spacing / 2, 0, 0 ); //Polio
	Virus_chapter_icons[2].position.set( Virus_chapter_icons.icon_spacing / 2, 0, 0 ); //HIV
	Virus_chapter_icons[3].position.set(0, 0, 0 ); //Zika
	Virus_chapter_icons[4].position.set(0, -Virus_chapter_icons.icon_spacing, 0 ); //Measles
	
	Tree_lines = Array(7);
	for(var i = 0; i < 7; i++) //we give them that size so that we can think of the width of the horizontals as 1 and the height of the verticals as 1
		Tree_lines[i] = new THREE.Mesh( new THREE.PlaneGeometry( 0.03,0.03 ), new THREE.MeshBasicMaterial({color:0x000000, transparent: true}) );
	Tree_lines[0].scale.y = 5.5; //the heights of the little things
	Tree_lines[2].scale.y = Tree_lines[0].scale.y;
	Tree_lines[3].scale.y = Tree_lines[0].scale.y;
	Tree_lines[5].scale.y = Tree_lines[0].scale.y;
	Tree_lines[6].scale.y = Tree_lines[0].scale.y;
	
	Tree_lines[2].position.x = Virus_chapter_icons[1].position.x; //linearly goes from
	
	for(var j = 4; j < 7; j++)
		Tree_lines[j].material.opacity = 0;
}

//maybe this should be called before anything in the loop
function update_tree()
{
	for(var i = 0; i < Virus_chapter_icons.length; i++)
	{
		if( Chapters_completed[i] )
		{
			if(delay_timer > 1.3)
			{
				Virus_chapter_icons[i].material.opacity -= 0.02;
				if( Virus_chapter_icons[i].material.opacity < 0.3 )
					Virus_chapter_icons[i].material.opacity = 0.3;
			}
		}
		else if(!Chapters_visible[i])
			Virus_chapter_icons[i].material.opacity = 0;
		else if( tree_zoomedness === 0 )
		{
			if(zika_introduction_animation > 1) //nothing fades in til this is done anyway
			{
				Virus_chapter_icons[i].material.opacity += 0.012;
				if( Virus_chapter_icons[i].material.opacity > 1 )
					Virus_chapter_icons[i].material.opacity = 1;
			}
			else if(i===3)
			{
				zika_introduction_animation += 0.014;
				var moving_chapters_x = Virus_chapter_icons.icon_spacing / 2 + Virus_chapter_icons.icon_spacing / 2 * move_smooth(1, zika_introduction_animation);
				Virus_chapter_icons[1].position.x =-moving_chapters_x;
				Virus_chapter_icons[2].position.x = moving_chapters_x;
				
				for(var j = 4; j < 7; j++)
					Tree_lines[j].material.opacity = zika_introduction_animation;
			}
		}
		Virus_chapter_icons[i].children[0].material.opacity = Virus_chapter_icons[i].material.opacity;
	}
	
	var tree_zoom_increment_amt = 0.6 * delta_t;
	
	var all_encompassing_camera_position = new THREE.Vector3();
	for( var i = 0; i < Virus_chapter_icons.length + 1; i++) //plus 1 because the averaging happens in there
	{
		if(Chapters_visible[i])
			all_encompassing_camera_position.add(Virus_chapter_icons[i].position); 
		else
		{
			all_encompassing_camera_position.multiplyScalar(1/i);
			all_encompassing_camera_position.z = min_cameradist;
			break;
		}
	}
	
	if( tree_zoomtowards === 666 ) //we've just come here
	{
		delay_timer += delta_t;
		if(delay_timer > 1.8)
		{
			tree_zoomedness -= tree_zoom_increment_amt;
			if( tree_zoomedness < 0)
				tree_zoomedness = 0;
		}
		
		var camera_destination = new THREE.Vector3();
		if( Story_states[Storypage-1].MODE === 666 )
			camera_destination.set( 0,0,min_cameradist );
		else {
			var previous_mode = 0;
			var lookback = 1;
			while( !( 1 <= previous_mode && previous_mode <= 4 ) )
			{
				previous_mode = Story_states[Storypage-lookback].MODE;
				lookback++;
				if(lookback === Storypage)
					console.error("no mode found for previous chapter");
			}
			camera_destination.set(
					Virus_chapter_icons[previous_mode - 1].position.x,
					Virus_chapter_icons[previous_mode - 1].position.y,
					IconDimension / Math.tan(vertical_fov / 2) / 2 );
		}
		
		camera.position.copy(all_encompassing_camera_position);
		camera.position.lerp(camera_destination, move_smooth(1, tree_zoomedness) );
	}
	else
	{
		tree_zoomedness += tree_zoom_increment_amt;
		if( tree_zoomedness > 1)
			tree_zoomedness = 1;
		
		camera.position.set(
				Virus_chapter_icons[tree_zoomtowards].position.x,
				Virus_chapter_icons[tree_zoomtowards].position.y,
				IconDimension/Math.tan(vertical_fov / 2) / 2 );
		camera.position.lerp(all_encompassing_camera_position, move_smooth(1, 1-tree_zoomedness) );
		
		//and if you're there?
		if( tree_zoomedness === 1 && ( Chapters_visible[3] === 0 || zika_introduction_animation >= 1 ) )
		{
			//skip to it being there, don't want to come back here and see it moving weirdly
			Chapters_completed[tree_zoomtowards] = 1;
			Chapter_highlighter.visible = false; //don't want it showing up next time
			ytplayer.seekTo(Chapter_start_times[tree_zoomtowards]);
			
			tree_zoomtowards = 666;
			
			delay_timer = 0;
		}
	}
	
	var hovering = 0;
	
	//for each you do, first check if it's in the scene
	for(var i = 0; i < Virus_chapter_icons.length; i++ )
	{
		if( !Chapters_visible[i] )
			continue;
		
		//for the time being, you can't repeat chapters. If you want to, we need to make a "back button", sooo... yeah, almost certainly fuck it
		if( Chapters_completed[i] )
			continue;
			
		var hack_icon_position = Virus_chapter_icons[i].position.clone();
		hack_icon_position.y -= camera.position.y;
		if( MousePosition.distanceTo(hack_icon_position) < IconDimension / 2 && ( Chapters_visible[3] === 0 || zika_introduction_animation >= 1 ) ) //the radius, we're modelling them as circles
		{
			//player has officially hovered
			Chapter_highlighter.position.set( Virus_chapter_icons[i].position.x, Virus_chapter_icons[i].position.y, 0.01 );
			
			Chapter_highlighter.visible = true;
			
			//and have they clicked?
			if(isMouseDown && !isMouseDown_previously)
			{
				tree_zoomtowards = i;
				
				//need to do this because if we leave it to youtube_story to update this then there'll be a missed frame
				VisibleSlide.material.map = Virus_chapter_icons[i].material.map;
				VisibleSlide.material.needsUpdate = true;
			}
			
			hovering = 1;
		}
	}
	if(hovering)
		Chapter_highlighter.visible = true;
	else
		Chapter_highlighter.visible = false;
	
	//brace across the top
	Tree_lines[1].scale.x = Math.abs( Tree_lines[2].position.x - Tree_lines[3].position.x ) / 0.03;
	Tree_lines[1].position.x = ( Tree_lines[2].position.x + Tree_lines[3].position.x ) / 2;
	Tree_lines[1].position.y = ( Virus_chapter_icons[0].position.y + IconDimension / 2 + Virus_chapter_icons[1].position.y - IconDimension / 2 - IconDimension / 3 * 0.4 ) / 2;
	
	//coming out of boca
	Tree_lines[0].position.y = Tree_lines[1].position.y + Tree_lines[0].scale.y * 0.03 / 2;
	
	//branches for HIV and the other branch
	Tree_lines[2].position.y = Tree_lines[1].position.y - Tree_lines[0].scale.y * 0.03 / 2;
	Tree_lines[3].position.y = Tree_lines[1].position.y - Tree_lines[0].scale.y * 0.03 / 2;
	Tree_lines[3].position.x = Virus_chapter_icons[2].position.x;
	
	//the two coming out of 4
	Tree_lines[5].position.x = Virus_chapter_icons[1].position.x;
	Tree_lines[5].position.y = Virus_chapter_icons[1].position.y + IconDimension / 2 + Tree_lines[5].scale.y * 0.03 / 2;
	Tree_lines[6].position.x = Tree_lines[2].position.x - (Virus_chapter_icons[1].position.x - Tree_lines[2].position.x);
	Tree_lines[6].position.y = Virus_chapter_icons[3].position.y + IconDimension / 2 + Tree_lines[5].scale.y * 0.03 / 2;
	
	//brace for polio and zia
	Tree_lines[4].scale.x = Math.abs( Tree_lines[5].position.x - Tree_lines[6].position.x ) / 0.03;
	Tree_lines[4].position.x = ( Tree_lines[5].position.x + Tree_lines[6].position.x ) / 2;
	Tree_lines[4].position.y = Tree_lines[2].position.y - (Tree_lines[1].position.y - Tree_lines[2].position.y);
	
	//might also be nice to have the split come from in the middle of the left branch. all three small branches start out half size and lengthen
}