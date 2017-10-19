var InstructionalVideos = Array(5);

function initVideo()
{	
	for(var i = 0; i < InstructionalVideos.length; i++)
	{
		InstructionalVideos[i] = document.createElement( 'video' );
		InstructionalVideos[i].src = "http://hamishtodd1.github.io/BrowserProsenter/Data/MidlothianVideo/edited_" + String(i + 1) + ".ogv";
		InstructionalVideos[i].crossOrigin = "anonymous";
		
		InstructionalVideos[i].id = 'video';
		InstructionalVideos[i].type = 'video/ogg; codecs="theora, vorbis" ';
		
		InstructionalVideos[i].load(); // must call after setting/changing source
		
		InstructionalVideos[i].Image = document.createElement( 'canvas' );
		InstructionalVideos[i].Image.width = 256;
		InstructionalVideos[i].Image.height = 640;

		InstructionalVideos[i].ImageContext = InstructionalVideos[i].Image.getContext( '2d' );
		// background color if no video present
		InstructionalVideos[i].ImageContext.fillStyle = '#000000';
		InstructionalVideos[i].ImageContext.fillRect( 0, 0,InstructionalVideos[i].Image.width, InstructionalVideos[i].Image.height );

		InstructionalVideos[i].Texture = new THREE.Texture( InstructionalVideos[i].Image );
		InstructionalVideos[i].Texture.minFilter = THREE.LinearFilter;
		InstructionalVideos[i].Texture.magFilter = THREE.LinearFilter;
		
		var scalefactor = 2.5;
		InstructionalVideos[i].sceneObject = new THREE.Mesh( 
				new THREE.PlaneGeometry( 0.256*scalefactor,0.64*scalefactor ),
				new THREE.MeshBasicMaterial( { map: InstructionalVideos[i].Texture, overdraw: true, side:THREE.DoubleSide } ) );
		InstructionalVideos[i].sceneObject.position.set(0,0,-1);
	}
}

var Storypage = 0;
var page_timer = 3;//a bit of time to settle in

function update_video()
{
	for(var i = 0; i < InstructionalVideos.length; i++)
		if( typeof InstructionalVideos[i] === 'undefined' || InstructionalVideos[i].readyState !== InstructionalVideos[i].HAVE_ENOUGH_DATA)
			return;
	
	var intra_video_times = Array(4);
	intra_video_times[0] = 7;
	intra_video_times[1] = intra_video_times[0]	* 0.8;
	intra_video_times[2] = 19; //sand rises
	intra_video_times[3] = 1; //from now they're just in case
	intra_video_times[4] = 1;
	intra_video_times[5] = 1; 
	
	if(Storypage % 2 === 0 )
	{
		page_timer -= delta_t;
		if( page_timer < 0.05 ) //done waiting
		{
			page_timer = 0;
			
			Storypage++;
			
			var video_index = (Storypage - 1 ) / 2;
			
			if( video_index < InstructionalVideos.length - 1 ) //got another video to play
			{
				if( video_index >= 1 )
					Scene.remove(InstructionalVideos[video_index - 1].sceneObject);
				
				Scene.add(InstructionalVideos[video_index].sceneObject);
				InstructionalVideos[video_index].play();
			}
		}
	}
	
	if(Storypage % 2 === 1 && Storypage / 2 < InstructionalVideos.length - 1 ) //we're watching a video
	{
		InstructionalVideos[(Storypage - 1 ) / 2].ImageContext.drawImage( InstructionalVideos[(Storypage - 1 ) / 2], 0, 0 );
		if( InstructionalVideos[(Storypage - 1 ) / 2].Texture ) 
			InstructionalVideos[(Storypage - 1 ) / 2].Texture.needsUpdate = true;
		
		if( InstructionalVideos[(Storypage - 1 ) / 2].paused ) //done, time to move on
		{
			page_timer = intra_video_times[ (Storypage - 1 ) / 2 ];
			Storypage++;
			
			if(Storypage === 6 )
			{
				sand_risenness = 0; //changed from -1
				Scene.remove(Walls);
			}
		}
	}
	
	
	
	//video.pause();
	//video.play();
	//video.paused
	//video.currentTime = 0;
}
	
