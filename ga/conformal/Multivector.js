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

    convert(target) {
        let targetIsSmaller = this.constructor.size > target.constructor.size

        if (targetIsSmaller) {
            let conversion = smallerInLarger[this.constructor.name][target.constructor.name]
            for(let i = 0; i < target.constructor.size; ++i)
                target[i] = this[conversion[i]]
        }
        else {
            let conversion = smallerInLarger[target.constructor.name][this.constructor.name]
            for (let i = 0; i < target.constructor.size; ++i)
                target[i] = 0.
            for (let i = 0; i < this.constructor.size; ++i)
                target[conversion[i]] = this[i]
        }

        return target
    }

    selectGrade( desiredGrade, target ) {
        for (let i = 0; i < this.constructor.size; ++i) {
            if(this.constructor.indexGrades[i] === desiredGrade)
                target[i] = this[i]
            else
                target[i] = 0.
        }

        return target
    }

    grade() {
        let grade = -1 //0 is grade -1!
        for(let i = 0; i < this.constructor.size; ++i) {
            if(this[i] !== 0.) {
                let extraGrade = this.constructor.indexGrades[i]
                if (grade === -1 || grade === extraGrade)
                    grade = extraGrade
                // else mixture
            }
        }

        return grade
    }
        
    set() {
        for (let i = 0, il = arguments.length; i < il; ++i)
            this[i] = arguments[i]
        return this
    }

    zero() {
        for (let i = 0; i < this.constructor.size; ++i)
            this[i] = 0.
        return this
    }

    lowestNonzero() {
        for (let i = 0; i < this.constructor.size; ++i)
            if (this[i] !== 0.)
                return i
        return -1
    }

    fromFloatAndIndex(float, index) {
        for(let i = 0; i < this.constructor.size; ++i) {
            if(i === index)
                this[i] = float
            else
                this[i] = 0.
        }
        return this
    }

    multiplyScalar(s, target) {
        if(target === undefined)
            target = this

        for (let i = 0; i < this.constructor.size; ++i)
            target[i] = s * this[i]

        return target
    }

    copy(v) {

        if (v.constructor !== this.constructor)
            console.error("type error")

        for (let i = 0; i < this.constructor.size; ++i)
            this[i] = v[i]

        return this
    }

    clone() {
        let cl = new this.constructor()
        //also the planes lines and points' magnitude should be on the thingy
        cl.copy(this)

        return cl
    }

    equals(v) {
        if (v.constructor !== this.constructor)
            console.error("type error")

        let ret = true
        for (let i = 0; i < this.constructor.size; ++i) {
            if (this[i] !== v[i])
                ret = false
        }
        return ret
    }

    approxEquals(v) {
        if (v.constructor !== this.constructor)
            console.error("type error")

        let doesEqual = true
        for (let i = 0; i < this.constructor.size; ++i) {
            if (Math.abs(this[i] - v[i]) > .0001)
                doesEqual = false
        }
        return doesEqual
    }

    fromArray(arr) {
        for (let i = 0; i < this.constructor.size; ++i)
            this[i] = arr[i]

        return this
    }

    toArray(arr, offset) {
        if (offset === undefined)
            offset = 0
            
        for (let i = 0; i < this.constructor.size; ++i)
            arr[offset * this.constructor.size + i] = this[i]

        return arr
    }

    add(v,target) {
        if(target === undefined)
            target = new this.constructor()

        if (v.constructor !== this.constructor)
            console.error("type error")

        for(let i = 0; i < this.constructor.size; ++i)
            target[i] = this[i] + v[i]
        return target
    }
    sub(v, target) {
        if (target === undefined)
            target = new this.constructor()

        if (v.constructor !== this.constructor)
            console.error("type error")

        for (let i = 0; i < this.constructor.size; ++i)
            target[i] = this[i] - v[i]
        return target
    }

    addScaled(v, scale, target) { //want to add it to itself? Then specify itself!
        if(target === undefined)
            target = new this.constructor()
        
        if (v.constructor !== this.constructor)
            console.error("type error")

        for (let i = 0; i < this.constructor.size; ++i)
            target[i] = this[i] + scale * v[i]
        return target
    }

    log(label, numDecimalPlaces) {
        if (numDecimalPlaces === undefined)
            numDecimalPlaces = 1

        let str = ""
        for (let i = 0; i < this.constructor.size; ++i) {
            if (Math.abs(this[i]) > 0.05) { // && this[i].toFixed() != 0) {
                if (str !== "")
                    str += " + "

                let sign = 1.
                // if (this.constructor.onesWithMinus.indexOf(this.constructor.basisNames[i]) !== -1)
                //     sign = -1.

                str += (sign * this[i]).toFixed(numDecimalPlaces) + (i !== 0 ? "e" : "") + this.constructor.basisNames[i]
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
}