/*
	May find this useful https://github.com/rreusser/glsl-fft

	But you need the fourier transform of the structure factors first
 
	Dynamicland version
		Feels like you should just need the position of the source and the sample
*/

uniform float highestVal;
varying vec2 vUv; //gets calculated first

// uniform float atomCoords[6];

#define NUM_STRUCTURE_FACTORS 441
#define TAU 6.283185307179586

uniform float phases[NUM_STRUCTURE_FACTORS];
uniform float amplitudes[NUM_STRUCTURE_FACTORS];
uniform int numStructureFactors;

void main()
{
	if( numStructureFactors != NUM_STRUCTURE_FACTORS )	
	{
		gl_FragColor=vec4(1.,.5,1.,1.);
		return;
	}

	gl_FragColor = vec4(1.,0.,0.,1.);

	//what the fuck are these
	// float a = 40 //"axis"?
	// float b = 30 //"axis"?
	// float gamma = TAU / 4.

	// float a1 = a + b * Math.abs(Math.cos(gamma));

	// //presuuuuuumably the spacings
	// float dx = 0.85 / a1;
	// float dy = 0.85 / b;
	// float s = Math.min(dx, dy);
	
	// float sx = s * a;
	// float sxy = s * b * Math.cos(gamma);
	// float sy = -s * b * Math.sin(gamma);
	// float su = 1 / sx;
	// float sv = 1 / sy;
	// float suv = -sxy / (sx * sy);

	// float ox = (1. - sx - sxy) / 2;
	// float oy = (1. - sy) / 2;

	// //x and y are u and v, so both assumed to vary over [0,1]
	// float v = sv * (vUv.y - .5);

	// float val = amplitudes[maxHk][maxHk]
	// for (int h = -maxHk; h <= maxHk; h++)
	// {
	// 	for (int k = -maxHk; k <= maxHk; k++)
	// 	{
	// 		if (h > 0 || (h == 0 && k > 0))
	// 		{
	// 			float phi = phases[(h+maxHk)*hkWide+k+maxHk];
	// 			float u = suv*(vUv.y-oy)+su*(vUv.x-ox);
	// 			val+=2.*amplitudes[(h+maxHk)*hkWide+(k+maxHk)]*cos(TAU*(h*u+k*v-phi/360));
	// 		}
	// 	}
	// }

	// gl_FragColor.b = 1.;
	// gl_FragColor.a = 1.;

	// val /= highestVal; //gonna have to put this in as a slider
	// if (val >= 0)
	// {
	// 	gl_FragColor.r = 1.;
	// 	gl_FragColor.g = 1. - val;
	// } else
	// {
	// 	gl_FragColor.r = max(1 + 1.5 * val, 0);
	// 	gl_FragColor.g = max(1 + 0.5 * val, 0);
	// }
}