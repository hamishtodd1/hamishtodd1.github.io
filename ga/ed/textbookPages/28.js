pageParameters = {
    untransformed: true,
    final: true,
    complex: false,
    euclidean: true,
    infinity: true,
    scalar: true,
    vectorSpace: true
}

textareaValueDefault = `vec4 getChangedVertex(in vec4 initialVertex) {

    Plane e0 = Plane(1.,0.,0.,0.);
    Plane e1 = Plane(0.,1.,0.,0.);
    Plane e2 = Plane(0.,0.,1.,0.);
    Plane e3 = Plane(0.,0.,0.,1.);

    Dq e23 = meet(e2,e3); //mul(e2,e3);
    Dq e31 = meet(e3,e1);
    Dq e12 = meet(e1,e2);
    //the above all have magnitude 1

    //Plane controlPlane = Plane(0.,1.,0.,0.);
    //Dq e1Intersection = meet(e1,controlPlane);
    
    //vec3 v1 = vec3(0.,1.5,0.);
    //vec3 v2 = vec3(1.5,0.,0.);
    //vec3 v1CrossV2 = cross(v1,v2);

    return initialVertex;
}`