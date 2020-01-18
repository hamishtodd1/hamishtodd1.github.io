/*
	May find this useful https://github.com/rreusser/glsl-fft
	SDF and soft min
	https://www.iquilezles.org/www/articles/distfunctions/distfunctions.htm

	local except for cameraPosition unless stated otherwise
*/

varying vec3 pixelPosition;
uniform mat4 matrixWorldInverse;

//need to update this appropriately!!
#define numBlobs 10
#define numBlobCoords numBlobs*3
uniform float blobCoords[numBlobCoords];

//from https://www.iquilezles.org/www/articles/smin/smin.htm
#define smooshedness .5
float smoothMin( float d1, float d2 )
{
    float h = max( smooshedness-abs(d1-d2), 0. ) / smooshedness;
    return min( d1, d2 ) - h*h*smooshedness*(1./4.);
}

#define radius .5

float getClosest(vec3 p)
{
	float dist = 99999999.;
	float distToThisOnesSurface;
	for(int i = 0; i < numBlobs; i++)
	{
		distToThisOnesSurface = distance(p,vec3(blobCoords[i*3+0],blobCoords[i*3+1],blobCoords[i*3+2])) - radius;
		dist = smoothMin(distToThisOnesSurface,dist);
	}

	return dist;
}

void main()
{
	vec3 currentLocation = vec3( matrixWorldInverse * vec4(cameraPosition,1.) );
	vec3 direction = normalize( pixelPosition - currentLocation );

	float distance;
	#define totalSteps 14
	for(int i = 0; i < totalSteps; i++)
	{
		distance = getClosest(currentLocation);
		currentLocation += direction * distance;
	}

	//could put this condition in the opacity to avoid a branch
	if( distance < .001)
		gl_FragColor = vec4(1., 0., 0., 1.);
	else
		discard;
}