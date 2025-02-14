// Written by a generator written by enki, modified by Hamish Todd

//we surely want it to be the case that the un-entangled is defined by two points on the 2-sphere
//A rotation around the line connected to that point, and a "translation" to that point, eg a 90 degree rotation towards it

// non-entangled states have x3 = x4 = 0
// maximally entangled states have x0 = x1 = x2 = 0
// it's always 90 degrees around some line pair maybe?
//if you have to throw one away, rotating around the camera's axis is obvious candidate

//translation rotation is 6-dof, put it in a place, rotate it. If the rotation is deffo 180 degrees, that's 5
//if you have the 4, you know the 5th because unit length, apart from sign
//so, they're the coefficients of e01, e23,   e02, e13 and x0 is scalar part

// Equatorial trick.For any Sn, there is Sn - 1 as its equator.If Sn corresponds to some set of rotations, Sn - 1 is probably the subset of those rotations that are at 180 degrees

/**
If it was going to be PGA fuelling your interpretation...
Each S3 arranged in the S7 is like a line at infinity. They're grade-4 elements, eg e1234
Each one is an R4 in the larger R8
If you're inside the S7 they're not at infinity, they do take up the interior

so their a + bj thing is like... call i=e12, j=e23, k=e31
a = x + yi, b = z + wi
x + ye12 + be23 + we12e23 = x + ye12 + be23 + we13

In an ordinary hopf fibration, you've got R2s in R4
Forget stereographic

"Complex structure"
Is the exponential of a real-imaginary pair kinda like a rotation-translation around a line pair?
Maybe it's the screw motions of Cl(3,1)


Unit complex numbers in 3D are simulated by exp(alpha*e12)

What's the relationship of the EPGA hopf fibration to the pair of complex numbers?
    Well of course if you have (1,0) it's the line through the origin, if it's (0,1) it's the dual of that line, at infinity
    And if they are equally balanced it's probably one of a few lines which can be rotated around the line through the origin if you change the phase
        Hmm, maybe it's eg (e01 + e23). Although where the hell does the phase come in?
    And yes you can also view this as interpolating between two 180 degree turns

Maybe it's that the equator is an entirely isoclinic rotation whereas

Actually a motor should always have both lines
It is always both?
A screw then is both where one is doing the job differently?
It's a buncha arrows that turn around the thing. They can be animated to be on either, turning around like little circles
A pure translation you miiiight make as a translation from point to point, if you were an awful vector algebra person
Throw it in their face: it initially looks like a line, but then it breaks into arrows that all fan out from the line over to this thing at infinity


With x0 = 1 or -1, it's a bloch sphere for the first qubit
A bloch sphere is more like a bunch of 90 degree turns. Not 180, because there axes a and -a are the same

Why not just take those two quaternions and...

Suppose you started education with the bloch sphere.
You talked about applying the pauli matrices to it. 
*/



