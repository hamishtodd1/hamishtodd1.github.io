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
    
    Dq example = Quat(0.,1.,0.,0.);
    //Dq exampleNegated = Quat(0.,-1.,0.,0.);
    //Dq exampleHalved = Quat(0., 0.5,0.,0.);
    
    //vec3 directionVector = vec3( 0.,2.,1.5 );
    //vec3 transformed = apply( example, directionVector );
    
    vec4 ret = apply(example, initialVertex);
    return ret;
}`