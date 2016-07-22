/*
 * TODO
 * -very minor jitter (?) on DNA and maybe protein
 * 
 * -lots of pictures
-bocavirus zooms out
-bocavirus colors change
-bocavirus pentamers flash
 * 
 * -lights
 * 
 */

/*
 * Springy DNA - really worth doing, the first interactive thing they see
 * for every strand, basis vectors at both their ends, plus another basis vector that is the cross product of those basis vectors
 * When the player rotates, it gives momentum to the dodeca vertices. They're trapped in a narrow cone. 
 */

var flash_colors;

function update_bocavirus() {
	//-------Rotation
	if(isMouseDown) {
		bocavirus_MovementAngle = Mouse_delta.length() / 3;
		bocavirus_MovementAxis.set(-Mouse_delta.y, Mouse_delta.x, 0);
		bocavirus_MovementAxis.normalize();
		
		if( !Mouse_delta.equals( new THREE.Vector3() ) )
			theyknowyoucanrotate = 1;
	}
	else {
		bocavirus_MovementAngle *= 0.93;
	}
	
	var DNA_cage_axis = bocavirus_MovementAxis.clone();
	DNA_cage.worldToLocal(DNA_cage_axis);
	DNA_cage.rotateOnAxis(DNA_cage_axis, bocavirus_MovementAngle);
	DNA_cage.updateMatrixWorld();
	
	for(var i = 0; i < neo_bocavirus_proteins.length; i++)
	{
		var tempaxis = bocavirus_MovementAxis.clone();
		neo_bocavirus_proteins[i].worldToLocal(tempaxis);
		neo_bocavirus_proteins[i].rotateOnAxis(tempaxis, bocavirus_MovementAngle);
		neo_bocavirus_proteins[i].updateMatrixWorld();
	}

	//-------transparency stuff
	var fade_starting_time = 152;
	var time_taken_for_fade = 8;
	var proportion_through = ( our_CurrentTime - fade_starting_time ) / time_taken_for_fade;
	if(proportion_through < 0)
		proportion_through = 0;
	if(proportion_through > 1)
		proportion_through = 1;
	proportion_through *= 4;
	for(var i = 0; i < capsomer_groups.length; i++)
	{
		var ouralpha = 1 - (proportion_through - i);
		if( ouralpha > 1)
			ouralpha = 1;
		if( ouralpha < 0)
			ouralpha = 0;
		
		for(var j = 0; j < capsomer_groups[i].length; j++)
		{
			var ourcapsomer = capsomer_groups[i][j];
			for(var k = 0; k < capsomer_protein_indices[ ourcapsomer ].length; k++ )
			{
				neo_bocavirus_proteins[ capsomer_protein_indices[ourcapsomer][k] ].material.opacity = ouralpha;
			}
		}
	}

	//-------Fadeout
	//it takes a while. Could instead do them in fours. The two at the top and bottom, two on the left and right, two on the front and back
	var flash_time = 80.9;
	var fadeto_time = 0.66;
	var colored_time = 0.1;
	var fadeback_time = fadeto_time;
	var coloredness;
	if(our_CurrentTime < flash_time )
		coloredness = 0;
	else if( our_CurrentTime < flash_time + fadeto_time )
		coloredness = (our_CurrentTime - flash_time) / fadeto_time;
	else if( our_CurrentTime < flash_time + fadeto_time + colored_time )
		coloredness = 1;
	else if( our_CurrentTime < flash_time + fadeto_time + colored_time + fadeback_time )
		coloredness = 1 - (our_CurrentTime - (flash_time + fadeto_time + colored_time) ) / fadeback_time;
	else
		coloredness = 0;
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
}

