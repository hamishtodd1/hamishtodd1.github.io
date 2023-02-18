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

    Plane e0 = Plane(1.,0.,0.,0.);
    Plane e1 = Plane(0.,1.,0.,0.);
    Plane e2 = Plane(0.,0.,1.,0.);
    Plane e3 = Plane(0.,0.,0.,1.);

    Plane parallelPlane = Plane(1.,1.,0.,0.);
    //Dq parallelPlanesIntersection = meet(e1, parallelPlane);
    
    //Dq e01 = meet(e0,e1);
    //Dq e02 = meet(e0,e2);
    //Dq e03 = meet(e0,e3);
    //e01; e02; e03;

    return initialVertex;
}`