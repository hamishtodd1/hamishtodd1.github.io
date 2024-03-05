function initBasises() {

    let projectorBiv = new Bivec()
    let sb0 = new Bivec()
    let sb1 = new Bivec()
    let numBivecCoefs = sb0.length
    let equidistantUna = new Unavec()
    let nullUna = new Unavec()
    let bv = new Unavec()
    let projectivePointFl = new Fl()
    let originIndexSigned = _epm.cast(sb0).lowestNonzeroSigned()

    let basisFls = [e021, e013, e032, e123]
    let zyxw = `zyxw`

    class Basis {

        //you get ep, em, e0, automatically
        constructor(basis) {
            
            let self = this

            this.prefix = verbose42Glsl

            // this.idealIndicesA = Array(basis.length)
            // this.idealIndicesB = Array(basis.length)

            // for(let i = 0; i < basis.length; ++i) {

            //     basis[i].meet(_e0, tw0).cast(sb0)

            //     //A and B are either plus or minus parts of our meets with e0
            //     this.idealIndicesA[i] = sb0.lowestNonzeroSigned()
            //     sb0[ Math.abs( this.idealIndicesA[i] ) ] = 0.
            //     this.idealIndicesB[i] = sb0.lowestNonzeroSigned()
            // }

            let origin = new Tw()
            origin.copy( oneTw )
            for (let i = 0, il = basis.length; i < il; ++i) {
                origin.meet( basis[i], tw1 )
                origin.copy( tw1 )
            }

            this.pss = 
                basis.length === 1 ? new Trivec() :
                basis.length === 2 ? new Quadvec() :
                basis.length === 3 ? new Pentavec() :
                basis.length === 4 ? new Hexavec() :
                console.error("weird basis length")
            origin.meet(_epm, tw0).cast(this.pss)

            if(basis.length === 3)
            {
                function charTo1Vec(char) {
                    return char === `0` ? _e0 : basis[parseInt(char) - 1]
                }

                let basisPluckers = Array(6)
                for (let i = 0; i < 6; ++i) { //no scalar or pss
                    basisPluckers[i] = new Bivec()
                    let a = charTo1Vec(Dq.basisNames[i + 1][0])
                    let b = charTo1Vec(Dq.basisNames[i + 1][1])
                    a.meet(b, tw0).cast(basisPluckers[i])
                }

                let basisFlatPoints = Array(4)
                let pssInverse = this.pss.cast(tw0).negate(tw0)
                for (let i = 0; i < 4; ++i) { //no scalar or pss
                    basisFlatPoints[i] = new Bivec()
                    const basisName = Fl.basisNames[i + 4]
                    let a = charTo1Vec( basisName[0] )
                    let b = charTo1Vec( basisName[1] )
                    let c = charTo1Vec( basisName[2] )
                    a.meet(b, tw3).meet(c, tw1)
                    tw1.inner(pssInverse,tw2).cast(basisFlatPoints[i])
                    if( basisName !== `123`)
                        basisFlatPoints[i].multiplyScalar(.5, basisFlatPoints[i])
                }

                this.dqToBiv = ( dqEga, targetBiv ) => {
                    
                    targetBiv.zero()
                    for (let i = 0; i < 6; ++i)
                        targetBiv.addScaled(basisPluckers[i], dqEga[i + 1], targetBiv)
                }

                //eventually basisPluckers and basisPoints will be uniforms
                //fun stuff to show: a screw motion preserving a hyperboloid
                //the exponential of a perabol, circle, hyperbola
                //ugh but need exponential. Could use 2,2 exponential?

                function vecToGlslStr(name,vec) {
                    let ret = `\n    float `+name+`[`+vec.length+`] = float[](`
                    for (let j = 0, jl = vec.length; j < jl; ++j)
                        ret += vec[j].toFixed(1) + (j === vec.length - 1 ? `` : `,`)
                    return ret + `);`
                }
                
                let extra0 = `
                    \nvoid dqToBiv(in float[8] dqEga, out float[BIV_LEN] targetBiv) {
                    \n    for(int i = 0; i < BIV_LEN; ++i) targetBiv[i] = 0.;\n`
                for(let i = 0; i < 6; ++i) {
                    extra0 += 
                        `  ` + vecToGlslStr(`basisPlucker`+i,basisPluckers[i])

                    extra0 += 
                    `\n   for(int i = 0; i < BIV_LEN; ++i)`+
                    `\n     targetBiv[i] = targetBiv[i] + dqEga[`+ (i + 1) +`] * basisPlucker`+i+`[i];`
                }
                extra0 += `\n}`
                log(extra0)
                this.prefix += extra0
                
                this.scalorBivToFlatPoint = (scalorBiv, targetFl) => {
                    
                    targetFl.zero()
                    for(let i = 0; i < 4; ++i ) {
                        for (let j = 0; j < numBivecCoefs; ++j)
                            targetFl[4 + i] += basisFlatPoints[i][j] * scalorBiv[j] //
                    }
                    return targetFl
                }

                let extra1 = `\nvoid scalorBivToFlatPoint(in float[BIV_LEN] scalorBiv, out vec4 targetFl) {\n`

                for(let i = 0; i < 4; ++i) {
                    
                    extra1 +=
                        vecToGlslStr(`basisFlatPoints`+zyxw[i].toUpperCase(), basisFlatPoints[i]) +
                        `\n    targetFl.`+zyxw[i]+` = 0.;`+
                        `\n    for (int j = 0; j < BIV_LEN; ++j)`+
                        `\n        targetFl.`+zyxw[i]+` += basisFlatPoints`+zyxw[i].toUpperCase()+`[j] * scalorBiv[j];\n`
                }
                extra1 += `\n}`
                log(extra1)
                this.prefix += extra1

                this.prefix += defaultBasisPrefix

                let extra2 = `\nfloat ppToGibbsVecs( in float[20] pp, out vec3 target1, out vec3 target2 ) {`+
                    `\n    float projectorBiv[BIV_LEN];`+
                    vecToGlslStr(`pss`, this.pss) +
                    `\n    triInnerPent( pp, pss, projectorBiv );`+
                    `\n    float ret = projectorBivToGibbsVecs( projectorBiv, target1, target2 );`+
                    `\n    return ret;` +
                `\n}\n`
                this.prefix += extra2
                // log(extra2)
            }
        }

        scalorBivToGibbsVec(scalorBiv, gibbsVec) {
            this.scalorBivToFlatPoint(scalorBiv, projectivePointFl)
            return projectivePointFl.pointToGibbsVec(gibbsVec)
        }

        // scalorBivToFl(scalorBiv, targetFl) {

        //     targetFl.zero()
            
        //     targetFl[7] = scalorBiv.getAtSignedIndex( originIndexSigned )
            
        //     for (let i = 0, il = this.idealIndicesA.length; i < il; ++i ) {
        //         targetFl[6-i] = .5 * (
        //             scalorBiv.getAtSignedIndex( this.idealIndicesA[i] ) +
        //             scalorBiv.getAtSignedIndex( this.idealIndicesB[i] ) )
        //     }
        //     //can't do signed index in glsl, so next thing to do is probably remove that shite.

        //     return targetFl
        // }

        ppToGibbsVecs( pp, target1, target2 ) {
            //geometric interpretation: we go from a n-reflection to scalor that preserves the n-reflection axis
            pp.inner( this.pss, projectorBiv )        // n-2-vec | n-vec = 2-vec eg in 3D CGA, 3-vec | 5-vec
            this.projectorBivToGibbsVecs( projectorBiv, target1, target2 )
        }

        projectorBivToGibbsVecs(projectorBiv, target1, target2 ) {

            let bivSq = projectorBiv.innerSelfScalar()
            if (0. >= bivSq) {
                // "point pair" was actually a circle, line, maybe zero radius circle/line at infinity
                target1.copy(outOfSightVec3)
                target2.copy(outOfSightVec3)
                return
            }

            projectorBiv.multiplyScalar(-1. / Math.sqrt(bivSq), projectorBiv)
            projectorBiv.innerE0( equidistantUna )
            if(equidistantUna.e0Multiple()) {
                // projectorBiv lies on e0, eg projectorBiv ^ e0 = 0

                target2.copy(outOfSightVec3)
                sb0.copy(projectorBiv)    
            }
            else {
                projectorBiv.inner( equidistantUna, bv )
                equidistantUna.add( bv, nullUna ).meetE0(sb0)
                this.scalorBivToGibbsVec(sb0, target2 )
                equidistantUna.sub( bv, nullUna ).meetE0(sb0)
            }

            this.scalorBivToGibbsVec(sb0, target1 )

            // if (Math.abs(1. - projectorBiv.innerSelfScalar()) > .1) {
            //     console.error("projectorBiv norm is: " + projectorBiv.innerSelfScalar())
            // }

        }
    }

    let defaultBasisPrefix = `
void addUnas( in float[6] a, in float[6] b, out float[6] target) {
    for (int i = 0; i < 6; ++i)
        target[i] = a[i] + b[i];
}

void subUnas( in float[6] a, in float[6] b, out float[6] target) {
    for (int i = 0; i < 6; ++i)
        target[i] = a[i] - b[i];
}

void zeroUna(out float[6] una) {
    for(int i = 0; i < 6; ++i)
        una[i] = 0.;
}

void bivMultiplyScalar( in float[BIV_LEN] biv, in float scalar, out float[BIV_LEN] target ) {
    for (int i = 0; i < BIV_LEN; ++i)
        target[i] = biv[i] * scalar;
}

float bivInnerSelfScalar(in float[BIV_LEN] biv) {
    return biv[10] * biv[10] + biv[11] * biv[11] + biv[12] * biv[12] + biv[13] * biv[13] + biv[ 3] * biv[ 3] + biv[ 4] * biv[ 4] + biv[ 7] * biv[ 7] + biv[ 8] * biv[ 8] - biv[ 0] * biv[ 0] - biv[14] * biv[14] - biv[ 1] * biv[ 1] - biv[ 2] * biv[ 2] - biv[ 5] * biv[ 5] - biv[ 6] * biv[ 6] - biv[ 9] * biv[ 9];
}

bool e0Multiple(in float[6] una) {
    return una[3] != 0. && una[3] == una[4] && una[0] == 0. && una[1] == 0. && una[2] == 0. && una[5] == 0.;
}

vec3 scalorBivToGibbsVec( in float[BIV_LEN] scalorBiv ) {
    vec4 ret4;
    scalorBivToFlatPoint( scalorBiv, ret4 );
    return ret4.xyz / ret4.w;
}

float projectorBivToGibbsVecs( in float[BIV_LEN] projectorBiv, out vec3 target1, out vec3 target2 ) {

    float[6] equidistantUna;
    float[6] nullUna;
    float[6] bv;
    float[BIV_LEN] sb0;

    float bivSq = bivInnerSelfScalar(projectorBiv);
    if (0. >= bivSq) {
        // "point pair" is actually some other kind of object
        target1 = vec3( 999., 999., 999. );
        target2 = vec3( 999., 999., 999. );
        return .5;
    }

    float ret = 0.;

    bivMultiplyScalar( projectorBiv, 1. / sqrt(bivSq), projectorBiv );
    bivInnerE0(  projectorBiv, equidistantUna );
    if(e0Multiple(equidistantUna)) {
        // projectorBiv lies on e0, eg projectorBiv ^ e0 = 0

        target2 = vec3( 999., 999., 999. );
        for(int i = 0; i < BIV_LEN; ++i)
            sb0[i] = projectorBiv[i];

        ret = 1.;
    }
    else {
        bivInnerUna(projectorBiv, equidistantUna, bv);
        addUnas(equidistantUna, bv, nullUna);
        unaMeetE0(nullUna, sb0);
        target2 = scalorBivToGibbsVec(sb0 );
        subUnas(equidistantUna, bv, nullUna);
        unaMeetE0(nullUna, sb0);
    }

    target1 = scalorBivToGibbsVec(sb0 );

    return ret;
}

//from the nullUnavec, you should also be able to read off the direction the thing is facing in
    `

    basis1      = new Basis([_e1])                //1D  CGA  / PGA
    basist      = new Basis([_et])                //0+1 CSTA / STAP
    basis12     = new Basis([_e1, _e2])           //2D  CGA  / PGA
    basis1t     = new Basis([_e1, _et])           //1+1 CSTA / STAP
    basis123    = new Basis([_e1, _e2, _e3])      //3D  CGA  / PGA
    basis12t    = new Basis([_e1, _e2, _et])      //2+1 CSTA / STAP
    basis123t   = new Basis([_e1, _e2, _e3, _et]) //3+1 CSTA / PGA
    


    basis123.pointFlToTriv = (fl, target) => {
        target.zero()
        target.addScaled( _e123,  fl[7], target)
        target.addScaled( _e012, -fl[4], target)
        target.addScaled( _e013,  fl[5], target)
        target.addScaled( _e023, -fl[6], target)

        return target
    }

    // debugger
    // basis123.dqToBiv(e03, new Bivec())
    // log(tw0)
    // tw0.log()
    // e03.log()

    // basis123.nullUnavecToFl(_e3.sub(_em, tw0).cast(new Unavec()), fl0)
    // log(tw0)
    // fl0.log()
    // log(fl0)

    // let meetPoint = fl0.pointFromGibbsVec(v1.set(0.,0.,-1.))
    // basis123.pointFlToTriv(meetPoint, tw0)
    // let tri = tw0.cast(new Trivec())
    // basis123.ppToGibbsVecs(tri, v2, v3)
    // log(v1, v2, v3)
    
    // dq0[0] = 0.
    // projectorBivToGibbsVecs()
    // dq0.cast()
    // basis123.dqToBiv( dq0, tw0 )
    // tw0
    

    // function inner32Pss(a, target) {
    //     target[0] = a[60]; target[1] = a[55]; target[2] = -a[51]; target[3] = a[63]; target[4] = a[47]; target[5] = a[46]; target[6] = -a[45]; target[7] = -a[41]; target[9] = a[37]; target[10] = a[36]; target[11] = -a[35]; target[13] = -a[31]; target[14] = -a[30]; target[15] = a[29]; target[19] = a[25]; target[20] = -a[24]; target[21] = -a[23]; target[23] = -a[21]; target[24] = -a[20]; target[25] = a[19]; target[29] = a[15]; target[30] = -a[14]; target[31] = -a[13]; target[35] = -a[11]; target[36] = a[10]; target[37] = a[9]; target[41] = -a[7]; target[45] = -a[6]; target[46] = a[5]; target[47] = a[4]; target[51] = -a[2]; target[55] = a[1]; target[60] = a[0];
    //     return target
    // }
    // function innerE12t0(a, target) {
    //     target[0] = + a[46] - a[47]; target[1] = + a[36] - a[37]; target[2] = - a[30] + a[31]; target[3] = + a[58] - a[59]; target[4] = + a[25] - a[60]; target[5] = - a[60] + a[25]; target[6] = + a[23] - a[24]; target[7] = - a[20] + a[21]; target[8] = 0.; target[9] = + a[15]; target[10] = + a[15]; target[11] = + a[13] - a[14]; target[12] = 0.; target[13] = - a[11]; target[14] = - a[11]; target[15] = - a[9] + a[10]; target[16] = - a[63]; target[17] = - a[63]; target[18] = 0.; target[19] = 0.; target[20] = + a[7]; target[21] = + a[7]; target[22] = 0.; target[23] = - a[6]; target[24] = - a[6]; target[25] = - a[4] + a[5]; target[26] = 0.; target[27] = 0.; target[28] = 0.; target[29] = 0.; target[30] = + a[2]; target[31] = + a[2]; target[32] = 0.; target[33] = 0.; target[34] = 0.; target[35] = 0.; target[36] = - a[1]; target[37] = - a[1]; target[38] = 0.; target[39] = 0.; target[40] = 0.; target[41] = 0.; target[42] = 0.; target[43] = 0.; target[44] = 0.; target[45] = 0.; target[46] = 0. = (-1.) * a[0]; target[47] = 0. = (-1.) * a[0]; target[48] = 0.; target[49] = 0.; target[50] = 0.; target[51] = 0.; target[52] = 0.; target[53] = 0.; target[54] = 0.; target[55] = 0.; target[56] = 0.; target[57] = 0.; target[58] = 0.; target[59] = 0.; target[60] = 0.; target[61] = 0.; target[62] = 0.; target[63] = 0.;
    //     return target;
    // }
}