pageParameters = {
    untransformed: true,
    final: true,
    complex: false,
    euclidean: false,
    infinity: true,
    scalar: true,
    vectorSpace: false
}


textareaValueDefault = `vec4 getChangedVertex(in vec4 initialVertex) {

    // Euler angles

    float yaw = 1.3;
    float pitch = 2.1;
    float roll = 1.9;
    //Dq yz = Quat(1.,0.,0.,0.);
    //Dq zx = Quat(0.,1.,0.,0.);
    //Dq xy = Quat(0.,0.,1.,0.);
    //Dq yawRotation   = dqExp( mul( zx,   yaw / 2. ) );
    //Dq pitchRotation = dqExp( mul( yz, pitch / 2. ) );
    //Dq rollRotation  = dqExp( mul( xy,  roll / 2. ) );
    //Dq rotation = mul( rollRotation, mul(pitchRotation, yawRotation ) );
    //rotation;

    vec4 ret = apply( Quat(0.,0.,0.,1.), initialVertex );
    return ret;
}`