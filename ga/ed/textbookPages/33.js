pageParameters = {
    untransformed: true,
    final: true,
    complex: false,
    euclidean: false,
    infinity: true,
    scalar: false,
    vectorSpace: false
}


textareaValueDefault = `vec4 getChangedVertex(in vec4 initialVertex) {

    // Demo 1: Composition

    Dq i = Quat(1.,0.,0.,0.);
    Dq j = Quat(0.,1.,0.,0.);
    //Dq iMultipliedByJ = mul(i,j);

    //vec3 directionVector = vec3( 1.,1.,0. );
    
    //vec3 iApplied              = apply( i,              directionVector );
    //vec3 iAppliedThenJApplied  = apply( j,              iApplied );
    //vec3 iMultipliedByJApplied = apply( iMultipliedByJ, directionVector );
    //directionVector; iApplied; iAppliedThenJApplied; iMultipliedByJApplied;

    return apply( i, initialVertex );
}`