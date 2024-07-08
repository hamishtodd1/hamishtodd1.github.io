// Reverse
inline R111 operator ~ (const R111 &a) {
    R111 res;
    res[0]=a[0];
    res[1]=a[1];
    res[2]=a[2];
    res[3]=a[3];
    res[4]=-a[4];
    res[5]=-a[5];
    res[6]=-a[6];
    res[7]=-a[7];
    return res;
}

// geometric product.
inline R111 operator * (const R111 &a, const R111 &b) {
    R111 res;
    res[0]=b[0]*a[0]+b[2]*a[2]-b[3]*a[3]+b[6]*a[6];
    res[1]=b[1]*a[0]+b[0]*a[1]-b[4]*a[2]+b[5]*a[3]+b[2]*a[4]-b[3]*a[5]+b[7]*a[6]+b[6]*a[7];
    res[2]=b[2]*a[0]+b[0]*a[2]+b[6]*a[3]-b[3]*a[6];
    res[3]=b[3]*a[0]+b[6]*a[2]+b[0]*a[3]-b[2]*a[6];
    res[4]=b[4]*a[0]+b[2]*a[1]-b[1]*a[2]-b[7]*a[3]+b[0]*a[4]+b[6]*a[5]-b[5]*a[6]-b[3]*a[7];
    res[5]=b[5]*a[0]+b[3]*a[1]-b[7]*a[2]-b[1]*a[3]+b[6]*a[4]+b[0]*a[5]-b[4]*a[6]-b[2]*a[7];
    res[6]=b[6]*a[0]+b[3]*a[2]-b[2]*a[3]+b[0]*a[6];
    res[7]=b[7]*a[0]+b[6]*a[1]-b[5]*a[2]+b[4]*a[3]+b[3]*a[4]-b[2]*a[5]+b[1]*a[6]+b[0]*a[7];
    return res;
}

// outer product. (MEET)
inline R111 operator ^ (const R111 &a, const R111 &b) {
    R111 res;
    res[0]=b[0]*a[0];
    res[1]=b[1]*a[0]+b[0]*a[1];
    res[2]=b[2]*a[0]+b[0]*a[2];
    res[3]=b[3]*a[0]+b[0]*a[3];
    res[4]=b[4]*a[0]+b[2]*a[1]-b[1]*a[2]+b[0]*a[4];
    res[5]=b[5]*a[0]+b[3]*a[1]-b[1]*a[3]+b[0]*a[5];
    res[6]=b[6]*a[0]+b[3]*a[2]-b[2]*a[3]+b[0]*a[6];
    res[7]=b[7]*a[0]+b[6]*a[1]-b[5]*a[2]+b[4]*a[3]+b[3]*a[4]-b[2]*a[5]+b[1]*a[6]+b[0]*a[7];
    return res;
}

// regressive product. (JOIN)
inline R111 operator & (const R111 &a, const R111 &b) {
    R111 res;
    res[7] = a[7]*b[7]
    res[6] = a[6]*b[7]+a[7]*b[6]
    res[5] = -1*(a[5]*-1*b[7]+a[7]*b[5]*-1);
    res[4] = a[4]*b[7]+a[7]*b[4]
    res[3] = a[3]*b[7]+a[5]*-1*b[6]-a[6]*b[5]*-1+a[7]*b[3]
    res[2] = -1*(a[2]*-1*b[7]+a[4]*b[6]-a[6]*b[4]+a[7]*b[2]*-1);
    res[1] = a[1]*b[7]+a[4]*b[5]*-1-a[5]*-1*b[4]+a[7]*b[1]
    res[0] = a[0]*b[7]+a[1]*b[6]-a[2]*-1*b[5]*-1+a[3]*b[4]+a[4]*b[3]-a[5]*-1*b[2]*-1+a[6]*b[1]+a[7]*b[0]
    return res;
}

// inner product
inline R111 operator | (const R111 &a, const R111 &b) {
    R111 res;
    res[0]=b[0]*a[0]+b[2]*a[2]-b[3]*a[3]+b[6]*a[6];
    res[1]=b[1]*a[0]+b[0]*a[1]-b[4]*a[2]+b[5]*a[3]+b[2]*a[4]-b[3]*a[5]+b[7]*a[6]+b[6]*a[7];
    res[2]=b[2]*a[0]+b[0]*a[2]+b[6]*a[3]-b[3]*a[6];
    res[3]=b[3]*a[0]+b[6]*a[2]+b[0]*a[3]-b[2]*a[6];
    res[4]=b[4]*a[0]-b[7]*a[3]+b[0]*a[4]-b[3]*a[7];
    res[5]=b[5]*a[0]-b[7]*a[2]+b[0]*a[5]-b[2]*a[7];
    res[6]=b[6]*a[0]+b[0]*a[6];
    res[7]=b[7]*a[0]+b[0]*a[7];
    return res;
}