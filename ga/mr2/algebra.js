//if you visualize the line as having a length and direction, well, sounds like a vector mate
//at least it's not a vectors that's stuck at the origin

function initAlgebra()
{
    function replaceSignature(newSignature,func) {
        let jsString = func.toString()
        let firstLinebreakIndex = jsString.indexOf("\n")
        let bodyString = jsString.substring(firstLinebreakIndex)
        return newSignature + bodyString
    }
    function appendToGaShaderString(glslString) {
        gaShaderString += "\n" + glslString + "\n"
    }

    gaShaderString = ""

    isMv = function(thing) {
        return thing instanceof Float32Array && thing.length === 16
    }

    parseMv = function (str, target) {
        let valuesArr = str.split(",")
        for (let i = 0; i < 16; ++i)
            target[i] = parseFloat(valuesArr[i])
    }

    //mv
    {
        mv0 = new Float32Array(16)
        mv1 = new Float32Array(16)
        mv2 = new Float32Array(16)
        mv3 = new Float32Array(16)
        appendToGaShaderString( `
            float mv0[16];
            float mv1[16];
            float mv2[16];
            float mv3[16];` )
            
        appendToGaShaderString(replaceSignature(
            "void gp(float a[16],float b[16],inout float target[16])",
            gp = (a, b, target) =>
            {
                target[ 0] = b[ 0] * a[ 0] + b[ 2] * a[ 2] + b[ 3] * a[ 3] + b[ 4] * a[ 4] - b[ 8] * a[ 8] - b[ 9] * a[ 9] - b[10] * a[10] - b[14] * a[14];

                target[ 1] = b[ 1] * a[ 0] + b[ 0] * a[ 1] - b[ 5] * a[ 2] - b[ 6] * a[ 3] - b[ 7] * a[ 4] + b[ 2] * a[ 5] + b[ 3] * a[ 6] + b[ 4] * a[ 7] + b[11] * a[ 8] + b[12] * a[ 9] + b[13] * a[10] + b[ 8] * a[11] + b[ 9] * a[12] + b[10] * a[13] + b[15] * a[14] - b[14] * a[15];
                target[ 2] = b[ 2] * a[ 0] + b[ 0] * a[ 2] - b[ 8] * a[ 3] + b[ 9] * a[ 4] + b[ 3] * a[ 8] - b[ 4] * a[ 9] - b[14] * a[10] - b[10] * a[14];
                target[ 3] = b[ 3] * a[ 0] + b[ 8] * a[ 2] + b[ 0] * a[ 3] - b[10] * a[ 4] - b[ 2] * a[ 8] - b[14] * a[ 9] + b[ 4] * a[10] - b[ 9] * a[14];
                target[ 4] = b[ 4] * a[ 0] - b[ 9] * a[ 2] + b[10] * a[ 3] + b[ 0] * a[ 4] - b[14] * a[ 8] + b[ 2] * a[ 9] - b[ 3] * a[10] - b[ 8] * a[14];

                target[ 5] = b[ 5] * a[ 0] + b[ 2] * a[ 1] - b[ 1] * a[ 2] - b[11] * a[ 3] + b[12] * a[ 4] + b[ 0] * a[ 5] - b[ 8] * a[ 6] + b[ 9] * a[ 7] + b[ 6] * a[ 8] - b[ 7] * a[ 9] - b[15] * a[10] - b[ 3] * a[11] + b[ 4] * a[12] + b[14] * a[13] - b[13] * a[14] - b[10] * a[15];
                target[ 6] = b[ 6] * a[ 0] + b[ 3] * a[ 1] + b[11] * a[ 2] - b[ 1] * a[ 3] - b[13] * a[ 4] + b[ 8] * a[ 5] + b[ 0] * a[ 6] - b[10] * a[ 7] - b[ 5] * a[ 8] - b[15] * a[ 9] + b[ 7] * a[10] + b[ 2] * a[11] + b[14] * a[12] - b[ 4] * a[13] - b[12] * a[14] - b[ 9] * a[15];
                target[ 7] = b[ 7] * a[ 0] + b[ 4] * a[ 1] - b[12] * a[ 2] + b[13] * a[ 3] - b[ 1] * a[ 4] - b[ 9] * a[ 5] + b[10] * a[ 6] + b[ 0] * a[ 7] - b[15] * a[ 8] + b[ 5] * a[ 9] - b[ 6] * a[10] + b[14] * a[11] - b[ 2] * a[12] + b[ 3] * a[13] - b[11] * a[14] - b[ 8] * a[15];
                target[ 8] = b[ 8] * a[ 0] + b[ 3] * a[ 2] - b[ 2] * a[ 3] + b[14] * a[ 4] + b[ 0] * a[ 8] + b[10] * a[ 9] - b[ 9] * a[10] + b[ 4] * a[14];
                target[ 9] = b[ 9] * a[ 0] - b[ 4] * a[ 2] + b[14] * a[ 3] + b[ 2] * a[ 4] - b[10] * a[ 8] + b[ 0] * a[ 9] + b[ 8] * a[10] + b[ 3] * a[14];
                target[10] = b[10] * a[ 0] + b[14] * a[ 2] + b[ 4] * a[ 3] - b[ 3] * a[ 4] + b[ 9] * a[ 8] - b[ 8] * a[ 9] + b[ 0] * a[10] + b[ 2] * a[14];

                target[11] = b[11] * a[ 0] - b[ 8] * a[ 1] + b[ 6] * a[ 2] - b[ 5] * a[ 3] + b[15] * a[ 4] - b[ 3] * a[ 5] + b[ 2] * a[ 6] - b[14] * a[ 7] - b[ 1] * a[ 8] + b[13] * a[ 9] - b[12] * a[10] + b[ 0] * a[11] + b[10] * a[12] - b[ 9] * a[13] + b[ 7] * a[14] - b[ 4] * a[15];
                target[12] = b[12] * a[ 0] - b[ 9] * a[ 1] - b[ 7] * a[ 2] + b[15] * a[ 3] + b[ 5] * a[ 4] + b[ 4] * a[ 5] - b[14] * a[ 6] - b[ 2] * a[ 7] - b[13] * a[ 8] - b[ 1] * a[ 9] + b[11] * a[10] - b[10] * a[11] + b[ 0] * a[12] + b[ 8] * a[13] + b[ 6] * a[14] - b[ 3] * a[15];
                target[13] = b[13] * a[ 0] - b[10] * a[ 1] + b[15] * a[ 2] + b[ 7] * a[ 3] - b[ 6] * a[ 4] - b[14] * a[ 5] - b[ 4] * a[ 6] + b[ 3] * a[ 7] + b[12] * a[ 8] - b[11] * a[ 9] - b[ 1] * a[10] + b[ 9] * a[11] - b[ 8] * a[12] + b[ 0] * a[13] + b[ 5] * a[14] - b[ 2] * a[15];
                target[14] = b[14] * a[ 0] + b[10] * a[ 2] + b[ 9] * a[ 3] + b[ 8] * a[ 4] + b[ 4] * a[ 8] + b[ 3] * a[ 9] + b[ 2] * a[10] + b[ 0] * a[14];

                target[15] = b[15] * a[ 0] + b[14] * a[ 1] + b[13] * a[ 2] + b[12] * a[ 3] + b[11] * a[ 4] + b[10] * a[ 5] + b[ 9] * a[ 6] + b[ 8] * a[ 7] + b[ 7] * a[ 8] + b[ 6] * a[ 9] + b[ 5] * a[10] - b[ 4] * a[11] - b[ 3] * a[12] - b[ 2] * a[13] - b[ 1] * a[14] + b[ 0] * a[15];
            }
            ))

        appendToGaShaderString(replaceSignature(
            "void join(float a[16], float b[16], inout float target[16])",
            join = (a, b, target) =>
            {
                target[15] = a[15] * b[15];
                target[14] =-a[14] * b[15] - a[15] * b[14];
                target[13] =-a[13] * b[15] - a[15] * b[13];
                target[12] =-a[12] * b[15] - a[15] * b[12];
                target[11] =-a[11] * b[15] - a[15] * b[11];
                target[10] = a[10] * b[15] + a[13] * b[14] - a[14] * b[13] + a[15] * b[10];
                target[ 9] = a[ 9] * b[15] + a[12] * b[14] - a[14] * b[12] + a[15] * b[ 9];
                target[ 8] = a[ 8] * b[15] + a[11] * b[14] - a[14] * b[11] + a[15] * b[ 8];
                target[ 7] = a[ 7] * b[15] + a[12] * b[13] - a[13] * b[12] + a[15] * b[ 7];
                target[ 6] = a[ 6] * b[15] - a[11] * b[13] + a[13] * b[11] + a[15] * b[ 6];
                target[ 5] = a[ 5] * b[15] + a[11] * b[12] - a[12] * b[11] + a[15] * b[ 5];
                target[ 4] = a[ 4] * b[15] - a[ 7] * b[14] + a[ 9] * b[13] - a[10] * b[12] + a[12] * b[10] - a[13] * b[ 9] + a[14] * b[ 7] + a[15] * b[ 4];
                target[ 3] = a[ 3] * b[15] - a[ 6] * b[14] - a[ 8] * b[13] + a[10] * b[11] - a[11] * b[10] + a[13] * b[ 8] + a[14] * b[ 6] + a[15] * b[ 3];
                target[ 2] = a[ 2] * b[15] - a[ 5] * b[14] + a[ 8] * b[12] - a[ 9] * b[11] + a[11] * b[ 9] - a[12] * b[ 8] + a[14] * b[ 5] + a[15] * b[ 2];
                target[ 1] = a[ 1] * b[15] + a[ 5] * b[13] + a[ 6] * b[12] + a[ 7] * b[11] - a[11] * b[ 7] - a[12] * b[ 6] - a[13] * b[ 5] + a[15] * b[ 1];
                target[ 0] = a[ 0] * b[15] + a[ 1] * b[14] + a[ 2] * b[13] + a[ 3] * b[12] - a[ 4] * b[11] + a[ 5] * b[10] + a[ 6] * b[ 9] + a[ 7] * b[ 8]
                       + a[ 8] * b[ 7] + a[ 9] * b[ 6] + a[10] * b[ 5] + a[11] * b[ 4] + a[12] * b[ 3] + a[13] * b[ 2] + a[14] * b[ 1] + a[15] * b[ 0];
            }
            ))
        
        appendToGaShaderString(replaceSignature(
            "void meet(float a[16], float b[16], inout float target[16])",
            meet = (a, b, target) =>
            {
                target[0]=b[0]*a[0];
                target[1]=b[1]*a[0]+b[0]*a[1];
                target[2]=b[2]*a[0]+b[0]*a[2];
                target[3]=b[3]*a[0]+b[0]*a[3];
                target[4]=b[4]*a[0]+b[0]*a[4];
                target[5]=b[5]*a[0]+b[2]*a[1]-b[1]*a[2]+b[0]*a[5];
                target[6]=b[6]*a[0]+b[3]*a[1]-b[1]*a[3]+b[0]*a[6];
                target[7]=b[7]*a[0]+b[4]*a[1]-b[1]*a[4]+b[0]*a[7];
                target[8]=b[8]*a[0]+b[3]*a[2]-b[2]*a[3]+b[0]*a[8];
                target[9]=b[9]*a[0]-b[4]*a[2]+b[2]*a[4]+b[0]*a[9];
                target[10]=b[10]*a[0]+b[4]*a[3]-b[3]*a[4]+b[0]*a[10];
                target[11]=b[11]*a[0]-b[8]*a[1]+b[6]*a[2]-b[5]*a[3]-b[3]*a[5]+b[2]*a[6]-b[1]*a[8]+b[0]*a[11];
                target[12]=b[12]*a[0]-b[9]*a[1]-b[7]*a[2]+b[5]*a[4]+b[4]*a[5]-b[2]*a[7]-b[1]*a[9]+b[0]*a[12];
                target[13]=b[13]*a[0]-b[10]*a[1]+b[7]*a[3]-b[6]*a[4]-b[4]*a[6]+b[3]*a[7]-b[1]*a[10]+b[0]*a[13];
                target[14]=b[14]*a[0]+b[10]*a[2]+b[9]*a[3]+b[8]*a[4]+b[4]*a[8]+b[3]*a[9]+b[2]*a[10]+b[0]*a[14];
                target[15]=b[15]*a[0]+b[14]*a[1]+b[13]*a[2]+b[12]*a[3]+b[11]*a[4]+b[10]*a[5]+b[9]*a[6]+b[8]*a[7]+b[7]*a[8]+b[6]*a[9]+b[5]*a[10]-b[4]*a[11]-b[3]*a[12]-b[2]*a[13]-b[1]*a[14]+b[0]*a[15];
            }
        ))

        appendToGaShaderString(replaceSignature(
            "void reverse( float mv[16], out float target[16])",
            reverse = (mv, target) =>
            {
                target[ 0] =  mv[ 0];
                target[ 1] =  mv[ 1];
                target[ 2] =  mv[ 2];
                target[ 3] =  mv[ 3];
                target[ 4] =  mv[ 4];

                target[ 5] = -mv[ 5];
                target[ 6] = -mv[ 6];
                target[ 7] = -mv[ 7];
                target[ 8] = -mv[ 8];
                target[ 9] = -mv[ 9];
                target[10] = -mv[10];
                target[11] = -mv[11];
                target[12] = -mv[12];
                target[13] = -mv[13];
                target[14] = -mv[14];

                target[15] =  mv[15];
            }
        ))

        // dual = (mv) => {
        //     let temp = 0.
        //     for(let i = 0; i < 16; ++i) {
        //         temp = mv[i]
        //         mv[i] = mv[16 - i]
        //         mv[16 - i] = temp
        //     }
        // }

        appendToGaShaderString(replaceSignature(
            "void zeroMv(inout float mv[16])",
            zeroMv = (mv) =>
            {
                mv[ 0] = 0.; mv[ 1] = 0.; mv[ 2] = 0.; mv[ 3] = 0.; mv[ 4] = 0.; mv[ 5] = 0.; mv[ 6] = 0.; mv[ 7] = 0.; mv[ 8] = 0.; mv[ 9] = 0.; mv[10] = 0.; mv[11] = 0.; mv[12] = 0.; mv[13] = 0.; mv[14] = 0.; mv[15] = 0.;
            }))

        appendToGaShaderString(replaceSignature(
            "void gAdd(float a[16], float b[16], inout float target[16])",
            gAdd = (a,b,target) =>
            {
                target[ 0] = a[ 0] + b[ 0];
                target[ 1] = a[ 1] + b[ 1];
                target[ 2] = a[ 2] + b[ 2];
                target[ 3] = a[ 3] + b[ 3];
                target[ 4] = a[ 4] + b[ 4];
                target[ 5] = a[ 5] + b[ 5];
                target[ 6] = a[ 6] + b[ 6];
                target[ 7] = a[ 7] + b[ 7];
                target[ 8] = a[ 8] + b[ 8];
                target[ 9] = a[ 9] + b[ 9];
                target[10] = a[10] + b[10];
                target[11] = a[11] + b[11];
                target[12] = a[12] + b[12];
                target[13] = a[13] + b[13];
                target[14] = a[14] + b[14];
                target[15] = a[15] + b[15];
            }
            ))

        appendToGaShaderString(replaceSignature(
            "void gSub(float a[16], float b[16], inout float mv[16])",
            gSub = (a, b, mv) =>
            {
                mv[0] = a[0] - b[0];
                mv[1] = a[1] - b[1];
                mv[2] = a[2] - b[2];
                mv[3] = a[3] - b[3];
                mv[4] = a[4] - b[4];
                mv[5] = a[5] - b[5];
                mv[6] = a[6] - b[6];
                mv[7] = a[7] - b[7];
                mv[8] = a[8] - b[8];
                mv[9] = a[9] - b[9];
                mv[10] = a[10] - b[10];
                mv[11] = a[11] - b[11];
                mv[12] = a[12] - b[12];
                mv[13] = a[13] - b[13];
                mv[14] = a[14] - b[14];
                mv[15] = a[15] - b[15];
            }
        ))

        distance = (p1,p2) => {
            wNormalizePoint(p1)
            wNormalizePoint(p2)
            gSub(p1,p2,mv0)
            return Math.sqrt(sq(pointX(mv0)) + sq(pointY(mv0)) + sq(pointZ(mv0)) )
        }

        appendToGaShaderString(replaceSignature(
            "void inner(float a[16], float b[16], inout float mv[16])",
            inner = (a, b, mv) =>
            {
                mv[ 0] = b[ 0] * a[ 0] + b[ 2] * a[ 2] + b[ 3] * a[ 3] + b[ 4] * a[ 4] - b[ 8] * a[ 8] - b[ 9] * a[ 9] - b[10] * a[10] - b[14] * a[14];
                mv[ 1] = b[ 1] * a[ 0] + b[ 0] * a[ 1] - b[ 5] * a[ 2] - b[ 6] * a[ 3] - b[ 7] * a[ 4] + b[ 2] * a[ 5] + b[ 3] * a[ 6] + b[ 4] * a[ 7] + b[11] * a[ 8] + b[12] * a[ 9] + b[13] * a[10] + b[ 8] * a[11] + b[ 9] * a[12] + b[10] * a[13] + b[15] * a[14] - b[14] * a[15];
                mv[ 2] = b[ 2] * a[ 0] + b[ 0] * a[ 2] - b[ 8] * a[ 3] + b[ 9] * a[ 4] + b[ 3] * a[ 8] - b[ 4] * a[ 9] - b[14] * a[10] - b[10] * a[14];
                mv[ 3] = b[ 3] * a[ 0] + b[ 8] * a[ 2] + b[ 0] * a[ 3] - b[10] * a[ 4] - b[ 2] * a[ 8] - b[14] * a[ 9] + b[ 4] * a[10] - b[ 9] * a[14];
                mv[ 4] = b[ 4] * a[ 0] - b[ 9] * a[ 2] + b[10] * a[ 3] + b[ 0] * a[ 4] - b[14] * a[ 8] + b[ 2] * a[ 9] - b[ 3] * a[10] - b[ 8] * a[14];
                mv[ 5] = b[ 5] * a[ 0] - b[11] * a[ 3] + b[12] * a[ 4] + b[ 0] * a[ 5] - b[15] * a[10] - b[ 3] * a[11] + b[ 4] * a[12] - b[10] * a[15];
                mv[ 6] = b[ 6] * a[ 0] + b[11] * a[ 2] - b[13] * a[ 4] + b[ 0] * a[ 6] - b[15] * a[ 9] + b[ 2] * a[11] - b[ 4] * a[13] - b[ 9] * a[15];
                mv[ 7] = b[ 7] * a[ 0] - b[12] * a[ 2] + b[13] * a[ 3] + b[ 0] * a[ 7] - b[15] * a[ 8] - b[ 2] * a[12] + b[ 3] * a[13] - b[ 8] * a[15];
                mv[ 8] = b[ 8] * a[ 0] + b[14] * a[ 4] + b[ 0] * a[ 8] + b[ 4] * a[14];
                mv[ 9] = b[ 9] * a[ 0] + b[14] * a[ 3] + b[ 0] * a[ 9] + b[ 3] * a[14];
                mv[10] = b[10] * a[ 0] + b[14] * a[ 2] + b[ 0] * a[10] + b[ 2] * a[14];
                mv[11] = b[11] * a[ 0] + b[15] * a[ 4] + b[ 0] * a[11] - b[ 4] * a[15];
                mv[12] = b[12] * a[ 0] + b[15] * a[ 3] + b[ 0] * a[12] - b[ 3] * a[15];
                mv[13] = b[13] * a[ 0] + b[15] * a[ 2] + b[ 0] * a[13] - b[ 2] * a[15];
                mv[14] = b[14] * a[ 0] + b[ 0] * a[14];
                mv[15] = b[15] * a[ 0] + b[ 0] * a[15];
            }
            ))
    }

    {
        DualQuat = function ()
        {
            this.scalar = 0.
            this.realLine = new Float32Array(3)
            this.idealLine = new Float32Array(3)
            this.pss = 0.
        }
        appendToGaShaderString(`
        struct dualQuat {
            float scalar;
            vec3 realLine;
            vec3 idealLine;
            float pss;
        };`)

        dq0 = new DualQuat()
        dq1 = new DualQuat()

        locateUniformDualQuat = function(program,dqName)
        {
            program.locateUniform(dqName + "." + "scalar")
            program.locateUniform(dqName + "." + "realLine")
            program.locateUniform(dqName + "." + "idealLine")
            program.locateUniform(dqName + "." + "pss")
        }
        transferDualQuat = function (dq, dqName, program)
        {
            for (propt in dq)
            {
                let nameDotPropt = dqName + "." + propt
                if (propt === "scalar" || propt === "pss" )
                    gl.uniform1f(program.uniformLocations[nameDotPropt], dq[propt])
                else
                    gl.uniform3fv(program.uniformLocations[nameDotPropt], dq[propt])
            }
        }

        appendToGaShaderString(replaceSignature(
            "void zeroDq(inout dualQuat dq)",
            zeroDq = (dq) =>
            {
                dq.scalar = 0.;
                dq.idealLine[ 0] = 0.; dq.idealLine[ 1] = 0.; dq.idealLine[ 2] = 0.;
                dq.realLine[ 0] = 0.; dq.realLine[ 1] = 0.; dq.realLine[ 2] = 0.;
                dq.pss = 0.;
            }
            ))

        appendToGaShaderString(`
        dualQuat DualQuat(){
            dualQuat dq;
            zeroDq(dq);
            return dq;
        }`)

        mvRotator = (axis, angle, target) =>
        {
            assign(axis,target)
            multiplyScalar(target, Math.sin(angle / 2.))
            scalar(target, Math.cos(angle / 2.))
            return target;
        }

        mvToString = (mv) => {
            return mv.toString() + ","
        }

        

        let eps = .00001
        getGrade = (mv) => {
            let gradeIPartIsZero = Array(5)
            gradeIPartIsZero[1] = Math.abs(planeX(mv)) < eps && Math.abs(planeY(mv)) < eps && Math.abs(planeZ(mv)) < eps && Math.abs(planeW(mv)) < eps
            gradeIPartIsZero[3] = Math.abs(pointX(mv)) < eps && Math.abs(pointY(mv)) < eps && Math.abs(pointZ(mv)) < eps && Math.abs(pointW(mv)) < eps
            gradeIPartIsZero[2] =
                Math.abs(realLineX(mv)) < eps && Math.abs(realLineY(mv)) < eps && Math.abs(realLineZ(mv)) < eps &&
                Math.abs(idealLineX(mv)) < eps && Math.abs(idealLineY(mv)) < eps && Math.abs(idealLineZ(mv)) < eps
            gradeIPartIsZero[0] = Math.abs(mv[0]) < eps
            gradeIPartIsZero[4] = Math.abs(mv[15]) < eps

            let blade = true
            let grade = -1
            for(let i = 0; i < 5; ++i) {
                if(!gradeIPartIsZero[i]) {
                    if (grade === -1)
                        grade = i
                    else
                        blade = false
                }
            }
            if(blade) return grade
            else return "mix"
        }

        multiplyScalar = (mv,sca) => {
            mv.forEach((e,i)=>mv[i]*=sca)
        }

        rotator = ( axis, angle, target) =>
        {
            target.scalar = Math.cos(angle / 2.);
            let sin = Math.sin(angle / 2.);
            target.realLine[0] = sin * axis.realLine[0];
            target.realLine[1] = sin * axis.realLine[1];
            target.realLine[2] = sin * axis.realLine[2];
            target.idealLine[0] = sin * axis.idealLine[0];
            target.idealLine[1] = sin * axis.idealLine[1];
            target.idealLine[2] = sin * axis.idealLine[2];
            return target;
        }
        appendToGaShaderString(`
        dualQuat rotator(dualQuat axis,float angle) {
            dualQuat res = DualQuat();
            res.scalar = cos(angle/2.);
            float sin = sin(angle/2.);
            res.realLine.x = sin * axis.realLine.x;
            res.realLine.y = sin * axis.realLine.y;
            res.realLine.z = sin * axis.realLine.z;
            return res;
        }`)

        appendToGaShaderString(replaceSignature(
            "void pointToMv(vec4 p, inout float mv[16])",
            pointToMv = (p,mv) =>
            {
                zeroMv(mv);
                mv[14] = p[3];
                mv[13] = p[0];
                mv[12] = p[1];
                mv[11] = p[2];
            }
            ))
        
        mvEquals = (a,b) => {
            let allEqual = true
            a.forEach((e, i) => { if (a[i] !== b[i]) allEqual = false })
            return allEqual
        }

        appendToGaShaderString(replaceSignature(
            "void mvToPoint(float mv[16], inout vec4 p)",
            mvToPoint = (mv,p) =>
            {
                p[0] = mv[13];
                p[1] = mv[12];
                p[2] = mv[11];
                p[3] = mv[14];
            }
            ))

        appendToGaShaderString(replaceSignature(
            "void dqToMv(dualQuat dq, inout float mv[16])",
            dqToMv = (dq, mv) =>
            {
                zeroMv(mv);
                mv[0] = dq.scalar;

                mv[5] = dq.idealLine[0];
                mv[6] = dq.idealLine[1];
                mv[7] = dq.idealLine[2];
                //errr, don't get too used to this kind of thing
                mv[8] = dq.realLine[0];
                mv[9] = dq.realLine[1];
                mv[10] = dq.realLine[2];

                mv[15] = dq.pss;
            }
            ))

        scalar = (mv,newValue) => {if(newValue !== undefined) mv[0] = newValue; return mv[0]}
        pss = (mv,newValue) => {if(newValue !== undefined) mv[15] = newValue; return mv[15]}
        planeW = (mv,newValue) => {if(newValue !== undefined) mv[1] = newValue; return mv[1]}
        planeX = (mv,newValue) => {if(newValue !== undefined) mv[2] = newValue; return mv[2]}
        planeY = (mv,newValue) => {if(newValue !== undefined) mv[3] = newValue; return mv[3]}
        planeZ = (mv,newValue) => {if(newValue !== undefined) mv[4] = newValue; return mv[4]}
        idealLineX = (mv,newValue) => {if(newValue !== undefined) mv[5] = newValue; return mv[5]}
        idealLineY = (mv,newValue) => {if(newValue !== undefined) mv[6] = newValue; return mv[6]}
        idealLineZ = (mv,newValue) => {if(newValue !== undefined) mv[7] = newValue; return mv[7]}
        realLineZ = (mv,newValue) => {if(newValue !== undefined) mv[ 8] = newValue; return mv[ 8]}
        realLineY = (mv,newValue) => {if(newValue !== undefined) mv[ 9] = newValue; return mv[ 9]}
        realLineX = (mv,newValue) => {if(newValue !== undefined) mv[10] = newValue; return mv[10]}
        pointZ = (mv, newValue) => { if (newValue !== undefined) mv[11] = newValue; return mv[11] }
        pointY = (mv, newValue) => { if (newValue !== undefined) mv[12] = newValue; return mv[12] }
        pointX = (mv, newValue) => { if (newValue !== undefined) mv[13] = newValue; return mv[13] }
        pointW = (mv, newValue) => { if (newValue !== undefined) mv[14] = newValue; return mv[14] }

        point = (mv, x, y, z, w) => {zeroMv(mv); mv[11] = z; mv[12] = y; mv[13] = x; mv[14] = w;}
        plane = (mv, x, y, z, w) => {zeroMv(mv); mv[4] = z; mv[3] = y; mv[2] = x; mv[1] = w;}

        lineRealNorm = (mv) => { return Math.sqrt(sq(realLineX(mv)) + sq(realLineY(mv)) + sq(realLineZ(mv)))}
        lineIdealNorm = (mv) => { return Math.sqrt(sq(idealLineX(mv)) + sq(idealLineY(mv)) + sq(idealLineZ(mv)))}
        
        pointIdealNorm = (mv) => { return Math.sqrt(sq(pointX(mv)) + sq(pointY(mv)) + sq(pointZ(mv)))}

        appendToGaShaderString(replaceSignature(
            "void mvToDq(float mv[16], inout dualQuat dq)",
            mvToDq = (mv,dq) =>
            {
                zeroDq(dq);

                dq.scalar = mv[ 0];

                dq.idealLine[0] = mv[ 5];
                dq.idealLine[1] = mv[ 6];
                dq.idealLine[2] = mv[ 7];
                dq.realLine[2] = mv[ 8];
                dq.realLine[1] = mv[ 9];
                dq.realLine[0] = mv[10];

                dq.pss = mv[15];
            }
        ))

        //yes, you changed the name
        appendToGaShaderString(replaceSignature(
            "void hackyReverse(inout float mv[16])",
            hackyReverse = (mv) =>
            {
                mv[ 5] *= -1.;
                mv[ 6] *= -1.;
                mv[ 7] *= -1.;
                mv[ 8] *= -1.;
                mv[ 9] *= -1.;
                mv[10] *= -1.;
                mv[11] *= -1.;
                mv[12] *= -1.;
                mv[13] *= -1.;
                mv[14] *= -1.;
            }
        ))
        appendToGaShaderString(replaceSignature(
            "void dqSandwich(inout vec4 p, dualQuat dq)",
            dqSandwich = (p, dq) =>
            {
                dqToMv(dq, mv0);
                pointToMv(p, mv1);

                gp(mv0, mv1, mv2);
                hackyReverse(mv0);
                gp(mv2, mv0, mv3);

                mvToPoint(mv3,p);
            }
            ))

        mvSandwich = (a,b,target) => {
            gp( b, a, mv0);
            assign(b,mv1)
            reverse(mv1,mv2);
            gp(mv0, mv2, target);
        }

        wNormalizePoint = (p) => {
            pointX(p, pointX(p) / pointW(p))
            pointY(p, pointY(p) / pointW(p))
            pointZ(p, pointZ(p) / pointW(p))
            pointW(p, 1.)
        }

        wNormalizePoint = (p) => {
            let w = pointW(p)
            pointX(p, pointX(p) / w)
            pointY(p, pointY(p) / w)
            pointZ(p, pointZ(p) / w)
            pointW(p, 1.)
        }

        pointNorm = (mv) => { return Math.sqrt(sq(pointX(mv)) + sq(pointY(mv)) + sq(pointZ(mv)) ) }
        normalizeIdealPoint = (mv) => { //"not supposed to do this"?
            let factor = 1. / pointNorm(mv)
            pointX(mv, pointX(mv) * factor)
            pointY(mv, pointY(mv) * factor)
            pointZ(mv, pointZ(mv) * factor)
            pointW(mv, 0.)
        }

        lineNormalize = (mv) => {
            let inverseLength = 1. / Math.sqrt(sq(realLineX(mv)) + sq(realLineY(mv)) + sq(realLineZ(mv)))
            realLineX(mv, realLineX(mv) * inverseLength)
            realLineY(mv, realLineY(mv) * inverseLength)
            realLineZ(mv, realLineZ(mv) * inverseLength)
            idealLineX(mv, idealLineX(mv) * inverseLength)
            idealLineY(mv, idealLineY(mv) * inverseLength)
            idealLineZ(mv, idealLineZ(mv) * inverseLength)
        }

        // let ourDq = new DualQuat()
        // ourDq.realLine[2] = 1.
        // let ourRotator = new DualQuat()
        // rotator(ourDq,TAU/4.,ourRotator)
        // log(ourRotator)
        // let ourP = new Float32Array(4)
        // ourP[1] = 1.
        // sandwich(ourP, ourRotator)
        // log(ourP)
    }

    {
        Point = function()
        {
            this[0] = 0.
            this[1] = 0.
            this[2] = 0.
            this[3] = 1.
        }
        Object.assign(Point.prototype, {
            copy: function (p)
            {
                this[0] = p[0]
                this[1] = p[1]
                this[2] = p[2]
                this[3] = p[3]
            },

            normalize: function ()
            {
                let invLength = 1. / Math.sqrt(sq(this[0]) + sq(this[2]) + sq(this[2]) + sq(this[3]))
                this[0] *= invLength
                this[1] *= invLength
                this[2] *= invLength
                this[3] *= invLength
            },

            wNormalize: function ()
            {
                this[0] /= this[3]
                this[1] /= this[3]
                this[2] /= this[3]
                this[3] = 1.
            }
        })

        updateAttribute = function (pointArray, attributeBuffer) {
            for (let i = 0, il = pointArray.length; i < il; ++i)
            {
                attributeBuffer[i * 4 + 0] = pointArray[i][0]
                attributeBuffer[i * 4 + 1] = pointArray[i][1]
                attributeBuffer[i * 4 + 2] = pointArray[i][2]
                attributeBuffer[i * 4 + 3] = pointArray[i][3]
            }
        }

        mvArrayToPointsBuffer = function (mvArray, attributeBuffer) {
            for (let i = 0, il = mvArray.length; i < il; ++i) {
                attributeBuffer[i * 4 + 0] = pointX(mvArray[i])
                attributeBuffer[i * 4 + 1] = pointY(mvArray[i])
                attributeBuffer[i * 4 + 2] = pointZ(mvArray[i])
                attributeBuffer[i * 4 + 3] = pointW(mvArray[i])
            }
        }

        assign = (mv,target) => {
            mv.forEach((e,i) => {target[i] = e})
        }
    }

    function changeAngleAndNormalize(pointMv, angleMultiple) {
        // debugger
        let oldIdealNorm = pointIdealNorm(pointMv)
        if(oldIdealNorm === 0.) {
            pointW(pointMv,1.)
            return
        }
        let angle = Math.atan2(oldIdealNorm, pointW(pointMv))
        let newAngle = angle * angleMultiple
        let newIdealNorm = Math.sin(newAngle) //we really want this to be 1 when it is. It is 1 when

        let xyzMultiplier = newIdealNorm / oldIdealNorm
        pointX(pointMv, pointX(pointMv) * xyzMultiplier)
        pointY(pointMv, pointY(pointMv) * xyzMultiplier)
        pointZ(pointMv, pointZ(pointMv) * xyzMultiplier)
        pointW(pointMv, Math.sqrt(1. - sq(newIdealNorm)))
    }
    appendToGaShaderString(`
            float sq(float x) {
                return x*x;
            }

            void changeAngleAndNormalize(inout vec4 point, float angleMultiple) {
                float oldIdealNorm = length(point.xyz);
                float angle = atan(oldIdealNorm, point.w);
                float newAngle = angle * angleMultiple;
                float newIdealNorm = sin(newAngle);

                float xyzMultiplier = newIdealNorm / oldIdealNorm;
                point.x *= xyzMultiplier;
                point.y *= xyzMultiplier;
                point.z *= xyzMultiplier;
                point.w = sqrt(1.-sq(newIdealNorm));
            }
        `)

    appendToGaShaderString(`
            void planeToBall(inout vec4 planePoint) {
                changeAngleAndNormalize(planePoint, 2.);
            }
        `)
    planeToBall = (planePoint, targetBallPoint) => {
        assign(planePoint, targetBallPoint)
        changeAngleAndNormalize(targetBallPoint, .5)
    }



    ballToPlane = (ballPoint, targetPlanePoint) => {
        //if the pointIdealNorm is greater than 1...
        //yes it might be nice to have it go round and round
        let norm = pointIdealNorm(ballPoint)
        if (norm > 1.) {
            pointX(ballPoint, pointX(ballPoint) / norm)
            pointY(ballPoint, pointY(ballPoint) / norm)
            pointZ(ballPoint, pointZ(ballPoint) / norm)
        }
        assign(ballPoint, targetPlanePoint)
        changeAngleAndNormalize(targetPlanePoint, 2.)
    }
        // `
        // void ballToPlane(inout vec4 p) {
        //     //if the pointIdealNorm is greater than 1...
        //     //yes it might be nice to have it go round and round
        //     let norm = pointIdealNorm(ballPoint)
        //     log(norm)
        //     if (norm > 1.) {
        //         pointX(ballPoint, pointX(ballPoint) / norm)
        //         pointY(ballPoint, pointY(ballPoint) / norm)
        //         pointZ(ballPoint, pointZ(ballPoint) / norm)
        //     }
        //     assign(ballPoint, targetPlanePoint)
        //     changeAngleAndNormalize(targetPlanePoint, .5)
        // }
        // `
}