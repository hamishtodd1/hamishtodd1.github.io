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

    // Quaternion = plane * plane

    Plane x = Plane(0.,1.,0.,0.);
    Plane z = Plane(0.,0.,0.,1.);

    //Dq composition = mul(x,z);

    vec4 ret = initialVertex;
    //ret = apply(composition, initialVertex);

    return ret;
}`