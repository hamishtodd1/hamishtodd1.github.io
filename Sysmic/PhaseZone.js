/*
 * with the arrows, probably the thing to do is to work out the length of the longest arrow, then scale all to make that one reasonable
 * No, ideally it should tell you where the point would go next if it was there given delta_t
 * And if that looks unreasonable, then your parameters are unreasonable
 */

var PhaseZone;
var PhaseControlCursor;

var basearrow;
var PhaseZoneArrows;

var PhaseLine;
var PHASELINE_SEGMENTS = 1000;
var Phaseline_currentsegment = 0;

function set_vector_field()
{
	var where_youd_go = new THREE.Vector3();
	
	for(var i = 0; i < PhaseZoneArrows.length; i++)
	{
		var our_represented_state = get_specified_state(PhaseZoneArrows[i].position);
		
		var state_youd_go = GetNextState( our_represented_state.specifiedInfected,our_represented_state.specifiedResistant );
		where_youd_go.copy( get_phasezone_position( state_youd_go.y, state_youd_go.z) );
		
		
//		where_youd_go.sub(PhaseZoneArrows[i].position).multiplyScalar(0.01).add(PhaseZoneArrows[i].position);
		
		set_arrow(where_youd_go,PhaseZoneArrows[i]);
		
		PhaseZoneArrows[i].geometry.verticesNeedUpdate = true;
	}
}

