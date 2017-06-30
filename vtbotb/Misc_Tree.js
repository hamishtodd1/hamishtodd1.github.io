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

var Chapters_visible = Array(1,1,1,0,1);
var Chapters_completed = Array(1,0,0,0,0); //first has been done by definition, for the time being at least

var zika_introduction_animation = 0;

var Virus_chapter_icons = Array(5);
var Virus_chapter_names = Array(5);

var delay_timer = 0;

//everything you decide about this is temporary, but: dark blue circle, quite transparent
var Chapter_highlighter;

var IconDimension = playing_field_dimension * 0.225 * 2/3;

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
	
	for(var i = 0; i < treeBranches.length; i++)
		scene.add(treeBranches[i]);
	
	/*
	 * opacity of branches depends on whether the chapter associated with them is complete.
	 * Sheree sends you tree, cut it up into branches associated to the different chapters.
	 * exceptional branch: zika, which can come in when either is done
	 * No need to position the hiders, just make them a pic with the same dimensions as the branches pictures
	 * Take images of the virus chapters and make them look highlighted and fade to those on top of the non highlighted pictures
	 * 
	 * Aaaaaaand take a picture of it for the "images of some other viruses" preview
	 */
	
	scene.add(Chapter_highlighter);
}

function init_tree()
{
	Chapter_highlighter = new THREE.Mesh( 
			new THREE.CircleGeometry( IconDimension / 2, 32 ), 
			new THREE.MeshBasicMaterial( { transparent: true, opacity: 0.3, color: 0x0000ff } ) );
	Chapter_highlighter.position.z = 0.01;
	Chapter_highlighter.position.y = playing_field_dimension;
	
	for(var i = 0; i < treeViruses.length; i++)
	{
		treeViruses[i] = new THREE.Mesh( new THREE.PlaneGeometry( IconDimension, IconDimension ), new THREE.MeshBasicMaterial({transparent: true}) );
		if(i < Virus_chapter_icons.length)
			Virus_chapter_icons[i] = treeViruses[i];
	}
	
	var name_dimension = IconDimension / 3;
	for(var i = 0; i < treeViruses.length; i++)
	{	
		Virus_chapter_names[i] = new THREE.Mesh( new THREE.CubeGeometry(name_dimension, name_dimension, 0),
				  new THREE.MeshBasicMaterial( { transparent: true, opacity: 0 } ) );
		
		treeViruses[i].add(Virus_chapter_names[i]);
		
		Virus_chapter_names[i].position.y -= IconDimension / 2;
		Virus_chapter_names[i].position.y -= name_dimension / 4;
		Virus_chapter_names[i].position.z -= 0.01;
	}
	
	var fullTreeSize = IconDimension * 17.5;
	for(var i = 0; i < treeBranches.length; i++)
	{
		treeBranches[i] = new THREE.Mesh( new THREE.CubeGeometry(fullTreeSize,fullTreeSize, 0),
						new THREE.MeshBasicMaterial({transparent:true}) );
		treeBranches[i].position.set(0,0, -0.02);
		
		treeBranches[i].material.opacity = 0;
	}
	treeBranches[4].position.z = treeBranches[3].position.z + 0.01;
	
	//somewhere between max and min
	Virus_chapter_icons[0].position.set(-1.2275910098644418, 	-7.081533028015544, 0 ); //boca
	Virus_chapter_icons[1].position.set( 0.33847159531241794, -1.49927761278835, 0 ); //Polio
	Virus_chapter_icons[2].position.set( -3.2, -3.8, 0 ); //HIV
	Virus_chapter_icons[3].position.set(1.9045342004892776,		-3.469485406397948, 0 ); //Zika
	Virus_chapter_icons[4].position.set(2,		-7.081533028015544, 0 ); //Measles

	for(var i = 0; i < Virus_chapter_icons.length; i++)
	{
		Virus_chapter_icons[i].position.multiplyScalar(2/3)
	}
	
	for(var i = Virus_chapter_icons.length; i < treeViruses.length; i++)
	{	
		if( i -Virus_chapter_icons.length < 9)
			treeViruses[i].parentVirus = 1;
		else if( i -Virus_chapter_icons.length < 12)
			treeViruses[i].parentVirus = 2;
		else if( i -Virus_chapter_icons.length < 14)
			treeViruses[i].parentVirus = 3;
	}	
}

//maybe this should be called before anything in the loop
function update_tree()
{
	var fadedOpacity = 0.3;
	
	for(var i = 0; i < Virus_chapter_icons.length; i++)
	{
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
		
		Virus_chapter_icons[i].children[0].material.opacity = Virus_chapter_icons[i].material.opacity;
	}
	
	
	if( !Chapters_completed[3] )
		treeBranches[4].material.opacity = Virus_chapter_icons[3].material.opacity;

	{
		for(var i = 0; i < 4; i++)
		{
			if( Chapters_completed[i] )
				treeBranches[i].material.opacity += 0.02;
			if(treeBranches[i].material.opacity > fadedOpacity)
				treeBranches[i].material.opacity = fadedOpacity;
		}
		
		for(var i = Virus_chapter_icons.length; i < treeViruses.length; i++)
		{
			if( Chapters_completed[ treeViruses.parentVirus] )
				treeViruses[i].material.opacity += 0.02;
			if(treeViruses[i].material.opacity > 1 )
				treeViruses[i].material.opacity = 1;
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
			all_encompassing_camera_position.z = min_cameradist; //hack
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
			Chapter_highlighter.visible = false;
			
			ytplayer.changeChapter(tree_zoomtowards);
			
			tree_zoomtowards = 999;
			
			delay_timer = 0;
		}
	}
	
	var hovering = 0;
	
	//------------------Mouse stuff
	for(var i = 0; i < Virus_chapter_icons.length; i++ )
	{
		if( !Chapters_visible[i] )
			continue;
		
		//for the time being, you can't repeat chapters. If you want to, we need to make a "back button", sooo... yeah, almost certainly fuck it
		if( Chapters_completed[i] )
			continue;
		
		if( MousePosition.distanceTo(Virus_chapter_icons[i].position) < IconDimension / 2 ) //the radius, we're modelling them as circles
		{
			//player has officially hovered
			Chapter_highlighter.position.set( Virus_chapter_icons[i].position.x, Virus_chapter_icons[i].position.y, 0.01 );
			
			Chapter_highlighter.visible = true;
			
			//and have they clicked?
			if(isMouseDown && !isMouseDown_previously)
			{
				tree_zoomtowards = i;
			}
			
			hovering = 1;
		}
	}
	if(hovering)
		Chapter_highlighter.visible = true;
	else
		Chapter_highlighter.visible = false;
}