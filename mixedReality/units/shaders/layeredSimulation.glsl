precision highp float;

varying vec2 vUV;

uniform sampler2D oldState;
uniform float deltaTime;
uniform vec3 dimensions;

vec2 spatialStep(float x,float y, float z)
{
	float dueToZ = z/dimensions.z;
	float dueToY = y/dimensions.z/dimensions.y; 
	return vec2(
		x/dimensions.x,
		dueToZ + dueToY
		);
}

void main (void)
{
	//shouldn't it be an index? Probably not, whatsisname does it this way
	//make it go vertical
	vec3 spatialStep = vec2(
		1. / dimensions.x,
		1. / dimensions.y,
		 );




	vec2 uv  = texture2D( oldState, vUV).rg;
	vec2 uv0 = texture2D( oldState, vUV + spatialStep(-1., 0., 0.)).rg;
	vec2 uv1 = texture2D( oldState, vUV + spatialStep( 1., 0., 0.)).rg;
	vec2 uv2 = texture2D( oldState, vUV + spatialStep( 0.,-1., 0.)).rg;
	vec2 uv3 = texture2D( oldState, vUV + spatialStep( 0., 1., 0.)).rg;
	vec2 uv4 = texture2D( oldState, vUV + spatialStep( 0., 0.,-1.)).rg;
	vec2 uv5 = texture2D( oldState, vUV + spatialStep( 0., 0., 1.)).rg;
	vec2 laplacian = (uv0 + uv1 + uv2 + uv3 - 4. * uv);

	float reactionQuantity = uv.r * uv.g * uv.g;

	float feed = 0.04;
	float kill = 0.1; //apparently always needs to be more than the above

	vec2 delta = vec2(
		laplacian.r * diffusionRates.x - reactionQuantity + feed * (1. - uv.r), //1-u to "keep it interesting"?
		laplacian.g * diffusionRates.y + reactionQuantity - kill * uv.g );

	vec2 result = uv + delta;

	gl_FragColor = vec4(result, 0.0, 1.0);
}