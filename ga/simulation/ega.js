function initDqFlWithoutDeclarations() {

    class Fl extends Ega {

        constructor() {
            super(8)
        }

        distanceToPt(pt) {
            return Math.sqrt(this.joinPt(pt, newFl).eNormSq())
        }

        eNormSq() {
            //inner product with its own reverse, guaranteed to be a scalar
            return this[1] * this[1] + this[2] * this[2] + this[3] * this[3] + this[7] * this[7]
        }

        getNormalization(target) {

            let adHocNormSq = this.eNormSq();
            if (adHocNormSq === 0.)
                adHocNormSq = this.getDual(newFl).eNormSq()

            let factor = 1. / Math.sqrt(adHocNormSq)
            return this.multiplyScalar(factor, target)
        }

        normalize() {
            return this.copy(this.getNormalization(newFl))
        }

        point(x, y, z, w) {
            this.zero()
            if (w === undefined)
                w = 1.
            this[7] = w
            this[6] = x
            this[5] = y //because e01 e02 e03 is a translation along x, y and z, no minus sign here
            this[4] = z

            return this
        }

        pointFromVertex(v) {
            this.point(v.x, v.y, v.z, 1.)
            return this
        }
        pointFromNormal(v) {
            this.point(v.x, v.y, v.z, 0.)
            return this
        }

        pointToVertex(target) {
            if (target === undefined)
                target = new THREE.Vector3()
            if (this[7] === 0.){
                // debugger
                console.error("ideal point cannot be converted to vec3")
            }
            else {
                target.z = this[4] / this[7]
                target.y = this[5] / this[7]
                target.x = this[6] / this[7]
            }

            return target
        }

        plane(e0Coef, e1Coef, e2Coef, e3Coef) {
            this.zero()
            this[0] = e0Coef
            this[1] = e1Coef
            this[2] = e2Coef
            this[3] = e3Coef

            return this
        }

        /*flVerbose*/
    }
    window.Fl = Fl

    class Dq extends Ega {

        constructor() {
            super(8)
            this[0] = 1.
        }

        pow(t, target) {
            let a = this.logarithm(newDq)
            a.multiplyScalar(t, a)
            return a.exp(target)
        }

        getDistanceSq() {
            let [rotation, translation] = this.invariantDecomposition(newDq, newDq)
            return translation[1] * translation[1] + translation[2] * translation[2] + translation[3] * translation[3]
        }

        //operates on Dqs, not bivectors. Might be simpler for bivectors: check for scalar square
        invariantDecomposition(rotnTarget, trnsTarget) {

            let normalized = this.getNormalization(newDq)

            if(normalized[7] === 0.) {
                if (normalized[4] === 0. && normalized[5] === 0. && normalized[6] === 0.) {
                    //pure translation
                    trnsTarget.copy(normalized)
                    rotnTarget.copy(oneDq)
                }
                else {
                    rotnTarget.copy(normalized)
                    trnsTarget.copy(oneDq)
                }
            }
            else {
                let numerator   = normalized.selectGrade(4, newDq)
                let denominator = normalized.selectGrade(2, newDq).getReverse(newDq)
                numerator.mul(denominator, trnsTarget)
                trnsTarget[0] += 1.
    
                let translationReverse = trnsTarget.getReverse(newDq)
                normalized.mul(translationReverse, rotnTarget)
            }

            return [rotnTarget, trnsTarget]
        }

        fromUnitAxisAndSeparation(axis, separation) {
            let logAxis = axis.multiplyScalar(separation, newDq)
            return logAxis.exp(this)
        }

        ptToPt(x1,y1,z1,x2,y2,z2) {

            this.zero()

            if(x1.isVector3) {
                this[0] = 1.
                this[1] = (x2.x - x1.x) * -.5
                this[2] = (x2.y - x1.y) * -.5
                this[3] = (x2.z - x1.z) * -.5
            }
            else if ( typeof x1 === `number` ) {
                this[0] = 1.
                this[1] = (x2 - x1) * -.5
                this[2] = (y2 - y1) * -.5
                this[3] = (z2 - z1) * -.5
            }
            else if(x1 instanceof Fl) {
                if(x1[7] === 0. || y1[7] === 0.)
                    console.error("ideal points cannot be translated to or from")
                
                this.ptToPt(
                    x1[6] / x1[7], x1[5] / x1[7], x1[4] / x1[7], 
                    y1[6] / y1[7], y1[5] / y1[7], y1[4] / y1[7])
            }

            return this
        }

        //normalized only
        logarithm(target) {
            if (this[0] === 1.)
                return target.set(0., this[1], this[2], this[3], 0., 0., 0., 0.)
            let a = 1. / (1. - this[0] * this[0]),
                b = Math.acos(this[0]) * Math.sqrt(a),
                c = a * this[7] * (1. - this[0] * b)
            return target.set(0., c * this[6] + b * this[1], c * this[5] + b * this[2], c * this[4] + b * this[3], b * this[4], b * this[5], b * this[6], 0.)
        }

        exp(target) {
            if (target === undefined)
                target = new Dq()

            let l = (this[4] * this[4] + this[5] * this[5] + this[6] * this[6])
            if (l === 0.)
                return target.set(1, this[1], this[1], this[2], 0, 0, 0, 0)

            let m = (this[1] * this[6] + this[2] * this[5] + this[3] * this[4]), a = Math.sqrt(l), c = Math.cos(a), s = Math.sin(a) / a, t = m / l * (c - s);

            return target.set( c,
                s * this[1] + t * this[6],
                s * this[2] + t * this[5],
                s * this[3] + t * this[4],
                s * this[4],
                s * this[5],
                s * this[6],
                m * s)
        }

        translator(x,y,z) {
            this.copy(oneDq)

            if(x.isVector) {
                this[1] = -.5 * x.x
                this[2] = -.5 * x.y
                this[3] = -.5 * x.z
            }
            else {
                this[1] = -.5 * x
                if (y !== undefined)
                    this[2] = -.5 * y
                if (z !== undefined)
                    this[3] = -.5 * z
            }

            return this
        }

        translatorToVec3(v) {
            if (v === undefined)
                v = new THREE.Vector3()

            let factor = -.5 / this[0]
            v.x = this[1] * factor
            v.y = this[2] * factor
            v.z = this[3] * factor
            return v
        }

        applyToThreeVec(vecPt) {
            this.toMat4(m1)
            vecPt.applyMatrix4(m1)
            return vecPt
        }

        eNormSq() {
            //inner product with its own reverse
            return this[0] * this[0] + this[4] * this[4] + this[5] * this[5] + this[6] * this[6]
        }

        getNormalization(target) {

            if(target === undefined)
                target = new Dq()

            let eNormSq = this.eNormSq()

            if(eNormSq === 0.) {
                let iNormSq = this.getDual(newDq).eNormSq()
                if (iNormSq !== 0.)
                    return this.multiplyScalar(1. / Math.sqrt(iNormSq), target)
                else {
                    console.warn("zero dual quaternion, probably. isZero value:", this.isZero() )
                    return target.copy(oneDq)
                }
            }
            
            let A = 1. / Math.sqrt(eNormSq)
            let B = (this[7] * this[0] - (this[1] * this[6] + this[2] * this[5] + this[3] * this[4])) * A * A * A
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

        setBivectorPartFromMvAndScalarMultiple(mv, scalar) {
            for (let i = 0; i < 6; ++i)
                this[i + 1] = mv[i + 5] * scalar
        }

        normalize() {
            return this.copy( this.getNormalization(newDq) )
        }

        sqrt(target) {
            if (target === undefined)
                console.error("use sqrtSelf")
            target.copy(this)
            return target.sqrtSelf()
        }

        sqrtSelf() {
            //could do study stuff. But not even steven and martin thought beyond getting sqrt of unnormalized
            this[0] += (this[0] < 0. ? -1. : 1.) * Math.sqrt(this.eNormSq())
            this.normalize()
            return this
        }

        //Requires normalization!
        //There MAY have been bugs with this, but it has been tested with rotations and translations
        toMat4(target) {
            if (target === undefined)
                target = new THREE.Matrix4()

            let r44 = this[4] * this[4]
            let r55 = this[5] * this[5]
            let r66 = this[6] * this[6]

            let r45 = this[4] * this[5]
            let r46 = this[4] * this[6]
            let r56 = this[5] * this[6]

            let r04 = this[0] * this[4]
            let r05 = this[0] * this[5]
            let r06 = this[0] * this[6]

            target.set(
                -r44 - r55, r04 + r56, r46 - r05, this[3] * this[5] - this[2] * this[4] - this[0] * this[1] - this[7] * this[6],
                r56 - r04, -r44 - r66, r06 + r45, this[1] * this[4] - this[3] * this[6] - this[0] * this[2] - this[7] * this[5],
                r05 + r46, r45 - r06, -r55 - r66, this[2] * this[6] - this[1] * this[5] - this[0] * this[3] - this[7] * this[4],
                0., 0., 0., 0.);
            target.multiplyScalar(2.)
            target.elements[0] += 1.; target.elements[5] += 1.; target.elements[10] += 1.; target.elements[15] += 1.
            return target
        }

        fromQuaternion(q) {
            this.zero()

            this[6] = -q.x
            this[5] = -q.y
            this[4] = -q.z
            this[0] = q.w
            return this
        }

        toQuaternion(target) {

            if (target === undefined)
                target = new THREE.Quaternion()

            target.set(
                -this[6],
                -this[5],
                -this[4],
                this[0])
            target.normalize()
            return target
        }

        fromPosQuat(p, q) {
            let qPart = newDq.fromQuaternion(q)
            let pPart = newDq.translator(p.x, p.y, p.z)
            return qPart.mul(pPart, this)
        }

        /*dqVerbose*/
    }
    window.Dq = Dq

    Dq.indexGrades = [
        0,
        2, 2, 2, 2, 2, 2,
        4
    ]

    Dq.basisNames = [
        ``,
        `01`, `02`, `03`, `12`, `31`, `23`,
        `0123`
    ]

    Translator = (x,y,z,target) => {
        if(target === undefined)
            target = new Dq()
        return new Dq().translator(x,y,z)
    }
    Plane = (x, y, z, d, target) => {
        if (target === undefined)
            target = new Fl()
        return new Fl().plane(x, y, z, d)
    }

    Fl.indexGrades = [
        1, 1, 1, 1,
        3, 3, 3, 3,
    ]

    Fl.basisNames = [
        `0`, `1`, `2`, `3`,
        `021`, `013`, `032`, `123`,
    ]

    {
        oneDq = new Dq().fromFloatAndIndex(1., 0)
        
        e0 = new Fl().fromFloatAndIndex(1., 0)
        e1 = new Fl().fromFloatAndIndex(1., 1)
        e2 = new Fl().fromFloatAndIndex(1., 2)
        e3 = new Fl().fromFloatAndIndex(1., 3)
        
        e01 = e0.mulFl(e1)
        e02 = e0.mulFl(e2)
        e03 = e0.mulFl(e3)
        e12 = e1.mulFl(e2)
        e23 = e2.mulFl(e3)
        e13 = e1.mulFl(e3)
        e31 = e3.mulFl(e1)

        e123 = e1.mulDq(e23)
        e012 = e0.mulDq(e12)
        e023 = e0.mulDq(e23)
        e013 = e0.mulDq(e13)
        e031 = e0.mulDq(e31)

        e0123 = e0.mulFl(e123)
    }

    fl0 = new Fl()
    fl1 = new Fl()
    fl2 = new Fl()
    fl3 = new Fl()
    fl4 = new Fl()
    fl5 = new Fl()
    fl6 = new Fl()

    dq0 = new Dq()
    dq1 = new Dq()
    dq2 = new Dq()
    dq3 = new Dq()
    
/*END*/}
