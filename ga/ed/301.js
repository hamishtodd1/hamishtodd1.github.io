/*
    Points square to -1. Suggests they're rotations. Which, yes
 */

function init301Unhoisted() {

    const N_COEFS = 16
    const N_ROTOR_COEFS = 8
    const N_BIVECTOR_COEFS = 6

    class Biv extends Float32Array {
        constructor() {
            super(N_BIVECTOR_COEFS)
        }

        copy(a) {
            for (let i = 0; i < N_BIVECTOR_COEFS; ++i)
                this[i] = a[i]

            return this
        }

        clone() {
            let cl = new Mv()
            cl.copy(this)

            return cl
        }

        multiplyScalar(s) {
            for (let i = 0; i < N_BIVECTOR_COEFS; ++i)
                this[i] *= s

            return this
        }

        fromMv(mv) {
            for(let i = 0; i < N_BIVECTOR_COEFS; ++i)
                this[i] = mv[i+5]
        }

        exp(target) {
            if(target === undefined)
                target = new Dq()

            let l = (this[3] * this[3] + this[4] * this[4] + this[5] * this[5]);
            if (l == 0.)
                return target.set(1, this[0], this[1], this[2], 0., 0., 0., 0.);
            let m = (this[0] * this[5] + this[1] * this[4] + this[2] * this[3]), a = Math.sqrt(l), c = Math.cos(a), s = Math.sin(a) / a, t = m / l * (c - s);
            return target.set(c, s * this[0] + t * this[5], s * this[1] + t * this[4], s * this[2] + t * this[3], s * this[3], s * this[4], s * this[5], m * s);
        }
    }

    class Dq extends Float32Array {
        constructor() {
            super(N_ROTOR_COEFS)
        }

        copy(a) {
            for (let i = 0; i < N_ROTOR_COEFS; ++i)
                this[i] = a[i]

            return this
        }

        clone() {
            let cl = new Mv()
            cl.copy(this)

            return cl
        }

        set() {
            for (let i = 0; i < N_ROTOR_COEFS; ++i)
                this[i] = arguments[i]
        }

        multiplyScalar(s) {
            for (let i = 0; i < N_ROTOR_COEFS; ++i)
                this[i] *= s

            return this
        }

        
        //yes, you want to have a dw that's a mobius strip
        //as the transition between the complex plane and the projective plane

        normalize() {
            var s = 1. / Math.sqrt((this[0] * this[0] + this[4] * this[4] + this[5] * this[5] + this[6] * this[6]));
            var d = (this[7] * this[0] - (this[1] * this[6] + this[2] * this[5] + this[3] * this[4])) * s * s;
            this.multiplyScalar(s)
            this[1] += this[6] * d;
            this[2] += this[5] * d;
            this[3] += this[4] * d;
            this[7] -= this[0] * d;
            return this;
        }

        fromMv(mv) {
            this[0] = mv[0]
            this[7] = mv[15]
            for(let i = 0; i < 6; ++i)
                this[i+1] = mv[i+5]

            return this
        }

        toMv(target) {
            target.copy(zeroMv)

            target[0] = this[0]
            target[15] = this[7]
            for (let i = 0; i < 6; ++i)
                target[i + 5] = this[i + 1]

            return target
        }

        sqrt(target) {
            if(target === undefined)
                console.error("use sqrtSelf")
            target.copy(this)
            return target.sqrtSelf()
        }

        sqrtSelf() {
            this[0] += this[0] < 0. ? -1. : 1.
            return this.normalize()
        }

        log(target) {
            if (r[0] == 1.)
                return target.set(this[1], this[2], this[3], 0., 0., 0.);
            var a = 1. / (1. - this[0] * this[0]),                 // inv squared length. 
                b = Math.acos(this[0]) * Math.sqrt(a),                // rotation scale
                c = a * this[7] * (1. - this[0] * b);               // translation scale
            return target.set(c * this[6] + b * this[1], c * this[5] + b * this[2], c * this[4] + b * this[3], b * this[4], b * this[5], b * this[6]);
        }
    }
    window.Dq = Dq

    class Mv extends Float32Array {
        constructor() {
            super(N_COEFS)
        }

        copy(a) {
            for (let i = 0; i < N_COEFS; ++i)
                this[i] = a[i]

            return this
        }

        clone() {
            let cl = new Mv()
            cl.copy(this)

            return cl
        }

        multiplyScalar(s) {
            for (let i = 0; i < N_COEFS; ++i)
                this[i] *= s

            return this
        }

        fromLerp(a,b,proportion) {
            for (let i = 0; i < N_COEFS; ++i)
                this[i] = a[i] + proportion * (b[i] - a[i])

            return this
        }

        fromVector(v) {
            this.copy(zeroMv)

            //possibly it would be better to derive the e12s and so on from taking your vectors

            this[11] = v.z
            this[12] = v.y
            this[13] = v.x
            this[14] = 1.

            return this
        }

        fromVector4(v) {
            this.copy(zeroMv)

            this[11] = v.z
            this[12] = v.y
            this[13] = v.x
            this[14] = v.w

            return this
        }

        toVector(v) {
            if(this[14] === 0.) {
                v.z = this[11]
                v.y = this[12]
                v.x = this[13]                
            }
            else {
                v.z = this[11] / this[14]
                v.y = this[12] / this[14]
                v.x = this[13] / this[14]
            }

            return v
        }

        getDisplayableVersion(target) {
            if (this.hasEuclideanPart())
                target.copy(this)
            else {
                let cameraJoin = newMv
                join(camera.mvs.pos, this, cameraJoin)
                meet(cameraJoin,camera.frustum.far, target)
            }

            return target
        }

        toVectorDisplayable(target) {
            let displayableVersion = newMv
            this.getDisplayableVersion(displayableVersion)
            displayableVersion.toVector(target)
            return target
        }

        plane(e0Coef, e1Coef,e2Coef, e3Coef) {
            this.copy(zeroMv)
            this[1] = e0Coef
            this[2] = e1Coef
            this[3] = e2Coef
            this[4] = e3Coef

            return this
        }

        point(x,y,z,w) {
            if(w === undefined)
                w = 1.
            this[14] = w
            this[13] = x
            this[12] = y
            this[11] = z
        }

        toQuaternion(target) {
            if (target === undefined)
                target = new THREE.Quaternion()

            target.set(
                -this[10],
                -this[9], 
                -this[8], 
                this[0])
            target.normalize()
            return target
        }

        fromQuaternion(q) {
            this.copy(zeroMv)

            this[10] = -q.x
            this[9] = -q.y
            this[8] = -q.z
            this[0] = q.w
            return this
        }

        sandwich(mv, target) {
            let thisReversed = newMv
            reverse(this, thisReversed)
            
            let intermediate = newMv
            mul(this,mv,intermediate) //sigh, is there a -?

            return mul(intermediate,thisReversed,target)
        }

        distanceToOtherPoint(p) {
            return join(this, p, newMv).eNorm()
        }

        log(label,numDecimalPlaces) {
            if (numDecimalPlaces === undefined)
                numDecimalPlaces = 1

            let str = ""
            for (let i = 0; i < basisNames.length; ++i) {
                if (this[i] !== 0.){ // && this[i].toFixed() != 0) {
                    if (str !== "")
                        str += " + "

                    let sign = 1.
                    // if (onesWithMinus.indexOf(basisNames[i]) !== -1)
                    //     sign = -1.

                    str += (sign * this[i]).toFixed(numDecimalPlaces) + (i !== 0 ? "e" : "") + basisNames[i]
                }
            }

            if (str === "")
                str += "0."

            if (label !== undefined)
                str = label + ": " + str
            else {
                label = getWhereThisWasCalledFrom()
                str = label + ": " + str
            }

            console.log(str)
        }

        fromAxisAngle(axis,angle) {
            localBiv0.fromMv(axis)
            localBiv0.multiplyScalar(angle / 2.)
            localBiv0.exp(localDq0)
            return localDq0.toMv(this)
        }

        eNormSquared() {
            let rev = newMv
            reverse(this, rev)
            let studyNumber = newMv
            mul(this, rev, studyNumber)
            let ret = Math.abs(studyNumber[0])

            return ret
        }

        eNorm() {
            return Math.sqrt(this.eNormSquared())
        }
        iNorm() {
            log(this)
            let pointNorm = Math.sqrt(sq(this[11]) + sq(this[12]) + sq(this[13]))
            let lineNorm = Math.sqrt(sq(this[5]) + sq(this[6]) + sq(this[7]))
            return this[1] + this[15] + pointNorm + lineNorm
        }

        normalize() {
            //dunno if this achieves the same thing as dq above, hopefully does
            let ourNorm = this.eNorm()
            if(ourNorm === 0.)
                console.error("can't normalize null object")
            else
                this.multiplyScalar(1./ourNorm)

            return this
        }

        invert(target) {
            if(target === undefined)
                target = new Mv()

            reverse(this, target)
            target.multiplyScalar(1. / this.eNormSquared() )

            return target
        }

        projectOn(mv,target) {
            //if you want to project on anything at infinity, different matter
            //take out the euclidean part I guess

            let intermediate = inner(mv, this, newMv)
            let inverse = mv.invert(newMv)
            return mul(intermediate,inverse,target)
        }

        sqrt(target) {
            if (target === undefined)
                target = new Mv()

            localDq0.fromMv(this).sqrtSelf().toMv(target)

            return target
        }

        sqrtSelf() {
            localDq0.fromMv(this).sqrtSelf().toMv(this)

            return this
        }

        fromPosQuat(p, q) {
            let quat = newMv
            quat.fromQuaternion(q)
            
            let pPoint = newMv.fromVector(p)
            let doubleTrans = mul(pPoint, e123, newMv)
            let trans = doubleTrans.sqrt(newMv)
            
            mul(trans,quat, this)

            return this
        }

        approxEquals(mv) {
            let doesEqual = true
            for(let i = 0; i < N_COEFS; ++i) {
                if (Math.abs(this[i] - mv[i]) > .0001)
                    doesEqual = false
            }
            return doesEqual
        }

        selectGrade(grade,target) {
            target.copy(this)
            for(let i = 0; i < 16; ++i) {
                if (indexGrades[i] !== grade)
                    target[i] = 0.
            }

            return target
        }

        hasEuclideanPart() {
            return this.eNormSquared() > .00001
        }
    }
    window.Mv = Mv

    let indexGrades = [
        0,
        1,1,1,1,
        2,2,2,2,2,2,
        3,3,3,3,
        4
    ]

    let jsString = createVariousFunctions()
    eval(jsString)

    prefixWithGlslGa = () => {

    }

    // log(glslGaString)

    function MvFromFloatAndIndex(float, index) {
        let mv = new Mv()
        mv[index] = float
        return mv
    }

    zeroMv = new Mv()
    oneMv = new Mv()
    oneMv[0] = 1.
    let minusOneMv = new Mv()
    minusOneMv[0] = -1.

    e0 = MvFromFloatAndIndex(1., 1)
    e1 = MvFromFloatAndIndex(1., 2)
    e2 = MvFromFloatAndIndex(1., 3)
    e3 = MvFromFloatAndIndex(1., 4)
    e01 = mul(e0,e1)
    e02 = mul(e0,e2)
    e03 = mul(e0,e3)
    e12 = mul(e1,e2)
    e31 = mul(e3,e1)
    e23 = mul(e2,e3)
    e032 = mul(e03,e2)
    e013 = mul(e01,e3)
    e021 = mul(e02,e1)
    e123 = mul(e1,e23)
    e0123 = mul(e0,e123)

    const basisNames = ["", "0", "1", "2", "3", "01", "02", "03", "12", "31", "23", "021", "013", "032", "123", "0123"]

    mv0 = new Mv()
    mv1 = new Mv()
    mv2 = new Mv()
    mv3 = new Mv()
    mv4 = new Mv()
    mv5 = new Mv()
    mv6 = new Mv()

    let localDq0 = new Dq()
    let localBiv0 = new Biv()

    /*THIS_GETS_REMOVED*/
}

