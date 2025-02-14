const UNA_LEN = 6
const BIV_LEN = 15
const TRI_LEN = 20
const QUAD_LEN = 15
const PENT_LEN = 6

let verbose42Glsl = `
#define UNA_LEN 6
#define BIV_LEN 15
#define TRI_LEN 20
#define QUAD_LEN 15
#define PENT_LEN 6
#define BIR_LEN 16

float bivInnerSelfScalar(in float[BIV_LEN] a) {
    return a[10]*a[10]+a[11]*a[11]+a[12]*a[12]+a[13]*a[13]+a[3]*a[3]+a[4]*a[4]+a[7]*a[7]+a[8]*a[8]-a[0]*a[0]-a[14]*a[14]-a[1]*a[1]-a[2]*a[2]-a[5]*a[5]-a[6]*a[6]-a[9]*a[9];
}

float trivInnerSelfScalar(in float[TRI_LEN] a) {
    return a[11]*a[11]+a[12]*a[12]+a[13]*a[13]+a[14]*a[14]+a[16]*a[16]+a[17]*a[17]+a[2]*a[2]+a[3]*a[3]+a[5]*a[5]+a[6]*a[6]+a[7]*a[7]+a[8]*a[8]-a[0]*a[0]-a[10]*a[10]-a[15]*a[15]-a[18]*a[18]-a[19]*a[19]-a[1]*a[1]-a[4]*a[4]-a[9]*a[9];
}
float triInnerTri(in float[TRI_LEN] a, in float[TRI_LEN] b) {
    return a[11]*b[11]+a[12]*b[12]+a[13]*b[13]+a[14]*b[14]+a[16]*b[16]+a[17]*b[17]+a[2]*b[2]+a[3]*b[3]+a[5]*b[5]+a[6]*b[6]+a[7]*b[7]+a[8]*b[8]-a[0]*b[0]-a[10]*b[10]-a[15]*b[15]-a[18]*b[18]-a[19]*b[19]-a[1]*b[1]-a[4]*b[4]-a[9]*b[9];
}

void triInnerQuad( in float[TRI_LEN] a, in float[QUAD_LEN] b, out float[UNA_LEN] target ) {
    target[0] = a[10] * b[0] + a[15] * b[5] + a[18] * b[8] + a[19] * b[9] - a[11] * b[1] - a[12] * b[2] - a[13] * b[3] - a[14] * b[4] - a[16] * b[6] - a[17] * b[7];
    target[1] = a[18] * b[12] + a[19] * b[13] + a[5] * b[1] + a[6] * b[2] + a[7] * b[3] + a[8] * b[4] - a[16] * b[10] - a[17] * b[11] - a[4] * b[0] - a[9] * b[5];
    target[2] = a[13] * b[10] + a[14] * b[11] + a[19] * b[14] + a[1] * b[0] + a[7] * b[6] + a[8] * b[7] - a[15] * b[12] - a[2] * b[1] - a[3] * b[2] - a[9] * b[8];
    target[3] = -a[0] * b[0] - a[11] * b[10] - a[12] * b[11] - a[15] * b[13] - a[18] * b[14] - a[2] * b[3] - a[3] * b[4] - a[5] * b[6] - a[6] * b[7] - a[9] * b[9];
    target[4] = -a[0] * b[1] - a[10] * b[10] - a[12] * b[12] - a[14] * b[13] - a[17] * b[14] - a[1] * b[3] - a[3] * b[5] - a[4] * b[6] - a[6] * b[8] - a[8] * b[9];
    target[5] = a[11] * b[12] + a[13] * b[13] + a[16] * b[14] + a[2] * b[5] + a[5] * b[8] + a[7] * b[9] - a[0] * b[2] - a[10] * b[11] - a[1] * b[4] - a[4] * b[7];
}

void unaInnerTri( in float[UNA_LEN] a, in float[TRI_LEN] b, out float[BIV_LEN] target ) {
    target[ 0] = a[ 2] * b[ 0] + a[ 3] * b[ 1] - a[ 4] * b[ 2] - a[ 5] * b[ 3];
    target[ 1] = a[ 3] * b[ 4] - a[ 1] * b[ 0] - a[ 4] * b[ 5] - a[ 5] * b[ 6];
    target[ 2] = -a[ 1] * b[ 1] - a[ 2] * b[ 4] - a[ 4] * b[ 7] - a[ 5] * b[ 8];
    target[ 3] = -a[ 1] * b[ 2] - a[ 2] * b[ 5] - a[ 3] * b[ 7] - a[ 5] * b[ 9];
    target[ 4] = a[ 4] * b[ 9] - a[ 1] * b[ 3] - a[ 2] * b[ 6] - a[ 3] * b[ 8];
    target[ 5] = a[ 0] * b[ 0] + a[ 3] * b[10] - a[ 4] * b[11] - a[ 5] * b[12];
    target[ 6] = a[ 0] * b[ 1] - a[ 2] * b[10] - a[ 4] * b[13] - a[ 5] * b[14];
    target[ 7] = a[ 0] * b[ 2] - a[ 2] * b[11] - a[ 3] * b[13] - a[ 5] * b[15];
    target[ 8] = a[ 0] * b[ 3] + a[ 4] * b[15] - a[ 2] * b[12] - a[ 3] * b[14];
    target[ 9] = a[ 0] * b[ 4] + a[ 1] * b[10] - a[ 4] * b[16] - a[ 5] * b[17];
    target[10] = a[ 0] * b[ 5] + a[ 1] * b[11] - a[ 3] * b[16] - a[ 5] * b[18];
    target[11] = a[ 0] * b[ 6] + a[ 1] * b[12] + a[ 4] * b[18] - a[ 3] * b[17];
    target[12] = a[ 0] * b[ 7] + a[ 1] * b[13] + a[ 2] * b[16] - a[ 5] * b[19];
    target[13] = a[ 0] * b[ 8] + a[ 1] * b[14] + a[ 2] * b[17] + a[ 4] * b[19];
    target[14] = a[ 0] * b[ 9] + a[ 1] * b[15] + a[ 2] * b[18] + a[ 3] * b[19];
}

void bivMeetUna( in float[BIV_LEN] a, in float[UNA_LEN] b, out float[TRI_LEN] target ) {
    target[0]=a[0]*b[2]+a[5]*b[0]-a[1]*b[1];
    target[1]=a[0]*b[3]+a[6]*b[0]-a[2]*b[1];
    target[2]=a[0]*b[4]+a[7]*b[0]-a[3]*b[1];
    target[3]=a[0]*b[5]+a[8]*b[0]-a[4]*b[1];
    target[4]=a[1]*b[3]+a[9]*b[0]-a[2]*b[2];
    target[5]=a[10]*b[0]+a[1]*b[4]-a[3]*b[2];
    target[6]=a[11]*b[0]+a[1]*b[5]-a[4]*b[2];
    target[7]=a[12]*b[0]+a[2]*b[4]-a[3]*b[3];
    target[8]=a[13]*b[0]+a[2]*b[5]-a[4]*b[3];
    target[9]=a[14]*b[0]+a[3]*b[5]-a[4]*b[4];
    target[10]=a[5]*b[3]+a[9]*b[1]-a[6]*b[2];
    target[11]=a[10]*b[1]+a[5]*b[4]-a[7]*b[2];
    target[12]=a[11]*b[1]+a[5]*b[5]-a[8]*b[2];
    target[13]=a[12]*b[1]+a[6]*b[4]-a[7]*b[3];
    target[14]=a[13]*b[1]+a[6]*b[5]-a[8]*b[3];
    target[15]=a[14]*b[1]+a[7]*b[5]-a[8]*b[4];
    target[16]=a[12]*b[2]+a[9]*b[4]-a[10]*b[3];
    target[17]=a[13]*b[2]+a[9]*b[5]-a[11]*b[3];
    target[18]=a[10]*b[5]+a[14]*b[2]-a[11]*b[4];
    target[19]=a[12]*b[5]+a[14]*b[3]-a[13]*b[4];
}

void unaMeetUna( in float[UNA_LEN] a, in float[UNA_LEN] b, out float[BIV_LEN] target ) {
    target[0]=a[0]*b[1]-a[1]*b[0];
    target[1]=a[0]*b[2]-a[2]*b[0];
    target[2]=a[0]*b[3]-a[3]*b[0];
    target[3]=a[0]*b[4]-a[4]*b[0];
    target[4]=a[0]*b[5]-a[5]*b[0];
    target[5]=a[1]*b[2]-a[2]*b[1];
    target[6]=a[1]*b[3]-a[3]*b[1];
    target[7]=a[1]*b[4]-a[4]*b[1];
    target[8]=a[1]*b[5]-a[5]*b[1];
    target[9]=a[2]*b[3]-a[3]*b[2];
    target[10]=a[2]*b[4]-a[4]*b[2];
    target[11]=a[2]*b[5]-a[5]*b[2];
    target[12]=a[3]*b[4]-a[4]*b[3];
    target[13]=a[3]*b[5]-a[5]*b[3];
    target[14]=a[4]*b[5]-a[5]*b[4];
}

void unaInnerQuad( in float[UNA_LEN] a, in float[QUAD_LEN] b, out float[TRI_LEN] target ) {
    target[0]=a[4]*b[1]+a[5]*b[2]-a[3]*b[0];
    target[1]=a[2]*b[0]+a[4]*b[3]+a[5]*b[4];
    target[2]=a[2]*b[1]+a[3]*b[3]+a[5]*b[5];
    target[3]=a[2]*b[2]+a[3]*b[4]-a[4]*b[5];
    target[4]=a[4]*b[6]+a[5]*b[7]-a[1]*b[0];
    target[5]=a[3]*b[6]+a[5]*b[8]-a[1]*b[1];
    target[6]=a[3]*b[7]-a[1]*b[2]-a[4]*b[8];
    target[7]=a[5]*b[9]-a[1]*b[3]-a[2]*b[6];
    target[8]=-a[1]*b[4]-a[2]*b[7]-a[4]*b[9];
    target[9]=-a[1]*b[5]-a[2]*b[8]-a[3]*b[9];
    target[10]=a[0]*b[0]+a[4]*b[10]+a[5]*b[11];
    target[11]=a[0]*b[1]+a[3]*b[10]+a[5]*b[12];
    target[12]=a[0]*b[2]+a[3]*b[11]-a[4]*b[12];
    target[13]=a[0]*b[3]+a[5]*b[13]-a[2]*b[10];
    target[14]=a[0]*b[4]-a[2]*b[11]-a[4]*b[13];
    target[15]=a[0]*b[5]-a[2]*b[12]-a[3]*b[13];
    target[16]=a[0]*b[6]+a[1]*b[10]+a[5]*b[14];
    target[17]=a[0]*b[7]+a[1]*b[11]-a[4]*b[14];
    target[18]=a[0]*b[8]+a[1]*b[12]-a[3]*b[14];
    target[19]=a[0]*b[9]+a[1]*b[13]+a[2]*b[14];
}

void triInnerPent( in float[20] a, in float[6] b, out float[BIV_LEN] target ) {
    target[ 0] =  a[16] * b[ 0] + a[17] * b[ 1] - a[18] * b[ 2] - a[19] * b[ 3];
    target[ 1] =  a[15] * b[ 2] - a[13] * b[ 0] - a[14] * b[ 1] - a[19] * b[ 4];
    target[ 2] =  a[11] * b[ 0] + a[12] * b[ 1] + a[15] * b[ 3] + a[18] * b[ 4];
    target[ 3] =  a[10] * b[ 0] + a[12] * b[ 2] + a[14] * b[ 3] + a[17] * b[ 4];
    target[ 4] =  a[10] * b[ 1] - a[11] * b[ 2] - a[13] * b[ 3] - a[16] * b[ 4];
    target[ 5] =  a[ 7] * b[ 0] + a[ 8] * b[ 1] - a[19] * b[ 5] - a[ 9] * b[ 2];
    target[ 6] =  a[18] * b[ 5] - a[ 5] * b[ 0] - a[ 6] * b[ 1] - a[ 9] * b[ 3];
    target[ 7] =  a[17] * b[ 5] - a[ 4] * b[ 0] - a[ 6] * b[ 2] - a[ 8] * b[ 3];
    target[ 8] =  a[ 5] * b[ 2] + a[ 7] * b[ 3] - a[16] * b[ 5] - a[ 4] * b[ 1];
    target[ 9] =  a[ 2] * b[ 0] + a[ 3] * b[ 1] - a[15] * b[ 5] - a[ 9] * b[ 4];
    target[10] =  a[ 1] * b[ 0] + a[ 3] * b[ 2] - a[14] * b[ 5] - a[ 8] * b[ 4];
    target[11] =  a[13] * b[ 5] + a[ 1] * b[ 1] + a[ 7] * b[ 4] - a[ 2] * b[ 2];
    target[12] =  a[12] * b[ 5] + a[ 3] * b[ 3] + a[ 6] * b[ 4] - a[ 0] * b[ 0];
    target[13] = -a[ 0] * b[ 1] - a[11] * b[ 5] - a[ 2] * b[ 3] - a[ 5] * b[ 4];
    target[14] = -a[ 0] * b[ 2] - a[10] * b[ 5] - a[ 1] * b[ 3] - a[ 4] * b[ 4];
}

void unaMeetBiv(in float[6] a, in float[BIV_LEN] b, out float[20] target) {
    target[ 0] = a[ 0] * b[ 5] + a[ 2] * b[ 0] - a[ 1] * b[ 1];
    target[ 1] = a[ 0] * b[ 6] + a[ 3] * b[ 0] - a[ 1] * b[ 2];
    target[ 2] = a[ 0] * b[ 7] + a[ 4] * b[ 0] - a[ 1] * b[ 3];
    target[ 3] = a[ 0] * b[ 8] + a[ 5] * b[ 0] - a[ 1] * b[ 4];
    target[ 4] = a[ 0] * b[ 9] + a[ 3] * b[ 1] - a[ 2] * b[ 2];
    target[ 5] = a[ 0] * b[10] + a[ 4] * b[ 1] - a[ 2] * b[ 3];
    target[ 6] = a[ 0] * b[11] + a[ 5] * b[ 1] - a[ 2] * b[ 4];
    target[ 7] = a[ 0] * b[12] + a[ 4] * b[ 2] - a[ 3] * b[ 3];
    target[ 8] = a[ 0] * b[13] + a[ 5] * b[ 2] - a[ 3] * b[ 4];
    target[ 9] = a[ 0] * b[14] + a[ 5] * b[ 3] - a[ 4] * b[ 4];
    target[10] = a[ 1] * b[ 9] + a[ 3] * b[ 5] - a[ 2] * b[ 6];
    target[11] = a[ 1] * b[10] + a[ 4] * b[ 5] - a[ 2] * b[ 7];
    target[12] = a[ 1] * b[11] + a[ 5] * b[ 5] - a[ 2] * b[ 8];
    target[13] = a[ 1] * b[12] + a[ 4] * b[ 6] - a[ 3] * b[ 7];
    target[14] = a[ 1] * b[13] + a[ 5] * b[ 6] - a[ 3] * b[ 8];
    target[15] = a[ 1] * b[14] + a[ 5] * b[ 7] - a[ 4] * b[ 8];
    target[16] = a[ 2] * b[12] + a[ 4] * b[ 9] - a[ 3] * b[10];
    target[17] = a[ 2] * b[13] + a[ 5] * b[ 9] - a[ 3] * b[11];
    target[18] = a[ 2] * b[14] + a[ 5] * b[10] - a[ 4] * b[11];
    target[19] = a[ 3] * b[14] + a[ 5] * b[12] - a[ 4] * b[13];
}

void bivInnerUna( in float[BIV_LEN] biv, in float[6] b, out float[6] target ) {
    target[0] = biv[0] * b[1] + biv[1] * b[2] + biv[2] * b[3] - biv[3] * b[4] - biv[4] * b[5];
    target[1] = biv[5] * b[2] + biv[6] * b[3] - biv[0] * b[0] - biv[7] * b[4] - biv[8] * b[5];
    target[2] = biv[9] * b[3] - biv[10] * b[4] - biv[11] * b[5] - biv[1] * b[0] - biv[5] * b[1];
    target[3] = -biv[12] * b[4] - biv[13] * b[5] - biv[2] * b[0] - biv[6] * b[1] - biv[9] * b[2];
    target[4] = -biv[10] * b[2] - biv[12] * b[3] - biv[14] * b[5] - biv[3] * b[0] - biv[7] * b[1];
    target[5] = biv[14] * b[4] - biv[11] * b[2] - biv[13] * b[3] - biv[4] * b[0] - biv[8] * b[1];
}

void bivInnerE0( in float[BIV_LEN] biv, out float[6] target) {
    //only b[ 3] and b[ 4] are nonzero, and they are both 1
    target[ 0] =  biv[ 2] - biv[ 3];
    target[ 1] =  biv[ 6] - biv[ 7];
    target[ 2] =  biv[ 9] - biv[10];
    target[ 3] = -biv[12];
    target[ 4] = -biv[12];
    target[ 5] =  biv[14] - biv[13];
}

void unaMeetE0(in float[6] una, out float[BIV_LEN] target) {
    target[ 0] = 0.;
    target[ 1] = 0.;
    target[ 2] = una[0];
    target[ 3] = una[0];
    target[ 4] = 0.;
    target[ 5] = 0.;
    target[ 6] = una[1];
    target[ 7] = una[1];
    target[ 8] = 0.;
    target[ 9] = una[2];
    target[10] = una[2];
    target[11] = 0.;
    target[12] = una[3] - una[4];
    target[13] = -una[5];
    target[14] = -una[5];
}

void bireflectionSandwichUna(in float[BIR_LEN] a, in float[UNA_LEN] b, out float[UNA_LEN] target) {

    float trireflection[26];

    trireflection[0] = a[0] * b[0] + a[1] * b[1] + a[2] * b[2] + a[3] * b[3] - a[4] * b[4] - a[5] * b[5];
    trireflection[1] = a[0] * b[1] + a[6] * b[2] + a[7] * b[3] - a[1] * b[0] - a[8] * b[4] - a[9] * b[5];
    trireflection[2] = a[0] * b[2] + a[10] * b[3] - a[11] * b[4] - a[12] * b[5] - a[2] * b[0] - a[6] * b[1];
    trireflection[3] = a[0] * b[3] - a[10] * b[2] - a[13] * b[4] - a[14] * b[5] - a[3] * b[0] - a[7] * b[1];
    trireflection[4] = a[0] * b[4] - a[11] * b[2] - a[13] * b[3] - a[15] * b[5] - a[4] * b[0] - a[8] * b[1];
    trireflection[5] = a[0] * b[5] + a[15] * b[4] - a[12] * b[2] - a[14] * b[3] - a[5] * b[0] - a[9] * b[1];
    trireflection[6] = a[1] * b[2] + a[6] * b[0] - a[2] * b[1];
    trireflection[7] = a[1] * b[3] + a[7] * b[0] - a[3] * b[1];
    trireflection[8] = a[1] * b[4] + a[8] * b[0] - a[4] * b[1];
    trireflection[9] = a[1] * b[5] + a[9] * b[0] - a[5] * b[1];
    trireflection[10] = a[10] * b[0] + a[2] * b[3] - a[3] * b[2];
    trireflection[11] = a[11] * b[0] + a[2] * b[4] - a[4] * b[2];
    trireflection[12] = a[12] * b[0] + a[2] * b[5] - a[5] * b[2];
    trireflection[13] = a[13] * b[0] + a[3] * b[4] - a[4] * b[3];
    trireflection[14] = a[14] * b[0] + a[3] * b[5] - a[5] * b[3];
    trireflection[15] = a[15] * b[0] + a[4] * b[5] - a[5] * b[4];
    trireflection[16] = a[10] * b[1] + a[6] * b[3] - a[7] * b[2];
    trireflection[17] = a[11] * b[1] + a[6] * b[4] - a[8] * b[2];
    trireflection[18] = a[12] * b[1] + a[6] * b[5] - a[9] * b[2];
    trireflection[19] = a[13] * b[1] + a[7] * b[4] - a[8] * b[3];
    trireflection[20] = a[14] * b[1] + a[7] * b[5] - a[9] * b[3];
    trireflection[21] = a[15] * b[1] + a[8] * b[5] - a[9] * b[4];
    trireflection[22] = a[10] * b[4] + a[13] * b[2] - a[11] * b[3];
    trireflection[23] = a[10] * b[5] + a[14] * b[2] - a[12] * b[3];
    trireflection[24] = a[11] * b[5] + a[15] * b[2] - a[12] * b[4];
    trireflection[25] = a[13] * b[5] + a[15] * b[3] - a[14] * b[4];

    float[BIR_LEN] thisReverseForBsu;
    thisReverseForBsu[0] = a[0];
    thisReverseForBsu[1] = -a[1];
    thisReverseForBsu[2] = -a[2];
    thisReverseForBsu[3] = -a[3];
    thisReverseForBsu[4] = -a[4];
    thisReverseForBsu[5] = -a[5];
    thisReverseForBsu[6] = -a[6];
    thisReverseForBsu[7] = -a[7];
    thisReverseForBsu[8] = -a[8];
    thisReverseForBsu[9] = -a[9];
    thisReverseForBsu[10] = -a[10];
    thisReverseForBsu[11] = -a[11];
    thisReverseForBsu[12] = -a[12];
    thisReverseForBsu[13] = -a[13];
    thisReverseForBsu[14] = -a[14];
    thisReverseForBsu[15] = -a[15];

    target[0] = trireflection[0] * thisReverseForBsu[0] + trireflection[11] * thisReverseForBsu[11] + trireflection[12] * thisReverseForBsu[12] + trireflection[13] * thisReverseForBsu[13] + trireflection[14] * thisReverseForBsu[14] + trireflection[4] * thisReverseForBsu[4] + trireflection[5] * thisReverseForBsu[5] + trireflection[8] * thisReverseForBsu[8] + trireflection[9] * thisReverseForBsu[9] - trireflection[10] * thisReverseForBsu[10] - trireflection[15] * thisReverseForBsu[15] - trireflection[1] * thisReverseForBsu[1] - trireflection[2] * thisReverseForBsu[2] - trireflection[3] * thisReverseForBsu[3] - trireflection[6] * thisReverseForBsu[6] - trireflection[7] * thisReverseForBsu[7];
    target[1] = trireflection[0] * thisReverseForBsu[1] + trireflection[17] * thisReverseForBsu[11] + trireflection[18] * thisReverseForBsu[12] + trireflection[19] * thisReverseForBsu[13] + trireflection[1] * thisReverseForBsu[0] + trireflection[20] * thisReverseForBsu[14] + trireflection[4] * thisReverseForBsu[8] + trireflection[5] * thisReverseForBsu[9] + trireflection[6] * thisReverseForBsu[2] + trireflection[7] * thisReverseForBsu[3] - trireflection[16] * thisReverseForBsu[10] - trireflection[21] * thisReverseForBsu[15] - trireflection[2] * thisReverseForBsu[6] - trireflection[3] * thisReverseForBsu[7] - trireflection[8] * thisReverseForBsu[4] - trireflection[9] * thisReverseForBsu[5];
    target[2] = trireflection[0] * thisReverseForBsu[2] + trireflection[10] * thisReverseForBsu[3] + trireflection[16] * thisReverseForBsu[7] + trireflection[1] * thisReverseForBsu[6] + trireflection[22] * thisReverseForBsu[13] + trireflection[23] * thisReverseForBsu[14] + trireflection[2] * thisReverseForBsu[0] + trireflection[4] * thisReverseForBsu[11] + trireflection[5] * thisReverseForBsu[12] - trireflection[11] * thisReverseForBsu[4] - trireflection[12] * thisReverseForBsu[5] - trireflection[17] * thisReverseForBsu[8] - trireflection[18] * thisReverseForBsu[9] - trireflection[24] * thisReverseForBsu[15] - trireflection[3] * thisReverseForBsu[10] - trireflection[6] * thisReverseForBsu[1];
    target[3] = trireflection[0] * thisReverseForBsu[3] + trireflection[1] * thisReverseForBsu[7] + trireflection[2] * thisReverseForBsu[10] + trireflection[3] * thisReverseForBsu[0] + trireflection[4] * thisReverseForBsu[13] + trireflection[5] * thisReverseForBsu[14] - trireflection[10] * thisReverseForBsu[2] - trireflection[13] * thisReverseForBsu[4] - trireflection[14] * thisReverseForBsu[5] - trireflection[16] * thisReverseForBsu[6] - trireflection[19] * thisReverseForBsu[8] - trireflection[20] * thisReverseForBsu[9] - trireflection[22] * thisReverseForBsu[11] - trireflection[23] * thisReverseForBsu[12] - trireflection[25] * thisReverseForBsu[15] - trireflection[7] * thisReverseForBsu[1];
    target[4] = trireflection[0] * thisReverseForBsu[4] + trireflection[1] * thisReverseForBsu[8] + trireflection[2] * thisReverseForBsu[11] + trireflection[3] * thisReverseForBsu[13] + trireflection[4] * thisReverseForBsu[0] + trireflection[5] * thisReverseForBsu[15] - trireflection[11] * thisReverseForBsu[2] - trireflection[13] * thisReverseForBsu[3] - trireflection[15] * thisReverseForBsu[5] - trireflection[17] * thisReverseForBsu[6] - trireflection[19] * thisReverseForBsu[7] - trireflection[21] * thisReverseForBsu[9] - trireflection[22] * thisReverseForBsu[10] - trireflection[24] * thisReverseForBsu[12] - trireflection[25] * thisReverseForBsu[14] - trireflection[8] * thisReverseForBsu[1];
    target[5] = trireflection[0] * thisReverseForBsu[5] + trireflection[15] * thisReverseForBsu[4] + trireflection[1] * thisReverseForBsu[9] + trireflection[21] * thisReverseForBsu[8] + trireflection[24] * thisReverseForBsu[11] + trireflection[25] * thisReverseForBsu[13] + trireflection[2] * thisReverseForBsu[12] + trireflection[3] * thisReverseForBsu[14] + trireflection[5] * thisReverseForBsu[0] - trireflection[12] * thisReverseForBsu[2] - trireflection[14] * thisReverseForBsu[3] - trireflection[18] * thisReverseForBsu[6] - trireflection[20] * thisReverseForBsu[7] - trireflection[23] * thisReverseForBsu[10] - trireflection[4] * thisReverseForBsu[15] - trireflection[9] * thisReverseForBsu[1];
}
`

class Bireflection extends GeneralVector {
    constructor() {
        super(16)
    }

