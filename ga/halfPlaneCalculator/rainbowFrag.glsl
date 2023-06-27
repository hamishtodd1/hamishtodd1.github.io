varying float interpV;
varying vec2 pos;

void hsv2rgb(float hueZeroToOne, out vec3 rgb)
{
	float s = 1.;
	float v = 1.;

    float hh, p, q, t, ff;
    int i;

    hh = hueZeroToOne * 360.;
    hh /= 60.;
    i = int(floor(hh));
    ff = fract(hh);
    p = v * (1. - s);
    q = v * (1. - (s * ff));
    t = v * (1. - (s * (1. - ff)));

	// rgb = vec3(1.,1.,1.);

    switch(i) {
		case 0:
			rgb.r = v;
			rgb.g = t;
			rgb.b = p;
			break;
		case 1:
			rgb.r = q;
			rgb.g = v;
			rgb.b = p;
			break;
		case 2:
			rgb.r = p;
			rgb.g = v;
			rgb.b = t;
			break;

		case 3:
			rgb.r = p;
			rgb.g = q;
			rgb.b = v;
			break;
		case 4:
			rgb.r = t;
			rgb.g = p;
			rgb.b = v;
			break;

		case 5:
		default:
			rgb.r = v;
			rgb.g = p;
			rgb.b = q;
			break;
    }
}

void main()
{
	vec3 ourRgb;
	hsv2rgb(interpV * 5./6., ourRgb);
	gl_FragColor = vec4( ourRgb, 1.);

	if(pos.y < 0.)
		discard;

	// vec3 startColor = vec3(0.,1.,0.);
	// vec3 endColor = vec3(1.,0.,1.);
	// gl_FragColor = vec4(mix(startColor,endColor,interpV), 1.);
}