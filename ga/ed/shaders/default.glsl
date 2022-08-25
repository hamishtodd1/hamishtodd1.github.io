uniform float ourUniformFloat;
uniform vec2 ourUniformVec2;

uniform float time;
uniform vec2 mouse;

vec4 getChangedVertex(in vec4 initialVertex) {
    float control1 = .5;
    vec2 control2 = vec2(cos(time*4.),sin(time*4.));
    vec3 control3 = vec3(1.,.5,1.);

    mat4 myMat = mat4(1.,0.,0.,0.,0.,1.,0.,0.,0.,0.,1.,0.,0.,0.,0.,1.);
    
    vec4 ret = initialVertex;
    return ret;
}
//END//

// vec4 myVertex = vec4( .2,0., 1.,1.);
// vec4 myNormal = vec4( .2,0.,-1.,0.);
// Plane myPlane = Plane(1.,1.,0.,0.);

// Dq rotation = Dq( .28,  0.,  0., 0., 0., .96, 0., 0.);
// vec4 transformedVertex = sandwichDqPt(rotation, myVertex);
// vec4 transformedNormal = sandwichDqPt(rotation, myNormal);

// Dq idealLine = Dq( 0.,  0.,1.,1.,  0.,0.,0.,  0.);
// Dq eucliLine = Dq( 0.,  0.,0.,0.,  0.,1.,1.,  0.);
// Dq idealLine2 = sandwichDqDq(rotation,idealLine);


vec3 getColor(in vec4 fragmentPosition) {
    
    vec3 fragColor = vec3(0.,fragmentPosition.x,fragmentPosition.y*4.);
    if( length(fragmentPosition.xy - mouse) < .1 )
        fragColor = vec3(1.,0.,0.);
    return fragColor;
}


//point pairs: spling is point ant infinity and an ordinary point, splong is both at infinity
//join a spling and splong point pair and of course you get a plane
//hey why aren't you trying this with 2D CGA first?






//try eg 1 + e12 + e0123
//and 1 + e01 + e0123



vec3 getColor(in vec4 fragmentPosition) {

    vec3 exampleVector = vec3(1.,1.,1.);

    // Some examples of euclidean points (not exactly "vectors"!)
    vec4 A = vec4(0.,-1.,0.,1.);
    vec4 B = vec4(exampleVector,1.);

    // An IDEAL point
    vec4 myIdealPoint = vec4(1.,1.,0.,0.);

    // Addition gives the thing halfway between A and B (they need to be normalized)
    vec4 A_B_Added = A + B;

    // The Join product gives the line that contains A and B
    Dq A_B_joined = joinPtsInDq(A,B);


    
    // Control the angle with x coordinate of another vec3
    vec3 angleController = vec3(1.,1.,0.);
    axis.e12 *= angleController.x; axis.e23 *= angleController.x; axis.e31 *= angleController.x;

    // Create a transformation by exponentiating the axis
    Dq transformation;
    dqExp(axis, transformation);

    // Apply transformation to the point
    vec4 transformedA = sandwichDqPt(transformation, A);


    // ignore this ;)
    fragColor = vec4(0.,0.,0.,1.);
}