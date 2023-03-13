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

    // Translation = plane * plane

    Plane skewedPlane = Plane(.5,1.2,.5,0.);
    Plane planeAtInfinity = Plane(0.,0.,0.,1.);
    
    float controlFloat = 2.;
    Plane myPlane = add(skewedPlane, mul(planeAtInfinity,controlFloat));
    myPlane;

    //Dq translation = mul(skewedPlane,myPlane);

    vec4 ret = initialVertex;
    //ret = apply(translation, initialVertex);
    return ret;
}`