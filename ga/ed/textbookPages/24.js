pageParameters = {
    untransformed: true,
    final: true,
    complex: true,
    euclidean: true,
    infinity: true,
    scalar: true,
    vectorSpace: true
}

textareaValueDefault = `vec4 getChangedVertex(in vec4 initialVertex) {

    Plane e1 = Plane(0.,1.,0.,0.);

    Dq identity = mul(e1,e1);
    
    //Plane controllingPlane = Plane(0.,0.,0.,1.);
    //Dq quat = mul(e1,controllingPlane);

    //vec3 arrowVector1 = vec3(-1.,0.,0.);
    //vec3 arrowVector2 = vec3(0.,0.,-1.);
    //Plane plane1 = Plane(0.,arrowVector1.x,arrowVector1.y,arrowVector1.z);
    //Plane plane2 = Plane(0.,arrowVector2.x,arrowVector2.y,arrowVector2.z);
    //Dq quatFromVectors = mul( plane2, plane1 );

    //normalizeQuat(quatFromVectors);
    //Dq v1ToV2 = add(quatFromVectors,identity);
    //v1ToV2; arrowVector1; arrowVector2;

    return apply(identity,initialVertex);
}`