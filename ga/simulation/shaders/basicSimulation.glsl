precision highp float;

varying vec2 vUV;

uniform sampler2D oldState;
uniform float deltaTime;
uniform vec2 dimensions;

uniform vec3 handPosition;

void main (void)
{
	float oldValue = texture2D(oldState, vUV).r;

	float newValue = clamp( oldValue - 0.0008, 0.,1.);

	vec3 pos = tSpaceToESpace(vUV);
	if(length(pos-handPosition) < 0.1)
		newValue += .03;

	gl_FragColor = vec4(newValue, 0.0, 0.0, 1.0); //can you get anything into alpha? Dunno
}