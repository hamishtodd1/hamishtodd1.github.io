function initBasises() {

    let projector = new Bireflection()
    let projectorRev = new Bireflection()
    let projectorBiv = new Bivec()
    let equatorialUnavec = new Unavec()
    let nullUnavec = new Unavec()
    let intermediary = new Trireflection()

    class Basis {

        constructor(basis) {

            this.basis = basis

            this.idealIndicesA = Array(basis.length)
            this.idealIndicesB = Array(basis.length)

            let PointPair = 
                basis.length === 1 ? Unavec :
                basis.length === 2 ? Bivec :
                basis.length === 3 ? Trivec :
                basis.length === 4 ? Quadvec :
                console.error("weird basis length")
            let pp0 = new PointPair()

            this.projectivePt = new PointPair()

            for(let i = 0; i < basis.length; ++i) {

                tw0.copy(oneTw)
                //and it'll be all of them
                for(let j = 0; j < basis.length; ++j) {
                    if(j === i)
                        continue
                    tw0.meet(basis[j], tw1)
                    tw0.copy(tw1)
                }
                tw0.meet(_e0, tw1).cast(pp0)

                //A and B are either plus or minus parts of our meets with e0
                this.idealIndicesA[i] = pp0.lowestNonzeroSigned()
                pp0[ Math.abs(this.idealIndicesA[i]) ] = 0.
                this.idealIndicesB[i] = pp0.lowestNonzeroSigned()

            }

            let origin = new Tw()
            origin.copy( oneTw )
            for (let i = 0, il = basis.length; i < il; ++i) {
                origin.meet( basis[i], tw1 )
                origin.copy( tw1 )
            }

            this.ptAtInf = 
                basis.length === 1 ? new Bivec() :
                basis.length === 2 ? new Trivec() :
                basis.length === 3 ? new Quadvec() :
                basis.length === 4 ? new Pentavec() :
                console.error("weird basis length")
            origin.meet( _e0, tw0).cast(this.ptAtInf)

            this.pss = 
                basis.length === 1 ? new Trivec() :
                basis.length === 2 ? new Quadvec() :
                basis.length === 3 ? new Pentavec() :
                basis.length === 4 ? new Hexavec() :
                console.error("weird basis length")
            origin.meet(_epm, tw0).cast(this.pss)

            let originSpecialized = origin.cast(pp0)
            // if (basis.length === 3)
            //     debugger
            this.originIndex = originSpecialized.lowestNonzeroSigned()
            // delete originSpecialized //this would be nice but is an error
        }

        gibbsVecToProjectivePt( gibbsvec, projectivePt ) {

            projectivePt.zero()
            projectivePt.signedIndexToCoord( this.originIndex, 1. )
            for (let i = 0, il = this.idealIndicesA.length; i < il; ++i) {

                projectivePt.setAtSignedIndex(this.idealIndicesA[i], gibbsvec[i])
                projectivePt.setAtSignedIndex(this.idealIndicesB[i], gibbsvec[i])

            }

            return projectivePt
        }

        projectivePtToGibbsVec(projectivePt, gibbsVec) {
            //hey maybe that should be an "ega"!

            gibbsVec.setScalar(0.)
            // debugger
            
            let w = projectivePt.getAtSignedIndex( this.originIndex )
            if(w !== 0.) {

                let factor = .5 / w
                for (let i = 0, il = this.idealIndicesA.length; i < il; ++i ) {
                    
                    gibbsVec.setComponent(i, factor * (
                        projectivePt.getAtSignedIndex( this.idealIndicesA[i] ) + 
                        projectivePt.getAtSignedIndex( this.idealIndicesB[i] ) ) )
                    
                }

            }

            return gibbsVec
        }

        ppToGibbsVecs( pp, target1, target2 ) {

            pp.inner( this.pss, projectorBiv)        // n-2-vec | n-vec = 2-vec eg in 3D CGA, 3-vec | 5-vec
            projectorBiv.innerE0( equatorialUnavec )

            let magnitude = projectorBiv.innerSelfScalar() //2-vec | 2-vec
            if (0. >= magnitude) {
                // "point pair" is actually some other kind of object
                target1.copy(outOfSightVec3)
                target2.copy(outOfSightVec3)
                return
            }

            projector[0] = magnitude
            for(let i = 0; i < projectorBiv.length; ++i)
                projector[i+1] = projectorBiv[i]
            projector.getReverse(projectorRev)

            projector.mul(equatorialUnavec, intermediary).mul(projectorRev, nullUnavec)
            nullUnavec.inner( this.ptAtInf, this.projectivePt ) //1-vec | n-1-vec = n-vec
            this.projectivePtToGibbsVec( this.projectivePt, target1 )

            projectorRev.mul(equatorialUnavec, intermediary).mul(projector, nullUnavec)
            nullUnavec.inner(this.ptAtInf, this.projectivePt) //1-vec | n-1-vec = n-vec
            this.projectivePtToGibbsVec( this.projectivePt, target2 )
        }
    }

    basis1      = new Basis([_e1])                //1D  CGA  / PGA
    basist      = new Basis([_et])                //0+1 CSTA / STAP
    basis12     = new Basis([_e1, _e2])           //2D  CGA  / PGA
    basis1t     = new Basis([_e1, _et])           //1+1 CSTA / STAP
    basis123    = new Basis([_e1, _e2, _e3])      //3D  CGA  / PGA
    basis12t    = new Basis([_e1, _e2, _et])      //2+1 CSTA / STAP
    basis123t   = new Basis([_e1, _e2, _e3, _et]) //3+1 CSTA / PGA

    basis12t.rayDqToBiv = (rDq, r32) => {
        //e1 is e1, e0 is e0
        //e2 in 32 is e3 in ega
        //et in 32 is e2 in ega

        tw0.zero()
        tw0.addScaled(_e10, -rDq[1], tw0)
        tw0.addScaled(_e20, -rDq[3], tw0)
        tw0.addScaled(_et0, -rDq[2], tw0)
        tw0.addScaled(_e12, -rDq[5], tw0) //-rDq[5] = e13
        tw0.addScaled(_e1t,  rDq[4], tw0) // rDq[5] = e12
        tw0.addScaled(_e2t, -rDq[6], tw0) // rDq[6] = e23

        tw0.cast(r32)

        return r32
    }

    basis123.rayDqToBiv = (rDq, r41) => {

        tw0.zero()
        tw0.addScaled(_e10, -rDq[1], tw0)
        tw0.addScaled(_e20, -rDq[2], tw0)
        tw0.addScaled(_e30, -rDq[3], tw0)
        tw0.addScaled(_e12,  rDq[4], tw0)
        tw0.addScaled(_e31,  rDq[5], tw0)
        tw0.addScaled(_e23,  rDq[6], tw0)

        tw0.cast(r41)

        return r41
    }

    // function inner32Pss(a, target) {
    //     target[0] = a[60]; target[1] = a[55]; target[2] = -a[51]; target[3] = a[63]; target[4] = a[47]; target[5] = a[46]; target[6] = -a[45]; target[7] = -a[41]; target[9] = a[37]; target[10] = a[36]; target[11] = -a[35]; target[13] = -a[31]; target[14] = -a[30]; target[15] = a[29]; target[19] = a[25]; target[20] = -a[24]; target[21] = -a[23]; target[23] = -a[21]; target[24] = -a[20]; target[25] = a[19]; target[29] = a[15]; target[30] = -a[14]; target[31] = -a[13]; target[35] = -a[11]; target[36] = a[10]; target[37] = a[9]; target[41] = -a[7]; target[45] = -a[6]; target[46] = a[5]; target[47] = a[4]; target[51] = -a[2]; target[55] = a[1]; target[60] = a[0];
    //     return target
    // }
    // function innerE12t0(a, target) {
    //     target[0] = + a[46] - a[47]; target[1] = + a[36] - a[37]; target[2] = - a[30] + a[31]; target[3] = + a[58] - a[59]; target[4] = + a[25] - a[60]; target[5] = - a[60] + a[25]; target[6] = + a[23] - a[24]; target[7] = - a[20] + a[21]; target[8] = 0.; target[9] = + a[15]; target[10] = + a[15]; target[11] = + a[13] - a[14]; target[12] = 0.; target[13] = - a[11]; target[14] = - a[11]; target[15] = - a[9] + a[10]; target[16] = - a[63]; target[17] = - a[63]; target[18] = 0.; target[19] = 0.; target[20] = + a[7]; target[21] = + a[7]; target[22] = 0.; target[23] = - a[6]; target[24] = - a[6]; target[25] = - a[4] + a[5]; target[26] = 0.; target[27] = 0.; target[28] = 0.; target[29] = 0.; target[30] = + a[2]; target[31] = + a[2]; target[32] = 0.; target[33] = 0.; target[34] = 0.; target[35] = 0.; target[36] = - a[1]; target[37] = - a[1]; target[38] = 0.; target[39] = 0.; target[40] = 0.; target[41] = 0.; target[42] = 0.; target[43] = 0.; target[44] = 0.; target[45] = 0.; target[46] = 0. = (-1.) * a[0]; target[47] = 0. = (-1.) * a[0]; target[48] = 0.; target[49] = 0.; target[50] = 0.; target[51] = 0.; target[52] = 0.; target[53] = 0.; target[54] = 0.; target[55] = 0.; target[56] = 0.; target[57] = 0.; target[58] = 0.; target[59] = 0.; target[60] = 0.; target[61] = 0.; target[62] = 0.; target[63] = 0.;
    //     return target;
    // }
}