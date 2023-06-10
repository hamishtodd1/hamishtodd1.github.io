//try to characterize those transformations differently perhaps? In terms of circle pencils etc
//2D CGA. Grade 1 is circles.


glslCga = `
#define TAU 6.28318530718

void reverse(in float[16] rotor, out float[16] target) {

    target[ 0] =  rotor[ 0];

    target[ 1] = -rotor[ 1];
    target[ 2] = -rotor[ 2];
    target[ 3] = -rotor[ 3];
    target[ 4] = -rotor[ 4];
    target[ 5] = -rotor[ 5];
    target[ 6] = -rotor[ 6];
    target[ 7] = -rotor[ 7];
    target[ 8] = -rotor[ 8];
    target[ 9] = -rotor[ 9];
    target[10] = -rotor[10];
    
    target[11] =  rotor[11];
    target[12] =  rotor[12];
    target[13] =  rotor[13];
    target[14] =  rotor[14];
    target[15] =  rotor[15];
}

//Horrifying. But, a very important function, you're going to be conformally transforming shit and telling others to do so
vec3 sandwichRotorPoint(in float[16] rotor, in vec3 pointVec ) {
    //point is grade 4. Gonna use that "up" function!
    //Indices we work out by looking at duals of eo and e0c
    //nonzero indices: 

    //rotor is grades 0, 2, 4
    //nonzero indices: 0,   6,7,8,9,10,11,12,13,14,15,    26,27,28,29,30

    // see "A Covariant approach to geometry". We're not bothering with the scalar factor
    //so, because we're plane-based, when you dualize you get an extra minus sign
    //So: !e0c is -e123p-e123m, check it!
    // x + 0.5(x^2)*(    e_inf     ) - 0.5(   e_orig    )   //n is point at inf, 
    // x + 0.5(x^2)*(   !(ep+em)   ) - 0.5(  !(ep-em)   ) 
    // x + 0.5(x^2)*(-e123p - e123m) - 0.5(e123p - e123m)
    // x + e123p*(-0.5(x^2) -0.5)  +  e123m*(-0.5(x^2) + 0.5)

    float lengthSq = pointVec.x*pointVec.x + pointVec.y*pointVec.y + pointVec.z*pointVec.z;
    float point_26 = .5*lengthSq + .5; // e123p
    float point_27 = .5*lengthSq - .5; // e123m
    float point_28 =  pointVec.z;
    float point_29 = -pointVec.y;
    float point_30 =  pointVec.x;

    float[16] inte; //intermediate. It's a rotor too

    inte[ 0] = + point_26 * rotor[11] - point_27 * rotor[12] - point_28 * rotor[13] - point_29 * rotor[14] - point_30 * rotor[15];
    
    inte[ 1] = - point_26 * rotor[ 8] + point_27 * rotor[ 9] + point_28 * rotor[10] - point_30 * rotor[14] + point_29 * rotor[15];
    inte[ 2] = + point_26 * rotor[ 6] - point_27 * rotor[ 7] + point_29 * rotor[10] + point_30 * rotor[13] - point_28 * rotor[15];
    inte[ 3] = - point_26 * rotor[ 5] - point_28 * rotor[ 7] - point_29 * rotor[ 9] - point_30 * rotor[12] + point_27 * rotor[15];
    inte[ 4] = - point_27 * rotor[ 5] - point_28 * rotor[ 6] - point_29 * rotor[ 8] - point_30 * rotor[11] + point_26 * rotor[15];
    inte[ 5] = - point_26 * rotor[ 3] + point_27 * rotor[ 4] + point_30 * rotor[10] - point_29 * rotor[13] + point_28 * rotor[14];
    inte[ 6] = + point_26 * rotor[ 2] + point_28 * rotor[ 4] - point_30 * rotor[ 9] + point_29 * rotor[12] - point_27 * rotor[14];
    inte[ 7] = + point_27 * rotor[ 2] + point_28 * rotor[ 3] - point_30 * rotor[ 8] + point_29 * rotor[11] - point_26 * rotor[14];
    inte[ 8] = - point_26 * rotor[ 1] + point_29 * rotor[ 4] + point_30 * rotor[ 7] - point_28 * rotor[12] + point_27 * rotor[13];
    inte[ 9] = - point_27 * rotor[ 1] + point_29 * rotor[ 3] + point_30 * rotor[ 6] - point_28 * rotor[11] + point_26 * rotor[13];
    inte[10] = - point_28 * rotor[ 1] - point_29 * rotor[ 2] - point_30 * rotor[ 5] + point_27 * rotor[11] - point_26 * rotor[12];
    
    inte[11] =   point_26 * rotor[ 0] + point_30 * rotor[ 4] - point_29 * rotor[ 7] + point_28 * rotor[ 9] - point_27 * rotor[10];
    inte[12] =   point_27 * rotor[ 0] + point_30 * rotor[ 3] - point_29 * rotor[ 6] + point_28 * rotor[ 8] - point_26 * rotor[10];
    inte[13] =   point_28 * rotor[ 0] - point_30 * rotor[ 2] + point_29 * rotor[ 5] - point_27 * rotor[ 8] + point_26 * rotor[ 9];
    inte[14] =   point_29 * rotor[ 0] + point_30 * rotor[ 1] - point_28 * rotor[ 5] + point_27 * rotor[ 6] - point_26 * rotor[ 7];
    inte[15] =   point_30 * rotor[ 0] - point_29 * rotor[ 1] + point_28 * rotor[ 2] - point_27 * rotor[ 3] + point_26 * rotor[ 4];

    float[16] sr; //rotor reverse
    reverse( rotor, sr );

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

    vec3 ret;

    float lambda = 1./(ret_26-ret_27);
    ret_26 *= lambda; ret_27 *= lambda; ret_28 *= lambda; ret_29 *= lambda; ret_30 *= lambda;
     
    float lengthSqDesired = ret_26+ret_27;
    float lengthSqCurrent = ret_28*ret_28 + ret_29*ret_29 + ret_30*ret_30;
    if (abs(lengthSqCurrent - lengthSqDesired) > .01) {
        //if this causes half of a mesh to fuck up, then really the whole mesh is fucked up.
        ret.z = 999.;
        ret.y = 999.;
        ret.x = 999.;
    }
    else 
    {
        ret.z =  ret_28;
        ret.y = -ret_29;
        ret.x =  ret_30;
    }

    return ret;
}

`