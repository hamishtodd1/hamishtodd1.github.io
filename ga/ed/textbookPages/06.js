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

    Dq identity = Quat(0.,0.,0.,1.);

    //Dq linePart     = Quat(1.,1.,1.,0.);
    //float amountOfIdentity = 2.;
    //Dq myQuat = add( linePart, mul(identity, amountOfIdentity ) );

    //Dq myQuatInverse = add( identityPart, mul( linePart, minus1Quat ) );
    //myQuat; myQuatInverse;

    vec4 ret = apply( identity, initialVertex );
    //ret = apply( myQuatInverse, initialVertex );
    return ret;
}`