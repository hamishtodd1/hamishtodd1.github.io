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

    , "e1", "e2", "e3", "e4", "e5", "e6", "e123", "e124", "e125", "e126", "e134", "e135", "e136", "e145", "e146", "e156", "e234", "e235", "e236", "e245", "e246", "e256", "e345", "e346", "e356", "e645",

    Tw.basisNames = [
        ``,
        `1`,`2`,`3`,`p`,`m`,`t`,
        `12`,`13`,`1p`,`1m`,`1t`,`23`,`2p`,`2m`,`2t`,`3p`,`3m`,`3t`,`pm`,`pt`,`mt`,
        `123`,`12p`,`12m`,`12t`,`13p`,`13m`,`13t`,`1pm`,`1pt`,`1mt`,`23p`,`23m`,`23t`,`2pm`,`2pt`,`2mt`,`3pm`,`3pt`,`3mt`,`tpm`,
        `123p`,`123m`,`123t`,`12pm`,`12pt`,`12mt`,`13pm`,`13pt`,`13mt`,`1tpm`,`23pm`,`23pt`,`23mt`,`2tpm`,`3tpm`,
        `123pm`,`123pt`,`123mt`,`12tpm`,`13tpm`,`23tpm`,
        `123tpm`
    ]

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
    _e20 = _e2.meet(_e0, new Tw()) //translation in space
    _e30 = _e3.meet(_e0, new Tw()) //translation in space
    _e12 = _e1.meet(_e2, new Tw()) //rotation
    _e23 = _e2.meet(_e3, new Tw()) //rotation
    _e31 = _e3.meet(_e1, new Tw()) //rotation
    _et0 = _et.meet(_e0, new Tw()) //translation in time
    _epm = _ep.meet(_em, new Tw()) //scaling preserving the origin
    _e1p = _e1.meet(_ep, new Tw())
    _e1m = _e1.meet(_em, new Tw())
    _etp = _et.meet(_ep, new Tw())
    _etm = _et.meet(_em, new Tw())
    _e1t = _e1.meet(_et, new Tw())
    _e2t = _e2.meet(_et, new Tw())

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
    setBasisNames(Bireflection)
}