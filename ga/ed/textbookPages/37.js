pageParameters = {
    untransformed: true,
    final: true,
    complex: false,
    euclidean: true,
    infinity: false,
    scalar: true,
    vectorSpace: false
}


textareaValueDefault = `vec4 getChangedVertex(in vec4 initialVertex) {

    // Lines in Dual Quaternions

    Dq lineA = Quat(1.,0.,0.,0.); //Line(1.,0.,0.,0.,0.,0.);
    Dq lineB = Quat(0.,1.,0.,0.); //Line(0.,1.,0.,0.,0.,0.);
    
    //Dq lineC = Line(1.,0.,0.,0.,2.,0.);
    //Dq lineD = Line(0.,0.,0.,0.,0.,1.);
    
    float t = 0.1;
    t = clamp(t,0.,1.);
    Dq from = lineA;
    Dq to = lineB;
    Dq interpolated = add( from, mul( t, sub(to, from) ) );

    vec4 ret = apply( interpolated, initialVertex );
    return ret;
}`