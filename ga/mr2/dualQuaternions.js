function initDualQuaternions(appendToGaShaderString, replaceSignature)
{
    DualQuat = function ()
    {
        this.scalar = 1.
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
    };
    `)
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
        dq.scalar = 1.;
        return dq;
    }
    `)

    dq0 = new DualQuat()
    dq1 = new DualQuat()

    normalizeDq = (a,target) => {
        let inverseNorm = 1. / normDq(a)
        target.scalar = inverseNorm * a.scalar
        target.realLine[0] = inverseNorm * a.realLine[0]
        target.realLine[1] = inverseNorm * a.realLine[1]
        target.realLine[2] = inverseNorm * a.realLine[2]
        target.idealLine[0] = inverseNorm * a.idealLine[0]
        target.idealLine[1] = inverseNorm * a.idealLine[1]
        target.idealLine[2] = inverseNorm * a.idealLine[2]
        target.pss = inverseNorm * a.pss
    }
    normDq = (a) => {
        dqToMv(a,mv0)
        reverse(mv0, mv1)
        gProduct(mv0,mv1,mv2)
        return Math.sqrt(mv2[0])
    }

    assignDq = (a,target) => {
        target.scalar = a.scalar
        target.realLine[0] = a.realLine[0]
        target.realLine[1] = a.realLine[1]
        target.realLine[2] = a.realLine[2]
        target.idealLine[0] = a.idealLine[0]
        target.idealLine[1] = a.idealLine[1]
        target.idealLine[2] = a.idealLine[2]
        target.pss = a.pss
    }

    multiplyDq = (a,b,target) => {
        dqToMv(a,mv0)
        dqToMv(b,mv1)
        gProduct(mv0,mv1,mv2)
        mvToDq(mv2,target)
        return target
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
        "void dqToMv(dualQuat dq, inout float mv[16])",
        dqToMv = (dq, mv) =>
        {
            zeroMv(mv);
            mv[0] = dq.scalar;

            mv[5] = dq.idealLine[0];
            mv[6] = dq.idealLine[1];
            mv[7] = dq.idealLine[2];
            mv[8] = dq.realLine[2];
            mv[9] = dq.realLine[1];
            mv[10] = dq.realLine[0];

            mv[15] = dq.pss;
        }
    ))

    appendToGaShaderString(replaceSignature(
        "void mvToDq(float mv[16], out dualQuat dq)",
        mvToDq = (mv,dq) =>
        {
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

    appendToGaShaderString(replaceSignature(
        "void reverseDq(dualQuat dq, out dualQuat target)",
        reverseDq = (dq,target) =>
        {
            target.scalar = dq.scalar;

            target.idealLine[0] = -dq.idealLine[0];
            target.idealLine[1] = -dq.idealLine[1];
            target.idealLine[2] = -dq.idealLine[2];
            target.realLine[2] = -dq.realLine[2];
            target.realLine[1] = -dq.realLine[1];
            target.realLine[0] = -dq.realLine[0];

            target.pss = dq.pss;
        }
    ))


    locateUniformDualQuat = function(program,dqName)
    {
        program.locateUniform(dqName + "." + "scalar")
        program.locateUniform(dqName + "." + "realLine")
        program.locateUniform(dqName + "." + "idealLine")
        program.locateUniform(dqName + "." + "pss")
    }
    transferDualQuat = function (dq, dqName, program)
    {
        for (propt in dq) {
            let nameDotPropt = dqName + "." + propt
            if (propt === "scalar" || propt === "pss" )
                gl.uniform1f(program.uniformLocations[nameDotPropt], dq[propt])
            else
                gl.uniform3fv(program.uniformLocations[nameDotPropt], dq[propt])
        }
    }

    appendToGaShaderString(replaceSignature(
        "void dqSandwich(inout vec4 p, dualQuat dq)",
        dqSandwich = (p, dq) =>
        {
            dqToMv(dq, mv0);
            pointToMv(p, mv1);

            gProduct(mv0, mv1, mv2);
            reverse(mv0,mv1);
            gProduct(mv2, mv1, mv3);

            mvToVec4(mv3,p);
        }
    ))
}