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

    // Parallel planes

    Plane x = Plane(1.,0.,0.);
    Plane parallelPlane = Plane(1.,0.,0.,1.8);

    //Plane midPlane = add(x, parallelPlane);

    return initialVertex;
}`