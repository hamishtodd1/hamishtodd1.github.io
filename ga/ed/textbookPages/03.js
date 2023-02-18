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

    Dq aQuat = Quat(0.,1.,0.,0.);
    Dq bQuat = Quat(0.,0.,1.,0.);
    //Dq aPlusB = add(aQuat,bQuat); //180-degree + 180-degree = 180-degree

    //Dq aMinusB = sub(aQuat,bQuat); //in-between the other way

    //float amountOfB = 1.;
    //Dq bQuatScaled = mul(bQuat,amountOfB);
    //Dq aPlusScaledB = add(aQuat,bQuatScaled);

    //vec3 directionVector = vec3( 1.,1.,0. );
    //vec3 afterApplication = apply( aPlusScaledB, directionVector );

    vec4 ret = apply(aQuat,initialVertex);
    return ret;
}`