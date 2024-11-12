glsl31 = `

precision highp float;

void getReverse(in float[16] a, out float[16] target) {
    target[0] = a[0]; target[1] = a[1]; target[2] = a[2]; target[3] = a[3]; target[4] = a[4]; target[5] = -a[5]; target[6] = -a[6]; target[7] = -a[7]; target[8] = -a[8]; target[9] = -a[9]; target[10] = -a[10]; target[11] = -a[11]; target[12] = -a[12]; target[13] = -a[13]; target[14] = -a[14]; target[15] = a[15];
}

void mul(in float[16] a, in float[16] b, out float[16] target) {
    target[0] = b[0] * a[0] + b[1] * a[1] + b[2] * a[2] + b[3] * a[3] - b[4] * a[4] - b[5] * a[5] - b[6] * a[6] + b[7] * a[7] - b[8] * a[8] + b[9] * a[9] + b[10] * a[10] - b[11] * a[11] + b[12] * a[12] + b[13] * a[13] + b[14] * a[14] - b[15] * a[15];
    target[1] = b[1] * a[0] + b[0] * a[1] - b[5] * a[2] - b[6] * a[3] + b[7] * a[4] + b[2] * a[5] + b[3] * a[6] - b[4] * a[7] - b[11] * a[8] + b[12] * a[9] + b[13] * a[10] - b[8] * a[11] + b[9] * a[12] + b[10] * a[13] - b[15] * a[14] + b[14] * a[15];
    target[2] = b[2] * a[0] + b[5] * a[1] + b[0] * a[2] - b[8] * a[3] + b[9] * a[4] - b[1] * a[5] + b[11] * a[6] - b[12] * a[7] + b[3] * a[8] - b[4] * a[9] + b[14] * a[10] + b[6] * a[11] - b[7] * a[12] + b[15] * a[13] + b[10] * a[14] - b[13] * a[15];
    target[3] = b[3] * a[0] + b[6] * a[1] + b[8] * a[2] + b[0] * a[3] + b[10] * a[4] - b[11] * a[5] - b[1] * a[6] - b[13] * a[7] - b[2] * a[8] - b[14] * a[9] - b[4] * a[10] - b[5] * a[11] - b[15] * a[12] - b[7] * a[13] - b[9] * a[14] + b[12] * a[15];
    target[4] = b[4] * a[0] + b[7] * a[1] + b[9] * a[2] + b[10] * a[3] + b[0] * a[4] - b[12] * a[5] - b[13] * a[6] - b[1] * a[7] - b[14] * a[8] - b[2] * a[9] - b[3] * a[10] - b[15] * a[11] - b[5] * a[12] - b[6] * a[13] - b[8] * a[14] + b[11] * a[15];
    target[5] = b[5] * a[0] + b[2] * a[1] - b[1] * a[2] + b[11] * a[3] - b[12] * a[4] + b[0] * a[5] - b[8] * a[6] + b[9] * a[7] + b[6] * a[8] - b[7] * a[9] + b[15] * a[10] + b[3] * a[11] - b[4] * a[12] + b[14] * a[13] - b[13] * a[14] + b[10] * a[15];
    target[6] = b[6] * a[0] + b[3] * a[1] - b[11] * a[2] - b[1] * a[3] - b[13] * a[4] + b[8] * a[5] + b[0] * a[6] + b[10] * a[7] - b[5] * a[8] - b[15] * a[9] - b[7] * a[10] - b[2] * a[11] - b[14] * a[12] - b[4] * a[13] + b[12] * a[14] - b[9] * a[15];
    target[7] = b[7] * a[0] + b[4] * a[1] - b[12] * a[2] - b[13] * a[3] - b[1] * a[4] + b[9] * a[5] + b[10] * a[6] + b[0] * a[7] - b[15] * a[8] - b[5] * a[9] - b[6] * a[10] - b[14] * a[11] - b[2] * a[12] - b[3] * a[13] + b[11] * a[14] - b[8] * a[15];
    target[8] = b[8] * a[0] + b[11] * a[1] + b[3] * a[2] - b[2] * a[3] - b[14] * a[4] - b[6] * a[5] + b[5] * a[6] + b[15] * a[7] + b[0] * a[8] + b[10] * a[9] - b[9] * a[10] + b[1] * a[11] + b[13] * a[12] - b[12] * a[13] - b[4] * a[14] + b[7] * a[15];
    target[9] = b[9] * a[0] + b[12] * a[1] + b[4] * a[2] - b[14] * a[3] - b[2] * a[4] - b[7] * a[5] + b[15] * a[6] + b[5] * a[7] + b[10] * a[8] + b[0] * a[9] - b[8] * a[10] + b[13] * a[11] + b[1] * a[12] - b[11] * a[13] - b[3] * a[14] + b[6] * a[15];
    target[10] = b[10] * a[0] + b[13] * a[1] + b[14] * a[2] + b[4] * a[3] - b[3] * a[4] - b[15] * a[5] - b[7] * a[6] + b[6] * a[7] - b[9] * a[8] + b[8] * a[9] + b[0] * a[10] - b[12] * a[11] + b[11] * a[12] + b[1] * a[13] + b[2] * a[14] - b[5] * a[15];
    target[11] = b[11] * a[0] + b[8] * a[1] - b[6] * a[2] + b[5] * a[3] + b[15] * a[4] + b[3] * a[5] - b[2] * a[6] - b[14] * a[7] + b[1] * a[8] + b[13] * a[9] - b[12] * a[10] + b[0] * a[11] + b[10] * a[12] - b[9] * a[13] + b[7] * a[14] - b[4] * a[15];
    target[12] = b[12] * a[0] + b[9] * a[1] - b[7] * a[2] + b[15] * a[3] + b[5] * a[4] + b[4] * a[5] - b[14] * a[6] - b[2] * a[7] + b[13] * a[8] + b[1] * a[9] - b[11] * a[10] + b[10] * a[11] + b[0] * a[12] - b[8] * a[13] + b[6] * a[14] - b[3] * a[15];
    target[13] = b[13] * a[0] + b[10] * a[1] - b[15] * a[2] - b[7] * a[3] + b[6] * a[4] + b[14] * a[5] + b[4] * a[6] - b[3] * a[7] - b[12] * a[8] + b[11] * a[9] + b[1] * a[10] - b[9] * a[11] + b[8] * a[12] + b[0] * a[13] - b[5] * a[14] + b[2] * a[15];
    target[14] = b[14] * a[0] + b[15] * a[1] + b[10] * a[2] - b[9] * a[3] + b[8] * a[4] - b[13] * a[5] + b[12] * a[6] - b[11] * a[7] + b[4] * a[8] - b[3] * a[9] + b[2] * a[10] + b[7] * a[11] - b[6] * a[12] + b[5] * a[13] + b[0] * a[14] - b[1] * a[15];
    target[15] = b[15] * a[0] + b[14] * a[1] - b[13] * a[2] + b[12] * a[3] - b[11] * a[4] + b[10] * a[5] - b[9] * a[6] + b[8] * a[7] + b[7] * a[8] - b[6] * a[9] + b[5] * a[10] + b[4] * a[11] - b[3] * a[12] + b[2] * a[13] - b[1] * a[14] + b[0] * a[15];
}

void wedge(in float[16] a, in float[16] b, out float[16] target) {
    target[0] = b[0] * a[0];
    target[1] = b[1] * a[0] + b[0] * a[1];
    target[2] = b[2] * a[0] + b[0] * a[2];
    target[3] = b[3] * a[0] + b[0] * a[3];
    target[4] = b[4] * a[0] + b[0] * a[4];
    target[5] = b[5] * a[0] + b[2] * a[1] - b[1] * a[2] + b[0] * a[5];
    target[6] = b[6] * a[0] + b[3] * a[1] - b[1] * a[3] + b[0] * a[6];
    target[7] = b[7] * a[0] + b[4] * a[1] - b[1] * a[4] + b[0] * a[7];
    target[8] = b[8] * a[0] + b[3] * a[2] - b[2] * a[3] + b[0] * a[8];
    target[9] = b[9] * a[0] + b[4] * a[2] - b[2] * a[4] + b[0] * a[9];
    target[10] = b[10] * a[0] + b[4] * a[3] - b[3] * a[4] + b[0] * a[10];
    target[11] = b[11] * a[0] + b[8] * a[1] - b[6] * a[2] + b[5] * a[3] + b[3] * a[5] - b[2] * a[6] + b[1] * a[8] + b[0] * a[11];
    target[12] = b[12] * a[0] + b[9] * a[1] - b[7] * a[2] + b[5] * a[4] + b[4] * a[5] - b[2] * a[7] + b[1] * a[9] + b[0] * a[12];
    target[13] = b[13] * a[0] + b[10] * a[1] - b[7] * a[3] + b[6] * a[4] + b[4] * a[6] - b[3] * a[7] + b[1] * a[10] + b[0] * a[13];
    target[14] = b[14] * a[0] + b[10] * a[2] - b[9] * a[3] + b[8] * a[4] + b[4] * a[8] - b[3] * a[9] + b[2] * a[10] + b[0] * a[14];
    target[15] = b[15] * a[0] + b[14] * a[1] - b[13] * a[2] + b[12] * a[3] - b[11] * a[4] + b[10] * a[5] - b[9] * a[6] + b[8] * a[7] + b[7] * a[8] - b[6] * a[9] + b[5] * a[10] + b[4] * a[11] - b[3] * a[12] + b[2] * a[13] - b[1] * a[14] + b[0] * a[15];
}

void inner(in float[16] a, in float[16] b, out float[16] target) {
    target[0] = b[0] * a[0] + b[1] * a[1] + b[2] * a[2] + b[3] * a[3] - b[4] * a[4] - b[5] * a[5] - b[6] * a[6] + b[7] * a[7] - b[8] * a[8] + b[9] * a[9] + b[10] * a[10] - b[11] * a[11] + b[12] * a[12] + b[13] * a[13] + b[14] * a[14] - b[15] * a[15];
    target[1] = b[1] * a[0] + b[0] * a[1] - b[5] * a[2] - b[6] * a[3] + b[7] * a[4] + b[2] * a[5] + b[3] * a[6] - b[4] * a[7] - b[11] * a[8] + b[12] * a[9] + b[13] * a[10] - b[8] * a[11] + b[9] * a[12] + b[10] * a[13] - b[15] * a[14] + b[14] * a[15];
    target[2] = b[2] * a[0] + b[5] * a[1] + b[0] * a[2] - b[8] * a[3] + b[9] * a[4] - b[1] * a[5] + b[11] * a[6] - b[12] * a[7] + b[3] * a[8] - b[4] * a[9] + b[14] * a[10] + b[6] * a[11] - b[7] * a[12] + b[15] * a[13] + b[10] * a[14] - b[13] * a[15];
    target[3] = b[3] * a[0] + b[6] * a[1] + b[8] * a[2] + b[0] * a[3] + b[10] * a[4] - b[11] * a[5] - b[1] * a[6] - b[13] * a[7] - b[2] * a[8] - b[14] * a[9] - b[4] * a[10] - b[5] * a[11] - b[15] * a[12] - b[7] * a[13] - b[9] * a[14] + b[12] * a[15];
    target[4] = b[4] * a[0] + b[7] * a[1] + b[9] * a[2] + b[10] * a[3] + b[0] * a[4] - b[12] * a[5] - b[13] * a[6] - b[1] * a[7] - b[14] * a[8] - b[2] * a[9] - b[3] * a[10] - b[15] * a[11] - b[5] * a[12] - b[6] * a[13] - b[8] * a[14] + b[11] * a[15];
    target[5] = b[5] * a[0] + b[11] * a[3] - b[12] * a[4] + b[0] * a[5] + b[15] * a[10] + b[3] * a[11] - b[4] * a[12] + b[10] * a[15];
    target[6] = b[6] * a[0] - b[11] * a[2] - b[13] * a[4] + b[0] * a[6] - b[15] * a[9] - b[2] * a[11] - b[4] * a[13] - b[9] * a[15];
    target[7] = b[7] * a[0] - b[12] * a[2] - b[13] * a[3] + b[0] * a[7] - b[15] * a[8] - b[2] * a[12] - b[3] * a[13] - b[8] * a[15];
    target[8] = b[8] * a[0] + b[11] * a[1] - b[14] * a[4] + b[15] * a[7] + b[0] * a[8] + b[1] * a[11] - b[4] * a[14] + b[7] * a[15];
    target[9] = b[9] * a[0] + b[12] * a[1] - b[14] * a[3] + b[15] * a[6] + b[0] * a[9] + b[1] * a[12] - b[3] * a[14] + b[6] * a[15];
    target[10] = b[10] * a[0] + b[13] * a[1] + b[14] * a[2] - b[15] * a[5] + b[0] * a[10] + b[1] * a[13] + b[2] * a[14] - b[5] * a[15];
    target[11] = b[11] * a[0] + b[15] * a[4] + b[0] * a[11] - b[4] * a[15];
    target[12] = b[12] * a[0] + b[15] * a[3] + b[0] * a[12] - b[3] * a[15];
    target[13] = b[13] * a[0] - b[15] * a[2] + b[0] * a[13] + b[2] * a[15];
    target[14] = b[14] * a[0] + b[15] * a[1] + b[0] * a[14] - b[1] * a[15];
    target[15] = b[15] * a[0] + b[0] * a[15];
}

void zero(out float[16] target) {
    for(int i = 0; i < 16; ++i)
        target[i] = 0.;
}

void exp31(in float[16] a16, out float[16] target) {

    float[6] a;
    for(int i = 0; i < 6; ++i)
        a[i] = a16[i + 5];
        
    // B*B = S + T*e1234
    float S = -a[0] * a[0] - a[1] * a[1] + a[2] * a[2] - a[3] * a[3] + a[4] * a[4] + a[5] * a[5];
    float T = 2. * (a[0] * a[5] - a[1] * a[4] + a[2] * a[3]);
    // ||B*B||
    float norm = sqrt(S * S + T * T);
    {
        // P_+ = xB + y*e1234*B
        float x = 0.5 * (1. + S / norm);
        float y = -0.5 * T / norm;
        float lp = sqrt(0.5 * S + 0.5 * norm);
        float lm = sqrt(-0.5 * S + 0.5 * norm);
        float cp = cosh(lp);
        float sp = lp == 0. ? 1. : sinh(lp) / lp;
        float cm = cos(lm);
        float sm = lm == 0. ? 1. : sin(lm) / lm;
        float cmsp = cm * sp;
        float cpsm = cp * sm;
        float alpha = (cmsp - cpsm) * x + cpsm;
        float beta = (cmsp - cpsm) * y;
        // Combine the two Euler's formulas together.
        target[0] = cp * cm;
        target[5] = (a[0] * alpha + a[5] * beta); target[6] = (a[1] * alpha - a[4] * beta); target[ 7] = (a[2] * alpha - a[3] * beta);
        target[8] = (a[3] * alpha + a[2] * beta); target[9] = (a[4] * alpha + a[1] * beta); target[10] = (a[5] * alpha - a[0] * beta);
        target[15] = sp * sm * T / 2.;
    }
    if(norm == 0.) {
        zero(target);
        for(int i = 0; i < 6; ++i)
            target[i+5] = a[i];
        target[0] = 1.;
    }
}

void translatorFromVec(in vec3 v, out float[16] target) {
    zero(target);
    target[0] = 1.;
    target[6] = .5 * v.x; target[7] = .5 * v.x;
    target[8] = .5 * v.y; target[9] = .5 * v.y;
}

void translatorToVec(in float[16] a, out vec3 target ){
    target.x = a[6] + a[7];
    target.y = a[8] + a[9];
    target *= 1./a[0];
    target.z = 0.;
}

void mulReverse(in float[16] a, in float[16] b, out float[16] target) {
    float[16] bReverse; getReverse( b, bReverse );
    mul(a, bReverse, target);
}

//Usual sign problems
void sandwich(in float[16] a, in float[16] b,out float[16] target) {
    float[16] intermediate; mul(a,b,intermediate);
    mulReverse(intermediate, a, target);
}

void vecToZrc( in vec3 v, out float[16] target ) {
    float[16] _eo; _eo[3] = 1.; _eo[4] = -1.;
    float[16] translator; translatorFromVec(v, translator);
    sandwich(translator, _eo, target);
}

void multiplyScalar(in float[16] a, in float s, out float[16] target) {
    for(int i = 0; i < 16; ++i)
        target[i] = a[i] * s;
}

void circlePosToVec(in float[16] a, out vec3 target) {
    
    float[16] _e120; _e120[11] = 1.; _e120[12] = 1.;
    float[16] _e12; _e12[5] = 1.;

    float[16] centerPp; inner( a, _e120, centerPp );
    float[16] translationToCenter; mulReverse( centerPp, _e12, translationToCenter );
    translationToCenter[0] *= 2.;
    translatorToVec(translationToCenter,target);
}

`