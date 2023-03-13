pageParameters = {
    untransformed: true,
    final: true,
    complex: false,
    euclidean: true,
    infinity: true,
    scalar: false,
    vectorSpace: false
}


textareaValueDefault = `vec4 getChangedVertex(in vec4 initialVertex) {

    // Line() uses "Plucker coordinates" to make Parallel lines

    q1 = Quat(1.,0.,0.,0.);
    q2 = Quat(0.,1.,0.,0.);
    Dq q1Plusq2 = add(q1,q2);

    //vec4 origin = vec4(0.,0.,0.,1.);
    //Dq lineA = Line(1.,0.,0.,  0.,0.,0.);
    //Dq lineB = Line(1.,0.,0.,  0.,1.,0.);
    //Dq aPlusB = add( lineA, lineB );

    return apply( q1Plusq2, initialVertex );
}`