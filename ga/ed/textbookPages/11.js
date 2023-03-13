pageParameters = {
    untransformed: true,
    final: true,
    complex: false,
    euclidean: true,
    infinity: true,
    scalar: true,
    vectorSpace: false
}

textareaValueDefault = `vec4 getChangedVertex(in vec4 initialVertex) {

    vec4 origin = vec4(0.,0.,0.,1.);

    Dq lineNotThroughOrigin = Line(1.,0.,0.,  0.,2.,0.);
    Dq identity = Dq(1.,  0.,0.,0.,   0.,0.,0.,  0.);
    //Dq rotation = add( identity, lineNotThroughOrigin );

    //Dq lineAtInfinity = Line(0.,0.,0., 0.,-1.,0.); //CAN'T do a 180 around this

    //Dq translation = add( identity, lineAtInfinity );
    //translation;

    //Dq composition = mul( rotation, translation );

    vec4 ret = apply( identity, initialVertex );
    //ret; //will be all zeroes if you "send it past infinity"
    return ret;
}`