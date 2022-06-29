void mainImage( out vec4 fragColor ) {
    vec3 myVec = vec3(1.,1.,1.);

    Dq rotation = Dq(myVec.x, 0.,0.,0., 0.,myVec.y,0., 0.);

    Dq idealLine = Dq(0., 0.,1.,0., 0.,0.,0., 0.);
    Dq eucliLine = Dq(0., 0.,0.,0., 0.,1.,1., 0.);
    Dq myRotor = Dq(1., 0.,0.,0.,  1.,0.,0.,  0.);
    
    //Dq transformedEucliLine = sandwichDqDq( myRotor, eucliLine);
    
    fragColor = vec4(0.,myVec.x,myVec.y,1.);
}

//END//

//try eg 1 + e12 + e0123
//and 1 + e01 + e0123



// void mainImage( out vec4 fragColor ) {

//     vec3 exampleVector = vec3(1.,1.,1.);

//     // Some examples of euclidean points (not exactly "vectors"!)
//     vec4 A = vec4(0.,-1.,0.,1.);
//     vec4 B = vec4(exampleVector,1.);

//     // An IDEAL point
//     vec4 myIdealPoint = vec4(1.,1.,0.,0.);

//     // Addition gives the thing halfway between A and B (they need to be normalized)
//     vec4 A_B_Added = A + B;

//     // The Join product gives the line that contains A and B
//     Dq A_B_joined = joinPtsInDq(A,B);


    
//     // Control the angle with x coordinate of another vec3
//     vec3 angleController = vec3(1.,1.,0.);
//     axis.e12 *= angleController.x; axis.e23 *= angleController.x; axis.e31 *= angleController.x;

//     // Create a transformation by exponentiating the axis
//     Dq transformation;
//     dqExp(axis, transformation);

//     // Apply transformation to the point
//     vec4 transformedA = sandwichDqPt(transformation, A);


//     // ignore this ;)
//     fragColor = vec4(0.,0.,0.,1.);
// }



