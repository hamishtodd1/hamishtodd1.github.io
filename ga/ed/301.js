/*
    Points square to -1. Suggests they're rotations. Which, yes
 */

function init301WithoutDeclarations() {

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

        set() {
            return this.copy(arguments)
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
            return this.copy(arguments)
        }

        multiplyScalar(s) {
            for (let i = 0; i < N_ROTOR_COEFS; ++i)
                this[i] *= s

            return this
        }

        getNormalization(target) {
            var A = 1. / Math.sqrt(this[0] * this[0] + this[4] * this[4] + this[5] * this[5] + this[6] * this[6])
            var B = (this[7] * this[0] - (this[1] * this[6] + this[2] * this[5] + this[3] * this[4])) * A * A * A
            return target.set(
                A * this[0], 
                A * this[1] + B * this[6], 
                A * this[2] + B * this[5], 
                A * this[3] + B * this[4],
                A * this[4], 
                A * this[5], 
                A * this[6], 
                A * this[7] - B * this[0])
        }

        normalize() {
            this.getNormalization(localDq0)
            return this.copy(localDq0)
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

        set() {
            return this.copy(arguments)
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

        fromVec(v) {
            this.copy(zeroMv)

            //possibly it would be better to derive the e12s and so on from taking your vectors

            this[11] = v.z
            this[12] = v.y
            this[13] = v.x
            this[14] = 1.

            return this
        }

        fromVec4(v) {
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
            return sandwich(this, mv, target)
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

        eNorm() {
            return Math.sqrt(eNormSquared(this))
        }
        iNorm() {
            let thisDual = newMv
            dual(this,thisDual)
            return thisDual.eNorm()
            // let pointNorm = Math.sqrt(  sq(this[11]) + sq(this[12]) + sq(this[13]))
            // let lineNorm = Math.sqrt(   sq(this[ 5]) + sq(this[ 6]) + sq(this[ 7]))
            // return Math.max(Math.abs(this[1]), Math.abs(this[15]), pointNorm, lineNorm)
        }
        norm() {
            if(this.hasEuclideanPart())
                return this.eNorm()
            else
                return this.iNorm()
        }

        normalize() {
            this.multiplyScalar(1./this.norm())

            return this
        }

        invert(target) {
            if(target === undefined)
                target = new Mv()

            if (eNormSquared(this) === 0.)
                console.error("trying to invert a null element, something has gone wrong")
            else
                invert(this,target)

            return target
        }

        projectOn(mv,target) {
            //if you want to project on anything at infinity, different matter
            //take out the euclidean part I guess

            return projectAOnB(this,mv,target)
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
            
            let pPoint = newMv.fromVec(p)
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

        equals(mv) {
            let doesEqual = true
            for (let i = 0; i < N_COEFS; ++i) {
                if( this[i] !== mv[i])
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

        getGrade() {
            //if you want to use this function elsewhere, note that because 0 is a scalar, the grade == 0 case isn't quite true
            let self = this
            function hasGrade(grade) {
                switch (grade) {
                    case 0:
                        return self[0] !== 0.
                    case 1:
                        return (self[1] !== 0. || self[2] !== 0. || self[3] !== 0. || self[4] !== 0.)
                    case 2:
                        return (self[5] !== 0. || self[6] !== 0. || self[7] !== 0. || self[8] !== 0. || self[9] !== 0. || self[10] !== 0.)
                    case 3:
                        return (self[11] !== 0. || self[12] !== 0. || self[13] !== 0. || self[14] !== 0.)
                    case 4:
                        return self[15] !== 0.
                }
            }

            let alreadyFilledIn = false
            let grade = 0 //because 0 is a scalar
            for(let i = 0; i < 5; ++i) {
                if (hasGrade(i) ) {
                    if (!alreadyFilledIn) {
                        grade = i
                        alreadyFilledIn = true
                    }
                    else
                        grade = i%2 === 0 ? "motor" : "flection"
                }
            }
            return grade
        }

        squaresToScalar() {
            let square = mul(this,this,newMv)
            // log(this,square,square.getGrade())
            let grade = square.getGrade()
            return grade === 0
        }

        hasEuclideanPart() {
            return eNormSquared(this) > .00001
        }
    }
    window.Mv = Mv

    const basisNames = ["", "0", "1", "2", "3", "01", "02", "03", "12", "31", "23", "021", "013", "032", "123", "0123"]

    let indexGrades = [
        0,
        1,1,1,1,
        2,2,2, 2,2,2,
        3,3,3,3,
        4
    ]

    let localDq0 = new Dq()
    let localBiv0 = new Biv()

/*END*/}

async function init301() {
    let fullFuncString = init301WithoutDeclarations.toString()
    let funcString = fullFuncString.slice(0, fullFuncString.indexOf("/*END*/}")) 
        + createSharedFunctionDeclarationsStrings()
    
    //newMv is not a variable name. It is equivalent to "new Mv()"

    let i = 0
    let declarations = ""
    let withoutDeclarations = funcString.replace(/newMv/g, () => {
        declarations += "\n    let newMv" + i + " = new Mv()"
        return "newMv" + (i++)
    })
    let strToEval =
        "(" +
        withoutDeclarations +
        declarations +
        "})()"
        
    eval(strToEval)

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
    e01 = mul(e0, e1)
    e02 = mul(e0, e2)
    e03 = mul(e0, e3)
    e12 = mul(e1, e2)
    e31 = mul(e3, e1)
    e23 = mul(e2, e3)
    e021 = mul(e02, e1)
    e013 = mul(e01, e3)
    e032 = mul(e03, e2)
    e123 = mul(e1, e23)
    e0123 = mul(e0, e123)

    mv0 = new Mv()
    mv1 = new Mv()
    mv2 = new Mv()
    mv3 = new Mv()
    mv4 = new Mv()
    mv5 = new Mv()
    mv6 = new Mv()

    dq0 = new Dq()    
        
    generalShaderPrefix += await getTextFile('301.glsl') //it's purely the dual quaternion part

    e1.log()
}

function createSharedFunctionDeclarationsStrings()
{
    let jsString = "\n\n"
    let glslGaString = ""

    //this function takes something written in a weird combination of js and glsl and spits out both
    function createFunction(funcName, funcArgs, body, type) {
        let fillInTarget = type === undefined

        let glslVersion = (fillInTarget?`void`:type) + " " + funcName + "( "
        let jsVersion = funcName + " = function( "

        funcArgs.forEach((funcArg, i) => {
            if (funcArg.indexOf(" ") === -1) {
                jsVersion += funcArg    
                glslVersion += "in float[16] " + funcArg
            }
            else {
                let splitBySpace = funcArg.split(" ")
                jsVersion += splitBySpace[splitBySpace.length-1]
                glslVersion += funcArg
            }

            if (i !== funcArgs.length - 1 || fillInTarget) {
                jsVersion += `, `
                glslVersion += `, `
            }
        })

        let jsBody = body.replace(/(float\[16\])|(float )|(int )/g, "let")
        let glslBody = body.replace(/(\s+=\s+(newMv))|(Math\.)/g, "")

        if (fillInTarget) {
            glslVersion += `out float[16] target ) {` + glslBody + `\n}\n`
            //might be nice to check if you are allowed to return an inout

            jsVersion += `target ) {\n    if(target === undefined)\n        target = new Mv()\n` + 
                jsBody + `\n    return target\n}\n\n`
        }
        else {
            glslVersion += ` ) {` + glslBody + `\n}\n\n`
            jsVersion += ` ) {` + jsBody + `\n}\n\n`
        }
        
        glslGaString += glslVersion
        jsString += jsVersion
    }

    createVerboseFunctions(createFunction)

    createFunction(`sandwich`,[`m`,`a`],`
    float[16] mReverse = newMv;
    reverse(m, mReverse);
    
    float[16] intermediate = newMv;
    mul(m,a,intermediate); //sigh, is there a -?

    mul(intermediate,mReverse,target);`)

    createFunction(`eNormSquared`,[`a`],`
    float[16] rev = newMv;
    reverse(a, rev);
    float[16] studyNumber = newMv;
    mul(a, rev, studyNumber);
    return Math.abs(studyNumber[0]);`,
    `float`)

    createFunction(`multiplyScalar`,[`inout float[16] a`,`in float scalar`],`
    for(int i = 0; i < 16; ++i) {
        a[i] *= scalar;
    }`,
    `void`)

    createFunction(`invert`, [`a`],`
    reverse(a, target);
    multiplyScalar(target, 1. / eNormSquared(target) );`)

    createFunction(`projectAOnB`, [`a`, `b`], `
    float[16] intermediate = newMv;
    inner(b, a, intermediate);
    float[16] inverse = newMv;
    invert(b,inverse);
    mul(intermediate, inverse, target);`)

    //maybe try to do better than this, geometrically

    generalShaderPrefix = glslGaString + generalShaderPrefix

    return jsString
}

function createVerboseFunctions(createFunction) {
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
    target[ 9] = mv[ 6];
    target[10] = mv[ 5];

    target[11] = mv[ 4];
    target[12] = mv[ 3];
    target[13] = mv[ 2];
    target[14] = mv[ 1];

    target[15] = mv[ 0];`)
}