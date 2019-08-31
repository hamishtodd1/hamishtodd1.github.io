precision highp float;

varying vec2 vUV;
uniform sampler2D oldState;

uniform vec2 dimensions;
uniform vec3 threeDDimensions;

const float dt = .5;
const float a = .1;
const float b = .2;
const float h = 2.;
const float eps = .05;

//NEED TO DO BOUNDARY CONDITIONS YOURSELF
vec4 laplacian(vec2 uv)
{
	vec4 xUp = texture2D( oldState, vUV + vec2( 1./threeDDimensions.x,0.));
	vec4 xDn = texture2D( oldState, vUV + vec2(-1./threeDDimensions.x,0.));

	float possibleYUp = vUV.y + 1./dimensions.y;
	float yUp = possibleYUp < 1 ? possibleYUp : 
	vec2 uvYUp = 


	vec4 uv2 = texture2D( oldState, vUV + vec2( 0., 1./dimensions.y ) );
	vec4 uv3 = texture2D( oldState, vUV + vec2( 0.,-1./dimensions.y ) );
	vec4 uv4 = texture2D( oldState, vUV + vec2( 0., 1./threeDDimensions.z) );
	vec4 uv5 = texture2D( oldState, vUV + vec2( 0.,-1./threeDDimensions.z) );
	vec4 laplacian = ( uv0 + uv1 + uv2 + uv3 + uv4 + uv5 - 6. * uv );

	return laplacian;
}

void main(void)
{
	float dtOverHSq = dt / (h*h);

	vec4 t = texture2D(oldState, vUV);
	float u = t.r,  v = t.g;
	float vnew = v + dt*eps*(b*u - v);

	float du = dt*(u*(1.0 - u)*(u - a) - v);
	du += laplacian(uv).r * dtOverHSq;

	gl_FragColor = vec4(u + du, vnew, du, 0. );
}