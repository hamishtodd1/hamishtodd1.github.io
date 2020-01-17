/*
	May find this useful https://github.com/rreusser/glsl-fft
	SDF and soft min
	https://www.iquilezles.org/www/articles/distfunctions/distfunctions.htm
*/

uniform float numberGoingBetweenZeroAndOne;
varying vec2 vUv; //gets calculated first
varying vec3 worldPosition;

//need to update this appropriately
#define numBlobs 10
#define numBlobCoords numBlobs*3
uniform float blobCoords[numBlobCoords];

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

	for(int i = 0; i < numBlobs; i++)
	{
		if(length(worldPosition-vec3(blobCoords[i*3+0],blobCoords[i*3+1],blobCoords[i*3+2])) < .3)
			density += .5;
	}

	if(density == 0.)
		discard;

	gl_FragColor = vec4(1.-density, 1.-density, 1.-density, 1.0);
}