    sandwich(b, target) {
        if(b.constructor === Unavec && target.constructor === Unavec) {

            trireflection[0] = this[0] * b[0] + this[1] * b[1] + this[2] * b[2] + this[3] * b[3] - this[4] * b[4] - this[5] * b[5];
            trireflection[1] = this[0] * b[1] + this[6] * b[2] + this[7] * b[3] - this[1] * b[0] - this[8] * b[4] - this[9] * b[5];
            trireflection[2] = this[0] * b[2] + this[10] * b[3] - this[11] * b[4] - this[12] * b[5] - this[2] * b[0] - this[6] * b[1];
            trireflection[3] = this[0] * b[3] - this[10] * b[2] - this[13] * b[4] - this[14] * b[5] - this[3] * b[0] - this[7] * b[1];
            trireflection[4] = this[0] * b[4] - this[11] * b[2] - this[13] * b[3] - this[15] * b[5] - this[4] * b[0] - this[8] * b[1];
            trireflection[5] = this[0] * b[5] + this[15] * b[4] - this[12] * b[2] - this[14] * b[3] - this[5] * b[0] - this[9] * b[1];
            trireflection[6] = this[1] * b[2] + this[6] * b[0] - this[2] * b[1];
            trireflection[7] = this[1] * b[3] + this[7] * b[0] - this[3] * b[1];
            trireflection[8] = this[1] * b[4] + this[8] * b[0] - this[4] * b[1];
            trireflection[9] = this[1] * b[5] + this[9] * b[0] - this[5] * b[1];
            trireflection[10] = this[10] * b[0] + this[2] * b[3] - this[3] * b[2];
            trireflection[11] = this[11] * b[0] + this[2] * b[4] - this[4] * b[2];
            trireflection[12] = this[12] * b[0] + this[2] * b[5] - this[5] * b[2];
            trireflection[13] = this[13] * b[0] + this[3] * b[4] - this[4] * b[3];
            trireflection[14] = this[14] * b[0] + this[3] * b[5] - this[5] * b[3];
            trireflection[15] = this[15] * b[0] + this[4] * b[5] - this[5] * b[4];
            trireflection[16] = this[10] * b[1] + this[6] * b[3] - this[7] * b[2];
            trireflection[17] = this[11] * b[1] + this[6] * b[4] - this[8] * b[2];
            trireflection[18] = this[12] * b[1] + this[6] * b[5] - this[9] * b[2];
            trireflection[19] = this[13] * b[1] + this[7] * b[4] - this[8] * b[3];
            trireflection[20] = this[14] * b[1] + this[7] * b[5] - this[9] * b[3];
            trireflection[21] = this[15] * b[1] + this[8] * b[5] - this[9] * b[4];
            trireflection[22] = this[10] * b[4] + this[13] * b[2] - this[11] * b[3];
            trireflection[23] = this[10] * b[5] + this[14] * b[2] - this[12] * b[3];
            trireflection[24] = this[11] * b[5] + this[15] * b[2] - this[12] * b[4];
            trireflection[25] = this[13] * b[5] + this[15] * b[3] - this[14] * b[4];

            thisReverseForBsu[0] = this[0];
            thisReverseForBsu[1] = -this[1];
            thisReverseForBsu[2] = -this[2];
            thisReverseForBsu[3] = -this[3];
            thisReverseForBsu[4] = -this[4];
            thisReverseForBsu[5] = -this[5];
            thisReverseForBsu[6] = -this[6];
            thisReverseForBsu[7] = -this[7];
            thisReverseForBsu[8] = -this[8];
            thisReverseForBsu[9] = -this[9];
            thisReverseForBsu[10] = -this[10];
            thisReverseForBsu[11] = -this[11];
            thisReverseForBsu[12] = -this[12];
            thisReverseForBsu[13] = -this[13];
            thisReverseForBsu[14] = -this[14];
            thisReverseForBsu[15] = -this[15];

            target[0] = trireflection[0] * thisReverseForBsu[0] + trireflection[11] * thisReverseForBsu[11] + trireflection[12] * thisReverseForBsu[12] + trireflection[13] * thisReverseForBsu[13] + trireflection[14] * thisReverseForBsu[14] + trireflection[4] * thisReverseForBsu[4] + trireflection[5] * thisReverseForBsu[5] + trireflection[8] * thisReverseForBsu[8] + trireflection[9] * thisReverseForBsu[9] - trireflection[10] * thisReverseForBsu[10] - trireflection[15] * thisReverseForBsu[15] - trireflection[1] * thisReverseForBsu[1] - trireflection[2] * thisReverseForBsu[2] - trireflection[3] * thisReverseForBsu[3] - trireflection[6] * thisReverseForBsu[6] - trireflection[7] * thisReverseForBsu[7];
            target[1] = trireflection[0] * thisReverseForBsu[1] + trireflection[17] * thisReverseForBsu[11] + trireflection[18] * thisReverseForBsu[12] + trireflection[19] * thisReverseForBsu[13] + trireflection[1] * thisReverseForBsu[0] + trireflection[20] * thisReverseForBsu[14] + trireflection[4] * thisReverseForBsu[8] + trireflection[5] * thisReverseForBsu[9] + trireflection[6] * thisReverseForBsu[2] + trireflection[7] * thisReverseForBsu[3] - trireflection[16] * thisReverseForBsu[10] - trireflection[21] * thisReverseForBsu[15] - trireflection[2] * thisReverseForBsu[6] - trireflection[3] * thisReverseForBsu[7] - trireflection[8] * thisReverseForBsu[4] - trireflection[9] * thisReverseForBsu[5];
            target[2] = trireflection[0] * thisReverseForBsu[2] + trireflection[10] * thisReverseForBsu[3] + trireflection[16] * thisReverseForBsu[7] + trireflection[1] * thisReverseForBsu[6] + trireflection[22] * thisReverseForBsu[13] + trireflection[23] * thisReverseForBsu[14] + trireflection[2] * thisReverseForBsu[0] + trireflection[4] * thisReverseForBsu[11] + trireflection[5] * thisReverseForBsu[12] - trireflection[11] * thisReverseForBsu[4] - trireflection[12] * thisReverseForBsu[5] - trireflection[17] * thisReverseForBsu[8] - trireflection[18] * thisReverseForBsu[9] - trireflection[24] * thisReverseForBsu[15] - trireflection[3] * thisReverseForBsu[10] - trireflection[6] * thisReverseForBsu[1];
            target[3] = trireflection[0] * thisReverseForBsu[3] + trireflection[1] * thisReverseForBsu[7] + trireflection[2] * thisReverseForBsu[10] + trireflection[3] * thisReverseForBsu[0] + trireflection[4] * thisReverseForBsu[13] + trireflection[5] * thisReverseForBsu[14] - trireflection[10] * thisReverseForBsu[2] - trireflection[13] * thisReverseForBsu[4] - trireflection[14] * thisReverseForBsu[5] - trireflection[16] * thisReverseForBsu[6] - trireflection[19] * thisReverseForBsu[8] - trireflection[20] * thisReverseForBsu[9] - trireflection[22] * thisReverseForBsu[11] - trireflection[23] * thisReverseForBsu[12] - trireflection[25] * thisReverseForBsu[15] - trireflection[7] * thisReverseForBsu[1];
            target[4] = trireflection[0] * thisReverseForBsu[4] + trireflection[1] * thisReverseForBsu[8] + trireflection[2] * thisReverseForBsu[11] + trireflection[3] * thisReverseForBsu[13] + trireflection[4] * thisReverseForBsu[0] + trireflection[5] * thisReverseForBsu[15] - trireflection[11] * thisReverseForBsu[2] - trireflection[13] * thisReverseForBsu[3] - trireflection[15] * thisReverseForBsu[5] - trireflection[17] * thisReverseForBsu[6] - trireflection[19] * thisReverseForBsu[7] - trireflection[21] * thisReverseForBsu[9] - trireflection[22] * thisReverseForBsu[10] - trireflection[24] * thisReverseForBsu[12] - trireflection[25] * thisReverseForBsu[14] - trireflection[8] * thisReverseForBsu[1];
            target[5] = trireflection[0] * thisReverseForBsu[5] + trireflection[15] * thisReverseForBsu[4] + trireflection[1] * thisReverseForBsu[9] + trireflection[21] * thisReverseForBsu[8] + trireflection[24] * thisReverseForBsu[11] + trireflection[25] * thisReverseForBsu[13] + trireflection[2] * thisReverseForBsu[12] + trireflection[3] * thisReverseForBsu[14] + trireflection[5] * thisReverseForBsu[0] - trireflection[12] * thisReverseForBsu[2] - trireflection[14] * thisReverseForBsu[3] - trireflection[18] * thisReverseForBsu[6] - trireflection[20] * thisReverseForBsu[7] - trireflection[23] * thisReverseForBsu[10] - trireflection[4] * thisReverseForBsu[15] - trireflection[9] * thisReverseForBsu[1];
            
        }
        else
            console.error("not implemented")

        return target
    }
}
Bireflection.indexGrades = [
    0, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2,
]
let trireflection = new Float32Array(32)
let thisReverseForBsu = new Bireflection()


//1D CGA bivector! And other things
class Unavec extends GeneralVector {

    constructor() {
        super(6)
    }

    e0Multiple() {
        return this[3] !== 0. && this[3] === this[4] && this[0] === 0. && this[1] === 0. && this[2] === 0. && this[5] === 0.
    }

    meetE0(target) {
        target[ 0] = 0.
        target[ 1] = 0.
        target[ 2] = this[0]
        target[ 3] = this[0]
        target[ 4] = 0.
        target[ 5] = 0.
        target[ 6] = this[1]
        target[ 7] = this[1]
        target[ 8] = 0.
        target[ 9] = this[2]
        target[10] = this[2]
        target[11] = 0.
        target[12] = this[3] - this[4]
        target[13] = -this[5]
        target[14] = -this[5]
        return target
    }

    meet(b, target) {
        if (b.constructor === Unavec && target.constructor === Bivec) {
            target[ 0] = this[ 0] * b[ 1] - this[ 1] * b[ 0];
            target[ 1] = this[ 0] * b[ 2] - this[ 2] * b[ 0];
            target[ 2] = this[ 0] * b[ 3] - this[ 3] * b[ 0];
            target[ 3] = this[ 0] * b[ 4] - this[ 4] * b[ 0];
            target[ 4] = this[ 0] * b[ 5] - this[ 5] * b[ 0];
            target[ 5] = this[ 1] * b[ 2] - this[ 2] * b[ 1];
            target[ 6] = this[ 1] * b[ 3] - this[ 3] * b[ 1];
            target[ 7] = this[ 1] * b[ 4] - this[ 4] * b[ 1];
            target[ 8] = this[ 1] * b[ 5] - this[ 5] * b[ 1];
            target[ 9] = this[ 2] * b[ 3] - this[ 3] * b[ 2];
            target[10] = this[ 2] * b[ 4] - this[ 4] * b[ 2];
            target[11] = this[ 2] * b[ 5] - this[ 5] * b[ 2];
            target[12] = this[ 3] * b[ 4] - this[ 4] * b[ 3];
            target[13] = this[ 3] * b[ 5] - this[ 5] * b[ 3];
            target[14] = this[ 4] * b[ 5] - this[ 5] * b[ 4];
        }
        else if(b.constructor === Bivec && target.constructor === Trivec) {
            target[ 0] = this[ 0] * b[ 5] + this[ 2] * b[ 0] - this[ 1] * b[ 1];
            target[ 1] = this[ 0] * b[ 6] + this[ 3] * b[ 0] - this[ 1] * b[ 2];
            target[ 2] = this[ 0] * b[ 7] + this[ 4] * b[ 0] - this[ 1] * b[ 3];
            target[ 3] = this[ 0] * b[ 8] + this[ 5] * b[ 0] - this[ 1] * b[ 4];
            target[ 4] = this[ 0] * b[ 9] + this[ 3] * b[ 1] - this[ 2] * b[ 2];
            target[ 5] = this[ 0] * b[10] + this[ 4] * b[ 1] - this[ 2] * b[ 3];
            target[ 6] = this[ 0] * b[11] + this[ 5] * b[ 1] - this[ 2] * b[ 4];
            target[ 7] = this[ 0] * b[12] + this[ 4] * b[ 2] - this[ 3] * b[ 3];
            target[ 8] = this[ 0] * b[13] + this[ 5] * b[ 2] - this[ 3] * b[ 4];
            target[ 9] = this[ 0] * b[14] + this[ 5] * b[ 3] - this[ 4] * b[ 4];
            target[10] = this[ 1] * b[ 9] + this[ 3] * b[ 5] - this[ 2] * b[ 6];
            target[11] = this[ 1] * b[10] + this[ 4] * b[ 5] - this[ 2] * b[ 7];
            target[12] = this[ 1] * b[11] + this[ 5] * b[ 5] - this[ 2] * b[ 8];
            target[13] = this[ 1] * b[12] + this[ 4] * b[ 6] - this[ 3] * b[ 7];
            target[14] = this[ 1] * b[13] + this[ 5] * b[ 6] - this[ 3] * b[ 8];
            target[15] = this[ 1] * b[14] + this[ 5] * b[ 7] - this[ 4] * b[ 8];
            target[16] = this[ 2] * b[12] + this[ 4] * b[ 9] - this[ 3] * b[10];
            target[17] = this[ 2] * b[13] + this[ 5] * b[ 9] - this[ 3] * b[11];
            target[18] = this[ 2] * b[14] + this[ 5] * b[10] - this[ 4] * b[11];
            target[19] = this[ 3] * b[14] + this[ 5] * b[12] - this[ 4] * b[13];
        }
        else
            console.error("not implemented")

        return target
    }

    inner(b, target) {
        if (b.constructor === Bivec && target.constructor === Unavec) {
            target[ 0] = this[ 4] * b[ 3] + this[ 5] * b[ 4] - this[ 1] * b[ 0] - this[ 2] * b[ 1] - this[ 3] * b[ 2];
            target[ 1] = this[ 0] * b[ 0] + this[ 4] * b[ 7] + this[ 5] * b[ 8] - this[ 2] * b[ 5] - this[ 3] * b[ 6];
            target[ 2] = this[ 0] * b[ 1] + this[ 1] * b[ 5] + this[ 4] * b[10] + this[ 5] * b[11] - this[ 3] * b[ 9];
            target[ 3] = this[ 0] * b[ 2] + this[ 1] * b[ 6] + this[ 2] * b[ 9] + this[ 4] * b[12] + this[ 5] * b[13];
            target[ 4] = this[ 0] * b[ 3] + this[ 1] * b[ 7] + this[ 2] * b[10] + this[ 3] * b[12] + this[ 5] * b[14];
            target[ 5] = this[ 0] * b[ 4] + this[ 1] * b[ 8] + this[ 2] * b[11] + this[ 3] * b[13] - this[ 4] * b[14];
        }
        else if (b.constructor === Trivec && target.constructor === Bivec) {
            target[ 0] = this[ 2] * b[ 0] + this[ 3] * b[ 1] - this[ 4] * b[ 2] - this[ 5] * b[ 3];
            target[ 1] = this[ 3] * b[ 4] - this[ 1] * b[ 0] - this[ 4] * b[ 5] - this[ 5] * b[ 6];
            target[ 2] = -this[ 1] * b[ 1] - this[ 2] * b[ 4] - this[ 4] * b[ 7] - this[ 5] * b[ 8];
            target[ 3] = -this[ 1] * b[ 2] - this[ 2] * b[ 5] - this[ 3] * b[ 7] - this[ 5] * b[ 9];
            target[ 4] = this[ 4] * b[ 9] - this[ 1] * b[ 3] - this[ 2] * b[ 6] - this[ 3] * b[ 8];
            target[ 5] = this[ 0] * b[ 0] + this[ 3] * b[10] - this[ 4] * b[11] - this[ 5] * b[12];
            target[ 6] = this[ 0] * b[ 1] - this[ 2] * b[10] - this[ 4] * b[13] - this[ 5] * b[14];
            target[ 7] = this[ 0] * b[ 2] - this[ 2] * b[11] - this[ 3] * b[13] - this[ 5] * b[15];
            target[ 8] = this[ 0] * b[ 3] + this[ 4] * b[15] - this[ 2] * b[12] - this[ 3] * b[14];
            target[ 9] = this[ 0] * b[ 4] + this[ 1] * b[10] - this[ 4] * b[16] - this[ 5] * b[17];
            target[10] = this[ 0] * b[ 5] + this[ 1] * b[11] - this[ 3] * b[16] - this[ 5] * b[18];
            target[11] = this[ 0] * b[ 6] + this[ 1] * b[12] + this[ 4] * b[18] - this[ 3] * b[17];
            target[12] = this[ 0] * b[ 7] + this[ 1] * b[13] + this[ 2] * b[16] - this[ 5] * b[19];
            target[13] = this[ 0] * b[ 8] + this[ 1] * b[14] + this[ 2] * b[17] + this[ 4] * b[19];
            target[14] = this[ 0] * b[ 9] + this[ 1] * b[15] + this[ 2] * b[18] + this[ 3] * b[19];
        }
        else if (b.constructor === Quadvec && target.constructor === Trivec) {
            target[ 0] = this[ 4] * b[ 1] + this[ 5] * b[ 2] - this[ 3] * b[ 0];
            target[ 1] = this[ 2] * b[ 0] + this[ 4] * b[ 3] + this[ 5] * b[ 4];
            target[ 2] = this[ 2] * b[ 1] + this[ 3] * b[ 3] + this[ 5] * b[ 5];
            target[ 3] = this[ 2] * b[ 2] + this[ 3] * b[ 4] - this[ 4] * b[ 5];
            target[ 4] = this[ 4] * b[ 6] + this[ 5] * b[ 7] - this[ 1] * b[ 0];
            target[ 5] = this[ 3] * b[ 6] + this[ 5] * b[ 8] - this[ 1] * b[ 1];
            target[ 6] = this[ 3] * b[ 7] - this[ 1] * b[ 2] - this[ 4] * b[ 8];
            target[ 7] = this[ 5] * b[ 9] - this[ 1] * b[ 3] - this[ 2] * b[ 6];
            target[ 8] = -this[ 1] * b[ 4] - this[ 2] * b[ 7] - this[ 4] * b[ 9];
            target[ 9] = -this[ 1] * b[ 5] - this[ 2] * b[ 8] - this[ 3] * b[ 9];
            target[10] = this[ 0] * b[ 0] + this[ 4] * b[10] + this[ 5] * b[11];
            target[11] = this[ 0] * b[ 1] + this[ 3] * b[10] + this[ 5] * b[12];
            target[12] = this[ 0] * b[ 2] + this[ 3] * b[11] - this[ 4] * b[12];
            target[13] = this[ 0] * b[ 3] + this[ 5] * b[13] - this[ 2] * b[10];
            target[14] = this[ 0] * b[ 4] - this[ 2] * b[11] - this[ 4] * b[13];
            target[15] = this[ 0] * b[ 5] - this[ 2] * b[12] - this[ 3] * b[13];
            target[16] = this[ 0] * b[ 6] + this[ 1] * b[10] + this[ 5] * b[14];
            target[17] = this[ 0] * b[ 7] + this[ 1] * b[11] - this[ 4] * b[14];
            target[18] = this[ 0] * b[ 8] + this[ 1] * b[12] - this[ 3] * b[14];
            target[19] = this[ 0] * b[ 9] + this[ 1] * b[13] + this[ 2] * b[14];
        }
        else if (b.constructor === Pentavec && target.constructor === Quadvec) {
            target[ 0] = -this[ 4] * b[ 0] - this[ 5] * b[ 1];
            target[ 1] = -this[ 3] * b[ 0] - this[ 5] * b[ 2];
            target[ 2] = this[ 4] * b[ 2] - this[ 3] * b[ 1];
            target[ 3] = this[ 2] * b[ 0] - this[ 5] * b[ 3];
            target[ 4] = this[ 2] * b[ 1] + this[ 4] * b[ 3];
            target[ 5] = this[ 2] * b[ 2] + this[ 3] * b[ 3];
            target[ 6] = -this[ 1] * b[ 0] - this[ 5] * b[ 4];
            target[ 7] = this[ 4] * b[ 4] - this[ 1] * b[ 1];
            target[ 8] = this[ 3] * b[ 4] - this[ 1] * b[ 2];
            target[ 9] = -this[ 1] * b[ 3] - this[ 2] * b[ 4];
            target[10] = this[ 0] * b[ 0] - this[ 5] * b[ 5];
            target[11] = this[ 0] * b[ 1] + this[ 4] * b[ 5];
            target[12] = this[ 0] * b[ 2] + this[ 3] * b[ 5];
            target[13] = this[ 0] * b[ 3] - this[ 2] * b[ 5];
            target[14] = this[ 0] * b[ 4] + this[ 1] * b[ 5];
        }
        else if (b.constructor === Hexavec && target.constructor === Pentavec) {
            target[ 0] = this[ 5] * b[ 0];
            target[ 1] = -this[ 4] * b[ 0];
            target[ 2] = -this[ 3] * b[ 0];
            target[ 3] = this[ 2] * b[ 0];
            target[ 4] = -this[ 1] * b[ 0];
            target[ 5] = this[ 0] * b[ 0];
        }
        else
            console.error("not implemented")

        return target
    }
}
Unavec.indexGrades = [
    1, 1, 1, 1, 1, 1
]

//2D CGA point pair. Also other things.
class Bivec extends GeneralVector {

    constructor() {
        super(15)
    }

    innerE0(target) {
        //only b[ 3] and b[ 4] are nonzero, and they are both 1
        target[ 0] =  this[ 2] - this[ 3];
        target[ 1] =  this[ 6] - this[ 7];
        target[ 2] =  this[ 9] - this[10];
        target[ 3] = - this[12];
        target[ 4] = - this[12];
        target[ 5] =  this[14] - this[13];

        return target
    }

    innerSelfScalar(){
        return this[10] * this[10] + this[11] * this[11] + this[12] * this[12] + this[13] * this[13] + this[ 3] * this[ 3] + this[ 4] * this[ 4] + this[ 7] * this[ 7] + this[ 8] * this[ 8] - this[ 0] * this[ 0] - this[14] * this[14] - this[ 1] * this[ 1] - this[ 2] * this[ 2] - this[ 5] * this[ 5] - this[ 6] * this[ 6] - this[ 9] * this[ 9]
    }

    meet(b, target) {
        if(b.constructor === Unavec && target.constructor === Trivec) {
            target[ 0] = this[ 0] * b[ 2] + this[ 5] * b[ 0] - this[ 1] * b[ 1];
            target[ 1] = this[ 0] * b[ 3] + this[ 6] * b[ 0] - this[ 2] * b[ 1];
            target[ 2] = this[ 0] * b[ 4] + this[ 7] * b[ 0] - this[ 3] * b[ 1];
            target[ 3] = this[ 0] * b[ 5] + this[ 8] * b[ 0] - this[ 4] * b[ 1];
            target[ 4] = this[ 1] * b[ 3] + this[ 9] * b[ 0] - this[ 2] * b[ 2];
            target[ 5] = this[10] * b[ 0] + this[ 1] * b[ 4] - this[ 3] * b[ 2];
            target[ 6] = this[11] * b[ 0] + this[ 1] * b[ 5] - this[ 4] * b[ 2];
            target[ 7] = this[12] * b[ 0] + this[ 2] * b[ 4] - this[ 3] * b[ 3];
            target[ 8] = this[13] * b[ 0] + this[ 2] * b[ 5] - this[ 4] * b[ 3];
            target[ 9] = this[14] * b[ 0] + this[ 3] * b[ 5] - this[ 4] * b[ 4];
            target[10] = this[ 5] * b[ 3] + this[ 9] * b[ 1] - this[ 6] * b[ 2];
            target[11] = this[10] * b[ 1] + this[ 5] * b[ 4] - this[ 7] * b[ 2];
            target[12] = this[11] * b[ 1] + this[ 5] * b[ 5] - this[ 8] * b[ 2];
            target[13] = this[12] * b[ 1] + this[ 6] * b[ 4] - this[ 7] * b[ 3];
            target[14] = this[13] * b[ 1] + this[ 6] * b[ 5] - this[ 8] * b[ 3];
            target[15] = this[14] * b[ 1] + this[ 7] * b[ 5] - this[ 8] * b[ 4];
            target[16] = this[12] * b[ 2] + this[ 9] * b[ 4] - this[10] * b[ 3];
            target[17] = this[13] * b[ 2] + this[ 9] * b[ 5] - this[11] * b[ 3];
            target[18] = this[10] * b[ 5] + this[14] * b[ 2] - this[11] * b[ 4];
            target[19] = this[12] * b[ 5] + this[14] * b[ 3] - this[13] * b[ 4];
        }
        else
            console.error("not implemented")

        return target
    }

    // for when this is a 2D CGA / 1+1 CSTA point pair
    inner(b, target) {
        if (b.constructor === Quadvec && target.constructor === Bivec) {
            target[ 0] = this[10] * b[ 1] + this[11] * b[ 2] + this[12] * b[ 3] + this[13] * b[ 4] - this[14] * b[ 5] - this[ 9] * b[ 0];
            target[ 1] = this[12] * b[ 6] + this[13] * b[ 7] + this[ 6] * b[ 0] - this[14] * b[ 8] - this[ 7] * b[ 1] - this[ 8] * b[ 2];
            target[ 2] = -this[10] * b[ 6] - this[11] * b[ 7] - this[14] * b[ 9] - this[ 5] * b[ 0] - this[ 7] * b[ 3] - this[ 8] * b[ 4];
            target[ 3] = -this[11] * b[ 8] - this[13] * b[ 9] - this[ 5] * b[ 1] - this[ 6] * b[ 3] - this[ 8] * b[ 5] - this[ 9] * b[ 6];
            target[ 4] = this[10] * b[ 8] + this[12] * b[ 9] + this[ 7] * b[ 5] - this[ 5] * b[ 2] - this[ 6] * b[ 4] - this[ 9] * b[ 7];
            target[ 5] = this[12] * b[10] + this[13] * b[11] + this[ 3] * b[ 1] + this[ 4] * b[ 2] - this[14] * b[12] - this[ 2] * b[ 0];
            target[ 6] = this[ 1] * b[ 0] + this[ 3] * b[ 3] + this[ 4] * b[ 4] - this[10] * b[10] - this[11] * b[11] - this[14] * b[13];
            target[ 7] = this[ 1] * b[ 1] + this[ 2] * b[ 3] + this[ 4] * b[ 5] - this[11] * b[12] - this[13] * b[13] - this[ 9] * b[10];
            target[ 8] = this[10] * b[12] + this[12] * b[13] + this[ 1] * b[ 2] + this[ 2] * b[ 4] - this[ 3] * b[ 5] - this[ 9] * b[11];
            target[ 9] = this[ 3] * b[ 6] + this[ 4] * b[ 7] + this[ 7] * b[10] + this[ 8] * b[11] - this[ 0] * b[ 0] - this[14] * b[14];
            target[10] = this[ 2] * b[ 6] + this[ 4] * b[ 8] + this[ 6] * b[10] + this[ 8] * b[12] - this[ 0] * b[ 1] - this[13] * b[14];
            target[11] = this[12] * b[14] + this[ 2] * b[ 7] + this[ 6] * b[11] - this[ 0] * b[ 2] - this[ 3] * b[ 8] - this[ 7] * b[12];
            target[12] = this[11] * b[14] + this[ 4] * b[ 9] + this[ 8] * b[13] - this[ 0] * b[ 3] - this[ 1] * b[ 6] - this[ 5] * b[10];
            target[13] = -this[ 0] * b[ 4] - this[10] * b[14] - this[ 1] * b[ 7] - this[ 3] * b[ 9] - this[ 5] * b[11] - this[ 7] * b[13];
            target[14] = -this[ 0] * b[ 5] - this[ 1] * b[ 8] - this[ 2] * b[ 9] - this[ 5] * b[12] - this[ 6] * b[13] - this[ 9] * b[14];
        }
        else if (b.constructor === Unavec && target.constructor === Unavec) {
            target[0] = this[0] * b[1] + this[1] * b[2] + this[2] * b[3] - this[3] * b[4] - this[4] * b[5];
            target[1] = this[5] * b[2] + this[6] * b[3] - this[0] * b[0] - this[7] * b[4] - this[8] * b[5];
            target[2] = this[9] * b[3] - this[10] * b[4] - this[11] * b[5] - this[1] * b[0] - this[5] * b[1];
            target[3] = -this[12] * b[4] - this[13] * b[5] - this[2] * b[0] - this[6] * b[1] - this[9] * b[2];
            target[4] = -this[10] * b[2] - this[12] * b[3] - this[14] * b[5] - this[3] * b[0] - this[7] * b[1];
            target[5] = this[14] * b[4] - this[11] * b[2] - this[13] * b[3] - this[4] * b[0] - this[8] * b[1];
        }
        else
            console.error("not implemented")

        return target
    }
}
Bivec.indexGrades = [
    2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2,
]

// CGA point pair
class Trivec extends GeneralVector {

    constructor() {
        super(20)
    }

    innerSelfScalar() {
        return this[11]*this[11]+this[12]*this[12]+this[13]*this[13]+this[14]*this[14]+this[16]*this[16]+this[17]*this[17]+this[2]*this[2]+this[3]*this[3]+this[5]*this[5]+this[6]*this[6]+this[7]*this[7]+this[8]*this[8]-this[0]*this[0]-this[10]*this[10]-this[15]*this[15]-this[18]*this[18]-this[19]*this[19]-this[1]*this[1]-this[4]*this[4]-this[9]*this[9];
    }

    getReverse(target) {
        target[0] = -this[0];
        target[1] = -this[1];
        target[2] = -this[2];
        target[3] = -this[3];
        target[4] = -this[4];
        target[5] = -this[5];
        target[6] = -this[6];
        target[7] = -this[7];
        target[8] = -this[8];
        target[9] = -this[9];
        target[10] = -this[10];
        target[11] = -this[11];
        target[12] = -this[12];
        target[13] = -this[13];
        target[14] = -this[14];
        target[15] = -this[15];
        target[16] = -this[16];
        target[17] = -this[17];
        target[18] = -this[18];
        target[19] = -this[19];
        return target;
    }

