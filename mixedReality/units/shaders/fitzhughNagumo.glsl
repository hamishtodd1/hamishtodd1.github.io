precision highp float;

varying vec2 vUV;
uniform sampler2D oldState;

uniform float deltaTime;

uniform vec3 brush;
uniform vec2 dimensions;
uniform vec3 threeDDimensions;

const float a = .1;
const float b = .2;
const float h = 2.;
const float eps = .05;

vec4 laplacian(vec4 uv)
{
	float possibleLayer = 0.;
	float correctLayer = 0.;

	vec4 xInc = texture2D( oldState, vec2( vUV.x + 1./threeDDimensions.x, vUV.y ) );
	vec4 xDec = texture2D( oldState, vec2( vUV.x - 1./threeDDimensions.x, vUV.y ) );

	float possibleZIncY = vUV.y + 1./threeDDimensions.z;
	float zIncY = possibleZIncY < 1. ? possibleZIncY : vUV.y; //clamp
	vec4 zInc = texture2D( oldState, vec2( vUV.x, zIncY) );

	float possibleZDecY = vUV.y - 1./threeDDimensions.z;
	float zDecY = possibleZDecY > 0. ? possibleZDecY : vUV.y; //clamp
	vec4 zDec = texture2D( oldState, vec2( vUV.x, zDecY) );

	float possibleYIncY = vUV.y + 1./dimensions.y;
	possibleLayer = ceil(possibleYIncY*threeDDimensions.z);
	correctLayer = ceil(vUV.y*threeDDimensions.z);
	float yIncY = possibleLayer == correctLayer ? possibleYIncY : vUV.y; //clamp
	vec4 yInc = texture2D( oldState, vec2( vUV.x, yIncY ) );

	float possibleYDecY = vUV.y - 1./dimensions.y;
	possibleLayer = ceil(possibleYDecY*threeDDimensions.z);
	correctLayer = ceil(vUV.y*threeDDimensions.z);
	float yDecY = possibleLayer == correctLayer ? possibleYDecY : vUV.y; //clamp
	vec4 yDec = texture2D( oldState, vec2( vUV.x, yDecY ) );

	vec4 laplacian = ( xInc + xDec + yInc + yDec + zInc + zDec - 6. * uv );

	return laplacian;
}

void main(void)
{
	// get into the right space, possibly more needed outside
	// if(brush) { //something something
	// 	vec2 diff = (vUV - brush) / pixelStep;
	// 	float dist = dot(diff, diff);
	// 	if(dist < 5.0)
	// 	{
	// 		result.g = .9;
	// 	}
	// }

	vec4 uv = texture2D(oldState, vUV);
	float u = uv.r,  v = uv.g;
	
	float vnew = v + deltaTime*eps*(b*u - v);

	float du = deltaTime*(u*(1. - u)*(u - a) - v);
	du += laplacian(uv).r * deltaTime / (h*h);

	gl_FragColor = vec4(u + du, vnew, du, 0. );
}