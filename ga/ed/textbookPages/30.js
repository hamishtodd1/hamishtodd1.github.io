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

    Plane e1 = Plane(0.,1.,0.,0.);
    Plane e2 = Plane(0.,0.,1.,0.);
    Dq e12 = meet(e1,e2);

    //Plane e3 = Plane(0.,0.,0.,1.);
    //vec4 intersectionPoint = meet(e3,e12);

    //float controlFloat = 1.;
    //Plane parallelPlane = Plane(controlFloat,0.,0.,1.);
    //vec4 parallelPlanesIntersection = meet(e12, parallelPlane);

    //vec4 pointA = vec4(0.,0.,0.,1.);
    //vec4 pointB = vec4(1.5,0.,0.,1.);
    //vec4 pointsAdded = pointA + pointB; //w is not equal to 1!
    //pointsAdded /= pointsAdded.w;

    return initialVertex;
}`