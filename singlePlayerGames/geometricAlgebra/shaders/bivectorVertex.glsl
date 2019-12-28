attribute float vertexDisplacement;
varying vec3 vUv;

void main() 
{
	vec3 p = position;

	p.x += sin( vertexDisplacement * 10.0 ) * 0.1;

	vec4 modelViewPosition = modelViewMatrix * vec4(p, 1.0);
	gl_Position = projectionMatrix * modelViewPosition;
	vUv = vec3(gl_Position);
}