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

    Dq lineA = Quat(1.,0.,0.,0.); //Line(1.,0.,0.,  0.,0.,0.);
    Dq lineB = Line(0.,1.,0.,  0.,0.,0.);
    Dq aPlusB = add( lineA, lineB );
    Dq aMinusB = sub( lineA, lineB );

    //Dq lineC = Line(1.,0.,0., 0.,1.,0.);
    //lineA; lineC;
    //Dq aPlusC  = add( lineA, lineC );
    //Dq aMinusC = sub( lineA, lineC );
    //aPlusC; aMinusC;

    //Dq e01 = Line(0.,0.,0.,  1.,0.,0.);
    //Dq e02 = Line(0.,0.,0.,  0.,1.,0.);
    //Dq e03 = Line(0.,0.,0.,  0.,0.,1.);
    //e01; e02; e03;

    //Dq sumOfLinesAtInfinity = add(e01,e02);

    vec4 ret = apply( lineA, initialVertex );
    return ret;
}`