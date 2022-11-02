defaultShader = `

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

    vec4 myVertex = vec4( .2,0., 1.,1.);
    vec4 myNormal = vec4( .2,0.,-1.,0.);
    mat4 myMat = mat4(1.,0.,0.,0.,0.,1.,0.,0.,0.,0.,1.,0.,0.,0.,0.,1.);

    Plane myPlane = Plane(1.,1.,0.,0.);
    Dq idealLine = Dq( 0.,  0.,1.,1.,  0.,0.,0.,  0.);
    Dq eucliLine = Dq( 0.,  0.,0.,0.,  0.,1.,1.,  0.);

    Dq rotation = Dq( control2.x,   0.,0.,0.,   0.,control2.y,0.,  control1);
    vec4 transformedVertex = sandwichDqPoint(rotation, myVertex);
    vec4 transformedNormal = sandwichDqPoint(rotation, myNormal);
    Dq transformedLine = sandwichDqDq(rotation, idealLine);

    vec4 ret;
    
    mat4 boneMatX = boneMatrices[int(skinIndex.x)];
    mat4 boneMatY = boneMatrices[int(skinIndex.y)];
    mat4 boneMatZ = boneMatrices[int(skinIndex.z)];
    mat4 boneMatW = boneMatrices[int(skinIndex.w)];

    ret += boneMatX * initialVertex * skinWeight.x;
    ret += boneMatY * initialVertex * skinWeight.y;
    ret += boneMatZ * initialVertex * skinWeight.z;
    ret += boneMatW * initialVertex * skinWeight.w;
    
    return ret;
}`
