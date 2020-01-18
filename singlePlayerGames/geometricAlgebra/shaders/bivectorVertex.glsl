varying vec2 vUv;
varying vec3 pixelPosition;

void main() 
{
	pixelPosition = position;

	vec4 modelViewPosition = modelViewMatrix * vec4(position, 1.0);
	gl_Position = projectionMatrix * modelViewPosition;
	vUv = vec2(gl_Position);
}