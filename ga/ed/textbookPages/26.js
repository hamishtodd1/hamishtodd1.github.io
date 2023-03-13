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

    // Plane + plane at infinity = parallel plane

    Plane x = Plane(1.,0.,0.);
    Plane parallelPlane = Plane(1.,0.,0.,1.8);

    Plane midPlane = add(x, parallelPlane);
    //Plane otherMidPlane = sub(x, parallelPlane);
    //otherMidPlane;

    //float controlFloat = 1.;
    //Plane controlPlane = Plane(controlFloat,1.,0.,0.);

    vec4 ret = apply(x, initialVertex);
    //ret;
    return ret;
}`