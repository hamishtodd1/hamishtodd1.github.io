defaultShader = `

uniform float ourUniformFloat;
uniform vec2 ourUniformVec2;

uniform float time;
uniform vec2 mouse;

in vec4 skinWeight;
in vec4 skinIndex;

uniform mat4[49] boneMatrices;

vec4 getChangedVertex(in vec4 initialVertex) {

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
