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

    Dq e23 = mul(e2,e3); //Quat(1.,0.,0.,0.);
    Dq e31 = mul(e3,e1); //Quat(0.,1.,0.,0.);
    Dq e12 = mul(e1,e2); //Quat(0.,0.,1.,0.);

    //e1; e2; e3; e12; e23; e31;

    return initialVertex;
}`