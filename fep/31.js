/*
    js->glsl; for each function:
        in float[16]
        this -> a
        in float[16] a
        Math. -> ``
        foo.funcName(bar) -> funcName(foo,bar)
        no return values
*/


function init31WithoutDeclarations() {

    let biv = new Float32Array(16)

    class Mv31 extends GeneralVector {

        constructor() {
            super(16)
        }

        sphereFromRadius(radius) {
            return _eo.addScaled(_e0, radius * radius, this)
        }

        //may also be sign errors if it isn't PGA stuff, ya gotta divide!
        projectOn(on, target) {
            return this.inner(on,newMv31).mulReverse(on,target)
        }

        flatPpToVec(v) {
            let translator = this.mulReverse(_e12, newMv31)
            translator[0] *= 2.
            return translator.translatorToVec(v)
        }

        cheapSqrt(target) {
            this.cheapNormalize(target)
            if(target[0] === -1.)
                target.negate(target)
            target[0] += 1.
            return target.cheapNormalize(target)
        }

        cheapNormalize(target) {
            //should be doable with sqScalar but the reverse is important
            let normSq = this.mulReverse(this, newMv31)[0]
            return this.multiplyScalar(1. / Math.sqrt(Math.abs(normSq)), target)
        }

        mulReverse(b, target) { return this.mul(b.getReverse(newMv31), target) }
        sandwich(b, target) { return this.mul(b, newMv31).mulReverse(this, target) }

        //possibly negative!
        sqScalar() {
            return this[0] * this[0] + this[1] * this[1] + this[2] * this[2] + this[3] * this[3] - this[4] * this[4] - this[5] * this[5] - this[6] * this[6] + this[7] * this[7] - this[8] * this[8] + this[9] * this[9] + this[10] * this[10] - this[11] * this[11] + this[12] * this[12] + this[13] * this[13] + this[14] * this[14] - this[15] * this[15]
        }

        // "vec" could be Vector2 or Vector3
        translatorFromVec(v) { return _one.addScaled(_e10, v.x/2., this).addScaled(_e20, v.y/2., this) }
        vecToZrc(v){ return newMv31.translatorFromVec(v).sandwich(_eo,this) }

        circlePosToVec(targetVec) {
            let translationToCenter = this.inner(_e120, newMv31).mulReverse(_e12, newMv31)
            translationToCenter[0] *= 2.
            return translationToCenter.translatorToVec(targetVec)

            //wanna get radius? Learn the actual radius-to-dilation-norm function!
        }

        translatorToVec(target) {
            target.z = 0.
            target.x = this[6] + this[7]
            target.y = this[8] + this[9]
            target.multiplyScalar(1. / this[0], target)
            return target
        }

        pointPairToVecs(targets) {

            let mySq = this.sqScalar()
            let toUse = mySq > 0. ? this : this.inner(_e12pm, newMv31)

            let projector = toUse.cheapNormalize(newMv31)
            projector[0] = 1.
            projector.multiplyScalar(.5, projector)
            let projectableUna = toUse.inner(_em, newMv31)

            for (let i = 0; i < 2; ++i) {

                let zrc = projector.mul(projectableUna, newMv31)
                if (zrc[3] === zrc[4])
                    targets[i].copy(outOfSightVec3)
                else
                    zrc.circlePosToVec(targets[i])

                projector.getReverse(projector)
            }

            return targets
        }

        rigorousNormalize(target) {
            var S = this[0] * this[0] + this[1] * this[1] + this[2] * this[2] - this[3] * this[3] + this[4] * this[4] - this[5] * this[5] - this[6] * this[6] - this[7] * this[7];
            var T = 2 * (this[0] * this[7] - this[1] * this[6] + this[2] * this[5] - this[3] * this[4]);
            var N = ((S * S + T * T) ** .5 + S) ** .5, N2 = N * N;
            var ND = 2 ** .5 * N / (N2 * N2 + T * T);
            var C = N2 * ND, D = -T * ND;
            target[0] = C * this[0] - D * this[7]
            target[16] = C * this[7] + D * this[0]
            target[5] = C * this[1] + D * this[6]; target[6] = C * this[2] - D * this[5]; target[7] = C * this[3] - D * this[4];
            target[8] = C * this[4] + D * this[3]; target[9] = C * this[5] + D * this[2]; target[10] = C * this[6] - D * this[1];
            return target
        }

        logarithm(target) {

            // B*B = S + T*e1234
            var S = this[0] * this[0] - this[15] * this[15] - 1;
            var T = 2 * (this[0] * this[15])
            var norm = Math.sqrt(S * S + T * T)
            var [x, y] = [0.5 * (1 + S / norm), -0.5 * T / norm];
            // lp is always a boost, lm a rotation
            var [lp, lm] = [Math.sqrt(0.5 * S + 0.5 * norm), Math.sqrt(-0.5 * S + 0.5 * norm)]
            var theta2 = lm == 0 ? 0 : Math.atan2(lm, this[0]); var theta1 = Math.atanh(lp / this[0]);
            var [w1, w2] = [lp == 0 ? 0 : theta1 / lp, lm == 0 ? 0 : theta2 / lm]
            var [A, B] = [(w1 - w2) * x + w2, w1 == 0 ? Math.atanh(-this[15] / lm) / lm : (w1 - w2) * y];
            target.zero()
            target[ 5] = this[ 5] * A + this[10] * B
            target[ 6] = this[ 6] * A - this[ 9] * B
            target[ 7] = this[ 7] * A - this[ 8] * B
            target[ 8] = this[ 8] * A + this[ 7] * B
            target[ 9] = this[ 9] * A + this[ 6] * B
            target[10] = this[10] * A - this[ 5] * B

            return target
        }

        exp(target) {

            for (let i = 0; i < 6; ++i)
                biv[i] = this[i + 5];

            // B*B = S + T*e1234
            var S = -biv[0] * biv[0] - biv[1] * biv[1] + biv[2] * biv[2] - biv[3] * biv[3] + biv[4] * biv[4] + biv[5] * biv[5]
            var T = 2 * (biv[0] * biv[5] - biv[1] * biv[4] + biv[2] * biv[3])
            // ||B*B||
            var norm = Math.sqrt(S * S + T * T)
            if(norm === 0.) {
                target.copy(this)
                target[0] = 1.
            }
            else {
                // P_+ = xB + y*e1234*B
                var [x, y] = [0.5 * (1 + S / norm), -0.5 * T / norm];
                var [lp, lm] = [Math.sqrt(0.5 * S + 0.5 * norm), Math.sqrt(-0.5 * S + 0.5 * norm)]
                var [cp, sp] = [Math.cosh(lp), lp == 0 ? 1 : Math.sinh(lp) / lp]
                var [cm, sm] = [Math.cos(lm), lm == 0 ? 1 : Math.sin(lm) / lm]
                var [cmsp, cpsm] = [cm * sp, cp * sm]
                var [alpha, beta] = [(cmsp - cpsm) * x + cpsm, (cmsp - cpsm) * y]
                // Combine the two Euler's formulas together.
                target[0] = cp * cm
                target[5] = (biv[0] * alpha + biv[5] * beta); target[6] = (biv[1] * alpha - biv[4] * beta); target[7] = (biv[2] * alpha - biv[3] * beta);
                target[8] = (biv[3] * alpha + biv[2] * beta); target[9] = (biv[4] * alpha + biv[1] * beta); target[10] = (biv[5] * alpha - biv[0] * beta);
                target[16] = sp * sm * T / 2
            }
            return target
        }

        getReverse(target) {
            target[0] = this[0]; target[1] = this[1]; target[2] = this[2]; target[3] = this[3]; target[4] = this[4]; target[5] = -this[5]; target[6] = -this[6]; target[7] = -this[7]; target[8] = -this[8]; target[9] = -this[9]; target[10] = -this[10]; target[11] = -this[11]; target[12] = -this[12]; target[13] = -this[13]; target[14] = -this[14]; target[15] = this[15];
            return target
        }

        mul(b,target) {
            target[0] = b[0] * this[0] + b[1] * this[1] + b[2] * this[2] + b[3] * this[3] - b[4] * this[4] - b[5] * this[5] - b[6] * this[6] + b[7] * this[7] - b[8] * this[8] + b[9] * this[9] + b[10] * this[10] - b[11] * this[11] + b[12] * this[12] + b[13] * this[13] + b[14] * this[14] - b[15] * this[15]
            target[1] = b[1] * this[0] + b[0] * this[1] - b[5] * this[2] - b[6] * this[3] + b[7] * this[4] + b[2] * this[5] + b[3] * this[6] - b[4] * this[7] - b[11] * this[8] + b[12] * this[9] + b[13] * this[10] - b[8] * this[11] + b[9] * this[12] + b[10] * this[13] - b[15] * this[14] + b[14] * this[15]
            target[2] = b[2] * this[0] + b[5] * this[1] + b[0] * this[2] - b[8] * this[3] + b[9] * this[4] - b[1] * this[5] + b[11] * this[6] - b[12] * this[7] + b[3] * this[8] - b[4] * this[9] + b[14] * this[10] + b[6] * this[11] - b[7] * this[12] + b[15] * this[13] + b[10] * this[14] - b[13] * this[15]
            target[3] = b[3] * this[0] + b[6] * this[1] + b[8] * this[2] + b[0] * this[3] + b[10] * this[4] - b[11] * this[5] - b[1] * this[6] - b[13] * this[7] - b[2] * this[8] - b[14] * this[9] - b[4] * this[10] - b[5] * this[11] - b[15] * this[12] - b[7] * this[13] - b[9] * this[14] + b[12] * this[15]
            target[4] = b[4] * this[0] + b[7] * this[1] + b[9] * this[2] + b[10] * this[3] + b[0] * this[4] - b[12] * this[5] - b[13] * this[6] - b[1] * this[7] - b[14] * this[8] - b[2] * this[9] - b[3] * this[10] - b[15] * this[11] - b[5] * this[12] - b[6] * this[13] - b[8] * this[14] + b[11] * this[15]
            target[5] = b[5] * this[0] + b[2] * this[1] - b[1] * this[2] + b[11] * this[3] - b[12] * this[4] + b[0] * this[5] - b[8] * this[6] + b[9] * this[7] + b[6] * this[8] - b[7] * this[9] + b[15] * this[10] + b[3] * this[11] - b[4] * this[12] + b[14] * this[13] - b[13] * this[14] + b[10] * this[15]
            target[6] = b[6] * this[0] + b[3] * this[1] - b[11] * this[2] - b[1] * this[3] - b[13] * this[4] + b[8] * this[5] + b[0] * this[6] + b[10] * this[7] - b[5] * this[8] - b[15] * this[9] - b[7] * this[10] - b[2] * this[11] - b[14] * this[12] - b[4] * this[13] + b[12] * this[14] - b[9] * this[15]
            target[7] = b[7] * this[0] + b[4] * this[1] - b[12] * this[2] - b[13] * this[3] - b[1] * this[4] + b[9] * this[5] + b[10] * this[6] + b[0] * this[7] - b[15] * this[8] - b[5] * this[9] - b[6] * this[10] - b[14] * this[11] - b[2] * this[12] - b[3] * this[13] + b[11] * this[14] - b[8] * this[15]
            target[8] = b[8] * this[0] + b[11] * this[1] + b[3] * this[2] - b[2] * this[3] - b[14] * this[4] - b[6] * this[5] + b[5] * this[6] + b[15] * this[7] + b[0] * this[8] + b[10] * this[9] - b[9] * this[10] + b[1] * this[11] + b[13] * this[12] - b[12] * this[13] - b[4] * this[14] + b[7] * this[15]
            target[9] = b[9] * this[0] + b[12] * this[1] + b[4] * this[2] - b[14] * this[3] - b[2] * this[4] - b[7] * this[5] + b[15] * this[6] + b[5] * this[7] + b[10] * this[8] + b[0] * this[9] - b[8] * this[10] + b[13] * this[11] + b[1] * this[12] - b[11] * this[13] - b[3] * this[14] + b[6] * this[15]
            target[10] = b[10] * this[0] + b[13] * this[1] + b[14] * this[2] + b[4] * this[3] - b[3] * this[4] - b[15] * this[5] - b[7] * this[6] + b[6] * this[7] - b[9] * this[8] + b[8] * this[9] + b[0] * this[10] - b[12] * this[11] + b[11] * this[12] + b[1] * this[13] + b[2] * this[14] - b[5] * this[15]
            target[11] = b[11] * this[0] + b[8] * this[1] - b[6] * this[2] + b[5] * this[3] + b[15] * this[4] + b[3] * this[5] - b[2] * this[6] - b[14] * this[7] + b[1] * this[8] + b[13] * this[9] - b[12] * this[10] + b[0] * this[11] + b[10] * this[12] - b[9] * this[13] + b[7] * this[14] - b[4] * this[15]
            target[12] = b[12] * this[0] + b[9] * this[1] - b[7] * this[2] + b[15] * this[3] + b[5] * this[4] + b[4] * this[5] - b[14] * this[6] - b[2] * this[7] + b[13] * this[8] + b[1] * this[9] - b[11] * this[10] + b[10] * this[11] + b[0] * this[12] - b[8] * this[13] + b[6] * this[14] - b[3] * this[15]
            target[13] = b[13] * this[0] + b[10] * this[1] - b[15] * this[2] - b[7] * this[3] + b[6] * this[4] + b[14] * this[5] + b[4] * this[6] - b[3] * this[7] - b[12] * this[8] + b[11] * this[9] + b[1] * this[10] - b[9] * this[11] + b[8] * this[12] + b[0] * this[13] - b[5] * this[14] + b[2] * this[15]
            target[14] = b[14] * this[0] + b[15] * this[1] + b[10] * this[2] - b[9] * this[3] + b[8] * this[4] - b[13] * this[5] + b[12] * this[6] - b[11] * this[7] + b[4] * this[8] - b[3] * this[9] + b[2] * this[10] + b[7] * this[11] - b[6] * this[12] + b[5] * this[13] + b[0] * this[14] - b[1] * this[15]
            target[15] = b[15] * this[0] + b[14] * this[1] - b[13] * this[2] + b[12] * this[3] - b[11] * this[4] + b[10] * this[5] - b[9] * this[6] + b[8] * this[7] + b[7] * this[8] - b[6] * this[9] + b[5] * this[10] + b[4] * this[11] - b[3] * this[12] + b[2] * this[13] - b[1] * this[14] + b[0] * this[15]
            return target
        }

        wedge(b,target) {
            target[0] = b[0] * this[0]
            target[1] = b[1] * this[0] + b[0] * this[1]
            target[2] = b[2] * this[0] + b[0] * this[2]
            target[3] = b[3] * this[0] + b[0] * this[3]
            target[4] = b[4] * this[0] + b[0] * this[4]
            target[5] = b[5] * this[0] + b[2] * this[1] - b[1] * this[2] + b[0] * this[5]
            target[6] = b[6] * this[0] + b[3] * this[1] - b[1] * this[3] + b[0] * this[6]
            target[7] = b[7] * this[0] + b[4] * this[1] - b[1] * this[4] + b[0] * this[7]
            target[8] = b[8] * this[0] + b[3] * this[2] - b[2] * this[3] + b[0] * this[8]
            target[9] = b[9] * this[0] + b[4] * this[2] - b[2] * this[4] + b[0] * this[9]
            target[10] = b[10] * this[0] + b[4] * this[3] - b[3] * this[4] + b[0] * this[10]
            target[11] = b[11] * this[0] + b[8] * this[1] - b[6] * this[2] + b[5] * this[3] + b[3] * this[5] - b[2] * this[6] + b[1] * this[8] + b[0] * this[11]
            target[12] = b[12] * this[0] + b[9] * this[1] - b[7] * this[2] + b[5] * this[4] + b[4] * this[5] - b[2] * this[7] + b[1] * this[9] + b[0] * this[12]
            target[13] = b[13] * this[0] + b[10] * this[1] - b[7] * this[3] + b[6] * this[4] + b[4] * this[6] - b[3] * this[7] + b[1] * this[10] + b[0] * this[13]
            target[14] = b[14] * this[0] + b[10] * this[2] - b[9] * this[3] + b[8] * this[4] + b[4] * this[8] - b[3] * this[9] + b[2] * this[10] + b[0] * this[14]
            target[15] = b[15] * this[0] + b[14] * this[1] - b[13] * this[2] + b[12] * this[3] - b[11] * this[4] + b[10] * this[5] - b[9] * this[6] + b[8] * this[7] + b[7] * this[8] - b[6] * this[9] + b[5] * this[10] + b[4] * this[11] - b[3] * this[12] + b[2] * this[13] - b[1] * this[14] + b[0] * this[15]
            return target
        }

        inner(b,target) {
            target[0] = b[0] * this[0] + b[1] * this[1] + b[2] * this[2] + b[3] * this[3] - b[4] * this[4] - b[5] * this[5] - b[6] * this[6] + b[7] * this[7] - b[8] * this[8] + b[9] * this[9] + b[10] * this[10] - b[11] * this[11] + b[12] * this[12] + b[13] * this[13] + b[14] * this[14] - b[15] * this[15]
            target[1] = b[1] * this[0] + b[0] * this[1] - b[5] * this[2] - b[6] * this[3] + b[7] * this[4] + b[2] * this[5] + b[3] * this[6] - b[4] * this[7] - b[11] * this[8] + b[12] * this[9] + b[13] * this[10] - b[8] * this[11] + b[9] * this[12] + b[10] * this[13] - b[15] * this[14] + b[14] * this[15]
            target[2] = b[2] * this[0] + b[5] * this[1] + b[0] * this[2] - b[8] * this[3] + b[9] * this[4] - b[1] * this[5] + b[11] * this[6] - b[12] * this[7] + b[3] * this[8] - b[4] * this[9] + b[14] * this[10] + b[6] * this[11] - b[7] * this[12] + b[15] * this[13] + b[10] * this[14] - b[13] * this[15]
            target[3] = b[3] * this[0] + b[6] * this[1] + b[8] * this[2] + b[0] * this[3] + b[10] * this[4] - b[11] * this[5] - b[1] * this[6] - b[13] * this[7] - b[2] * this[8] - b[14] * this[9] - b[4] * this[10] - b[5] * this[11] - b[15] * this[12] - b[7] * this[13] - b[9] * this[14] + b[12] * this[15]
            target[4] = b[4] * this[0] + b[7] * this[1] + b[9] * this[2] + b[10] * this[3] + b[0] * this[4] - b[12] * this[5] - b[13] * this[6] - b[1] * this[7] - b[14] * this[8] - b[2] * this[9] - b[3] * this[10] - b[15] * this[11] - b[5] * this[12] - b[6] * this[13] - b[8] * this[14] + b[11] * this[15]
            target[5] = b[5] * this[0] + b[11] * this[3] - b[12] * this[4] + b[0] * this[5] + b[15] * this[10] + b[3] * this[11] - b[4] * this[12] + b[10] * this[15]
            target[6] = b[6] * this[0] - b[11] * this[2] - b[13] * this[4] + b[0] * this[6] - b[15] * this[9] - b[2] * this[11] - b[4] * this[13] - b[9] * this[15]
            target[7] = b[7] * this[0] - b[12] * this[2] - b[13] * this[3] + b[0] * this[7] - b[15] * this[8] - b[2] * this[12] - b[3] * this[13] - b[8] * this[15]
            target[8] = b[8] * this[0] + b[11] * this[1] - b[14] * this[4] + b[15] * this[7] + b[0] * this[8] + b[1] * this[11] - b[4] * this[14] + b[7] * this[15]
            target[9] = b[9] * this[0] + b[12] * this[1] - b[14] * this[3] + b[15] * this[6] + b[0] * this[9] + b[1] * this[12] - b[3] * this[14] + b[6] * this[15]
            target[10] = b[10] * this[0] + b[13] * this[1] + b[14] * this[2] - b[15] * this[5] + b[0] * this[10] + b[1] * this[13] + b[2] * this[14] - b[5] * this[15]
            target[11] = b[11] * this[0] + b[15] * this[4] + b[0] * this[11] - b[4] * this[15]
            target[12] = b[12] * this[0] + b[15] * this[3] + b[0] * this[12] - b[3] * this[15]
            target[13] = b[13] * this[0] - b[15] * this[2] + b[0] * this[13] + b[2] * this[15]
            target[14] = b[14] * this[0] + b[15] * this[1] + b[0] * this[14] - b[1] * this[15]
            target[15] = b[15] * this[0] + b[0] * this[15]
            return target
        }
    }
    window.Mv31 = Mv31
    Mv31.indexGrades = [
        0,
        1, 1, 1, 1,
        2, 2, 2, 2, 2, 2,
        3, 3, 3, 3,
        4
    ]
    Mv31.basisNames = ["", "1", "2", "p", "m", "12", "1p", "1m", "2p", "2m", "pm", "12p", "12m", "1pm", "2pm", "12pm"]

    mv0 = new Mv31(); mv1 = new Mv31(); mv2 = new Mv31(); mv3 = new Mv31(); mv4 = new Mv31(); mv5 = new Mv31(); mv6 = new Mv31(); mv7 = new Mv31(); mv8 = new Mv31(); mv9 = new Mv31(); mv10 = new Mv31(); mv11 = new Mv31(); mv12 = new Mv31(); mv13 = new Mv31(); mv14 = new Mv31(); mv15 = new Mv31()
    
    _one = new Mv31().fromFloatAndIndex(1., 0)

    _e1 = new Mv31().fromFloatAndIndex(1., 1)
    _e2 = new Mv31().fromFloatAndIndex(1., 2)
    _ep = new Mv31().fromFloatAndIndex(1., 3)
    _em = new Mv31().fromFloatAndIndex(1., 4)
    _e0 = _ep.add(_em, new Mv31())
    _eo = _ep.sub(_em, new Mv31())

    _e12 = _e1.wedge(_e2, new Mv31())
    _e1p = _e1.wedge(_ep, new Mv31())
    _e1m = _e1.wedge(_em, new Mv31())
    _e2p = _e2.wedge(_ep, new Mv31())
    _e2m = _e2.wedge(_em, new Mv31())
    _epm = _ep.wedge(_em, new Mv31())

    _e10 = _e1.wedge(_e0, new Mv31())
    _e20 = _e2.wedge(_e0, new Mv31())
    _e120 = _e1.wedge(_e20, new Mv31())
    
    _e1o = _e1.wedge(_eo, new Mv31())
    _e2o = _e2.wedge(_eo, new Mv31())

    //uhp pseudoscalar
    _e1pm = _e1p.wedge(_em, new Mv31())

    _e12pm = _e12.wedge(_epm, new Mv31())

    

}