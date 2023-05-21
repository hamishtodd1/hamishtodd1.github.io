glslEga = `

struct Dq {
    float w;
    float e01; float e02; float e03;
    float e12; float e31; float e23;
    float e0123;
};

struct Plane {
    float e1; float e2; float e3;
    float e0;
};

struct Flec {
    float e0; float e1; float e2; float e3;
    float e021; float e013; float e032; float e123;
};

Dq Quat( in float x, in float y, in float z, in float w ) {
    return Dq(w,  0.,0.,0., z,y,x,  0.);
}

Dq Line( in float x, in float y, in float z, in float _e01, in float _e02, in float _e03) {
    return Dq(0., _e01, _e02, _e03, z,y,x, 0. ); //SO NOTE: DIFFERENT XYZ ORDER FROM BARE DECLARATION OF DQ
}

Dq Translation( in float x, in float y, in float z, in float w ) {
    return Dq(w,  0.,0.,0., x*.5,y*.5,z*.5,  0.);
}

Dq reverse(in Dq a) {
    return Dq( a.w, -a.e01, -a.e02, -a.e03, -a.e12, -a.e31, -a.e23, a.e0123 );
}


Dq add(in Dq a, in Dq b) {
    return Dq( a.w+b.w, a.e01+b.e01, a.e02+b.e02, a.e03+b.e03, a.e12+b.e12, a.e31+b.e31, a.e23+b.e23, a.e0123+b.e0123 );
}
Dq sub(in Dq a, in Dq b) {
    return Dq( a.w-b.w, a.e01-b.e01, a.e02-b.e02, a.e03-b.e03, a.e12-b.e12, a.e31-b.e31, a.e23-b.e23, a.e0123-b.e0123 );
}
Dq mul(in Dq a, in float b) {
    return Dq( a.w * b, a.e01 * b, a.e02 * b, a.e03 * b, a.e12 * b, a.e31 * b, a.e23 * b, a.e0123 * b );
}
Dq mul(in float b, in Dq a) {
    return Dq( a.w * b, a.e01 * b, a.e02 * b, a.e03 * b, a.e12 * b, a.e31 * b, a.e23 * b, a.e0123 * b );
}

Dq addScaled(in Dq a, in Dq b, in float scale) {
    return Dq( a.w+scale*b.w, a.e01+scale*b.e01, a.e02+scale*b.e02, a.e03+scale*b.e03, a.e12+scale*b.e12, a.e31+scale*b.e31, a.e23+scale*b.e23, a.e0123+scale*b.e0123 );
}

Plane add(in Plane a, in Plane b) {
    return Plane( a.e0+b.e0, a.e1+b.e1, a.e2+b.e2, a.e3+b.e3 );
}
Plane sub(in Plane a, in Plane b) {
    return Plane( a.e0-b.e0, a.e1-b.e1, a.e2-b.e2, a.e3-b.e3 );
}
Plane mul(in Plane a, in float b) {
    return Plane( a.e0 * b, a.e1 * b, a.e2 * b, a.e3 * b );
}
Plane mul(in float b, in Plane a) {
    return Plane( a.e0 * b, a.e1 * b, a.e2 * b, a.e3 * b );
}

Dq fastInverse(in Dq a) {
    return Dq(a.w, -a.e01, -a.e02, -a.e03, -a.e12, -a.e31, -a.e23, a.e0123 );
}
Dq normalizeQuat(inout Dq R) {
    float s = 1./sqrt((R.w*R.w + R.e12*R.e12 + R.e31*R.e31 + R.e23*R.e23));
    float d = (R.e0123*R.w - (R.e01*R.e23 + R.e02*R.e31 + R.e03*R.e12))*s*s;
    R = mul(R, s);
    R.e01 += R.e23*d; R.e02 += R.e31*d; R.e03 += R.e12*d; R.e0123 -= R.w*d;

    return R;
}

void planeToMv(in Plane p, out float[16] target) {
    for(int i = 0; i < 16; ++i)
        target[i] = 0.;
    target[1] = p.e0;
    target[2] = p.e1;
    target[3] = p.e2;
    target[4] = p.e3;
}
Plane mvToPlane(in float[16] mv) {
    Plane ret;
    ret.e0 = mv[1];
    ret.e1 = mv[2];
    ret.e2 = mv[3];
    ret.e3 = mv[4];

    return ret;
}

// void vecToMv(in vec3 v, out float[16] target) {
//     for(int i = 0; i < 16; ++i)
//         target[i] = 0.;
//     target[11] = v.z;
//     target[12] = v.y;
//     target[13] = v.x;
//     target[14] = 0.;
// }
void vecToMv(in vec4 v, out float[16] target) {
    for(int i = 0; i < 16; ++i)
        target[i] = 0.;
    target[11] = v.z;
    target[12] = v.y;
    target[13] = v.x;
    target[14] = v.w;
}
vec4 vec4FromMv(in float[16] target) {
    vec4 ret;
    ret.z = target[11];
    ret.y = target[12];
    ret.x = target[13];
    ret.w = target[14];
    return ret;
}
void dqToMv(in Dq ourDq, out float[16] target) {
    target[ 0] = ourDq.w;
    target[ 1] = 0.;        target[ 2] = 0.;        target[ 3] = 0.;        target[ 4] = 0.;
    target[ 5] = ourDq.e01; target[ 6] = ourDq.e02; target[ 7] = ourDq.e03;
    target[ 8] = ourDq.e12; target[ 9] = ourDq.e31; target[10] = ourDq.e23;
    target[11] = 0.;        target[12] = 0.;        target[13] = 0.;        target[14] = 0.;
    target[15] = ourDq.e0123;
}
Dq mvToDq(in float[16] mv) {
    Dq ret;
    ret.w= mv[ 0];
    ret.e01   = mv[ 5];
    ret.e02   = mv[ 6];
    ret.e03   = mv[ 7];
    ret.e12   = mv[ 8];
    ret.e31   = mv[ 9];
    ret.e23   = mv[10];
    ret.e0123 = mv[15];

    return ret;
}

vec4 sandwichDqPoint(in Dq dq, in vec4 pt) {
    float[16] dqAsMv;
    dqToMv(dq,dqAsMv);

    float[16] ptAsMv;
    vecToMv(pt, ptAsMv);

    float[16] retAsMv;
    sandwich(dqAsMv,ptAsMv,retAsMv);
    
    return vec4FromMv(retAsMv);
}

Dq sandwichDqDq(in Dq a, in Dq b) {
    float[16] aAsMv;
    dqToMv(a, aAsMv);

    float[16] bAsMv;
    dqToMv(b, bAsMv);

    float[16] retAsMv;
    sandwich(aAsMv, bAsMv, retAsMv);
    
    return mvToDq(retAsMv);
}

Dq join(in vec4 a, in vec4 b) {
    float[16] aAsMv;
    vecToMv(a, aAsMv);
    float[16] bAsMv;
    vecToMv(b, bAsMv);

    float[16] retAsMv;
    join(aAsMv,bAsMv,retAsMv);
    
    return mvToDq(retAsMv);
}

float sinc(in float a) {
    return a == 0. ? 1. : sin(a)/a;
}
Dq dqExp(in Dq B) {
    float linePartEuclideanNorm = (B.e12*B.e12 + B.e31*B.e31 + B.e23*B.e23);
    if (linePartEuclideanNorm==0.)
        return Dq(1., B.e01, B.e02, B.e03, 0., 0., 0., 0.);
    float m = (B.e01*B.e23 + B.e02*B.e31 + B.e03*B.e12), a = sqrt(linePartEuclideanNorm), c = cos(a), s = sinc(a);
    float t = (c-s)*m/linePartEuclideanNorm; //m is 0, c-s is 0
    return Dq(c, s*B.e01 + t*B.e23, s*B.e02 + t*B.e31, s*B.e03 + t*B.e12, s*B.e12, s*B.e31, s*B.e23, m*s);

    //nneeds to be such that t == 0 and s == 1
}

Dq dqLog(in Dq m ) {
    float a = 1./(1. - m.w*m.w);
    float b = acos(m.w)*sqrt(a);
    float c = a*m.e0123*(1. - m.w*b);

    return Dq(
        0.,
        c*m.e23 + b*m.e01,
        c*m.e31 + b*m.e02,
        c*m.e12 + b*m.e03,
        m.e12 * b, //if m.e11 == 1, m.e12, m.e31, m.e23 would all be 0 anyway
        m.e31 * b,
        m.e23 * b,
        0. );
}

// Dq angleAndAxisVecToDq(in float angle, in vec3 axis) {
//     Dq axisDq = Dq(0., 0.,0.,0., angle * axis.z, angle * axis.y, angle * axis.x, 0.);

//     Dq ret;
//     dqExp(axisDq, ret);
//     return ret;
// }

//make sure to end with a newline!

Dq meet(in Plane a, in Plane b) {
    Dq ret;
    ret.e01 = b.e1 * a.e0 - b.e0 * a.e1;
    ret.e02 = b.e2 * a.e0 - b.e0 * a.e2;
    ret.e03 = b.e3 * a.e0 - b.e0 * a.e3;
    ret.e12 = b.e2 * a.e1 - b.e1 * a.e2;
    ret.e31 = b.e1 * a.e3 - b.e3 * a.e1;
    ret.e23 = b.e3 * a.e2 - b.e2 * a.e3;
    return ret;
}
Dq mul(in Plane a, in Plane b) {
    Dq ret;
    ret.w = b.e1 * a.e1 + b.e2 * a.e2 + b.e3 * a.e3;

    ret.e01 = b.e1 * a.e0 - b.e0 * a.e1;
    ret.e02 = b.e2 * a.e0 - b.e0 * a.e2;
    ret.e03 = b.e3 * a.e0 - b.e0 * a.e3;
    ret.e12 = b.e2 * a.e1 - b.e1 * a.e2;
    ret.e31 = b.e1 * a.e3 - b.e3 * a.e1;
    ret.e23 = b.e3 * a.e2 - b.e2 * a.e3;

    return ret;
}
Dq mul(in vec4 a, in vec4 b) {
    Dq ret;
    ret.w = -b.w * a.w;

    ret.e01 = b.w * a.x - b.x * a.w;
    ret.e02 = b.w * a.y - b.y * a.w;
    ret.e03 = b.w * a.z - b.z * a.w;
    return ret;
}
float norm(Dq a) {
    return sqrt(a.w * a.w + a.e12 * a.e12 + a.e31 * a.e31 + a.e23 * a.e23);
}
Dq mul(in Dq a, in Dq b) {
    Dq ret;
    ret.w   = b.w   * a.w   - b.e12 * a.e12 - b.e31 * a.e31 - b.e23 * a.e23;

    ret.e01 = b.e01 * a.w   + b.w   * a.e01 - b.e12 * a.e02 + b.e31 * a.e03 + b.e02 * a.e12 - b.e03 * a.e31 - b.e0123 * a.e23 - b.e23 * a.e0123;
    ret.e02 = b.e02 * a.w   + b.e12 * a.e01 + b.w   * a.e02 - b.e23 * a.e03 - b.e01 * a.e12 - b.e0123 * a.e31 + b.e03 * a.e23 - b.e31 * a.e0123;
    ret.e03 = b.e03 * a.w   - b.e31 * a.e01 + b.e23 * a.e02 + b.w   * a.e03 - b.e0123 * a.e12 + b.e01 * a.e31 - b.e02 * a.e23 - b.e12 * a.e0123;
    
    ret.e12 = b.e12 * a.w   + b.w   * a.e12 + b.e23 * a.e31 - b.e31 * a.e23;
    ret.e31 = b.e31 * a.w   - b.e23 * a.e12 + b.w   * a.e31 + b.e12 * a.e23;
    ret.e23 = b.e23 * a.w   + b.e31 * a.e12 - b.e12 * a.e31 + b.w   * a.e23;

    ret.e0123 = b.e0123 * a.w   + b.e23 * a.e01 + b.e31 * a.e02 + b.e12 * a.e03 + b.e03 * a.e12 + b.e02 * a.e31 + b.e01 * a.e23 + b.w   * a.e0123;
    return ret;
}

// mat4 mul(in mat4 a, in mat4 b) {
    
//     m[  0 ] = a11 * b11 + a12 * b21 + a13 * b31 + a14 * b41;
//     m[  4 ] = a11 * b12 + a12 * b22 + a13 * b32 + a14 * b42;
//     m[  8 ] = a11 * b13 + a12 * b23 + a13 * b33 + a14 * b43;
//     m[ 12 ] = a11 * b14 + a12 * b24 + a13 * b34 + a14 * b44;

//     m[  1 ] = a21 * b11 + a22 * b21 + a23 * b31 + a24 * b41;
//     m[  5 ] = a21 * b12 + a22 * b22 + a23 * b32 + a24 * b42;
//     m[  9 ] = a21 * b13 + a22 * b23 + a23 * b33 + a24 * b43;
//     m[ 13 ] = a21 * b14 + a22 * b24 + a23 * b34 + a24 * b44;

//     m[  2 ] = a31 * b11 + a32 * b21 + a33 * b31 + a34 * b41;
//     m[  6 ] = a31 * b12 + a32 * b22 + a33 * b32 + a34 * b42;
//     m[ 10 ] = a31 * b13 + a32 * b23 + a33 * b33 + a34 * b43;
//     m[ 14 ] = a31 * b14 + a32 * b24 + a33 * b34 + a34 * b44;

//     m[  3 ] = a41 * b11 + a42 * b21 + a43 * b31 + a44 * b41;
//     m[  7 ] = a41 * b12 + a42 * b22 + a43 * b32 + a44 * b42;
//     m[ 11 ] = a41 * b13 + a42 * b23 + a43 * b33 + a44 * b43;
//     m[ 15 ] = a41 * b14 + a42 * b24 + a43 * b34 + a44 * b44;
// }

// mul( Plane( 1, 0, 0, 0), Plane( 0, 0, 1, 0) ) == Quat( 0, 1, 0, 0)


//no plane*dq unless you have rotoreflections!
vec4 meet(in Plane a, in Dq b) {
    vec4 ret;
    ret.z = -b.e12 * a.e0 + b.e02 * a.e1 - b.e01 * a.e2;
    ret.y = -b.e31 * a.e0 - b.e03 * a.e1 + b.e01 * a.e3;
    ret.x = -b.e23 * a.e0 + b.e03 * a.e2 - b.e02 * a.e3;
    ret.w =  b.e23 * a.e1 + b.e31 * a.e2 + b.e12 * a.e3;
    return ret;
}
vec4 meet(in Dq b, in Plane a) { //a dirty trick, swapping the arguments! This misses out on potential sign changes!
    vec4 ret;
    ret.z = -b.e12 * a.e0 + b.e02 * a.e1 - b.e01 * a.e2;
    ret.y = -b.e31 * a.e0 - b.e03 * a.e1 + b.e01 * a.e3;
    ret.x = -b.e23 * a.e0 + b.e03 * a.e2 - b.e02 * a.e3;
    ret.w =  b.e23 * a.e1 + b.e31 * a.e2 + b.e12 * a.e3;
    return ret;
}

Plane join(in vec4 a, in Dq b) {
    float[16] aAsMv;
    vecToMv(a, aAsMv);
    float[16] bAsMv;
    dqToMv(b, bAsMv);

    float[16] retAsMv;
    join(aAsMv,bAsMv,retAsMv);
    
    return mvToPlane(retAsMv);
}
Plane join(in Dq a, in vec4 b) {
    float[16] aAsMv;
    dqToMv(a, aAsMv);
    float[16] bAsMv;
    vecToMv(b, bAsMv);

    float[16] retAsMv;
    join(aAsMv,bAsMv,retAsMv);
    
    return mvToPlane(retAsMv);
}


// Plane join(in Dq a, in vec4 b) {
//     Plane ret;
//     ret.e3 = - a.e03 * b.w + a.e31 * b.x - a.e23 * b.y;
//     ret.e2 = - a.e02 * b.w - a.e12 * b.x + a.e23 * b.z;
//     ret.e1 = - a.e01 * b.w + a.e12 * b.y - a.e31 * b.z;
//     ret.e0 = + a.e01 * b.x + a.e02 * b.y + a.e03 * b.z;

//     return ret;
// }

// Plane join(in vec4 b, in Dq a) {
//     Plane ret;
//     ret.e3 = - a.e03 * b.w + a.e31 * b.x - a.e23 * b.y;
//     ret.e2 = - a.e02 * b.w - a.e12 * b.x + a.e23 * b.z;
//     ret.e1 = - a.e01 * b.w + a.e12 * b.y - a.e31 * b.z;
//     ret.e0 = + a.e01 * b.x + a.e02 * b.y + a.e03 * b.z;
//     return ret;
// }

vec3 apply( in Dq m, in vec3 v ) {
    vec4 asVec4 = vec4(v,1.);
    vec4 retVec4 = sandwichDqPoint( m, asVec4 );
    return retVec4.xyz;
}
vec4 apply( in Dq m, in vec4 p ) {
    return sandwichDqPoint( m, p );
}

//the transform goes first, the object second
Dq apply( in Plane p, in Dq m) {
    float[16] pAsMv;
    planeToMv(p, pAsMv);

    float[16] mAsMv;
    dqToMv(m, mAsMv);

    float[16] retAsMv;
    sandwich(pAsMv, mAsMv, retAsMv);

    return mvToDq(retAsMv);
}
Plane apply( in Dq m, in Plane p) {
    float[16] pAsMv;
    planeToMv(p, pAsMv);

    float[16] mAsMv;
    dqToMv(m, mAsMv);

    float[16] retAsMv;
    sandwich(mAsMv, pAsMv, retAsMv);

    return mvToPlane(retAsMv);
}

Plane apply( in Plane p1, in Plane p2) {
    float[16] p1AsMv;
    planeToMv(p1, p1AsMv);

    float[16] p2AsMv;
    planeToMv(p2, p2AsMv);

    float[16] retAsMv;
    sandwich(p1AsMv, p2AsMv, retAsMv);

    Plane ret = mvToPlane(retAsMv);
    ret.e0 *= -.1;
    ret.e1 *= -.1;
    ret.e2 *= -.1;
    ret.e3 *= -.1;

    return ret;
}

Plane apply( in vec4 pt, in Plane p) {
    float[16] pAsMv;
    planeToMv(p, pAsMv);

    float[16] ptAsMv;
    vecToMv(pt, ptAsMv);

    float[16] retAsMv;
    sandwich(ptAsMv, pAsMv, retAsMv);

    Plane ret = mvToPlane(retAsMv);
    ret.e0 *= -.1;
    ret.e1 *= -.1;
    ret.e2 *= -.1;
    ret.e3 *= -.1;

    return ret;
}

vec4 apply( in Plane p, in vec4 pt) {
    float[16] pAsMv;
    planeToMv(p, pAsMv);

    float[16] ptAsMv;
    vecToMv(pt, ptAsMv);

    float[16] retAsMv;
    sandwich(pAsMv, ptAsMv, retAsMv);

    vec4 ret = vec4FromMv(retAsMv);
    ret.x *= -.1;
    ret.y *= -.1;
    ret.z *= -.1;
    ret.w *= -.1;

    return ret;
}

vec4 apply( in vec4 p1, in vec4 p2) {
    float[16] p1AsMv;
    vecToMv(p1, p1AsMv);

    float[16] p2AsMv;
    vecToMv(p2, p2AsMv);

    float[16] retAsMv;
    sandwich(p1AsMv, p2AsMv, retAsMv);

    vec4 ret = vec4FromMv(retAsMv);
    ret.x *= -.1;
    ret.y *= -.1;
    ret.z *= -.1;
    ret.w *= -.1;

    return ret;
}

Dq div(in Dq a, in Dq b) {
    return mul(a,fastInverse(b));
}

mat4 toMat4( in Dq dq ) {
    float r44 = dq.e12*dq.e12;
    float r55 = dq.e31*dq.e31;
    float r66 = dq.e23*dq.e23;

    float r45 = dq.e12*dq.e31;
    float r46 = dq.e12*dq.e23;
    float r56 = dq.e31*dq.e23;

    float r04 = dq.w*dq.e12;
    float r05 = dq.w*dq.e31; 
    float r06 = dq.w*dq.e23;

    return mat4(1. + 2.*(-r44-r55),      2.*( r04+r56),      2.*( r46-r05), 2.*( dq.e03*dq.e31-dq.e02*dq.e12-dq.w*dq.e01-dq.e0123*dq.e23),
                     2.*( r56-r04), 1. + 2.*(-r44-r66),      2.*( r06+r45), 2.*( dq.e01*dq.e12-dq.e03*dq.e23-dq.w*dq.e02-dq.e0123*dq.e31),
                     2.*( r05+r46),      2.*( r45-r06), 1. + 2.*(-r55-r66), 2.*( dq.e02*dq.e23-dq.e01*dq.e31-dq.w*dq.e03-dq.e0123*dq.e12),
                     0.,0.,0.,1.);
}

`