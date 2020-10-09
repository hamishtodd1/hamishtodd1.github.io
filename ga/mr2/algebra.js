const gaShaderString = `
    struct dualQuaternion {
        float scalar;
        vec3 euclideanLine;
        vec3 idealLine;
        float pss;
    };

    float mv0[16];
    float mv1[16];
    float mv2[16];
    float mv3[16];

    void reverse(inout dualQuaternion dq) {
        dq.scalar = dq.scalar;
        dq.euclideanLine = -dq.euclideanLine;
        dq.idealLine = -dq.idealLine;
        dq.pss = dq.pss;
    }
    void reverse(inout float mv[16]) {
        mv[5] *= -1.;
        mv[6] *= -1.;
        mv[7] *= -1.;
        mv[8] *= -1.;
        mv[9] *= -1.;
        mv[10] *= -1.;

        mv[11] *= -1.;
        mv[12] *= -1.;
        mv[13] *= -1.;
        mv[14] *= -1.;
    }

    float lineLength(dualQuaternion dq) {
        return length()
    }

    void zeroMv(inout float mv[16]) {
        mv[ 0] = 0.;mv[ 1] = 0.;mv[ 2] = 0.;mv[ 3] = 0.;mv[ 4] = 0.;mv[ 5] = 0.;mv[ 6] = 0.;mv[ 7] = 0.;mv[ 8] = 0.;mv[ 9] = 0.;mv[10] = 0.;mv[11] = 0.;mv[12] = 0.;mv[13] = 0.;mv[14] = 0.;mv[15] = 0.;
    }
    void zeroDq(inout dualQuaternion dq) {
        dq.scalar = 0.;
        dq.idealLine.x = 0.;dq.idealLine.y = 0.;dq.idealLine.z = 0.;
        dq.euclideanLine.x = 0.;dq.euclideanLine.y = 0.;dq.euclideanLine.z = 0.;
        dq.pss = 0.;
    }
    void pointToMv(vec4 p, inout float mv[16]) {
        zeroMv(mv);
        mv[14] = p.w;
        mv[13] = p.x;
        mv[12] = p.y;
        mv[11] = p.z;
    }
    vec4 mvToPoint(float mv[16]) {
        return vec4( mv[13],mv[12],mv[11],mv[14] );
    }
    void dualQuaternionToMv(dualQuaternion dq, inout float mv[16]) {
        zeroMv(mv);
        mv[0] = dq.scalar;

        mv[5] = dq.idealLine.x;
        mv[6] = dq.idealLine.y;
        mv[7] = dq.idealLine.z;
        //errr, don't get too used to this kind of thing
        mv[8] = dq.euclideanLine.z;
        mv[9] = dq.euclideanLine.y;
        mv[10] = dq.euclideanLine.x;

        mv[15] = dq.pss;
    }

    dualQuaternion rotator(dualQuaternion dq,float angle) {
        dualQuaternion res;
        zeroDq(res);
        res.scalar = cos(angle/2.);
        float sin = sin(angle/2.);
        res.euclideanLine.x = sin * dq.euclideanLine.x;
        res.euclideanLine.y = sin * dq.euclideanLine.y;
        res.euclideanLine.z = sin * dq.euclideanLine.z;
        return res;
    }

    //mv should probably be more like a struct
    void gp(float a[16],float b[16],inout float mv[16]) {
        mv[ 0]=b[ 0]*a[ 0] + b[ 2]*a[ 2] + b[ 3]*a[ 3] + b[ 4]*a[ 4] - b[ 8]*a[ 8] - b[ 9]*a[ 9] - b[10]*a[10] - b[14]*a[14];

        mv[ 1]=b[ 1]*a[ 0] + b[ 0]*a[ 1] - b[ 5]*a[ 2] - b[ 6]*a[ 3] - b[ 7]*a[ 4] + b[ 2]*a[ 5] + b[ 3]*a[ 6] + b[ 4]*a[ 7] + b[11]*a[ 8] + b[12]*a[ 9] + b[13]*a[10] + b[ 8]*a[11] + b[ 9]*a[12] + b[10]*a[13] + b[15]*a[14] - b[14]*a[15];
        mv[ 2]=b[ 2]*a[ 0] + b[ 0]*a[ 2] - b[ 8]*a[ 3] + b[ 9]*a[ 4] + b[ 3]*a[ 8] - b[ 4]*a[ 9] - b[14]*a[10] - b[10]*a[14];
        mv[ 3]=b[ 3]*a[ 0] + b[ 8]*a[ 2] + b[ 0]*a[ 3] - b[10]*a[ 4] - b[ 2]*a[ 8] - b[14]*a[ 9] + b[ 4]*a[10] - b[ 9]*a[14];
        mv[ 4]=b[ 4]*a[ 0] - b[ 9]*a[ 2] + b[10]*a[ 3] + b[ 0]*a[ 4] - b[14]*a[ 8] + b[ 2]*a[ 9] - b[ 3]*a[10] - b[ 8]*a[14];
        
        mv[ 5]=b[ 5]*a[ 0] + b[ 2]*a[ 1] - b[ 1]*a[ 2] - b[11]*a[ 3] + b[12]*a[ 4] + b[ 0]*a[ 5] - b[ 8]*a[ 6] + b[ 9]*a[ 7] + b[ 6]*a[ 8] - b[ 7]*a[ 9] - b[15]*a[10] - b[ 3]*a[11] + b[ 4]*a[12] + b[14]*a[13] - b[13]*a[14] - b[10]*a[15];
        mv[ 6]=b[ 6]*a[ 0] + b[ 3]*a[ 1] + b[11]*a[ 2] - b[ 1]*a[ 3] - b[13]*a[ 4] + b[ 8]*a[ 5] + b[ 0]*a[ 6] - b[10]*a[ 7] - b[ 5]*a[ 8] - b[15]*a[ 9] + b[ 7]*a[10] + b[ 2]*a[11] + b[14]*a[12] - b[ 4]*a[13] - b[12]*a[14] - b[ 9]*a[15];
        mv[ 7]=b[ 7]*a[ 0] + b[ 4]*a[ 1] - b[12]*a[ 2] + b[13]*a[ 3] - b[ 1]*a[ 4] - b[ 9]*a[ 5] + b[10]*a[ 6] + b[ 0]*a[ 7] - b[15]*a[ 8] + b[ 5]*a[ 9] - b[ 6]*a[10] + b[14]*a[11] - b[ 2]*a[12] + b[ 3]*a[13] - b[11]*a[14] - b[ 8]*a[15];
        mv[ 8]=b[ 8]*a[ 0] + b[ 3]*a[ 2] - b[ 2]*a[ 3] + b[14]*a[ 4] + b[ 0]*a[ 8] + b[10]*a[ 9] - b[ 9]*a[10] + b[ 4]*a[14];
        mv[ 9]=b[ 9]*a[ 0] - b[ 4]*a[ 2] + b[14]*a[ 3] + b[ 2]*a[ 4] - b[10]*a[ 8] + b[ 0]*a[ 9] + b[ 8]*a[10] + b[ 3]*a[14];
        mv[10]=b[10]*a[ 0] + b[14]*a[ 2] + b[ 4]*a[ 3] - b[ 3]*a[ 4] + b[ 9]*a[ 8] - b[ 8]*a[ 9] + b[ 0]*a[10] + b[ 2]*a[14];

        mv[11]=b[11]*a[ 0] - b[ 8]*a[ 1] + b[ 6]*a[ 2] - b[ 5]*a[ 3] + b[15]*a[ 4] - b[ 3]*a[ 5] + b[ 2]*a[ 6] - b[14]*a[ 7] - b[ 1]*a[ 8] + b[13]*a[ 9] - b[12]*a[10] + b[ 0]*a[11] + b[10]*a[12] - b[ 9]*a[13] + b[ 7]*a[14] - b[ 4]*a[15];
        mv[12]=b[12]*a[ 0] - b[ 9]*a[ 1] - b[ 7]*a[ 2] + b[15]*a[ 3] + b[ 5]*a[ 4] + b[ 4]*a[ 5] - b[14]*a[ 6] - b[ 2]*a[ 7] - b[13]*a[ 8] - b[ 1]*a[ 9] + b[11]*a[10] - b[10]*a[11] + b[ 0]*a[12] + b[ 8]*a[13] + b[ 6]*a[14] - b[ 3]*a[15];
        mv[13]=b[13]*a[ 0] - b[10]*a[ 1] + b[15]*a[ 2] + b[ 7]*a[ 3] - b[ 6]*a[ 4] - b[14]*a[ 5] - b[ 4]*a[ 6] + b[ 3]*a[ 7] + b[12]*a[ 8] - b[11]*a[ 9] - b[ 1]*a[10] + b[ 9]*a[11] - b[ 8]*a[12] + b[ 0]*a[13] + b[ 5]*a[14] - b[ 2]*a[15];
        mv[14]=b[14]*a[ 0] + b[10]*a[ 2] + b[ 9]*a[ 3] + b[ 8]*a[ 4] + b[ 4]*a[ 8] + b[ 3]*a[ 9] + b[ 2]*a[10] + b[ 0]*a[14];

        mv[15]=b[15]*a[ 0] + b[14]*a[ 1] + b[13]*a[ 2] + b[12]*a[ 3] + b[11]*a[ 4] + b[10]*a[ 5] + b[ 9]*a[ 6] + b[ 8]*a[ 7] + b[ 7]*a[ 8] + b[ 6]*a[ 9] + b[ 5]*a[10] - b[ 4]*a[11] - b[ 3]*a[12] - b[ 2]*a[13] - b[ 1]*a[14] + b[0]*a[15];
    }

    //point dual quaternion only
    void sandwich(inout vec4 p, dualQuaternion dq) {
        dualQuaternionToMv(dq,mv0);
        pointToMv(p,mv1);

        //dq p
        gp(mv0,mv1,mv2);

        //p ~dq
        reverse(mv0);
        gp(mv2,mv0,mv3);

        p = mvToPoint(mv3);
    }
`