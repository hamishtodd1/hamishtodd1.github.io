//Optimization for many things to do with lattice: just work on one one-sixth slice

//might things actually be better if the net got smaller?

var inverse_vertex_mass = 150; //really just a constant that accel is multiplied by
var dampingconstant = 0.05;
var distunit = 10;
//the above are tuned
var minaccel = 0.00001; //prevents round-off errors when lattice is still

function get_accel(index,vertex_destinationX,vertex_destinationY,vertex_destinationZ,distance ) {
	var accel = new THREE.Vector3(	vertex_destinationX - flatlattice_vertices.array[index*3+0],
									vertex_destinationY - flatlattice_vertices.array[index*3+1],
									vertex_destinationZ - flatlattice_vertices.array[index*3+2]);
	
	accel.x -= dampingconstant * flatlattice_vertices_velocities[index*3+0];
	accel.y -= dampingconstant * flatlattice_vertices_velocities[index*3+1];
	accel.z -= dampingconstant * flatlattice_vertices_velocities[index*3+2];
	
	//TODO we do something potentially complex with distance. It should probably have something to do with the pivot too
	//For time being, normalize then inverse square
	distance /= distunit;
	distance += 1; //because if distance is zero we want no impact
	
	accel.multiplyScalar(inverse_vertex_mass/Math.pow(distance,2));
	return accel;
}

var maxspeed = 34;
function updatelattice() {
	var costheta = Math.cos(LatticeAngle);
	var sintheta = Math.sin(LatticeAngle);

	for(var i = 1; i < number_of_lattice_points; i++) {
		var vertex_destinationX = (flatlattice_default_vertices[i*3+0] * costheta - flatlattice_default_vertices[i*3+1] * sintheta) * LatticeScale;
		var vertex_destinationY = (flatlattice_default_vertices[i*3+0] * sintheta + flatlattice_default_vertices[i*3+1] * costheta) * LatticeScale;
		var vertex_destinationZ = (1-capsidopenness) * camera.position.z * 1.5;
		
		flatlattice_vertices.array[i*3+0] = vertex_destinationX;
		flatlattice_vertices.array[i*3+1] = vertex_destinationY;
		flatlattice_vertices.array[i*3+2] = 0;
		
//		var destination_distance = Math.pow(vertex_destinationX - MousePosition.x, 2) + Math.pow(vertex_destinationY - MousePosition.y, 2) + Math.pow(vertex_destinationZ, 2);
//		destination_distance = Math.sqrt(destination_distance);
//		
//		flatlattice_vertices.array[i*3+0] += delta_t * flatlattice_vertices_velocities[i*3+0];
//		flatlattice_vertices.array[i*3+1] += delta_t * flatlattice_vertices_velocities[i*3+1];
//		flatlattice_vertices.array[i*3+2] += delta_t * flatlattice_vertices_velocities[i*3+2];
//	
//		var accel = get_accel(i, vertex_destinationX, vertex_destinationY,vertex_destinationZ,destination_distance);
//		
//		flatlattice_vertices.array[i*3+0] += delta_t * delta_t * accel.x / 2;
//		flatlattice_vertices.array[i*3+1] += delta_t * delta_t * accel.y / 2;
//		flatlattice_vertices.array[i*3+2] += delta_t * delta_t * accel.z / 2;
//		
//		var intermediate_velocityX = flatlattice_vertices_velocities[i*3+0] + delta_t * accel.x / 2;
//		var intermediate_velocityY = flatlattice_vertices_velocities[i*3+1] + delta_t * accel.y / 2;
//		var intermediate_velocityZ = flatlattice_vertices_velocities[i*3+2] + delta_t * accel.z / 2;
//		
//		flatlattice_vertices_velocities[i*3+0] = intermediate_velocityX + delta_t / 2 * accel.x;
//		flatlattice_vertices_velocities[i*3+1] = intermediate_velocityY + delta_t / 2 * accel.y;
//		flatlattice_vertices_velocities[i*3+2] = intermediate_velocityZ + delta_t / 2 * accel.z;
//		
//		accel.copy( get_accel(i, vertex_destinationX, vertex_destinationY, vertex_destinationZ,destination_distance) );
//		
//		flatlattice_vertices_velocities[i*3+0] = intermediate_velocityX + delta_t * accel.x / 2;
//		flatlattice_vertices_velocities[i*3+1] = intermediate_velocityY + delta_t * accel.y / 2;
//		flatlattice_vertices_velocities[i*3+2] = intermediate_velocityZ + delta_t * accel.z / 2;
//		
//		var speed = Math.pow(flatlattice_vertices_velocities[i*3+0]*flatlattice_vertices_velocities[i*3+0]
//							+flatlattice_vertices_velocities[i*3+1]*flatlattice_vertices_velocities[i*3+1]
//							+flatlattice_vertices_velocities[i*3+2]*flatlattice_vertices_velocities[i*3+2], 0.5);
//		if(speed > maxspeed ) {
//			//flatlattice_vertices_velocities[i*3+0] *= maxspeed/speed;
//			speed = maxspeed;
//		}
//		lattice_colors[i*3+1] = speed/maxspeed;		
		
		//it's more like you want to limit how far away they get from their neighbours, pretty hard
	}
	
	flatlattice.geometry.attributes.position.needsUpdate = true;
}

