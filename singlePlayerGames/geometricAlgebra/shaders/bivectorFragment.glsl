/*
	May find this useful https://github.com/rreusser/glsl-fft
	SDF and soft min
	https://www.iquilezles.org/www/articles/distfunctions/distfunctions.htm
*/

uniform float numberGoingBetweenZeroAndOne;
varying vec2 vUv; //gets calculated first

//need to update this appropriately
uniform float blobCoords[30];

uniform float smooshedness;

//from https://www.iquilezles.org/www/articles/smin/smin.htm
float smin( float d1, float d2 )
{
    float h = max( smooshedness-abs(d1-d2), 0. ) / smooshedness;
    return min( d1, d2 ) - h*h*smooshedness*(1./4.);
}

void main()
{
	float density = 0.;

	for(int i = 0; i < 4; i++)
	{
		if(length(vUv-vec2(blobCoords[i*3+0],blobCoords[i*3+1])) < .3)
			density += .5;
	}

	gl_FragColor = vec4(1.-density, 1.-density, 1.-density, 1.0);
}