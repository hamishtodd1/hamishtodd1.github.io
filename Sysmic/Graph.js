/*
 * would be nice to have a little alpha comb for them to appear through
 * 
 * you want them moving, giving the impression of movement. Movement is cognitively easier than change.
 * also zoom in and out on graph? Grab a point, can take it where you like, both axes
 * That requires that the cutoff be variable. Set it to some maximum, forget about it being a particular absolute position
 * Actually if you think about it they're decreasing or increasing the fidelity.
 * Therefore you should have the max number for a timestep, and then make some of them invisible on everything but the max fidelity
 * there again maybe it would feel nice to be aware of what your computer is doing
 * You could make it so that they are gone forever
 * 
 * sick on the bottom deffo
 * susceptible on top might give the best read-off, but in the middle might be most intuitive
 * we'll go for susceptible in middle
 * Though hey, you can go from susceptible to sick and then to resistant, but not other ways. Maybe they should be stacked that way?
 */

//measured in faces
var GRAPH_HEIGHT_IN_FACES = 36; //a square number, for the grid
var face_width = VIEWBOX_HEIGHT / GRAPH_HEIGHT_IN_FACES;
var GRAPH_USED_WIDTH_IN_FACES = Math.round( VIEWBOX_WIDTH / face_width );

var displayed_faces = Array(GRAPH_HEIGHT_IN_FACES * GRAPH_USED_WIDTH_IN_FACES); //soon to be * width

var Graph;

function update_graph()
{
	//
	if( !PhaseControlCursor.grabbed )
	{
		var faceopacity;
		var fade_in_dist = face_width * 1.6;
		//go through each column and move them to the left. If one has disappeared off to the side, bring it back around and update it
		for(var i = 0; i < GRAPH_USED_WIDTH_IN_FACES; i++)
		{
			//change the x of the first one
			displayed_faces[i*GRAPH_HEIGHT_IN_FACES].position.x -= 0.01; //guess
			
			if(displayed_faces[i*GRAPH_HEIGHT_IN_FACES].position.x < -VIEWBOX_WIDTH / 2 )
				set_column(i);
			else
				for(var j = 0; j < GRAPH_HEIGHT_IN_FACES; j++)
					displayed_faces[i*GRAPH_HEIGHT_IN_FACES+j].position.x = displayed_faces[i*GRAPH_HEIGHT_IN_FACES].position.x;
			
			//fade out
			if( displayed_faces[i*GRAPH_HEIGHT_IN_FACES].position.x + VIEWBOX_WIDTH / 2 < fade_in_dist )
				faceopacity = ( displayed_faces[i*GRAPH_HEIGHT_IN_FACES].position.x + VIEWBOX_WIDTH / 2 ) / fade_in_dist;
			else if( VIEWBOX_WIDTH / 2 - displayed_faces[i*GRAPH_HEIGHT_IN_FACES].position.x < fade_in_dist
			 && displayed_faces[i*GRAPH_HEIGHT_IN_FACES].material.opacity !== 1) //if it's already opaque, i.e. if it's the very first
			{
				faceopacity = ( VIEWBOX_WIDTH / 2 - displayed_faces[i*GRAPH_HEIGHT_IN_FACES].position.x ) / fade_in_dist;
			}
			else
				faceopacity = 1;
			
			for(var j = 0; j < GRAPH_HEIGHT_IN_FACES; j++)
				displayed_faces[i*GRAPH_HEIGHT_IN_FACES+j].material.opacity = faceopacity;
		}
	}
}

function reset_graph()
{
	//first one is exceptional. It is set to the state you specify, and it does not fade in
	set_column(0);
	for(var j = 0; j < GRAPH_HEIGHT_IN_FACES; j++)
		displayed_faces[j].material.opacity = 1;
	
	for(var i = 1; i < GRAPH_USED_WIDTH_IN_FACES; i++)
	{
		for(var j = 0; j < GRAPH_HEIGHT_IN_FACES; j++)
		{
			displayed_faces[i*GRAPH_HEIGHT_IN_FACES+j].position.x = displayed_faces[j].position.x - i * face_width;
			
			displayed_faces[i*GRAPH_HEIGHT_IN_FACES+j].material.map = emojiitextures[0]; //absent
		}
	}
}

function set_column(column)
{
	var individual_sick_faces = Infected / Population * GRAPH_HEIGHT_IN_FACES;
	individual_sick_faces = Math.round(individual_sick_faces);
	var individual_resistant_faces = Resistant / Population * GRAPH_HEIGHT_IN_FACES;
	individual_resistant_faces = Math.round(individual_resistant_faces);
	
	for(var j = 0; j < GRAPH_HEIGHT_IN_FACES; j++)
	{
		displayed_faces[column*GRAPH_HEIGHT_IN_FACES+j].position.x = VIEWBOX_WIDTH / 2;
		
		//going up from the bottom
		if( j < individual_sick_faces )
		{
			displayed_faces[column*GRAPH_HEIGHT_IN_FACES+j].material.map = emojiitextures[EMOJII_SICK];
		}
		else if( j >= GRAPH_HEIGHT_IN_FACES - individual_resistant_faces )
		{
			displayed_faces[column*GRAPH_HEIGHT_IN_FACES+j].material.map = emojiitextures[EMOJII_RESISTANT];
		}
		else
		{
			displayed_faces[column*GRAPH_HEIGHT_IN_FACES+j].material.map = emojiitextures[EMOJII_SUSCEPTIBLE];
		}
	}
}

function init_graph()
{
	var faceindex;
	
	Graph = new THREE.Object3D();
	Graph.angle_from_y_axis = 0; 
	Graph.add(boundingbox.clone());
	
	for(var i = 0; i < GRAPH_USED_WIDTH_IN_FACES; i++)
	{
		for(var j = 0; j < GRAPH_HEIGHT_IN_FACES; j++)
		{
			displayed_faces[i*GRAPH_HEIGHT_IN_FACES+j] = new THREE.Mesh(
					new THREE.CubeGeometry(face_width, face_width, 0),
					new THREE.MeshBasicMaterial({transparent: true}) );
			displayed_faces[i*GRAPH_HEIGHT_IN_FACES+j].position.y = -VIEWBOX_HEIGHT / 2 + j * face_width + face_width / 2;
				
			Graph.add( displayed_faces[i*GRAPH_HEIGHT_IN_FACES+j] );
		}
	}
	
	//horizontal positions and textures
	reset_graph();
	
	Graph.position.set(0,VIEWBOX_HEIGHT + VIEWBOX_SPACING,0);
}