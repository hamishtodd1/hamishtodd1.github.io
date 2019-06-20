varying vec3 pointOnFace;

void main() 
{
	pointOnFace = position;
	gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}