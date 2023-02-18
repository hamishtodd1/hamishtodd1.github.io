function init301WithoutDeclarations(basisNames) {

    const N_COEFS = 16
    const N_ROTOR_COEFS = 8
    const N_BIVECTOR_COEFS = 6

    sinc = (a) => {
        return a == 0. ? 1. : Math.sin(a) / a;
    }

    class GeneralVector extends Float32Array {
        
        set() {
            return this.copy(arguments)
        }

        multiplyScalar(s) {
            for (let i = 0; i < this.constructor.size; ++i)
                this[i] *= s

            return this
        }

        copy(a) {
            for (let i = 0; i < this.constructor.size; ++i)
                this[i] = a[i]

            return this
        }

        clone() {
            let cl = new this.constructor()
            //also the planes lines and points' magnitude should be on the thingy
            cl.copy(this)

            return cl
        }

        equals(a) {
            let ret = true
            for (let i = 0; i < this.constructor.size; ++i) {
                if (this[i] !== a[i])
                    ret = false
            }
            return ret
        }

        fromArray(arr) {
            for (let i = 0; i < this.constructor.size; ++i)
                this[i] = arr[i]

            return this
        }

        toArray(arr) {
            for (let i = 0; i < this.constructor.size; ++i)
                arr[i] = this[i]

            return arr
        }

        fromMv(mv) {
            for (let i = 0; i < this.constructor.size; ++i)
                this[i] = mv[this.constructor.mvOffsets[i]]

            return this
        }

        toMv(target) {
            target.copy(zeroMv)
            for (let i = 0; i < this.constructor.size; ++i)
                target[this.constructor.mvOffsets[i]] = this[i]

            return target
        }
    }
    window.GeneralVector = GeneralVector

    class ScalarMv extends GeneralVector {
        static get mvOffsets() { return [0] }
        static get size() { return 1 }

        constructor() {
            return super(1)
        }
    }
    window.ScalarMv = ScalarMv

    class Biv extends GeneralVector {
        static get mvOffsets() { return [5, 6, 7, 8, 9, 10] }
        static get size() { return N_BIVECTOR_COEFS }

        constructor() {
            return super(N_BIVECTOR_COEFS)
        }

        exp(target) {
            if(target === undefined)
                target = new Dq()

            let l = (this[3] * this[3] + this[4] * this[4] + this[5] * this[5])
            if (l == 0.)
                return target.set(1, this[0], this[1], this[2], 0., 0., 0., 0.)
            let m = (this[0] * this[5] + this[1] * this[4] + this[2] * this[3]), a = Math.sqrt(l), c = Math.cos(a), s = Math.sin(a) / a, t = m / l * (c - s)
            return target.set(c, s * this[0] + t * this[5], s * this[1] + t * this[4], s * this[2] + t * this[3], s * this[3], s * this[4], s * this[5], m * s)
        }

        distanceToPoint(pt) {
            //join plane magnitude
            let planeX = pt[11]*this[4] - pt[12]*this[3] + pt[14]*this[0]
            let planeZ = pt[12]*this[5] - pt[13]*this[4] + pt[14]*this[2]
            let planeY = pt[13]*this[3] - pt[11]*this[5] + pt[14]*this[1]
            return Math.sqrt(sq(planeX) + sq(planeY) + sq(planeZ))
        }
    }
    window.Biv = Biv

    class Dq extends GeneralVector {
        static get mvOffsets() { return [0,   5,6,7,8,9,10,   15] }
        static get size() { return N_ROTOR_COEFS }

        constructor() {
            return super(N_ROTOR_COEFS)
        }

        applyToThreeVec(vecPt) {
            this.toMat4(m1)
            vecPt.applyMatrix4(m1)
            return vecPt
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

        getBivectorPartToMv(target) {
            for( let i = 0; i < 6; ++i )
                localBiv0[i] = this[i+1]
            localBiv0.toMv(target)
            return target
        }

        setBivectorPartFromMvAndScalarMultiple(mv, scalar) {
            for (let i = 0; i < 6; ++i)
                this[i+1] = mv[i+5] * scalar
        }

        normalize() {
            this.getNormalization(localDq0)
            return this.copy(localDq0)
        }

        sqrt(target) {
            if(target === undefined)
                console.error("use sqrtSelf")
            target.copy(this)
            return target.sqrtSelf()
        }

        sqrtSelf() {
            this[0] += this[0] < 0. ? -1. : 1. //really you should be adding its norm
            return this.normalize()
        }

        getStudySeparation() {
            //so, normalize first
            if (this[0] === 1.)
                return [0,1]
            else {
                let a = 1. / (1. - this[0] * this[0])     // inv squared length. 
                let b = Math.acos(this[0]) * Math.sqrt(a) // rotation scale
                return [a,b]
            }
        }

        logarithm(target) {
            if (this[0] === 1.)
                return target.set(this[1], this[2], this[3], 0., 0., 0.)
            let [a,b] = this.getStudySeparation()
            let c = a * this[7] * (1. - this[0] * b)  // translation scale
            return target.set(c * this[6] + b * this[1], c * this[5] + b * this[2], c * this[4] + b * this[3], b * this[4], b * this[5], b * this[6])
        }

        mul(b,target) {
            target[ 0] = b[ 0] * this[ 0] - b[ 4] * this[ 4] - b[ 5] * this[ 5] - b[ 6] * this[ 6]

            target[ 1] = b[ 1] * this[ 0] + b[ 0] * this[ 1] - b[ 4] * this[ 2] + b[ 5] * this[ 3] + b[ 2] * this[ 4] - b[ 3] * this[ 5] - b[ 7] * this[ 6] - b[ 6] * this[ 7]
            target[ 2] = b[ 2] * this[ 0] + b[ 4] * this[ 1] + b[ 0] * this[ 2] - b[ 6] * this[ 3] - b[ 1] * this[ 4] - b[ 7] * this[ 5] + b[ 3] * this[ 6] - b[ 5] * this[ 7]
            target[ 3] = b[ 3] * this[ 0] - b[ 5] * this[ 1] + b[ 6] * this[ 2] + b[ 0] * this[ 3] - b[ 7] * this[ 4] + b[ 1] * this[ 5] - b[ 2] * this[ 6] - b[ 4] * this[ 7]
            
            target[ 4] = b[ 4] * this[ 0] + b[ 0] * this[ 4] + b[ 6] * this[ 5] - b[ 5] * this[ 6]
            target[ 5] = b[ 5] * this[ 0] - b[ 6] * this[ 4] + b[ 0] * this[ 5] + b[ 4] * this[ 6]
            target[ 6] = b[ 6] * this[ 0] + b[ 5] * this[ 4] - b[ 4] * this[ 5] + b[ 0] * this[ 6]
            //the quaternion part is only affected by the quaternion parts

            target[ 7] = b[ 7] * this[ 0] + b[ 6] * this[ 1] + b[ 5] * this[ 2] + b[ 4] * this[ 3] + b[ 3] * this[ 4] + b[ 2] * this[ 5] + b[ 1] * this[ 6] + b[ 0] * this[ 7]
        }

        getReverse(target) {
            target.copy(this)
            for(let i = 1; i < 7; ++i)
                target[i] *= -1.
        }

        reverseSelf() {
            this.getReverse(localDq0)
            this.copy(localDq0)
        }

        fromMat4(mat) {
            mat.decompose(v1, q1, v2)
            let asMv = newMv.fromPosQuat(v1, q1)
            boneInverseDqs[i].fromMv(asMv)
            return this
        }

        toMat4(target) {
            let r44 = this[4] * this[4]
            let r55 = this[5] * this[5]
            let r66 = this[6] * this[6]

            let r45 = this[4] * this[5]
            let r46 = this[4] * this[6]
            let r56 = this[5] * this[6]

            let r04 = this[0] * this[4]
            let r05 = this[0] * this[5]
            let r06 = this[0] * this[6]

            return target.set(
                1. + 2.*(-r44-r55),      2.*( r04+r56),      2.*( r46-r05), 2.*( this[3]*this[5]-this[2]*this[4]-this[0]*this[1]-this[7]*this[6]),
                     2.*( r56-r04), 1. + 2.*(-r44-r66),      2.*( r06+r45), 2.*( this[1]*this[4]-this[3]*this[6]-this[0]*this[2]-this[7]*this[5]),
                     2.*( r05+r46),      2.*( r45-r06), 1. + 2.*(-r55-r66), 2.*( this[2]*this[6]-this[1]*this[5]-this[0]*this[3]-this[7]*this[4]),
                     0.,0.,0.,1.);                
        }

        fromPosQuat(p, q) {
            let asMv = newMv
            this.toMv(asMv)
            asMv.fromPosQuat(p, q)
            this.fromMv(asMv)
            return this
        }
    }
    window.Dq = Dq

    class Mv extends GeneralVector {
        static get size() { return N_COEFS }

        constructor() {
            return super(N_COEFS)
        }

        flection( a0, a1, a2, a3, a021, a013, a032, a123) {
            this[ 0] = 0.
            this[ 1] = a0
            this[ 2] = a1
            this[ 3] = a2
            this[ 4] = a3
            this[ 5] = 0.
            this[ 6] = 0.
            this[ 7] = 0.
            this[ 8] = 0.
            this[ 9] = 0.
            this[10] = 0.
            this[11] = a021
            this[12] = a013
            this[13] = a032
            this[14] = a123
            this[15] = 0.

            return this
        }

        getTranslationFromScrewMotion(target) {
            if (target === undefined)
                target = new Mv()

            let thisNormalized = newMv
            thisNormalized.copy(this).normalize()

            let quadreflection = newMv
            thisNormalized.selectGrade(4, quadreflection)

            let bireflection = newMv
            thisNormalized.selectGrade( 2, bireflection )
            
            mul( quadreflection, bireflection.invert(newMv), target )
            target[0] = 1.

            return target
        }

        fromLerp(a,b,proportion) {
            for (let i = 0; i < N_COEFS; ++i)
                this[i] = a[i] + proportion * (b[i] - a[i])

            return this
        }

        getSquaredENormAtGrade(grade) {
            switch (grade) {
                case 0:
                    return this[0] * this[0]
                case 1:
                    return sq(this[2]) + sq(this[3]) + sq(this[4])
                case 2:
                    return sq(this[8]) + sq(this[9]) + sq(this[10])
                case 3:
                    return sq(this[14])
                case 4:
                    return 0.
            }
        }

        //if both inputs are lines that have both angle and distance, returns angle. Want distance? Project first
        getSeparationTo(mv) {
            let mvs = [this, mv]
            
            let elementsToUse = [newMv, newMv]
            let grades = Array(2)
            for(let i = 0; i < 2; ++i) {
                let grade = mvs[i].getGrade() //if you were optimized you'd already have these
                if(isNaN(grade))
                    return 0. //we don't do mixed-grade objects

                let squaredENorm = mvs[i].getSquaredENormAtGrade(grade)
                if( squaredENorm !== 0.) {
                    elementsToUse[i].copy(mvs[i])
                    grades[i] = grade
                }
                else {
                    dual(mvs[i], elementsToUse[i])
                    grades[i] = 4 - grade
                }
            }

            let transform = mul(elementsToUse[0], elementsToUse[1], newMv)

            let lowerGrade = (grades[0] + grades[1]) % 2
            let lowerGradeENorm = Math.sqrt( transform.getSquaredENormAtGrade(lowerGrade) )

            //ohhh but what if instead of |Point-part| you use Point-part.e123?
            
            let higherGrade = 2 + lowerGrade
            let higherGradeSquaredENorm = transform.getSquaredENormAtGrade( higherGrade )

            let isAtAngle = higherGradeSquaredENorm !== 0.
            if( isAtAngle )
                return Math.atan( Math.sqrt(higherGradeSquaredENorm) / lowerGradeENorm )
            else { //transform is either the identity or a translation
                let transformDual = dual(transform, newMv)
                higherGradeSquaredENorm = transformDual.getSquaredENormAtGrade(4 - higherGrade)
                return Math.sqrt(higherGradeSquaredENorm) / lowerGradeENorm
            }
        }

        //bit disorganized naming, TODO
        fromVec(v) {
            this.copy(zeroMv)

            //possibly it would be better to derive the e12s and so on from taking your vectors

            this[11] = v.z
            this[12] = v.y
            this[13] = v.x
            this[14] = 1.

            return this
        }

        fromDirectionVec(v) {
            this.copy(zeroMv)

            this[11] = v.z
            this[12] = v.y
            this[13] = v.x
            this[14] = 0.

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
        toVec4(v) {
            v.x = this[13]
            v.y = this[12]
            v.z = this[11]
            v.w = this[14]

            return v
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
        toVectorArray(arr,index) {
            arr[index*3+0] = this[13] / this[14]
            arr[index*3+1] = this[12] / this[14]
            arr[index*3+2] = this[11] / this[14]
        }

        getDisplayableVersion(target) {
            if (this.hasEuclideanPart())
                target.copy(this)
            else {
                let cameraJoin = join(camera.mvs.pos, this, newMv)
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
            this.copy(zeroMv)
            if(w === undefined)
                w = 1.
            this[14] = w
            this[13] = x
            this[12] = y
            this[11] = z

            return this
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

        dqLog(target) {
            if(target === undefined)
                target = new Mv()
            localDq0.fromMv(this)
            localDq0.logarithm(localBiv0)
            localBiv0.toMv(target)
            return target
        }

        extractTranslation(target) {
            let normalized = this.getNormalization(newMv)

            let linePart = normalized.selectGrade(2, newMv)
            let linePartInversion = linePart.invert(newMv)

            let pssPart  = normalized.selectGrade(4, newMv)
            mul(pssPart, linePartInversion,target)
            target[0] += 1.

            return target
        }

        fromPointToPoint(a,b) {
            mul(b, a, this)
            this.sqrtSelf()
            return this
        }

        fromAxisAngle(axis,angle) {
            localBiv0.fromMv(axis)
            localBiv0.multiplyScalar(angle / 2.)
            localBiv0.exp(localDq0)
            return localDq0.toMv(this)
        }

        fromAxisDistance(axis, distance) {
            this.copy(axis)
            this.multiplyScalar(distance/2.)
            this[0] = 1.
            return this
        }

        eNorm() {
            return Math.sqrt(eNormSquared(this))
        }
        iNorm() {
            let thisDual = dual(this, newMv)
            return thisDual.eNorm()
        }
        norm() {
            let ourENormSquared = eNormSquared(this)
            if (ourENormSquared !== 0.)
                return Math.sqrt(ourENormSquared)
            else
                return this.iNorm()
        }

        normalize() {
            this.multiplyScalar(1./this.norm())
            return this
        }

        getNormalization(target) {
            target.copy(this)
            return target.normalize()
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

            return target.copy(this).sqrtSelf()
        }

        sqrtSelf() {
            localDq0.fromMv(this).normalize().sqrtSelf().toMv(this)

            return this
        }

        fromPosQuat(p, q) {
            //maybe nicer as a dq specifically!
            let quat = newMv
            quat.fromQuaternion(q)
            
            let pPoint = newMv.fromVec(p)
            let doubleTrans = mul(pPoint, e123, newMv)
            let trans = doubleTrans.sqrt(newMv)
            
            mul(trans, quat, this)

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

        reverse(target) {
            reverse(this,target)
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
        hasInfinitePart() {
            return this.iNorm() !== 0.
        }
    }
    window.Mv = Mv

    let indexGrades = [
        0,
        1,1,1,1,
        2,2,2, 2,2,2,
        3,3,3,3,
        4
    ]

    /*EXTRA FUNCTIONS ADDED HERE*/

    let localDq0 = new Dq()
    let localBiv0 = new Biv()

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

    zeroBiv = new Biv()
    biv0 = new Biv()
    biv1 = new Biv()
    biv2 = new Biv()

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
    I = mul(e0, e123)

    let basisDirectionMvs = [e032,e013,e021]

    mv0 = new Mv()
    mv1 = new Mv()
    mv2 = new Mv()
    mv3 = new Mv()
    mv4 = new Mv()
    mv5 = new Mv()
    mv6 = new Mv()

    dq0 = new Dq()
    bv0 = new Biv()

/*END*/}

function createNonVerboseSharedFunctions(createFunction) {
    createFunction(`sandwich`, [`m`, `a`], `
    float[16] mReverse = newMv;
    reverse(m, mReverse);
    
    float[16] intermediate = newMv;
    mul(m,a,intermediate); //sigh, is there a -? TODO

    mul(intermediate,mReverse,target);`)

    createFunction(`eNormSquared`, [`a`], `
    float[16] rev = newMv;
    reverse(a, rev);
    float[16] studyNumber = newMv;
    mul(a, rev, studyNumber);
    return Math.abs(studyNumber[0]);`,
        `float`)

    createFunction(`multiplyScalar`, [`inout float[16] a`, `in float scalar`], `
    for(int i = 0; i < 16; ++i) {
        a[i] *= scalar;
    }`,
        `void`)

    createFunction(`invert`, [`a`], `
    reverse(a, target);
    multiplyScalar(target, 1. / eNormSquared(target) );`)

    createFunction(`projectAOnB`, [`a`, `b`], `
    float[16] intermediate = newMv;
    inner(b, a, intermediate);
    float[16] inverse = newMv;
    invert(b,inverse);
    mul(intermediate, inverse, target);`)
}

function createVerboseSharedFunctions(createFunction) {

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