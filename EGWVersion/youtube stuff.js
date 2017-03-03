/*
 * The rule is: the pure version has all the capabilities. This file, and maybe others, is where things become organized.
 * 
 * TODO
 * Flash 10 etc is required,  check for that
 * Switch between multiple videos so they don't see the time! 
 * The obvious thing would be all the chapters as different videos, but you don't *need* that, so no need to have it necessarily. Better parallel with the static version?
 * Calculate it so that you get as much out of them as possible
 * Something like: the first takes you up to the end of the shaking demo. There's a clear break; if you've gotten this far, then hey, no need to lie to you
 * 
 * 
 * NO INTERDEPENDENCE. You can have dependence on time, nothing else, no variables that need updating.
 * 
 */

var our_CurrentTime = 0;

var last_timeupdate = 0;

var rolling_sum = 0;
var num_samples_taken = 0;

function react_to_video()
{
	Update_story();
}

function loadpic(url, type, index) {
	texture_loader.load(
			url,
		function(texture) {
			if(type === 0)
				virus_textures[index] = texture;
			if(type === 1)
				random_textures[index] = texture;
			if(type === 2)
				slide_textures[index] = texture;
			
			pictures_loaded++;

			if(pictures_loaded === virus_textures.length + random_textures.length + slide_textures.length ) {
				bind_pictures();
			}
		},
		function ( xhr ) {}, function ( xhr ) {
			console.log( 'texture loading error, switch to using the other code in this function' );
		}
	);
}

load_AV_stuff();
YOUTUBE_READY = 1;
init();