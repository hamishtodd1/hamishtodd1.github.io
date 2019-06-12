precision highp float;
uniform sampler2D wholeTexture;
varying vec2 vUv; //possibly not what you want, worry later

//the thing to do is to have a material that you don't have to see but it holds the texture
/*
	Two offscreen textures. Are they even needed in scene? God hope you don't need to see them for frag to update


	The place to start
		put one color on one side and one on t'other
		T
*/

void main(void)
{
	vec4 texturePixelValue = texture2D( wholeTexture, vUv );

	float r = .0;
	if( texturePixelValue.x < 0.5 )
	{
		r = 1.0;
	}

	gl_FragColor = vec4( r, .0, .0, 1.);
}