function initAlgebra() {

    //errrr obv you want to count up in binary, but does that correspond... we'll find out

    let basisNames = ["", "0", "1", "2", "3", "01", "02", "03", "12", "31", "23", "021", "013", "032", "123", "0123"]
    let onesWithMinus = ["31", "021", "032"] //yes you could reverse the orders in the string but it's established

    let effectiveOrigin = new THREE.Vector3(0., 0., 0.)//(0 - .1, 1.6 - .1, -0.5)
    //could have scale too

    const GRADES_OF_ELEMENTS = [0, 1, 1, 1, 1, 2, 2, 2, 3]

    class Mv extends Float32Array {
        constructor() {
            super(8)
        }

        copy(a) {
            for (let i = 0; i < 8; ++i)
                this[i] = a[i]

            return this
        }

        log(label) {
            console.error("NOTHING HERE")
        }

        add(mvToAdd) {
            add(this, mvToAdd, localMv0)
            this.copy(localMv0)
        }

        reverse(target) {
            if (target === undefined)
                target = new Mv()

            console.error("NOTHING HERE")
            return target;
        }

        multiplyScalar(a) {
            this[0] = this[0] * a
            this[1] = this[1] * a
            this[2] = this[2] * a
            this[3] = this[3] * a
            this[4] = this[4] * a
            this[5] = this[5] * a
            this[6] = this[6] * a
            this[7] = this[7] * a
            this[8] = this[8] * a
            this[9] = this[9] * a
            this[10] = this[10] * a
            this[11] = this[11] * a
            this[12] = this[12] * a
            this[13] = this[13] * a
            this[14] = this[14] * a
            this[15] = this[15] * a
            return this
        }

        conjugate(target) {
            if (target === undefined)
                target = new Mv()

            target[0] = this[0];
            target[1] = -this[1];
            target[2] = -this[2];
            target[3] = -this[3];
            target[4] = -this[4];
            target[5] = -this[5];
            target[6] = -this[6];
            target[7] = -this[7];
            target[8] = -this[8];
            target[9] = -this[9];
            target[10] = -this[10];
            target[11] = this[11];
            target[12] = this[12];
            target[13] = this[13];
            target[14] = this[14];
            target[15] = this[15];
            return target;
        }

        dual(target) {
            if (target === undefined)
                target = new Mv()

            target[0] = this[15];
            target[1] = this[14];
            target[2] = -this[13];
            target[3] = this[12];
            target[4] = -this[11];
            target[5] = -this[10];
            target[6] = this[9];
            target[7] = -this[8];
            target[8] = -this[7];
            target[9] = this[6];
            target[10] = -this[5];
            target[11] = -this[4];
            target[12] = this[3];
            target[13] = -this[2];
            target[14] = this[1];
            target[15] = this[0];
            return target;
        }

        dualSelf() {
            this.dual(localMv0)
            this.copy(localMv0)

            return this
        }

        isIdealLine() {
            let hasEuclideanLinePart = this[8] !== 0. || this[9] !== 0. || this[10] !== 0.
            let hasIdealLinePart = this[5] !== 0. || this[6] !== 0. || this[7] !== 0.
            return !hasEuclideanLinePart && hasIdealLinePart
        }

        fromVector(v) {
            this.copy(zeroMv)
            this.point(
                v.x - effectiveOrigin.x,
                v.y - effectiveOrigin.y,
                v.z - effectiveOrigin.z)

            return this
        }

        point(x, y, z, w) {
            this.copy(zeroMv)
            this[13] = x
            this[12] = y
            this[11] = z

            this[14] = w === undefined ? 1. : w

            return this
        }

        x() {
            return this[13]
        }
        y() {
            return this[12]
        }
        z() {
            return this[11]
        }

        direction(x, y, z) {
            this.copy(zeroMv)
            this[13] = x
            this[12] = y
            this[11] = z

            this[14] = 0.

            return this
        }

        toVector(target) {
            if (target === undefined)
                target = new THREE.Vector3()

            if (this[14] > 0) {
                target.x = this[13] / this[14]
                target.y = this[12] / this[14]
                target.z = this[11] / this[14]
            }
            else if (this[14] === 0.) {
                //better to put it at the skybox really.
                target.x = this[13]
                target.y = this[12]
                target.z = this[11]
            }
            else {
                target.x = this[13] / this[14]
                target.y = this[12] / this[14]
                target.z = this[11] / this[14]
                //or this?
                // target.x = 0.
                // target.y = 0.
                // target.z = 0.
            }

            target.add(effectiveOrigin)

            return target
        }

        // fromQuaternion(q) {

        // }

        toQuaternion(target) {
            if (target === undefined)
                target = new THREE.Quaternion()

            target.set(this[10], this[9], this[8], this[0])
            target.normalize()
            return target
        }

        fromQuaternion(q) {
            this[0] = q.w
            this[10] = q.x
            this[9] = q.y
            this[8] = q.z
            return this
        }

        //threejs has the same setup of quaternions
        // {
        // 	// let epgaDir = new Mv().direction(1., 0., 0.)
        //     // let epgaRotor = new Mv()
        //     // add(e31, oneMv, epgaRotor).normalize()
        //     // epgaRotor.sandwich(epgaDir, mv0)
        // 	// log("with PGA:")
        //     // mv0.log()

        // 	// let threeDir = new THREE.Vector3(1., 0., 0.)
        // 	// let threeQuaternion = new THREE.Quaternion(0., 1., 0., 1.)
        //     // threeQuaternion.normalize()
        //     // threeDir.applyQuaternion(threeQuaternion)
        // 	// log("with THREE:")
        // 	// log(threeDir)
        // }

        equals(mv) {
            let ret = true
            for (let i = 0; i < 16; ++i) {
                if (mv[i] !== this[i])
                    ret = false
            }
            return ret
        }

        norm() {
            this.conjugate(localMv0)
            product(this, localMv0, localMv1)
            return Math.sqrt(Math.abs(localMv1[0]))
        }

        idealNorm() {
            return this[1] != 0. ?
                this[1] :
                this[15] != 0. ?
                    this[15] :
                    (this.dual(localMv3)).norm();
        }

        normalize() {
            let normToUse = this.norm()
            if (normToUse == 0.)
                normToUse = this.idealNorm()
            this.multiplyScalar(1. / normToUse)
            //what does the ideal norm even mean in this context though?
            return this
        }

        //aliasing works
        sqrtBiReflection(target) {
            if (target === undefined)
                target = new Mv()
            target.copy(this)

            let scalarAddition = target[0] == -1. ? -1. : 1.
            target[0] += scalarAddition
            target.normalize()
            return target
        }
        sqrtQuadReflection(target) {
            if (target === undefined)
                target = new Mv()
            target.copy(this)

            localMv0.copy(this)
            localMv2.copy(this)
            localMv0[0] += 1.
            localMv2[0] += 1.
            localMv2.reverse(localMv3)

            localMv3[15] -= .5 * this[15]
            product(localMv0, localMv3, target)

            return target
        }

        selectGrade(grade, target) {
            target.copy(this)
            for (let i = 0; i < 16; ++i) {
                if (grade !== GRADES_OF_ELEMENTS[i])
                    target[i] = 0.
            }

            return target
        }

        // logarithm(target) {
        // 	let b = this.selectGrade(2, lv2LocalMv0)
        // 	let minusBSquared = (b.cleave(b, lv2LocalMv1)).multiplyScalar(-1.)
        // 	let s = Math.sqrt(minusBSquared)
        // 	let p = meet(b, b, lv2LocalMv3).multiplyScalar(2. * s)

        // 	let scalarInBrackets = Math.atan(s/this[0]) + 
        // }

        sandwich(mvToBeSandwiched, target) {
            if (target === undefined)
                target = new Mv()

            this.reverse(localMv0)

            product(this, mvToBeSandwiched, localMv1)
            product(localMv1, localMv0, target)
        }
    }
    window.Mv = Mv

    rotorFromAxisAngle = (axis, angle, target) => {
        if (target === undefined)
            target = new Mv()

        target.copy(axis)
        target.normalize()
        target.multiplyScalar(Math.sin(angle / 2.))

        target[0] = Math.cos(angle / 2.)

        return target
    }

    orientedDistancePointPlane = (pt, pl) => {
        lv2LocalMv0.copy(pt).normalize()
        lv2LocalMv1.copy(pl).normalize()
        join(lv2LocalMv0, lv2LocalMv1, lv2LocalMv2)
        return lv2LocalMv2[0]
    }
    distancePointPlane = (pt, pl) => {
        return Math.abs(orientedDistancePointPlane(pt, pl))
    }

    distancePointPoint = (pt1, pt2) => {
        lv2LocalMv0.copy(pt1).normalize()
        lv2LocalMv1.copy(pt2).normalize()
        join(lv2LocalMv0, lv2LocalMv1, lv2LocalMv2)
        return Math.abs(lv2LocalMv2.norm())
    }

    function MvFromIndexAndFloat(float, index) {
        let mv = new Mv()
        mv[index] = float
        return mv
    }

    zeroMv = new Mv()
    oneMv = new Mv()
    oneMv[0] = 1.

    e0 = MvFromIndexAndFloat(1.0, 1)
    e1 = MvFromIndexAndFloat(1.0, 2)
    e2 = MvFromIndexAndFloat(1.0, 3)
    e3 = MvFromIndexAndFloat(1.0, 4)
    e01 = product(e0, e1)
    e02 = product(e0, e2)
    e03 = product(e0, e3)
    e12 = product(e1, e2)
    e31 = product(e3, e1)
    e23 = product(e2, e3)
    e021 = product(e02, e1)
    e013 = product(e01, e3)
    e032 = product(e03, e2)
    e123 = product(e12, e3)
    e0123 = product(e0, e123)

    let localMv0 = new Mv()
    let localMv1 = new Mv()
    let localMv2 = new Mv()
    let localMv3 = new Mv()

    let lv2LocalMv0 = new Mv()
    let lv2LocalMv1 = new Mv()
    let lv2LocalMv2 = new Mv()
    let lv2LocalMv3 = new Mv()

    mv0 = new Mv()
    mv1 = new Mv()
    mv2 = new Mv()
    mv3 = new Mv()
    mv4 = new Mv()
}

