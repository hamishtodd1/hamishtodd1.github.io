varying float interpV;

void main()
{
	vec3 startColor = vec3(0.,1.,0.);
	vec3 endColor = vec3(1.,0.,1.);
	gl_FragColor = vec4(mix(startColor,endColor,interpV), 1.);
}