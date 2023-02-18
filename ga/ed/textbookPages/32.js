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

    vec4 movablePoint = vec4(0.,0.,0.,1.);
    //movablePoint = vec4(1.,0.,0.,0.);

    vec4 ret = apply(movablePoint, initialVertex);
    ret;
    return ret;
}`