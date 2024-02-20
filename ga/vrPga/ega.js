function initEgaWithoutDeclarations() {

    class Fl extends Multivector {

        constructor() {
            super(8)
        }

        isScalar() {
            return false
        }

        normalizePoint() {
            this.zeroGrade(1)
            this.multiplyScalar(1. / this[7], this)
            return this
        }

        momentumLine( rateBivector, targetDq ) {

            let derivative = this.commutator(rateBivector, newFl)
            this.joinPt(derivative, targetDq)
            return targetDq

        }

        momentumLineFromRotor( rotorDq, targetDq ) {

            let rateBivector = rotorDq.logarithm(newDq)
            return this.momentumLine(rateBivector, targetDq)
            
        }

        commutator(dq, target) {

            let ab = this.mulDq(dq, newFl)
            let ba = dq.mulFl(this, newFl)
            for (let i = 0; i < 8; ++i)
                target[i] = .5 * (ab[i] - ba[i])
            return target
        }

        ptToPt(b, target) {
            
            target.ptToPt(this,b)
            return target
        }

        eNormSq() {
            //inner product with its own reverse, guaranteed to be a scalar
            return this[1] * this[1] + this[2] * this[2] + this[3] * this[3] + this[7] * this[7]
        }

        iNormSq() {
            return this.getDual(newFl).eNormSq()
        }

        getNormalization(target) {

            let adHocNormSq = this.eNormSq()
            if (adHocNormSq === 0. )
                adHocNormSq = this.iNormSq()
            if (adHocNormSq === 0. )
                console.error("just tried to normalize: " + this.toString())

            let factor = 1. / Math.sqrt(adHocNormSq)
            //er, worth asking about this hack
            let isNegativePoint = this[7] < 0. && this[0] === 0. && this[1] === 0. && this[2] === 0. && this[3] === 0.
            if (isNegativePoint)
                factor = -factor
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

        pointFromGibbsVec(v) {

            this.point(v.x, v.y, v.z, 1.)
            return this
        }

        pointFromNormal(v) {

            this.point(v.x, v.y, v.z, 0.)
            return this
        }

        pointToGibbsVec(target) {

            if (target === undefined)
                target = new THREE.Vector3()

            if (this[7] === 0.) {
                // debugger
                console.error("ideal point at ", getWhereThisWasCalledFrom(0))
            }
            else {
                target.z = this[4] / this[7]
                target.y = this[5] / this[7]
                target.x = this[6] / this[7]
            }
 
            return target
        }

        directionToGibbsVec(target) {

            if (target === undefined)
                target = new THREE.Vector3()

            if (this[7] !== 0.) {
                // debugger
                console.error("non-ideal point")
            }
            else {
                target.z = this[4]
                target.y = this[5]
                target.x = this[6]
            }

            return target
        }

        directionFromGibbsVec(v) {

            this.point(v.x, v.y, v.z, 0.)
            return this
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

    class Dq extends Multivector {

        constructor() {
            super(8)
            this[0] = 1.
        }

        isScalar() {
            return this[0] !== 0. && this[1] === 0. && this[2] === 0. && this[3] === 0. && this[4] === 0. && this[5] === 0. && this[6] === 0. && this[7] === 0.
        }

        normalizeTranslation() {
            this[1] /= this[0]; this[2] /= this[0]; this[3] /= this[0]
            this[0] = 1.
            return this
        }

        translationDistance() {
            let iNormBiv = Math.sqrt(this[1] * this[1] + this[2] * this[2] + this[3] * this[3])
            return Math.abs( iNormBiv / this[0] ) //feel free change to keeping sign if you like! Just check all uses!
        }

        slerp(end, t, target) {
            
            if (target === undefined)
                target = new Dq()

            let endOverStart = end.mulReverse(this, newDq)
            return endOverStart.pow(t, newDq).mul(this, target)
        }

        align(startPoints,endPoints) {
            
            let P = newDq;
            let Q = newDq;
            let r1 = newDq;
            let r2 = newDq;
            P.zero(); P[7] = 1.
            Q.zero(); Q[7] = 1.

            this.copy(oneDq)
            for (let i = 0, il = startPoints.length; i < il; ++i) {
                Q.joinPt(this.sandwichFl(startPoints[i]), P)
                Q.joinPt(endPoints[i])
                P.normalize()
                Q.normalize()
                Q.mulReverse(P, r1)
                r1[0] += 1.
                this.copy(r1.normalize().mul(this, r2))
            }
            
            return this            
        }

        pointTrajectoryArcLength(startPt, numSamples = 8) {

            let ret = 0.
            for (let i = 0; i < numSamples; ++i) {
                let part = this.pow(i / (numSamples - 1), newDq)
                part.sandwichFl(startPt, newFl).pointToGibbsVec(v1)

                if (i > 0)
                    ret += v1.distanceTo(v2)
                v2.copy(v1)
            }

            return ret
        }

        pow(t, target) {
            let a = this.logarithm(newDq)
            a.multiplyScalar(t, a)
            return a.exp(target)
        }

        //operates on Dqs, not bivectors. Might be simpler for bivectors: check for scalar square
        invariantDecomposition(rotnTarget, trnsTarget) {

            if (rotnTarget === undefined)
                rotnTarget = new Dq()
            if (trnsTarget === undefined)
                trnsTarget = new Dq()

            let normalized = this.getNormalization(newDq)

            if (Math.abs(normalized[7]) < eps) {
                if (Math.abs(normalized[4]) < eps && Math.abs(normalized[5]) < eps && Math.abs(normalized[6]) < eps) {
                    //pure translation
                    trnsTarget.zero()
                    trnsTarget[0] = normalized[0]; trnsTarget[1] = normalized[1]; trnsTarget[2] = normalized[2]; trnsTarget[3] = normalized[3];
                    rotnTarget.copy(oneDq)
                }
                else {
                    rotnTarget.copy(normalized); rotnTarget[7] = 0.
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
            if ( this[4] === 0. && this[5] === 0. && this[6] === 0. )
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
                return target.set(1., this[1], this[2], this[3], 0, 0, 0, 0)

            let m = (this[1] * this[6] + this[2] * this[5] + this[3] * this[4])
            let a = Math.sqrt(l)
            let c = Math.cos(a)
            let s = Math.sin(a) / a
            let t = m / l * (c - s)

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
                    console.warn("zero dual quaternion" )
                    return target.copy(oneDq)
                }
            }

            target.copy(this)

            let s = 1. / Math.sqrt(eNormSq)
            let d = (target[7] * target[0] - (target[1] * target[6] + target[2] * target[5] + target[3] * target[4])) * s * s
            target.multiplyScalar(s,target)
            target[1] += target[6] * d
            target[2] += target[5] * d
            target[3] += target[4] * d
            target[7] -= target[0] * d
            return target
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

        //assumes normalization! Seriously!
        sqrtSelf() {
            //could do study stuff. But not even steven and martin thought beyond getting sqrt of unnormalized

            let ourENorm = this.eNorm()
            if(this[0] + ourENorm !== 0.) {
                this[0] += ourENorm
                this.normalize()    
            }
            else {
                this.multiplyScalar(-1., this)
                this[0] += this.eNorm()
                this.normalize()
                this.multiplyScalar(-1., this)
            }
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

        fromMat4(m) {
            m.decompose(v1,q1,v2)
            this.fromPosQuat(v1,q1)
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
            return pPart.mul(qPart, this)
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
    dq4 = new Dq()
    dq5 = new Dq()
    dq6 = new Dq()
    dq7 = new Dq()
    dq8 = new Dq()
    dq9 = new Dq()

    {
        oneDq = new Dq().fromFloatAndIndex(1., 0)
        zeroDq = new Dq().zero()
        
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

    let onThing = new Fl()
    let out = new Dq()
    clampPointDistanceFromThing = (point, thing, minDist, maxDist = Infinity) => {

        point.projectOn(thing, onThing)
        onThing.dqTo(point, out).normalizeTranslation()
        let dist = out.translationDistance()
        if (dist === 0.)
            console.error("zero distance from thing")
        let newDist = clamp(dist, minDist, maxDist)
        out[1] *= newDist / dist
        out[2] *= newDist / dist
        out[3] *= newDist / dist

        out.sandwich(onThing, point)
        point.normalizePoint()
        return point
    }
    
/*END*/}
