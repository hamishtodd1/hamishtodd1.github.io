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

    Dq q1 = Quat( 0., 0.9, 0.,  0.43 );
    Dq q2 = Quat( 0., -0.9, 0., 0.43 );

    float t = 0.;
    t = clamp(t,0.,1.);
    Dq interpolated = add( q1, mul(t,sub(q2,q1)) );

    mat4 q1Mat = toMat4( q1 );
    mat4 q2Mat = toMat4( q2 );
    mat4 matsInterpolated = q1Mat + t * (q2Mat-q1Mat);

    return apply( interpolated, initialVertex );
    //return matsInterpolated * initialVertex;
}`