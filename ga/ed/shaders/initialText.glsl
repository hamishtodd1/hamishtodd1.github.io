// in vec3 position;
// vec4 getVertex() {
//     vec4 ret = vec4(position,1.);
//     return ret;
// }
uniform float myFloat;
vec3 getColor() {
    vec2 boog = vec2(1.,1.);
    vec3 myVec = vec3(-.28,.96,1.);
    
    Dq rotation = Dq(myVec.x, 0.,0.,0., 0.,myVec.y,0., 0.);
    vec4 idealPt = vec4( .2,0.,-1.,0.);
    vec4 transformedIdeal = sandwichDqPt(rotation, idealPt);

    vec4 realPt = vec4( .2,0., 1.,1.);
    vec4 transformedReal = sandwichDqPt(rotation, realPt);

    Dq idealLine = Dq(0., 0.,1.,1., 0.,0.,0., 0.);
    Dq eucliLine = Dq(0., 0.,0.,0., 0.,1.,1., 0.);
    Dq idealLine2 = sandwichDqDq(rotation,idealLine);
    
    vec3 fragColor = vec3(0.,myFloat,myVec.y);
    return fragColor;
}
//END//





//point pairs: spling is point ant infinity and an ordinary point, splong is both at infinity
//join a spling and splong point pair and of course you get a plane
//hey why aren't you trying this with 2D CGA first?






//try eg 1 + e12 + e0123
//and 1 + e01 + e0123



vec3 getColor( out vec4 fragColor ) {

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