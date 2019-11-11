/*
	Previously here we were gonna transform the vertices
*/

precision highp float;
varying vec2 ndc;

void main(void)
{
	ndc = uv*2. - vec2(1.,1.);
	gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.);
}