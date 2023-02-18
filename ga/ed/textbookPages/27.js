pageParameters = {
    untransformed: true,
    final: true,
    complex: true,
    euclidean: true,
    infinity: true,
    scalar: true,
    vectorSpace: false
}

textareaValueDefault = `vec4 getChangedVertex(in vec4 initialVertex) {

    Plane skewedPlane = Plane(0.,1.,0.,1.);
    Plane e0 = Plane(1.,0.,0.,0.);
    
    float controlFloat = 1.;
    Plane controlPlane = add(skewedPlane, mul(e0,controlFloat));

    //Dq translation = mul(skewedPlane,controlPlane);

    return initialVertex;
}`