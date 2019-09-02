precision highp float;

varying vec2 vUV;
uniform sampler2D oldState;

uniform vec2 dimensions;
uniform float deltaTime;

uniform vec2 brush;

const vec2 diffusionRates = vec2(0.2097,0.105);

void main (void)
{
	//shouldn't it be an index? Probably not, pmnelia and Evgeny do it this way
	vec2 pixelStep = vec2( 1. / dimensions.x, 1. / dimensions.y );

	vec2 uv  = texture2D( oldState, vUV).rg;
	vec2 uv0 = texture2D( oldState, vUV + vec2(-pixelStep.x, 0.)).rg;
	vec2 uv1 = texture2D( oldState, vUV + vec2( pixelStep.x, 0.)).rg;
	vec2 uv2 = texture2D( oldState, vUV + vec2(0., -pixelStep.y)).rg;
	vec2 uv3 = texture2D( oldState, vUV + vec2(0.,  pixelStep.y)).rg;
	vec2 laplacian = (uv0 + uv1 + uv2 + uv3 - 4. * uv);

	//.014 & .045 for spirals
	float feed = 0.014;
	float killMinusFeed = 0.045;

	float reactionQuantity = uv.r * uv.g * uv.g;
	vec2 delta = vec2(
		laplacian.r * diffusionRates.x - reactionQuantity + feed * (1. - uv.r), //1-u to "keep it interesting"?
		laplacian.g * diffusionRates.y + reactionQuantity - (feed+killMinusFeed) * uv.g ); //because kill > feed

	vec2 result = uv + delta; //could control speed in detail by multiplying this by a scalar < 1

	if(brush.x > 0.0)
	{
		vec2 diff = (vUV - brush) / pixelStep;
		float dist = dot(diff, diff);
		if(dist < 5.0)
		{
			result.g = .9;
		}
	}

	gl_FragColor = vec4(result, 0.0, 1.0);
}


//could color surface with this
float getFilamentLevel(vec3 p)
{
	float p_x = p.x + texture2dDimensionReciprocal;
	if(p_x > 1.) p_x = p.x;
	float p_y = p.y + texture2dDimensionReciprocal;
	if(p_y > 1.) p_y = p.y;
	float p_z = p.z + texture2dDimensionReciprocal;
	if(p_z > 1.) p_z = p.z;

	p_z *= dy;

	float threshold = .5;
	float sum =
		step(threshold, sample2dTexture( p.x, p.y + dy*p.z ).r) +
		step(threshold, sample2dTexture( p.x, p.y + dy*p_z ).r) +
		step(threshold, sample2dTexture( p.x, p_y + dy*p.z ).r) +
		step(threshold, sample2dTexture( p.x, p_y + dy*p_z ).r) +
		step(threshold, sample2dTexture( p_x, p.y + dy*p.z ).r) +
		step(threshold, sample2dTexture( p_x, p.y + dy*p_z ).r) +
		step(threshold, sample2dTexture( p_x, p_y + dy*p.z ).r) +
		step(threshold, sample2dTexture( p_x, p_y + dy*p_z ).r);
	bool uIsConsistentlyHigh = .5 < sum && sum < 7.5;

	sum =
		step(		.0, sample2dTexture( p.x, p.y + dy*p.z ).b) +
		step(		.0, sample2dTexture( p.x, p.y + dy*p_z ).b) +
		step(		.0, sample2dTexture( p.x, p_y + dy*p.z ).b) +
		step(		.0, sample2dTexture( p.x, p_y + dy*p_z ).b) +
		step(		.0, sample2dTexture( p_x, p.y + dy*p.z ).b) +
		step(		.0, sample2dTexture( p_x, p.y + dy*p_z ).b) +
		step(		.0, sample2dTexture( p_x, p_y + dy*p.z ).b) +
		step(		.0, sample2dTexture( p_x, p_y + dy*p_z ).b);
	bool uChangeRateIsPositive = .5 < sum && sum < 7.5;

	return ( uIsConsistentlyHigh && uChangeRateIsPositive ) ? 1.:0.;
}