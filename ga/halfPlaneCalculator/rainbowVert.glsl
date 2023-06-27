#define PI 3.1415926538
#define TAU 6.28318530718

varying float interpV;
varying vec2 pos;

uniform float[16] plane;

void main()
{
	vec2 originCornered = position.xy + .5;

	float radius = .4;
	float thickness = .04;
	float r = radius + thickness * position.x;
	float theta = originCornered.y * TAU;

	pos = vec2(r*cos(theta),r*sin(theta));

	interpV = 1.-originCornered.x;

	vec4 modelViewPosition = modelViewMatrix * vec4(pos,0., 1.);
	gl_Position = projectionMatrix * modelViewPosition;
}