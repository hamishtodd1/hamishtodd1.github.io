precision highp float;

varying vec2 vUV;

uniform sampler2D oldState;
uniform float deltaTime;
uniform float dimension;

void main (void)
{
	float oldValue = texture2D(oldState, vUV).r;

	float newValue = oldValue;
	// if( newValue == 0.0 )
	// {
	// 	newValue = 1.0;
	// }
	// else
	// {
	// 	newValue = 0.0;
	// }

	gl_FragColor = vec4(newValue, 0.0, 0.0, 1.0); //can you get anything into alpha? Dunno
}