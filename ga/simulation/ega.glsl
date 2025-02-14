egaGlsl = `

float atan2(in float y, in float x)
{
    bool s = (abs(x) > abs(y));
    return mix(1.5707963267948966 - atan(x,y), atan(y,x), s);
}

void zeroOut(out float[8] target) {
    target[0] = 0.; target[1] = 0.; target[2] = 0.; target[3] = 0.;
    target[4] = 0.; target[5] = 0.; target[6] = 0.; target[7] = 0.;
}

////////////////
// Conversion //
////////////////

void point( in float x, in float y, in float z, in float w, out float[8] target ) {
    target = float[8](
        0., 0., 0., 0.,
        z, y, x, w );
}

void flFromPoint(in vec4 a, out float[8] target) {
    point(a.x, a.y, a.z, a.w, target);
}
vec4 flToPoint(in float[8] a ) {
    return vec4(a[6], a[5], a[4], a[7]);
}

void Plane(in float e0Coef, in float e1Coef, in float e2Coef, in float e3Coef, out float[8] target) {
    target[0] = e0Coef; target[1] = e1Coef; target[2] = e2Coef; target[3] = e3Coef;
    target[4] = 0.; target[5] = 0.; target[6] = 0.; target[7] = 0.;
}

////////////////
// General //
////////////////

void joinPt(in vec4 a, in vec4 b, out float[8] target) {

	target[7] = 0.;
    
    target[6] = + a.x * b.w - a.w * b.x;
    target[5] = + a.y * b.w - a.w * b.y;
    target[4] = + a.z * b.w - a.w * b.z;
    target[3] = + a.y * b.x - a.x * b.y;
    target[2] = - a.z * b.x + a.x * b.z;
    target[1] = + a.z * b.y - a.y * b.z;
    
    target[0] = 0.;
}

void multiplyScalar(in float[8] thing, in float scalar, out float[8] target) {
    for(int i = 0; i < 8; ++i)
        target[i] = thing[i] * scalar;
}

void dqExp(in float[8] B, out float[8] target) {

    float l = (B[4]*B[4] + B[5]*B[5] + B[6]*B[6]);
    if (l==0.) {
        target[0] = 1.;
        target[1] = B[1]; target[2] = B[2]; target[3] = B[3];
        target[4] = 0.; target[5] = 0.; target[6] = 0.; target[7] = 0.;
        return;
    }
    
    float m = (B[1]*B[6] + B[2]*B[5] + B[3]*B[4]), a = sqrt(l), c = cos(a), s = sin(a)/a, t = m/l*(c-s);
    
    target[0] = c;
    target[1] = s*B[1] + t*B[6];
    target[2] = s*B[2] + t*B[5];
    target[3] = s*B[3] + t*B[4];
    target[4] = s*B[4];
    target[5] = s*B[5];
    target[6] = s*B[6];
    target[7] = m*s;
}

void dqNormalize(in float[8] a, out float[8] target) {
    float A = 1. / sqrt(a[4]*a[4]+a[5]*a[5]+a[6]*a[6]);
    float B = (a[7] * a[0] - (a[1] * a[6] + a[2] * a[5] + a[3] * a[4])) * A * A * A;
    
    target[0] = A * a[0];
    target[1] = A * a[1] + B * a[6];
    target[2] = A * a[2] + B * a[5];
    target[3] = A * a[3] + B * a[4];
    target[4] = A * a[4];
    target[5] = A * a[5];
    target[6] = A * a[6];
    target[7] = A * a[7] - B * a[0];
}

void fromUnitAxisAndSeparation( in float[8] axis, in float separation, out float[8] target) {
    float[8] logResult;
    multiplyScalar( axis, separation, logResult );
    dqExp(logResult, target);
}

////////////////
// Sandwiches //
////////////////

//why the hell is it inout? Idk. Switch to out if you can't think of anything
void sandwichDqDq(in float[8] a, in float[8] b, inout float[8] target) {
    float[8] aReverse; getReverseDq(a,aReverse);
    float[8] intermediate; mulDqDq(a,b, intermediate); //result is Dq
    mulDqDq(intermediate, aReverse, target);
}

void sandwichDqFl(in float[8] a, in float[8] b, inout float[8] target) {
    float[8] aReverse; getReverseDq(a,aReverse);
    float[8] intermediate; mulDqFl(a,b, intermediate); //result is Fl
    mulFlDq(intermediate, aReverse, target);
}

void sandwichFlDq(in float[8] a, in float[8] b, inout float[8] target) {
    float[8] aReverse; getReverseFl(a,aReverse);
    float[8] intermediate; mulFlDq(a,b, intermediate); //result is Fl
    mulFlFl(intermediate, aReverse, target);
}

void sandwichFlFl(in float[8] a, in float[8] b, inout float[8] target) {
    float[8] aReverse; getReverseFl(a,aReverse);
    float[8] intermediate; mulFlFl(a,b, intermediate); //result is Dq
    mulDqFl(intermediate, aReverse, target);
}

vec4 sandwichDqPoint(in float[8] a, in vec4 b) {
    float[8] asFl; flFromPoint(b, asFl);
    sandwichDqFl(a, asFl, asFl);
    return flToPoint(asFl);
}
vec3 sandwichDqVertex(in float[8] a, in vec3 b) {
    vec4 ret4 = sandwichDqPoint(a, vec4(b,1.));
    return ret4.xyz / ret4.w;
}

`