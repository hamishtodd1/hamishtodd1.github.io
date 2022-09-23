uniform float ourUniformFloat;
uniform vec2 ourUniformVec2;

uniform float time;
uniform vec2 mouse;

in vec4 skinWeight;
in vec4 skinIndex;

uniform mat4[49] boneMatrices;
uniform Dq[49] boneDqs;

vec4 getChangedVertex(in vec4 initialVertex) {
    float control1 = .5;
    vec2 control2 = vec2(cos(time*4.),sin(time*4.));
    vec3 control3 = vec3(1.,.5,1.);

    boneMatrices[0];
    mat4 firstOne = boneMatrices[0]; //what the fuck? Clue: all matrices seem the same

    mat4 boneMatX = boneMatrices[int(skinIndex.x)];
    mat4 boneMatY = boneMatrices[int(skinIndex.y)];
    mat4 boneMatZ = boneMatrices[int(skinIndex.z)];
    mat4 boneMatW = boneMatrices[int(skinIndex.w)];

    vec4 ret = vec4( 0. );
    ret += boneMatX * initialVertex * skinWeight.x;
    ret += boneMatY * initialVertex * skinWeight.y;
    ret += boneMatZ * initialVertex * skinWeight.z;
    ret += boneMatW * initialVertex * skinWeight.w;
    // ret /= ret.w;
    
    // vec4 ret = initialVertex;
    return ret;
}
//END//



vec4 myVertex = vec4( .2,0., 1.,1.);
vec4 myNormal = vec4( .2,0.,-1.,0.);
mat4 myMat = mat4(1.,0.,0.,0.,0.,1.,0.,0.,0.,0.,1.,0.,0.,0.,0.,1.);

Plane myPlane = Plane(1.,1.,0.,0.);
Dq idealLine = Dq( 0.,  0.,1.,1.,  0.,0.,0.,  0.);
Dq eucliLine = Dq( 0.,  0.,0.,0.,  0.,1.,1.,  0.);

vec4 v1 = vec4( .2,0., 1.,1.);
vec4 v2 = ourMat4s[0] * v1;

Dq rotation = Dq( control2.x,   0.,0.,0.,   0.,control2.y,0.,  control1);
vec4 transformedVertex = sandwichDqPt(rotation, myVertex);
vec4 transformedNormal = sandwichDqPt(rotation, myNormal);
Dq transformedLine = sandwichDqDq(rotation, idealLine);




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