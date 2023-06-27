function init41() {

    const basisNames = [
        ``,
        `1`, `2`, `3`, `Plus`, `Minus`,
        `12`, `13`, `1Plus`, `1Minus`, `23`, `2Plus`, `2Minus`, `3Plus`, `3Minus`, `PlusMinus`,  //line start is [6]
        `123`, `12Plus`, `12Minus`, `13Plus`, `13Minus`, `1PlusMinus`, `23Plus`, `23Minus`, `2PlusMinus`, `3PlusMinus`,  //lines starts at [16]
        `123Plus`, `123Minus`, `12PlusMinus`, `13PlusMinus`, `23PlusMinus`,
        `I`]

    const N_COEFS = 32

    class Mv extends GeneralVector {
        static get size() { return N_COEFS }

        constructor() {
            return super(N_COEFS)
        }

        sandwich(mvToBeSandwiched, target) {
            if (target === undefined)
                target = new Mv()

            this.reverse(localMv0)

            this.mul(mvToBeSandwiched, localMv1)
            localMv1.mul(localMv0, target)

            // let ks = mvToBeSandwiched.grade() * this.grade()
            // if (ks % 2 === 0)
            //     target.multiplyScalar(-1.)

            return target
        }

        fromPoint2D(x, y) {
            this.copy(e12)
            this.addScaled(xDir, x)
            this.addScaled(yDir, y)

            return this
        }

        toPoint2D(array, offset) {
            let w = this[5]
            let dotted = this.inner(eMinus, localMv0)
            array[offset + 0] = dotted[1] / w
            array[offset + 1] = dotted[2] / w
            array[offset + 2] = 0. //z
        }

        selectGrade(grade, target) {
            target.copy(this)
            for (let i = 0; i < 16; ++i) {
                if (indexGrades[i] !== grade)
                    target[i] = 0.
            }

            return target
        }

        // hasGrade(grade) {
        //     if (grade === 0)
        //         return this[0] !== 0.
        //     if (grade === 1)
        //         return (this[1] !== 0. || this[2] !== 0. || this[3] !== 0. || this[4] !== 0.)
        //     if (grade === 2)
        //         return (this[5] !== 0. || this[6] !== 0. || this[7] !== 0. || this[8] !== 0. || this[9] !== 0. || this[10] !== 0.)
        //     if (grade === 3)
        //         return (this[11] !== 0. || this[12] !== 0. || this[13] !== 0. || this[14] !== 0.)
        //     if (grade === 4)
        //         return this[15] !== 0.
        // }

        // grade() {
        //     for (let i = 0; i < 5; ++i) {
        //         if (this.hasGrade(i))
        //             return i
        //     }
        // }

        log(label, numDecimalPlaces) {
            if (numDecimalPlaces === undefined)
                numDecimalPlaces = 1

            let str = ""
            for (let i = 0; i < basisNames.length; ++i) {
                if (this[i] !== 0.) { // && this[i].toFixed() != 0) {
                    if (str !== "")
                        str += ", "

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

        bivector(a, b, c, d, e, f) {
            this.copy(zeroMv)
            this[5] = a; this[6] = b; this[7] = c;
            this[8] = d; this[9] = e; this[10] = f;
            return this
        }

        rotor(s, a, b, c, d, e, f, p) {
            this.copy(zeroMv)
            this[0] = s
            this[5] = a; this[6] = b; this[7] = c;
            this[8] = d; this[9] = e; this[10] = f;
            this[15] = p
            return this
        }
        normalize() {
            //only for rotors really
            var S = this[0] * this[0] + this[5] * this[5] + this[6] * this[6] - this[7] * this[7] + this[8] * this[8] - this[9] * this[9] - this[10] * this[10] - this[15] * this[15];
            var T = 2. * (this[0] * this[15] - this[5] * this[10] + this[6] * this[9] - this[7] * this[8]);
            var N = Math.sqrt(Math.sqrt(S * S + T * T) + S), N2 = N * N;
            var ND = Math.SQRT2 * N / (N2 * N2 + T * T);
            var C = N2 * ND, D = -T * ND;
            this.rotor(
                C * this[0] - D * this[15], C * this[5] + D * this[10], C * this[6] - D * this[9], C * this[7] - D * this[8],
                C * this[8] + D * this[7], C * this[9] + D * this[6], C * this[10] - D * this[5], C * this[15] + D * this[0]
            )

            return this
        }

        exp(target) {
            if (target === undefined)
                target = new Mv()

            if (!this.hasGrade(2))
                return target.copy(oneMv)

            let S = -this[5] * this[5] - this[6] * this[6] + this[7] * this[7] - this[8] * this[8] + this[9] * this[9] + this[10] * this[10]
            let T = 2. * (this[5] * this[10] - this[6] * this[9] + this[7] * this[8])
            // ||B*B||
            let norm = Math.sqrt(S * S + T * T)

            if (norm === 0.) {
                this.selectGrade(2, target)
                target[0] = 1.
                return target
            }

            // P_+ = xB + y*e1234*B
            let [x, y] = [0.5 * (1. + S / norm), -0.5 * T / norm];
            let [lp, lm] = [Math.sqrt(0.5 * S + 0.5 * norm), Math.sqrt(-0.5 * S + 0.5 * norm)]
            let [cp, sp] = [Math.cosh(lp), lp === 0. ? 1. : Math.sinh(lp) / lp]
            let [cm, sm] = [Math.cos(lm), lm === 0. ? 1. : Math.sin(lm) / lm]
            let [cmsp, cpsm] = [cm * sp, cp * sm]
            let [alpha, beta] = [(cmsp - cpsm) * x + cpsm, (cmsp - cpsm) * y]

            // Combine the two Euler's formulas together.
            target.rotor(
                cp * cm,
                (this[5] * alpha + this[10] * beta), (this[6] * alpha - this[9] * beta),
                (this[7] * alpha - this[8] * beta), (this[8] * alpha + this[7] * beta),
                (this[9] * alpha + this[6] * beta), (this[10] * alpha - this[5] * beta),
                sp * sm * T / 2.
            )

            return target
        }

        logarithm(target) {
            if (target === undefined)
                target = new Mv()

            if (this.hasGrade(0) && !this.hasGrade(2))
                return target.copy(zeroMv)

            // B*B = S + T*e1234
            let S = this[0] * this[0] - this[15] * this[15] - 1;
            let T = 2 * (this[0] * this[15])
            let norm = Math.sqrt(S * S + T * T)

            let [x, y] = [0.5 * (1 + S / norm), -0.5 * T / norm];
            // lp is always a boost, lm a rotation
            let [lp, lm] = [Math.sqrt(0.5 * S + 0.5 * norm), Math.sqrt(-0.5 * S + 0.5 * norm)]
            let theta2 = lm == 0 ? 0 : Math.atan2(lm, this[0]);
            let theta1 = Math.atanh(lp / this[0]);
            let [w1, w2] = [lp == 0 ? 0 : theta1 / lp, lm == 0 ? 0 : theta2 / lm]
            let [A, B] = [(w1 - w2) * x + w2, w1 == 0 ? Math.atanh(-this[15] / lm) / lm : (w1 - w2) * y];

            return target.line(
                this[5] * A + this[10] * B, this[6] * A - this[9] * B, this[7] * A - this[8] * B,
                this[8] * A + this[7] * B, this[9] * A + this[6] * B, this[10] * A - this[5] * B
            )
        }

        //aliasing allowed
        reverse(target) {
            if (target === undefined)
                target = new Mv()

            target[0] = mv[0];
            target[1] = mv[1];
            target[2] = mv[2];
            target[3] = mv[3];
            target[4] = mv[4];
            target[5] = mv[5];
            target[6] = -mv[6];
            target[7] = -mv[7];
            target[8] = -mv[8];
            target[9] = -mv[9];
            target[10] = -mv[10];
            target[11] = -mv[11];
            target[12] = -mv[12];
            target[13] = -mv[13];
            target[14] = -mv[14];
            target[15] = -mv[15];
            target[16] = -mv[16];
            target[17] = -mv[17];
            target[18] = -mv[18];
            target[19] = -mv[19];
            target[20] = -mv[20];
            target[21] = -mv[21];
            target[22] = -mv[22];
            target[23] = -mv[23];
            target[24] = -mv[24];
            target[25] = -mv[25];
            target[26] = mv[26];
            target[27] = mv[27];
            target[28] = mv[28];
            target[29] = mv[29];
            target[30] = mv[30];
            target[31] = mv[31];
            return target
        }

        meet(b, target) {
            if (target === undefined)
                target = new Mv()
            target[0] = b[0] * this[0];
            target[1] = b[1] * this[0] + b[0] * this[1];
            target[2] = b[2] * this[0] + b[0] * this[2];
            target[3] = b[3] * this[0] + b[0] * this[3];
            target[4] = b[4] * this[0] + b[0] * this[4];
            target[5] = b[5] * this[0] + b[0] * this[5];
            target[6] = b[6] * this[0] + b[2] * this[1] - b[1] * this[2] + b[0] * this[6];
            target[7] = b[7] * this[0] + b[3] * this[1] - b[1] * this[3] + b[0] * this[7];
            target[8] = b[8] * this[0] + b[4] * this[1] - b[1] * this[4] + b[0] * this[8];
            target[9] = b[9] * this[0] + b[5] * this[1] - b[1] * this[5] + b[0] * this[9];
            target[10] = b[10] * this[0] + b[3] * this[2] - b[2] * this[3] + b[0] * this[10];
            target[11] = b[11] * this[0] + b[4] * this[2] - b[2] * this[4] + b[0] * this[11];
            target[12] = b[12] * this[0] + b[5] * this[2] - b[2] * this[5] + b[0] * this[12];
            target[13] = b[13] * this[0] + b[4] * this[3] - b[3] * this[4] + b[0] * this[13];
            target[14] = b[14] * this[0] + b[5] * this[3] - b[3] * this[5] + b[0] * this[14];
            target[15] = b[15] * this[0] + b[5] * this[4] - b[4] * this[5] + b[0] * this[15];
            target[16] = b[16] * this[0] + b[10] * this[1] - b[7] * this[2] + b[6] * this[3] + b[3] * this[6] - b[2] * this[7] + b[1] * this[10] + b[0] * this[16];
            target[17] = b[17] * this[0] + b[11] * this[1] - b[8] * this[2] + b[6] * this[4] + b[4] * this[6] - b[2] * this[8] + b[1] * this[11] + b[0] * this[17];
            target[18] = b[18] * this[0] + b[12] * this[1] - b[9] * this[2] + b[6] * this[5] + b[5] * this[6] - b[2] * this[9] + b[1] * this[12] + b[0] * this[18];
            target[19] = b[19] * this[0] + b[13] * this[1] - b[8] * this[3] + b[7] * this[4] + b[4] * this[7] - b[3] * this[8] + b[1] * this[13] + b[0] * this[19];
            target[20] = b[20] * this[0] + b[14] * this[1] - b[9] * this[3] + b[7] * this[5] + b[5] * this[7] - b[3] * this[9] + b[1] * this[14] + b[0] * this[20];
            target[21] = b[21] * this[0] + b[15] * this[1] - b[9] * this[4] + b[8] * this[5] + b[5] * this[8] - b[4] * this[9] + b[1] * this[15] + b[0] * this[21];
            target[22] = b[22] * this[0] + b[13] * this[2] - b[11] * this[3] + b[10] * this[4] + b[4] * this[10] - b[3] * this[11] + b[2] * this[13] + b[0] * this[22];
            target[23] = b[23] * this[0] + b[14] * this[2] - b[12] * this[3] + b[10] * this[5] + b[5] * this[10] - b[3] * this[12] + b[2] * this[14] + b[0] * this[23];
            target[24] = b[24] * this[0] + b[15] * this[2] - b[12] * this[4] + b[11] * this[5] + b[5] * this[11] - b[4] * this[12] + b[2] * this[15] + b[0] * this[24];
            target[25] = b[25] * this[0] + b[15] * this[3] - b[14] * this[4] + b[13] * this[5] + b[5] * this[13] - b[4] * this[14] + b[3] * this[15] + b[0] * this[25];
            target[26] = b[26] * this[0] + b[22] * this[1] - b[19] * this[2] + b[17] * this[3] - b[16] * this[4] + b[13] * this[6] - b[11] * this[7] + b[10] * this[8] + b[8] * this[10] - b[7] * this[11] + b[6] * this[13] + b[4] * this[16] - b[3] * this[17] + b[2] * this[19] - b[1] * this[22] + b[0] * this[26];
            target[27] = b[27] * this[0] + b[23] * this[1] - b[20] * this[2] + b[18] * this[3] - b[16] * this[5] + b[14] * this[6] - b[12] * this[7] + b[10] * this[9] + b[9] * this[10] - b[7] * this[12] + b[6] * this[14] + b[5] * this[16] - b[3] * this[18] + b[2] * this[20] - b[1] * this[23] + b[0] * this[27];
            target[28] = b[28] * this[0] + b[24] * this[1] - b[21] * this[2] + b[18] * this[4] - b[17] * this[5] + b[15] * this[6] - b[12] * this[8] + b[11] * this[9] + b[9] * this[11] - b[8] * this[12] + b[6] * this[15] + b[5] * this[17] - b[4] * this[18] + b[2] * this[21] - b[1] * this[24] + b[0] * this[28];
            target[29] = b[29] * this[0] + b[25] * this[1] - b[21] * this[3] + b[20] * this[4] - b[19] * this[5] + b[15] * this[7] - b[14] * this[8] + b[13] * this[9] + b[9] * this[13] - b[8] * this[14] + b[7] * this[15] + b[5] * this[19] - b[4] * this[20] + b[3] * this[21] - b[1] * this[25] + b[0] * this[29];
            target[30] = b[30] * this[0] + b[25] * this[2] - b[24] * this[3] + b[23] * this[4] - b[22] * this[5] + b[15] * this[10] - b[14] * this[11] + b[13] * this[12] + b[12] * this[13] - b[11] * this[14] + b[10] * this[15] + b[5] * this[22] - b[4] * this[23] + b[3] * this[24] - b[2] * this[25] + b[0] * this[30];
            target[31] = b[31] * this[0] + b[30] * this[1] - b[29] * this[2] + b[28] * this[3] - b[27] * this[4] + b[26] * this[5] + b[25] * this[6] - b[24] * this[7] + b[23] * this[8] - b[22] * this[9] + b[21] * this[10] - b[20] * this[11] + b[19] * this[12] + b[18] * this[13] - b[17] * this[14] + b[16] * this[15] + b[15] * this[16] - b[14] * this[17] + b[13] * this[18] + b[12] * this[19] - b[11] * this[20] + b[10] * this[21] - b[9] * this[22] + b[8] * this[23] - b[7] * this[24] + b[6] * this[25] + b[5] * this[26] - b[4] * this[27] + b[3] * this[28] - b[2] * this[29] + b[1] * this[30] + b[0] * this[31];
            return target;
        }

        join(b, target) {
            if (target === undefined)
                target = new Mv()
            target[15] = 1. * (this[15] * b[15]);
            target[14] = -1. * (this[14] * -1. * b[15] + this[15] * b[14] * -1);
            target[13] = 1. * (this[13] * b[15] + this[15] * b[13]);
            target[12] = -1. * (this[12] * -1. * b[15] + this[15] * b[12] * -1);
            target[11] = 1. * (this[11] * b[15] + this[15] * b[11]);
            target[10] = 1. * (this[10] * b[15] + this[13] * b[14] * -1 - this[14] * -1. * b[13] + this[15] * b[10]);
            target[9] = -1. * (this[9] * -1. * b[15] + this[12] * -1. * b[14] * -1 - this[14] * -1. * b[12] * -1 + this[15] * b[9] * -1);
            target[8] = 1. * (this[8] * b[15] + this[11] * b[14] * -1 - this[14] * -1. * b[11] + this[15] * b[8]);
            target[7] = 1. * (this[7] * b[15] + this[12] * -1. * b[13] - this[13] * b[12] * -1 + this[15] * b[7]);
            target[6] = -1. * (this[6] * -1. * b[15] + this[11] * b[13] - this[13] * b[11] + this[15] * b[6] * -1);
            target[5] = 1. * (this[5] * b[15] + this[11] * b[12] * -1 - this[12] * -1. * b[11] + this[15] * b[5]);
            target[4] = -1. * (this[4] * -1. * b[15] + this[7] * b[14] * -1 - this[9] * -1. * b[13] + this[10] * b[12] * -1 + this[12] * -1. * b[10] - this[13] * b[9] * -1 + this[14] * -1. * b[7] + this[15] * b[4] * -1);
            target[3] = 1. * (this[3] * b[15] + this[6] * -1. * b[14] * -1 - this[8] * b[13] + this[10] * b[11] + this[11] * b[10] - this[13] * b[8] + this[14] * -1. * b[6] * -1 + this[15] * b[3]);
            target[2] = -1. * (this[2] * -1. * b[15] + this[5] * b[14] * -1 - this[8] * b[12] * -1 + this[9] * -1. * b[11] + this[11] * b[9] * -1 - this[12] * -1. * b[8] + this[14] * -1. * b[5] + this[15] * b[2] * -1);
            target[1] = 1. * (this[1] * b[15] + this[5] * b[13] - this[6] * -1. * b[12] * -1 + this[7] * b[11] + this[11] * b[7] - this[12] * -1. * b[6] * -1 + this[13] * b[5] + this[15] * b[1]);
            target[0] = 1. * (this[0] * b[15] + this[1] * b[14] * -1 - this[2] * -1. * b[13] + this[3] * b[12] * -1 - this[4] * -1. * b[11] + this[5] * b[10] - this[6] * -1. * b[9] * -1 + this[7] * b[8] + this[8] * b[7] - this[9] * -1. * b[6] * -1 + this[10] * b[5] + this[11] * b[4] * -1 - this[12] * -1. * b[3] + this[13] * b[2] * -1 - this[14] * -1. * b[1] + this[15] * b[0]);
            return target;
        }

        inner(b, target) {
            if (target === undefined)
                target = new Mv()
            target[0] = b[0] * this[0] + b[1] * this[1] + b[2] * this[2] + b[3] * this[3] + b[4] * this[4] - b[5] * this[5] - b[6] * this[6] - b[7] * this[7] - b[8] * this[8] + b[9] * this[9] - b[10] * this[10] - b[11] * this[11] + b[12] * this[12] - b[13] * this[13] + b[14] * this[14] + b[15] * this[15] - b[16] * this[16] - b[17] * this[17] + b[18] * this[18] - b[19] * this[19] + b[20] * this[20] + b[21] * this[21] - b[22] * this[22] + b[23] * this[23] + b[24] * this[24] + b[25] * this[25] + b[26] * this[26] - b[27] * this[27] - b[28] * this[28] - b[29] * this[29] - b[30] * this[30] - b[31] * this[31];
            target[1] = b[1] * this[0] + b[0] * this[1] - b[6] * this[2] - b[7] * this[3] - b[8] * this[4] + b[9] * this[5] + b[2] * this[6] + b[3] * this[7] + b[4] * this[8] - b[5] * this[9] - b[16] * this[10] - b[17] * this[11] + b[18] * this[12] - b[19] * this[13] + b[20] * this[14] + b[21] * this[15] - b[10] * this[16] - b[11] * this[17] + b[12] * this[18] - b[13] * this[19] + b[14] * this[20] + b[15] * this[21] + b[26] * this[22] - b[27] * this[23] - b[28] * this[24] - b[29] * this[25] - b[22] * this[26] + b[23] * this[27] + b[24] * this[28] + b[25] * this[29] - b[31] * this[30] - b[30] * this[31];
            target[2] = b[2] * this[0] + b[6] * this[1] + b[0] * this[2] - b[10] * this[3] - b[11] * this[4] + b[12] * this[5] - b[1] * this[6] + b[16] * this[7] + b[17] * this[8] - b[18] * this[9] + b[3] * this[10] + b[4] * this[11] - b[5] * this[12] - b[22] * this[13] + b[23] * this[14] + b[24] * this[15] + b[7] * this[16] + b[8] * this[17] - b[9] * this[18] - b[26] * this[19] + b[27] * this[20] + b[28] * this[21] - b[13] * this[22] + b[14] * this[23] + b[15] * this[24] - b[30] * this[25] + b[19] * this[26] - b[20] * this[27] - b[21] * this[28] + b[31] * this[29] + b[25] * this[30] + b[29] * this[31];
            target[3] = b[3] * this[0] + b[7] * this[1] + b[10] * this[2] + b[0] * this[3] - b[13] * this[4] + b[14] * this[5] - b[16] * this[6] - b[1] * this[7] + b[19] * this[8] - b[20] * this[9] - b[2] * this[10] + b[22] * this[11] - b[23] * this[12] + b[4] * this[13] - b[5] * this[14] + b[25] * this[15] - b[6] * this[16] + b[26] * this[17] - b[27] * this[18] + b[8] * this[19] - b[9] * this[20] + b[29] * this[21] + b[11] * this[22] - b[12] * this[23] + b[30] * this[24] + b[15] * this[25] - b[17] * this[26] + b[18] * this[27] - b[31] * this[28] - b[21] * this[29] - b[24] * this[30] - b[28] * this[31];
            target[4] = b[4] * this[0] + b[8] * this[1] + b[11] * this[2] + b[13] * this[3] + b[0] * this[4] + b[15] * this[5] - b[17] * this[6] - b[19] * this[7] - b[1] * this[8] - b[21] * this[9] - b[22] * this[10] - b[2] * this[11] - b[24] * this[12] - b[3] * this[13] - b[25] * this[14] - b[5] * this[15] - b[26] * this[16] - b[6] * this[17] - b[28] * this[18] - b[7] * this[19] - b[29] * this[20] - b[9] * this[21] - b[10] * this[22] - b[30] * this[23] - b[12] * this[24] - b[14] * this[25] + b[16] * this[26] + b[31] * this[27] + b[18] * this[28] + b[20] * this[29] + b[23] * this[30] + b[27] * this[31];
            target[5] = b[5] * this[0] + b[9] * this[1] + b[12] * this[2] + b[14] * this[3] + b[15] * this[4] + b[0] * this[5] - b[18] * this[6] - b[20] * this[7] - b[21] * this[8] - b[1] * this[9] - b[23] * this[10] - b[24] * this[11] - b[2] * this[12] - b[25] * this[13] - b[3] * this[14] - b[4] * this[15] - b[27] * this[16] - b[28] * this[17] - b[6] * this[18] - b[29] * this[19] - b[7] * this[20] - b[8] * this[21] - b[30] * this[22] - b[10] * this[23] - b[11] * this[24] - b[13] * this[25] + b[31] * this[26] + b[16] * this[27] + b[17] * this[28] + b[19] * this[29] + b[22] * this[30] + b[26] * this[31];
            target[6] = b[6] * this[0] + b[16] * this[3] + b[17] * this[4] - b[18] * this[5] + b[0] * this[6] - b[26] * this[13] + b[27] * this[14] + b[28] * this[15] + b[3] * this[16] + b[4] * this[17] - b[5] * this[18] + b[31] * this[25] - b[13] * this[26] + b[14] * this[27] + b[15] * this[28] + b[25] * this[31];
            target[7] = b[7] * this[0] - b[16] * this[2] + b[19] * this[4] - b[20] * this[5] + b[0] * this[7] + b[26] * this[11] - b[27] * this[12] + b[29] * this[15] - b[2] * this[16] + b[4] * this[19] - b[5] * this[20] - b[31] * this[24] + b[11] * this[26] - b[12] * this[27] + b[15] * this[29] - b[24] * this[31];
            target[8] = b[8] * this[0] - b[17] * this[2] - b[19] * this[3] - b[21] * this[5] + b[0] * this[8] - b[26] * this[10] - b[28] * this[12] - b[29] * this[14] - b[2] * this[17] - b[3] * this[19] - b[5] * this[21] + b[31] * this[23] - b[10] * this[26] - b[12] * this[28] - b[14] * this[29] + b[23] * this[31];
            target[9] = b[9] * this[0] - b[18] * this[2] - b[20] * this[3] - b[21] * this[4] + b[0] * this[9] - b[27] * this[10] - b[28] * this[11] - b[29] * this[13] - b[2] * this[18] - b[3] * this[20] - b[4] * this[21] + b[31] * this[22] - b[10] * this[27] - b[11] * this[28] - b[13] * this[29] + b[22] * this[31];
            target[10] = b[10] * this[0] + b[16] * this[1] + b[22] * this[4] - b[23] * this[5] - b[26] * this[8] + b[27] * this[9] + b[0] * this[10] + b[30] * this[15] + b[1] * this[16] + b[31] * this[21] + b[4] * this[22] - b[5] * this[23] - b[8] * this[26] + b[9] * this[27] + b[15] * this[30] + b[21] * this[31];
            target[11] = b[11] * this[0] + b[17] * this[1] - b[22] * this[3] - b[24] * this[5] + b[26] * this[7] + b[28] * this[9] + b[0] * this[11] - b[30] * this[14] + b[1] * this[17] - b[31] * this[20] - b[3] * this[22] - b[5] * this[24] + b[7] * this[26] + b[9] * this[28] - b[14] * this[30] - b[20] * this[31];
            target[12] = b[12] * this[0] + b[18] * this[1] - b[23] * this[3] - b[24] * this[4] + b[27] * this[7] + b[28] * this[8] + b[0] * this[12] - b[30] * this[13] + b[1] * this[18] - b[31] * this[19] - b[3] * this[23] - b[4] * this[24] + b[7] * this[27] + b[8] * this[28] - b[13] * this[30] - b[19] * this[31];
            target[13] = b[13] * this[0] + b[19] * this[1] + b[22] * this[2] - b[25] * this[5] - b[26] * this[6] + b[29] * this[9] + b[30] * this[12] + b[0] * this[13] + b[31] * this[18] + b[1] * this[19] + b[2] * this[22] - b[5] * this[25] - b[6] * this[26] + b[9] * this[29] + b[12] * this[30] + b[18] * this[31];
            target[14] = b[14] * this[0] + b[20] * this[1] + b[23] * this[2] - b[25] * this[4] - b[27] * this[6] + b[29] * this[8] + b[30] * this[11] + b[0] * this[14] + b[31] * this[17] + b[1] * this[20] + b[2] * this[23] - b[4] * this[25] - b[6] * this[27] + b[8] * this[29] + b[11] * this[30] + b[17] * this[31];
            target[15] = b[15] * this[0] + b[21] * this[1] + b[24] * this[2] + b[25] * this[3] - b[28] * this[6] - b[29] * this[7] - b[30] * this[10] + b[0] * this[15] - b[31] * this[16] + b[1] * this[21] + b[2] * this[24] + b[3] * this[25] - b[6] * this[28] - b[7] * this[29] - b[10] * this[30] - b[16] * this[31];
            target[16] = b[16] * this[0] - b[26] * this[4] + b[27] * this[5] + b[31] * this[15] + b[0] * this[16] + b[4] * this[26] - b[5] * this[27] + b[15] * this[31];
            target[17] = b[17] * this[0] + b[26] * this[3] + b[28] * this[5] - b[31] * this[14] + b[0] * this[17] - b[3] * this[26] - b[5] * this[28] - b[14] * this[31];
            target[18] = b[18] * this[0] + b[27] * this[3] + b[28] * this[4] - b[31] * this[13] + b[0] * this[18] - b[3] * this[27] - b[4] * this[28] - b[13] * this[31];
            target[19] = b[19] * this[0] - b[26] * this[2] + b[29] * this[5] + b[31] * this[12] + b[0] * this[19] + b[2] * this[26] - b[5] * this[29] + b[12] * this[31];
            target[20] = b[20] * this[0] - b[27] * this[2] + b[29] * this[4] + b[31] * this[11] + b[0] * this[20] + b[2] * this[27] - b[4] * this[29] + b[11] * this[31];
            target[21] = b[21] * this[0] - b[28] * this[2] - b[29] * this[3] - b[31] * this[10] + b[0] * this[21] + b[2] * this[28] + b[3] * this[29] - b[10] * this[31];
            target[22] = b[22] * this[0] + b[26] * this[1] + b[30] * this[5] - b[31] * this[9] + b[0] * this[22] - b[1] * this[26] - b[5] * this[30] - b[9] * this[31];
            target[23] = b[23] * this[0] + b[27] * this[1] + b[30] * this[4] - b[31] * this[8] + b[0] * this[23] - b[1] * this[27] - b[4] * this[30] - b[8] * this[31];
            target[24] = b[24] * this[0] + b[28] * this[1] - b[30] * this[3] + b[31] * this[7] + b[0] * this[24] - b[1] * this[28] + b[3] * this[30] + b[7] * this[31];
            target[25] = b[25] * this[0] + b[29] * this[1] + b[30] * this[2] - b[31] * this[6] + b[0] * this[25] - b[1] * this[29] - b[2] * this[30] - b[6] * this[31];
            target[26] = b[26] * this[0] - b[31] * this[5] + b[0] * this[26] - b[5] * this[31];
            target[27] = b[27] * this[0] - b[31] * this[4] + b[0] * this[27] - b[4] * this[31];
            target[28] = b[28] * this[0] + b[31] * this[3] + b[0] * this[28] + b[3] * this[31];
            target[29] = b[29] * this[0] - b[31] * this[2] + b[0] * this[29] - b[2] * this[31];
            target[30] = b[30] * this[0] + b[31] * this[1] + b[0] * this[30] + b[1] * this[31];
            target[31] = b[31] * a[0] + b[0] * a[31];
            return target;
        }

        dual(target) {
            if (target === undefined)
                target = new Mv()

            target[0] = -mv[31];
            target[1] = -mv[30];
            target[2] = mv[29];
            target[3] = -mv[28];
            target[4] = mv[27];
            target[5] = mv[26];
            target[6] = mv[25];
            target[7] = -mv[24];
            target[8] = mv[23];
            target[9] = mv[22];
            target[10] = mv[21];
            target[11] = -mv[20];
            target[12] = -mv[19];
            target[13] = mv[18];
            target[14] = mv[17];
            target[15] = -mv[16];
            target[16] = mv[15];
            target[17] = -mv[14];
            target[18] = -mv[13];
            target[19] = mv[12];
            target[20] = mv[11];
            target[21] = -mv[10];
            target[22] = -mv[9];
            target[23] = -mv[8];
            target[24] = mv[7];
            target[25] = -mv[6];
            target[26] = -mv[5];
            target[27] = -mv[4];
            target[28] = mv[3];
            target[29] = -mv[2];
            target[30] = mv[1];
            target[31] = mv[0];
            return target;
        }

        mul(b, target) {
            if (target === undefined)
                target = new Mv()
            
            target[ 0] = b[ 0] * this[ 0] + b[ 1] * this[ 1] + b[ 2] * this[ 2] + b[ 3] * this[ 3] + b[ 4] * this[ 4] - b[ 5] * this[ 5] - b[ 6] * this[ 6] - b[ 7] * this[ 7] - b[ 8] * this[ 8] + b[ 9] * this[ 9] - b[10] * this[10] - b[11] * this[11] + b[12] * this[12] - b[13] * this[13] + b[14] * this[14] + b[15] * this[15] - b[16] * this[16] - b[17] * this[17] + b[18] * this[18] - b[19] * this[19] + b[20] * this[20] + b[21] * this[21] - b[22] * this[22] + b[23] * this[23] + b[24] * this[24] + b[25] * this[25] + b[26] * this[26] - b[27] * this[27] - b[28] * this[28] - b[29] * this[29] - b[30] * this[30] - b[31] * this[31];
            target[ 1] = b[ 1] * this[ 0] + b[ 0] * this[ 1] - b[ 6] * this[ 2] - b[ 7] * this[ 3] - b[ 8] * this[ 4] + b[ 9] * this[ 5] + b[ 2] * this[ 6] + b[ 3] * this[ 7] + b[ 4] * this[ 8] - b[ 5] * this[ 9] - b[16] * this[10] - b[17] * this[11] + b[18] * this[12] - b[19] * this[13] + b[20] * this[14] + b[21] * this[15] - b[10] * this[16] - b[11] * this[17] + b[12] * this[18] - b[13] * this[19] + b[14] * this[20] + b[15] * this[21] + b[26] * this[22] - b[27] * this[23] - b[28] * this[24] - b[29] * this[25] - b[22] * this[26] + b[23] * this[27] + b[24] * this[28] + b[25] * this[29] - b[31] * this[30] - b[30] * this[31];
            target[ 2] = b[ 2] * this[ 0] + b[ 6] * this[ 1] + b[ 0] * this[ 2] - b[10] * this[ 3] - b[11] * this[ 4] + b[12] * this[ 5] - b[ 1] * this[ 6] + b[16] * this[ 7] + b[17] * this[ 8] - b[18] * this[ 9] + b[ 3] * this[10] + b[ 4] * this[11] - b[ 5] * this[12] - b[22] * this[13] + b[23] * this[14] + b[24] * this[15] + b[ 7] * this[16] + b[ 8] * this[17] - b[ 9] * this[18] - b[26] * this[19] + b[27] * this[20] + b[28] * this[21] - b[13] * this[22] + b[14] * this[23] + b[15] * this[24] - b[30] * this[25] + b[19] * this[26] - b[20] * this[27] - b[21] * this[28] + b[31] * this[29] + b[25] * this[30] + b[29] * this[31];
            target[ 3] = b[ 3] * this[ 0] + b[ 7] * this[ 1] + b[10] * this[ 2] + b[ 0] * this[ 3] - b[13] * this[ 4] + b[14] * this[ 5] - b[16] * this[ 6] - b[ 1] * this[ 7] + b[19] * this[ 8] - b[20] * this[ 9] - b[ 2] * this[10] + b[22] * this[11] - b[23] * this[12] + b[ 4] * this[13] - b[ 5] * this[14] + b[25] * this[15] - b[ 6] * this[16] + b[26] * this[17] - b[27] * this[18] + b[ 8] * this[19] - b[ 9] * this[20] + b[29] * this[21] + b[11] * this[22] - b[12] * this[23] + b[30] * this[24] + b[15] * this[25] - b[17] * this[26] + b[18] * this[27] - b[31] * this[28] - b[21] * this[29] - b[24] * this[30] - b[28] * this[31];
            target[ 4] = b[ 4] * this[ 0] + b[ 8] * this[ 1] + b[11] * this[ 2] + b[13] * this[ 3] + b[ 0] * this[ 4] + b[15] * this[ 5] - b[17] * this[ 6] - b[19] * this[ 7] - b[ 1] * this[ 8] - b[21] * this[ 9] - b[22] * this[10] - b[ 2] * this[11] - b[24] * this[12] - b[ 3] * this[13] - b[25] * this[14] - b[ 5] * this[15] - b[26] * this[16] - b[ 6] * this[17] - b[28] * this[18] - b[ 7] * this[19] - b[29] * this[20] - b[ 9] * this[21] - b[10] * this[22] - b[30] * this[23] - b[12] * this[24] - b[14] * this[25] + b[16] * this[26] + b[31] * this[27] + b[18] * this[28] + b[20] * this[29] + b[23] * this[30] + b[27] * this[31];
            target[ 5] = b[ 5] * this[ 0] + b[ 9] * this[ 1] + b[12] * this[ 2] + b[14] * this[ 3] + b[15] * this[ 4] + b[ 0] * this[ 5] - b[18] * this[ 6] - b[20] * this[ 7] - b[21] * this[ 8] - b[ 1] * this[ 9] - b[23] * this[10] - b[24] * this[11] - b[ 2] * this[12] - b[25] * this[13] - b[ 3] * this[14] - b[ 4] * this[15] - b[27] * this[16] - b[28] * this[17] - b[ 6] * this[18] - b[29] * this[19] - b[ 7] * this[20] - b[ 8] * this[21] - b[30] * this[22] - b[10] * this[23] - b[11] * this[24] - b[13] * this[25] + b[31] * this[26] + b[16] * this[27] + b[17] * this[28] + b[19] * this[29] + b[22] * this[30] + b[26] * this[31];
            target[ 6] = b[ 6] * this[ 0] + b[ 2] * this[ 1] - b[ 1] * this[ 2] + b[16] * this[ 3] + b[17] * this[ 4] - b[18] * this[ 5] + b[ 0] * this[ 6] - b[10] * this[ 7] - b[11] * this[ 8] + b[12] * this[ 9] + b[ 7] * this[10] + b[ 8] * this[11] - b[ 9] * this[12] - b[26] * this[13] + b[27] * this[14] + b[28] * this[15] + b[ 3] * this[16] + b[ 4] * this[17] - b[ 5] * this[18] - b[22] * this[19] + b[23] * this[20] + b[24] * this[21] + b[19] * this[22] - b[20] * this[23] - b[21] * this[24] + b[31] * this[25] - b[13] * this[26] + b[14] * this[27] + b[15] * this[28] - b[30] * this[29] + b[29] * this[30] + b[25] * this[31];
            target[ 7] = b[ 7] * this[ 0] + b[ 3] * this[ 1] - b[16] * this[ 2] - b[ 1] * this[ 3] + b[19] * this[ 4] - b[20] * this[ 5] + b[10] * this[ 6] + b[ 0] * this[ 7] - b[13] * this[ 8] + b[14] * this[ 9] - b[ 6] * this[10] + b[26] * this[11] - b[27] * this[12] + b[ 8] * this[13] - b[ 9] * this[14] + b[29] * this[15] - b[ 2] * this[16] + b[22] * this[17] - b[23] * this[18] + b[ 4] * this[19] - b[ 5] * this[20] + b[25] * this[21] - b[17] * this[22] + b[18] * this[23] - b[31] * this[24] - b[21] * this[25] + b[11] * this[26] - b[12] * this[27] + b[30] * this[28] + b[15] * this[29] - b[28] * this[30] - b[24] * this[31];
            target[ 8] = b[ 8] * this[ 0] + b[ 4] * this[ 1] - b[17] * this[ 2] - b[19] * this[ 3] - b[ 1] * this[ 4] - b[21] * this[ 5] + b[11] * this[ 6] + b[13] * this[ 7] + b[ 0] * this[ 8] + b[15] * this[ 9] - b[26] * this[10] - b[ 6] * this[11] - b[28] * this[12] - b[ 7] * this[13] - b[29] * this[14] - b[ 9] * this[15] - b[22] * this[16] - b[ 2] * this[17] - b[24] * this[18] - b[ 3] * this[19] - b[25] * this[20] - b[ 5] * this[21] + b[16] * this[22] + b[31] * this[23] + b[18] * this[24] + b[20] * this[25] - b[10] * this[26] - b[30] * this[27] - b[12] * this[28] - b[14] * this[29] + b[27] * this[30] + b[23] * this[31];
            target[ 9] = b[ 9] * this[ 0] + b[ 5] * this[ 1] - b[18] * this[ 2] - b[20] * this[ 3] - b[21] * this[ 4] - b[ 1] * this[ 5] + b[12] * this[ 6] + b[14] * this[ 7] + b[15] * this[ 8] + b[ 0] * this[ 9] - b[27] * this[10] - b[28] * this[11] - b[ 6] * this[12] - b[29] * this[13] - b[ 7] * this[14] - b[ 8] * this[15] - b[23] * this[16] - b[24] * this[17] - b[ 2] * this[18] - b[25] * this[19] - b[ 3] * this[20] - b[ 4] * this[21] + b[31] * this[22] + b[16] * this[23] + b[17] * this[24] + b[19] * this[25] - b[30] * this[26] - b[10] * this[27] - b[11] * this[28] - b[13] * this[29] + b[26] * this[30] + b[22] * this[31];
            target[10] = b[10] * this[ 0] + b[16] * this[ 1] + b[ 3] * this[ 2] - b[ 2] * this[ 3] + b[22] * this[ 4] - b[23] * this[ 5] - b[ 7] * this[ 6] + b[ 6] * this[ 7] - b[26] * this[ 8] + b[27] * this[ 9] + b[ 0] * this[10] - b[13] * this[11] + b[14] * this[12] + b[11] * this[13] - b[12] * this[14] + b[30] * this[15] + b[ 1] * this[16] - b[19] * this[17] + b[20] * this[18] + b[17] * this[19] - b[18] * this[20] + b[31] * this[21] + b[ 4] * this[22] - b[ 5] * this[23] + b[25] * this[24] - b[24] * this[25] - b[ 8] * this[26] + b[ 9] * this[27] - b[29] * this[28] + b[28] * this[29] + b[15] * this[30] + b[21] * this[31];
            target[11] = b[11] * this[ 0] + b[17] * this[ 1] + b[ 4] * this[ 2] - b[22] * this[ 3] - b[ 2] * this[ 4] - b[24] * this[ 5] - b[ 8] * this[ 6] + b[26] * this[ 7] + b[ 6] * this[ 8] + b[28] * this[ 9] + b[13] * this[10] + b[ 0] * this[11] + b[15] * this[12] - b[10] * this[13] - b[30] * this[14] - b[12] * this[15] + b[19] * this[16] + b[ 1] * this[17] + b[21] * this[18] - b[16] * this[19] - b[31] * this[20] - b[18] * this[21] - b[ 3] * this[22] - b[25] * this[23] - b[ 5] * this[24] + b[23] * this[25] + b[ 7] * this[26] + b[29] * this[27] + b[ 9] * this[28] - b[27] * this[29] - b[14] * this[30] - b[20] * this[31];
            target[12] = b[12] * this[ 0] + b[18] * this[ 1] + b[ 5] * this[ 2] - b[23] * this[ 3] - b[24] * this[ 4] - b[ 2] * this[ 5] - b[ 9] * this[ 6] + b[27] * this[ 7] + b[28] * this[ 8] + b[ 6] * this[ 9] + b[14] * this[10] + b[15] * this[11] + b[ 0] * this[12] - b[30] * this[13] - b[10] * this[14] - b[11] * this[15] + b[20] * this[16] + b[21] * this[17] + b[ 1] * this[18] - b[31] * this[19] - b[16] * this[20] - b[17] * this[21] - b[25] * this[22] - b[ 3] * this[23] - b[ 4] * this[24] + b[22] * this[25] + b[29] * this[26] + b[ 7] * this[27] + b[ 8] * this[28] - b[26] * this[29] - b[13] * this[30] - b[19] * this[31];
            target[13] = b[13] * this[ 0] + b[19] * this[ 1] + b[22] * this[ 2] + b[ 4] * this[ 3] - b[ 3] * this[ 4] - b[25] * this[ 5] - b[26] * this[ 6] - b[ 8] * this[ 7] + b[ 7] * this[ 8] + b[29] * this[ 9] - b[11] * this[10] + b[10] * this[11] + b[30] * this[12] + b[ 0] * this[13] + b[15] * this[14] - b[14] * this[15] - b[17] * this[16] + b[16] * this[17] + b[31] * this[18] + b[ 1] * this[19] + b[21] * this[20] - b[20] * this[21] + b[ 2] * this[22] + b[24] * this[23] - b[23] * this[24] - b[ 5] * this[25] - b[ 6] * this[26] - b[28] * this[27] + b[27] * this[28] + b[ 9] * this[29] + b[12] * this[30] + b[18] * this[31];
            target[14] = b[14] * this[ 0] + b[20] * this[ 1] + b[23] * this[ 2] + b[ 5] * this[ 3] - b[25] * this[ 4] - b[ 3] * this[ 5] - b[27] * this[ 6] - b[ 9] * this[ 7] + b[29] * this[ 8] + b[ 7] * this[ 9] - b[12] * this[10] + b[30] * this[11] + b[10] * this[12] + b[15] * this[13] + b[ 0] * this[14] - b[13] * this[15] - b[18] * this[16] + b[31] * this[17] + b[16] * this[18] + b[21] * this[19] + b[ 1] * this[20] - b[19] * this[21] + b[24] * this[22] + b[ 2] * this[23] - b[22] * this[24] - b[ 4] * this[25] - b[28] * this[26] - b[ 6] * this[27] + b[26] * this[28] + b[ 8] * this[29] + b[11] * this[30] + b[17] * this[31];
            target[15] = b[15] * this[ 0] + b[21] * this[ 1] + b[24] * this[ 2] + b[25] * this[ 3] + b[ 5] * this[ 4] - b[ 4] * this[ 5] - b[28] * this[ 6] - b[29] * this[ 7] - b[ 9] * this[ 8] + b[ 8] * this[ 9] - b[30] * this[10] - b[12] * this[11] + b[11] * this[12] - b[14] * this[13] + b[13] * this[14] + b[ 0] * this[15] - b[31] * this[16] - b[18] * this[17] + b[17] * this[18] - b[20] * this[19] + b[19] * this[20] + b[ 1] * this[21] - b[23] * this[22] + b[22] * this[23] + b[ 2] * this[24] + b[ 3] * this[25] + b[27] * this[26] - b[26] * this[27] - b[ 6] * this[28] - b[ 7] * this[29] - b[10] * this[30] - b[16] * this[31];
            target[16] = b[16] * this[ 0] + b[10] * this[ 1] - b[ 7] * this[ 2] + b[ 6] * this[ 3] - b[26] * this[ 4] + b[27] * this[ 5] + b[ 3] * this[ 6] - b[ 2] * this[ 7] + b[22] * this[ 8] - b[23] * this[ 9] + b[ 1] * this[10] - b[19] * this[11] + b[20] * this[12] + b[17] * this[13] - b[18] * this[14] + b[31] * this[15] + b[ 0] * this[16] - b[13] * this[17] + b[14] * this[18] + b[11] * this[19] - b[12] * this[20] + b[30] * this[21] - b[ 8] * this[22] + b[ 9] * this[23] - b[29] * this[24] + b[28] * this[25] + b[ 4] * this[26] - b[ 5] * this[27] + b[25] * this[28] - b[24] * this[29] + b[21] * this[30] + b[15] * this[31];
            target[17] = b[17] * this[ 0] + b[11] * this[ 1] - b[ 8] * this[ 2] + b[26] * this[ 3] + b[ 6] * this[ 4] + b[28] * this[ 5] + b[ 4] * this[ 6] - b[22] * this[ 7] - b[ 2] * this[ 8] - b[24] * this[ 9] + b[19] * this[10] + b[ 1] * this[11] + b[21] * this[12] - b[16] * this[13] - b[31] * this[14] - b[18] * this[15] + b[13] * this[16] + b[ 0] * this[17] + b[15] * this[18] - b[10] * this[19] - b[30] * this[20] - b[12] * this[21] + b[ 7] * this[22] + b[29] * this[23] + b[ 9] * this[24] - b[27] * this[25] - b[ 3] * this[26] - b[25] * this[27] - b[ 5] * this[28] + b[23] * this[29] - b[20] * this[30] - b[14] * this[31];
            target[18] = b[18] * this[ 0] + b[12] * this[ 1] - b[ 9] * this[ 2] + b[27] * this[ 3] + b[28] * this[ 4] + b[ 6] * this[ 5] + b[ 5] * this[ 6] - b[23] * this[ 7] - b[24] * this[ 8] - b[ 2] * this[ 9] + b[20] * this[10] + b[21] * this[11] + b[ 1] * this[12] - b[31] * this[13] - b[16] * this[14] - b[17] * this[15] + b[14] * this[16] + b[15] * this[17] + b[ 0] * this[18] - b[30] * this[19] - b[10] * this[20] - b[11] * this[21] + b[29] * this[22] + b[ 7] * this[23] + b[ 8] * this[24] - b[26] * this[25] - b[25] * this[26] - b[ 3] * this[27] - b[ 4] * this[28] + b[22] * this[29] - b[19] * this[30] - b[13] * this[31];
            target[19] = b[19] * this[ 0] + b[13] * this[ 1] - b[26] * this[ 2] - b[ 8] * this[ 3] + b[ 7] * this[ 4] + b[29] * this[ 5] + b[22] * this[ 6] + b[ 4] * this[ 7] - b[ 3] * this[ 8] - b[25] * this[ 9] - b[17] * this[10] + b[16] * this[11] + b[31] * this[12] + b[ 1] * this[13] + b[21] * this[14] - b[20] * this[15] - b[11] * this[16] + b[10] * this[17] + b[30] * this[18] + b[ 0] * this[19] + b[15] * this[20] - b[14] * this[21] - b[ 6] * this[22] - b[28] * this[23] + b[27] * this[24] + b[ 9] * this[25] + b[ 2] * this[26] + b[24] * this[27] - b[23] * this[28] - b[ 5] * this[29] + b[18] * this[30] + b[12] * this[31];
            target[20] = b[20] * this[ 0] + b[14] * this[ 1] - b[27] * this[ 2] - b[ 9] * this[ 3] + b[29] * this[ 4] + b[ 7] * this[ 5] + b[23] * this[ 6] + b[ 5] * this[ 7] - b[25] * this[ 8] - b[ 3] * this[ 9] - b[18] * this[10] + b[31] * this[11] + b[16] * this[12] + b[21] * this[13] + b[ 1] * this[14] - b[19] * this[15] - b[12] * this[16] + b[30] * this[17] + b[10] * this[18] + b[15] * this[19] + b[ 0] * this[20] - b[13] * this[21] - b[28] * this[22] - b[ 6] * this[23] + b[26] * this[24] + b[ 8] * this[25] + b[24] * this[26] + b[ 2] * this[27] - b[22] * this[28] - b[ 4] * this[29] + b[17] * this[30] + b[11] * this[31];
            target[21] = b[21] * this[ 0] + b[15] * this[ 1] - b[28] * this[ 2] - b[29] * this[ 3] - b[ 9] * this[ 4] + b[ 8] * this[ 5] + b[24] * this[ 6] + b[25] * this[ 7] + b[ 5] * this[ 8] - b[ 4] * this[ 9] - b[31] * this[10] - b[18] * this[11] + b[17] * this[12] - b[20] * this[13] + b[19] * this[14] + b[ 1] * this[15] - b[30] * this[16] - b[12] * this[17] + b[11] * this[18] - b[14] * this[19] + b[13] * this[20] + b[ 0] * this[21] + b[27] * this[22] - b[26] * this[23] - b[ 6] * this[24] - b[ 7] * this[25] - b[23] * this[26] + b[22] * this[27] + b[ 2] * this[28] + b[ 3] * this[29] - b[16] * this[30] - b[10] * this[31];
            target[22] = b[22] * this[ 0] + b[26] * this[ 1] + b[13] * this[ 2] - b[11] * this[ 3] + b[10] * this[ 4] + b[30] * this[ 5] - b[19] * this[ 6] + b[17] * this[ 7] - b[16] * this[ 8] - b[31] * this[ 9] + b[ 4] * this[10] - b[ 3] * this[11] - b[25] * this[12] + b[ 2] * this[13] + b[24] * this[14] - b[23] * this[15] + b[ 8] * this[16] - b[ 7] * this[17] - b[29] * this[18] + b[ 6] * this[19] + b[28] * this[20] - b[27] * this[21] + b[ 0] * this[22] + b[15] * this[23] - b[14] * this[24] + b[12] * this[25] - b[ 1] * this[26] - b[21] * this[27] + b[20] * this[28] - b[18] * this[29] - b[ 5] * this[30] - b[ 9] * this[31];
            target[23] = b[23] * this[ 0] + b[27] * this[ 1] + b[14] * this[ 2] - b[12] * this[ 3] + b[30] * this[ 4] + b[10] * this[ 5] - b[20] * this[ 6] + b[18] * this[ 7] - b[31] * this[ 8] - b[16] * this[ 9] + b[ 5] * this[10] - b[25] * this[11] - b[ 3] * this[12] + b[24] * this[13] + b[ 2] * this[14] - b[22] * this[15] + b[ 9] * this[16] - b[29] * this[17] - b[ 7] * this[18] + b[28] * this[19] + b[ 6] * this[20] - b[26] * this[21] + b[15] * this[22] + b[ 0] * this[23] - b[13] * this[24] + b[11] * this[25] - b[21] * this[26] - b[ 1] * this[27] + b[19] * this[28] - b[17] * this[29] - b[ 4] * this[30] - b[ 8] * this[31];
            target[24] = b[24] * this[ 0] + b[28] * this[ 1] + b[15] * this[ 2] - b[30] * this[ 3] - b[12] * this[ 4] + b[11] * this[ 5] - b[21] * this[ 6] + b[31] * this[ 7] + b[18] * this[ 8] - b[17] * this[ 9] + b[25] * this[10] + b[ 5] * this[11] - b[ 4] * this[12] - b[23] * this[13] + b[22] * this[14] + b[ 2] * this[15] + b[29] * this[16] + b[ 9] * this[17] - b[ 8] * this[18] - b[27] * this[19] + b[26] * this[20] + b[ 6] * this[21] - b[14] * this[22] + b[13] * this[23] + b[ 0] * this[24] - b[10] * this[25] + b[20] * this[26] - b[19] * this[27] - b[ 1] * this[28] + b[16] * this[29] + b[ 3] * this[30] + b[ 7] * this[31];
            target[25] = b[25] * this[ 0] + b[29] * this[ 1] + b[30] * this[ 2] + b[15] * this[ 3] - b[14] * this[ 4] + b[13] * this[ 5] - b[31] * this[ 6] - b[21] * this[ 7] + b[20] * this[ 8] - b[19] * this[ 9] - b[24] * this[10] + b[23] * this[11] - b[22] * this[12] + b[ 5] * this[13] - b[ 4] * this[14] + b[ 3] * this[15] - b[28] * this[16] + b[27] * this[17] - b[26] * this[18] + b[ 9] * this[19] - b[ 8] * this[20] + b[ 7] * this[21] + b[12] * this[22] - b[11] * this[23] + b[10] * this[24] + b[ 0] * this[25] - b[18] * this[26] + b[17] * this[27] - b[16] * this[28] - b[ 1] * this[29] - b[ 2] * this[30] - b[ 6] * this[31];
            target[26] = b[26] * this[ 0] + b[22] * this[ 1] - b[19] * this[ 2] + b[17] * this[ 3] - b[16] * this[ 4] - b[31] * this[ 5] + b[13] * this[ 6] - b[11] * this[ 7] + b[10] * this[ 8] + b[30] * this[ 9] + b[ 8] * this[10] - b[ 7] * this[11] - b[29] * this[12] + b[ 6] * this[13] + b[28] * this[14] - b[27] * this[15] + b[ 4] * this[16] - b[ 3] * this[17] - b[25] * this[18] + b[ 2] * this[19] + b[24] * this[20] - b[23] * this[21] - b[ 1] * this[22] - b[21] * this[23] + b[20] * this[24] - b[18] * this[25] + b[ 0] * this[26] + b[15] * this[27] - b[14] * this[28] + b[12] * this[29] - b[ 9] * this[30] - b[ 5] * this[31];
            target[27] = b[27] * this[ 0] + b[23] * this[ 1] - b[20] * this[ 2] + b[18] * this[ 3] - b[31] * this[ 4] - b[16] * this[ 5] + b[14] * this[ 6] - b[12] * this[ 7] + b[30] * this[ 8] + b[10] * this[ 9] + b[ 9] * this[10] - b[29] * this[11] - b[ 7] * this[12] + b[28] * this[13] + b[ 6] * this[14] - b[26] * this[15] + b[ 5] * this[16] - b[25] * this[17] - b[ 3] * this[18] + b[24] * this[19] + b[ 2] * this[20] - b[22] * this[21] - b[21] * this[22] - b[ 1] * this[23] + b[19] * this[24] - b[17] * this[25] + b[15] * this[26] + b[ 0] * this[27] - b[13] * this[28] + b[11] * this[29] - b[ 8] * this[30] - b[ 4] * this[31];
            target[28] = b[28] * this[ 0] + b[24] * this[ 1] - b[21] * this[ 2] + b[31] * this[ 3] + b[18] * this[ 4] - b[17] * this[ 5] + b[15] * this[ 6] - b[30] * this[ 7] - b[12] * this[ 8] + b[11] * this[ 9] + b[29] * this[10] + b[ 9] * this[11] - b[ 8] * this[12] - b[27] * this[13] + b[26] * this[14] + b[ 6] * this[15] + b[25] * this[16] + b[ 5] * this[17] - b[ 4] * this[18] - b[23] * this[19] + b[22] * this[20] + b[ 2] * this[21] + b[20] * this[22] - b[19] * this[23] - b[ 1] * this[24] + b[16] * this[25] - b[14] * this[26] + b[13] * this[27] + b[ 0] * this[28] - b[10] * this[29] + b[ 7] * this[30] + b[ 3] * this[31];
            target[29] = b[29] * this[ 0] + b[25] * this[ 1] - b[31] * this[ 2] - b[21] * this[ 3] + b[20] * this[ 4] - b[19] * this[ 5] + b[30] * this[ 6] + b[15] * this[ 7] - b[14] * this[ 8] + b[13] * this[ 9] - b[28] * this[10] + b[27] * this[11] - b[26] * this[12] + b[ 9] * this[13] - b[ 8] * this[14] + b[ 7] * this[15] - b[24] * this[16] + b[23] * this[17] - b[22] * this[18] + b[ 5] * this[19] - b[ 4] * this[20] + b[ 3] * this[21] - b[18] * this[22] + b[17] * this[23] - b[16] * this[24] - b[ 1] * this[25] + b[12] * this[26] - b[11] * this[27] + b[10] * this[28] + b[ 0] * this[29] - b[ 6] * this[30] - b[ 2] * this[31];
            target[30] = b[30] * this[ 0] + b[31] * this[ 1] + b[25] * this[ 2] - b[24] * this[ 3] + b[23] * this[ 4] - b[22] * this[ 5] - b[29] * this[ 6] + b[28] * this[ 7] - b[27] * this[ 8] + b[26] * this[ 9] + b[15] * this[10] - b[14] * this[11] + b[13] * this[12] + b[12] * this[13] - b[11] * this[14] + b[10] * this[15] + b[21] * this[16] - b[20] * this[17] + b[19] * this[18] + b[18] * this[19] - b[17] * this[20] + b[16] * this[21] + b[ 5] * this[22] - b[ 4] * this[23] + b[ 3] * this[24] - b[ 2] * this[25] - b[ 9] * this[26] + b[ 8] * this[27] - b[ 7] * this[28] + b[ 6] * this[29] + b[ 0] * this[30] + b[ 1] * this[31];
            target[31] = b[31] * this[ 0] + b[30] * this[ 1] - b[29] * this[ 2] + b[28] * this[ 3] - b[27] * this[ 4] + b[26] * this[ 5] + b[25] * this[ 6] - b[24] * this[ 7] + b[23] * this[ 8] - b[22] * this[ 9] + b[21] * this[10] - b[20] * this[11] + b[19] * this[12] + b[18] * this[13] - b[17] * this[14] + b[16] * this[15] + b[15] * this[16] - b[14] * this[17] + b[13] * this[18] + b[12] * this[19] - b[11] * this[20] + b[10] * this[21] - b[ 9] * this[22] + b[ 8] * this[23] - b[ 7] * this[24] + b[ 6] * this[25] + b[ 5] * this[26] - b[ 4] * this[27] + b[ 3] * this[28] - b[ 2] * this[29] + b[ 1] * this[30] + b[ 0] * this[31];

            return target
        }
    }
    window.Mv = Mv

    let indexGrades = [
        0,                    // CGA           4D HPGA
        1,1,1,1,1,            //sphere         3-plane
        2,2,2,2,2,2,2,2,2,2,  //circle         plane
        3,3,3,3,3,3,3,3,3,3,  //point pair     line
        4,4,4,4,4,            //point          point
        5
    ]

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

    e1 = MvFromFloatAndIndex(1., 1)
    e2 = MvFromFloatAndIndex(1., 2)
    e3 = MvFromFloatAndIndex(1., 3)
    ePlus = MvFromFloatAndIndex(1., 4)
    eMinus = MvFromFloatAndIndex(1., 5)

    function nonzeroPart(mv) {
        for( i = 0; i < N_COEFS; ++i) {
            if(mv[i] !== 0.)
                return i
        }
    }

    let thingies = ["Plus", "Minus", "1", "2", "3"]
    let allNames = []
    function meh( indices, start, numWanted ) {
        if(numWanted === 0) {
            let names = indices.map(i=>thingies[i])
            names.forEach((name)=>{

            })
            .join(``)
            log(name)
            
            
        }
        else {
            for(let i = start; i < 5; ++i) {
                let newIndices = indices.map(x => x)
                newIndices.push(i)
                meh(newIndices, i+1, numWanted-1 )
            }
        }
    }
    for(let i = 2; i < 6; ++i) {
        meh([],0,i)
    }
    log(allNames)

    e12 = e1.mul(e2)
    ePlus1 = ePlus.mul(e1)
    ePlus2 = ePlus.mul(e2)
    ePlusMinus = ePlus.mul(eMinus)
    eMinus1 = eMinus.mul(e1)
    eMinus2 = eMinus.mul(e2)

    ePlusMinus1 = ePlusMinus.mul(e1)
    ePlusMinus2 = ePlusMinus.mul(e2)
    ePlus12 = ePlus.mul(e12)
    eMinus12 = eMinus.mul(e12)
    I = ePlusMinus.mul(e12)

    e0 = ePlus.add(eMinus)
    e012 = e0.meet(e12)
    em = ePlus.sub(eMinus).multiplyScalar(0.5) // seems most readable
    em12 = em.meet(e12)

    xDir = e0.meet(e2)
    yDir = e0.meet(e1)

    mv0 = new Mv()
    mv1 = new Mv()
    mv2 = new Mv()
    mv3 = new Mv()
    mv4 = new Mv()
    mv5 = new Mv()
    mv6 = new Mv()

    let localMv0 = new Mv()
    let localMv1 = new Mv()
    let localMv2 = new Mv()
    let localMv3 = new Mv()
    let localMv4 = new Mv()
    let localMv5 = new Mv()
    let localMv6 = new Mv()

    

    /*END*/
}


function init41WithoutDeclarations() {

    const basisNames = [
        ``,
        `1`, `2`, `3`, `+`, `-`,
        `12`, `13`, `1+`, `1-`, `23`, `2+`, `2-`, `3+`, `3-`, `+-`,  //line start is [6]
        `123`, `12+`, `12-`, `13+`, `13-`, `1+-`, `23+`, `23-`, `2+-`, `3+-`,  //lines starts at [16]
        `123+`, `123-`, `12+-`, `13+-`, `23+-`,
        `I`]
    basisNames.forEach((bn, i) => {
        if (i !== 0) {
            let funcName = "e" + bn.replace(`+`, `Plus`).replace(`-`, `Minus`)
            Mv.prototype[funcName] = function () { return this[i] }
        }
    })

    class Mv_41 extends GeneralVector {
        static get size() { return N_COEFS }

        constructor() {
            return super(N_COEFS)
        }

        toQuaternion(q) {
            //haven't thought about orientations
            q.set(this[10], this[7], this[6], this[0])
        }

        plane(a, b, c) {
            //not sure what to do with 
            this.set(
                0.,
                a, b, c, 0., 0.,
                0., 0., 0., 0., 0., 0., 0., 0., 0., 0.,
                0., 0., 0., 0., 0., 0., 0., 0., 0., 0.,
                0., 0., 0., 0., 0.,
                0.
            )
            return this
        }

        naieveAxisToRotor(amt) {
            //we do NOT normalize because this could very well be null
            this.multiplyScalar(amt)
            this[0] = 1.
            this.normalize()
            return this
        }

        naieveSqrt() {
            this.normalize()
            this[0] += 1. * Math.sign(this[0]) || 1.
            this.normalize()
            return this
        }

        normalize() {
            return this.multiplyScalar(1./this.norm())
        }

        mul(mv) {
            let intermediary = mul(this,mv,newMv)
            this.copy(intermediary)
            return this
        }

        divideBy(mv,target) {
            if (target === undefined)
                target = new Mv_41()
                
            //ret*mv = this
            //ret*(mv*mv) = this*mv
            //ret = this*mv/(mv*mv)
            //provided mv*mv is a nonzero scalar
            
            let mvSquared = mul(mv,mv,newMv)
            let impossible = false
            for(let i = 1; i < 32; ++i) {
                if (Math.abs(mvSquared[i]) > .0001)
                    impossible = true
            }
            if(impossible )
                console.warn("division by non-blade")
            else if (mvSquared[0] === 0.)
                console.warn("division by thing with zero norm")
            let scalarToMultiplyBy = mvSquared[0] === 0. ? 1. : 1./mvSquared[0]
            
            mul(this,mv,target)

            target.multiplyScalar(scalarToMultiplyBy)

            return target
        }

        projectOn(mv,target) {
            if(target === undefined)
                target = new Mv_41()
            let intermediary = inner(this, mv, newMv)
            return mul(intermediary,mv, target)
            // return intermediary.divideBy(mv, target)
        }

        applyRotor(rotor) {
            let intermediary = rotor.sandwich(this,newMv)
            this.copy(intermediary)
            return this
        }

        // getDualForDimension(dimension, target) {
        //     if(target === undefined)
        //         target = new Mv_41()

        //     mul(this, pss, target)
        //     target.multiplyScalar(-1.) //or is that only in 3D? =/ Or odd dimension
        //     return target
        // }

        norm() {
            let thisConjugate = newMv
            conjugate(this, thisConjugate)
            let thisThisConjugate = newMv
            mul(this, thisConjugate, thisThisConjugate)
            return Math.sqrt(Math.abs(thisThisConjugate[0]))
        }

        isOddGrade() {
            let ret = true
            indexGrades.forEach((ig, i) => {
                if (this[i] !== 0. && ig % 2 === 0)
                    ret = false
            })
            return ret
        }

        sandwich(mv, target) {
            if(target === undefined)
                target = new Mv_41()

            let intermediary = newMv
            mul(this,mv,intermediary)
            let thisReverse = newMv
            reverse(this, thisReverse)
            mul(intermediary,thisReverse,target)
            if(this.isOddGrade() && mv.isOddGrade() )
                target.multiplyScalar(-1.)
            
            return target
        }

        reverse(target) {
            reverse(this, target)
        }

        selectGrade(grade, target) {
            if(target === undefined)
                target = this
            else
                target.copy(this)

            for (let i = 0; i < 16; ++i) {
                if (indexGrades[i] !== grade)
                    target[i] = 0.
            }

            return target
        }

        getFirstNonzeroIndex() { 
            for (let i = 0; i < 32; ++i) {
                if (this[i] !== 0.)
                    return [i, this[i]]
            }
        }

        log(label, numDecimalPlaces) {
            if (numDecimalPlaces === undefined)
                numDecimalPlaces = 1

            let str = ""
            for (let i = 0; i < basisNames.length; ++i) {
                if (this[i] !== 0.) { // && this[i].toFixed() != 0) {
                    if (str !== "")
                        str += ", "

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

        // eNorm() {
        //     return Math.sqrt(eNormSquared(this))
        // }
        // iNorm() {
        //     let thisDual = dual(this, newMv)
        //     return thisDual.eNorm()
        // }
        // norm() {
        //     let ourENormSquared = eNormSquared(this)
        //     if (ourENormSquared !== 0.)
        //         return Math.sqrt(ourENormSquared)
        //     else
        //         return this.iNorm()
        // }

        // normalize() {
        //     this.multiplyScalar(1./this.norm())
        //     return this
        // }

        // getNormalization(target) {
        //     target.copy(this)
        //     return target.normalize()
        // }

        // selectGrade(grade,target) {
        //     target.copy(this)
        //     for(let i = 0; i < 16; ++i) {
        //         if (indexGrades[i] !== grade)
        //             target[i] = 0.
        //     }

        //     return target
        // }

        // getGrade() {
        //     //if you want to use this function elsewhere, note that because 0 is a scalar, the grade == 0 case isn't quite true
        //     let self = this
        //     function hasGrade(grade) {
        //         switch (grade) {
        //             case 0:
        //                 return self[ 0] !== 0.
        //             case 1:
        //                 return (self[ 1] !== 0. || self[ 2] !== 0. || self[ 3] !== 0. || self[ 4] !== 0.)
        //             case 2:
        //                 return (self[ 5] !== 0. || self[ 6] !== 0. || self[ 7] !== 0. || self[ 8] !== 0. || self[ 9] !== 0. || self[10] !== 0.)
        //             case 3:
        //                 return (self[11] !== 0. || self[12] !== 0. || self[13] !== 0. || self[14] !== 0.)
        //             case 4:
        //                 return self[15] !== 0.
        //         }
        //     }

        //     let alreadyFilledIn = false
        //     let grade = 0 //because 0 is a scalar
        //     for(let i = 0; i < 5; ++i) {
        //         if (hasGrade(i) ) {
        //             if (!alreadyFilledIn) {
        //                 grade = i
        //                 alreadyFilledIn = true
        //             }
        //             else
        //                 grade = i%2 === 0 ? "motor" : "flection"
        //         }
        //     }
        //     return grade
        // }
    }
    window.Mv = Mv

    /*EXTRA FUNCTIONS ADDED HERE*/

    function MvFromFloatAndIndex(float, index) {
        let mv = new Mv_41()
        mv[index] = float
        return mv
    }

    zeroMv_41 = new Mv_41()
    oneMv_41 = new Mv_41()
    oneMv_41[ 0] = 1.
    let minusOneMv_41 = new Mv_41()
    minusOneMv_41[ 0] = -1.

    e1_41 = MvFromFloatAndIndex(1., 1)
    e2_41 = MvFromFloatAndIndex(1., 2)
    e3_41 = MvFromFloatAndIndex(1., 3)
    e12_41 = mul(e1, e2)
    e31_41 = mul(e3, e1)
    e23_41 = mul(e2, e3)
    e123_41 = mul(e1, e23)
    e13_41 = mul(e1, e3)
    
    ePlus = MvFromFloatAndIndex(1., 4)
    eMinus = MvFromFloatAndIndex(1., 5)
    ePlusMinus = mul(ePlus,eMinus)
    e123PlusMinus = mul(e123, ePlusMinus)

    e1Plus = mul(e1,ePlus)
    e1Minus = mul(e1, eMinus)

    mv0 = new Mv_41()
    mv1 = new Mv_41()
    mv2 = new Mv_41()
    mv3 = new Mv_41()
    mv4 = new Mv_41()
    mv5 = new Mv_41()
    mv6 = new Mv_41()

/*END*/}