//you could move the net. There again, the lattice has to move on the screen, so.
function HandleLatticeMovement() {
	if( isMouseDown){
		LatticeGrabbed = true;
		
		var MouseAngle = Math.atan2( (MousePosition.x - flatlattice_center.x), (MousePosition.y - flatlattice_center.y) );
		if(MousePosition.x - flatlattice_center.x === 0 && MousePosition.y - flatlattice_center.y === 0)
			MouseAngle = 0; //well, undefined
		
		var OldMouseAngle = Math.atan2( (OldMousePosition.x - flatlattice_center.x), (OldMousePosition.y - flatlattice_center.y) );
		if(OldMousePosition.x - flatlattice_center.x === 0 && OldMousePosition.y - flatlattice_center.y === 0)
			OldMouseAngle = 0;
		
		//speed up opening. TODO Sensetive enough so you know it happens, not so sensetive that touchscreens don't see slow opening
		//if(Math.abs(OldMouseAngle - MouseAngle) > 0.08) capsidopeningspeed += 0.0045;
		
		//TODO remember where the original point the player clicked is, that's what you want to be moving. Currently that point is forgotten, in a sense, if the scale limit is hit
		
		var maxLatticeAngleChange = 0.5;
		var LatticeAngleChange = MouseAngle - OldMouseAngle;
		LatticeAngle += LatticeAngleChange;
		
		var Mousedist = MousePosition.distanceTo(flatlattice_center);
		var OldMousedist = OldMousePosition.distanceTo(flatlattice_center); //unless the center is going to change?
		
		var LatticeScaleChange = OldMousedist / Mousedist;
		
		var min_lattice_scale_given_angle = get_min_lattice_scale(LatticeAngle);
		LatticeScale *= LatticeScaleChange;
		if(LatticeScale < min_lattice_scale_given_angle  ) //10/3 * HS3 / number_of_hexagon_rings)
			LatticeScale = min_lattice_scale_given_angle ; //10/3 * HS3 / number_of_hexagon_rings;
		if(LatticeScale > 1)
			LatticeScale = 1;
		//you could have a more sophisticated upper limit, a flower or something that keeps things more valid
		//however, it raises the possibility of people not realizing they can go to one, which'd be awful
	} else {
		LatticeGrabbed = false;

		var centralaxis = new THREE.Vector3(0, 0, 1);	
		
		var firstnetvertex = new THREE.Vector3(flatnet_vertices.array[ 3 ],flatnet_vertices.array[ 4 ],0);
		firstnetvertex.multiplyScalar(1/LatticeScale);
		firstnetvertex.applyAxisAngle(centralaxis,-LatticeAngle);
		
		var closestlatticevertices_indices = indices_of_closest_default_lattice_vertices(firstnetvertex.x,firstnetvertex.y); //TODO you don't want a lattice vertex not on the visible lattice.
		
		var scaleaugmentation;
		var angleaugmentation;
		var min_lattice_scale_given_angle; //do you need to initialize them in order for the while to work?
		var ourchoice = 0;
		
		do {
			var close_latticevertex = new THREE.Vector3(flatlattice_default_vertices[closestlatticevertices_indices[ourchoice]*3+0],flatlattice_default_vertices[closestlatticevertices_indices[ourchoice]*3+1],0);
			
			//how much you WOULD augment to snap the net straight there
			scaleaugmentation = firstnetvertex.length()/close_latticevertex.length();
			angleaugmentation = close_latticevertex.angleTo(firstnetvertex);
			if(point_to_the_right_of_line(	close_latticevertex.x,close_latticevertex.y,
											firstnetvertex.x,firstnetvertex.y, 0,0) ===0 )
				angleaugmentation*=-1;
			
			min_lattice_scale_given_angle = get_min_lattice_scale(LatticeAngle+angleaugmentation);
			
			var full_scale_addition = LatticeScale * scaleaugmentation - LatticeScale;
			
			ourchoice++;
		} while(LatticeScale + full_scale_addition < min_lattice_scale_given_angle - 0.000001 && ourchoice < 7)
			
		var speed_towards_fix = 0.03 + 0.97 * Math.pow((1-capsidopenness), 10); //sure this won't change which one you're heading for?
		LatticeAngle += angleaugmentation*speed_towards_fix;
		LatticeScale += full_scale_addition*speed_towards_fix;
	}
	updatelattice();
}

