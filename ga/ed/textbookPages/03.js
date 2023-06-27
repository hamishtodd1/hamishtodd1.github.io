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

    //Dq lineB = Line(0.,1.,0.,0.,1.4,0.);
    //Plane myPlane = Plane(1., 0.,0.,0.);
    //vec4 myVec = vec4(1.,1.,0.,0.);

    Dq identity = Quat(0.,0.,0.,1.);
    return apply( identity, initialVertex );
}`