    inner(b, target) {
        if (b.constructor === Pentavec && target.constructor === Bivec) {
            target[ 0] = this[16] * b[ 0] + this[17] * b[ 1] - this[18] * b[ 2] - this[19] * b[ 3];
            target[ 1] = this[15] * b[ 2] - this[13] * b[ 0] - this[14] * b[ 1] - this[19] * b[ 4];
            target[ 2] = this[11] * b[ 0] + this[12] * b[ 1] + this[15] * b[ 3] + this[18] * b[ 4];
            target[ 3] = this[10] * b[ 0] + this[12] * b[ 2] + this[14] * b[ 3] + this[17] * b[ 4];
            target[ 4] = this[10] * b[ 1] - this[11] * b[ 2] - this[13] * b[ 3] - this[16] * b[ 4];
            target[ 5] = this[ 7] * b[ 0] + this[ 8] * b[ 1] - this[19] * b[ 5] - this[ 9] * b[ 2];
            target[ 6] = this[18] * b[ 5] - this[ 5] * b[ 0] - this[ 6] * b[ 1] - this[ 9] * b[ 3];
            target[ 7] = this[17] * b[ 5] - this[ 4] * b[ 0] - this[ 6] * b[ 2] - this[ 8] * b[ 3];
            target[ 8] = this[ 5] * b[ 2] + this[ 7] * b[ 3] - this[16] * b[ 5] - this[ 4] * b[ 1];
            target[ 9] = this[ 2] * b[ 0] + this[ 3] * b[ 1] - this[15] * b[ 5] - this[ 9] * b[ 4];
            target[10] = this[ 1] * b[ 0] + this[ 3] * b[ 2] - this[14] * b[ 5] - this[ 8] * b[ 4];
            target[11] = this[13] * b[ 5] + this[ 1] * b[ 1] + this[ 7] * b[ 4] - this[ 2] * b[ 2];
            target[12] = this[12] * b[ 5] + this[ 3] * b[ 3] + this[ 6] * b[ 4] - this[ 0] * b[ 0];
            target[13] = -this[ 0] * b[ 1] - this[11] * b[ 5] - this[ 2] * b[ 3] - this[ 5] * b[ 4];
            target[14] = -this[ 0] * b[ 2] - this[10] * b[ 5] - this[ 1] * b[ 3] - this[ 4] * b[ 4];
        }
        else if (b.constructor === Quadvec && target.constructor === Unavec) {
            target[0] = this[10] * b[0] + this[15] * b[5] + this[18] * b[8] + this[19] * b[9] - this[11] * b[1] - this[12] * b[2] - this[13] * b[3] - this[14] * b[4] - this[16] * b[6] - this[17] * b[7];
            target[1] = this[18] * b[12] + this[19] * b[13] + this[5] * b[1] + this[6] * b[2] + this[7] * b[3] + this[8] * b[4] - this[16] * b[10] - this[17] * b[11] - this[4] * b[0] - this[9] * b[5];
            target[2] = this[13] * b[10] + this[14] * b[11] + this[19] * b[14] + this[1] * b[0] + this[7] * b[6] + this[8] * b[7] - this[15] * b[12] - this[2] * b[1] - this[3] * b[2] - this[9] * b[8];
            target[3] = -this[0] * b[0] - this[11] * b[10] - this[12] * b[11] - this[15] * b[13] - this[18] * b[14] - this[2] * b[3] - this[3] * b[4] - this[5] * b[6] - this[6] * b[7] - this[9] * b[9];
            target[4] = -this[0] * b[1] - this[10] * b[10] - this[12] * b[12] - this[14] * b[13] - this[17] * b[14] - this[1] * b[3] - this[3] * b[5] - this[4] * b[6] - this[6] * b[8] - this[8] * b[9];
            target[5] = this[11] * b[12] + this[13] * b[13] + this[16] * b[14] + this[2] * b[5] + this[5] * b[8] + this[7] * b[9] - this[0] * b[2] - this[10] * b[11] - this[1] * b[4] - this[4] * b[7];
        }
        else if(b.constructor === Bivec && target.constructor === Pentavec) {
            target[0] = this[0] * b[12] + this[11] * b[2] + this[16] * b[0] + this[2] * b[9] + this[4] * b[7] + this[7] * b[5] - this[10] * b[3] - this[13] * b[1] - this[1] * b[10] - this[5] * b[6];
            target[1] = this[0] * b[13] + this[12] * b[2] + this[17] * b[0] + this[3] * b[9] + this[4] * b[8] + this[8] * b[5] - this[10] * b[4] - this[14] * b[1] - this[1] * b[11] - this[6] * b[6];
            target[2] = this[0] * b[14] + this[12] * b[3] + this[18] * b[0] + this[3] * b[10] + this[5] * b[8] + this[9] * b[5] - this[11] * b[4] - this[15] * b[1] - this[2] * b[11] - this[6] * b[7];
            target[3] = this[14] * b[3] + this[19] * b[0] + this[1] * b[14] + this[3] * b[12] + this[7] * b[8] + this[9] * b[6] - this[13] * b[4] - this[15] * b[2] - this[2] * b[13] - this[8] * b[7];
            target[4] = this[17] * b[3] + this[19] * b[1] + this[4] * b[14] + this[6] * b[12] + this[7] * b[11] + this[9] * b[9] - this[16] * b[4] - this[18] * b[2] - this[5] * b[13] - this[8] * b[10];
            target[5] = this[10] * b[14] + this[12] * b[12] + this[13] * b[11] + this[15] * b[9] + this[17] * b[7] + this[19] * b[5] - this[11] * b[13] - this[14] * b[10] - this[16] * b[8] - this[18] * b[6];
        }
        else if(b.constructor === Unavec && target.constructor === Quadvec) {
            target[0] = this[0] * b[3] + this[4] * b[1] - this[10] * b[0] - this[1] * b[2];
            target[1] = this[0] * b[4] + this[5] * b[1] - this[11] * b[0] - this[2] * b[2];
            target[2] = this[0] * b[5] + this[6] * b[1] - this[12] * b[0] - this[3] * b[2];
            target[3] = this[1] * b[4] + this[7] * b[1] - this[13] * b[0] - this[2] * b[3];
            target[4] = this[1] * b[5] + this[8] * b[1] - this[14] * b[0] - this[3] * b[3];
            target[5] = this[2] * b[5] + this[9] * b[1] - this[15] * b[0] - this[3] * b[4];
            target[6] = this[4] * b[4] + this[7] * b[2] - this[16] * b[0] - this[5] * b[3];
            target[7] = this[4] * b[5] + this[8] * b[2] - this[17] * b[0] - this[6] * b[3];
            target[8] = this[5] * b[5] + this[9] * b[2] - this[18] * b[0] - this[6] * b[4];
            target[9] = this[7] * b[5] + this[9] * b[3] - this[19] * b[0] - this[8] * b[4];
            target[10] = this[10] * b[4] + this[13] * b[2] - this[11] * b[3] - this[16] * b[1];
            target[11] = this[10] * b[5] + this[14] * b[2] - this[12] * b[3] - this[17] * b[1];
            target[12] = this[11] * b[5] + this[15] * b[2] - this[12] * b[4] - this[18] * b[1];
            target[13] = this[13] * b[5] + this[15] * b[3] - this[14] * b[4] - this[19] * b[1];
            target[14] = this[16] * b[5] + this[18] * b[3] - this[17] * b[4] - this[19] * b[2];
        }
        else
            console.error("not implemented")

        return target
    }
}
Trivec.indexGrades = [
    3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3,
]

// 3+1 CSTA point pair, eg point pair in 4D spacetime
class Quadvec extends GeneralVector {
    constructor() {
        super(15)
    }

    inner(b, target) {
        if (b.constructor === Hexavec && target.constructor === Bivec) {
            res[0] = this[14] * b[ 0];
            res[1] = -this[13] * b[ 0];
            res[2] = this[12] * b[ 0];
            res[3] = this[11] * b[ 0];
            res[4] = -this[10] * b[ 0];
            res[5] = this[ 9] * b[ 0];
            res[6] = -this[ 8] * b[ 0];
            res[7] = -this[ 7] * b[ 0];
            res[8] = this[ 6] * b[ 0];
            res[9] = this[ 5] * b[ 0];
            res[10] = this[ 4] * b[ 0];
            res[11] = -this[ 3] * b[ 0];
            res[12] = -this[ 2] * b[ 0];
            res[13] = this[ 1] * b[ 0];
            res[14] = this[ 0] * b[ 0];
        }
        else
            console.error("not implemented")

        return target
    }
}
Quadvec.indexGrades = [
    4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4,
]

class Pentavec extends GeneralVector {
    constructor() {
        super(6)
    }
}
Pentavec.indexGrades = [
    5, 5, 5, 5, 5, 5,
]

class Hexavec extends GeneralVector {
    constructor() {
        super(1)
    }
}
Hexavec.indexGrades = [
    6
]

function reverse42(a, target) {
    target[ 0] = a[0]; target[ 1] = a[1]; target[ 2] = a[2]; target[ 3] = a[3]; target[ 4] = a[4]; target[ 5] = a[5]; target[ 6] = a[6]; target[ 7] = -a[7]; target[ 8] = -a[8]; target[ 9] = -a[9]; target[10] = -a[10]; target[11] = -a[11]; target[12] = -a[12]; target[13] = -a[13]; target[14] = -a[14]; target[15] = -a[15]; target[16] = -a[16]; target[17] = -a[17]; target[18] = -a[18]; target[19] = -a[19]; target[20] = -a[20]; target[21] = -a[21]; target[22] = -a[22]; target[23] = -a[23]; target[24] = -a[24]; target[25] = -a[25]; target[26] = -a[26]; target[27] = -a[27]; target[28] = -a[28]; target[29] = -a[29]; target[30] = -a[30]; target[31] = -a[31]; target[32] = -a[32]; target[33] = -a[33]; target[34] = -a[34]; target[35] = -a[35]; target[36] = -a[36]; target[37] = -a[37]; target[38] = -a[38]; target[39] = -a[39]; target[40] = -a[40]; target[41] = -a[41]; target[42] = a[42]; target[43] = a[43]; target[44] = a[44]; target[45] = a[45]; target[46] = a[46]; target[47] = a[47]; target[48] = a[48]; target[49] = a[49]; target[50] = a[50]; target[51] = a[51]; target[52] = a[52]; target[53] = a[53]; target[54] = a[54]; target[55] = a[55]; target[56] = a[56]; target[57] = a[57]; target[58] = a[58]; target[59] = a[59]; target[60] = a[60]; target[61] = a[61]; target[62] = a[62]; target[63] = -a[63];
    return target;
}

