/*
 * TODO
 * 
 * -put 12 extra proteins in, one at each dodeca face
 * -put them at their actual centers
 * -find 72 points in a disc at random positions that aren't too close together.
 * -Send them to those. But by what paths? Must be decided at runtime. Iterate through each point and choose the closest protein that hasn't already been chosen
 * 
 * -reposition lights
 * -cell shading?
 * 
 */

var actual_protein_location;
var boca_piece_destinations;

var flash_colors;

//these get set in youtube story
var flash_time = 0;
var unflash_time = 0;

var movement_duration = 0;
var pullback_start_time = 0;
var cell_move_time = 0;
var boca_explosion_start_time = 0;
var new_pieces_appearance_time = 0;
var whole_thing_finish_time = 0;

function update_bocavirus() {
	//-------camera Story stuff
	if( our_CurrentTime < pullback_start_time || whole_thing_finish_time < our_CurrentTime)
		EggCell.visible = false;
	else
		EggCell.visible = true;
	
	var cell_eaten_bocavirus_position = new THREE.Vector3( EggCell_initialposition.x - ( EggCell_initialposition.x - EggCell_radius ) * 2, 0, 0);
	EggCell.position.copy( move_smooth_vectors( EggCell_initialposition, cell_eaten_bocavirus_position, movement_duration, our_CurrentTime - cell_move_time ) );
	
	var rightmost_visible_x = EggCell_initialposition.x + EggCell_radius;
	var leftmost_visible_x = cell_eaten_bocavirus_position.x - EggCell_radius;
	var CEPx = ( rightmost_visible_x + leftmost_visible_x ) / 2;
	var CEPz = ( rightmost_visible_x - leftmost_visible_x ) / 2 / Math.tan( camera.fov / 360 * TAU / 2 );
	var Cell_virus_visible_position = new THREE.Vector3( CEPx, 0, CEPz );
	
	if( our_CurrentTime < pullback_start_time + movement_duration )
		camera.position.copy( move_smooth_vectors(camera_default_position, Cell_virus_visible_position, movement_duration, our_CurrentTime - pullback_start_time) );
	else if( our_CurrentTime < whole_thing_finish_time )
		camera.position.copy(Cell_virus_visible_position);
	else
		camera.position.copy( camera_default_position );
	
	//-------Rotation
	if( boca_explosion_start_time > our_CurrentTime || our_CurrentTime > whole_thing_finish_time )
	{
		if(isMouseDown) {
			bocavirus_MovementAngle = Mouse_delta.length() / 3;
			bocavirus_MovementAxis.set(-Mouse_delta.y, Mouse_delta.x, 0);
			bocavirus_MovementAxis.normalize();
			
			if( !Mouse_delta.equals( new THREE.Vector3() ) && rotation_understanding % 2 === 0 )
				rotation_understanding++;
		}
		else {
			bocavirus_MovementAngle *= 0.93;
		}
		if(!isMouseDown && rotation_understanding % 2 === 1)
			rotation_understanding++;
		
		var neo_bocavirus_axis = new THREE.Vector3();
		for(var i = 0; i < 60; i++) //the center ones don't need rotating
		{
			neo_bocavirus_proteins[i].updateMatrixWorld();
			neo_bocavirus_axis.copy(bocavirus_MovementAxis);
			neo_bocavirus_proteins[i].worldToLocal(neo_bocavirus_axis);
			neo_bocavirus_axis.normalize();
			neo_bocavirus_proteins[i].rotateOnAxis(neo_bocavirus_axis, bocavirus_MovementAngle);
			neo_bocavirus_proteins[i].updateMatrixWorld();
		}
	}
	
	for(var i = 0; i < neo_bocavirus_proteins.length; i++ )
		neo_bocavirus_proteins[i].update_actual_location();
	
	//something random for the inner ones
	neo_bocavirus_proteins[60].quaternion.set(0.5000000020519008,0.8090169946743156,0.30901699027114626,0);
	neo_bocavirus_proteins[61].quaternion.set(-0.8090169559438056,0.3090169674858798,0.49999996515151934,0);
	neo_bocavirus_proteins[62].quaternion.set(0.49999999272583795,0.4999999985821715,-0.5,0.5000000031703612);
	neo_bocavirus_proteins[63].quaternion.set(0.8090170066863513,-0.5000000025362885,0,0.30901698773485736);

	//-------Colors
	var fadeto_time = 0.66;
	var fadeback_time = fadeto_time;
	var coloredness;
	if( our_CurrentTime < flash_time )
		coloredness = 0;
	else if( our_CurrentTime < flash_time + fadeto_time )
		coloredness = (our_CurrentTime - flash_time) / fadeto_time;
	else if( our_CurrentTime < unflash_time )
		coloredness = 1;
	else if( our_CurrentTime < unflash_time + fadeback_time )
		coloredness = 1 - ( our_CurrentTime - unflash_time ) / fadeback_time;
	else
		coloredness = 1;
	var default_r = 1;
	var default_g = 1;
	var default_b = 0;
	for(var i = 0; i < neo_bocavirus_proteins.length; i++)
	{
		var our_r = coloredness * flash_colors[i][0] + (1-coloredness) * default_r;
		var our_g = coloredness * flash_colors[i][1] + (1-coloredness) * default_g;
		var our_b = coloredness * flash_colors[i][2] + (1-coloredness) * default_b;
		
		neo_bocavirus_proteins[i].material.color.r = our_r;
		neo_bocavirus_proteins[i].material.color.g = our_g;
		neo_bocavirus_proteins[i].material.color.b = our_b;
	}
	
	//exploding
	var real_intended_destination = new THREE.Vector3();
	var boca_explosion_duration = 1.3;
	var boca_explodedness = ( our_CurrentTime - boca_explosion_start_time ) / boca_explosion_duration;
	if( boca_explodedness > 1 )
		boca_explodedness = 1;
	if( our_CurrentTime > whole_thing_finish_time )
		boca_explodedness = 0;
	if( boca_explodedness > 0 )
	{
		if(destination_assignments[0] === 666 )
		{
			var protein_assigned = new Uint16Array(neo_bocavirus_proteins.length);
			for(var i = 0; i < protein_assigned.length; i++)
				protein_assigned[i] = 0;
			
			for(var i = 0; i < 60; i++ )
			{
				var closest_length = 1000;
				for(var j = 0; j < 60; j++)
				{
					if(!protein_assigned[j])
					{
						if( neo_bocavirus_proteins[j].actual_location.distanceTo(boca_piece_destinations[i]) < closest_length)
						{
							destination_assignments[i] = j;
							closest_length = neo_bocavirus_proteins[j].actual_location.distanceTo( boca_piece_destinations[i] );
						}
					}
				}
				protein_assigned[ destination_assignments[i] ] = 1;
			}
			
			for(var i = 60; i < neo_bocavirus_proteins.length; i++ )
				destination_assignments[i] = i;
		}
	}
	
	var point_along = move_smooth(1, boca_explodedness);
	
	if(destination_assignments[0] !== 666 )
	{
		for(var i = 0; i < 60; i++ )
		{
			neo_bocavirus_proteins[destination_assignments[i]].position.copy(boca_piece_destinations[i]);
			neo_bocavirus_proteins[destination_assignments[i]].position.sub( neo_bocavirus_proteins[destination_assignments[i]].actual_location );
			neo_bocavirus_proteins[destination_assignments[i]].position.multiplyScalar(point_along);
		}
	}
	for(var i = 60; i < neo_bocavirus_proteins.length; i++)
	{
		neo_bocavirus_proteins[i].position.copy(boca_piece_destinations[i]);
		neo_bocavirus_proteins[i].position.sub( neo_bocavirus_proteins[i].actual_location );
	}
	
	var start_reproducing_time = 161;
	
	for(var i = 0; i < reproduced_proteins.length; i++)
	{
		if( our_CurrentTime - start_reproducing_time > i * 0.8 )
			reproduced_proteins[i].visible = true;
		else
			reproduced_proteins[i].visible = false;
	}
}

