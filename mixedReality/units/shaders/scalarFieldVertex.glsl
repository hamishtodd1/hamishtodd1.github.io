varying vec3 pointOnFace;

void main() 
{
	pointOnFace = position;
	//could maybe calculate where you terminate as well, since you maybe have better access to the mesh here?
	gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}