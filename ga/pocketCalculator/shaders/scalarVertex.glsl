varying vec2 modelPosition;

void main() 
{
	modelPosition = position.xy;

	gl_Position = projectionMatrix * viewMatrix * modelMatrix * vec4(position, 1.);
}