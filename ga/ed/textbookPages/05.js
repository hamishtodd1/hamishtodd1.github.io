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

    Dq identity = Quat(0.,0.,0., 1.); //0-degree rotation

    Dq aQuat = Quat(0.,1.,0.,0.);
    Dq bQuat = Quat(0.,0.,1.,0.);
    Dq aPlusB = add(aQuat,bQuat); //180-degree + 180-degree = 180-degree

    //Dq aPlusIdentity = add(identity, aQuat); //Neither the identity nor a 180!

    //float amountOfIdentity = 1.;
    //Dq identityScaled = mul(identity,amountOfIdentity);
    //Dq aPlusScaledIdentity = add(aQuat,identityScaled);
    //aPlusScaledIdentity;

    //vec3 directionVector = vec3( 1.,1.,0. );
    //vec3 afterApplication = apply( aPlusScaledIdentity, directionVector );

    vec4 ret = apply(identity,initialVertex);
    return ret;
}`