function product(a, b, target) {
    if (target === undefined)
        target = new Mv()

    target[0] = b[0] * a[0] + b[1] * a[1] + b[2] * a[2] + b[3] * a[3] + b[4] * a[4] - b[5] * a[5] - b[6] * a[6] - b[7] * a[7] - b[8] * a[8] - b[9] * a[9] - b[10] * a[10] - b[11] * a[11] - b[12] * a[12] - b[13] * a[13] - b[14] * a[14] + b[15] * a[15];
    target[1] = b[1] * a[0] + b[0] * a[1] - b[5] * a[2] - b[6] * a[3] - b[7] * a[4] + b[2] * a[5] + b[3] * a[6] + b[4] * a[7] - b[11] * a[8] - b[12] * a[9] - b[13] * a[10] - b[8] * a[11] - b[9] * a[12] - b[10] * a[13] + b[15] * a[14] - b[14] * a[15];
    target[2] = b[2] * a[0] + b[5] * a[1] + b[0] * a[2] - b[8] * a[3] - b[9] * a[4] - b[1] * a[5] + b[11] * a[6] + b[12] * a[7] + b[3] * a[8] + b[4] * a[9] - b[14] * a[10] + b[6] * a[11] + b[7] * a[12] - b[15] * a[13] - b[10] * a[14] + b[13] * a[15];
    target[3] = b[3] * a[0] + b[6] * a[1] + b[8] * a[2] + b[0] * a[3] - b[10] * a[4] - b[11] * a[5] - b[1] * a[6] + b[13] * a[7] - b[2] * a[8] + b[14] * a[9] + b[4] * a[10] - b[5] * a[11] + b[15] * a[12] + b[7] * a[13] + b[9] * a[14] - b[12] * a[15];
    target[4] = b[4] * a[0] + b[7] * a[1] + b[9] * a[2] + b[10] * a[3] + b[0] * a[4] - b[12] * a[5] - b[13] * a[6] - b[1] * a[7] - b[14] * a[8] - b[2] * a[9] - b[3] * a[10] - b[15] * a[11] - b[5] * a[12] - b[6] * a[13] - b[8] * a[14] + b[11] * a[15];
    target[5] = b[5] * a[0] + b[2] * a[1] - b[1] * a[2] + b[11] * a[3] + b[12] * a[4] + b[0] * a[5] - b[8] * a[6] - b[9] * a[7] + b[6] * a[8] + b[7] * a[9] - b[15] * a[10] + b[3] * a[11] + b[4] * a[12] - b[14] * a[13] + b[13] * a[14] - b[10] * a[15];
    target[6] = b[6] * a[0] + b[3] * a[1] - b[11] * a[2] - b[1] * a[3] + b[13] * a[4] + b[8] * a[5] + b[0] * a[6] - b[10] * a[7] - b[5] * a[8] + b[15] * a[9] + b[7] * a[10] - b[2] * a[11] + b[14] * a[12] + b[4] * a[13] - b[12] * a[14] + b[9] * a[15];
    target[7] = b[7] * a[0] + b[4] * a[1] - b[12] * a[2] - b[13] * a[3] - b[1] * a[4] + b[9] * a[5] + b[10] * a[6] + b[0] * a[7] - b[15] * a[8] - b[5] * a[9] - b[6] * a[10] - b[14] * a[11] - b[2] * a[12] - b[3] * a[13] + b[11] * a[14] - b[8] * a[15];
    target[8] = b[8] * a[0] + b[11] * a[1] + b[3] * a[2] - b[2] * a[3] + b[14] * a[4] - b[6] * a[5] + b[5] * a[6] - b[15] * a[7] + b[0] * a[8] - b[10] * a[9] + b[9] * a[10] + b[1] * a[11] - b[13] * a[12] + b[12] * a[13] + b[4] * a[14] - b[7] * a[15];
    target[9] = b[9] * a[0] + b[12] * a[1] + b[4] * a[2] - b[14] * a[3] - b[2] * a[4] - b[7] * a[5] + b[15] * a[6] + b[5] * a[7] + b[10] * a[8] + b[0] * a[9] - b[8] * a[10] + b[13] * a[11] + b[1] * a[12] - b[11] * a[13] - b[3] * a[14] + b[6] * a[15];
    target[10] = b[10] * a[0] + b[13] * a[1] + b[14] * a[2] + b[4] * a[3] - b[3] * a[4] - b[15] * a[5] - b[7] * a[6] + b[6] * a[7] - b[9] * a[8] + b[8] * a[9] + b[0] * a[10] - b[12] * a[11] + b[11] * a[12] + b[1] * a[13] + b[2] * a[14] - b[5] * a[15];
    target[11] = b[11] * a[0] + b[8] * a[1] - b[6] * a[2] + b[5] * a[3] - b[15] * a[4] + b[3] * a[5] - b[2] * a[6] + b[14] * a[7] + b[1] * a[8] - b[13] * a[9] + b[12] * a[10] + b[0] * a[11] - b[10] * a[12] + b[9] * a[13] - b[7] * a[14] + b[4] * a[15];
    target[12] = b[12] * a[0] + b[9] * a[1] - b[7] * a[2] + b[15] * a[3] + b[5] * a[4] + b[4] * a[5] - b[14] * a[6] - b[2] * a[7] + b[13] * a[8] + b[1] * a[9] - b[11] * a[10] + b[10] * a[11] + b[0] * a[12] - b[8] * a[13] + b[6] * a[14] - b[3] * a[15];
    target[13] = b[13] * a[0] + b[10] * a[1] - b[15] * a[2] - b[7] * a[3] + b[6] * a[4] + b[14] * a[5] + b[4] * a[6] - b[3] * a[7] - b[12] * a[8] + b[11] * a[9] + b[1] * a[10] - b[9] * a[11] + b[8] * a[12] + b[0] * a[13] - b[5] * a[14] + b[2] * a[15];
    target[14] = b[14] * a[0] + b[15] * a[1] + b[10] * a[2] - b[9] * a[3] + b[8] * a[4] - b[13] * a[5] + b[12] * a[6] - b[11] * a[7] + b[4] * a[8] - b[3] * a[9] + b[2] * a[10] + b[7] * a[11] - b[6] * a[12] + b[5] * a[13] + b[0] * a[14] - b[1] * a[15];
    target[15] = b[15] * a[0] + b[14] * a[1] - b[13] * a[2] + b[12] * a[3] - b[11] * a[4] + b[10] * a[5] - b[9] * a[6] + b[8] * a[7] + b[7] * a[8] - b[6] * a[9] + b[5] * a[10] + b[4] * a[11] - b[3] * a[12] + b[2] * a[13] - b[1] * a[14] + b[0] * a[15];
    return target;
}

