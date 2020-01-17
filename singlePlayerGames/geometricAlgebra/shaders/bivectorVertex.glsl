varying vec2 vUv;
varying vec3 worldPosition;

void main() 
{
	worldPosition = vec3(modelMatrix * vec4(position,1.));

	vec4 modelViewPosition = modelViewMatrix * vec4(position, 1.0);
	gl_Position = projectionMatrix * modelViewPosition;
	vUv = vec2(gl_Position);
}