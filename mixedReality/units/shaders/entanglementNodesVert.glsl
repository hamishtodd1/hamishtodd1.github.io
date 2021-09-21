varying vec3 coordinates_of_this_pixel; //where you are in world (screen?) coordinates? clip space?

void main() 
{
	vec3 p = position;

	vec4 modelViewPosition = modelViewMatrix * vec4(p, 1.0);
	gl_Position = projectionMatrix * modelViewPosition;
	coordinates_of_this_pixel = vec3(gl_Position);
}