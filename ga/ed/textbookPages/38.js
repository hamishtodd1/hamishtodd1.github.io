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

    // Rotations and Translations from Exponential

    //float rotationAmount = 1.; //Radians
    //Dq rotationAxisLine = Line(1.,0.,0., 0.,1.,0.); //better be normalized!
    //Dq scaledByHalfRotationAmount = mul( rotationAxisLine, rotationAmount / 2. );
    //Dq rotation = dqExp(scaledByHalfRotationAmount);

    //Dq translationAxisLine = Line(0.,0.,0., 0.,1.,0.);
    //float translationAmount = 1.;
    //Dq scaledByHalfTranslationAmount = mul( translationAxisLine, translationAmount / 2. );
    //Dq translation = dqExp(scaledByHalfTranslationAmount);

    vec4 ret = apply( Quat(0.,0.,0.,1.), initialVertex );
    return ret;
}`