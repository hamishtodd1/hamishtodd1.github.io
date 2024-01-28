function initBases() {

    let projector = new Tw()
    let projectorBiv = new Tw()
    let unavecBetween = new Tw()
    let projectivePoint = new Tw()
    let nullUnavec = new Tw()

    class Base {

        constructor(basis) {

            this.basis = basis

            this.idealIndicesA = Array(basis.length)
            this.idealIndicesB = Array(basis.length)

            for(let i = 0; i < basis.length; ++i) {

                tw0.copy(oneTw)
                //and it'll be all of them
                for(let j = 0; j < basis.length; ++j) {
                    if(j === i)
                        continue
                    tw0.meet(basis[j], tw1)
                    tw0.copy(tw1)
                }
                tw0.meet(_e0, tw1)

                //A and B are either plus or minus parts of our meets with e0
                this.idealIndicesA[i] = tw1.lowestNonZeroSigned()
                tw1[ Math.abs(this.idealIndicesA[i]) ] = 0.

                this.idealIndicesB[i] = tw1.lowestNonZeroSigned()

            }

            let origin = new Tw() //as in, origin point pair
            origin.copy( oneTw )
            for (let i = 0, il = basis.length; i < il; ++i) {
                origin.meet( basis[i], tw1 )
                origin.copy( tw1 )
            }

            this.ptAtInf = new Tw()
            origin.meet( _e0, this.ptAtInf)
            this.pss = new Tw()
            origin.meet( _epm, this.pss)

            this.originIndex = origin.lowestNonZeroSigned()
        }

        projectivePtToGibbsVec( unavec, target ) {

            target.setScalar(0.)
            
            let w = unavec.coordFromSignedIndex( this.originIndex )
            if(w !== 0.) {

                let factor = .5 / w
                for ( let i = 0, il = this.basis.length; i < il; ++i ) {
                    
                    target[i] = factor * (
                        unavec.coordFromSignedIndex( this.idealIndicesA[i] ) + 
                        unavec.coordFromSignedIndex( this.idealIndicesB[i] ) )
                    
                }

            }

            return target
        }

        ppToGibbsVecs( pp, target1, target2 ) {

            pp.inner( this.pss, projectorBiv)
            projectorBiv.inner( _e0, unavecBetween )

            //we now expect that it is a BIvector that squares to a positive number
            let magnitude = projectorBiv.innerSelfScalar()
            if (0. >= magnitude)
                console.error("bivector does not square to positive number")

            projectorBiv.multiplyScalar(.5 / magnitude, projector)
            projector[0] = .5

            //Could try to have a specific inner product. Pretty big hassle! this is 1-vec | n-vec
            projector.sandwich(unavecBetween, nullUnavec).inner( this.ptAtInf, projectivePoint )
            this.projectivePtToGibbsVec( projectivePoint, target1 )

            projector.getReverse(projector)
            projector.sandwich(unavecBetween, nullUnavec).inner( this.ptAtInf, projectivePoint )
            this.projectivePtToGibbsVec( projectivePoint, target2 )
            
        }
    }

    extractor1      = new Base([_e1])                //1D  CGA  / PGA
    extractort      = new Base([_et])                //0+1 CSTA / STAP
    extractor12     = new Base([_e1, _e2])           //2D  CGA  / PGA
    extractor1t     = new Base([_e1, _et])           //1+1 CSTA / STAP
    extractor123    = new Base([_e1, _e2, _e3])      //3D  CGA  / PGA
    extractor12t    = new Base([_e1, _e2, _et])      //2+1 CSTA / STAP
    extractor123t   = new Base([_e1, _e2, _e3, _et]) //3+1 CSTA / PGA
}