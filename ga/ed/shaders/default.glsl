defaultShader = `
uniform float time;

vec4 getChangedVertex(in vec4 initialVertex) {

    vec4 xDir = vec4(1.,0.,0.,0.);
    vec4 yDir = vec4(0.,1.,0.,0.);
    
    return initialVertex;

}`
