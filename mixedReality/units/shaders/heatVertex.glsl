precision highp float;
attribute	vec2 aTexCoord;
varying		vec2 textureCoord;

void main(void)
{
	gl_Position = vec4(position, 1.);
	textureCoord = aTexCoord;
}