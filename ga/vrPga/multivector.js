function initMultivectorWithoutDeclarations() {
    
    function getWhereThisWasCalledFrom(depth) {
        let actualDepth = (depth || 0) + 3
        let splitIntoLines = Error().stack.split("\n")
        if (actualDepth >= splitIntoLines.length)
            actualDepth = splitIntoLines.length - 1
        let lineOfStackTrace = splitIntoLines[actualDepth]

        let splitBySlash = lineOfStackTrace.split("/")
        let stillGotColons = splitBySlash[splitBySlash.length - 1]
        let splitByColons = stillGotColons.split(":")
        return splitByColons[0] + ":" + splitByColons[1]
    }

    class Multivector extends Float32Array {

        //only thing this leaves out is plane-plane, plane-line, and line-line, which are the check-y ones
        distanceToPt(pt) {
            return Math.sqrt(this.joinPt(pt, this.constructor === Dq ? newFl : newDq).eNormSq())
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

        projectOn(toBeProjectedOn, target) {
            if (target === undefined)
                target = new this.constructor()

            let numerator = this.inner(toBeProjectedOn, this.constructor === toBeProjectedOn.constructor ? newDq : newFl)
            numerator.mulReverse(toBeProjectedOn, target)

            return target
        }

        isScalarMultipleOf(b) {
            if(this.constructor !== b.constructor)
                return false

            let ratio = this.divide(b,newDq)
            if(ratio[0] === 0.)
                return false
            ratio[0] /= ratio[0]
            return ratio.approxEquals(oneDq)
            // return (ratio[0] !== 0. && 
            //     ratio[1] === 0. && ratio[2] === 0. && ratio[3] === 0. && ratio[4] === 0. && ratio[5] === 0. && ratio[6] === 0. && ratio[7] === 0.)
        }

        divide(b, target) {
            return this.mul(b.rigorousInverse(newDq), target)
        }

        rigorousInverse(target) {
            if (target === undefined)
                target = new this.constructor()

            let thisReverse = this.getReverse(this.constructor === Dq ? newDq : newFl)

            let thisThisReverse = this.mul(thisReverse, newDq) //potentially study
            let thisThisReverseInverse = newDq;
            thisThisReverseInverse[0] = 1. / thisThisReverse[0]
            thisThisReverseInverse[7] = -thisThisReverse[7] / (thisThisReverse[0] * thisThisReverse[0])

            return thisReverse.mulDq(thisThisReverseInverse, target)
        }

        dqToSq(b, target) {

            if (target === undefined)
                target = new Dq()

            if (b.constructor === this.constructor)
                return b.mulReverse(this, target)
            else {
                let ratio = b.mulReverse(this, newFl)
                return ratio.mul(thingy, target).sqrtSelf()
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
            return intermediate.mulDq(thisReverse, target)
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

        //0 is grade -1, and mixtures of any kind are grade -2
        grade() {
            let grade = -1 //0 is grade -1!
            for (let i = 0; i < 8; ++i) {
                if (this[i] !== 0.) {
                    let extraGrade = this.constructor.indexGrades[i]
                    if (grade === -1)
                        grade = extraGrade
                    else if (grade !== extraGrade) //it's some kind of combination. Hopefully a rotor
                        grade = -2
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
                console.error("no target at " + getWhereThisWasCalledFrom(1))
                target = new this.constructor()
            }

            if (this.constructor !== target.constructor)
                console.error("type error at " + getWhereThisWasCalledFrom())

            for (let i = 0; i < 8; ++i)
                target[i] = s * this[i]

            return target
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