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

    // Point = Plane ^ line

    Plane x = Plane(1.,0.,0.,0.);
    Dq myLine = Line(0.,0.,1.,   0.,1.,0.);
    
    vec4 intersectionPoint = meet( x, myLine );

    return initialVertex;
}`