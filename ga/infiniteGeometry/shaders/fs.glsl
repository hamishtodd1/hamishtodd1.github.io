#version 320 es

varying vec3 worldP;

uniform float mvs[32];
//might be nice to process all the mvs in parallel

void main() {

	vec2 circleCenter = vec2(0.,0.);
	float circleRadius = mvs[0][0];
	float circleThickness = .01;
	float distToCenter = length(worldP.xy - circleCenter);
	if( abs(distToCenter-circleRadius) > circleThickness )
		discard;

	gl_FragColor = vec4(0.,0.,0., 1.0);
}