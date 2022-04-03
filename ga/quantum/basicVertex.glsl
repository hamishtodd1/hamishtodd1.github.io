//there was something here and below about opacity but wasn't being used
//"transparent" was there in the material. 

attribute float interp;

uniform vec3 start;
varying float interpV;

uniform float[16] stateMotorLogged;

void mvExp(in float[16] mv, out float[16] target) {
	float S = -mv[5] * mv[5] - mv[6] * mv[6] + mv[7] * mv[7] - mv[8] * mv[8] + mv[9] * mv[9] + mv[10] * mv[10];
	float T = 2. * (mv[5] * mv[10] - mv[6] * mv[9] + mv[7] * mv[8]);
	// ||B*B||
	float norm = sqrt(S * S + T * T);

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
	target[ 0] = norm == 0. ? 1. : cp * cm;
	target[ 1] = 0.; target[ 2] = 0.; target[ 3] = 0.; target[ 4] = 0.;
	target[ 5] = norm == 0. ? 0. : (mv[5] * alpha + mv[10] * beta);
	target[ 6] = norm == 0. ? 0. : (mv[6] * alpha - mv[9] * beta);
	target[ 7] = norm == 0. ? 0. : (mv[7] * alpha - mv[8] * beta);
	target[ 8] = norm == 0. ? 0. : (mv[8] * alpha + mv[7] * beta);
	target[ 9] = norm == 0. ? 0. : (mv[9] * alpha + mv[6] * beta);
	target[10] = norm == 0. ? 0. : (mv[10] * alpha - mv[5] * beta);
	target[11] = 0.; target[12] = 0.; target[13] = 0.; target[14] = 0.;
	target[15] = norm == 0. ? 0. : sp * sm * T / 2.;
}

void gp( in float[16] a, in float[16] b, out float[16] target) {
	target[0]=b[0]*a[0]+b[1]*a[1]+b[2]*a[2]+b[3]*a[3]-b[4]*a[4]-b[5]*a[5]-b[6]*a[6]+b[7]*a[7]-b[8]*a[8]+b[9]*a[9]+b[10]*a[10]-b[11]*a[11]+b[12]*a[12]+b[13]*a[13]+b[14]*a[14]-b[15]*a[15];
	target[1]=b[1]*a[0]+b[0]*a[1]-b[5]*a[2]-b[6]*a[3]+b[7]*a[4]+b[2]*a[5]+b[3]*a[6]-b[4]*a[7]-b[11]*a[8]+b[12]*a[9]+b[13]*a[10]-b[8]*a[11]+b[9]*a[12]+b[10]*a[13]-b[15]*a[14]+b[14]*a[15];
	target[2]=b[2]*a[0]+b[5]*a[1]+b[0]*a[2]-b[8]*a[3]+b[9]*a[4]-b[1]*a[5]+b[11]*a[6]-b[12]*a[7]+b[3]*a[8]-b[4]*a[9]+b[14]*a[10]+b[6]*a[11]-b[7]*a[12]+b[15]*a[13]+b[10]*a[14]-b[13]*a[15];
	target[3]=b[3]*a[0]+b[6]*a[1]+b[8]*a[2]+b[0]*a[3]+b[10]*a[4]-b[11]*a[5]-b[1]*a[6]-b[13]*a[7]-b[2]*a[8]-b[14]*a[9]-b[4]*a[10]-b[5]*a[11]-b[15]*a[12]-b[7]*a[13]-b[9]*a[14]+b[12]*a[15];
	target[4]=b[4]*a[0]+b[7]*a[1]+b[9]*a[2]+b[10]*a[3]+b[0]*a[4]-b[12]*a[5]-b[13]*a[6]-b[1]*a[7]-b[14]*a[8]-b[2]*a[9]-b[3]*a[10]-b[15]*a[11]-b[5]*a[12]-b[6]*a[13]-b[8]*a[14]+b[11]*a[15];
	target[5]=b[5]*a[0]+b[2]*a[1]-b[1]*a[2]+b[11]*a[3]-b[12]*a[4]+b[0]*a[5]-b[8]*a[6]+b[9]*a[7]+b[6]*a[8]-b[7]*a[9]+b[15]*a[10]+b[3]*a[11]-b[4]*a[12]+b[14]*a[13]-b[13]*a[14]+b[10]*a[15];
	target[6]=b[6]*a[0]+b[3]*a[1]-b[11]*a[2]-b[1]*a[3]-b[13]*a[4]+b[8]*a[5]+b[0]*a[6]+b[10]*a[7]-b[5]*a[8]-b[15]*a[9]-b[7]*a[10]-b[2]*a[11]-b[14]*a[12]-b[4]*a[13]+b[12]*a[14]-b[9]*a[15];
	target[7]=b[7]*a[0]+b[4]*a[1]-b[12]*a[2]-b[13]*a[3]-b[1]*a[4]+b[9]*a[5]+b[10]*a[6]+b[0]*a[7]-b[15]*a[8]-b[5]*a[9]-b[6]*a[10]-b[14]*a[11]-b[2]*a[12]-b[3]*a[13]+b[11]*a[14]-b[8]*a[15];
	target[8]=b[8]*a[0]+b[11]*a[1]+b[3]*a[2]-b[2]*a[3]-b[14]*a[4]-b[6]*a[5]+b[5]*a[6]+b[15]*a[7]+b[0]*a[8]+b[10]*a[9]-b[9]*a[10]+b[1]*a[11]+b[13]*a[12]-b[12]*a[13]-b[4]*a[14]+b[7]*a[15];
	target[9]=b[9]*a[0]+b[12]*a[1]+b[4]*a[2]-b[14]*a[3]-b[2]*a[4]-b[7]*a[5]+b[15]*a[6]+b[5]*a[7]+b[10]*a[8]+b[0]*a[9]-b[8]*a[10]+b[13]*a[11]+b[1]*a[12]-b[11]*a[13]-b[3]*a[14]+b[6]*a[15];
	target[10]=b[10]*a[0]+b[13]*a[1]+b[14]*a[2]+b[4]*a[3]-b[3]*a[4]-b[15]*a[5]-b[7]*a[6]+b[6]*a[7]-b[9]*a[8]+b[8]*a[9]+b[0]*a[10]-b[12]*a[11]+b[11]*a[12]+b[1]*a[13]+b[2]*a[14]-b[5]*a[15];
	target[11]=b[11]*a[0]+b[8]*a[1]-b[6]*a[2]+b[5]*a[3]+b[15]*a[4]+b[3]*a[5]-b[2]*a[6]-b[14]*a[7]+b[1]*a[8]+b[13]*a[9]-b[12]*a[10]+b[0]*a[11]+b[10]*a[12]-b[9]*a[13]+b[7]*a[14]-b[4]*a[15];
	target[12]=b[12]*a[0]+b[9]*a[1]-b[7]*a[2]+b[15]*a[3]+b[5]*a[4]+b[4]*a[5]-b[14]*a[6]-b[2]*a[7]+b[13]*a[8]+b[1]*a[9]-b[11]*a[10]+b[10]*a[11]+b[0]*a[12]-b[8]*a[13]+b[6]*a[14]-b[3]*a[15];
	target[13]=b[13]*a[0]+b[10]*a[1]-b[15]*a[2]-b[7]*a[3]+b[6]*a[4]+b[14]*a[5]+b[4]*a[6]-b[3]*a[7]-b[12]*a[8]+b[11]*a[9]+b[1]*a[10]-b[9]*a[11]+b[8]*a[12]+b[0]*a[13]-b[5]*a[14]+b[2]*a[15];
	target[14]=b[14]*a[0]+b[15]*a[1]+b[10]*a[2]-b[9]*a[3]+b[8]*a[4]-b[13]*a[5]+b[12]*a[6]-b[11]*a[7]+b[4]*a[8]-b[3]*a[9]+b[2]*a[10]+b[7]*a[11]-b[6]*a[12]+b[5]*a[13]+b[0]*a[14]-b[1]*a[15];
	target[15]=b[15]*a[0]+b[14]*a[1]-b[13]*a[2]+b[12]*a[3]-b[11]*a[4]+b[10]*a[5]-b[9]*a[6]+b[8]*a[7]+b[7]*a[8]-b[6]*a[9]+b[5]*a[10]+b[4]*a[11]-b[3]*a[12]+b[2]*a[13]-b[1]*a[14]+b[0]*a[15];
}

