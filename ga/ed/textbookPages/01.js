pageParameters = {
    untransformed: true,
    final: true,
    complex: false,
    euclidean: false,
    infinity: true,
    scalar: true,
    vectorSpace: false
}


textareaValueDefault = `vec4 getChangedVertex(in vec4 initialVertex) {

    // Quaternion LERP

    Dq q1 = Quat( 0.,   -0.6, 0., 0.8  );
    Dq q2 = Quat( 0.96,   0., 0., 0.28 );

    //float t = 0.5;
    //t = clamp(t,0.,1.);
    //Dq qLerped = add( q1, mul(t,sub(q2,q1)) );

    return apply( q1, initialVertex );
}`