function meet(a, b, target) {
    if (target === undefined)
        target = new Mv()

    target[0] = b[0] * a[0];
    target[1] = b[1] * a[0] + b[0] * a[1];
    target[2] = b[2] * a[0] + b[0] * a[2];
    target[3] = b[3] * a[0] + b[0] * a[3];
    target[4] = b[4] * a[0] + b[0] * a[4];
    target[5] = b[5] * a[0] + b[2] * a[1] - b[1] * a[2] + b[0] * a[5];
    target[6] = b[6] * a[0] + b[3] * a[1] - b[1] * a[3] + b[0] * a[6];
    target[7] = b[7] * a[0] + b[4] * a[1] - b[1] * a[4] + b[0] * a[7];
    target[8] = b[8] * a[0] + b[3] * a[2] - b[2] * a[3] + b[0] * a[8];
    target[9] = b[9] * a[0] + b[4] * a[2] - b[2] * a[4] + b[0] * a[9];
    target[10] = b[10] * a[0] + b[4] * a[3] - b[3] * a[4] + b[0] * a[10];
    target[11] = b[11] * a[0] + b[8] * a[1] - b[6] * a[2] + b[5] * a[3] + b[3] * a[5] - b[2] * a[6] + b[1] * a[8] + b[0] * a[11];
    target[12] = b[12] * a[0] + b[9] * a[1] - b[7] * a[2] + b[5] * a[4] + b[4] * a[5] - b[2] * a[7] + b[1] * a[9] + b[0] * a[12];
    target[13] = b[13] * a[0] + b[10] * a[1] - b[7] * a[3] + b[6] * a[4] + b[4] * a[6] - b[3] * a[7] + b[1] * a[10] + b[0] * a[13];
    target[14] = b[14] * a[0] + b[10] * a[2] - b[9] * a[3] + b[8] * a[4] + b[4] * a[8] - b[3] * a[9] + b[2] * a[10] + b[0] * a[14];
    target[15] = b[15] * a[0] + b[14] * a[1] - b[13] * a[2] + b[12] * a[3] - b[11] * a[4] + b[10] * a[5] - b[9] * a[6] + b[8] * a[7] + b[7] * a[8] - b[6] * a[9] + b[5] * a[10] + b[4] * a[11] - b[3] * a[12] + b[2] * a[13] - b[1] * a[14] + b[0] * a[15];
    return target;
}