function init_Phasezone()
{
	PhaseZone = new THREE.Object3D();
	PhaseZone.position.set( VIEWBOX_WIDTH + VIEWBOX_SPACING, VIEWBOX_HEIGHT + VIEWBOX_SPACING, 0);
	
	//-----Bounding box stuff
	var boundingtri_additional_width = 0.016;
	boundingtri = new THREE.Object3D();
	
	boundingtri.add( new THREE.Mesh(
			new THREE.Geometry(),
			new THREE.MeshBasicMaterial({color:0x000000}) ));
	
	boundingtri.children[0].geometry.vertices.push(
		new THREE.Vector3( -VIEWBOX_WIDTH * (1 + boundingbox_additional_width ) / 2,  VIEWBOX_HEIGHT * (1 + boundingbox_additional_width*3) / 2, 0 ),
		new THREE.Vector3( -VIEWBOX_WIDTH * (1 + boundingbox_additional_width ) / 2, -VIEWBOX_HEIGHT * (1 + boundingbox_additional_width) / 2, 0 ),
		new THREE.Vector3(  VIEWBOX_WIDTH * (1 + boundingbox_additional_width*3) / 2, -VIEWBOX_HEIGHT * (1 + boundingbox_additional_width) / 2, 0 )
	);
	boundingtri.children[0].geometry.faces.push( new THREE.Face3( 0, 1, 2 ) );
	
	boundingtri.add( new THREE.Mesh(
			new THREE.Geometry(),
			new THREE.MeshBasicMaterial({color:0xFFFFFF}) ));
	boundingtri.children[1].geometry.vertices.push(
		new THREE.Vector3( -VIEWBOX_WIDTH / 2,  VIEWBOX_HEIGHT / 2, 0 ),
		new THREE.Vector3( -VIEWBOX_WIDTH / 2, -VIEWBOX_HEIGHT / 2, 0 ),
		new THREE.Vector3(  VIEWBOX_WIDTH / 2, -VIEWBOX_HEIGHT / 2, 0 )
	);
	boundingtri.children[1].geometry.faces.push( new THREE.Face3( 0, 1, 2 ) );

	boundingtri.children[0].position.z =-0.01;
	boundingtri.children[1].position.z =-0.01;
	
	PhaseZone.add(boundingtri);
	
	//------Cursor and line
	PhaseControlCursor = new THREE.Mesh( 
			new THREE.CircleGeometry( 0.08, 32 ), 
			new THREE.MeshBasicMaterial( { color: 0xFFAAAA } ) );
	PhaseControlCursor.position.copy(get_phasezone_position(Infected,Resistant) );
	PhaseControlCursor.grabbed = 0;
	PhaseZone.add(PhaseControlCursor);
	
	PhaseLine = new THREE.LineSegments(new THREE.Geometry(), new THREE.LineBasicMaterial({color: PhaseControlCursor.material.color}) );
	for(var i = 0; i < PHASELINE_SEGMENTS; i++)
		PhaseLine.geometry.vertices.push(
				PhaseControlCursor.position.clone(),
				PhaseControlCursor.position.clone() );
	PhaseZone.add(PhaseLine);
	
	//--------arrows
	PhaseZoneArrows = Array();
	
	basearrow = new THREE.Mesh( new THREE.Geometry(), new THREE.MeshBasicMaterial({color: 0x000000}) );
	var full_length = 0.1;
	var head_length = full_length / 3;
	var head_width = head_length / (Math.sqrt(3) / 2); //equilateral triangle
	var body_width = head_width / 2.8; //gotten heuristically
	
	basearrow.geometry.vertices.push(
		new THREE.Vector3( 0,  full_length, 0 ),
		new THREE.Vector3( head_width / 2, full_length - head_length, 0 ),
		new THREE.Vector3(-head_width / 2, full_length - head_length, 0 )
	);
	basearrow.geometry.faces.push(new THREE.Face3(0,2,1));
	
	basearrow.geometry.vertices.push(
			new THREE.Vector3(-body_width / 2, full_length - head_length, 0 ),
			new THREE.Vector3( body_width / 2, full_length - head_length, 0 ),
			new THREE.Vector3(-body_width / 2, 0, 0 ),
			new THREE.Vector3( body_width / 2, 0, 0 )
		);
	basearrow.geometry.faces.push(new THREE.Face3(3,6,4));
	basearrow.geometry.faces.push(new THREE.Face3(5,6,3));
	
	//hmm maybe it the arrow should be centered? not what happens in phase portraits
	
	var arrow_spacing = VIEWBOX_WIDTH / 30;
	var num_wide = Math.round( VIEWBOX_WIDTH / arrow_spacing );
	var num_tall = Math.round( VIEWBOX_HEIGHT / arrow_spacing );
	var lowest_unused_arrow = 0;
	
	for(var i = 0; i <= num_wide; i++)
	{
		var i_position = i * arrow_spacing - VIEWBOX_WIDTH / 2;
		
		if(i_position > VIEWBOX_WIDTH / 2)
			continue;
		
		for(var j = 0; j <= num_tall; j++)
		{
			var j_position = j * arrow_spacing - VIEWBOX_HEIGHT / 2;
			if( j_position > VIEWBOX_HEIGHT / 2
			 || j_position * VIEWBOX_WIDTH / VIEWBOX_HEIGHT + i_position > 0 
			 )
				continue;
				
			PhaseZoneArrows[lowest_unused_arrow] = new THREE.Mesh( basearrow.geometry.clone(), basearrow.material.clone() );
			
			PhaseZoneArrows[lowest_unused_arrow].position.set(i_position,j_position,0); //and then never changed
			
			lowest_unused_arrow++;
		}
	}

	set_vector_field();
}

function set_arrow(pointtowards, ourarrow) 
{
	var vectortobesetto = new THREE.Vector2(
			pointtowards.x - ourarrow.position.x,
			pointtowards.y - ourarrow.position.y);
	var vectorAngle = vectortobesetto.angle() - TAU / 4;
	
	while( vectorAngle > TAU )
		vectorAngle -= TAU;
	while( vectorAngle < 0 )
		vectorAngle += TAU;
	
	ourarrow.rotation.z = vectorAngle;
//	ourarrow.scale.setScalar( vectortobesetto.length() );
	
	//move point in phase space, its line shows the future
	
	var redness = vectortobesetto.lengthSq() * 100;
	if(redness > 1)
		redness = 1;
	
	ourarrow.material.color.setRGB( redness,0,1-redness );
}