//var Storypage = -1; //set to a silly number initially so we know that the first page will be triggered.
//var Story_states = [];
//
//function Update_story()
//{
//	if( Storypage !== -1 && Story_states[Storypage].prevent_playing )
//		if(ytplayer.getPlayerState() === 1)// 1 means playing,not allowed (although maybe some people like to have order designated for them?)
//			ytplayer.pauseVideo();
//	
//	console.log(our_CurrentTime)
//	for(var i = 0; i < Story_states.length; i++)
//	{
//		//if you're on the nose of the state's startingtime, you're in that state
//		if(	Story_states[i].startingtime <= our_CurrentTime && 
//		  ( i === Story_states.length - 1 || our_CurrentTime < Story_states[i+1].startingtime ) )
//		{
//			if( Storypage === i ) //nothing need be done
//				return;
//			
//			Storypage = i;
//			break;
//		}
//		
//		if( i === Story_states.length - 1 )
//			console.error("no story state found for current time")
//	}
//	
//	//slide can be a video or an image
//	if(Story_states[Storypage].slide_number !== -1 )
//	{
//		VisibleSlide.material.map = slide_textures[ Story_states[Storypage].slide_number ];
//		VisibleSlide.material.needsUpdate = true;
//	}
//		
//	if(Storypage > 0 && Story_states[Storypage-1].pause_at_end )
//		ytplayer.pauseVideo();
//
//	//ytplayer.pauseVideo();
//	//ytplayer.seekTo();
//	
//	if(Story_states[Storypage].offer_virus_selection)
//		add_virus_selection_to_scene();
//	else
//		for( var i = 0; i < clickable_viruses.length; i++ )
//			scene.remove(clickable_viruses[i]);
//	
//	if( Story_states[Storypage].MODE !== MODE )
//		ChangeScene(Story_states[Storypage].MODE );
//}
//
//function init_story()
//{	
//	var ns; //new state
//	
//	Story_states.push({
//		startingtime: -1, //this is just the prototype state, not really used!
//		
//		MODE: SLIDE_MODE,
//		
//		pause_at_end: 0, //at end because when you unpause it's usually a new thought
//		unpause_after: -1,
//		
//		slide_number: -1,
//		
//		skip_ahead_to: -1,
//		
//		offer_virus_selection: 0,
//		
//		prevent_playing: 0
//	});
//	
//	ns = default_clone_story_state(1);
//	ns.startingtime = 0; //zika virus
//	Story_states.push(ns);
//
//	for(var i = 0; i < Story_states.length; i++ )
//		if(Story_states[i].slide_number !== -1 )
//			Story_states[i].MODE = SLIDE_MODE;
//	
//	for(var i = 0; i < Story_states.length - 1; i++ )
//		if( Story_states[i].startingtime >= Story_states[i+1].startingtime )
//			console.error("bad starting time for number ", i);
//}
//
//var next_slide = 0;
////clone the previous state and give it a different time
//function default_clone_story_state( shows_a_slide )
//{
//	var default_page_duration = 1.2;
//	
//	var new_story_state = {};
//	
//	for(var propt in Story_states[Story_states.length - 1]){
//	    new_story_state[propt] = Story_states[Story_states.length - 1][propt];
//	}
//	
//	if( shows_a_slide === 1 )
//	{
//		new_story_state.slide_number = next_slide; //quite rare that you want to keep a slide
//		next_slide++;
//	}
//	else
//		new_story_state.slide_number = -1; //quite rare that you want to keep a slide
//	
//	new_story_state.offer_virus_selection = 0; //in general
//	
//	new_story_state.skip_ahead_to = -1;
//	
//	new_story_state.prevent_playing = 0;
//	
//	new_story_state.pause_at_end = 0;
//	new_story_state.unpause_after = -1;
//	
//	new_story_state.startingtime += default_page_duration;
//	
//	return new_story_state;
//}