function join(a, b, target) {
    if (target === undefined)
        target = new Mv()

    target[15] = 1 * (a[15] * b[15]);
    target[14] = -1 * (a[14] * -1 * b[15] + a[15] * b[14] * -1);
    target[13] = 1 * (a[13] * b[15] + a[15] * b[13]);
    target[12] = -1 * (a[12] * -1 * b[15] + a[15] * b[12] * -1);
    target[11] = 1 * (a[11] * b[15] + a[15] * b[11]);
    target[10] = 1 * (a[10] * b[15] + a[13] * b[14] * -1 - a[14] * -1 * b[13] + a[15] * b[10]);
    target[9] = -1 * (a[9] * -1 * b[15] + a[12] * -1 * b[14] * -1 - a[14] * -1 * b[12] * -1 + a[15] * b[9] * -1);
    target[8] = 1 * (a[8] * b[15] + a[11] * b[14] * -1 - a[14] * -1 * b[11] + a[15] * b[8]);
    target[7] = 1 * (a[7] * b[15] + a[12] * -1 * b[13] - a[13] * b[12] * -1 + a[15] * b[7]);
    target[6] = -1 * (a[6] * -1 * b[15] + a[11] * b[13] - a[13] * b[11] + a[15] * b[6] * -1);
    target[5] = 1 * (a[5] * b[15] + a[11] * b[12] * -1 - a[12] * -1 * b[11] + a[15] * b[5]);
    target[4] = -1 * (a[4] * -1 * b[15] + a[7] * b[14] * -1 - a[9] * -1 * b[13] + a[10] * b[12] * -1 + a[12] * -1 * b[10] - a[13] * b[9] * -1 + a[14] * -1 * b[7] + a[15] * b[4] * -1);
    target[3] = 1 * (a[3] * b[15] + a[6] * -1 * b[14] * -1 - a[8] * b[13] + a[10] * b[11] + a[11] * b[10] - a[13] * b[8] + a[14] * -1 * b[6] * -1 + a[15] * b[3]);
    target[2] = -1 * (a[2] * -1 * b[15] + a[5] * b[14] * -1 - a[8] * b[12] * -1 + a[9] * -1 * b[11] + a[11] * b[9] * -1 - a[12] * -1 * b[8] + a[14] * -1 * b[5] + a[15] * b[2] * -1);
    target[1] = 1 * (a[1] * b[15] + a[5] * b[13] - a[6] * -1 * b[12] * -1 + a[7] * b[11] + a[11] * b[7] - a[12] * -1 * b[6] * -1 + a[13] * b[5] + a[15] * b[1]);
    target[0] = 1 * (a[0] * b[15] + a[1] * b[14] * -1 - a[2] * -1 * b[13] + a[3] * b[12] * -1 - a[4] * -1 * b[11] + a[5] * b[10] - a[6] * -1 * b[9] * -1 + a[7] * b[8] + a[8] * b[7] - a[9] * -1 * b[6] * -1 + a[10] * b[5] + a[11] * b[4] * -1 - a[12] * -1 * b[3] + a[13] * b[2] * -1 - a[14] * -1 * b[1] + a[15] * b[0]);
    return target;
}

