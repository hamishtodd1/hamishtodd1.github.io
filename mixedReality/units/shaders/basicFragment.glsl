uniform float numberGoingBetweenZeroAndOne;
varying vec3 vUv; //gets calculated first

void main()
{
	float r = 1.0 + cos(vUv.x * 10.0 * numberGoingBetweenZeroAndOne);
	float g = 0.5 + sin( numberGoingBetweenZeroAndOne ) * 0.5;
	float b = 0.0;
	
	vec3 rgb = vec3(r, g, b);

	if(vUv.x > 0.1)
	{
		discard;
	}
	
	gl_FragColor = vec4(rgb, 1.0);
}