function update_actual_location()
{
	this.actual_location.copy(actual_protein_location);
	this.actual_location.applyQuaternion(this.quaternion);
}

var destination_assignments = Array(neo_bocavirus_proteins.length);

var EggCell_radius = 50;
var spayed_circle_radius = 10;
var EggCell_initialposition = new THREE.Vector3( EggCell_radius + spayed_circle_radius * 1.1,0,0);

function init_bocavirus_stuff()
{
	for(var i = 0; i < destination_assignments.length; i++)
		destination_assignments[i] = 666;
	
	var normalized_virtualico_vertices = Array(12);
	normalized_virtualico_vertices[0] = new THREE.Vector3(0, 	1, 	PHI);
	normalized_virtualico_vertices[1] = new THREE.Vector3( PHI,	0, 	1);
	normalized_virtualico_vertices[2] = new THREE.Vector3(0,	-1, PHI);
	normalized_virtualico_vertices[3] = new THREE.Vector3(-PHI,	0, 	1);
	normalized_virtualico_vertices[4] = new THREE.Vector3(-1, 	PHI,0);
	normalized_virtualico_vertices[5] = new THREE.Vector3( 1, 	PHI,0);
	normalized_virtualico_vertices[6] = new THREE.Vector3( PHI,	0,	-1);
	normalized_virtualico_vertices[7] = new THREE.Vector3( 1,	-PHI,0);
	normalized_virtualico_vertices[8] = new THREE.Vector3(-1,	-PHI,0);
	normalized_virtualico_vertices[9] = new THREE.Vector3(-PHI,	0,	-1);
	normalized_virtualico_vertices[10] = new THREE.Vector3(0, 	1,	-PHI);
	normalized_virtualico_vertices[11] = new THREE.Vector3(0,	-1,	-PHI);
	for(var i = 0; i < 12; i++)
		normalized_virtualico_vertices[i].normalize();
	
	var master_protein = new THREE.Mesh( new THREE.BufferGeometry(), new THREE.MeshLambertMaterial({color:0xf0f00f}) );
	master_protein.geometry.addAttribute( 'position', new THREE.BufferAttribute( Boca_vertices, 3 ) );
	master_protein.geometry.setIndex( new THREE.BufferAttribute( Boca_faces, 1 ) );
	
	actual_protein_location = new THREE.Vector3();
	for(var i = 0, il = Boca_vertices.length / 3; i < il; i++ )
	{
		actual_protein_location.x += Boca_vertices[i*3+0];
		actual_protein_location.y += Boca_vertices[i*3+1];
		actual_protein_location.z += Boca_vertices[i*3+2];
	}
	
	actual_protein_location.multiplyScalar( 3 / Boca_vertices.length );
	
	var threefold_axis = new THREE.Vector3(1,1,1);
	threefold_axis.normalize();
	var fivefold_axis = normalized_virtualico_vertices[0].clone();
	
	master_protein.rotateOnAxis(threefold_axis, TAU / 3);
	master_protein.updateMatrixWorld();
	var tempaxis = fivefold_axis.clone();
	master_protein.worldToLocal(tempaxis);
	master_protein.rotateOnAxis(tempaxis, TAU / 5);
	master_protein.updateMatrixWorld();
	
	for(var i = 0; i < neo_bocavirus_proteins.length; i++)
	{
		neo_bocavirus_proteins[i] = new THREE.Mesh( master_protein.geometry.clone(), master_protein.material.clone() );
		neo_bocavirus_proteins[i].rotation.copy(master_protein.rotation)
		neo_bocavirus_proteins[i].updateMatrixWorld();
		neo_bocavirus_proteins[i].geometry.computeFaceNormals();
		neo_bocavirus_proteins[i].geometry.computeVertexNormals();
		
		neo_bocavirus_proteins[i].actual_location = new THREE.Vector3();
		neo_bocavirus_proteins[i].update_actual_location = update_actual_location;
	}
	
	//the inner ones
	for(var i = 60; i < neo_bocavirus_proteins.length; i++)
	{
		neo_bocavirus_proteins[i].position.sub(actual_protein_location);
	}
	
	
	
	//----------Creating the group
	//"1"
	var axis1 = normalized_virtualico_vertices[0].clone();
//	axis1.add(normalized_virtualico_vertices[3]);
	rotate_protein_bunch(axis1, 2 * TAU / 5, 1);
	
//	//"2"
	var axis2 = normalized_virtualico_vertices[0].clone();
	axis2.add(normalized_virtualico_vertices[4]);
	rotate_protein_bunch(axis2, TAU / 2, 2);
//	
//	//"3"
	var axis3a = normalized_virtualico_vertices[0].clone();
	rotate_protein_bunch(axis3a, TAU / 5, 3);
	var axis3b = normalized_virtualico_vertices[4].clone();
	axis3b.add(normalized_virtualico_vertices[3]);
	rotate_protein_bunch(axis3b, TAU / 2, 3);
	
//	//"4"
	var axis4a = normalized_virtualico_vertices[0].clone();
	axis4a.add(normalized_virtualico_vertices[4]);
	rotate_protein_bunch(axis4a,TAU / 2, 4);
	var axis4b = normalized_virtualico_vertices[4].clone();
	rotate_protein_bunch(axis4b,3*TAU / 5, 4);
	
	//tripling the proteins, now you have 15.
	for(var j = 0; j < 60; j += 15)
	{
		for(var i = 5; i < 10; i++ )
		{
			var specific_da = new THREE.Vector3(1,1,1);
			specific_da.normalize();
			neo_bocavirus_proteins[j+i].worldToLocal(specific_da);
			neo_bocavirus_proteins[j+i].rotateOnAxis(specific_da, TAU / 3);
			neo_bocavirus_proteins[j+i].updateMatrixWorld();
		}
		
		for(var i =10; i < 15; i++ )
		{
			var specific_da = new THREE.Vector3(1,1,1);
			specific_da.normalize();
			neo_bocavirus_proteins[j+i].worldToLocal(specific_da);
			neo_bocavirus_proteins[j+i].rotateOnAxis(specific_da, 2 * TAU / 3);
			neo_bocavirus_proteins[j+i].updateMatrixWorld();
		}
	}
	
	flash_colors = Array(neo_bocavirus_proteins.length);
	for(var i = 0; i < flash_colors.length; i++ )
		flash_colors[i] = Array(3);
	for(var i = 0; i < 15; i++)
	{
		flash_colors[i][0] = 0;
		flash_colors[i][1] = 0;
		flash_colors[i][2] = 1;
	}
		
	
	for(var i = 15; i < 30; i++)
	{
		var specific_da = new THREE.Vector3(1,0,0);
		neo_bocavirus_proteins[i].worldToLocal(specific_da);
		neo_bocavirus_proteins[i].rotateOnAxis(specific_da, TAU / 2);
		neo_bocavirus_proteins[i].updateMatrixWorld();
		
		flash_colors[i][0] = 0.35;
		flash_colors[i][1] = 0.35;
		flash_colors[i][2] = 1;
	}
	for(var i = 30; i < 45; i++)
	{
		var specific_da = new THREE.Vector3(0,1,0);
		neo_bocavirus_proteins[i].worldToLocal(specific_da);
		neo_bocavirus_proteins[i].rotateOnAxis(specific_da, TAU / 2);
		neo_bocavirus_proteins[i].updateMatrixWorld();
		
		flash_colors[i][0] = 0.5;
		flash_colors[i][1] = 0.5;
		flash_colors[i][2] = 1;
	}
	for(var i = 45; i < 60; i++)
	{
		var specific_da = new THREE.Vector3(0,0,1);
		neo_bocavirus_proteins[i].worldToLocal(specific_da);
		neo_bocavirus_proteins[i].rotateOnAxis(specific_da, TAU / 2);
		neo_bocavirus_proteins[i].updateMatrixWorld();
		
		flash_colors[i][0] = 0.75;
		flash_colors[i][1] = 0.75;
		flash_colors[i][2] = 1;
	}
	
	for(var i = 60; i < neo_bocavirus_proteins.length; i++)
	{
		//however you color the others, for this you want a color that's clearly not one of the others, but doesn't stand out too crazily
		flash_colors[i][0] = 94/255;
		flash_colors[i][1] = 0;
		flash_colors[i][2] = 0;
	}
	
	EggCell = new THREE.Mesh(new THREE.PlaneGeometry(EggCell_radius * 2,EggCell_radius * 2),
			new THREE.MeshBasicMaterial({map:random_textures[3], transparent: true} ) );
	EggCell.position.copy(EggCell_initialposition);
	
	{
		lights[0] = new THREE.PointLight( 0xffffff, 0.6 );
		lights[1] = new THREE.PointLight( 0xffffff, 0.6 );
		lights[2] = new THREE.PointLight( 0xffffff, 0.6 );
		lights[3] = new THREE.PointLight( 0xffffff, 0.6 );
		
		lights[0].position.set( 0, 100, 30 );
		lights[1].position.set( 100, 0, 30 );
		lights[2].position.set( -100, 0, 30 );
		lights[3].position.set( 0, -100, 30 );
	}
	
	boca_piece_destinations = Array( neo_bocavirus_proteins.length );
	
	var too_close_to_others = 0;
	//they're arranged so r is going down
	for( var i = 0; i < 60; i++ )
	{
		boca_piece_destinations[i] = new THREE.Vector3();
		
		do {
			var dest_angle = Math.random() * TAU;
			
			boca_piece_destinations[i].x = Math.cos(dest_angle) * (i / boca_piece_destinations.length * 0.8 + 0.2) * spayed_circle_radius;
			boca_piece_destinations[i].y = Math.sin(dest_angle) * (i / boca_piece_destinations.length * 0.8 + 0.2) * spayed_circle_radius;
			
			too_close_to_others = 0;
			for( var j = 0; j < i; j++)
			{
				if( boca_piece_destinations[i].distanceTo(boca_piece_destinations[j]) < 1.3 )
					too_close_to_others = 1;
			}
		} while( boca_piece_destinations[i].length() > spayed_circle_radius || too_close_to_others === 1 )
	}
	var center_few_radius = 0.66;
	boca_piece_destinations[60] = new THREE.Vector3(center_few_radius,center_few_radius,0);
	boca_piece_destinations[61] = new THREE.Vector3(center_few_radius,-center_few_radius,0);
	boca_piece_destinations[62] = new THREE.Vector3(-center_few_radius,center_few_radius,0);
	boca_piece_destinations[63] = new THREE.Vector3(-center_few_radius,-center_few_radius,0);
	
	//the extra ones
	for(var i = 0; i < reproduced_proteins.length; i++)
	{
		reproduced_proteins[i] = new THREE.Mesh( master_protein.geometry.clone(), master_protein.material.clone() );
		reproduced_proteins[i].material.transparent = true;
		reproduced_proteins[i].rotation.copy(master_protein.rotation)
		reproduced_proteins[i].updateMatrixWorld();
		reproduced_proteins[i].geometry.computeFaceNormals();
		reproduced_proteins[i].geometry.computeVertexNormals();
		
		reproduced_proteins[i].actual_location = new THREE.Vector3();
		reproduced_proteins[i].update_actual_location = update_actual_location;
		
		reproduced_proteins[i].position.x = Math.random() * spayed_circle_radius * 4 - spayed_circle_radius * 2;
		reproduced_proteins[i].position.y = Math.random() * spayed_circle_radius * 4 - spayed_circle_radius * 2;
		
		reproduced_proteins[i].position.x += spayed_circle_radius * 2.8;
	}
}

//the seed index is which, in the group of five proteins in the "fundamental domain" like thing, this refers to
function rotate_protein_bunch(ouraxis, amt, seed_index)
{
	neo_bocavirus_proteins[seed_index].worldToLocal(ouraxis);
	ouraxis.normalize();
	for(var i = 0; i < 12; i++)
	{
		neo_bocavirus_proteins[i*5+seed_index].rotateOnAxis(ouraxis, amt);
		neo_bocavirus_proteins[i*5+seed_index].updateMatrixWorld();
	}
}