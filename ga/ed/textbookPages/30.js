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

    Plane x = Plane(0.,1.,0.,0.);
    Dq myLine = Line(0.,0.,1.,   0.,1.,0.);
    
    vec4 intersectionPoint = meet( x, myLine );

    //By the way, point+point = midpoint

    //vec4 pointA = vec4(0.,0.,0.,1.);
    //vec4 pointB = vec4(1.5,0.,0.,1.);
    //vec4 pointsAdded = pointA + pointB; //w NOT equal to 1!
    //pointsAdded /= pointsAdded.w; // w now equal to 1; "normalized"

    return initialVertex;
}`