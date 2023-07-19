function initEgaWithoutDeclarations() {

    smallerInLarger.Ega = {
        Dq: new Uint8Array([0, 5, 6, 7, 8, 9, 10, 15]), //so, Ega to Dq
        Plane: new Uint8Array([1, 2, 3, 4]), //e0, e1, e2, e3!
        Line: new Uint8Array([5, 6, 7, 8, 9, 10]),
        Point: new Uint8Array([13, 12, 11, 14]), //xyzw
        // Study: new Uint8Array([0, 15])
        Number: new Uint8Array([0])
    }
    smallerInLarger.Dq = {
        Line: new Uint8Array([1,2,3,4,5,6]),
        // Study: new Uint8Array([0, 7])
        Number: new Uint8Array([0])
    }

    // class Line extends Multivector {
    //     static get size() { return 6 }

    //     constructor() {
    //         super(6)
    //     }

    //     intersectPlane(plane, target) {
    //         //plane and output point are mvs
    //         target[11] = - plane[3] * this[0] + plane[2] * this[1] - plane[1] * this[3]
    //         target[12] = + plane[4] * this[0] - plane[2] * this[2] - plane[1] * this[4]
    //         target[13] = - plane[4] * this[1] + plane[3] * this[2] - plane[1] * this[5]
    //         target[14] = + plane[4] * this[3] + plane[3] * this[4] + plane[2] * this[5]

    //         return target
    //     }

    //     exp(target) {
    //         if (target === undefined)
    //             target = new Dq()

    //         let l = (this[3] * this[3] + this[4] * this[4] + this[5] * this[5])
    //         let angle = sqrt(l)
    //         let sincAngle = angle === 0. ? 1. : sin(angle) / angle
    //         let cosAngle = sqrt(1. - sincAngle * sincAngle * l) //Simon had a formula but it assumed smaller range
            
    //         let m = (this[0] * this[5] + this[1] * this[4] + this[2] * this[3])
    //         let t = m * (cosAngle - sincAngle) / l
    //         return target.set(
    //             cosAngle, 
    //             sincAngle * this[0] + t * this[5], 
    //             sincAngle * this[1] + t * this[4], 
    //             sincAngle * this[2] + t * this[3], 
    //             sincAngle * this[3], 
    //             sincAngle * this[4], 
    //             sincAngle * this[5], 
    //             m * sincAngle)
    //     }

    //     distanceToPoint(pt) {
    //         //join plane magnitude
    //         let planeX = pt[11] * this[4] - pt[12] * this[3] + pt[14] * this[0]
    //         let planeZ = pt[12] * this[5] - pt[13] * this[4] + pt[14] * this[2]
    //         let planeY = pt[13] * this[3] - pt[11] * this[5] + pt[14] * this[1]
    //         return Math.sqrt(sq(planeX) + sq(planeY) + sq(planeZ))
    //     }
    // }
    // window.Line = Line

    // class Pt extends Multivector {
    //     static get size() { return 4 }

    //     constructor() {
    //         super(4)
    //     }

    //     normalize() {
    //         let factor = this[14] === 0. ? Math.sqrt(sq(this[0]) + sq(this[1]) + sq(this[2]) ) : this[14]
    //         this.multiplyScalar(1./factor)
    //         return this
    //     }

    //     fromVec3(v) {
    //         this.point(v.x, v.y, v.z, 1.)
    //         return this
    //     }
    //     fromNormalVec3(v) {
    //         this.point(v.x, v.y, v.z, 0.)
    //         return this
    //     }

    //     toVec3(target) {
    //         if (this[14] === 0.)
    //             console.error("ideal point cannot be converted to vec3")

    //         target.z = this[11] / this[14]
    //         target.y = this[12] / this[14]
    //         target.x = this[13] / this[14]

    //         return target
    //     }

    //     fromEga(ega) {
    //         this[0] = ega[13]; this[1] = ega[12]; this[2] = ega[11];
    //         this[3] = ega[14]
    //         return this
    //     }
    //     toEga(ega) {
    //         if (ega === undefined)
    //             ega = new Ega()

    //         ega.copy(zeroEga)

    //         ega[13] = this[0]; ega[12] = this[1]; ega[11] = this[2];
    //         ega[14] = this[3]

    //         return ega
    //     }
    // }

    class Dq extends Multivector {
        static get size() { return 8 }

        constructor() {
            super(8)
        }

        getDistanceSq() {
            let rotation = newDq
            let translation = newDq
            this.invariantDecomposition(rotation, translation)
            return translation[1] * translation[1] + translation[2] * translation[2] + translation[3] * translation[3]
        }

        invariantDecomposition(rotationTarget, translationTarget) {

            let normalized = this.getNormalization(newDq)

            if(normalized[7] === 0.) {
                if (normalized[4] === 0. && normalized[5] === 0. && normalized[6] === 0.) {
                    //pure translation
                    translationTarget.copy(normalized)
                    rotationTarget.copy(oneDq)
                }
                else {
                    rotationTarget.copy(normalized)
                    translationTarget.copy(oneDq)
                }
            }
            else {
                let numerator   = normalized.selectGrade(4, newDq)
                let denominator = normalized.selectGrade(2, newDq)
                numerator.mul(denominator.reverse(newDq), translationTarget)
                translationTarget[0] += 1.
    
                let translationReverse = translationTarget.reverse(newDq)
                normalized.mul(translationReverse, rotationTarget)
            }
        }

        fromEgaAxisAngle(egaAxis, angle) {
            egaAxis.cast(this)
            this.multiplyScalar(Math.sin(angle), this)
            this[0] = Math.cos(angle)
            return this
        }

        ptToPt(x1,y1,z1,x2,y2,z2) {

            if ( typeof x1 === `number` ) {
                this[0] = 1.
                this[1] = (x2 - x1) * .5
                this[2] = (y2 - y1) * .5
                this[3] = (z2 - z1) * .5
                this[4] = 0.; this[5] = 0.; this[6] = 0.; this[7] = 0.;
            }
            else if(x1 instanceof Ega) {
                if(x1[14] === 0. || y1[14] === 0.)
                    console.error("ideal points cannot be translated to")
                
                this.ptToPt(
                    x1[13] / x1[14], x1[12] / x1[14], x1[11] / x1[14], 
                    y1[13] / y1[14], y1[12] / y1[14], y1[11] / y1[14])
            }

            return this
        }

        exp(target) {
            if (target === undefined)
                target = new Dq()

            let l = (this[4] * this[4] + this[5] * this[5] + this[6] * this[6])
            let angle = sqrt(l)
            let sincAngle = angle === 0. ? 1. : sin(angle) / angle
            let cosAngle = sqrt(1. - sincAngle * sincAngle * l) //Simon had a formula but it assumed smaller range

            let m = (this[1] * this[6] + this[2] * this[5] + this[3] * this[4])
            let t = m * (cosAngle - sincAngle) / l
            return target.set(
                cosAngle,
                sincAngle * this[1] + t * this[6],
                sincAngle * this[2] + t * this[5],
                sincAngle * this[3] + t * this[4],
                sincAngle * this[4],
                sincAngle * this[5],
                sincAngle * this[6],
                m * sincAngle)
        }

        // logarithm(r) {
        //     // if (r[0] == 1.) 
        //     //     return bivector(r[1], r[2], r[3], 0., 0., 0.);
        //     // let a = 1. / (1. - r[0] * r[0])  // inv squared length. -infinity   if translation,   
        //     // let b = acos(r[0]) * sqrt(a)       // rotation scale      -infinity*0 if translation, we want to be 1
        //     // let c = r[7] * a * (1. - r[0] * b) // translation scale   -infinity*0*(1-1*1) if translation, we want to be 0
        //     // return bivector(
        //     //     c * r[6] + b * r[1],
        //     //     c * r[5] + b * r[2],
        //     //     c * r[4] + b * r[3],
        //     //     b * r[4],
        //     //     b * r[5],
        //     //     b * r[6])

                
        //     // You want to compress the entire branch into the sinc, that'd be nice. But you seemingly can't
        //     let aReciprocal = 1. - r[0]*r[0]                                        //0 if translation          s is cos, 1-s*s is sin
        //     let b = 1. / sinc( Math.acos(r[0]) )                                    //1 if translation
        //     let c = r[7] * (1. - r[0] * b) * (r[0]==1.?1.:1./aReciprocal)    //0 if translation. By leaving branch to the last minute, MAYBE it's known to be 0 ASAP
        //     return bivector(
        //         c * r[6] + b * r[1],
        //         c * r[5] + b * r[2],
        //         c * r[4] + b * r[3],
        //         b * r[4],
        //         b * r[5],
        //         b * r[6])
        // }

        //aliasing allowed
        reverse(target) {
            target.copy(this)
            target[1] *= -1.; target[2] *= -1.; target[3] *= -1.; target[4] *= -1.; target[5] *= -1.; target[6] *= -1.;
            return target
        }

        //these could be in generalVector
        append(dq) {
            let temp = this.mul(dq, newDq)
            this.copy(temp)
            return this
        }
        prepend(dq) {
            let temp = dq.mul(this, newDq)
            this.copy(temp)
            return this
        }

        sandwich(toBeSandwiched, target) {
            let thisEga = this.cast(newEga)

            if (toBeSandwiched.constructor === Ega) {
                if (target === undefined)
                    target = new Ega()

                thisEga.sandwich(toBeSandwiched, target)
            }
            else {
                if (target === undefined)
                    target = new Dq()

                let operandEga = toBeSandwiched.cast(newEga)
                let targetEga = thisEga.sandwich(operandEga, newEga)
                target.cast(targetEga)
            }
            return target
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
            let scalarNormSquared = this[0] * this[0] + this[4] * this[4] + this[5] * this[5] + this[6] * this[6]

            this[0] += (this[0] < 0. ? -1. : 1.) * Math.sqrt(scalarNormSquared)
            this.normalize()
            return this
        }


        mul(b, target) {
            target[0] = b[0] * this[0] - b[4] * this[4] - b[5] * this[5] - b[6] * this[6]

            target[1] = b[1] * this[0] + b[0] * this[1] - b[4] * this[2] + b[5] * this[3] + b[2] * this[4] - b[3] * this[5] - b[7] * this[6] - b[6] * this[7]
            target[2] = b[2] * this[0] + b[4] * this[1] + b[0] * this[2] - b[6] * this[3] - b[1] * this[4] - b[7] * this[5] + b[3] * this[6] - b[5] * this[7]
            target[3] = b[3] * this[0] - b[5] * this[1] + b[6] * this[2] + b[0] * this[3] - b[7] * this[4] + b[1] * this[5] - b[2] * this[6] - b[4] * this[7]

            target[4] = b[4] * this[0] + b[0] * this[4] + b[6] * this[5] - b[5] * this[6]
            target[5] = b[5] * this[0] - b[6] * this[4] + b[0] * this[5] + b[4] * this[6]
            target[6] = b[6] * this[0] + b[5] * this[4] - b[4] * this[5] + b[0] * this[6]
            //the quaternion part is only affected by the quaternion parts

            target[7] = b[7] * this[0] + b[6] * this[1] + b[5] * this[2] + b[4] * this[3] + b[3] * this[4] + b[2] * this[5] + b[1] * this[6] + b[0] * this[7]

            return target
        }

        getReverse(target) {
            target.copy(this)
            for (let i = 1; i < 7; ++i)
                target[i] *= -1.
        }

        // fromMat4(mat) {
        //     mat.decompose(v1, q1, v2)
        //     let asEga = newEga.fromPosQuat(v1, q1)
        //     asEga.cast(this)
        //     return this
        // }

        //there were bugs with this! Could be minus signs in the wrong places!
        toMat4(target) {
            if(target === undefined)
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

            return target.set(
                1. + 2. * (-r44 - r55), 2. * (r04 + r56), 2. * (r46 - r05), 2. * (this[3] * this[5] - this[2] * this[4] - this[0] * this[1] - this[7] * this[6]),
                2. * (r56 - r04), 1. + 2. * (-r44 - r66), 2. * (r06 + r45), 2. * (this[1] * this[4] - this[3] * this[6] - this[0] * this[2] - this[7] * this[5]),
                2. * (r05 + r46), 2. * (r45 - r06), 1. + 2. * (-r55 - r66), 2. * (this[2] * this[6] - this[1] * this[5] - this[0] * this[3] - this[7] * this[4]),
                0., 0., 0., 1.);
        }

        fromQuaternion(q) {
            this.zero()

            this[ 6] = -q.x
            this[ 5] = -q.y
            this[ 4] = -q.z
            this[ 0] = q.w
            return this
        }

        fromPosQuat(p, q) {
            let qPart = newDq.fromQuaternion(q)
            let pPart = newDq.translator( p.x, p.y, p.z )
            return qPart.mul(pPart, this)
        }
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

    Translator = (x,y,z) => {
        return new Dq().translator(x,y,z)
    }

    class Ega extends Multivector {
        static get size() { return 16 }

        constructor() {
            super(16)
        }

        pointPointDistance(that) {
            let x = this[13] / this[14] - that[13] / that[14]
        }

        projectOn(toBeProjectedOn, target) {
            if (target === undefined)
                target = new Ega()

            let numerator = this.inner(toBeProjectedOn, newEga)
            let rev = toBeProjectedOn.reverse(newEga)
            numerator.mul(rev, target)

            return target
        }

        //multiplies by reverse
        transformToSquared(b, target) {
            let thisReverse = this.reverse(newEga)
            b.mul(thisReverse, target)
            return target
        }

        transformToAsDq(b, target) {
            this.transformToSquared(b, newEga).cast(target)
            target.sqrtSelf()
            return target
        }

        sqrtSelf() {
            let asDq = newDq
            this.cast(asDq)
            asDq.sqrtSelf()
            asDq.cast(this)
            return this
        }

        //UNTESTED
        // orientationTo(that) {
        //     let ratio = this.transformToSquared(that, newEga)
        //     let g = Math.abs(this.grade() - that.grade())

        //     let angleNumeratorSq = ratio.selectGrade(g + 2, newEga).eNormSquared()
            
        //     //distance
        //     //2 plane plane: [0]                        0
        //     //3 plane line:  something about the                   
        //     //4 plane point: [15]                       4
        //     //4 line line:   [15] or [0] if noAngle     4 or 0
        //     //5 line point:  meaningless
        //     //6 point point: [0]                        0

        //     //angle
        //     //2 plane plane: [0]
        //     //3 plane line:  [14]?
        //     //4 line line:   [0]
        // }

        angleTo(that) {
            let ratio = this.transformToSquared(that, newEga)
            let g = Math.abs(this.grade() - that.grade())
            
            let angleNumeratorSq   = ratio.selectGrade(g + 2, newEga).eNormSquared()
            let angleDenominatorSq = ratio.selectGrade(    g, newEga).eNormSquared()
            
            if(angleDenominatorSq === 0.)
                return TAU / 4. * Math.sign(angleNumeratorSq) //is it actually possible for this to be negative?
            else {
                let determiner = angleNumeratorSq / angleDenominatorSq
                return Math.atan(Math.sign(determiner) * Math.sqrt(Math.abs(determiner)))
            }
        }

        distanceTo(that) {
            let ratio = this.transformToSquared(that, newEga)
            let g = Math.abs(this.grade() - that.grade())
            
            let angleNumeratorSq = ratio.selectGrade(g + 2, newEga).eNormSquared()

            let noAngle = 0. === angleNumeratorSq
            let h = noAngle ? g : g + 2

            //impossible to be negative
            let distanceNumeratorSq   = ratio.selectGrade(h + 2, newEga).iNormSquared()
            let distanceDenominatorSq = ratio.selectGrade(    h, newEga).eNormSquared()
            
            return Math.sqrt(distanceNumeratorSq / distanceDenominatorSq)
        }

        //maybe minus signs belong
        iNormSquared() {
            return this[15] * this[15] + this[13] * this[13] + this[12] * this[12] + this[11] * this[11] + this[7] * this[7] + this[6] * this[6] + this[5] * this[5] + this[1] * this[1]
        }
        eNormSquared() {
            return this[0] * this[0] + this[2] * this[2] + this[3] * this[3] + this[4] * this[4] + this[8] * this[8] + this[9] * this[9] + this[10] * this[10] + this[14] * this[14]
        }

        //now THAT'S a join! Except it has a SHITTY LITTLE MINUS SIGN
        //Potentially meanse pga/cga connection needs work
        // join( b, target ) {
        //     if (target === undefined)
        //         target = new Ega()

        //     let thisCga = cga0.fromEga(this)
        //     let bCga = cga1.fromEga(b)
            
        //     //for the time being, eo is the camera plane, eg it's orthographic projection
        //     //in the fullness of time it will become cameraPlane
        //     eo.meet(thisCga, cga2)
        //     eo.meet(bCga, cga3)
        //     return cga2.join(cga3,cga0).join(e0123c).toEga(target)
        // }

        toQuaternion(target) {
            console.error("this might be wrong, check the 31 vs 13")
            if (target === undefined)
                target = new THREE.Quaternion()

            target.set(
                -this[10],
                -this[9], //TODO CHECK!!!
                -this[8],
                this[0])
            target.normalize()
            return target
        }

        normalize() {
            let ourNorm = this.eNorm()
            if(ourNorm !== 0.) {
                this.multiplyScalar(1./ourNorm, this)
            }
            return this
        }

        eNorm() {
            return Math.sqrt(this.eNormSquared())
        }

        translatorToVec3(v) {
            if(v === undefined)
                v = new THREE.Vector3()

            let factor = -.5 / this[0]
            v.x = this[5] * factor 
            v.y = this[6] * factor
            v.z = this[7] * factor
            return v
        }

        point(x, y, z, w) {
            this.zero()
            if (w === undefined)
                w = 1.
            this[14] = w
            this[13] = x
            this[12] = y //because e01 e02 e03 is a translation along x, y and z, no minus sign here
            this[11] = z

            return this
        }

        pointFromVec3(v) {
            this.point(v.x,v.y,v.z,1.)
            return this
        }
        pointFromNormalVec3(v) {
            this.point(v.x, v.y, v.z, 0.)
            return this
        }

        pointToVec3(target) {
            if(target === undefined)
                target = new THREE.Vector3()
            if(this[14] === 0.)
                console.error("ideal point cannot be converted to vec3")
            else {
                target.z = this[11] / this[14]
                target.y = this[12] / this[14]
                target.x = this[13] / this[14]
            }

            return target
        }

        plane(e0Coef, e1Coef, e2Coef, e3Coef) {
            this.zero()
            this[1] = e0Coef
            this[2] = e1Coef
            this[3] = e2Coef
            this[4] = e3Coef

            return this
        }

        sandwich(egaToBeSandwiched, target) {
            return sandwich(this, egaToBeSandwiched, target)
        }

        //aliasing allowed
        reverse(target) {
            return reverse(this, target)
        }

        meet(b, target) {
            return meet(this,b,target)
        }

        inner(b, target) {
            return inner(this, b, target)
        }

        mul(b, target) {
            return mul(this, b, target)
        }

        join(b, target) {
            return join(this, b, target)
        }
    }
    window.Ega = Ega

    /*EXTRA FUNCTIONS ADDED HERE*/

    {
        let dqMeshes = []
        let finalDq = new Dq()
        class DqMesh extends THREE.Mesh {
            
            constructor(geo, mat) {
                super(geo, mat)
                this.matrixAutoUpdate = false
                this.dq = new Dq().copy(oneDq)
                this.dqParent = scene

                dqMeshes.push(this)
            }

            onBeforeRender() {
                finalDq.copy(oneDq)
                this.prependTransform(finalDq)

                finalDq.normalize()
                finalDq.toMat4(this.matrix)
            }

            // getPosition(target) {

            // }

            prependTransform(target) {
                target.prepend(this.dq)
                if(this.dqParent !== scene)
                    this.dqParent.prependTransform(target)
                return target
            }
        }
        window.DqMesh = DqMesh
    }

    // Ega.onesWithMinus = []
    // Dq.onesWithMinus = []
    // Line.onesWithMinus = []

    // Line.indexGrades = [2,2,2,2,2,2]
    // Line.basisNames = [`01`, `02`, `03`, `12`, `31`, `23`]

    Ega.indexGrades = [
        0,
        1, 1, 1, 1,
        2, 2, 2, 2, 2, 2,
        3, 3, 3, 3,
        4
    ]

    Ega.basisNames = [
        ``,
        `0`, `1`, `2`, `3`,
        `01`, `02`, `03`, `12`, `31`, `23`,
        `021`, `013`, `032`, `123`,
        `0123`
    ]

    oneDq = new Dq().fromFloatAndIndex(1., 0)
    
    {
        oneEga = new Ega().fromFloatAndIndex(1., 0)
        zeroEga = new Ega().fromFloatAndIndex(0., 0)

        e1e = new Ega().fromFloatAndIndex(1., 2)
        e2e = new Ega().fromFloatAndIndex(1., 3)
        e3e = new Ega().fromFloatAndIndex(1., 4)
        e0e = new Ega().fromFloatAndIndex(1., 1)

        e01e = e0e.mul(e1e)
        e02e = e0e.mul(e2e)
        e03e = e0e.mul(e3e)
        e12e = e1e.mul(e2e)
        e23e = e2e.mul(e3e)
        e13e = e1e.mul(e3e)
        e31e = e3e.mul(e1e)

        e123e = e1e.mul(e23e)
        e012e = e0e.mul(e12e)
        e023e = e0e.mul(e23e)
        e013e = e0e.mul(e13e)
        e031e = e0e.mul(e31e)

        e0123e = e0e.mul(e123e)
    }

    ega0 = new Ega()
    ega1 = new Ega()
    ega2 = new Ega()
    ega3 = new Ega()
    ega4 = new Ega()
    ega5 = new Ega()
    ega6 = new Ega()

    dq0 = new Dq()
    dq1 = new Dq()
    dq2 = new Dq()
    dq3 = new Dq()
    
/*END*/}

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

    //point-point join. Both 11,12,13,14
    // line[10] =  + a[13] - b[13];
    // line[ 9] =  + a[12] - b[12];
    // line[ 8] =  + a[11] - b[11];
    // line[ 7] =  + a[12] * b[13] - a[13] * b[12];
    // line[ 6] =  - a[11] * b[13] + a[13] * b[11];
    // line[ 5] =  + a[11] * b[12] - a[12] * b[11];

    //"how they cross" scalar, for lines:
    //  + b[10] * a[ 5] + b[ 9] * a[ 6] + b[ 8] * a[ 7] + b[ 7] * a[ 8] + b[ 6] * a[ 9] + b[ 5] * a[10];

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
}

function createNonVerboseSharedFunctions(createFunction) {
    createFunction(`sandwich`, [`m`, `a`], `
    float[16] mReverse = newEga;
    reverse(m, mReverse);
    
    float[16] intermediate = newEga;
    mul(m,a,intermediate); // TODO minus sign. Need that clifford conjugate thing

    mul(intermediate,mReverse,target);`)

    // createFunction(`eNormSquared`, [`a`], `
    // float[16] rev = newMv;
    // reverse(a, rev);
    // float[16] studyNumber = newMv;
    // mul(a, rev, studyNumber);
    // return Math.abs(studyNumber[0]);`,
    //     `float`)

    // createFunction(`multiplyScalar`, [`inout float[16] a`, `in float scalar`], `
    // for(int i = 0; i < 16; ++i) {
    //     a[i] *= scalar;
    // }`,
    //     `void`)

    // createFunction(`projectAOnB`, [`a`, `b`], `
    // float[16] intermediate = newMv;
    // inner(b, a, intermediate);
    // float[16] inverse = newMv;
    // invert(b,inverse);
    // mul(intermediate, inverse, target);`)
}