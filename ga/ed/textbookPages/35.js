pageParameters = {
    untransformed: true,
    final: true,
    complex: false,
    euclidean: false,
    infinity: true,
    scalar: false,
    vectorSpace: false
}


textareaValueDefault = `vec4 getChangedVertex(in vec4 initialVertex) {

    // Clockwise and anticlockwise

    Dq myQuat =         Quat( 0.71, 0., 0., 0.71);
    //Dq myQuatSwitched = Quat(-0.71, 0., 0.,-0.71);
    //Dq myQuatInverse  = Quat(-0.71, 0., 0., 0.71);
    
    return apply( myQuat, initialVertex );
}`