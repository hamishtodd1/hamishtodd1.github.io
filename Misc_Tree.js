/*
* You could have all the ones that are possible in each model come out of them. 
* 		Make sure that once they're there, clicking on that model again highlights the whole group

You need a "selector". Get a UI person to design it for you. Until then have a big blue ball behind them

Should the user be able to select the same virus again?
* 
     bocavirus
    _____|____________________________
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

var Zika_visible = 0;
var Measles_visible = 0;

var Zika_children_visible = 0;
var hepatitis_children_visible = 0;
var HIV_children_visible = 0;

var chapter_highlighted = 0;

//everything you decide about this is temporary, but: dark blue circle, quite transparent
var chapter_highlight;

function init_tree()
{
	//You should probably "generate" the tree in case you want to change things. Just a bunch of plane geometries

	//create the highlighter
	
	//create the virus pictures and their labels
	//create the hiders
}

//maybe this should be called before anything in the loop
function update_tree()
{
	for(var i = 0; i < Virus_chapter_selectors.length; i++ )
	{
		//for the time being, you can't repeat chapters. If you want to, we need to make a "back button"
		//you might also need to make bocavirus clickable
		if((i === CK_MODE && hepatitis_children_visible )
		||( i === IRREGULAR_MODE_MODE && HIV_children_visible )
		||( i === QS_MODE && ( Zika_children_visible || !Zika_visible ) )
		||( i === ENDING_MODE && !Measles_visible ) 
		||  i === NOTHING_MODE )
			continue;
			
		//mouse distance from their centers
		if( MousePosition.distanceTo(Virus_chapter_selectors[i].position) )
		{			
			chapter_highlighted = i;
			
			if(isMouseDown && !isMouseDown_previously)
			{
				if(chapter_highlighted === CK_MODE )
					hepatitis_children_visible = 1;
				if(chapter_highlighted === IRREGULAR_MODE )
					HIV_children_visible = 1;
				if(chapter_highlighted === QS_MODE )
					Zika_children_visible = 1;
				
				//maybe it should be as simple as changing the time of the video and letting everything react up to that?
				
			}
		}
	}
	//note: video must be paused in tree mode, even if they try to unpause it!
	
	//what is it that triggers a change to the visibility variables?
	
	var highlight_displacement_from_dest = Virus_chapter_selectors[chapter_highlighted].position.clone();
	highlight_displacement_from_dest.sub( chapter_highlight.position );
	var highlight_movement_speed = 0.05;
	if(highlight_displacement_from_dest.length() < highlight_movement_speed )
		chapter_highlight.position.copy( Virus_chapter_selectors[chapter_highlighted].position );
	else
	{
		highlight_displacement_from_dest.setLength(highlight_movement_speed);
		chapter_highlight.position.add( highlight_displacement_from_dest );
	}

	if(Zika_children_visible)
		//move the blocker out of the way
		//or maybe the blocker should fade out?
}