function mul42(a, b, target) {
    target[ 0] = b[ 0] * a[0] + b[ 1] * a[1] + b[ 2] * a[2] + b[ 3] * a[3] + b[ 4] * a[4] - b[ 5] * a[5] - b[ 6] * a[6] - b[ 7] * a[7] - b[ 8] * a[8] - b[ 9] * a[9] + b[10] * a[10] + b[11] * a[11] - b[12] * a[12] - b[13] * a[13] + b[14] * a[14] + b[15] * a[15] - b[16] * a[16] + b[17] * a[17] + b[18] * a[18] + b[19] * a[19] + b[20] * a[20] - b[21] * a[21] - b[22] * a[22] - b[23] * a[23] + b[24] * a[24] + b[25] * a[25] - b[26] * a[26] + b[27] * a[27] + b[28] * a[28] + b[29] * a[29] + b[30] * a[30] - b[31] * a[31] - b[32] * a[32] + b[33] * a[33] + b[34] * a[34] + b[35] * a[35] + b[36] * a[36] - b[37] * a[37] + b[38] * a[38] + b[39] * a[39] - b[40] * a[40] - b[41] * a[41] + b[42] * a[42] - b[43] * a[43] - b[44] * a[44] - b[45] * a[45] - b[46] * a[46] + b[47] * a[47] - b[48] * a[48] - b[49] * a[49] + b[50] * a[50] + b[51] * a[51] - b[52] * a[52] - b[53] * a[53] + b[54] * a[54] + b[55] * a[55] + b[56] * a[56] - b[57] * a[57] - b[58] * a[58] + b[59] * a[59] + b[60] * a[60] + b[61] * a[61] + b[62] * a[62] - b[63] * a[63];
    target[ 1] = b[ 1] * a[0] + b[ 0] * a[1] - b[ 7] * a[2] - b[ 8] * a[3] - b[ 9] * a[4] + b[10] * a[5] + b[11] * a[6] + b[ 2] * a[7] + b[ 3] * a[8] + b[ 4] * a[9] - b[ 5] * a[10] - b[ 6] * a[11] - b[22] * a[12] - b[23] * a[13] + b[24] * a[14] + b[25] * a[15] - b[26] * a[16] + b[27] * a[17] + b[28] * a[18] + b[29] * a[19] + b[30] * a[20] - b[31] * a[21] - b[12] * a[22] - b[13] * a[23] + b[14] * a[24] + b[15] * a[25] - b[16] * a[26] + b[17] * a[27] + b[18] * a[28] + b[19] * a[29] + b[20] * a[30] - b[21] * a[31] + b[42] * a[32] - b[43] * a[33] - b[44] * a[34] - b[45] * a[35] - b[46] * a[36] + b[47] * a[37] - b[48] * a[38] - b[49] * a[39] + b[50] * a[40] + b[51] * a[41] - b[32] * a[42] + b[33] * a[43] + b[34] * a[44] + b[35] * a[45] + b[36] * a[46] - b[37] * a[47] + b[38] * a[48] + b[39] * a[49] - b[40] * a[50] - b[41] * a[51] - b[57] * a[52] - b[58] * a[53] + b[59] * a[54] + b[60] * a[55] + b[61] * a[56] - b[52] * a[57] - b[53] * a[58] + b[54] * a[59] + b[55] * a[60] + b[56] * a[61] - b[63] * a[62] + b[62] * a[63];
    target[ 2] = b[ 2] * a[0] + b[ 7] * a[1] + b[ 0] * a[2] - b[12] * a[3] - b[13] * a[4] + b[14] * a[5] + b[15] * a[6] - b[ 1] * a[7] + b[22] * a[8] + b[23] * a[9] - b[24] * a[10] - b[25] * a[11] + b[ 3] * a[12] + b[ 4] * a[13] - b[ 5] * a[14] - b[ 6] * a[15] - b[32] * a[16] + b[33] * a[17] + b[34] * a[18] + b[35] * a[19] + b[36] * a[20] - b[37] * a[21] + b[ 8] * a[22] + b[ 9] * a[23] - b[10] * a[24] - b[11] * a[25] - b[42] * a[26] + b[43] * a[27] + b[44] * a[28] + b[45] * a[29] + b[46] * a[30] - b[47] * a[31] - b[16] * a[32] + b[17] * a[33] + b[18] * a[34] + b[19] * a[35] + b[20] * a[36] - b[21] * a[37] - b[52] * a[38] - b[53] * a[39] + b[54] * a[40] + b[55] * a[41] + b[26] * a[42] - b[27] * a[43] - b[28] * a[44] - b[29] * a[45] - b[30] * a[46] + b[31] * a[47] + b[57] * a[48] + b[58] * a[49] - b[59] * a[50] - b[60] * a[51] + b[38] * a[52] + b[39] * a[53] - b[40] * a[54] - b[41] * a[55] + b[62] * a[56] + b[48] * a[57] + b[49] * a[58] - b[50] * a[59] - b[51] * a[60] + b[63] * a[61] + b[56] * a[62] - b[61] * a[63];
    target[ 3] = b[ 3] * a[0] + b[ 8] * a[1] + b[12] * a[2] + b[ 0] * a[3] - b[16] * a[4] + b[17] * a[5] + b[18] * a[6] - b[22] * a[7] - b[ 1] * a[8] + b[26] * a[9] - b[27] * a[10] - b[28] * a[11] - b[ 2] * a[12] + b[32] * a[13] - b[33] * a[14] - b[34] * a[15] + b[ 4] * a[16] - b[ 5] * a[17] - b[ 6] * a[18] + b[38] * a[19] + b[39] * a[20] - b[40] * a[21] - b[ 7] * a[22] + b[42] * a[23] - b[43] * a[24] - b[44] * a[25] + b[ 9] * a[26] - b[10] * a[27] - b[11] * a[28] + b[48] * a[29] + b[49] * a[30] - b[50] * a[31] + b[13] * a[32] - b[14] * a[33] - b[15] * a[34] + b[52] * a[35] + b[53] * a[36] - b[54] * a[37] + b[19] * a[38] + b[20] * a[39] - b[21] * a[40] + b[56] * a[41] - b[23] * a[42] + b[24] * a[43] + b[25] * a[44] - b[57] * a[45] - b[58] * a[46] + b[59] * a[47] - b[29] * a[48] - b[30] * a[49] + b[31] * a[50] - b[61] * a[51] - b[35] * a[52] - b[36] * a[53] + b[37] * a[54] - b[62] * a[55] - b[41] * a[56] - b[45] * a[57] - b[46] * a[58] + b[47] * a[59] - b[63] * a[60] - b[51] * a[61] - b[55] * a[62] + b[60] * a[63];
    target[ 4] = b[ 4] * a[0] + b[ 9] * a[1] + b[13] * a[2] + b[16] * a[3] + b[ 0] * a[4] + b[19] * a[5] + b[20] * a[6] - b[23] * a[7] - b[26] * a[8] - b[ 1] * a[9] - b[29] * a[10] - b[30] * a[11] - b[32] * a[12] - b[ 2] * a[13] - b[35] * a[14] - b[36] * a[15] - b[ 3] * a[16] - b[38] * a[17] - b[39] * a[18] - b[ 5] * a[19] - b[ 6] * a[20] - b[41] * a[21] - b[42] * a[22] - b[ 7] * a[23] - b[45] * a[24] - b[46] * a[25] - b[ 8] * a[26] - b[48] * a[27] - b[49] * a[28] - b[10] * a[29] - b[11] * a[30] - b[51] * a[31] - b[12] * a[32] - b[52] * a[33] - b[53] * a[34] - b[14] * a[35] - b[15] * a[36] - b[55] * a[37] - b[17] * a[38] - b[18] * a[39] - b[56] * a[40] - b[21] * a[41] + b[22] * a[42] + b[57] * a[43] + b[58] * a[44] + b[24] * a[45] + b[25] * a[46] + b[60] * a[47] + b[27] * a[48] + b[28] * a[49] + b[61] * a[50] + b[31] * a[51] + b[33] * a[52] + b[34] * a[53] + b[62] * a[54] + b[37] * a[55] + b[40] * a[56] + b[43] * a[57] + b[44] * a[58] + b[63] * a[59] + b[47] * a[60] + b[50] * a[61] + b[54] * a[62] - b[59] * a[63];
    target[ 5] = b[ 5] * a[0] + b[10] * a[1] + b[14] * a[2] + b[17] * a[3] + b[19] * a[4] + b[ 0] * a[5] + b[21] * a[6] - b[24] * a[7] - b[27] * a[8] - b[29] * a[9] - b[ 1] * a[10] - b[31] * a[11] - b[33] * a[12] - b[35] * a[13] - b[ 2] * a[14] - b[37] * a[15] - b[38] * a[16] - b[ 3] * a[17] - b[40] * a[18] - b[ 4] * a[19] - b[41] * a[20] - b[ 6] * a[21] - b[43] * a[22] - b[45] * a[23] - b[ 7] * a[24] - b[47] * a[25] - b[48] * a[26] - b[ 8] * a[27] - b[50] * a[28] - b[ 9] * a[29] - b[51] * a[30] - b[11] * a[31] - b[52] * a[32] - b[12] * a[33] - b[54] * a[34] - b[13] * a[35] - b[55] * a[36] - b[15] * a[37] - b[16] * a[38] - b[56] * a[39] - b[18] * a[40] - b[20] * a[41] + b[57] * a[42] + b[22] * a[43] + b[59] * a[44] + b[23] * a[45] + b[60] * a[46] + b[25] * a[47] + b[26] * a[48] + b[61] * a[49] + b[28] * a[50] + b[30] * a[51] + b[32] * a[52] + b[62] * a[53] + b[34] * a[54] + b[36] * a[55] + b[39] * a[56] + b[42] * a[57] + b[63] * a[58] + b[44] * a[59] + b[46] * a[60] + b[49] * a[61] + b[53] * a[62] - b[58] * a[63];
    target[ 6] = b[ 6] * a[0] + b[11] * a[1] + b[15] * a[2] + b[18] * a[3] + b[20] * a[4] - b[21] * a[5] + b[ 0] * a[6] - b[25] * a[7] - b[28] * a[8] - b[30] * a[9] + b[31] * a[10] - b[ 1] * a[11] - b[34] * a[12] - b[36] * a[13] + b[37] * a[14] - b[ 2] * a[15] - b[39] * a[16] + b[40] * a[17] - b[ 3] * a[18] + b[41] * a[19] - b[ 4] * a[20] + b[ 5] * a[21] - b[44] * a[22] - b[46] * a[23] + b[47] * a[24] - b[ 7] * a[25] - b[49] * a[26] + b[50] * a[27] - b[ 8] * a[28] + b[51] * a[29] - b[ 9] * a[30] + b[10] * a[31] - b[53] * a[32] + b[54] * a[33] - b[12] * a[34] + b[55] * a[35] - b[13] * a[36] + b[14] * a[37] + b[56] * a[38] - b[16] * a[39] + b[17] * a[40] + b[19] * a[41] + b[58] * a[42] - b[59] * a[43] + b[22] * a[44] - b[60] * a[45] + b[23] * a[46] - b[24] * a[47] - b[61] * a[48] + b[26] * a[49] - b[27] * a[50] - b[29] * a[51] - b[62] * a[52] + b[32] * a[53] - b[33] * a[54] - b[35] * a[55] - b[38] * a[56] - b[63] * a[57] + b[42] * a[58] - b[43] * a[59] - b[45] * a[60] - b[48] * a[61] - b[52] * a[62] + b[57] * a[63];
    target[ 7] = b[ 7] * a[0] + b[ 2] * a[1] - b[ 1] * a[2] + b[22] * a[3] + b[23] * a[4] - b[24] * a[5] - b[25] * a[6] + b[ 0] * a[7] - b[12] * a[8] - b[13] * a[9] + b[14] * a[10] + b[15] * a[11] + b[ 8] * a[12] + b[ 9] * a[13] - b[10] * a[14] - b[11] * a[15] - b[42] * a[16] + b[43] * a[17] + b[44] * a[18] + b[45] * a[19] + b[46] * a[20] - b[47] * a[21] + b[ 3] * a[22] + b[ 4] * a[23] - b[ 5] * a[24] - b[ 6] * a[25] - b[32] * a[26] + b[33] * a[27] + b[34] * a[28] + b[35] * a[29] + b[36] * a[30] - b[37] * a[31] + b[26] * a[32] - b[27] * a[33] - b[28] * a[34] - b[29] * a[35] - b[30] * a[36] + b[31] * a[37] + b[57] * a[38] + b[58] * a[39] - b[59] * a[40] - b[60] * a[41] - b[16] * a[42] + b[17] * a[43] + b[18] * a[44] + b[19] * a[45] + b[20] * a[46] - b[21] * a[47] - b[52] * a[48] - b[53] * a[49] + b[54] * a[50] + b[55] * a[51] + b[48] * a[52] + b[49] * a[53] - b[50] * a[54] - b[51] * a[55] + b[63] * a[56] + b[38] * a[57] + b[39] * a[58] - b[40] * a[59] - b[41] * a[60] + b[62] * a[61] - b[61] * a[62] + b[56] * a[63];
    target[ 8] = b[ 8] * a[0] + b[ 3] * a[1] - b[22] * a[2] - b[ 1] * a[3] + b[26] * a[4] - b[27] * a[5] - b[28] * a[6] + b[12] * a[7] + b[ 0] * a[8] - b[16] * a[9] + b[17] * a[10] + b[18] * a[11] - b[ 7] * a[12] + b[42] * a[13] - b[43] * a[14] - b[44] * a[15] + b[ 9] * a[16] - b[10] * a[17] - b[11] * a[18] + b[48] * a[19] + b[49] * a[20] - b[50] * a[21] - b[ 2] * a[22] + b[32] * a[23] - b[33] * a[24] - b[34] * a[25] + b[ 4] * a[26] - b[ 5] * a[27] - b[ 6] * a[28] + b[38] * a[29] + b[39] * a[30] - b[40] * a[31] - b[23] * a[32] + b[24] * a[33] + b[25] * a[34] - b[57] * a[35] - b[58] * a[36] + b[59] * a[37] - b[29] * a[38] - b[30] * a[39] + b[31] * a[40] - b[61] * a[41] + b[13] * a[42] - b[14] * a[43] - b[15] * a[44] + b[52] * a[45] + b[53] * a[46] - b[54] * a[47] + b[19] * a[48] + b[20] * a[49] - b[21] * a[50] + b[56] * a[51] - b[45] * a[52] - b[46] * a[53] + b[47] * a[54] - b[63] * a[55] - b[51] * a[56] - b[35] * a[57] - b[36] * a[58] + b[37] * a[59] - b[62] * a[60] - b[41] * a[61] + b[60] * a[62] - b[55] * a[63];
    target[ 9] = b[ 9] * a[0] + b[ 4] * a[1] - b[23] * a[2] - b[26] * a[3] - b[ 1] * a[4] - b[29] * a[5] - b[30] * a[6] + b[13] * a[7] + b[16] * a[8] + b[ 0] * a[9] + b[19] * a[10] + b[20] * a[11] - b[42] * a[12] - b[ 7] * a[13] - b[45] * a[14] - b[46] * a[15] - b[ 8] * a[16] - b[48] * a[17] - b[49] * a[18] - b[10] * a[19] - b[11] * a[20] - b[51] * a[21] - b[32] * a[22] - b[ 2] * a[23] - b[35] * a[24] - b[36] * a[25] - b[ 3] * a[26] - b[38] * a[27] - b[39] * a[28] - b[ 5] * a[29] - b[ 6] * a[30] - b[41] * a[31] + b[22] * a[32] + b[57] * a[33] + b[58] * a[34] + b[24] * a[35] + b[25] * a[36] + b[60] * a[37] + b[27] * a[38] + b[28] * a[39] + b[61] * a[40] + b[31] * a[41] - b[12] * a[42] - b[52] * a[43] - b[53] * a[44] - b[14] * a[45] - b[15] * a[46] - b[55] * a[47] - b[17] * a[48] - b[18] * a[49] - b[56] * a[50] - b[21] * a[51] + b[43] * a[52] + b[44] * a[53] + b[63] * a[54] + b[47] * a[55] + b[50] * a[56] + b[33] * a[57] + b[34] * a[58] + b[62] * a[59] + b[37] * a[60] + b[40] * a[61] - b[59] * a[62] + b[54] * a[63];
    target[10] = b[10] * a[0] + b[ 5] * a[1] - b[24] * a[2] - b[27] * a[3] - b[29] * a[4] - b[ 1] * a[5] - b[31] * a[6] + b[14] * a[7] + b[17] * a[8] + b[19] * a[9] + b[ 0] * a[10] + b[21] * a[11] - b[43] * a[12] - b[45] * a[13] - b[ 7] * a[14] - b[47] * a[15] - b[48] * a[16] - b[ 8] * a[17] - b[50] * a[18] - b[ 9] * a[19] - b[51] * a[20] - b[11] * a[21] - b[33] * a[22] - b[35] * a[23] - b[ 2] * a[24] - b[37] * a[25] - b[38] * a[26] - b[ 3] * a[27] - b[40] * a[28] - b[ 4] * a[29] - b[41] * a[30] - b[ 6] * a[31] + b[57] * a[32] + b[22] * a[33] + b[59] * a[34] + b[23] * a[35] + b[60] * a[36] + b[25] * a[37] + b[26] * a[38] + b[61] * a[39] + b[28] * a[40] + b[30] * a[41] - b[52] * a[42] - b[12] * a[43] - b[54] * a[44] - b[13] * a[45] - b[55] * a[46] - b[15] * a[47] - b[16] * a[48] - b[56] * a[49] - b[18] * a[50] - b[20] * a[51] + b[42] * a[52] + b[63] * a[53] + b[44] * a[54] + b[46] * a[55] + b[49] * a[56] + b[32] * a[57] + b[62] * a[58] + b[34] * a[59] + b[36] * a[60] + b[39] * a[61] - b[58] * a[62] + b[53] * a[63];
    target[11] = b[11] * a[0] + b[ 6] * a[1] - b[25] * a[2] - b[28] * a[3] - b[30] * a[4] + b[31] * a[5] - b[ 1] * a[6] + b[15] * a[7] + b[18] * a[8] + b[20] * a[9] - b[21] * a[10] + b[ 0] * a[11] - b[44] * a[12] - b[46] * a[13] + b[47] * a[14] - b[ 7] * a[15] - b[49] * a[16] + b[50] * a[17] - b[ 8] * a[18] + b[51] * a[19] - b[ 9] * a[20] + b[10] * a[21] - b[34] * a[22] - b[36] * a[23] + b[37] * a[24] - b[ 2] * a[25] - b[39] * a[26] + b[40] * a[27] - b[ 3] * a[28] + b[41] * a[29] - b[ 4] * a[30] + b[ 5] * a[31] + b[58] * a[32] - b[59] * a[33] + b[22] * a[34] - b[60] * a[35] + b[23] * a[36] - b[24] * a[37] - b[61] * a[38] + b[26] * a[39] - b[27] * a[40] - b[29] * a[41] - b[53] * a[42] + b[54] * a[43] - b[12] * a[44] + b[55] * a[45] - b[13] * a[46] + b[14] * a[47] + b[56] * a[48] - b[16] * a[49] + b[17] * a[50] + b[19] * a[51] - b[63] * a[52] + b[42] * a[53] - b[43] * a[54] - b[45] * a[55] - b[48] * a[56] - b[62] * a[57] + b[32] * a[58] - b[33] * a[59] - b[35] * a[60] - b[38] * a[61] + b[57] * a[62] - b[52] * a[63];
    target[12] = b[12] * a[0] + b[22] * a[1] + b[ 3] * a[2] - b[ 2] * a[3] + b[32] * a[4] - b[33] * a[5] - b[34] * a[6] - b[ 8] * a[7] + b[ 7] * a[8] - b[42] * a[9] + b[43] * a[10] + b[44] * a[11] + b[ 0] * a[12] - b[16] * a[13] + b[17] * a[14] + b[18] * a[15] + b[13] * a[16] - b[14] * a[17] - b[15] * a[18] + b[52] * a[19] + b[53] * a[20] - b[54] * a[21] + b[ 1] * a[22] - b[26] * a[23] + b[27] * a[24] + b[28] * a[25] + b[23] * a[26] - b[24] * a[27] - b[25] * a[28] + b[57] * a[29] + b[58] * a[30] - b[59] * a[31] + b[ 4] * a[32] - b[ 5] * a[33] - b[ 6] * a[34] + b[38] * a[35] + b[39] * a[36] - b[40] * a[37] - b[35] * a[38] - b[36] * a[39] + b[37] * a[40] - b[62] * a[41] - b[ 9] * a[42] + b[10] * a[43] + b[11] * a[44] - b[48] * a[45] - b[49] * a[46] + b[50] * a[47] + b[45] * a[48] + b[46] * a[49] - b[47] * a[50] + b[63] * a[51] + b[19] * a[52] + b[20] * a[53] - b[21] * a[54] + b[56] * a[55] - b[55] * a[56] + b[29] * a[57] + b[30] * a[58] - b[31] * a[59] + b[61] * a[60] - b[60] * a[61] - b[41] * a[62] + b[51] * a[63];
    target[13] = b[13] * a[0] + b[23] * a[1] + b[ 4] * a[2] - b[32] * a[3] - b[ 2] * a[4] - b[35] * a[5] - b[36] * a[6] - b[ 9] * a[7] + b[42] * a[8] + b[ 7] * a[9] + b[45] * a[10] + b[46] * a[11] + b[16] * a[12] + b[ 0] * a[13] + b[19] * a[14] + b[20] * a[15] - b[12] * a[16] - b[52] * a[17] - b[53] * a[18] - b[14] * a[19] - b[15] * a[20] - b[55] * a[21] + b[26] * a[22] + b[ 1] * a[23] + b[29] * a[24] + b[30] * a[25] - b[22] * a[26] - b[57] * a[27] - b[58] * a[28] - b[24] * a[29] - b[25] * a[30] - b[60] * a[31] - b[ 3] * a[32] - b[38] * a[33] - b[39] * a[34] - b[ 5] * a[35] - b[ 6] * a[36] - b[41] * a[37] + b[33] * a[38] + b[34] * a[39] + b[62] * a[40] + b[37] * a[41] + b[ 8] * a[42] + b[48] * a[43] + b[49] * a[44] + b[10] * a[45] + b[11] * a[46] + b[51] * a[47] - b[43] * a[48] - b[44] * a[49] - b[63] * a[50] - b[47] * a[51] - b[17] * a[52] - b[18] * a[53] - b[56] * a[54] - b[21] * a[55] + b[54] * a[56] - b[27] * a[57] - b[28] * a[58] - b[61] * a[59] - b[31] * a[60] + b[59] * a[61] + b[40] * a[62] - b[50] * a[63];
    target[14] = b[14] * a[0] + b[24] * a[1] + b[ 5] * a[2] - b[33] * a[3] - b[35] * a[4] - b[ 2] * a[5] - b[37] * a[6] - b[10] * a[7] + b[43] * a[8] + b[45] * a[9] + b[ 7] * a[10] + b[47] * a[11] + b[17] * a[12] + b[19] * a[13] + b[ 0] * a[14] + b[21] * a[15] - b[52] * a[16] - b[12] * a[17] - b[54] * a[18] - b[13] * a[19] - b[55] * a[20] - b[15] * a[21] + b[27] * a[22] + b[29] * a[23] + b[ 1] * a[24] + b[31] * a[25] - b[57] * a[26] - b[22] * a[27] - b[59] * a[28] - b[23] * a[29] - b[60] * a[30] - b[25] * a[31] - b[38] * a[32] - b[ 3] * a[33] - b[40] * a[34] - b[ 4] * a[35] - b[41] * a[36] - b[ 6] * a[37] + b[32] * a[38] + b[62] * a[39] + b[34] * a[40] + b[36] * a[41] + b[48] * a[42] + b[ 8] * a[43] + b[50] * a[44] + b[ 9] * a[45] + b[51] * a[46] + b[11] * a[47] - b[42] * a[48] - b[63] * a[49] - b[44] * a[50] - b[46] * a[51] - b[16] * a[52] - b[56] * a[53] - b[18] * a[54] - b[20] * a[55] + b[53] * a[56] - b[26] * a[57] - b[61] * a[58] - b[28] * a[59] - b[30] * a[60] + b[58] * a[61] + b[39] * a[62] - b[49] * a[63];
    target[15] = b[15] * a[0] + b[25] * a[1] + b[ 6] * a[2] - b[34] * a[3] - b[36] * a[4] + b[37] * a[5] - b[ 2] * a[6] - b[11] * a[7] + b[44] * a[8] + b[46] * a[9] - b[47] * a[10] + b[ 7] * a[11] + b[18] * a[12] + b[20] * a[13] - b[21] * a[14] + b[ 0] * a[15] - b[53] * a[16] + b[54] * a[17] - b[12] * a[18] + b[55] * a[19] - b[13] * a[20] + b[14] * a[21] + b[28] * a[22] + b[30] * a[23] - b[31] * a[24] + b[ 1] * a[25] - b[58] * a[26] + b[59] * a[27] - b[22] * a[28] + b[60] * a[29] - b[23] * a[30] + b[24] * a[31] - b[39] * a[32] + b[40] * a[33] - b[ 3] * a[34] + b[41] * a[35] - b[ 4] * a[36] + b[ 5] * a[37] - b[62] * a[38] + b[32] * a[39] - b[33] * a[40] - b[35] * a[41] + b[49] * a[42] - b[50] * a[43] + b[ 8] * a[44] - b[51] * a[45] + b[ 9] * a[46] - b[10] * a[47] + b[63] * a[48] - b[42] * a[49] + b[43] * a[50] + b[45] * a[51] + b[56] * a[52] - b[16] * a[53] + b[17] * a[54] + b[19] * a[55] - b[52] * a[56] + b[61] * a[57] - b[26] * a[58] + b[27] * a[59] + b[29] * a[60] - b[57] * a[61] - b[38] * a[62] + b[48] * a[63];
    target[16] = b[16] * a[0] + b[26] * a[1] + b[32] * a[2] + b[ 4] * a[3] - b[ 3] * a[4] - b[38] * a[5] - b[39] * a[6] - b[42] * a[7] - b[ 9] * a[8] + b[ 8] * a[9] + b[48] * a[10] + b[49] * a[11] - b[13] * a[12] + b[12] * a[13] + b[52] * a[14] + b[53] * a[15] + b[ 0] * a[16] + b[19] * a[17] + b[20] * a[18] - b[17] * a[19] - b[18] * a[20] - b[56] * a[21] - b[23] * a[22] + b[22] * a[23] + b[57] * a[24] + b[58] * a[25] + b[ 1] * a[26] + b[29] * a[27] + b[30] * a[28] - b[27] * a[29] - b[28] * a[30] - b[61] * a[31] + b[ 2] * a[32] + b[35] * a[33] + b[36] * a[34] - b[33] * a[35] - b[34] * a[36] - b[62] * a[37] - b[ 5] * a[38] - b[ 6] * a[39] - b[41] * a[40] + b[40] * a[41] - b[ 7] * a[42] - b[45] * a[43] - b[46] * a[44] + b[43] * a[45] + b[44] * a[46] + b[63] * a[47] + b[10] * a[48] + b[11] * a[49] + b[51] * a[50] - b[50] * a[51] + b[14] * a[52] + b[15] * a[53] + b[55] * a[54] - b[54] * a[55] - b[21] * a[56] + b[24] * a[57] + b[25] * a[58] + b[60] * a[59] - b[59] * a[60] - b[31] * a[61] - b[37] * a[62] + b[47] * a[63];
    target[17] = b[17] * a[0] + b[27] * a[1] + b[33] * a[2] + b[ 5] * a[3] - b[38] * a[4] - b[ 3] * a[5] - b[40] * a[6] - b[43] * a[7] - b[10] * a[8] + b[48] * a[9] + b[ 8] * a[10] + b[50] * a[11] - b[14] * a[12] + b[52] * a[13] + b[12] * a[14] + b[54] * a[15] + b[19] * a[16] + b[ 0] * a[17] + b[21] * a[18] - b[16] * a[19] - b[56] * a[20] - b[18] * a[21] - b[24] * a[22] + b[57] * a[23] + b[22] * a[24] + b[59] * a[25] + b[29] * a[26] + b[ 1] * a[27] + b[31] * a[28] - b[26] * a[29] - b[61] * a[30] - b[28] * a[31] + b[35] * a[32] + b[ 2] * a[33] + b[37] * a[34] - b[32] * a[35] - b[62] * a[36] - b[34] * a[37] - b[ 4] * a[38] - b[41] * a[39] - b[ 6] * a[40] + b[39] * a[41] - b[45] * a[42] - b[ 7] * a[43] - b[47] * a[44] + b[42] * a[45] + b[63] * a[46] + b[44] * a[47] + b[ 9] * a[48] + b[51] * a[49] + b[11] * a[50] - b[49] * a[51] + b[13] * a[52] + b[55] * a[53] + b[15] * a[54] - b[53] * a[55] - b[20] * a[56] + b[23] * a[57] + b[60] * a[58] + b[25] * a[59] - b[58] * a[60] - b[30] * a[61] - b[36] * a[62] + b[46] * a[63];
    target[18] = b[18] * a[0] + b[28] * a[1] + b[34] * a[2] + b[ 6] * a[3] - b[39] * a[4] + b[40] * a[5] - b[ 3] * a[6] - b[44] * a[7] - b[11] * a[8] + b[49] * a[9] - b[50] * a[10] + b[ 8] * a[11] - b[15] * a[12] + b[53] * a[13] - b[54] * a[14] + b[12] * a[15] + b[20] * a[16] - b[21] * a[17] + b[ 0] * a[18] + b[56] * a[19] - b[16] * a[20] + b[17] * a[21] - b[25] * a[22] + b[58] * a[23] - b[59] * a[24] + b[22] * a[25] + b[30] * a[26] - b[31] * a[27] + b[ 1] * a[28] + b[61] * a[29] - b[26] * a[30] + b[27] * a[31] + b[36] * a[32] - b[37] * a[33] + b[ 2] * a[34] + b[62] * a[35] - b[32] * a[36] + b[33] * a[37] + b[41] * a[38] - b[ 4] * a[39] + b[ 5] * a[40] - b[38] * a[41] - b[46] * a[42] + b[47] * a[43] - b[ 7] * a[44] - b[63] * a[45] + b[42] * a[46] - b[43] * a[47] - b[51] * a[48] + b[ 9] * a[49] - b[10] * a[50] + b[48] * a[51] - b[55] * a[52] + b[13] * a[53] - b[14] * a[54] + b[52] * a[55] + b[19] * a[56] - b[60] * a[57] + b[23] * a[58] - b[24] * a[59] + b[57] * a[60] + b[29] * a[61] + b[35] * a[62] - b[45] * a[63];
    target[19] = b[19] * a[0] + b[29] * a[1] + b[35] * a[2] + b[38] * a[3] + b[ 5] * a[4] - b[ 4] * a[5] - b[41] * a[6] - b[45] * a[7] - b[48] * a[8] - b[10] * a[9] + b[ 9] * a[10] + b[51] * a[11] - b[52] * a[12] - b[14] * a[13] + b[13] * a[14] + b[55] * a[15] - b[17] * a[16] + b[16] * a[17] + b[56] * a[18] + b[ 0] * a[19] + b[21] * a[20] - b[20] * a[21] - b[57] * a[22] - b[24] * a[23] + b[23] * a[24] + b[60] * a[25] - b[27] * a[26] + b[26] * a[27] + b[61] * a[28] + b[ 1] * a[29] + b[31] * a[30] - b[30] * a[31] - b[33] * a[32] + b[32] * a[33] + b[62] * a[34] + b[ 2] * a[35] + b[37] * a[36] - b[36] * a[37] + b[ 3] * a[38] + b[40] * a[39] - b[39] * a[40] - b[ 6] * a[41] + b[43] * a[42] - b[42] * a[43] - b[63] * a[44] - b[ 7] * a[45] - b[47] * a[46] + b[46] * a[47] - b[ 8] * a[48] - b[50] * a[49] + b[49] * a[50] + b[11] * a[51] - b[12] * a[52] - b[54] * a[53] + b[53] * a[54] + b[15] * a[55] + b[18] * a[56] - b[22] * a[57] - b[59] * a[58] + b[58] * a[59] + b[25] * a[60] + b[28] * a[61] + b[34] * a[62] - b[44] * a[63];
    target[20] = b[20] * a[0] + b[30] * a[1] + b[36] * a[2] + b[39] * a[3] + b[ 6] * a[4] + b[41] * a[5] - b[ 4] * a[6] - b[46] * a[7] - b[49] * a[8] - b[11] * a[9] - b[51] * a[10] + b[ 9] * a[11] - b[53] * a[12] - b[15] * a[13] - b[55] * a[14] + b[13] * a[15] - b[18] * a[16] - b[56] * a[17] + b[16] * a[18] - b[21] * a[19] + b[ 0] * a[20] + b[19] * a[21] - b[58] * a[22] - b[25] * a[23] - b[60] * a[24] + b[23] * a[25] - b[28] * a[26] - b[61] * a[27] + b[26] * a[28] - b[31] * a[29] + b[ 1] * a[30] + b[29] * a[31] - b[34] * a[32] - b[62] * a[33] + b[32] * a[34] - b[37] * a[35] + b[ 2] * a[36] + b[35] * a[37] - b[40] * a[38] + b[ 3] * a[39] + b[38] * a[40] + b[ 5] * a[41] + b[44] * a[42] + b[63] * a[43] - b[42] * a[44] + b[47] * a[45] - b[ 7] * a[46] - b[45] * a[47] + b[50] * a[48] - b[ 8] * a[49] - b[48] * a[50] - b[10] * a[51] + b[54] * a[52] - b[12] * a[53] - b[52] * a[54] - b[14] * a[55] - b[17] * a[56] + b[59] * a[57] - b[22] * a[58] - b[57] * a[59] - b[24] * a[60] - b[27] * a[61] - b[33] * a[62] + b[43] * a[63];
    target[21] = b[21] * a[0] + b[31] * a[1] + b[37] * a[2] + b[40] * a[3] + b[41] * a[4] + b[ 6] * a[5] - b[ 5] * a[6] - b[47] * a[7] - b[50] * a[8] - b[51] * a[9] - b[11] * a[10] + b[10] * a[11] - b[54] * a[12] - b[55] * a[13] - b[15] * a[14] + b[14] * a[15] - b[56] * a[16] - b[18] * a[17] + b[17] * a[18] - b[20] * a[19] + b[19] * a[20] + b[ 0] * a[21] - b[59] * a[22] - b[60] * a[23] - b[25] * a[24] + b[24] * a[25] - b[61] * a[26] - b[28] * a[27] + b[27] * a[28] - b[30] * a[29] + b[29] * a[30] + b[ 1] * a[31] - b[62] * a[32] - b[34] * a[33] + b[33] * a[34] - b[36] * a[35] + b[35] * a[36] + b[ 2] * a[37] - b[39] * a[38] + b[38] * a[39] + b[ 3] * a[40] + b[ 4] * a[41] + b[63] * a[42] + b[44] * a[43] - b[43] * a[44] + b[46] * a[45] - b[45] * a[46] - b[ 7] * a[47] + b[49] * a[48] - b[48] * a[49] - b[ 8] * a[50] - b[ 9] * a[51] + b[53] * a[52] - b[52] * a[53] - b[12] * a[54] - b[13] * a[55] - b[16] * a[56] + b[58] * a[57] - b[57] * a[58] - b[22] * a[59] - b[23] * a[60] - b[26] * a[61] - b[32] * a[62] + b[42] * a[63];
    target[22] = b[22] * a[0] + b[12] * a[1] - b[ 8] * a[2] + b[ 7] * a[3] - b[42] * a[4] + b[43] * a[5] + b[44] * a[6] + b[ 3] * a[7] - b[ 2] * a[8] + b[32] * a[9] - b[33] * a[10] - b[34] * a[11] + b[ 1] * a[12] - b[26] * a[13] + b[27] * a[14] + b[28] * a[15] + b[23] * a[16] - b[24] * a[17] - b[25] * a[18] + b[57] * a[19] + b[58] * a[20] - b[59] * a[21] + b[ 0] * a[22] - b[16] * a[23] + b[17] * a[24] + b[18] * a[25] + b[13] * a[26] - b[14] * a[27] - b[15] * a[28] + b[52] * a[29] + b[53] * a[30] - b[54] * a[31] - b[ 9] * a[32] + b[10] * a[33] + b[11] * a[34] - b[48] * a[35] - b[49] * a[36] + b[50] * a[37] + b[45] * a[38] + b[46] * a[39] - b[47] * a[40] + b[63] * a[41] + b[ 4] * a[42] - b[ 5] * a[43] - b[ 6] * a[44] + b[38] * a[45] + b[39] * a[46] - b[40] * a[47] - b[35] * a[48] - b[36] * a[49] + b[37] * a[50] - b[62] * a[51] + b[29] * a[52] + b[30] * a[53] - b[31] * a[54] + b[61] * a[55] - b[60] * a[56] + b[19] * a[57] + b[20] * a[58] - b[21] * a[59] + b[56] * a[60] - b[55] * a[61] + b[51] * a[62] - b[41] * a[63];
    target[23] = b[23] * a[0] + b[13] * a[1] - b[ 9] * a[2] + b[42] * a[3] + b[ 7] * a[4] + b[45] * a[5] + b[46] * a[6] + b[ 4] * a[7] - b[32] * a[8] - b[ 2] * a[9] - b[35] * a[10] - b[36] * a[11] + b[26] * a[12] + b[ 1] * a[13] + b[29] * a[14] + b[30] * a[15] - b[22] * a[16] - b[57] * a[17] - b[58] * a[18] - b[24] * a[19] - b[25] * a[20] - b[60] * a[21] + b[16] * a[22] + b[ 0] * a[23] + b[19] * a[24] + b[20] * a[25] - b[12] * a[26] - b[52] * a[27] - b[53] * a[28] - b[14] * a[29] - b[15] * a[30] - b[55] * a[31] + b[ 8] * a[32] + b[48] * a[33] + b[49] * a[34] + b[10] * a[35] + b[11] * a[36] + b[51] * a[37] - b[43] * a[38] - b[44] * a[39] - b[63] * a[40] - b[47] * a[41] - b[ 3] * a[42] - b[38] * a[43] - b[39] * a[44] - b[ 5] * a[45] - b[ 6] * a[46] - b[41] * a[47] + b[33] * a[48] + b[34] * a[49] + b[62] * a[50] + b[37] * a[51] - b[27] * a[52] - b[28] * a[53] - b[61] * a[54] - b[31] * a[55] + b[59] * a[56] - b[17] * a[57] - b[18] * a[58] - b[56] * a[59] - b[21] * a[60] + b[54] * a[61] - b[50] * a[62] + b[40] * a[63];
    target[24] = b[24] * a[0] + b[14] * a[1] - b[10] * a[2] + b[43] * a[3] + b[45] * a[4] + b[ 7] * a[5] + b[47] * a[6] + b[ 5] * a[7] - b[33] * a[8] - b[35] * a[9] - b[ 2] * a[10] - b[37] * a[11] + b[27] * a[12] + b[29] * a[13] + b[ 1] * a[14] + b[31] * a[15] - b[57] * a[16] - b[22] * a[17] - b[59] * a[18] - b[23] * a[19] - b[60] * a[20] - b[25] * a[21] + b[17] * a[22] + b[19] * a[23] + b[ 0] * a[24] + b[21] * a[25] - b[52] * a[26] - b[12] * a[27] - b[54] * a[28] - b[13] * a[29] - b[55] * a[30] - b[15] * a[31] + b[48] * a[32] + b[ 8] * a[33] + b[50] * a[34] + b[ 9] * a[35] + b[51] * a[36] + b[11] * a[37] - b[42] * a[38] - b[63] * a[39] - b[44] * a[40] - b[46] * a[41] - b[38] * a[42] - b[ 3] * a[43] - b[40] * a[44] - b[ 4] * a[45] - b[41] * a[46] - b[ 6] * a[47] + b[32] * a[48] + b[62] * a[49] + b[34] * a[50] + b[36] * a[51] - b[26] * a[52] - b[61] * a[53] - b[28] * a[54] - b[30] * a[55] + b[58] * a[56] - b[16] * a[57] - b[56] * a[58] - b[18] * a[59] - b[20] * a[60] + b[53] * a[61] - b[49] * a[62] + b[39] * a[63];
    target[25] = b[25] * a[0] + b[15] * a[1] - b[11] * a[2] + b[44] * a[3] + b[46] * a[4] - b[47] * a[5] + b[ 7] * a[6] + b[ 6] * a[7] - b[34] * a[8] - b[36] * a[9] + b[37] * a[10] - b[ 2] * a[11] + b[28] * a[12] + b[30] * a[13] - b[31] * a[14] + b[ 1] * a[15] - b[58] * a[16] + b[59] * a[17] - b[22] * a[18] + b[60] * a[19] - b[23] * a[20] + b[24] * a[21] + b[18] * a[22] + b[20] * a[23] - b[21] * a[24] + b[ 0] * a[25] - b[53] * a[26] + b[54] * a[27] - b[12] * a[28] + b[55] * a[29] - b[13] * a[30] + b[14] * a[31] + b[49] * a[32] - b[50] * a[33] + b[ 8] * a[34] - b[51] * a[35] + b[ 9] * a[36] - b[10] * a[37] + b[63] * a[38] - b[42] * a[39] + b[43] * a[40] + b[45] * a[41] - b[39] * a[42] + b[40] * a[43] - b[ 3] * a[44] + b[41] * a[45] - b[ 4] * a[46] + b[ 5] * a[47] - b[62] * a[48] + b[32] * a[49] - b[33] * a[50] - b[35] * a[51] + b[61] * a[52] - b[26] * a[53] + b[27] * a[54] + b[29] * a[55] - b[57] * a[56] + b[56] * a[57] - b[16] * a[58] + b[17] * a[59] + b[19] * a[60] - b[52] * a[61] + b[48] * a[62] - b[38] * a[63];
    target[26] = b[26] * a[0] + b[16] * a[1] - b[42] * a[2] - b[ 9] * a[3] + b[ 8] * a[4] + b[48] * a[5] + b[49] * a[6] + b[32] * a[7] + b[ 4] * a[8] - b[ 3] * a[9] - b[38] * a[10] - b[39] * a[11] - b[23] * a[12] + b[22] * a[13] + b[57] * a[14] + b[58] * a[15] + b[ 1] * a[16] + b[29] * a[17] + b[30] * a[18] - b[27] * a[19] - b[28] * a[20] - b[61] * a[21] - b[13] * a[22] + b[12] * a[23] + b[52] * a[24] + b[53] * a[25] + b[ 0] * a[26] + b[19] * a[27] + b[20] * a[28] - b[17] * a[29] - b[18] * a[30] - b[56] * a[31] - b[ 7] * a[32] - b[45] * a[33] - b[46] * a[34] + b[43] * a[35] + b[44] * a[36] + b[63] * a[37] + b[10] * a[38] + b[11] * a[39] + b[51] * a[40] - b[50] * a[41] + b[ 2] * a[42] + b[35] * a[43] + b[36] * a[44] - b[33] * a[45] - b[34] * a[46] - b[62] * a[47] - b[ 5] * a[48] - b[ 6] * a[49] - b[41] * a[50] + b[40] * a[51] + b[24] * a[52] + b[25] * a[53] + b[60] * a[54] - b[59] * a[55] - b[31] * a[56] + b[14] * a[57] + b[15] * a[58] + b[55] * a[59] - b[54] * a[60] - b[21] * a[61] + b[47] * a[62] - b[37] * a[63];
    target[27] = b[27] * a[0] + b[17] * a[1] - b[43] * a[2] - b[10] * a[3] + b[48] * a[4] + b[ 8] * a[5] + b[50] * a[6] + b[33] * a[7] + b[ 5] * a[8] - b[38] * a[9] - b[ 3] * a[10] - b[40] * a[11] - b[24] * a[12] + b[57] * a[13] + b[22] * a[14] + b[59] * a[15] + b[29] * a[16] + b[ 1] * a[17] + b[31] * a[18] - b[26] * a[19] - b[61] * a[20] - b[28] * a[21] - b[14] * a[22] + b[52] * a[23] + b[12] * a[24] + b[54] * a[25] + b[19] * a[26] + b[ 0] * a[27] + b[21] * a[28] - b[16] * a[29] - b[56] * a[30] - b[18] * a[31] - b[45] * a[32] - b[ 7] * a[33] - b[47] * a[34] + b[42] * a[35] + b[63] * a[36] + b[44] * a[37] + b[ 9] * a[38] + b[51] * a[39] + b[11] * a[40] - b[49] * a[41] + b[35] * a[42] + b[ 2] * a[43] + b[37] * a[44] - b[32] * a[45] - b[62] * a[46] - b[34] * a[47] - b[ 4] * a[48] - b[41] * a[49] - b[ 6] * a[50] + b[39] * a[51] + b[23] * a[52] + b[60] * a[53] + b[25] * a[54] - b[58] * a[55] - b[30] * a[56] + b[13] * a[57] + b[55] * a[58] + b[15] * a[59] - b[53] * a[60] - b[20] * a[61] + b[46] * a[62] - b[36] * a[63];
    target[28] = b[28] * a[0] + b[18] * a[1] - b[44] * a[2] - b[11] * a[3] + b[49] * a[4] - b[50] * a[5] + b[ 8] * a[6] + b[34] * a[7] + b[ 6] * a[8] - b[39] * a[9] + b[40] * a[10] - b[ 3] * a[11] - b[25] * a[12] + b[58] * a[13] - b[59] * a[14] + b[22] * a[15] + b[30] * a[16] - b[31] * a[17] + b[ 1] * a[18] + b[61] * a[19] - b[26] * a[20] + b[27] * a[21] - b[15] * a[22] + b[53] * a[23] - b[54] * a[24] + b[12] * a[25] + b[20] * a[26] - b[21] * a[27] + b[ 0] * a[28] + b[56] * a[29] - b[16] * a[30] + b[17] * a[31] - b[46] * a[32] + b[47] * a[33] - b[ 7] * a[34] - b[63] * a[35] + b[42] * a[36] - b[43] * a[37] - b[51] * a[38] + b[ 9] * a[39] - b[10] * a[40] + b[48] * a[41] + b[36] * a[42] - b[37] * a[43] + b[ 2] * a[44] + b[62] * a[45] - b[32] * a[46] + b[33] * a[47] + b[41] * a[48] - b[ 4] * a[49] + b[ 5] * a[50] - b[38] * a[51] - b[60] * a[52] + b[23] * a[53] - b[24] * a[54] + b[57] * a[55] + b[29] * a[56] - b[55] * a[57] + b[13] * a[58] - b[14] * a[59] + b[52] * a[60] + b[19] * a[61] - b[45] * a[62] + b[35] * a[63];
    target[29] = b[29] * a[0] + b[19] * a[1] - b[45] * a[2] - b[48] * a[3] - b[10] * a[4] + b[ 9] * a[5] + b[51] * a[6] + b[35] * a[7] + b[38] * a[8] + b[ 5] * a[9] - b[ 4] * a[10] - b[41] * a[11] - b[57] * a[12] - b[24] * a[13] + b[23] * a[14] + b[60] * a[15] - b[27] * a[16] + b[26] * a[17] + b[61] * a[18] + b[ 1] * a[19] + b[31] * a[20] - b[30] * a[21] - b[52] * a[22] - b[14] * a[23] + b[13] * a[24] + b[55] * a[25] - b[17] * a[26] + b[16] * a[27] + b[56] * a[28] + b[ 0] * a[29] + b[21] * a[30] - b[20] * a[31] + b[43] * a[32] - b[42] * a[33] - b[63] * a[34] - b[ 7] * a[35] - b[47] * a[36] + b[46] * a[37] - b[ 8] * a[38] - b[50] * a[39] + b[49] * a[40] + b[11] * a[41] - b[33] * a[42] + b[32] * a[43] + b[62] * a[44] + b[ 2] * a[45] + b[37] * a[46] - b[36] * a[47] + b[ 3] * a[48] + b[40] * a[49] - b[39] * a[50] - b[ 6] * a[51] - b[22] * a[52] - b[59] * a[53] + b[58] * a[54] + b[25] * a[55] + b[28] * a[56] - b[12] * a[57] - b[54] * a[58] + b[53] * a[59] + b[15] * a[60] + b[18] * a[61] - b[44] * a[62] + b[34] * a[63];
    target[30] = b[30] * a[0] + b[20] * a[1] - b[46] * a[2] - b[49] * a[3] - b[11] * a[4] - b[51] * a[5] + b[ 9] * a[6] + b[36] * a[7] + b[39] * a[8] + b[ 6] * a[9] + b[41] * a[10] - b[ 4] * a[11] - b[58] * a[12] - b[25] * a[13] - b[60] * a[14] + b[23] * a[15] - b[28] * a[16] - b[61] * a[17] + b[26] * a[18] - b[31] * a[19] + b[ 1] * a[20] + b[29] * a[21] - b[53] * a[22] - b[15] * a[23] - b[55] * a[24] + b[13] * a[25] - b[18] * a[26] - b[56] * a[27] + b[16] * a[28] - b[21] * a[29] + b[ 0] * a[30] + b[19] * a[31] + b[44] * a[32] + b[63] * a[33] - b[42] * a[34] + b[47] * a[35] - b[ 7] * a[36] - b[45] * a[37] + b[50] * a[38] - b[ 8] * a[39] - b[48] * a[40] - b[10] * a[41] - b[34] * a[42] - b[62] * a[43] + b[32] * a[44] - b[37] * a[45] + b[ 2] * a[46] + b[35] * a[47] - b[40] * a[48] + b[ 3] * a[49] + b[38] * a[50] + b[ 5] * a[51] + b[59] * a[52] - b[22] * a[53] - b[57] * a[54] - b[24] * a[55] - b[27] * a[56] + b[54] * a[57] - b[12] * a[58] - b[52] * a[59] - b[14] * a[60] - b[17] * a[61] + b[43] * a[62] - b[33] * a[63];
    target[31] = b[31] * a[0] + b[21] * a[1] - b[47] * a[2] - b[50] * a[3] - b[51] * a[4] - b[11] * a[5] + b[10] * a[6] + b[37] * a[7] + b[40] * a[8] + b[41] * a[9] + b[ 6] * a[10] - b[ 5] * a[11] - b[59] * a[12] - b[60] * a[13] - b[25] * a[14] + b[24] * a[15] - b[61] * a[16] - b[28] * a[17] + b[27] * a[18] - b[30] * a[19] + b[29] * a[20] + b[ 1] * a[21] - b[54] * a[22] - b[55] * a[23] - b[15] * a[24] + b[14] * a[25] - b[56] * a[26] - b[18] * a[27] + b[17] * a[28] - b[20] * a[29] + b[19] * a[30] + b[ 0] * a[31] + b[63] * a[32] + b[44] * a[33] - b[43] * a[34] + b[46] * a[35] - b[45] * a[36] - b[ 7] * a[37] + b[49] * a[38] - b[48] * a[39] - b[ 8] * a[40] - b[ 9] * a[41] - b[62] * a[42] - b[34] * a[43] + b[33] * a[44] - b[36] * a[45] + b[35] * a[46] + b[ 2] * a[47] - b[39] * a[48] + b[38] * a[49] + b[ 3] * a[50] + b[ 4] * a[51] + b[58] * a[52] - b[57] * a[53] - b[22] * a[54] - b[23] * a[55] - b[26] * a[56] + b[53] * a[57] - b[52] * a[58] - b[12] * a[59] - b[13] * a[60] - b[16] * a[61] + b[42] * a[62] - b[32] * a[63];
    target[32] = b[32] * a[0] + b[42] * a[1] + b[16] * a[2] - b[13] * a[3] + b[12] * a[4] + b[52] * a[5] + b[53] * a[6] - b[26] * a[7] + b[23] * a[8] - b[22] * a[9] - b[57] * a[10] - b[58] * a[11] + b[ 4] * a[12] - b[ 3] * a[13] - b[38] * a[14] - b[39] * a[15] + b[ 2] * a[16] + b[35] * a[17] + b[36] * a[18] - b[33] * a[19] - b[34] * a[20] - b[62] * a[21] + b[ 9] * a[22] - b[ 8] * a[23] - b[48] * a[24] - b[49] * a[25] + b[ 7] * a[26] + b[45] * a[27] + b[46] * a[28] - b[43] * a[29] - b[44] * a[30] - b[63] * a[31] + b[ 0] * a[32] + b[19] * a[33] + b[20] * a[34] - b[17] * a[35] - b[18] * a[36] - b[56] * a[37] + b[14] * a[38] + b[15] * a[39] + b[55] * a[40] - b[54] * a[41] - b[ 1] * a[42] - b[29] * a[43] - b[30] * a[44] + b[27] * a[45] + b[28] * a[46] + b[61] * a[47] - b[24] * a[48] - b[25] * a[49] - b[60] * a[50] + b[59] * a[51] - b[ 5] * a[52] - b[ 6] * a[53] - b[41] * a[54] + b[40] * a[55] - b[37] * a[56] - b[10] * a[57] - b[11] * a[58] - b[51] * a[59] + b[50] * a[60] - b[47] * a[61] - b[21] * a[62] + b[31] * a[63];
    target[33] = b[33] * a[0] + b[43] * a[1] + b[17] * a[2] - b[14] * a[3] + b[52] * a[4] + b[12] * a[5] + b[54] * a[6] - b[27] * a[7] + b[24] * a[8] - b[57] * a[9] - b[22] * a[10] - b[59] * a[11] + b[ 5] * a[12] - b[38] * a[13] - b[ 3] * a[14] - b[40] * a[15] + b[35] * a[16] + b[ 2] * a[17] + b[37] * a[18] - b[32] * a[19] - b[62] * a[20] - b[34] * a[21] + b[10] * a[22] - b[48] * a[23] - b[ 8] * a[24] - b[50] * a[25] + b[45] * a[26] + b[ 7] * a[27] + b[47] * a[28] - b[42] * a[29] - b[63] * a[30] - b[44] * a[31] + b[19] * a[32] + b[ 0] * a[33] + b[21] * a[34] - b[16] * a[35] - b[56] * a[36] - b[18] * a[37] + b[13] * a[38] + b[55] * a[39] + b[15] * a[40] - b[53] * a[41] - b[29] * a[42] - b[ 1] * a[43] - b[31] * a[44] + b[26] * a[45] + b[61] * a[46] + b[28] * a[47] - b[23] * a[48] - b[60] * a[49] - b[25] * a[50] + b[58] * a[51] - b[ 4] * a[52] - b[41] * a[53] - b[ 6] * a[54] + b[39] * a[55] - b[36] * a[56] - b[ 9] * a[57] - b[51] * a[58] - b[11] * a[59] + b[49] * a[60] - b[46] * a[61] - b[20] * a[62] + b[30] * a[63];
    target[34] = b[34] * a[0] + b[44] * a[1] + b[18] * a[2] - b[15] * a[3] + b[53] * a[4] - b[54] * a[5] + b[12] * a[6] - b[28] * a[7] + b[25] * a[8] - b[58] * a[9] + b[59] * a[10] - b[22] * a[11] + b[ 6] * a[12] - b[39] * a[13] + b[40] * a[14] - b[ 3] * a[15] + b[36] * a[16] - b[37] * a[17] + b[ 2] * a[18] + b[62] * a[19] - b[32] * a[20] + b[33] * a[21] + b[11] * a[22] - b[49] * a[23] + b[50] * a[24] - b[ 8] * a[25] + b[46] * a[26] - b[47] * a[27] + b[ 7] * a[28] + b[63] * a[29] - b[42] * a[30] + b[43] * a[31] + b[20] * a[32] - b[21] * a[33] + b[ 0] * a[34] + b[56] * a[35] - b[16] * a[36] + b[17] * a[37] - b[55] * a[38] + b[13] * a[39] - b[14] * a[40] + b[52] * a[41] - b[30] * a[42] + b[31] * a[43] - b[ 1] * a[44] - b[61] * a[45] + b[26] * a[46] - b[27] * a[47] + b[60] * a[48] - b[23] * a[49] + b[24] * a[50] - b[57] * a[51] + b[41] * a[52] - b[ 4] * a[53] + b[ 5] * a[54] - b[38] * a[55] + b[35] * a[56] + b[51] * a[57] - b[ 9] * a[58] + b[10] * a[59] - b[48] * a[60] + b[45] * a[61] + b[19] * a[62] - b[29] * a[63];
    target[35] = b[35] * a[0] + b[45] * a[1] + b[19] * a[2] - b[52] * a[3] - b[14] * a[4] + b[13] * a[5] + b[55] * a[6] - b[29] * a[7] + b[57] * a[8] + b[24] * a[9] - b[23] * a[10] - b[60] * a[11] + b[38] * a[12] + b[ 5] * a[13] - b[ 4] * a[14] - b[41] * a[15] - b[33] * a[16] + b[32] * a[17] + b[62] * a[18] + b[ 2] * a[19] + b[37] * a[20] - b[36] * a[21] + b[48] * a[22] + b[10] * a[23] - b[ 9] * a[24] - b[51] * a[25] - b[43] * a[26] + b[42] * a[27] + b[63] * a[28] + b[ 7] * a[29] + b[47] * a[30] - b[46] * a[31] - b[17] * a[32] + b[16] * a[33] + b[56] * a[34] + b[ 0] * a[35] + b[21] * a[36] - b[20] * a[37] - b[12] * a[38] - b[54] * a[39] + b[53] * a[40] + b[15] * a[41] + b[27] * a[42] - b[26] * a[43] - b[61] * a[44] - b[ 1] * a[45] - b[31] * a[46] + b[30] * a[47] + b[22] * a[48] + b[59] * a[49] - b[58] * a[50] - b[25] * a[51] + b[ 3] * a[52] + b[40] * a[53] - b[39] * a[54] - b[ 6] * a[55] + b[34] * a[56] + b[ 8] * a[57] + b[50] * a[58] - b[49] * a[59] - b[11] * a[60] + b[44] * a[61] + b[18] * a[62] - b[28] * a[63];
    target[36] = b[36] * a[0] + b[46] * a[1] + b[20] * a[2] - b[53] * a[3] - b[15] * a[4] - b[55] * a[5] + b[13] * a[6] - b[30] * a[7] + b[58] * a[8] + b[25] * a[9] + b[60] * a[10] - b[23] * a[11] + b[39] * a[12] + b[ 6] * a[13] + b[41] * a[14] - b[ 4] * a[15] - b[34] * a[16] - b[62] * a[17] + b[32] * a[18] - b[37] * a[19] + b[ 2] * a[20] + b[35] * a[21] + b[49] * a[22] + b[11] * a[23] + b[51] * a[24] - b[ 9] * a[25] - b[44] * a[26] - b[63] * a[27] + b[42] * a[28] - b[47] * a[29] + b[ 7] * a[30] + b[45] * a[31] - b[18] * a[32] - b[56] * a[33] + b[16] * a[34] - b[21] * a[35] + b[ 0] * a[36] + b[19] * a[37] + b[54] * a[38] - b[12] * a[39] - b[52] * a[40] - b[14] * a[41] + b[28] * a[42] + b[61] * a[43] - b[26] * a[44] + b[31] * a[45] - b[ 1] * a[46] - b[29] * a[47] - b[59] * a[48] + b[22] * a[49] + b[57] * a[50] + b[24] * a[51] - b[40] * a[52] + b[ 3] * a[53] + b[38] * a[54] + b[ 5] * a[55] - b[33] * a[56] - b[50] * a[57] + b[ 8] * a[58] + b[48] * a[59] + b[10] * a[60] - b[43] * a[61] - b[17] * a[62] + b[27] * a[63];
    target[37] = b[37] * a[0] + b[47] * a[1] + b[21] * a[2] - b[54] * a[3] - b[55] * a[4] - b[15] * a[5] + b[14] * a[6] - b[31] * a[7] + b[59] * a[8] + b[60] * a[9] + b[25] * a[10] - b[24] * a[11] + b[40] * a[12] + b[41] * a[13] + b[ 6] * a[14] - b[ 5] * a[15] - b[62] * a[16] - b[34] * a[17] + b[33] * a[18] - b[36] * a[19] + b[35] * a[20] + b[ 2] * a[21] + b[50] * a[22] + b[51] * a[23] + b[11] * a[24] - b[10] * a[25] - b[63] * a[26] - b[44] * a[27] + b[43] * a[28] - b[46] * a[29] + b[45] * a[30] + b[ 7] * a[31] - b[56] * a[32] - b[18] * a[33] + b[17] * a[34] - b[20] * a[35] + b[19] * a[36] + b[ 0] * a[37] + b[53] * a[38] - b[52] * a[39] - b[12] * a[40] - b[13] * a[41] + b[61] * a[42] + b[28] * a[43] - b[27] * a[44] + b[30] * a[45] - b[29] * a[46] - b[ 1] * a[47] - b[58] * a[48] + b[57] * a[49] + b[22] * a[50] + b[23] * a[51] - b[39] * a[52] + b[38] * a[53] + b[ 3] * a[54] + b[ 4] * a[55] - b[32] * a[56] - b[49] * a[57] + b[48] * a[58] + b[ 8] * a[59] + b[ 9] * a[60] - b[42] * a[61] - b[16] * a[62] + b[26] * a[63];
    target[38] = b[38] * a[0] + b[48] * a[1] + b[52] * a[2] + b[19] * a[3] - b[17] * a[4] + b[16] * a[5] + b[56] * a[6] - b[57] * a[7] - b[29] * a[8] + b[27] * a[9] - b[26] * a[10] - b[61] * a[11] - b[35] * a[12] + b[33] * a[13] - b[32] * a[14] - b[62] * a[15] + b[ 5] * a[16] - b[ 4] * a[17] - b[41] * a[18] + b[ 3] * a[19] + b[40] * a[20] - b[39] * a[21] - b[45] * a[22] + b[43] * a[23] - b[42] * a[24] - b[63] * a[25] + b[10] * a[26] - b[ 9] * a[27] - b[51] * a[28] + b[ 8] * a[29] + b[50] * a[30] - b[49] * a[31] + b[14] * a[32] - b[13] * a[33] - b[55] * a[34] + b[12] * a[35] + b[54] * a[36] - b[53] * a[37] + b[ 0] * a[38] + b[21] * a[39] - b[20] * a[40] + b[18] * a[41] - b[24] * a[42] + b[23] * a[43] + b[60] * a[44] - b[22] * a[45] - b[59] * a[46] + b[58] * a[47] - b[ 1] * a[48] - b[31] * a[49] + b[30] * a[50] - b[28] * a[51] - b[ 2] * a[52] - b[37] * a[53] + b[36] * a[54] - b[34] * a[55] - b[ 6] * a[56] - b[ 7] * a[57] - b[47] * a[58] + b[46] * a[59] - b[44] * a[60] - b[11] * a[61] - b[15] * a[62] + b[25] * a[63];
    target[39] = b[39] * a[0] + b[49] * a[1] + b[53] * a[2] + b[20] * a[3] - b[18] * a[4] - b[56] * a[5] + b[16] * a[6] - b[58] * a[7] - b[30] * a[8] + b[28] * a[9] + b[61] * a[10] - b[26] * a[11] - b[36] * a[12] + b[34] * a[13] + b[62] * a[14] - b[32] * a[15] + b[ 6] * a[16] + b[41] * a[17] - b[ 4] * a[18] - b[40] * a[19] + b[ 3] * a[20] + b[38] * a[21] - b[46] * a[22] + b[44] * a[23] + b[63] * a[24] - b[42] * a[25] + b[11] * a[26] + b[51] * a[27] - b[ 9] * a[28] - b[50] * a[29] + b[ 8] * a[30] + b[48] * a[31] + b[15] * a[32] + b[55] * a[33] - b[13] * a[34] - b[54] * a[35] + b[12] * a[36] + b[52] * a[37] - b[21] * a[38] + b[ 0] * a[39] + b[19] * a[40] - b[17] * a[41] - b[25] * a[42] - b[60] * a[43] + b[23] * a[44] + b[59] * a[45] - b[22] * a[46] - b[57] * a[47] + b[31] * a[48] - b[ 1] * a[49] - b[29] * a[50] + b[27] * a[51] + b[37] * a[52] - b[ 2] * a[53] - b[35] * a[54] + b[33] * a[55] + b[ 5] * a[56] + b[47] * a[57] - b[ 7] * a[58] - b[45] * a[59] + b[43] * a[60] + b[10] * a[61] + b[14] * a[62] - b[24] * a[63];
    target[40] = b[40] * a[0] + b[50] * a[1] + b[54] * a[2] + b[21] * a[3] - b[56] * a[4] - b[18] * a[5] + b[17] * a[6] - b[59] * a[7] - b[31] * a[8] + b[61] * a[9] + b[28] * a[10] - b[27] * a[11] - b[37] * a[12] + b[62] * a[13] + b[34] * a[14] - b[33] * a[15] + b[41] * a[16] + b[ 6] * a[17] - b[ 5] * a[18] - b[39] * a[19] + b[38] * a[20] + b[ 3] * a[21] - b[47] * a[22] + b[63] * a[23] + b[44] * a[24] - b[43] * a[25] + b[51] * a[26] + b[11] * a[27] - b[10] * a[28] - b[49] * a[29] + b[48] * a[30] + b[ 8] * a[31] + b[55] * a[32] + b[15] * a[33] - b[14] * a[34] - b[53] * a[35] + b[52] * a[36] + b[12] * a[37] - b[20] * a[38] + b[19] * a[39] + b[ 0] * a[40] - b[16] * a[41] - b[60] * a[42] - b[25] * a[43] + b[24] * a[44] + b[58] * a[45] - b[57] * a[46] - b[22] * a[47] + b[30] * a[48] - b[29] * a[49] - b[ 1] * a[50] + b[26] * a[51] + b[36] * a[52] - b[35] * a[53] - b[ 2] * a[54] + b[32] * a[55] + b[ 4] * a[56] + b[46] * a[57] - b[45] * a[58] - b[ 7] * a[59] + b[42] * a[60] + b[ 9] * a[61] + b[13] * a[62] - b[23] * a[63];
    target[41] = b[41] * a[0] + b[51] * a[1] + b[55] * a[2] + b[56] * a[3] + b[21] * a[4] - b[20] * a[5] + b[19] * a[6] - b[60] * a[7] - b[61] * a[8] - b[31] * a[9] + b[30] * a[10] - b[29] * a[11] - b[62] * a[12] - b[37] * a[13] + b[36] * a[14] - b[35] * a[15] - b[40] * a[16] + b[39] * a[17] - b[38] * a[18] + b[ 6] * a[19] - b[ 5] * a[20] + b[ 4] * a[21] - b[63] * a[22] - b[47] * a[23] + b[46] * a[24] - b[45] * a[25] - b[50] * a[26] + b[49] * a[27] - b[48] * a[28] + b[11] * a[29] - b[10] * a[30] + b[ 9] * a[31] - b[54] * a[32] + b[53] * a[33] - b[52] * a[34] + b[15] * a[35] - b[14] * a[36] + b[13] * a[37] + b[18] * a[38] - b[17] * a[39] + b[16] * a[40] + b[ 0] * a[41] + b[59] * a[42] - b[58] * a[43] + b[57] * a[44] - b[25] * a[45] + b[24] * a[46] - b[23] * a[47] - b[28] * a[48] + b[27] * a[49] - b[26] * a[50] - b[ 1] * a[51] - b[34] * a[52] + b[33] * a[53] - b[32] * a[54] - b[ 2] * a[55] - b[ 3] * a[56] - b[44] * a[57] + b[43] * a[58] - b[42] * a[59] - b[ 7] * a[60] - b[ 8] * a[61] - b[12] * a[62] + b[22] * a[63];
    target[42] = b[42] * a[0] + b[32] * a[1] - b[26] * a[2] + b[23] * a[3] - b[22] * a[4] - b[57] * a[5] - b[58] * a[6] + b[16] * a[7] - b[13] * a[8] + b[12] * a[9] + b[52] * a[10] + b[53] * a[11] + b[ 9] * a[12] - b[ 8] * a[13] - b[48] * a[14] - b[49] * a[15] + b[ 7] * a[16] + b[45] * a[17] + b[46] * a[18] - b[43] * a[19] - b[44] * a[20] - b[63] * a[21] + b[ 4] * a[22] - b[ 3] * a[23] - b[38] * a[24] - b[39] * a[25] + b[ 2] * a[26] + b[35] * a[27] + b[36] * a[28] - b[33] * a[29] - b[34] * a[30] - b[62] * a[31] - b[ 1] * a[32] - b[29] * a[33] - b[30] * a[34] + b[27] * a[35] + b[28] * a[36] + b[61] * a[37] - b[24] * a[38] - b[25] * a[39] - b[60] * a[40] + b[59] * a[41] + b[ 0] * a[42] + b[19] * a[43] + b[20] * a[44] - b[17] * a[45] - b[18] * a[46] - b[56] * a[47] + b[14] * a[48] + b[15] * a[49] + b[55] * a[50] - b[54] * a[51] - b[10] * a[52] - b[11] * a[53] - b[51] * a[54] + b[50] * a[55] - b[47] * a[56] - b[ 5] * a[57] - b[ 6] * a[58] - b[41] * a[59] + b[40] * a[60] - b[37] * a[61] + b[31] * a[62] - b[21] * a[63];
    target[43] = b[43] * a[0] + b[33] * a[1] - b[27] * a[2] + b[24] * a[3] - b[57] * a[4] - b[22] * a[5] - b[59] * a[6] + b[17] * a[7] - b[14] * a[8] + b[52] * a[9] + b[12] * a[10] + b[54] * a[11] + b[10] * a[12] - b[48] * a[13] - b[ 8] * a[14] - b[50] * a[15] + b[45] * a[16] + b[ 7] * a[17] + b[47] * a[18] - b[42] * a[19] - b[63] * a[20] - b[44] * a[21] + b[ 5] * a[22] - b[38] * a[23] - b[ 3] * a[24] - b[40] * a[25] + b[35] * a[26] + b[ 2] * a[27] + b[37] * a[28] - b[32] * a[29] - b[62] * a[30] - b[34] * a[31] - b[29] * a[32] - b[ 1] * a[33] - b[31] * a[34] + b[26] * a[35] + b[61] * a[36] + b[28] * a[37] - b[23] * a[38] - b[60] * a[39] - b[25] * a[40] + b[58] * a[41] + b[19] * a[42] + b[ 0] * a[43] + b[21] * a[44] - b[16] * a[45] - b[56] * a[46] - b[18] * a[47] + b[13] * a[48] + b[55] * a[49] + b[15] * a[50] - b[53] * a[51] - b[ 9] * a[52] - b[51] * a[53] - b[11] * a[54] + b[49] * a[55] - b[46] * a[56] - b[ 4] * a[57] - b[41] * a[58] - b[ 6] * a[59] + b[39] * a[60] - b[36] * a[61] + b[30] * a[62] - b[20] * a[63];
    target[44] = b[44] * a[0] + b[34] * a[1] - b[28] * a[2] + b[25] * a[3] - b[58] * a[4] + b[59] * a[5] - b[22] * a[6] + b[18] * a[7] - b[15] * a[8] + b[53] * a[9] - b[54] * a[10] + b[12] * a[11] + b[11] * a[12] - b[49] * a[13] + b[50] * a[14] - b[ 8] * a[15] + b[46] * a[16] - b[47] * a[17] + b[ 7] * a[18] + b[63] * a[19] - b[42] * a[20] + b[43] * a[21] + b[ 6] * a[22] - b[39] * a[23] + b[40] * a[24] - b[ 3] * a[25] + b[36] * a[26] - b[37] * a[27] + b[ 2] * a[28] + b[62] * a[29] - b[32] * a[30] + b[33] * a[31] - b[30] * a[32] + b[31] * a[33] - b[ 1] * a[34] - b[61] * a[35] + b[26] * a[36] - b[27] * a[37] + b[60] * a[38] - b[23] * a[39] + b[24] * a[40] - b[57] * a[41] + b[20] * a[42] - b[21] * a[43] + b[ 0] * a[44] + b[56] * a[45] - b[16] * a[46] + b[17] * a[47] - b[55] * a[48] + b[13] * a[49] - b[14] * a[50] + b[52] * a[51] + b[51] * a[52] - b[ 9] * a[53] + b[10] * a[54] - b[48] * a[55] + b[45] * a[56] + b[41] * a[57] - b[ 4] * a[58] + b[ 5] * a[59] - b[38] * a[60] + b[35] * a[61] - b[29] * a[62] + b[19] * a[63];
    target[45] = b[45] * a[0] + b[35] * a[1] - b[29] * a[2] + b[57] * a[3] + b[24] * a[4] - b[23] * a[5] - b[60] * a[6] + b[19] * a[7] - b[52] * a[8] - b[14] * a[9] + b[13] * a[10] + b[55] * a[11] + b[48] * a[12] + b[10] * a[13] - b[ 9] * a[14] - b[51] * a[15] - b[43] * a[16] + b[42] * a[17] + b[63] * a[18] + b[ 7] * a[19] + b[47] * a[20] - b[46] * a[21] + b[38] * a[22] + b[ 5] * a[23] - b[ 4] * a[24] - b[41] * a[25] - b[33] * a[26] + b[32] * a[27] + b[62] * a[28] + b[ 2] * a[29] + b[37] * a[30] - b[36] * a[31] + b[27] * a[32] - b[26] * a[33] - b[61] * a[34] - b[ 1] * a[35] - b[31] * a[36] + b[30] * a[37] + b[22] * a[38] + b[59] * a[39] - b[58] * a[40] - b[25] * a[41] - b[17] * a[42] + b[16] * a[43] + b[56] * a[44] + b[ 0] * a[45] + b[21] * a[46] - b[20] * a[47] - b[12] * a[48] - b[54] * a[49] + b[53] * a[50] + b[15] * a[51] + b[ 8] * a[52] + b[50] * a[53] - b[49] * a[54] - b[11] * a[55] + b[44] * a[56] + b[ 3] * a[57] + b[40] * a[58] - b[39] * a[59] - b[ 6] * a[60] + b[34] * a[61] - b[28] * a[62] + b[18] * a[63];
    target[46] = b[46] * a[0] + b[36] * a[1] - b[30] * a[2] + b[58] * a[3] + b[25] * a[4] + b[60] * a[5] - b[23] * a[6] + b[20] * a[7] - b[53] * a[8] - b[15] * a[9] - b[55] * a[10] + b[13] * a[11] + b[49] * a[12] + b[11] * a[13] + b[51] * a[14] - b[ 9] * a[15] - b[44] * a[16] - b[63] * a[17] + b[42] * a[18] - b[47] * a[19] + b[ 7] * a[20] + b[45] * a[21] + b[39] * a[22] + b[ 6] * a[23] + b[41] * a[24] - b[ 4] * a[25] - b[34] * a[26] - b[62] * a[27] + b[32] * a[28] - b[37] * a[29] + b[ 2] * a[30] + b[35] * a[31] + b[28] * a[32] + b[61] * a[33] - b[26] * a[34] + b[31] * a[35] - b[ 1] * a[36] - b[29] * a[37] - b[59] * a[38] + b[22] * a[39] + b[57] * a[40] + b[24] * a[41] - b[18] * a[42] - b[56] * a[43] + b[16] * a[44] - b[21] * a[45] + b[ 0] * a[46] + b[19] * a[47] + b[54] * a[48] - b[12] * a[49] - b[52] * a[50] - b[14] * a[51] - b[50] * a[52] + b[ 8] * a[53] + b[48] * a[54] + b[10] * a[55] - b[43] * a[56] - b[40] * a[57] + b[ 3] * a[58] + b[38] * a[59] + b[ 5] * a[60] - b[33] * a[61] + b[27] * a[62] - b[17] * a[63];
    target[47] = b[47] * a[0] + b[37] * a[1] - b[31] * a[2] + b[59] * a[3] + b[60] * a[4] + b[25] * a[5] - b[24] * a[6] + b[21] * a[7] - b[54] * a[8] - b[55] * a[9] - b[15] * a[10] + b[14] * a[11] + b[50] * a[12] + b[51] * a[13] + b[11] * a[14] - b[10] * a[15] - b[63] * a[16] - b[44] * a[17] + b[43] * a[18] - b[46] * a[19] + b[45] * a[20] + b[ 7] * a[21] + b[40] * a[22] + b[41] * a[23] + b[ 6] * a[24] - b[ 5] * a[25] - b[62] * a[26] - b[34] * a[27] + b[33] * a[28] - b[36] * a[29] + b[35] * a[30] + b[ 2] * a[31] + b[61] * a[32] + b[28] * a[33] - b[27] * a[34] + b[30] * a[35] - b[29] * a[36] - b[ 1] * a[37] - b[58] * a[38] + b[57] * a[39] + b[22] * a[40] + b[23] * a[41] - b[56] * a[42] - b[18] * a[43] + b[17] * a[44] - b[20] * a[45] + b[19] * a[46] + b[ 0] * a[47] + b[53] * a[48] - b[52] * a[49] - b[12] * a[50] - b[13] * a[51] - b[49] * a[52] + b[48] * a[53] + b[ 8] * a[54] + b[ 9] * a[55] - b[42] * a[56] - b[39] * a[57] + b[38] * a[58] + b[ 3] * a[59] + b[ 4] * a[60] - b[32] * a[61] + b[26] * a[62] - b[16] * a[63];
    target[48] = b[48] * a[0] + b[38] * a[1] - b[57] * a[2] - b[29] * a[3] + b[27] * a[4] - b[26] * a[5] - b[61] * a[6] + b[52] * a[7] + b[19] * a[8] - b[17] * a[9] + b[16] * a[10] + b[56] * a[11] - b[45] * a[12] + b[43] * a[13] - b[42] * a[14] - b[63] * a[15] + b[10] * a[16] - b[ 9] * a[17] - b[51] * a[18] + b[ 8] * a[19] + b[50] * a[20] - b[49] * a[21] - b[35] * a[22] + b[33] * a[23] - b[32] * a[24] - b[62] * a[25] + b[ 5] * a[26] - b[ 4] * a[27] - b[41] * a[28] + b[ 3] * a[29] + b[40] * a[30] - b[39] * a[31] - b[24] * a[32] + b[23] * a[33] + b[60] * a[34] - b[22] * a[35] - b[59] * a[36] + b[58] * a[37] - b[ 1] * a[38] - b[31] * a[39] + b[30] * a[40] - b[28] * a[41] + b[14] * a[42] - b[13] * a[43] - b[55] * a[44] + b[12] * a[45] + b[54] * a[46] - b[53] * a[47] + b[ 0] * a[48] + b[21] * a[49] - b[20] * a[50] + b[18] * a[51] - b[ 7] * a[52] - b[47] * a[53] + b[46] * a[54] - b[44] * a[55] - b[11] * a[56] - b[ 2] * a[57] - b[37] * a[58] + b[36] * a[59] - b[34] * a[60] - b[ 6] * a[61] + b[25] * a[62] - b[15] * a[63];
    target[49] = b[49] * a[0] + b[39] * a[1] - b[58] * a[2] - b[30] * a[3] + b[28] * a[4] + b[61] * a[5] - b[26] * a[6] + b[53] * a[7] + b[20] * a[8] - b[18] * a[9] - b[56] * a[10] + b[16] * a[11] - b[46] * a[12] + b[44] * a[13] + b[63] * a[14] - b[42] * a[15] + b[11] * a[16] + b[51] * a[17] - b[ 9] * a[18] - b[50] * a[19] + b[ 8] * a[20] + b[48] * a[21] - b[36] * a[22] + b[34] * a[23] + b[62] * a[24] - b[32] * a[25] + b[ 6] * a[26] + b[41] * a[27] - b[ 4] * a[28] - b[40] * a[29] + b[ 3] * a[30] + b[38] * a[31] - b[25] * a[32] - b[60] * a[33] + b[23] * a[34] + b[59] * a[35] - b[22] * a[36] - b[57] * a[37] + b[31] * a[38] - b[ 1] * a[39] - b[29] * a[40] + b[27] * a[41] + b[15] * a[42] + b[55] * a[43] - b[13] * a[44] - b[54] * a[45] + b[12] * a[46] + b[52] * a[47] - b[21] * a[48] + b[ 0] * a[49] + b[19] * a[50] - b[17] * a[51] + b[47] * a[52] - b[ 7] * a[53] - b[45] * a[54] + b[43] * a[55] + b[10] * a[56] + b[37] * a[57] - b[ 2] * a[58] - b[35] * a[59] + b[33] * a[60] + b[ 5] * a[61] - b[24] * a[62] + b[14] * a[63];
    target[50] = b[50] * a[0] + b[40] * a[1] - b[59] * a[2] - b[31] * a[3] + b[61] * a[4] + b[28] * a[5] - b[27] * a[6] + b[54] * a[7] + b[21] * a[8] - b[56] * a[9] - b[18] * a[10] + b[17] * a[11] - b[47] * a[12] + b[63] * a[13] + b[44] * a[14] - b[43] * a[15] + b[51] * a[16] + b[11] * a[17] - b[10] * a[18] - b[49] * a[19] + b[48] * a[20] + b[ 8] * a[21] - b[37] * a[22] + b[62] * a[23] + b[34] * a[24] - b[33] * a[25] + b[41] * a[26] + b[ 6] * a[27] - b[ 5] * a[28] - b[39] * a[29] + b[38] * a[30] + b[ 3] * a[31] - b[60] * a[32] - b[25] * a[33] + b[24] * a[34] + b[58] * a[35] - b[57] * a[36] - b[22] * a[37] + b[30] * a[38] - b[29] * a[39] - b[ 1] * a[40] + b[26] * a[41] + b[55] * a[42] + b[15] * a[43] - b[14] * a[44] - b[53] * a[45] + b[52] * a[46] + b[12] * a[47] - b[20] * a[48] + b[19] * a[49] + b[ 0] * a[50] - b[16] * a[51] + b[46] * a[52] - b[45] * a[53] - b[ 7] * a[54] + b[42] * a[55] + b[ 9] * a[56] + b[36] * a[57] - b[35] * a[58] - b[ 2] * a[59] + b[32] * a[60] + b[ 4] * a[61] - b[23] * a[62] + b[13] * a[63];
    target[51] = b[51] * a[0] + b[41] * a[1] - b[60] * a[2] - b[61] * a[3] - b[31] * a[4] + b[30] * a[5] - b[29] * a[6] + b[55] * a[7] + b[56] * a[8] + b[21] * a[9] - b[20] * a[10] + b[19] * a[11] - b[63] * a[12] - b[47] * a[13] + b[46] * a[14] - b[45] * a[15] - b[50] * a[16] + b[49] * a[17] - b[48] * a[18] + b[11] * a[19] - b[10] * a[20] + b[ 9] * a[21] - b[62] * a[22] - b[37] * a[23] + b[36] * a[24] - b[35] * a[25] - b[40] * a[26] + b[39] * a[27] - b[38] * a[28] + b[ 6] * a[29] - b[ 5] * a[30] + b[ 4] * a[31] + b[59] * a[32] - b[58] * a[33] + b[57] * a[34] - b[25] * a[35] + b[24] * a[36] - b[23] * a[37] - b[28] * a[38] + b[27] * a[39] - b[26] * a[40] - b[ 1] * a[41] - b[54] * a[42] + b[53] * a[43] - b[52] * a[44] + b[15] * a[45] - b[14] * a[46] + b[13] * a[47] + b[18] * a[48] - b[17] * a[49] + b[16] * a[50] + b[ 0] * a[51] - b[44] * a[52] + b[43] * a[53] - b[42] * a[54] - b[ 7] * a[55] - b[ 8] * a[56] - b[34] * a[57] + b[33] * a[58] - b[32] * a[59] - b[ 2] * a[60] - b[ 3] * a[61] + b[22] * a[62] - b[12] * a[63];
    target[52] = b[52] * a[0] + b[57] * a[1] + b[38] * a[2] - b[35] * a[3] + b[33] * a[4] - b[32] * a[5] - b[62] * a[6] - b[48] * a[7] + b[45] * a[8] - b[43] * a[9] + b[42] * a[10] + b[63] * a[11] + b[19] * a[12] - b[17] * a[13] + b[16] * a[14] + b[56] * a[15] + b[14] * a[16] - b[13] * a[17] - b[55] * a[18] + b[12] * a[19] + b[54] * a[20] - b[53] * a[21] + b[29] * a[22] - b[27] * a[23] + b[26] * a[24] + b[61] * a[25] + b[24] * a[26] - b[23] * a[27] - b[60] * a[28] + b[22] * a[29] + b[59] * a[30] - b[58] * a[31] + b[ 5] * a[32] - b[ 4] * a[33] - b[41] * a[34] + b[ 3] * a[35] + b[40] * a[36] - b[39] * a[37] - b[ 2] * a[38] - b[37] * a[39] + b[36] * a[40] - b[34] * a[41] - b[10] * a[42] + b[ 9] * a[43] + b[51] * a[44] - b[ 8] * a[45] - b[50] * a[46] + b[49] * a[47] + b[ 7] * a[48] + b[47] * a[49] - b[46] * a[50] + b[44] * a[51] + b[ 0] * a[52] + b[21] * a[53] - b[20] * a[54] + b[18] * a[55] - b[15] * a[56] + b[ 1] * a[57] + b[31] * a[58] - b[30] * a[59] + b[28] * a[60] - b[25] * a[61] - b[ 6] * a[62] + b[11] * a[63];
    target[53] = b[53] * a[0] + b[58] * a[1] + b[39] * a[2] - b[36] * a[3] + b[34] * a[4] + b[62] * a[5] - b[32] * a[6] - b[49] * a[7] + b[46] * a[8] - b[44] * a[9] - b[63] * a[10] + b[42] * a[11] + b[20] * a[12] - b[18] * a[13] - b[56] * a[14] + b[16] * a[15] + b[15] * a[16] + b[55] * a[17] - b[13] * a[18] - b[54] * a[19] + b[12] * a[20] + b[52] * a[21] + b[30] * a[22] - b[28] * a[23] - b[61] * a[24] + b[26] * a[25] + b[25] * a[26] + b[60] * a[27] - b[23] * a[28] - b[59] * a[29] + b[22] * a[30] + b[57] * a[31] + b[ 6] * a[32] + b[41] * a[33] - b[ 4] * a[34] - b[40] * a[35] + b[ 3] * a[36] + b[38] * a[37] + b[37] * a[38] - b[ 2] * a[39] - b[35] * a[40] + b[33] * a[41] - b[11] * a[42] - b[51] * a[43] + b[ 9] * a[44] + b[50] * a[45] - b[ 8] * a[46] - b[48] * a[47] - b[47] * a[48] + b[ 7] * a[49] + b[45] * a[50] - b[43] * a[51] - b[21] * a[52] + b[ 0] * a[53] + b[19] * a[54] - b[17] * a[55] + b[14] * a[56] - b[31] * a[57] + b[ 1] * a[58] + b[29] * a[59] - b[27] * a[60] + b[24] * a[61] + b[ 5] * a[62] - b[10] * a[63];
    target[54] = b[54] * a[0] + b[59] * a[1] + b[40] * a[2] - b[37] * a[3] + b[62] * a[4] + b[34] * a[5] - b[33] * a[6] - b[50] * a[7] + b[47] * a[8] - b[63] * a[9] - b[44] * a[10] + b[43] * a[11] + b[21] * a[12] - b[56] * a[13] - b[18] * a[14] + b[17] * a[15] + b[55] * a[16] + b[15] * a[17] - b[14] * a[18] - b[53] * a[19] + b[52] * a[20] + b[12] * a[21] + b[31] * a[22] - b[61] * a[23] - b[28] * a[24] + b[27] * a[25] + b[60] * a[26] + b[25] * a[27] - b[24] * a[28] - b[58] * a[29] + b[57] * a[30] + b[22] * a[31] + b[41] * a[32] + b[ 6] * a[33] - b[ 5] * a[34] - b[39] * a[35] + b[38] * a[36] + b[ 3] * a[37] + b[36] * a[38] - b[35] * a[39] - b[ 2] * a[40] + b[32] * a[41] - b[51] * a[42] - b[11] * a[43] + b[10] * a[44] + b[49] * a[45] - b[48] * a[46] - b[ 8] * a[47] - b[46] * a[48] + b[45] * a[49] + b[ 7] * a[50] - b[42] * a[51] - b[20] * a[52] + b[19] * a[53] + b[ 0] * a[54] - b[16] * a[55] + b[13] * a[56] - b[30] * a[57] + b[29] * a[58] + b[ 1] * a[59] - b[26] * a[60] + b[23] * a[61] + b[ 4] * a[62] - b[ 9] * a[63];
    target[55] = b[55] * a[0] + b[60] * a[1] + b[41] * a[2] - b[62] * a[3] - b[37] * a[4] + b[36] * a[5] - b[35] * a[6] - b[51] * a[7] + b[63] * a[8] + b[47] * a[9] - b[46] * a[10] + b[45] * a[11] + b[56] * a[12] + b[21] * a[13] - b[20] * a[14] + b[19] * a[15] - b[54] * a[16] + b[53] * a[17] - b[52] * a[18] + b[15] * a[19] - b[14] * a[20] + b[13] * a[21] + b[61] * a[22] + b[31] * a[23] - b[30] * a[24] + b[29] * a[25] - b[59] * a[26] + b[58] * a[27] - b[57] * a[28] + b[25] * a[29] - b[24] * a[30] + b[23] * a[31] - b[40] * a[32] + b[39] * a[33] - b[38] * a[34] + b[ 6] * a[35] - b[ 5] * a[36] + b[ 4] * a[37] - b[34] * a[38] + b[33] * a[39] - b[32] * a[40] - b[ 2] * a[41] + b[50] * a[42] - b[49] * a[43] + b[48] * a[44] - b[11] * a[45] + b[10] * a[46] - b[ 9] * a[47] + b[44] * a[48] - b[43] * a[49] + b[42] * a[50] + b[ 7] * a[51] + b[18] * a[52] - b[17] * a[53] + b[16] * a[54] + b[ 0] * a[55] - b[12] * a[56] + b[28] * a[57] - b[27] * a[58] + b[26] * a[59] + b[ 1] * a[60] - b[22] * a[61] - b[ 3] * a[62] + b[ 8] * a[63];
    target[56] = b[56] * a[0] + b[61] * a[1] + b[62] * a[2] + b[41] * a[3] - b[40] * a[4] + b[39] * a[5] - b[38] * a[6] - b[63] * a[7] - b[51] * a[8] + b[50] * a[9] - b[49] * a[10] + b[48] * a[11] - b[55] * a[12] + b[54] * a[13] - b[53] * a[14] + b[52] * a[15] + b[21] * a[16] - b[20] * a[17] + b[19] * a[18] + b[18] * a[19] - b[17] * a[20] + b[16] * a[21] - b[60] * a[22] + b[59] * a[23] - b[58] * a[24] + b[57] * a[25] + b[31] * a[26] - b[30] * a[27] + b[29] * a[28] + b[28] * a[29] - b[27] * a[30] + b[26] * a[31] + b[37] * a[32] - b[36] * a[33] + b[35] * a[34] + b[34] * a[35] - b[33] * a[36] + b[32] * a[37] + b[ 6] * a[38] - b[ 5] * a[39] + b[ 4] * a[40] - b[ 3] * a[41] - b[47] * a[42] + b[46] * a[43] - b[45] * a[44] - b[44] * a[45] + b[43] * a[46] - b[42] * a[47] - b[11] * a[48] + b[10] * a[49] - b[ 9] * a[50] + b[ 8] * a[51] - b[15] * a[52] + b[14] * a[53] - b[13] * a[54] + b[12] * a[55] + b[ 0] * a[56] - b[25] * a[57] + b[24] * a[58] - b[23] * a[59] + b[22] * a[60] + b[ 1] * a[61] + b[ 2] * a[62] - b[ 7] * a[63];
    target[57] = b[57] * a[0] + b[52] * a[1] - b[48] * a[2] + b[45] * a[3] - b[43] * a[4] + b[42] * a[5] + b[63] * a[6] + b[38] * a[7] - b[35] * a[8] + b[33] * a[9] - b[32] * a[10] - b[62] * a[11] + b[29] * a[12] - b[27] * a[13] + b[26] * a[14] + b[61] * a[15] + b[24] * a[16] - b[23] * a[17] - b[60] * a[18] + b[22] * a[19] + b[59] * a[20] - b[58] * a[21] + b[19] * a[22] - b[17] * a[23] + b[16] * a[24] + b[56] * a[25] + b[14] * a[26] - b[13] * a[27] - b[55] * a[28] + b[12] * a[29] + b[54] * a[30] - b[53] * a[31] - b[10] * a[32] + b[ 9] * a[33] + b[51] * a[34] - b[ 8] * a[35] - b[50] * a[36] + b[49] * a[37] + b[ 7] * a[38] + b[47] * a[39] - b[46] * a[40] + b[44] * a[41] + b[ 5] * a[42] - b[ 4] * a[43] - b[41] * a[44] + b[ 3] * a[45] + b[40] * a[46] - b[39] * a[47] - b[ 2] * a[48] - b[37] * a[49] + b[36] * a[50] - b[34] * a[51] + b[ 1] * a[52] + b[31] * a[53] - b[30] * a[54] + b[28] * a[55] - b[25] * a[56] + b[ 0] * a[57] + b[21] * a[58] - b[20] * a[59] + b[18] * a[60] - b[15] * a[61] + b[11] * a[62] - b[ 6] * a[63];
    target[58] = b[58] * a[0] + b[53] * a[1] - b[49] * a[2] + b[46] * a[3] - b[44] * a[4] - b[63] * a[5] + b[42] * a[6] + b[39] * a[7] - b[36] * a[8] + b[34] * a[9] + b[62] * a[10] - b[32] * a[11] + b[30] * a[12] - b[28] * a[13] - b[61] * a[14] + b[26] * a[15] + b[25] * a[16] + b[60] * a[17] - b[23] * a[18] - b[59] * a[19] + b[22] * a[20] + b[57] * a[21] + b[20] * a[22] - b[18] * a[23] - b[56] * a[24] + b[16] * a[25] + b[15] * a[26] + b[55] * a[27] - b[13] * a[28] - b[54] * a[29] + b[12] * a[30] + b[52] * a[31] - b[11] * a[32] - b[51] * a[33] + b[ 9] * a[34] + b[50] * a[35] - b[ 8] * a[36] - b[48] * a[37] - b[47] * a[38] + b[ 7] * a[39] + b[45] * a[40] - b[43] * a[41] + b[ 6] * a[42] + b[41] * a[43] - b[ 4] * a[44] - b[40] * a[45] + b[ 3] * a[46] + b[38] * a[47] + b[37] * a[48] - b[ 2] * a[49] - b[35] * a[50] + b[33] * a[51] - b[31] * a[52] + b[ 1] * a[53] + b[29] * a[54] - b[27] * a[55] + b[24] * a[56] - b[21] * a[57] + b[ 0] * a[58] + b[19] * a[59] - b[17] * a[60] + b[14] * a[61] - b[10] * a[62] + b[ 5] * a[63];
    target[59] = b[59] * a[0] + b[54] * a[1] - b[50] * a[2] + b[47] * a[3] - b[63] * a[4] - b[44] * a[5] + b[43] * a[6] + b[40] * a[7] - b[37] * a[8] + b[62] * a[9] + b[34] * a[10] - b[33] * a[11] + b[31] * a[12] - b[61] * a[13] - b[28] * a[14] + b[27] * a[15] + b[60] * a[16] + b[25] * a[17] - b[24] * a[18] - b[58] * a[19] + b[57] * a[20] + b[22] * a[21] + b[21] * a[22] - b[56] * a[23] - b[18] * a[24] + b[17] * a[25] + b[55] * a[26] + b[15] * a[27] - b[14] * a[28] - b[53] * a[29] + b[52] * a[30] + b[12] * a[31] - b[51] * a[32] - b[11] * a[33] + b[10] * a[34] + b[49] * a[35] - b[48] * a[36] - b[ 8] * a[37] - b[46] * a[38] + b[45] * a[39] + b[ 7] * a[40] - b[42] * a[41] + b[41] * a[42] + b[ 6] * a[43] - b[ 5] * a[44] - b[39] * a[45] + b[38] * a[46] + b[ 3] * a[47] + b[36] * a[48] - b[35] * a[49] - b[ 2] * a[50] + b[32] * a[51] - b[30] * a[52] + b[29] * a[53] + b[ 1] * a[54] - b[26] * a[55] + b[23] * a[56] - b[20] * a[57] + b[19] * a[58] + b[ 0] * a[59] - b[16] * a[60] + b[13] * a[61] - b[ 9] * a[62] + b[ 4] * a[63];
    target[60] = b[60] * a[0] + b[55] * a[1] - b[51] * a[2] + b[63] * a[3] + b[47] * a[4] - b[46] * a[5] + b[45] * a[6] + b[41] * a[7] - b[62] * a[8] - b[37] * a[9] + b[36] * a[10] - b[35] * a[11] + b[61] * a[12] + b[31] * a[13] - b[30] * a[14] + b[29] * a[15] - b[59] * a[16] + b[58] * a[17] - b[57] * a[18] + b[25] * a[19] - b[24] * a[20] + b[23] * a[21] + b[56] * a[22] + b[21] * a[23] - b[20] * a[24] + b[19] * a[25] - b[54] * a[26] + b[53] * a[27] - b[52] * a[28] + b[15] * a[29] - b[14] * a[30] + b[13] * a[31] + b[50] * a[32] - b[49] * a[33] + b[48] * a[34] - b[11] * a[35] + b[10] * a[36] - b[ 9] * a[37] + b[44] * a[38] - b[43] * a[39] + b[42] * a[40] + b[ 7] * a[41] - b[40] * a[42] + b[39] * a[43] - b[38] * a[44] + b[ 6] * a[45] - b[ 5] * a[46] + b[ 4] * a[47] - b[34] * a[48] + b[33] * a[49] - b[32] * a[50] - b[ 2] * a[51] + b[28] * a[52] - b[27] * a[53] + b[26] * a[54] + b[ 1] * a[55] - b[22] * a[56] + b[18] * a[57] - b[17] * a[58] + b[16] * a[59] + b[ 0] * a[60] - b[12] * a[61] + b[ 8] * a[62] - b[ 3] * a[63];
    target[61] = b[61] * a[0] + b[56] * a[1] - b[63] * a[2] - b[51] * a[3] + b[50] * a[4] - b[49] * a[5] + b[48] * a[6] + b[62] * a[7] + b[41] * a[8] - b[40] * a[9] + b[39] * a[10] - b[38] * a[11] - b[60] * a[12] + b[59] * a[13] - b[58] * a[14] + b[57] * a[15] + b[31] * a[16] - b[30] * a[17] + b[29] * a[18] + b[28] * a[19] - b[27] * a[20] + b[26] * a[21] - b[55] * a[22] + b[54] * a[23] - b[53] * a[24] + b[52] * a[25] + b[21] * a[26] - b[20] * a[27] + b[19] * a[28] + b[18] * a[29] - b[17] * a[30] + b[16] * a[31] - b[47] * a[32] + b[46] * a[33] - b[45] * a[34] - b[44] * a[35] + b[43] * a[36] - b[42] * a[37] - b[11] * a[38] + b[10] * a[39] - b[ 9] * a[40] + b[ 8] * a[41] + b[37] * a[42] - b[36] * a[43] + b[35] * a[44] + b[34] * a[45] - b[33] * a[46] + b[32] * a[47] + b[ 6] * a[48] - b[ 5] * a[49] + b[ 4] * a[50] - b[ 3] * a[51] - b[25] * a[52] + b[24] * a[53] - b[23] * a[54] + b[22] * a[55] + b[ 1] * a[56] - b[15] * a[57] + b[14] * a[58] - b[13] * a[59] + b[12] * a[60] + b[ 0] * a[61] - b[ 7] * a[62] + b[ 2] * a[63];
    target[62] = b[62] * a[0] + b[63] * a[1] + b[56] * a[2] - b[55] * a[3] + b[54] * a[4] - b[53] * a[5] + b[52] * a[6] - b[61] * a[7] + b[60] * a[8] - b[59] * a[9] + b[58] * a[10] - b[57] * a[11] + b[41] * a[12] - b[40] * a[13] + b[39] * a[14] - b[38] * a[15] + b[37] * a[16] - b[36] * a[17] + b[35] * a[18] + b[34] * a[19] - b[33] * a[20] + b[32] * a[21] + b[51] * a[22] - b[50] * a[23] + b[49] * a[24] - b[48] * a[25] + b[47] * a[26] - b[46] * a[27] + b[45] * a[28] + b[44] * a[29] - b[43] * a[30] + b[42] * a[31] + b[21] * a[32] - b[20] * a[33] + b[19] * a[34] + b[18] * a[35] - b[17] * a[36] + b[16] * a[37] - b[15] * a[38] + b[14] * a[39] - b[13] * a[40] + b[12] * a[41] - b[31] * a[42] + b[30] * a[43] - b[29] * a[44] - b[28] * a[45] + b[27] * a[46] - b[26] * a[47] + b[25] * a[48] - b[24] * a[49] + b[23] * a[50] - b[22] * a[51] + b[ 6] * a[52] - b[ 5] * a[53] + b[ 4] * a[54] - b[ 3] * a[55] + b[ 2] * a[56] + b[11] * a[57] - b[10] * a[58] + b[ 9] * a[59] - b[ 8] * a[60] + b[ 7] * a[61] + b[ 0] * a[62] - b[ 1] * a[63];
    target[63] = b[63] * a[0] + b[62] * a[1] - b[61] * a[2] + b[60] * a[3] - b[59] * a[4] + b[58] * a[5] - b[57] * a[6] + b[56] * a[7] - b[55] * a[8] + b[54] * a[9] - b[53] * a[10] + b[52] * a[11] + b[51] * a[12] - b[50] * a[13] + b[49] * a[14] - b[48] * a[15] + b[47] * a[16] - b[46] * a[17] + b[45] * a[18] + b[44] * a[19] - b[43] * a[20] + b[42] * a[21] + b[41] * a[22] - b[40] * a[23] + b[39] * a[24] - b[38] * a[25] + b[37] * a[26] - b[36] * a[27] + b[35] * a[28] + b[34] * a[29] - b[33] * a[30] + b[32] * a[31] - b[31] * a[32] + b[30] * a[33] - b[29] * a[34] - b[28] * a[35] + b[27] * a[36] - b[26] * a[37] + b[25] * a[38] - b[24] * a[39] + b[23] * a[40] - b[22] * a[41] + b[21] * a[42] - b[20] * a[43] + b[19] * a[44] + b[18] * a[45] - b[17] * a[46] + b[16] * a[47] - b[15] * a[48] + b[14] * a[49] - b[13] * a[50] + b[12] * a[51] + b[11] * a[52] - b[10] * a[53] + b[ 9] * a[54] - b[ 8] * a[55] + b[ 7] * a[56] + b[ 6] * a[57] - b[ 5] * a[58] + b[ 4] * a[59] - b[ 3] * a[60] + b[ 2] * a[61] - b[ 1] * a[62] + b[ 0] * a[63];
    return target;
}

