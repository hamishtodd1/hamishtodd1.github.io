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

    // Lines in Dual Quaternions

    Dq lineA = Quat(0.,1.,0.,0.); //same as Line(1.,0.,0.,0.,0.,0.);
    Dq lineB = Quat(1.,0.,0.,0.); //same as Line(0.,1.,0.,0.,0.,0.);
    //Dq lineC = Line(0.,1.,0.,1.4,0.,0.);
    
    float t = 0.1;
    t = clamp(t,0.,1.);
    Dq from = lineA;
    Dq to = lineB;
    Dq interpolated = add( from, mul( t, sub(to, from) ) );

    vec4 ret = apply( interpolated, initialVertex );
    return ret;
}`