/* TODO
 * pieces come in
 * points are highlighted (flash and others fade) to indicate associations: 
 * 	blue and green for DNA, (green??!!)
 * 	purple, orange for all proteins
 * 	yellow (and orange and green?) for Ds and Ls
 * colors
 * points are spheres
 * order? obv DNA, but P D or L next?
 * 
 * have a color scheme on the Ls and Ds that makes it clear that this is a football.
 */

var Paria_models = Array(4); //DNA, pentamers, Dextros, Laevos
var Paria_movement_vectors;
var Paria_vertex_offsets;
var paria_animation_progress = 0;

function init_pariacoto(){
	Paria_models[0] = new THREE.Mesh(new THREE.BufferGeometry, new THREE.MeshLambertMaterial({color:0xF6F0D8,transparent:false}) ); //DNA
	Paria_models[1] = new THREE.Mesh(new THREE.BufferGeometry, new THREE.MeshLambertMaterial({color:0xBBC7DC,transparent:false}) ); //Pentamers
	Paria_models[2] = new THREE.Mesh(new THREE.BufferGeometry, new THREE.MeshLambertMaterial({color:0xB5D5BF,transparent:false}) ); //Dextros
	Paria_models[3] = new THREE.Mesh(new THREE.BufferGeometry, new THREE.MeshLambertMaterial({color:0xF2D4D7,transparent:false}) ); //Laevos
	
	Paria_models[0].geometry.addAttribute('position',new THREE.BufferAttribute( Pariacoto_DNAs_vertices, 3 ));
	Paria_models[0].geometry.setIndex(new THREE.BufferAttribute( Pariacoto_DNAs_faces, 1 ));
	Paria_models[1].geometry.addAttribute('position',new THREE.BufferAttribute( Pariacoto_Ps_vertices, 3 ));
	Paria_models[1].geometry.setIndex(new THREE.BufferAttribute( Pariacoto_Ps_faces, 1 ));
	Paria_models[2].geometry.addAttribute('position',new THREE.BufferAttribute( Pariacoto_Ds_vertices, 3 ));
	Paria_models[2].geometry.setIndex(new THREE.BufferAttribute( Pariacoto_Ds_faces, 1 ));
	Paria_models[3].geometry.addAttribute('position',new THREE.BufferAttribute( Pariacoto_Ls_vertices, 3 ));
	Paria_models[3].geometry.setIndex(new THREE.BufferAttribute( Pariacoto_Ls_faces, 1 ));
	
	var PariaScale = 0.59;
	
	for(var i = 0; i < Paria_models.length; i++){
		Paria_models[i].scale.x = PariaScale;
		Paria_models[i].scale.y = PariaScale;
		Paria_models[i].scale.z = PariaScale;
		
		Paria_models[i].geometry.computeFaceNormals();
		Paria_models[i].geometry.computeVertexNormals();
	}
	
	Paria_movement_vectors = Array(Paria_models.length);
	Paria_vertex_offsets = Array(Paria_models.length);
	for(var i = 0; i < Paria_models.length; i++){
		Paria_movement_vectors[i] = Array(60);
		Paria_vertex_offsets[i] = Array(60);
		for(var j = 0; j < 60; j++){
			Paria_movement_vectors[i][j] = new THREE.Vector3(0,0,0);
			for(var k = 0; k < Paria_models[i].geometry.attributes.position.array.length / 60; k++){
				if(k % 3 === 0) Paria_movement_vectors[i][j].x += Paria_models[i].geometry.attributes.position.array[j * Paria_models[i].geometry.attributes.position.array.length / 60 + k];
				if(k % 3 === 1) Paria_movement_vectors[i][j].y += Paria_models[i].geometry.attributes.position.array[j * Paria_models[i].geometry.attributes.position.array.length / 60 + k];
				if(k % 3 === 2) Paria_movement_vectors[i][j].z += Paria_models[i].geometry.attributes.position.array[j * Paria_models[i].geometry.attributes.position.array.length / 60 + k];
			}
			Paria_movement_vectors[i][j].multiplyScalar( 1 / (Paria_models[i].geometry.attributes.position.array.length / 60) );
			//TODO for proteins go through all the virtual ico or virtual dodeca vertices and replace Paria_movement_vector with the closest one from there.
			if(i===1){
				var closest_index = 666; closest_angle = 10.0;
				for(var h = 0 ; h < normalized_virtualico_vertices.length; h++){
					if( normalized_virtualico_vertices[h].angleTo(Paria_movement_vectors[i][j]) < closest_angle){
						closest_angle = normalized_virtualico_vertices[h].angleTo(Paria_movement_vectors[i][j]);
						closest_index = h;
					}
				}
				var ourlength = Paria_movement_vectors[i][j].length();
				Paria_movement_vectors[i][j].copy(normalized_virtualico_vertices[closest_index]);
				Paria_movement_vectors[i][j].setLength(ourlength);
			}
			if(i > 1){
				var closest_index = 666; closest_angle = 10.0;
				for(var h = 0 ; h < normalized_virtualdodeca_vertices.length; h++){
					if( normalized_virtualdodeca_vertices[h].angleTo(Paria_movement_vectors[i][j]) < closest_angle){
						closest_angle = normalized_virtualdodeca_vertices[h].angleTo(Paria_movement_vectors[i][j]);
						closest_index = h;
					}
				}
				var ourlength = Paria_movement_vectors[i][j].length();
				Paria_movement_vectors[i][j].copy(normalized_virtualdodeca_vertices[closest_index]);
				Paria_movement_vectors[i][j].setLength(ourlength);
			}
			Paria_vertex_offsets[i][j] = new Float32Array(Paria_models[i].geometry.attributes.position.array.length / 60);
			for(var k = 0; k < Paria_models[i].geometry.attributes.position.array.length / 60; k++){
				if(k % 3 === 0) 
					Paria_vertex_offsets[i][j][k] = Paria_models[i].geometry.attributes.position.array[j * Paria_models[i].geometry.attributes.position.array.length / 60 + k] - Paria_movement_vectors[i][j].x;
				if(k % 3 === 1) 
					Paria_vertex_offsets[i][j][k] = Paria_models[i].geometry.attributes.position.array[j * Paria_models[i].geometry.attributes.position.array.length / 60 + k] - Paria_movement_vectors[i][j].y;
				if(k % 3 === 2) 
					Paria_vertex_offsets[i][j][k] = Paria_models[i].geometry.attributes.position.array[j * Paria_models[i].geometry.attributes.position.array.length / 60 + k] - Paria_movement_vectors[i][j].z;
			}
		}
	}
}