function meet42(a, b, target) {
    target[ 0] = b[ 0] * a[0];
    target[ 1] = b[ 1] * a[0] + b[ 0] * a[1];
    target[ 2] = b[ 2] * a[0] + b[ 0] * a[2];
    target[ 3] = b[ 3] * a[0] + b[ 0] * a[3];
    target[ 4] = b[ 4] * a[0] + b[ 0] * a[4];
    target[ 5] = b[ 5] * a[0] + b[ 0] * a[5];
    target[ 6] = b[ 6] * a[0] + b[ 0] * a[6];
    target[ 7] = b[ 7] * a[0] + b[ 2] * a[1] - b[ 1] * a[2] + b[ 0] * a[7];
    target[ 8] = b[ 8] * a[0] + b[ 3] * a[1] - b[ 1] * a[3] + b[ 0] * a[8];
    target[ 9] = b[ 9] * a[0] + b[ 4] * a[1] - b[ 1] * a[4] + b[ 0] * a[9];
    target[10] = b[10] * a[0] + b[ 5] * a[1] - b[ 1] * a[5] + b[ 0] * a[10];
    target[11] = b[11] * a[0] + b[ 6] * a[1] - b[ 1] * a[6] + b[ 0] * a[11];
    target[12] = b[12] * a[0] + b[ 3] * a[2] - b[ 2] * a[3] + b[ 0] * a[12];
    target[13] = b[13] * a[0] + b[ 4] * a[2] - b[ 2] * a[4] + b[ 0] * a[13];
    target[14] = b[14] * a[0] + b[ 5] * a[2] - b[ 2] * a[5] + b[ 0] * a[14];
    target[15] = b[15] * a[0] + b[ 6] * a[2] - b[ 2] * a[6] + b[ 0] * a[15];
    target[16] = b[16] * a[0] + b[ 4] * a[3] - b[ 3] * a[4] + b[ 0] * a[16];
    target[17] = b[17] * a[0] + b[ 5] * a[3] - b[ 3] * a[5] + b[ 0] * a[17];
    target[18] = b[18] * a[0] + b[ 6] * a[3] - b[ 3] * a[6] + b[ 0] * a[18];
    target[19] = b[19] * a[0] + b[ 5] * a[4] - b[ 4] * a[5] + b[ 0] * a[19];
    target[20] = b[20] * a[0] + b[ 6] * a[4] - b[ 4] * a[6] + b[ 0] * a[20];
    target[21] = b[21] * a[0] + b[ 6] * a[5] - b[ 5] * a[6] + b[ 0] * a[21];
    target[22] = b[22] * a[0] + b[12] * a[1] - b[ 8] * a[2] + b[ 7] * a[3] + b[ 3] * a[7] - b[ 2] * a[8] + b[ 1] * a[12] + b[ 0] * a[22];
    target[23] = b[23] * a[0] + b[13] * a[1] - b[ 9] * a[2] + b[ 7] * a[4] + b[ 4] * a[7] - b[ 2] * a[9] + b[ 1] * a[13] + b[ 0] * a[23];
    target[24] = b[24] * a[0] + b[14] * a[1] - b[10] * a[2] + b[ 7] * a[5] + b[ 5] * a[7] - b[ 2] * a[10] + b[ 1] * a[14] + b[ 0] * a[24];
    target[25] = b[25] * a[0] + b[15] * a[1] - b[11] * a[2] + b[ 7] * a[6] + b[ 6] * a[7] - b[ 2] * a[11] + b[ 1] * a[15] + b[ 0] * a[25];
    target[26] = b[26] * a[0] + b[16] * a[1] - b[ 9] * a[3] + b[ 8] * a[4] + b[ 4] * a[8] - b[ 3] * a[9] + b[ 1] * a[16] + b[ 0] * a[26];
    target[27] = b[27] * a[0] + b[17] * a[1] - b[10] * a[3] + b[ 8] * a[5] + b[ 5] * a[8] - b[ 3] * a[10] + b[ 1] * a[17] + b[ 0] * a[27];
    target[28] = b[28] * a[0] + b[18] * a[1] - b[11] * a[3] + b[ 8] * a[6] + b[ 6] * a[8] - b[ 3] * a[11] + b[ 1] * a[18] + b[ 0] * a[28];
    target[29] = b[29] * a[0] + b[19] * a[1] - b[10] * a[4] + b[ 9] * a[5] + b[ 5] * a[9] - b[ 4] * a[10] + b[ 1] * a[19] + b[ 0] * a[29];
    target[30] = b[30] * a[0] + b[20] * a[1] - b[11] * a[4] + b[ 9] * a[6] + b[ 6] * a[9] - b[ 4] * a[11] + b[ 1] * a[20] + b[ 0] * a[30];
    target[31] = b[31] * a[0] + b[21] * a[1] - b[11] * a[5] + b[10] * a[6] + b[ 6] * a[10] - b[ 5] * a[11] + b[ 1] * a[21] + b[ 0] * a[31];
    target[32] = b[32] * a[0] + b[16] * a[2] - b[13] * a[3] + b[12] * a[4] + b[ 4] * a[12] - b[ 3] * a[13] + b[ 2] * a[16] + b[ 0] * a[32];
    target[33] = b[33] * a[0] + b[17] * a[2] - b[14] * a[3] + b[12] * a[5] + b[ 5] * a[12] - b[ 3] * a[14] + b[ 2] * a[17] + b[ 0] * a[33];
    target[34] = b[34] * a[0] + b[18] * a[2] - b[15] * a[3] + b[12] * a[6] + b[ 6] * a[12] - b[ 3] * a[15] + b[ 2] * a[18] + b[ 0] * a[34];
    target[35] = b[35] * a[0] + b[19] * a[2] - b[14] * a[4] + b[13] * a[5] + b[ 5] * a[13] - b[ 4] * a[14] + b[ 2] * a[19] + b[ 0] * a[35];
    target[36] = b[36] * a[0] + b[20] * a[2] - b[15] * a[4] + b[13] * a[6] + b[ 6] * a[13] - b[ 4] * a[15] + b[ 2] * a[20] + b[ 0] * a[36];
    target[37] = b[37] * a[0] + b[21] * a[2] - b[15] * a[5] + b[14] * a[6] + b[ 6] * a[14] - b[ 5] * a[15] + b[ 2] * a[21] + b[ 0] * a[37];
    target[38] = b[38] * a[0] + b[19] * a[3] - b[17] * a[4] + b[16] * a[5] + b[ 5] * a[16] - b[ 4] * a[17] + b[ 3] * a[19] + b[ 0] * a[38];
    target[39] = b[39] * a[0] + b[20] * a[3] - b[18] * a[4] + b[16] * a[6] + b[ 6] * a[16] - b[ 4] * a[18] + b[ 3] * a[20] + b[ 0] * a[39];
    target[40] = b[40] * a[0] + b[21] * a[3] - b[18] * a[5] + b[17] * a[6] + b[ 6] * a[17] - b[ 5] * a[18] + b[ 3] * a[21] + b[ 0] * a[40];
    target[41] = b[41] * a[0] + b[21] * a[4] - b[20] * a[5] + b[19] * a[6] + b[ 6] * a[19] - b[ 5] * a[20] + b[ 4] * a[21] + b[ 0] * a[41];
    target[42] = b[42] * a[0] + b[32] * a[1] - b[26] * a[2] + b[23] * a[3] - b[22] * a[4] + b[16] * a[7] - b[13] * a[8] + b[12] * a[9] + b[ 9] * a[12] - b[ 8] * a[13] + b[ 7] * a[16] + b[ 4] * a[22] - b[ 3] * a[23] + b[ 2] * a[26] - b[ 1] * a[32] + b[ 0] * a[42];
    target[43] = b[43] * a[0] + b[33] * a[1] - b[27] * a[2] + b[24] * a[3] - b[22] * a[5] + b[17] * a[7] - b[14] * a[8] + b[12] * a[10] + b[10] * a[12] - b[ 8] * a[14] + b[ 7] * a[17] + b[ 5] * a[22] - b[ 3] * a[24] + b[ 2] * a[27] - b[ 1] * a[33] + b[ 0] * a[43];
    target[44] = b[44] * a[0] + b[34] * a[1] - b[28] * a[2] + b[25] * a[3] - b[22] * a[6] + b[18] * a[7] - b[15] * a[8] + b[12] * a[11] + b[11] * a[12] - b[ 8] * a[15] + b[ 7] * a[18] + b[ 6] * a[22] - b[ 3] * a[25] + b[ 2] * a[28] - b[ 1] * a[34] + b[ 0] * a[44];
    target[45] = b[45] * a[0] + b[35] * a[1] - b[29] * a[2] + b[24] * a[4] - b[23] * a[5] + b[19] * a[7] - b[14] * a[9] + b[13] * a[10] + b[10] * a[13] - b[ 9] * a[14] + b[ 7] * a[19] + b[ 5] * a[23] - b[ 4] * a[24] + b[ 2] * a[29] - b[ 1] * a[35] + b[ 0] * a[45];
    target[46] = b[46] * a[0] + b[36] * a[1] - b[30] * a[2] + b[25] * a[4] - b[23] * a[6] + b[20] * a[7] - b[15] * a[9] + b[13] * a[11] + b[11] * a[13] - b[ 9] * a[15] + b[ 7] * a[20] + b[ 6] * a[23] - b[ 4] * a[25] + b[ 2] * a[30] - b[ 1] * a[36] + b[ 0] * a[46];
    target[47] = b[47] * a[0] + b[37] * a[1] - b[31] * a[2] + b[25] * a[5] - b[24] * a[6] + b[21] * a[7] - b[15] * a[10] + b[14] * a[11] + b[11] * a[14] - b[10] * a[15] + b[ 7] * a[21] + b[ 6] * a[24] - b[ 5] * a[25] + b[ 2] * a[31] - b[ 1] * a[37] + b[ 0] * a[47];
    target[48] = b[48] * a[0] + b[38] * a[1] - b[29] * a[3] + b[27] * a[4] - b[26] * a[5] + b[19] * a[8] - b[17] * a[9] + b[16] * a[10] + b[10] * a[16] - b[ 9] * a[17] + b[ 8] * a[19] + b[ 5] * a[26] - b[ 4] * a[27] + b[ 3] * a[29] - b[ 1] * a[38] + b[ 0] * a[48];
    target[49] = b[49] * a[0] + b[39] * a[1] - b[30] * a[3] + b[28] * a[4] - b[26] * a[6] + b[20] * a[8] - b[18] * a[9] + b[16] * a[11] + b[11] * a[16] - b[ 9] * a[18] + b[ 8] * a[20] + b[ 6] * a[26] - b[ 4] * a[28] + b[ 3] * a[30] - b[ 1] * a[39] + b[ 0] * a[49];
    target[50] = b[50] * a[0] + b[40] * a[1] - b[31] * a[3] + b[28] * a[5] - b[27] * a[6] + b[21] * a[8] - b[18] * a[10] + b[17] * a[11] + b[11] * a[17] - b[10] * a[18] + b[ 8] * a[21] + b[ 6] * a[27] - b[ 5] * a[28] + b[ 3] * a[31] - b[ 1] * a[40] + b[ 0] * a[50];
    target[51] = b[51] * a[0] + b[41] * a[1] - b[31] * a[4] + b[30] * a[5] - b[29] * a[6] + b[21] * a[9] - b[20] * a[10] + b[19] * a[11] + b[11] * a[19] - b[10] * a[20] + b[ 9] * a[21] + b[ 6] * a[29] - b[ 5] * a[30] + b[ 4] * a[31] - b[ 1] * a[41] + b[ 0] * a[51];
    target[52] = b[52] * a[0] + b[38] * a[2] - b[35] * a[3] + b[33] * a[4] - b[32] * a[5] + b[19] * a[12] - b[17] * a[13] + b[16] * a[14] + b[14] * a[16] - b[13] * a[17] + b[12] * a[19] + b[ 5] * a[32] - b[ 4] * a[33] + b[ 3] * a[35] - b[ 2] * a[38] + b[ 0] * a[52];
    target[53] = b[53] * a[0] + b[39] * a[2] - b[36] * a[3] + b[34] * a[4] - b[32] * a[6] + b[20] * a[12] - b[18] * a[13] + b[16] * a[15] + b[15] * a[16] - b[13] * a[18] + b[12] * a[20] + b[ 6] * a[32] - b[ 4] * a[34] + b[ 3] * a[36] - b[ 2] * a[39] + b[ 0] * a[53];
    target[54] = b[54] * a[0] + b[40] * a[2] - b[37] * a[3] + b[34] * a[5] - b[33] * a[6] + b[21] * a[12] - b[18] * a[14] + b[17] * a[15] + b[15] * a[17] - b[14] * a[18] + b[12] * a[21] + b[ 6] * a[33] - b[ 5] * a[34] + b[ 3] * a[37] - b[ 2] * a[40] + b[ 0] * a[54];
    target[55] = b[55] * a[0] + b[41] * a[2] - b[37] * a[4] + b[36] * a[5] - b[35] * a[6] + b[21] * a[13] - b[20] * a[14] + b[19] * a[15] + b[15] * a[19] - b[14] * a[20] + b[13] * a[21] + b[ 6] * a[35] - b[ 5] * a[36] + b[ 4] * a[37] - b[ 2] * a[41] + b[ 0] * a[55];
    target[56] = b[56] * a[0] + b[41] * a[3] - b[40] * a[4] + b[39] * a[5] - b[38] * a[6] + b[21] * a[16] - b[20] * a[17] + b[19] * a[18] + b[18] * a[19] - b[17] * a[20] + b[16] * a[21] + b[ 6] * a[38] - b[ 5] * a[39] + b[ 4] * a[40] - b[ 3] * a[41] + b[ 0] * a[56];
    target[57] = b[57] * a[0] + b[52] * a[1] - b[48] * a[2] + b[45] * a[3] - b[43] * a[4] + b[42] * a[5] + b[38] * a[7] - b[35] * a[8] + b[33] * a[9] - b[32] * a[10] + b[29] * a[12] - b[27] * a[13] + b[26] * a[14] + b[24] * a[16] - b[23] * a[17] + b[22] * a[19] + b[19] * a[22] - b[17] * a[23] + b[16] * a[24] + b[14] * a[26] - b[13] * a[27] + b[12] * a[29] - b[10] * a[32] + b[ 9] * a[33] - b[ 8] * a[35] + b[ 7] * a[38] + b[ 5] * a[42] - b[ 4] * a[43] + b[ 3] * a[45] - b[ 2] * a[48] + b[ 1] * a[52] + b[ 0] * a[57];
    target[58] = b[58] * a[0] + b[53] * a[1] - b[49] * a[2] + b[46] * a[3] - b[44] * a[4] + b[42] * a[6] + b[39] * a[7] - b[36] * a[8] + b[34] * a[9] - b[32] * a[11] + b[30] * a[12] - b[28] * a[13] + b[26] * a[15] + b[25] * a[16] - b[23] * a[18] + b[22] * a[20] + b[20] * a[22] - b[18] * a[23] + b[16] * a[25] + b[15] * a[26] - b[13] * a[28] + b[12] * a[30] - b[11] * a[32] + b[ 9] * a[34] - b[ 8] * a[36] + b[ 7] * a[39] + b[ 6] * a[42] - b[ 4] * a[44] + b[ 3] * a[46] - b[ 2] * a[49] + b[ 1] * a[53] + b[ 0] * a[58];
    target[59] = b[59] * a[0] + b[54] * a[1] - b[50] * a[2] + b[47] * a[3] - b[44] * a[5] + b[43] * a[6] + b[40] * a[7] - b[37] * a[8] + b[34] * a[10] - b[33] * a[11] + b[31] * a[12] - b[28] * a[14] + b[27] * a[15] + b[25] * a[17] - b[24] * a[18] + b[22] * a[21] + b[21] * a[22] - b[18] * a[24] + b[17] * a[25] + b[15] * a[27] - b[14] * a[28] + b[12] * a[31] - b[11] * a[33] + b[10] * a[34] - b[ 8] * a[37] + b[ 7] * a[40] + b[ 6] * a[43] - b[ 5] * a[44] + b[ 3] * a[47] - b[ 2] * a[50] + b[ 1] * a[54] + b[ 0] * a[59];
    target[60] = b[60] * a[0] + b[55] * a[1] - b[51] * a[2] + b[47] * a[4] - b[46] * a[5] + b[45] * a[6] + b[41] * a[7] - b[37] * a[9] + b[36] * a[10] - b[35] * a[11] + b[31] * a[13] - b[30] * a[14] + b[29] * a[15] + b[25] * a[19] - b[24] * a[20] + b[23] * a[21] + b[21] * a[23] - b[20] * a[24] + b[19] * a[25] + b[15] * a[29] - b[14] * a[30] + b[13] * a[31] - b[11] * a[35] + b[10] * a[36] - b[ 9] * a[37] + b[ 7] * a[41] + b[ 6] * a[45] - b[ 5] * a[46] + b[ 4] * a[47] - b[ 2] * a[51] + b[ 1] * a[55] + b[ 0] * a[60];
    target[61] = b[61] * a[0] + b[56] * a[1] - b[51] * a[3] + b[50] * a[4] - b[49] * a[5] + b[48] * a[6] + b[41] * a[8] - b[40] * a[9] + b[39] * a[10] - b[38] * a[11] + b[31] * a[16] - b[30] * a[17] + b[29] * a[18] + b[28] * a[19] - b[27] * a[20] + b[26] * a[21] + b[21] * a[26] - b[20] * a[27] + b[19] * a[28] + b[18] * a[29] - b[17] * a[30] + b[16] * a[31] - b[11] * a[38] + b[10] * a[39] - b[ 9] * a[40] + b[ 8] * a[41] + b[ 6] * a[48] - b[ 5] * a[49] + b[ 4] * a[50] - b[ 3] * a[51] + b[ 1] * a[56] + b[ 0] * a[61];
    target[62] = b[62] * a[0] + b[56] * a[2] - b[55] * a[3] + b[54] * a[4] - b[53] * a[5] + b[52] * a[6] + b[41] * a[12] - b[40] * a[13] + b[39] * a[14] - b[38] * a[15] + b[37] * a[16] - b[36] * a[17] + b[35] * a[18] + b[34] * a[19] - b[33] * a[20] + b[32] * a[21] + b[21] * a[32] - b[20] * a[33] + b[19] * a[34] + b[18] * a[35] - b[17] * a[36] + b[16] * a[37] - b[15] * a[38] + b[14] * a[39] - b[13] * a[40] + b[12] * a[41] + b[ 6] * a[52] - b[ 5] * a[53] + b[ 4] * a[54] - b[ 3] * a[55] + b[ 2] * a[56] + b[ 0] * a[62];
    target[63] = b[63] * a[0] + b[62] * a[1] - b[61] * a[2] + b[60] * a[3] - b[59] * a[4] + b[58] * a[5] - b[57] * a[6] + b[56] * a[7] - b[55] * a[8] + b[54] * a[9] - b[53] * a[10] + b[52] * a[11] + b[51] * a[12] - b[50] * a[13] + b[49] * a[14] - b[48] * a[15] + b[47] * a[16] - b[46] * a[17] + b[45] * a[18] + b[44] * a[19] - b[43] * a[20] + b[42] * a[21] + b[41] * a[22] - b[40] * a[23] + b[39] * a[24] - b[38] * a[25] + b[37] * a[26] - b[36] * a[27] + b[35] * a[28] + b[34] * a[29] - b[33] * a[30] + b[32] * a[31] - b[31] * a[32] + b[30] * a[33] - b[29] * a[34] - b[28] * a[35] + b[27] * a[36] - b[26] * a[37] + b[25] * a[38] - b[24] * a[39] + b[23] * a[40] - b[22] * a[41] + b[21] * a[42] - b[20] * a[43] + b[19] * a[44] + b[18] * a[45] - b[17] * a[46] + b[16] * a[47] - b[15] * a[48] + b[14] * a[49] - b[13] * a[50] + b[12] * a[51] + b[11] * a[52] - b[10] * a[53] + b[ 9] * a[54] - b[ 8] * a[55] + b[ 7] * a[56] + b[ 6] * a[57] - b[ 5] * a[58] + b[ 4] * a[59] - b[ 3] * a[60] + b[ 2] * a[61] - b[ 1] * a[62] + b[ 0] * a[63];
    return target;
}

