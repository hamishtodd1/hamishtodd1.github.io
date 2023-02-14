textareaValueDefault = `uniform float time;
uniform vec2 mouse;

vec4 getChangedVertex(in vec4 initialVertex) {
    
    Dq R = Dq(.28, 0.,0.,.2, 0.,0.,0.,  0.);

    Plane myPlane = Plane(0.,1.,0.,0.);

    Flec myRr = Flec(0.,1.,0.,0.,  0.,0.,0.,1.);

    vec4 ret = sandwichDqPoint( R,initialVertex);
    return ret;
}`
