struct Dq {
    float scalar;
    float e01; float e02; float e03;
    float e12; float e31; float e23;
    float e0123;
};

struct Line {
    vec3 originPart;
    vec3 idealPart;
};

//getting erroneous stuff from this, hopefully IT is wrong
// vec4 sandwichDqPt(in Dq dq, in vec4 pt) {
//     float a1 = dq.e01, a2 = dq.e02, a3 = dq.e03, a4 = dq.e12, a5 = dq.e31, a6 = dq.e23;
//     float _2a0 = 2. * dq.scalar, _2a4 = 2. * a4, _2a5 = 2. * a5, a0a0 = dq.scalar * dq.scalar, a4a4 = a4 * a4, a5a5 = a5 * a5, a6a6 = a6 * a6, _2a6 = 2. * a6, _2a0a4 = _2a0 * a4, _2a0a5 = _2a0 * a5, _2a0a6 = _2a0 * a6, _2a4a5 = _2a4 * a5, _2a4a6 = _2a4 * a6, _2a5a6 = _2a5 * a6;
//     float n0 = (_2a0 * a3 + _2a4 * dq.e0123 - _2a6 * a2 - _2a5 * a1), x0 = (a0a0 + a4a4 - a5a5 - a6a6), y0 = (_2a4a5 + _2a0a6), z0 = (_2a4a6 - _2a0a5);
//     float n1 = (_2a4 * a1 - _2a0 * a2 - _2a6 * a3 + _2a5 * dq.e0123), x1 = (_2a4a5 - _2a0a6), y1 = (a0a0 - a4a4 + a5a5 - a6a6), z1 = (_2a0a4 + _2a5a6);
//     float n2 = (_2a0 * a1 + _2a4 * a2 + _2a5 * a3 + _2a6 * dq.e0123), x2 = (_2a0a5 + _2a4a6), y2 = (_2a5a6 - _2a0a4), z2 = (a0a0 - a4a4 - a5a5 + a6a6);
//     float n3 = (a0a0 + a4a4 + a5a5 + a6a6);

//     vec4 ret = vec4(
//         x0*pt.x + y0*pt.y + z0*pt.z + n0*pt.w,
//         x1*pt.x + y1*pt.y + z1*pt.z + n1*pt.w,
//         x2*pt.x + y2*pt.y + z2*pt.z + n2*pt.w,
//         n3*pt.w
//     );
//     return ret;
// }

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
    return a == 0. ? 1. : sin(a);
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

// Dq join(in vec4 a, in vec4 b) {

// }

// float[16] ToMv(in vec4) {

// }

