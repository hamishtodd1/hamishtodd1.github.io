//probably needs a square grid

var ParameterZone;
var ParameterControlCursor;

var SliderShape;

var MAX_Infectiousness = 5; //or whatever
var MAX_RecoveryTime = 5;
var MIN_Infectiousness = 0.001; //or whatever
var MIN_RecoveryTime = 0.001;

//no, the best thing to do is have the point stay with you, but be as close as possible to your finger!

function init_parameterzone()
{
	ParameterZone = new THREE.Object3D();
	
	ParameterZone.add(boundingbox.clone());
	
	ParameterControlCursor = new THREE.Mesh( 
			new THREE.CircleGeometry( 0.08, 32 ), 
			new THREE.MeshBasicMaterial( { color: 0xAAAAFF } ) );
	ParameterControlCursor.position.z = 0.01;
	ParameterZone.add(ParameterControlCursor);
	
	update_Infectiousness_and_RecoveryTime();
	
	ParameterZone.position.x = (VIEWBOX_WIDTH + VIEWBOX_SPACING);
	
	SliderShape = new THREE.Mesh( 
			new THREE.CubeGeometry(VIEWBOX_WIDTH * 0.986, VIEWBOX_HEIGHT / 55, 0),
			new THREE.MeshBasicMaterial( { color: 0xAAAAAA } ) );
	SliderShape.position.z = ParameterControlCursor.position.z / 5;
	ParameterZone.add(SliderShape);
	
	ParameterControlCursor.grabbed = 0;
	
	update_Infectiousness_and_RecoveryTime()
	
	ParameterZone.slidermode = 1;
}

function update_parameterzone()
{
	var ParameterSpaceMousePosition = MousePosition.clone();
	ParameterSpaceMousePosition.sub(ParameterZone.position);
	
	if( Math.abs(ParameterSpaceMousePosition.x) < VIEWBOX_WIDTH / 2
		&& Math.abs(ParameterSpaceMousePosition.y) < VIEWBOX_HEIGHT / 2 
		&& isMouseDown && !isMouseDown_previously)
	{
		ParameterControlCursor.grabbed = 1;
	}

	if(!isMouseDown)
		ParameterControlCursor.grabbed = 0;
	
	if( ParameterControlCursor.grabbed )
	{
		ParameterControlCursor.position.copy(ParameterSpaceMousePosition);
		
		if(ParameterZone.slidermode)
		{
			ParameterControlCursor.position.y = 0; //confined to slider
			//also might want to have a specific infectiousness level here.
		}

		reset_CA(1); //one sick
		update_Infectiousness_and_RecoveryTime();
		
		//Do viruses drastically change parameters while infecting a population?
		//Probably no, so you should comment this out, taking away the line, and even clear the graph. But it's fun!
//		for(var i = 0; i < PhaseLine.geometry.vertices.length; i++)
//			PhaseLine.geometry.vertices[i].copy(PhaseControlCursor.position);
		
		//also reset vector field
		set_vector_field();
	}
	
	if(ParameterZone.slidermode)
		SliderShape.visible = true;
	else
		SliderShape.visible = false;
}

function update_Infectiousness_and_RecoveryTime()
{
	var proportionalposition = ParameterControlCursor.position.clone();
	proportionalposition.x += VIEWBOX_WIDTH / 2;
	proportionalposition.y += VIEWBOX_HEIGHT/ 2;
	
	proportionalposition.x /= VIEWBOX_WIDTH;
	proportionalposition.y /= VIEWBOX_HEIGHT;
	
	if(proportionalposition.x < 0)
		proportionalposition.x = 0;
	if(proportionalposition.x > 1)
		proportionalposition.x = 1;
	if(proportionalposition.y < 0)
		proportionalposition.y = 0;
	if(proportionalposition.y > 1)
		proportionalposition.y = 1;
	
	Infectiousness =MIN_Infectiousness+ (MAX_Infectiousness - MIN_Infectiousness ) * proportionalposition.y;
	RecoveryTime = 	MIN_RecoveryTime  + (MAX_RecoveryTime   - MIN_RecoveryTime   ) * proportionalposition.x; //because we think of time as going to the right
	CA_Infectiousness = proportionalposition.y * default_CA_Infectiousness * 2;
	CA_RecoveryTime   = proportionalposition.x * default_CA_RecoveryTime * 2;
	
	proportionalposition.x *= VIEWBOX_WIDTH;
	proportionalposition.y *= VIEWBOX_HEIGHT;
	
	proportionalposition.x -= VIEWBOX_WIDTH / 2;
	proportionalposition.y -= VIEWBOX_HEIGHT / 2;
	
	ParameterControlCursor.position.copy(proportionalposition);
}

function set_vector_field()
{
	var where_youd_go = new THREE.Vector3();
	
	for(var i = 0; i < PhaseZoneArrows.length; i++)
	{
		var our_represented_state = get_specified_state(PhaseZoneArrows[i].position);
		where_youd_go.copy( PhaseZoneArrows[i].position );
//		where_youd_go.copy(get_phasezone_position(
//				GetNextInfected(our_represented_state.specifiedInfected),
//				GetNextResistant(our_represented_state.specifiedResistant) ) );
		
		set_arrow(where_youd_go,PhaseZoneArrows[i]);
		
		PhaseZoneArrows[i].geometry.verticesNeedUpdate = true;
	}
}