function init301() {
    let funcString = init301Unhoisted.toString()

    let i = 0
    let declarations = ""
    let withoutDeclarations = funcString.replace(/newMv/g, () => {
        declarations += "    let newMv" + i + " = new Mv()\n"
        return "newMv" + i++
    })
    let topLineEnd = withoutDeclarations.indexOf("/*THIS_GETS_REMOVED*/")
    let strToEval =
        "(" +
        withoutDeclarations.slice(0, topLineEnd) +
        declarations +
        withoutDeclarations.slice(topLineEnd) +
        ")()"

    eval(strToEval)
}

function createVariousFunctions()
{
    let jsString = ""

    

    function createFunction(funcName, argNames, body) {
        let glslVersion = "void " + funcName + "( "
        let jsVersion = funcName + " = function( "

        argNames.forEach((n) => {
            glslVersion += "in float " + n + "[16], "
            jsVersion += n + ", "
        })

        glslVersion += "out float target[16] ) {\n" + body + "\n}\n\n"

        jsVersion += `target ) {
            if(target === undefined)
			    target = new Mv()
            ` + body + `
            return target
        }
        `
        glslGaString += glslVersion
        jsString += jsVersion
    }

    createFunction(`mul`, [`a`, `b`], `
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

    target[15] = b[15] * a[ 0] + b[14] * a[ 1] + b[13] * a[ 2] + b[12] * a[ 3] + b[11] * a[ 4] + b[10] * a[ 5] + b[ 9] * a[ 6] + b[ 8] * a[ 7] + b[ 7] * a[ 8] + b[ 6] * a[ 9] + b[ 5] * a[10] - b[ 4] * a[11] - b[ 3] * a[12] - b[ 2] * a[13] - b[ 1] * a[14] + b[ 0] * a[15];`)

    createFunction(`meet`, [`a`, `b`], `
    target[ 0] = b[ 0] * a[ 0];
    target[ 1] = b[ 1] * a[ 0] + b[ 0] * a[ 1];
    target[ 2] = b[ 2] * a[ 0] + b[ 0] * a[ 2];
    target[ 3] = b[ 3] * a[ 0] + b[ 0] * a[ 3];
    target[ 4] = b[ 4] * a[ 0] + b[ 0] * a[ 4];
    target[ 5] = b[ 5] * a[ 0] + b[ 2] * a[ 1] - b[ 1] * a[ 2] + b[ 0] * a[ 5];
    target[ 6] = b[ 6] * a[ 0] + b[ 3] * a[ 1] - b[ 1] * a[ 3] + b[ 0] * a[ 6];
    target[ 7] = b[ 7] * a[ 0] + b[ 4] * a[ 1] - b[ 1] * a[ 4] + b[ 0] * a[ 7];
    target[ 8] = b[ 8] * a[ 0] + b[ 3] * a[ 2] - b[ 2] * a[ 3] + b[ 0] * a[ 8];
    target[ 9] = b[ 9] * a[ 0] - b[ 4] * a[ 2] + b[ 2] * a[ 4] + b[ 0] * a[ 9];
    target[10] = b[10] * a[ 0] + b[ 4] * a[ 3] - b[ 3] * a[ 4] + b[ 0] * a[10];
    target[11] = b[11] * a[ 0] - b[ 8] * a[ 1] + b[ 6] * a[ 2] - b[ 5] * a[ 3] - b[ 3] * a[ 5] + b[ 2] * a[ 6] - b[ 1] * a[ 8] + b[ 0] * a[11];
    target[12] = b[12] * a[ 0] - b[ 9] * a[ 1] - b[ 7] * a[ 2] + b[ 5] * a[ 4] + b[ 4] * a[ 5] - b[ 2] * a[ 7] - b[ 1] * a[ 9] + b[ 0] * a[12];
    target[13] = b[13] * a[ 0] - b[10] * a[ 1] + b[ 7] * a[ 3] - b[ 6] * a[ 4] - b[ 4] * a[ 6] + b[ 3] * a[ 7] - b[ 1] * a[10] + b[ 0] * a[13];
    target[14] = b[14] * a[ 0] + b[10] * a[ 2] + b[ 9] * a[ 3] + b[ 8] * a[ 4] + b[ 4] * a[ 8] + b[ 3] * a[ 9] + b[ 2] * a[10] + b[ 0] * a[14];
    target[15] = b[15] * a[ 0] + b[14] * a[ 1] + b[13] * a[ 2] + b[12] * a[ 3] + b[11] * a[ 4] + b[10] * a[ 5] + b[ 9] * a[ 6] + b[ 8] * a[ 7] + b[ 7] * a[ 8] + b[ 6] * a[ 9] + b[ 5] * a[10] - b[ 4] * a[11] - b[ 3] * a[12] - b[ 2] * a[13] - b[ 1] * a[14] + b[ 0] * a[15];`)

    createFunction(`inner`, [`a`, `b`], `
    target[ 0] = b[ 0] * a[ 0] + b[ 2] * a[ 2] + b[ 3] * a[ 3] + b[ 4] * a[ 4] - b[ 8] * a[ 8] - b[ 9] * a[ 9] - b[10] * a[10] - b[14] * a[14];
    target[ 1] = b[ 1] * a[ 0] + b[ 0] * a[ 1] - b[ 5] * a[ 2] - b[ 6] * a[ 3] - b[ 7] * a[ 4] + b[ 2] * a[ 5] + b[ 3] * a[ 6] + b[ 4] * a[ 7] + b[11] * a[ 8] + b[12] * a[ 9] + b[13] * a[10] + b[ 8] * a[11] + b[ 9] * a[12] + b[10] * a[13] + b[15] * a[14] - b[14] * a[15];
    target[ 2] = b[ 2] * a[ 0] + b[ 0] * a[ 2] - b[ 8] * a[ 3] + b[ 9] * a[ 4] + b[ 3] * a[ 8] - b[ 4] * a[ 9] - b[14] * a[10] - b[10] * a[14];
    target[ 3] = b[ 3] * a[ 0] + b[ 8] * a[ 2] + b[ 0] * a[ 3] - b[10] * a[ 4] - b[ 2] * a[ 8] - b[14] * a[ 9] + b[ 4] * a[10] - b[ 9] * a[14];
    target[ 4] = b[ 4] * a[ 0] - b[ 9] * a[ 2] + b[10] * a[ 3] + b[ 0] * a[ 4] - b[14] * a[ 8] + b[ 2] * a[ 9] - b[ 3] * a[10] - b[ 8] * a[14];
    target[ 5] = b[ 5] * a[ 0] - b[11] * a[ 3] + b[12] * a[ 4] + b[ 0] * a[ 5] - b[15] * a[10] - b[ 3] * a[11] + b[ 4] * a[12] - b[10] * a[15];
    target[ 6] = b[ 6] * a[ 0] + b[11] * a[ 2] - b[13] * a[ 4] + b[ 0] * a[ 6] - b[15] * a[ 9] + b[ 2] * a[11] - b[ 4] * a[13] - b[ 9] * a[15];
    target[ 7] = b[ 7] * a[ 0] - b[12] * a[ 2] + b[13] * a[ 3] + b[ 0] * a[ 7] - b[15] * a[ 8] - b[ 2] * a[12] + b[ 3] * a[13] - b[ 8] * a[15];
    target[ 8] = b[ 8] * a[ 0] + b[14] * a[ 4] + b[ 0] * a[ 8] + b[ 4] * a[14];
    target[ 9] = b[ 9] * a[ 0] + b[14] * a[ 3] + b[ 0] * a[ 9] + b[ 3] * a[14];
    target[10] = b[10] * a[ 0] + b[14] * a[ 2] + b[ 0] * a[10] + b[ 2] * a[14];
    target[11] = b[11] * a[ 0] + b[15] * a[ 4] + b[ 0] * a[11] - b[ 4] * a[15];
    target[12] = b[12] * a[ 0] + b[15] * a[ 3] + b[ 0] * a[12] - b[ 3] * a[15];
    target[13] = b[13] * a[ 0] + b[15] * a[ 2] + b[ 0] * a[13] - b[ 2] * a[15];
    target[14] = b[14] * a[ 0] + b[ 0] * a[14];
    target[15] = b[15] * a[ 0] + b[ 0] * a[15];`)

    createFunction(`join`, [`a`, `b`], `
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
               + a[ 8] * b[ 7] + a[ 9] * b[ 6] + a[10] * b[ 5] + a[11] * b[ 4] + a[12] * b[ 3] + a[13] * b[ 2] + a[14] * b[ 1] + a[15] * b[ 0];`)

    createFunction(`add`, [`a`, `b`], `
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
    target[15] = a[15] + b[15];`)

    createFunction(`sub`, [`a`, `b`], `
    target[ 0] = a[ 0] - b[ 0];
    target[ 1] = a[ 1] - b[ 1];
    target[ 2] = a[ 2] - b[ 2];
    target[ 3] = a[ 3] - b[ 3];
    target[ 4] = a[ 4] - b[ 4];
    target[ 5] = a[ 5] - b[ 5];
    target[ 6] = a[ 6] - b[ 6];
    target[ 7] = a[ 7] - b[ 7];
    target[ 8] = a[ 8] - b[ 8];
    target[ 9] = a[ 9] - b[ 9];
    target[10] = a[10] - b[10];
    target[11] = a[11] - b[11];
    target[12] = a[12] - b[12];
    target[13] = a[13] - b[13];
    target[14] = a[14] - b[14];
    target[15] = a[15] - b[15];`)

    createFunction(`reverse`, [`mv`], `
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

    target[15] =  mv[15];`)

    createFunction(`dual`, [`mv`], `
    target[ 0] = mv[15];
                
    target[ 1] = mv[14];
    target[ 2] = mv[13];
    target[ 3] = mv[12];
    target[ 4] = mv[11];

    target[ 5] = mv[10];
    target[ 6] = mv[ 9];
    target[ 7] = mv[ 8];
    target[ 8] = mv[ 7];
    target[ 9] = mv[ 8];
    target[10] = mv[ 5];

    target[11] = mv[ 4];
    target[12] = mv[ 3];
    target[13] = mv[ 2];
    target[14] = mv[ 1];

    target[15] = mv[ 0];`)

    return jsString
}