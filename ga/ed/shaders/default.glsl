defaultShader = `
uniform float time;

vec4 getChangedVertex(in vec4 initialVertex) {

    vec4 xDir = vec4(1.,0.,0.,0.);
    vec4 yDir = vec4(0.,1.,0.,0.);
    vec4 zDir = vec4(0.,0.,1.,0.);
    vec4 origin = vec4(0.,0.,0.,1.);

    Plane myPl = Plane(0.,2.,0.,0.);

    Dq zInf = join(xDir,yDir);
    Dq zAxis = join(origin, zDir);
    Plane zPlane = join(zInf, origin);

    // Dq xInf = join(zDir,yDir);
    // Dq xAxis = join(origin, xDir);
    // Plane xPlane = join(xInf, origin);

    // Dq yInf = join(xDir,zDir);
    // Dq yAxis = join(origin, yDir);
    // Plane yPlane = join(yInf, origin);

    Dq freeLine = Dq(0., 0.,0.,0., 1.,0.,0., 0.);
    Plane joinPlane = join(freeLine, origin);
    
    return initialVertex;

}`
