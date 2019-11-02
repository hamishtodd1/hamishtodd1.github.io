//there was something here and below about opacity but wasn't being used
//"transparent" was there in the material.

attribute float vertexDisplacement; //doesn't change; specific to this vertex
varying vec3 vUv; //where you are in world (screen?) coordinates? clip space?

void main() 
{
	vec3 p = position;

	p.x += sin( vertexDisplacement * 10.0 ) * 0.1;

	vec4 modelViewPosition = modelViewMatrix * vec4(p, 1.0);
	gl_Position = projectionMatrix * modelViewPosition;
	vUv = vec3(gl_Position);
}