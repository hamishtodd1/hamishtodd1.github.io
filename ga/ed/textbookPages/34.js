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

    Dq q1 = Quat( 0., 0.96, 0., -0.28 );
    Dq q2 = Quat(0.6, 0.,   0., 0.8  ); //Quat(0.,  0., 0.11,  0.99 );

    //float t = 0.;
    //t = clamp(t,0.,1.);
    //Dq interpolated = add( q1, mul(t,sub(q2,q1)) );

    return apply( q1, initialVertex );
}`