function cleave(a, b, target) {
    if (target === undefined)
        target = new Mv()

    target[0] = b[0] * a[0] + b[1] * a[1] + b[2] * a[2] + b[3] * a[3] + b[4] * a[4] - b[5] * a[5] - b[6] * a[6] - b[7] * a[7] - b[8] * a[8] - b[9] * a[9] - b[10] * a[10] - b[11] * a[11] - b[12] * a[12] - b[13] * a[13] - b[14] * a[14] + b[15] * a[15];
    target[1] = b[1] * a[0] + b[0] * a[1] - b[5] * a[2] - b[6] * a[3] - b[7] * a[4] + b[2] * a[5] + b[3] * a[6] + b[4] * a[7] - b[11] * a[8] - b[12] * a[9] - b[13] * a[10] - b[8] * a[11] - b[9] * a[12] - b[10] * a[13] + b[15] * a[14] - b[14] * a[15];
    target[2] = b[2] * a[0] + b[5] * a[1] + b[0] * a[2] - b[8] * a[3] - b[9] * a[4] - b[1] * a[5] + b[11] * a[6] + b[12] * a[7] + b[3] * a[8] + b[4] * a[9] - b[14] * a[10] + b[6] * a[11] + b[7] * a[12] - b[15] * a[13] - b[10] * a[14] + b[13] * a[15];
    target[3] = b[3] * a[0] + b[6] * a[1] + b[8] * a[2] + b[0] * a[3] - b[10] * a[4] - b[11] * a[5] - b[1] * a[6] + b[13] * a[7] - b[2] * a[8] + b[14] * a[9] + b[4] * a[10] - b[5] * a[11] + b[15] * a[12] + b[7] * a[13] + b[9] * a[14] - b[12] * a[15];
    target[4] = b[4] * a[0] + b[7] * a[1] + b[9] * a[2] + b[10] * a[3] + b[0] * a[4] - b[12] * a[5] - b[13] * a[6] - b[1] * a[7] - b[14] * a[8] - b[2] * a[9] - b[3] * a[10] - b[15] * a[11] - b[5] * a[12] - b[6] * a[13] - b[8] * a[14] + b[11] * a[15];
    target[5] = b[5] * a[0] + b[11] * a[3] + b[12] * a[4] + b[0] * a[5] - b[15] * a[10] + b[3] * a[11] + b[4] * a[12] - b[10] * a[15];
    target[6] = b[6] * a[0] - b[11] * a[2] + b[13] * a[4] + b[0] * a[6] + b[15] * a[9] - b[2] * a[11] + b[4] * a[13] + b[9] * a[15];
    target[7] = b[7] * a[0] - b[12] * a[2] - b[13] * a[3] + b[0] * a[7] - b[15] * a[8] - b[2] * a[12] - b[3] * a[13] - b[8] * a[15];
    target[8] = b[8] * a[0] + b[11] * a[1] + b[14] * a[4] - b[15] * a[7] + b[0] * a[8] + b[1] * a[11] + b[4] * a[14] - b[7] * a[15];
    target[9] = b[9] * a[0] + b[12] * a[1] - b[14] * a[3] + b[15] * a[6] + b[0] * a[9] + b[1] * a[12] - b[3] * a[14] + b[6] * a[15];
    target[10] = b[10] * a[0] + b[13] * a[1] + b[14] * a[2] - b[15] * a[5] + b[0] * a[10] + b[1] * a[13] + b[2] * a[14] - b[5] * a[15];
    target[11] = b[11] * a[0] - b[15] * a[4] + b[0] * a[11] + b[4] * a[15];
    target[12] = b[12] * a[0] + b[15] * a[3] + b[0] * a[12] - b[3] * a[15];
    target[13] = b[13] * a[0] - b[15] * a[2] + b[0] * a[13] + b[2] * a[15];
    target[14] = b[14] * a[0] + b[15] * a[1] + b[0] * a[14] - b[1] * a[15];
    target[15] = b[15] * a[0] + b[0] * a[15];
    return target;
}

function add(a, b, target) {
    if (target === undefined)
        target = new Mv()

    target[0] = a[0] + b[0];
    target[1] = a[1] + b[1];
    target[2] = a[2] + b[2];
    target[3] = a[3] + b[3];
    target[4] = a[4] + b[4];
    target[5] = a[5] + b[5];
    target[6] = a[6] + b[6];
    target[7] = a[7] + b[7];
    target[8] = a[8] + b[8];
    target[9] = a[9] + b[9];
    target[10] = a[10] + b[10];
    target[11] = a[11] + b[11];
    target[12] = a[12] + b[12];
    target[13] = a[13] + b[13];
    target[14] = a[14] + b[14];
    target[15] = a[15] + b[15];
    return target;
}

function subtract(a, b, target) {
    if (target === undefined)
        target = new Mv()

    res[0] = a[0] - b[0];
    res[1] = a[1] - b[1];
    res[2] = a[2] - b[2];
    res[3] = a[3] - b[3];
    res[4] = a[4] - b[4];
    res[5] = a[5] - b[5];
    res[6] = a[6] - b[6];
    res[7] = a[7] - b[7];
    return target;
}



// 3D Projective Geometric Algebra
// Written by a generator written by enki.
#include < stdio.h >
#include < cmath >
#include < array >

#define PI 3.14159265358979323846

static const char* basis[] = { "1", "e1", "e2", "e3", "e12", "e13", "e23", "e123" };

class R300 {
    public:
        R300 ()  { std:: fill(mvec, mvec + sizeof(mvec) / 4, 0.0f); }
R300(float f, int idx = 0) { std:: fill(mvec, mvec + sizeof(mvec) / 4, 0.0f); mvec[idx] = f; }
float & operator[](size_t idx) { return mvec[idx]; }
const float& operator[](size_t idx) const { return mvec[idx]; }
    R300 log() { int n = 0; for (int i = 0, j = 0; i < 8; i++) if (mvec[i] != 0.0f) { n++; printf("%s%0.7g%s", (j > 0) ? " + " : "", mvec[i], (i == 0) ? "" : basis[i]); j++; }; if (n == 0) printf("0"); printf("\n"); return * this; }
    R300 Conjugate(); 
    R300 Involute();
    float norm();
    float inorm();
    R300 normalized();
private:  
    float mvec[8];
};


//***********************
// R300.Reverse : res = ~a
// Reverse the order of the basis blades.
//***********************
inline R300 operator ~(const R300 & a) {
  R300 res;
    res[0] = a[0];
    res[1] = a[1];
    res[2] = a[2];
    res[3] = a[3];
    res[4] = -a[4];
    res[5] = -a[5];
    res[6] = -a[6];
    res[7] = -a[7];
    return res;
};

//***********************
// R300.Dual : res = !a
// Poincare duality operator.
//***********************
inline R300 operator!(const R300 & a) {
  R300 res;
    res[0] = -a[7];
    res[1] = -a[6];
    res[2] = a[5];
    res[3] = -a[4];
    res[4] = a[3];
    res[5] = -a[2];
    res[6] = a[1];
    res[7] = a[0];
    return res;
};

