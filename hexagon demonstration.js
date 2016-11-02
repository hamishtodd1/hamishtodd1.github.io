function update_hexagon_demo()
{
	var segments_explodedness = 0;
	
	var plosion_duration = 0.8;
	var implosion_start_time = Hexagon_explosion_start_time + plosion_duration;
	
	if( Hexagon_explosion_start_time <= our_CurrentTime && our_CurrentTime <= Hexagon_explosion_start_time + plosion_duration )
		segments_explodedness = move_smooth(plosion_duration, our_CurrentTime - Hexagon_explosion_start_time);
	else if( implosion_start_time <= our_CurrentTime && our_CurrentTime <= implosion_start_time + plosion_duration )
		segments_explodedness = 1 - move_smooth(plosion_duration, our_CurrentTime - implosion_start_time );
	
//	console.log(demonstration_hexagons[0].children[0].children[0].geometry.vertices[2])
	for(var i = 0; i < demonstration_hexagons[0].children.length; i++)
	{
		demonstration_hexagons[0].children[i].position.copy(demonstration_hexagons[0].children[0].children[0].geometry.vertices[2]);
		demonstration_hexagons[0].children[i].position.multiplyScalar(segments_explodedness);
		demonstration_hexagons[0].children[i].position.multiplyScalar(0.3);
		demonstration_hexagons[0].children[i].position.applyAxisAngle(z_central_axis, TAU / 6 * i);
		demonstration_hexagons[0].children[i].position.z = 0.1;
	}
	
	var hex_start_fadein = implosion_start_time + plosion_duration + 0.2;
	var hex_fadein_duration = 1;
	
	var hex_alpha = ( our_CurrentTime - hex_start_fadein ) * 1.5 / hex_fadein_duration;
	if( hex_alpha < 0)
		hex_alpha = 0;
	if( hex_alpha > 1)
		hex_alpha = 1;
	
	for(var i = 0; i < demonstration_hexagons[1].children.length; i++ )
	{
		demonstration_hexagons[1].children[i].children[0].material.opacity = hex_alpha;
		demonstration_hexagons[1].children[i].children[1].material.opacity = hex_alpha;
	}

	var first_movement_duration = 0.8;
	var second_movement_start_time = hex_first_movement_start_time + first_movement_duration + 0.35;
	var second_movement_duration = first_movement_duration;
	
	if( our_CurrentTime <= second_movement_start_time )
	{
		var aroundness = move_smooth(first_movement_duration, our_CurrentTime - hex_first_movement_start_time );
		demonstration_hexagons[1].position.copy( demonstration_hexagons[1].children[0].children[1].geometry.vertices[1] );
		demonstration_hexagons[1].position.multiplyScalar(-2.06);
		demonstration_hexagons[1].position.y *= -1;
		
		demonstration_hexagons[1].position.applyAxisAngle(z_central_axis,TAU / 6 * aroundness );
	}
	else if( second_movement_start_time <= our_CurrentTime )
	{
		var aroundness = move_smooth(second_movement_duration, our_CurrentTime - second_movement_start_time );
		demonstration_hexagons[1].position.copy( demonstration_hexagons[1].children[0].children[1].geometry.vertices[1] );
		demonstration_hexagons[1].position.multiplyScalar(-2.06);
		
		demonstration_hexagons[1].position.applyAxisAngle(z_central_axis,TAU / 6 * aroundness );
	}
}

function init_hexagon_demo()
{
	var hexagon_segment = new THREE.Object3D();
	hexagon_segment.add(new THREE.Mesh(new THREE.Geometry(), new THREE.MeshBasicMaterial({color:0xFFA500, side:THREE.DoubeSide, transparent: true})));
	
	hexagon_segment.children[0].geometry.vertices.push(new THREE.Vector3(0,0,0));
	hexagon_segment.children[0].geometry.vertices.push(new THREE.Vector3(HS3,0,0));
	hexagon_segment.children[0].geometry.vertices.push(new THREE.Vector3(1,0,0));
	hexagon_segment.children[0].geometry.vertices.push(new THREE.Vector3(HS3,0,0));
	hexagon_segment.children[0].geometry.vertices[1].applyAxisAngle(z_central_axis, TAU / 12);
	hexagon_segment.children[0].geometry.vertices[3].applyAxisAngle(z_central_axis,-TAU / 12);
	
	hexagon_segment.children[0].geometry.faces.push( new THREE.Face3(0,2,1) );
	hexagon_segment.children[0].geometry.faces.push( new THREE.Face3(0,3,2) );
	
	hexagon_segment.add(new THREE.Mesh(new THREE.Geometry(), new THREE.MeshBasicMaterial({color:0x000000, side:THREE.DoubeSide, transparent: true})));
	
	hexagon_segment.children[1].geometry.vertices.push( hexagon_segment.children[0].geometry.vertices[1].clone() );
	hexagon_segment.children[1].geometry.vertices.push( hexagon_segment.children[0].geometry.vertices[1].clone() );
	hexagon_segment.children[1].geometry.vertices.push( hexagon_segment.children[0].geometry.vertices[2].clone() );
	hexagon_segment.children[1].geometry.vertices.push( hexagon_segment.children[0].geometry.vertices[2].clone() );
	hexagon_segment.children[1].geometry.vertices.push( hexagon_segment.children[0].geometry.vertices[3].clone() );
	hexagon_segment.children[1].geometry.vertices.push( hexagon_segment.children[0].geometry.vertices[3].clone() );
	
	for(var i = 0; i < 3; i++)
		hexagon_segment.children[1].geometry.vertices[i*2+1].multiplyScalar( 1.1 ); //use that to control the outline width
	
	hexagon_segment.children[1].geometry.faces.push( new THREE.Face3(0,2,1) );
	hexagon_segment.children[1].geometry.faces.push( new THREE.Face3(1,2,3) );
	hexagon_segment.children[1].geometry.faces.push( new THREE.Face3(2,4,3) );
	hexagon_segment.children[1].geometry.faces.push( new THREE.Face3(3,4,5) );
	
	hexagon_segment.position.z = 0.1;
	
	var original_demonstration_hexagon = new THREE.Object3D();
	for(var i = 0; i < 6; i++ )
	{
		original_demonstration_hexagon.add(hexagon_segment.clone());
		original_demonstration_hexagon.children[i].rotateOnAxis( z_central_axis, i * TAU / 6 );
	}
	
	for(var i = 0; i < demonstration_hexagons.length; i++)
	{
		demonstration_hexagons[i] = original_demonstration_hexagon.clone();
		
		for(var k = 0; k < demonstration_hexagons[i].children.length; k++)
			for(var j = 0; j < hexagon_segment.children.length; j++ )
				demonstration_hexagons[i].children[k].children[j].material = hexagon_segment.children[j].material.clone();
	}
	
	demonstration_hexagons[1].position.copy( hexagon_segment.children[1].geometry.vertices[1] );
	demonstration_hexagons[1].position.multiplyScalar(2.06);
	demonstration_hexagons[1].position.x *= -1;
}