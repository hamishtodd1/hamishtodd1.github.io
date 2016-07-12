/*
 * Separate bunch of faces.
 * 
 * We're going to have a single value representing state. There'll be an array of states for comic that you can read off that.
 * Including whether the comic is visible
 * 
 * You push them all to that array
 */

var ComicZone;

var ComicFace;

var automaton_width = 13;
var num_automaton_faces = automaton_width*automaton_width;

var automaton_faces = Array(num_automaton_faces);
var automaton_face_status = new Uint8Array(num_automaton_faces);
var automaton_faces_sickness_counts = new Uint32Array(num_automaton_faces);

var automaton = new THREE.Object3D();

function init_Comiczone()
{	
	ComicFace = new THREE.Mesh(
			new THREE.CubeGeometry(VIEWBOX_HEIGHT / 2, VIEWBOX_HEIGHT / 2, 0),
			new THREE.MeshBasicMaterial({transparent: true}) );
	
	ComicZone = new THREE.Object3D();
	
	ComicZone.add(boundingbox.clone());
	ComicZone.add(ComicFace);
	ComicFace.position.z = 0.02;
	
	//------automaton part
	
	var face_width = VIEWBOX_HEIGHT / automaton_width;
	for(var i = 0; i < automaton_width; i++)
	{
		for(var j = 0; j < automaton_width; j++)
		{
			automaton_faces[i*automaton_width+j] = new THREE.Mesh(
					new THREE.CubeGeometry(face_width, face_width, 0),
					new THREE.MeshBasicMaterial({transparent: true}) );
			
			automaton_faces[i*automaton_width+j].position.set(
					-VIEWBOX_HEIGHT / 2 + i * face_width + face_width / 2,
					-VIEWBOX_HEIGHT / 2 + j * face_width + face_width / 2,0);
						
//			ComicZone.add( automaton_faces[i*automaton_width+j] );
		}
	}
	
	for(var i = 0; i < automaton_width; i++)
		for(var j = 0; j < automaton_width; j++)
			automaton.add( automaton_faces[i*automaton_width+j] );
	
	reset_CA();
	
	ComicZone.position.copy(Graph.position);
}

function reset_CA( setting )
{
	var ALL_FINE = 0;
	var ONE_SICK = 1;
	var THREE_SICK = 2;
	var TWO_SICK_ONE_RESISTANT = 3;
	
	for(var i = 0; i < automaton_width; i++)
	{
		for(var j = 0; j < automaton_width; j++)
		{
			automaton_face_status[ i * automaton_width + j ] = EMOJII_SUSCEPTIBLE;
			
			if(	setting === ONE_SICK )
			{
				if( i === Math.round(automaton_width / 2) - 1
				 && j === Math.round(automaton_width / 2) - 1 )
					automaton_face_status[ i * automaton_width + j ] = EMOJII_SICK;
			}
			if(	setting === THREE_SICK )
			{
				if( i === Math.round(automaton_width / 2)
				 && j === Math.round(automaton_width / 2) - 1 )
					automaton_face_status[ i * automaton_width + j ] = EMOJII_SICK;
				if( i === Math.round(automaton_width / 2) - 1
				 && j === Math.round(automaton_width / 2) - 1 )
					automaton_face_status[ i * automaton_width + j ] = EMOJII_SICK;
				if( i === Math.round(automaton_width / 2) - 2
				 && j === Math.round(automaton_width / 2) - 1 )
					automaton_face_status[ i * automaton_width + j ] = EMOJII_SICK;
			}
			if(	setting === TWO_SICK_ONE_RESISTANT )
			{
				if( i === Math.round(automaton_width / 2)
				 && j === Math.round(automaton_width / 2) - 1 )
					automaton_face_status[ i * automaton_width + j ] = EMOJII_SICK;
				if( i === Math.round(automaton_width / 2) - 1
				 && j === Math.round(automaton_width / 2) - 1 )
					automaton_face_status[ i * automaton_width + j ] = EMOJII_RESISTANT;
				if( i === Math.round(automaton_width / 2) - 2
				 && j === Math.round(automaton_width / 2) - 1 )
					automaton_face_status[ i * automaton_width + j ] = EMOJII_SICK;
			}
		}
	}
	
	for(var i = 0; i < automaton_faces_sickness_counts.length; i++)
		automaton_faces_sickness_counts[i] = 0;
}

var count = 0;

function update_Cellular_Automaton(  )
{
	count++;
	var change_period = 15; //TODO needs to take delta_t into account really :X 
	if(count > change_period)
		count = 0;
	if(count !== change_period)
		return;
	
	var CA_Infectiousness = 0.06;
	var CA_RecoveryTime = 10;
	probability_of_dying = 0.02; //we tune this so no need to think too hard
	
	if(Story_states[Storypage].AutomatonRunning)
	{
		var new_automaton_face_status = Array(automaton_face_status.length);
		
		for(var i = 0; i < new_automaton_face_status.length; i++)
			new_automaton_face_status[i] = automaton_face_status[i];
		
		for(var i = 0; i < automaton_width; i++)
		{
			for(var j = 0; j < automaton_width; j++ )
			{
				if( Story_states[Storypage].Automaton_people_die && Math.random() < probability_of_dying )
					new_automaton_face_status[i*automaton_width+j] = EMOJII_SUSCEPTIBLE;
					
				if( automaton_face_status[i*automaton_width+j] === EMOJII_SUSCEPTIBLE)
				{
					for(var ik = -1; ik < 2; ik++)
					{
						for(var jk = -1; jk < 2; jk++)
						{
							if(ik === 0 && jk === 0)
								continue;
							
							//torus
							var checking_i = i + ik;
							if( checking_i < 0 )
								checking_i += automaton_width;
							if( checking_i >= automaton_width)
								checking_i -= automaton_width;
							
							var checking_j = j + jk;
							if( checking_j < 0 )
								checking_j += automaton_width;
							if( checking_j >= automaton_width)
								checking_j -= automaton_width;
							
							if(automaton_face_status[checking_i * automaton_width + checking_j] === EMOJII_SICK)
							{
								if(Math.random() < CA_Infectiousness)
								{
									new_automaton_face_status[i*automaton_width+j] = EMOJII_SICK;
									automaton_faces_sickness_counts[i*automaton_width+j] = 0;
								}
							}
						}
					}
				}
				
				if(automaton_face_status[i*automaton_width+j] === EMOJII_SICK)
				{
					automaton_faces_sickness_counts[i*automaton_width+j]++;
					
					if( automaton_faces_sickness_counts[i*automaton_width+j] >= CA_RecoveryTime ) //might need to multiply by something
						new_automaton_face_status[i*automaton_width+j] = EMOJII_RESISTANT;
				}
			}
		}
		for(var i = 0; i < new_automaton_face_status.length; i++)
			automaton_face_status[i] = new_automaton_face_status[i];
	}
	
	for(var i = 0; i < automaton_faces.length; i++)
		automaton_faces[ i ].material.map = emojiitextures[ automaton_face_status[i] ];
}