function init_DNA_cage(){
	DNA_cage = new THREE.LineSegments( new THREE.BufferGeometry(), new THREE.LineBasicMaterial({color: 0xf0f00f,vertexColors: THREE.VertexColors}), THREE.LineSegmentsPieces);
	 
	var avg = new THREE.Vector3();
	for(var i = 0; i<DNA_vertices_numbers.length / 3; i++){
		avg.x += DNA_vertices_numbers[i*3+0];
		avg.y += DNA_vertices_numbers[i*3+1];
		avg.z += DNA_vertices_numbers[i*3+2];
	}
	avg.multiplyScalar(3/DNA_vertices_numbers.length);
	var scaleFactor = 0.87*2.3/109; //chosen quite arbitrarily, can change a lot
	for(var i = 0; i<DNA_vertices_numbers.length / 3; i++){
		DNA_vertices_numbers[i*3+0] -= avg.x;
		DNA_vertices_numbers[i*3+1] -= avg.y;
		DNA_vertices_numbers[i*3+2] -= avg.z;
		
		DNA_vertices_numbers[i*3+0] *= scaleFactor;
		DNA_vertices_numbers[i*3+1] *= scaleFactor;
		DNA_vertices_numbers[i*3+2] *= scaleFactor;
	}
	
	
	var yaw_correction_rotation = -0.076; //gotten "heuristically"
	var pitch_correction_rotation = 0.07;
	for(var i = 0; i<60; i++){
		var strand_avg = new THREE.Vector3();
		for(var j = 0; j<50; j++){
			strand_avg.x += DNA_vertices_numbers[(i*50+j)*3+0];
			strand_avg.y += DNA_vertices_numbers[(i*50+j)*3+1];
			strand_avg.z += DNA_vertices_numbers[(i*50+j)*3+2];
		}
		strand_avg.multiplyScalar( 1 / 50);
		
		var yaw_correction_axis = strand_avg.clone();
		yaw_correction_axis.normalize(); //not a great way of doing it.
		for(var j = 0; j<50; j++){
			var ourpoint = new THREE.Vector3(DNA_vertices_numbers[(i*50+j)*3+0],DNA_vertices_numbers[(i*50+j)*3+1],DNA_vertices_numbers[(i*50+j)*3+2]);
			ourpoint.applyAxisAngle(yaw_correction_axis,yaw_correction_rotation);
			
			DNA_vertices_numbers[(i*50+j)*3+0] = ourpoint.x;
			DNA_vertices_numbers[(i*50+j)*3+1] = ourpoint.y;
			DNA_vertices_numbers[(i*50+j)*3+2] = ourpoint.z;
		}

		//so what would be nice would be to rotate them a bit so that you remove those kinks. Some cross product.
		var firstbackbonepoint_index = i * 50;
		var lastbackbonepoint_index = i * 50 + 48;
		var firstbackbonepoint_to_lastbackbonepoint = new THREE.Vector3(
			DNA_vertices_numbers[lastbackbonepoint_index*3+0]-DNA_vertices_numbers[firstbackbonepoint_index*3+0],
			DNA_vertices_numbers[lastbackbonepoint_index*3+1]-DNA_vertices_numbers[firstbackbonepoint_index*3+1],
			DNA_vertices_numbers[lastbackbonepoint_index*3+2]-DNA_vertices_numbers[firstbackbonepoint_index*3+2]);
		var pitch_axis_origin = firstbackbonepoint_to_lastbackbonepoint.clone();
		pitch_axis_origin.multiplyScalar(0.5);
		pitch_axis_origin.x += DNA_vertices_numbers[firstbackbonepoint_index*3+0];
		pitch_axis_origin.y += DNA_vertices_numbers[firstbackbonepoint_index*3+1];
		pitch_axis_origin.z += DNA_vertices_numbers[firstbackbonepoint_index*3+2];
		var pitch_axis = new THREE.Vector3();
		pitch_axis.crossVectors(pitch_axis_origin,firstbackbonepoint_to_lastbackbonepoint);
		pitch_axis.normalize();
		
		for(var j = 0; j<50; j++){
			var ourpoint = new THREE.Vector3(DNA_vertices_numbers[(i*50+j)*3+0],DNA_vertices_numbers[(i*50+j)*3+1],DNA_vertices_numbers[(i*50+j)*3+2]);
			ourpoint.sub(pitch_axis_origin);
			ourpoint.applyAxisAngle(pitch_axis,pitch_correction_rotation);
			ourpoint.add(pitch_axis_origin);
			
			DNA_vertices_numbers[(i*50+j)*3+0] = ourpoint.x;
			DNA_vertices_numbers[(i*50+j)*3+1] = ourpoint.y;
			DNA_vertices_numbers[(i*50+j)*3+2] = ourpoint.z;
		}
	}
	

	
	DNA_cage.geometry.addAttribute( 'position', new THREE.BufferAttribute( DNA_vertices_numbers, 3 ) );
	
	
	var DNA_colors = new Float32Array(DNA_vertices_numbers.length);
	var DNA_line_pairs = new Uint16Array(DNA_vertices_numbers.length / 3 * 2);
	
	for(var i = 0; i<60;i++){ //each of the 60 strands has 50 "atoms"
		for(var j = 0; j<50; j++){
			if(j==49){
				var closest_quadrance_so_far = 10000;
				var closest_index_so_far = 666;
				
				for( var k = 0; k < 60; k++){
					if(k==i)
						continue;
					
					if(quadrance_between_DNA_points(i*50+j,k*50) < closest_quadrance_so_far){
						closest_index_so_far = k*50;
						closest_quadrance_so_far = quadrance_between_DNA_points(i*50+j,k*50);
					}
					if(quadrance_between_DNA_points(i*50+j,k*50+48) < closest_quadrance_so_far){
						closest_index_so_far = k*50+48;
						closest_quadrance_so_far = quadrance_between_DNA_points(i*50+j,k*50+48);
					}
				}
				
				//imaginary backbone
				DNA_line_pairs[ 2*(i*50+j) ] = i*50+j-1;
				DNA_line_pairs[2*(i*50+j)+1] = closest_index_so_far;
				
				//color is a base
				DNA_colors[(i*50+j)*3+0] = 245/255; DNA_colors[(i*50+j)*3+1] = 220/255; DNA_colors[(i*50+j)*3+2] = 176/255;
			}
			else if(j%2==0) {//base
				DNA_line_pairs[ 2*(i*50+j) ] = i*50+j;
				DNA_line_pairs[2*(i*50+j)+1] = i*50+j+1;
				
				//color is backbone
				DNA_colors[(i*50+j)*3+0] = 208/255; DNA_colors[(i*50+j)*3+1] = 87/255; DNA_colors[(i*50+j)*3+2] = 106/255;
			}
			else {//backbone
				DNA_line_pairs[ 2*(i*50+j) ] = i*50+j-1;
				DNA_line_pairs[2*(i*50+j)+1] = i*50+j+1;
				
				//color is a base
				DNA_colors[(i*50+j)*3+0] = 245/255; DNA_colors[(i*50+j)*3+1] = 220/255; DNA_colors[(i*50+j)*3+2] = 176/255;
			}
		}
	}
	DNA_cage.geometry.addAttribute( 'color', new THREE.BufferAttribute(DNA_colors, 3) );
	DNA_cage.geometry.setIndex( new THREE.BufferAttribute( DNA_line_pairs, 1 ) );
	
	//because it ain't perfect
	DNA_cage.quaternion.set(-0.0028151799901586245, -0.03798590756432208, -0.09772936010824641, 0.9944838448969249);
}

