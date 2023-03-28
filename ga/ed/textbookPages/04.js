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

    // factors affectig a dual quaternio
    
    float identityAmount = 0.;
    float screwiness = 0.;
    float displacementFromOrigin = 0.;

    Dq transform = Dq(
        identityAmount,
        0., 1., 0.,
        0., 0., displacementFromOrigin,
        screwiness);

    return apply( transform, initialVertex );
}`