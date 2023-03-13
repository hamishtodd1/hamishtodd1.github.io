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

    // Basis planes

    Plane x = Plane(0.,1.,0.,0.);
    Plane y = Plane(0.,0.,1.,0.);
    Plane z = Plane(0.,0.,0.,1.);

    //Plane midPlane = add(x,y);
    //Plane otherMidPlane = sub(x,y);

    return initialVertex;
}`