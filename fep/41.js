function init41WithoutDeclarations() {

    let biv = new Float32Array(32)

    class Mv41 extends GeneralVector {

        constructor() {
            super(32)
        }

        //may also be sign errors if it isn't PGA stuff, ya gotta divide!
        projectOn(on, target) {
            return this.inner(on, newMv41).mulReverse(on, target)
        }

        flatPpToVec(v) {
            let translator = this.mulReverse(e123, newMv41)
            translator[0] *= 2.
            return translator.translatorToVec(v)
        }

        cheapSqrt(target) {
            this.cheapNormalize(target)
            if (target[0] === -1.)
                target.negate(target)
            target[0] += 1.
            return target.cheapNormalize(target)
        }

        cheapNormalize(target) {
            //should be doable with sqScalar but the reverse is important
            let normSq = this.mulReverse(this, newMv41)[0]
            return this.multiplyScalar(1. / Math.sqrt(Math.abs(normSq)), target)
        }

        mulReverse(b, target) { return this.mul(b.getReverse(newMv41), target) }
        sandwich(b, target) { return this.mul(b, newMv41).mulReverse(this, target) }

        //possibly negative!
        sqScalar() {
            return b[0] * this[0] + b[1] * this[1] + b[2] * this[2] + b[3] * this[3] + b[4] * this[4] - b[5] * this[5] - b[6] * this[6] - b[7] * this[7] - b[8] * this[8] + b[9] * this[9] - b[10] * this[10] - b[11] * this[11] + b[12] * this[12] - b[13] * this[13] + b[14] * this[14] + b[15] * this[15] - b[16] * this[16] - b[17] * this[17] + b[18] * this[18] - b[19] * this[19] + b[20] * this[20] + b[21] * this[21] - b[22] * this[22] + b[23] * this[23] + b[24] * this[24] + b[25] * this[25] + b[26] * this[26] - b[27] * this[27] - b[28] * this[28] - b[29] * this[29] - b[30] * this[30] - b[31] * this[31];
        }

        translatorFromVec(v) { return one.addScaled(e10, v.x / 2., this).addScaled(e20, v.y / 2., this).addScaled(e30, v.z / 2., this) }
        vecToZrc(v) { return newMv41.translatorFromVec(v).sandwich(eo, this) }

        circlePosToVec(targetVec) {
            return this.inner(e1230, newMv41).flatPpToVec(targetVec)
        }

        // translatorToVec(target) {
        //     target.z = 0.
        //     target.x =
        //     target.y =
        //     target.z =
        //     target.multiplyScalar(1. / this[0], target)
        //     return target
        // }

        pointPairToVecs(targets) {

            let mySq = this.sqScalar()
            let toUse = mySq > 0. ? this : this.inner(e123pm, newMv41)

            let projector = toUse.cheapNormalize(newMv41)
            projector[0] = 1.
            projector.multiplyScalar(.5, projector)
            let projectableUna = toUse.inner(em, newMv41)

            for (let i = 0; i < 2; ++i) {

                let zrc = projector.mul(projectableUna, newMv41)
                if (zrc[3] === zrc[4])
                    targets[i].copy(outOfSightVec3)
                else
                    zrc.circlePosToVec(targets[i])

                projector.getReverse(projector)
            }

            return targets
        }

        // rigorousNormalize(target) {
            
        //     return target
        // }

        // logarithm(target) {

        //     return target
        // }

        // exp(target) {

        //     return target
        // }

        getReverse(target) {
            target[0] = this[0]; target[1] = this[1]; target[2] = this[2]; target[3] = this[3]; target[4] = this[4]; target[5] = this[5]; target[6] = -this[6]; target[7] = -this[7]; target[8] = -this[8]; target[9] = -this[9]; target[10] = -this[10]; target[11] = -this[11]; target[12] = -this[12]; target[13] = -this[13]; target[14] = -this[14]; target[15] = -this[15]; target[16] = -this[16]; target[17] = -this[17]; target[18] = -this[18]; target[19] = -this[19]; target[20] = -this[20]; target[21] = -this[21]; target[22] = -this[22]; target[23] = -this[23]; target[24] = -this[24]; target[25] = -this[25]; target[26] = this[26]; target[27] = this[27]; target[28] = this[28]; target[29] = this[29]; target[30] = this[30]; target[31] = this[31];
            return target
        }

        mul(b, target) {
            target[0] = b[0] * this[0] + b[1] * this[1] + b[2] * this[2] + b[3] * this[3] + b[4] * this[4] - b[5] * this[5] - b[6] * this[6] - b[7] * this[7] - b[8] * this[8] + b[9] * this[9] - b[10] * this[10] - b[11] * this[11] + b[12] * this[12] - b[13] * this[13] + b[14] * this[14] + b[15] * this[15] - b[16] * this[16] - b[17] * this[17] + b[18] * this[18] - b[19] * this[19] + b[20] * this[20] + b[21] * this[21] - b[22] * this[22] + b[23] * this[23] + b[24] * this[24] + b[25] * this[25] + b[26] * this[26] - b[27] * this[27] - b[28] * this[28] - b[29] * this[29] - b[30] * this[30] - b[31] * this[31];
            target[1] = b[1] * this[0] + b[0] * this[1] - b[6] * this[2] - b[7] * this[3] - b[8] * this[4] + b[9] * this[5] + b[2] * this[6] + b[3] * this[7] + b[4] * this[8] - b[5] * this[9] - b[16] * this[10] - b[17] * this[11] + b[18] * this[12] - b[19] * this[13] + b[20] * this[14] + b[21] * this[15] - b[10] * this[16] - b[11] * this[17] + b[12] * this[18] - b[13] * this[19] + b[14] * this[20] + b[15] * this[21] + b[26] * this[22] - b[27] * this[23] - b[28] * this[24] - b[29] * this[25] - b[22] * this[26] + b[23] * this[27] + b[24] * this[28] + b[25] * this[29] - b[31] * this[30] - b[30] * this[31];
            target[2] = b[2] * this[0] + b[6] * this[1] + b[0] * this[2] - b[10] * this[3] - b[11] * this[4] + b[12] * this[5] - b[1] * this[6] + b[16] * this[7] + b[17] * this[8] - b[18] * this[9] + b[3] * this[10] + b[4] * this[11] - b[5] * this[12] - b[22] * this[13] + b[23] * this[14] + b[24] * this[15] + b[7] * this[16] + b[8] * this[17] - b[9] * this[18] - b[26] * this[19] + b[27] * this[20] + b[28] * this[21] - b[13] * this[22] + b[14] * this[23] + b[15] * this[24] - b[30] * this[25] + b[19] * this[26] - b[20] * this[27] - b[21] * this[28] + b[31] * this[29] + b[25] * this[30] + b[29] * this[31];
            target[3] = b[3] * this[0] + b[7] * this[1] + b[10] * this[2] + b[0] * this[3] - b[13] * this[4] + b[14] * this[5] - b[16] * this[6] - b[1] * this[7] + b[19] * this[8] - b[20] * this[9] - b[2] * this[10] + b[22] * this[11] - b[23] * this[12] + b[4] * this[13] - b[5] * this[14] + b[25] * this[15] - b[6] * this[16] + b[26] * this[17] - b[27] * this[18] + b[8] * this[19] - b[9] * this[20] + b[29] * this[21] + b[11] * this[22] - b[12] * this[23] + b[30] * this[24] + b[15] * this[25] - b[17] * this[26] + b[18] * this[27] - b[31] * this[28] - b[21] * this[29] - b[24] * this[30] - b[28] * this[31];
            target[4] = b[4] * this[0] + b[8] * this[1] + b[11] * this[2] + b[13] * this[3] + b[0] * this[4] + b[15] * this[5] - b[17] * this[6] - b[19] * this[7] - b[1] * this[8] - b[21] * this[9] - b[22] * this[10] - b[2] * this[11] - b[24] * this[12] - b[3] * this[13] - b[25] * this[14] - b[5] * this[15] - b[26] * this[16] - b[6] * this[17] - b[28] * this[18] - b[7] * this[19] - b[29] * this[20] - b[9] * this[21] - b[10] * this[22] - b[30] * this[23] - b[12] * this[24] - b[14] * this[25] + b[16] * this[26] + b[31] * this[27] + b[18] * this[28] + b[20] * this[29] + b[23] * this[30] + b[27] * this[31];
            target[5] = b[5] * this[0] + b[9] * this[1] + b[12] * this[2] + b[14] * this[3] + b[15] * this[4] + b[0] * this[5] - b[18] * this[6] - b[20] * this[7] - b[21] * this[8] - b[1] * this[9] - b[23] * this[10] - b[24] * this[11] - b[2] * this[12] - b[25] * this[13] - b[3] * this[14] - b[4] * this[15] - b[27] * this[16] - b[28] * this[17] - b[6] * this[18] - b[29] * this[19] - b[7] * this[20] - b[8] * this[21] - b[30] * this[22] - b[10] * this[23] - b[11] * this[24] - b[13] * this[25] + b[31] * this[26] + b[16] * this[27] + b[17] * this[28] + b[19] * this[29] + b[22] * this[30] + b[26] * this[31];
            target[6] = b[6] * this[0] + b[2] * this[1] - b[1] * this[2] + b[16] * this[3] + b[17] * this[4] - b[18] * this[5] + b[0] * this[6] - b[10] * this[7] - b[11] * this[8] + b[12] * this[9] + b[7] * this[10] + b[8] * this[11] - b[9] * this[12] - b[26] * this[13] + b[27] * this[14] + b[28] * this[15] + b[3] * this[16] + b[4] * this[17] - b[5] * this[18] - b[22] * this[19] + b[23] * this[20] + b[24] * this[21] + b[19] * this[22] - b[20] * this[23] - b[21] * this[24] + b[31] * this[25] - b[13] * this[26] + b[14] * this[27] + b[15] * this[28] - b[30] * this[29] + b[29] * this[30] + b[25] * this[31];
            target[7] = b[7] * this[0] + b[3] * this[1] - b[16] * this[2] - b[1] * this[3] + b[19] * this[4] - b[20] * this[5] + b[10] * this[6] + b[0] * this[7] - b[13] * this[8] + b[14] * this[9] - b[6] * this[10] + b[26] * this[11] - b[27] * this[12] + b[8] * this[13] - b[9] * this[14] + b[29] * this[15] - b[2] * this[16] + b[22] * this[17] - b[23] * this[18] + b[4] * this[19] - b[5] * this[20] + b[25] * this[21] - b[17] * this[22] + b[18] * this[23] - b[31] * this[24] - b[21] * this[25] + b[11] * this[26] - b[12] * this[27] + b[30] * this[28] + b[15] * this[29] - b[28] * this[30] - b[24] * this[31];
            target[8] = b[8] * this[0] + b[4] * this[1] - b[17] * this[2] - b[19] * this[3] - b[1] * this[4] - b[21] * this[5] + b[11] * this[6] + b[13] * this[7] + b[0] * this[8] + b[15] * this[9] - b[26] * this[10] - b[6] * this[11] - b[28] * this[12] - b[7] * this[13] - b[29] * this[14] - b[9] * this[15] - b[22] * this[16] - b[2] * this[17] - b[24] * this[18] - b[3] * this[19] - b[25] * this[20] - b[5] * this[21] + b[16] * this[22] + b[31] * this[23] + b[18] * this[24] + b[20] * this[25] - b[10] * this[26] - b[30] * this[27] - b[12] * this[28] - b[14] * this[29] + b[27] * this[30] + b[23] * this[31];
            target[9] = b[9] * this[0] + b[5] * this[1] - b[18] * this[2] - b[20] * this[3] - b[21] * this[4] - b[1] * this[5] + b[12] * this[6] + b[14] * this[7] + b[15] * this[8] + b[0] * this[9] - b[27] * this[10] - b[28] * this[11] - b[6] * this[12] - b[29] * this[13] - b[7] * this[14] - b[8] * this[15] - b[23] * this[16] - b[24] * this[17] - b[2] * this[18] - b[25] * this[19] - b[3] * this[20] - b[4] * this[21] + b[31] * this[22] + b[16] * this[23] + b[17] * this[24] + b[19] * this[25] - b[30] * this[26] - b[10] * this[27] - b[11] * this[28] - b[13] * this[29] + b[26] * this[30] + b[22] * this[31];
            target[10] = b[10] * this[0] + b[16] * this[1] + b[3] * this[2] - b[2] * this[3] + b[22] * this[4] - b[23] * this[5] - b[7] * this[6] + b[6] * this[7] - b[26] * this[8] + b[27] * this[9] + b[0] * this[10] - b[13] * this[11] + b[14] * this[12] + b[11] * this[13] - b[12] * this[14] + b[30] * this[15] + b[1] * this[16] - b[19] * this[17] + b[20] * this[18] + b[17] * this[19] - b[18] * this[20] + b[31] * this[21] + b[4] * this[22] - b[5] * this[23] + b[25] * this[24] - b[24] * this[25] - b[8] * this[26] + b[9] * this[27] - b[29] * this[28] + b[28] * this[29] + b[15] * this[30] + b[21] * this[31];
            target[11] = b[11] * this[0] + b[17] * this[1] + b[4] * this[2] - b[22] * this[3] - b[2] * this[4] - b[24] * this[5] - b[8] * this[6] + b[26] * this[7] + b[6] * this[8] + b[28] * this[9] + b[13] * this[10] + b[0] * this[11] + b[15] * this[12] - b[10] * this[13] - b[30] * this[14] - b[12] * this[15] + b[19] * this[16] + b[1] * this[17] + b[21] * this[18] - b[16] * this[19] - b[31] * this[20] - b[18] * this[21] - b[3] * this[22] - b[25] * this[23] - b[5] * this[24] + b[23] * this[25] + b[7] * this[26] + b[29] * this[27] + b[9] * this[28] - b[27] * this[29] - b[14] * this[30] - b[20] * this[31];
            target[12] = b[12] * this[0] + b[18] * this[1] + b[5] * this[2] - b[23] * this[3] - b[24] * this[4] - b[2] * this[5] - b[9] * this[6] + b[27] * this[7] + b[28] * this[8] + b[6] * this[9] + b[14] * this[10] + b[15] * this[11] + b[0] * this[12] - b[30] * this[13] - b[10] * this[14] - b[11] * this[15] + b[20] * this[16] + b[21] * this[17] + b[1] * this[18] - b[31] * this[19] - b[16] * this[20] - b[17] * this[21] - b[25] * this[22] - b[3] * this[23] - b[4] * this[24] + b[22] * this[25] + b[29] * this[26] + b[7] * this[27] + b[8] * this[28] - b[26] * this[29] - b[13] * this[30] - b[19] * this[31];
            target[13] = b[13] * this[0] + b[19] * this[1] + b[22] * this[2] + b[4] * this[3] - b[3] * this[4] - b[25] * this[5] - b[26] * this[6] - b[8] * this[7] + b[7] * this[8] + b[29] * this[9] - b[11] * this[10] + b[10] * this[11] + b[30] * this[12] + b[0] * this[13] + b[15] * this[14] - b[14] * this[15] - b[17] * this[16] + b[16] * this[17] + b[31] * this[18] + b[1] * this[19] + b[21] * this[20] - b[20] * this[21] + b[2] * this[22] + b[24] * this[23] - b[23] * this[24] - b[5] * this[25] - b[6] * this[26] - b[28] * this[27] + b[27] * this[28] + b[9] * this[29] + b[12] * this[30] + b[18] * this[31];
            target[14] = b[14] * this[0] + b[20] * this[1] + b[23] * this[2] + b[5] * this[3] - b[25] * this[4] - b[3] * this[5] - b[27] * this[6] - b[9] * this[7] + b[29] * this[8] + b[7] * this[9] - b[12] * this[10] + b[30] * this[11] + b[10] * this[12] + b[15] * this[13] + b[0] * this[14] - b[13] * this[15] - b[18] * this[16] + b[31] * this[17] + b[16] * this[18] + b[21] * this[19] + b[1] * this[20] - b[19] * this[21] + b[24] * this[22] + b[2] * this[23] - b[22] * this[24] - b[4] * this[25] - b[28] * this[26] - b[6] * this[27] + b[26] * this[28] + b[8] * this[29] + b[11] * this[30] + b[17] * this[31];
            target[15] = b[15] * this[0] + b[21] * this[1] + b[24] * this[2] + b[25] * this[3] + b[5] * this[4] - b[4] * this[5] - b[28] * this[6] - b[29] * this[7] - b[9] * this[8] + b[8] * this[9] - b[30] * this[10] - b[12] * this[11] + b[11] * this[12] - b[14] * this[13] + b[13] * this[14] + b[0] * this[15] - b[31] * this[16] - b[18] * this[17] + b[17] * this[18] - b[20] * this[19] + b[19] * this[20] + b[1] * this[21] - b[23] * this[22] + b[22] * this[23] + b[2] * this[24] + b[3] * this[25] + b[27] * this[26] - b[26] * this[27] - b[6] * this[28] - b[7] * this[29] - b[10] * this[30] - b[16] * this[31];
            target[16] = b[16] * this[0] + b[10] * this[1] - b[7] * this[2] + b[6] * this[3] - b[26] * this[4] + b[27] * this[5] + b[3] * this[6] - b[2] * this[7] + b[22] * this[8] - b[23] * this[9] + b[1] * this[10] - b[19] * this[11] + b[20] * this[12] + b[17] * this[13] - b[18] * this[14] + b[31] * this[15] + b[0] * this[16] - b[13] * this[17] + b[14] * this[18] + b[11] * this[19] - b[12] * this[20] + b[30] * this[21] - b[8] * this[22] + b[9] * this[23] - b[29] * this[24] + b[28] * this[25] + b[4] * this[26] - b[5] * this[27] + b[25] * this[28] - b[24] * this[29] + b[21] * this[30] + b[15] * this[31];
            target[17] = b[17] * this[0] + b[11] * this[1] - b[8] * this[2] + b[26] * this[3] + b[6] * this[4] + b[28] * this[5] + b[4] * this[6] - b[22] * this[7] - b[2] * this[8] - b[24] * this[9] + b[19] * this[10] + b[1] * this[11] + b[21] * this[12] - b[16] * this[13] - b[31] * this[14] - b[18] * this[15] + b[13] * this[16] + b[0] * this[17] + b[15] * this[18] - b[10] * this[19] - b[30] * this[20] - b[12] * this[21] + b[7] * this[22] + b[29] * this[23] + b[9] * this[24] - b[27] * this[25] - b[3] * this[26] - b[25] * this[27] - b[5] * this[28] + b[23] * this[29] - b[20] * this[30] - b[14] * this[31];
            target[18] = b[18] * this[0] + b[12] * this[1] - b[9] * this[2] + b[27] * this[3] + b[28] * this[4] + b[6] * this[5] + b[5] * this[6] - b[23] * this[7] - b[24] * this[8] - b[2] * this[9] + b[20] * this[10] + b[21] * this[11] + b[1] * this[12] - b[31] * this[13] - b[16] * this[14] - b[17] * this[15] + b[14] * this[16] + b[15] * this[17] + b[0] * this[18] - b[30] * this[19] - b[10] * this[20] - b[11] * this[21] + b[29] * this[22] + b[7] * this[23] + b[8] * this[24] - b[26] * this[25] - b[25] * this[26] - b[3] * this[27] - b[4] * this[28] + b[22] * this[29] - b[19] * this[30] - b[13] * this[31];
            target[19] = b[19] * this[0] + b[13] * this[1] - b[26] * this[2] - b[8] * this[3] + b[7] * this[4] + b[29] * this[5] + b[22] * this[6] + b[4] * this[7] - b[3] * this[8] - b[25] * this[9] - b[17] * this[10] + b[16] * this[11] + b[31] * this[12] + b[1] * this[13] + b[21] * this[14] - b[20] * this[15] - b[11] * this[16] + b[10] * this[17] + b[30] * this[18] + b[0] * this[19] + b[15] * this[20] - b[14] * this[21] - b[6] * this[22] - b[28] * this[23] + b[27] * this[24] + b[9] * this[25] + b[2] * this[26] + b[24] * this[27] - b[23] * this[28] - b[5] * this[29] + b[18] * this[30] + b[12] * this[31];
            target[20] = b[20] * this[0] + b[14] * this[1] - b[27] * this[2] - b[9] * this[3] + b[29] * this[4] + b[7] * this[5] + b[23] * this[6] + b[5] * this[7] - b[25] * this[8] - b[3] * this[9] - b[18] * this[10] + b[31] * this[11] + b[16] * this[12] + b[21] * this[13] + b[1] * this[14] - b[19] * this[15] - b[12] * this[16] + b[30] * this[17] + b[10] * this[18] + b[15] * this[19] + b[0] * this[20] - b[13] * this[21] - b[28] * this[22] - b[6] * this[23] + b[26] * this[24] + b[8] * this[25] + b[24] * this[26] + b[2] * this[27] - b[22] * this[28] - b[4] * this[29] + b[17] * this[30] + b[11] * this[31];
            target[21] = b[21] * this[0] + b[15] * this[1] - b[28] * this[2] - b[29] * this[3] - b[9] * this[4] + b[8] * this[5] + b[24] * this[6] + b[25] * this[7] + b[5] * this[8] - b[4] * this[9] - b[31] * this[10] - b[18] * this[11] + b[17] * this[12] - b[20] * this[13] + b[19] * this[14] + b[1] * this[15] - b[30] * this[16] - b[12] * this[17] + b[11] * this[18] - b[14] * this[19] + b[13] * this[20] + b[0] * this[21] + b[27] * this[22] - b[26] * this[23] - b[6] * this[24] - b[7] * this[25] - b[23] * this[26] + b[22] * this[27] + b[2] * this[28] + b[3] * this[29] - b[16] * this[30] - b[10] * this[31];
            target[22] = b[22] * this[0] + b[26] * this[1] + b[13] * this[2] - b[11] * this[3] + b[10] * this[4] + b[30] * this[5] - b[19] * this[6] + b[17] * this[7] - b[16] * this[8] - b[31] * this[9] + b[4] * this[10] - b[3] * this[11] - b[25] * this[12] + b[2] * this[13] + b[24] * this[14] - b[23] * this[15] + b[8] * this[16] - b[7] * this[17] - b[29] * this[18] + b[6] * this[19] + b[28] * this[20] - b[27] * this[21] + b[0] * this[22] + b[15] * this[23] - b[14] * this[24] + b[12] * this[25] - b[1] * this[26] - b[21] * this[27] + b[20] * this[28] - b[18] * this[29] - b[5] * this[30] - b[9] * this[31];
            target[23] = b[23] * this[0] + b[27] * this[1] + b[14] * this[2] - b[12] * this[3] + b[30] * this[4] + b[10] * this[5] - b[20] * this[6] + b[18] * this[7] - b[31] * this[8] - b[16] * this[9] + b[5] * this[10] - b[25] * this[11] - b[3] * this[12] + b[24] * this[13] + b[2] * this[14] - b[22] * this[15] + b[9] * this[16] - b[29] * this[17] - b[7] * this[18] + b[28] * this[19] + b[6] * this[20] - b[26] * this[21] + b[15] * this[22] + b[0] * this[23] - b[13] * this[24] + b[11] * this[25] - b[21] * this[26] - b[1] * this[27] + b[19] * this[28] - b[17] * this[29] - b[4] * this[30] - b[8] * this[31];
            target[24] = b[24] * this[0] + b[28] * this[1] + b[15] * this[2] - b[30] * this[3] - b[12] * this[4] + b[11] * this[5] - b[21] * this[6] + b[31] * this[7] + b[18] * this[8] - b[17] * this[9] + b[25] * this[10] + b[5] * this[11] - b[4] * this[12] - b[23] * this[13] + b[22] * this[14] + b[2] * this[15] + b[29] * this[16] + b[9] * this[17] - b[8] * this[18] - b[27] * this[19] + b[26] * this[20] + b[6] * this[21] - b[14] * this[22] + b[13] * this[23] + b[0] * this[24] - b[10] * this[25] + b[20] * this[26] - b[19] * this[27] - b[1] * this[28] + b[16] * this[29] + b[3] * this[30] + b[7] * this[31];
            target[25] = b[25] * this[0] + b[29] * this[1] + b[30] * this[2] + b[15] * this[3] - b[14] * this[4] + b[13] * this[5] - b[31] * this[6] - b[21] * this[7] + b[20] * this[8] - b[19] * this[9] - b[24] * this[10] + b[23] * this[11] - b[22] * this[12] + b[5] * this[13] - b[4] * this[14] + b[3] * this[15] - b[28] * this[16] + b[27] * this[17] - b[26] * this[18] + b[9] * this[19] - b[8] * this[20] + b[7] * this[21] + b[12] * this[22] - b[11] * this[23] + b[10] * this[24] + b[0] * this[25] - b[18] * this[26] + b[17] * this[27] - b[16] * this[28] - b[1] * this[29] - b[2] * this[30] - b[6] * this[31];
            target[26] = b[26] * this[0] + b[22] * this[1] - b[19] * this[2] + b[17] * this[3] - b[16] * this[4] - b[31] * this[5] + b[13] * this[6] - b[11] * this[7] + b[10] * this[8] + b[30] * this[9] + b[8] * this[10] - b[7] * this[11] - b[29] * this[12] + b[6] * this[13] + b[28] * this[14] - b[27] * this[15] + b[4] * this[16] - b[3] * this[17] - b[25] * this[18] + b[2] * this[19] + b[24] * this[20] - b[23] * this[21] - b[1] * this[22] - b[21] * this[23] + b[20] * this[24] - b[18] * this[25] + b[0] * this[26] + b[15] * this[27] - b[14] * this[28] + b[12] * this[29] - b[9] * this[30] - b[5] * this[31];
            target[27] = b[27] * this[0] + b[23] * this[1] - b[20] * this[2] + b[18] * this[3] - b[31] * this[4] - b[16] * this[5] + b[14] * this[6] - b[12] * this[7] + b[30] * this[8] + b[10] * this[9] + b[9] * this[10] - b[29] * this[11] - b[7] * this[12] + b[28] * this[13] + b[6] * this[14] - b[26] * this[15] + b[5] * this[16] - b[25] * this[17] - b[3] * this[18] + b[24] * this[19] + b[2] * this[20] - b[22] * this[21] - b[21] * this[22] - b[1] * this[23] + b[19] * this[24] - b[17] * this[25] + b[15] * this[26] + b[0] * this[27] - b[13] * this[28] + b[11] * this[29] - b[8] * this[30] - b[4] * this[31];
            target[28] = b[28] * this[0] + b[24] * this[1] - b[21] * this[2] + b[31] * this[3] + b[18] * this[4] - b[17] * this[5] + b[15] * this[6] - b[30] * this[7] - b[12] * this[8] + b[11] * this[9] + b[29] * this[10] + b[9] * this[11] - b[8] * this[12] - b[27] * this[13] + b[26] * this[14] + b[6] * this[15] + b[25] * this[16] + b[5] * this[17] - b[4] * this[18] - b[23] * this[19] + b[22] * this[20] + b[2] * this[21] + b[20] * this[22] - b[19] * this[23] - b[1] * this[24] + b[16] * this[25] - b[14] * this[26] + b[13] * this[27] + b[0] * this[28] - b[10] * this[29] + b[7] * this[30] + b[3] * this[31];
            target[29] = b[29] * this[0] + b[25] * this[1] - b[31] * this[2] - b[21] * this[3] + b[20] * this[4] - b[19] * this[5] + b[30] * this[6] + b[15] * this[7] - b[14] * this[8] + b[13] * this[9] - b[28] * this[10] + b[27] * this[11] - b[26] * this[12] + b[9] * this[13] - b[8] * this[14] + b[7] * this[15] - b[24] * this[16] + b[23] * this[17] - b[22] * this[18] + b[5] * this[19] - b[4] * this[20] + b[3] * this[21] - b[18] * this[22] + b[17] * this[23] - b[16] * this[24] - b[1] * this[25] + b[12] * this[26] - b[11] * this[27] + b[10] * this[28] + b[0] * this[29] - b[6] * this[30] - b[2] * this[31];
            target[30] = b[30] * this[0] + b[31] * this[1] + b[25] * this[2] - b[24] * this[3] + b[23] * this[4] - b[22] * this[5] - b[29] * this[6] + b[28] * this[7] - b[27] * this[8] + b[26] * this[9] + b[15] * this[10] - b[14] * this[11] + b[13] * this[12] + b[12] * this[13] - b[11] * this[14] + b[10] * this[15] + b[21] * this[16] - b[20] * this[17] + b[19] * this[18] + b[18] * this[19] - b[17] * this[20] + b[16] * this[21] + b[5] * this[22] - b[4] * this[23] + b[3] * this[24] - b[2] * this[25] - b[9] * this[26] + b[8] * this[27] - b[7] * this[28] + b[6] * this[29] + b[0] * this[30] + b[1] * this[31];
            target[31] = b[31] * this[0] + b[30] * this[1] - b[29] * this[2] + b[28] * this[3] - b[27] * this[4] + b[26] * this[5] + b[25] * this[6] - b[24] * this[7] + b[23] * this[8] - b[22] * this[9] + b[21] * this[10] - b[20] * this[11] + b[19] * this[12] + b[18] * this[13] - b[17] * this[14] + b[16] * this[15] + b[15] * this[16] - b[14] * this[17] + b[13] * this[18] + b[12] * this[19] - b[11] * this[20] + b[10] * this[21] - b[9] * this[22] + b[8] * this[23] - b[7] * this[24] + b[6] * this[25] + b[5] * this[26] - b[4] * this[27] + b[3] * this[28] - b[2] * this[29] + b[1] * this[30] + b[0] * this[31];
            return target
        }

        wedge(b, target) {
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
            return target
        }

        inner(b, target) {
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
            target[31] = b[31] * this[0] + b[0] * this[31];
            return target
        }
    }
    window.Mv41 = Mv41
    Mv41.indexGrades = [
        0,
        1, 1, 1, 1, 1,
        2, 2, 2, 2, 2, 2, 2, 2, 2, 2,
        3, 3, 3, 3, 3, 3, 3, 3, 3, 3,
        4, 4, 4, 4, 4,
        5
    ]
    Mv41.basisNames = ["", "1", "2", "3", "p", "m", "12", "13", "1p", "1m", "23", "2p", "2m", "3p", "3m", "pm", "123", "12p", "12m", "13p", "13m", "1pm", "23p", "23m", "2pm", "3pm", "123p", "123m", "12pm", "13pm", "23pm", "123pm"]

    mv0 = new Mv41(); mv1 = new Mv41(); mv2 = new Mv41(); mv3 = new Mv41(); mv4 = new Mv41(); mv5 = new Mv41(); mv6 = new Mv41(); mv7 = new Mv41(); mv8 = new Mv41(); mv9 = new Mv41(); mv10 = new Mv41(); mv11 = new Mv41(); mv12 = new Mv41(); mv13 = new Mv41(); mv14 = new Mv41(); mv15 = new Mv41()

    one = new Mv41().fromFloatAndIndex(1., 0)

    e1 = new Mv41().fromFloatAndIndex(1., 1)
    e2 = new Mv41().fromFloatAndIndex(1., 2)
    ep = new Mv41().fromFloatAndIndex(1., 3)
    em = new Mv41().fromFloatAndIndex(1., 4)
    e0 = ep.add(em, new Mv41())
    eo = ep.sub(em, new Mv41())

    e12 = e1.wedge(e2, new Mv41())
    e1p = e1.wedge(ep, new Mv41())
    e1m = e1.wedge(em, new Mv41())
    e2p = e2.wedge(ep, new Mv41())
    e2m = e2.wedge(em, new Mv41())
    epm = ep.wedge(em, new Mv41())

    e10 = e1.wedge(e0, new Mv41())
    e20 = e2.wedge(e0, new Mv41())
    e1230 = e1.wedge(e20, new Mv41())

    e1o = e1.wedge(eo, new Mv41())
    e2o = e2.wedge(eo, new Mv41())
    e3o = e3.wedge(eo, new Mv31())

    e123pm = e12p.wedge(em, new Mv41())

    //testing scale
    if (0) {
        let str = ``
        let str2 = ``
        for (let i = 0; i <= 3.; i += .01) {

            let zrcOnCircle = mv0.vecToZrc(v1.set(i, 0.))
            // zrcOnCircle.unrigorousNormalize(zrcOnCircle)
            let pointOnCircle = zrcOnCircle.inner(e123pm, mv1)
            let circle = e12.inner(pointOnCircle, mv2)
            // circle.log(``,3)
            let rotor = ep.mul(circle, mv3)
            rotor.cheapSqrt(rotor)

            // rotor.unrigorousNormalize(rotor)
            // rotor.log((i * 0.1).toFixed(2))
            let a = Math.asinh(rotor[10]) / Math.acosh(rotor[0])
            str += `  ` + Math.tanh(a) + `\n`
            str2 += i + `\n`
        }
        log(str)
        // log(str2)
    }

}