//try to characterize those transformations differently perhaps? In terms of circle pencils etc
//2D CGA. Grade 1 is circles.


glslCga = `

void reverse(in float[16] spinor, out float[16] target) {

    target[ 0] =  spinor[ 0];

    target[ 1] = -spinor[ 1];
    target[ 2] = -spinor[ 2];
    target[ 3] = -spinor[ 3];
    target[ 4] = -spinor[ 4];
    target[ 5] = -spinor[ 5];
    target[ 6] = -spinor[ 6];
    target[ 7] = -spinor[ 7];
    target[ 8] = -spinor[ 8];
    target[ 9] = -spinor[ 9];
    target[10] = -spinor[10];
    
    target[11] =  spinor[11];
    target[12] =  spinor[12];
    target[13] =  spinor[13];
    target[14] =  spinor[14];
    target[15] =  spinor[15];
}

//Horrifying. But, a very important function, you're going to be conformally transforming shit and telling others to do so
vec3 sandwichSpinorPoint(in float[16] spinor, in vec3 pointVec ) {
    //point is grade 4. Gonna use that "up" function!
    //Indices we work out by looking at duals of eo and e0c
    //nonzero indices: 

    //spinor is grades 0, 2, 4
    //nonzero indices: 0,   6,7,8,9,10,11,12,13,14,15,    26,27,28,29,30

    // see "A Covariant approach to geometry". We're not bothering with the scalar factor
    // x + 0.5(x^2)*(       n      ) - 0.5(     nBar    ) 
    // x + 0.5(x^2)*(   !(ep+em)   ) - 0.5(  !(ep-em)   ) 
    // x + 0.5(x^2)*(-e123p - e123m) - 0.5(e123p - e123m)
    // x + e123p*(-0.5(x^2) -0.5)  +  e123m*(-0.5(x^2) + 0.5)

    float xSquared = pointVec.x*pointVec.x + pointVec.y*pointVec.y + pointVec.z*pointVec.z;
    float point_26 = -0.5 - 0.5*xSquared; // e123p
    float point_27 =  0.5 - 0.5*xSquared; // e123m
    float point_28 =  pointVec.z;
    float point_29 = -pointVec.y;
    float point_30 =  pointVec.x;

    float[16] inte; //intermediate. It's a spinor too

    inte[ 0] = + point_26 * spinor[11] - point_27 * spinor[12] - point_28 * spinor[13] - point_29 * spinor[14] - point_30 * spinor[15];
    
    inte[ 1] = - point_26 * spinor[ 8] + point_27 * spinor[ 9] + point_28 * spinor[10] - point_30 * spinor[14] + point_29 * spinor[15];
    inte[ 2] = + point_26 * spinor[ 6] - point_27 * spinor[ 7] + point_29 * spinor[10] + point_30 * spinor[13] - point_28 * spinor[15];
    inte[ 3] = - point_26 * spinor[ 5] - point_28 * spinor[ 7] - point_29 * spinor[ 9] - point_30 * spinor[12] + point_27 * spinor[15];
    inte[ 4] = - point_27 * spinor[ 5] - point_28 * spinor[ 6] - point_29 * spinor[ 8] - point_30 * spinor[11] + point_26 * spinor[15];
    inte[ 5] = - point_26 * spinor[ 3] + point_27 * spinor[ 4] + point_30 * spinor[10] - point_29 * spinor[13] + point_28 * spinor[14];
    inte[ 6] = + point_26 * spinor[ 2] + point_28 * spinor[ 4] - point_30 * spinor[ 9] + point_29 * spinor[12] - point_27 * spinor[14];
    inte[ 7] = + point_27 * spinor[ 2] + point_28 * spinor[ 3] - point_30 * spinor[ 8] + point_29 * spinor[11] - point_26 * spinor[14];
    inte[ 8] = - point_26 * spinor[ 1] + point_29 * spinor[ 4] + point_30 * spinor[ 7] - point_28 * spinor[12] + point_27 * spinor[13];
    inte[ 9] = - point_27 * spinor[ 1] + point_29 * spinor[ 3] + point_30 * spinor[ 6] - point_28 * spinor[11] + point_26 * spinor[13];
    inte[10] = - point_28 * spinor[ 1] - point_29 * spinor[ 2] - point_30 * spinor[ 5] + point_27 * spinor[11] - point_26 * spinor[12];
    
    inte[11] =   point_26 * spinor[ 0] + point_30 * spinor[ 4] - point_29 * spinor[ 7] + point_28 * spinor[ 9] - point_27 * spinor[10];
    inte[12] =   point_27 * spinor[ 0] + point_30 * spinor[ 3] - point_29 * spinor[ 6] + point_28 * spinor[ 8] - point_26 * spinor[10];
    inte[13] =   point_28 * spinor[ 0] - point_30 * spinor[ 2] + point_29 * spinor[ 5] - point_27 * spinor[ 8] + point_26 * spinor[ 9];
    inte[14] =   point_29 * spinor[ 0] + point_30 * spinor[ 1] - point_28 * spinor[ 5] + point_27 * spinor[ 6] - point_26 * spinor[ 7];
    inte[15] =   point_30 * spinor[ 0] - point_29 * spinor[ 1] + point_28 * spinor[ 2] - point_27 * spinor[ 3] + point_26 * spinor[ 4];

    float[16] sr; //spinor reverse
    reverse( spinor, sr );

    float ret_26 = sr[11] * inte[ 0] + sr[ 8] * inte[ 1] - sr[ 6] * inte[ 2] + sr[ 5] * inte[ 3] + sr[15] * inte[ 4] + sr[ 3] * inte[ 5] - sr[ 2] * inte[ 6] - sr[14] * inte[ 7]
                 + sr[ 1] * inte[ 8] + sr[13] * inte[ 9] - sr[12] * inte[10] + sr[ 0] * inte[11] + sr[10] * inte[12] - sr[ 9] * inte[13] + sr[ 7] * inte[14] - sr[ 4] * inte[15];
    float ret_27 = sr[12] * inte[ 0] + sr[ 9] * inte[ 1] - sr[ 7] * inte[ 2] + sr[15] * inte[ 3] + sr[ 5] * inte[ 4] + sr[ 4] * inte[ 5] - sr[14] * inte[ 6] - sr[ 2] * inte[ 7]
                 + sr[13] * inte[ 8] + sr[ 1] * inte[ 9] - sr[11] * inte[10] + sr[10] * inte[11] + sr[ 0] * inte[12] - sr[ 8] * inte[13] + sr[ 6] * inte[14] - sr[ 3] * inte[15];
    float ret_28 = sr[13] * inte[ 0] + sr[10] * inte[ 1] - sr[15] * inte[ 2] - sr[ 7] * inte[ 3] + sr[ 6] * inte[ 4] + sr[14] * inte[ 5] + sr[ 4] * inte[ 6] - sr[ 3] * inte[ 7]
                 - sr[12] * inte[ 8] + sr[11] * inte[ 9] + sr[ 1] * inte[10] - sr[ 9] * inte[11] + sr[ 8] * inte[12] + sr[ 0] * inte[13] - sr[ 5] * inte[14] + sr[ 2] * inte[15];
    float ret_29 = sr[14] * inte[ 0] + sr[15] * inte[ 1] + sr[10] * inte[ 2] - sr[ 9] * inte[ 3] + sr[ 8] * inte[ 4] - sr[13] * inte[ 5] + sr[12] * inte[ 6] - sr[11] * inte[ 7]
                 + sr[ 4] * inte[ 8] - sr[ 3] * inte[ 9] + sr[ 2] * inte[10] + sr[ 7] * inte[11] - sr[ 6] * inte[12] + sr[ 5] * inte[13] + sr[ 0] * inte[14] - sr[ 1] * inte[15];
    float ret_30 = sr[15] * inte[ 0] - sr[14] * inte[ 1] + sr[13] * inte[ 2] - sr[12] * inte[ 3] + sr[11] * inte[ 4] + sr[10] * inte[ 5] - sr[ 9] * inte[ 6] + sr[ 8] * inte[ 7]
                 + sr[ 7] * inte[ 8] - sr[ 6] * inte[ 9] + sr[ 5] * inte[10] - sr[ 4] * inte[11] + sr[ 3] * inte[12] - sr[ 2] * inte[13] + sr[ 1] * inte[14] + sr[ 0] * inte[15];
    
    float xSquaredDesired = -(ret_26+ret_27);
    float xSquaredCurrent = ret_28*ret_28 + ret_29*ret_29 + ret_30*ret_30;
    float factor = sqrt( xSquaredDesired / xSquaredCurrent );
    vec3 ret;
    ret.z =  ret_28 * factor;
    ret.y = -ret_29 * factor;
    ret.x =  ret_30 * factor;

    return ret;
}

`