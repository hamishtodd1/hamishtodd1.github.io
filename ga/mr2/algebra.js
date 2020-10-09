const gaShaderString = `
    struct dualQuaternion {
        float scalar;
        vec3 euclideanBiv;
        vec3 idealBiv;
        float pss;
    };

    dualQuaternion reverse(dualQuaternion dq) {
        dualQuaternion res;
        res.scalar = dq.scalar;
        res.euclideanBiv = -dq.euclideanBiv;
        res.idealBiv = -dq.idealBiv;
        res.pss = dq.pss;
        return res;
    };

    vec4 pSandwichDq(vec4 p, dualQuaternion dq) {
        return product(dq,product(p,reverse(dq)));
    }

    vec4 vectorDualQuaternion(vec4 p, dualQuaternion dq) {
        //a -> p [0.,w,x,y,z,0.,0.,0....]
        //b -> dq
        res[ 0]=b[ 0]*a[ 0] + b[ 2]*a[ 2] + b[ 3]*a[ 3] + b[ 4]*a[ 4] - b[ 8]*a[ 8] - b[ 9]*a[ 9] - b[10]*a[10] - b[14]*a[14];

        res[ 1]=b[ 1]*a[ 0] + b[ 0]*a[ 1] - b[ 5]*a[ 2] - b[ 6]*a[ 3] - b[ 7]*a[ 4] + b[ 2]*a[ 5] + b[ 3]*a[ 6] + b[ 4]*a[ 7] + b[11]*a[ 8] + b[12]*a[ 9] + b[13]*a[10] + b[ 8]*a[11] + b[ 9]*a[12] + b[10]*a[13] + b[15]*a[14] - b[14]*a[15];
        res[ 2]=b[ 2]*a[ 0] + b[ 0]*a[ 2] - b[ 8]*a[ 3] + b[ 9]*a[ 4] + b[ 3]*a[ 8] - b[ 4]*a[ 9] - b[14]*a[10] - b[10]*a[14];
        res[ 3]=b[ 3]*a[ 0] + b[ 8]*a[ 2] + b[ 0]*a[ 3] - b[10]*a[ 4] - b[ 2]*a[ 8] - b[14]*a[ 9] + b[ 4]*a[10] - b[ 9]*a[14];
        res[ 4]=b[ 4]*a[ 0] - b[ 9]*a[ 2] + b[10]*a[ 3] + b[ 0]*a[ 4] - b[14]*a[ 8] + b[ 2]*a[ 9] - b[ 3]*a[10] - b[ 8]*a[14];
        
        res[ 5]=b[ 5]*a[ 0] + b[ 2]*a[ 1] - b[ 1]*a[ 2] - b[11]*a[ 3] + b[12]*a[ 4] + b[ 0]*a[ 5] - b[ 8]*a[ 6] + b[ 9]*a[ 7] + b[ 6]*a[ 8] - b[ 7]*a[ 9] - b[15]*a[10] - b[ 3]*a[11] + b[ 4]*a[12] + b[14]*a[13] - b[13]*a[14] - b[10]*a[15];
        res[ 6]=b[ 6]*a[ 0] + b[ 3]*a[ 1] + b[11]*a[ 2] - b[ 1]*a[ 3] - b[13]*a[ 4] + b[ 8]*a[ 5] + b[ 0]*a[ 6] - b[10]*a[ 7] - b[ 5]*a[ 8] - b[15]*a[ 9] + b[ 7]*a[10] + b[ 2]*a[11] + b[14]*a[12] - b[ 4]*a[13] - b[12]*a[14] - b[ 9]*a[15];
        res[ 7]=b[ 7]*a[ 0] + b[ 4]*a[ 1] - b[12]*a[ 2] + b[13]*a[ 3] - b[ 1]*a[ 4] - b[ 9]*a[ 5] + b[10]*a[ 6] + b[ 0]*a[ 7] - b[15]*a[ 8] + b[ 5]*a[ 9] - b[ 6]*a[10] + b[14]*a[11] - b[ 2]*a[12] + b[ 3]*a[13] - b[11]*a[14] - b[ 8]*a[15];
        res[ 8]=b[ 8]*a[ 0] + b[ 3]*a[ 2] - b[ 2]*a[ 3] + b[14]*a[ 4] + b[ 0]*a[ 8] + b[10]*a[ 9] - b[ 9]*a[10] + b[ 4]*a[14];
        res[ 9]=b[ 9]*a[ 0] - b[ 4]*a[ 2] + b[14]*a[ 3] + b[ 2]*a[ 4] - b[10]*a[ 8] + b[ 0]*a[ 9] + b[ 8]*a[10] + b[ 3]*a[14];
        res[10]=b[10]*a[ 0] + b[14]*a[ 2] + b[ 4]*a[ 3] - b[ 3]*a[ 4] + b[ 9]*a[ 8] - b[ 8]*a[ 9] + b[ 0]*a[10] + b[ 2]*a[14];
        res[11]=b[11]*a[ 0] - b[ 8]*a[ 1] + b[ 6]*a[ 2] - b[ 5]*a[ 3] + b[15]*a[ 4] - b[ 3]*a[ 5] + b[ 2]*a[ 6] - b[14]*a[ 7] - b[ 1]*a[ 8] + b[13]*a[ 9] - b[12]*a[10] + b[ 0]*a[11] + b[10]*a[12] - b[ 9]*a[13] + b[ 7]*a[14] - b[ 4]*a[15];
        res[12]=b[12]*a[ 0] - b[ 9]*a[ 1] - b[ 7]*a[ 2] + b[15]*a[ 3] + b[ 5]*a[ 4] + b[ 4]*a[ 5] - b[14]*a[ 6] - b[ 2]*a[ 7] - b[13]*a[ 8] - b[ 1]*a[ 9] + b[11]*a[10] - b[10]*a[11] + b[ 0]*a[12] + b[ 8]*a[13] + b[ 6]*a[14] - b[ 3]*a[15];
        res[13]=b[13]*a[ 0] - b[10]*a[ 1] + b[15]*a[ 2] + b[ 7]*a[ 3] - b[ 6]*a[ 4] - b[14]*a[ 5] - b[ 4]*a[ 6] + b[ 3]*a[ 7] + b[12]*a[ 8] - b[11]*a[ 9] - b[ 1]*a[10] + b[ 9]*a[11] - b[ 8]*a[12] + b[ 0]*a[13] + b[ 5]*a[14] - b[ 2]*a[15];
        res[14]=b[14]*a[ 0] + b[10]*a[ 2] + b[ 9]*a[ 3] + b[ 8]*a[ 4] + b[ 4]*a[ 8] + b[ 3]*a[ 9] + b[ 2]*a[10] + b[ 0]*a[14];
        res[15]=b[15]*a[ 0] + b[14]*a[ 1] + b[13]*a[ 2] + b[12]*a[ 3] + b[11]*a[ 4] + b[10]*a[ 5] + b[ 9]*a[ 6] + b[ 8]*a[ 7] + b[ 7]*a[ 8] + b[ 6]*a[ 9] + b[ 5]*a[10] - b[ 4]*a[11] - b[ 3]*a[12] - b[ 2]*a[13] - b[ 1]*a[14] + b[0]*a[15];
        return res;
    };
`