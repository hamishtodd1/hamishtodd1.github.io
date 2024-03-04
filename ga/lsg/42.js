/*
    If you're going to do this, need a way to visualize the things, slicing different ways
    Boils down to: you have a point pair from having cast a ray. Extract the points.
*/

function init42() {

    class Tw extends Multivector {

        constructor() {
            super(64)
        }

        e10() { return  .5 * ( this[ 9] + this[10] ) }
        e20() { return  .5 * ( this[13] + this[14] ) }
        e30() { return  .5 * ( this[16] + this[17] ) }
        et0() { return -.5 * ( this[20] + this[21] ) }
        e12t() { return this[25] }
        e120() { return this[23] }
        e1t0() { return -this[29] }
        e2t0() { return this[29] }

        // exp() {
        //     //maybe split them up? (2,2) bivector + Cl(2) bivector, or (1,2) bivector + (3,0,0) bivector. Mmm, cross terms
        // }

        innerSelfScalar() {
            return this[0] * this[0] + this[1] * this[1] + this[2] * this[2] + this[3] * this[3] + this[4] * this[4] - this[5] * this[5] - this[6] * this[6] - this[7] * this[7] - this[8] * this[8] - this[9] * this[9] + this[10] * this[10] + this[11] * this[11] - this[12] * this[12] - this[13] * this[13] + this[14] * this[14] + this[15] * this[15] - this[16] * this[16] + this[17] * this[17] + this[18] * this[18] + this[19] * this[19] + this[20] * this[20] - this[21] * this[21] - this[22] * this[22] - this[23] * this[23] + this[24] * this[24] + this[25] * this[25] - this[26] * this[26] + this[27] * this[27] + this[28] * this[28] + this[29] * this[29] + this[30] * this[30] - this[31] * this[31] - this[32] * this[32] + this[33] * this[33] + this[34] * this[34] + this[35] * this[35] + this[36] * this[36] - this[37] * this[37] + this[38] * this[38] + this[39] * this[39] - this[40] * this[40] - this[41] * this[41] + this[42] * this[42] - this[43] * this[43] - this[44] * this[44] - this[45] * this[45] - this[46] * this[46] + this[47] * this[47] - this[48] * this[48] - this[49] * this[49] + this[50] * this[50] + this[51] * this[51] - this[52] * this[52] - this[53] * this[53] + this[54] * this[54] + this[55] * this[55] + this[56] * this[56] - this[57] * this[57] - this[58] * this[58] + this[59] * this[59] + this[60] * this[60] + this[61] * this[61] + this[62] * this[62] - this[63] * this[63];
        }

        sandwich(b,target) {

            return this.mul(b, tw1Local).mulReverse( this, target )
        }

        mulReverse(b, target) {
            let bReverse = b.getReverse(tw0Local)
            this.mul(bReverse, target)
            return target
        }

        distanceToPt() {
            console.error( "needs to be written specifically" )
        }
        projectOn() {
            console.error( "needs to be written specifically" )
        }
        rigorousInverse() {
            console.error( "needs to be written specifically" )
        }
        dqToSq() {
            console.error( "needs to be written specifically" )
        }

        getReverse(target) {
            if(target === undefined)
                target = new Tw()
            return reverse42(this,target)
        }

        mul(b,target) {
            if(target === undefined)
                target = new Tw()
            return mul42(this,b,target)
        }

        meet(b,target) {
            if(target === undefined)
                target = new Tw()
            return meet42(this,b,target)
        }

        inner(b, target) {
            if(target === undefined)
                target = new Tw()
            return inner42(this,b,target)
        }

        toString(numDecimalPlaces) {
            if (numDecimalPlaces === undefined)
                numDecimalPlaces = 1

            let str = ""
            for (let i = 0, il = this.length; i < il; ++i) {

                if (Math.abs(this[i]) > 0.05 || isNaN(this[i])) {

                    if (str !== "")
                        str += " + "

                    let numString = this[i].toString()
                    if (numString.length > numDecimalPlaces)
                        numString = this[i].toFixed(numDecimalPlaces)

                    let basisName = this.constructor.basisNames[i]
                    let e0Replacers = this.constructor.e0Replacers
                    if( e0Replacers !== undefined && 
                        e0Replacers[i] !== null && 
                        this[e0Replacers[i][0]] === this[e0Replacers[i][1]] ) {
                        basisName = e0Replacers[i][2]
                        ++i
                    }
                    
                    str += numString + (basisName === `` ? `` : `e`) + basisName
                }
            }

            if (str === ``)
                str += `0.`

            return str
        }
    }
    window.Tw = Tw

    Tw.indexGrades = [
        0,
        1,1,1,1,1,1,
        2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,
        3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,
        4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,
        5,5,5,5,5,5,
        6
    ]

    Tw.basisNames = [
        ``,
        `1`,`2`,`3`,`p`,`m`,`t`,
        `12`,`13`,`1p`,`1m`,`1t`,`23`,`2p`,`2m`,`2t`,`3p`,`3m`,`3t`,`pm`,`pt`,`mt`,
        `123`,`12p`,`12m`,`12t`,`13p`,`13m`,`13t`,`1pm`,`1pt`,`1mt`,`23p`,`23m`,`23t`,`2pm`,`2pt`,`2mt`,`3pm`,`3pt`,`3mt`,`pmt`,
        `123p`,`123m`,`123t`,`12pm`,`12pt`,`12mt`,`13pm`,`13pt`,`13mt`,`1pmt`,`23pm`,`23pt`,`23mt`,`2pmt`,`3pmt`,
        `123pm`,`123pt`,`123mt`,`12pmt`,`13pmt`,`23pmt`,
        `123pmt`
    ]

    Tw.e0Replacers = Array(Tw.basisNames.length)
    Tw.e0Replacers.fill(null)
    function getIndices(prefix, tAppended) {
        let pIndex = Tw.basisNames.indexOf(prefix + `p` + (tAppended ? `t` : ``))
        let mIndex = Tw.basisNames.indexOf(prefix + `m` + (tAppended ? `t` : ``))
        let index = pIndex < mIndex ? pIndex : mIndex
        Tw.e0Replacers[index] = [ pIndex, mIndex, prefix + `0` + (tAppended ? `t` : ``)]
    }
    let someIndices = [``, `1`, `2`, `3`, `12`, `13`, `23`, `123`]
    someIndices.forEach(prefix => getIndices(prefix, false))
    someIndices.forEach(prefix => getIndices(prefix, true))

    let tw0Local = new Tw()
    let tw1Local = new Tw()
    let tw2Local = new Tw()
    let tw3Local = new Tw()

    _e1 = new Tw().fromFloatAndIndex(1., 1)
    _e2 = new Tw().fromFloatAndIndex(1., 2)
    _e3 = new Tw().fromFloatAndIndex(1., 3)
    _ep = new Tw().fromFloatAndIndex(1., 4)
    _em = new Tw().fromFloatAndIndex(1., 5)
    _et = new Tw().fromFloatAndIndex(1., 6) //yeah, bit weird, but it is what it is
    _e0 = _ep.add(_em,new Tw())

    _e1t = _e1.meet(_et, new Tw()) //boost preserving the origin
    _e10 = _e1.meet(_e0, new Tw()) //translation in space
    _e01 = _e0.meet(_e1, new Tw())
    _e20 = _e2.meet(_e0, new Tw()) //translation in space
    _e02 = _e0.meet(_e2, new Tw())
    _e30 = _e3.meet(_e0, new Tw()) //translation in space
    _e03 = _e0.meet(_e3, new Tw())
    _e12 = _e1.meet(_e2, new Tw()) //rotation
    _e23 = _e2.meet(_e3, new Tw()) //rotation
    _e31 = _e3.meet(_e1, new Tw()) //rotation, NOTE THAT e13 is stored not e31
    _e13 = _e1.meet(_e3, new Tw())
    _et0 = _et.meet(_e0, new Tw()) //translation in time
    _epm = _ep.meet(_em, new Tw()) //scaling preserving the origin
    _e1p = _e1.meet(_ep, new Tw())
    _e1m = _e1.meet(_em, new Tw())
    _etp = _et.meet(_ep, new Tw())
    _etm = _et.meet(_em, new Tw())
    _e1t = _e1.meet(_et, new Tw())
    _e2t = _e2.meet(_et, new Tw())

    _e123 = _e12.meet(_e3, new Tw())
    _e012 = _e0.meet(_e12, new Tw())
    _e023 = _e0.meet(_e23, new Tw())
    _e013 = _e0.meet(_e13, new Tw())
    _e031 = _e0.meet(_e31, new Tw())

    _e0123 = _e01.meet(_e23, new Tw())

    oneTw = new Tw().fromFloatAndIndex(1., 0)

    tw0 = new Tw()
    tw1 = new Tw()
    tw2 = new Tw()
    tw3 = new Tw()
    tw4 = new Tw()
    tw5 = new Tw()
    tw6 = new Tw()
    tw7 = new Tw()
    tw8 = new Tw()
    tw9 = new Tw()

    uv0 = new Unavec()
    uv1 = new Unavec()
    uv2 = new Unavec()
    uv3 = new Unavec()
    uv4 = new Unavec()
    uv5 = new Unavec()
    uv6 = new Unavec()

    function setBasisNames(Constructor) {
        Constructor.basisNames = Array(Constructor.indexGrades.length)
        let example = new Constructor()
        for (let i = 0, il = example.length; i < il; ++i) {

            example.zero()
            example[i] = 1.
            example.cast(tw0)

            Constructor.basisNames[i] = Tw.basisNames[tw0.lowestNonzero()]
        }
        delete example

    }
    setBasisNames(Unavec)
    setBasisNames(Bivec)
    setBasisNames(Trivec)
    setBasisNames(Quadvec)
    setBasisNames(Pentavec)
    setBasisNames(Hexavec)
}