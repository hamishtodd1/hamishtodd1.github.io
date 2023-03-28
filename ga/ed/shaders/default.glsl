textareaValueDefault = `uniform float time;
uniform vec2 mouse;

vec4 getChangedVertex(in vec4 initialVertex) {
    
    Dq q1 = Quat( 0.,  0.89, 0., 0.44 );
    Dq q2 = Quat( 0., -0.89, 0., 0.44 );

    float t = 0.;
    t = float(-0.69);
    t = clamp(t,0.,1.);
    Dq interpolated = add( q1, mul(t,sub(q2,q1)) );

    //mat4 q1Mat = toMat4( q1 );
    //mat4 q2Mat = toMat4( q2 );
    //mat4 matsInterpolated = q1Mat + t * (q2Mat-q1Mat);
    //return matsInterpolated * initialVertex;

    return apply( interpolated, initialVertex );
}`
