varying vec3 vUv; //where you are in world (screen?) coordinates? clip space?

void main() 
{
	vec3 p = position;
	gl_Position = projectionMatrix * modelViewPosition;
	vUv = vec3(gl_Position);
}