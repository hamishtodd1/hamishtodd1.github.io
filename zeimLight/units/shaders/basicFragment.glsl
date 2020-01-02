/*
	May find this useful https://github.com/rreusser/glsl-fft
*/

uniform float numberGoingBetweenZeroAndOne;
varying vec2 vUv; //gets calculated first

uniform float atomCoords[6];

void main()
{
	float density = 0.;

	for(int i = 0; i < 2; i++)
	{
		if(length(vUv-vec2(atomCoords[i*3+0],atomCoords[i*3+1])) < .1)
			density += .5;
	}

	gl_FragColor = vec4(1.-density, 1.-density, 1.-density, 1.0);
}