/*
 * We'll have the button in here too. Should have an animated pair of lines opening and closing dependent on capsidopenness on it.
 */

function UpdateGrabbableArrow()
{
	//TODO sort this out
//	var GrabbableArrowFlattened = GrabbableArrow.position.clone()
//	GrabbableArrowFlattened.z = 0;
//	var skewangle = GrabbableArrowFlattened.angleTo(new THREE.Vector3(1,0,0) );
//	GrabbableArrow.quaternion.setFromAxisAngle(z_central_axis, -skewangle);
	
	var MouseRelativeToArrow = MousePosition.clone();
	MouseRelativeToArrow.z = camera.position.z - min_cameradist;
	MouseRelativeToArrow.sub( GrabbableArrow.position );
	MouseRelativeToArrow.z = 0;
	if(isMouseDown && !isMouseDown_previously && MouseRelativeToArrow.length() < GrabbableArrow.dimension / 2 )
		GrabbableArrow.grabbed = 1;
		
	if(!isMouseDown)
		GrabbableArrow.grabbed = 0;
	
	if( GrabbableArrow.grabbed )
	{
		GrabbableArrow.excitation = -1;
		GrabbableArrow.scale.set( 1,1,1);
		
		if( !Story_states[Storypage].CK_scale_only )
			GrabbableArrow.position.copy( MousePosition );
		else
			GrabbableArrow.position.setLength( MousePosition.length() );
		
		if( GrabbableArrow.position.x > playing_field_dimension / 2 )
			GrabbableArrow.position.x = playing_field_dimension / 2;
		if( GrabbableArrow.position.x <-playing_field_dimension / 2 )
			GrabbableArrow.position.x =-playing_field_dimension / 2;
		if( GrabbableArrow.position.y > playing_field_dimension / 2 )
			GrabbableArrow.position.y = playing_field_dimension / 2;
		if( GrabbableArrow.position.y <-playing_field_dimension / 2 )
			GrabbableArrow.position.y =-playing_field_dimension / 2;
	}
	
	GrabbableArrow.position.z = camera.position.z - min_cameradist;
	
	var arrow_mindist;
	if( MODE === QC_SPHERE_MODE )
		arrow_mindist = 0;
	if( MODE === CK_MODE )
		arrow_mindist = 0.5;
	var height_holder = GrabbableArrow.position.z;
	GrabbableArrow.position.z = 0;
	if( GrabbableArrow.position.length() < arrow_mindist )
		GrabbableArrow.position.setLength( arrow_mindist );
	if( MODE === CK_MODE && GrabbableArrow.position.length() > 2.7 )
		GrabbableArrow.position.setLength( 2.7 );
	GrabbableArrow.position.z = height_holder;

	{
		var highlight_start_time = 452;
		var sizechange_time = 0.45;
		var mov_vector = new THREE.Vector3();
		if( highlight_start_time <= our_CurrentTime )
		{
			if( our_CurrentTime <= highlight_start_time + sizechange_time )
			{
				mov_vector.set( 0.02,0.02,0);
			}
			else if( our_CurrentTime <= highlight_start_time + sizechange_time * 2 )
				mov_vector.set( -0.02,-0.02,0);
		}
		GrabbableArrow.position.add(mov_vector);
		
		//will only vibrate if we've just drawn attention to it
		if( GrabbableArrow.excitation !== -1 && our_CurrentTime > highlight_start_time + sizechange_time * 2 )
		{
			GrabbableArrow.excitation += delta_t;
			var GAscale = 1 + 0.2 * Math.sin( GrabbableArrow.excitation * 3 );
			GrabbableArrow.scale.set( GAscale, GAscale, GAscale);
		}
	}
}

function init_Grabbable_Arrow()
{
	var GrabbableArrowDimension = 0.44;
	GrabbableArrow = new THREE.Mesh( new THREE.PlaneGeometry( GrabbableArrowDimension, GrabbableArrowDimension ),
									 new THREE.MeshBasicMaterial({ depthWrite: false, depthTest: false } ) );
	GrabbableArrow.renderOrder = 1; //yay, works
	GrabbableArrow.dimension = GrabbableArrowDimension;
	GrabbableArrow.grabbed = 0;
	GrabbableArrow.position.set(-playing_field_dimension * 0.5 / 2, -playing_field_dimension * 0.5 / 2, 0);
	
	GrabbableArrow.excitation = 0;
}