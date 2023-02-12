defaultShader = `uniform float time;
uniform vec2 mouse;

vec4 getChangedVertex(in vec4 initialVertex) {
    float myAngle = 1.57;
    float dist = 3.2;
    float normR = 1.;
    float normT = 1.;
    
    Dq R = Dq(normR*cos(myAngle), 0.,0.,0., normR*sin(myAngle),0.,0.,  0.);
    Dq T = Dq(1.*normT, 0.,0.,dist/2.*normT, 0.,0.,0., 0.);
    
    Dq M = mul(R,T);
    float myFloat = 1.;
    M.scalar *= myFloat;
    vec4 displacedOrigin = sandwichDqPoint( M, vec4(0.,0.,0.,1.) );
    float measuredDist = length(displacedOrigin.xyz/displacedOrigin.w) * .5; //these are formulae for measuring distances of particular things, whose transform is actually twice as big
    
    Dq grade2PartOfM = M;
    grade2PartOfM.I = 0.; grade2PartOfM.scalar = 0.;

    float extractedDist = M.I / norm(grade2PartOfM);
    float indicator = extractedDist / measuredDist;
    indicator;

    vec4 ret = sandwichDqPoint(M,initialVertex);
    return ret;
}`
