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

    // a bit of identity, a bit of screw
    float identityAmount = 0.;
    float screwAmount = 0.;

    float displacementFromOrigin = 0.;
    Dq axis = Line(0.,1.,0.,  0.,0.,displacementFromOrigin);

    Dq transform = axis;
    transform.w = identityAmount;
    transform.dxyz = screwAmount;

    return apply( transform, initialVertex );
}`