varying vec3 coordinates_of_this_pixel; //gets calculated first

void main()
{
	float redness = 0.;
	float greenness = 1.;
	float blueness = 1.;


	redness = 1.;

	if(coordinates_of_this_pixel.x > 0.)
		redness = 0.;


	gl_FragColor = vec4(redness,0.,0., 1.0);
}