precision highp float;

varying vec2 vUV;

uniform sampler2D oldState;
uniform float deltaTime;
uniform vec2 dimensions;

uniform vec3 handPosition;

void main (void)
{
	vec4 oldValue = texture2D(oldState, vUV);

	vec4 newValue = clamp( oldValue - 0.0004, 0.,1.);

	vec3 pos = tSpaceToESpace(vUV);
	if(length(pos-handPosition) < 0.1)
		newValue.r += .013;

	gl_FragColor = newValue;
}