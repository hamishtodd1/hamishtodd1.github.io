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

    // Dual Quaternion LERP and SLERP 

    Dq start = Dq( -0.79,-0.93,-1.04,0.93,-0.39,0.22,0.42,2.26);
    Dq end   = Dq( -0.96,0.70,1.00,0.81,0.18,0.18,0.14,-2.44); //both normalized

    //Dq startInverse = fastInverse(start); //just flips minus signs, assumes normalized
    //Dq startToEnd = mul(end,startInverse);
    //startToEnd;

    //Dq startToEndLogarithm = dqLog(startToEnd);
    //startToEndLogarithm;

    float t = 0.5;
    //Dq startToEndByT = dqExp( mul(t, startToEndLogarithm) );
    //Dq slerp = mul( startToEndByT, start);

    vec4 ret = initialVertex;//apply( slerp, initialVertex );
    return ret;
}`