//***********************
// R300.Conjugate : res = a.Conjugate()
// Clifford Conjugation
//***********************
inline R300 R300:: Conjugate() {
  R300 res;
    res[0] = this -> mvec[0];
    res[1] = -this -> mvec[1];
    res[2] = -this -> mvec[2];
    res[3] = -this -> mvec[3];
    res[4] = -this -> mvec[4];
    res[5] = -this -> mvec[5];
    res[6] = -this -> mvec[6];
    res[7] = this -> mvec[7];
    return res;
};

//***********************
// R300.Involute : res = a.Involute()
// Main involution
//***********************
inline R300 R300:: Involute() {
  R300 res;
    res[0] = this -> mvec[0];
    res[1] = -this -> mvec[1];
    res[2] = -this -> mvec[2];
    res[3] = -this -> mvec[3];
    res[4] = this -> mvec[4];
    res[5] = this -> mvec[5];
    res[6] = this -> mvec[6];
    res[7] = -this -> mvec[7];
    return res;
};

//***********************
// R300.Mul : res = a * b 
// The geometric product.
//***********************
inline R300 operator * (const R300 & a, const R300 & b) {
  R300 res;
    res[0] = b[0] * a[0] + b[1] * a[1] + b[2] * a[2] + b[3] * a[3] - b[4] * a[4] - b[5] * a[5] - b[6] * a[6] - b[7] * a[7];
    res[1] = b[1] * a[0] + b[0] * a[1] - b[4] * a[2] - b[5] * a[3] + b[2] * a[4] + b[3] * a[5] - b[7] * a[6] - b[6] * a[7];
    res[2] = b[2] * a[0] + b[4] * a[1] + b[0] * a[2] - b[6] * a[3] - b[1] * a[4] + b[7] * a[5] + b[3] * a[6] + b[5] * a[7];
    res[3] = b[3] * a[0] + b[5] * a[1] + b[6] * a[2] + b[0] * a[3] - b[7] * a[4] - b[1] * a[5] - b[2] * a[6] - b[4] * a[7];
    res[4] = b[4] * a[0] + b[2] * a[1] - b[1] * a[2] + b[7] * a[3] + b[0] * a[4] - b[6] * a[5] + b[5] * a[6] + b[3] * a[7];
    res[5] = b[5] * a[0] + b[3] * a[1] - b[7] * a[2] - b[1] * a[3] + b[6] * a[4] + b[0] * a[5] - b[4] * a[6] - b[2] * a[7];
    res[6] = b[6] * a[0] + b[7] * a[1] + b[3] * a[2] - b[2] * a[3] - b[5] * a[4] + b[4] * a[5] + b[0] * a[6] + b[1] * a[7];
    res[7] = b[7] * a[0] + b[6] * a[1] - b[5] * a[2] + b[4] * a[3] + b[3] * a[4] - b[2] * a[5] + b[1] * a[6] + b[0] * a[7];
    return res;
};

//***********************
// R300.Wedge : res = a ^ b 
// The outer product. (MEET)
//***********************
inline R300 operator ^ (const R300 & a, const R300 & b) {
  R300 res;
    res[0] = b[0] * a[0];
    res[1] = b[1] * a[0] + b[0] * a[1];
    res[2] = b[2] * a[0] + b[0] * a[2];
    res[3] = b[3] * a[0] + b[0] * a[3];
    res[4] = b[4] * a[0] + b[2] * a[1] - b[1] * a[2] + b[0] * a[4];
    res[5] = b[5] * a[0] + b[3] * a[1] - b[1] * a[3] + b[0] * a[5];
    res[6] = b[6] * a[0] + b[3] * a[2] - b[2] * a[3] + b[0] * a[6];
    res[7] = b[7] * a[0] + b[6] * a[1] - b[5] * a[2] + b[4] * a[3] + b[3] * a[4] - b[2] * a[5] + b[1] * a[6] + b[0] * a[7];
    return res;
};

//***********************
// R300.Vee : res = a & b 
// The regressive product. (JOIN)
//***********************
inline R300 operator & (const R300 & a, const R300 & b) {
  R300 res;
    res[7] = 1 * (a[7] * b[7]);
    res[6] = 1 * (a[6] * b[7] + a[7] * b[6]);
    res[5] = -1 * (a[5] * -1 * b[7] + a[7] * b[5] * -1);
    res[4] = 1 * (a[4] * b[7] + a[7] * b[4]);
    res[3] = 1 * (a[3] * b[7] + a[5] * -1 * b[6] - a[6] * b[5] * -1 + a[7] * b[3]);
    res[2] = -1 * (a[2] * -1 * b[7] + a[4] * b[6] - a[6] * b[4] + a[7] * b[2] * -1);
    res[1] = 1 * (a[1] * b[7] + a[4] * b[5] * -1 - a[5] * -1 * b[4] + a[7] * b[1]);
    res[0] = 1 * (a[0] * b[7] + a[1] * b[6] - a[2] * -1 * b[5] * -1 + a[3] * b[4] + a[4] * b[3] - a[5] * -1 * b[2] * -1 + a[6] * b[1] + a[7] * b[0]);
    return res;
};

