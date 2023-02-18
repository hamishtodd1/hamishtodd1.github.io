pageParameters = {
    untransformed: true,
    final: true,
    complex: false,
    euclidean: true,
    infinity: true,
    scalar: true,
    vectorSpace: false,
    numExtraCows: 3
}


textareaValueDefault = `vec4 getChangedVertex(in vec4 initialVertex) {

    // Dual Quaternion linear blending

    Dq a = Dq( -0.79,-0.93,-1.04,0.93,-0.39,0.22,0.42,2.26 );
    Dq b = Dq( -0.96,0.70,1.00,0.81,0.18,0.18,0.14,-2.44 );
    Dq c = Dq( -0.52,1.22,-0.28,0.02,0.12,-0.55,0.64,-1.80 );

    float aAmount = 0.1;
    float bAmount = 0.2;
    float cAmount = 0.7;

    //Dq lerp = add( add(mul(a,aAmount),mul(b,bAmount)), mul(c,cAmount) );

    vec4 ret = initialVertex; //apply( lerp, initialVertex );
    return ret;
}`