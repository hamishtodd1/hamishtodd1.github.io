/*
	Opinions about catcalling, creepiness, and flirting all fit on a graph:
		man's confidence that a woman would like to have sex with him

	1-manifolds, how to do?
	cuts are a problem for all
	The cut is a "discard" in the fragment shader. Don't use threejs planes, you can probably figure it out yourself
	Two meshes, one for the triangle on either side of the cut
	And if it's more than just a cut? A triangle with a singularity in it?

	So the projectionSurface is a separate mesh
		In here, we have its

	If you want nice lighting you'll need a normal map
*/

precision highp float;

varying vec3 vUv;

uniform mediump sampler2D projectionSurface;

const float TAU = 6.283185307179586;

const float pixelWidth = 1. / 3.;
uniform float pixelHeight; //CHANGE

float sq(float a)
{
	return a*a;
}

const float floatMaxIWish = 9999999999.;
//-1 if no intersection
float rayTriangleIntersection(
	vec3 rayOrigin,
	vec3 rayDirection, //normalized?
	float triangleIndex )
{
	vec2 texCoord = vec2(
		pixelWidth  * (.5 + 0.),
		pixelHeight * (.5 + triangleIndex) );
	vec3 vertex0 = texture2D(projectionSurface, texCoord ).rgb;
	texCoord.x += pixelWidth;
	vec3 vertex1 = texture2D(projectionSurface, texCoord ).rgb;
	texCoord.x += pixelWidth;
	vec3 vertex2 = texture2D(projectionSurface, texCoord ).rgb;

	vec4 result; //w = 0 no intersection, w = 1 intersection
	result.w = 0.; //no intersection

	vec3 edge1, edge2, h, vertex0ToRayOrigin, q;
	float a,f,u,v;
	edge1 = vertex1 - vertex0;
	edge2 = vertex2 - vertex0;

	const float EPSILON = 0.0000001;

	h = cross(rayDirection,edge2);
	a = dot(edge1,h);
	if( a > -EPSILON && a < EPSILON)
		return floatMaxIWish;    // This ray is parallel to this triangle.

	f = 1./a; // if this is huge, transversal
	vertex0ToRayOrigin = rayOrigin - vertex0;
	u = f * dot(vertex0ToRayOrigin,h);
	if( u < 0.0 || u > 1. )
		return floatMaxIWish;

	q = cross(vertex0ToRayOrigin,edge1);
	v = f * dot(rayDirection,q);
	if( v < 0. || u + v > 1. )
		return floatMaxIWish; //if both of these are edge-checking, surely there's a third?

	float t = f * dot(edge2,q);
	return t;
}

void main() 
{
	vec3 mappedP = position;

	vec3 normalizedGlobeSurfacePoint = normalize(position);

	//store lat and long instead?

	if( 0 == 1 )
	{
		float rayTriangleResult;
		float t = floatMaxIWish;
		float numTriangles = 1./pixelHeight;
		vec3 origin = vec3(0.,0.,0.);
		for(float i = 0.; i < numTriangles; i++)
		{
			rayTriangleResult = rayTriangleIntersection(origin, normalizedGlobeSurfacePoint, i );
			t = min( t, rayTriangleResult );
		}
		if(t < floatMaxIWish)
		{
			mappedP = normalizedGlobeSurfacePoint * t;
		}
	}

	float projectedOnEquatorDiskLength = sqrt(sq(position.x)+sq(position.z));
	float lat = acos( projectedOnEquatorDiskLength / length(position) );
	lat *= sign(position.y);
	float lon = atan(position.x,position.z);

	float rho = TAU/4. - lat;
	float E = lon * cos(lat) / rho;
	mappedP.x = rho * sin(E);
	mappedP.y =-rho * cos(E);
	mappedP.z = 0.;
	mappedP *= .1;

	vec4 modelViewPosition = modelViewMatrix * vec4(mappedP, 1.0);
	gl_Position = projectionMatrix * modelViewPosition; //actually you may want to rotate the globe first
	vUv = vec3(gl_Position);

	//actually that is slightly supposed to come after 
}



//does not "clip"
// vec4 rayTriangleIntersection(
// 	vec3 rayOrigin,
// 	vec3 rayDirection, //normalized?
// 	float triangleIndex )
// {
// 	vec2 texCoord = vec2(
// 		pixelWidth  * (.5 + 0.),
// 		pixelHeight * (.5 + triangleIndex) );
// 	vec3 vertex0 = texture2D(projectionSurface, texCoord ).rgb;
// 	texCoord.x += pixelWidth;
// 	vec3 vertex1 = texture2D(projectionSurface, texCoord ).rgb;
// 	texCoord.x += pixelWidth;
// 	vec3 vertex2 = texture2D(projectionSurface, texCoord ).rgb;

// 	//instead of vertices could have normals and constants
// 	vec3 normal = normalize( cross(vertex2-vertex0,vertex1-vertex0) );

// 	return vec4(vertex2,1.);

// 	float constant = -dot( vertex0, normal );

// 	float denominator = dot( normal, rayDirection );
// 	if( denominator == 0. ) // line is coplanar
// 	{
// 		return vec4(rayOrigin.xyz,0.);
// 	}
// 	float t = -( dot( rayOrigin, normal ) + constant ) / denominator;

// 	return vec4(constant,0.,0.,1.);

// 	return vec4(rayOrigin + rayDirection * t, 1.);
// }