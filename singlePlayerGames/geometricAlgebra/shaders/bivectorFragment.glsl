/*
	May find this useful https://github.com/rreusser/glsl-fft
	SDF and soft min
	https://www.iquilezles.org/www/articles/distfunctions/distfunctions.htm

	local except for cameraPosition unless stated otherwise
*/

varying vec3 pixelPosition;

//need to update this appropriately!!
#define numBlobs 60
uniform vec3 positions[numBlobs];

uniform vec3 bivector;

uniform float radius;
#define eps = .001

//from https://www.iquilezles.org/www/articles/smin/smin.htm
uniform float smooshedness;
float smoothMin( float d1, float d2 )
{
    float h = max( smooshedness-abs(d1-d2), 0. ) / smooshedness;
    return min( d1, d2 ) - h*h*smooshedness*(1./4.);
}

float getDistance(vec3 p)
{
	float dist = 99999999.;
	float distToThisOnesSurface;

	for(int i = 0; i < numBlobs; i++)
	{
		distToThisOnesSurface = distance(p,positions[i]) - radius;
		dist = smoothMin(distToThisOnesSurface,dist);
	}

	return dist;
}

//could use an XHR environment map
// float getLightIntensityAtPoint(vec3 p, vec3 viewerDirection, vec3 normal )
// {
// 	float ks = .007;
// 	float kd = 1.;
// 	float ka = 1.;
// 	float shininess = 4.;
// 	float ambientIntensity = .5;

// 	//light assumed to have diffuse and specular = 1
// 	//and is a white light = (1,1,1), otherwise you might multiply by its color

// 	float intensity = 0.;
// 	intensity += ka * ambientIntensity;
	
// 	vec3 pointLightDirection = normalize(pointLightPosition - p);
// 	intensity += kd * max(0.,dot( pointLightDirection, normal ));

// 	vec3 perfectlyReflectedDirection = 2. * dot(pointLightDirection, normal) * normal - pointLightDirection;
// 	intensity += ks * pow( max(0.,dot( perfectlyReflectedDirection, viewerDirection )), shininess );

// 	return intensity;
// }

void main()
{
	vec3 direction = normalize( pixelPosition - cameraPosition );
	//we assume we are in world space

	//man, intersection of a line and a plane. If only there was some mathematical system able to help with this
	//this is temporary, they're all just z
	vec3 planeIntersection = pixelPosition - direction * (pixelPosition.z / direction.z);
	float distance = getDistance(planeIntersection); //not a distance function but an isosurface
	//ideally write to depth buffer too

	//could put this condition in the opacity to avoid a branch
	if( distance < .001)
		gl_FragColor = vec4(1., 0., 0., 1.);
	else
		discard;
}