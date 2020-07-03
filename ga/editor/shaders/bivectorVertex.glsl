varying vec3 pixelPosition;

void main() 
{
	pixelPosition = position;
	gl_Position = projectionMatrix * viewMatrix * vec4(position, 1.); //Model matrix should be the identity!
}