function inner42(a, b, target) {
    target[ 0] = b[ 0] * a[0] + b[ 1] * a[1] + b[ 2] * a[2] + b[ 3] * a[3] + b[ 4] * a[4] - b[ 5] * a[5] - b[ 6] * a[6] - b[ 7] * a[7] - b[ 8] * a[8] - b[ 9] * a[9] + b[10] * a[10] + b[11] * a[11] - b[12] * a[12] - b[13] * a[13] + b[14] * a[14] + b[15] * a[15] - b[16] * a[16] + b[17] * a[17] + b[18] * a[18] + b[19] * a[19] + b[20] * a[20] - b[21] * a[21] - b[22] * a[22] - b[23] * a[23] + b[24] * a[24] + b[25] * a[25] - b[26] * a[26] + b[27] * a[27] + b[28] * a[28] + b[29] * a[29] + b[30] * a[30] - b[31] * a[31] - b[32] * a[32] + b[33] * a[33] + b[34] * a[34] + b[35] * a[35] + b[36] * a[36] - b[37] * a[37] + b[38] * a[38] + b[39] * a[39] - b[40] * a[40] - b[41] * a[41] + b[42] * a[42] - b[43] * a[43] - b[44] * a[44] - b[45] * a[45] - b[46] * a[46] + b[47] * a[47] - b[48] * a[48] - b[49] * a[49] + b[50] * a[50] + b[51] * a[51] - b[52] * a[52] - b[53] * a[53] + b[54] * a[54] + b[55] * a[55] + b[56] * a[56] - b[57] * a[57] - b[58] * a[58] + b[59] * a[59] + b[60] * a[60] + b[61] * a[61] + b[62] * a[62] - b[63] * a[63];
    target[ 1] = b[ 1] * a[0] + b[ 0] * a[1] - b[ 7] * a[2] - b[ 8] * a[3] - b[ 9] * a[4] + b[10] * a[5] + b[11] * a[6] + b[ 2] * a[7] + b[ 3] * a[8] + b[ 4] * a[9] - b[ 5] * a[10] - b[ 6] * a[11] - b[22] * a[12] - b[23] * a[13] + b[24] * a[14] + b[25] * a[15] - b[26] * a[16] + b[27] * a[17] + b[28] * a[18] + b[29] * a[19] + b[30] * a[20] - b[31] * a[21] - b[12] * a[22] - b[13] * a[23] + b[14] * a[24] + b[15] * a[25] - b[16] * a[26] + b[17] * a[27] + b[18] * a[28] + b[19] * a[29] + b[20] * a[30] - b[21] * a[31] + b[42] * a[32] - b[43] * a[33] - b[44] * a[34] - b[45] * a[35] - b[46] * a[36] + b[47] * a[37] - b[48] * a[38] - b[49] * a[39] + b[50] * a[40] + b[51] * a[41] - b[32] * a[42] + b[33] * a[43] + b[34] * a[44] + b[35] * a[45] + b[36] * a[46] - b[37] * a[47] + b[38] * a[48] + b[39] * a[49] - b[40] * a[50] - b[41] * a[51] - b[57] * a[52] - b[58] * a[53] + b[59] * a[54] + b[60] * a[55] + b[61] * a[56] - b[52] * a[57] - b[53] * a[58] + b[54] * a[59] + b[55] * a[60] + b[56] * a[61] - b[63] * a[62] + b[62] * a[63];
    target[ 2] = b[ 2] * a[0] + b[ 7] * a[1] + b[ 0] * a[2] - b[12] * a[3] - b[13] * a[4] + b[14] * a[5] + b[15] * a[6] - b[ 1] * a[7] + b[22] * a[8] + b[23] * a[9] - b[24] * a[10] - b[25] * a[11] + b[ 3] * a[12] + b[ 4] * a[13] - b[ 5] * a[14] - b[ 6] * a[15] - b[32] * a[16] + b[33] * a[17] + b[34] * a[18] + b[35] * a[19] + b[36] * a[20] - b[37] * a[21] + b[ 8] * a[22] + b[ 9] * a[23] - b[10] * a[24] - b[11] * a[25] - b[42] * a[26] + b[43] * a[27] + b[44] * a[28] + b[45] * a[29] + b[46] * a[30] - b[47] * a[31] - b[16] * a[32] + b[17] * a[33] + b[18] * a[34] + b[19] * a[35] + b[20] * a[36] - b[21] * a[37] - b[52] * a[38] - b[53] * a[39] + b[54] * a[40] + b[55] * a[41] + b[26] * a[42] - b[27] * a[43] - b[28] * a[44] - b[29] * a[45] - b[30] * a[46] + b[31] * a[47] + b[57] * a[48] + b[58] * a[49] - b[59] * a[50] - b[60] * a[51] + b[38] * a[52] + b[39] * a[53] - b[40] * a[54] - b[41] * a[55] + b[62] * a[56] + b[48] * a[57] + b[49] * a[58] - b[50] * a[59] - b[51] * a[60] + b[63] * a[61] + b[56] * a[62] - b[61] * a[63];
    target[ 3] = b[ 3] * a[0] + b[ 8] * a[1] + b[12] * a[2] + b[ 0] * a[3] - b[16] * a[4] + b[17] * a[5] + b[18] * a[6] - b[22] * a[7] - b[ 1] * a[8] + b[26] * a[9] - b[27] * a[10] - b[28] * a[11] - b[ 2] * a[12] + b[32] * a[13] - b[33] * a[14] - b[34] * a[15] + b[ 4] * a[16] - b[ 5] * a[17] - b[ 6] * a[18] + b[38] * a[19] + b[39] * a[20] - b[40] * a[21] - b[ 7] * a[22] + b[42] * a[23] - b[43] * a[24] - b[44] * a[25] + b[ 9] * a[26] - b[10] * a[27] - b[11] * a[28] + b[48] * a[29] + b[49] * a[30] - b[50] * a[31] + b[13] * a[32] - b[14] * a[33] - b[15] * a[34] + b[52] * a[35] + b[53] * a[36] - b[54] * a[37] + b[19] * a[38] + b[20] * a[39] - b[21] * a[40] + b[56] * a[41] - b[23] * a[42] + b[24] * a[43] + b[25] * a[44] - b[57] * a[45] - b[58] * a[46] + b[59] * a[47] - b[29] * a[48] - b[30] * a[49] + b[31] * a[50] - b[61] * a[51] - b[35] * a[52] - b[36] * a[53] + b[37] * a[54] - b[62] * a[55] - b[41] * a[56] - b[45] * a[57] - b[46] * a[58] + b[47] * a[59] - b[63] * a[60] - b[51] * a[61] - b[55] * a[62] + b[60] * a[63];
    target[ 4] = b[ 4] * a[0] + b[ 9] * a[1] + b[13] * a[2] + b[16] * a[3] + b[ 0] * a[4] + b[19] * a[5] + b[20] * a[6] - b[23] * a[7] - b[26] * a[8] - b[ 1] * a[9] - b[29] * a[10] - b[30] * a[11] - b[32] * a[12] - b[ 2] * a[13] - b[35] * a[14] - b[36] * a[15] - b[ 3] * a[16] - b[38] * a[17] - b[39] * a[18] - b[ 5] * a[19] - b[ 6] * a[20] - b[41] * a[21] - b[42] * a[22] - b[ 7] * a[23] - b[45] * a[24] - b[46] * a[25] - b[ 8] * a[26] - b[48] * a[27] - b[49] * a[28] - b[10] * a[29] - b[11] * a[30] - b[51] * a[31] - b[12] * a[32] - b[52] * a[33] - b[53] * a[34] - b[14] * a[35] - b[15] * a[36] - b[55] * a[37] - b[17] * a[38] - b[18] * a[39] - b[56] * a[40] - b[21] * a[41] + b[22] * a[42] + b[57] * a[43] + b[58] * a[44] + b[24] * a[45] + b[25] * a[46] + b[60] * a[47] + b[27] * a[48] + b[28] * a[49] + b[61] * a[50] + b[31] * a[51] + b[33] * a[52] + b[34] * a[53] + b[62] * a[54] + b[37] * a[55] + b[40] * a[56] + b[43] * a[57] + b[44] * a[58] + b[63] * a[59] + b[47] * a[60] + b[50] * a[61] + b[54] * a[62] - b[59] * a[63];
    target[ 5] = b[ 5] * a[0] + b[10] * a[1] + b[14] * a[2] + b[17] * a[3] + b[19] * a[4] + b[ 0] * a[5] + b[21] * a[6] - b[24] * a[7] - b[27] * a[8] - b[29] * a[9] - b[ 1] * a[10] - b[31] * a[11] - b[33] * a[12] - b[35] * a[13] - b[ 2] * a[14] - b[37] * a[15] - b[38] * a[16] - b[ 3] * a[17] - b[40] * a[18] - b[ 4] * a[19] - b[41] * a[20] - b[ 6] * a[21] - b[43] * a[22] - b[45] * a[23] - b[ 7] * a[24] - b[47] * a[25] - b[48] * a[26] - b[ 8] * a[27] - b[50] * a[28] - b[ 9] * a[29] - b[51] * a[30] - b[11] * a[31] - b[52] * a[32] - b[12] * a[33] - b[54] * a[34] - b[13] * a[35] - b[55] * a[36] - b[15] * a[37] - b[16] * a[38] - b[56] * a[39] - b[18] * a[40] - b[20] * a[41] + b[57] * a[42] + b[22] * a[43] + b[59] * a[44] + b[23] * a[45] + b[60] * a[46] + b[25] * a[47] + b[26] * a[48] + b[61] * a[49] + b[28] * a[50] + b[30] * a[51] + b[32] * a[52] + b[62] * a[53] + b[34] * a[54] + b[36] * a[55] + b[39] * a[56] + b[42] * a[57] + b[63] * a[58] + b[44] * a[59] + b[46] * a[60] + b[49] * a[61] + b[53] * a[62] - b[58] * a[63];
    target[ 6] = b[ 6] * a[0] + b[11] * a[1] + b[15] * a[2] + b[18] * a[3] + b[20] * a[4] - b[21] * a[5] + b[ 0] * a[6] - b[25] * a[7] - b[28] * a[8] - b[30] * a[9] + b[31] * a[10] - b[ 1] * a[11] - b[34] * a[12] - b[36] * a[13] + b[37] * a[14] - b[ 2] * a[15] - b[39] * a[16] + b[40] * a[17] - b[ 3] * a[18] + b[41] * a[19] - b[ 4] * a[20] + b[ 5] * a[21] - b[44] * a[22] - b[46] * a[23] + b[47] * a[24] - b[ 7] * a[25] - b[49] * a[26] + b[50] * a[27] - b[ 8] * a[28] + b[51] * a[29] - b[ 9] * a[30] + b[10] * a[31] - b[53] * a[32] + b[54] * a[33] - b[12] * a[34] + b[55] * a[35] - b[13] * a[36] + b[14] * a[37] + b[56] * a[38] - b[16] * a[39] + b[17] * a[40] + b[19] * a[41] + b[58] * a[42] - b[59] * a[43] + b[22] * a[44] - b[60] * a[45] + b[23] * a[46] - b[24] * a[47] - b[61] * a[48] + b[26] * a[49] - b[27] * a[50] - b[29] * a[51] - b[62] * a[52] + b[32] * a[53] - b[33] * a[54] - b[35] * a[55] - b[38] * a[56] - b[63] * a[57] + b[42] * a[58] - b[43] * a[59] - b[45] * a[60] - b[48] * a[61] - b[52] * a[62] + b[57] * a[63];
    target[ 7] = b[ 7] * a[0] + b[22] * a[3] + b[23] * a[4] - b[24] * a[5] - b[25] * a[6] + b[ 0] * a[7] - b[42] * a[16] + b[43] * a[17] + b[44] * a[18] + b[45] * a[19] + b[46] * a[20] - b[47] * a[21] + b[ 3] * a[22] + b[ 4] * a[23] - b[ 5] * a[24] - b[ 6] * a[25] + b[57] * a[38] + b[58] * a[39] - b[59] * a[40] - b[60] * a[41] - b[16] * a[42] + b[17] * a[43] + b[18] * a[44] + b[19] * a[45] + b[20] * a[46] - b[21] * a[47] + b[63] * a[56] + b[38] * a[57] + b[39] * a[58] - b[40] * a[59] - b[41] * a[60] + b[56] * a[63];
    target[ 8] = b[ 8] * a[0] - b[22] * a[2] + b[26] * a[4] - b[27] * a[5] - b[28] * a[6] + b[ 0] * a[8] + b[42] * a[13] - b[43] * a[14] - b[44] * a[15] + b[48] * a[19] + b[49] * a[20] - b[50] * a[21] - b[ 2] * a[22] + b[ 4] * a[26] - b[ 5] * a[27] - b[ 6] * a[28] - b[57] * a[35] - b[58] * a[36] + b[59] * a[37] - b[61] * a[41] + b[13] * a[42] - b[14] * a[43] - b[15] * a[44] + b[19] * a[48] + b[20] * a[49] - b[21] * a[50] - b[63] * a[55] - b[35] * a[57] - b[36] * a[58] + b[37] * a[59] - b[41] * a[61] - b[55] * a[63];
    target[ 9] = b[ 9] * a[0] - b[23] * a[2] - b[26] * a[3] - b[29] * a[5] - b[30] * a[6] + b[ 0] * a[9] - b[42] * a[12] - b[45] * a[14] - b[46] * a[15] - b[48] * a[17] - b[49] * a[18] - b[51] * a[21] - b[ 2] * a[23] - b[ 3] * a[26] - b[ 5] * a[29] - b[ 6] * a[30] + b[57] * a[33] + b[58] * a[34] + b[60] * a[37] + b[61] * a[40] - b[12] * a[42] - b[14] * a[45] - b[15] * a[46] - b[17] * a[48] - b[18] * a[49] - b[21] * a[51] + b[63] * a[54] + b[33] * a[57] + b[34] * a[58] + b[37] * a[60] + b[40] * a[61] + b[54] * a[63];
    target[10] = b[10] * a[0] - b[24] * a[2] - b[27] * a[3] - b[29] * a[4] - b[31] * a[6] + b[ 0] * a[10] - b[43] * a[12] - b[45] * a[13] - b[47] * a[15] - b[48] * a[16] - b[50] * a[18] - b[51] * a[20] - b[ 2] * a[24] - b[ 3] * a[27] - b[ 4] * a[29] - b[ 6] * a[31] + b[57] * a[32] + b[59] * a[34] + b[60] * a[36] + b[61] * a[39] - b[12] * a[43] - b[13] * a[45] - b[15] * a[47] - b[16] * a[48] - b[18] * a[50] - b[20] * a[51] + b[63] * a[53] + b[32] * a[57] + b[34] * a[59] + b[36] * a[60] + b[39] * a[61] + b[53] * a[63];
    target[11] = b[11] * a[0] - b[25] * a[2] - b[28] * a[3] - b[30] * a[4] + b[31] * a[5] + b[ 0] * a[11] - b[44] * a[12] - b[46] * a[13] + b[47] * a[14] - b[49] * a[16] + b[50] * a[17] + b[51] * a[19] - b[ 2] * a[25] - b[ 3] * a[28] - b[ 4] * a[30] + b[ 5] * a[31] + b[58] * a[32] - b[59] * a[33] - b[60] * a[35] - b[61] * a[38] - b[12] * a[44] - b[13] * a[46] + b[14] * a[47] - b[16] * a[49] + b[17] * a[50] + b[19] * a[51] - b[63] * a[52] + b[32] * a[58] - b[33] * a[59] - b[35] * a[60] - b[38] * a[61] - b[52] * a[63];
    target[12] = b[12] * a[0] + b[22] * a[1] + b[32] * a[4] - b[33] * a[5] - b[34] * a[6] - b[42] * a[9] + b[43] * a[10] + b[44] * a[11] + b[ 0] * a[12] + b[52] * a[19] + b[53] * a[20] - b[54] * a[21] + b[ 1] * a[22] + b[57] * a[29] + b[58] * a[30] - b[59] * a[31] + b[ 4] * a[32] - b[ 5] * a[33] - b[ 6] * a[34] - b[62] * a[41] - b[ 9] * a[42] + b[10] * a[43] + b[11] * a[44] + b[63] * a[51] + b[19] * a[52] + b[20] * a[53] - b[21] * a[54] + b[29] * a[57] + b[30] * a[58] - b[31] * a[59] - b[41] * a[62] + b[51] * a[63];
    target[13] = b[13] * a[0] + b[23] * a[1] - b[32] * a[3] - b[35] * a[5] - b[36] * a[6] + b[42] * a[8] + b[45] * a[10] + b[46] * a[11] + b[ 0] * a[13] - b[52] * a[17] - b[53] * a[18] - b[55] * a[21] + b[ 1] * a[23] - b[57] * a[27] - b[58] * a[28] - b[60] * a[31] - b[ 3] * a[32] - b[ 5] * a[35] - b[ 6] * a[36] + b[62] * a[40] + b[ 8] * a[42] + b[10] * a[45] + b[11] * a[46] - b[63] * a[50] - b[17] * a[52] - b[18] * a[53] - b[21] * a[55] - b[27] * a[57] - b[28] * a[58] - b[31] * a[60] + b[40] * a[62] - b[50] * a[63];
    target[14] = b[14] * a[0] + b[24] * a[1] - b[33] * a[3] - b[35] * a[4] - b[37] * a[6] + b[43] * a[8] + b[45] * a[9] + b[47] * a[11] + b[ 0] * a[14] - b[52] * a[16] - b[54] * a[18] - b[55] * a[20] + b[ 1] * a[24] - b[57] * a[26] - b[59] * a[28] - b[60] * a[30] - b[ 3] * a[33] - b[ 4] * a[35] - b[ 6] * a[37] + b[62] * a[39] + b[ 8] * a[43] + b[ 9] * a[45] + b[11] * a[47] - b[63] * a[49] - b[16] * a[52] - b[18] * a[54] - b[20] * a[55] - b[26] * a[57] - b[28] * a[59] - b[30] * a[60] + b[39] * a[62] - b[49] * a[63];
    target[15] = b[15] * a[0] + b[25] * a[1] - b[34] * a[3] - b[36] * a[4] + b[37] * a[5] + b[44] * a[8] + b[46] * a[9] - b[47] * a[10] + b[ 0] * a[15] - b[53] * a[16] + b[54] * a[17] + b[55] * a[19] + b[ 1] * a[25] - b[58] * a[26] + b[59] * a[27] + b[60] * a[29] - b[ 3] * a[34] - b[ 4] * a[36] + b[ 5] * a[37] - b[62] * a[38] + b[ 8] * a[44] + b[ 9] * a[46] - b[10] * a[47] + b[63] * a[48] - b[16] * a[53] + b[17] * a[54] + b[19] * a[55] - b[26] * a[58] + b[27] * a[59] + b[29] * a[60] - b[38] * a[62] + b[48] * a[63];
    target[16] = b[16] * a[0] + b[26] * a[1] + b[32] * a[2] - b[38] * a[5] - b[39] * a[6] - b[42] * a[7] + b[48] * a[10] + b[49] * a[11] + b[52] * a[14] + b[53] * a[15] + b[ 0] * a[16] - b[56] * a[21] + b[57] * a[24] + b[58] * a[25] + b[ 1] * a[26] - b[61] * a[31] + b[ 2] * a[32] - b[62] * a[37] - b[ 5] * a[38] - b[ 6] * a[39] - b[ 7] * a[42] + b[63] * a[47] + b[10] * a[48] + b[11] * a[49] + b[14] * a[52] + b[15] * a[53] - b[21] * a[56] + b[24] * a[57] + b[25] * a[58] - b[31] * a[61] - b[37] * a[62] + b[47] * a[63];
    target[17] = b[17] * a[0] + b[27] * a[1] + b[33] * a[2] - b[38] * a[4] - b[40] * a[6] - b[43] * a[7] + b[48] * a[9] + b[50] * a[11] + b[52] * a[13] + b[54] * a[15] + b[ 0] * a[17] - b[56] * a[20] + b[57] * a[23] + b[59] * a[25] + b[ 1] * a[27] - b[61] * a[30] + b[ 2] * a[33] - b[62] * a[36] - b[ 4] * a[38] - b[ 6] * a[40] - b[ 7] * a[43] + b[63] * a[46] + b[ 9] * a[48] + b[11] * a[50] + b[13] * a[52] + b[15] * a[54] - b[20] * a[56] + b[23] * a[57] + b[25] * a[59] - b[30] * a[61] - b[36] * a[62] + b[46] * a[63];
    target[18] = b[18] * a[0] + b[28] * a[1] + b[34] * a[2] - b[39] * a[4] + b[40] * a[5] - b[44] * a[7] + b[49] * a[9] - b[50] * a[10] + b[53] * a[13] - b[54] * a[14] + b[ 0] * a[18] + b[56] * a[19] + b[58] * a[23] - b[59] * a[24] + b[ 1] * a[28] + b[61] * a[29] + b[ 2] * a[34] + b[62] * a[35] - b[ 4] * a[39] + b[ 5] * a[40] - b[ 7] * a[44] - b[63] * a[45] + b[ 9] * a[49] - b[10] * a[50] + b[13] * a[53] - b[14] * a[54] + b[19] * a[56] + b[23] * a[58] - b[24] * a[59] + b[29] * a[61] + b[35] * a[62] - b[45] * a[63];
    target[19] = b[19] * a[0] + b[29] * a[1] + b[35] * a[2] + b[38] * a[3] - b[41] * a[6] - b[45] * a[7] - b[48] * a[8] + b[51] * a[11] - b[52] * a[12] + b[55] * a[15] + b[56] * a[18] + b[ 0] * a[19] - b[57] * a[22] + b[60] * a[25] + b[61] * a[28] + b[ 1] * a[29] + b[62] * a[34] + b[ 2] * a[35] + b[ 3] * a[38] - b[ 6] * a[41] - b[63] * a[44] - b[ 7] * a[45] - b[ 8] * a[48] + b[11] * a[51] - b[12] * a[52] + b[15] * a[55] + b[18] * a[56] - b[22] * a[57] + b[25] * a[60] + b[28] * a[61] + b[34] * a[62] - b[44] * a[63];
    target[20] = b[20] * a[0] + b[30] * a[1] + b[36] * a[2] + b[39] * a[3] + b[41] * a[5] - b[46] * a[7] - b[49] * a[8] - b[51] * a[10] - b[53] * a[12] - b[55] * a[14] - b[56] * a[17] + b[ 0] * a[20] - b[58] * a[22] - b[60] * a[24] - b[61] * a[27] + b[ 1] * a[30] - b[62] * a[33] + b[ 2] * a[36] + b[ 3] * a[39] + b[ 5] * a[41] + b[63] * a[43] - b[ 7] * a[46] - b[ 8] * a[49] - b[10] * a[51] - b[12] * a[53] - b[14] * a[55] - b[17] * a[56] - b[22] * a[58] - b[24] * a[60] - b[27] * a[61] - b[33] * a[62] + b[43] * a[63];
    target[21] = b[21] * a[0] + b[31] * a[1] + b[37] * a[2] + b[40] * a[3] + b[41] * a[4] - b[47] * a[7] - b[50] * a[8] - b[51] * a[9] - b[54] * a[12] - b[55] * a[13] - b[56] * a[16] + b[ 0] * a[21] - b[59] * a[22] - b[60] * a[23] - b[61] * a[26] + b[ 1] * a[31] - b[62] * a[32] + b[ 2] * a[37] + b[ 3] * a[40] + b[ 4] * a[41] + b[63] * a[42] - b[ 7] * a[47] - b[ 8] * a[50] - b[ 9] * a[51] - b[12] * a[54] - b[13] * a[55] - b[16] * a[56] - b[22] * a[59] - b[23] * a[60] - b[26] * a[61] - b[32] * a[62] + b[42] * a[63];
    target[22] = b[22] * a[0] - b[42] * a[4] + b[43] * a[5] + b[44] * a[6] + b[57] * a[19] + b[58] * a[20] - b[59] * a[21] + b[ 0] * a[22] + b[63] * a[41] + b[ 4] * a[42] - b[ 5] * a[43] - b[ 6] * a[44] + b[19] * a[57] + b[20] * a[58] - b[21] * a[59] - b[41] * a[63];
    target[23] = b[23] * a[0] + b[42] * a[3] + b[45] * a[5] + b[46] * a[6] - b[57] * a[17] - b[58] * a[18] - b[60] * a[21] + b[ 0] * a[23] - b[63] * a[40] - b[ 3] * a[42] - b[ 5] * a[45] - b[ 6] * a[46] - b[17] * a[57] - b[18] * a[58] - b[21] * a[60] + b[40] * a[63];
    target[24] = b[24] * a[0] + b[43] * a[3] + b[45] * a[4] + b[47] * a[6] - b[57] * a[16] - b[59] * a[18] - b[60] * a[20] + b[ 0] * a[24] - b[63] * a[39] - b[ 3] * a[43] - b[ 4] * a[45] - b[ 6] * a[47] - b[16] * a[57] - b[18] * a[59] - b[20] * a[60] + b[39] * a[63];
    target[25] = b[25] * a[0] + b[44] * a[3] + b[46] * a[4] - b[47] * a[5] - b[58] * a[16] + b[59] * a[17] + b[60] * a[19] + b[ 0] * a[25] + b[63] * a[38] - b[ 3] * a[44] - b[ 4] * a[46] + b[ 5] * a[47] - b[16] * a[58] + b[17] * a[59] + b[19] * a[60] - b[38] * a[63];
    target[26] = b[26] * a[0] - b[42] * a[2] + b[48] * a[5] + b[49] * a[6] + b[57] * a[14] + b[58] * a[15] - b[61] * a[21] + b[ 0] * a[26] + b[63] * a[37] + b[ 2] * a[42] - b[ 5] * a[48] - b[ 6] * a[49] + b[14] * a[57] + b[15] * a[58] - b[21] * a[61] - b[37] * a[63];
    target[27] = b[27] * a[0] - b[43] * a[2] + b[48] * a[4] + b[50] * a[6] + b[57] * a[13] + b[59] * a[15] - b[61] * a[20] + b[ 0] * a[27] + b[63] * a[36] + b[ 2] * a[43] - b[ 4] * a[48] - b[ 6] * a[50] + b[13] * a[57] + b[15] * a[59] - b[20] * a[61] - b[36] * a[63];
    target[28] = b[28] * a[0] - b[44] * a[2] + b[49] * a[4] - b[50] * a[5] + b[58] * a[13] - b[59] * a[14] + b[61] * a[19] + b[ 0] * a[28] - b[63] * a[35] + b[ 2] * a[44] - b[ 4] * a[49] + b[ 5] * a[50] + b[13] * a[58] - b[14] * a[59] + b[19] * a[61] + b[35] * a[63];
    target[29] = b[29] * a[0] - b[45] * a[2] - b[48] * a[3] + b[51] * a[6] - b[57] * a[12] + b[60] * a[15] + b[61] * a[18] + b[ 0] * a[29] - b[63] * a[34] + b[ 2] * a[45] + b[ 3] * a[48] - b[ 6] * a[51] - b[12] * a[57] + b[15] * a[60] + b[18] * a[61] + b[34] * a[63];
    target[30] = b[30] * a[0] - b[46] * a[2] - b[49] * a[3] - b[51] * a[5] - b[58] * a[12] - b[60] * a[14] - b[61] * a[17] + b[ 0] * a[30] + b[63] * a[33] + b[ 2] * a[46] + b[ 3] * a[49] + b[ 5] * a[51] - b[12] * a[58] - b[14] * a[60] - b[17] * a[61] - b[33] * a[63];
    target[31] = b[31] * a[0] - b[47] * a[2] - b[50] * a[3] - b[51] * a[4] - b[59] * a[12] - b[60] * a[13] - b[61] * a[16] + b[ 0] * a[31] + b[63] * a[32] + b[ 2] * a[47] + b[ 3] * a[50] + b[ 4] * a[51] - b[12] * a[59] - b[13] * a[60] - b[16] * a[61] - b[32] * a[63];
    target[32] = b[32] * a[0] + b[42] * a[1] + b[52] * a[5] + b[53] * a[6] - b[57] * a[10] - b[58] * a[11] - b[62] * a[21] - b[63] * a[31] + b[ 0] * a[32] - b[ 1] * a[42] - b[ 5] * a[52] - b[ 6] * a[53] - b[10] * a[57] - b[11] * a[58] - b[21] * a[62] + b[31] * a[63];
    target[33] = b[33] * a[0] + b[43] * a[1] + b[52] * a[4] + b[54] * a[6] - b[57] * a[9] - b[59] * a[11] - b[62] * a[20] - b[63] * a[30] + b[ 0] * a[33] - b[ 1] * a[43] - b[ 4] * a[52] - b[ 6] * a[54] - b[ 9] * a[57] - b[11] * a[59] - b[20] * a[62] + b[30] * a[63];
    target[34] = b[34] * a[0] + b[44] * a[1] + b[53] * a[4] - b[54] * a[5] - b[58] * a[9] + b[59] * a[10] + b[62] * a[19] + b[63] * a[29] + b[ 0] * a[34] - b[ 1] * a[44] - b[ 4] * a[53] + b[ 5] * a[54] - b[ 9] * a[58] + b[10] * a[59] + b[19] * a[62] - b[29] * a[63];
    target[35] = b[35] * a[0] + b[45] * a[1] - b[52] * a[3] + b[55] * a[6] + b[57] * a[8] - b[60] * a[11] + b[62] * a[18] + b[63] * a[28] + b[ 0] * a[35] - b[ 1] * a[45] + b[ 3] * a[52] - b[ 6] * a[55] + b[ 8] * a[57] - b[11] * a[60] + b[18] * a[62] - b[28] * a[63];
    target[36] = b[36] * a[0] + b[46] * a[1] - b[53] * a[3] - b[55] * a[5] + b[58] * a[8] + b[60] * a[10] - b[62] * a[17] - b[63] * a[27] + b[ 0] * a[36] - b[ 1] * a[46] + b[ 3] * a[53] + b[ 5] * a[55] + b[ 8] * a[58] + b[10] * a[60] - b[17] * a[62] + b[27] * a[63];
    target[37] = b[37] * a[0] + b[47] * a[1] - b[54] * a[3] - b[55] * a[4] + b[59] * a[8] + b[60] * a[9] - b[62] * a[16] - b[63] * a[26] + b[ 0] * a[37] - b[ 1] * a[47] + b[ 3] * a[54] + b[ 4] * a[55] + b[ 8] * a[59] + b[ 9] * a[60] - b[16] * a[62] + b[26] * a[63];
    target[38] = b[38] * a[0] + b[48] * a[1] + b[52] * a[2] + b[56] * a[6] - b[57] * a[7] - b[61] * a[11] - b[62] * a[15] - b[63] * a[25] + b[ 0] * a[38] - b[ 1] * a[48] - b[ 2] * a[52] - b[ 6] * a[56] - b[ 7] * a[57] - b[11] * a[61] - b[15] * a[62] + b[25] * a[63];
    target[39] = b[39] * a[0] + b[49] * a[1] + b[53] * a[2] - b[56] * a[5] - b[58] * a[7] + b[61] * a[10] + b[62] * a[14] + b[63] * a[24] + b[ 0] * a[39] - b[ 1] * a[49] - b[ 2] * a[53] + b[ 5] * a[56] - b[ 7] * a[58] + b[10] * a[61] + b[14] * a[62] - b[24] * a[63];
    target[40] = b[40] * a[0] + b[50] * a[1] + b[54] * a[2] - b[56] * a[4] - b[59] * a[7] + b[61] * a[9] + b[62] * a[13] + b[63] * a[23] + b[ 0] * a[40] - b[ 1] * a[50] - b[ 2] * a[54] + b[ 4] * a[56] - b[ 7] * a[59] + b[ 9] * a[61] + b[13] * a[62] - b[23] * a[63];
    target[41] = b[41] * a[0] + b[51] * a[1] + b[55] * a[2] + b[56] * a[3] - b[60] * a[7] - b[61] * a[8] - b[62] * a[12] - b[63] * a[22] + b[ 0] * a[41] - b[ 1] * a[51] - b[ 2] * a[55] - b[ 3] * a[56] - b[ 7] * a[60] - b[ 8] * a[61] - b[12] * a[62] + b[22] * a[63];
    target[42] = b[42] * a[0] - b[57] * a[5] - b[58] * a[6] - b[63] * a[21] + b[ 0] * a[42] - b[ 5] * a[57] - b[ 6] * a[58] - b[21] * a[63];
    target[43] = b[43] * a[0] - b[57] * a[4] - b[59] * a[6] - b[63] * a[20] + b[ 0] * a[43] - b[ 4] * a[57] - b[ 6] * a[59] - b[20] * a[63];
    target[44] = b[44] * a[0] - b[58] * a[4] + b[59] * a[5] + b[63] * a[19] + b[ 0] * a[44] - b[ 4] * a[58] + b[ 5] * a[59] + b[19] * a[63];
    target[45] = b[45] * a[0] + b[57] * a[3] - b[60] * a[6] + b[63] * a[18] + b[ 0] * a[45] + b[ 3] * a[57] - b[ 6] * a[60] + b[18] * a[63];
    target[46] = b[46] * a[0] + b[58] * a[3] + b[60] * a[5] - b[63] * a[17] + b[ 0] * a[46] + b[ 3] * a[58] + b[ 5] * a[60] - b[17] * a[63];
    target[47] = b[47] * a[0] + b[59] * a[3] + b[60] * a[4] - b[63] * a[16] + b[ 0] * a[47] + b[ 3] * a[59] + b[ 4] * a[60] - b[16] * a[63];
    target[48] = b[48] * a[0] - b[57] * a[2] - b[61] * a[6] - b[63] * a[15] + b[ 0] * a[48] - b[ 2] * a[57] - b[ 6] * a[61] - b[15] * a[63];
    target[49] = b[49] * a[0] - b[58] * a[2] + b[61] * a[5] + b[63] * a[14] + b[ 0] * a[49] - b[ 2] * a[58] + b[ 5] * a[61] + b[14] * a[63];
    target[50] = b[50] * a[0] - b[59] * a[2] + b[61] * a[4] + b[63] * a[13] + b[ 0] * a[50] - b[ 2] * a[59] + b[ 4] * a[61] + b[13] * a[63];
    target[51] = b[51] * a[0] - b[60] * a[2] - b[61] * a[3] - b[63] * a[12] + b[ 0] * a[51] - b[ 2] * a[60] - b[ 3] * a[61] - b[12] * a[63];
    target[52] = b[52] * a[0] + b[57] * a[1] - b[62] * a[6] + b[63] * a[11] + b[ 0] * a[52] + b[ 1] * a[57] - b[ 6] * a[62] + b[11] * a[63];
    target[53] = b[53] * a[0] + b[58] * a[1] + b[62] * a[5] - b[63] * a[10] + b[ 0] * a[53] + b[ 1] * a[58] + b[ 5] * a[62] - b[10] * a[63];
    target[54] = b[54] * a[0] + b[59] * a[1] + b[62] * a[4] - b[63] * a[9] + b[ 0] * a[54] + b[ 1] * a[59] + b[ 4] * a[62] - b[ 9] * a[63];
    target[55] = b[55] * a[0] + b[60] * a[1] - b[62] * a[3] + b[63] * a[8] + b[ 0] * a[55] + b[ 1] * a[60] - b[ 3] * a[62] + b[ 8] * a[63];
    target[56] = b[56] * a[0] + b[61] * a[1] + b[62] * a[2] - b[63] * a[7] + b[ 0] * a[56] + b[ 1] * a[61] + b[ 2] * a[62] - b[ 7] * a[63];
    target[57] = b[57] * a[0] + b[63] * a[6] + b[ 0] * a[57] - b[ 6] * a[63];
    target[58] = b[58] * a[0] - b[63] * a[5] + b[ 0] * a[58] + b[ 5] * a[63];
    target[59] = b[59] * a[0] - b[63] * a[4] + b[ 0] * a[59] + b[ 4] * a[63];
    target[60] = b[60] * a[0] + b[63] * a[3] + b[ 0] * a[60] - b[ 3] * a[63];
    target[61] = b[61] * a[0] - b[63] * a[2] + b[ 0] * a[61] + b[ 2] * a[63];
    target[62] = b[62] * a[0] + b[63] * a[1] + b[ 0] * a[62] - b[ 1] * a[63];
    target[63] = b[63] * a[0] + b[ 0] * a[63];
    return target;
}