//this gets called in update3Dlattice to ensure synchronization
function rotate_Parialayer(index,MovementAxis,movementangle){
	var myaxis = MovementAxis.clone();
	Paria_models[index].updateMatrixWorld();
	Paria_models[index].worldToLocal(myaxis);
	myaxis.normalize();
	var myquaternion = new THREE.Quaternion();
	myquaternion.setFromAxisAngle( myaxis, movementangle );
	Paria_models[index].quaternion.multiply(myquaternion);
	Paria_models[index].updateMatrixWorld();
}

function update_Pariacoto(){
	//sigh, we probably need all that progress bar stuff again
//	paria_animation_progress += 0.001;
	if(paria_animation_progress > 1)
		paria_animation_progress = 1;
	
	var DNA_startfadeintime = 0;
	var DNA_convergencetime = 1/4;
	var Ps_startfadeintime = 1/4;
	var Ps_convergencetime = 2/4;
	var Ds_startfadeintime = 2/4;
	var Ds_convergencetime = 3/4;
	var Ls_startfadeintime = 3/4;
	var Ls_convergencetime = 1;
	
	update_Paria_layer(0,DNA_startfadeintime,DNA_convergencetime);
	update_Paria_layer(1,Ps_startfadeintime,Ps_convergencetime);
	update_Paria_layer(2,Ds_startfadeintime,Ds_convergencetime);
	update_Paria_layer(3,Ls_startfadeintime,Ls_convergencetime);
}

function update_Paria_layer(i, start_fadein_time, convergence_time){
	var dist_from_final_pos = 160 * (paria_animation_progress-convergence_time) * (paria_animation_progress-convergence_time);
	if(paria_animation_progress >= convergence_time)
		dist_from_final_pos = 0;
	for(var j = 0; j < 60; j++){
		var current_pos = Paria_movement_vectors[i][j].clone();
		current_pos.multiplyScalar(1 + dist_from_final_pos);
		for(var k = 0; k < Paria_models[i].geometry.attributes.position.array.length / 60; k++){
			if(k % 3 === 0)
				Paria_models[i].geometry.attributes.position.array[j * Paria_models[i].geometry.attributes.position.array.length / 60 + k] = Paria_vertex_offsets[i][j][k] + current_pos.x;
			if(k % 3 === 1)
				Paria_models[i].geometry.attributes.position.array[j * Paria_models[i].geometry.attributes.position.array.length / 60 + k] = Paria_vertex_offsets[i][j][k] + current_pos.y;
			if(k % 3 === 2)
				Paria_models[i].geometry.attributes.position.array[j * Paria_models[i].geometry.attributes.position.array.length / 60 + k] = Paria_vertex_offsets[i][j][k] + current_pos.z;
		}
	}
	
	Paria_models[i].geometry.attributes.position.needsUpdate = true;
	
	var finish_fadein_time = (convergence_time + start_fadein_time ) / 2;
	
	var our_opacity = 0;
	if( start_fadein_time < paria_animation_progress && paria_animation_progress < finish_fadein_time )
		our_opacity = (paria_animation_progress - start_fadein_time) / (finish_fadein_time-start_fadein_time);
	
	if( finish_fadein_time < paria_animation_progress ){
		our_opacity = 1;
		Paria_models[i].material.transparent = false;
	}
	else Paria_models[i].material.transparent = true;
	
	Paria_models[i].material.opacity = our_opacity;
}