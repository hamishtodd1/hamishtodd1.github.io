varying vec3 worldP;

void main() 
{
	vec4 modelViewPosition = modelViewMatrix * vec4(position, 1.0);
    worldP = modelViewPosition.xyz;
	gl_Position = projectionMatrix * modelViewPosition;
}