void vec3ToMv(in vec3 ourVec, out float[16] ourMv) {
	ourMv[14] = ourVec.x;
	ourMv[13] = ourVec.y;
	ourMv[12] = ourVec.z;
	ourMv[11] = 1.;
}
void mvToVec3(in float[16] ourMv, out vec3 ourVec) {
	ourVec.x = ourMv[14] / ourMv[11];
	ourVec.y = ourMv[13] / ourMv[11];
	ourVec.z = ourMv[12] / ourMv[11];
}

void reverse(in float[16] mv, out float[16] target) {
	target[0] = mv[0];
	target[1] = mv[1];
	target[2] = mv[2];
	target[3] = mv[3];
	target[4] = mv[4];
	target[5] = -mv[5];
	target[6] = -mv[6];
	target[7] = -mv[7];
	target[8] = -mv[8];
	target[9] = -mv[9];
	target[10] = -mv[10];
	target[11] = -mv[11];
	target[12] = -mv[12];
	target[13] = -mv[13];
	target[14] = -mv[14];
	target[15] = mv[15];
}

void mvMultiplyScalar(in float[16] mv, in float scalar, out float target[16]) {
	target[ 0] = mv[ 0] * scalar;
	target[ 1] = mv[ 1] * scalar;
	target[ 2] = mv[ 2] * scalar;
	target[ 3] = mv[ 3] * scalar;
	target[ 4] = mv[ 4] * scalar;
	target[ 5] = mv[ 5] * scalar;
	target[ 6] = mv[ 6] * scalar;
	target[ 7] = mv[ 7] * scalar;
	target[ 8] = mv[ 8] * scalar;
	target[ 9] = mv[ 9] * scalar;
	target[10] = mv[10] * scalar;
	target[11] = mv[11] * scalar;
	target[12] = mv[12] * scalar;
	target[13] = mv[13] * scalar;
	target[14] = mv[14] * scalar;
	target[15] = mv[15] * scalar;
}

void main() 
{
	interpV = interp;

	float[16] m;
	float[16] mReverse;

	float[16] bivToBeExponentiated;
	mvMultiplyScalar(stateMotorLogged, interp, bivToBeExponentiated);
	mvExp(bivToBeExponentiated, m);
	reverse(m,mReverse);

	float[16] pt;
	float[16] intermediate;

	vec3ToMv(start, pt);
	gp(m, pt, intermediate);
	gp(intermediate, mReverse, pt);
	vec3 p = vec3(0.,0.,0.);
	mvToVec3(pt, p);

	vec4 modelViewPosition = modelViewMatrix * vec4(p, 1.0);
	gl_Position = projectionMatrix * modelViewPosition;
}