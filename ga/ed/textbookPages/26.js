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

    Plane e1 = Plane(0.,1.,0.,0.);
    Plane parallelPlane = Plane(1.8,1.,0.,0.);

    Plane midPlane = add(e1, parallelPlane);
    //Plane otherMidPlane = sub(e1, parallelPlane);
    //otherMidPlane;

    //Plane e0 = Plane(1.,0.,0.,0.);
    //Plane e2 = Plane(0.,0.,1.,0.);
    //Plane e3 = Plane(0.,0.,0.,1.);
    //e0; e1; e2; e3;

    //float controlFloat = 1.;
    //Plane controlPlane = Plane(controlFloat,1.,0.,0.);

    vec4 ret = apply(e1, initialVertex);
    //ret;
    return ret;
}`