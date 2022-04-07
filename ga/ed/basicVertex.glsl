varying vec3 worldPosition;

void main() 
{
	worldPosition = (modelMatrix * vec4(position, 1.)).xyz;

	vec4 modelViewPosition = modelViewMatrix * vec4(position, 1.);
	gl_Position = projectionMatrix * modelViewPosition;
}