function get_min_lattice_scale(ourangle) {
	//this value needs updating if you ever change hexagon_rings
	var min_lattice_scale = 1/(2*Math.sqrt(2.5*2.5+3/4));
	var angle_for_min_lattice = TAU/6 - Math.atan(Math.sqrt(3)/2 / 2.5);

	var virtual_angle = ourangle - angle_for_min_lattice + TAU/12;
	while(virtual_angle< -TAU/12) virtual_angle += TAU/6;
	while(virtual_angle > TAU/12) virtual_angle -= TAU/6;
	return min_lattice_scale / HS3 * Math.cos(virtual_angle);
}

function Map_lattice() {
	//potential optimisation: break out of the loop when you're past a certain radius. That only helps small capsids though.
	//potential optimisation: just put one in each net triangle and extrapolate
	for(var i = 0; i < number_of_lattice_points; i++) {
		var triangle;
//		if(capsidopenness == 1) //one may prefer this
//			triangle = locate_in_net(flatlattice_vertices.array[i*3+0],flatlattice_vertices.array[i*3+1]);
//		else
			triangle = locate_in_squarelattice_net(squarelattice_vertices[i*2+0],squarelattice_vertices[i*2+1]);
			
		
		if( triangle !== 666 && capsidopenness != 1) {
			var mappedpoint = map_from_lattice_to_surface(
				flatlattice_vertices.array[ i*3+0 ], flatlattice_vertices.array[ i*3+1 ],
				triangle);
			
			surflattice_vertices.setXYZ(i, mappedpoint.x, mappedpoint.y, mappedpoint.z );
			
			lattice_colors[i*3+0] = 1;
			lattice_colors[i*3+1] = 0;
			lattice_colors[i*3+2] = 0;
		}
		else if( triangle !== 666 && capsidopenness == 1) {
			//extra on the z so they can appear above the perimeter
			surflattice_vertices.setXYZ(i, lattice_scalefactor*flatlattice_default_vertices[ i*3+0 ],lattice_scalefactor*flatlattice_default_vertices[ i*3+1 ],0.03);
			
			lattice_colors[i*3+0] = 1;
			lattice_colors[i*3+1] = 0;
			lattice_colors[i*3+2] = 0;
		}
		else {
			surflattice_vertices.setXYZ(i, lattice_scalefactor*flatlattice_default_vertices[ i*3+0 ],lattice_scalefactor*flatlattice_default_vertices[ i*3+1 ],0);
			
			lattice_colors[i*3+0] = 1;
			lattice_colors[i*3+1] = 0.5;
			lattice_colors[i*3+2] = 0;
		}
	}
	
	surflattice.geometry.attributes.position.needsUpdate = true;
	surflattice.geometry.attributes.color.needsUpdate = true;
}

//vertex *destination*. Not vertex, which may be interesting.
function index_of_closest_default_lattice_vertex(x,y) {
	var closest_point_so_far_index = 66666;
	var lowest_quadrance_so_far = 66666;
	for( var j = 0; j < number_of_lattice_points; j++) {
		var quadrance = (x-flatlattice_default_vertices[j*3 + 0])*(x-flatlattice_default_vertices[j*3 + 0]) + 
						(y-flatlattice_default_vertices[j*3 + 1])*(y-flatlattice_default_vertices[j*3 + 1]);
		
		if( quadrance < lowest_quadrance_so_far) {
			closest_point_so_far_index = j;
			lowest_quadrance_so_far = quadrance;
		}
	}
	return closest_point_so_far_index;
}

//vertex *destination*. Not vertex, which may be interesting.
function indices_of_closest_default_lattice_vertices(x,y) {
	var number_of_returns = 7; //all the points near a point, should be ok?
	var closest_points_indices = Array(number_of_returns);
	var lowest_quadrances_so_far = Array(number_of_returns );
	for(var i = 0; i<number_of_returns; i++){
		closest_points_indices[i] = 66666;
		lowest_quadrances_so_far[i] = 66666;
	}
	//speedup opportunity: only go through a sixth of them
	//speedup opportunity: discard those whose quadrance from the center of the lattice is larger than that of the closest one
	for( var i = 0; i < number_of_lattice_points; i++) {
		var quadrance = (x-flatlattice_default_vertices[i*3 + 0])*(x-flatlattice_default_vertices[i*3 + 0]) + 
						(y-flatlattice_default_vertices[i*3 + 1])*(y-flatlattice_default_vertices[i*3 + 1]);
		
		for(var j = number_of_returns - 1; j >= 0; j--) {
			if( quadrance < lowest_quadrances_so_far[j]) {
				//well this one is being shifted
				if(j < number_of_returns - 1){
					closest_points_indices[j+1] = closest_points_indices[j];
					lowest_quadrances_so_far[j+1] = lowest_quadrances_so_far[j];
				}
				if(j==0){
					closest_points_indices[0] = i;
					lowest_quadrances_so_far[0] = quadrance;
				}
			}
			else{
				if(j !== number_of_returns - 1) {
					//so we know we're in the list, we need to put them in the previous place
					closest_points_indices[j+1] = i;
					lowest_quadrances_so_far[j+1] = quadrance;
				}
				break;
			}
		}
	}
	return closest_points_indices;
}