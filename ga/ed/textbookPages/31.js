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
    Dq line = Line(0.,1.,0.,0.,0.,0.);

    //vec4 pointAtInfinity = meet( line, e0 );

    //Plane e1 = Plane(0.,1.,0.,0.);
    //Plane e2 = Plane(0.,0.,1.,0.);
    //Plane e3 = Plane(0.,0.,0.,1.);

    //vec4 e123 = meet(e1,meet(e2,e3));
    //vec4 e032 = meet(e0,meet(e3,e2));
    //vec4 e013 = meet(e0,meet(e1,e3));
    //vec4 e021 = meet(e0,meet(e2,e1));

    //vec4 pointAtInfinityPlusPointAtInfinity = e032 + e013;
    
    //vec4 intersectionPoint = meet(e3,e12);

    //Plane grazingPlane = Plane(1.,1.,0.,0.);
    //vec4 alwaysValidIntersection = meet(line, grazingPlane);

    return initialVertex;
}`