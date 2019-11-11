/*
	Previously here we were gonna transform the vertices
*/

precision highp float;
varying vec2 texturePosition;

void main(void)
{
	texturePosition = uv;
	gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.);
}