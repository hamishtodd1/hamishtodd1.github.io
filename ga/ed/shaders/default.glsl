defaultShader = `uniform float ourUniformFloat;
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
    Dq idealLine = Dq( 0.,  0.,1.,1.,  0.,0.,0.,  0.);
    Dq eucliLine = Dq( 0.,  0.,0.,0.,  0.,1.,1.,  0.);

    Dq rotation = Dq( .28,   0.,0.,0.,   0.,.96,0.,  control1);
    vec4 transformedVertex = sandwichDqPoint(rotation, myVertex);
    vec4 transformedNormal = sandwichDqPoint(rotation, myNormal);
    Dq transformedLine = sandwichDqDq(rotation, idealLine);
    
    vec4 ret;
    ret += boneMatrices[int(skinIndex.x)] * initialVertex * skinWeight.x;
    ret += boneMatrices[int(skinIndex.y)] * initialVertex * skinWeight.y;
    ret += boneMatrices[int(skinIndex.z)] * initialVertex * skinWeight.z;
    ret += boneMatrices[int(skinIndex.w)] * initialVertex * skinWeight.w;

    // Dq boneDq = dqAdd( dqAdd( boneDqs[int(skinIndex.x)], boneDqs[int(skinIndex.y)]), dqAdd( boneDqs[int(skinIndex.z)], boneDqs[int(skinIndex.w)] ) );
    // ret = sandwichDqPoint(boneDq,initialVertex);    
    return ret;
}`
