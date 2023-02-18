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

    Dq i = Quat(1.,0.,0.,0.);
    Dq j = Quat(0.,1.,0.,0.);
    //Dq iMultipliedByJ = mul(i,j);

    //vec3 directionVector = vec3( 1.,1.,0. );
    
    //vec3 iApplied              = apply( i,              directionVector );
    //vec3 iAppliedThenJApplied  = apply( j,              iApplied );
    //directionVector; iApplied; iAppliedThenJApplied;
    //vec3 iMultipliedByJApplied = apply( iMultipliedByJ, directionVector );
    //directionVector; iAppliedThenJApplied; iMultipliedByJApplied;

    //Dq jMultipliedByI = mul(j,i);
    //jMultipliedByI; iMultipliedByJ;

    return initialVertex;
}`