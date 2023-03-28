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

    // The arse-swinging problem

    Dq q1 = Quat( 0., 0.2, 0., -0.97 );
    Dq q2 = Quat( 0., 0.2, 0.,  0.97 );

    float t = 0.;
    t = clamp( t, 0., 1.);
    Dq interpolated = add( q1, mul(t,sub(q2,q1)) );

    return apply( interpolated, initialVertex );
}`