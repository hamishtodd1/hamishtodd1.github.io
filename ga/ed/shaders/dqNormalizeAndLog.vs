//assumes normalization. Ideally would not do so
//makes a choice about whether sqrt(e12) is 1 + e12 or -1 + e12
// https://enki.ws/ganja.js/examples/coffeeshop.html#NSELGA
// Dq dqLog(in Dq m ) {
//     if( m.scalar == 1. ) //means that m is a pure translation
//         return Dq(0., m.e01,m.e02,m.e03, 0.,0.,0., 0.);

//     float a = 1. / (1. - m.scalar*m.scalar);
//     float b = acos(m.scalar) * sqrt(a);
//     float c = a * m.e0123 * (1. - m.scalar*b);

//     return Dq(
//         0., 
//         c*m.e23 + b*m.e01,
//         c*m.e31 + b*m.e02,
//         c*m.e12 + b*m.e03,
//         b*m.e12,
//         b*m.e31,
//         b*m.e23, 
//         0. );
// }
//1 acos, 1 sqrt, 1 div, 14 mul, 3 add, 2 sub, 1 branch

// float invSqrt(in float x) {
//     return 1./sqrt(x);
// }

// Dq dqLog(in Dq m ) {
//     float aReciprocal = 1. - m.scalar * m.scalar;
//     float sqrtAReciprocal = invSqrt(x);
//     float b = acos(m.scalar) * sqrtAReciprocal;
//     float c = m.e0123 * (1. - m.scalar*b) / aReciprocal;
// }

//sqrt = inv sqrt followed by reciprocal
//1 acos, 1 sinc, 2 div, 14 mul, 3 add, 1 sub
Dq dqLog(in Dq m ) {
    float acosScalar = acos(m.scalar);              // 0 if m.scalar == 1.
    float A = sinc(acosScalar);                     // 1
    float mn = A*acosScalar;                        // 0
    float b = 1./A;                                 // 1
    float cN = m.e0123 * (mn-m.scalar*acosScalar);  // 0
    float cD = mn*mn*mn;                            // 0
    float c = cN / ( cD == 0. ? 1. : cD );          //if cD is 0, cN is 0 anyway

    return Dq(
        0., 
        c*m.e23 + b*m.e01,
        c*m.e31 + b*m.e02,
        c*m.e12 + b*m.e03,
        m.e12 * b, //if m.scalar == 1, m.e12, m.e31, m.e23 would all be 0 anyway
        m.e31 * b,
        m.e23 * b,
        0. );
}

//other tries
// {
//     float b = 1./A;
//     float cN = m.e0123 * (1. - m.scalar*b);
//     float cD = 1. - m.scalar*m.scalar; // 0 if m.scalar == 1.
//     float c = cN / ( cD == 0. ? 1. : cD );



//     float aReciprocal = 1. - m.scalar*m.scalar;
//     float b = acos(m.scalar) * ();
//     float c = a * m.e0123 * (1. - m.scalar*b);



//     float acosScalar = acos(m.scalar);
//     float A = sinc(acosScalar);                 // 1 if m.scalar == 1.
//     float b = 1./A;
//     float cD = 1. - m.scalar*m.scalar; // 0 if m.scalar == 1.
//     float cN = m.e0123 * (1. - m.scalar*b);
//     float c = cN / ( cD == 0. ? 1. : cD );

//     float C = m.e0123 * (A - m.scalar)/aReciprocal; // == c/b, or 0 if m.scalar == 1.

//     return Dq(
//         0., 
//         ( m.e01 + C * m.e23 ) * b,
//         ( m.e02 + C * m.e31 ) * b,
//         ( m.e03 + C * m.e12 ) * b,
//         m.e12 * b, //if m.scalar == 1, m.e12, m.e31, m.e23 would all be 0 anyway
//         m.e31 * b,
//         m.e23 * b,
//         0. );
// }
//what if it isn't normalized? Is there some way of thinking of it as ratios such that it still makes sense?


// Dq dqNormalize(in Dq m ) {
//     float A = 1. / sqrt(m[0] * m[0] + m[4] * m[4] + m[5] * m[5] + m[6] * m[6]);
//     float B = (m[7] * m[0] - (m[1] * m[6] + m[2] * m[5] + m[3] * m[4])) * A * A * A;
//     return Dq(
//         A * m[0],
//         A * m[1] + B * m[6],
//         A * m[2] + B * m[5],
//         A * m[3] + B * m[4],
//         A * m[4],
//         A * m[5],
//         A * m[6],
//         A * m[7] - B * m[0]);
// }

// Dq dqNormalize(in Dq m) {
//     float aSquared = 1. / (m.scalar*m.scalar + m.e12*m.e12 + m.e13*m.e13 + m.e23*m.e23);
//     float a = sqrt(aSquared);
//     float d = a * aSquared * (m.e0123*m.scalar - (m.e01*m.e23 + m.e02*m.e13 + m.e03*m.e12));

//     Dq ret = Dq(
//         a*m.scalar,

//         a*m.e01,
//         a*m.e02,
//         a*m.e03,

//         a*m.e12,
//         a*m.e13,
//         a*m.e23,

//         a*m.e0123,
//     );

//     ret.e01 += ret.e23 * d;
//     ret.e02 += ret.e13 * d;
//     ret.e03 += ret.e12 * d;
//     ret.e0123 -= ret.scalar * d;
//     return ret;
// }