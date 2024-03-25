/*
    This file was written by Hamish Todd and is public domain
    This statement does not apply to other files in this repo unless otherwise stated
*/

function initMultivectorWithoutDeclarations() {
    
    class Multivector extends Float32Array {

        adhocNormSq() {
            let adHocNormSq = this.eNormSq()
            if (adHocNormSq === 0.)
                adHocNormSq = this.iNormSq()
            return adHocNormSq
        }

        velocityUnder(rotor, target) {
            if (target === undefined)
                target = new this.constructor()

            let rotorLogarithm = rotor.logarithm(newDq)
            return this.commutator(rotorLogarithm, target)
        }

        addNoise(firstIndex, lastIndex, radius) {
            
            for (let i = firstIndex; i < lastIndex; ++i)
                this[i] = radius*(Math.random() * 2. - 1.)

            return this
        }

        l1NormTo(that) {
            if(this.constructor !== that.constructor)
                return Infinity

            let subtraction = this.sub(that, this.constructor === Dq ? newDq:newFl)
            return Math.abs(subtraction[0]) + Math.abs(subtraction[1]) + Math.abs(subtraction[2]) + Math.abs(subtraction[3]) + Math.abs(subtraction[4]) + Math.abs(subtraction[5]) + Math.abs(subtraction[6]) + Math.abs(subtraction[7])
        }

        zeroGrade(g) {
            for (let i = 0; i < 8; ++i) {
                if (this.constructor.indexGrades[i] === g )
                    this[i] = 0.
            }
            return this
        }

        gradeDiff(that) {
            let thisGrade = this.grade()
            let thatGrade = that.grade()
            if (thisGrade === Infinity || thisGrade === -2 || thisGrade === -1 || 
                thatGrade === Infinity || thatGrade === -2 || thatGrade === -1)
                console.error("grade error at " + getWhereThisWasCalledFrom())
            return Math.abs(thisGrade - thatGrade)
        }

        angleTo(that) {

            let g = this.gradeDiff(that)

            let mIsDq = this.constructor === that.constructor
            let m = that.mulReverse(this, mIsDq ? newDq : newFl)
            
            let selected = mIsDq ? newDq : newFl
            let numerator   =                  m.selectGrade(g + 2, selected).eNorm()
            let denominator = g === 0 ? m[0] : m.selectGrade(    g, selected).eNorm()

            return Math.atan2(numerator,denominator)

            // let h = numerator === 0. ? g : g + 2
            // let dualed = mIsDq ? newDq : newFl
            // numerator   = h+2 === 4 ? m[7] : Math.sqrt(m.selectGrade(h + 2, selected).getDual(dualed).eNormSq())
            // denominator = g   === 0 ? m[0] : Math.sqrt(m.selectGrade(    h, selected).eNormSq())

            // return denominator === 0. ? Infinity * Math.sign(numerator) : numerator / denominator
        }

        //only thing this leaves out is plane-plane, plane-line, and line-line, which are the check-y ones
        distanceToPt(pt) {
            let thisNormalized = this.getNormalization(this.constructor === Fl ? newFl : newDq)
            let ptNormalized   =   pt.getNormalization( newFl )
            let theJoin = thisNormalized.joinPt(ptNormalized, this.constructor === Dq ? newFl : newDq)
            return Math.sqrt(theJoin.eNormSq())
        }

        fakeThingAtInfinity(target) {
            let joined = this.joinPt(camera.mvs.pos, this.constructor === Dq ? newFl : newDq)
            return joined.meet(camera.frustum.far, target)
        }

        directionTo(b, target) {

            if (target === undefined)
                target = new this.constructor()

            return b.addScaled(this, -b[7] / this[7], target).normalize()
        }

        eNorm() {
            return Math.sqrt(this.eNormSq())
        }

        //pretty confusing: append causes a transformation to be done BEFORE the current transformation
        append(b) {
            let temp = this.mul(b, newDq)
            this.copy(temp)
            return this
        }
        prepend(b) {
            let temp = b.mul(this, newDq)
            this.copy(temp)
            return this
        }

        //there might be a more literal name for this. Maybe "offset by"
        mulReverse(b, target) {
            let bReverse = b.getReverse(b.constructor === Fl ? newFl : newDq)
            return this.mul(bReverse, target)
        }

        projectTransformOn(toBeProjectedOn, target) {
            if (target === undefined)
                target = new this.constructor()

            let numerator = this.meet(toBeProjectedOn, this.constructor === toBeProjectedOn.constructor ? newDq : newFl)
            numerator.mulReverse(toBeProjectedOn, target)

            return target
        }

        projectOn(toBeProjectedOn, target) {
            if (target === undefined)
                target = new this.constructor()

            let numerator = this.inner(toBeProjectedOn, this.constructor === toBeProjectedOn.constructor ? newDq : newFl)
            numerator.mulReverse(toBeProjectedOn, target)

            return target
        }

        dqToSq(b, target) {

            if (target === undefined)
                target = new Dq()

            if (b.constructor === this.constructor)
                return b.mulReverse(this, target) //having this makes a difference! Somehow! No idea why
            else {
                let ratio = b.mulReverse(this, newFl)
                return ratio.mul(ratio, target).normalize().sqrtSelf()
            }
        }

        dqTo(b, target) {
            return this.dqToSq(b, target).sqrtSelf()
        }

        sandwichDq(b, target) {
            let intermediate = this.mulDq(b,  this.constructor === Dq ? newDq : newFl)
            let thisReverse = this.getReverse(this.constructor === Dq ? newDq : newFl)
            return intermediate.mulDq(thisReverse, target)
        }

        sandwichFl(b, target) {
            let intermediate = this.mulFl(b,  this.constructor === Fl ? newDq : newFl)
            let thisReverse = this.getReverse(this.constructor === Dq ? newDq : newFl)
            intermediate.mul(thisReverse, target)
            if (this.constructor === Fl )
                target.multiplyScalar(-1., target)
            return target
        }

        lerpSelf(b, alpha) {
            this.lerp(b, alpha, this)
            return this
        }

        reverse() {
            console.error("you mean getReverse!")
        }

        lerp(toLerpTo, alpha, target) {
            if (target === undefined)
                target = new this.constructor()

            if (this.constructor !== toLerpTo.constructor || this.constructor !== target.constructor)
                console.error("type error at " + getWhereThisWasCalledFrom())

            for (let i = 0; i < 8; ++i)
                target[i] = this[i] + alpha * (toLerpTo[i] - this[i])

            return target
        }

        sandwich(b, target) {
            if (target === undefined)
                target = new b.constructor()

            if (b instanceof Dq)
                this.sandwichDq(b, target)
            else
                this.sandwichFl(b, target)

            return target
        }

        mul(b, target) {
            if (target === undefined)
                target = new (this.constructor === b.constructor ? Dq : Fl)()

            if (b instanceof Dq)
                this.mulDq(b, target)
            else
                this.mulFl(b, target)

            return target
        }

        meet(b, target) {
            if (target === undefined)
                target = new (this.constructor === b.constructor ? Dq : Fl)()

            if (b instanceof Dq)
                this.meetDq(b, target)
            else
                this.meetFl(b, target)

            return target
        }

        inner(b, target) {
            if (target === undefined)
                target = new (this.constructor === b.constructor ? Dq : Fl)()

            if (b instanceof Dq)
                this.innerDq(b, target)
            else
                this.innerFl(b, target)

            return target
        }

        isZero() {
            let ret = true
            for (let i = 0; i < 8; ++i)
                if (this[i] !== 0.)
                    ret = false
            return ret
        }

        hasGrade(g) {
            
            for(let i = 0; i < 8; ++i) {
                if(this.constructor.indexGrades[i] === g && Math.abs(this[i]) > eps)
                    return true
            }

            return false
        }

        selectGrade(desiredGrade, target) {
            if (target === undefined)
                target = new this.constructor()

            if (this.constructor !== target.constructor)
                console.error("type error at " + getWhereThisWasCalledFrom())

            for (let i = 0; i < 8; ++i) {
                if (this.constructor.indexGrades[i] === desiredGrade)
                    target[i] = this[i]
                else
                    target[i] = 0.
            }

            return target
        }

        //0 is grade Infinity; even versors are grade -2; odd versors are grade -1
        grade() {
            let grade = Infinity //0 has this grade
            for (let i = 0; i < 8; ++i) {
                if (Math.abs(this[i]) > eps) {
                    let extraGrade = this.constructor.indexGrades[i]
                    if (grade === Infinity)
                        grade = extraGrade
                    else if (grade !== extraGrade) //combination
                        grade = this.constructor === Dq ? -2 : -1
                }
            }

            return grade
        }

        set() {
            if (arguments.length !== 8)
                console.error("type error at " + getWhereThisWasCalledFrom())

            for (let i = 0, il = arguments.length; i < il; ++i)
                this[i] = arguments[i]
            return this
        }

        zero() {
            for (let i = 0; i < 8; ++i)
                this[i] = 0.
            return this
        }

        lowestNonzero() {
            for (let i = 0; i < 8; ++i)
                if (this[i] !== 0.)
                    return i
            return -1
        }

        fromFloatAndIndex(float, index) {
            for (let i = 0; i < 8; ++i) {
                if (i === index)
                    this[i] = float
                else
                    this[i] = 0.
            }
            return this
        }

        multiplyScalar(s, target) {
            if (target === undefined) {
                console.error("no target, multiplyScalar will make a new object" + getWhereThisWasCalledFrom(1))
                target = new this.constructor()
            }

            if (this.constructor !== target.constructor)
                console.error("type error at " + getWhereThisWasCalledFrom())

            for (let i = 0; i < 8; ++i)
                target[i] = s * this[i]

            return target
        }

        //mostly here for the snapping
        copyTo(target) {
            return target.copy(this)
        }

        copy(b) {
            if (this.constructor !== b.constructor)
                console.error("type error at " + getWhereThisWasCalledFrom())

            for (let i = 0; i < 8; ++i)
                this[i] = b[i]

            return this
        }

        clone() {
            let cl = new this.constructor()
            //also the planes lines and points' magnitude should be on the thingy
            cl.copy(this)

            return cl
        }

        equals(b) {
            if (this.constructor !== b.constructor)
                console.error("type error at " + getWhereThisWasCalledFrom())

            let ret = true
            for (let i = 0; i < 8; ++i) {
                if (this[i] !== b[i])
                    ret = false
            }
            return ret
        }

        approxEquals(b) {
            if (this.constructor !== b.constructor)
                console.error("type error at " + getWhereThisWasCalledFrom())

            let doesEqual = true
            for (let i = 0; i < 8; ++i) {
                if (Math.abs(this[i] - b[i]) > .0001)
                    doesEqual = false
            }
            return doesEqual
        }

        fromArray(arr) {
            for (let i = 0; i < 8; ++i)
                this[i] = arr[i]

            return this
        }

        toArray(arr, offset) {
            if (offset === undefined)
                offset = 0

            for (let i = 0; i < 8; ++i)
                arr[offset * 8 + i] = this[i]

            return arr
        }

        add(a, target) {

            if (target === undefined)
                target = new this.constructor()

            if (a.constructor !== target.constructor || this.constructor !== target.constructor)
                console.error("type error at " + getWhereThisWasCalledFrom())

            for (let i = 0; i < 8; ++i)
                target[i] = this[i] + a[i]

            return target
        }

        sub(a, target) {

            if (target === undefined)
                target = new this.constructor()

            if (this.constructor !== a.constructor || this.constructor !== target.constructor)
                console.error("type error at " + getWhereThisWasCalledFrom())

            for (let i = 0; i < 8; ++i)
                target[i] = this[i] - a[i]

            return target
        }

        addScaled(v, scale, target) {

            if (target === undefined)
                target = new this.constructor()

            if (this.constructor !== v.constructor || this.constructor !== target.constructor)
                console.error("type error at " + getWhereThisWasCalledFrom())

            for (let i = 0; i < 8; ++i)
                target[i] = this[i] + scale * v[i]

            return target
        }

        log(label, numDecimalPlaces) {
            let str = this.toString(numDecimalPlaces)

            if (label !== undefined)
                str = label + ": " + str
            else {
                label = getWhereThisWasCalledFrom()
                str = label + ": " + str
            }

            console.log(str)
        }

        negate(target) {
            if (target === undefined)
                target = new this.constructor()

            for (let i = 0; i < 8; ++i)
                target[i] = -1. * this[i]

            return target
        }

        toString(numDecimalPlaces) {
            if (numDecimalPlaces === undefined)
                numDecimalPlaces = 1

            let str = ""
            for (let j = 0; j < 8; ++j) {

                let i = j
                if (j === 26) i = 31
                if (j === 31) i = 26

                if (Math.abs(this[i]) > 0.05 || isNaN(this[i])) { // && this[i].toFixed() != 0) {

                    if (str !== "")
                        str += " + "

                    // let sign = 1.
                    // if (this.constructor.onesWithMinus.indexOf(this.constructor.basisNames[i]) !== -1)
                    //     sign = -1.

                    let numString = this[i].toString()
                    if (numString.length > numDecimalPlaces)
                        numString = this[i].toFixed(numDecimalPlaces)

                    let basisName = this.constructor.basisNames[i]
                    str += numString + (basisName === `` ? `` : `e`) + basisName

                    //would be nice to have e0 in cga printing
                }
            }

            if (str === ``)
                str += `0.`

            return str
        }
    }
    window.Multivector = Multivector
    
/*END*/}