function quadrance_between_DNA_points(index1,index2){
	var dX = DNA_cage.geometry.attributes.position.array[index1*3+0] - DNA_cage.geometry.attributes.position.array[index2*3+0];
	var dY = DNA_cage.geometry.attributes.position.array[index1*3+1] - DNA_cage.geometry.attributes.position.array[index2*3+1];
	var dZ = DNA_cage.geometry.attributes.position.array[index1*3+2] - DNA_cage.geometry.attributes.position.array[index2*3+2];
	
	return dX*dX + dY*dY + dZ*dZ;
}

var EggCell_radius = 120;
var EggCell_initialposition = new THREE.Vector3( EggCell_radius + playing_field_dimension,0,0);

function init_bocavirus_stuff()
{
	EggCell = new THREE.Mesh(new THREE.PlaneGeometry(EggCell_radius * 2,EggCell_radius * 2),
			new THREE.MeshBasicMaterial({map:random_textures[3], transparent: true} ) );
	EggCell.position.copy(EggCell_initialposition);
	
	Transcriptase = new THREE.Mesh(new THREE.PlaneGeometry(playing_field_dimension,playing_field_dimension),
			new THREE.MeshBasicMaterial({map:random_textures[4]} ) );
	Transcriptase.position.x = playing_field_dimension;
	
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
	
	//alphatest gets rid of the order thing, but also introduces a weird threshold for alpha
	var master_protein = new THREE.Mesh( new THREE.BufferGeometry(), new THREE.MeshLambertMaterial({color:0xf0f00f, transparent:true, alphaTest: 0.001}) );
	
	number_of_vertices_in_protein = protein_vertices_numbers.length / 3;
	
	for(var i = 0; i < protein_vertices_numbers.length; i++){
		protein_vertices_numbers[i] /= 32; 
	}
	
	//TODO this is where it becomes about 5.
	var point = new THREE.Vector3();
	for(var i = 0; i < protein_vertices_numbers.length / 3; i++){
		point.set(	protein_vertices_numbers[i*3+0],
					protein_vertices_numbers[i*3+1],
					protein_vertices_numbers[i*3+2]);
		
		
	}
	master_protein.geometry.addAttribute( 'position', new THREE.BufferAttribute( protein_vertices_numbers, 3 ) );
	master_protein.geometry.setIndex( new THREE.BufferAttribute( coarse_protein_triangle_indices, 1 ) );
	master_protein.geometry.computeFaceNormals();
	master_protein.geometry.computeVertexNormals();
	

	
	
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
	}
	
	/*
	 * mirroring the protein
	 * http://gamedev.stackexchange.com/questions/43615/how-can-i-reflect-a-point-with-respect-to-the-plane
	 * points
	 * -1,1,1
	 * normalized_virtualico_vertices[0]
	 * 0,0,0
	 */
		
	
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
	
	flash_colors = Array(60);
	for(var i = 0; i < flash_colors.length; i++ )
		flash_colors[i] = Array(3);
	for(var i = 0; i < 15; i++)
	{
		flash_colors[i][0] = 0;
		flash_colors[i][1] = 1;
		flash_colors[i][2] = 0;
	}
		
	
	for(var i = 15; i < 30; i++)
	{
		var specific_da = new THREE.Vector3(1,0,0);
		neo_bocavirus_proteins[i].worldToLocal(specific_da);
		neo_bocavirus_proteins[i].rotateOnAxis(specific_da, TAU / 2);
		neo_bocavirus_proteins[i].updateMatrixWorld();
		
		flash_colors[i][0] = 0;
		flash_colors[i][1] = 0.5;
		flash_colors[i][2] = 1;
	}
	for(var i = 30; i < 45; i++)
	{
		var specific_da = new THREE.Vector3(0,1,0);
		neo_bocavirus_proteins[i].worldToLocal(specific_da);
		neo_bocavirus_proteins[i].rotateOnAxis(specific_da, TAU / 2);
		neo_bocavirus_proteins[i].updateMatrixWorld();
		
		flash_colors[i][0] = 1;
		flash_colors[i][1] = 0.5;
		flash_colors[i][2] = 0;
	}
	for(var i = 45; i < 60; i++)
	{
		var specific_da = new THREE.Vector3(0,0,1);
		neo_bocavirus_proteins[i].worldToLocal(specific_da);
		neo_bocavirus_proteins[i].rotateOnAxis(specific_da, TAU / 2);
		neo_bocavirus_proteins[i].updateMatrixWorld();
		
		flash_colors[i][0] = 1;
		flash_colors[i][1] = 0;
		flash_colors[i][2] = 1;
	}
	
	//the thing to solve the alpha occlusion problem might be to not have them all in an array at all :/
	
	for(var capsomer_index = 0; capsomer_index < 12; capsomer_index++)
	{
		capsomer_protein_indices[ capsomer_index ] = Array(5);
		
		var lowest_unused = 0;
		for(var j = 0; j < neo_bocavirus_proteins.length; j++)
		{
			var indicative_vertex = new THREE.Vector3(
				neo_bocavirus_proteins[j].geometry.attributes.position.array[100*3+0],
				neo_bocavirus_proteins[j].geometry.attributes.position.array[100*3+1],
				neo_bocavirus_proteins[j].geometry.attributes.position.array[100*3+2] );
			
			neo_bocavirus_proteins[j].localToWorld(indicative_vertex);
			
			var dist = normalized_virtualico_vertices[capsomer_index].distanceTo(indicative_vertex);
			if(dist < 2)
			{
				capsomer_protein_indices[capsomer_index][ lowest_unused ] = j;
				lowest_unused++;
			}
		}
	}
	
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