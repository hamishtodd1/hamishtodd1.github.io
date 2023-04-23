function init41WithoutDeclarations(basisNames) {

    const N_COEFS = 32

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

        approxEquals(a) {
            let doesEqual = true
            for (let i = 0; i < this.constructor.size; ++i) {
                if (Math.abs(this[i] - a[i]) > .0001)
                    doesEqual = false
            }
            return doesEqual
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
            if (target === undefined)
                target = new Mv()
                
            target.copy(zeroMv)
            for (let i = 0; i < this.constructor.size; ++i)
                target[this.constructor.mvOffsets[i]] = this[i]

            return target
        }

        add(a,target) {
            if(target === undefined)
                target = new Mv()

            for(let i = 0; i < this.constructor.size; ++i)
                target[i] = this[i] + a[i]
            return target
        }
        sub(a, target) {
            if (target === undefined)
                target = new Mv()

            for (let i = 0; i < this.constructor.size; ++i)
                target[i] = this[i] - a[i]
            return target
        }

        addScaled(v, scale) {
            for (let i = 0; i < this.constructor.size; ++i)
                this[i] += scale * v[i]
            return this
        }
    }
    window.GeneralVector = GeneralVector

    class Mv extends GeneralVector {
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
            let norm = this.norm()
            return norm === 0.?this:this.multiplyScalar(1./norm)
        }

        mul(mv) {
            let intermediary = mul(this,mv,newMv)
            this.copy(intermediary)
            return this
        }

        divideBy(mv,target) {
            if (target === undefined)
                target = new Mv()
                
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
                target = new Mv()
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
        //         target = new Mv()

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
                target = new Mv()

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

            return target
        }

        selectGrade(grade, target) {
            if(target === undefined)
                target = this
            else
                target.copy(this)

            for (let i = 0; i < 32; ++i) {
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

    {
        function getPlusAndMinus(psi, psiPlus, psiMinus) {
            //gamma0 is eMinus
            eMinus.sandwich(psi, psiPlus)
            psiMinus.copy(psiPlus).multiplyScalar(-1.)

            psiPlus.addScaled(psi, 1.).multiplyScalar(.5)
            psiMinus.addScaled(psi, 1.).multiplyScalar(.5)
        }
        let psiPlus = new Mv()
        let psiMinus = new Mv()
        let phiPlus = new Mv()
        let phiMinus = new Mv()
        let extra = new Mv()
        let ourReversion = new Mv()
        octonionMul = function (psi, phi, target) {
            getPlusAndMinus(psi, psiPlus, psiMinus)
            getPlusAndMinus(phi, phiPlus, phiMinus)

            mul(psiPlus, phiPlus, target)
            target.addScaled(phiMinus.reverse(ourReversion).mul(psiMinus, extra),1.)
            target.addScaled(mul(phiMinus,psiPlus,extra),1.)
            target.addScaled(psiMinus.mul(phiPlus.reverse(ourReversion), extra), 1.)
            return target
        }
    }

    let indexGrades = [
        0,                    // CGA           4D HPGA
        1,1,1,1,1,            //sphere         3-plane
        2,2,2,2,2,2,2,2,2,2,  //circle         plane
        3,3,3,3,3,3,3,3,3,3,  //point pair     line
        4,4,4,4,4,            //point          point
        5
    ]

    /*EXTRA FUNCTIONS ADDED HERE*/

    function MvFromFloatAndIndex(float, index) {
        let mv = new Mv()
        mv[index] = float
        return mv
    }

    zeroMv = new Mv()
    oneMv = new Mv()
    oneMv[ 0] = 1.
    let minusOneMv = new Mv()
    minusOneMv[ 0] = -1.

    e1 = MvFromFloatAndIndex(1., 1)
    e2 = MvFromFloatAndIndex(1., 2)
    e3 = MvFromFloatAndIndex(1., 3)
    e12 = mul(e1, e2)
    e31 = mul(e3, e1)
    e23 = mul(e2, e3)
    e123 = mul(e1, e23)
    e13 = mul(e1, e3)
    
    ePlus = MvFromFloatAndIndex(1., 4)
    eMinus = MvFromFloatAndIndex(1., 5)
    e4 = ePlus
    e5 = eMinus
    e45 = mul(e4,e5)
    ePlusMinus = mul(ePlus,eMinus)
    e123PlusMinus = mul(e123, ePlusMinus)

    e1Plus = mul(e1,ePlus)
    e1Minus = mul(e1, eMinus)
    e12Plus = mul(e12, ePlus)
    e12Minus = mul(e12, eMinus)
    e1PlusMinus = mul(e1, ePlusMinus)
    e2PlusMinus = mul(e2, ePlusMinus)
    nI = ePlus.add(eMinus, new Mv()) //like e0. It's a plane.
    nO = ePlus.sub(eMinus, new Mv())
    // nIDual = mul(nI, e123PlusMinus) //they're points, so only work for one space
    nODual = mul(nO, e123PlusMinus)
    e0 = nI.multiplyScalar(-1.)

    e01 = mul(nI, e1).multiplyScalar(.5)
    e02 = mul(nI, e2).multiplyScalar(.5)
    e03 = mul(nI, e3).multiplyScalar(.5)


    mv0 = new Mv()
    mv1 = new Mv()
    mv2 = new Mv()
    mv3 = new Mv()
    mv4 = new Mv()
    mv5 = new Mv()
    mv6 = new Mv()

/*END*/}


function createVerboseSharedFunctions(createFunction) {

    createFunction(`mul`, [`a`, `b`], `
    target[ 0] = b[ 0] * a[ 0] + b[ 1] * a[ 1] + b[ 2] * a[ 2] + b[ 3] * a[ 3] + b[ 4] * a[ 4] - b[ 5] * a[ 5] - b[ 6] * a[ 6] - b[ 7] * a[ 7] - b[ 8] * a[ 8] + b[ 9] * a[ 9] - b[10] * a[10] - b[11] * a[11] + b[12] * a[12] - b[13] * a[13] + b[14] * a[14] + b[15] * a[15] - b[16] * a[16] - b[17] * a[17] + b[18] * a[18] - b[19] * a[19] + b[20] * a[20] + b[21] * a[21] - b[22] * a[22] + b[23] * a[23] + b[24] * a[24] + b[25] * a[25] + b[26] * a[26] - b[27] * a[27] - b[28] * a[28] - b[29] * a[29] - b[30] * a[30] - b[31] * a[31];
    target[ 1] = b[ 1] * a[ 0] + b[ 0] * a[ 1] - b[ 6] * a[ 2] - b[ 7] * a[ 3] - b[ 8] * a[ 4] + b[ 9] * a[ 5] + b[ 2] * a[ 6] + b[ 3] * a[ 7] + b[ 4] * a[ 8] - b[ 5] * a[ 9] - b[16] * a[10] - b[17] * a[11] + b[18] * a[12] - b[19] * a[13] + b[20] * a[14] + b[21] * a[15] - b[10] * a[16] - b[11] * a[17] + b[12] * a[18] - b[13] * a[19] + b[14] * a[20] + b[15] * a[21] + b[26] * a[22] - b[27] * a[23] - b[28] * a[24] - b[29] * a[25] - b[22] * a[26] + b[23] * a[27] + b[24] * a[28] + b[25] * a[29] - b[31] * a[30] - b[30] * a[31];
    target[ 2] = b[ 2] * a[ 0] + b[ 6] * a[ 1] + b[ 0] * a[ 2] - b[10] * a[ 3] - b[11] * a[ 4] + b[12] * a[ 5] - b[ 1] * a[ 6] + b[16] * a[ 7] + b[17] * a[ 8] - b[18] * a[ 9] + b[ 3] * a[10] + b[ 4] * a[11] - b[ 5] * a[12] - b[22] * a[13] + b[23] * a[14] + b[24] * a[15] + b[ 7] * a[16] + b[ 8] * a[17] - b[ 9] * a[18] - b[26] * a[19] + b[27] * a[20] + b[28] * a[21] - b[13] * a[22] + b[14] * a[23] + b[15] * a[24] - b[30] * a[25] + b[19] * a[26] - b[20] * a[27] - b[21] * a[28] + b[31] * a[29] + b[25] * a[30] + b[29] * a[31];
    target[ 3] = b[ 3] * a[ 0] + b[ 7] * a[ 1] + b[10] * a[ 2] + b[ 0] * a[ 3] - b[13] * a[ 4] + b[14] * a[ 5] - b[16] * a[ 6] - b[ 1] * a[ 7] + b[19] * a[ 8] - b[20] * a[ 9] - b[ 2] * a[10] + b[22] * a[11] - b[23] * a[12] + b[ 4] * a[13] - b[ 5] * a[14] + b[25] * a[15] - b[ 6] * a[16] + b[26] * a[17] - b[27] * a[18] + b[ 8] * a[19] - b[ 9] * a[20] + b[29] * a[21] + b[11] * a[22] - b[12] * a[23] + b[30] * a[24] + b[15] * a[25] - b[17] * a[26] + b[18] * a[27] - b[31] * a[28] - b[21] * a[29] - b[24] * a[30] - b[28] * a[31];
    target[ 4] = b[ 4] * a[ 0] + b[ 8] * a[ 1] + b[11] * a[ 2] + b[13] * a[ 3] + b[ 0] * a[ 4] + b[15] * a[ 5] - b[17] * a[ 6] - b[19] * a[ 7] - b[ 1] * a[ 8] - b[21] * a[ 9] - b[22] * a[10] - b[ 2] * a[11] - b[24] * a[12] - b[ 3] * a[13] - b[25] * a[14] - b[ 5] * a[15] - b[26] * a[16] - b[ 6] * a[17] - b[28] * a[18] - b[ 7] * a[19] - b[29] * a[20] - b[ 9] * a[21] - b[10] * a[22] - b[30] * a[23] - b[12] * a[24] - b[14] * a[25] + b[16] * a[26] + b[31] * a[27] + b[18] * a[28] + b[20] * a[29] + b[23] * a[30] + b[27] * a[31];
    target[ 5] = b[ 5] * a[ 0] + b[ 9] * a[ 1] + b[12] * a[ 2] + b[14] * a[ 3] + b[15] * a[ 4] + b[ 0] * a[ 5] - b[18] * a[ 6] - b[20] * a[ 7] - b[21] * a[ 8] - b[ 1] * a[ 9] - b[23] * a[10] - b[24] * a[11] - b[ 2] * a[12] - b[25] * a[13] - b[ 3] * a[14] - b[ 4] * a[15] - b[27] * a[16] - b[28] * a[17] - b[ 6] * a[18] - b[29] * a[19] - b[ 7] * a[20] - b[ 8] * a[21] - b[30] * a[22] - b[10] * a[23] - b[11] * a[24] - b[13] * a[25] + b[31] * a[26] + b[16] * a[27] + b[17] * a[28] + b[19] * a[29] + b[22] * a[30] + b[26] * a[31];
    target[ 6] = b[ 6] * a[ 0] + b[ 2] * a[ 1] - b[ 1] * a[ 2] + b[16] * a[ 3] + b[17] * a[ 4] - b[18] * a[ 5] + b[ 0] * a[ 6] - b[10] * a[ 7] - b[11] * a[ 8] + b[12] * a[ 9] + b[ 7] * a[10] + b[ 8] * a[11] - b[ 9] * a[12] - b[26] * a[13] + b[27] * a[14] + b[28] * a[15] + b[ 3] * a[16] + b[ 4] * a[17] - b[ 5] * a[18] - b[22] * a[19] + b[23] * a[20] + b[24] * a[21] + b[19] * a[22] - b[20] * a[23] - b[21] * a[24] + b[31] * a[25] - b[13] * a[26] + b[14] * a[27] + b[15] * a[28] - b[30] * a[29] + b[29] * a[30] + b[25] * a[31];
    target[ 7] = b[ 7] * a[ 0] + b[ 3] * a[ 1] - b[16] * a[ 2] - b[ 1] * a[ 3] + b[19] * a[ 4] - b[20] * a[ 5] + b[10] * a[ 6] + b[ 0] * a[ 7] - b[13] * a[ 8] + b[14] * a[ 9] - b[ 6] * a[10] + b[26] * a[11] - b[27] * a[12] + b[ 8] * a[13] - b[ 9] * a[14] + b[29] * a[15] - b[ 2] * a[16] + b[22] * a[17] - b[23] * a[18] + b[ 4] * a[19] - b[ 5] * a[20] + b[25] * a[21] - b[17] * a[22] + b[18] * a[23] - b[31] * a[24] - b[21] * a[25] + b[11] * a[26] - b[12] * a[27] + b[30] * a[28] + b[15] * a[29] - b[28] * a[30] - b[24] * a[31];
    target[ 8] = b[ 8] * a[ 0] + b[ 4] * a[ 1] - b[17] * a[ 2] - b[19] * a[ 3] - b[ 1] * a[ 4] - b[21] * a[ 5] + b[11] * a[ 6] + b[13] * a[ 7] + b[ 0] * a[ 8] + b[15] * a[ 9] - b[26] * a[10] - b[ 6] * a[11] - b[28] * a[12] - b[ 7] * a[13] - b[29] * a[14] - b[ 9] * a[15] - b[22] * a[16] - b[ 2] * a[17] - b[24] * a[18] - b[ 3] * a[19] - b[25] * a[20] - b[ 5] * a[21] + b[16] * a[22] + b[31] * a[23] + b[18] * a[24] + b[20] * a[25] - b[10] * a[26] - b[30] * a[27] - b[12] * a[28] - b[14] * a[29] + b[27] * a[30] + b[23] * a[31];
    target[ 9] = b[ 9] * a[ 0] + b[ 5] * a[ 1] - b[18] * a[ 2] - b[20] * a[ 3] - b[21] * a[ 4] - b[ 1] * a[ 5] + b[12] * a[ 6] + b[14] * a[ 7] + b[15] * a[ 8] + b[ 0] * a[ 9] - b[27] * a[10] - b[28] * a[11] - b[ 6] * a[12] - b[29] * a[13] - b[ 7] * a[14] - b[ 8] * a[15] - b[23] * a[16] - b[24] * a[17] - b[ 2] * a[18] - b[25] * a[19] - b[ 3] * a[20] - b[ 4] * a[21] + b[31] * a[22] + b[16] * a[23] + b[17] * a[24] + b[19] * a[25] - b[30] * a[26] - b[10] * a[27] - b[11] * a[28] - b[13] * a[29] + b[26] * a[30] + b[22] * a[31];
    target[10] = b[10] * a[ 0] + b[16] * a[ 1] + b[ 3] * a[ 2] - b[ 2] * a[ 3] + b[22] * a[ 4] - b[23] * a[ 5] - b[ 7] * a[ 6] + b[ 6] * a[ 7] - b[26] * a[ 8] + b[27] * a[ 9] + b[ 0] * a[10] - b[13] * a[11] + b[14] * a[12] + b[11] * a[13] - b[12] * a[14] + b[30] * a[15] + b[ 1] * a[16] - b[19] * a[17] + b[20] * a[18] + b[17] * a[19] - b[18] * a[20] + b[31] * a[21] + b[ 4] * a[22] - b[ 5] * a[23] + b[25] * a[24] - b[24] * a[25] - b[ 8] * a[26] + b[ 9] * a[27] - b[29] * a[28] + b[28] * a[29] + b[15] * a[30] + b[21] * a[31];
    target[11] = b[11] * a[ 0] + b[17] * a[ 1] + b[ 4] * a[ 2] - b[22] * a[ 3] - b[ 2] * a[ 4] - b[24] * a[ 5] - b[ 8] * a[ 6] + b[26] * a[ 7] + b[ 6] * a[ 8] + b[28] * a[ 9] + b[13] * a[10] + b[ 0] * a[11] + b[15] * a[12] - b[10] * a[13] - b[30] * a[14] - b[12] * a[15] + b[19] * a[16] + b[ 1] * a[17] + b[21] * a[18] - b[16] * a[19] - b[31] * a[20] - b[18] * a[21] - b[ 3] * a[22] - b[25] * a[23] - b[ 5] * a[24] + b[23] * a[25] + b[ 7] * a[26] + b[29] * a[27] + b[ 9] * a[28] - b[27] * a[29] - b[14] * a[30] - b[20] * a[31];
    target[12] = b[12] * a[ 0] + b[18] * a[ 1] + b[ 5] * a[ 2] - b[23] * a[ 3] - b[24] * a[ 4] - b[ 2] * a[ 5] - b[ 9] * a[ 6] + b[27] * a[ 7] + b[28] * a[ 8] + b[ 6] * a[ 9] + b[14] * a[10] + b[15] * a[11] + b[ 0] * a[12] - b[30] * a[13] - b[10] * a[14] - b[11] * a[15] + b[20] * a[16] + b[21] * a[17] + b[ 1] * a[18] - b[31] * a[19] - b[16] * a[20] - b[17] * a[21] - b[25] * a[22] - b[ 3] * a[23] - b[ 4] * a[24] + b[22] * a[25] + b[29] * a[26] + b[ 7] * a[27] + b[ 8] * a[28] - b[26] * a[29] - b[13] * a[30] - b[19] * a[31];
    target[13] = b[13] * a[ 0] + b[19] * a[ 1] + b[22] * a[ 2] + b[ 4] * a[ 3] - b[ 3] * a[ 4] - b[25] * a[ 5] - b[26] * a[ 6] - b[ 8] * a[ 7] + b[ 7] * a[ 8] + b[29] * a[ 9] - b[11] * a[10] + b[10] * a[11] + b[30] * a[12] + b[ 0] * a[13] + b[15] * a[14] - b[14] * a[15] - b[17] * a[16] + b[16] * a[17] + b[31] * a[18] + b[ 1] * a[19] + b[21] * a[20] - b[20] * a[21] + b[ 2] * a[22] + b[24] * a[23] - b[23] * a[24] - b[ 5] * a[25] - b[ 6] * a[26] - b[28] * a[27] + b[27] * a[28] + b[ 9] * a[29] + b[12] * a[30] + b[18] * a[31];
    target[14] = b[14] * a[ 0] + b[20] * a[ 1] + b[23] * a[ 2] + b[ 5] * a[ 3] - b[25] * a[ 4] - b[ 3] * a[ 5] - b[27] * a[ 6] - b[ 9] * a[ 7] + b[29] * a[ 8] + b[ 7] * a[ 9] - b[12] * a[10] + b[30] * a[11] + b[10] * a[12] + b[15] * a[13] + b[ 0] * a[14] - b[13] * a[15] - b[18] * a[16] + b[31] * a[17] + b[16] * a[18] + b[21] * a[19] + b[ 1] * a[20] - b[19] * a[21] + b[24] * a[22] + b[ 2] * a[23] - b[22] * a[24] - b[ 4] * a[25] - b[28] * a[26] - b[ 6] * a[27] + b[26] * a[28] + b[ 8] * a[29] + b[11] * a[30] + b[17] * a[31];
    target[15] = b[15] * a[ 0] + b[21] * a[ 1] + b[24] * a[ 2] + b[25] * a[ 3] + b[ 5] * a[ 4] - b[ 4] * a[ 5] - b[28] * a[ 6] - b[29] * a[ 7] - b[ 9] * a[ 8] + b[ 8] * a[ 9] - b[30] * a[10] - b[12] * a[11] + b[11] * a[12] - b[14] * a[13] + b[13] * a[14] + b[ 0] * a[15] - b[31] * a[16] - b[18] * a[17] + b[17] * a[18] - b[20] * a[19] + b[19] * a[20] + b[ 1] * a[21] - b[23] * a[22] + b[22] * a[23] + b[ 2] * a[24] + b[ 3] * a[25] + b[27] * a[26] - b[26] * a[27] - b[ 6] * a[28] - b[ 7] * a[29] - b[10] * a[30] - b[16] * a[31];
    target[16] = b[16] * a[ 0] + b[10] * a[ 1] - b[ 7] * a[ 2] + b[ 6] * a[ 3] - b[26] * a[ 4] + b[27] * a[ 5] + b[ 3] * a[ 6] - b[ 2] * a[ 7] + b[22] * a[ 8] - b[23] * a[ 9] + b[ 1] * a[10] - b[19] * a[11] + b[20] * a[12] + b[17] * a[13] - b[18] * a[14] + b[31] * a[15] + b[ 0] * a[16] - b[13] * a[17] + b[14] * a[18] + b[11] * a[19] - b[12] * a[20] + b[30] * a[21] - b[ 8] * a[22] + b[ 9] * a[23] - b[29] * a[24] + b[28] * a[25] + b[ 4] * a[26] - b[ 5] * a[27] + b[25] * a[28] - b[24] * a[29] + b[21] * a[30] + b[15] * a[31];
    target[17] = b[17] * a[ 0] + b[11] * a[ 1] - b[ 8] * a[ 2] + b[26] * a[ 3] + b[ 6] * a[ 4] + b[28] * a[ 5] + b[ 4] * a[ 6] - b[22] * a[ 7] - b[ 2] * a[ 8] - b[24] * a[ 9] + b[19] * a[10] + b[ 1] * a[11] + b[21] * a[12] - b[16] * a[13] - b[31] * a[14] - b[18] * a[15] + b[13] * a[16] + b[ 0] * a[17] + b[15] * a[18] - b[10] * a[19] - b[30] * a[20] - b[12] * a[21] + b[ 7] * a[22] + b[29] * a[23] + b[ 9] * a[24] - b[27] * a[25] - b[ 3] * a[26] - b[25] * a[27] - b[ 5] * a[28] + b[23] * a[29] - b[20] * a[30] - b[14] * a[31];
    target[18] = b[18] * a[ 0] + b[12] * a[ 1] - b[ 9] * a[ 2] + b[27] * a[ 3] + b[28] * a[ 4] + b[ 6] * a[ 5] + b[ 5] * a[ 6] - b[23] * a[ 7] - b[24] * a[ 8] - b[ 2] * a[ 9] + b[20] * a[10] + b[21] * a[11] + b[ 1] * a[12] - b[31] * a[13] - b[16] * a[14] - b[17] * a[15] + b[14] * a[16] + b[15] * a[17] + b[ 0] * a[18] - b[30] * a[19] - b[10] * a[20] - b[11] * a[21] + b[29] * a[22] + b[ 7] * a[23] + b[ 8] * a[24] - b[26] * a[25] - b[25] * a[26] - b[ 3] * a[27] - b[ 4] * a[28] + b[22] * a[29] - b[19] * a[30] - b[13] * a[31];
    target[19] = b[19] * a[ 0] + b[13] * a[ 1] - b[26] * a[ 2] - b[ 8] * a[ 3] + b[ 7] * a[ 4] + b[29] * a[ 5] + b[22] * a[ 6] + b[ 4] * a[ 7] - b[ 3] * a[ 8] - b[25] * a[ 9] - b[17] * a[10] + b[16] * a[11] + b[31] * a[12] + b[ 1] * a[13] + b[21] * a[14] - b[20] * a[15] - b[11] * a[16] + b[10] * a[17] + b[30] * a[18] + b[ 0] * a[19] + b[15] * a[20] - b[14] * a[21] - b[ 6] * a[22] - b[28] * a[23] + b[27] * a[24] + b[ 9] * a[25] + b[ 2] * a[26] + b[24] * a[27] - b[23] * a[28] - b[ 5] * a[29] + b[18] * a[30] + b[12] * a[31];
    target[20] = b[20] * a[ 0] + b[14] * a[ 1] - b[27] * a[ 2] - b[ 9] * a[ 3] + b[29] * a[ 4] + b[ 7] * a[ 5] + b[23] * a[ 6] + b[ 5] * a[ 7] - b[25] * a[ 8] - b[ 3] * a[ 9] - b[18] * a[10] + b[31] * a[11] + b[16] * a[12] + b[21] * a[13] + b[ 1] * a[14] - b[19] * a[15] - b[12] * a[16] + b[30] * a[17] + b[10] * a[18] + b[15] * a[19] + b[ 0] * a[20] - b[13] * a[21] - b[28] * a[22] - b[ 6] * a[23] + b[26] * a[24] + b[ 8] * a[25] + b[24] * a[26] + b[ 2] * a[27] - b[22] * a[28] - b[ 4] * a[29] + b[17] * a[30] + b[11] * a[31];
    target[21] = b[21] * a[ 0] + b[15] * a[ 1] - b[28] * a[ 2] - b[29] * a[ 3] - b[ 9] * a[ 4] + b[ 8] * a[ 5] + b[24] * a[ 6] + b[25] * a[ 7] + b[ 5] * a[ 8] - b[ 4] * a[ 9] - b[31] * a[10] - b[18] * a[11] + b[17] * a[12] - b[20] * a[13] + b[19] * a[14] + b[ 1] * a[15] - b[30] * a[16] - b[12] * a[17] + b[11] * a[18] - b[14] * a[19] + b[13] * a[20] + b[ 0] * a[21] + b[27] * a[22] - b[26] * a[23] - b[ 6] * a[24] - b[ 7] * a[25] - b[23] * a[26] + b[22] * a[27] + b[ 2] * a[28] + b[ 3] * a[29] - b[16] * a[30] - b[10] * a[31];
    target[22] = b[22] * a[ 0] + b[26] * a[ 1] + b[13] * a[ 2] - b[11] * a[ 3] + b[10] * a[ 4] + b[30] * a[ 5] - b[19] * a[ 6] + b[17] * a[ 7] - b[16] * a[ 8] - b[31] * a[ 9] + b[ 4] * a[10] - b[ 3] * a[11] - b[25] * a[12] + b[ 2] * a[13] + b[24] * a[14] - b[23] * a[15] + b[ 8] * a[16] - b[ 7] * a[17] - b[29] * a[18] + b[ 6] * a[19] + b[28] * a[20] - b[27] * a[21] + b[ 0] * a[22] + b[15] * a[23] - b[14] * a[24] + b[12] * a[25] - b[ 1] * a[26] - b[21] * a[27] + b[20] * a[28] - b[18] * a[29] - b[ 5] * a[30] - b[ 9] * a[31];
    target[23] = b[23] * a[ 0] + b[27] * a[ 1] + b[14] * a[ 2] - b[12] * a[ 3] + b[30] * a[ 4] + b[10] * a[ 5] - b[20] * a[ 6] + b[18] * a[ 7] - b[31] * a[ 8] - b[16] * a[ 9] + b[ 5] * a[10] - b[25] * a[11] - b[ 3] * a[12] + b[24] * a[13] + b[ 2] * a[14] - b[22] * a[15] + b[ 9] * a[16] - b[29] * a[17] - b[ 7] * a[18] + b[28] * a[19] + b[ 6] * a[20] - b[26] * a[21] + b[15] * a[22] + b[ 0] * a[23] - b[13] * a[24] + b[11] * a[25] - b[21] * a[26] - b[ 1] * a[27] + b[19] * a[28] - b[17] * a[29] - b[ 4] * a[30] - b[ 8] * a[31];
    target[24] = b[24] * a[ 0] + b[28] * a[ 1] + b[15] * a[ 2] - b[30] * a[ 3] - b[12] * a[ 4] + b[11] * a[ 5] - b[21] * a[ 6] + b[31] * a[ 7] + b[18] * a[ 8] - b[17] * a[ 9] + b[25] * a[10] + b[ 5] * a[11] - b[ 4] * a[12] - b[23] * a[13] + b[22] * a[14] + b[ 2] * a[15] + b[29] * a[16] + b[ 9] * a[17] - b[ 8] * a[18] - b[27] * a[19] + b[26] * a[20] + b[ 6] * a[21] - b[14] * a[22] + b[13] * a[23] + b[ 0] * a[24] - b[10] * a[25] + b[20] * a[26] - b[19] * a[27] - b[ 1] * a[28] + b[16] * a[29] + b[ 3] * a[30] + b[ 7] * a[31];
    target[25] = b[25] * a[ 0] + b[29] * a[ 1] + b[30] * a[ 2] + b[15] * a[ 3] - b[14] * a[ 4] + b[13] * a[ 5] - b[31] * a[ 6] - b[21] * a[ 7] + b[20] * a[ 8] - b[19] * a[ 9] - b[24] * a[10] + b[23] * a[11] - b[22] * a[12] + b[ 5] * a[13] - b[ 4] * a[14] + b[ 3] * a[15] - b[28] * a[16] + b[27] * a[17] - b[26] * a[18] + b[ 9] * a[19] - b[ 8] * a[20] + b[ 7] * a[21] + b[12] * a[22] - b[11] * a[23] + b[10] * a[24] + b[ 0] * a[25] - b[18] * a[26] + b[17] * a[27] - b[16] * a[28] - b[ 1] * a[29] - b[ 2] * a[30] - b[ 6] * a[31];
    target[26] = b[26] * a[ 0] + b[22] * a[ 1] - b[19] * a[ 2] + b[17] * a[ 3] - b[16] * a[ 4] - b[31] * a[ 5] + b[13] * a[ 6] - b[11] * a[ 7] + b[10] * a[ 8] + b[30] * a[ 9] + b[ 8] * a[10] - b[ 7] * a[11] - b[29] * a[12] + b[ 6] * a[13] + b[28] * a[14] - b[27] * a[15] + b[ 4] * a[16] - b[ 3] * a[17] - b[25] * a[18] + b[ 2] * a[19] + b[24] * a[20] - b[23] * a[21] - b[ 1] * a[22] - b[21] * a[23] + b[20] * a[24] - b[18] * a[25] + b[ 0] * a[26] + b[15] * a[27] - b[14] * a[28] + b[12] * a[29] - b[ 9] * a[30] - b[ 5] * a[31];
    target[27] = b[27] * a[ 0] + b[23] * a[ 1] - b[20] * a[ 2] + b[18] * a[ 3] - b[31] * a[ 4] - b[16] * a[ 5] + b[14] * a[ 6] - b[12] * a[ 7] + b[30] * a[ 8] + b[10] * a[ 9] + b[ 9] * a[10] - b[29] * a[11] - b[ 7] * a[12] + b[28] * a[13] + b[ 6] * a[14] - b[26] * a[15] + b[ 5] * a[16] - b[25] * a[17] - b[ 3] * a[18] + b[24] * a[19] + b[ 2] * a[20] - b[22] * a[21] - b[21] * a[22] - b[ 1] * a[23] + b[19] * a[24] - b[17] * a[25] + b[15] * a[26] + b[ 0] * a[27] - b[13] * a[28] + b[11] * a[29] - b[ 8] * a[30] - b[ 4] * a[31];
    target[28] = b[28] * a[ 0] + b[24] * a[ 1] - b[21] * a[ 2] + b[31] * a[ 3] + b[18] * a[ 4] - b[17] * a[ 5] + b[15] * a[ 6] - b[30] * a[ 7] - b[12] * a[ 8] + b[11] * a[ 9] + b[29] * a[10] + b[ 9] * a[11] - b[ 8] * a[12] - b[27] * a[13] + b[26] * a[14] + b[ 6] * a[15] + b[25] * a[16] + b[ 5] * a[17] - b[ 4] * a[18] - b[23] * a[19] + b[22] * a[20] + b[ 2] * a[21] + b[20] * a[22] - b[19] * a[23] - b[ 1] * a[24] + b[16] * a[25] - b[14] * a[26] + b[13] * a[27] + b[ 0] * a[28] - b[10] * a[29] + b[ 7] * a[30] + b[ 3] * a[31];
    target[29] = b[29] * a[ 0] + b[25] * a[ 1] - b[31] * a[ 2] - b[21] * a[ 3] + b[20] * a[ 4] - b[19] * a[ 5] + b[30] * a[ 6] + b[15] * a[ 7] - b[14] * a[ 8] + b[13] * a[ 9] - b[28] * a[10] + b[27] * a[11] - b[26] * a[12] + b[ 9] * a[13] - b[ 8] * a[14] + b[ 7] * a[15] - b[24] * a[16] + b[23] * a[17] - b[22] * a[18] + b[ 5] * a[19] - b[ 4] * a[20] + b[ 3] * a[21] - b[18] * a[22] + b[17] * a[23] - b[16] * a[24] - b[ 1] * a[25] + b[12] * a[26] - b[11] * a[27] + b[10] * a[28] + b[ 0] * a[29] - b[ 6] * a[30] - b[ 2] * a[31];
    target[30] = b[30] * a[ 0] + b[31] * a[ 1] + b[25] * a[ 2] - b[24] * a[ 3] + b[23] * a[ 4] - b[22] * a[ 5] - b[29] * a[ 6] + b[28] * a[ 7] - b[27] * a[ 8] + b[26] * a[ 9] + b[15] * a[10] - b[14] * a[11] + b[13] * a[12] + b[12] * a[13] - b[11] * a[14] + b[10] * a[15] + b[21] * a[16] - b[20] * a[17] + b[19] * a[18] + b[18] * a[19] - b[17] * a[20] + b[16] * a[21] + b[ 5] * a[22] - b[ 4] * a[23] + b[ 3] * a[24] - b[ 2] * a[25] - b[ 9] * a[26] + b[ 8] * a[27] - b[ 7] * a[28] + b[ 6] * a[29] + b[ 0] * a[30] + b[ 1] * a[31];
    target[31] = b[31] * a[ 0] + b[30] * a[ 1] - b[29] * a[ 2] + b[28] * a[ 3] - b[27] * a[ 4] + b[26] * a[ 5] + b[25] * a[ 6] - b[24] * a[ 7] + b[23] * a[ 8] - b[22] * a[ 9] + b[21] * a[10] - b[20] * a[11] + b[19] * a[12] + b[18] * a[13] - b[17] * a[14] + b[16] * a[15] + b[15] * a[16] - b[14] * a[17] + b[13] * a[18] + b[12] * a[19] - b[11] * a[20] + b[10] * a[21] - b[ 9] * a[22] + b[ 8] * a[23] - b[ 7] * a[24] + b[ 6] * a[25] + b[ 5] * a[26] - b[ 4] * a[27] + b[ 3] * a[28] - b[ 2] * a[29] + b[ 1] * a[30] + b[ 0] * a[31];`)

    createFunction(`meet`, [`a`, `b`], `
    target[ 0] = b[ 0] * a[ 0];
    target[ 1] = b[ 1] * a[ 0] + b[ 0] * a[ 1];
    target[ 2] = b[ 2] * a[ 0] + b[ 0] * a[ 2];
    target[ 3] = b[ 3] * a[ 0] + b[ 0] * a[ 3];
    target[ 4] = b[ 4] * a[ 0] + b[ 0] * a[ 4];
    target[ 5] = b[ 5] * a[ 0] + b[ 0] * a[ 5];
    target[ 6] = b[ 6] * a[ 0] + b[ 2] * a[ 1] - b[ 1] * a[ 2] + b[ 0] * a[ 6];
    target[ 7] = b[ 7] * a[ 0] + b[ 3] * a[ 1] - b[ 1] * a[ 3] + b[ 0] * a[ 7];
    target[ 8] = b[ 8] * a[ 0] + b[ 4] * a[ 1] - b[ 1] * a[ 4] + b[ 0] * a[ 8];
    target[ 9] = b[ 9] * a[ 0] + b[ 5] * a[ 1] - b[ 1] * a[ 5] + b[ 0] * a[ 9];
    target[10] = b[10] * a[ 0] + b[ 3] * a[ 2] - b[ 2] * a[ 3] + b[ 0] * a[10];
    target[11] = b[11] * a[ 0] + b[ 4] * a[ 2] - b[ 2] * a[ 4] + b[ 0] * a[11];
    target[12] = b[12] * a[ 0] + b[ 5] * a[ 2] - b[ 2] * a[ 5] + b[ 0] * a[12];
    target[13] = b[13] * a[ 0] + b[ 4] * a[ 3] - b[ 3] * a[ 4] + b[ 0] * a[13];
    target[14] = b[14] * a[ 0] + b[ 5] * a[ 3] - b[ 3] * a[ 5] + b[ 0] * a[14];
    target[15] = b[15] * a[ 0] + b[ 5] * a[ 4] - b[ 4] * a[ 5] + b[ 0] * a[15];
    target[16] = b[16] * a[ 0] + b[10] * a[ 1] - b[ 7] * a[ 2] + b[ 6] * a[ 3] + b[ 3] * a[ 6] - b[ 2] * a[ 7] + b[ 1] * a[10] + b[ 0] * a[16];
    target[17] = b[17] * a[ 0] + b[11] * a[ 1] - b[ 8] * a[ 2] + b[ 6] * a[ 4] + b[ 4] * a[ 6] - b[ 2] * a[ 8] + b[ 1] * a[11] + b[ 0] * a[17];
    target[18] = b[18] * a[ 0] + b[12] * a[ 1] - b[ 9] * a[ 2] + b[ 6] * a[ 5] + b[ 5] * a[ 6] - b[ 2] * a[ 9] + b[ 1] * a[12] + b[ 0] * a[18];
    target[19] = b[19] * a[ 0] + b[13] * a[ 1] - b[ 8] * a[ 3] + b[ 7] * a[ 4] + b[ 4] * a[ 7] - b[ 3] * a[ 8] + b[ 1] * a[13] + b[ 0] * a[19];
    target[20] = b[20] * a[ 0] + b[14] * a[ 1] - b[ 9] * a[ 3] + b[ 7] * a[ 5] + b[ 5] * a[ 7] - b[ 3] * a[ 9] + b[ 1] * a[14] + b[ 0] * a[20];
    target[21] = b[21] * a[ 0] + b[15] * a[ 1] - b[ 9] * a[ 4] + b[ 8] * a[ 5] + b[ 5] * a[ 8] - b[ 4] * a[ 9] + b[ 1] * a[15] + b[ 0] * a[21];
    target[22] = b[22] * a[ 0] + b[13] * a[ 2] - b[11] * a[ 3] + b[10] * a[ 4] + b[ 4] * a[10] - b[ 3] * a[11] + b[ 2] * a[13] + b[ 0] * a[22];
    target[23] = b[23] * a[ 0] + b[14] * a[ 2] - b[12] * a[ 3] + b[10] * a[ 5] + b[ 5] * a[10] - b[ 3] * a[12] + b[ 2] * a[14] + b[ 0] * a[23];
    target[24] = b[24] * a[ 0] + b[15] * a[ 2] - b[12] * a[ 4] + b[11] * a[ 5] + b[ 5] * a[11] - b[ 4] * a[12] + b[ 2] * a[15] + b[ 0] * a[24];
    target[25] = b[25] * a[ 0] + b[15] * a[ 3] - b[14] * a[ 4] + b[13] * a[ 5] + b[ 5] * a[13] - b[ 4] * a[14] + b[ 3] * a[15] + b[ 0] * a[25];
    target[26] = b[26] * a[ 0] + b[22] * a[ 1] - b[19] * a[ 2] + b[17] * a[ 3] - b[16] * a[ 4] + b[13] * a[ 6] - b[11] * a[ 7] + b[10] * a[ 8] + b[ 8] * a[10] - b[ 7] * a[11] + b[ 6] * a[13] + b[ 4] * a[16] - b[ 3] * a[17] + b[ 2] * a[19] - b[ 1] * a[22] + b[ 0] * a[26];
    target[27] = b[27] * a[ 0] + b[23] * a[ 1] - b[20] * a[ 2] + b[18] * a[ 3] - b[16] * a[ 5] + b[14] * a[ 6] - b[12] * a[ 7] + b[10] * a[ 9] + b[ 9] * a[10] - b[ 7] * a[12] + b[ 6] * a[14] + b[ 5] * a[16] - b[ 3] * a[18] + b[ 2] * a[20] - b[ 1] * a[23] + b[ 0] * a[27];
    target[28] = b[28] * a[ 0] + b[24] * a[ 1] - b[21] * a[ 2] + b[18] * a[ 4] - b[17] * a[ 5] + b[15] * a[ 6] - b[12] * a[ 8] + b[11] * a[ 9] + b[ 9] * a[11] - b[ 8] * a[12] + b[ 6] * a[15] + b[ 5] * a[17] - b[ 4] * a[18] + b[ 2] * a[21] - b[ 1] * a[24] + b[ 0] * a[28];
    target[29] = b[29] * a[ 0] + b[25] * a[ 1] - b[21] * a[ 3] + b[20] * a[ 4] - b[19] * a[ 5] + b[15] * a[ 7] - b[14] * a[ 8] + b[13] * a[ 9] + b[ 9] * a[13] - b[ 8] * a[14] + b[ 7] * a[15] + b[ 5] * a[19] - b[ 4] * a[20] + b[ 3] * a[21] - b[ 1] * a[25] + b[ 0] * a[29];
    target[30] = b[30] * a[ 0] + b[25] * a[ 2] - b[24] * a[ 3] + b[23] * a[ 4] - b[22] * a[ 5] + b[15] * a[10] - b[14] * a[11] + b[13] * a[12] + b[12] * a[13] - b[11] * a[14] + b[10] * a[15] + b[ 5] * a[22] - b[ 4] * a[23] + b[ 3] * a[24] - b[ 2] * a[25] + b[ 0] * a[30];
    target[31] = b[31] * a[ 0] + b[30] * a[ 1] - b[29] * a[ 2] + b[28] * a[ 3] - b[27] * a[ 4] + b[26] * a[ 5] + b[25] * a[ 6] - b[24] * a[ 7] + b[23] * a[ 8] - b[22] * a[ 9] + b[21] * a[10] - b[20] * a[11] + b[19] * a[12] + b[18] * a[13] - b[17] * a[14] + b[16] * a[15] + b[15] * a[16] - b[14] * a[17] + b[13] * a[18] + b[12] * a[19] - b[11] * a[20] + b[10] * a[21] - b[ 9] * a[22] + b[ 8] * a[23] - b[ 7] * a[24] + b[ 6] * a[25] + b[ 5] * a[26] - b[ 4] * a[27] + b[ 3] * a[28] - b[ 2] * a[29] + b[ 1] * a[30] + b[ 0] * a[31];`)

    createFunction(`inner`, [`a`, `b`], `
    target[0] = b[0] * a[0] + b[1] * a[1] + b[2] * a[2] + b[3] * a[3] + b[4] * a[4] - b[5] * a[5] - b[6] * a[6] - b[7] * a[7] - b[8] * a[8] + b[9] * a[9] - b[10] * a[10] - b[11] * a[11] + b[12] * a[12] - b[13] * a[13] + b[14] * a[14] + b[15] * a[15] - b[16] * a[16] - b[17] * a[17] + b[18] * a[18] - b[19] * a[19] + b[20] * a[20] + b[21] * a[21] - b[22] * a[22] + b[23] * a[23] + b[24] * a[24] + b[25] * a[25] + b[26] * a[26] - b[27] * a[27] - b[28] * a[28] - b[29] * a[29] - b[30] * a[30] - b[31] * a[31];
    target[1] = b[1] * a[0] + b[0] * a[1] - b[6] * a[2] - b[7] * a[3] - b[8] * a[4] + b[9] * a[5] + b[2] * a[6] + b[3] * a[7] + b[4] * a[8] - b[5] * a[9] - b[16] * a[10] - b[17] * a[11] + b[18] * a[12] - b[19] * a[13] + b[20] * a[14] + b[21] * a[15] - b[10] * a[16] - b[11] * a[17] + b[12] * a[18] - b[13] * a[19] + b[14] * a[20] + b[15] * a[21] + b[26] * a[22] - b[27] * a[23] - b[28] * a[24] - b[29] * a[25] - b[22] * a[26] + b[23] * a[27] + b[24] * a[28] + b[25] * a[29] - b[31] * a[30] - b[30] * a[31];
    target[2] = b[2] * a[0] + b[6] * a[1] + b[0] * a[2] - b[10] * a[3] - b[11] * a[4] + b[12] * a[5] - b[1] * a[6] + b[16] * a[7] + b[17] * a[8] - b[18] * a[9] + b[3] * a[10] + b[4] * a[11] - b[5] * a[12] - b[22] * a[13] + b[23] * a[14] + b[24] * a[15] + b[7] * a[16] + b[8] * a[17] - b[9] * a[18] - b[26] * a[19] + b[27] * a[20] + b[28] * a[21] - b[13] * a[22] + b[14] * a[23] + b[15] * a[24] - b[30] * a[25] + b[19] * a[26] - b[20] * a[27] - b[21] * a[28] + b[31] * a[29] + b[25] * a[30] + b[29] * a[31];
    target[3] = b[3] * a[0] + b[7] * a[1] + b[10] * a[2] + b[0] * a[3] - b[13] * a[4] + b[14] * a[5] - b[16] * a[6] - b[1] * a[7] + b[19] * a[8] - b[20] * a[9] - b[2] * a[10] + b[22] * a[11] - b[23] * a[12] + b[4] * a[13] - b[5] * a[14] + b[25] * a[15] - b[6] * a[16] + b[26] * a[17] - b[27] * a[18] + b[8] * a[19] - b[9] * a[20] + b[29] * a[21] + b[11] * a[22] - b[12] * a[23] + b[30] * a[24] + b[15] * a[25] - b[17] * a[26] + b[18] * a[27] - b[31] * a[28] - b[21] * a[29] - b[24] * a[30] - b[28] * a[31];
    target[4] = b[4] * a[0] + b[8] * a[1] + b[11] * a[2] + b[13] * a[3] + b[0] * a[4] + b[15] * a[5] - b[17] * a[6] - b[19] * a[7] - b[1] * a[8] - b[21] * a[9] - b[22] * a[10] - b[2] * a[11] - b[24] * a[12] - b[3] * a[13] - b[25] * a[14] - b[5] * a[15] - b[26] * a[16] - b[6] * a[17] - b[28] * a[18] - b[7] * a[19] - b[29] * a[20] - b[9] * a[21] - b[10] * a[22] - b[30] * a[23] - b[12] * a[24] - b[14] * a[25] + b[16] * a[26] + b[31] * a[27] + b[18] * a[28] + b[20] * a[29] + b[23] * a[30] + b[27] * a[31];
    target[5] = b[5] * a[0] + b[9] * a[1] + b[12] * a[2] + b[14] * a[3] + b[15] * a[4] + b[0] * a[5] - b[18] * a[6] - b[20] * a[7] - b[21] * a[8] - b[1] * a[9] - b[23] * a[10] - b[24] * a[11] - b[2] * a[12] - b[25] * a[13] - b[3] * a[14] - b[4] * a[15] - b[27] * a[16] - b[28] * a[17] - b[6] * a[18] - b[29] * a[19] - b[7] * a[20] - b[8] * a[21] - b[30] * a[22] - b[10] * a[23] - b[11] * a[24] - b[13] * a[25] + b[31] * a[26] + b[16] * a[27] + b[17] * a[28] + b[19] * a[29] + b[22] * a[30] + b[26] * a[31];
    target[6] = b[6] * a[0] + b[16] * a[3] + b[17] * a[4] - b[18] * a[5] + b[0] * a[6] - b[26] * a[13] + b[27] * a[14] + b[28] * a[15] + b[3] * a[16] + b[4] * a[17] - b[5] * a[18] + b[31] * a[25] - b[13] * a[26] + b[14] * a[27] + b[15] * a[28] + b[25] * a[31];
    target[7] = b[7] * a[0] - b[16] * a[2] + b[19] * a[4] - b[20] * a[5] + b[0] * a[7] + b[26] * a[11] - b[27] * a[12] + b[29] * a[15] - b[2] * a[16] + b[4] * a[19] - b[5] * a[20] - b[31] * a[24] + b[11] * a[26] - b[12] * a[27] + b[15] * a[29] - b[24] * a[31];
    target[8] = b[8] * a[0] - b[17] * a[2] - b[19] * a[3] - b[21] * a[5] + b[0] * a[8] - b[26] * a[10] - b[28] * a[12] - b[29] * a[14] - b[2] * a[17] - b[3] * a[19] - b[5] * a[21] + b[31] * a[23] - b[10] * a[26] - b[12] * a[28] - b[14] * a[29] + b[23] * a[31];
    target[9] = b[9] * a[0] - b[18] * a[2] - b[20] * a[3] - b[21] * a[4] + b[0] * a[9] - b[27] * a[10] - b[28] * a[11] - b[29] * a[13] - b[2] * a[18] - b[3] * a[20] - b[4] * a[21] + b[31] * a[22] - b[10] * a[27] - b[11] * a[28] - b[13] * a[29] + b[22] * a[31];
    target[10] = b[10] * a[0] + b[16] * a[1] + b[22] * a[4] - b[23] * a[5] - b[26] * a[8] + b[27] * a[9] + b[0] * a[10] + b[30] * a[15] + b[1] * a[16] + b[31] * a[21] + b[4] * a[22] - b[5] * a[23] - b[8] * a[26] + b[9] * a[27] + b[15] * a[30] + b[21] * a[31];
    target[11] = b[11] * a[0] + b[17] * a[1] - b[22] * a[3] - b[24] * a[5] + b[26] * a[7] + b[28] * a[9] + b[0] * a[11] - b[30] * a[14] + b[1] * a[17] - b[31] * a[20] - b[3] * a[22] - b[5] * a[24] + b[7] * a[26] + b[9] * a[28] - b[14] * a[30] - b[20] * a[31];
    target[12] = b[12] * a[0] + b[18] * a[1] - b[23] * a[3] - b[24] * a[4] + b[27] * a[7] + b[28] * a[8] + b[0] * a[12] - b[30] * a[13] + b[1] * a[18] - b[31] * a[19] - b[3] * a[23] - b[4] * a[24] + b[7] * a[27] + b[8] * a[28] - b[13] * a[30] - b[19] * a[31];
    target[13] = b[13] * a[0] + b[19] * a[1] + b[22] * a[2] - b[25] * a[5] - b[26] * a[6] + b[29] * a[9] + b[30] * a[12] + b[0] * a[13] + b[31] * a[18] + b[1] * a[19] + b[2] * a[22] - b[5] * a[25] - b[6] * a[26] + b[9] * a[29] + b[12] * a[30] + b[18] * a[31];
    target[14] = b[14] * a[0] + b[20] * a[1] + b[23] * a[2] - b[25] * a[4] - b[27] * a[6] + b[29] * a[8] + b[30] * a[11] + b[0] * a[14] + b[31] * a[17] + b[1] * a[20] + b[2] * a[23] - b[4] * a[25] - b[6] * a[27] + b[8] * a[29] + b[11] * a[30] + b[17] * a[31];
    target[15] = b[15] * a[0] + b[21] * a[1] + b[24] * a[2] + b[25] * a[3] - b[28] * a[6] - b[29] * a[7] - b[30] * a[10] + b[0] * a[15] - b[31] * a[16] + b[1] * a[21] + b[2] * a[24] + b[3] * a[25] - b[6] * a[28] - b[7] * a[29] - b[10] * a[30] - b[16] * a[31];
    target[16] = b[16] * a[0] - b[26] * a[4] + b[27] * a[5] + b[31] * a[15] + b[0] * a[16] + b[4] * a[26] - b[5] * a[27] + b[15] * a[31];
    target[17] = b[17] * a[0] + b[26] * a[3] + b[28] * a[5] - b[31] * a[14] + b[0] * a[17] - b[3] * a[26] - b[5] * a[28] - b[14] * a[31];
    target[18] = b[18] * a[0] + b[27] * a[3] + b[28] * a[4] - b[31] * a[13] + b[0] * a[18] - b[3] * a[27] - b[4] * a[28] - b[13] * a[31];
    target[19] = b[19] * a[0] - b[26] * a[2] + b[29] * a[5] + b[31] * a[12] + b[0] * a[19] + b[2] * a[26] - b[5] * a[29] + b[12] * a[31];
    target[20] = b[20] * a[0] - b[27] * a[2] + b[29] * a[4] + b[31] * a[11] + b[0] * a[20] + b[2] * a[27] - b[4] * a[29] + b[11] * a[31];
    target[21] = b[21] * a[0] - b[28] * a[2] - b[29] * a[3] - b[31] * a[10] + b[0] * a[21] + b[2] * a[28] + b[3] * a[29] - b[10] * a[31];
    target[22] = b[22] * a[0] + b[26] * a[1] + b[30] * a[5] - b[31] * a[9] + b[0] * a[22] - b[1] * a[26] - b[5] * a[30] - b[9] * a[31];
    target[23] = b[23] * a[0] + b[27] * a[1] + b[30] * a[4] - b[31] * a[8] + b[0] * a[23] - b[1] * a[27] - b[4] * a[30] - b[8] * a[31];
    target[24] = b[24] * a[0] + b[28] * a[1] - b[30] * a[3] + b[31] * a[7] + b[0] * a[24] - b[1] * a[28] + b[3] * a[30] + b[7] * a[31];
    target[25] = b[25] * a[0] + b[29] * a[1] + b[30] * a[2] - b[31] * a[6] + b[0] * a[25] - b[1] * a[29] - b[2] * a[30] - b[6] * a[31];
    target[26] = b[26] * a[0] - b[31] * a[5] + b[0] * a[26] - b[5] * a[31];
    target[27] = b[27] * a[0] - b[31] * a[4] + b[0] * a[27] - b[4] * a[31];
    target[28] = b[28] * a[0] + b[31] * a[3] + b[0] * a[28] + b[3] * a[31];
    target[29] = b[29] * a[0] - b[31] * a[2] + b[0] * a[29] - b[2] * a[31];
    target[30] = b[30] * a[0] + b[31] * a[1] + b[0] * a[30] + b[1] * a[31];
    target[31] = b[31] * a[0] + b[0] * a[31];`)

    createFunction(`reverse`, [`mv`], `
    target[ 0] =  mv[ 0];
    target[ 1] =  mv[ 1];
    target[ 2] =  mv[ 2];
    target[ 3] =  mv[ 3];
    target[ 4] =  mv[ 4];
    target[ 5] =  mv[ 5];
    target[ 6] = -mv[ 6];
    target[ 7] = -mv[ 7];
    target[ 8] = -mv[ 8];
    target[ 9] = -mv[ 9];
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
    target[26] =  mv[26];
    target[27] =  mv[27];
    target[28] =  mv[28];
    target[29] =  mv[29];
    target[30] =  mv[30];
    target[31] =  mv[31];`)


    createFunction(`dual`, [`mv`], `
    target[ 0] = -mv[31];
    target[ 1] = -mv[30];
    target[ 2] =  mv[29];
    target[ 3] = -mv[28];
    target[ 4] =  mv[27];
    target[ 5] =  mv[26];
    target[ 6] =  mv[25];
    target[ 7] = -mv[24];
    target[ 8] =  mv[23];
    target[ 9] =  mv[22];
    target[10] =  mv[21];
    target[11] = -mv[20];
    target[12] = -mv[19];
    target[13] =  mv[18];
    target[14] =  mv[17];
    target[15] = -mv[16];
    target[16] =  mv[15];
    target[17] = -mv[14];
    target[18] = -mv[13];
    target[19] =  mv[12];
    target[20] =  mv[11];
    target[21] = -mv[10];
    target[22] = -mv[ 9];
    target[23] = -mv[ 8];
    target[24] =  mv[ 7];
    target[25] = -mv[ 6];
    target[26] = -mv[ 5];
    target[27] = -mv[ 4];
    target[28] =  mv[ 3];
    target[29] = -mv[ 2];
    target[30] =  mv[ 1];
    target[31] =  mv[ 0];`)

    createFunction(`conjugate`,[`mv`],`
    target[ 0] =  mv[ 0];
    target[ 1] = -mv[ 1];
    target[ 2] = -mv[ 2];
    target[ 3] = -mv[ 3];
    target[ 4] = -mv[ 4];
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
    target[15] = -mv[15];
    target[16] =  mv[16];
    target[17] =  mv[17];
    target[18] =  mv[18];
    target[19] =  mv[19];
    target[20] =  mv[20];
    target[21] =  mv[21];
    target[22] =  mv[22];
    target[23] =  mv[23];
    target[24] =  mv[24];
    target[25] =  mv[25];
    target[26] =  mv[26];
    target[27] =  mv[27];
    target[28] =  mv[28];
    target[29] =  mv[29];
    target[30] =  mv[30];
    target[31] = -mv[31];`)
}