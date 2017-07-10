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
var Virus_chapter_highlights = Array(4);

var delay_timer = 0;

var IconDimension = 1.4;

var tree_zoomedness = 1;
var tree_zoomtowards = 999;

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
	
//	for(var i = 0; i < treeBranches.length; i++)
//		scene.add( treeBranches[i] );
	
	/*
	 * opacity of branches depends on whether the chapter associated with them is complete.
	 * Sheree sends you tree, cut it up into branches associated to the different chapters.
	 * exceptional branch: zika, which can come in when either is done
	 * No need to position the hiders, just make them a pic with the same dimensions as the branches pictures
	 * Take images of the virus chapters and make them look highlighted and fade to those on top of the non highlighted pictures
	 * 
	 * Aaaaaaand take a picture of it for the "images of some other viruses" preview
	 */
}

function init_tree()
{
	var name_dimension = IconDimension / 3 * 1.8;
	for(var i = 0; i < Virus_chapter_icons.length; i++)
	{
		var hackMultiplier = i ? 0.93 : 1024 / 720;
		Virus_chapter_icons[i] = new THREE.Mesh( new THREE.PlaneGeometry( IconDimension*hackMultiplier, IconDimension*hackMultiplier ), new THREE.MeshBasicMaterial({transparent: true}) );
		
		if( i )
		{
			Virus_chapter_highlights[i-1] = new THREE.Mesh( new THREE.PlaneGeometry( IconDimension*0.9, IconDimension*0.9 ), new THREE.MeshBasicMaterial({transparent: true, opacity:0}) );
			Virus_chapter_highlights[i-1].position.z = 0.01;
			Virus_chapter_icons[i].add(Virus_chapter_highlights[i-1]);
		}
		
		Virus_chapter_names[i] = new THREE.Mesh( new THREE.CubeGeometry(name_dimension, name_dimension, 0),
				  new THREE.MeshBasicMaterial( { transparent: true, opacity: 1 } ) );
		
		Virus_chapter_names[i].position.y = -0.64;
		Virus_chapter_names[i].position.z = 0.01;
		
		Virus_chapter_icons[i].add(Virus_chapter_names[i]);
	}
	
//	Virus_chapter_icons[0].scale.setScalar( 1024/720*0.6 );
//	Virus_chapter_icons[3].scale.setScalar( 1024/720 );
	

	for(var i = 0; i < Virus_chapter_icons.length; i++)
	{
		Virus_chapter_icons[i].position.copy(getCorrectTreePosition(i));
	}
}

function getCorrectTreePosition(iconIndex)
{
	var numVisible = 0;
	for(var i = 0; i < Virus_chapter_icons.length; i++)
	{
		if( Chapters_completed[i] )
			numVisible += 1;
		else
			numVisible += Virus_chapter_icons[i].material.opacity;
	}
	
	var circleRadius = 1.4;
	
	var correctPosition = new THREE.Vector3(0,circleRadius,0);
	correctPosition.applyAxisAngle( z_central_axis, iconIndex * TAU / numVisible );
	
	return correctPosition;
}

//maybe this should be called before anything in the loop
function update_tree()
{
	var fadedOpacity = 0.2;
	
	for(var i = 0; i < Virus_chapter_icons.length; i++)
	{
		Virus_chapter_icons[i].position.copy(getCorrectTreePosition(i));
		
		if( Chapters_completed[i] )
		{
			if(delay_timer > 1.3)
			{
				Virus_chapter_icons[i].material.opacity -= 0.02;
				if( Virus_chapter_icons[i].material.opacity < fadedOpacity )
					Virus_chapter_icons[i].material.opacity = fadedOpacity;
			}
		}
		else if(!Chapters_visible[i])
			Virus_chapter_icons[i].material.opacity = 0;
		
		if( Chapters_visible[i] && tree_zoomedness === 0 )
		{
			Virus_chapter_icons[i].material.opacity += 0.02;
			if(Virus_chapter_icons[i].material.opacity > 1)
				Virus_chapter_icons[i].material.opacity = 1;
		}
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
	
	//--------------Camera movement
	if( tree_zoomtowards === 999 ) //we've just come here
	{
		delay_timer += delta_t;
		if(delay_timer > 1.8)
		{
			tree_zoomedness -= tree_zoom_increment_amt;
			if( tree_zoomedness < 0)
				tree_zoomedness = 0;
		}
		
		var camera_destination = new THREE.Vector3();
		if( Story_states[Storypage-1].MODE === 999 )
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
		if( tree_zoomedness === 1 )
		{
			//skip to it being there, don't want to come back here and see it moving weirdly
			Chapters_completed[tree_zoomtowards] = 1;
			
			ytplayer.changeChapter(tree_zoomtowards);
			
			tree_zoomtowards = 999;
			
			delay_timer = 0;
		}
	}
	
	//------------------Mouse stuff
	for(var i = 1; i < Virus_chapter_icons.length; i++ )
	{
		if( !Chapters_visible[i] )
			continue;
		
		if( Chapters_completed[i] )
			continue;
		
		if( MousePosition.distanceTo(Virus_chapter_icons[i].position) < IconDimension / 2 )
		{
			//player has officially hovered
			Virus_chapter_highlights[i-1].material.opacity = 1;
			
			//and have they clicked?
			if(isMouseDown && !isMouseDown_previously)
			{
				tree_zoomtowards = i;
			}
		}
		else
		{
			Virus_chapter_highlights[i-1].material.opacity = 0;
		}
	}
	
	if(tree_zoomedness !== 0)
	{
		for(var i = 0; i < Virus_chapter_highlights.length; i++ )
		{
			Virus_chapter_highlights[i].material.opacity = 0;
		}
	}
	
	for(var i = 0; i < Virus_chapter_names.length; i++)
		Virus_chapter_names[i].material.opacity = Virus_chapter_icons[i].material.opacity;
}