pageParameters = {
    untransformed: true,
    final: true,
    complex: false,
    euclidean: true,
    infinity: false,
    scalar: false,
    vectorSpace: false
}

textareaValueDefault = `vec4 getChangedVertex(in vec4 initialVertex) {

    Dq lineA = Quat(1.,0.,0.,0.); //Line(1.,0.,0.,  0.,0.,0.);
    Dq lineB = Line(0.,1.,0.,  0.,0.,0.);
    Dq aPlusB = add( lineA, lineB );

    //Dq lineC = Line(1.,0.,0., 0.,1.,0.);
    //lineA; lineC;
    //Dq aPlusC = add(lineA,lineC);

    vec4 ret = apply( lineA, initialVertex );
    return ret;
}`