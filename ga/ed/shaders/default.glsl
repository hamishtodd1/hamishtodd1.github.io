defaultShader = `uniform float ourUniformFloat;
uniform vec2 ourUniformVec2;

uniform float time;
uniform vec2 mouse;

in vec4 skinWeight;
in vec4 skinIndex;

uniform mat4[49] boneMatrices;
uniform Dq[49] boneDqs;

vec4 getChangedVertex(in vec4 initialVertex) {
    
    Dq rotation = Dq( .28,   0.,0.,0.,   0.,.96,0.,  0.);
    Dq translation = Dq( 1.,   1.,0.,0.,   0.,0.,0.,  0.);

    vec4 mrh = sandwichDqPoint(rotation,vec4(0.,0.,0.,1.));

    // Dq boneDq = dqAdd( dqAdd( boneDqs[int(skinIndex.x)], boneDqs[int(skinIndex.y)]), dqAdd( boneDqs[int(skinIndex.z)], boneDqs[int(skinIndex.w)] ) );
    // ret = sandwichDqPoint(boneDq,initialVertex);    
    return initialVertex;
}`
