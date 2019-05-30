/*
	http://www.ibiblio.org/e-notes/html5/fhn3d_ti.html

	Walls:
		http://dev1.thevirtualheart.org/Media/WebGL/84.html

	The thing is a vertex shader for points

	Part of the point of this is just to have a 3D VR reaction diffusion. You can put in other functions
*/

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