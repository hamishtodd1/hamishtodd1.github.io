varying vec4 coord;

void main()
{
    gl_FragColor = vec4(coord.xyz, .3);
}