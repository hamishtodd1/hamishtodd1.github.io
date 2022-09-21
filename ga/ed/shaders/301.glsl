struct Dq {
    float scalar;
    float e01; float e02; float e03;
    float e12; float e31; float e23;
    float e0123;
};

struct Plane {
    float e0; float e1; float e2; float e3;
};

struct weight4 {
    float w0; float w1; float w2; float w3;
};

//might be good to normalize afterwards
Dq dqAdd(in Dq a, in Dq b) {
    return Dq( a.scalar+b.scalar, a.e01+b.e01, a.e02+b.e02, a.e03+b.e03, a.e12+b.e12, a.e31+b.e31, a.e23+b.e23, a.e0123+b.e0123 );
}
Dq dqMulScalar(in Dq a, in float b) {
    return Dq( a.scalar * b, a.e01 * b, a.e02 * b, a.e03 * b, a.e12 * b, a.e31 * b, a.e23 * b, a.e0123 * b );
}
Dq dqAPlusBTimesT(in Dq a, in Dq b, in float t) {
    return dqAdd(a, dqMulScalar(b, t));
}

void mvFromVec(in vec3 v, out float[16] target) {
    target[11] = v.z;
    target[12] = v.y;
    target[13] = v.x;
    target[14] = 1.;
}
void mvFromVec(in vec4 v, out float[16] target) {
    target[11] = v.z;
    target[12] = v.y;
    target[13] = v.x;
    target[14] = v.w;
}
void vec4FromMv(in float[16] target, out vec4 v) {
    v.z = target[11];
    v.y = target[12];
    v.x = target[13];
    v.w = target[14];
}
void dqToMv(in Dq ourDq, out float[16] target) {
    target[ 0] = ourDq.scalar;
    target[ 1] = 0.;        target[ 2] = 0.;        target[ 3] = 0.;        target[ 4] = 0.;
    target[ 5] = ourDq.e01; target[ 6] = ourDq.e02; target[ 7] = ourDq.e03;
    target[ 8] = ourDq.e12; target[ 9] = ourDq.e31; target[10] = ourDq.e23;
    target[11] = 0.;        target[12] = 0.;        target[13] = 0.;        target[14] = 0.;
    target[15] = ourDq.e0123;
}
void mvToDq(in float[16] mv, out Dq target) {
    target.scalar= mv[ 0];
    target.e01   = mv[ 5];
    target.e02   = mv[ 6];
    target.e03   = mv[ 7];
    target.e12   = mv[ 8];
    target.e31   = mv[ 9];
    target.e23   = mv[10];
    target.e0123 = mv[15];
}

vec4 sandwichDqPt(in Dq dq, in vec4 pt) {
    float[16] dqAsMv;
    dqToMv(dq,dqAsMv);

    float[16] ptAsMv;
    mvFromVec(pt, ptAsMv);

    float[16] retAsMv;
    sandwich(dqAsMv,ptAsMv,retAsMv);
    
    vec4 ret;
    vec4FromMv(retAsMv,ret);
    return ret;
}

Dq sandwichDqDq(in Dq a, in Dq b) {
    float[16] aAsMv;
    dqToMv(a, aAsMv);

    float[16] bAsMv;
    dqToMv(b, bAsMv);

    float[16] retAsMv;
    sandwich(aAsMv, bAsMv, retAsMv);
    
    Dq ret;
    mvToDq(retAsMv,ret);
    return ret;
}

Dq joinPtsInDq(in vec4 a, in vec4 b) {
    float[16] aAsMv;
    mvFromVec(a, aAsMv);
    float[16] bAsMv;
    mvFromVec(b, bAsMv);

    float[16] retAsMv;
    join(aAsMv,bAsMv,retAsMv);
    
    Dq ret;
    mvToDq(retAsMv,ret);
    return ret;
}



float sinc(in float a) {
    return a == 0. ? 1. : sin(a)/a;
}
void dqExp(in Dq B, out Dq target) {
    float l = (B.e12*B.e12 + B.e31*B.e31 + B.e23*B.e23);  float m = (B.e01*B.e23 + B.e02*B.e31 + B.e03*B.e12);
    float a = sqrt(l);                                    float b = m/l;
    float c = cos(a);                                     float s = sinc(a); // if output is a translation, l=0, therefore c=1, s=0

    float t = b*(c-s); // 0 if translation

    target =  Dq(
        c,
        s * B.e01 + t * B.e23,
        s * B.e02 + t * B.e31,
        s * B.e03 + t * B.e12,
        s * B.e12,
        s * B.e31,
        s * B.e23,
        s * m
    );
}

//assumes normalization
//makes a choice about whether sqrt(e12) is 1 + e12 or -1 + e12
// Dq dqLog(in Dq m ) {
//     if( m[0] == 1. ) //it's a translation. Can this be gotten rid of? b0 = 1, b1 = 0, c = 0.
//         return Dq(0., m.e01,m.e02,m.e03, 0.,0.,0., 0.);

//     float a = 1. / (1. - m.scalar*m.scalar);
//     float b = acos(m.scalar) * sqrt(a);
//     float c = a * m.e0123 * (1. - m.scalar*b);

//     return Dq(
//         0., 
//         c*m.e23 + b*m.e01,
//         c*m.e13 + b*m.e02,
//         c*m.e12 + b*m.e03,
//         b*m.e12,
//         b*m.e13,
//         b*m.e23, 
//         0. );
// }

// Dq dqNormalize(in Dq m, out Dq target) {
//     float sSquared = 1. / (m.scalar*m.scalar + m.e12*m.e12 + m.e13*m.e13 + m.e23*m.e23);
//     float d =  sSquared * (m.e0123*m.scalar - (m.e01*m.e23 + m.e02*m.e13 + m.e03*m.e12));
//     float s = sqrt(sSquared);

//     Dq ret = Dq(
//         s*m.scalar,

//         s*m.e01,
//         s*m.e02,
//         s*m.e03,

//         s*m.e12,
//         s*m.e13,
//         s*m.e23,

//         s*m.e0123,
//     );

//     ret.e01 += ret.e23 * d;
//     ret.e02 += ret.e13 * d;
//     ret.e03 += ret.e12 * d;
//     ret.e0123 -= ret.scalar * d;
//     return target;
// }

//make sure to end with a newline!
