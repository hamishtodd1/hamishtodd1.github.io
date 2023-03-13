pageParameters = {
    untransformed: true,
    final: true,
    complex: false,
    euclidean: true,
    infinity: false,
    scalar: false,
    vectorSpace: false
}

textareaValueDefault = `vec4 getChangedVertex(in vec4 initialVertex) {

    // Applying Reflections

    Plane x = Plane(0.,1.,0.,0.);

    //Dq line = Line(1.,0.,1.,  0.,0.,0.);
    //Dq transformed = apply(x, line);

    //return apply(x, initialVertex);
    return initialVertex;
}`