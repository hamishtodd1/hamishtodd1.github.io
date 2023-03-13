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

    float t = 0.5;
    Dq start = Dq( -0.79,-1.27,-1.22,1.24,-0.39,-0.22,0.42,1.63);
    Dq end   = Dq( -0.96,0.96,1.34,1.15,0.18,0.18,0.14,-0.61); //both normalized

    // SLERP 
    Dq startToEnd = div(end,start);    
    Dq startToEndAxis = dqLog(startToEnd);
    Dq startToEndByAmountT = dqExp( mul(t, startToEndAxis) );
    
    vec4 initialVertexAtStart = apply( startToEndByAmountT, initialVertex );
    return apply( toStart, initialVertexAtStart );
}`