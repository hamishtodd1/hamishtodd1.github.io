pageParameters = {
    untransformed: true,
    final: true,
    complex: false,
    euclidean: true,
    infinity: false,
    scalar: true,
    vectorSpace: false
}

textareaValueDefault = `vec4 getChangedVertex(in vec4 initialVertex) {

    // Plane + plane at infinity = parallel plane

    float dAmount = 0.;
    Plane myPlane = Plane(-1.,0.,0.,dAmount);

    return initialVertex;
}`