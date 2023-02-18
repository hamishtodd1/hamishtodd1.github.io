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
    Plane e3 = Plane(0.,0.,0.,1.);

    //Dq composition = mul(e1,e3);
    //Dq otherComposition = mul(e3,e1);
    //composition; otherComposition;

    vec4 ret = initialVertex;
    //ret = apply(composition, initialVertex);
    
    //vec4 intermediate = apply(e3,initialVertex);
    //return intermediate;
    //ret = apply(e1,intermediate);

    return ret;
}`