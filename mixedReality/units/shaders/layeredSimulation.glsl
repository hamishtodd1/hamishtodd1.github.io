precision highp float;

varying vec2 vUV;

uniform sampler2D oldState;
uniform float deltaTime;
uniform vec3 dimensions;

vec2 spatialStep(float x,float y, float z)
{
	float dueToY = y/dimensions.z/dimensions.y; 
	float dueToZ = z/dimensions.z;
	dueToZ = floor( dueToZ * dimensions.z ) / dimensions.z; //floor coz it's like an array
	return vec2(
		x/dimensions.x,
		dueToZ + dueToY
		);
}

void main (void)
{
	vec2 uv  = texture2D( oldState, vUV).rg;
	vec2 uv0 = texture2D( oldState, vUV + spatialStep(-1., 0., 0.)).rg;
	vec2 uv1 = texture2D( oldState, vUV + spatialStep( 1., 0., 0.)).rg;
	vec2 uv2 = texture2D( oldState, vUV + spatialStep( 0.,-1., 0.)).rg;
	vec2 uv3 = texture2D( oldState, vUV + spatialStep( 0., 1., 0.)).rg;
	vec2 uv4 = texture2D( oldState, vUV + spatialStep( 0., 0.,-1.)).rg;
	vec2 uv5 = texture2D( oldState, vUV + spatialStep( 0., 0., 1.)).rg;
	vec2 grad = (uv0 + uv1 + uv2 + uv3 + uv4 + uv5 - 6. * uv);

	vec2 result = uv;// + grad * 0.007;

	gl_FragColor = vec4(result, 0.0, 1.0);
}