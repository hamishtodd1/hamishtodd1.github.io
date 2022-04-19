varying vec4 coord; //fragcoord is

vec2 multiplyComplex(in vec2 a, in vec2 b) {
    return vec2(a.x*b.x-a.y*b.y,a.x*b.y+a.y*b.x);
}

void main()
{
    vec3 pos = position;
    pos.xz = multiplyComplex(pos.xz,cameraPosition.xz / length(cameraPosition.xz));

	coord = modelMatrix * vec4(pos, 1.);

    gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.);
}