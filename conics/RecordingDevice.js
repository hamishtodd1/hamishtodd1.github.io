function RecordingDevice(num_models, num_pictures)
{
	var RecordingDevice = {};
	
	this.capture_rate = 30;
	this.total_seconds = 60 * 7;
	this.status = 2;
	
	RecordingDevice.States = Array( 3 * this.capture_rate * this.total_seconds + 1 ); //one extra so we don't have to worry about last state
	
	var object_last_ws = Array(1,1,-1,1);//if an object ends up... upside down or whatever, set its to -1?
	for( var i = 0, il = RecordingDevice.States.length; i < il; i++ )
	{
		RecordingDevice.States[i] = {};
		
		RecordingDevice.States[i].recorded_in = 0;
		
		RecordingDevice.States[i].object_positions = Array(num_models);
		RecordingDevice.States[i].object_quaternions = Array(num_models);
		
		for(var j = 0; j < RecordingDevice.States[i].object_positions.length; j++)
		{
			RecordingDevice.States[i].object_positions[j] = new THREE.Vector3(
					hepa_demo_model_positions[j][i*3+0],
					hepa_demo_model_positions[j][i*3+1],
					hepa_demo_model_positions[j][i*3+2]
				);
			RecordingDevice.States[i].object_quaternions[j] = new THREE.Quaternion(
					hepa_demo_model_positions[j][i*3+0],
					hepa_demo_model_positions[j][i*3+1],
					hepa_demo_model_positions[j][i*3+2],
					0 //don't do anything yet
				);
			RecordingDevice.States[i].object_quaternions[j].w = 1 - (
				RecordingDevice.States[i].object_quaternions[j].x * RecordingDevice.States[i].object_quaternions[j].x +
				RecordingDevice.States[i].object_quaternions[j].y * RecordingDevice.States[i].object_quaternions[j].y +
				RecordingDevice.States[i].object_quaternions[j].z * RecordingDevice.States[i].object_quaternions[j].z );
			if(RecordingDevice.States[i].object_quaternions[j].w >= 0)
				RecordingDevice.States[i].object_quaternions[j].w = Math.sqrt(RecordingDevice.States[i].object_quaternions[j].w);
			else
				RecordingDevice.States[i].object_quaternions[j].w = 0;
			
			if( Math.abs( object_last_ws[j] - RecordingDevice.States[i].object_quaternions[j].w ) > 
				Math.abs( object_last_ws[j] + RecordingDevice.States[i].object_quaternions[j].w )
				) //"would it be closer to the previous one if multiplied by -1?"
				RecordingDevice.States[i].object_quaternions[j].w *= -1; //the more accurate thing to do would be to make both and see which is "closer"? Might come down to same thing
			
			object_last_ws[j] = RecordingDevice.States[i].object_quaternions[j].w;
		}
		
		RecordingDevice.States[i].picture_scales = Array(num_pictures);
		for(var j = 0; j < RecordingDevice.States[i].picture_scales.length; j++)
			RecordingDevice.States[i].picture_scales[j] = hepa_demo_picture_scales[j][i];
	}
	
	this.time_through_animation = 0;
	this.time_through_recording = 0;
	
	RecordingDevice.update = function(Models,Users, Images)
	{
		if( this.status == 1 ) //recording
		{
			this.time_through_recording += delta_t;
			if( this.time_through_recording > this.total_seconds ) //you shouldn't let this happen
			{
				this.time_through_recording -= this.total_seconds;
				console.log("roll over");
			}
			
			var state_index = Math.round( this.time_through_recording * this.capture_rate );
			 
			for(var i = 0; i < Models.length; i++ )
			{
				Models[i].updateMatrixWorld();
				Models[i].getWorldPosition( RecordingDevice.States[state_index].object_positions[i] );
				Models[i].getWorldQuaternion( RecordingDevice.States[state_index].object_quaternions[i] );
			}
			
			for( var i = 0; i < Images.length; i++)
			{
				if( Images[i].scale.x === 16 )
					RecordingDevice.States[state_index].picture_scales[i] = 16;
				else
					RecordingDevice.States[state_index].picture_scales[i] = 1;
			}
			
			RecordingDevice.States[state_index].recorded_in = 1;
		}
		else if( this.status == 2 )
		{
			Camera.position.set(0,0,0);
			
			var Model_appearance_time = Array(185,82.7,17.3);
			for(var i = 0; i < Models.length; i++ )
			{
				if( video.currentTime < Model_appearance_time[i] )
					Models[i].visible = false;
				else
					Models[i].visible = true;
			}
			
			var time_addition = 9.62;
			
			if( typeof video === 'undefined')
				this.time_through_animation += delta_t; //later you want to get the time from the video
			else
				this.time_through_animation = video.currentTime + time_addition;
			
			if( this.time_through_animation > this.total_seconds )
				this.time_through_animation -= this.total_seconds;
			if( this.time_through_animation < 0)
				this.time_through_animation = 0;
			
			var animation_bottom_state_number = Math.floor( this.time_through_animation * this.capture_rate );
			
			var inter_state_amt = this.time_through_animation * this.capture_rate - animation_bottom_state_number;
			
			for(var i = 0; i < Models.length; i++ )
			{	
				Models[i].position.copy( RecordingDevice.States[ animation_bottom_state_number ].object_positions[i] );
				Models[i].position.lerp( RecordingDevice.States[animation_bottom_state_number+1].object_positions[i], inter_state_amt );
				
				Models[i].quaternion.copy(  RecordingDevice.States[animation_bottom_state_number].object_quaternions[i] );
				Models[i].quaternion.slerp( RecordingDevice.States[animation_bottom_state_number+1].object_quaternions[i], inter_state_amt );
			}
			
			//we're going to do the "head quaternion rotates stuff"
			
			for( var i = 0; i < Images.length; i++)
			{
				if(RecordingDevice.States[animation_bottom_state_number].picture_scales[i] === 1)
					Images[i].scale.set(
							0.0001,
							0.0001,
							0.0001 );
				else
					Images[i].scale.set(
							RecordingDevice.States[animation_bottom_state_number].picture_scales[i],
							RecordingDevice.States[animation_bottom_state_number].picture_scales[i],
							RecordingDevice.States[animation_bottom_state_number].picture_scales[i] );
			}
		}
	}
	
	document.addEventListener( 'keydown', function(event)
	{
//		if(event.keyCode === 13 ) //enter
//		{
//			event.preventDefault();
//			
//			if( RecordingDevice.status !== 1 )
//			{
//				console.log("rolling");
//				console.log(AudienceHead)
//				AudienceHead.children[0].material.color.r = 1;
//				AudienceHead.children[0].material.needsUpdate = true;
//				RecordingDevice.status = 1;
//				RecordingDevice.time_through_recording = 0;
//				
//				for(var i = 0; i < RecordingDevice.States.length; i++)
//					RecordingDevice.States[i].recorded_in = 0;
//			}
//			else
//			{
//				console.log("cut");
//				AudienceHead.children[0].material.color.r = 0;
//				AudienceHead.children[0].material.needsUpdate = true;
//				RecordingDevice.status = 0;
//				
//				//set the rest of it to be equal to the last "frame"
//				var j;
//				for(var i = 0, il = RecordingDevice.States.length; i < il; i++ )
//				{
//					if( RecordingDevice.States[i].recorded_in === 0 )
//					{
//						for( j = 0; j < 3; j++)
//						{
//							RecordingDevice.States[i].object_positions[j].copy(  RecordingDevice.States[i-1].object_positions[j]  );
//							RecordingDevice.States[i].object_quaternions[j].copy(RecordingDevice.States[i-1].object_quaternions[j]);
//						}
//					}
//				}
//			}
//			
//			return;
		}
				
		if(event.keyCode === 32 ) //spacebar
		{
			event.preventDefault();
			
			if( RecordingDevice.status !== 2 )
			{
				console.log("play");
				RecordingDevice.status = 2;
				RecordingDevice.time_through_animation = 0;
			}	
			else
			{
				console.log("stop");
				RecordingDevice.status = 0;
			}
			
			return;
		}
				
//		if(event.keyCode === 80 ) //p
//		{
//			event.preventDefault();
//			
//			var outputstring = '';
//			
//			var num_models = 3;
//			
//			outputstring += "hepa_demo_model_positions = Array(" + num_models.toString() + ");\n";
//			for(var j = 0; j < num_models; j++)
//			{
//				outputstring += "hepa_demo_model_positions[" + j.toString() + "] = new THREE.Float32Array([";
//				
//				for(var i = 0; i < RecordingDevice.States.length; i++ )
//				{
//					outputstring += RecordingDevice.States[i].object_positions[j].x.toString() + ",";
//					outputstring += RecordingDevice.States[i].object_positions[j].y.toString() + ",";
//					outputstring += RecordingDevice.States[i].object_positions[j].z.toString() + ",";
//				}
//				
//				outputstring += "]);\n";
//			}
//			
//			outputstring += "hepa_demo_model_quaternions = Array(" + num_models.toString() + ");\n";
//			for(var j = 0; j < num_models; j++)
//			{
//				outputstring += "hepa_demo_model_quaternions[" + j.toString() + "] = new THREE.Float32Array([";
//				
//				for(var i = 0; i < RecordingDevice.States.length; i++ )
//				{
//					outputstring += RecordingDevice.States[i].object_quaternions[j].x.toString() + ",";
//					outputstring += RecordingDevice.States[i].object_quaternions[j].y.toString() + ",";
//					outputstring += RecordingDevice.States[i].object_quaternions[j].z.toString() + ",";
//					outputstring += RecordingDevice.States[i].object_quaternions[j].w.toString() + ",";
//				}
//				
//				outputstring += "]);\n";
//			}
//			
//			var num_pictures = 4;
//			outputstring += "hepa_demo_picture_scales = Array(" + num_pictures.toString() + ");\n";
//			for(var j = 0; j < num_pictures; j++)
//			{
//				outputstring += "hepa_demo_picture_scales[" + j.toString() + "] = new THREE.Float32Array([";
//				
//				for(var i = 0; i < RecordingDevice.States.length; i++ )
//				{
//					outputstring += RecordingDevice.States[i].picture_scales[j].toString() + ",";
//				}
//				
//				outputstring += "]);\n";
//			}
//				
//			console.log(outputstring);
//			
//			return;
//		}
	}, false );
	
	return RecordingDevice;
}