//***********************
// R300.Dot : res = a | b 
// The inner product.
//***********************
inline R300 operator | (const R300 & a, const R300 & b) {
  R300 res;
    res[0] = b[0] * a[0] + b[1] * a[1] + b[2] * a[2] + b[3] * a[3] - b[4] * a[4] - b[5] * a[5] - b[6] * a[6] - b[7] * a[7];
    res[1] = b[1] * a[0] + b[0] * a[1] - b[4] * a[2] - b[5] * a[3] + b[2] * a[4] + b[3] * a[5] - b[7] * a[6] - b[6] * a[7];
    res[2] = b[2] * a[0] + b[4] * a[1] + b[0] * a[2] - b[6] * a[3] - b[1] * a[4] + b[7] * a[5] + b[3] * a[6] + b[5] * a[7];
    res[3] = b[3] * a[0] + b[5] * a[1] + b[6] * a[2] + b[0] * a[3] - b[7] * a[4] - b[1] * a[5] - b[2] * a[6] - b[4] * a[7];
    res[4] = b[4] * a[0] + b[7] * a[3] + b[0] * a[4] + b[3] * a[7];
    res[5] = b[5] * a[0] - b[7] * a[2] + b[0] * a[5] - b[2] * a[7];
    res[6] = b[6] * a[0] + b[7] * a[1] + b[0] * a[6] + b[1] * a[7];
    res[7] = b[7] * a[0] + b[0] * a[7];
    return res;
};

//***********************
// R300.Add : res = a + b 
// Multivector addition
//***********************
inline R300 operator + (const R300 & a, const R300 & b) {
  R300 res;
    res[0] = a[0] + b[0];
    res[1] = a[1] + b[1];
    res[2] = a[2] + b[2];
    res[3] = a[3] + b[3];
    res[4] = a[4] + b[4];
    res[5] = a[5] + b[5];
    res[6] = a[6] + b[6];
    res[7] = a[7] + b[7];
    return res;
};

//***********************
// R300.Sub : res = a - b 
// Multivector subtraction
//***********************
inline R300 operator - (const R300 & a, const R300 & b) {
  R300 res;
    res[0] = a[0] - b[0];
    res[1] = a[1] - b[1];
    res[2] = a[2] - b[2];
    res[3] = a[3] - b[3];
    res[4] = a[4] - b[4];
    res[5] = a[5] - b[5];
    res[6] = a[6] - b[6];
    res[7] = a[7] - b[7];
    return res;
};

//***********************
// R300.smul : res = a * b 
// scalar/multivector multiplication
//***********************
inline R300 operator * (const float & a, const R300 & b) {
  R300 res;
    res[0] = a * b[0];
    res[1] = a * b[1];
    res[2] = a * b[2];
    res[3] = a * b[3];
    res[4] = a * b[4];
    res[5] = a * b[5];
    res[6] = a * b[6];
    res[7] = a * b[7];
    return res;
};

//***********************
// R300.muls : res = a * b 
// multivector/scalar multiplication
//***********************
inline R300 operator * (const R300 & a, const float & b) {
  R300 res;
    res[0] = a[0] * b;
    res[1] = a[1] * b;
    res[2] = a[2] * b;
    res[3] = a[3] * b;
    res[4] = a[4] * b;
    res[5] = a[5] * b;
    res[6] = a[6] * b;
    res[7] = a[7] * b;
    return res;
};

//***********************
// R300.sadd : res = a + b 
// scalar/multivector addition
//***********************
inline R300 operator + (const float & a, const R300 & b) {
  R300 res;
    res[0] = a + b[0];
    res[1] = b[1];
    res[2] = b[2];
    res[3] = b[3];
    res[4] = b[4];
    res[5] = b[5];
    res[6] = b[6];
    res[7] = b[7];
    return res;
};

//***********************
// R300.adds : res = a + b 
// multivector/scalar addition
//***********************
inline R300 operator + (const R300 & a, const float & b) {
  R300 res;
    res[0] = a[0] + b;
    res[1] = a[1];
    res[2] = a[2];
    res[3] = a[3];
    res[4] = a[4];
    res[5] = a[5];
    res[6] = a[6];
    res[7] = a[7];
    return res;
};

//***********************
// R300.ssub : res = a - b 
// scalar/multivector subtraction
//***********************
inline R300 operator - (const float & a, const R300 & b) {
  R300 res;
    res[0] = a - b[0];
    res[1] = -b[1];
    res[2] = -b[2];
    res[3] = -b[3];
    res[4] = -b[4];
    res[5] = -b[5];
    res[6] = -b[6];
    res[7] = -b[7];
    return res;
};

//***********************
// R300.subs : res = a - b 
// multivector/scalar subtraction
//***********************
inline R300 operator - (const R300 & a, const float & b) {
  R300 res;
    res[0] = a[0] - b;
    res[1] = a[1];
    res[2] = a[2];
    res[3] = a[3];
    res[4] = a[4];
    res[5] = a[5];
    res[6] = a[6];
    res[7] = a[7];
    return res;
};


inline float R300:: norm() { return sqrt(std:: abs(((* this) * Conjugate()).mvec[0])); }
inline float R300:: inorm() { return (!(* this)).norm(); }
inline R300 R300:: normalized() { return (* this) * (1 / norm()); }


static R300 e1(1.0f, 1);
static R300 e2(1.0f, 2);
static R300 e3(1.0f, 3);
static R300 e12(1.0f, 4);
static R300 e13(1.0f, 5);
static R300 e23(1.0f, 6);
static R300 e123(1.0f, 7);


int main(int argc, char ** argv) {

    printf("e1*e1         : "); (e1 * e1).log();
    printf("pss           : "); e123.log();
    printf("pss*pss       : "); (e123 * e123).log();

    return 0;
}