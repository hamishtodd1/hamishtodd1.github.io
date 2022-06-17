//try eg 1 + e12 + e01234

void mainImage( out vec4 fragColor ) {

    vec3 myVec = vec3(1.,0.,0.);
    Dq axis = Dq(0., 0.,0.,0., myVec.z,myVec.y,myVec.x, 0.);

    // ignore this ;)
    fragColor = vec4(0.,0.,0.,1.);
}