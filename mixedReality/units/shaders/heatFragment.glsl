precision highp float;
uniform		sampler2D uTexSamp;
varying		vec2 textureCoord;

void main(void)
{
	// vec4 t = texture2D(uTexSamp, textureCoord);
	gl_FragColor = vec4(t.r + 0.001, t.g + 0.001, u2, v2 );
}