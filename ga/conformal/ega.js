function initEga() {

    class Line extends GeneralVector {
        static get size() { return 6 }

        constructor() {
            return super(6)
        }

        exp(target) {
            if (target === undefined)
                target = new Dq()

            let l = (this[3] * this[3] + this[4] * this[4] + this[5] * this[5])
            if (l == 0.)
                return target.set(1, this[0], this[1], this[2], 0., 0., 0., 0.)
            let m = (this[0] * this[5] + this[1] * this[4] + this[2] * this[3]), a = Math.sqrt(l), c = Math.cos(a), s = Math.sin(a) / a, t = m / l * (c - s)
            return target.set(c, s * this[0] + t * this[5], s * this[1] + t * this[4], s * this[2] + t * this[3], s * this[3], s * this[4], s * this[5], m * s)
        }

        distanceToPoint(pt) {
            //join plane magnitude
            let planeX = pt[11] * this[4] - pt[12] * this[3] + pt[14] * this[0]
            let planeZ = pt[12] * this[5] - pt[13] * this[4] + pt[14] * this[2]
            let planeY = pt[13] * this[3] - pt[11] * this[5] + pt[14] * this[1]
            return Math.sqrt(sq(planeX) + sq(planeY) + sq(planeZ))
        }
    }
    window.Line = Line

    class Dq extends GeneralVector {
        static get size() { return 8 }

        constructor() {
            return super(8)
        }

        sandwich(egaToBeSandwiched, target) {
            if (target === undefined)
                target = new Ega()

            this.toEga(localEga4)
            localEga4.sandwich( egaToBeSandwiched, target )
            return target
        }

        fromEga(ega) {
            this[0] = ega[0]
            this[1] = ega[5]; this[2] = ega[6]; this[3] = ega[7];
            this[4] = ega[8]; this[5] = ega[9]; this[6] = ega[10];
            this[7] = ega[15]
            return this
        }
        toEga(ega) {
            if(ega === undefined)
                ega = new Ega()

            ega.copy(zeroEga)

            ega[ 0] = this[0]
            ega[ 5] = this[1]; ega[ 6] = this[2]; ega[ 7] = this[3]
            ega[ 8] = this[4]; ega[ 9] = this[5]; ega[10] = this[6]
            ega[15] = this[7]

            return ega
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
            this.getNormalization(localDq0)
            return this.copy(localDq0)
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
        }

        getReverse(target) {
            target.copy(this)
            for (let i = 1; i < 7; ++i)
                target[i] *= -1.
        }

        reverseSelf() {
            this.getReverse(localDq0)
            this.copy(localDq0)
        }

        fromMat4(mat) {
            mat.decompose(v1, q1, v2)
            let asMv = newMv.fromPosQuat(v1, q1)
            this.fromMv(asMv)
            return this
        }

        //there were bugs with this!
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

        fromPosQuat(p, q) {
            let asMv = newMv
            this.toMv(asMv)
            asMv.fromPosQuat(p, q)
            this.fromMv(asMv)
            return this
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

    class Ega extends GeneralVector {
        static get size() { return 16 }

        constructor() {
            return super(16)
        }

        //now THAT'S a join! Except it has a SHITTY LITTLE MINUS SIGN
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

        join(b,target) {
            if (target === undefined)
                target = new Ega()

            target[15] = 1 * (this[15] * b[15]);
            target[14] = -1 * (this[14] * -1 * b[15] + this[15] * b[14] * -1);
            target[13] = -1 * (this[13] * -1 * b[15] + this[15] * b[13] * -1);
            target[12] = -1 * (this[12] * -1 * b[15] + this[15] * b[12] * -1);
            target[11] = -1 * (this[11] * -1 * b[15] + this[15] * b[11] * -1);
            target[10] = 1 * (this[10] * b[15] + this[13] * -1 * b[14] * -1 - this[14] * -1 * b[13] * -1 + this[15] * b[10]);
            target[9] = 1 * (this[9] * b[15] + this[12] * -1 * b[14] * -1 - this[14] * -1 * b[12] * -1 + this[15] * b[9]);
            target[8] = 1 * (this[8] * b[15] + this[11] * -1 * b[14] * -1 - this[14] * -1 * b[11] * -1 + this[15] * b[8]);
            target[7] = 1 * (this[7] * b[15] + this[12] * -1 * b[13] * -1 - this[13] * -1 * b[12] * -1 + this[15] * b[7]);
            target[6] = 1 * (this[6] * b[15] - this[11] * -1 * b[13] * -1 + this[13] * -1 * b[11] * -1 + this[15] * b[6]);
            target[5] = 1 * (this[5] * b[15] + this[11] * -1 * b[12] * -1 - this[12] * -1 * b[11] * -1 + this[15] * b[5]);
            target[4] = 1 * (this[4] * b[15] - this[7] * b[14] * -1 + this[9] * b[13] * -1 - this[10] * b[12] * -1 - this[12] * -1 * b[10] + this[13] * -1 * b[9] - this[14] * -1 * b[7] + this[15] * b[4]);
            target[3] = 1 * (this[3] * b[15] - this[6] * b[14] * -1 - this[8] * b[13] * -1 + this[10] * b[11] * -1 + this[11] * -1 * b[10] - this[13] * -1 * b[8] - this[14] * -1 * b[6] + this[15] * b[3]);
            target[2] = 1 * (this[2] * b[15] - this[5] * b[14] * -1 + this[8] * b[12] * -1 - this[9] * b[11] * -1 - this[11] * -1 * b[9] + this[12] * -1 * b[8] - this[14] * -1 * b[5] + this[15] * b[2]);
            target[1] = 1 * (this[1] * b[15] + this[5] * b[13] * -1 + this[6] * b[12] * -1 + this[7] * b[11] * -1 + this[11] * -1 * b[7] + this[12] * -1 * b[6] + this[13] * -1 * b[5] + this[15] * b[1]);
            target[0] = 1 * (this[0] * b[15] + this[1] * b[14] * -1 + this[2] * b[13] * -1 + this[3] * b[12] * -1 + this[4] * b[11] * -1 + this[5] * b[10] + this[6] * b[9] + this[7] * b[8] + this[8] * b[7] + this[9] * b[6] + this[10] * b[5] - this[11] * -1 * b[4] - this[12] * -1 * b[3] - this[13] * -1 * b[2] - this[14] * -1 * b[1] + this[15] * b[0]);
            return target;
        }

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

        fromQuaternion(q) {
            this.copy(zeroEga)

            this[10] = -q.x
            this[9] = -q.y
            this[8] = -q.z
            this[0] = q.w
            return this
        }

        normalize() {
            let ourNorm = this.eNorm()
            if(ourNorm !== 0.) {
                this.multiplyScalar(1./ourNorm)
            }
            return this
        }

        eNormSquared() {
            this.reverse( localEga0 )
            this.mul( localEga0, localEga1)
            return localEga1[0]
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

        pointFromVec3(v) {
            this.point(v.x,v.y,v.z,1.)
            return this
        }
        pointFromNormalVec3(v) {
            this.point(v.x, v.y, v.z, 0.)
            return this
        }

        point(x, y, z, w) {
            this.copy(zeroEga)
            if (w === undefined)
                w = 1.
            this[14] = w
            this[13] = x
            this[12] = y //because e01 e02 e03 is a translation along x, y and z, no minus sign here
            this[11] = z

            return this
        }

        pointToVec3(target) {
            if(this[14] === 0.)
                console.error("ideal point cannot be converted to vec3")

            target.z = this[11] / this[14]
            target.y = this[12] / this[14]
            target.x = this[13] / this[14]

            return target
        }

        plane(e0Coef, e1Coef, e2Coef, e3Coef) {
            this.copy(zeroEga)
            this[1] = e0Coef
            this[2] = e1Coef
            this[3] = e2Coef
            this[4] = e3Coef

            return this
        }

        sandwich(egaToBeSandwiched, target) {
            if (target === undefined)
                target = new Ega()

            this.reverse(localEga0)

            this.mul(egaToBeSandwiched, localEga1)
            localEga1.mul(localEga0, target)

            // let ks = egaToBeSandwiched.grade() * this.grade()
            // if (ks % 2 === 0)
            //     target.multiplyScalar(-1.)

            return target
        }

        //aliasing allowed
        reverse(target) {
            if (target === undefined)
                target = new Ega()

            target[ 0] = this[0]

            target[ 1] = this[1]
            target[ 2] = this[2]
            target[ 3] = this[3]
            target[ 4] = this[4]

            target[ 5] = -this[5]
            target[ 6] = -this[6]
            target[ 7] = -this[7]
            target[ 8] = -this[8]
            target[ 9] = -this[9]
            target[10] = -this[10]

            target[11] = -this[11]
            target[12] = -this[12]
            target[13] = -this[13]
            target[14] = -this[14]

            target[15] = this[15]

            return target
        }

        meet(b, target) {
            if (target === undefined)
                target = new Ega()

            target[ 0] = b[ 0] * this[ 0];
            target[ 1] = b[ 1] * this[ 0] + b[ 0] * this[ 1];
            target[ 2] = b[ 2] * this[ 0] + b[ 0] * this[ 2];
            target[ 3] = b[ 3] * this[ 0] + b[ 0] * this[ 3];
            target[ 4] = b[ 4] * this[ 0] + b[ 0] * this[ 4];
            target[ 5] = b[ 5] * this[ 0] + b[ 2] * this[ 1] - b[ 1] * this[ 2] + b[ 0] * this[ 5];
            target[ 6] = b[ 6] * this[ 0] + b[ 3] * this[ 1] - b[ 1] * this[ 3] + b[ 0] * this[ 6];
            target[ 7] = b[ 7] * this[ 0] + b[ 4] * this[ 1] - b[ 1] * this[ 4] + b[ 0] * this[ 7];
            target[ 8] = b[ 8] * this[ 0] + b[ 3] * this[ 2] - b[ 2] * this[ 3] + b[ 0] * this[ 8];
            target[ 9] = b[ 9] * this[ 0] - b[ 4] * this[ 2] + b[ 2] * this[ 4] + b[ 0] * this[ 9];
            target[10] = b[10] * this[ 0] + b[ 4] * this[ 3] - b[ 3] * this[ 4] + b[ 0] * this[10];
            target[11] = b[11] * this[ 0] - b[ 8] * this[ 1] + b[ 6] * this[ 2] - b[ 5] * this[ 3] - b[ 3] * this[ 5] + b[ 2] * this[ 6] - b[ 1] * this[ 8] + b[ 0] * this[11];
            target[12] = b[12] * this[ 0] - b[ 9] * this[ 1] - b[ 7] * this[ 2] + b[ 5] * this[ 4] + b[ 4] * this[ 5] - b[ 2] * this[ 7] - b[ 1] * this[ 9] + b[ 0] * this[12];
            target[13] = b[13] * this[ 0] - b[10] * this[ 1] + b[ 7] * this[ 3] - b[ 6] * this[ 4] - b[ 4] * this[ 6] + b[ 3] * this[ 7] - b[ 1] * this[10] + b[ 0] * this[13];
            target[14] = b[14] * this[ 0] + b[10] * this[ 2] + b[ 9] * this[ 3] + b[ 8] * this[ 4] + b[ 4] * this[ 8] + b[ 3] * this[ 9] + b[ 2] * this[10] + b[ 0] * this[14];
            target[15] = b[15] * this[ 0] + b[14] * this[ 1] + b[13] * this[ 2] + b[12] * this[ 3] + b[11] * this[ 4] + b[10] * this[ 5] + b[ 9] * this[ 6] + b[ 8] * this[ 7] + b[ 7] * this[ 8] + b[ 6] * this[ 9] + b[ 5] * this[10] - b[ 4] * this[11] - b[ 3] * this[12] - b[ 2] * this[13] - b[ 1] * this[14] + b[ 0] * this[15];
            
            return target;
        }

        inner(b, target) {
            if (target === undefined)
                target = new Ega()

            target[ 0] = b[ 0] * this[ 0] + b[ 2] * this[ 2] + b[ 3] * this[ 3] + b[ 4] * this[ 4] - b[ 8] * this[ 8] - b[ 9] * this[ 9] - b[10] * this[10] - b[14] * this[14];
            target[ 1] = b[ 1] * this[ 0] + b[ 0] * this[ 1] - b[ 5] * this[ 2] - b[ 6] * this[ 3] - b[ 7] * this[ 4] + b[ 2] * this[ 5] + b[ 3] * this[ 6] + b[ 4] * this[ 7] + b[11] * this[ 8] + b[12] * this[ 9] + b[13] * this[10] + b[ 8] * this[11] + b[ 9] * this[12] + b[10] * this[13] + b[15] * this[14] - b[14] * this[15];
            target[ 2] = b[ 2] * this[ 0] + b[ 0] * this[ 2] - b[ 8] * this[ 3] + b[ 9] * this[ 4] + b[ 3] * this[ 8] - b[ 4] * this[ 9] - b[14] * this[10] - b[10] * this[14];
            target[ 3] = b[ 3] * this[ 0] + b[ 8] * this[ 2] + b[ 0] * this[ 3] - b[10] * this[ 4] - b[ 2] * this[ 8] - b[14] * this[ 9] + b[ 4] * this[10] - b[ 9] * this[14];
            target[ 4] = b[ 4] * this[ 0] - b[ 9] * this[ 2] + b[10] * this[ 3] + b[ 0] * this[ 4] - b[14] * this[ 8] + b[ 2] * this[ 9] - b[ 3] * this[10] - b[ 8] * this[14];
            target[ 5] = b[ 5] * this[ 0] - b[11] * this[ 3] + b[12] * this[ 4] + b[ 0] * this[ 5] - b[15] * this[10] - b[ 3] * this[11] + b[ 4] * this[12] - b[10] * this[15];
            target[ 6] = b[ 6] * this[ 0] + b[11] * this[ 2] - b[13] * this[ 4] + b[ 0] * this[ 6] - b[15] * this[ 9] + b[ 2] * this[11] - b[ 4] * this[13] - b[ 9] * this[15];
            target[ 7] = b[ 7] * this[ 0] - b[12] * this[ 2] + b[13] * this[ 3] + b[ 0] * this[ 7] - b[15] * this[ 8] - b[ 2] * this[12] + b[ 3] * this[13] - b[ 8] * this[15];
            target[ 8] = b[ 8] * this[ 0] + b[14] * this[ 4] + b[ 0] * this[ 8] + b[ 4] * this[14];
            target[ 9] = b[ 9] * this[ 0] + b[14] * this[ 3] + b[ 0] * this[ 9] + b[ 3] * this[14];
            target[10] = b[10] * this[ 0] + b[14] * this[ 2] + b[ 0] * this[10] + b[ 2] * this[14];
            target[11] = b[11] * this[ 0] + b[15] * this[ 4] + b[ 0] * this[11] - b[ 4] * this[15];
            target[12] = b[12] * this[ 0] + b[15] * this[ 3] + b[ 0] * this[12] - b[ 3] * this[15];
            target[13] = b[13] * this[ 0] + b[15] * this[ 2] + b[ 0] * this[13] - b[ 2] * this[15];
            target[14] = b[14] * this[ 0] + b[ 0] * this[14];
            target[15] = b[15] * this[ 0] + b[ 0] * this[15];
            
            return target;
        }

        mul(b, target) {
            if (target === undefined)
                target = new Ega()

            target[ 0] = b[ 0] * this[ 0] + b[ 2] * this[ 2] + b[ 3] * this[ 3] + b[ 4] * this[ 4] - b[ 8] * this[ 8] - b[ 9] * this[ 9] - b[10] * this[10] - b[14] * this[14];

            target[ 1] = b[ 1] * this[ 0] + b[ 0] * this[ 1] - b[ 5] * this[ 2] - b[ 6] * this[ 3] - b[ 7] * this[ 4] + b[ 2] * this[ 5] + b[ 3] * this[ 6] + b[ 4] * this[ 7] + b[11] * this[ 8] + b[12] * this[ 9] + b[13] * this[10] + b[ 8] * this[11] + b[ 9] * this[12] + b[10] * this[13] + b[15] * this[14] - b[14] * this[15];
            target[ 2] = b[ 2] * this[ 0] + b[ 0] * this[ 2] - b[ 8] * this[ 3] + b[ 9] * this[ 4] + b[ 3] * this[ 8] - b[ 4] * this[ 9] - b[14] * this[10] - b[10] * this[14];
            target[ 3] = b[ 3] * this[ 0] + b[ 8] * this[ 2] + b[ 0] * this[ 3] - b[10] * this[ 4] - b[ 2] * this[ 8] - b[14] * this[ 9] + b[ 4] * this[10] - b[ 9] * this[14];
            target[ 4] = b[ 4] * this[ 0] - b[ 9] * this[ 2] + b[10] * this[ 3] + b[ 0] * this[ 4] - b[14] * this[ 8] + b[ 2] * this[ 9] - b[ 3] * this[10] - b[ 8] * this[14];

            target[ 5] = b[ 5] * this[ 0] + b[ 2] * this[ 1] - b[ 1] * this[ 2] - b[11] * this[ 3] + b[12] * this[ 4] + b[ 0] * this[ 5] - b[ 8] * this[ 6] + b[ 9] * this[ 7] + b[ 6] * this[ 8] - b[ 7] * this[ 9] - b[15] * this[10] - b[ 3] * this[11] + b[ 4] * this[12] + b[14] * this[13] - b[13] * this[14] - b[10] * this[15];
            target[ 6] = b[ 6] * this[ 0] + b[ 3] * this[ 1] + b[11] * this[ 2] - b[ 1] * this[ 3] - b[13] * this[ 4] + b[ 8] * this[ 5] + b[ 0] * this[ 6] - b[10] * this[ 7] - b[ 5] * this[ 8] - b[15] * this[ 9] + b[ 7] * this[10] + b[ 2] * this[11] + b[14] * this[12] - b[ 4] * this[13] - b[12] * this[14] - b[ 9] * this[15];
            target[ 7] = b[ 7] * this[ 0] + b[ 4] * this[ 1] - b[12] * this[ 2] + b[13] * this[ 3] - b[ 1] * this[ 4] - b[ 9] * this[ 5] + b[10] * this[ 6] + b[ 0] * this[ 7] - b[15] * this[ 8] + b[ 5] * this[ 9] - b[ 6] * this[10] + b[14] * this[11] - b[ 2] * this[12] + b[ 3] * this[13] - b[11] * this[14] - b[ 8] * this[15];
            target[ 8] = b[ 8] * this[ 0] + b[ 3] * this[ 2] - b[ 2] * this[ 3] + b[14] * this[ 4] + b[ 0] * this[ 8] + b[10] * this[ 9] - b[ 9] * this[10] + b[ 4] * this[14];
            target[ 9] = b[ 9] * this[ 0] - b[ 4] * this[ 2] + b[14] * this[ 3] + b[ 2] * this[ 4] - b[10] * this[ 8] + b[ 0] * this[ 9] + b[ 8] * this[10] + b[ 3] * this[14];
            target[10] = b[10] * this[ 0] + b[14] * this[ 2] + b[ 4] * this[ 3] - b[ 3] * this[ 4] + b[ 9] * this[ 8] - b[ 8] * this[ 9] + b[ 0] * this[10] + b[ 2] * this[14];

            target[11] = b[11] * this[ 0] - b[ 8] * this[ 1] + b[ 6] * this[ 2] - b[ 5] * this[ 3] + b[15] * this[ 4] - b[ 3] * this[ 5] + b[ 2] * this[ 6] - b[14] * this[ 7] - b[ 1] * this[ 8] + b[13] * this[ 9] - b[12] * this[10] + b[ 0] * this[11] + b[10] * this[12] - b[ 9] * this[13] + b[ 7] * this[14] - b[ 4] * this[15];
            target[12] = b[12] * this[ 0] - b[ 9] * this[ 1] - b[ 7] * this[ 2] + b[15] * this[ 3] + b[ 5] * this[ 4] + b[ 4] * this[ 5] - b[14] * this[ 6] - b[ 2] * this[ 7] - b[13] * this[ 8] - b[ 1] * this[ 9] + b[11] * this[10] - b[10] * this[11] + b[ 0] * this[12] + b[ 8] * this[13] + b[ 6] * this[14] - b[ 3] * this[15];
            target[13] = b[13] * this[ 0] - b[10] * this[ 1] + b[15] * this[ 2] + b[ 7] * this[ 3] - b[ 6] * this[ 4] - b[14] * this[ 5] - b[ 4] * this[ 6] + b[ 3] * this[ 7] + b[12] * this[ 8] - b[11] * this[ 9] - b[ 1] * this[10] + b[ 9] * this[11] - b[ 8] * this[12] + b[ 0] * this[13] + b[ 5] * this[14] - b[ 2] * this[15];
            target[14] = b[14] * this[ 0] + b[10] * this[ 2] + b[ 9] * this[ 3] + b[ 8] * this[ 4] + b[ 4] * this[ 8] + b[ 3] * this[ 9] + b[ 2] * this[10] + b[ 0] * this[14];

            target[15] = b[15] * this[ 0] + b[14] * this[ 1] + b[13] * this[ 2] + b[12] * this[ 3] + b[11] * this[ 4] + b[10] * this[ 5] + b[ 9] * this[ 6] + b[ 8] * this[ 7] + b[ 7] * this[ 8] + b[ 6] * this[ 9] + b[ 5] * this[10] - b[ 4] * this[11] - b[ 3] * this[12] - b[ 2] * this[13] - b[ 1] * this[14] + b[ 0] * this[15];
            
            return target
        }
    }
    window.Ega = Ega

    let dqMeshes = []
    updateDqMeshes = ()=>{
        dqMeshes.forEach((dqMesh) => { dqMesh.updateMat() })
    }
    class DqMesh extends THREE.Mesh {
        constructor(geo,mat) {
            super(geo,mat)
            this.matrixAutoUpdate = false
            this.dq = new Dq().copy(oneDq)

            dqMeshes.push(this)
        }

        updateMat() {
            this.dq.normalize(dq0)
            this.dq.toMat4(this.matrix)
        }
    }
    window.DqMesh = DqMesh

    let localDq0 = new Dq()
    let localDq1 = new Dq()
    let localDq2 = new Dq()
    let localDq3 = new Dq()
    let localDq4 = new Dq()
    let localDq5 = new Dq()

    // Ega.onesWithMinus = []
    // Dq.onesWithMinus = []
    // Line.onesWithMinus = []

    Line.indexGrades = [2,2,2,2,2,2]
    Line.basisNames = [`01`, `02`, `03`, `12`, `31`, `23`]

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

    let localEga0 = new Ega()
    let localEga1 = new Ega()
    let localEga2 = new Ega()
    let localEga3 = new Ega()
    let localEga4 = new Ega()
    let localEga5 = new Ega()
    let localEga6 = new Ega()

    dq0 = new Dq()
    dq1 = new Dq()
    dq2 = new Dq()
    dq3 = new Dq()
}