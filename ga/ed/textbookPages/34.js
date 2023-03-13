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

    q1 = Quat( 0., 0.28, 0., -0.96 );
    q2 = Quat(0.6, 0.,   0., -0.6  ); //Quat(0.,  0., 0.11,  0.99 );

    //float t = 1.;
    //t = clamp(t,0.,1.);
    //interpolated = add( mul(q1, t), mul(q2, 1.-t) );

    return apply( q1, initialVertex );
}`