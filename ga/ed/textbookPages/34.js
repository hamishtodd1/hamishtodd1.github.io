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

    // Mixing in the identity

    Dq identity = Quat(0.,0.,0.,1.);
    Dq control = Quat(0.,1.,0.,0.);
    //Dq identityPlusControl = add(identity,control); //not normalized!

    //vec3 directionVector = vec3( 1.,1.,0. );
    
    //vec3 identityPlusControlApplied = apply( identityPlusControl, directionVector );
    //directionVector; identityPlusControlApplied;

    return apply( identity, initialVertex );
}`