pageParameters = {
    untransformed: true,
    final: true,
    complex: false,
    euclidean: true,
    infinity: true,
    scalar: true,
    vectorSpace: false
}


textareaValueDefault = `vec4 getChangedVertex(in vec4 initialVertex) {

    // the 8th float, "I", lets you make screw motions 

    Dq rotationAxisLine = Line(0.,0.,1., 0.,0.,0.);
    float rotationAmount = 2.;
    Dq scaledByHalfRotationAmount = mul( rotationAxisLine, rotationAmount / 2. );
    Dq rotation = dqExp(scaledByHalfRotationAmount);
    
    float myFloat = 0.;
    rotation.I = myFloat;

    vec4 ret = apply( rotation, initialVertex );
    return ret;
}`