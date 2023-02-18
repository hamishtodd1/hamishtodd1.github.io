pageParameters = {
    untransformed: true,
    final: true,
    complex: false,
    euclidean: true,
    infinity: true,
    scalar: false,
    vectorSpace: false
}

textareaValueDefault = `vec4 getChangedVertex(in vec4 initialVertex) {

    Plane e1 = Plane(0.,1.,0.,0.);
    Plane parallelPlane = Plane(1.8,1.,0.,0.);

    //Plane midPlane = add(e1, parallelPlane);

    return initialVertex;
}`