function update_Phasezone()
{
	var PhaseSpaceMousePosition = MousePosition.clone();
	PhaseSpaceMousePosition.sub(PhaseZone.position);
	
	if( Math.abs(PhaseSpaceMousePosition.x) < VIEWBOX_WIDTH / 2
		&& Math.abs(PhaseSpaceMousePosition.y) < VIEWBOX_HEIGHT / 2 
		&& isMouseDown && !isMouseDown_previously)
	{
		PhaseControlCursor.grabbed = 1;
	}

	if(!isMouseDown)
		PhaseControlCursor.grabbed = 0;
	
	if( PhaseControlCursor.grabbed )
	{
		SpecifiedState = get_specified_state(PhaseSpaceMousePosition);
		
		if(SpecifiedState.specifiedInfected < 0)
			SpecifiedState.specifiedInfected = 0;
		if(SpecifiedState.specifiedResistant < 0)
			SpecifiedState.specifiedResistant = 0;
		
		if(SpecifiedState.specifiedResistant + SpecifiedState.specifiedInfected > Population)
		{
			var populationLine = new THREE.Line3(new THREE.Vector3(0,Population,0),new THREE.Vector3(Population,0,0));
			var specifiedPoint = new THREE.Vector3(SpecifiedState.specifiedResistant,SpecifiedState.specifiedInfected,0);
			var clampedPoint = populationLine.closestPointToPoint(specifiedPoint, true);
			SpecifiedState.specifiedResistant = clampedPoint.x;
			SpecifiedState.specifiedInfected = clampedPoint.y;
		}
		
		PhaseControlCursor.position.copy(
			get_phasezone_position(
				SpecifiedState.specifiedInfected,
				SpecifiedState.specifiedResistant) );
		
		for(var i = 0; i < PhaseLine.geometry.vertices.length; i++)
			PhaseLine.geometry.vertices[i].copy(PhaseControlCursor.position);
		
		if(SpecifiedState.specifiedInfected !== Infected || SpecifiedState.specifiedResistant !== Resistant )
		{
			Infected = SpecifiedState.specifiedInfected;
			Resistant = SpecifiedState.specifiedResistant;
			
			reset_graph();
		}
	}
	else
	{
		var newState = GetNextState( Infected,Resistant );
		
		Infected = newState.y;
		Resistant = newState.z;
		
		PhaseControlCursor.position.copy( get_phasezone_position(Infected,Resistant) );
		
		PhaseLine.geometry.vertices[Phaseline_currentsegment * 2 + 1].copy(PhaseControlCursor.position);
		
		if(Phaseline_currentsegment !== 0)
			PhaseLine.geometry.vertices[Phaseline_currentsegment * 2 + 0].copy(PhaseLine.geometry.vertices[Phaseline_currentsegment * 2 - 1]);
		else
			PhaseLine.geometry.vertices[Phaseline_currentsegment * 2 + 0].copy(PhaseLine.geometry.vertices[PhaseLine.geometry.vertices.length - 1]);
		PhaseLine.geometry.verticesNeedUpdate = true;
		
		Phaseline_currentsegment++;
		if(Phaseline_currentsegment === PHASELINE_SEGMENTS)
			Phaseline_currentsegment = 0;
	}
}

function get_phasezone_position(ourInfected, ourResistant)
{
	var returnedposition = new THREE.Vector3();
	
	returnedposition.y = ourInfected / Population;
	returnedposition.x = ourResistant / Population;
	
	returnedposition.x *= VIEWBOX_WIDTH;
	returnedposition.y *= VIEWBOX_HEIGHT;
	
	returnedposition.x -= VIEWBOX_WIDTH / 2;
	returnedposition.y -= VIEWBOX_HEIGHT/ 2;
	
	return returnedposition;
}

function get_specified_state(position_on_graph)
{	
	var returnedstate = {
		specifiedResistant:position_on_graph.x,
		specifiedInfected: position_on_graph.y
	};
	
	returnedstate.specifiedResistant += VIEWBOX_WIDTH / 2;
	returnedstate.specifiedInfected  += VIEWBOX_HEIGHT/ 2;
	
	returnedstate.specifiedResistant /= VIEWBOX_WIDTH;
	returnedstate.specifiedInfected  /= VIEWBOX_HEIGHT;
	
	returnedstate.specifiedResistant *= Population;
	returnedstate.specifiedInfected  *= Population;
	
	return returnedstate;
}

function sq(n)
{
	return n*n;
}