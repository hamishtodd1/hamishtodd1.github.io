/*
	May find this useful https://github.com/rreusser/glsl-fft

	But you need the fourier transform of the structure factors first
 
	Dynamicland version
		Feels like you should just need the position of the source and the sample
*/

uniform float numberGoingBetweenZeroAndOne;
varying vec2 vUv; //gets calculated first

uniform float structureFactors[6];

void main()
{
	float density = 0.;

	for(int i = 0; i < 2; i++)
	{
		if(length(vUv-vec2(structureFactors[i*3+0],structureFactors[i*3+1])) < .1)
			density += .5;
	}

	gl_FragColor = vec4(1.-density, 1.-density, 1.-density, 1.0);
}