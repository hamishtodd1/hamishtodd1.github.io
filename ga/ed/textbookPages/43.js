pageParameters = {
    untransformed: true,
    final: true,
    complex: false,
    euclidean: true,
    infinity: true,
    scalar: false,
    vectorSpace: true,
    numExtraCows: 3
}


textareaValueDefault = `vec4 getChangedVertex(in vec4 initialVertex) {

    // SLERP-esque blending

    Dq a = Dq( -0.79,-0.93,-1.04,0.93,-0.39,0.22,0.42,1.26 );
    Dq b = Dq( -0.96,0.70,1.00,0.81,0.18,0.18,0.14,-0.44 );
    Dq c = Dq( -0.52,1.22,-0.28,0.02,0.12,-0.55,0.64,-1.80 );

    vec3 amountsControl = vec3(1.,1.,1.);
    vec3 amounts = amountsControl / (amountsControl.x + amountsControl.y + amountsControl.z);
    
    

    vec4 ret = apply( a, initialVertex );
    return ret;
}`