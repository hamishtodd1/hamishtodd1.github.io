precision highp float;

varying vec2 vUV;
uniform sampler2D oldState;

uniform vec2 dimensions;
uniform vec3 threeDDimensions;

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

const float a = .8, b = .001, dt = .05* .02, eps = .007, h = .2* .607,
			dte = dt/eps, ba = b/a, dtOverHSq = dt/(h*h);

void main (void)
{
	vec4 uv = texture2D(oldState,vUV);
	float u = uv.r;
	float v = uv.g;

	// float unew = u + laplacian().r * 0.1;
	// float vnew = v;

	float vnew = v + (u - v)*dt;
	float uth = v/a + ba;
	float unew;
	float tmp = dte*(u - uth);
	if( u <= uth)
	{
		unew = u/(1. - tmp*(1. - u));
	}
	else
	{
		tmp *= u;
		unew = (tmp + u)/(tmp + 1.);
	}
	unew += laplacian(uv).r * dtOverHSq;

	gl_FragColor = vec4(unew,vnew, 0.0, 1.0);
}