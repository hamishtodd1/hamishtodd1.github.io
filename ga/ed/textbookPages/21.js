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
    Plane e2 = Plane(0.,0.,1.,0.);
    Plane e3 = Plane(0.,0.,0.,1.);

    //Plane midPlane = add(e1,e2);
    //Plane otherMidPlane = sub(e1,e2);

    return initialVertex;
}`