pageParameters = {
    untransformed: true,
    final: true,
    complex: false,
    euclidean: true,
    infinity: true,
    scalar: true,
    vectorSpace: false,
    numExtraCows: 2
}


textareaValueDefault = `vec4 getChangedVertex(in vec4 initialVertex) {

    float t = 1.;
    t = clamp(t, 0., 1.);
    Dq start = Dq( -0.79,-1.27,-1.22,1.24,-0.39,-0.22,0.42,1.63);
    Dq end   = Dq( -0.957,0.958,1.337,1.147,0.179,-0.179,0.14,-0.606 ); //both normalized

    // SLERP
    Dq startToEndAxis = dqLog( div(end,start) );
    Dq startToEndAxisScaledByT = mul(t, startToEndAxis );
    Dq slerp = mul( dqExp( startToEndAxisScaledByT ), start );
    start; end; slerp;
    
    //return initialVertex;
    return apply( slerp, initialVertex );
}`